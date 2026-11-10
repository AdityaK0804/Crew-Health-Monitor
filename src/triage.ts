// Triage rules. Pure functions, no UI code.
// Biotech teammate: edit the numbers in THRESHOLDS and the wording in each rule.
// Every number names a source id from src/data/sources.ts.

export type Mode = 'earth' | 'space'
export type Level = 'green' | 'amber' | 'red'
export type IjvFlow = 'forward' | 'stagnant' | 'retrograde'

export interface CrewBaseline {
  /** Pre-flight values for this person. */
  hematocritPct: number
  onsdMm: number
  /** Lab reference range for hematocrit (differs by sex). */
  hctRefMin: number
  hctRefMax: number
}

export interface CrewReading {
  hematocritPct: number
  /** Optic nerve sheath diameter by ultrasound. */
  onsdMm: number
  visionChange: boolean
  ijvFlow: IjvFlow
  ijvClotSeen: boolean
  headache: boolean
  sleepHours7d: number
  spo2Pct: number
  restingHrBpm: number
  /** Urine passed in the last 24 hours. */
  urineLitersDay: number
  /** Resistance exercise sessions in the last 7 days. */
  resistanceSessions7d: number
  /** Self-rated mood, 1 (very low) to 5 (very good), averaged over 7 days. */
  moodAvg7d: number
  bodyTempC: number
  systolicBp: number
  diastolicBp: number
  glucoseMgDl: number
}

export interface CabinReading {
  /** Daily average CO2 partial pressure. */
  co2MmHg: number
  /** Dose equivalent since launch. */
  cumulativeDoseMSv: number
  missionDay: number
}

export interface Finding {
  id: string
  title: string
  level: Level
  measured: string
  why: string
  next: string
  sourceIds: string[]
}

export const THRESHOLDS = {
  hctRisePctExpectedMax: 20, // HCT_HIGH (demo). Published in-flight rise is about 10-12% (HCT_FLIGHT)
  onsdEarthCutoffMm: 6.0, // ONSD_REVIEW
  onsdChangeMm: 0.5, // ONSD_CHANGE (demo)
  co2SpaceLimitMmHg: 3.0, // CO2_LIMIT
  co2HeadacheMmHg: 2.5, // CO2_HEADACHE
  co2EarthLimitMmHg: 3.8, // CO2_EARTH
  radEarthYearlyMSv: 50, // RAD_EARTH
  radCareerMSv: 600, // RAD_LIMIT
  radWatchFraction: 0.5, // RAD_WATCH (demo)
  sleepMinHours: 6, // SLEEP (demo)
  spo2Amber: 94, // VITALS (demo)
  spo2Red: 90, // VITALS (demo)
  restingHrMax: 100, // VITALS (demo)
  urineSpaceMinL: 2.0, // URINE_TARGET
  urineEarthMinL: 0.8, // URINE_EARTH
  exerciseEarthMin: 2, // EXERCISE_EARTH
  exerciseSpaceMin: 5, // EXERCISE_PLAN (demo)
  moodLow: 2.5, // MOOD (demo)
  feverC: 38.0, // BASICS (demo)
  bpHighSys: 140, // BASICS (demo)
  bpHighDia: 90, // BASICS (demo)
  bpLowSys: 90, // BASICS (demo)
  glucoseLow: 70, // BASICS (demo)
  glucoseHigh: 180, // BASICS (demo)
} as const

const T = THRESHOLDS
const ROUTINE = 'Nothing extra. Keep routine checks.'
const pct = (n: number) => `${n.toFixed(1)}%`

