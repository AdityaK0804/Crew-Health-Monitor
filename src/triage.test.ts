import { describe, expect, it } from 'vitest'
import { SOURCES } from './data/sources'
import { CREW, MISSION_DAYS, cabinOn, readingOn } from './data/simulatedCrew'
import { assessCabin, assessCrew, compareModes, worstLevel, type CabinReading, type CrewBaseline, type CrewReading } from './triage'

const baseline: CrewBaseline = { hematocritPct: 45, onsdMm: 5.2, hctRefMin: 38.5, hctRefMax: 50 }
const normal: CrewReading = {
  hematocritPct: 45,
  onsdMm: 5.2,
  visionChange: false,
  ijvFlow: 'forward',
  ijvClotSeen: false,
  headache: false,
  sleepHours7d: 7,
  spo2Pct: 97,
  restingHrBpm: 60,
  urineLitersDay: 2.4,
  resistanceSessions7d: 6,
  moodAvg7d: 4,
  bodyTempC: 36.7,
  systolicBp: 116,
  diastolicBp: 74,
  glucoseMgDl: 92,
}
const cabin: CabinReading = { co2MmHg: 2.2, cumulativeDoseMSv: 20, missionDay: 11 }
const level = (r: Partial<CrewReading>, mode: 'earth' | 'space', id: string, c = cabin, b = baseline) =>
  assessCrew({ ...normal, ...r }, b, c, mode).find((f) => f.id === id)?.level

describe('hematocrit', () => {
  it('an 11% in-flight rise alarms Earth rules but not space rules', () => {
    expect(level({ hematocritPct: 51 }, 'earth', 'hematocrit')).toBe('amber')
    expect(level({ hematocritPct: 51 }, 'space', 'hematocrit')).toBe('green')
  })
  it('space rules still flag a rise over 20% and a low value', () => {
    expect(level({ hematocritPct: 55 }, 'space', 'hematocrit')).toBe('amber')
    expect(level({ hematocritPct: 36 }, 'space', 'hematocrit')).toBe('amber')
  })
})

describe('optic nerve sheath', () => {
  const big = { ...baseline, onsdMm: 6.1 }
  it('a large but unchanged diameter alarms Earth rules only', () => {
    expect(level({ onsdMm: 6.15 }, 'earth', 'onsd', cabin, big)).toBe('amber')
    expect(level({ onsdMm: 6.15 }, 'space', 'onsd', cabin, big)).toBe('green')
  })
  it('space rules flag growth from baseline or a vision change', () => {
    expect(level({ onsdMm: 5.8 }, 'space', 'onsd')).toBe('amber')
    expect(level({ visionChange: true }, 'space', 'onsd')).toBe('amber')
  })
})

describe('neck vein', () => {
  it('stagnant flow is amber in both modes, never green', () => {
    expect(level({ ijvFlow: 'stagnant' }, 'earth', 'ijv')).toBe('amber')
    expect(level({ ijvFlow: 'retrograde' }, 'space', 'ijv')).toBe('amber')
  })
  it('a clot is red in both modes', () => {
    expect(level({ ijvClotSeen: true }, 'earth', 'ijv')).toBe('red')
    expect(level({ ijvClotSeen: true }, 'space', 'ijv')).toBe('red')
  })
})

describe('cabin CO2 and headache', () => {
  const stuffy = { ...cabin, co2MmHg: 3.3 }
  it('3.3 mmHg passes the Earth limit but fails the NASA limit', () => {
    expect(assessCabin(stuffy, 'earth').find((f) => f.id === 'co2')?.level).toBe('green')
    expect(assessCabin(stuffy, 'space').find((f) => f.id === 'co2')?.level).toBe('amber')
  })
  it('a headache is only flagged by space rules', () => {
    expect(level({ headache: true }, 'earth', 'headache', stuffy)).toBe('green')
    expect(level({ headache: true }, 'space', 'headache', stuffy)).toBe('amber')
  })
  it('no headache means no headache finding', () => {
    expect(level({}, 'space', 'headache')).toBeUndefined()
  })
})

