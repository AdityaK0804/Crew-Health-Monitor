# Space Apps submission: paste-ready answers

Copy each block into the matching field on the submission form. Text in [square brackets] is for you to fill or check.

---

## Project Summary

### Project Name

```
Crew Health Monitor
```

### Summary * (50–200 words, max 1500 characters)

```
Crew Health Monitor is a web app that helps astronauts check their own health when no doctor is on board and a message to Earth can take up to 22 minutes each way.

The problem: normal ranges on an Earth lab report fail in space. A 10–12% rise in hematocrit is expected in weightlessness, but Earth rules call it dehydration. Cabin CO2 below Earth workplace limits still gives crews headaches, and 1.6 litres of urine a day is a kidney stone risk in space. So Earth rules both raise false alarms and miss real risks.

Our app checks every reading twice, with Earth-standard rules and space-adapted rules, and shows both verdicts side by side. Each space rule links to the published study or NASA standard it comes from. A 3D anatomical body shows where the problem is, and each flag says in plain words what to do next. It runs in the browser with no internet, models the real Earth signal delay for station, Moon and Mars missions, and includes an offline handbook and timed emergency steps.

All crew and readings are simulated. It is a concept demonstrator, not a medical device.
```

---

## Project Links

### Project Demonstration * (max 7 slides or 30 seconds, public link)

Our 7-slide deck as a PDF in the public GitHub repo:

```
https://github.com/AdityaK0804/Crew-Health-Monitor/blob/main/docs/Crew-Health-Monitor-Pitch-Deck.pdf
```

> **This link returns 404 right now.** The commit that adds the PDF is still only on this computer, so it works only after you push. Before submitting: open this link in a private/incognito window to confirm it loads without sign-in. If you replace it with the new illustrated slides, export them to PDF, add that PDF to the repo (or a public Google Drive file set to "Anyone with the link"), and paste that link instead. The claude.ai design canvas link is **private** and will not work here.

### Project * (public link)

```
https://github.com/AdityaK0804/Crew-Health-Monitor
```

