# ChatGPT image prompts: Crew Health Monitor deck

Each slide is one generated image, the same way your reference decks were made. Paste them into ChatGPT (image generation, 16:9).

## How to use

1. Use one ChatGPT chat for all 7 slides so the look stays the same.
2. Paste the **Style block** alone first. Then send one slide prompt per message.
3. Replace `[TEAM NAME]` and `[Member 1–4]` before you paste.
4. Read every word and number on the result. If one is wrong, use the fix prompt at the bottom.
5. Slide 4 is the only slide where you attach screenshots (from `docs/`). Every other slide is illustration only.

---

## Style block (paste first, alone)

```
I'm making a 7-slide pitch deck for NASA Space Apps Challenge 2026. Project: "Crew Health Monitor", health monitoring software for astronauts on deep-space missions. Generate each slide as ONE 16:9 landscape image, 1920x1080, a finished slide.

Visual style, the same on every slide:
- A rich, illustrated infographic, like a winning consulting or hackathon deck. Every slide is built around large, detailed illustrations: semi-realistic 3D renders of astronauts, spacecraft interiors, the ISS, the Moon, Mars, a translucent human body with glowing organs, medical devices (ultrasound probe, blood sample tube, wearable watch, CO2 sensor), bones, eyes, kidneys, radiation particles. Illustrations should carry the story. Text supports them.
- Palette: deep space navy (#0E1B3D) and indigo (#26357A) for structure, one warm amber/Mars orange (#F5A524) for attention, soft teal only for "normal". White and very light cool grey for content areas.
- Layout: a strong title at the top left in heavy navy sans-serif, with one key phrase in amber. One short subtitle line under it. Below, 3 to 5 content zones divided by thin lines or soft panels. Each zone has a small bold heading, a big illustration or diagram, and 1–2 short lines of text.
- Data appears as real charts and diagrams: bar charts, line charts, timelines, flow arrows, comparison splits, big numbers. Not as lists of bullet points.
- DO NOT use: pill-shaped labels, tag chips, rounded badge bubbles, emoji, stickers, cartoon icons in tinted squares, glassmorphism, generic "AI" glow blobs, stock-photo people smiling at laptops, NASA logos (we are not NASA).
- Typography: clean modern sans-serif (Inter / Geist style), numbers bold. Text must be sharp and legible.
- Spell every word and number EXACTLY as I give it. Add no extra text.
- Small grey footer at bottom left (sources) and the slide number at bottom right.

Reply "OK" and wait for slide 1.
```

---

## Slide 1: Title & Team

```
Slide 1, the cover.

Full-bleed cinematic illustration: inside a spacecraft cabin on the way to Mars, an astronaut in a blue flight suit floats beside a wall display. Through a large window behind them, Mars glows orange in black space. On the astronaut's body, a faint translucent overlay of a holographic human figure shows the circulatory system, with a glowing amber point at the neck. The wall display shows a dark health dashboard with a 3D body. Lighting: cool blue cabin light plus warm orange light from Mars.

Text on the left third, over a dark gradient so it reads clearly:
- Small spaced capitals: "NASA SPACE APPS CHALLENGE 2026"
- Huge title on two lines: "Crew Health" in white, "Monitor" in amber
- Under it, large: "Health monitoring for a crew that cannot call a doctor."
- Smaller: "Challenge: Create Health Monitoring Software for Astronauts on Space Missions"

Bottom strip across the slide, thin divider line above it, plain text, no boxes:
"Team [TEAM NAME]   |   [Member 1] · [Member 2] · [Member 3] · [Member 4]"

Tiny text bottom right: "Simulated data. Not a medical device."
```

## Slide 2: The Problem & Inspiration

```
Slide 2. Title: "Help Is Too Far Away to Wait For" with "Too Far Away" in amber. Subtitle: "On the way to Mars, the crew must judge their own health with rules written for Earth."

Top half, left to right, one wide illustrated band:
- Left: Earth, small and blue. Right: a spacecraft near Mars. Between them a long dotted signal line with a clock icon in the middle and the big number "22 min" above it, and below: "one-way message delay. A question and its answer take about 44 minutes."
- Under the spacecraft: "No doctor on board."

Bottom half, three illustrated zones side by side, divided by thin vertical lines:

Zone 1, heading "False alarm": a 3D blood sample tube with a red-to-amber fill level rising, and a small upward arrow. Big text "Hematocrit +10–12%". Line: "Normal in weightlessness. Earth rules call it dehydration."
Split verdict under it as two plain words with a thin divider: "Earth: CHECK" (amber) | "Space: NORMAL" (teal).

Zone 2, heading "Missed": a 3D CO2 sensor on a cabin wall with an astronaut holding their head. Big text "Cabin CO₂". Line: "Under Earth limits, yet crews get headaches."
Verdict: "Earth: NORMAL" (teal) | "Space: CHECK" (amber).

Zone 3, heading "Missed": a translucent 3D kidney with a small crystal stone and calcium particles flowing from a bone. Big text "1.6 L urine a day". Line: "Fine on Earth. In space, bones shed calcium: kidney stone risk."
Verdict: "Earth: NORMAL" (teal) | "Space: CHECK" (amber).

Thin strip on the right edge or bottom with two NASA facts, each with a small realistic render: an eye cross-section "70% of station astronauts show eye swelling" and a hip bone "1–1.5% bone lost per month".

Footer: "Sources: NASA Human Research Program · Kunz 2017 · Law 2014 · NASA renal stone studies"   "02"
```

