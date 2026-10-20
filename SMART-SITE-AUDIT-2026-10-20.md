# Ruwaidix — academic website audit and smart discovery release
**20 October 2026 · repository quality record, not reader-facing copy**

## Evidence examined
Main-branch HTML for `search.html`, `reading-map.html`, `research.html`, `for-supervisors.html`, `doctoral-concepts.html`, and homepage navigation; static search script, stylesheet and indexed content; discovery tests and workflows; existing design, editorial and research-attribution audit documents. The static index contains **84 entries**. This is a targeted inspection, **not** an exhaustive review of every image, archived page or publication.

## What works
- The scholarly identity is specific and distinctive: drug discovery/delivery, experiments, history, narrative and primary evidence coexist without pretending all material is a formal publication.
- Original research, doctoral ideas, longer methods dossiers and in-progress inhalable formulations have dedicated pages and established links.
- Site search is local-only, with a no-JavaScript fallback, English/Arabic UI toggle, keyboard shortcuts and archive preservation.
- The existing approved scientific-editorial design and nine-entry homepage index should remain intact.

## Findings, ordered by decision value

1. **Confirmed — exact keyword search misses ordinary terminology.** The old strict all-token substring rule returns zero entries for `nebulizer`, `mechanical lung injury`, `chemical target degradation`, and Arabic `الاستنشاق`, despite relevant indexed work. Correcting these failures improves doctoral-supervisor and collaborator discovery.
2. **Confirmed — evidence stages need to stay separate.** An indexed publication, ongoing MSc formulation work and proposed doctoral concepts are not equivalent. The existing dossiers state important distinctions; new discovery logic must link to their original text rather than generate claims or automatically infer results.
3. **Confirmed — Arabic interface is not an Arabic bibliography.** Category names and menus are translated, but indexed result titles and summaries are still primarily English. A future translation pass must be source-controlled and scientifically checked. Do not replace titles with machine-invented translations.
4. **Confirmed — legacy navigation needs later cleanup.** `for-supervisors.html` includes an immediate redirect to `molecular-therapeutics.html`; older fragment identifiers should be reviewed before removing or reassigning that entry point.
5. **Not verified — live-site accessibility, responsiveness and deployment.** Source review and GitHub Actions cannot demonstrate keyboard traversal, screen-reader announcements, font/layout behavior, direct-URL responses or mobile/RTL rendering. A browser audit at 320, 375, 768, 1024 and 1440 px remains required.
6. **Not verified — every media claim/permission.** Film imagery, full captions, source licensing and source-to-shot scientific fidelity require a separate independent review. Passing static tests cannot sign off film accuracy.

## Changes proposed in this branch
- Introduce a small dependency-free terminology-aware bilingual ranking helper; search stays entirely inside the browser, with no external API, user profiling, or generated answers.
- Add five optional question routes to the existing search screen; regular typed searches and direct links still work.
- Prefer directly relevant scientific dossiers when multiple items match, without changing the publication or contribution text.
- Preserve the old keyword scorer as progressive fallback and the original non-JavaScript links.
- Add deterministic regression tests for discoverability, English/Arabic scientific queries, preservation, ranking and unsupported strings; extend the existing CI workflow.

## Non-negotiable editorial safeguards
Preserve the approved Ruwaidix appearance, all nine homepage chapters, original files, scientific attributions, failed experiments, narrative history and existing routes. Keep future interests labeled as proposals, not established laboratory competence. Do not publish GPA values, introduce a downloadable CV, remove the illness narrative, or turn internal QA prose into homepage copy. No tracking or paid API dependencies.

## Suggested next audit passes
In order: (1) human browser/RTL/accessibility QA; (2) verify all visible internal deep links and canonical aliases; (3) curated bilingual result descriptions; (4) evidence-to-source navigation across original publications; (5) media provenance and citation verification. Each deserves independently reviewable, reversible changes.
