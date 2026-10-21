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

### Real Chrome rendering and interaction release pass (21 October 2026)

A new GitHub Actions workflow, `.github/workflows/chrome-layout-release-review-2026.yml`, uses the free `playwright-core@1.56.1` driver and the GitHub runner's existing Chrome browser against a localhost copy of the **proposed pull-request merge**, without hosting changes or a deployment. `scripts/browser-release-qa-2026.cjs` captures screenshot and structured DOM/interaction evidence for the original site routes. The entire package is available as the GitHub Actions artifact attached to each Chrome run.

- **Coverage:** ten representative page routes (home, Stories, archive, research, evidence viewer, illness narrative, search, cinema, documentary and academic CV) at three shared widths (375, 768, 1440px), plus six key routes at 320px and 1024px. The test checks one visible H1, one main landmark, horizontal overflow, local image loading and uncaught browser JavaScript errors. A failing viewport, image or route is recorded in the JSON report rather than ignored.
- **Interactions:** expandable mobile Explore menu, correct microscope chapter link, Arabic/RTL illness-story toggle and overflow, actual search results, one direct Find link on the existing evidence-reader header, and standalone documentary MP4 metadata, original poster, and caption track.
- **Screenshots:** fourteen original Chrome viewport screenshots (seven representative pages at 375px and 1440px), one authentic Arabic/RTL mobile screenshot, and three native video-element stills at 1, 30 and 60 seconds. These are evidence of actual Chrome painting/seek capability, **not** final cinematography, narration, audio quality or film frame-by-frame certification. They are uploaded along with `report.json` and a concise QA summary on every run, even if a test fails.
- **Actual verified result:** GitHub Actions run `39609844946` for commit `435499fe08d7e6a7f18dcf9bb7a45d92cb692a2e` completed **PASS**, yielding 48 completed route/interaction checks, 18 screenshots, **zero blocking issues and zero advisories**. The snapshots were visually inspected in the audit: original homepage and Stories branding, archival photograph treatments, evidence typography, mobile search, personal illness page and its real RTL Arabic rendering all appeared without gross horizontal clipping in the captured initial viewports.
- **Resolved visual defect:** Before correction, the evidence viewer's header visibly rendered the original `Find` destination **twice**: a static site-navigation link and a duplicate injected by `assets/discovery-global.js`. The enhancement now first checks for an existing direct search link, retaining the original, the global keyboard shortcut, and the injected link on other pages that actually need one. Its regression tests are included in both browser and source-level integrity workflows.
- **Limits:** This is viewport and representative-flow testing, not exhaustive screenshots of all 62+ routes or of full scroll lengths. Third-party image copyright/rights, actual screen-reader speech, font rendering on every operating system, target contrast ratios, all video cuts, mobile performance and source-specific figure panel verification still need independent tests.

### Measured WCAG baseline and film-frame screenshot reliability (21 October 2026)

The existing Chrome screenshot artefact `ruwaidix-browser-release-39610709580` was retrieved and inspected as actual images. The approved paper/pine/copper editorial hierarchy, first-fold desktop/mobile Stories/archive layouts, archive image positions, and Arabic RTL illness page are legible in these representative captures. **This is not certification of every scroll position, image, or browser.**

Review revealed a specific verification weakness: Chrome's native video-element screenshots at 1, 30, and 60 seconds include controls that still display `0:00 / 2:00`, and have very small image differences. Because they cannot confidently establish distinct scene composition, the repository now includes `scripts/sample-film-frames-2026.cjs`, which extracts **actual decoded frames directly from the unchanged MP4** using free local FFmpeg at 1, 30, and 60 seconds, compares their RGB values, and stores independent JPEGs plus `decoded-film-review.json`. A decoder frame is still not proof of factual accuracy, motion quality, voiceover or image rights.

The first source-preserving Chrome/axe audit evaluated nine representative routes at 375 and 1440px under automated WCAG 2.0/2.1 A/AA rules, yielding **92 serious element occurrences** (46 repeated at both widths). All arose from `color-contrast` detection; no critical automated violations were found in that sample. Findings clustered in muted-small-label styles on seven pages: home (4 unique elements), Stories (1), archive (7), search (21 instances), illness narrative (11), publication cinema (1) and standalone documentary (1). Those are *element occurrences*, not 92 independent design decisions. The report is `wcag-axe-report.json` in the GitHub Actions browser QA artifact, with identifiers/selectors but without sensitive page HTML.

