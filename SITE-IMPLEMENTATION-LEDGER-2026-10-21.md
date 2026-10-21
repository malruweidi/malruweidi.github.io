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
- **Pass III (current corrective branch):** PR #84 adds seven film-to-source reading trails, four distinctions in the research index, a meaningful main landmark in the CV, improved H1/film order in the histology standalone film, shared responsive styles and a deterministic media-placement source tool. A subsequent accessibility increment adds persistent motion control for the original homepage scientific-figure gallery.

## Changes staged
- `films/airway-reopening-evidence.html` and `films/what-a-bubble-can-do.html`: direct experimental dossier, original DOI and film comparison.
- `films/cairo-microscope.html`: personal chapter and archival instrument, with no pretence that journey footage exists.
- `films/making-medicines-keep.html`: article context, accepted/publication-status record and an independently accessible manuscript witness.
- `films/the-laboratory-we-carried-with-us.html`: named group and documented outreach/archive context.
- `films/the-ring-that-never-closed.html`: documented unsuccessful synthetic route and UREP23.
- `films/two-materials-no-section.html`: H1 before film in DOM order, source-linked unsuccessful histology and explicit separation from related research.
- `research.html`: compact reader-oriented evidence status distinctions, without changing any original research card.
- `cv.html`: add a unique `<main id="main">` landmark around the existing substantive profile.
- `index.html`, `assets/home-gallery-motion.css`, `assets/home-gallery-motion.js`: add a keyboard-operable, persistent pause-and-browse option for the six original scientific figures, without rewriting a caption, removing a figure, or altering the nine homepage chapters. Existing hover/focus pause and reduced-motion behavior remain; stopped motion exposes horizontal scrolling.
- `tests/home-gallery-motion.test.cjs`: acceptance checks for motion controls, toggle semantics, and original six-figure preservation, executed by site-integrity CI.
- `assets/evidence-threads-2026.css`: restrained, responsive, keyboard-visible source path styles.
- `scripts/build-media-placement-inventory.cjs`: enumerates source-visible `img`, `video`, `source`, `track` and posters by page, source line, nearest heading and file existence; **does not establish image provenance, visual position or film fidelity**.
- `tests/film-evidence-threads-2026.test.cjs`, `tests/media-placement-inventory.test.cjs`, `.github/workflows/site-integrity.yml`: regression and source-preservation gates.

## Pass II / Stories and photographic archive (source implementation)

The Stories landing page retains **all four original photographic route cards**, the long chapter sequence, original photographs and disclosure sections. Two mismatched covers were corrected: the actual Cairo microscope photograph now opens `#personal-microscope`, and the unsuccessful histology photograph opens `#zebrafish-histology-materials`. Its conceptual zebrafish image now explicitly says it is not experimental microscopy.

The eight `archive.html#rxOctoberPhotoArchive` object cards retain the same stored image assets, original descriptive text, chapter links and full archive beneath the catalogue. New stable card IDs (`object-cairo-microscope`, `object-molecular-model`, `object-zebrafish-histology`, `object-chemistry-festival`, `object-reagent-front`, `object-copolymer-sample`, `object-reagent-reverse`, `object-culture-hood`) permit citations directly to the correct photograph. Each original is linked for full inspection, with a secondary explicit text link and accessible focus state. The front and rear views of the same reagent bottle link to each other.

Five historic gallery photos are separately inspectable without removal or substitution. The three unsuccessful zebrafish histology photographs retain their distinct captions and can be opened at original resolution in **both** the Stories page and the standalone article. The standalone chapter must always remain an exact copy of the parent chapter: `tests/deep-reading.test.mjs` enforces this and was reconciled after photo-link insertion. Contextual material clearly distinguishes experimental failure, original photographic records and conceptual illustration.

`stories/cairo-microscope.html`, `stories/failed-zebrafish-histology.html` and `stories/unfortunate-copolymer-trials.html` include exact links to their archival objects, with newly added reader-visible Arabic translation entries. The approved Newsreader/DM Sans/DM Mono type choices, colors and responsive presentation remain.

The archive's **existing 4,324-character inline stylesheet was transferred verbatim** to `assets/archive-original-layout-2026.css`, with its reference occupying the original `<style>` position. This reduced archive HTML below the original 26 KB source-size test budget without cutting a photograph or sentence. The stylesheet contains no relative `url(...)` imports to break when relocated. The new `assets/story-archive-photo-access-2026.css` and `assets/story-archive-image-inspection-2026.css` add narrowly scoped source access and keyboard presentation.

