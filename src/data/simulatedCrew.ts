// SIMULATED DATA. Nothing in this file is a real astronaut measurement.
//
// What is real:
//  - Pre-flight hematocrit values and lab ranges are copied from NASA OSDR dataset
//    OSD-569 (Inspiration4 crew, anonymous ids C001-C004). See data/osdr/.
//  - The size of the in-flight hematocrit rise (+11%), the CO2 range and the
//    radiation rate (1.8 mSv/day) follow the sources in sources.ts.
// What is invented: the crew, the day-by-day curves, symptoms, eye and vein values.

import type { CabinReading, CrewBaseline, CrewReading, IjvFlow } from '../triage.ts'

export const MISSION_DAYS = 90

export interface CrewMember {
  id: string
  name: string
  role: string
  build: 'male' | 'female'
  baseline: CrewBaseline
}

export const CREW: CrewMember[] = [
  { id: 'C1', build: 'female', name: 'E. Vance', role: 'Commander', baseline: { hematocritPct: 41.6, onsdMm: 6.1, hctRefMin: 35, hctRefMax: 45 } },
  { id: 'C2', build: 'male', name: 'M. Chen', role: 'Crew medical officer (not a doctor)', baseline: { hematocritPct: 44.5, onsdMm: 5.2, hctRefMin: 38.5, hctRefMax: 50 } },
  { id: 'C3', build: 'female', name: 'S. Jenkins', role: 'Science specialist', baseline: { hematocritPct: 37.8, onsdMm: 5.0, hctRefMin: 35, hctRefMax: 45 } },
  { id: 'C4', build: 'male', name: 'A. Rivera', role: 'Flight engineer', baseline: { hematocritPct: 49.0, onsdMm: 5.6, hctRefMin: 38.5, hctRefMax: 50 } },
]

/** Repeatable pseudo-random number in [-1, 1]. Same inputs give the same output. */
function noise(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return (x - Math.floor(x)) * 2 - 1
}

export function cabinOn(day: number): CabinReading {
  // CO2 creeps up as the scrubber ages: 2.2 mmHg at launch, about 3.4 from day 70.
  const co2 = day < 30 ? 2.2 + day * 0.01 : Math.min(3.4, 2.5 + (day - 30) * 0.0225)
  return {
    missionDay: day,
    co2MmHg: Math.round((co2 + noise(day) * 0.05) * 10) / 10,
    cumulativeDoseMSv: Math.round(day * 1.8 * 10) / 10,
  }
}

export function readingOn(crew: CrewMember, day: number): CrewReading {
  const n = (k: number) => noise(day * 7 + k + crew.id.charCodeAt(1) * 31)
  const b = crew.baseline
  const cabin = cabinOn(day)

  // Hematocrit rises about 11% over the first 10 days, then stays there.
  const hematocritPct = b.hematocritPct * (1 + 0.11 * Math.min(1, day / 10)) + n(1) * 0.3

  let onsdMm = b.onsdMm + n(2) * 0.04
  let visionChange = false
  let ijvFlow: IjvFlow = 'forward'
  let headache = false
  let sleepHours7d = 6.8 + n(3) * 0.3
  let urineLitersDay = 2.4 + n(6) * 0.2
  let resistanceSessions7d = 6
  let moodAvg7d = 3.9 + n(7) * 0.3

  if (crew.id === 'C1') {
    // Large sheath diameter from before launch. Slow growth after day 40, vision complaint from day 75.
    onsdMm += Math.max(0, day - 40) * 0.012
    visionChange = day >= 75
    // Drinks too little from week 3 on: fine by Earth rules, a stone risk in space.
    if (day >= 20) urineLitersDay = 1.6 + n(6) * 0.1
  }
  if (crew.id === 'C3' && cabin.co2MmHg >= 2.9) {
    headache = true
    sleepHours7d = 5.5 + n(3) * 0.2
    // Feeling unwell, so skipping workouts.
    resistanceSessions7d = 3
  }
  if (crew.id === 'C4' && day >= 48) ijvFlow = 'stagnant'
  // The medical officer carries everyone else's worries late in the mission.
  if (crew.id === 'C2' && day >= 68) moodAvg7d = 2.3 + n(7) * 0.1

  return {
    hematocritPct: Math.round(hematocritPct * 10) / 10,
    onsdMm: Math.round(onsdMm * 100) / 100,
    visionChange,
    ijvFlow,
    ijvClotSeen: false,
    headache,
    sleepHours7d: Math.round(sleepHours7d * 10) / 10,
    spo2Pct: Math.round(97 + n(4)),
    restingHrBpm: Math.round(62 + n(5) * 4),
    urineLitersDay: Math.round(urineLitersDay * 10) / 10,
    resistanceSessions7d,
    moodAvg7d: Math.round(moodAvg7d * 10) / 10,
    bodyTempC: Math.round((36.7 + n(8) * 0.2) * 10) / 10,
    systolicBp: Math.round(116 + n(9) * 5),
    diastolicBp: Math.round(74 + n(10) * 4),
    glucoseMgDl: Math.round(92 + n(11) * 6),
  }
}
