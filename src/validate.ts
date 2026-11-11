// Checks a check-in before it is stored. Used by the form and by the server.
// The ranges only catch typing mistakes (for example 440 instead of 44.0).
// They are not medical limits.

import type { CrewReading, ImageAttachment } from './triage.ts'

const RANGES: Record<'hematocritPct' | 'onsdMm' | 'sleepHours7d' | 'spo2Pct' | 'restingHrBpm' | 'urineLitersDay' | 'resistanceSessions7d' | 'moodAvg7d' | 'bodyTempC' | 'systolicBp' | 'diastolicBp' | 'glucoseMgDl' | 'wbcK' | 'lymphK' | 'vitaminDNgMl' | 'bodyMassKg', [number, number, string]> = {
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
  wbcK: [0.5, 60, 'White blood cells'],
  lymphK: [0.1, 25, 'Lymphocytes'],
  vitaminDNgMl: [2, 200, 'Vitamin D'],
  bodyMassKg: [30, 200, 'Body mass'],
}

/** Largest image the server and the browser store will accept (a compressed JPEG as a data URL). */
export const MAX_IMAGE_CHARS = 400_000
const JPEG_PREFIX = 'data:image/jpeg;base64,'

/** Accepts only a compressed JPEG data URL of limited size. Anything else is refused, never repaired. */
export function validateAttachment(input: unknown): { ok: true; attachment: ImageAttachment } | { ok: false; error: string } {
  const bad = { ok: false as const, error: 'The image could not be accepted. Use a JPEG or PNG photo.' }
  if (typeof input !== 'object' || input === null) return bad
  const a = input as Record<string, unknown>
  if (typeof a.dataUrl !== 'string' || !a.dataUrl.startsWith(JPEG_PREFIX) || a.dataUrl.length > MAX_IMAGE_CHARS) return bad
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(a.dataUrl.slice(JPEG_PREFIX.length))) return bad
  const dim = (x: unknown) => typeof x === 'number' && Number.isInteger(x) && x >= 1 && x <= 4096
  if (!dim(a.width) || !dim(a.height)) return bad
  if (typeof a.bytes !== 'number' || !Number.isFinite(a.bytes) || a.bytes < 0 || a.bytes > MAX_IMAGE_CHARS) return bad
  if (typeof a.attachedAt !== 'string' || a.attachedAt.length > 40) return bad
  const caption = typeof a.caption === 'string' ? a.caption.trim().slice(0, 200) : undefined
  return { ok: true, attachment: { dataUrl: a.dataUrl, width: a.width as number, height: a.height as number, bytes: a.bytes, attachedAt: a.attachedAt, ...(caption ? { caption } : {}) } }
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
  let attachment: ImageAttachment | undefined
  if (r.attachment !== undefined && r.attachment !== null) {
    const a = validateAttachment(r.attachment)
    if (!a.ok) return { ok: false, error: a.error }
    attachment = a.attachment
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
      wbcK: r.wbcK as number,
      lymphK: r.lymphK as number,
      vitaminDNgMl: r.vitaminDNgMl as number,
      bodyMassKg: r.bodyMassKg as number,
      ...(attachment ? { attachment } : {}),
    },
  }
}
