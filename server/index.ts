// Backend: API + SQLite database file. Uses only what ships with Node 24.
// It imports the SAME rule file the screens use, so there is one copy of the rules.
//
// Sign-in and privacy are enforced HERE, not only on screen:
//   crew member     -> own medical data only
//   medical officer -> everyone's data
//   flight surgeon  -> only what the crew sent to Earth, after the signal delay
//
//   GET  /api/users                       names for the sign-in screen
//   POST /api/login {userId, pin}         -> {token, user}
//   POST /api/logout
//   GET  /api/state                       everything this user may see
//   PUT  /api/checkins/:crewId/:day       store a check-in
//   DELETE /api/checkins                  medical officer only
//   POST /api/notes {day, text}           how I feel, in my own words
//   POST /api/tasks {day, key, done}      tick a task for today
//   POST /api/messages {day, body}        send to the other side (Earth or ship)
//   POST /api/emergencies {...}           record of an emergency; also sent to Earth

import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { DatabaseSync } from 'node:sqlite'
import { allowed, reword, rewordEnabled } from '../api/reword.js'
import { CREW, MISSION_DAYS } from '../src/data/simulatedCrew.ts'
import { isMission, linkDelay } from '../src/data/missions.ts'
import { DEMO_PIN, USERS, canSee, type User } from '../src/data/users.ts'
import { buildDay, flagged, keyOf, type CheckIns } from '../src/model.ts'
import { MAX_IMAGE_CHARS, validateReading } from '../src/validate.ts'

const PORT = Number(process.env.API_PORT ?? 8787)
mkdirSync('data', { recursive: true })
const db = new DatabaseSync(process.env.DB_FILE ?? 'data/crew-health.sqlite')
db.exec(`
  CREATE TABLE IF NOT EXISTS checkins (crew_id TEXT NOT NULL, day INTEGER NOT NULL, reading TEXT NOT NULL, updated_at TEXT NOT NULL, by_user TEXT, PRIMARY KEY (crew_id, day));
  CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, kind TEXT NOT NULL, detail TEXT NOT NULL, crew_id TEXT);
  CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL, created_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, crew_id TEXT NOT NULL, day INTEGER NOT NULL, text TEXT NOT NULL, at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS tasks_done (user_id TEXT NOT NULL, day INTEGER NOT NULL, key TEXT NOT NULL, PRIMARY KEY (user_id, day, key));
  CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, from_user TEXT NOT NULL, side TEXT NOT NULL, kind TEXT NOT NULL, body TEXT NOT NULL, day INTEGER NOT NULL, delay_min REAL NOT NULL, sent_at INTEGER NOT NULL, deliver_at INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS emergencies (id INTEGER PRIMARY KEY AUTOINCREMENT, scenario TEXT NOT NULL, patient TEXT NOT NULL, by_user TEXT NOT NULL, day INTEGER NOT NULL, started_at TEXT NOT NULL, steps TEXT NOT NULL);
`)
// Older database files from earlier sessions lack these columns.
for (const sql of ['ALTER TABLE checkins ADD COLUMN by_user TEXT', 'ALTER TABLE events ADD COLUMN crew_id TEXT']) {
  try {
    db.exec(sql)
  } catch {
    // Column already exists.
  }
}

// The demo PIN is stored as a salted hash, the way a real password would be.
const salt = randomBytes(16)
const pinHash = scryptSync(DEMO_PIN, salt, 32)
const pinOk = (pin: unknown) => typeof pin === 'string' && pin.length < 64 && timingSafeEqual(scryptSync(pin, salt, 32), pinHash)

const nowIso = () => new Date().toISOString()
const nameOf = (id: string) => USERS.find((u) => u.id === id)?.name ?? id

function allCheckIns(): CheckIns {
  const out: CheckIns = {}
  for (const row of db.prepare('SELECT crew_id, day, reading FROM checkins').all()) {
    out[keyOf(String(row.crew_id), Number(row.day))] = JSON.parse(String(row.reading))
  }
  return out
}

const logEvent = (kind: string, detail: string, crewId: string | null) =>
  db.prepare('INSERT INTO events (at, kind, detail, crew_id) VALUES (?, ?, ?, ?)').run(nowIso(), kind, detail, crewId)

function sendMessage(user: User, kind: string, body: string, day: number, mission: unknown) {
  const link = linkDelay(isMission(mission) ? mission : 'mars', day)
  const delay = link.minutes
  const sent = Date.now()
  db.prepare('INSERT INTO messages (from_user, side, kind, body, day, delay_min, sent_at, deliver_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
    user.id,
    user.role === 'surgeon' ? 'earth' : 'ship',
    kind,
    body,
    day,
    delay,
    sent,
    sent + link.demoMs,
  )
}

