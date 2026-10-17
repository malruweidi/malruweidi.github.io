# Ruwaidix documentary studio: GitHub open-source stack only
**Production policy — 17 October 2026.** This applies to all 44 publication/essay/feature film remakes. The current website film player, original videos, story archive, designs, photographs and scientific figures remain intact until separate picture-and-sound approval.

## Zero subscription / zero API-credit production

No cloud video-generation API is required or authorized. Do not use Runway, HeyGen, ElevenLabs subscriptions, Replicate, fal endpoints, credit bundles or watermarked render plans. Do not silently substitute a commercial/cloud endpoint when an open local model cannot run. The public repository uses standard `ubuntu-latest` GitHub Actions runners for CPU editing, Manim and QA; GitHub documents these as free for public repositories. Storage and rate limits still matter; do not adopt paid larger runners.

The distinction matters: free and open-source code is not free GPU hardware. Treat models below as **optional locally executed** stages and do not promise them on GitHub's CPU runners. Render all five Manim mechanisms on CPU first.

## Authoritative stack and roles

* **Scientific mechanisms:** Manim Community Edition (MIT), https://github.com/ManimCommunity/manim . The repository source is `scripts/manim-scientific-films-v3.py`, with a standalone five-scene CI workflow and an `ffprobe` + SHA256 validator.
* **Compositing, montages, archival camera, color and audio mastering:** FFmpeg, https://github.com/FFmpeg/FFmpeg . This is the required final compositor and can run on standard CPU.
* **3D sequences when scientifically needed:** Blender (GPL), https://github.com/blender/blender . Use for geometrically explicit equipment and mechanics; it is not a molecular dynamics simulator and must not fabricate results.
* **Source image animation on a *local* GPU (optional only):** ComfyUI (GPL), https://github.com/Comfy-Org/ComfyUI, with appropriately licensed downloadable Wan2.2 models. The official 5B ComfyUI template reports approximately 8GB VRAM with offloading. Confirm actual local VRAM, checkpoints, licenses and frame consistency. Never apply generative motion to microscopy, original assays, scientific graphs, historical manuscripts or personal evidence as if motion actually occurred.
* **Alternative desktop local video model (optional only):** LTX Desktop, https://github.com/Lightricks/LTX-Desktop . Check current weights/license and system compatibility: recent desktop documentation specifies at least 15 GiB NVIDIA VRAM and substantial local disk space. Do not use API-only fallback.
* **Narration:** a consented human recording preferred for autobiographical films; audition-only local Kokoro ONNX (Apache-licensed model) in existing scripts; alternate **Chatterbox Nano 110M** (MIT, https://github.com/resemble-ai/chatterbox) on local CPU for *consented-speaker* prosody auditions. Use `python scripts/voice-chatterbox-nano-v3.py --film making-medicines-keep --plan-only` to inspect an exact source-script plan without model downloads; actual generation requires a separately supplied 6–35 second WAV and `--reference-consent`, with no paid endpoint. Do not impersonate or clone any other person's voice. Technical Arabic terms must be auditioned by a fluent reader.
* **Captions and spoken-text verification:** existing source-driven VTT cues; optional local Whisper (MIT), https://github.com/openai/whisper, to detect omissions (not a replacement for source proofreading).
* **Manual editing/finishing if useful:** Kdenlive (GPL), https://github.com/KDE/kdenlive . No credit requirement.

## Shot acceptance rules

1. A film script has a distinct scientific or historical argument, specific events, and a dramaturgical purpose for every shot. A change of aesthetic is insufficient to call a film remade.
2. Original research and personal testimony use the actual source images/recordings, unmodified in evidentiary substance. Pan/zoom may be used with care; never animate a scientific result into a different result.
3. Conceptual Manim/Blender/AI segments require an on-screen indication of **explanatory schematic**, not a photograph of an experiment or archival film.
4. Source identifiers, credits, rights and experiment-versus-hypothesis status accompany each asset. `Making Medicines Keep` remains **accepted 15 October 2026**, not published.
5. Every final clip requires genuine MP4 frame/audio screening, playback quality review, pronunciation review, semantic/citation audit, legible captions, provenance SHA and responsive/mobile verification. Do not certify visual quality from a storyboard alone.
6. No previous publication video, website route, research record, figure, photograph or personal story is deleted or replaced by CI; changes go to protected workprint paths and stay unapproved until separately accepted.

## First CPU pilot (workprint, not a public replacement)

`scripts/manim-scientific-films-v3.py` produces five **silent 16-second** 1280×720/24fps source-bounded mechanism sequences:

* Airway reopening: `AirwayInterface` → `pub-airway-reopening`, shot 3.
* ACE2 membrane versus soluble location: `ACE2Topology` → `pub-ace2-forms`, shot 4.
* Microfluidic transport: `MicrofluidicTransport` → `pub-microfluidic-virus`, shot 4.
* Food extrusion and shape: `FoodExtrusion` → `pub-food-printing`, shot 3.
* Ceramic processing: `CeramicSintering` → `pub-ceramics-printing`, shot 4.

Run on a local workstation or the repository's free standard Actions runner:

```bash
python -m pip install 'manim==0.22.0'
manim render --disable_caching --format mp4 --fps 24 -r 1280,720 scripts/manim-scientific-films-v3.py ACE2Topology
```

The dedicated workflow copies validated exports only to `assets/films/manim-v3/`, creates source SHA records, and does **not** modify the live movies. Next: editorial and scientific screening of those actual exports; if accepted, substitute their specific scene source paths in `assets/films/cinematic-library-v2.json` and regenerate the nine stale film workprints with the *existing open Kokoro/FFmpeg pipeline*. No production-player changes before approval.

## GPU-free documentary alternative

When no local GPU is available, do **not** generate generic fake laboratory video. Use original camera footage, institutional and museum images with verified reuse permissions, constrained archival photo movement in FFmpeg, Manim scientific motion, and human/Kokoro narration. This is technically feasible at zero video-API cost and generally better evidence practice than synthetic approximations of a unique experiment.