function hematocrit(r: CrewReading, b: CrewBaseline, mode: Mode): Finding {
  const rise = ((r.hematocritPct - b.hematocritPct) / b.hematocritPct) * 100
  const measured = `${pct(r.hematocritPct)} (pre-flight ${pct(b.hematocritPct)}, lab range ${b.hctRefMin}-${b.hctRefMax}%)`
  const base = { id: 'hematocrit', title: 'Hematocrit (red cell share of blood)', measured }
  if (mode === 'earth') {
    const out = r.hematocritPct > b.hctRefMax || r.hematocritPct < b.hctRefMin
    return {
      ...base,
      level: out ? 'amber' : 'green',
      why: out
        ? 'Outside the Earth lab range. On Earth this suggests dehydration or a blood disorder.'
        : 'Inside the Earth lab range.',
      next: out ? 'Earth rule: give fluids and repeat the test.' : ROUTINE,
      sourceIds: ['HCT_REF'],
    }
  }
  if (rise > T.hctRisePctExpectedMax) {
    return {
      ...base,
      level: 'amber',
      why: `Up ${rise.toFixed(0)}% on this person's pre-flight value. That is more than the 10-12% rise usually seen in flight.`,
      next: 'Check fluid intake and urine output. Repeat the test. Report at next Earth contact.',
      sourceIds: ['HCT_FLIGHT', 'HCT_HIGH'],
    }
  }
  if (r.hematocritPct < b.hctRefMin) {
    return {
      ...base,
      level: 'amber',
      why: 'Below the lab range. Low values are not an expected in-flight change.',
      next: 'Repeat the test. Report at next Earth contact.',
      sourceIds: ['HCT_REF', 'HCT_FLIGHT'],
    }
  }
  return {
    ...base,
    level: 'green',
    why:
      rise > 3
        ? `Up ${rise.toFixed(0)}% on pre-flight. Expected in space: plasma volume drops early in flight, so red cells make up a bigger share. ISS crews showed about +10-12%.`
        : 'Close to the pre-flight value.',
    next: ROUTINE,
    sourceIds: ['HCT_FLIGHT'],
  }
}

function opticNerve(r: CrewReading, b: CrewBaseline, mode: Mode): Finding {
  const change = r.onsdMm - b.onsdMm
  const measured = `${r.onsdMm.toFixed(2)} mm (pre-flight ${b.onsdMm.toFixed(2)} mm)${r.visionChange ? ', reports vision change' : ''}`
  const base = { id: 'onsd', title: 'Optic nerve sheath (eye ultrasound)', measured }
  if (mode === 'earth') {
    const high = r.onsdMm > T.onsdEarthCutoffMm
    return {
      ...base,
      level: high ? 'amber' : 'green',
      why: high
        ? `Above the ${T.onsdEarthCutoffMm.toFixed(1)} mm Earth cut-off. On Earth this suggests raised pressure inside the skull.`
        : 'Below the Earth cut-off.',
      next: high ? 'Earth rule: urgent neurological assessment.' : ROUTINE,
      sourceIds: ['ONSD_REVIEW'],
    }
  }
  if (r.visionChange || change >= T.onsdChangeMm) {
    return {
      ...base,
      level: 'amber',
      why: r.visionChange
        ? 'The crew member reports a vision change. Together with the eye measurement this needs a closer look for spaceflight eye syndrome (SANS).'
        : `Grown ${change.toFixed(2)} mm since pre-flight. A change from the person's own baseline matters more than the absolute size.`,
      next: 'Do a vision test and repeat the eye ultrasound. Send images at next Earth contact.',
      sourceIds: ['ONSD_REVIEW', 'ONSD_CHANGE'],
    }
  }
  return {
    ...base,
    level: 'green',
    why:
      r.onsdMm > T.onsdEarthCutoffMm
        ? 'Above the Earth cut-off, but so are over half of astronauts before launch. No real change from this person\'s own baseline and no vision complaint.'
        : 'No real change from this person\'s own baseline and no vision complaint.',
    next: ROUTINE,
    sourceIds: ['ONSD_REVIEW'],
  }
}

