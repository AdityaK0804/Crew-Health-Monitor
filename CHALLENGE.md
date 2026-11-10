# Scope check against the challenge

Challenge: "Create Health Monitoring Software for Astronauts on Space Missions", NASA Space Apps 2026.
Source: https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/ (read on 2026-11-11). Difficulty: Intermediate.

This is our own summary of what the page asks for, and where the app answers it.

## What the challenge asks for

| The challenge says | Where we answer it | Status |
|---|---|---|
| Software that gathers health indicators and lets astronauts evaluate and act on their health | Crew health tab, check-in form, Today tab | Covered |
| A visual tool that helps astronauts assess their own health | 3D body, colour-coded signals | Covered |
| Guidance on treatments and health improvements | "Do this next" box on every signal, Emergency walkthroughs | Covered. We give next steps, never medication doses |
| Input by keyboard, mouse or other means; any data that is a health indicator | Check-in form, free-text notes, simulated device feed | Covered. No camera or image input |
| Named indicators: blood pressure, heart rate, blood sugar, body temperature, daily sleep hours, mood | All six are signals | Covered. Blood pressure, sugar, temperature and mood use ordinary Earth limits, labelled as demo parameters |
| Which measurements can be performed in space? Why is an exam needed? | "About this measurement" in each signal: what it is, why it matters in space, how to take it | Covered |
| How do spaceflight hazards affect these indicators? | Each signal is tagged with one of NASA's five hazards; the Earth versus space rules show the effect | Covered |
| When might a result warrant attention from the crew or from flight surgeons? | Normal / Check / Urgent levels, Earth link with reports | Covered |
| What actions can prevent a critical condition? | Next steps, Today task list, stale-data warnings | Covered |
| Example: a human figure where each body part is clickable and shows its status | The 3D body with clickable markers | Covered |

## Optional considerations

| Consideration | Status |
|---|---|
| Different environments (spacecraft, station, rover, surface base) | Not done. One setting only: Mars transit |
| Prompt astronauts to take measurements as part of the routine | Covered: Today tab and stale-data warnings |
| Gamification | Not done, by choice. A progress bar on today's tasks is the only nudge |
| Dynamic charts of indicators over time | Partly: 30-day trend line per signal and a mission timeline. No large chart view |
| Colour coding to read status at a glance | Covered. Colour appears only where attention is needed |
| Do not assume astronauts know how to assess their health | Covered: plain-language explanations, the Ask tab, the Emergency steps |

## Gaps to be honest about

- No image input (the challenge mentions camera images and ultrasound images as possible data).
- No immune or nutrition indicators, which the background section mentions.
- One mission setting only.
