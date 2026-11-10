// Data layer between the readings and the screens. Pure functions.
// Readings come from a SIMULATED DEVICE FEED: wearables report every day, ultrasound exams
// and blood tests only on their scheduled days. Each value carries where it came from and
// how old it is. A crew check-in replaces the feed for that person and day.

import { CREW, MISSION_DAYS, cabinOn, readingOn, type CrewMember } from './data/simulatedCrew.ts'
import { SOURCES } from './data/sources.ts'
import { assessCabin, assessCrew, type CrewReading, type Finding, type Mode } from './triage.ts'

export const CABIN_ID = 'cabin'

export type CheckIns = Record<string, CrewReading>
export const keyOf = (crewId: string, day: number) => `${crewId}:${day}`

interface Feed {
  source: string
  /** A new measurement arrives every this many days. */
  every: number
  /** Older than this many days = stale. Demo values, not a NASA schedule. */
  staleAfter: number
  /** true = arrives by itself. false = a crew member has to do the exam. */
  auto: boolean
}

export const FEEDS: Record<string, Feed> = {
  vitals: { source: 'Wearable sensor', every: 1, staleAfter: 1, auto: true },
  sleep: { source: 'Wearable sensor', every: 1, staleAfter: 1, auto: true },
  headache: { source: 'Crew report', every: 1, staleAfter: 1, auto: false },
  urine: { source: 'Crew log', every: 1, staleAfter: 1, auto: false },
  mood: { source: 'Crew report', every: 1, staleAfter: 1, auto: false },
  basics: { source: 'Health kit', every: 1, staleAfter: 1, auto: false },
  exercise: { source: 'Exercise device log', every: 1, staleAfter: 1, auto: true },
  onsd: { source: 'Ultrasound exam', every: 14, staleAfter: 10, auto: false },
  ijv: { source: 'Ultrasound exam', every: 14, staleAfter: 10, auto: false },
  hematocrit: { source: 'Blood analyser', every: 30, staleAfter: 21, auto: false },
  co2: { source: 'Cabin sensor', every: 1, staleAfter: 1, auto: true },
  radiation: { source: 'Cabin dosimeter', every: 1, staleAfter: 1, auto: true },
}

export function lastMeasured(id: string, day: number): number {
  const every = FEEDS[id]?.every ?? 1
  return day - ((day - 1) % every)
}

export interface Provenance {
  source: string
  measuredDay: number
  ageDays: number
  stale: boolean
  nextDue: number | null
  auto: boolean
}

function provenance(id: string, day: number, manual: boolean): Provenance {
  if (manual) return { source: 'Crew check-in', measuredDay: day, ageDays: 0, stale: false, nextDue: null, auto: false }
  const feed = FEEDS[id] ?? FEEDS.vitals
  const measuredDay = lastMeasured(id, day)
  const ageDays = day - measuredDay
  return { source: feed.source, measuredDay, ageDays, stale: ageDays > feed.staleAfter, nextDue: feed.every > 1 ? measuredDay + feed.every : null, auto: feed.auto }
}

/** What the system knows about one crew member on a day: each value from its latest measurement. */
export function getReading(checkIns: CheckIns, crew: CrewMember, day: number): CrewReading {
  const manual = checkIns[keyOf(crew.id, day)]
  const today = readingOn(crew, day)
  if (manual) return { ...today, ...manual }
  const eye = readingOn(crew, lastMeasured('onsd', day))
  const vein = readingOn(crew, lastMeasured('ijv', day))
  const blood = readingOn(crew, lastMeasured('hematocrit', day))
  return { ...today, hematocritPct: blood.hematocritPct, onsdMm: eye.onsdMm, ijvFlow: vein.ijvFlow, ijvClotSeen: vein.ijvClotSeen }
}

export interface Subject {
  id: string
  name: string
  role: string
  manual: boolean
  earth: Finding[]
  space: Finding[]
  info: Record<string, Provenance>
}

export function buildDay(day: number, checkIns: CheckIns): Subject[] {
  const cabin = cabinOn(day)
  const crew = CREW.map((c): Subject => {
    const manual = keyOf(c.id, day) in checkIns
    const r = getReading(checkIns, c, day)
    const space = assessCrew(r, c.baseline, cabin, 'space')
    return {
      id: c.id,
      name: c.name,
      role: c.role,
      manual,
      earth: assessCrew(r, c.baseline, cabin, 'earth'),
      space,
      info: Object.fromEntries(space.map((f) => [f.id, provenance(f.id, day, manual)])),
    }
  })
  const cabinSpace = assessCabin(cabin, 'space')
  return [
    ...crew,
    {
      id: CABIN_ID,
      name: 'Cabin',
      role: 'Air and radiation',
      manual: false,
      earth: assessCabin(cabin, 'earth'),
      space: cabinSpace,
      info: Object.fromEntries(cabinSpace.map((f) => [f.id, provenance(f.id, day, false)])),
    },
  ]
}