/** Everything this user is allowed to see. */
function stateFor(user: User) {
  const mySide = user.role === 'surgeon' ? 'earth' : 'ship'
  const now = Date.now()
  const messages = db
    .prepare('SELECT id, from_user, side, kind, body, day, delay_min, sent_at, deliver_at FROM messages ORDER BY id DESC LIMIT 40')
    .all()
    // You see your own side's messages at once. The other side's arrive after the delay.
    .filter((m) => m.side === mySide || Number(m.deliver_at) <= now)
    .map((m) => ({ ...m, from_name: nameOf(String(m.from_user)), delivered: Number(m.deliver_at) <= now }))

  if (user.role === 'surgeon') return { user, now, messages, checkIns: {}, events: [], notes: [], tasksDone: [], emergencies: [] }

  const checkIns: CheckIns = {}
  for (const [key, reading] of Object.entries(allCheckIns())) if (canSee(user, key.split(':')[0])) checkIns[key] = reading
  const events = db
    .prepare('SELECT id, at, kind, detail, crew_id FROM events ORDER BY id DESC LIMIT 30')
    .all()
    .filter((e) => e.crew_id === null || canSee(user, String(e.crew_id)))
    .slice(0, 6)
  const notes = db
    .prepare('SELECT id, crew_id, day, text, at FROM notes ORDER BY id DESC LIMIT 60')
    .all()
    .filter((n) => canSee(user, String(n.crew_id)))
  const tasksDone = db.prepare('SELECT day, key FROM tasks_done WHERE user_id = ?').all(user.id)
  const emergencies = db.prepare('SELECT id, scenario, patient, by_user, day, started_at, steps FROM emergencies ORDER BY id DESC LIMIT 5').all()
  return { user, now, messages, checkIns, events, notes, tasksDone, emergencies }
}

function send(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
  res.end(JSON.stringify(body))
}

function readJson(req: IncomingMessage, maxChars = 20_000): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
      if (raw.length > maxChars) reject(new Error('too large'))
    })
    req.on('end', () => {
      try {
        const v = JSON.parse(raw || '{}')
        resolve(typeof v === 'object' && v !== null ? v : {})
      } catch {
        reject(new Error('bad json'))
      }
    })
    req.on('error', reject)
  })
}

function userFrom(req: IncomingMessage): User | null {
  const token = (req.headers.authorization ?? '').replace(/^Bearer /, '')
  if (!token) return null
  const row = db.prepare('SELECT user_id FROM sessions WHERE token = ?').get(token)
  return row ? (USERS.find((u) => u.id === row.user_id) ?? null) : null
}

