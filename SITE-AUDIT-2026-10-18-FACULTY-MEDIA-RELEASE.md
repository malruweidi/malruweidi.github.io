# Ruwaidix faculty and scientific-media release audit — 18 October 2026

## Scope and preservation
This document is repository-facing quality documentation, not website copy, a film transcript, or text to render in any public video. The existing Ruwaidix visual language, original homepage/archive, routes, media, scientific bibliography, and bilingual records are preserved. The site's author requested **no downloadable CV**. Do not add one.

## Academic presentation: changes delivered
- `/for-supervisors.html`: scientist-focused navigation and concise record, distinguishing completed methods from future doctoral training.
- `/research/high-speed-zebrafish-imaging.html`: author-identified acquisition-system implementation and imaging-protocol writing, distinguished from the collaborative paper's group analysis. Published source: *Micron* (2020), DOI [10.1016/j.micron.2020.102876](https://doi.org/10.1016/j.micron.2020.102876).
- `/research/plasma-modified-pla.html`: distinct PLA-film/adhesion and electrospun-scaffold/antimicrobial experiments, analytical readouts and controls. Sources: *Polymers* (2021), DOI [10.3390/polym13213717](https://doi.org/10.3390/polym13213717); *Surface and Coatings Technology* (2020), DOI [10.1016/j.surfcoat.2020.126216](https://doi.org/10.1016/j.surfcoat.2020.126216).
- `/research/pulmonary-epithelial-injury.html`: original airway-reopening experimental design, static and bubble-flow comparators, pretreatment, fluorescence, cytoskeletal/AFM readouts and limits of extrapolation. Sources: *Journal of Applied Physiology* (2021), DOI [10.1152/japplphysiol.00574.2020](https://doi.org/10.1152/japplphysiol.00574.2020); complementary *Methods and Protocols* (2020), DOI [10.3390/mps3040065](https://doi.org/10.3390/mps3040065).
- `/doctoral-concepts.html`: two prospective, falsifiable research starting points, both with proposed controls, endpoints, experimental scope, alternatives and stopping criteria. Click/medicinal chemistry, targeted degradation, aptamer-directed circRNA delivery, microfluidic formulation and pharmacology are training ambitions, **not** claimed completed techniques.
- `/research.html`, research horizon, publications, CV, sitemap and site search index updated additively.

## Evidence provenance and attribution reconciliation

**1. First-author pulmonary original study.** Original article credits Mahmoud with performing experiments, analysing data, interpreting results, preparing figures and drafting the manuscript. The author-contribution statement assigns the initial conception and design to H. C. Yalcin. Preserve this distinction. Source: [PMCID PMC8384562](https://pmc.ncbi.nlm.nih.gov/articles/PMC8384562/).

**2. Flow-chamber method paper.** Published *Methods and Protocols* author statement credits Mahmoud in methodology, software, formal analysis and original draft writing. It credits Yalcin in conceptualization. Source: [PMCID PMC7712398](https://pmc.ncbi.nlm.nih.gov/articles/PMC7712398/).

**3. PLA-film paper.** Published 2021 *Polymers* author-contribution statement credits Mahmoud (initials M.K.A.A.A.-R.) with **investigation and formal analysis**, but not with the formal 'writing—original draft' or 'writing—review and editing' categories. He personally recalls collaborative manuscript writing; the public site should clearly distinguish that firsthand recollection from the journal's formal CRediT record rather than silently assign him formal drafting. Source: [DOI 10.3390/polym13213717](https://doi.org/10.3390/polym13213717) and the paper's published Author Contributions section.

**4. Electrospun antimicrobial scaffolds.** A distinct 2020 study with antimicrobial endpoints; DO NOT copy the 2021 film-adhesion percentage gains onto this scaffold study. Source: [DOI 10.1016/j.surfcoat.2020.126216](https://doi.org/10.1016/j.surfcoat.2020.126216). Individual CRediT categories in this paper were not independently reconciled in this audit; the individual account remains the author's testimony, not publisher certification.

**5. Endothelial-cilia and curcumin papers.** The author explicitly says his involvement in these two papers was experimental only, without paper data analysis, interpretation or manuscript writing. Do not infer otherwise from general zebrafish expertise or another paper's techniques. Separate the 2018 vascular-cilia paper from the 2020 cardiac-imaging methods publication.

**6. Fetal echocardiography AI.** The author reports a full co-first contribution to data preparation, model development, evaluation, interpretation and manuscript. Verify formal equal-contribution designation against the final IEEE version when using a formal application.

**7. Clinical ACE2 and soluble ACE2 review.** The author's own account includes securing funding, research, analysis, interpretation and writing on the clinical study and personally proposing the soluble-ACE2 conceptual interpretation for the review. Neither review nor grant description should imply a hypothesis was experimentally established by the review. Clinical source: [DOI 10.1080/08037051.2022.2055530](https://doi.org/10.1080/08037051.2022.2055530); conceptual review: [DOI 10.3390/ijms22136703](https://doi.org/10.3390/ijms22136703). Specific grant-award records need separate corroboration before claiming named PI status.

**8. Chapters.** Preserve formal publisher author ordering, including the first-listed GI-autoimmunity chapters versus the Wiley heart-failure sensors chapter (second-listed). Keep accepted/forthcoming items separate from published works; never infer experimental results from a review or chapter.

## Scientific film release verification: what has been checked

- `assets/films/series-v6/releases.json`: 30 registered releases. The existing source integrity script checks the manifest schema, count, IDs, positive durations, and MP4/VTT/JSON/WebP files.
- `assets/films/series-v7-pilots/releases.json`: 14 registered revisions; all 14 English VTT files were read at source. Their opening content matched the named subject at a basic semantic level, and none had obvious strings for editorial notes, placeholders, shot lists, contact sheets, 'date not verified' or manifests.
- `assets/films/series-v8-primary`: five source-priority titles in the cinema catalogue (PLA scaffold, PLA grafting, microfluidic-virus review, flow-chamber method and *Making Medicines Keep*). All five English VTT files were read; no obvious production-note contamination was found. V8 videos for one title and the linked subtitles could be located at their GitHub paths. A full per-frame audiovisual review has **not** been completed.
- The public pulmonary research page no longer advertises a complete transcript in its linked evidence-film call-to-action. Production transcripts and film planning notes belong in GitHub documentation, not on film pages.

### What subtitle and source checks cannot establish
The audit does **not** establish (i) video playback in a browser, (ii) absence of research inaccuracies or unsuitable imagery in video frames, (iii) rights clearance for every depicted figure, (iv) captions synchronized to audiovisual narration, (v) whether each film uses the correct original figure rather than a different project, or (vi) viewing quality on mobile devices. These require review of the rendered audiovisual media. A GitHub SHA, MP4 existence, or passing static test is not enough.

## Live-site/deployment checks
The public web reader retrieved an **older homepage snapshot** on 18 October 2026 (lacking the newly added faculty link), while the new faculty page could not be fetched by that reader. This could be an intermediary cache and is **not** evidence that GitHub Pages failed to deploy. GitHub-connected repository source contains all new pages. GitHub combined-status and commit workflow lookups did not yield a status or relevant workflow run for the checked push commit. Therefore deployment is **not independently signed off**.

### Human/browser acceptance checklist
- [ ] Open production homepage and new faculty, two case studies, and two concepts, checking that updates are visible.
- [ ] Click all links from homepage → faculty page → dossier or doctoral concept → DOI.
- [ ] View desktop at 1440 and 1024 px, tablet at 768 px, and mobile at 375 and 320 px.
- [ ] Verify font loading, contrast, keyboard focus, reduced motion, nav and in-page anchor positioning.
- [ ] Verify English/Arabic switches, Arabic RTL direction and content fidelity on bilingual pages.
- [ ] Play films at start, midpoint and end, with captions; ensure no production-facing material is rendered.
- [ ] Compare each movie's scientific diagrams, microscopy frames and numerical claims with its linked primary paper.
- [ ] Check external figures' attributions, permissions, source panels, axes and uncropped legends.
- [ ] Recheck broken external DOI/social links and outstanding owner-identified archival photographs.
- [ ] Confirm Pages deployment status and CI execution; only then mark visual/functional QA passed.

## Regression safeguard
`node scripts/site-integrity.cjs` contains additive assertions for the new page routes, discovery index, research content and registered film assets, including 14 V7 and five primary V8 titles. The checks establish local source consistency only; passing them cannot substitute for final browser- and media-level acceptance.

## Editorial direction
Do not extend the homepage into a large academic dossier. Keep the professor entry and new case-study routes concise, retaining the separate archival experience and the approved pine/paper editorial identity. Additional work should resolve documented defects, not rebuild what is already working.
