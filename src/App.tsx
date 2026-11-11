import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChatCircleText, Check, Heartbeat, ListChecks, NotePencil, Planet, SignOut, Siren } from '@phosphor-icons/react'
import Ask from './Ask'
import CheckIn from './CheckIn'
import EarthLink from './EarthLink'
import SignIn from './SignIn'
import Today from './Today'
import { clearCheckIns, fetchState, getToken, isDemoMode, logout, postEmergency, postMessage, postNote, postTask, putCheckIn, type Result, type ServerState } from './api'
import MissionMenu from './MissionMenu'
import type { MissionId } from './data/missions'
import { MISSION_DAYS } from './data/simulatedCrew'
import { canSee } from './data/users'
import { CABIN_ID, buildDay, reportText } from './model'
import type { CrewReading, Mode } from './triage'
import { AnimatedNumber, Button, Logo, SPRING } from './ui'

// The 3D body is the heaviest part of the app, so it loads only when it is opened.
const Overview = lazy(() => import('./Overview'))
const Emergency = lazy(() => import('./Emergency'))
const Loading = <p className="flex min-h-[50dvh] items-center justify-center text-muted">Loading...</p>

type Tab = 'today' | 'health' | 'earth' | 'ask'
const TABS: { id: Tab; label: string; icon: typeof Planet }[] = [
  { id: 'today', label: 'Today', icon: ListChecks },
  { id: 'health', label: 'Crew health', icon: Heartbeat },
  { id: 'earth', label: 'Earth link', icon: Planet },
  { id: 'ask', label: 'Ask', icon: ChatCircleText },
]

