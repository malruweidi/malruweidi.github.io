#!/usr/bin/env python3
"""Release cleaned Ruwaidix cinematic exports only after full-file checks.

Production metadata stays in GitHub; no JSON transcripts or source contact sheets
are linked from audience pages. This only registers real rendered MP4 masters.
"""
import hashlib
import importlib.util
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets/films/series-v7-pilots"
CATALOG = ROOT / "assets/films/publication-series.json"
REGISTER = OUT / "releases.json"
ENGINE = ROOT / "scripts/render-cinema-v7-pilots.py"

spec = importlib.util.spec_from_file_location("ruwaidix_clean_renderer", ENGINE)
renderer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(renderer)


def inspect_video(video):
    data = json.loads(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_format", "-show_streams",
         "-of", "json", str(video)], text=True))
    duration = float(data["format"]["duration"])
    streams = data["streams"]
    assert abs(duration - 84) < .25, (video, duration)
    assert any(s["codec_type"] == "video" and s.get("codec_name") == "h264"
               and s.get("width") == 1280 and s.get("height") == 720
               for s in streams), f"Missing expected 1280x720 H264 picture: {video}"
    assert any(s["codec_type"] == "audio" for s in streams),         f"Source narration absent: {video}"
    return duration


def main():
    catalogue = json.loads(CATALOG.read_text(encoding="utf8"))["items"]
    registered = json.loads(REGISTER.read_text(encoding="utf8"))
    assert len(catalogue) == 35
    assert registered.get("schema") == "ruwaidix-cinema-v7-registered-releases-v1"
    by_id = {x["id"]: x for x in catalogue}
    films = registered["films"]
    assert len(films) == registered["count"] == 30
    assert len({f["id"] for f in films}) == 30
    assert set(f["id"] for f in films) == set(by_id) - renderer.PRESERVE_SCHOLARLY

    for f in films:
        slug = f["id"]
        assert renderer.complete(slug), f"Clean render incomplete: {slug}"
        movie = OUT / (slug + ".mp4")
        vtt = OUT / (slug + ".vtt")
        source_audio = renderer.SRC / (slug + ".mp4")
        record = json.loads((OUT / (slug + ".json")).read_text(encoding="utf8"))
        inspect_video(movie)
        assert vtt.read_text(encoding="utf8").startswith("WEBVTT")
        assert hashlib.sha256(movie.read_bytes()).hexdigest() == record["movie_sha256"]
        assert hashlib.sha256(source_audio.read_bytes()).hexdigest() == record["source_audio_sha256"],             f"Narration provenance changed unexpectedly: {slug}"
        f.update(
            edition="series-v7-pilots",
            poster="/assets/films/series-v7-pilots/" + slug + ".webp",
            duration_seconds=84,
            sha256=record["movie_sha256"],
            video="/assets/films/series-v7-pilots/" + slug + ".mp4",
            captions="/assets/films/series-v7-pilots/" + slug + ".vtt",
            scene_manifest="/assets/films/series-v7-pilots/" + slug + ".json",
            source_review="/assets/films/series-v7-pilots/" + slug + ".contact.webp",
            visual_revision=record["visual_revision"],
            distinct_chapters=6,
            version="audience-clean-v8",
        )
        assert all((OUT / (slug + s)).stat().st_size > 0
                   for s in (".mp4", ".vtt", ".webp", ".json", ".contact.webp"))
        print("CLEAN FILM VERIFIED", slug, flush=True)

    registered["version"] = "2026-10-18-clean-screen"
    registered["release_intent"] = "Film-first screening; provenance in GitHub production records"
    registered["review_limit"] = (
        "Automated stream, duration, preserved soundtrack and source checks passed. "
        "Full human creative and scientific playback review remains necessary."
    )
    registered["protection"] = (
        "Five source-specific scholarly editions remain independently preserved. "
        "Earlier v7 binaries remain recoverable through Git history and the dated archive branch."
    )
    REGISTER.write_text(json.dumps(registered, indent=2, ensure_ascii=False) + "\n",
                        encoding="utf8")
    print("READY TO REGISTER", len(films), "films", flush=True)


if __name__ == "__main__":
    main()