The change set is guarded by `tests/story-archive-photographic-context.test.cjs`, `tests/stories-archive-visual-continuity-2026.test.cjs`, the pre-existing exact chapter preservation checks and the archival binary checks. **Source tests do not certify visual crop, color accuracy, photographer credit, identity, privacy consent or historical capture date.** Those still need original-file and real browser review before merging.

## Full HTML page-by-page review queue
An [x] means the source-level change is committed in draft PR #84, **not** that rendered-page visual QA, scientific source audit or final copyediting has been completed. Unchanged pages remain unchecked.

### Home and principal orientation (8 files)
- [x] `cv.html` — source change and regression guard in PR #84; visual approval pending
- [x] `index.html` — motion accessibility pass: readers can stop the figure-strip animation and browse the existing six links manually; visual and full copy review remain
- [ ] `publications.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `reading-map.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [x] `research.html` — source change and regression guard in PR #84; visual approval pending
- [ ] `search.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [x] `stories.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
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
- [x] `archive.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `behind-the-record.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `chem-squad.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `engagement.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `illness-and-evidence.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `leadership.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `major-revisions.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `scientific-fieldnotes-2026.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [x] `stories/cairo-microscope.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [x] `stories/failed-zebrafish-histology.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `stories/ramadan-microscope.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [ ] `stories/the-ring-that-never-closed.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
- [x] `stories/unfortunate-copolymer-trials.html` — no edit in this pass; page-by-page editorial, visual and evidence review remains
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

## Scientific figure source audit and release boundaries

**Scientific evidence reader:** Four unmodified image files on `evidence-viewer.html` now have individual scientific-source notes. The source is verified by the cited publication DOI for the 2021 pulmonary cell-injury paper, the 2018 vascular-cilia study, and the 2021 PLA surface-modification paper. **That verification does not establish an exact match between the stored website JPEG and any specific paper figure/panel**, because the original high-resolution image, publisher caption and usage rights have not yet been compared. The PLA paper presents a four-panel SEM comparison in its Figure 5; the website does not claim its archived JPEG is definitely one specific panel.

**Chemical-sensing attribution:** `figure-cyanide-sensor.jpg` remains associated on the website with the UREP23 imine project. A separate 2019 *Analytical Methods* study, DOI `10.1039/C9AY01557D`, investigated curcumin and cyanide. The matching analyte alone cannot justify reassigning the local JPEG to either paper; the viewer therefore marks its **image-to-publication attribution unresolved** rather than publishing a fabricated precise legend or conflating the two experiments.

**Source integrity:** `assets/scientific-figure-integrity-2026.json` records the four original JPEG sizes and exact checked-in Git blob SHA1 fingerprints, plus the distinct status of published papers, original image identities and figure legends. `tests/scientific-figure-binary-preservation-2026.test.cjs` checks the images remain bitwise identical. These fingerprints guard accidental replacement; they do **not** prove acquisition settings, scale bars, scientific ownership, reproduction license or image-panel provenance.

**Inspecting original material:** `evidence-viewer.html` retains each figure's displayed caption and provides a direct stored-image link. `imaging.html` now exposes the original MicroZebraLab image independently from its primary journal DOI and figures index. The existing zebrafish staging references retain their own linked source and full-image views.

**Atlas coverage:** `scripts/audit-figure-archive-2026.cjs` performs a deterministic, non-mutating audit over **every static HTML route** (including the large `figures.html` file). The audit records figure positions, associated image paths, alt text, caption presence and local file existence; CI displays the coverage summary. Dynamic JS galleries, CSS backgrounds, actual pixel content, magnification, spatial crop, image rights and publisher figure authentication are **outside** that structural test.

**Required before any public scientific source certification:** Visually compare each stored JPEG with the actual original paper figure and complete legend; verify panel labels, controls, axes, microscopy scales and image permissions; confirm correct research-contributor claims. These are intentionally flagged as pending rather than silently passed.

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

### Full-site figure scan and accessible context triage

The 21 October source audit covered **62 HTML pages, 180 `<figure>` elements and 152 `<img>` references inside figures** at its recorded branch snapshot. It found **zero** missing local image references, **zero** missing `alt` attributes in figure images, and **14** figures without a literal `<figcaption>` element. This is structural coverage, not pixel-level inspection or a comprehensive accessibility certification.

The 14 candidates were triaged rather than automatically given duplicate visible captions:

