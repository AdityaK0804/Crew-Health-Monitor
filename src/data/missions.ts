// Mission settings. Switching the setting changes two things only: how long a message
// takes to reach Earth, and how fast radiation dose builds up. The simulated crew readings
// are the same in every setting.

import { delayMinutes } from './users.ts'

export type MissionId = 'iss' | 'moon' | 'mars'

export interface Mission {
  id: MissionId
  name: string
  /** Completes "expected ...", for example "on the way to Mars". */
  setting: string
  /** Dose equivalent per day, mSv. */
  radiationMSvDay: number
  /** Id in sources.ts for the radiation rate. */
  radSourceId: string
  /** Gravity as a share of Earth's. */
  gravity: number
  /**
   * How much of the weightless "fluid moves toward the head" effect the simulation applies.
   * 1 in weightlessness. For the Moon this is a demo parameter, see GRAVITY_PARTIAL in sources.ts.
   */
  fluidShift: number
  /** Where the delay figure comes from. */
  delaySource: { label: string; url?: string }
  note: string
}

export const MISSIONS: Record<MissionId, Mission> = {
  iss: {
    id: 'iss',
    name: 'Space station',
    setting: 'on the International Space Station',
    radiationMSvDay: 0.73,
    radSourceId: 'RAD_ISS',
    gravity: 0,
    fluidShift: 1,
    delaySource: { label: 'NASA: station link has less than a one-second delay', url: 'https://www.nasa.gov/missions/station/data-rate-increase-on-the-international-space-station-supports-future-exploration/' },
    note: 'Low Earth orbit. Contact with flight surgeons is close to live, so the crew is rarely alone with a decision.',
  },
  moon: {
    id: 'moon',
    name: 'Moon surface',
    setting: "on the Moon's surface",
    radiationMSvDay: 1.37,
    radSourceId: 'RAD_MOON',
    gravity: 0.17,
    fluidShift: 0.6,
    delaySource: { label: 'Distance to the Moon (about 384,400 km) divided by the speed of light' },
    note: 'A message takes just over a second each way. A conversation with Earth is possible, with a noticeable pause.',
  },
  mars: {
    id: 'mars',
    name: 'Mars transit',
    setting: 'on the way to Mars',
    radiationMSvDay: 1.8,
    radSourceId: 'RAD_RATE',
    gravity: 0,
    fluidShift: 1,
    delaySource: { label: 'Distance to Mars divided by the speed of light, about 3 to 22 minutes' },
    note: 'The delay grows as the ship leaves Earth. No live conversation is possible, so the crew must act on their own first.',
  },
}

export const isMission = (v: unknown): v is MissionId => v === 'iss' || v === 'moon' || v === 'mars'

export interface LinkDelay {
  /** Real one-way delay in minutes (a fraction for the station and the Moon). */
  minutes: number
  /** How long the demo waits before a message arrives. */
  demoMs: number
  /** True when the demo plays the delay faster than real life. */
  compressed: boolean
  /** For example "16 minutes" or "1.3 seconds". */
  text: string
}

/** One-way signal delay. Moon: distance divided by the speed of light. Station: relay delay, under a second. */
export function linkDelay(mission: MissionId, day: number): LinkDelay {
  if (mission === 'mars') {
    const minutes = delayMinutes(day)
    // One minute of real delay is played as one second.
    return { minutes, demoMs: minutes * 1000, compressed: true, text: `${minutes} minutes` }
  }
  if (mission === 'moon') return { minutes: 1.3 / 60, demoMs: 1300, compressed: false, text: '1.3 seconds' }
  return { minutes: 0.5 / 60, demoMs: 500, compressed: false, text: 'under 1 second' }
}

/** Shows a stored delay (in minutes) the way a person would say it. */
export function sayDelay(minutes: number): string {
  if (minutes >= 1) return `${Math.round(minutes)} min`
  const s = minutes * 60
  return s < 1 ? 'under 1 s' : `${s.toFixed(1)} s`
}
