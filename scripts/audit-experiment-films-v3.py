#!/usr/bin/env python3
"""Audit the actual encoded V3 images, figures, audio and source/provenance.

A correctly functioning encoder or accurate publication DOI does NOT certify
narration, cinematic quality, accessibility, scientific interpretation or
copyright. The contact sheet preserves all frame pixels and traces MP4 SHA.
"""
import hashlib,io,json,subprocess
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont

ROOT=Path(__file__).resolve().parents[1]
FILM_DIR=ROOT/"assets/films/series-v3"
FIGURE_SOURCE=ROOT/"assets/films/source-figures/v3/source-figure-provenance.json"
FILMS={
  "pla-grafting":("10.3390/polym13213717",{1,4,8}),
  "flow-chamber-method":("10.3390/mps3040065",{1,5,6})
}
TIMES=[3,11,18,26,33,41,48,56,63,71,78,86,93,101,108,116]
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

def run(args):
 p=subprocess.run(args,capture_output=True)
 if p.returncode:raise RuntimeError(args[0]+": "+p.stderr.decode()[-1200:])
 return p.stdout

def hashfile(p):
 h=hashlib.sha256()
 with p.open("rb") as f:
  while b:=f.read(1024*1024):h.update(b)
 return h.hexdigest()

def check(name,doi,figures,source):
 movie=FILM_DIR/(name+".mp4")
 if not movie.exists():print("PENDING",name);return False
 transcript=FILM_DIR/(name+".vtt")
 meta=json.loads((FILM_DIR/(name+".json")).read_text())
 src={x["figure_number"]:x for x in source["figures"] if x["film"]==name}
 assert set(src)==figures
 for n,item in src.items():
  original=ROOT/item["local_path"]
  assert original.exists() and hashfile(original)==item["sha256"]
 assert meta.get("doi",meta.get("primary_doi"))==doi
 assert hashfile(movie)==meta["sha256"]
 assert transcript.read_text().startswith("WEBVTT")
 info=json.loads(run(["ffprobe","-v","error","-show_streams","-show_format","-of","json",str(movie)]))
 assert abs(float(info["format"]["duration"])-120)<.6
 streams=info["streams"]
 assert {"h264","aac"}<={s["codec_name"] for s in streams}
 assert next(s for s in streams if s["codec_type"]=="video")["width"]==1280
 assert next(s for s in streams if s["codec_type"]=="video")["height"]==720
 mw,mh=480,270;strip=34
 board=Image.new("RGB",(4*mw,4*(mh+strip)),(17,38,42))
 d=ImageDraw.Draw(board);f=ImageFont.truetype(FONT,15)
 for k,sec in enumerate(TIMES):
  raw=run(["ffmpeg","-hide_banner","-loglevel","error","-ss",str(sec),"-i",str(movie),
    "-frames:v","1","-f","image2pipe","-vcodec","mjpeg","-q:v","4","pipe:1"])
  shot=Image.open(io.BytesIO(raw)).convert("RGB").resize((mw,mh),Image.Resampling.LANCZOS)
  x=k%4*mw;y=k//4*(mh+strip)
  board.paste(shot,(x,y))
  d.text((x+11,y+mh+8),f"{sec:03d}s  /  ENCODED SOURCE FRAME",font=f,fill=(242,235,215))
 out=FILM_DIR/"qa"
 out.mkdir(parents=True,exist_ok=True)
 p=out/(name+"-contact.jpg")
 board.save(p,quality=92,subsampling=0)
 (out/(name+"-contact.json")).write_text(json.dumps({"film":name,"doi":doi,"source_sha256":meta["sha256"],
    "source_original_figure_numbers":sorted(figures),"sample_seconds":TIMES,
    "preserves_entire_frames":True,"human_viewed_or_listened":False,
    "release_state":"INDEPENDENT SCIENTIFIC AND CINEMATIC VIEWING REQUIRED"},indent=2)+"\n")
 print("QA contact sheet",p,hashfile(p))
 return True

def main():
 source=json.loads(FIGURE_SOURCE.read_text())
 count=sum(check(k,*v,source) for k,v in FILMS.items())
 if count==0:raise RuntimeError("No new paper-specific films yet")
 print(f"PASS: {count} independent source-verified scientific films with original encoded frame samples.")
if __name__=="__main__":main()
