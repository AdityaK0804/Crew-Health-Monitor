# Crew Health Monitor: full project context for slide generation

> **To the AI reading this:** this file is everything you need to know about our project. Use it to design and generate presentation slides, one finished 16:9 image (1920x1080) per slide. Use only the facts written here and do not invent numbers, features, studies or team details. If something is not in this file, leave it out. Copy wording and numbers exactly.

---

## 1. Basics

| | |
|---|---|
| Project name | **Crew Health Monitor** |
| Tagline | **Health monitoring for a crew that cannot call a doctor.** |
| Second tagline (closing) | **Earth rules for Earth. Space rules for space.** |
| Event | NASA Space Apps Challenge 2026 |
| Challenge | **Create Health Monitoring Software for Astronauts on Space Missions** (difficulty: Intermediate) |
| Team name | [TEAM NAME] |
| Team members | [Member 1], [Member 2], [Member 3], [Member 4] |
| Live demo | crew-health-monitor.vercel.app (choose a person to enter, no password) |
| Code | github.com/AdityaK0804/Crew-Health-Monitor |
| What it is | A working web prototype (software). Not hardware. |
| Honesty line (must appear somewhere) | Every person and every reading is simulated. Educational prototype, not a medical device, not clinically validated. |

Our app's mark is our own heartbeat-line logo. **It is not a NASA logo. Never put a NASA logo on any slide.**

---

## 2. What the challenge asks for

NASA asked for software that:
- gathers astronaut health indicators and helps astronauts evaluate and act on their own health,
- gives a visual tool for self-assessment (their example is a human figure where each body part is clickable and shows its status),
- gives guidance on what to do,
- takes input by keyboard, mouse or other means,
- covers indicators such as blood pressure, heart rate, blood sugar, body temperature, sleep hours and mood,
- explains which measurements can be done in space, how spaceflight hazards affect them, when results need attention, and what prevents a critical condition.

Optional ideas they listed: different environments (station, surface base), prompting routine measurements, charts over time, colour coding, and not assuming astronauts know how to assess their health.

**We cover all required points.** We chose not to add gamification, because points and streaks would reward hiding symptoms.

---

## 3. The problem (why this matters)

1. **Help is too far away.** On a Mars mission a message to Earth takes up to **22 minutes one way**. A question and its answer take about **44 minutes**. There may be no doctor on board.
2. **The body changes in space.** NASA reports about **70%** of International Space Station astronauts show some swelling at the back of the eye. Astronauts lose **1 to 1.5% of hip and spine bone per month** (NASA Human Research Program).
3. **Earth's normal lab ranges fail in space, in two ways:**

| Reading | What happens in space | Earth rule says | Space rule says |
|---|---|---|---|
| Hematocrit rises 10–12% | Expected: blood plasma volume drops in weightlessness | Check (looks like dehydration). **False alarm** | Normal |
| Cabin CO₂ under Earth workplace limits | Still gives crews headaches; on the ISS each extra 1 mmHg doubled the odds | Normal. **Missed** | Check |
| 1.6 litres of urine a day | Bones shed calcium into urine; NASA wants 2 L/day to prevent kidney stones | Normal. **Missed** | Check |

**Key insight:** a crew far from help doesn't need more alarms. It needs the right rules for where it is.

Sources for this section: NASA Human Research Program risk pages, Kunz 2017, Law 2014, NASA renal stone studies.

---

## 4. Our solution

**One set of data, two sets of rules.** Every reading is checked by:
- **Earth-standard rules**, the ordinary lab reference ranges, and
- **Space-adapted rules**, thresholds from published spaceflight studies, each linked on screen.

Both verdicts are shown side by side, so the crew sees where Earth rules would mislead them.

| | Earth-standard rules | Space-adapted rules |
|---|---|---|
| Normal spaceflight change | False alarm | Explained as expected |
| Concern that only matters in space | Missed | Flagged, with what to do next |
| Where the rule comes from | Lab reference range | A published spaceflight source, linked on screen |

Any threshold without a published source is labelled **"Demo parameter"** on screen. Nothing unconfirmed is shown as fact.

