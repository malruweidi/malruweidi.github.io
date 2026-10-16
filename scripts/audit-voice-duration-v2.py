#!/usr/bin/env python3
"""Preflight Kokoro reading durations, no video render, no automatic approval."""
import argparse
import json
import math
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
CAT=ROOT/"assets/films/cinematic-library-v2.json"
OUT=ROOT/"assets/films/voice-timing-v2.json"

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--models",default="film-models")
    ap.add_argument("--validate-only",action="store_true")
    args=ap.parse_args()
    films=[f for f in json.loads(CAT.read_text(encoding="utf8"))["films"]
           if f["slug"].startswith("feature-")]
    assert len(films)==6, "Six longer feature-alternate cuts must remain present"
    if args.validate_only:
        print("Six feature screenplays found")
        return
    from kokoro_onnx import Kokoro
    root=(ROOT/args.models).resolve()
    model=Kokoro(str(root/"kokoro-v1.0.fp16.onnx"),str(root/"voices-v1.0.bin"))
    records=[]
    for film in films:
        results=[]
        for i,shot in enumerate(film["shots"],1):
            wav,sr=model.create(shot["narration"],voice="bm_george",speed=1.06,lang="en-gb")
            measured=len(wav)/sr
            margin=shot["sec"]-measured-0.62
            results.append({"scene":i,"title":shot["title"],"allocated_seconds":shot["sec"],
                            "voice_seconds":round(measured,3),"breathing_margin_seconds":round(margin,3),
                            "needs_rewrite":margin<0,
                            "extra_seconds_needed":max(0,math.ceil(-margin+0.45))})
        records.append({"film":film["slug"],
                        "needs_rewrite":any(x["needs_rewrite"] for x in results),
                        "scenes":results})
        print(film["slug"],"problem scenes:",[s["scene"] for s in results if s["needs_rewrite"]])
    OUT.write_text(json.dumps({"status":"SYNTHETIC VOICE DURATION PREFLIGHT; NOT AN AUDIO QUALITY ENDORSEMENT",
        "voice":"Kokoro bm_george / 1.06 / en-gb",
        "required_buffer_seconds":0.62,
        "features":records},indent=2,ensure_ascii=False)+"\n",encoding="utf8")

if __name__=="__main__":main()
