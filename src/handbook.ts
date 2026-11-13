// "Ask" assistant with NO AI model. It only answers from what the app already knows:
// today's findings, the rule sources, and the emergency steps. It cannot invent an answer.
// If nothing matches, it says so. Works with no network.

import { SCENARIOS } from './data/emergency.ts'
import { GUIDE, NASA_RISK } from './data/signalGuide.ts'
import { SOURCES } from './data/sources.ts'
import { MISSIONS, linkDelay, type MissionId } from './data/missions.ts'
import type { Subject } from './model.ts'

export interface Answer {
  title: string
  lines: string[]
  sources: { label: string; url?: string }[]
}

interface Entry {
  keys: string[]
  build: () => Answer
}

/** Everyday words people use for each signal. */
const WORDS: Record<string, string[]> = {
  hematocrit: ['hematocrit', 'blood', 'red', 'cells', 'dehydrated', 'dehydration', 'plasma'],
  onsd: ['eye', 'eyes', 'vision', 'sight', 'blurry', 'optic', 'nerve', 'sans'],
  ijv: ['neck', 'vein', 'jugular', 'clot', 'thrombosis', 'flow', 'stagnant'],
  headache: ['headache', 'head', 'migraine', 'pain'],
  sleep: ['sleep', 'tired', 'rest', 'insomnia', 'fatigue'],
  vitals: ['heart', 'pulse', 'oxygen', 'spo2', 'breathing', 'rate'],
  urine: ['urine', 'kidney', 'kidneys', 'stone', 'stones', 'drink', 'water', 'fluid', 'hydration', 'pee'],
  exercise: ['exercise', 'bone', 'bones', 'muscle', 'workout', 'training', 'resistance', 'strength'],
  mood: ['mood', 'sad', 'lonely', 'stress', 'stressed', 'depressed', 'anxious', 'feeling', 'mental'],
  basics: ['pressure', 'temperature', 'fever', 'sugar', 'glucose', 'bp'],
  immune: ['immune', 'white', 'cells', 'lymphocytes', 'infection', 'wbc', 'rash'],
  vitd: ['vitamin', 'sunlight', 'supplement', 'nutrition'],
  bodymass: ['weight', 'mass', 'eating', 'food', 'diet', 'appetite', 'nutrition'],
  co2: ['co2', 'carbon', 'dioxide', 'air', 'cabin', 'scrubber', 'stuffy'],
  radiation: ['radiation', 'dose', 'cosmic', 'solar', 'storm', 'msv'],
}

const STOP = new Set('a an the is are was am i my me you your we our it its of to in on for and or do does did what why how when should can could would about with this that have has be been not no any there here'.split(' '))
export const tokens = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w))

