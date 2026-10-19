#!/usr/bin/env python3
"""Blind voice samples for Ruwaidix films. Synthesized AUDIO TESTS, never final voices.

No cloning, no third-party video avatar, no paid synthesis service. Each sample
is spoken by multiple local models/presets so editorial judgment can precede
expensive re-rendering. The published films are not changed.
"""
import argparse, hashlib, json, subprocess
from pathlib import Path
import numpy as np
import soundfile as sf

ROOT=Path(__file__).resolve().parents[1]
FILMS=ROOT/"assets/films/cinematic-library-v2.json"
DEST=ROOT/"assets/films/voice-auditions"

SAMPLES={
  "making-medicines-keep":(
    "A jar of syrup can look trustworthy while concealing an unstable preparation. "
    "That difficulty was familiar to pharmacists long before industrial manufacturing. "
    "Recipes described heat, consistency and substitutions. The question is what could be relied upon."
  ),
  "two-materials-no-section":(
    "The blade passed through the block, but no useful section formed. "
    "What fell away was fragmented material. I photographed it because that was the result. "
    "The exact mechanism of the separation was still a question."
  ),
  "what-a-bubble-can-do":(
    "An airway can reopen and still be injured. A moving air–liquid boundary passes across epithelial cells. "
    "Our experiment used a parallel-plate flow chamber, not a miniature human lung. "
    "The measurements tell us what happened under those conditions."
  )
}
VOICES=["bm_george","bm_fable","am_michael","bf_emma"]
def main():
    p=argparse.ArgumentParser()
    p.add_argument("--models",default="film-models")
    p.add_argument("--film",choices=list(SAMPLES))
    p.add_argument("--validate-only",action="store_true")
    args=p.parse_args()
    data=json.loads(FILMS.read_text())
    available={f["slug"] for f in data["films"]}
    assert set(SAMPLES).issubset(available)
    if args.validate_only:
        print("Narration samples grounded in 3 published source manifests")
        return
    from kokoro_onnx import Kokoro
    models=(ROOT/args.models).resolve()
    k=Kokoro(str(models/"kokoro-v1.0.fp16.onnx"),str(models/"voices-v1.0.bin"))
    DEST.mkdir(parents=True,exist_ok=True)
    result=[]
    for name,text in SAMPLES.items():
        if args.film and name!=args.film:continue
        for voice in VOICES:
            lang="en-gb" if voice.startswith("b") else "en-us"
            audio,sr=k.create(text,voice=voice,speed=1.0,lang=lang)
            audio=np.asarray(audio,dtype=np.float32).flatten()
            if not np.isfinite(audio).all() or len(audio)/sr<3:raise ValueError("Invalid synthesis")
            wav=DEST/(name+"-"+voice+".wav")
            mp3=DEST/(name+"-"+voice+".mp3")
            sf.write(str(wav),audio,sr)
            cmd=["ffmpeg","-hide_banner","-loglevel","error","-y","-i",str(wav),"-c:a","libmp3lame","-b:a","160k",str(mp3)]
            subprocess.run(cmd,check=True)
            wav.unlink()
            result.append({"film":name,"voice":voice,"language":lang,"speech_seconds":round(len(audio)/sr,1),
                "file":mp3.name,"sha256":hashlib.sha256(mp3.read_bytes()).hexdigest(),
                "source_text":text,"auditory_human_review":False,"approved_for_release":False})
    (DEST/"audition-register.json").write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n")
    print("Created",len(result),"voice audition samples; NONE approved")
if __name__=="__main__":main()