function neckVein(r: CrewReading, mode: Mode): Finding {
  const measured = r.ijvClotSeen ? 'Possible clot seen on ultrasound' : `Flow: ${r.ijvFlow}`
  const base = { id: 'ijv', title: 'Neck vein blood flow (left jugular ultrasound)', measured }
  if (r.ijvClotSeen) {
    return {
      ...base,
      level: 'red',
      why: 'A clot in the neck vein has happened in flight before and needed treatment directed from Earth.',
      next: 'Contact Earth now. Follow the onboard protocol (demo). Do not start any medication from this screen.',
      sourceIds: ['IJV_STUDY', 'IJV_CASE'],
    }
  }
  if (r.ijvFlow === 'forward') {
    return { ...base, level: 'green', why: 'Blood is flowing forward normally.', next: ROUTINE, sourceIds: ['IJV_STUDY'] }
  }
  return {
    ...base,
    level: 'amber',
    why:
      mode === 'earth'
        ? 'Stagnant or backward flow is abnormal on Earth.'
        : 'Common in space (6 of 11 ISS crew in one study) but not harmless: 1 of those 11 developed a clot. Worth watching, not an emergency.',
    next:
      mode === 'earth'
        ? 'Earth rule: urgent vascular referral.'
        : 'Repeat the ultrasound and look for a clot. Report at next Earth contact.',
    sourceIds: ['IJV_STUDY'],
  }
}

function headache(r: CrewReading, cabin: CabinReading, mode: Mode): Finding | null {
  if (!r.headache) return null
  const measured = `Headache reported. Cabin CO2 ${cabin.co2MmHg.toFixed(1)} mmHg`
  const base = { id: 'headache', title: 'Headache', measured }
  if (mode === 'earth') {
    return {
      ...base,
      level: 'green',
      why: `Cabin CO2 is under the ${T.co2EarthLimitMmHg} mmHg Earth workplace limit, so Earth rules find no cause.`,
      next: 'Earth rule: rest and fluids.',
      sourceIds: ['CO2_EARTH'],
    }
  }
  const linked = cabin.co2MmHg >= T.co2HeadacheMmHg
  return {
    ...base,
    level: 'amber',
    why: linked
      ? `Cabin CO2 is above ${T.co2HeadacheMmHg} mmHg. On the ISS, each extra 1 mmHg doubled the odds of a headache. CO2 is the likely cause.`
      : 'Cabin CO2 is low, so it is unlikely to be the cause. Look for another reason.',
    next: linked
      ? 'Check the CO2 scrubber and airflow in sleeping areas. Log symptoms daily.'
      : 'Log symptoms. Check sleep and fluids. Report if it continues.',
    sourceIds: ['CO2_HEADACHE', 'CO2_LIMIT'],
  }
}

function sleep(r: CrewReading): Finding {
  const low = r.sleepHours7d < T.sleepMinHours
  return {
    id: 'sleep',
    title: 'Sleep (7-day average)',
    level: low ? 'amber' : 'green',
    measured: `${r.sleepHours7d.toFixed(1)} h per night`,
    why: low ? 'Short sleep for a week lowers alertness and raises error risk.' : 'Enough sleep this week.',
    next: low ? 'Protect the sleep period. Check noise, light and cabin CO2.' : ROUTINE,
    sourceIds: ['SLEEP'],
  }
}

function vitals(r: CrewReading): Finding {
  const level: Level =
    r.spo2Pct < T.spo2Red ? 'red' : r.spo2Pct < T.spo2Amber || r.restingHrBpm > T.restingHrMax ? 'amber' : 'green'
  return {
    id: 'vitals',
    title: 'Oxygen level and resting heart rate',
    level,
    measured: `SpO2 ${r.spo2Pct.toFixed(0)}%, heart rate ${r.restingHrBpm.toFixed(0)} bpm`,
    why: level === 'green' ? 'Both in the usual range.' : 'Outside the usual range.',
    next: level === 'red' ? 'Open Emergency mode.' : level === 'amber' ? 'Re-measure at rest in 10 minutes.' : ROUTINE,
    sourceIds: ['VITALS'],
  }
}

