import { useEffect, type ReactNode } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'motion/react'
import type { Level } from './triage'

export const CAPS = 'text-[11px] font-medium tracking-[0.08em] text-dim uppercase'
export const SPRING = { type: 'spring', stiffness: 420, damping: 34 } as const
export const EASE = [0.16, 1, 0.3, 1] as const

const LEVEL_LABEL: Record<Level, string> = { green: 'Normal', amber: 'Check', red: 'Urgent' }
const LEVEL_CHIP: Record<Level, string> = {
  green: 'border-line text-muted',
  amber: 'border-transparent bg-check-bg text-check',
  red: 'border-transparent bg-urgent-bg text-urgent',
}
export const LEVEL_LINE: Record<Level, string> = { green: '#8B8B94', amber: '#F5A524', red: '#FF7A7F' }

/** Product mark: an orbit ring with a pulse line through it. Our own mark, not NASA's. */
export function Logo() {
  return (
    <svg viewBox="0 0 32 32" width="32" height="32" role="img" aria-label="Crew Health Monitor">
      <circle cx="16" cy="16" r="13" fill="none" stroke="#3A3A41" strokeWidth="1.5" />
      <path d="M3 16h7l2.5-6 4 12 2.8-8 1.7 2H29" fill="none" stroke="#EDEDEF" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="25.2" cy="6.8" r="2" fill="#EDEDEF" />
    </svg>
  )
}

export function Chip({ level, className = '', tag }: { level: Level; className?: string; tag?: string }) {
  return (
    <span className={`inline-flex h-6 min-w-[58px] items-center justify-center gap-1 rounded-md border px-2 text-xs font-medium ${LEVEL_CHIP[level]} ${className}`}>
      {tag && <span className="text-[10px] font-normal opacity-70">{tag}</span>}
      {LEVEL_LABEL[level]}
    </span>
  )
}

type ButtonKind = 'primary' | 'secondary' | 'danger' | 'ghost'
const BUTTON: Record<ButtonKind, string> = {
  primary: 'bg-ink text-ground hover:bg-white',
  secondary: 'border border-line-strong bg-raised text-ink hover:border-muted hover:bg-[#202024]',
  danger: 'bg-[#E5484D] text-white hover:bg-[#F2555A]',
  ghost: 'text-muted hover:bg-raised hover:text-ink',
}

export function Button({ kind = 'secondary', className = '', children, ...rest }: { kind?: ButtonKind; children: ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} className={`press inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] px-4 text-sm font-medium whitespace-nowrap disabled:opacity-40 ${BUTTON[kind]} ${className}`}>
      {children}
    </button>
  )
}

/** A number that counts to its new value, so a change is seen, not missed. */
export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const mv = useMotionValue(value)
  const text = useTransform(mv, (v) => Math.round(v).toString())
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.5, ease: EASE })
    return () => controls.stop()
  }, [mv, value])
  return <motion.span className={className}>{text}</motion.span>
}

export function Sparkline({ values, baseline, color, width = 120 }: { values: number[]; baseline?: number; color: string; width?: number }) {
  const all = baseline === undefined ? values : [...values, baseline]
  const lo = Math.min(...all)
  const hi = Math.max(...all)
  const flat = hi === lo
  const y = (v: number) => (flat ? 14 : 24 - ((v - lo) / (hi - lo)) * 20)
  const d = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${(values.length === 1 ? width / 2 : (i * width) / (values.length - 1)).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${width} 28`} width={width} height="28" aria-hidden="true" className="shrink-0">
      {baseline !== undefined && <line x1="0" x2={width} y1={y(baseline)} y2={y(baseline)} stroke="#3A3A41" strokeDasharray="3 3" />}
      <motion.path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, ease: EASE }} />
    </svg>
  )
}

/** Ring gauge for cabin values. */
export function Gauge({ label, value, unit, fraction, level, note }: { label: string; value: string; unit: string; fraction: number; level: Level; note: string }) {
  const r = 54
  const c = 2 * Math.PI * r
  const f = Math.max(0, Math.min(1, fraction))
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="relative h-36 w-36">
        <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="64" cy="64" r={r} fill="none" stroke="#232327" strokeWidth="5" />
          <motion.circle cx="64" cy="64" r={r} fill="none" stroke={LEVEL_LINE[level] === '#8B8B94' ? '#EDEDEF' : LEVEL_LINE[level]} strokeWidth="5" strokeLinecap="round" strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - f) }} transition={{ duration: 0.9, ease: EASE }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-2xl font-medium tabular-nums">{value}</span>
          <span className="text-xs text-muted">{unit}</span>
        </div>
      </div>
      <div>
        <p className="font-medium">{label}</p>
        <p className="mt-0.5 text-xs text-muted">{note}</p>
      </div>
    </div>
  )
}