## Slide 3: Proposed Solution

```
Slide 3. Title: "One Set of Data, Two Sets of Rules" with "Two Sets of Rules" in amber. Subtitle: "Every reading is checked twice: by Earth-standard rules and by space-adapted rules, side by side."

Centre of the slide, a large illustrated flow diagram from left to right with thick arrows:

1. INPUT (left): an astronaut's arm with a wearable watch, a handheld ultrasound probe on the neck, a tablet check-in form. Label: "Readings from check-ins and devices".

2. THE SPLIT (centre): the data stream splits into two lanes.
   Upper lane: a small Earth globe and a hospital lab report icon, label "Earth-standard rules — lab reference ranges".
   Lower lane: a small Mars/spacecraft and an open research paper, label "Space-adapted rules — published spaceflight studies".

3. OUTPUT (right): a large translucent 3D human body standing upright, the neck vein glowing amber, a thin leader line to a callout reading "Do this next: repeat the ultrasound and look for a clot." Next to it, two small lines: "Earth verdict" and "Space verdict", shown side by side.

Bottom band, three columns with a small illustration each, divided by thin lines, heading "Why rules, not an AI model":
- Lock-and-database illustration: "No public in-flight data to train on."
- Spacecraft with a crossed-out cloud: "Runs on board with no connection."
- Magnifying glass over a document: "Every flag shows its reason and source."

Top-right corner, four large numbers in a row with labels under them, no boxes: "15 signals" · "5 NASA hazards" · "3 missions" · "0 internet needed".

Footer: "Thresholds without a published source are labelled Demo parameter in the app."   "03"
```

## Slide 4: Project Demo & Visuals

Attach: `docs/signal-detail.png`, `docs/today.png`, `docs/earth-link.png`, `docs/emergency-step.png`

```
Slide 4. Title: "The Working Prototype" with "Working Prototype" in amber. Subtitle: "Running today at crew-health-monitor.vercel.app. All people and readings are simulated."

Use the attached screenshots as the screen contents. Do not redraw or invent UI; place them as they are.

Hero: a realistic laptop on a dark desk, angled slightly, showing signal-detail.png on its screen, large, taking about 60% of the slide. Thin amber leader lines from three points on the screen to short annotations in the margin:
- to the glowing neck: "The flagged body part glows. The camera flies to it."
- to the amber box on the right: "What to do next comes first."
- to the two verdict boxes: "Earth verdict and space verdict, side by side."

Right side, a vertical stack of three tablets or smaller floating screens showing today.png, earth-link.png and emergency-step.png, each with a one-line caption in plain text:
"Today: what to measure and re-check" / "Earth link: messages with the real delay" / "Emergency: large, timed steps"

Background: soft dark-to-light gradient, subtle starfield at the top edge.

Footer: "Body models: BodyParts3D (DBCLS), HRA 3D Reference Organs (HuBMAP), CC BY 4.0"   "04"
```

> If ChatGPT distorts the screenshots, generate this slide with blank screens and paste the real screenshots onto them in PowerPoint.

## Slide 5: User Experience

