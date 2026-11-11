#!/usr/bin/env python3
"""Blind, non-cloned narrator auditions for Ruwaidix. NOT final film audio."""
import argparse
import hashlib
import json
import re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
SAMPLES=ROOT/"assets/films/voice-audition-v2"
PROMPTS={
 "historical": {
   "text":"In Minhāj al-dukkān, the discussion of syrups begins with julāb, sugar and rose water. The maker judged qiwām, the desired consistency.",
   "flag":["Minhāj al-dukkān","julāb","qiwām"],
   "source":"Making Medicines Keep; transliteration for listening, not an authenticated Arabic pronunciation."
 },
 "mechanobiology": {
   "text":"In rat L two alveolar epithelial cells, dexamethasone and transdehydroandrosterone reduced measured injury after a single advancing bubble.",
   "flag":["L2","dexamethasone","transdehydroandrosterone"],
   "source":"Dexamethasone and transdehydroandrosterone study; reported in-vitro experiment, not clinical care."
 },
 "personal": {
   "text":"At the microtome, the agarose and paraffin layers separated. I kept the photograph. There was no useful section to interpret.",
   "flag":["microtome","agarose","paraffin"],
   "source":"Owner's unsuccessful zebrafish histopathology attempt."
 }
}
# No cloning or user likeness is involved. Public downloadable model voices only.
CANDIDATES=[
 ("A","bm_george","en-gb",0.96),
 ("B","am_michael","en-us",0.99),
 ("C","af_sarah","en-us",0.97),
]
def main():
 p=argparse.ArgumentParser()
 p.add_argument("--models",default="film-models")
 p.add_argument("--validate-only",action="store_true")
 opts=p.parse_args()
 assert len(PROMPTS)==3 and len(CANDIDATES)==3
 assert all(re.fullmatch(r"[A-Z]",v[0]) for v in CANDIDATES)
 assert all(len(p["text"].split())>10 for p in PROMPTS.values())
 if opts.validate_only:
  print("Narration candidates validated, 9 evaluations planned.")
  return
 import numpy as np
 import soundfile as sf
 from kokoro_onnx import Kokoro
 m=Path(opts.models)
 voice=Kokoro(str(m/"kokoro-v1.0.fp16.onnx"),str(m/"voices-v1.0.bin"))
 SAMPLES.mkdir(parents=True,exist_ok=True)
 out={"status":"BLIND VOICE AUDITION; NO SOUND APPROVED","engine":"Kokoro ONNX",
      "candidate_map":"Stored in this private editorial source register; do not infer actor identity.",
      "auditions":[],"quality_gate":{"scientific_pronunciation":"NOT REVIEWED",
          "arabic_terms":"NOT REVIEWED","emotional_delivery":"NOT REVIEWED",
          "technical_loudness":"PRELIMINARY ONLY"}}
 for key,item in PROMPTS.items():
  for letter,voice_name,language,speed in CANDIDATES:
   samples,rate=voice.create(item["text"],voice=voice_name,speed=speed,lang=language)
   samples=np.asarray(samples,dtype=np.float32).flatten()
   if not np.isfinite(samples).all() or len(samples)<rate:raise RuntimeError("Invalid narrator generated waveform")
   path=SAMPLES/(key+"-"+letter+".wav")
   sf.write(str(path),samples,rate,subtype="PCM_16")
   out["auditions"].append({"subject":key,"blind_id":letter,"voice":voice_name,"language":language,
       "speed":speed,"duration_seconds":round(len(samples)/rate,3),
       "file":path.relative_to(ROOT).as_posix(),"sha256":hashlib.sha256(path.read_bytes()).hexdigest(),
       "pronunciation_checks":item["flag"],"script_source":item["source"],
       "transcript":item["text"],"approval":"NOT TESTED BY HUMAN LISTENER"})
   print("Narrator audit",key,letter,"duration",round(len(samples)/rate,1))
 (SAMPLES/"casting-register.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")

if __name__=="__main__":main()
