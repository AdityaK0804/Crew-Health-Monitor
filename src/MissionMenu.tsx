import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CaretDown, Check } from '@phosphor-icons/react'
import { MISSIONS, linkDelay, type MissionId } from './data/missions'
import { EASE, SPRING } from './ui'

/** Menu for choosing the mission setting. Each option says what it changes. */
export default function MissionMenu({ value, day, onChange }: { value: MissionId; day: number; onChange: (m: MissionId) => void }) {
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const list = useRef<HTMLUListElement>(null)

  // Close on a click outside or Escape. Put focus on the chosen option when it opens.
  useEffect(() => {
    if (!open) return
    const outside = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false)
    }
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        box.current?.querySelector('button')?.focus()
      }
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', key)
    list.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus()
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', key)
    }
  }, [open])

  // Arrow keys move between options.
  const arrows = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const items = [...(list.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])]
    const at = items.indexOf(document.activeElement as HTMLButtonElement)
    items[(at + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus()
  }

  return (
    <div ref={box} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`press flex min-h-11 flex-col justify-center rounded-[10px] border bg-raised px-3 text-left leading-tight ${open ? 'border-muted' : 'border-line-strong hover:border-muted'}`}
      >
        <span className="block text-[11px] text-muted">Setting</span>
        {/* The arrow sits on the same line as the chosen setting. */}
        <span className="flex items-center gap-2 text-sm font-medium">
          {MISSIONS[value].name}
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={SPRING} className="flex text-muted">
            <CaretDown size={14} weight="bold" />
          </motion.span>
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            ref={list}
            role="listbox"
            aria-label="Mission setting"
            onKeyDown={arrows}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: EASE }}
            className="absolute right-0 z-20 mt-2 w-[19rem] origin-top-right rounded-2xl border border-line-strong bg-raised p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
          >
            {Object.values(MISSIONS).map((m) => {
              const chosen = m.id === value
              return (
                <li key={m.id}>
                  <button
                    role="option"
                    aria-selected={chosen}
                    onClick={() => {
                      onChange(m.id)
                      setOpen(false)
                    }}
                    className={`press flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left ${chosen ? 'bg-ground' : 'hover:bg-ground/60 focus-visible:bg-ground/60'}`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{m.name}</span>
                      <span className="mt-0.5 block text-xs leading-snug text-muted">
                        Message to Earth: {linkDelay(m.id, day).text}. Radiation: {m.radiationMSvDay} mSv a day. {m.gravity > 0 ? 'Gravity: one sixth of Earth.' : 'Weightless.'}
                      </span>
                    </span>
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${chosen ? 'bg-ink text-ground' : ''}`}>{chosen && <Check size={12} weight="bold" />}</span>
                  </button>
                </li>
              )
            })}
            <li className="px-3 pt-2 pb-1.5 text-[11px] leading-snug text-dim">The delay and radiation rate have sources. On the Moon the simulation also assumes a smaller fluid shift, which is a demo parameter.</li>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
