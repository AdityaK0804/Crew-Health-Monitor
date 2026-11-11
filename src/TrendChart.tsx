import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import type { MissionId } from './data/missions'
import { MISSION_DAYS } from './data/simulatedCrew'
import { series, type CheckIns } from './model'
import type { Finding } from './triage'
import { EASE, LEVEL_LINE } from './ui'

interface Props {
  mission: MissionId
  checkIns: CheckIns
  subjectId: string
  subjectName: string
  rows: Finding[]
  day: number
}

const W = 900
const H = 96
const MAX = 3

/** One signal over the whole mission so far. */
function Strip({ title, values, baseline, color, day }: { title: string; values: number[]; baseline?: number; color: string; day: number }) {
  const all = baseline === undefined ? values : [...values, baseline]
  const lo = Math.min(...all)
  const hi = Math.max(...all)
  const flat = hi === lo
  const x = (d: number) => ((d - 1) / (MISSION_DAYS - 1)) * W
  const y = (v: number) => (flat ? H / 2 : H - 10 - ((v - lo) / (hi - lo)) * (H - 20))
  const path = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i + 1).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const now = values[values.length - 1]
  const fmt = (v: number) => (Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(1))
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 border-t border-line-soft py-3 first:border-t-0">
      <div className="min-w-0">
        <p className="mb-1 flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
          <span className="font-medium">{title}</span>
          <span className="text-xs text-dim">
            lowest {fmt(lo)}, highest {fmt(hi)}
            {baseline !== undefined ? `, pre-flight ${fmt(baseline)}` : ''}
          </span>
        </p>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="block h-24 w-full" role="img" aria-label={`${title} from day 1 to day ${day}`}>
          {[30, 60].map((d) => (
            <line key={d} x1={x(d)} x2={x(d)} y1="0" y2={H} stroke="#1A1A1E" vectorEffect="non-scaling-stroke" />
          ))}
          {baseline !== undefined && <line x1="0" x2={W} y1={y(baseline)} y2={y(baseline)} stroke="#3A3A41" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />}
          <motion.path key={path} d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, ease: EASE }} />
          <line x1={x(day)} x2={x(day)} y1="0" y2={H} stroke="#EDEDEF" strokeOpacity="0.5" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <p className="w-16 text-right">
        <span className="block font-mono text-lg tabular-nums">{fmt(now)}</span>
        <span className="block text-[11px] text-dim">day {day}</span>
      </p>
    </div>
  )
}

export default function TrendChart({ mission, checkIns, subjectId, subjectName, rows: allRows, day }: Props) {
  const rows = allRows.filter((f) => f.id !== 'ijv' && f.id !== 'headache')
  const flaggedIds = rows.filter((f) => f.level !== 'green').map((f) => f.id)
  const defaults = (flaggedIds.length > 0 ? flaggedIds : rows.map((f) => f.id)).slice(0, 2)
  const [picked, setPicked] = useState<string[]>(defaults)
  // A different person or cabin: start again from what is flagged for them.
  useEffect(() => setPicked(defaults), [subjectId]) // eslint-disable-line react-hooks/exhaustive-deps

  const shown = picked.filter((id) => rows.some((f) => f.id === id))
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id].slice(-MAX)))

  return (
    <section className="mt-4 rounded-2xl border border-line bg-panel px-5 py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold">Trends since launch: {subjectName}</h2>
        <p className="text-xs text-muted">Pick up to {MAX} signals. Dashed line is the pre-flight value. Vertical line is today.</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Signals to chart">
        {rows.map((f) => (
          <button
            key={f.id}
            onClick={() => toggle(f.id)}
            aria-pressed={shown.includes(f.id)}
            className={`press min-h-9 rounded-full border px-3 text-xs font-medium ${shown.includes(f.id) ? 'border-ink bg-ink text-ground' : 'border-line-strong text-muted hover:text-ink'}`}
          >
            {f.title.replace(/ \(.*\)$/, '')}
          </button>
        ))}
      </div>
      <div className="mt-2">
        {shown.length === 0 && <p className="py-6 text-center text-sm text-muted">Pick a signal above to chart it.</p>}
        {shown.map((id) => {
          const f = rows.find((x) => x.id === id)!
          const s = series(checkIns, subjectId, id, day, day, mission)
          return <Strip key={id} title={f.title} values={s.values} baseline={s.baseline} color={LEVEL_LINE[f.level] === '#8B8B94' ? '#EDEDEF' : LEVEL_LINE[f.level]} day={day} />
        })}
      </div>
      <div className="mt-1 flex justify-between pr-20 font-mono text-[11px] text-dim" aria-hidden="true">
        <span>Day 1</span>
        <span>30</span>
        <span>60</span>
        <span>{MISSION_DAYS}</span>
      </div>
    </section>
  )
}
