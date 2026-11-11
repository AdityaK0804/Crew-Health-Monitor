import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle, Clock, PaperPlaneTilt } from '@phosphor-icons/react'
import type { Message } from './api'
import { MISSIONS, linkDelay, sayDelay, type MissionId } from './data/missions'
import { Button, EASE } from './ui'

interface Props {
  side: 'ship' | 'earth'
  day: number
  mission: MissionId
  messages: Message[]
  /** Server clock minus this device's clock, in ms. */
  skew: number
  onSend: (body: string) => Promise<boolean>
}

const KIND_LABEL: Record<Message['kind'], string> = { message: 'Message', report: 'Health report', emergency: 'Emergency record' }

/** Long reports show a short summary first, so the thread stays readable. */
function Body({ m, open, onToggle }: { m: Message; open: boolean; onToggle: () => void }) {
  if (m.kind === 'message') return <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-wrap">{m.body}</p>
  const lines = m.body.split('\n').filter((l) => l.trim())
  const flags = lines.filter((l) => /^\s*(CHECK|URGENT):/.test(l)).length
  const summary = m.kind === 'report' ? (flags === 0 ? 'Nothing flagged.' : `${flags} flagged signal${flags === 1 ? '' : 's'}.`) : lines.slice(1, 3).join(' ')
  return (
    <div className="mt-1.5">
      <p className="text-sm leading-relaxed">{summary}</p>
      {open && <p className="mt-2 max-h-[40dvh] overflow-y-auto rounded-lg bg-ground p-3 font-mono text-[12px] leading-relaxed whitespace-pre-wrap text-muted">{m.body}</p>}
      <button onClick={onToggle} aria-expanded={open} className="press mt-2 min-h-9 text-xs text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
        {open ? 'Hide details' : 'Show full text'}
      </button>
    </div>
  )
}

export default function EarthLink({ side, day, mission, messages, skew, onSend }: Props) {
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [, tick] = useState(0)
  const link = linkDelay(mission, day)
  const other = side === 'ship' ? 'Earth' : 'the ship'

  // Re-draw twice a second so the countdowns move.
  useEffect(() => {
    const t = setInterval(() => tick((x) => x + 1), 500)
    return () => clearInterval(t)
  }, [])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.trim()) return
    setBusy(true)
    if (await onSend(draft.trim())) setDraft('')
    setBusy(false)
  }

  const [openId, setOpenId] = useState<number | null>(null)
  const thread = [...messages].reverse()
  const end = useRef<HTMLDivElement>(null)
  const newest = messages[0]?.id
  // Keep the newest message in view, like any chat.
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'nearest' })
  }, [newest])

  return (
    <div className="mx-auto grid max-w-[1100px] gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="h-fit rounded-2xl border border-line bg-panel p-5">
        <p className="text-sm text-muted">One-way signal delay today</p>
        <p className="mt-1 flex items-baseline gap-2">
          <span className="font-mono text-4xl font-medium tabular-nums">{link.text.replace(/ (minutes|seconds|second)$/, '')}</span>
          <span className="text-muted">{link.text.match(/(minutes|seconds|second)$/)?.[0]}</span>
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {link.compressed ? (
            <>
              A question and its answer take at least <span className="text-ink">{link.minutes * 2} minutes</span>. The demo plays one minute of delay as one second.
            </>
          ) : (
            'Shown at its real speed.'
          )}{' '}
          {MISSIONS[mission].note}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-dim">
          Delay from:{' '}
          {MISSIONS[mission].delaySource.url ? (
            <a href={MISSIONS[mission].delaySource.url} target="_blank" rel="noreferrer" className="underline decoration-line-strong underline-offset-4 hover:text-ink">
              {MISSIONS[mission].delaySource.label}
            </a>
          ) : (
            MISSIONS[mission].delaySource.label
          )}
          .
        </p>
        {side === 'ship' ? (
          <p className="mt-4 border-t border-line pt-4 text-sm leading-relaxed">
            While you wait, keep following the onboard steps. In an emergency, act first and report after.
          </p>
        ) : (
          <p className="mt-4 border-t border-line pt-4 text-sm leading-relaxed">
            You see only what the crew chose to send. By the time you read it, it is already {link.text} old.
          </p>
        )}
      </aside>

      <section className="flex h-[calc(100dvh-104px)] min-h-[420px] flex-col rounded-2xl border border-line bg-panel">
        <h2 className="border-b border-line px-5 py-4 text-lg font-semibold tracking-tight">{side === 'ship' ? 'Link to Earth' : 'Link to the ship'}</h2>
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
          {thread.length === 0 && <p className="m-auto max-w-xs text-center text-sm text-muted">Nothing sent yet. Write to {other} below, or send a health report from the Crew health tab.</p>}
          <AnimatePresence initial={false}>
            {thread.map((m) => {
              const mine = m.side === side
              const left = Math.max(0, Math.ceil((m.deliver_at - (Date.now() + skew)) / 1000))
              const arrived = left === 0
              return (
                <motion.article
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className={`max-w-[85%] rounded-2xl border px-4 py-3 ${mine ? 'self-end border-line-strong bg-raised' : 'self-start border-line bg-ground'}`}
                >
                  <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
                    <span className="font-medium text-ink">{m.from_name}</span>
                    <span>{KIND_LABEL[m.kind]}</span>
                    <span>Day {m.day}</span>
                  </p>
                  <Body m={m} open={openId === m.id} onToggle={() => setOpenId(openId === m.id ? null : m.id)} />
                  {mine && (
                    <p className={`mt-2 flex items-center gap-1.5 text-xs ${arrived ? 'text-muted' : 'text-check'}`}>
                      {arrived ? <CheckCircle size={14} weight="fill" /> : <Clock size={14} />}
                      {arrived ? `Arrived at ${side === 'ship' ? 'Earth' : 'the ship'}` : `On its way. Arrives in ${left} s${m.delay_min >= 1 ? ` (${sayDelay(m.delay_min)} in real time)` : ''}`}
                    </p>
                  )}
                </motion.article>
              )
            })}
          </AnimatePresence>
          <div ref={end} />
        </div>
        <form onSubmit={send} className="flex gap-3 border-t border-line p-4">
          <label className="flex-1">
            <span className="sr-only">Message to {other}</span>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              placeholder={`Write to ${other}`}
              className="w-full resize-none rounded-[10px] border border-line-strong bg-ground px-3 py-2 text-sm text-ink placeholder:text-dim focus:border-ink"
            />
          </label>
          <Button kind="primary" type="submit" disabled={busy || !draft.trim()} className="self-end">
            <PaperPlaneTilt size={18} />
            Send
          </Button>
        </form>
      </section>
    </div>
  )
}
