#!/usr/bin/env python3
"""Zero-cash, open-source Film 19 narration audition. NEVER auto-approve. Apache-2.0 Kokoro weights."""
import json, os, hashlib, math
from pathlib import Path
import numpy as np, soundfile as sf
from scipy.signal import resample_poly
from kokoro_onnx import Kokoro
ROOT=Path(__file__).resolve().parent
OUT=ROOT/"generated";OUT.mkdir(exist_ok=True)
SCENES=json.loads((ROOT/"script.json").read_text(encoding="utf-8"))["scenes"]
SR=48000
model=os.environ.get("KOKORO_MODEL","kokoro-v1.0.int8.onnx")
voices=os.environ.get("KOKORO_VOICES","voices-v1.0.bin")
kokoro=Kokoro(model, voices)
timeline=np.zeros((170*SR,),dtype=np.float32)
qc=[]
for i,s in enumerate(SCENES,1):
    target=float(s["duration"])
    generated=None;used_speed=None
    for speed in (0.97, 1.02, 1.08, 1.14):
        wav,sr=kokoro.create(s["text"],voice="af_heart",speed=speed,lang="en-us")
        wav=np.asarray(wav,dtype=np.float32).squeeze()
        if wav.ndim!=1:raise RuntimeError("Unexpected model output shape")
        if sr!=SR: wav=resample_poly(wav,SR,sr).astype(np.float32)
        if len(wav)/SR<target-.55:
            generated=wav;used_speed=speed;break
    if generated is None:
        raise RuntimeError(f"Scene {i} longer than {target}s even at natural upper speed limit; revise voice script, not clip/crop speech")
    fade=min(1600,len(generated)//3)
    generated[:fade]*=np.linspace(0,1,fade,dtype=np.float32)
    generated[-fade:]*=np.linspace(1,0,fade,dtype=np.float32)
    peak=float(np.max(np.abs(generated)))
    if not np.isfinite(peak) or peak<0.001:raise RuntimeError(f"Scene {i} silent or invalid")
    generated=np.clip(generated*(0.82/max(peak,.82)),-.92,.92)
    sf.write(OUT/f"chapter_{i:02d}.wav",generated,SR,subtype="PCM_24")
    begin=int((float(s["start"])+0.3)*SR);end=begin+len(generated)
    if end>len(timeline):raise RuntimeError("Timeline overflow")
    timeline[begin:end]+=generated
    qc.append({"scene":i,"start_seconds":s["start"],"allocation_seconds":target,"spoken_seconds":round(len(generated)/SR,3),"speed":used_speed,"peak":round(peak,4),"first_word_estimate":s["text"].split()[0]})
sf.write(OUT/"full_170s_narration.wav",np.clip(timeline,-.94,.94),SR,subtype="PCM_24")
(OUT/"narration_audit.json").write_text(json.dumps({"review_status":"SYNTHETIC_AUDITION_ONLY_NOT_APPROVED","word_count":sum(len(s["text"].split()) for s in SCENES),"duration_seconds":170,"sample_rate":SR,"model":model,"voice":"af_heart","scenes":qc},indent=2))
vtt=["WEBVTT",""]
def stamp(t):
    ms=round(t*1000);h=ms//3600000;ms%=3600000;m=ms//60000;ms%=60000;sec=ms//1000;ms%=1000
    return f"{h:02d}:{m:02d}:{sec:02d}.{ms:03d}"
for idx,(s,q) in enumerate(zip(SCENES,qc),1):
    words=s["text"].split();N=len(words)
    start=float(s["start"])+.3;length=q["spoken_seconds"];chunks=[words[j:j+11] for j in range(0,N,11)]
    for k,ch in enumerate(chunks):
        cum_before=sum(len(x) for x in chunks[:k]);cum_after=cum_before+len(ch)
        a=start+length*cum_before/N;b=start+length*cum_after/N
        if b-a<.30:b=a+.30
        vtt.extend([f"{stamp(a)} --> {stamp(b)}"," ".join(ch),""])
(OUT/"film19_narration_TIMING_APPROX_REVIEW.vtt").write_text("\n".join(vtt),encoding="utf-8")
print("SUCCESS: original neural narration WAVs generated. Transcript word timing approximate, human listening pending.")
print(json.dumps(qc))