> The repo README links the live demo (https://crew-health-monitor.vercel.app) and explains how to run it. If the form only takes one link, the repo is the better choice because it holds the code, the README and the live link.

---

## NASA Data *

Add one row per resource ("Add New Link"). Link Text | Link Url:

| Link Text | Link Url |
|---|---|
| NASA OSDR OSD-569: Inspiration4 complete blood count (lab ranges and pre-flight blood values) | https://osdr.nasa.gov/bio/repo/data/studies/OSD-569 |
| NASA Human Research Program: Five Hazards of Human Spaceflight | https://www.nasa.gov/hrp/hazards/ |
| NASA Human Research Program: Human Spaceflight Risks | https://www.nasa.gov/hrp/risks/ |
| NASA Human Research Program: Ongoing Research | https://www.nasa.gov/hrp/ongoing-hrp-research/ |
| NASA HRP: Risk of Spaceflight-Induced Bone Changes | https://www.nasa.gov/reference/risk-of-spaceflight-induced-bone-changes/ |
| NASA OCHMO Technical Brief TB-004: Carbon Dioxide (NASA-STD-3001) | https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-004-carbon-dioxide.pdf |
| NASA OCHMO Radiation Protection Technical Brief (NASA-STD-3001) | https://www.nasa.gov/sites/default/files/atoms/files/radiation_protection_technical_brief_ochmo.pdf |
| NASA NTRS: Renal stone studies, urine output target | https://ntrs.nasa.gov/citations/19970003315 |
| NASA NTRS: Risk of renal stone formation in spaceflight | https://ntrs.nasa.gov/api/citations/20170004709/downloads/20170004709.pdf |
| NASA NTRS: Flight surgeon vitamin D protocol | https://ntrs.nasa.gov/citations/20130013531 |
| NASA NTRS: Vitamin D in real and simulated weightlessness | https://ntrs.nasa.gov/api/citations/20080026180/downloads/20080026180.pdf |

---

## Space Agency Partner & Other Data

| Link Text | Link Url |
|---|---|
| Canadian Space Agency: Monitoring radiation and astronaut health | https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp |
| Canadian Space Agency: Why we conduct science experiments in space | https://www.asc-csa.gc.ca/eng/iss/science/why-do-we-conduct-science-experiments-in-space.asp |
| ISS radiation dose: DOSIS 3D and ESA Active Dosimeter | https://pmc.ncbi.nlm.nih.gov/articles/PMC10919969/ |
| Kunz et al. 2017: blood counts during ISS flight (hematocrit) | https://pmc.ncbi.nlm.nih.gov/articles/PMC5590186 |
| Immune changes during 6-month ISS flight (npj Microgravity 2015) | https://link.springer.com/content/pdf/10.1038/npjmgrav.2015.13.pdf |
| Optic nerve sheath diameter and spaceflight (npj Microgravity 2022) | https://pmc.ncbi.nlm.nih.gov/articles/PMC9537149/ |
| Marshall-Goebel et al. 2019: neck vein blood flow in flight (JAMA Netw Open) | https://pmc.ncbi.nlm.nih.gov/articles/PMC6902784/ |
| Law et al. 2014: ISS CO2 and headaches | https://sciencedaily.com/releases/2014/05/140501100922.htm |
| Zeitlin et al. 2013: radiation on the cruise to Mars (Curiosity RAD) | https://www.swri.org/press-release/swri-led-team-calculates-radiation-exposure-associated-trip-mars |
| Zhang et al. 2020: radiation on the lunar surface (Chang'E-4) | https://www.science.org/doi/10.1126/sciadv.aaz1334 |
| Lee et al. 2020: venous responses to partial gravity | https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7399573/ |
| BodyParts3D 3D anatomy models (DBCLS, CC BY 4.0) | https://lifesciencedb.jp/bp3d/ |
| HRA 3D Reference Organs (HuBMAP, CC BY 4.0) | https://humanatlas.io/3d-reference-library |
| WHO 2020 physical activity guidelines | https://www.who.int/publications/i/item/9789240015128 |
| Open-source software: React, TypeScript, Vite, Tailwind CSS, Motion, three.js, Node.js | https://github.com/AdityaK0804/Crew-Health-Monitor/blob/main/package.json |

> Check the two model links (BodyParts3D, HRA) open before submitting; the others are taken straight from the app's source list.

---

## Use of Super Intelligence (SI) *

Select the options that are true for your team. Based on how this project was built, these apply:

- [x] Ideation or Brainstorming
- [x] Research or Information Gathering
- [x] Coding, Debugging, or Troubleshooting
- [x] Writing, Editing, or Translation
- [ ] Data Analysis and Interpretation (tick only if you used AI to analyse the OSD-569 data)
- [ ] Building SI/ML Into the Project (do **not** tick: the app deliberately uses rules, not a model. The optional Gemini rewording is off by default; tick only if you count it)
- [ ] Image generation (tick only if you use ChatGPT-made slide images)

**Rules to follow so judges see the SI use clearly:**
1. Add an "AI assistance" note to the README (draft below).
2. If any slide uses an AI-generated image, put a visible watermark on it, such as "AI-generated image" in a corner.
3. No NASA logos, flags or mission patches anywhere. The deck and app use our own heartbeat logo only.

Draft README section:

```
## AI assistance

We used AI tools (Claude by Anthropic, and Gemini/ChatGPT where noted) for brainstorming, research summaries, code writing and debugging, and drafting text and slides. The team reviewed and tested all code and checked every health threshold against the cited source. The app itself does not use AI to make health decisions: all flags come from written rules with linked sources. The optional "reword" feature in the Ask tab can pass handbook text to Gemini for friendlier wording; it is off unless a key is configured, and the original text is always shown.
```

---

## Project Information

### Project Details *

Paste this into the rich-text box. Use the toolbar to make the headings bold.

```
WHAT IT DOES
Crew Health Monitor is a health monitoring web app for astronauts on long missions. On the way to Mars a message to Earth takes up to 22 minutes each way, and there may be no doctor on board, so the crew has to notice and act on health problems themselves.

The core idea is "one reading, two rulebooks". Every reading is checked by Earth-standard rules (normal lab ranges) and by space-adapted rules (thresholds from published spaceflight studies and NASA standards). Both verdicts are shown side by side. This fixes two failures of Earth rules in space:
- False alarms: hematocrit rises 10–12% in weightlessness. Earth rules call it dehydration; in space it is expected.
- Missed risks: cabin CO2 under Earth limits still causes headaches, and 1.6 L of urine a day is a kidney stone risk in space.

HOW IT WORKS
1. Input: a daily check-in (keyboard, mouse or touch), free-text notes, a simulated wearable/device feed, and an optional photo or ultrasound image.
2. Rules: 15 signals (13 crew, 2 cabin), each tagged with one of NASA's five hazards of spaceflight and linked to its NASA risk page and the current NASA study on the topic. Any threshold without a published source is labelled "Demo parameter" on screen.
3. Output: a 3D anatomical body where the affected part glows and the camera moves to it, and a "Do this next" instruction in plain words, followed by the reason, the Earth and space verdicts, how to take the measurement, and the source.

FEATURES
- Today: what to measure, readings getting old, notes, messages from Earth.
- Crew health: 3D body (male and female reference models), body systems, trend charts since launch.
- Earth link: messages and reports travel with the real signal delay for the mission day, with a countdown.
- Ask the handbook: answers only from the rules and today's readings, with no AI model and no internet. It says "I don't have that" when it does not know.
- Emergency: large, timed step-by-step walkthroughs, each step marked as published guidance or demo wording.
- Mission settings: space station, Moon surface or Mars transit. Each changes the signal delay and radiation rate (measured values: 0.73, 1.37 and 1.8 mSv a day).
- Roles: crew see their own data, the medical officer sees everyone, the Earth flight surgeon sees only what was sent.

BENEFITS AND IMPACT
- Fewer false alarms, so real alerts are trusted.
- Space-only risks caught early: CO2 headaches, kidney stones, neck vein clots, eye swelling.
- Crew autonomy: act in minutes instead of waiting for a 44-minute round trip.
- On Earth, the same idea helps anywhere a non-doctor must decide before help arrives: polar stations, ships and submarines, remote clinics.

WHY RULES AND NOT AI (A DELIBERATE CHOICE)
- There is no public day-by-day in-flight astronaut data to train a model on.
- It must run on board with no connection.
- A crew far from help must be able to see and check why a flag was raised.

TOOLS AND TECHNOLOGY
React, TypeScript, Vite, Tailwind CSS, Motion and three.js for the app and 3D body; Node.js with built-in SQLite for the server and roles. The same tested rule file is used by the screens and the server. Data: NASA OSDR dataset OSD-569, NASA Human Research Program resources, NASA standards, Canadian Space Agency resources, and peer-reviewed spaceflight studies. 3D models: BodyParts3D and HRA 3D Reference Organs (CC BY 4.0).

CREATIVITY
Instead of building another dashboard of numbers, we asked whether the numbers mean the same thing in space. Showing the Earth and space verdicts side by side makes the hidden problem visible, and every rule shows its source.

FACTORS WE CONSIDERED
- Honesty: all crew and readings are simulated, and we label every unsourced threshold. This is a prototype, not a medical device.
- Offline use and the communication delay.
- Users without medical training: plain words first, colour only where attention is needed.
- Privacy by role.
- No gamification: points and streaks could reward hiding symptoms.

WHAT IT WOULD TAKE TO BE REAL
Real device integration, the agency's own sign-in, encryption, image transfer to Earth, and clinical validation of every threshold by flight surgeons.

Live demo: https://crew-health-monitor.vercel.app (choose a person to enter, no password)
Code: https://github.com/AdityaK0804/Crew-Health-Monitor
```