function urine(r: CrewReading, mode: Mode): Finding {
  const measured = `${r.urineLitersDay.toFixed(1)} L in the last 24 h`
  const base = { id: 'urine', title: 'Urine output (kidney stone risk)', measured }
  if (mode === 'earth') {
    const low = r.urineLitersDay < T.urineEarthMinL
    return {
      ...base,
      level: low ? 'amber' : 'green',
      why: low ? `Below ${T.urineEarthMinL} L a day, which is low even on Earth.` : 'Inside the usual range for an adult on Earth.',
      next: low ? 'Earth rule: drink more and re-measure.' : ROUTINE,
      sourceIds: ['URINE_EARTH'],
    }
  }
  const low = r.urineLitersDay < T.urineSpaceMinL
  return {
    ...base,
    level: low ? 'amber' : 'green',
    why: low
      ? `Below NASA's ${T.urineSpaceMinL.toFixed(1)} L a day target. In space, bones release extra calcium into the urine, so concentrated urine raises the risk of kidney stones.`
      : `At or above NASA's ${T.urineSpaceMinL.toFixed(1)} L a day target, which keeps stone-forming salts diluted.`,
    next: low ? 'Drink more through the day and log urine volume again tomorrow.' : ROUTINE,
    sourceIds: ['URINE_TARGET', 'URINE_RISK'],
  }
}

function exercise(r: CrewReading, mode: Mode): Finding {
  const measured = `${r.resistanceSessions7d} resistance session${r.resistanceSessions7d === 1 ? '' : 's'} in 7 days`
  const base = { id: 'exercise', title: 'Resistance exercise (bone and muscle)', measured }
  const min = mode === 'earth' ? T.exerciseEarthMin : T.exerciseSpaceMin
  const low = r.resistanceSessions7d < min
  if (mode === 'earth') {
    return {
      ...base,
      level: low ? 'amber' : 'green',
      why: low ? 'Fewer than the 2 strength sessions a week advised for adults on Earth.' : 'Meets the 2 strength sessions a week advised for adults on Earth.',
      next: low ? 'Earth rule: add a strength session.' : ROUTINE,
      sourceIds: ['EXERCISE_EARTH'],
    }
  }
  return {
    ...base,
    level: low ? 'amber' : 'green',
    why: low
      ? 'Enough for Earth, not for space. Without loading, crews lost about 1 to 1.5% of hip and spine bone every month. Resistance exercise is the main protection.'
      : 'On plan. Regular resistance exercise is the main protection against the 1 to 1.5% a month bone loss seen in weightlessness.',
    next: low ? 'Make up the missed sessions this week. Tell Earth if something is stopping you (pain, time, a device fault).' : ROUTINE,
    sourceIds: ['BONE_LOSS', 'EXERCISE_PLAN'],
  }
}

function mood(r: CrewReading): Finding {
  const low = r.moodAvg7d < T.moodLow
  return {
    id: 'mood',
    title: 'Mood (7-day average)',
    level: low ? 'amber' : 'green',
    measured: `${r.moodAvg7d.toFixed(1)} out of 5`,
    why: low
      ? 'Low mood for a week. Isolation and confinement is one of the five hazards of spaceflight, and low mood affects sleep, teamwork and safety.'
      : 'Mood has been steady this week.',
    next: low ? 'Talk to a crewmate or the medical officer. Ask for a private call with Earth. Protect your sleep and free time.' : ROUTINE,
    sourceIds: ['HAZARDS', 'MOOD'],
  }
}

function basics(r: CrewReading): Finding {
  const problems: string[] = []
  if (r.bodyTempC >= T.feverC) problems.push('temperature is in the fever range')
  if (r.systolicBp >= T.bpHighSys || r.diastolicBp >= T.bpHighDia) problems.push('blood pressure is high')
  if (r.systolicBp < T.bpLowSys) problems.push('blood pressure is low')
  if (r.glucoseMgDl < T.glucoseLow) problems.push('blood sugar is low')
  if (r.glucoseMgDl > T.glucoseHigh) problems.push('blood sugar is high')
  const flag = problems.length > 0
  return {
    id: 'basics',
    title: 'Blood pressure, temperature, blood sugar',
    level: flag ? 'amber' : 'green',
    measured: `${r.systolicBp.toFixed(0)}/${r.diastolicBp.toFixed(0)} mmHg, ${r.bodyTempC.toFixed(1)} C, ${r.glucoseMgDl.toFixed(0)} mg/dL`,
    why: flag ? `Your ${problems.join(' and ')}. These use ordinary Earth limits: we found no space-specific rule for them.` : 'All three are inside ordinary Earth limits. We found no space-specific rule for them.',
    next: flag ? 'Measure again after 10 minutes of rest. If it is still out of range, tell the medical officer and report to Earth.' : ROUTINE,
    sourceIds: ['BASICS'],
  }
}

