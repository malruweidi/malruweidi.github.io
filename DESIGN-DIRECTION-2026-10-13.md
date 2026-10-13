# Ruwaidix: research-first visual direction (13 October 2026)

## Purpose

The website is a documentary research archive, literary biography, and academic portfolio. A more cinematic appearance must clarify its evidence and human story, not obscure them. Visual inspiration came from a public discussion of professional, cinematic web design (https://x.com/chesny/status/2109323894465446217); the linked 21-minute video was not fully accessible for direct examination. These are editorial decisions for this website, **not a claimed transcript of that video**.

## Preservation contract

- Do not delete or overwrite existing research entries, documents, photographs, films, scientific techniques, person attributions, citations, dates, chronology, pages or navigation routes during stylistic revisions.
- Do not present conceptual diagrams as experimental data; do not assign provenance from image appearance alone.
- Keep historical photographic labels as labels unless independent capture-date evidence exists. The user's firsthand caption identification is authoritative for context, while technical and publication claims still require verification.
- Respect privacy: obscure identifying clinical information, names and screens where needed before publishing. Never replace actual subject matter with an invented synthetic scene.
- Retain English/Arabic readability and do not turn nationality or the experience of illness into promotional identity branding.

## Visual system

1. **Scientific documentary, not animated sales page.** Authentic laboratory and community imagery leads; typographic hierarchy and negative space provide drama.
2. **An edited film in chapters.** Introductory portrait, origins, scientific problems, methods, publications, and archival evidence have distinct pacing and useful bridges.
3. **One source of truth for meaning.** A beautiful photo is not a source for a person's name, an experiment's outcome, or a clinical diagnosis. Captions specify what is known and what is not.
4. **Art direction without cropping evidence.** Use a featured opening frame in photographic galleries, but contain images when cropping would remove people, technical labels, Doppler scales, microscopy context or chart axes.
5. **Elegant restraint.** The serif/sans/mono type pairing, dark pine and warm paper colors, Ruwaidix logo, and readable metadata are the consistent identity. Avoid gratuitous parallax, autoplay, forced animation, giant numerical claims or glow effects.
6. **Fast, accessible and genuine.** Media is lazy-loaded where appropriate. Keyboard navigation, focus indicators, clear contrast, mobile behavior and reduced motion are essential.

## Applied implementation

- `assets/final-polish-2026.css`: editorial page framing, a featured first image in authentic galleries, research-image fidelity, responsive layout and optional hover motion.
- Existing HTML, older CSS, complete photographic manifest, JS galleries and other media are retained.
- Further style updates should favor measured edits to established styles rather than proliferating conflicting global overrides.

## Verification still required

Source-level edits and successful GitHub commits are **not** equivalent to published cross-browser sign-off. Check the deployed GitHub Pages build, desktop and mobile layouts at 320, 375, 768, 1024 and 1440 px, Arabic text, menu focus, image captions and archival-photo uncropped presentation. Recheck media paths and permissions before describing the live site as fully validated.


## Follow-up implementation and validation (13 October 2026)

The following work builds on the first CSS-only cinematic refinement. It is intentionally additive.

- `index.html`: inserted a compact, accessible research-evidence index after the introductory portrait. Direct destinations are the research CV, original figures and evidence, techniques atlas, and the existing public Google Scholar profile. The former introductory story and every research section remain intact.
- `assets/final-polish-2026.css`: styled the new index at desktop and mobile widths, corrected selectors to the site's actual `.rx-editorial-hero` / `.rx-hero-title` markup, and repaired inherited light-on-light text in the pulmonary-research primary card.
- `assets/homepage-editorial-i18n-2026.js`: translated the new index and the current homepage introductory paragraphs instead of relying on translation entries for superseded copy.
- `assets/archive-restoration.js` and `.css`: upgraded the 30-image dialog with previous/next navigation, keyboard arrows, range limits, localized controls, a live photo counter, and focus return to the triggering link. The existing 30 photographs, categories, source statements and recording are unchanged.

### Source checks completed

Fourteen static checks passed: presence of the one-and-only academic index, its four target URLs, required CSS and JS inclusion, JavaScript parsing, archive viewer navigation and focus-return hooks, 30 unique archival records, nine described research photographs and one described research video. All eleven referenced research-media binaries (nine WEBP images, one MP4 and its WEBP poster) were individually found in GitHub.

These are source and repository-object checks, **not** evidence of completed mobile visual QA, successful current GitHub Pages deployment, WCAG conformance, or verified photographic provenance. The direct website and referenced X post could not be loaded through the available web reader; retain the design brief as editorial interpretation rather than a line-by-line derivation from that post.


## Approved visual direction: preservation priority (owner instruction, 13 October 2026)

The owner explicitly approved the site's current overall appearance. **Treat the existing visual language as settled.** Future work should be editorial and corrective by default: check scientific accuracy, media placement and provenance, chronology, link destinations, accessibility, contrast, multilingual behavior and responsive rendering. Do not introduce a wholesale redesign, new typographic personality, new animation vocabulary, replacement hero, alternative layout system, or stylistic rebranding without a subsequent explicit instruction.

The complimentary `stories.html` route was added under this principle: it shares the Newsreader / DM Sans / DM Mono system, dark pine / warm paper / terracotta palette and authentic archive media, retains the homepage's original narrative, and includes bilingual copy plus source notes. The new page does not replace the scientific archive, research figures or publications.

Source-level static checks passed after this addition; GitHub Pages published the new main-branch commit successfully on 13 October 2026. These facts do not substitute for visual checks on real browsers and devices.
