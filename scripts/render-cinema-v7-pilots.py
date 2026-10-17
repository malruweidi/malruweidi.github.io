#!/usr/bin/env python3
"""Render V7 editorial pilots with V6 narration, corrected figures and 24 storyboard beats.

This never replaces a published film automatically. The audio and VTT are copied
unchanged from each matching V6 release so the spoken script remains synchronized.
"""
import argparse, json, re, math, subprocess, hashlib, tempfile, shutil
from pathlib import Path
import importlib.util
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/"assets/films/series-v6"
OUT=ROOT/"assets/films/series-v7-pilots"
CAT=ROOT/"assets/films/publication-series.json"
ART=ROOT/"scripts/build-cinema-v7-previews.py"
spec=importlib.util.spec_from_file_location("ruwaidix_v7_previews",ART)
art=importlib.util.module_from_spec(spec);spec.loader.exec_module(art)

def cmd(*parts):
 r=subprocess.run(parts,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
 if r.returncode: raise RuntimeError(" ".join(map(str,parts))+"\n"+r.stderr[-4000:])
 return r.stdout

def timecode(t):
 h,m=divmod(t,3600);m,ss=divmod(m,60)
 return f"{int(h):02d}:{int(m):02d}:{ss:06.3f}"

def parse_scene_boundaries(captions):
 times=[int(h)*3600+int(m)*60+float(sec)
        for h,m,sec in re.findall(r"(\d\d):(\d\d):(\d\d\.\d\d\d)\s*-->",captions)]
 if len(times)!=12:raise ValueError("V6 requires exactly 12 half-chapter cue starts, found "+str(len(times)))
 times=[max(0.0,times[k*2]-0.55) for k in range(6)]
 if abs(times[0])>.1:raise ValueError("Unexpected first caption start")
 boundaries=[0.0]+times[1:]+[84.0]
 if any(b<=a for a,b in zip(boundaries,boundaries[1:])):raise ValueError("Nonmonotonic scene captions")
 return boundaries

def render(entry):
 slug=entry["id"]
 source=SRC/(slug+".mp4")
 captions=SRC/(slug+".vtt")
 manifest=SRC/(slug+".json")
 for p in (source,captions,manifest):
  if not p.is_file():raise FileNotFoundError(p)
 out=OUT/(slug+".mp4")
 OUT.mkdir(exist_ok=True,parents=True)
 lines=captions.read_text(encoding="utf-8")
 bounds=parse_scene_boundaries(lines)
 with tempfile.TemporaryDirectory(prefix="ruwaidix-v7-"+slug+"-") as temporary:
  directory=Path(temporary)
  ffcat=directory/"shots.ffcat"
  entries=["ffconcat version 1.0"]
  shot_records=[]
  durations=[]
  # One film is 84 seconds at 24 fps: exactly 2016 pictures.
  baseframes=0
  for i,scene in enumerate(entry["scenes"]):
   endframe=round(bounds[i+1]*24)
   startframe=round(bounds[i]*24)
   count=endframe-startframe
   if count<80:raise ValueError("Short or unsynchronized scene")
   for phase in range(4):
    size=count//4 + (1 if phase<(count%4) else 0)
    duration=size/24
    path=directory/(f"chapter-{i+1:02d}-beat-{phase+1:02d}.png")
    art.frame(entry,scene,phase,path,ROOT)
    entries.extend(["file '"+str(path)+"'",f"duration {duration:.7f}"])
    shot_records.append({"scene":scene["id"],"phase":phase+1,
                         "seconds":round(duration,3),
                         "source":art.art.approved_photo(slug,scene,ROOT).as_posix()
                         if art.art.approved_photo(slug,scene,ROOT) and phase in (0,1)
                         else "original-nonquantitative-v7-schematic"})
    durations.append(duration);baseframes+=size
  assert baseframes==2016,(slug,baseframes)
  # ffconcat repeats the last still so its explicit duration survives decoding.
  entries.append("file '"+str(path)+"'")
  ffcat.write_text("\n".join(entries)+"\n")
  ffprobe=json.loads(cmd("ffprobe","-v","error","-show_streams","-of","json",str(source)))
  if not any(st["codec_type"]=="audio" for st in ffprobe["streams"]):
   raise ValueError("Cannot preserve narration without an audio track")
  cmd("ffmpeg","-hide_banner","-loglevel","error","-y",
      "-safe","0","-f","concat","-i",str(ffcat),
      "-i",str(source),
      "-filter_complex",
      "[0:v]fps=24,scale=1320:742:flags=lanczos,"
      "crop=1280:720:x='20+15*sin(n/29)':y='11+8*cos(n/41)',"
      "setsar=1,format=yuv420p[v]",
      "-map","[v]","-map","1:a:0",
      "-r","24","-c:v","libx264","-preset","veryfast","-crf","21",
      "-c:a","copy","-t","84","-movflags","+faststart",str(out))
  duration=float(json.loads(cmd("ffprobe","-v","error","-show_entries",
             "format=duration","-of","json",str(out)))["format"]["duration"])
  if abs(duration-84)>.25:raise AssertionError((slug,duration))
  shutil.copyfile(captions,OUT/(slug+".vtt"))
  cmd("ffmpeg","-hide_banner","-loglevel","error","-y",
      "-ss","1.0","-i",str(out),"-frames:v","1","-q:v","75",
      str(OUT/(slug+".webp")))
  metadata={
   "slug":slug,"status":"STAGING ONLY — creative, legal and scientific human review outstanding",
   "film_style":"24 individually directed visual beats across 6 narrated chapters",
   "seconds":duration,"fps":24,"source_audio_sha256":hashlib.sha256(source.read_bytes()).hexdigest(),
   "movie_sha256":hashlib.sha256(out.read_bytes()).hexdigest(),
   "audio_and_captions":"preserved synchronized V6 narration and captions, not newly recorded",
   "visual_credit":"original explanatory diagrams explicitly separated from approved archival photos",
   "scene_count":6,"visual_beat_count":len(shot_records),"beats":shot_records,
   "primary_source":entry.get("doi") or entry.get("page")}
  (OUT/(slug+".json")).write_text(json.dumps(metadata,indent=2)+"\n")
  print("V7 PILOT",slug,"duration",round(duration,2),"bytes",out.stat().st_size,"shots",len(shot_records))

def main():
 p=argparse.ArgumentParser()
 p.add_argument("--film",action="append",required=True)
 args=p.parse_args()
 catalog=json.loads(CAT.read_text())["items"]
 byid={x["id"]:x for x in catalog}
 if len(byid)!=35:raise AssertionError("Bibliography completeness regression")
 for slug in args.film:
  if slug not in byid:raise ValueError(slug)
  render(byid[slug])

if __name__=="__main__": main()
