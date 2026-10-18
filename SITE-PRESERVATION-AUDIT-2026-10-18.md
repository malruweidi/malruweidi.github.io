# Preservation and discoverability audit · 18 October 2026

Scope: the live `main` branch of `malruweidi/malruweidi.github.io`, the preserved `mahmoudds-design-2026-10-11` snapshot, current pages/media manifests and the October 16–17 recovery records.

## What survived and should not be reintroduced as a duplicate

- **Top-level pages:** all 22 entries in the root tree of the 11 October design snapshot are still represented in the current root tree. No original root file path was dropped. The root now has additional pages, including publications, the separate research landing page, scientific fieldnotes, writing, stories, films, leadership and the standalone *Major Revisions* book.
- **Original assets:** all 50 top-level entries of the 11 October `assets/` tree remain in the present `assets/` tree, alongside newer collections. An unchanged path is not proof that its binary contents are identical; more detailed media integrity checks live in the specialist test suite.
- **Original photo archive:** all entries in the former root `archive/` tree survive; the current directory also has newly documented images. The recovered 30-photo collection and original source media are already reachable from `archive.html`.
- **Original long research chapters:** `full-record.html` remains in the site; the homepage condensation did not need to delete those chapters.
- **Already-restored media:** the Khaled Jama Mohamoud reaction-explanation MP4 and its poster are present at `assets/owner-archive-2026-10-13/`. The October 13 owner-identified photographs, the seven 2019–20 images, the October 16 Chemistry Festival/ACS images and the Chem Squad gallery files are present. Some older working manifests still say `awaiting_source_media_upload`; do not interpret those stale statements as proof the files are absent.
- **Newer source-specific material:** `scientific-fieldnotes-2026.html` already hosts the TiO₂ and droplet visual material and 2017 conference photo record. Do not recreate an inferior older experimental notebook page with the same plots. The newer publication cinema and film pages likewise supersede production-stage preview pages.

## Confirmed discoverability weaknesses

- **Forthcoming book:** restored in pull requests #56 and #57 (direct navigation, permanent page, cover, search, Arabic homepage entry).
- **Earlier people and formative experiences:** teacher Aref Elahmad, physician Elsheikh Abdelrahim, later school visit, Ramadan microscopy memory and failed zebrafish histology were in their correct narratives, but scattered across independent pages and off the homepage's short chapter menu.
- **Original media and community material:** the historic ACS poster/conference photos, Chem Squad recording, original film archive, 30-photo gallery, and distinct leadership history likewise lacked one clear editorial entry point.
- **Research horizon:** already had a valid standalone destination but was missing from the public discovery index (although linked from the homepage and research).

## 18 October correction

- Added `behind-the-record.html` and `assets/behind-the-record.css` as a source-led, illustrated directory to the **existing** pages. All images are hosted repository files and all text keeps personal memory, apparatus photographs and validated research evidence distinct.
- Added a **single small link** in the homepage's existing specialist-link strip, not a new stacked section or extra homepage chapter card. Its nine main categories, compressed homepage layout and original expandable record remain intact.
- Added the guide to `archive.html` near the opening archive links, updated sitemap, bilingual homepage shortcut and website search. Indexed `research-horizon.html` as well.
- Added `tests/behind-the-record-preservation.test.cjs` to protect image existence, key source destinations, separate book/guide routes and the nine-card homepage layout.

## Incomplete historical intake that is **not** silently published

`MEDIA-INTAKE-2026-10-17.md` describes an older staged proposal for `archive-lab-notebook.html`, using images of reaction tubes, reagent bottles, a chick embryo, culture flask, fluorescence microscopy and a zebrafish flow-analysis AVI. These particular source binaries are **not** in the present `assets/owner-archive-2026-10-17/` directory, and that proposed page does not exist on `main`. Its media must not be fabricated, misidentified, replaced by vaguely similar photos, or described as publicly recovered. If original bytes can be recovered and reviewed later, prefer a clearly identified standalone archival chapter, not a duplicate of the newer fieldnotes material. The TAVI photograph requires the original privacy and reuse review.

## Long-term preservation rule

Do not delete or demote existing source evidence, original media or old research narratives merely to shorten navigation. Preserve the full record on its destination pages; add brief, accessible entry points to the short homepage. Distinguish an old **version** of still-published material from a genuinely missing source or unfinished upload. Documentary transcripts, shot manifests and internal editorial audit notes belong in the GitHub repository, not public film or archive pages.
