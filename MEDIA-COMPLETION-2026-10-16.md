# Media completion register — 16 October 2026

This non-destructive recovery register distinguishes media already published from remaining archival work. Never infer that a documentary clip validates the experiment it discusses.

## 16 October recovery progress (follow-up)
- [x] Added `moving-evidence.html`, an annotated index of six already-published recordings, linked from the homepage, Archive, Stories, Science & Society, secondary navigation, site search and the sitemap. No original videos or pages were replaced.
- [x] Automated source/provenance regression testing added to the main website integrity workflow; latest verified passing run is tracked in GitHub Actions.
- [x] Located `941df66636ad466db5ecdb3ecf919c46.mov` in the user's file library and converted it to H.264/AAC MP4 with a WebP poster in a separate local upload-ready restoration package.
- [x] Located seven owner-identified 13 October photographs and `IMG_4241.jpeg` in the user's file library. Optimized staged WebP files, removed screenshot controls from the library photo, and blurred the child's face in the school photograph.
- [x] Prepared an exact-path upload kit with a recoverable manifest for all eight images and the video plus poster.
- [x] Transfer the **ten verified binary assets** into GitHub via pull request [#30](https://github.com/malruweidi/malruweidi.github.io/pull/30), merged at `f4868cdf9a3332844f66b93c91cef44af78f8097`. Blob SHA-1 hashes matched source binaries exactly.
- [ ] Conduct human review of colleague publication permissions, spoken audio/transcript accuracy and playback across devices. The binary is hosted and its format and exact bytes were technically verified; this does not substitute for a human rights/accessibility review.
- [ ] Separate restoration batches for the remaining 2019–2020 and Chem Squad source photographs stay pending.

## Priority 1: video
- [x] Restore `941df66636ad466db5ecdb3ecf919c46.mov` as `assets/owner-archive-2026-10-13/khaled-jama-thesis-reaction.mp4` with `khaled-jama-thesis-reaction-poster.webp`. The recording depicts Khaled Jama Mohamoud explaining a chemistry reaction associated with his thesis. Do not infer validation of the mechanism. Existing conditional rendering in `assets/owner-archive-2026-10-13.js` must be preserved.
- [ ] Locate the three earlier AVI zebrafish recordings and determine whether they duplicate the currently hosted MP4 recordings before publishing.

## Priority 2: missing image binaries
- [x] Restore the seven photographs listed in `assets/owner-archive-2026-10-13-manifest.json` and verify original Git blob SHA-1.
- [ ] Restore the seven assets listed in `assets/archival-2019-2020-provenance.json`.
- [x] Restore the original Ramadan microscopy-room photo from `IMG_4241.jpeg` to `assets/owner-archive-2026-10-13/ramadan-microscopy-room.webp` with an evidence-limited original-story placement.
- [ ] Restore the remaining pending Chem Squad photographs identified in `assets/chem-squad-and-lab-photo-identifications-2026-10-12.json`.
- [ ] Restore the festival photograph and two 2019 ACS acceptance screenshots documented in `assets/festival-acs-2019-provenance-2026-10-16.json`. The screenshots belong to a single acceptance notice, not two acceptances.

## Publication gates
1. Original bytes must be available and identifiable; a manifest or conditional JS element is not proof of publication.
2. Preserve original source filenames in provenance metadata; optimize derivatives without overwriting originals.
3. Crop screenshot UI and redact personal correspondence, patient data and unrelated bystanders where appropriate.
4. Distinguish event-post dates from camera timestamps and distinguish recordings of apparatus from experimental evidence.
5. Verify source paths, poster playback, video controls, mobile layout and Arabic captions.
6. Preserve all current content, design, figures, navigation and external media links.

## Moving Evidence film index — published
The film index is now available at `moving-evidence.html`, preserves all pre-existing six recordings and adds Khaled's archived discussion as a seventh, with his original audio, attribution and a poster. Its on-page narrative distinguishes documentation of discussion from verification of the chemical mechanism. Captions/transcripts of the spoken explanation require separate transcription and editorial checking.

## Performance QA
Review `figures.html` and `full-record.html` for unnecessary inline payloads without deleting or reducing scientific figures or content. Run `node scripts/site-integrity.cjs` after any implementation changes.
