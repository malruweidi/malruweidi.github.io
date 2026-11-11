# Ruwaidix local-first film studio — experimental, not published

This layer **adds** a fully self-hosted generative-shot and Arabic-narration path to the existing source-preserving 44-film review branch. It **does not replace** any original film, source figure, script, photograph, research claim, player or publication route. It is not a claim of cinematic approval. This is a technical interface for GPU-equipped local installations; no ComfyUI GPU model was executed by the repository authoring environment.

## Footage

Use [ComfyUI](https://github.com/Comfy-Org/ComfyUI) locally (`http://127.0.0.1:8188`) with an **offline** image-to-video workflow, preferably [Wan2.2](https://github.com/Wan-Video/Wan2.2) or [LTX-Video](https://github.com/Lightricks/LTX-Video). Install model weights separately, respecting each model's commercial licence and VRAM requirements. Use **File → Export (API)** in ComfyUI to save its node workflow JSON, then identify its positive text node ID and optional random-seed node. Disable and remove paid API/partner nodes and online assets. The bridge checks for common vendor/API nodes, but a third-party custom node could still make network calls; inspect the graph and installed nodes before running. Do not expose the local server publicly.

Example plan (`shot-plan.json`):

```json
{
  "shots": [
    {
      "id": "syrup-macro-01",
      "prompt_node": "6",
      "seed_node": "3",
      "seed": 72011,
      "prompt": "One elegant cinematic macro shot of translucent syrup moving over glass, carefully lit; no humans, words, logos, historic artifacts or research claims; subtle camera movement",
      "provenance": "CONCEPTUAL illustration of a modern liquid, not an original experimental or historical recording"
    }
  ]
}
```

Validate the exported workflow without starting generation:

```bash
python scripts/comfyui_local_shots.py --plan shot-plan.json --workflow wan-local-api.json --output assets/films/local-studio/review --validate-only
```

Then launch your self-hosted ComfyUI server and run without `--validate-only`. Outputs are placed in **review-only** directories, with reproducible prompts, hashes and evidence status. Existing outputs are never silently overwritten. Check shots for chemistry, period accuracy, artifacts and source integrity before importing them into the existing film renderer. Generated sequences must never masquerade as microscopy footage or historical archival evidence.

## Arabic Gulf voice

Use [Resemble AI Chatterbox Multilingual V3](https://github.com/resemble-ai/chatterbox), which lists Arabic support and an MIT licence, rather than Kokoro English auditions. It is not guaranteed to sound Khaliji: test with a speaker-authorized native Gulf Arabic reference clip, inspect every word, and independently confirm commercial permissions for any voice sample. Chatterbox embeds an **inaudible perceptual watermark**; it does not add a visible HeyGen-style video logo. For pronunciation, write native Arabic phrasing, use diacritics only where helpful, and record or replace failed words manually rather than accepting model output.

Local setup:

```bash
python -m venv .venv && source .venv/bin/activate
pip install chatterbox-tts torchaudio
python scripts/local_arabic_narration.py --script arabic-script.json --output assets/films/local-studio/audio --validate-only
python scripts/local_arabic_narration.py --script arabic-script.json --output assets/films/local-studio/audio --device cuda
```

For speaker-approved voice reference, add `--voice-reference permitted-khaliji-reference.wav --voice-consent`. The input `arabic-script.json` is `{"language":"ar","segments":["..."]}`; segments should follow natural clause and breath boundaries. Every WAV is separately auditioned, logged, and held from publication pending human pronunciation review. **No credits, commercial speech API, or remote TTS account are invoked.** The first model download still requires network access, and CPU fallback may be slow.

## Production discipline

Prefer actual research footage and source figures for scientifically significant shots, with generated cinematic motion used only to illustrate concepts. Preserve narration script, shot prompt, generator version/checkpoint, random seed, source licensing and exact photo or publication provenance. Use the existing Python/FFmpeg film timeline for actual assembly and separate human review of the voice, captions and soundscape. Generated visuals are not scientific evidence. Store model weights outside the GitHub Pages repo; stage large clips in local storage or an appropriate artefact store before considering Git LFS.

The repository's current protected cinema branch must remain **unmerged** until a complete end-to-end export, full evidence/voice/artistic review and real-device playback pass. The historical article *Making Medicines Keep* particularly needs careful manuscript dating and claims discipline. The Arabic tutoring advertisement must mention Doha and Al Khor plus individual and group sessions; its phone number must come from the original verified source, not be inferred.

Tests without a GPU or a voice model:

```bash
python -m unittest discover -s tests -p 'test_*local*py' -v
python -m unittest discover -s tests -p 'test_comfyui_local_shots.py' -v
```

Sources: [official ComfyUI API example](https://github.com/Comfy-Org/ComfyUI/blob/master/script_examples/basic_api_example.py), [ComfyUI local engine](https://github.com/Comfy-Org/ComfyUI), [Wan2.2](https://github.com/Wan-Video/Wan2.2), [LTX](https://github.com/Lightricks/LTX-Video), [Chatterbox multilingual](https://github.com/resemble-ai/chatterbox). All model and recording licences must be individually verified before commercial release.