**How it works:**
1. **Input:** daily check-in (keyboard, mouse or touch), a free-text note, a simulated wearable/device feed, and an optional photo or ultrasound image.
2. **Rule engine:** runs inside the browser and needs no internet. Earth rules and space rules check the same reading.
3. **Output:** a 3D human body where the problem area glows, a "Do this next" instruction in plain words, then the reason, the Earth and space verdicts, how the measurement is taken, the NASA risk it belongs to, and the source.

Status levels: **Normal / Check / Urgent**. Colour is used only where attention is needed.

**Why rules and not an AI/ML prediction model (a deliberate choice):**
- **No data to learn from.** Day-by-day in-flight astronaut vitals are not public. A model trained on invented data would only learn our invention.
- **It must run on board.** A spacecraft can't wait 40 minutes for a cloud service.
- **Every flag can be checked.** Each flag shows its reason and source. A model's score can't be audited the same way.

Key numbers: **15 signals** · **5 NASA hazards** tagged · **3 mission settings** · **0 internet connection needed**.

---

## 5. Features (what the app actually does)

**Crew health (main screen).** A 3D human body built from real anatomical models (male and female). The body part behind each flagged signal glows, and opening the signal moves the camera there. Body systems can be switched: all, heart and blood, brain eyes and spine, organs. Zoom by scroll or pinch.

**Signals (15).** 13 crew signals and 2 cabin signals, each tagged with one of NASA's five hazards:
hematocrit · optic nerve sheath (eye ultrasound) · neck vein blood flow · headache with cabin CO₂ · urine output (kidney stones) · white blood cells and lymphocytes (immune) · vitamin D (nutrition) · resistance exercise (bone loss) · cabin CO₂ · radiation dose · sleep · oxygen level and heart rate · mood · body mass (food intake) · blood pressure, temperature and blood sugar.

**Example case (good for slides):** crew member A. Rivera, flight engineer, day 60 of a Mars transit. His left neck vein blood flow has stalled. The app says: *"Do this next: Repeat the ultrasound and look for a clot. Report at next Earth contact."* Context: this was common in one ISS study (6 of 11 crew), and 1 of those 11 developed a clot. Worth watching, not an emergency.

**Today.** What the crew member must do today: exams that are due or getting old, signals to re-check, a note in their own words, and messages from Earth. The medical officer also sees the whole crew.

**Trends since launch.** Chart of up to three signals over the whole mission, against that person's pre-flight value.

**Earth link.** Messages and health reports travel with the real signal delay for that mission day, shown with a countdown (for example 16 minutes each way on day 60).

**Ask the handbook.** An assistant with no AI model and no connection. It answers only from today's readings, the rules and the emergency steps, shows the source, and says "I don't have that" when it doesn't know. It can't invent medical advice.

**Emergency.** Step-by-step walkthroughs with large controls (for example "Crew member collapsed" → "Start chest compressions now"). Each step is marked as from a published source or as demo wording. The run is timed, saved and sent to Earth.

**Mission setting:**