A restrained additive `assets/wcag-contrast-2026.css` now adjusts **text color only** on the affected seven pages, within the approved dark-pine/terracotta palette, preserving original headings, all captions, photos and layouts. The new token test checks contrast ratios against the actual sampled archival backgrounds. The actual follow-up WCAG scan must be inspected to confirm that CSS cascade and dynamic elements honor these fixes; **do not assume the initial 92 findings are resolved simply because a stylesheet was added**.

Accessibility caveat: automated axe rules do not test truthful `alt` content, precise reading order, real screen-reader voicing, keyboard clarity or 400% reflow. Human review is still required, especially on bilingual medical and scientific figure pages.

### Keyboard, archive audio, and WCAG incomplete-items review (21 October 2026)

**Actual browser verification:** GitHub Actions run `39618854602` on the proposed draft-PR merge passed the existing Chrome route/screenshot test, the independent FFmpeg film-frame samples, the WCAG accessibility scan, and an additional set of **10 keyboard/reflow checks with zero failures**. `scripts/keyboard-reflow-qa-2026.cjs` visits the Stories, publications, cinema, search and illness narrative at **320 CSS pixels**; tests horizontal reflow and the presence of a main landmark and H1; verifies focus/Enter/keyboard skip-link behavior, Escape closing the mobile Explore panel and restoring focus, publication/film filter Enter operation and maintained focus, and Arabic keyboard language switching with RTL reflow. A 320px test is an equivalent-*width* proxy for WCAG reflow at 400% of a 1280px desktop layout, **not** genuine browser zoom at every platform/text-size setting.

**Accessible named filters:** The two previously ambiguous `aria-label` attributes on otherwise generic filter containers in `publications.html` and `publication-cinema.html` now have `role="group"`. Their original filter buttons, `aria-pressed` values, visible text, behavior and catalogue records are unchanged; a source-level regression and real keyboard Enter tests guard the semantics.

**Zero detected WCAG violations is not the same as zero manual review items.** The independent automated audit `39616234783` reported **zero rule violations** across 26 route/language/state checks, with **25 inconclusive rule instances**, comprising 14 color-contrast cases involving complex painted backgrounds, six `video-caption` instances, four `aria-prohibited-attr` instances and one `link-in-text-block` instance. The two generic filter ARIA cases have since been corrected; the audit's incomplete items are not automatically proven failures or passes, and the new source-level fixes require re-review against the latest head.

**Actual archived MP4 metadata:** `scripts/audit-archival-video-audio-2026.cjs` uses FFprobe against all **ten original non-cinema archival video files**. On run `39618854602`, four contain **no audio stream** and six **do contain an audio stream**. The six are: `khaled-jama-thesis-reaction.mp4`, `desk-screen-break.mp4`, `football-jersey-moment.mp4`, `informal-conversation.mp4`, `midnight-organic-board.mp4`, and `room-0321.mp4`. Metadata does not reveal whether these streams contain narration, music, ambient noises or intelligible private conversation. **Before approving captions or accessibility**, an owner-authorized listening review must distinguish meaningful speech, intended publication rights, privacy and synchronization; no automated speech-to-text, reenactment or public transcript was created. All ten MP4 files remain bitwise unchanged. A silent clip still requires adequate visible context.

**Manual review still needed:** True browser text-zoom checks, screen reader announcements across EN/AR, nuanced color contrast over photography, long full-page scrolling, actual audible film performance, and copyright/figure panel verification. The automated scans and 10 passing keyboard controls do **not** certify complete WCAG conformance or film release readiness.

## Required release gates before merging
1. CI: existing site-integrity checks plus the new editorial/media inventory tests pass on the **latest head SHA**.
2. Browser: real views at 320, 375, 768, 1024 and 1440px; keyboard, touch, zoom, EN/Arabic RTL, reduced motion, video fallback, direct anchor navigation and screen-reader landmarks.
3. Film: frame-level, scientific, narration, subtitle and copyright provenance checks, independent of unit tests.
4. Research: DOI/source and contribution audit, especially any work labeled ongoing, accepted or prospective.
5. Preservation: `main` unchanged; no unapproved alteration of historical claims, wording, original media, private information, nine homepage chapters, existing routes or prior film editions.

**Status:** Implementation staged in a draft pull request. Not published. Automated tests are necessary but not a substitute for the remaining rendered and editorial review.