describe('radiation', () => {
  const rad = (dose: number, mode: 'earth' | 'space') =>
    assessCabin({ ...cabin, cumulativeDoseMSv: dose }, mode).find((f) => f.id === 'radiation')?.level
  it('Earth yearly limit trips early; space career limit does not', () => {
    expect(rad(108, 'earth')).toBe('amber')
    expect(rad(108, 'space')).toBe('green')
  })
  it('space rules go amber at half the career limit and red at the limit', () => {
    expect(rad(300, 'space')).toBe('amber')
    expect(rad(600, 'space')).toBe('red')
  })
})

describe('kidney stone and bone signals', () => {
  it('1.6 L of urine a day passes Earth rules but not the NASA target', () => {
    expect(level({ urineLitersDay: 1.6 }, 'earth', 'urine')).toBe('green')
    expect(level({ urineLitersDay: 1.6 }, 'space', 'urine')).toBe('amber')
    expect(level({ urineLitersDay: 2.2 }, 'space', 'urine')).toBe('green')
  })
  it('3 resistance sessions a week is enough on Earth, not in space', () => {
    expect(level({ resistanceSessions7d: 3 }, 'earth', 'exercise')).toBe('green')
    expect(level({ resistanceSessions7d: 3 }, 'space', 'exercise')).toBe('amber')
    expect(level({ resistanceSessions7d: 1 }, 'earth', 'exercise')).toBe('amber')
  })
})

describe('indicators named by the challenge', () => {
  it('a week of low mood is flagged in both modes', () => {
    expect(level({ moodAvg7d: 2.2 }, 'earth', 'mood')).toBe('amber')
    expect(level({ moodAvg7d: 2.2 }, 'space', 'mood')).toBe('amber')
    expect(level({ moodAvg7d: 3.5 }, 'space', 'mood')).toBe('green')
  })
  it('fever, high blood pressure and low blood sugar are each flagged', () => {
    expect(level({}, 'space', 'basics')).toBe('green')
    expect(level({ bodyTempC: 38.4 }, 'space', 'basics')).toBe('amber')
    expect(level({ systolicBp: 150 }, 'space', 'basics')).toBe('amber')
    expect(level({ glucoseMgDl: 60 }, 'earth', 'basics')).toBe('amber')
  })
})

describe('shared rules and helpers', () => {
  it('low oxygen is red in both modes', () => {
    expect(level({ spo2Pct: 88 }, 'earth', 'vitals')).toBe('red')
    expect(level({ spo2Pct: 88 }, 'space', 'vitals')).toBe('red')
  })
  it('worstLevel and compareModes work on a mixed case', () => {
    const r = { ...normal, hematocritPct: 51, headache: true }
    const stuffy = { ...cabin, co2MmHg: 3.3 }
    const earth = assessCrew(r, baseline, stuffy, 'earth')
    const space = assessCrew(r, baseline, stuffy, 'space')
    expect(worstLevel(earth)).toBe('amber')
    expect(compareModes(earth, space)).toEqual({ falseAlarms: 1, missed: 1 })
  })
})

describe('data hygiene', () => {
  it('every finding on every simulated day cites a known source', () => {
    for (let day = 1; day <= MISSION_DAYS; day++) {
      for (const mode of ['earth', 'space'] as const) {
        const all = [...assessCabin(cabinOn(day), mode), ...CREW.flatMap((c) => assessCrew(readingOn(c, day), c.baseline, cabinOn(day), mode))]
        for (const f of all) {
          expect(f.sourceIds.length).toBeGreaterThan(0)
          for (const id of f.sourceIds) expect(SOURCES[id], `${f.id} -> ${id}`).toBeDefined()
        }
      }
    }
  })
})
