# Media completion register — 16 October 2026

This is a non-destructive recovery register. It does not assert that missing binaries have been uploaded.

## Priority 1: video
- [ ] Restore `941df66636ad466db5ecdb3ecf919c46.mov` as `assets/owner-archive-2026-10-13/khaled-jama-thesis-reaction.mp4` and create `khaled-jama-thesis-reaction-poster.webp`. The recording depicts Khaled Jama Mohamoud explaining a chemistry reaction associated with his thesis. Do not infer validation of the mechanism. Existing conditional rendering in `assets/owner-archive-2026-10-13.js` must be preserved.
- [ ] Locate the three earlier AVI zebrafish recordings and determine whether they duplicate the currently hosted MP4 recordings before publishing.

## Priority 2: missing image binaries
- [ ] Restore the seven photographic assets listed in `assets/owner-archive-2026-10-13-manifest.json`.
- [ ] Restore the seven assets listed in `assets/archival-2019-2020-provenance.json`.
- [ ] Restore the original Ramadan microscopy-room photo `IMG_4241.jpeg` and the pending Chem Squad photographs identified in `assets/chem-squad-and-lab-photo-identifications-2026-10-12.json`.
- [ ] Restore the festival photograph and two 2019 ACS acceptance screenshots documented in `assets/festival-acs-2019-provenance-2026-10-16.json`. The screenshots belong to a single acceptance notice, not two acceptances.

## Publication gates
1. Original bytes must be available and identifiable; a manifest or conditional JS element is not proof of publication.
2. Preserve original source filenames in provenance metadata; optimize derivatives without overwriting originals.
3. Crop screenshot UI and redact personal correspondence, patient data and unrelated bystanders where appropriate.
4. Distinguish event-post dates from camera timestamps and distinguish recordings of apparatus from experimental evidence.
5. Verify source paths, poster playback, video controls, mobile layout and Arabic captions.
6. Preserve all current content, design, figures, navigation and external media links.

## Future additive feature: Moving Evidence
Create a discoverable film index linking to existing original microscopy recordings, laboratory-apparatus footage and the institutional seminar. Add Khaled's recording only after its actual MP4 is present. Include descriptive captions and transcripts when speech is significant. Avoid a blank video tile for absent sources.

## Performance QA
Review `figures.html` and `full-record.html` for unnecessary inline payloads without deleting or reducing scientific figures or content. Run `node scripts/site-integrity.cjs` after any implementation changes.
