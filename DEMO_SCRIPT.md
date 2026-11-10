# Three-minute demo script

Run it locally for the demo (`npm run dev`) so the real server is behind it. Have two browser tabs ready: one signed in as **M. Chen** (medical officer), one as **Flight surgeon**. PIN `2026`.

## 0:00 Say this first (15 seconds)

"Everything you will see is simulated: the crew, the readings, the accounts. Real astronaut data is not public. What is real is the rules, and each one shows the paper it comes from. This is a concept demonstrator, not a medical device."

## 0:15 The problem and the idea (45 seconds)

Open **Crew health**, day 60. Select **E. Vance**.

- Switch to **Earth-standard**. "Earth rules flag her hematocrit: it looks like dehydration."
- Switch to **Space-adapted**. "In space this rise is expected. Blood plasma drops in weightlessness. Here is the study."
- Point at the left panel: "Earth rules raise false alarms, and they also miss things."
- Still on Vance, open **Urine output**. "1.6 litres a day is fine on Earth. In space her bones are shedding calcium, so NASA wants 2 litres. Earth rules miss a kidney stone risk."

## 1:00 The body (40 seconds)

Select **A. Rivera**. Click the **Neck vein** marker.

- "The camera goes to the problem. Blood flow in his neck vein has stalled. Six of eleven ISS crew showed this, and one got a clot."
- Point at **Do this next** and **About this measurement**. "It tells a non-doctor what to do, what the measurement is, and how to take it."
- Click **Heart and blood**, pinch or scroll to zoom. "Real anatomical models, male and female."

## 1:40 A day on board (30 seconds)

Open **Today**. "This is what a crew member sees: what to measure, what to re-check, a note in their own words."
Open **Ask**, click "Am I at risk of kidney stones?". "No AI model. It only answers from the rules and today's readings, and it says so when it does not know. It works with no connection."

## 2:10 Earth is far away (30 seconds)

Open **Earth link**. Click nothing yet; point at the delay. "Sixteen minutes each way today."
Go to **Crew health**, press **Send report to Earth**, return to **Earth link**: show the countdown. Switch to the flight surgeon tab: the report arrives after the delay. "Earth sees only what the crew sends."

## 2:40 Emergency and close (20 seconds)

Press **Emergency**, choose **Crew member collapsed**, press Space twice. "Large steps, each marked as from a published guideline or as demo wording. The run is timed and sent to Earth."

Close: "Rules instead of a prediction model is a choice: it runs on board, works offline, and every decision can be checked against its source."

## If a judge asks

- **Why no machine learning?** No public in-flight data exists to train on, and a crew far from help needs to see why a flag was raised. Rules with sources can be audited; a model cannot.
- **Is the privacy real?** Locally, yes: the server refuses requests outside your role. On the public demo link there is no server, so roles are only for show there. The app says so in a banner.
- **What would it take to be real?** Device integration, the agency's identity system, encryption, and clinical validation of every threshold.