- Eight archive objects already had real headings and descriptive paragraphs immediately alongside their images. Those figures now use compact `aria-labelledby` references to their **unchanged** adjacent `<h3>` headings.
- Three homepage 2015 photographic records already had descriptive titles and dated archive text **inside the existing figure cards**. The `<figure>` elements now reference those unchanged visible titles using `aria-labelledby`; no new text or layout change was introduced.
- Three older embedded figures in `full-record.html` remain without a confirmed equivalent caption. They are not silently rewritten: their inline data, source figure provenance and location must first be inspected at the actual rendered pixel level. The image-specific review is explicitly outstanding.

`scripts/audit-figure-archive-2026.cjs --issues` now distinguishes figures that have neither `<figcaption>` **nor** an accessible figure label from figures using a valid nearby heading. Its output is non-mutating, source-position-aware and safe to inspect without exposing long inline image data.

**Merge-integration limitation:** The public `main` branch has concurrent filmmaking updates, with new V9–V22 primary cinema selections. The existing site-wide integrity script retains an older five-film V8-only selection assertion. As a result, GitHub's synthetic PR merge fails that **film-release rule** even when the preservation and scientific-figure checks succeed. This is not a reason to overwrite the newer films or weaken factual checks. A separate `.github/workflows/scientific-figure-source-integrity-2026.yml` runs scientific/figure integrity independently against the proposed merge. The main-integrity failure must be reconciled using the correct canonical movie editions before this draft PR can merge.

### Historical inline figures identified (read-only review, 21 October 2026)

The three previously unresolved `full-record.html` figures are **personal university-era photographs, not unidentified experimental charts**. Source-context extraction in the GitHub Actions runner identified their existing on-page title and personal-archive date, without transmitting their binary contents:

- **At the beginning** — inline photo described as a university-era lab-coat photograph; original page shows **5 January 2015**.
- **Learning in public** — inline photo described as a university-era photograph near a chalkboard; original page shows **19 October 2015**.
- **Asking questions** — inline photo described as a speaker with a microphone at an academic event; original page shows **6 May 2015**.

These titles and dates are **existing website labels**, not an independently confirmed EXIF/source provenance claim. All three carry descriptive image `alt` text and existing visible headings/date prose inside their figure elements. Their `<figure>` wrappers lack a literal `<figcaption>` or semantic `aria-labelledby` reference, so the automated source audit still flags the *semantic association*, even though visitors are not missing the visible titles. No duplicate captions, invented dates, new affiliations, binary transformations, or other edits were made to the roughly 1.9 MB historical original. `scripts/legacy-figure-context-audit-2026.cjs` and its tests now document their exact location and safely redact the embedded image payloads.

**Follow-up QA:** compare the existing photograph/date labels with original owner archive files before treating them as authenticated timestamps; optionally add semantic references *in the original source* using a checked and reversible edit if needed. Do not replace originals or add a synthetic research-paper source attribution to personal photographs.

### Verified film release compatibility and checksum checks

The old site-integrity assertion that five V8 masters **must remain the selected primary editions** was no longer valid after `main` adopted newer cinematic revisions (V9–V22). `scripts/cinema-verified-masters-integrity.cjs` now validates **the selected registered edition**, including the matching MP4, WebVTT and poster paths, caption hygiene, manifest runtime and MP4 SHA-256, without evaluating arbitrary page JavaScript. It also requires all five historical V8 movie, subtitle and poster binaries to be retained. The separate regression test `tests/cinema-verified-primary-evolution-2026.test.cjs` exercises legacy and newer edition formats, tampered checksum, missing media, duplicate identifiers and contaminated subtitle handling.

A matching SHA-256 verifies the checked-in video bytes; it **does not** constitute approval of editorial content, voiceover, frame accuracy, music rights, or scientific claims. Several newer release manifests explicitly identify themselves as *review masters* requiring final listening and human scientific/rights checks. Avoid labeling them human-approved solely because they are currently selected on the website.

## Required release gates before merging
1. CI: existing site-integrity checks plus the new editorial/media inventory tests pass on the **latest head SHA**.
2. Browser: real views at 320, 375, 768, 1024 and 1440px; keyboard, touch, zoom, EN/Arabic RTL, reduced motion, video fallback, direct anchor navigation and screen-reader landmarks.
3. Film: frame-level, scientific, narration, subtitle and copyright provenance checks, independent of unit tests.
4. Research: DOI/source and contribution audit, especially any work labeled ongoing, accepted or prospective.
5. Preservation: `main` unchanged; no unapproved alteration of historical claims, wording, original media, private information, nine homepage chapters, existing routes or prior film editions.

**Status:** Implementation staged in a draft pull request. Not published. Automated tests are necessary but not a substitute for the remaining rendered and editorial review.
