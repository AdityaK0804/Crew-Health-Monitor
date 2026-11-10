import { useState } from 'react'
import { motion } from 'motion/react'
import { EASE, SPRING } from './ui'
import { validateReading } from './validate'
import { CREW } from './data/simulatedCrew'
import { getReading, type CheckIns } from './model'
import type { CrewReading, IjvFlow } from './triage'

interface Props {
  day: number
  checkIns: CheckIns
  /** The people this user may log for. */
  crewIds: string[]
  initialCrewId: string
  onSave: (crewId: string, reading: CrewReading) => void
  onClose: () => void
}

const NUMBERS: { key: 'hematocritPct' | 'onsdMm' | 'sleepHours7d' | 'spo2Pct' | 'restingHrBpm' | 'urineLitersDay' | 'resistanceSessions7d' | 'moodAvg7d' | 'bodyTempC' | 'systolicBp' | 'diastolicBp' | 'glucoseMgDl'; label: string; unit: string; step: number }[] = [
  { key: 'hematocritPct', label: 'Hematocrit', unit: '%', step: 0.1 },
  { key: 'onsdMm', label: 'Optic nerve sheath', unit: 'mm', step: 0.01 },
  { key: 'sleepHours7d', label: 'Sleep, 7-day average', unit: 'h', step: 0.1 },
  { key: 'spo2Pct', label: 'Oxygen level', unit: '%', step: 1 },
  { key: 'restingHrBpm', label: 'Resting heart rate', unit: 'bpm', step: 1 },
  { key: 'urineLitersDay', label: 'Urine, last 24 h', unit: 'L', step: 0.1 },
  { key: 'resistanceSessions7d', label: 'Resistance sessions, 7 days', unit: 'count', step: 1 },
  { key: 'moodAvg7d', label: 'Mood, 1 very low to 5 very good', unit: '1-5', step: 0.1 },
  { key: 'bodyTempC', label: 'Body temperature', unit: 'C', step: 0.1 },
  { key: 'systolicBp', label: 'Blood pressure, upper', unit: 'mmHg', step: 1 },
  { key: 'diastolicBp', label: 'Blood pressure, lower', unit: 'mmHg', step: 1 },
  { key: 'glucoseMgDl', label: 'Blood sugar', unit: 'mg/dL', step: 1 },
]

export default function CheckIn({ day, checkIns, crewIds, initialCrewId, onSave, onClose }: Props) {
  const allowed = CREW.filter((c) => crewIds.includes(c.id))
  const firstCrew = allowed.find((c) => c.id === initialCrewId) ?? allowed[0] ?? CREW[0]
  const [crewId, setCrewId] = useState(firstCrew.id)
  const [r, setR] = useState<CrewReading>(() => getReading(checkIns, firstCrew, day))

  const [error, setError] = useState<string | null>(null)

  const changeCrew = (id: string) => {
    setCrewId(id)
    setR(getReading(checkIns, CREW.find((c) => c.id === id)!, day))
  }
  const field = 'min-h-11 w-full rounded-[10px] border border-line-strong bg-ground px-3 text-ink transition-colors focus:border-ink'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: EASE }}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      className="fixed inset-0 z-20 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkin-title"
    >
      <motion.form
        initial={{ y: 28, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 16, scale: 0.98 }}
        transition={SPRING}
        onSubmit={(e) => {
          e.preventDefault()
          const v = validateReading(r)
          if (!v.ok) return setError(v.error)
          onSave(crewId, v.reading)
        }}
        className="my-auto w-full max-w-2xl rounded-2xl border border-line-strong bg-panel p-6 shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
      >
        <h2 id="checkin-title" className="text-lg font-semibold">
          Log a check-in for day {day}
        </h2>
        <p className="mt-1 text-sm text-muted">Use this when a device is not sending, or to confirm an exam. Your entry replaces the device feed for this person and day.</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block text-muted">Crew member</span>
            <select autoFocus value={crewId} onChange={(e) => changeCrew(e.target.value)} className={field}>
              {allowed.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          {NUMBERS.map((n) => (
            <label key={n.key} className="text-sm">
              <span className="mb-1 block text-muted">
                {n.label} ({n.unit})
              </span>
              <input
                type="number"
                required
                step={n.step}
                value={r[n.key]}
                onChange={(e) => setR({ ...r, [n.key]: Number(e.target.value) })}
                className={`${field} font-mono`}
              />
            </label>
          ))}
          <label className="text-sm">
            <span className="mb-1 block text-muted">Neck vein flow</span>
            <select value={r.ijvFlow} onChange={(e) => setR({ ...r, ijvFlow: e.target.value as IjvFlow })} className={field}>
              <option value="forward">Forward (normal)</option>
              <option value="stagnant">Stagnant</option>
              <option value="retrograde">Backward</option>
            </select>
          </label>
          <fieldset className="grid gap-2 text-sm sm:col-span-2 sm:grid-cols-3">
            <legend className="mb-1 text-muted">Reported today</legend>
            {(
              [
                ['headache', 'Headache'],
                ['visionChange', 'Vision change'],
                ['ijvClotSeen', 'Possible clot on ultrasound'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex min-h-11 items-center gap-2 rounded-md border border-line-strong px-3">
                <input type="checkbox" checked={r[key]} onChange={(e) => setR({ ...r, [key]: e.target.checked })} className="h-4 w-4 accent-accent" />
                {label}
              </label>
            ))}
          </fieldset>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-urgent-bg px-3 py-2 text-sm text-urgent">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="press min-h-11 rounded-[10px] border border-line-strong px-4 font-medium hover:border-muted">
            Cancel
          </button>
          <button type="submit" className="press min-h-11 rounded-[10px] bg-ink px-5 font-semibold text-ground hover:bg-white">
            Save and re-check
          </button>
        </div>
      </motion.form>
    </motion.div>
  )
}