export default function App() {
  const [signedIn, setSignedIn] = useState(() => getToken() !== null)
  const [state, setState] = useState<ServerState | null>(null)
  const [skew, setSkew] = useState(0)
  const [tab, setTab] = useState<Tab>('today')
  const [mode, setMode] = useState<Mode>('space')
  const [day, setDay] = useState(60)
  const [mission, setMission] = useState<MissionId>('mars')
  const [selected, setSelected] = useState('')
  const [emergency, setEmergency] = useState(false)
  const [checkInOpen, setCheckInOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const lastState = useRef('')
  const [demo, setDemo] = useState(false)
  useEffect(() => {
    void isDemoMode().then(setDemo)
  }, [])

  const signOut = useCallback(async () => {
    await logout()
    lastState.current = ''
    setState(null)
    setSignedIn(false)
    setTab('today')
    setSelected('')
  }, [])

  /** Take a server answer: keep the new state, or explain what went wrong. */
  const apply = useCallback(
    (r: Result<ServerState>, okMessage?: string): boolean => {
      if (r.ok) {
        const fresh = JSON.stringify({ ...r.data, now: 0 })
        if (fresh !== lastState.current) {
          lastState.current = fresh
          setState(r.data)
          setSkew(r.data.now - Date.now())
        }
        if (okMessage) setToast(okMessage)
        return true
      }
      if (r.status === 401) void signOut()
      else setToast(r.error)
      return false
    },
    [signOut],
  )

  // Keep in step with the server. This is also how messages from the other side arrive.
  useEffect(() => {
    if (!signedIn) return
    let alive = true
    const load = async () => {
      const r = await fetchState()
      if (alive && (r.ok || r.status === 401)) apply(r)
    }
    void load()
    const t = setInterval(load, 2000)
    return () => {
      alive = false
      clearInterval(t)
    }
  }, [signedIn, apply])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3400)
    return () => clearTimeout(t)
  }, [toast])

  const user = state?.user
  const visible = useCallback((id: string) => id === CABIN_ID || (user !== undefined && canSee(user, id)), [user])
  const subjects = useMemo(() => (state ? buildDay(day, state.checkIns, mission) : []), [day, state, mission])
  const exitEmergency = useCallback(() => setEmergency(false), [])

  if (!signedIn) return <SignIn onDone={() => setSignedIn(true)} />
  if (!state || !user) return <p className="flex min-h-[100dvh] items-center justify-center text-muted">Loading...</p>

  const isEarth = user.role === 'surgeon'
  const mySelected = selected && visible(selected) ? selected : user.id
  const send = async (body: string, kind: 'message' | 'report' = 'message') => apply(await postMessage(day, body, kind, mission), kind === 'report' ? 'Report sent. See Earth link for when it arrives.' : undefined)
  const saveCheckIn = async (crewId: string, r: CrewReading) => {
    setCheckInOpen(false)
    setSelected(crewId)
    apply(await putCheckIn(crewId, day, r), 'Check-in saved. Both rule sets re-checked it.')
  }

  if (emergency && !isEarth) {
    return (
      <Suspense fallback={Loading}>
        <Emergency day={day} mission={mission} subjects={subjects} checkIns={state.checkIns} defaultPatient={mySelected} onSave={async (rec) => apply(await postEmergency({ ...rec, mission }))} onExit={exitEmergency} />
      </Suspense>
    )
  }

  return (
    <div className="min-h-[100dvh]">
      <header className="z-10 flex flex-wrap lg:sticky lg:top-0 items-center gap-x-3 gap-y-2 border-b border-line bg-bar/95 px-4 py-2.5 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <Logo />
          <p className="hidden text-[15px] font-semibold tracking-tight 2xl:block">Crew Health Monitor</p>
        </div>

        {!isEarth && (
          <nav className="flex gap-1" aria-label="Sections">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} aria-current={tab === t.id ? 'page' : undefined} className="press relative flex min-h-11 items-center gap-2 rounded-[10px] px-3 text-sm font-medium">
                {tab === t.id && <motion.span layoutId="tab-active" transition={SPRING} className="absolute inset-0 rounded-[10px] bg-raised" />}
                <t.icon size={18} className={`relative ${tab === t.id ? 'text-ink' : 'text-muted'}`} />
                <span className={`relative ${tab === t.id ? 'text-ink' : 'text-muted'}`}>{t.label}</span>
              </button>
            ))}
          </nav>
        )}

        <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="rounded-md border border-line-strong px-2 py-1 font-mono text-[11px] tracking-[0.08em] text-muted">SIMULATED DATA</span>
          <MissionMenu value={mission} day={day} onChange={setMission} />
          <label className="flex items-baseline gap-2">
            <span className="text-xs text-muted">Day</span>
            <AnimatedNumber value={day} className="w-7 text-right font-mono text-lg font-medium tabular-nums" />
            <span className="font-mono text-xs text-dim">/ {MISSION_DAYS}</span>
            {(isEarth || tab !== 'health') && (
              <input type="range" min={1} max={MISSION_DAYS} value={day} onChange={(e) => setDay(Number(e.target.value))} aria-label="Mission day (demo control)" className="day-range hidden w-20 2xl:block" />
            )}
          </label>
          {!isEarth && (
            <>
              <Button onClick={() => setCheckInOpen(true)}>
                <NotePencil size={18} />
                Log check-in
              </Button>
              <Button kind="danger" onClick={() => setEmergency(true)}>
                <Siren size={18} weight="fill" />
                Emergency
              </Button>
            </>
          )}
          <div className="flex items-center gap-2 border-l border-line pl-4">
            <p className="text-right text-xs leading-tight">
              <span className="block font-medium text-ink">{user.name}</span>
              <span className="block text-muted">{user.title}</span>
            </p>
            <Button kind="ghost" onClick={() => void signOut()} aria-label="Sign out" className="px-2.5">
              <SignOut size={18} />
            </Button>
          </div>
        </div>
      </header>
      {demo && (
        <p role="note" className="border-b border-line bg-check-bg px-4 py-2 text-center text-xs text-check sm:px-6">
          Demo link with no server: data stays in this browser, sign-in roles are for show here, and the Earth link works between tabs of this browser. Run it locally for the real server and database.
        </p>
      )}

      <Suspense fallback={Loading}>
      {isEarth ? (
        <EarthLink side="earth" day={day} mission={mission} messages={state.messages} skew={skew} onSend={(b) => send(b)} />
      ) : tab === 'today' ? (
        <Today
          user={user}
          day={day}
          subjects={subjects.filter((s) => visible(s.id))}
          state={state}
          onTask={async (key, done) => void apply(await postTask(day, key, done))}
          onNote={async (text) => apply(await postNote(day, text), 'Note saved.')}
          onOpenCrew={(id) => (setSelected(id), setTab('health'))}
          onOpenEarth={() => setTab('earth')}
        />
      ) : tab === 'health' ? (
        <Overview
          user={user}
          day={day}
          setDay={setDay}
          mission={mission}
          mode={mode}
          setMode={setMode}
          subjects={subjects}
          checkIns={state.checkIns}
          events={state.events}
          visible={visible}
          selected={mySelected}
          setSelected={setSelected}
          onSendReport={() => void send(reportText(day, subjects.filter((s) => visible(s.id)), mode), 'report')}
          onClear={async () => void apply(await clearCheckIns(), 'Check-ins cleared. Showing the device feed again.')}
          onCheckIn={() => setCheckInOpen(true)}
          onEmergency={() => setEmergency(true)}
        />
      ) : tab === 'ask' ? (
        <Ask subjects={subjects.filter((s) => visible(s.id))} meId={user.id} day={day} mission={mission} />
      ) : (
        <EarthLink side="ship" day={day} mission={mission} messages={state.messages} skew={skew} onSend={(b) => send(b)} />
      )}
      </Suspense>

      <AnimatePresence>
        {checkInOpen && (
          <CheckIn
            key="checkin"
            day={day}
            checkIns={state.checkIns}
            mission={mission}
            crewIds={subjects.filter((s) => s.id !== CABIN_ID && visible(s.id)).map((s) => s.id)}
            initialCrewId={mySelected}
            onSave={saveCheckIn}
            onClose={() => setCheckInOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-30 flex justify-center px-4" aria-live="polite">
        <AnimatePresence>
          {toast && (
            <motion.p key={toast} initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }} transition={SPRING} className="flex items-center gap-2 rounded-xl border border-line-strong bg-raised px-4 py-3 text-sm shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
              <Check size={16} weight="bold" />
              {toast}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