function entries(subjects: Subject[], meId: string, day: number, mission: MissionId): Entry[] {
  const list: Entry[] = []
  for (const s of subjects) {
    for (const space of s.space) {
      const earth = s.earth.find((f) => f.id === space.id) ?? space
      const who = s.id === meId ? 'You' : s.name
      list.push({
        keys: [...(WORDS[space.id] ?? []), ...tokens(s.name), ...(s.id === meId ? ['me', 'mine', 'myself'] : [])],
        build: () => ({
          title: `${space.title}: ${who === 'You' ? 'yours' : s.name}`,
          lines: [
            `Reading: ${space.measured}.`,
            `Space rules: ${space.level === 'green' ? 'normal' : space.level === 'amber' ? 'needs a check' : 'urgent'}. ${space.why}`,
            `Earth rules: ${earth.level === 'green' ? 'normal' : 'flagged'}. ${earth.why}`,
            `Next: ${space.next}`,
            ...(GUIDE[space.id] ? [`How it is measured: ${GUIDE[space.id].how}`] : []),
            ...(NASA_RISK[space.id] ? [`NASA lists this under: Risk of ${NASA_RISK[space.id].name}.`] : []),
          ],
          sources: [
            ...space.sourceIds.map((id) => ({ label: SOURCES[id].status === 'demo' ? 'Demo parameter, no published source' : SOURCES[id].title, url: SOURCES[id].url })),
            ...(NASA_RISK[space.id] ? [{ label: `NASA risk page: ${NASA_RISK[space.id].name}`, url: NASA_RISK[space.id].url }] : []),
          ],
        }),
      })
    }
  }
  for (const sc of SCENARIOS) {
    list.push({
      keys: [...tokens(sc.title), ...tokens(sc.summary), 'emergency', 'steps', ...(sc.id === 'collapse' ? ['cpr', 'unconscious', 'collapsed', 'breathing', 'resuscitation'] : [])],
      build: () => ({
        title: `Emergency steps: ${sc.title}`,
        lines: [...sc.steps.map((st, i) => `${i + 1}. ${st.title}${st.source ? '' : ' (demo wording)'}`), 'Open Emergency for the timed walkthrough.'],
        sources: [...new Map(sc.steps.flatMap((st) => (st.source ? [[st.source.url, st.source] as const] : []))).values()],
      }),
    })
  }
  const link = linkDelay(mission, day)
  list.push(
    {
      keys: ['earth', 'message', 'reply', 'answer', 'delay', 'long', 'wait', 'contact', 'surgeon', 'doctor'],
      build: () => ({
        title: 'Talking to Earth',
        lines: [`In this setting (${MISSIONS[mission].name}) a message takes ${link.text} each way.`, MISSIONS[mission].note, 'In an emergency, act first and report after.'],
        sources: [],
      }),
    },
    {
      keys: ['private', 'privacy', 'see', 'who', 'data', 'access', 'share'],
      build: () => ({
        title: 'Who can see your data',
        lines: ['You see your own health data.', "The crew medical officer sees everyone's.", 'The flight surgeon on Earth sees only what the crew sends.'],
        sources: [],
      }),
    },
    {
      keys: ['difference', 'earth', 'space', 'rules', 'rule', 'false', 'alarm', 'standard', 'adapted'],
      build: () => ({
        title: 'Earth rules and space rules',
        lines: [
          'Earth rules use normal ranges from people on the ground. In flight they raise false alarms on expected changes and miss concerns that only matter in space.',
          'Space rules compare you with your own pre-flight values and with what is known from past missions. Every rule shows its source.',
        ],
        sources: [],
      }),
    },
    {
      keys: ['real', 'simulated', 'fake', 'data', 'true', 'trust'],
      build: () => ({
        title: 'Is this data real?',
        lines: ['No. The crew and every reading are simulated. The rules come from published sources, and thresholds without a source are labelled "Demo parameter".'],
        sources: [],
      }),
    },
  )
  return list
}

/** Best matching answers for a question. Empty when nothing matches well enough. */
export function ask(question: string, subjects: Subject[], meId: string, day: number, mission: MissionId = 'mars'): Answer[] {
  const q = new Set(tokens(question))
  if (q.size === 0) return []
  const namesAsked = subjects.filter((s) => tokens(s.name).some((t) => q.has(t))).map((s) => s.id)
  const scored = entries(subjects, meId, day, mission)
    .map((e, i) => ({ e, i, score: [...new Set(e.keys)].filter((k) => q.has(k)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.i - b.i)
  if (scored.length === 0) return []
  const top = scored[0].score
  const best = scored.filter((x) => x.score === top).map((x) => x.e.build())
  // "my" questions with no name: prefer the asker's own signals over other people's.
  const mine = namesAsked.length === 0 ? best.filter((a) => a.title.endsWith(': yours')) : []
  return (mine.length > 0 ? mine : best).slice(0, 2)
}

export const SUGGESTED = ['Why is my hematocrit different on Earth rules?', 'What should I do about a headache?', 'Am I at risk of kidney stones?', 'How long until Earth answers?', 'What are the steps if someone collapses?']
