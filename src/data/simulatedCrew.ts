// SIMULATED DATA. Nothing in this file is a real astronaut measurement.
//
// What is real:
//  - Pre-flight hematocrit values and lab ranges are copied from NASA OSDR dataset
//    OSD-569 (Inspiration4 crew, anonymous ids C001-C004). See data/osdr/.
//  - The size of the in-flight hematocrit rise (+11%), the CO2 range and the
//    radiation rate (1.8 mSv/day) follow the sources in sources.ts.
//  - Pre-flight white cell and lymphocyte counts are also copied from OSD-569.
//  - The direction of the white cell rise (up) and the vitamin D fall (about 25% over a
//    long flight) follow IMMUNE_WBC and VITD_FLIGHT. The exact numbers per person are invented.
// What is invented: the crew, the day-by-day curves, symptoms, eye and vein values.

import type { CabinReading, CrewBaseline, CrewReading, IjvFlow } from '../triage.ts'
import { MISSIONS, type MissionId } from './missions.ts'

export const MISSION_DAYS = 90

export interface CrewMember {
  id: string
  name: string
  role: string
  build: 'male' | 'female'
  baseline: CrewBaseline
}

export const CREW: CrewMember[] = [
  { id: 'C1', build: 'female', name: 'E. Vance', role: 'Commander', baseline: { hematocritPct: 41.6, onsdMm: 6.1, hctRefMin: 35, hctRefMax: 45, wbcK: 9.8, lymphK: 3.2, vitaminDNgMl: 40, bodyMassKg: 62 } },
  { id: 'C2', build: 'male', name: 'M. Chen', role: 'Crew medical officer (not a doctor)', baseline: { hematocritPct: 44.5, onsdMm: 5.2, hctRefMin: 38.5, hctRefMax: 50, wbcK: 7.0, lymphK: 2.7, vitaminDNgMl: 31, bodyMassKg: 78 } },
  { id: 'C3', build: 'female', name: 'S. Jenkins', role: 'Science specialist', baseline: { hematocritPct: 37.8, onsdMm: 5.0, hctRefMin: 35, hctRefMax: 45, wbcK: 5.4, lymphK: 2.0, vitaminDNgMl: 38, bodyMassKg: 58 } },
  { id: 'C4', build: 'male', name: 'A. Rivera', role: 'Flight engineer', baseline: { hematocritPct: 49.0, onsdMm: 5.6, hctRefMin: 38.5, hctRefMax: 50, wbcK: 10.6, lymphK: 2.9, vitaminDNgMl: 45, bodyMassKg: 84 } },
]

/** Repeatable pseudo-random number in [-1, 1]. Same inputs give the same output. */
function noise(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return (x - Math.floor(x)) * 2 - 1
}

export function cabinOn(day: number, mission: MissionId = 'mars'): CabinReading {
  const m = MISSIONS[mission]
  // CO2 creeps up as the scrubber ages: 2.2 mmHg at launch, about 3.4 from day 70.
  const co2 = day < 30 ? 2.2 + day * 0.01 : Math.min(3.4, 2.5 + (day - 30) * 0.0225)
  return {
    missionDay: day,
    co2MmHg: Math.round((co2 + noise(day) * 0.05) * 10) / 10,
    cumulativeDoseMSv: Math.round(day * m.radiationMSvDay * 10) / 10,
    doseRateMSvDay: m.radiationMSvDay,
    setting: m.setting,
    rateSourceId: m.radSourceId,
  }
}

export function readingOn(crew: CrewMember, day: number, mission: MissionId = 'mars'): CrewReading {
  // Share of the weightless "fluid toward the head" effect in this setting (1 = weightless).
  const shift = MISSIONS[mission].fluidShift
  const n = (k: number) => noise(day * 7 + k + crew.id.charCodeAt(1) * 31)
  const b = crew.baseline
  const cabin = cabinOn(day)

  // Hematocrit rises about 11% over the first 10 days, then stays there.
  const hematocritPct = b.hematocritPct * (1 + 0.11 * shift * Math.min(1, day / 10)) + n(1) * 0.3

  let onsdMm = b.onsdMm + n(2) * 0.04
  let visionChange = false
  let ijvFlow: IjvFlow = 'forward'
  let headache = false
  let sleepHours7d = 6.8 + n(3) * 0.3
  let urineLitersDay = 2.4 + n(6) * 0.2
  let resistanceSessions7d = 6
  let moodAvg7d = 3.9 + n(7) * 0.3

  // White cells rise in flight (published direction). Lymphocytes stay about the same.
  const wbcK = b.wbcK * (1 + 0.2 * Math.min(1, day / 10)) + n(12) * 0.1
  const lymphK = b.lymphK * (1 + n(13) * 0.03)
  // Vitamin D falls about 25% over a long flight, even with supplements (sizes invented per person).
  const vitaminDNgMl = b.vitaminDNgMl * (1 - 0.25 * (day / MISSION_DAYS)) + n(14) * 0.3
  // Body mass: small drift. The flight engineer eats too little from day 40.
  let massLoss = 0.0003 * Math.min(day, 60)
  if (crew.id === 'C4') massLoss = Math.min(0.08, Math.max(0, day - 40) * 0.0015) + 0.005

  if (crew.id === 'C1') {
    // Large sheath diameter from before launch. Slow growth after day 40, vision complaint from day 75.
    onsdMm += Math.max(0, day - 40) * 0.012 * shift
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
    wbcK: Math.round(wbcK * 10) / 10,
    lymphK: Math.round(lymphK * 10) / 10,
    vitaminDNgMl: Math.round(vitaminDNgMl * 10) / 10,
    bodyMassKg: Math.round(b.bodyMassKg * (1 - massLoss) * 10) / 10,
  }
}
