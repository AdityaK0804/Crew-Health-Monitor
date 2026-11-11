import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CaretDown, Heartbeat, Lock, NotePencil, PaperPlaneTilt, Siren, Trash, Warning } from '@phosphor-icons/react'
import BodyScan, { type Hotspot } from './BodyScan'
import TrendChart from './TrendChart'
import type { ActivityEvent } from './api'
import { regionOf } from './body/sdf'
import { CREW, MISSION_DAYS, cabinOn } from './data/simulatedCrew'
import { GUIDE } from './data/signalGuide'
import { SOURCES } from './data/sources'
import { MISSIONS, type MissionId } from './data/missions'
import type { User } from './data/users'
import { ATTACHMENT_LABEL } from './imageAttach'
import { flagged, getReading, latestAttachment, series, summarize, timeline, type CheckIns, type Provenance, type Subject } from './model'
import type { ImageAttachment } from './triage'
import { THRESHOLDS, type Finding, type Level, type Mode } from './triage'
import { AnimatedNumber, Button, Chip, EASE, Gauge, LEVEL_LINE, SPRING, Sparkline } from './ui'

const MODE_NAME: Record<Mode, string> = { earth: 'Earth-standard', space: 'Space-adapted' }
const PANEL = 'rounded-2xl border border-line bg-panel'
const worst = (list: Finding[]): Level => (list.some((f) => f.level === 'red') ? 'red' : list.some((f) => f.level === 'amber') ? 'amber' : 'green')

interface Props {
  user: User
  day: number
  setDay: (d: number) => void
  mission: MissionId
  mode: Mode
  setMode: (m: Mode) => void
  subjects: Subject[]
  checkIns: CheckIns
  events: ActivityEvent[]
  visible: (id: string) => boolean
  selected: string
  setSelected: (id: string) => void
  onSendReport: () => void
  onClear: () => void
  onCheckIn: () => void
  onEmergency: () => void
}

