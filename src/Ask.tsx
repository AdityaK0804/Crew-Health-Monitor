import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { PaperPlaneTilt } from '@phosphor-icons/react'
import { SUGGESTED, ask, type Answer } from './handbook'
import type { MissionId } from './data/missions'
import type { Subject } from './model'
import { Button, EASE } from './ui'

interface Turn {
  id: number
  question: string
  answers: Answer[]
  /** Gemini's rewording: 'wait' while loading, 'failed' if it did not work, else the text. */
  reworded?: string
}

export default function Ask({ subjects, meId, day, mission }: { subjects: Subject[]; meId: string; day: number; mission: MissionId }) {
  const [turns, setTurns] = useState<Turn[]>([])
  const [draft, setDraft] = useState('')
  const end = useRef<HTMLDivElement>(null)

  // Optional Gemini rewording. Only offered when the server says it has a key.
  const [canReword, setCanReword] = useState(false)
  const [natural, setNatural] = useState(false)
  useEffect(() => {
    fetch('/api/reword')
      .then((r) => ((r.headers.get('content-type') ?? '').includes('json') ? r.json() : { enabled: false }))
      .then((d: { enabled?: boolean }) => setCanReword(d.enabled === true))
      .catch(() => setCanReword(false))
  }, [])

  const submit = (question: string) => {
    const q = question.trim()
    if (!q) return
    const answers = ask(q, subjects, meId, day, mission)
    const id = Date.now()
    setTurns((t) => [...t, { id, question: q, answers, reworded: natural && canReword && answers.length > 0 ? 'wait' : undefined }])
    setDraft('')
    setTimeout(() => end.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 50)
    if (!(natural && canReword) || answers.length === 0) return
    // The handbook picks the facts. Gemini only rewrites them.
    const text = answers.map((a) => `${a.title}\n${a.lines.join('\n')}`).join('\n\n')
    fetch('/api/reword', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: q, text }), signal: AbortSignal.timeout(20000) })
      .then((r) => r.json())
      .then((d: { text?: string }) => setTurns((t) => t.map((x) => (x.id === id ? { ...x, reworded: d.text ?? 'failed' } : x))))
      .catch(() => setTurns((t) => t.map((x) => (x.id === id ? { ...x, reworded: 'failed' } : x))))
  }

  return (
    <div className="mx-auto max-w-[820px] px-4 py-4 sm:px-6">
      <section className="flex h-[calc(100dvh-104px)] min-h-[420px] flex-col rounded-2xl border border-line bg-panel">
        <div className="border-b border-line px-5 py-4">
          <h1 className="text-lg font-semibold tracking-tight">Ask the handbook</h1>
          <p className="mt-0.5 text-sm text-muted">Works with no connection and no AI model. It answers only from today's readings, the rules and their sources. If it does not know, it says so.</p>
          {canReword && (
            <label className="mt-3 flex min-h-11 w-fit items-center gap-2 rounded-[10px] border border-line-strong px-3 text-sm">
              <input type="checkbox" checked={natural} onChange={(e) => setNatural(e.target.checked)} className="h-4 w-4 accent-accent" />
              Reword answers with Gemini (needs internet)
            </label>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
          {turns.length === 0 && (
            <div className="m-auto w-full max-w-md">
              <p className="mb-3 text-center text-sm text-muted">Try one of these</p>
              <div className="grid gap-2">
                {SUGGESTED.map((s) => (
                  <button key={s} onClick={() => submit(s)} className="press min-h-11 rounded-xl border border-line-strong bg-raised px-4 text-left text-sm hover:border-muted">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          <AnimatePresence initial={false}>
            {turns.map((t) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }} className="flex flex-col gap-3">
                <p className="max-w-[85%] self-end rounded-2xl border border-line-strong bg-raised px-4 py-2.5 text-sm">{t.question}</p>
                {t.answers.length === 0 ? (
                  <p className="max-w-[90%] rounded-2xl border border-line bg-ground px-4 py-3 text-sm leading-relaxed text-muted">
                    I don't have that. I can only answer from this app's readings, rules and emergency steps. For anything else, ask the medical officer or send a message to Earth.
                  </p>
                ) : (
                  <>
                    {t.reworded && (
                      <div className="max-w-[90%] rounded-2xl border border-line-strong bg-raised px-4 py-3">
                        <p className="text-sm leading-relaxed">
                          {t.reworded === 'wait' ? 'Rewording...' : t.reworded === 'failed' ? 'Rewording did not work. The handbook text is below.' : t.reworded}
                        </p>
                        {t.reworded !== 'wait' && t.reworded !== 'failed' && <p className="mt-2 text-xs text-muted">Reworded by Gemini. The facts come from the handbook text below; check it if anything looks different.</p>}
                      </div>
                    )}
                    {t.answers.map((a) => (
                    <article key={a.title} className="max-w-[90%] rounded-2xl border border-line bg-ground px-4 py-3">
                      <h2 className="font-semibold">{a.title}</h2>
                      <ul className="mt-1.5 space-y-1.5 text-sm leading-relaxed">
                        {a.lines.map((l) => (
                          <li key={l}>{l}</li>
                        ))}
                      </ul>
                      {a.sources.length > 0 && (
                        <p className="mt-3 border-t border-line-soft pt-2 text-xs leading-relaxed text-muted">
                          From:{' '}
                          {a.sources.map((s, i) => (
                            <span key={s.label}>
                              {i > 0 && '; '}
                              {s.url ? (
                                <a href={s.url} target="_blank" rel="noreferrer" className="text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                                  {s.label}
                                </a>
                              ) : (
                                s.label
                              )}
                            </span>
                          ))}
                        </p>
                      )}
                    </article>
                    ))}
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={end} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            submit(draft)
          }}
          className="flex gap-3 border-t border-line p-4"
        >
          <label className="flex-1">
            <span className="sr-only">Your question</span>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask about a reading, a rule or an emergency"
              className="min-h-11 w-full rounded-[10px] border border-line-strong bg-ground px-3 text-sm text-ink placeholder:text-dim focus:border-ink"
            />
          </label>
          <Button kind="primary" type="submit" disabled={!draft.trim()}>
            <PaperPlaneTilt size={18} />
            Ask
          </Button>
        </form>
      </section>
    </div>
  )
}
