#!/usr/bin/env python3
"""Audition narrator voices for Ruwaidix films without approving any voice.

These are comparison extracts, not replacements for full-length narration.
No voice cloning, third-party paid TTS, or fictitious speaker identity.
"""
import argparse
import hashlib
import json
import subprocess
from pathlib import Path
import numpy as np
import soundfile as sf

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets/films/voice-auditions-v2"
SOURCES=ROOT/"assets/films/cinematic-library-v2.json"
PROFILES={
    "bm_lewis":{"language":"en-gb","type":"British male"},
    "am_michael":{"language":"en-us","type":"American male"},
    "bm_george":{"language":"en-gb","type":"British male (legacy comparison)"},
    "bf_emma":{"language":"en-gb","type":"British female (voicecasting comparison)"},
}
SAMPLE_FILMS={
    "pub-airway-reopening":[0,5],
    "making-medicines-keep":[0,2],
}
def checked(args):
    proc=subprocess.run(args,capture_output=True,text=True)
    if proc.returncode:raise RuntimeError(proc.stderr[-1200:])

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--validate-only",action="store_true")
    parser.add_argument("--models",default="film-models")
    args=parser.parse_args()
    library=json.loads(SOURCES.read_text(encoding="utf-8"))
    records={f["slug"]:f for f in library["films"]}
    for key,indexes in SAMPLE_FILMS.items():
        assert key in records,key
        for n in indexes:
            assert len(records[key]["shots"][n]["narration"].split())>=8
    print("Four independent voices; exact research scripts; two sample subjects; audio never approved automatically.")
    if args.validate_only:return
    from kokoro_onnx import Kokoro
    base=(ROOT/args.models).resolve()
    tts=Kokoro(str(base/"kokoro-v1.0.fp16.onnx"),str(base/"voices-v1.0.bin"))
    OUT.mkdir(parents=True,exist_ok=True)
    entries=[]
    for key,indexes in SAMPLE_FILMS.items():
        for scene_number in indexes:
            scene=records[key]["shots"][scene_number]
            for name,speaker in PROFILES.items():
                speech=scene["narration"]
                wav,sr=tts.create(speech,voice=name,speed=1.02,
                                  lang=speaker["language"])
                wav=np.asarray(wav,dtype=np.float32).flatten()
                if not np.isfinite(wav).all() or len(wav)<sr:raise ValueError("Invalid synthetic voice")
                id=f"{key}-{scene_number+1:02d}-{name}"
                tmp=OUT/(id+".wav")
                target=OUT/(id+".m4a")
                sf.write(tmp,wav,sr)
                checked(["ffmpeg","-v","error","-y","-i",str(tmp),
                         "-af","loudnorm=I=-18:TP=-2:LRA=10",
                         "-c:a","aac","-b:a","144k",str(target)])
                tmp.unlink()
                entries.append({"sample":id,"narrator":name,"voice_type":speaker["type"],
                                "film":key,"scene":scene_number+1,"transcript":speech,
                                "file":target.name,
                                "sha256":hashlib.sha256(target.read_bytes()).hexdigest(),
                                "approval":"NEEDS FULL CONTINUOUS HUMAN AUDITION"})
    (OUT/"audition-ledger.json").write_text(
      json.dumps({"status":"AUDIO AUDITIONS ONLY - NOT RELEASED",
                  "engine":"Kokoro ONNX v1.0; no voice cloning",
                  "decision_rule":"A person must listen, verify technical pronunciation and select a voice before full rerecording",
                  "auditions":entries},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print("Audition files:",len(entries))
if __name__=="__main__":main()
