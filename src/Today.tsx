import { useState } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, Check } from '@phosphor-icons/react'
import type { ServerState } from './api'
import type { User } from './data/users'
import { CABIN_ID, flagged, tasksFor, type Subject } from './model'
import { Button, Chip, EASE, SPRING } from './ui'

interface Props {
  user: User
  day: number
  subjects: Subject[]
  state: ServerState
  onTask: (key: string, done: boolean) => void
  onNote: (text: string) => Promise<boolean>
  onOpenCrew: (id: string) => void
  onOpenEarth: () => void
}

const worst = (s: Subject) => (s.space.some((f) => f.level === 'red') ? 'red' : s.space.some((f) => f.level === 'amber') ? 'amber' : 'green')

export default function Today({ user, day, subjects, state, onTask, onNote, onOpenCrew, onOpenEarth }: Props) {
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const me = subjects.find((s) => s.id === user.id)
  const cabin = subjects.find((s) => s.id === CABIN_ID)
  const tasks = me ? tasksFor(me, day) : []
  const done = new Set(state.tasksDone.filter((t) => t.day === day).map((t) => t.key))
  const notes = state.notes.filter((n) => n.crew_id === user.id && n.day === day)
  if (notes.length > 0) done.add('log:feel')
  const fromEarth = state.messages.filter((m) => m.side === 'earth').slice(0, 2)
  const doneCount = tasks.filter((t) => done.has(t.key)).length

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.trim()) return
    setBusy(true)
    if (await onNote(draft.trim())) setDraft('')
    setBusy(false)
  }

  return (
    <div className="mx-auto grid max-w-[1100px] gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <section className="rounded-2xl border border-line bg-panel p-6">
        <p className="text-sm text-muted">Mission day {day}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          {doneCount === tasks.length ? 'All done for today' : `${tasks.length - doneCount} thing${tasks.length - doneCount === 1 ? '' : 's'} to do today`}
        </h1>
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-line">
          <motion.div className="h-full origin-left rounded-full bg-ink" animate={{ scaleX: tasks.length ? doneCount / tasks.length : 0 }} transition={SPRING} />
        </div>

        <ul className="mt-5 space-y-2">
          {tasks.map((t, i) => {
            const isDone = done.has(t.key)
            const auto = t.key === 'log:feel'
            return (
              <motion.li key={t.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.04, ease: EASE }}>
                <button
                  onClick={() => !auto && onTask(t.key, !isDone)}
                  aria-pressed={isDone}
                  disabled={auto}
                  className={`press flex min-h-16 w-full items-start gap-3 rounded-xl border px-4 py-3 text-left disabled:cursor-default ${isDone ? 'border-line bg-ground' : 'border-line-strong bg-raised hover:border-muted'}`}
                >
                  <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${isDone ? 'border-ink bg-ink text-ground' : 'border-line-strong'}`}>
                    {isDone && <Check size={12} weight="bold" />}
                  </span>
                  <span className="min-w-0">
                    <span className={`block font-medium ${isDone ? 'text-muted line-through decoration-line-strong' : ''}`}>{t.title}</span>
                    <span className="block text-sm text-muted">{auto && !isDone ? 'Use the box on the right.' : t.detail}</span>
                  </span>
                  <span className="ml-auto shrink-0 text-xs text-dim">{t.kind === 'measure' ? 'Measurement' : t.kind === 'recheck' ? 'Re-check' : 'Log'}</span>
                </button>
              </motion.li>
            )
          })}
        </ul>

        {user.role === 'cmo' && (
          <div className="mt-8">
            <h2 className="font-semibold">Crew at a glance</h2>
            <p className="text-sm text-muted">As medical officer you can see everyone.</p>
            <ul className="mt-3 divide-y divide-line-soft rounded-xl border border-line">
              {subjects.map((s) => (
                <li key={s.id}>
                  <button onClick={() => onOpenCrew(s.id)} className="press flex min-h-12 w-full items-center gap-3 px-4 text-left hover:bg-raised/60">
                    <span className="flex-1 font-medium">{s.name}</span>
                    <span className="text-xs text-muted">{flagged(s.space) === 0 ? 'Nothing flagged' : `${flagged(s.space)} flagged`}</span>
                    <Chip level={worst(s)} />
                    <ArrowRight size={16} className="text-dim" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <div className="flex flex-col gap-4">
        <section className="rounded-2xl border border-line bg-panel p-5">
          <h2 className="font-semibold">How do you feel?</h2>
          <form onSubmit={save} className="mt-3">
            <label>
              <span className="sr-only">Your note for today</span>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="For example: dull headache since waking, worse in the sleep station."
                className="w-full resize-none rounded-[10px] border border-line-strong bg-ground px-3 py-2 text-sm text-ink placeholder:text-dim focus:border-ink"
              />
            </label>
            <Button kind="primary" type="submit" disabled={busy || !draft.trim()} className="mt-2 w-full">
              Save note
            </Button>
          </form>
          {notes.length > 0 && (
            <ul className="mt-4 space-y-2 border-t border-line pt-4">
              {notes.map((n) => (
                <li key={n.id} className="text-sm leading-relaxed">
                  {n.text}
                  <span className="block font-mono text-xs text-dim">{new Date(n.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-panel p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">From Earth</h2>
            <button onClick={onOpenEarth} className="press text-sm text-muted underline decoration-line-strong underline-offset-4 hover:text-ink">
              Open Earth link
            </button>
          </div>
          {fromEarth.length === 0 ? (
            <p className="mt-2 text-sm text-muted">No messages have arrived.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {fromEarth.map((m) => (
                <li key={m.id} className="text-sm leading-relaxed">
                  <span className="block text-xs text-muted">
                    {m.from_name}, sent {m.delay_min} min before it arrived
                  </span>
                  {m.body}
                </li>
              ))}
            </ul>
          )}
        </section>

        {cabin && (
          <section className="rounded-2xl border border-line bg-panel p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold">Cabin</h2>
              <Chip level={worst(cabin)} />
            </div>
            <ul className="mt-2 space-y-1 text-sm text-muted">
              {cabin.space.map((f) => (
                <li key={f.id}>
                  <span className="text-ink">{f.title}:</span> <span className="font-mono text-[13px]">{f.measured}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}
