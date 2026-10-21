# Ruwaidix preservation-first implementation ledger · 21 October 2026

**Scope:** audit-based implementation, source-first, no deletion or compression of the scientific and historical record. This document is an internal repository review log, **not public page copy**.

## Five parallel review responsibilities
1. UI/UX and engineering: navigable hierarchy, keyboard/RTL accessibility, mobile layout, valid deep links, file integrity and measurable performance.
2. Scientist: primary evidence, methods and controls, factual attributions, separated states of publication versus ongoing/prospective work.
3. Film director and scientific cinematographer: verify original footage versus reconstruction, shot-by-shot intelligibility, motion motivation, subtitle alignment, sound and source citations.
4. Literary editor: sentence-level voice, chronology, first-person authenticity, failure narratives and caption-context positioning, not generic corporate writing.
5. Attention/cognitive researcher: information scent, meaningful choice, appropriate detail by audience, readable typography and nonmanipulative motion.

## Three passes and their current state
- **Pass I (source inspection):** inventory of 62 HTML files, checked-in WebP/MP4 source families, main routes, past audit documents and central navigation/testing systems. Visual and cinema review remains incomplete.
- **Pass II (adversarial review):** preserve the nine-chapter homepage and full archived record; prefer links from finished films to their verified evidence; do not fabricate scientific media or turn recorded failure into success; leave ongoing film PRs unmerged.
- **Pass III (current corrective branch):** PR #84 adds seven film-to-source reading trails, four distinctions in the research index, a meaningful main landmark in the CV, improved H1/film order in the histology standalone film, shared responsive styles and a deterministic media-placement source tool.

## Changes staged
- `films/airway-reopening-evidence.html` and `films/what-a-bubble-can-do.html`: direct experimental dossier, original DOI and film comparison.
- `films/cairo-microscope.html`: personal chapter and archival instrument, with no pretence that journey footage exists.
- `films/making-medicines-keep.html`: article context, accepted/publication-status record and an independently accessible manuscript witness.
- `films/the-laboratory-we-carried-with-us.html`: named group and documented outreach/archive context.
- `films/the-ring-that-never-closed.html`: documented unsuccessful synthetic route and UREP23.
- `films/two-materials-no-section.html`: H1 before film in DOM order, source-linked unsuccessful histology and explicit separation from related research.
- `research.html`: compact reader-oriented evidence status distinctions, without changing any original research card.
- `cv.html`: add a unique `<main id="main">` landmark around the existing substantive profile.
- `assets/evidence-threads-2026.css`: restrained, responsive, keyboard-visible source path styles.
- `scripts/build-media-placement-inventory.cjs`: enumerates source-visible `img`, `video`, `source`, `track` and posters by page, source line, nearest heading and file existence; **does not establish image provenance, visual position or film fidelity**.
- `tests/film-evidence-threads-2026.test.cjs`, `tests/media-placement-inventory.test.cjs`, `.github/workflows/site-integrity.yml`: regression and source-preservation gates.

## Full HTML page-by-page review queue
An [x] means the source-level change is committed in draft PR #84, **not** that rendered-page visual QA, scientific source audit or final copyediting has been completed. Unchanged pages remain unchecked.

### Home and principal orientation (8 files)
- [x] `cv.html` — source change and regression guard in PR #84; visual approval pending
- [ ] `index.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `publications.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `reading-map.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [x] `research.html` — source change and regression guard in PR #84; visual approval pending
- [ ] `search.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `stories.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `writing.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains

### Research, grant and scientific evidence (20 files)
- [ ] `computing.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `doctoral-concepts.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `evidence-viewer.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `figures.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `full-record.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `grants.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `grants/urep19.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `grants/urep21.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `grants/urep22.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `grants/urep23.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `imaging.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `methods-evidence.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `molecular-therapeutics.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `research-horizon.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `research/high-speed-zebrafish-imaging.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `research/inhalable-vesicles.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `research/plasma-modified-pla.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `research/pulmonary-epithelial-injury.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `research/zebrafish-vascular-cilia.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `techniques.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains

