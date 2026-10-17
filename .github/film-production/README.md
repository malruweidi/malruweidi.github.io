# Film production archive and public screening standard

This directory holds **editorial and production information**, not material for the public-facing Ruwaidix film pages.

## Public screening rule (18 October 2026)

A film page is for watching the complete film and reading a brief, accurate account of its subject. It may link to the original scholarly publication, research story, or archival object. Preserve optional closed captions as a `<track>` in the video player for accessibility.

Do **not** display verbatim scripts or transcripts, contact sheets, image-by-image provenance, production prompts, scene-by-scene scripts, assembly or render logs, source validation checklists, director's notes, provisional dates, uncertainty tags about photo capture dates, or old edition/change histories as audience content. Those records belong in GitHub.

Do not render production notes directly into the MP4. In particular, no slates such as “editorial schematic / not a research figure,” “date not verified,” “archival or published source,” “visual proof,” or similar workflow language should be visible or spoken in the finished film. A scientific claim should be accurately limited by its narration, context and linked publication, rather than exposing internal reviewers' annotations.

## Preservation and current location

The **unchanged pre-edit film pages** are preserved in the Git branch [`film-production-archive-20261018`](https://github.com/malruweidi/malruweidi.github.io/tree/film-production-archive-20261018). Historical scripts, image galleries and credits are also recoverable through Git history.

Research and film production data remain in repository artifacts, including:
- `assets/films/evidence-in-motion.json` (narration, source assignments and credits).
- `assets/films/publication-series.json` (film subjects and scripted scenes; the website uses the listing fields only).
- `assets/films/series-v7-pilots/*.json` and `releases.json` (original visual decisions, checksums, production release register).
- `assets/films/*-scenes.json`, `*-build.json`, and existing source stills.
- Existing MP4 and WebVTT binaries are retained. No original research figures or footage are discarded.

## Video export work still required

The original video files are **not automatically cleaned** by these HTML edits. Visual review sheets for current series-v7 films show that source classifications and production qualifiers were rendered into the footage itself. Those must be removed by **re-exporting the film masters using the actual source footage and diagrams**, rather than simply deleting explanatory context, replacing scientific images, or assuming a CSS mask edits the underlying file.

Prior to declaring a master corrected:
1. Inspect the opening, transitions and final frames of the MP4, not merely its manifest.
2. Remove only internal workflow text, while preserving correct scholarly content, original film narration, timings and visual relevance.
3. Verify that no unrelated study photo or false historical facsimile appears in the film.
4. Compare the corrected export with the corresponding source/credit ledger here in GitHub.
5. Update the website video source to the corrected master only after a real export and playback check.

Do not silently assert that video binaries have been re-rendered when only their HTML wrapper was cleaned.