export default function Overview({ user, day, setDay, mission, mode, setMode, subjects, checkIns, events, visible, selected, setSelected, onSendReport, onClear, onCheckIn, onEmergency }: Props) {
  const [openRow, setOpenRow] = useState<string | null>(null)
  const [hoverRow, setHoverRow] = useState<string | null>(null)
  const mine = useMemo(() => subjects.filter((s) => visible(s.id)), [subjects, visible])
  const sum = useMemo(() => summarize(mine), [mine])
  const days = useMemo(() => timeline(checkIns, visible, mission), [checkIns, visible, mission])
  const current = mine.find((s) => s.id === selected) ?? mine[0]
  const rows = mode === 'earth' ? current.earth : current.space
  const crew = CREW.find((c) => c.id === current.id)
  const cabin = cabinOn(day, mission)
  const manualCount = Object.keys(checkIns).length
  const attention = rows.filter((f) => f.level !== 'green')
  const normal = rows.filter((f) => f.level === 'green')

  const hotspots = useMemo<Hotspot[]>(() => {
    if (!crew) return []
    return rows.flatMap((f) => {
      const region = regionOf(f.id, crew.build)
      return region ? [{ id: f.id, label: region.label, pos: region.pos, level: f.level }] : []
    })
  }, [rows, crew])

  const pick = (id: string) => {
    setSelected(id)
    setOpenRow(null)
  }

  return (
    <div className="mx-auto max-w-[1480px] px-4 py-4 sm:px-6">
      {/* The three columns share one fixed height, so nothing slides over anything else. Long columns scroll inside. */}
      <div className="grid gap-4 lg:h-[calc(100dvh-96px)] lg:min-h-[600px] lg:grid-cols-[272px_minmax(0,1fr)_minmax(0,440px)]">
        <div className="flex flex-col gap-4 lg:overflow-y-auto">
          <section className={`${PANEL} shrink-0 overflow-hidden`}>
            <div className="flex items-baseline justify-between px-4 pt-4 pb-2">
              <h2 className="font-semibold">Crew and cabin</h2>
              <span className="text-[11px] text-dim">Earth / Space</span>
            </div>
            <div className="px-2 pb-2">
              {subjects.map((s) =>
                visible(s.id) ? (
                  <RosterRow key={s.id} s={s} active={s.id === current.id} onPick={() => pick(s.id)} />
                ) : (
                  <div key={s.id} className="flex min-h-[60px] items-center gap-3 px-3 py-2 text-dim">
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="font-medium">{s.name}</span>
                      <span className="text-xs">Private to them and the medical officer</span>
                    </span>
                    <Lock size={16} />
                  </div>
                ),
              )}
            </div>
          </section>

          <section className={`${PANEL} shrink-0 p-4`}>
            <h2 className="font-semibold">Rule set</h2>
            <div className="relative mt-3 grid grid-cols-2 rounded-xl border border-line bg-ground p-1" role="group" aria-label="Rule set">
              {(['earth', 'space'] as const).map((m) => (
                <button key={m} onClick={() => setMode(m)} aria-pressed={mode === m} className="press relative min-h-11 rounded-lg px-2 text-sm font-medium">
                  {mode === m && <motion.span layoutId="mode-thumb" transition={SPRING} className="absolute inset-0 rounded-lg bg-ink" />}
                  <span className={`relative ${mode === m ? 'text-ground' : 'text-muted'}`}>{MODE_NAME[m]}</span>
                </button>
              ))}
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
              <Stat label="Earth rules flag" value={sum.earth} />
              <Stat label="Space rules flag" value={sum.space} />
              <Stat label="False alarms" value={sum.falseAlarms} />
              <Stat label="Missed by Earth" value={sum.missed} />
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-muted">Counts cover the people you are allowed to see.</p>
          </section>

          {events.length > 0 && (
            <section className={`${PANEL} shrink-0 p-4`}>
              <h2 className="font-semibold">Recent activity</h2>
              <ul className="mt-2 space-y-2.5">
                {events.slice(0, 4).map((e) => (
                  <li key={e.id} className="text-xs">
                    <p className="text-ink">{e.detail}</p>
                    <p className="font-mono text-dim">{new Date(e.at).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <section className="relative flex h-[600px] flex-col overflow-hidden rounded-2xl lg:h-auto" style={{ background: 'radial-gradient(ellipse 60% 55% at 50% 45%, #17171c 0%, transparent 100%)' }}>
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[3] flex items-start justify-between gap-3 p-5">
            <AnimatePresence mode="wait">
              <motion.div key={current.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22, ease: EASE }}>
                <h2 className="text-2xl font-semibold tracking-tight">{current.name}</h2>
                <p className="text-sm text-muted">{current.role}</p>
                {current.manual && <p className="mt-2 w-fit rounded-md border border-line-strong px-2 py-0.5 text-xs text-ink">Crew check-in today</p>}
              </motion.div>
            </AnimatePresence>
            <Chip level={worst(rows)} className="h-7" />
          </div>
          {crew ? (
            <>
              <div className="min-h-0 flex-1">
                <BodyScan build={crew.build} hotspots={hotspots} activeId={hoverRow ?? openRow} focusId={openRow} onPick={(id) => setOpenRow(openRow === id ? null : id)} />
              </div>
              {!current.manual && <LiveVitals base={getReading(checkIns, crew, day, mission)} />}
            </>
          ) : (
            <div className="flex flex-1 flex-wrap items-center justify-center gap-x-16 gap-y-10 px-6 pt-24 pb-10">
              <Gauge label="Cabin CO2" value={cabin.co2MmHg.toFixed(1)} unit="mmHg" fraction={cabin.co2MmHg / 5} level={rows.find((f) => f.id === 'co2')?.level ?? 'green'} note={`NASA limit ${THRESHOLDS.co2SpaceLimitMmHg.toFixed(1)}, Earth workplace limit ${THRESHOLDS.co2EarthLimitMmHg}`} />
              <Gauge label="Radiation dose" value={cabin.cumulativeDoseMSv.toFixed(0)} unit="mSv since launch" fraction={cabin.cumulativeDoseMSv / THRESHOLDS.radCareerMSv} level={rows.find((f) => f.id === 'radiation')?.level ?? 'green'} note={`Ring shows share of the ${THRESHOLDS.radCareerMSv} mSv career limit`} />
            </div>
          )}
        </section>

        <section className={`${PANEL} flex flex-col overflow-hidden`}>
          <div className="flex shrink-0 items-baseline justify-between gap-3 px-5 pt-4 pb-3">
            <h2 className="font-semibold">
              {attention.length === 0 ? 'Nothing needs attention' : `${attention.length} need${attention.length === 1 ? 's' : ''} attention`}
            </h2>
          </div>
          <div className="min-h-0 flex-1 lg:overflow-y-auto">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={current.id + mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                {[...attention, ...normal].map((f, i) => (
                  <div key={f.id}>
                    {i === attention.length && normal.length > 0 && <p className="border-t border-line-soft px-5 pt-4 pb-1 text-xs text-muted">Normal today</p>}
                    <SignalRow
                      index={i}
                      f={f}
                      compact={f.level === 'green'}
                      mode={mode}
                      earth={current.earth.find((x) => x.id === f.id) ?? f}
                      space={current.space.find((x) => x.id === f.id) ?? f}
                      info={current.info[f.id]}
                      trend={series(checkIns, current.id, f.id, day, 30, mission)}
                      attachment={f.id === 'onsd' ? latestAttachment(checkIns, current.id, day) : null}
                      open={openRow === f.id}
                      onToggle={() => setOpenRow(openRow === f.id ? null : f.id)}
                      onHover={(on) => setHoverRow(on ? f.id : null)}
                      onCheckIn={crew ? onCheckIn : undefined}
                      mission={mission}
                      onEmergency={onEmergency}
                    />
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
            <p className="px-5 py-3 text-xs text-dim">Trend is the last 30 days. Dashed line is the pre-flight value. All feeds are simulated.</p>
          </div>
        </section>
      </div>

      <TrendChart mission={mission} checkIns={checkIns} subjectId={current.id} subjectName={current.name} rows={rows} day={day} />

      <section className={`${PANEL} mt-4 px-5 py-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Mission timeline</h2>
            <p className="mt-1 text-xs text-muted">Setting: {MISSIONS[mission].name}. The setting changes the signal delay and the radiation rate. On the Moon the simulation also assumes a smaller fluid shift.</p>
            <p className="mt-1 text-xs text-muted">Flagged signals per day. Grey bars up: Earth rules. White bars down: space rules. Drag to change the day.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={onSendReport}>
              <PaperPlaneTilt size={18} />
              Send report to Earth
            </Button>
            {user.role === 'cmo' && manualCount > 0 && (
              <Button kind="ghost" onClick={onClear}>
                <Trash size={18} />
                Clear {manualCount} check-in{manualCount === 1 ? '' : 's'}
              </Button>
            )}
          </div>
        </div>
        <Timeline days={days} day={day} onDay={setDay} />
      </section>
      <p className="py-4 text-center text-xs text-muted">Educational prototype using simulated data. Not a medical device.</p>
    </div>
  )
}

/** Numbers that move by themselves, to show the wearable feed arriving without anyone typing. */
function LiveVitals({ base }: { base: { restingHrBpm: number; spo2Pct: number } }) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1600)
    return () => clearInterval(t)
  }, [])
  const wobble = (seed: number) => Math.round(Math.sin(tick * 1.7 + seed) * 1.6)
  return (
    <div className="pointer-events-none absolute top-20 right-5 z-[3] rounded-xl border border-line bg-panel/90 px-3 py-2 text-right">
      <p className="flex items-center justify-end gap-1.5 text-[11px] text-muted">
        <Heartbeat size={14} />
        Wearable, live (simulated)
      </p>
      <p className="font-mono text-lg tabular-nums">
        {base.restingHrBpm + wobble(0)} <span className="text-xs text-muted">bpm</span> <span className="text-dim">/</span> {Math.min(100, base.spo2Pct + (wobble(2) > 1 ? 1 : 0))}
        <span className="text-xs text-muted">% O2</span>
      </p>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-mono text-[26px] leading-tight font-medium tabular-nums">
        <AnimatedNumber value={value} />
      </dd>
    </div>
  )
}

function Count({ list }: { list: Finding[] }) {
  const level = worst(list)
  const tone = level === 'red' ? 'bg-urgent-bg text-urgent' : level === 'amber' ? 'bg-check-bg text-check' : 'text-dim'
  return <span className={`flex h-6 w-7 items-center justify-center rounded-md font-mono text-[13px] tabular-nums ${tone}`}>{flagged(list)}</span>
}

function RosterRow({ s, active, onPick }: { s: Subject; active: boolean; onPick: () => void }) {
  return (
    <button onClick={onPick} aria-pressed={active} className="press relative flex min-h-[60px] w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-raised/60">
      {active && <motion.span layoutId="roster-active" transition={SPRING} className="absolute inset-0 rounded-xl border border-line-strong bg-raised" />}
      <span className="relative flex min-w-0 flex-1 flex-col">
        <span className="font-medium">{s.name}</span>
        <span className="text-xs leading-snug text-muted">{s.role}</span>
      </span>
      <span className="relative flex gap-1" aria-label={`${flagged(s.earth)} flagged by Earth rules, ${flagged(s.space)} by space rules`}>
        <Count list={s.earth} />
        <Count list={s.space} />
      </span>
    </button>
  )
}

function age(p: Provenance): string {
  if (p.ageDays === 0) return p.auto ? 'live' : 'today'
  return p.ageDays === 1 ? 'yesterday' : `${p.ageDays} days ago`
}

interface RowProps {
  index: number
  f: Finding
  compact: boolean
  mode: Mode
  earth: Finding
  space: Finding
  info?: Provenance
  trend: { values: number[]; baseline?: number }
  attachment?: { attachment: ImageAttachment; day: number } | null
  open: boolean
  onToggle: () => void
  onHover: (on: boolean) => void
  onCheckIn?: () => void
  onEmergency: () => void
  mission: MissionId
}

const ACTION_BOX: Record<Level, string> = { green: 'bg-raised', amber: 'bg-check-bg', red: 'bg-urgent-bg' }
const ACTION_TEXT: Record<Level, string> = { green: 'text-muted', amber: 'text-check', red: 'text-urgent' }

function SignalRow({ index, f, compact, mode, earth, space, info, trend, attachment, open, onToggle, onHover, onCheckIn, onEmergency, mission }: RowProps) {
  const ref = useRef<HTMLDivElement>(null)
  // When a row opens (for example from a marker on the body), bring it into view.
  useEffect(() => {
    if (open) ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [open])
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.035, ease: EASE }}
      onPointerEnter={() => onHover(true)}
      onPointerLeave={() => onHover(false)}
      className={`border-t border-line-soft transition-colors duration-200 ${open ? 'bg-raised/60' : ''}`}
    >
      <button onClick={onToggle} aria-expanded={open} className={`flex w-full flex-col px-5 text-left hover:bg-raised/50 ${compact ? 'gap-0.5 py-2.5' : 'gap-2 py-3.5'}`}>
        <span className="flex w-full items-center gap-2">
          <span className={`min-w-0 flex-1 ${compact ? 'text-muted' : 'text-[15px] font-semibold'}`}>{f.title}</span>
          <Chip level={earth.level} tag="Earth" />
          <Chip level={space.level} tag="Space" />
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={SPRING} className="text-dim">
            <CaretDown size={16} />
          </motion.span>
        </span>
        <span className="flex w-full items-center justify-between gap-3">
          <span className="min-w-0">
            <span className={`block font-mono text-[13px] ${compact ? 'text-dim' : 'text-ink'}`}>{f.measured}</span>
            {info && (!compact || info.stale || open) && (
              <span className={`mt-0.5 flex items-center gap-1 text-xs ${info.stale ? 'text-check' : 'text-dim'}`}>
                {info.stale && <Warning size={13} weight="fill" />}
                {info.source}, {age(info)}
                {info.stale ? '. Getting old, re-measure.' : ''}
              </span>
            )}
          </span>
          {(!compact || open) && <Sparkline values={trend.values} baseline={trend.baseline} color={LEVEL_LINE[f.level]} />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: EASE }} className="overflow-hidden">
            <div className="space-y-4 px-5 pt-1 pb-5">
              {/* First thing to read: what to do. */}
              <div className={`rounded-xl p-4 ${ACTION_BOX[f.level]}`}>
                <p className={`text-xs font-semibold ${ACTION_TEXT[f.level]}`}>{f.level === 'green' ? 'Nothing to do' : 'Do this next'}</p>
                <p className="mt-1 text-[15px] leading-snug font-medium">{f.next}</p>
                {(f.level !== 'green' || info?.stale) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {onCheckIn && (
                      <Button onClick={onCheckIn} className="min-h-10 bg-ground/60">
                        <NotePencil size={16} />
                        Log a new measurement
                      </Button>
                    )}
                    {f.level === 'red' && (
                      <Button kind="danger" onClick={onEmergency} className="min-h-10">
                        <Siren size={16} weight="fill" />
                        Open emergency steps
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <p className="leading-relaxed">{mode === 'earth' ? earth.why : space.why}</p>

              {attachment && (
                <figure className="rounded-xl border border-line p-3 text-[13px]">
                  <img src={attachment.attachment.dataUrl} alt={attachment.attachment.caption ?? 'Attached eye ultrasound'} className="max-h-72 w-auto max-w-full rounded-lg border border-line-strong" />
                  <figcaption className="mt-2 leading-relaxed text-muted">
                    <span className="text-ink">Attached image, day {attachment.day}.</span> {attachment.attachment.caption ? `${attachment.attachment.caption}. ` : ''}
                    {ATTACHMENT_LABEL}
                  </figcaption>
                </figure>
              )}

              <div className="grid grid-cols-2 gap-3 text-[13px]">
                {([['Earth rules', earth], ['Space rules', space]] as const).map(([label, x]) => (
                  <div key={label} className={`rounded-xl border p-3 ${(label === 'Earth rules') === (mode === 'earth') ? 'border-line-strong' : 'border-line'}`}>
                    <p className="mb-1.5 flex items-center justify-between gap-2 text-xs text-muted">
                      {label}
                      <Chip level={x.level} />
                    </p>
                    <p className="leading-snug text-muted">{x.why}</p>
                  </div>
                ))}
              </div>

              {GUIDE[f.id] && (
                <div className="rounded-xl border border-line p-3 text-[13px] leading-relaxed">
                  <p className="mb-1 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                    About this measurement
                    <span className="rounded-md border border-line-strong px-1.5 py-0.5 text-ink">Hazard: {GUIDE[f.id].hazard}</span>
                  </p>
                  <p>{GUIDE[f.id].what}</p>
                  <p className="mt-1.5 text-muted">
                    <span className="text-ink">How to measure:</span> {GUIDE[f.id].how}
                  </p>
                  {GUIDE[f.id].hazard === 'Gravity changes' && MISSIONS[mission].gravity > 0 && (
                    <p className="mt-2 rounded-lg bg-check-bg px-3 py-2 text-check">
                      On the Moon: gravity is one sixth of Earth's. These rules come from weightless missions. Fluid should move toward the head less than in weightlessness, but nobody has measured a long stay in Moon gravity.{' '}
                      <a href={SOURCES.GRAVITY_PARTIAL.url} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                        Short-flight study
                      </a>
                      . The simulation assumes 60% of the weightless change (demo parameter).
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-1.5 border-t border-line-soft pt-3 text-xs leading-relaxed text-muted">
                {info && (
                  <p>
                    <span className="text-ink">Reading:</span> {info.source}, day {info.measuredDay}
                    {info.nextDue ? `. Next scheduled day ${info.nextDue}` : ''}. {info.auto ? 'Arrives by itself.' : 'Needs a crew member to do it.'}
                  </p>
                )}
                {f.sourceIds.map((id) => {
                  const s = SOURCES[id]
                  return (
                    <p key={id}>
                      <span className="text-ink">Rule: </span>
                      {s.status === 'demo' ? (
                        <span className="rounded border border-line-strong px-1.5 py-0.5 text-ink">Demo parameter, no published source</span>
                      ) : (
                        <a href={s.url} target="_blank" rel="noreferrer" className="text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                          {s.title}
                        </a>
                      )}{' '}
                      {s.says}
                      {s.status === 'partial' ? ' (Exact number still to be re-checked.)' : ''}
                    </p>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function Timeline({ days, day, onDay }: { days: { day: number; earth: number; space: number }[]; day: number; onDay: (d: number) => void }) {
  const max = Math.max(1, ...days.map((d) => Math.max(d.earth, d.space)))
  return (
    <div className="relative mt-4">
      <div className="flex h-20 items-stretch gap-px" aria-hidden="true">
        {days.map((d) => (
          <div key={d.day} className={`flex flex-1 flex-col transition-opacity duration-200 ${d.day === day ? '' : d.day > day ? 'opacity-35' : 'opacity-80'}`}>
            <div className="flex flex-1 items-end">
              <div className="w-full rounded-t-[1px] bg-[#6B6B74]" style={{ height: `${(d.earth / max) * 100}%` }} />
            </div>
            <div className="h-px bg-line-strong" />
            <div className="flex-1">
              <div className="w-full rounded-b-[1px] bg-ink" style={{ height: `${(d.space / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      <motion.div className="pointer-events-none absolute top-0 h-20 border-x border-ink/80 bg-ink/5" style={{ width: `${100 / days.length}%` }} animate={{ left: `${((day - 1) / days.length) * 100}%` }} transition={SPRING} />
      <input type="range" min={1} max={MISSION_DAYS} value={day} onChange={(e) => onDay(Number(e.target.value))} aria-label="Mission day" className="day-range mt-1 w-full" />
      <div className="flex justify-between font-mono text-[11px] text-dim">
        <span>Day 1</span>
        <span>30</span>
        <span>60</span>
        <span>{MISSION_DAYS}</span>
      </div>
    </div>
  )
}
