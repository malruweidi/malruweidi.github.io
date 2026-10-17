#!/usr/bin/env python3
"""Render V7 editorial pilots with V6 narration, corrected figures and 24 storyboard beats.

This never replaces a published film automatically. The audio and VTT are copied
unchanged from each matching V6 release so the spoken script remains synchronized.
"""
import argparse, json, re, math, subprocess, hashlib, tempfile, shutil
from pathlib import Path
import importlib.util
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/"assets/films/series-v6"
OUT=ROOT/"assets/films/series-v7-pilots"
CAT=ROOT/"assets/films/publication-series.json"
# Rebuilt corrections require new source-derived images; unchanged films remain cached.
FRAME_REVISION="v7.3-caption-safe"
ART_REVISIONS={
 "cerebral-cilia":"v7.4-chapter-specific-cilia",
 "slit2-robo":"v7.4-chapter-specific-receptor",
 "echo-cnn-lstm":"v7.2-ultrasound",
 "cubosome-theranostics":"v7.4-chapter-specific-cubosomes",
 "food-printing":"v7.4-chapter-specific-food-rheology"
}
def expected_visual_revision(slug):
 return FRAME_REVISION+"/"+ART_REVISIONS.get(slug,"film-specific")
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
                         "source":scene["image"].lstrip("/")
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
  # These are ACTUAL composited scene frames, not invented promotional art.
  # A six-chapter contact sheet makes scientific and editorial auditing practical.
  sheet=Image.new("RGB",(1920,800),(13,37,43))
  sd=ImageDraw.Draw(sheet)
  for chapter in range(1,7):
   reference=directory/(f"chapter-{chapter:02d}-beat-02.png")
   with Image.open(reference) as frame_image:
    thumb=frame_image.convert("RGB").resize((640,360),Image.Resampling.LANCZOS)
   x=((chapter-1)%3)*640
   y=((chapter-1)//3)*400
   sheet.paste(thumb,(x,y))
   sd.text((x+22,y+368),f"CHAPTER {chapter:02d} / VISUAL PROOF",fill=(234,217,191),
           font=art.art.font(19))
  contact=OUT/(slug+".contact.webp")
  sheet.save(contact,quality=88,method=6)
  metadata={
   "slug":slug,"visual_revision":expected_visual_revision(slug),"status":"STAGING ONLY — creative, legal and scientific human review outstanding",
   "film_style":"24 individually directed visual beats across 6 narrated chapters",
   "seconds":duration,"fps":24,"source_audio_sha256":hashlib.sha256(source.read_bytes()).hexdigest(),
   "movie_sha256":hashlib.sha256(out.read_bytes()).hexdigest(),
   "audio_and_captions":"preserved synchronized V6 narration and captions, not newly recorded",
   "visual_credit":"original explanatory diagrams explicitly separated from approved archival photos",
   "scene_count":6,"visual_beat_count":len(shot_records),"beats":shot_records,
   "contact_sheet":"/assets/films/series-v7-pilots/"+slug+".contact.webp",
   "primary_source":entry.get("doi") or entry.get("page")}
  (OUT/(slug+".json")).write_text(json.dumps(metadata,indent=2)+"\n")
  print("V7 PILOT",slug,"duration",round(duration,2),"bytes",out.stat().st_size,"shots",len(shot_records))

# Five peer-evidence-based cuts already exist and are preserved unaltered.
# A generic new drawing must not silently displace their source-matched art.
PRESERVE_SCHOLARLY={"making-medicines-keep","pla-grafting","pla-scaffolds",
                    "flow-chamber-method","microfluidic-virus"}

def complete(slug):
 paths=[OUT/(slug+ext) for ext in (".mp4",".vtt",".webp",".json",".contact.webp")]
 # Caption tracks are plain text: valid twelve-cue files may be below 1 KB.
 # Size thresholds must reflect the actual file format to avoid infinite rerenders.
 minimum=(1_000_000,100,3_000,300,12_000)
 if not all(p.is_file() and p.stat().st_size>=minimum[i]
            for i,p in enumerate(paths)):
  return False
 try:
  record=json.loads((OUT/(slug+".json")).read_text())
  beats=record.get("beats",[])
  valid_source=(len(beats)==24 and
      all(not str(b.get("source","")).startswith("/") for b in beats) and
      (slug!="cerebral-cilia" or
       all("figure-zebrafish-microscopy.jpg" not in str(b.get("source",""))
           for b in beats)))
  return (record["slug"]==slug and record["visual_beat_count"]==24 and
          record.get("visual_revision")==expected_visual_revision(slug) and
          record["movie_sha256"]==hashlib.sha256(paths[0].read_bytes()).hexdigest() and
          record.get("contact_sheet")=="/assets/films/series-v7-pilots/"+slug+".contact.webp" and
          paths[1].read_text().startswith("WEBVTT") and valid_source)
 except (OSError,KeyError,ValueError,TypeError):
  return False

def main():
 p=argparse.ArgumentParser()
 p.add_argument("--film",action="append",help="One or more exact publication film IDs")
 p.add_argument("--all-missing",action="store_true",help="Render only missing staging editions among 30 eligible films")
 p.add_argument("--batch-size",type=int,default=4,help="Maximum V7 staging films per Actions run")
 p.add_argument("--remaining-count",action="store_true",help="Return one numeric line containing unfinished films")
 args=p.parse_args()
 catalog=json.loads(CAT.read_text())["items"]
 byid={x["id"]:x for x in catalog}
 if len(byid)!=35:raise AssertionError("Bibliography completeness regression")
 eligible=[x["id"] for x in catalog if x["id"] not in PRESERVE_SCHOLARLY]
 if len(eligible)!=30:raise AssertionError("Protect exactly five source-specific research editions")
 if args.remaining_count:
  print(sum(not complete(slug) for slug in eligible))
  return
 if args.all_missing:
  if args.batch_size<1 or args.batch_size>8:raise ValueError("Batch size must be 1 through 8")
  selected=[slug for slug in eligible if not complete(slug)][:args.batch_size]
 else:
  selected=args.film or []
  if not selected:raise ValueError("Select --film or --all-missing")
 for slug in selected:
  if slug not in eligible:raise ValueError("Protected scholarly film or unknown ID: "+slug)
  render(byid[slug])
 print("V7 STAGING COMPLETE",len(selected),"remaining",sum(not complete(slug) for slug in eligible))
if __name__=="__main__": main()
