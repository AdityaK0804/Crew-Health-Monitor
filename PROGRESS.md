# Progress

## Session 1 (2026-11-10)

### Done
- Research pass on every claim in brief section 7. Results in `RESEARCH_LOG.md`.
- Real NASA data downloaded: `data/osdr/OSD-569_CBC_TRANSFORMED.csv` (Inspiration4 blood counts, pre/post flight).
- App scaffold: Vite + React + TypeScript + Tailwind. `npm run dev`, `npm test`.
- `src/data/sources.ts`: one entry per threshold, each marked verified / partial / demo.
- `src/triage.ts`: Earth rules and space rules as pure functions. 14 unit tests pass.
- `src/data/simulatedCrew.ts`: replaces the old TS file. Old file and the Gemini notes are in `legacy/` (not used by the app).
- Screen 1 (dashboard): crew + cabin cards, mission-day slider, simulated badge, Earth/Space toggle, traffic lights, findings with reason, next step and source, disclaimer.

### Changes from the brief (and why)
- Added a **Cabin** card. CO2 and radiation belong to the cabin, not one person.
- Headline now counts **false alarms and missed concerns**. Earth rules also *miss* things (CO2 headaches), which is a stronger story than "Earth rules panic".
- Neck-vein stagnant flow stays amber in space mode. It is common in flight but 1 of 11 crew got a clot, so calling it "normal" would be wrong.
- Removed the drug list, all dosing text, IJV velocity trigger, ONSD 5.8/6.2 cut-offs, plasma-volume and bone-marker fields. None had a source.
- Radiation is tracked in mSv only (1.8 mSv/day, Curiosity cruise measurement). The old Gy/Sv mix is gone.
- Recharts not installed yet. Nothing on screen 1 needs a chart.

## Session 2 (2026-11-10)

