#!/usr/bin/env python3
"""Offline-eligible Chatterbox Nano narrator auditions; never public-release audio.

The official MIT-licensed Chatterbox repository provides Nano 110M CPU inference.
Model weights can download once from Hugging Face on first execution; no paid API.
The reference MUST be the consenting speaker's own voice. Never infer a voice
owner from archival research videos. A plan-only run needs Python standard library.
"""
import argparse
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "assets/films/cinematic-library-v2.json"
DIRECTION = ROOT / "assets/films/directors-ledger-v3.json"
OUTPUT = ROOT / "assets/films/voice-nano-v3"


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def plan(film_slug, selected_scene=None):
    records = json.loads(CATALOG.read_text(encoding="utf-8"))["films"]
    film = next((f for f in records if f["slug"] == film_slug), None)
    if film is None:
        raise ValueError("Unknown film title")
    direction = json.loads(DIRECTION.read_text(encoding="utf-8"))
    ledger = next((f for f in direction["films"] if f["slug"] == film_slug), None)
    if ledger is None:
        raise ValueError("Missing voice director ledger")
    overrides = ledger.get("narration_overrides", {})
    shots = []
    for i, shot in enumerate(film["shots"], 1):
        if selected_scene is not None and i != selected_scene:
            continue
        narration = overrides.get(str(i), shot["narration"])
        shots.append({
            "number": i, "title": shot["title"], "narration": narration,
            "duration_budget_seconds": int(shot["sec"]),
            "source_credit": shot["credit"]
        })
    if not shots:
        raise ValueError("Selected scene does not exist")
    return {
        "status": "UNAPPROVED_NARRATION_PLAN",
        "film": film_slug, "engine": "Chatterbox Nano (110M) on local CPU",
        "scenes": shots, "model_repository": "https://github.com/resemble-ai/chatterbox",
        "source_sha256": digest(CATALOG), "director_ledger_sha256": digest(DIRECTION),
        "must_review_prosody_pronunciation_and_timing": True,
        "no_voice_identity_assumed": True, "never_auto_publish": True
    }


def inspect_reference(path):
    if path.suffix.lower() != ".wav" or not path.is_file():
        raise ValueError("A local, consented speaker WAV is required")
    p = subprocess.run(
        ["ffprobe", "-v", "error", "-show_format", "-of", "json", str(path)],
        text=True, capture_output=True, check=True
    )
    duration = float(json.loads(p.stdout)["format"]["duration"])
    if not 6.0 <= duration <= 35.0:
        raise ValueError("Reference must be a clear 6 to 35 second WAV recording")
    return duration


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--film", required=True)
    ap.add_argument("--scene", type=int)
    ap.add_argument("--plan-only", action="store_true")
    ap.add_argument("--reference-wav")
    ap.add_argument("--reference-consent", action="store_true",
                    help="Affirm the recorded speaker authorized voice-model use")
    ap.add_argument("--out", type=Path, default=OUTPUT)
    args = ap.parse_args()
    script = plan(args.film, args.scene)
    if args.plan_only:
        print(json.dumps(script, indent=2, ensure_ascii=False))
        return
    if not args.reference_consent or not args.reference_wav:
        raise PermissionError("Narration requires a WAV of the authorized speaker and --reference-consent")
    reference = Path(args.reference_wav).expanduser().resolve()
    inspect_reference(reference)

    # Heavy dependencies and downloaded open model weights are NEVER loaded by --plan-only.
    import torchaudio as ta
    from chatterbox.tts_turbo import ChatterboxTurboTTS

    model = ChatterboxTurboTTS.from_pretrained(device="cpu", nano=True)
    output = args.out.resolve() / args.film
    output.mkdir(parents=True, exist_ok=True)
    for shot in script["scenes"]:
        stem = f'{shot["number"]:02}'
        target = output / (stem + ".wav")
        record = output / (stem + ".json")
        if target.exists() or record.exists():
            raise FileExistsError("Refuse to overwrite existing audition files: " + str(target))
        audio = model.generate(shot["narration"], audio_prompt_path=str(reference))
        sec = float(audio.shape[-1]) / float(model.sr)
        if sec + .62 > shot["duration_budget_seconds"]:
            # Never conceal speech overflow by truncating, speed-shifting or clipping.
            raise ValueError(f"Scene {stem} narrator is {sec:.1f}s for {shot['duration_budget_seconds']}s; edit/re-record")
        ta.save(str(target), audio.detach().cpu(), model.sr)
        record.write_text(json.dumps({
            "status": "UNAPPROVED OFFLINE NARRATION AUDITION",
            "film": args.film, "scene": shot["number"], "duration_seconds": sec,
            "audio_sha256": digest(target), "reference_sha256": digest(reference),
            "reference_owner_consent_asserted": True,
            "engine": "Chatterbox Nano / CPU / downloadable open weights",
            "source_sha256": script["source_sha256"],
            "director_ledger_sha256": script["director_ledger_sha256"],
            "approved_by_listener": False, "never_auto_publish": True
        }, indent=2) + "\n", encoding="utf-8")
        print("Unapproved local voice audition:", target, f"({sec:.2f}s)")


if __name__ == "__main__":
    main()