### Storytelling, people, learning and historical archive (14 files)
- [ ] `archive.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `behind-the-record.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `chem-squad.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `engagement.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `illness-and-evidence.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `leadership.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `major-revisions.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `scientific-fieldnotes-2026.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `stories/cairo-microscope.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `stories/failed-zebrafish-histology.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `stories/ramadan-microscope.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `stories/the-ring-that-never-closed.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `stories/unfortunate-copolymer-trials.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `training.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains

### Film and cinematography (12 files)
- [ ] `film.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `films.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [x] `films/airway-reopening-evidence.html` — source change and regression guard in PR #84; visual approval pending
- [x] `films/cairo-microscope.html` — source change and regression guard in PR #84; visual approval pending
- [ ] `films/index.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [x] `films/making-medicines-keep.html` — source change and regression guard in PR #84; visual approval pending
- [x] `films/the-laboratory-we-carried-with-us.html` — source change and regression guard in PR #84; visual approval pending
- [x] `films/the-ring-that-never-closed.html` — source change and regression guard in PR #84; visual approval pending
- [x] `films/two-materials-no-section.html` — source change and regression guard in PR #84; visual approval pending
- [x] `films/what-a-bubble-can-do.html` — source change and regression guard in PR #84; visual approval pending
- [ ] `moving-evidence.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `publication-cinema.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains

### Reading and viewing recommendations (4 files)
- [ ] `recommendations.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `recommended-books.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `recommended-essays.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `recommended-screen.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains

### Working and historical previews (4 files)
- [ ] `cinema-quality-preview.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `cinema-research-preview.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `for-supervisors.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `preview-rx23.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains

## Photo-by-photo acceptance protocol
- Identify the original binary and document who or what the image depicts, using source evidence and firsthand identification where appropriate.
- Record every checked-in HTML usage through `node scripts/build-media-placement-inventory.cjs --output /tmp/ruwaidix-media.json`.
- Supplement with original media referenced by CSS, JS-injected galleries and dynamic cinema; source-only enumeration does not cover these.
- Inspect the real image at its existing desktop/mobile placement. Check focal point, correct aspect mode, non-destructive cropping, captions, semantic `alt`, image sizes and whether graphic annotations/scales remain legible.
- For charts/figures, retain the original units, axis labels, instrument settings, publication source, uncertainty and limits of inference.
- For personally significant or sensitive images, perform an editorial privacy review without automatically deleting the narrative or historically important photograph.
- Do not add a new location/date, depict a new person, or treat a photograph of equipment as proof of an experimental result.

## Movie-by-movie release protocol
- Inventory source paper, figures, raw footage, footage permission, storyboard, narration, MP4 poster and VTT.
- Validate claims against the primary study and distinguish filmed evidence from schematic animation.
- Screen at 0:00, each chapter boundary and end; assess purposeful motion, audio balance, pacing, legibility and subtitle sync.
- Preserve all older editions in the source archive; choose the public edition only after visual and scientific review and a working fallback.
- Do not merge competing film PRs en masse: there are many overlapping open editions. Evaluate one title at a time and record the chosen canonical cut.

## Required release gates before merging
1. CI: existing site-integrity checks plus the new editorial/media inventory tests pass on the **latest head SHA**.
2. Browser: real views at 320, 375, 768, 1024 and 1440px; keyboard, touch, zoom, EN/Arabic RTL, reduced motion, video fallback, direct anchor navigation and screen-reader landmarks.
3. Film: frame-level, scientific, narration, subtitle and copyright provenance checks, independent of unit tests.
4. Research: DOI/source and contribution audit, especially any work labeled ongoing, accepted or prospective.
5. Preservation: `main` unchanged; no unapproved alteration of historical claims, wording, original media, private information, nine homepage chapters, existing routes or prior film editions.

**Status:** Implementation staged in a draft pull request. Not published. Automated tests are necessary but not a substitute for the remaining rendered and editorial review.