/** All findings for one crew member, most serious first. */
export function assessCrew(r: CrewReading, b: CrewBaseline, cabin: CabinReading, mode: Mode): Finding[] {
  const list = [hematocrit(r, b, mode), opticNerve(r, b, mode), neckVein(r, mode), headache(r, cabin, mode), sleep(r), vitals(r), urine(r, mode), exercise(r, mode), mood(r), basics(r)]
  return sortFindings(list.filter((f): f is Finding => f !== null))
}

/** Findings that apply to the whole cabin. */
export function assessCabin(cabin: CabinReading, mode: Mode): Finding[] {
  const co2Limit = mode === 'earth' ? T.co2EarthLimitMmHg : T.co2SpaceLimitMmHg
  const co2High = cabin.co2MmHg > co2Limit
  const co2: Finding = {
    id: 'co2',
    title: 'Cabin CO2',
    level: co2High ? 'amber' : 'green',
    measured: `${cabin.co2MmHg.toFixed(1)} mmHg (daily average)`,
    why:
      mode === 'earth'
        ? co2High
          ? `Above the ${co2Limit} mmHg Earth workplace limit.`
          : `Under the ${co2Limit} mmHg Earth workplace limit.`
        : co2High
          ? `Above NASA's ${co2Limit} mmHg limit. Crews get headaches at lower CO2 in space than on Earth.`
          : `Under NASA's ${co2Limit} mmHg limit.`,
    next: co2High ? 'Check the CO2 scrubber. Improve airflow where crew sleep.' : ROUTINE,
    sourceIds: mode === 'earth' ? ['CO2_EARTH'] : ['CO2_LIMIT', 'CO2_HEADACHE'],
  }

  const dose = cabin.cumulativeDoseMSv
  const measured = `${dose.toFixed(0)} mSv since launch (day ${cabin.missionDay})`
  let rad: Finding
  if (mode === 'earth') {
    const over = dose > T.radEarthYearlyMSv
    rad = {
      id: 'radiation',
      title: 'Radiation dose',
      level: over ? 'amber' : 'green',
      measured,
      why: over
        ? `Above the ${T.radEarthYearlyMSv} mSv yearly limit for radiation workers on Earth.`
        : 'Under the yearly limit for radiation workers on Earth.',
      next: over ? 'Earth rule: remove from exposure.' : ROUTINE,
      sourceIds: ['RAD_EARTH'],
    }
  } else {
    const frac = dose / T.radCareerMSv
    rad = {
      id: 'radiation',
      title: 'Radiation dose',
      level: frac >= 1 ? 'red' : frac >= T.radWatchFraction ? 'amber' : 'green',
      measured,
      why: `${(frac * 100).toFixed(0)}% of NASA's ${T.radCareerMSv} mSv career limit. About 1.8 mSv per day is expected on the way to Mars.`,
      next: frac >= T.radWatchFraction ? 'Report at next Earth contact. Use the most shielded area during solar storms.' : ROUTINE,
      sourceIds: ['RAD_RATE', 'RAD_LIMIT', 'RAD_WATCH'],
    }
  }
  return sortFindings([co2, rad])
}

const RANK: Record<Level, number> = { red: 2, amber: 1, green: 0 }

export function sortFindings(list: Finding[]): Finding[] {
  return [...list].sort((a, b) => RANK[b.level] - RANK[a.level])
}

export function worstLevel(list: Finding[]): Level {
  return list.reduce<Level>((w, f) => (RANK[f.level] > RANK[w] ? f.level : w), 'green')
}

/** Compare the two rule sets on the same data. */
export function compareModes(earth: Finding[], space: Finding[]) {
  const spaceById = new Map(space.map((f) => [f.id, f]))
  let falseAlarms = 0
  let missed = 0
  for (const e of earth) {
    const s = spaceById.get(e.id)
    if (!s) continue
    if (e.level !== 'green' && s.level === 'green') falseAlarms++
    if (e.level === 'green' && s.level !== 'green') missed++
  }
  return { falseAlarms, missed }
}
