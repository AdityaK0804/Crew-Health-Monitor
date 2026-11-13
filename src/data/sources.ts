// Every threshold in triage.ts points to one of these entries.
// status:
//   'verified' = we read the source (or NASA's own summary of it) this project
//   'partial'  = real source exists, but the exact number still needs a full-text check
//   'demo'     = no source found. The UI labels it "demo parameter".
// Full notes for each entry are in RESEARCH_LOG.md (same ids).

export type SourceStatus = 'verified' | 'partial' | 'demo'

export interface Source {
  id: string
  title: string
  url?: string
  says: string
  status: SourceStatus
}

export const SOURCES: Record<string, Source> = {
  HCT_FLIGHT: {
    id: 'HCT_FLIGHT',
    title: 'Kunz et al., BMC Hematology 2017;17:12',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5590186',
    says: 'Red cell count, hemoglobin and hematocrit were higher during ISS flight than before flight (hematocrit about +10 to +12%). Values returned to pre-flight within 30 days of landing.',
    status: 'partial',
  },
  HCT_REF: {
    id: 'HCT_REF',
    title: 'NASA OSDR dataset OSD-569 (Inspiration4 complete blood count)',
    url: 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-569',
    says: 'Real pre/post-flight blood counts for 4 private astronauts, with the lab reference ranges used here: hematocrit 38.5-50% and 35-45%.',
    status: 'verified',
  },
  IMMUNE_WBC: {
    id: 'IMMUNE_WBC',
    title: 'Immune system alterations during 6-month ISS flight, npj Microgravity 2015',
    url: 'https://link.springer.com/content/pdf/10.1038/npjmgrav.2015.13.pdf',
    says: 'Blood from 23 astronauts was taken before, during and after 6-month ISS missions. White cell count was raised during flight. Other reports find lymphocyte counts unchanged or lower.',
    status: 'partial',
  },
  IMMUNE_REF: {
    id: 'IMMUNE_REF',
    title: 'NASA OSDR dataset OSD-569: lab ranges for white cells (3.8-10.8) and lymphocytes (0.85-3.9), x1000 per microlitre',
    url: 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-569',
    says: 'The reference ranges printed beside each real blood count in the Inspiration4 file. The crew pre-flight values in this app are also copied from it.',
    status: 'verified',
  },
  IMMUNE_DEMO: {
    id: 'IMMUNE_DEMO',
    title: 'Demo parameter: white cells 40% above, or lymphocytes 40% below, own pre-flight value',
    says: 'No published in-flight action level found. Chosen so that the published direction of change (a rise) stays green.',
    status: 'demo',
  },
  VITD_NASA: {
    id: 'VITD_NASA',
    title: 'NASA flight surgeon vitamin D protocol (Tarver, NTRS 20130013531)',
    url: 'https://ntrs.nasa.gov/citations/20130013531',
    says: 'Defines deficiency as 25-hydroxyvitamin D below 20 ng/mL and insufficiency as 20 to 30 ng/mL, and notes astronauts get no sunlight aboard the ISS.',
    status: 'partial',
  },
  VITD_FLIGHT: {
    id: 'VITD_FLIGHT',
    title: 'Rice, Zwart and Smith, vitamin D in real and simulated weightlessness (NTRS 20080026180); Smith et al. 2005, ISS nutritional status',
    url: 'https://ntrs.nasa.gov/api/citations/20080026180/downloads/20080026180.pdf',
    says: 'In 11 ISS astronauts taking vitamin D supplements, 25-hydroxyvitamin D was about 25% lower after 4-6 month flights than before.',
    status: 'partial',
  },
  MASS: {
    id: 'MASS',
    title: 'Demo parameter: body mass more than 5% below own pre-flight value',
    says: 'No published in-flight action level found.',
    status: 'demo',
  },
  HCT_HIGH: {
    id: 'HCT_HIGH',
    title: 'Demo parameter: hematocrit more than 20% above own pre-flight value',
    says: 'No published in-flight action level found. Chosen so that the published +10-12% shift stays green.',
    status: 'demo',
  },
  ONSD_REVIEW: {
    id: 'ONSD_REVIEW',
    title: 'Optic nerve sheath diameter and spaceflight (npj Microgravity 2022) + NASA NTRS report',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9537149/',
    says: 'Measurement methods are not standardised. A NASA report notes over half of US astronauts already measure above 6.0 mm before launch, so the Earth cut-off does not fit crews.',
    status: 'partial',
  },
  ONSD_CHANGE: {
    id: 'ONSD_CHANGE',
    title: 'Demo parameter: sheath diameter 0.5 mm above own pre-flight value',
    says: 'No validated change-from-baseline threshold found. The 5.8 / 6.2 mm and 0.8 mm figures in our old notes have no source.',
    status: 'demo',
  },
  IJV_STUDY: {
    id: 'IJV_STUDY',
    title: 'Marshall-Goebel et al., JAMA Network Open 2019;2(11):e1915011',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6902784/',
    says: '11 ISS crew. 6 had stagnant or backward flow in the left neck vein around flight day 50. 1 had a blocking clot. Lower body negative pressure improved flow in 10 of 17 sessions.',
    status: 'verified',
  },
  IJV_CASE: {
    id: 'IJV_CASE',
    title: 'Aunon-Chancellor et al., N Engl J Med 2020 (clot found in flight)',
    url: 'https://www.lsuhsc.edu/newsroom/1ST%20Reported%20Occurrence%20and%20Treatment%20of%20Spaceflight%20Medical%20Risk.html',
    says: 'A neck-vein clot was found by routine research ultrasound about 2 months into a mission, with no symptoms. Treatment was directed by doctors on Earth.',
    status: 'verified',
  },
  CO2_LIMIT: {
    id: 'CO2_LIMIT',
    title: 'NASA OCHMO technical brief TB-004, Carbon Dioxide (NASA-STD-3001 Vol 2)',
    url: 'https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-004-carbon-dioxide.pdf',
    says: 'Cabin CO2 must stay at or below 3 mmHg as a 1-hour average. Older limits were 3.8-7.5 mmHg.',
    status: 'verified',
  },
  CO2_HEADACHE: {
    id: 'CO2_HEADACHE',
    title: 'Law et al., J Occup Environ Med 2014 (ISS CO2 and headaches)',
    url: 'https://sciencedaily.com/releases/2014/05/140501100922.htm',
    says: 'Each 1 mmHg rise in CO2 doubled the odds of a reported headache. Keeping the 7-day average under 2.5 mmHg would keep headache risk under 1%.',
    status: 'verified',
  },
  CO2_EARTH: {
    id: 'CO2_EARTH',
    title: 'OSHA workplace limit for CO2: 5000 ppm over 8 hours (about 3.8 mmHg)',
    url: 'https://www.osha.gov/annotated-pels/table-z-1',
    says: 'The usual Earth workplace limit. It is higher than the level at which ISS crews report headaches.',
    status: 'partial',
  },
  RAD_RATE: {
    id: 'RAD_RATE',
    title: 'Zeitlin et al., Science 2013;340:1080 (Curiosity RAD, cruise to Mars)',
    url: 'https://www.swri.org/press-release/swri-led-team-calculates-radiation-exposure-associated-trip-mars',
    says: 'Average dose equivalent inside the spacecraft was about 1.8 mSv per day. A round trip would be about 0.66 Sv.',
    status: 'verified',
  },
  RAD_MOON: {
    id: 'RAD_MOON',
    title: "Zhang et al., Science Advances 2020;6(39):eaaz1334 (Chang'E-4, lunar surface)",
    url: 'https://www.science.org/doi/10.1126/sciadv.aaz1334',
    says: 'The first and so far only direct measurement on the lunar surface: an average dose equivalent of 1,369 microsievert a day, about 1.37 mSv. Measured in lunar daytime inside a lightly shielded lander, so a habitat could differ.',
    status: 'verified',
  },
  RAD_ISS: {
    id: 'RAD_ISS',
    title: 'ISS dose equivalent: DOSIS 3D (Zhang et al. 2020) and the ESA Active Dosimeter (2024)',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10919969/',
    says: 'Three peer-reviewed measurements agree: 731 microsievert a day (DOSIS 3D), 758 plus or minus 24 (ESA Active Dosimeter, June 2017, with 620 in the Columbus module), and a review giving 0.5 to 1 mSv a day depending on solar activity and shielding. We use 0.73.',
    status: 'verified',
  },
  GRAVITY_PARTIAL: {
    id: 'GRAVITY_PARTIAL',
    title: 'Lee et al., Venous and arterial responses to partial gravity, Frontiers in Physiology 2020',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7399573/',
    says: 'In parabolic flights, the neck vein grew wider step by step as gravity fell: 12 square mm seated in Earth gravity, 68 at a quarter of Earth gravity, 103 lying flat. Moon gravity (one sixth) was not tested, and how much gravity is enough to pull fluid back down is still an open question.',
    status: 'partial',
  },
  GRAVITY_DEMO: {
    id: 'GRAVITY_DEMO',
    title: 'Demo parameter: the Moon setting applies 60% of the weightless fluid shift',
    says: 'Taken from the quarter-gravity result above (about 60% of the way from sitting to lying flat). Nobody has measured a long stay in Moon gravity, so this is an assumption for the simulation only.',
    status: 'demo',
  },
  RAD_LIMIT: {
    id: 'RAD_LIMIT',
    title: 'NASA OCHMO radiation protection brief (NASA-STD-3001 Vol 1)',
    url: 'https://www.nasa.gov/sites/default/files/atoms/files/radiation_protection_technical_brief_ochmo.pdf',
    says: 'Career limit for an astronaut is 600 mSv effective dose, the same for every age and sex.',
    status: 'verified',
  },
  RAD_EARTH: {
    id: 'RAD_EARTH',
    title: 'US occupational dose limit: 50 mSv per year (10 CFR 20.1201)',
    url: 'https://www.nrc.gov/reading-rm/doc-collections/cfr/part020/part020-1201.html',
    says: 'Yearly limit for radiation workers on Earth.',
    status: 'partial',
  },
  RAD_WATCH: {
    id: 'RAD_WATCH',
    title: 'Demo parameter: amber at 50% of the career limit, red at 100%',
    says: 'The 600 mSv limit is real. The 50% early-warning step is our own choice.',
    status: 'demo',
  },
  SLEEP: {
    id: 'SLEEP',
    title: 'Demo parameter: 7-day average sleep under 6 hours',
    says: 'ISS crews are reported to sleep about 6 hours a night (Barger et al., Lancet Neurology 2014; not re-checked by us yet). The 6 hour line is our own choice.',
    status: 'demo',
  },
  URINE_TARGET: {
    id: 'URINE_TARGET',
    title: 'NASA renal stone studies: urine output target of 2 L a day or more',
    url: 'https://ntrs.nasa.gov/citations/19970003315',
    says: 'NASA papers advise enough fluid to pass at least 2 litres of urine a day (later documents say 2.0 to 2.5) to keep stone-forming salts dissolved.',
    status: 'partial',
  },
  URINE_RISK: {
    id: 'URINE_RISK',
    title: 'NASA risk report: renal stone formation in spaceflight',
    url: 'https://ntrs.nasa.gov/api/citations/20170004709/downloads/20170004709.pdf',
    says: 'The main causes in space are extra calcium in the urine from bone loss, and low urine volume.',
    status: 'partial',
  },
  URINE_EARTH: {
    id: 'URINE_EARTH',
    title: 'Demo parameter: 0.8 L a day as the low end of normal urine output on Earth',
    says: 'A common textbook figure. Not yet tied to a cited guideline.',
    status: 'demo',
  },
  BONE_LOSS: {
    id: 'BONE_LOSS',
    title: 'NASA Human Research Program: Risk of Spaceflight-Induced Bone Changes',
    url: 'https://www.nasa.gov/reference/risk-of-spaceflight-induced-bone-changes/',
    says: 'Before modern resistance devices, crews on 4 to 6 month missions lost about 1 to 1.5% of bone density a month at the hip and spine. Resistance exercise reduces the loss but does not remove it. NASA states the same figure and notes that bone is scanned only before and after flight.',
    status: 'verified',
  },
  EXERCISE_PLAN: {
    id: 'EXERCISE_PLAN',
    title: 'Demo parameter: at least 5 resistance sessions a week in flight',
    says: 'ISS crews exercise most days, but we have not confirmed the exact prescription in a NASA document. The cut-off is our own choice.',
    status: 'demo',
  },
  EXERCISE_EARTH: {
    id: 'EXERCISE_EARTH',
    title: 'WHO 2020 physical activity guideline: strength training 2 or more days a week',
    url: 'https://www.who.int/publications/i/item/9789240015128',
    says: 'Adults should do muscle-strengthening activity on 2 or more days a week.',
    status: 'partial',
  },
  HAZARDS: {
    id: 'HAZARDS',
    title: 'NASA Human Research Program: the five hazards of human spaceflight',
    url: 'https://www.nasa.gov/hrp/hazards/',
    says: 'Space radiation, isolation and confinement, distance from Earth, gravity fields, and hostile closed environments.',
    status: 'verified',
  },
  MOOD: {
    id: 'MOOD',
    title: 'Demo parameter: 7-day mood average under 2.5 out of 5',
    says: 'Mood is one of the indicators the challenge names. The scale and the cut-off are our own choice.',
    status: 'demo',
  },
  BASICS: {
    id: 'BASICS',
    title: 'Demo parameter: ordinary Earth clinical limits for blood pressure, temperature and blood sugar',
    says: 'Fever from 38.0 C, blood pressure high from 140/90 and low under 90, blood sugar low under 70 and high over 180 mg/dL. Common clinical conventions, not yet tied to a cited guideline, and not space-specific.',
    status: 'demo',
  },
  VITALS: {
    id: 'VITALS',
    title: 'Demo parameter: general clinical convention for oxygen level and resting heart rate',
    says: 'Oxygen saturation under 94% (amber) or under 90% (red); resting heart rate over 100. Not space-specific and not yet tied to a cited guideline.',
    status: 'demo',
  },
}
