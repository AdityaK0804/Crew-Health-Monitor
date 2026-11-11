import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle, Lightning } from '@phosphor-icons/react'
import { SCENARIOS, type Scenario } from './data/emergency'
import { CREW } from './data/simulatedCrew'
import { linkDelay, type MissionId } from './data/missions'
import { getReading, type CheckIns, type Subject } from './model'
import { Button, EASE } from './ui'

interface Props {
  day: number
  mission: MissionId
  subjects: Subject[]
  checkIns: CheckIns
  defaultPatient: string
  onSave: (record: { scenario: string; patient: string; day: number; startedAt: string; steps: { title: string; atSeconds: number }[] }) => Promise<boolean>
  onExit: () => void
}

const RANK = { green: 0, amber: 1, red: 2 }

export default function Emergency({ day, mission, subjects, checkIns, defaultPatient, onSave, onExit }: Props) {
  const [patient, setPatient] = useState(CREW.some((c) => c.id === defaultPatient) ? defaultPatient : CREW[0].id)
  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [step, setStep] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [saved, setSaved] = useState<'no' | 'saving' | 'yes' | 'failed'>('no')
  const startedAt = useRef('')
  const log = useRef<{ title: string; atSeconds: number }[]>([])

  const subject = subjects.find((s) => s.id === patient)
  const crew = CREW.find((c) => c.id === patient)!
  const vitals = getReading(checkIns, crew, day)
  // What the sensors point to for this patient, if anything.
  const suggested = SCENARIOS.find((sc) => {
    const w = sc.suggestWhen
    const f = w && subject?.space.find((x) => x.id === w.findingId)
    return w && f && RANK[f.level] >= RANK[w.level]
  })

  const running = scenario !== null && saved === 'no'
  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setSeconds((x) => x + 1), 1000)
    return () => clearInterval(t)
  }, [running])

  const begin = (sc: Scenario) => {
    startedAt.current = new Date().toISOString()
    log.current = [{ title: sc.steps[0].title, atSeconds: 0 }]
    setSeconds(0)
    setStep(0)
    setScenario(sc)
  }
  const next = async () => {
    if (!scenario) return
    if (step < scenario.steps.length - 1) {
      log.current.push({ title: scenario.steps[step + 1].title, atSeconds: seconds })
      return setStep(step + 1)
    }
    setSaved('saving')
    const ok = await onSave({ scenario: scenario.title, patient, day, startedAt: startedAt.current, steps: log.current })
    setSaved(ok ? 'yes' : 'failed')
  }
  const nextRef = useRef(next)
  nextRef.current = next

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') onExit()
      else if (running && (e.code === 'Space' || e.code === 'ArrowRight')) {
        e.preventDefault()
        void nextRef.current()
      } else if (running && e.code === 'ArrowLeft') setStep((x) => Math.max(0, x - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [running, onExit])

  const clock = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
  const s = scenario?.steps[step]

  return (
    <div className="flex min-h-[100dvh] flex-col bg-ground text-ink">
      <header className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-urgent/40 bg-urgent-bg px-5 py-4 sm:px-8">
        <div className="mr-auto">
          <p className="text-lg font-semibold text-urgent">Emergency{scenario ? `: ${scenario.title}` : ''}</p>
          <p className="text-sm text-muted">Practice walkthrough. Not a medical device.</p>
        </div>
        <p className="text-right text-sm">
          <span className="block text-muted">{crew.name}, from wearable (simulated)</span>
          <span className="font-mono text-base tabular-nums">
            {vitals.restingHrBpm} bpm / {vitals.spo2Pct}% O2
          </span>
        </p>
        {scenario && (
          <p className="font-mono text-3xl tabular-nums" aria-label="Time since start">
            {clock}
          </p>
        )}
        <Button onClick={onExit}>Exit (Esc)</Button>
      </header>

      {!scenario && (
        <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-8 sm:px-8">
          <h1 className="text-3xl font-semibold tracking-tight">What is happening?</h1>
          <label className="mt-6 block max-w-xs text-sm">
            <span className="mb-1 block text-muted">Who is the patient?</span>
            <select value={patient} onChange={(e) => setPatient(e.target.value)} className="min-h-11 w-full rounded-[10px] border border-line-strong bg-ground px-3 text-ink">
              {CREW.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <div className="mt-6 grid gap-3">
            {SCENARIOS.map((sc) => (
              <button key={sc.id} onClick={() => begin(sc)} className="press flex min-h-20 items-center gap-4 rounded-2xl border border-line-strong bg-raised px-5 py-4 text-left hover:border-muted">
                <span className="min-w-0 flex-1">
                  <span className="block text-xl font-semibold">{sc.title}</span>
                  <span className="block text-muted">{sc.summary}</span>
                </span>
                {suggested?.id === sc.id && (
                  <span className="flex shrink-0 items-center gap-1.5 rounded-lg bg-check-bg px-3 py-1.5 text-sm text-check">
                    <Lightning size={16} weight="fill" />
                    Sensors point here
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted">Every step shows whether it comes from a published source or is demo wording. The steps you take are timed, saved, and sent to Earth.</p>
        </main>
      )}

      {scenario && s && saved === 'no' && (
        <>
          <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-5 py-8 sm:px-8">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25, ease: EASE }} className="flex flex-col gap-8">
                <p className="font-mono text-sm tracking-widest text-muted uppercase">
                  Step {step + 1} of {scenario.steps.length}
                </p>
                <h1 className="text-4xl leading-tight font-semibold tracking-tight sm:text-6xl">{s.title}</h1>
                <p className="max-w-3xl text-xl leading-relaxed sm:text-2xl">{s.detail}</p>
                {s.source ? (
                  <a href={s.source.url} target="_blank" rel="noreferrer" className="w-fit rounded-lg border border-line-strong px-3 py-1.5 text-sm text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                    From: {s.source.label}
                  </a>
                ) : (
                  <span className="w-fit rounded-lg border border-line-strong px-3 py-1.5 text-sm text-muted">Demo only: not from a cited source</span>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
          <footer className="border-t border-line px-5 py-5 sm:px-8">
            <div className="mx-auto flex max-w-4xl gap-4">
              <button onClick={() => setStep((x) => Math.max(0, x - 1))} disabled={step === 0} className="press min-h-16 flex-1 rounded-xl border border-line-strong bg-raised text-lg font-medium disabled:opacity-40">
                Back
              </button>
              <button onClick={() => void next()} className="press min-h-16 flex-[2] rounded-xl bg-ink text-lg font-semibold text-ground hover:bg-white">
                {step === scenario.steps.length - 1 ? 'Finish and save record' : 'Done, next step (Space)'}
              </button>
            </div>
            <div className="mx-auto mt-4 flex max-w-4xl gap-1.5" aria-hidden="true">
              {scenario.steps.map((_, i) => (
                <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i <= step ? 'bg-ink' : 'bg-line'}`} />
              ))}
            </div>
          </footer>
        </>
      )}

      {scenario && saved !== 'no' && (
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-5 py-8 sm:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }}>
            <h1 className="flex items-center gap-3 text-3xl font-semibold tracking-tight">
              {saved === 'yes' && <CheckCircle size={32} weight="fill" />}
              {saved === 'saving' ? 'Saving the record...' : saved === 'yes' ? 'Record saved and sent to Earth' : 'The record could not be saved'}
            </h1>
            {saved === 'yes' && (
              <p className="mt-2 text-lg text-muted">
                It reaches Earth in {linkDelay(mission, day).text}. Keep caring for the patient while you wait for a reply.
              </p>
            )}
            <ol className="mt-6 divide-y divide-line-soft rounded-2xl border border-line bg-panel">
              {log.current.map((l, i) => (
                <li key={i} className="flex items-baseline gap-4 px-5 py-3">
                  <span className="font-mono text-sm text-muted tabular-nums">
                    +{Math.floor(l.atSeconds / 60)}:{String(l.atSeconds % 60).padStart(2, '0')}
                  </span>
                  <span>{l.title}</span>
                </li>
              ))}
            </ol>
            <Button kind="primary" onClick={onExit} className="mt-6">
              Back to the dashboard
            </Button>
          </motion.div>
        </main>
      )}
    </div>
  )
}