| Setting | One-way delay to Earth | Radiation per day | Gravity |
|---|---|---|---|
| Space station | under 1 second | 0.73 mSv (ISS measurements) | Weightless |
| Moon surface | 1.3 seconds | 1.37 mSv (Chang'E-4 lander) | One sixth of Earth |
| Mars transit | 4 to 22 minutes | 1.8 mSv (Curiosity, measured in cruise) | Weightless |

**Image attachment.** A photo or ultrasound can be attached to a check-in and is shown with the eye signal. It is not analysed.

**Roles and privacy:**

| Role | Sees |
|---|---|
| Crew member | Only their own health data |
| Crew medical officer | Every crew member |
| Flight surgeon on Earth | Only what the crew sent, after the delay |

---

## 6. How a user moves through it (user journey)

1. **Enter:** choose your name (crew, medical officer or flight surgeon). One click, no password in the demo.
2. **See today:** what to measure, what to re-check, messages from Earth.
3. **Log a check-in:** type readings, add a note, attach a photo or ultrasound.
4. **Find the problem:** the affected body part glows on the 3D body. Tap it and the camera flies there.
5. **Act on it:** read "Do this next", then why, then how to measure, then the source.
6. **Report to Earth:** send a report and watch the delay countdown. Emergency is one tap away at any time.

Design principles: plain words first, colour only means attention, old readings are flagged for re-measuring, and no medical training is assumed.

---

## 7. NASA and partner data used

| Resource | How it is used |
|---|---|
| **NASA Open Science Data Repository, dataset OSD-569** (Inspiration4 complete blood count) | Lab ranges for white cells (3.8–10.8) and lymphocytes (0.85–3.9) ×1000/µL, and the pre-flight blood values each simulated crew member starts from |
| **NASA Human Research Program: five hazards of spaceflight** (radiation, isolation and confinement, distance from Earth, gravity changes, hostile and closed environments) | Every signal is tagged with its hazard |
| **NASA HRP: risks of human spaceflight** | Every signal links to its official NASA risk page (SANS/eye, bone, food and nutrition, immune, sleep, behaviour, cardiovascular, radiation). Facts used: 1–1.5% bone lost a month, ~70% of station astronauts with eye swelling |
| **NASA HRP: ongoing research** | Signals name the current NASA study on the same question: Venous Haemostasis (neck vein), Thigh Cuff (eyes), ARCHeR (sleep), Immune Biomarkers (white cells), Zero T2 (exercise) |
| **Canadian Space Agency: monitoring radiation** | Radiation explanation notes neutrons are about 30% of the dose on the station |
| **Canadian Space Agency: why science in space** | Mission settings follow its list of deep-space challenges: more weightlessness, more radiation, longer isolation, longer delays, less help from Earth |
| Published spaceflight radiation measurements | ISS (0.73 mSv/day), Chang'E-4 on the Moon (1.37 mSv/day), Curiosity in Mars cruise (1.8 mSv/day) |
| Anatomy models | BodyParts3D (Database Center for Life Science) and HRA 3D Reference Organs (HuBMAP), CC BY 4.0 |

**Technology:** React, TypeScript, Vite, Tailwind, Motion, three.js (3D body). Backend: Node.js with built-in SQLite. The same rule file is used by the screens and the server. It is tested.

---

## 8. Real versus simulated (be honest on slides)

| Real | Simulated |
|---|---|
| The published sources behind each rule | The crew and their accounts |
| Lab ranges and pre-flight blood values (NASA OSD-569) | Every day-by-day reading |
| Radiation rates measured on the ISS, Moon and way to Mars | The device feed |
| The organ and body models | Emergency steps marked "demo only" |

**Current limits:** images are stored but not analysed; some thresholds are demo parameters; the Moon fluid-shift effect (60%) is an assumption, since no long stay in Moon gravity has been measured; the public demo link has no server, so roles there are for show.

---

## 9. Impact and future

**In space:** fewer false alarms, so real alerts are trusted. Space-only risks are caught early (CO₂ headaches, kidney stones, neck vein clots, eye swelling). The crew can act in minutes, not after a 44-minute round trip.

**On Earth:** the same idea helps anywhere a non-doctor must decide before help arrives, such as polar and research stations, ships and submarines, and remote clinics.

**Roadmap:**
- **Now:** working prototype with 15 signals, 2 rule sets, 3 mission settings and an offline handbook.
- **Phase 1:** real devices (wearables and exam devices) replace the simulated feed.
- **Phase 2:** secure by design, with the agency's own sign-in, encryption at rest and in transit, and images sent to Earth.
- **Phase 3:** clinical validation, where flight surgeons confirm every threshold and it is tested in analog missions.
- **Phase 4:** Moon and Mars data, then remote-care settings on Earth.

---

## 10. What the real app looks like (for drawing screens)

If you draw the app's screens, match this:
- **Dark UI:** near-black background (#0B0B0D), dark grey panels, off-white text, and **one accent colour, amber (#F5A524)**, used only for things that need attention. Urgent is red, and the Emergency button is red.
- **Top bar:** heartbeat logo, tabs "Today", "Crew health", "Earth link", "Ask", a "SIMULATED DATA" label, "Setting: Mars transit", "Day 60 / 90", buttons "Log check-in" and a red "Emergency".
- **Crew health screen:** left column lists crew (E. Vance, Commander; M. Chen, Crew medical officer; S. Jenkins, Science specialist; A. Rivera, Flight engineer; Cabin) with a toggle "Earth-standard / Space-adapted". In the centre, a translucent grey-blue X-ray-style 3D human torso and head with a glowing amber dot on the neck labelled "Neck vein". The right column shows the signal card with an amber "Do this next" box, then two boxes "Earth rules: Check" and "Space rules: Check", then "About this measurement".
- Clean, modern, Linear/Vercel-like. Not cartoonish.

---

## 11. Slide design direction

**Wanted:** rich illustrated infographic slides like a winning consulting or hackathon deck, with each slide a single finished image. Large detailed illustrations carry the story: semi-realistic 3D renders of astronauts, spacecraft interiors, the ISS, the Moon, Mars, Earth, a translucent human body with glowing organs, an ultrasound probe, blood sample tubes, wearables, a CO₂ sensor, bones, eyes, kidneys, radiation particles. Data appears as real charts, diagrams, flows, timelines and big numbers.

**Palette:** deep space navy #0E1B3D, indigo #26357A, one Mars amber/orange #F5A524 for emphasis, teal only for "normal", and white or very light cool grey (#F3F5FA) for content areas. Cover slide can be a full dark space scene.

**Typography:** clean modern sans-serif (Inter or Geist style). Heavy navy titles with one key phrase in amber. Numbers bold. Text sharp and readable.

**Avoid:** pill-shaped labels, tag chips, rounded badge bubbles, emoji, stickers, cartoon icons in tinted squares, glassmorphism, glow blobs, stock photos of people at laptops, walls of bullet points, NASA logos, and any number not in this file.

---

## 12. Suggested 7-slide structure

| # | Slide | Core message | Visual idea |
|---|---|---|---|
| 1 | Title & Team | Crew Health Monitor: health monitoring for a crew that cannot call a doctor | Astronaut in a spacecraft cabin, Mars in the window, holographic body glowing at the neck; title, challenge name, team name, members |
| 2 | Problem & Inspiration | Help is too far away, and Earth rules mislead in space | Earth-to-Mars signal line "22 min"; three scenes: blood tube (hematocrit false alarm), CO₂ sensor plus headache (missed), kidney with stone (missed); facts 70% eye swelling, 1–1.5% bone/month |
| 3 | Proposed Solution | One set of data, two sets of rules | Flow: astronaut devices → split into an Earth lane and a Space lane → 3D body with glowing neck and "Do this next"; plus "Why rules, not AI" and the 15 / 5 / 3 / 0 numbers |
| 4 | Demo & Visuals | It works today | Laptop showing the crew health screen with annotations; smaller screens for Today, Earth link, Emergency |
| 5 | User Experience | A crew member's day in 6 steps | Curved trajectory path with 6 astronaut scenes (Enter → Today → Check-in → Find → Act → Report to Earth); roles, Ask, Emergency |
| 6 | NASA & Partner Data | Every rule points to a source | ISS in orbit with lines to the 6 sources (OSD-569, Five Hazards, Human Risks, Ongoing Research, CSA radiation, CSA science); radiation bar chart 0.73 / 1.37 / 1.8 mSv/day; tech wordmarks |
| 7 | Impact & Future | Earth rules for Earth. Space rules for space. | Space and Earth scenes (Mars transit; Antarctic station, submarine, remote clinic); roadmap as a rocket arc Now → Phase 4; demo link, GitHub, "Thank you." |

Every slide gets a small grey footer with its sources and the slide number. Put "Simulated data. Not a medical device." on the cover and the last slide.

---

## 13. One-paragraph summary (for quick context)

Crew Health Monitor is a web prototype for NASA Space Apps 2026 that helps astronauts without an onboard doctor judge their own health. Lab ranges written for Earth both raise false alarms in space (hematocrit rising 10–12% is normal in weightlessness) and miss space-only risks (CO₂ headaches, kidney stones). So the app checks every reading with two rule sets, Earth-standard and space-adapted, and shows both verdicts side by side, each rule linked to a published spaceflight source. A 3D anatomical body shows where the problem is, and each flag says in plain words what to do next. It runs offline, models the real Earth-communication delay for station, Moon and Mars missions, includes an offline handbook and timed emergency steps, and uses NASA OSDR data and NASA and CSA research resources. All crew and readings are simulated. It is a concept demonstrator, not a medical device.
