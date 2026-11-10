// Emergency walkthroughs. Every step says where it comes from:
//   a source  = taken from that published source
//   no source = "demo only", our own wording for the prototype, not medical guidance.

export interface EmergencyStep {
  title: string
  detail: string
  /** Published source for this step. Leave out for demo-only steps. */
  source?: { label: string; url: string }
}

export interface Scenario {
  id: string
  title: string
  summary: string
  /** Suggest this scenario when this signal is flagged by the sensors. */
  suggestWhen?: { findingId: string; level: 'amber' | 'red' }
  steps: EmergencyStep[]
}

const CPR = { label: '2020 guideline for CPR in microgravity', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7607644' }
const CLOT_CASE = {
  label: 'Clot found in flight, N Engl J Med 2020',
  url: 'https://www.lsuhsc.edu/newsroom/1ST%20Reported%20Occurrence%20and%20Treatment%20of%20Spaceflight%20Medical%20Risk.html',
}
const CO2_LIMIT = { label: 'NASA technical brief on cabin CO2', url: 'https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-004-carbon-dioxide.pdf' }
const CO2_HEADACHE = { label: 'ISS CO2 and headache study, 2014', url: 'https://sciencedaily.com/releases/2014/05/140501100922.htm' }

export const SCENARIOS: Scenario[] = [
  {
    id: 'collapse',
    title: 'Crew member collapsed',
    summary: 'Not responding, not breathing normally.',
    suggestWhen: { findingId: 'vitals', level: 'red' },
    steps: [
      { title: 'Check for a response', detail: 'Shake the shoulders and shout. Look for normal breathing for no more than 10 seconds.', source: CPR },
      { title: 'Call the whole crew', detail: 'One person brings the defibrillator and the medical kit. One person gets the restraint system ready.' },
      {
        title: 'Start chest compressions now',
        detail: "Do not wait to move the patient. Use the Evetts-Russomano method: wrap your legs around the patient's body and press on the centre of the chest, hard and fast.",
        source: CPR,
      },
      {
        title: 'Strap the patient to the restraint system',
        detail: 'Once the patient is strapped down, switch to the handstand method: feet on the opposite wall, arms straight on the chest, push with your legs.',
        source: CPR,
      },
      { title: 'Attach the defibrillator', detail: 'Stick the pads on the bare chest and follow its voice instructions. Nobody touches the patient during a shock.', source: CPR },
      {
        title: 'Airway only with two rescuers',
        detail: 'Manage the airway only when the patient is strapped down and at least two rescuers are present. Use the airway device you were trained on.',
        source: CPR,
      },
      { title: 'Swap rescuers every 2 minutes', detail: 'Keep going until the patient recovers. Do not wait for Earth: a reply takes many minutes.' },
    ],
  },
  {
    id: 'clot',
    title: 'Possible clot in a neck vein',
    summary: 'Seen on ultrasound, with or without symptoms.',
    suggestWhen: { findingId: 'ijv', level: 'red' },
    steps: [
      { title: 'Stay calm, this is not a race', detail: 'The one clot found in flight so far caused no symptoms and was found on a routine ultrasound.', source: CLOT_CASE },
      { title: 'Repeat the ultrasound', detail: 'Scan both sides of the neck. Save still images and a short clip of the vein.' },
      { title: 'Check for symptoms', detail: 'Ask about neck or face swelling, headache and pain. Write down what you find.' },
      { title: 'Send images and findings to Earth', detail: 'Use the Earth link. Say when the scan was done and who did it.' },
      {
        title: 'Do not start medication on your own',
        detail: 'In the known case, doctors on Earth chose the treatment and adjusted it over weeks. Wait for their plan.',
        source: CLOT_CASE,
      },
      { title: 'Rest until Earth replies', detail: 'No hard exercise and no spacewalk preparation until the flight surgeon answers.' },
    ],
  },
  {
    id: 'co2',
    title: 'Headache with high cabin CO2',
    summary: 'One or more crew with headache while CO2 is raised.',
    suggestWhen: { findingId: 'headache', level: 'amber' },
    steps: [
      { title: 'Read the cabin CO2 value', detail: "NASA's limit is 3 mmHg as a 1-hour average. Crews report headaches at lower levels than on Earth.", source: CO2_LIMIT },
      { title: 'Move to moving air', detail: 'Go to a spot with a working fan. In weightlessness, breathed-out air can stay around your head when the air is still.' },
      { title: 'Check the CO2 scrubber', detail: 'Look for a full or failed unit and follow its service steps.' },
      {
        title: 'Ask everyone about symptoms',
        detail: 'On the ISS, each extra 1 mmHg of CO2 doubled the odds of a headache. More than one person affected points to the cabin.',
        source: CO2_HEADACHE,
      },
      { title: 'Log it and tell Earth', detail: 'Record who has symptoms and the CO2 value. Send it at the next contact.' },
    ],
  },
]
