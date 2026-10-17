# Ruwaidix Open Film Studio: reproducible production runbook

**Status:** scientific and editorial production drafts. This document does not certify any release as human-auditioned, licensed, peer-reviewed, or approved to replace an existing public film.

The controlled film library consists of **35** publication and essay shorts, **nine** authored documentary features, and **ten** preserved original archive clips. The archival recordings and first-edition MP4s are records, not targets for destructive replacement.

## Open-source and locally reproducible toolchain

- **FFmpeg / ffprobe**: deterministic H.264 + AAC assembly and independent decoding/inspection.
- **Pillow and CairoSVG**: subject-specific explanatory diagrams, source-image containment and animation plates. Never write simulated observations into published figures.
- **Kokoro ONNX**: an openly distributed English synthetic narrator, presently `bm_george`. Its use must not be represented as a real interviewee, cloned individual, or spoken-word scientific validation.
- **NumPy and SoundFile**: scene-level wav assembly, audio envelopes and original synthesized score; synthesized music does not constitute audible English-word verification.
- **GitHub Actions**: repeatable dependency setup and independent checkpointing of each film only after technical QA.

Required local binary/model files: `ffmpeg`, `ffprobe`, DejaVu fonts, and the public Kokoro `kokoro-v1.0.fp16.onnx` and `voices-v1.0.bin` in `film-models/`. See the workflow files for pinned/model URLs. Generated films never require HeyGen, Runway, or a paid avatar service.

## Build a single short film

```bash
python -m pip install pillow numpy soundfile kokoro-onnx cairosvg
python scripts/remaster-publication-series.py --validate-only
python scripts/remaster-publication-series.py --missing-only --limit 1
python scripts/normalize-film-captions.py --collection series-v2
python scripts/audit-all-film-recuts.py --collection series-v2
python scripts/audit-remake-readiness.py
python scripts/build-film-pronunciation-index.py
python scripts/make-film-qa-contact-sheets.py --collection series-v2
```

`--film <slug>` selects a named paper/essay; `--remaining-count` counts missing and superseded versions. Each short exports to `assets/films/series-v2/<slug>.mp4` with matching `.vtt`, `.json`, and frame-contact-sheet material. Original `assets/films/series/<slug>.*` files remain intact.

`remaster-publication-series.py` refuses incomplete six-chapter source manifests. Subject-specific `source_visual_revision` stamps invalidate out-of-date V2 picture masters even if those MP4s are technically playable. The browser's comparison studio will then fall back to the original edition rather than display old imagery under a new research citation.

The six-at-a-time orchestrator is `.github/workflows/render-film-overhaul-v2.yml`. It **commits each film individually** after image-source, SHA-256, VTT and decoded-video QA, rather than risking the loss of a complete batch if a late film fails.

## Longer films

The four two-minute evidence films use `scripts/remaster-evidence-series.py`. The five independent-length documentaries use `scripts/remaster-feature-films.py`, preserving existing soundtrack except for the distinctly labelled new first-person Cairo microscope voiceover. Their workflows are `render-longform-overhaul.yml` and `render-feature-film-overhaul.yml`.

Output for every authored feature is `assets/films/longform-v2/<slug>.mp4`. Native transcripts and source-/edition-bound original records remain separate. Both editions are inspectable from `film-studio.html` and `feature-film-studio.html`.

## Source and artistic quality controls

1. **Source-bound visuals:** bibliographic DOI/pages and individual scene source URLs in `publication-series.json`. Scientific diagrams in `assets/films/art/source-specific/` are original and labelled conceptual, not assay output, structures, patient data or quantitative microscopy. Ten authored scientific artboards replace 46 unrelated or generically illustrative frame assignments. The separate SVG rasterisation and classification checker is `scripts/audit-topic-visuals.py`.
2. **Evidence limit:** the 2% agarose–paraffin zebrafish histology remained unsuccessful; an airflow chamber is not a patient's lung; receptor cartoons do not imply solved structures; no in-vitro potency measure implies clinical efficacy; drug-carrier and ADC illustrations are deliberately distinguished.
3. **Encoded-frame audit:** `scripts/audit-all-film-recuts.py` samples the actually encoded 1280×720 movie at 2 Hz and flags uninterrupted blackouts, missing H.264/AAC, hash mismatches, wrong runtime or overlapping, overlong captions. It is an independent *technical* test, not a motion-design critique.
4. **Pronunciation:** `assets/films/pronunciation-review-lexicon.json` and `scripts/build-film-pronunciation-index.py` list time-coded passages involving chemical, pharmacological, historical and Arabic terminology for **human audition**. A transcript is not acoustic forced alignment or listening verification.
5. **Figure legibility:** original source pictures can be opened at native resolution in review pages. All caption and source-link treatments have their own cut-specific manifest, avoiding the false implication that V1 contains images invented for V2.
6. **Scientific interpretation and rights:** human review must check primary paper text, all causal and clinical claims, actual symbol spelling and pronunciation, figure permission, mobile playback, and provenance of personal/clinical archives **before** public replacement is authorized.

## Manuscripts in historical pharmacy film

`assets/films/historical-manuscript-source-register.json` identifies **British Library Or 5786** via Qatar Digital Library, including the composite codex date based on the **third treatise's colophon** and the direct folio-reference page. The QDL item declares **Public Domain**, but the automated IIIF request received **HTTP 403** on GitHub Actions. This is an access constraint, not permission to circumvent the server, substitute a different manuscript, or claim an authentic folio JPEG was imported.

`scripts/import-qdl-primary-manuscript.py` is a fail-safe *manual-only optional* source-checking workflow until access is authorized. Cambridge Genizah manuscript images require explicit public-web reproduction clearance. No Genizah or unrelated Wellcome manuscript has been silently relabelled as a Minhāj al-dukkān leaf.

## Release policy

`assets/films/remake-readiness.json`, when created by a batch, distinguishes MP4 existence, current source visuals/motion, full encoded-video QA, original-v1 preservation, and human film/rights approval. These fields are not interchangeable. Preserve all existing first editions, research pages, figures, histories, route names and archival recordings. The review pull request remains a draft until editorial sign-off.

Do not call a film completed merely because automated rendering succeeded. The final judgement belongs to an auditor who watches and listens continuously, checks figure meaning against the linked source manuscript and publication, and can reject a technically passing cut.