### Done
- Full redesign of the dashboard (design mockup: https://claude.ai/artifact/EkFJhPvHUjkpnKuadr1fvE).
- Every signal now shows the Earth verdict and the space verdict side by side, a 30-day trend, and an expandable reason / next step / source.
- Mission timeline: flagged signals per day under both rule sets.
- `src/model.ts`: data layer. Crew check-ins are saved in the browser and re-checked by both rule sets.
- "Log a check-in" form, "Copy report for Earth" button.
- Emergency mode (`src/Emergency.tsx`): 7 steps, Space to advance, timer. Steps tagged "from guideline" or "demo only".

### Decisions made for the team (no specialist needed)
The earlier open questions are closed this way: any number we could not confirm in a paper is shown in the app as
"Demo parameter" or "exact number still to be re-checked". Nothing unconfirmed is presented as fact. If a mentor
or judge with a medical background offers a better number, change it in `THRESHOLDS` in `src/triage.ts`.

## Session 3 (2026-11-10)

### Done
- **Backend** (`server/index.ts`): API + SQLite database file (`data/crew-health.sqlite`). Stores check-ins, validates them,
  re-checks with both rule sets, keeps an activity log, serves a text report. Uses only what ships with Node 24, and imports
  the same `src/triage.ts` the screens use, so there is one copy of the rules. If the server is down the app saves on the device.
- **3D body view** (`src/BodyScan.tsx`, `src/body/sdf.ts`): male and female body built from 24,000 points, drag to turn.
  The region of each flagged signal glows amber or red (eyes, head, neck vein, heart and lungs, blood). Markers open the signal.
  It is a body-shaped guide, not an anatomical model with organs.
- **Redesign**: neutral interface where colour appears only when something needs attention. Own logo mark, Geist type,
  Phosphor icons, press feedback on every button, animated numbers, sliding selection, expanding rows, toast after saving,
  step transitions in Emergency. All motion switches off for people who ask for reduced motion.
- Cabin view: ring gauges for CO2 and radiation dose.

- **Real organs** (`public/anatomy/`, `src/body/anatomy.ts`): 16 organ meshes and the skin from BodyParts3D
  ((c) The Database Center for Life Science, CC BY 4.0, credit shown on screen). One adult male. Male crew use the real
  skin and organs. Female crew keep the generated body with the same organs fitted inside (approximate, labelled).
  The left neck vein is the right one mirrored, because the dataset has no left one. No spleen in the dataset.

- **Session 4:** body is now a smooth surface, no dots. Female crew use a real female body and organs (HRA 3D Reference
  Organs, Visible Human female, HuBMAP, CC BY 4.0); male crew use BodyParts3D. Credits show under the body. The female set
  has no neck vein mesh, so that marker sits on the neck without an organ. Body panel no longer moves when a signal opens.
  Database status label removed.
- **Known gaps before this is more than a demo** (see chat of 2026-11-10): no sign-in or roles, no device data feed,
  no label saying where each reading came from, no daily task view, emergency covers one scenario only.

## Session 5 (2026-11-11)

### Done
- **Sign-in and roles**, enforced on the server (`server/index.ts`, `src/data/users.ts`): crew see their own data, the medical
  officer sees everyone, the flight surgeon sees only what was sent to Earth. Demo accounts share PIN 2026.
- **Simulated device feed** (`src/model.ts`, `FEEDS`): wearable values arrive daily, ultrasound every 14 days, blood every 30.
  Every signal shows its source and age, and warns when it is getting old. The check-in form is now the manual fallback.
- **Today tab**: tasks worked out from the feed and the space rules, a free-text "how do you feel" note, messages from Earth,
  and a crew overview for the medical officer.
- **Earth link tab**: messages and health reports travel with the signal delay for the mission day (played 60x faster),
  with a countdown. Sign in as the flight surgeon in a second browser tab to answer from Earth.
- **Emergency**: three scenarios, a patient picker, a "sensors point here" hint, timed steps, and a saved record that is
  sent to Earth automatically.
- Layout: the three Crew health columns share one fixed height and scroll inside, so the body no longer slides over the timeline.
- Male body surface rebuilt with smooth shading (no speckle).

### Still not real
No real devices, no real identity system, no encryption, schedules and stale limits are demo values, emergency steps
marked "demo only" are our wording. The database keeps test messages from development; delete `data/crew-health.sqlite` to reset.

### How to run
`npm run dev` starts the API (port 8787) and the web app (port 5173) together. `npm test` runs the rule tests.

### Next
1. Paste the challenge page text into `CHALLENGE.md` and check scope against it.
2. Optional: find a licensed female anatomical model.
3. Deploy a demo link and rehearse the 3-minute demo.

## Session 6 (2026-11-11)
- Body view: wheel and pinch zoom, zoom buttons, Head / Chest / Body presets, system layers (heart and blood; brain, eyes, spine; organs). Opening a signal moves the camera to it.
- Spinal cord added for the female body and the spine for the male body. Neither free dataset has the small peripheral nerves.
- Signals panel: flagged signals first with a "Do this next" box and action buttons; normal signals compact.
- Earth link: fixed-height thread, long reports collapsed to a summary.
- Not taken from the outside suggestion list, because no source exists: kidney-stone and bone-loss numbers, shock index, jugular velocity cut-off, Muller maneuver.

## Session 7 (2026-11-11)
- Blood vessel trees on both bodies (male to wrists and ankles, female trunk only). No peripheral nerves exist in either free dataset.
- Two new signals with sources: urine output (kidney stone risk) and resistance exercise (bone loss). 16 rule tests.
- Ask tab: offline assistant with no AI model, answers only from readings, rules and emergency steps (`src/handbook.ts`).
- Browser fallback backend (`src/localBackend.ts`) so the app runs with no server.
- README rewritten with screenshots in `docs/`.
- Deployed: https://crew-health-monitor.vercel.app (static, uses the browser fallback).

## Session 8 (2026-11-11)
- Challenge page finally read. Scope check is in CHALLENGE.md.
- Added the indicators the challenge names: mood, blood pressure, temperature, blood sugar (ordinary Earth limits, labelled demo parameters). 18 rule tests.
- Each signal now explains the measurement and names its NASA hazard (`src/data/signalGuide.ts`).
- Demo link shows a banner saying it has no server. Sign-in screen states that everything is simulated.
- First load split: 3D view loads only when Crew health opens (main file 485 kB, was about 1 MB).
- 3D performance fixes, optional Gemini rewording (`api/reword.js`, off without a key).
- DEMO_SCRIPT.md added.

## Session 9 (2026-11-11)
- Reviewed outside feedback (Sonnet, Gemini). Applied Sonnet's patch: white cells, vitamin D and body mass signals, and image attachment on check-ins.
- Replaced guessed white cell ranges with the real lab ranges and pre-flight values from NASA OSD-569.
- Added body markers, Ask words and tests for the new signals (21 rule tests).
- Trend chart: up to three signals since launch, under the crew health screen.
- Verdict chips now say Earth or Space on each chip. Normal body markers are easier to see. Roles no longer cut off.
- 3D body shows a loading message and a failure message. Rewording endpoint is rate limited.
- Not done: mission selector (ISS / Moon / Mars), images sent to Earth.
- ADNI brain scans (Alzheimer's study) were offered as data. Not used: wrong population, and its licence does not allow republishing.

## Session 10 (2026-11-11)
- Mission setting: space station, Moon surface, Mars transit (`src/data/missions.ts`, `src/MissionMenu.tsx`). Changes the Earth link delay and the radiation rate, each with a source. 23 rule tests.
- Custom setting menu instead of the browser dropdown. Header kept to one row.

## Session 11 (2026-11-11)
- Station radiation rate now rests on three peer-reviewed measurements; the Moon rate is confirmed as the only surface measurement. Station delay sourced to NASA.
- Moon gravity: the simulation applies 60% of the weightless fluid shift (demo parameter from a partial-gravity study), and gravity-related signals carry a note on the Moon. 24 rule tests.

## Session 12 (2026-11-13)
- Read the challenge's required resources (NASA hazards, risks, ongoing research; two Canadian Space Agency pages).
- Every signal now links to its official NASA risk, and names the matching current NASA study where one exists (`NASA_RISK`, `NASA_STUDY` in `src/data/signalGuide.ts`).
- Bone loss source upgraded to NASA's own page. Four facts from the resources added to the explanations. 25 rule tests.
