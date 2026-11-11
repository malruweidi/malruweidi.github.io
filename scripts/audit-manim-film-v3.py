#!/usr/bin/env python3
"""Screen *actual* silent Manim renders before editorial montage use."""
import argparse
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets/films/manim-v3"
SOURCE = {
    "AirwayInterface": ("airway-interface", "pub-airway-reopening", 3),
    "ACE2Topology": ("ace2-topology", "pub-ace2-forms", 4),
    "MicrofluidicTransport": ("microfluidic-transport", "pub-microfluidic-virus", 4),
    "FoodExtrusion": ("food-extrusion", "pub-food-printing", 3),
    "CeramicSintering": ("ceramic-sintering", "pub-ceramics-printing", 4),
}


def inspect(path):
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_streams", "-show_format",
         "-of", "json", str(path)],
        capture_output=True, text=True, check=True
    )
    meta = json.loads(result.stdout)
    stream = next((s for s in meta["streams"]
                   if s["codec_type"] == "video"), None)
    if stream is None or stream.get("codec_name") != "h264":
        raise AssertionError(f"No H264 video: {path}")
    if stream.get("width") != 1280 or stream.get("height") != 720:
        raise AssertionError(f"Not 720p: {path}")
    if any(s["codec_type"] == "audio" for s in meta["streams"]):
        raise AssertionError(f"Scientific insert must have no unsourced audio: {path}")
    duration = float(meta["format"]["duration"])
    if abs(duration - 16.0) > 0.1:
        raise AssertionError(f"Wrong sequence duration {duration}: {path}")
    if path.stat().st_size < 15000:
        raise AssertionError(f"Suspiciously tiny export: {path}")
    return duration


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--list", action="store_true", help="List source scenes")
    args = parser.parse_args()
    if args.list:
        for klass, (slug, film, position) in SOURCE.items():
            print(f"{klass}\t{slug}\t{film}\t{position}")
        return
    OUT.mkdir(parents=True, exist_ok=True)
    script = ROOT / "scripts/manim-scientific-films-v3.py"
    code_sha = hashlib.sha256(script.read_bytes()).hexdigest()
    for klass, (slug, film, position) in SOURCE.items():
        video = OUT / (slug + ".mp4")
        seconds = inspect(video)
        digest = hashlib.sha256(video.read_bytes()).hexdigest()
        data = {
            "scene": klass,
            "film": film,
            "shot_number": position,
            "seconds": seconds,
            "dimensions": "1280x720",
            "sha256": digest,
            "source_script": str(script.relative_to(ROOT)),
            "source_script_sha256": code_sha,
            "engine": "Manim Community Edition / FFmpeg",
            "status": "UNAPPROVED VISUAL EXPLANATION, NOT EXPERIMENTAL FOOTAGE",
            "source_nature": "Author-drawn moving scientific schematic",
            "editorial_status": "Requires scientific and artistic screening before use",
            "human_narration_approved": False,
            "rights_note": "Original programmatic shapes only; no recorded scientific result or patented molecular structure"
        }
        (OUT / (slug + ".json")).write_text(
            json.dumps(data, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8"
        )
        print(f"UNAPPROVED {slug}: {seconds:.2f}s, SHA256={digest[:16]}")


if __name__ == "__main__":
    main()
