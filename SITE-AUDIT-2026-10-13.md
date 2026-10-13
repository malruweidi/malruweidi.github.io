# Ruwaidix website integrity audit — 13 October 2026

## Audit scope
Reviewed the live repository structure and all 18 tracked HTML pages, including `figures.html`, `techniques.html`, and `full-record.html`. Inspected the photo manifests, archives, scripts, primary navigation, headings, scientific attribution and the new Stories page. Verified the published ATVB reference independently against PubMed: Eisa-Beygi et al., *Arterioscler Thromb Vasc Biol.* 2018;38:2806–2818; DOI 10.1161/ATVBAHA.118.311231 (PMID 30571172).

A reproducible Node.js check now runs through GitHub Actions on pushes and pull requests: `node scripts/site-integrity.cjs`. Initial completed run [38418865238](https://github.com/malruweidi/malruweidi.github.io/actions/runs/38418865238) passed: 18 HTML pages, 24 JavaScript files, 442 local links and 184 static asset references checked. This validates static source references and JavaScript parsing, **not** real browser rendering or independent fact-checking of all publications.

## Confirmed repairs

1. **Zebrafish / chick-embryo provenance.** The 2017 chick-embryo incubator had been misleadingly inserted adjacent to the zebrafish primary-cilia and ATVB narrative. It is now reserved for the separate apparatus section. The Ramadan chapter uses zebrafish-specific scientific imagery and refers to PMID 30571172. A repeatable regression assertion prohibits that association from returning.
2. **Story figure clarity.** Replaced the small zebrafish embryo image enlarged in the living-systems story with a higher-resolution research-context illustration and labeled it **illustration, not experimental microscopy**, in both English and Arabic. The original observational image remains in the media archive. The Ramadan chapter continues to point to the genuine archived zebrafish research figure, with the original session not independently authenticated.
3. **Bilingual document structure.** `illness-and-evidence.html` previously contained parallel English and Arabic H1 elements. It now uses one structural H1 with language-controlled spans. The original text is preserved.
4. **Metadata.** Removed the redundant second description metadata tag from the unindexed `preview-rx23.html`; retained its `noindex` directive and canonical pointer.
5. **Documentation and prevention.** Updated the README from four Stories chapters to the current eleven. Added automated checks for duplicate IDs, missing static paths, image alt text, one H1 per page, missing JS syntax validity, unsafe new-window links and scientific-model separation. The action uses a Node 24-compatible checkout version.

## Outstanding media intake — not falsely marked published

- Seven 2019–2020 archival photographs (philosophy-of-science seminar; microwave synthesizer; biosafety-facility setting; laboratory benches; pandemic-era lab-coat photograph; two-laptop workstation; clinical-research corridor) have prepared provenance records but no matching WebP binaries in GitHub. `assets/archival-2019-2020.js` intentionally shows cards only after their binaries load. Their captions have **not** been presented as proof of experimental results, facility authorization, diagnosis or procedure.
- `IMG_4241.jpeg`, the owner-identified microscopy-room photograph associated with Ramadan/ATVB, is described in the intake record but not present as an original published asset. An archived zebrafish research figure is currently used for scientific context, explicitly *not* as a photograph of that Ramadan evening.
- Other owner-provided photographs retained in `assets/chem-squad-and-lab-photo-identifications-2026-10-12.json` remain pending where their binaries are not present. The archive should not state that an upload has occurred until the exact media is hosted.
- Some historical image dates are dates displayed by photograph libraries or social-media posts, not validated capture timestamps. Published captions retain that distinction.

## Not yet independently verified
The published GitHub Pages site could not be rendered through the available browser/web reader. A successful Pages build and the CI checks do not constitute responsive visual QA, assistive-technology testing or WCAG certification. External hosted media and offsite links were not exhaustively probed. Original rights and source-figure legends for each published scientific figure were not independently matched to every manuscript. Testing should ultimately include a real browser across 320, 375, 768, 1024 and 1440 pixels and an Arabic RTL inspection.

## Preservation
The approved October 2026 typography, colors, logo, homepage, published research, personal photographs, chronological entries, academic routes and original media were retained. Repairs were confined to provenance, caption, accessibility, metadata and automated validation; no destructive gallery or layout migration was made.
