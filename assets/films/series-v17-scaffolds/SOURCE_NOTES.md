# Film 09 source and scientific-integrity ledger

**Film:** A Scaffold Meets Its Environment. **Status:** unapproved research-cinema review master; one film only. No live-site change.

## Primary article

Popelka, A.; Abdulkareem, A.; Mahmoud, A. A.; Nassr, M. G.; Al-Ruweidi, M. K. A. A.; et al. *Antimicrobial modification of PLA scaffolds with ascorbic and fumaric acids via plasma treatment*. **Surface and Coatings Technology** **400** (2020), 126216. DOI: https://doi.org/10.1016/j.surfcoat.2020.126216. Original study open access, copyright the authors, **CC BY 4.0**. Original public publisher abstract corroborates electrospinning, plasma treatment, and activity against *Staphylococcus aureus* and *Escherichia coli*. The review edition preserves pre-existing 120 s narration in `assets/films/series-v8-primary/pla-scaffolds.mp4` and timed `.vtt`.

## What the movie demonstrates

- **Step 1 — electrospinning.** Animated high-voltage needle, charged strand, rotary collector and depth-layered PLA fibres are **conceptual illustrations**. They are not captured during this original experiment, not spatially calibrated to original fibre dimensions, and not a tested CFD or electrospinning simulation.
- **Step 2 — surface activation.** The paper reports a 30-second RF plasma pretreatment as suitable for subsequent grafting after wettability and hydroperoxide testing. Individual animated particles, activation points and group movements are illustrations, not established radical trajectories or chemical bonds reconstructed from this experiment.
- **Step 3 — verification by microscopy.** The original 2020 **Figure 5 SEM** is a complete local raster with four labelled experimental conditions and **3 µm scale bars**, unaltered. Source path: `assets/films/source-figures/v4/pla-scaffolds/pla-scaffolds-figure-05.jpg`, SHA-256 `ae667164eb915dff5f5198f73115b45c987f7e515124b26e635478a6dc96a18a`.
- **Step 4 — other characterization.** Standalone original Figure 6 (AFM) and Figure 7 (FTIR-ATR) images are not presently in `main`. Instead, the renderer extracts frames at 67.2 s and 82.3 s from the older locally archived, research-sourced **V5** film. They are honestly labelled *ARCHIVED V5 FRAME* rather than pristine unaltered publisher raster. Source frames maintain original provenance, and each extracted file's hash is stored in the render manifest; reviewer should inspect labels before release. If higher-resolution source figure PDFs are later available, replace only with permission and rebuild.
- **Step 5 — microbiological endpoint.** The paper's Table 3 reports **ordinal plate-growth scores**. The full set of replicated scores is transcribed, including untreated, plasma-only, ascorbic-grafted and fumaric-grafted samples, for both tested species. **Zero** is defined on the rating system as **no growth observed in this assay**, not 0 CFU/mL, a sterilization guarantee, infection rate or clinical efficacy metric. Scores are not translated into a fake timecourse or inhibition diameter.
- **Step 6 — limitations.** The result is antimicrobial modification and material characterization **in vitro**. Do not assert implant safety, effects in human tissue, clinical infection prevention or long-term performance. In particular, this is not the distinct **2021 PLA packaging film–aluminum laminate** paper.

## Cinematic craft and hard gates

- A spatial fibre/microenvironment world, procedural depth, continually moving charged polymer jet, multi-strand collector, plasma/graft motifs, actual SEM evidence, archival Figure 6/7 context, and verified Table 3 ratings. Eight intentionally paced chapters at 15 seconds each.
- Free/local headless Chromium Canvas2D seekable time-based frames, Playwright, FFmpeg H.264 at 1920×1080/24 fps, untouched 120-second narration timeline and original matched WebVTT, locally synthesized original underscoring.
- Required automation: all eight scenes moving and seekable, source figure SHA checked, archive video snapshot provenance, native encoded MP4 duration/audio/video validation, 1 Hz video-only motion hashing (audio excluded), EBU R128 loudness and source manifest integrity.
- Rendering continuity alone is not a cinematic-quality certificate. Human watch/listen verification must specifically inspect zoomed AFM/FTIR source readability, all text at mobile scale, chemical-accuracy of interpretive visuals, story pacing, score/narration balance and rights/credit lines.

**Release:** PR remains draft until the author approves after complete screening. Keep public website, published routes, old masters and research notes untouched. Do not start Film 10 without an explicit user request.
