# Research log

Last pass: 2026-11-10. Ids match `src/data/sources.ts`.
Confidence: **High** = read from the source or NASA's own summary. **Medium** = real source found, exact number came from a press summary or memory and needs a full-text check. **Low** = no source.

## 1. Claims

| Id | Claim | Source | What the source says | Confidence | Status |
|---|---|---|---|---|---|
| IJV_STUDY | Stagnant/backward neck-vein flow is common in flight | Marshall-Goebel et al., JAMA Netw Open 2019;2(11):e1915011. https://pmc.ncbi.nlm.nih.gov/articles/PMC6902784/ | 11 ISS crew; 6 stagnant or retrograde flow near flight day 50; 1 occlusive clot; LBNP improved flow in 10 of 17 sessions | High | Used |
| IJV_CASE | A clot has been found and treated in flight | Aunon-Chancellor et al., N Engl J Med 2020. https://www.lsuhsc.edu/newsroom/1ST%20Reported%20Occurrence%20and%20Treatment%20of%20Spaceflight%20Medical%20Risk.html | Found on research ultrasound about 2 months in, no symptoms. Treated with enoxaparin then apixaban, directed from Earth. Authors say there was no evidence base for the choice | High | Used (red rule, no drug advice) |
| - | IJV velocity < 5 cm/s as a treatment trigger | none found | Not in the 2019 paper. | Low | **Removed** |
| - | "4-grade" IJV flow scale | not confirmed | Search did not confirm it. May be in the 2019 paper's methods; biotech to check PMC6902784 full text | Low | Not used. App uses forward / stagnant / retrograde |
| - | Muller maneuver step, "72-hour EVA hold" | none found | No source | Low | **Removed** |
| HCT_FLIGHT | Hematocrit is higher in flight | Kunz et al., BMC Hematology 2017;17:12. https://pmc.ncbi.nlm.nih.gov/articles/PMC5590186 | RBC, hemoglobin, hematocrit raised in flight; about +12.2 / +12.2 / +10.0% early/mid/late (figures from press summary); normal within 30 days of landing. Plasma volume was not measured | Medium | Used. Biotech: confirm the % in the paper's tables |
| - | Red cell destruction is higher in space | Trudel et al., Nat Med 2022 | 14 astronauts; 54% more red cell destruction in flight. Interpretation is disputed (Am J Hematol 2022 letter) | Medium | Context only, not a rule |
| HCT_REF | Hematocrit lab ranges 38.5-50% / 35-45% | NASA OSDR OSD-569 CBC file (downloaded, see section 2) | Ranges are printed in the file next to each real value | High | Used |
| HCT_HIGH | In-flight action level for hematocrit | none found | - | Low | Demo parameter (+20% over own baseline) |
| ONSD_REVIEW | Earth ONSD cut-off does not fit astronauts | npj Microgravity 2022 review https://pmc.ncbi.nlm.nih.gov/articles/PMC9537149/ ; NASA NTRS reports https://ntrs.nasa.gov/api/citations/20150001890/downloads/20150001890.pdf and https://ntrs.nasa.gov/api/citations/20140012825/downloads/20140012825.pdf | Methods not standardised. One NASA report: over 50% of US astronauts have ONSD > 0.60 cm before launch | Medium | Used. Biotech: confirm which NTRS report has the 50% line |
| ONSD_CHANGE | ONSD 5.8 / 6.2 mm cut-offs, 0.8 mm change | none found | No source for any of the three numbers | Low | Old numbers **removed**. Demo parameter 0.5 mm change + vision complaint |
| CO2_LIMIT | NASA cabin CO2 limit | NASA OCHMO TB-004 https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-004-carbon-dioxide.pdf | 3 mmHg 1-hour average (NASA-STD-3001 Vol 2 Rev D). Older range 3.8-7.5 mmHg. ISS has run 1-9 mmHg | High | Used |
| CO2_HEADACHE | CO2 linked to headache in flight | Law et al., J Occup Environ Med 2014 (via NASA TB-004 and https://sciencedaily.com/releases/2014/05/140501100922.htm) | Each +1 mmHg doubles odds of headache; 7-day average < 2.5 mmHg keeps risk < 1% | High | Used |
| CO2_EARTH | Earth workplace CO2 limit | OSHA PEL 5000 ppm 8-h (about 3.8 mmHg at sea level) https://www.osha.gov/annotated-pels/table-z-1 | From memory, not opened this session | Medium | Used for Earth mode. Verify |
| RAD_RATE | Dose rate on the way to Mars | Zeitlin et al., Science 2013;340:1080, doi 10.1126/science.1235989. https://www.swri.org/press-release/swri-led-team-calculates-radiation-exposure-associated-trip-mars | 1.8 mSv/day dose equivalent in cruise; round trip about 0.66 Sv. Old file used about 0.94 mSv/day, which was too low | High | Used |
| RAD_LIMIT | NASA career limit | NASA OCHMO radiation brief https://www.nasa.gov/sites/default/files/atoms/files/radiation_protection_technical_brief_ochmo.pdf | 600 mSv effective dose, any age or sex | High | Used. Note: RAD measured dose equivalent, the limit is effective dose. We compare them as an approximation and say so |
| RAD_EARTH | Earth worker yearly limit 50 mSv | US NRC 10 CFR 20.1201 | From memory | Medium | Used for Earth mode. Verify |
| SLEEP | Sleep threshold | Barger et al., Lancet Neurol 2014 (ISS crews about 6 h/night) | From memory, not opened | Low | Demo parameter (6 h) |
| VITALS | SpO2 and heart-rate cut-offs | none tied yet | General clinical convention | Low | Demo parameter |
| - | Lactate and shock-index cut-offs | not researched | Not measured in our data | - | **Not used.** Add only with a source |
| - | Drug absorption "15-20% delayed", "4.5% potency loss / 100 days", pack names, locker locations, velcro colours | none found | Invented | Low | **Removed** with the whole drug list |
| CPR (next session) | CPR method in microgravity | Hinkelbein et al., Scand J Trauma Resusc Emerg Med 2020 https://pmc.ncbi.nlm.nih.gov/articles/PMC7607644 | First guideline (DGLRM + ESAM-SMG). Evetts-Russomano method for basic life support; handstand method once patient is on the restraint system; otherwise follow AHA/ERC | High | Source for Emergency mode |
| context | NASA is working on the same problem | NASA ExMC Clinical Decision Support project https://ntrs.nasa.gov/citations/20205011448 ; Earth-Independent Medical Operations https://ntrs.nasa.gov/api/citations/20230007863/downloads/EIMO.AsMA2023.Lemery.final.pdf | NASA wants an onboard assistant for crews with comm delay and no evacuation | High | Use in the pitch |

### Added 2026-11-11

| Id | Claim | Source | What the source says | Confidence | Status |
|---|---|---|---|---|---|
| URINE_TARGET | Urine output of 2 L a day or more lowers stone risk in flight | NASA NTRS https://ntrs.nasa.gov/citations/19970003315 ; later modelling https://ntrs.nasa.gov/api/citations/20220000530/downloads/goodenow_etal_Journal_figs_v2b_ForSTRIVES.pdf | Advises fluid to reach 2 L/day of urine; later documents list 2.0 to 2.5 L/day. Hydration treats the symptom, not the calcium loss | Medium (from search summaries, full text not opened) | Used |
| URINE_RISK | Why stones form in space | NASA risk report https://ntrs.nasa.gov/api/citations/20170004709/downloads/20170004709.pdf | Extra urinary calcium from bone loss, and low urine volume | Medium | Used |
| URINE_EARTH | 0.8 L a day as low-normal on Earth | none tied | Textbook figure | Low | Demo parameter |
| BONE_LOSS | Bone loss of 1 to 1.5% a month | https://link.springer.com/10.1038/s41526-023-00256-5 and an aerospace medicine case report | 1 to 1.5% a month on 4 to 6 month missions before 2009; resistance exercise reduces but does not remove it | Medium | Used |
| EXERCISE_PLAN | In-flight resistance sessions per week | not confirmed | ISS exercise prescription not found in a NASA document this pass | Low | Demo parameter (5 a week) |
| EXERCISE_EARTH | Strength training 2 days a week | WHO 2020 guideline | From memory | Medium | Used for Earth mode. Verify |
| - | Potassium citrate as a stone countermeasure | NASA ISS study | Reduced stone risk in a double-blind study | Medium | Not used: the app gives no medication advice |

## 2. Data we can really use

| Data | Where | What it is | Use |
|---|---|---|---|
| **OSD-569** CBC | `data/osdr/OSD-569_CBC_TRANSFORMED.csv` (downloaded from https://osdr.nasa.gov/bio/repo/data/studies/OSD-569) | Real blood counts, 4 Inspiration4 crew, 7 time points each (3 pre-flight, 4 post-flight), with lab ranges. **No in-flight samples.** 3-day mission | Pre-flight baselines and lab ranges in the simulation |
| OSD-575 | https://osdr.nasa.gov/bio/repo/data/studies/OSD-575 | Same crew: metabolic panel + immune/cardiac cytokines | Optional later |
| OSD-570, 571, 572, 656 | osdr.nasa.gov | Omics, microbiome, urine panels | Skip (too deep for the demo) |
| OSDR API | `https://osdr.nasa.gov/osdr/data/osd/meta/{id}` and `/files/{id}` | Free, no key | How the files above were found |

Hard fact for the pitch: **no public dataset has day-by-day in-flight vitals for astronauts.** NASA's LSDA holds them but access is by request. So in-flight curves must be simulated, and we say so on screen.

## 3. Other projects on this problem

- Space Apps 2018 "Microdoze": app that alerts when vitals leave personal baseline.
- lablab.ai "Autonomous Space Health Guardian", "Smart Space Habitat Manager": simulated vitals + anomaly detection.
- GitHub `chamikamunithunga/life_support_system`: Isolation Forest on simulated heart rate / SpO2.
- NASA ExMC CDSS and TRISH/Medplum work: the real, professional version.

All the hackathon ones are "simulated vitals + anomaly detector". None compare Earth rules against space rules with a source per rule. Our angle holds.

## 4. Not done

- The challenge page (spaceappschallenge.org/2026/challenges/health-monitoring-software/) loads as an empty shell for automated tools. **Its text has not been read.** Paste it into `CHALLENGE.md` so we can check our scope against it.
