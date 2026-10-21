# Film 12 — An Enzyme, a Receptor, a Clinical Question
## Research verification, causal constraints and cinematography ledger

**Production:** Film 12 of 35. Review branch `cinema/ace2-covid-v20-clinical-evidence`, review draft only, public website and older masters untouched.

### Primary study and clinical scope

Elrayess, M. A.; Zedan, H. T.; Alattar, R. A.; Abusriwil, H.; **Al-Ruweidi, M. K. A. A.**; et al. *Soluble ACE2 and angiotensin II levels are modulated in hypertensive COVID-19 patients treated with different antihypertension drugs*. **Blood Pressure** **31** (2022), 80–90. https://doi.org/10.1080/08037051.2022.2055530; PMID 35548940. [Open-access full text](https://www.tandfonline.com/doi/full/10.1080/08037051.2022.2055530).

**Design:** multicenter cross-sectional observational study in Qatar, with 200 hypertensive hospitalized COVID-19 patients. This was not randomized medication allocation, a clinical efficacy trial or a prospective interventional study. Recorded medication categories: ACE inhibitor **57**, angiotensin receptor blocker **68**, beta blocker **15**, calcium-channel blocker **30**; another **30** were not classified by treatment in the paper's data description (total 200). The film renders five blocks, distinguishing missing classification from a randomized control group. Patients had received their antihypertensive medication for at least 30 days before hospital admission.

**Assays:** circulating soluble ACE2 and angiotensin II measured by ELISA; do **not** conflate soluble ACE2 serum measurements with membrane-bound ACE2 receptor availability, tissue-specific SARS-CoV-2 entry, or measured in-cell ACE2 activity. The animated pathway labels the general ACE2 conversion of angiotensin II into Ang-(1–7), which is biological context, not a specific measured reaction in this cohort.

**Reported findings selected conservatively:** severe-COVID group had ~**1.9×** soluble ACE2 relative to mild; mild group had ~**1.2×** angiotensin II relative to severe; correlation of ACE2 with hospital length of stay **r=0.30, p=0.003**. These are *associations*, not treatment effects. The paper also reports other contrasts among medication groups, but our short film avoids false precision, invented error bars, original concentration values or unsupported causal interpretations.

**Data-quality caveat:** the abstract gives COVID-19 severity category counts of mild n=76, moderate n=76, severe n=52, summing to **204**, inconsistent with the stated **200** enrolled participants. This may be a reporting error, overlapping categorization, or another explanation, but cannot safely be resolved here. The film deliberately **does not depict severity-group sample counts**. The group counts by medication are separately described and reconcile after including the 30 unclassified records. This limitation warrants direct study-author clarification for any manuscript or data visualization using severity counts.

**No medication instruction:** The paper's observed lower severity in the small beta blocker group (n=15) cannot establish beta-blocker protection, mortality reduction, or a justified prescription change. No ACE inhibitor, ARB, beta blocker, or calcium-channel blocker should be stopped or switched based on the film. Decisions require current clinical evidence and individualized evaluation. This is historical interpretation of a 2022 study, not current management guidance.

### Explicit boundary between footage and explanation

- Chapter 1: atmospheric context photograph from `assets/evidence-pulmonary.webp`, labelled **not a participant**. The floating enzyme-like shapes are modern artistic illustrations, not electron micrographs or molecular reconstructions.
- Chapter 2: an animated membrane ACE2 motif, soluble ACE2 and angiotensin II orbit; schematic kinetic patterns only, never empirical transport, structure, kinetics, or receptor occupancy.
- Chapter 3: **200 anonymous dots** allocated to the five described medication-class / missing-category bins. Each dot stands for a nominal subject from the published *count* and contains no personal or demographic data. No real participant record is accessed or invented.
- Chapter 4: source-reported approximate fold differences, with no invented quantitative plots, axes, patient data, distribution traces or false uncertainty.
- Chapter 5: a dynamic, explicitly illustrative confounding network. Edges are not estimated causal effects or output of actual multivariable causal inference. Cross-sectional design and small BB subgroup are identified.
- Chapter 6: `assets/research-archive-2026/echocardiography-spectral-doppler-workstation.webp` is **general healthcare workstation context**, not ELISA equipment and not a patient from the trial. Closing message refuses prescribing based on cohort-level association.

### Editorial and production standards

Preserve existing source narration `assets/films/series-v7-pilots/ace2-covid-drugs.mp4` and its full **12-cue** WebVTT, with unchanged 84-second timeline. Six continuously moving 14-second scenes. Code-driven Canvas2D seeks independently to t; rendered by open-source Chromium Playwright, Python, FFmpeg and no-cost synthesized atmospheric soundtrack. Native 1920 × 1080, 24 fps = 2,016 frames. Source photographs load from the original repository, with no paid stock media or synthetic hospital-patient scene.

Required checks: all six scenes exhibit meaningful time evolution and frame-seek reproducibility, published cohort arithmetic and actual DOI, original narration/captions, exact MP4 duration and video resolution, video-only decoded one-second hash variation, EBU R128 integrated loudness and decoded AAC **true peak not above −1 dBTP**, SHA-256 provenance. Human viewing/listening, internal numerical review, mobile caption legibility, image rights and the author's artistic approval remain necessary: automated motion checks cannot prove exceptional cinematic storytelling.

**Release control:** draft pull request only. Do not merge, modify previous video assets or update the public site. Await explicit user instruction before Film 13.