const validDay = (d: unknown): d is number => typeof d === 'number' && Number.isInteger(d) && d >= 1 && d <= MISSION_DAYS
const text = (v: unknown, max: number) => (typeof v === 'string' && v.trim().length > 0 && v.length <= max ? v.trim() : null)

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost')
  const path = url.pathname
  const method = req.method ?? 'GET'
  try {
    if (method === 'GET' && path === '/api/health') return send(res, 200, { ok: true })
    if (method === 'GET' && path === '/api/users') return send(res, 200, { users: USERS })
    if (method === 'GET' && path === '/api/reword') return send(res, 200, { enabled: rewordEnabled() })
    if (method === 'POST' && path === '/api/reword') {
      if (!allowed(req.socket.remoteAddress ?? 'local')) return send(res, 429, { error: 'Too many rewording requests. Try again in a minute.' })
      const body = await readJson(req)
      const r = await reword(body.question, body.text)
      return r.ok ? send(res, 200, { text: r.text }) : send(res, r.status, { error: r.error })
    }

    if (method === 'POST' && path === '/api/login') {
      const body = await readJson(req)
      const user = USERS.find((u) => u.id === body.userId)
      if (!user || !pinOk(body.pin)) return send(res, 401, { error: 'Wrong PIN.' })
      const token = randomBytes(24).toString('hex')
      db.prepare('INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)').run(token, user.id, nowIso())
      return send(res, 200, { token, user })
    }

    const user = userFrom(req)
    if (!user) return send(res, 401, { error: 'Please sign in.' })

    if (method === 'POST' && path === '/api/logout') {
      db.prepare('DELETE FROM sessions WHERE token = ?').run((req.headers.authorization ?? '').replace(/^Bearer /, ''))
      return send(res, 200, { ok: true })
    }

    if (method === 'GET' && path === '/api/state') return send(res, 200, stateFor(user))

    if (method === 'POST' && path === '/api/messages') {
      const body = await readJson(req)
      const msg = text(body.body, 4000)
      if (!msg || !validDay(body.day)) return send(res, 400, { error: 'Write a message first.' })
      sendMessage(user, body.kind === 'report' ? 'report' : 'message', msg, body.day, body.mission)
      return send(res, 200, stateFor(user))
    }

    if (user.role === 'surgeon') return send(res, 403, { error: 'Earth can only read what the crew sent, and reply.' })

    const m = path.match(/^\/api\/checkins\/([A-Za-z0-9]+)\/(\d+)$/)
    if (method === 'PUT' && m) {
      const crew = CREW.find((c) => c.id === m[1])
      const day = Number(m[2])
      if (!crew) return send(res, 404, { error: 'Unknown crew member.' })
      if (!canSee(user, crew.id)) return send(res, 403, { error: 'You can only log your own check-in.' })
      if (!validDay(day)) return send(res, 400, { error: `Day must be 1 to ${MISSION_DAYS}.` })
      // A check-in may carry one compressed image, so this route accepts a larger body than the others.
      const v = validateReading(await readJson(req, MAX_IMAGE_CHARS + 20_000))
      if (!v.ok) return send(res, 400, { error: v.error })
      db.prepare(
        'INSERT INTO checkins (crew_id, day, reading, updated_at, by_user) VALUES (?, ?, ?, ?, ?) ON CONFLICT (crew_id, day) DO UPDATE SET reading = excluded.reading, updated_at = excluded.updated_at, by_user = excluded.by_user',
      ).run(crew.id, day, JSON.stringify(v.reading), nowIso(), user.id)
      const subject = buildDay(day, allCheckIns()).find((s) => s.id === crew.id)!
      const urgent = subject.space.some((f) => f.level === 'red')
      logEvent('checkin', `${crew.name}, day ${day}: check-in by ${user.name}. ${urgent ? 'URGENT finding' : `${flagged(subject.space)} flagged`}`, crew.id)
      return send(res, 200, stateFor(user))
    }

    if (method === 'DELETE' && path === '/api/checkins') {
      if (user.role !== 'cmo') return send(res, 403, { error: 'Only the medical officer can clear check-ins.' })
      db.exec('DELETE FROM checkins')
      logEvent('clear', `All crew check-ins removed by ${user.name}`, null)
      return send(res, 200, stateFor(user))
    }

    if (method === 'POST' && path === '/api/notes') {
      const body = await readJson(req)
      const note = text(body.text, 1000)
      if (!note || !validDay(body.day)) return send(res, 400, { error: 'Write a few words first.' })
      db.prepare('INSERT INTO notes (crew_id, day, text, at) VALUES (?, ?, ?, ?)').run(user.id, body.day, note, nowIso())
      return send(res, 200, stateFor(user))
    }

    if (method === 'POST' && path === '/api/tasks') {
      const body = await readJson(req)
      const key = text(body.key, 80)
      if (!key || !validDay(body.day)) return send(res, 400, { error: 'Unknown task.' })
      if (body.done) db.prepare('INSERT OR IGNORE INTO tasks_done (user_id, day, key) VALUES (?, ?, ?)').run(user.id, body.day, key)
      else db.prepare('DELETE FROM tasks_done WHERE user_id = ? AND day = ? AND key = ?').run(user.id, body.day, key)
      return send(res, 200, stateFor(user))
    }

    if (method === 'POST' && path === '/api/emergencies') {
      const body = await readJson(req)
      const scenario = text(body.scenario, 120)
      const patient = CREW.find((c) => c.id === body.patient)
      const steps = Array.isArray(body.steps) ? body.steps.slice(0, 30) : null
      if (!scenario || !patient || !steps || !validDay(body.day) || typeof body.startedAt !== 'string') return send(res, 400, { error: 'Incomplete record.' })
      const clean = steps.map((s) => ({ title: String((s as Record<string, unknown>).title ?? '').slice(0, 120), atSeconds: Number((s as Record<string, unknown>).atSeconds) || 0 }))
      db.prepare('INSERT INTO emergencies (scenario, patient, by_user, day, started_at, steps) VALUES (?, ?, ?, ?, ?, ?)').run(scenario, patient.id, user.id, body.day, body.startedAt.slice(0, 40), JSON.stringify(clean))
      logEvent('emergency', `Emergency record: ${scenario}, patient ${patient.name}`, null)
      const lines = clean.map((s) => `  +${Math.floor(s.atSeconds / 60)}:${String(Math.round(s.atSeconds % 60)).padStart(2, '0')}  ${s.title}`)
      sendMessage(user, 'emergency', `EMERGENCY RECORD (practice, simulated)\n${scenario}\nPatient: ${patient.name}. Run by: ${user.name}. Mission day ${body.day}.\nSteps done:\n${lines.join('\n')}`, body.day, body.mission)
      return send(res, 200, stateFor(user))
    }

    send(res, 404, { error: 'Not found.' })
  } catch {
    send(res, 400, { error: 'The request could not be read.' })
  }
})

server.listen(PORT, '127.0.0.1', () => console.log(`Crew health API on http://127.0.0.1:${PORT}`))
