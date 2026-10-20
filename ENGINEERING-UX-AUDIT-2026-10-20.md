# Ruwaidix · UI/UX and engineering audit
**20 October 2026 · repository-only review note, not public website copy**

## Scope and evidence
Read the public root and asset inventories, current GitHub Pages repository configuration, homepage and secondary-page source, existing design/audit documents, navigation/search scripts, design-system CSS, site-integrity tests and workflows, plus the discoverability index and sitemap. The deployed website could not be opened reliably in the available web reader. No live Lighthouse run, Playwright viewport screenshots, assistive-technology session, Core Web Vitals telemetry, JavaScript-console capture, or CDN response-timing audit was performed. Every finding below distinguishes source-confirmed defects from work still requiring empirical validation.

Repository snapshot: approximately 40 root HTML files, 161 top-level assets entries (including directories), 46 tests, and 24 GitHub Actions workflow files. The site uses **GitHub Pages plus static HTML/CSS/JavaScript and progressive enhancements**; there is no conventional request-processing backend or database to refactor.

## Confirmed defects resolved in PR #64

1. **Primary navigation loss on mobile (high severity).** In `assets/unified-pages.css`, the media query at 1100px hides five first-level navigation links. In `assets/unified-pages.js`, Explore previously rendered only `items.slice(5)`. This left first-level routes inaccessible from the displayed Explore menu. The Ruwaidix identity still led home; the separate global Find control has a higher-specificity display selector, so do not incorrectly claim it was definitely hidden. The repair repeats those five routes inside Explore **only at narrow widths** and leaves the desktop experience unchanged.
2. **Outdated breadcrumb registry.** The shared masthead recognized many legacy pages but not newer research, writing, film, recommendations and training destinations. Pages fell back to the generic label “Research page.” The repair adds specific English/Arabic page names.
3. **Breadcrumb and skip-link semantics.** The context row was a generic `div`, and the skip-link fallback sometimes introduced a separate empty focus target even where `main` already existed with another ID. The repair uses a named breadcrumb navigation landmark, current-page semantics and an actual focusable `main` destination.
4. **Narrow/RTL menu resilience.** The two-column dropdown is dense at 320px, with no explicit RTL anchoring. The repair uses one column on very narrow screens and aligns RTL dropdown panels appropriately. Live visual verification remains required.
5. **Incomplete findability for existing public pages.** `recommended-screen.html`, `training.html`, and `methods-evidence.html` existed but were absent from `assets/discovery-index.json` and `sitemap.xml`. All three are indexed by accurate editorial summaries, bilingual keywords and canonical page URLs. Preview pages and compatibility redirects are intentionally **not** indexed.

## Design system to preserve
The approved identity combines Newsreader, DM Sans, DM Mono, dark pine/green-black, archival paper, subdued terracotta, and original documented scientific photographs. Preserve the existing nine-chapter homepage; original research, illness/resilience writing, evidence dossiers, full archive, scientific figure captions, film routes, translations, logos, and page URLs. Changes must be reversible and source-grounded. Never publish private grades, unsupported experimental claims, imagined source media, or internal production notes.

## Higher-value follow-up work

**P1 · Full empirical accessibility verification.** On actual browser builds at 320, 375, 768, 1024 and 1440px: keyboard-only Explore, search and local-jump flows; focus return after Escape; touch target sizes; VoiceOver/NVDA semantics; duplicate-header suppression; Arabic RTL line breaks; reduced motion; zoom to 200%; color contrast; poster and figure legibility. Target WCAG 2.2 AA, but do not claim conformance until verified.

**P1 · Performance instrumentation before optimization.** GitHub blob sizes show an approximately 1.92 MB `full-record.html`, 1.35 MB `figures.html`, 1.38 MB `techniques.html`, and 186 KB `index.html`. These are repository file sizes, **not** measured transfer sizes, critical-path costs or LCP. Identify remaining inline base64 or oversized generated markup and network waterfalls; preserve original binary bytes, scientific scales, citations and captions if externalizing media. Gather LCP, INP, CLS and actual route timings before claiming improvement.

**P1 · Shared navigation coherence.** Several newer public sections (`research.html`, `publications.html`, `writing.html`, recommendations) have standalone headers rather than the secondary-page universal masthead. Test navigation consistency before rationalizing shared components. Do not silently replace the author's approved layout or route-specific content.

**P1 · Discovery taxonomy.** Maintain the local, telemetry-free search architecture; include all intentionally public source-led pages when published. Separate experimental publication, in-progress MSc work, and doctoral proposals by explicit editorial status rather than ranking all as equivalent research outputs. The current “Recommended reading” category also houses film recommendations; consider a reviewed “Reading & viewing” category only with coordinated interface translations and test updates.

**P2 · CSS cascade simplification.** Repeated dated CSS patches and runtime-injected enhancements raise regression costs. Inventory selectors and page-specific overrides; consolidate *only proven redundant* rules into established design tokens, with screenshot-diff tests at every stage. No framework migration is justified without an application-level requirement.

**P2 · Metadata and document semantics.** Auditing unique title, canonical link, social image, structured data, H1 order, accessible media credit and reciprocal evidence links should become a single maintained publishing checklist. Avoid claiming that an external citation is an original finding where it documents a proposed direction or a colleague's contribution.

**P2 · CI and release management.** The repository already has good archival/media checks. Add simple source tests for every new public route, mobile navigation behavior and English/Arabic UI affordances, then use real-browser QA on previews before deployment. Numerous open, potentially overlapping film and design PRs should be reconciled rather than merged indiscriminately.

## Backend/frontend decision
**Keep the static backend.** GitHub Pages is appropriate for a public research archive requiring no user accounts, mutations, private records or dynamic transactions. Use build-time manifests, reliable CI, performance budgets, static search, and media provenance checks. Do not add serverless APIs, a database, user telemetry, or subscription tools unless a specific feature later establishes the need.

## Verification and release gate
The repair branch has focused Node regression tests under `tests/responsive-wayfinding-2026.test.cjs` and `tests/public-discovery-coverage-2026.test.cjs`, both referenced by `.github/workflows/site-integrity.yml`. Source-level JavaScript parsing and static assertions were checked. Remote GitHub Actions and live browser QA must be reviewed separately before declaring full production quality. No private academic grades or medical details were introduced.