```
Slide 5. Title: "A Crew Member's Day, Step by Step" with "Step by Step" in amber. Subtitle: "Designed for someone with no medical training."

A single illustrated journey path across the slide: a curved route drawn like a mission trajectory, from the left edge to the right, with six stations along it. At each station a small detailed illustration of an astronaut in a spacecraft doing that step, a big number, a short title and one line:

1. Astronaut tapping their name on a wall screen. "Enter" — "Choose your name. No password."
2. Astronaut reading a checklist on a tablet with a coffee pouch floating. "See today" — "What to measure and what to re-check."
3. Astronaut holding an ultrasound probe to their neck while typing. "Log a check-in" — "Readings, a note, a photo."
4. Holographic body with the neck glowing amber. "Find the problem" — "The body part glows."
5. Astronaut following on-screen instructions. "Act on it" — "Do this next, then why, then the source."
6. Signal beam from the spacecraft to a small Earth with a countdown "16:00". "Report to Earth" — "Sent with the real signal delay."

Bottom third, three illustrated columns divided by thin lines, no boxes:
- Heading "Who sees what". Three small figures: an astronaut ("Crew: their own data"), an astronaut with a medical cross armband ("Medical officer: the whole crew"), a doctor at Mission Control on Earth ("Flight surgeon: only what was sent").
- Heading "Ask the handbook". An open glowing book with a speech line: "Answers only from the rules and today's readings. If it doesn't know, it says so."
- Heading "Emergency". An astronaut doing chest compressions on a crewmate, a large timer "00:42" beside them: "Large, timed steps for when it can't wait."

Footer: "Live demo: one click to enter."   "05"
```

## Slide 6: NASA & Partner Data Integration

```
Slide 6. Title: "Every Rule Points to a Source" with "Points to a Source" in amber. Subtitle: "Built on NASA and Canadian Space Agency open resources."

Left 60%: a large central illustration of the International Space Station in orbit above Earth, with thin labelled leader lines going out to six source callouts arranged around it. Each callout is plain text with a small realistic illustration, no boxes:
- Blood sample rack: "NASA OSDR · OSD-569 — Inspiration4 blood counts: lab ranges and pre-flight baselines."
- Five hazard symbols in a row (radiation, isolation, distance, gravity, closed environment): "NASA HRP · Five Hazards — every signal is tagged with one."
- Bone and eye renders: "NASA HRP · Human Risks — 1–1.5% bone lost per month, ~70% eye swelling."
- Microscope: "NASA HRP · Ongoing Research — Venous Haemostasis, Thigh Cuff, ARCHeR, Immune Biomarkers, Zero T2."
- Neutron particle trails: "CSA · Monitoring Radiation — neutrons are ~30% of station dose."
- Rocket heading to the Moon: "CSA · Why Science in Space — shapes our mission settings."

Right 40%: a clean horizontal bar chart titled "Radiation dose per day by mission", three bars with small illustrations at the start of each:
- ISS illustration, "Space station — 0.73 mSv"
- Moon lander illustration, "Moon surface — 1.37 mSv"
- Spacecraft near Mars, "Mars transit — 1.8 mSv" (amber, longest bar)
Under the chart in small text: "Sources: ISS measurements, Chang'E-4, Curiosity in cruise."

Under the chart, one row of tech logos drawn as simple monochrome wordmarks: React, TypeScript, three.js, Node.js, SQLite.

Footer: "No published number? The app labels the threshold Demo parameter."   "06"
```

## Slide 7: Impact & Future Scope

```
Slide 7. Title: "Earth Rules for Earth. Space Rules for Space." with "Space Rules for Space." in amber. Subtitle: "From a hackathon prototype to a tool a crew could trust."

Top half, split into two illustrated scenes side by side with a thin divider:
- Left scene, heading "In space": an astronaut on Mars transit looking calmly at a health display. Three short lines beside it: "Fewer false alarms." / "Space-only risks caught early." / "Act in minutes, not after a 44-minute round trip."
- Right scene, heading "On Earth": three small vignettes in a row — an Antarctic research station in snow, a submarine, a remote rural clinic. Line under them: "Anywhere a non-doctor must decide before help arrives."

Bottom half: a roadmap drawn as a rocket trajectory arcing from a launch pad on the left to Mars on the right, with five milestones along the arc, each with a small illustration and short text:
- Launch pad, amber marker: "NOW — Working prototype"
- Wearable devices: "PHASE 1 — Real devices"
- Padlock with shield: "PHASE 2 — Secure sign-in and encryption"
- Flight surgeon with clipboard: "PHASE 3 — Clinical validation"
- Moon and Mars: "PHASE 4 — Moon, Mars, and remote care on Earth"

Bottom line of plain text: "crew-health-monitor.vercel.app   ·   github.com/AdityaK0804/Crew-Health-Monitor" and at the far right, large bold: "Thank you."

Footer: "Educational prototype using simulated data. Not a medical device."   "07"
```

---

## Fix prompt (when text comes out wrong)

```
Keep the image exactly the same. Only fix this text: "<wrong>" should read "<right>". Change nothing else.
```

## Putting the images into PowerPoint

New presentation, 16:9, blank layout, insert each image full-slide. Or put the images in a folder, tell me where, and I'll build the .pptx from them.