export const flagged = (list: Finding[]) => list.filter((f) => f.level !== 'green').length

export function summarize(subjects: Subject[]) {
  let earth = 0
  let space = 0
  let falseAlarms = 0
  let missed = 0
  for (const s of subjects) {
    earth += flagged(s.earth)
    space += flagged(s.space)
    for (const e of s.earth) {
      const sp = s.space.find((f) => f.id === e.id)
      if (!sp) continue
      if (e.level !== 'green' && sp.level === 'green') falseAlarms++
      if (e.level === 'green' && sp.level !== 'green') missed++
    }
  }
  return { earth, space, falseAlarms, missed }
}

export function timeline(checkIns: CheckIns, visible: (id: string) => boolean) {
  return Array.from({ length: MISSION_DAYS }, (_, i) => {
    const s = summarize(buildDay(i + 1, checkIns).filter((x) => visible(x.id)))
    return { day: i + 1, earth: s.earth, space: s.space }
  })
}

/** Last 30 days of the number behind one signal, for the trend line. */
export function series(checkIns: CheckIns, subjectId: string, findingId: string, day: number): { values: number[]; baseline?: number } {
  const days = Array.from({ length: Math.min(30, day) }, (_, i) => day - Math.min(30, day) + 1 + i)
  if (subjectId === CABIN_ID) {
    return { values: days.map((d) => (findingId === 'co2' ? cabinOn(d).co2MmHg : cabinOn(d).cumulativeDoseMSv)) }
  }
  const crew = CREW.find((c) => c.id === subjectId)!
  const pick = (r: CrewReading, d: number): number => {
    switch (findingId) {
      case 'hematocrit':
        return r.hematocritPct
      case 'onsd':
        return r.onsdMm
      case 'ijv':
        return r.ijvFlow === 'forward' ? 1 : 0
      case 'headache':
        return cabinOn(d).co2MmHg
      case 'sleep':
        return r.sleepHours7d
      case 'urine':
        return r.urineLitersDay
      case 'mood':
        return r.moodAvg7d
      case 'basics':
        return r.systolicBp
      case 'exercise':
        return r.resistanceSessions7d
      default:
        return r.spo2Pct
    }
  }
  const baseline = findingId === 'hematocrit' ? crew.baseline.hematocritPct : findingId === 'onsd' ? crew.baseline.onsdMm : undefined
  return { values: days.map((d) => pick(getReading(checkIns, crew, d), d)), baseline }
}

export interface Task {
  key: string
  kind: 'measure' | 'recheck' | 'log'
  title: string
  detail: string
}

/** What one crew member should do today, worked out from the feed and the space rules. */
export function tasksFor(subject: Subject, day: number): Task[] {
  const tasks: Task[] = []
  const exams: [string, string][] = [
    ['onsd', 'Eye and neck ultrasound'],
    ['hematocrit', 'Blood test'],
  ]
  for (const [id, label] of exams) {
    const p = subject.info[id]
    if (!p || subject.manual) continue
    if (p.ageDays === 0 && day > 1) tasks.push({ key: `measure:${id}`, kind: 'measure', title: `${label} is scheduled today`, detail: 'Do the exam and confirm the values in a check-in.' })
    else if (p.stale) tasks.push({ key: `measure:${id}`, kind: 'measure', title: `${label} is ${p.ageDays} days old`, detail: `Next scheduled on day ${p.nextDue}. Repeat sooner if you have symptoms.` })
  }
  for (const f of subject.space) {
    if (f.level !== 'green') tasks.push({ key: `recheck:${f.id}`, kind: 'recheck', title: f.title, detail: f.next })
  }
  tasks.push({ key: 'log:feel', kind: 'log', title: 'Log how you feel today', detail: 'A few words in your own language is enough.' })
  return tasks
}

/** Plain-text summary to send to Earth. Only includes the people passed in. */
export function reportText(day: number, subjects: Subject[], mode: Mode): string {
  const lines = [`CREW HEALTH REPORT, mission day ${day} (SIMULATED DATA)`, `Rule set: ${mode === 'earth' ? 'Earth-standard' : 'space-adapted'}`, '']
  for (const s of subjects) {
    const list = (mode === 'earth' ? s.earth : s.space).filter((f) => f.level !== 'green')
    if (list.length === 0) continue
    lines.push(`${s.name} (${s.role})`)
    for (const f of list) {
      const p = s.info[f.id]
      lines.push(`  ${f.level === 'red' ? 'URGENT' : 'CHECK'}: ${f.title}: ${f.measured}`)
      if (p) lines.push(`    Data from: ${p.source}, measured day ${p.measuredDay}${p.stale ? ' (STALE)' : ''}`)
      lines.push(`    ${f.why}`)
      lines.push(`    Rule source: ${f.sourceIds.map((id) => SOURCES[id].title).join('; ')}`)
    }
    lines.push('')
  }
  if (lines.length === 3) lines.push('Nothing flagged.')
  return lines.join('\n')
}
