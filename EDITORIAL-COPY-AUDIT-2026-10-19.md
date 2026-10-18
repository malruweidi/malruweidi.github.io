# Ruwaidix editorial credibility and public-copy audit
**19 October 2026 | Repository-facing review, not copy for the website**

## Scope and method
Inspected the source for the main website routes, personal Stories collection and standalone chapters, research/grants pages, documentary screening routes, archive pages, public asset-caption JavaScript and previously recorded editorial standards. Cross-checked the material against the site's existing provenance and publication/attribution review documents. Performed source-string and route checks after the corrections on branch `editorial-proofreading-2026-10-19`.

This is a source-level review. The live site could not be retrieved in the web reader in this session, and no frame-by-frame movie audit, complete independent bibliography verification, clinical-document review, permission clearance, browser accessibility review or page-wide Arabic literary copyedit was performed. Do not describe the work as having completed those checks.

## Confirmed editorial defects and corrections
1. **Production metadata in photographic captions.** `archive.html` displayed `DATE UNVERIFIED`, `DATE NOT VERIFIED`, and a date label derived from a filename. These were replaced with factual photographic context without assigning unsubstantiated capture dates. The school opening also stopped discussing camera-date certification.
2. **JavaScript-generated captions.** Four dynamically rendered galleries displayed phrases such as `Date unverified`, `Date not verified`, and `owner recollection` in reader metadata; the visible labels were replaced with informative context. Source/provenance files and associated originals were preserved. The after-hours photograph's alt text no longer ends in an editorial verification warning.
3. **Incorrect promotional promises on embedded films.** The histology story, Chem Squad and engagement pages advertised a complete transcript, eight plates and provenance at links that lead to ordinary published film pages. The film pages provide the released screenings and story links, not the advertised bundle. All three embeds now link accurately to the documentaries, with factual captions and standard video fallbacks.
4. **Self-explanatory prose where a concrete account would be stronger.** `behind-the-record.html` replaced multiple paragraphs about what archives should preserve with the Grade 10 teacher photograph, Raman microscopy memory, actual unsuccessful agarose–paraffin embedding, and the evidence represented by recorded footage.
5. **Scientific identity and attribution.** `molecular-therapeutics.html` formerly used a generic disclaimer that all role descriptions were not independently certified. The replacement distinguishes experimental-only collaborative vascular work from first-author pulmonary experiments/analysis/writing. The project-specific account and primary-paper links remain in place.
6. **Repetition.** `research-horizon.html` repeated `These experiences...` in consecutive sentences; the lead was tightened without reducing scientific scope.
7. **Story continuity and Arabic.** `stories.html` dropped camera-metadata self-notes from the school, anatomy and health chapters. The Ramadan microscopy figure caption states its illustrative relationship to memory without claiming it was captured on that occasion. The standalone Ramadan chapter retains the identical central chapter HTML; `assets/stories-i18n.js` has new exact-text Arabic mappings rather than deleting legacy translations.

## Claims explicitly preserved
- Unsuccessful imidazopyridine and zebrafish histology work remains unsuccessful, without invented results or causal mechanisms.
- Completed experiments are separate from intended MSc endpoints or doctoral training directions.
- Individual contribution claims remain project-specific. TAVI registry involvement is not represented as TAVI-paper authorship.
- Scientific and clinical limitations remain at the associated evidentiary claim, not erased as 'unattractive copy'.
- Main homepage design, original content sections, individual research pages, older source files, photo/media assets, external citation targets and existing routes remain in place.

## Open verification tasks
- Conduct live production tests for deployment/caching, film playback/caption synchronization, visual presentation across device sizes, Arabic/RTL and keyboard access.
- Check every embedded scientific-image panel against the original publication and its permissions.
- Compare all author contribution descriptions, equal-first designations, publication statuses, and grant claims against the final primary-source records.
- Review noindexed cinema working previews to decide whether to continue retaining a publicly reachable review space or redirect them to the released catalogue while leaving historical source in Git.
- Continue a sentence-level human edit of the very large `full-record.html`, `techniques.html` and `figures.html` files without destructively regenerating them. The current lexical audit did not identify the same production text in their visible copy, but that is not full proofreading.

## Regression coverage
`tests/public-copy-boundary.test.mjs` checks the verified leakage patterns, maintained film links, archived source/page consistency, Arabic additions and distinct TAVI role limits. Existing site integrity, deep-reading and film-boundary tests remain the primary broader safeguards.

**Release criterion:** A clean source test suite and a confirmed GitHub Pages publish are necessary but still insufficient for a complete visual, audiovisual or scientific-fact sign-off.
