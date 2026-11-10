// Plain-language guide for each signal: what it is, why it matters in space, how it is taken.
// The challenge asks us not to assume astronauts know how to assess their health.
// "hazard" is one of NASA's five hazards of human spaceflight.

export type Hazard = 'Space radiation' | 'Isolation and confinement' | 'Distance from Earth' | 'Gravity changes' | 'Closed environment'

export interface Guide {
  hazard: Hazard
  what: string
  how: string
}

export const GUIDE: Record<string, Guide> = {
  hematocrit: {
    hazard: 'Gravity changes',
    what: 'The share of your blood made up of red cells. In weightlessness fluid moves toward the head and the body sheds plasma, so this share goes up.',
    how: 'A finger-prick or small blood sample in the onboard blood analyser.',
  },
  onsd: {
    hazard: 'Gravity changes',
    what: 'The width of the sleeve around the nerve behind your eye. Fluid moving toward the head can change the eye and vision on long flights.',
    how: 'An ultrasound probe held gently on the closed eyelid, with gel. A crewmate can help.',
  },
  ijv: {
    hazard: 'Gravity changes',
    what: 'How blood drains from the head through the large vein in the neck. Without gravity pulling blood down, flow can slow or stall.',
    how: 'An ultrasound probe on the left side of the neck.',
  },
  headache: {
    hazard: 'Closed environment',
    what: 'A headache you report yourself. In a sealed cabin, carbon dioxide from breathing can build up and cause it.',
    how: 'Tick it in your daily check-in, or write it in "How do you feel?".',
  },
  sleep: {
    hazard: 'Isolation and confinement',
    what: 'Your average sleep over the last week. Noise, workload and the lack of a normal day and night make sleep harder in space.',
    how: 'Measured by the wearable sensor. Nothing to do.',
  },
  vitals: {
    hazard: 'Gravity changes',
    what: 'Oxygen level in your blood and your resting heart rate.',
    how: 'Measured by the wearable sensor. Nothing to do.',
  },
  urine: {
    hazard: 'Gravity changes',
    what: 'How much urine you pass in a day. Bones lose calcium in weightlessness, and it leaves through the urine, where it can form kidney stones if the urine is concentrated.',
    how: 'Log the volume from the collection device once a day.',
  },
  exercise: {
    hazard: 'Gravity changes',
    what: 'How often you do resistance exercise. Bones and muscles weaken when they carry no load.',
    how: 'Counted by the exercise device. Nothing to do.',
  },
  mood: {
    hazard: 'Isolation and confinement',
    what: 'How you rate your own mood, averaged over the last week. Months in a small space far from home wear on anyone.',
    how: 'Rate your mood from 1 (very low) to 5 (very good) in the check-in.',
  },
  basics: {
    hazard: 'Distance from Earth',
    what: 'Blood pressure, body temperature and blood sugar: the basic checks a doctor would do first. With no doctor nearby, you do them yourself.',
    how: 'Arm cuff for blood pressure, thermometer for temperature, finger-prick meter for blood sugar.',
  },
  co2: {
    hazard: 'Closed environment',
    what: 'Carbon dioxide in the cabin air. Everyone breathes it out and machines must remove it.',
    how: 'Measured by the cabin sensors. Nothing to do.',
  },
  radiation: {
    hazard: 'Space radiation',
    what: 'The radiation dose you have received since launch. Outside Earth\'s magnetic shield the dose is much higher.',
    how: 'Measured by the cabin dosimeter. Nothing to do.',
  },
}
