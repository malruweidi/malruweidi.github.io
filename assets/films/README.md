# What Survives the Experiment — Ruwaidix film source

Two-minute documentary film. Twelve source-grounded scenes. Built with FFmpeg, Pillow, and the open Kokoro ONNX English voice, without an avatar or HeyGen.

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
