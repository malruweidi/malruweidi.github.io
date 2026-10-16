# What Survives the Experiment — Ruwaidix film source

Two-minute documentary film. Twelve source-grounded scenes. Built with FFmpeg, Pillow, and the open Kokoro ONNX English voice, without an avatar or HeyGen. The first version is safely preserved in Git history.

**Editorial thesis:** A discovery is not the idea alone; it is what survives contact with matter, the instrument, the model, or the patient. The film follows the actual transitions from school anatomy and home microscopy through organic chemistry and sensing, scientific community, polymer and zebrafish histology setbacks, developmental imaging, pulmonary mechanics, and inhaled formulation work. The closing frame acknowledges scholarly work on historical pharmaceutical reliability. No outcome beyond the source archive is invented.

The canonical scene definitions and complete spoken narration are in `what-survives-scenes.json`. Every scene has a source image, link and provenance note. External microscopy footage and the anatomy photograph are already hosted and used on the site; where a remote asset is unavailable the renderer uses an identified local still. It never silently substitutes synthetic experimental evidence.

## Rebuild

Install Python packages `pillow numpy soundfile kokoro-onnx`, along with FFmpeg and DejaVu fonts. Download `kokoro-v1.0.fp16.onnx` and `voices-v1.0.bin` from the published Kokoro model-files-v1.1 release into `film-models/`. Run:

```bash
python scripts/render-documentary.py --validate-only
python scripts/render-documentary.py
```

The output is `assets/films/what-survives-the-experiment.mp4`, English `.vtt` captions and a JSON SHA-256 manifest. Video length is validated to 120 seconds. The workflow `.github/workflows/render-research-film.yml` automates the build and commits its output. It will fail rather than cut narration if speech cannot fit the time budget.

## Visual and scientific constraints

Real footage is documentary texture, never invented evidence of a mechanism. A photograph of an instrument is identified as such. Research figures are kept readable and link back to their original attribution. A failed 2% agarose/paraffin embedding attempt remains a failed section, not a success. The MSc thesis is ongoing, not a proven inhaled treatment. The filmed laboratory vacuum pump is explicitly not portrayed as recording the botanical-extract procedure. The final contemporary portrait is not passed off as an antique pharmacy manuscript.

**Voice:** Open-source, not voice cloning. Generated British English narration (Kokoro bm_george) at natural tempo. A subtle procedural synthesised ambience provides an original bed without copyright dependency. The score and timbre should be critically listened to before the film is considered final.

**Rights:** Retain archive credit and confirm third-party photo and published-figure republication permission as needed before wider distribution. No original site routes or source photos are discarded.

## Build verification (16 October 2026)

The open-source GitHub Actions renderer has successfully produced an MP4 with verified duration **120.0 seconds** (12 scenes, two containing original motion recordings). The generated `what-survives-build.json` records the MP4 SHA-256, voice engine, source class for each chapter and script source. The self-hosted video file and timed English VTT are included in this feature branch; this is not a HeyGen-hosted film.

Quality sign-off is distinct from automated rendering: a human audition of Kokoro's synthesized speech, final frame review, licenses and bilingual accessibility checks remain editorial judgments. The full research archive and existing website pages stay unchanged outside the targeted additive editing.

## Cinematic revision / Version 2

The spoken account, its scientific status labels, and its evidence trail are retained. The revision concentrates on how evidence is shown and heard:

- **Microscopy:** the living-systems chapter sequences three independently archived zebrafish cardiovascular recordings. These are archival microscopy examples, not a claim that the specific videos prove every result discussed. The separate vacuum-pump film is retained as apparatus context, not illustrated as botanical extraction.
- **Figure integrity:** sensor and lung-flow charts and PLA materials figures remain unzoomed, inside a designated scientific safe area so axes, calibration marks and images are not cut off. Moving footage is contained, not stretched or cropped.
- **Editorial treatment:** photographs move gently behind fixed Newsreader-compatible documentary labels; figure labels and footage captions remain stationary.
- **Sound:** the same Kokoro English voice receives modest scene-to-scene leveling and is mixed with a new four-movement synthesized score that lowers during speech. FFmpeg targets -18 LUFS integrated loudness and -2 dB true peak. No stock music, licensed song, voice cloning or commercial avatar is used.
- **Build requirements:** all three archival zebrafish source recordings must be downloadable; the new renderer fails safely rather than representing still-image fallback as real motion. A new test protects the distinct sources and requires true figure containment. All 12 original scenes and the existing 120-second runtime remain mandatory.

A validated automated render is not a replacement for human creative review. Inspect live playback for natural pronunciation of scientific vocabulary, caption timing, chart legibility and audible dynamics before describing the revision as artistically final.
