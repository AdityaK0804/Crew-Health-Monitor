// Checks a check-in before it is stored. Used by the form and by the server.
// The ranges only catch typing mistakes (for example 440 instead of 44.0).
// They are not medical limits.

import type { CrewReading } from './triage.ts'

const RANGES: Record<'hematocritPct' | 'onsdMm' | 'sleepHours7d' | 'spo2Pct' | 'restingHrBpm' | 'urineLitersDay' | 'resistanceSessions7d' | 'moodAvg7d' | 'bodyTempC' | 'systolicBp' | 'diastolicBp' | 'glucoseMgDl', [number, number, string]> = {
  hematocritPct: [15, 75, 'Hematocrit'],
  onsdMm: [2, 10, 'Optic nerve sheath'],
  sleepHours7d: [0, 14, 'Sleep'],
  spo2Pct: [50, 100, 'Oxygen level'],
  restingHrBpm: [20, 220, 'Heart rate'],
  urineLitersDay: [0, 8, 'Urine output'],
  resistanceSessions7d: [0, 14, 'Exercise sessions'],
  moodAvg7d: [1, 5, 'Mood'],
  bodyTempC: [30, 43, 'Temperature'],
  systolicBp: [50, 260, 'Blood pressure (upper)'],
  diastolicBp: [30, 160, 'Blood pressure (lower)'],
  glucoseMgDl: [20, 600, 'Blood sugar'],
}

export type Validation = { ok: true; reading: CrewReading } | { ok: false; error: string }

export function validateReading(input: unknown): Validation {
  if (typeof input !== 'object' || input === null) return { ok: false, error: 'No reading was sent.' }
  const r = input as Record<string, unknown>
  for (const [key, [min, max, label]] of Object.entries(RANGES)) {
    const v = r[key]
    if (typeof v !== 'number' || !Number.isFinite(v)) return { ok: false, error: `${label} must be a number.` }
    if (v < min || v > max) return { ok: false, error: `${label} must be between ${min} and ${max}.` }
  }
  if (r.ijvFlow !== 'forward' && r.ijvFlow !== 'stagnant' && r.ijvFlow !== 'retrograde') {
    return { ok: false, error: 'Neck vein flow must be forward, stagnant or backward.' }
  }
  for (const key of ['visionChange', 'ijvClotSeen', 'headache']) {
    if (typeof r[key] !== 'boolean') return { ok: false, error: 'A yes/no answer is missing.' }
  }
  return {
    ok: true,
    reading: {
      hematocritPct: r.hematocritPct as number,
      onsdMm: r.onsdMm as number,
      sleepHours7d: r.sleepHours7d as number,
      spo2Pct: r.spo2Pct as number,
      restingHrBpm: r.restingHrBpm as number,
      urineLitersDay: r.urineLitersDay as number,
      resistanceSessions7d: r.resistanceSessions7d as number,
      moodAvg7d: r.moodAvg7d as number,
      bodyTempC: r.bodyTempC as number,
      systolicBp: r.systolicBp as number,
      diastolicBp: r.diastolicBp as number,
      glucoseMgDl: r.glucoseMgDl as number,
      ijvFlow: r.ijvFlow,
      visionChange: r.visionChange as boolean,
      ijvClotSeen: r.ijvClotSeen as boolean,
      headache: r.headache as boolean,
    },
  }
}
