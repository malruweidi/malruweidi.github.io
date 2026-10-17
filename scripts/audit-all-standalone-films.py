#!/usr/bin/env python3
"""Audit the original Ruwaidix documentary films and source-specific editions.

Extract six frames from the *actual* H.264 movies, never their promotional
posters. Publish a read-only, noindex director's review ledger. Filmmaking quality
and scientific permission still require human verification.
"""
import hashlib,json,subprocess,tempfile
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont

ROOT=Path(__file__).resolve().parents[1]
MEDIA=ROOT/"assets/films"
OUT=MEDIA/"quality-review-standalone"
OUT.mkdir(exist_ok=True,parents=True)
STANDALONE=[
 "airway-reopening-evidence-cut","cairo-microscope","making-medicines-keep",
 "ring-that-never-closed","the-laboratory-we-carried-with-us",
 "two-materials-no-section-evidence-cut","two-materials-no-section",
 "what-a-bubble-can-do","what-survives-the-experiment"
]
RESEARCH=[
 ("series-v5","pla-scaffolds"),("series-v5","microfluidic-virus"),
 ("series-v4","making-medicines-keep"),("series-v3","pla-grafting"),
 ("series-v5","flow-chamber-method")
]
CORRECTED=[
 "what-a-bubble-can-do-evidence-v2",
 "two-materials-no-section-source-v2"
]
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

def shell(*cmd):
 r=subprocess.run(cmd,capture_output=True,text=True)
 if r.returncode:
  raise RuntimeError(" ".join(map(str,cmd))+": "+r.stderr[-1500:])
 return r.stdout

def audit_movie(stem,edition):
 base=(MEDIA/edition/stem) if edition else (MEDIA/stem)
 movie=base.with_suffix(".mp4")
 vtt=base.with_suffix(".vtt")
 if not movie.exists() or not vtt.exists():
  raise FileNotFoundError(str(movie)+" and "+str(vtt))
 subtitles=vtt.read_text(encoding="utf-8-sig")
 if not subtitles.startswith("WEBVTT") or subtitles.count("-->")<6:
  raise ValueError("Missing or insufficient captions: "+str(vtt))
 tracks=json.loads(shell("ffprobe","-v","error","-show_streams","-show_format",
                        "-of","json",str(movie)))
 types={x["codec_type"] for x in tracks["streams"]}
 if not {"video","audio"}.issubset(types):
  raise ValueError("Missing video or audio: "+str(movie)+" tracks "+str(types))
 seconds=float(tracks["format"]["duration"])
 if seconds<50:
  raise ValueError("Unexpectedly short feature: "+str(movie))
 samples=[seconds*x for x in (.10,.26,.42,.58,.74,.90)]
 sheet=Image.new("RGB",(1920,804),(13,37,43))
 drawer=ImageDraw.Draw(sheet)
 with tempfile.TemporaryDirectory(prefix="ruwaidix-cinema-contact-") as tmp:
  for i,t in enumerate(samples):
   frame=Path(tmp)/(str(i)+".png")
   shell("ffmpeg","-hide_banner","-loglevel","error","-y",
         "-ss",str(t),"-i",str(movie),"-frames:v","1",
         "-vf","scale=640:360:force_original_aspect_ratio=decrease,"
               "pad=640:360:(ow-iw)/2:(oh-ih)/2:color=0x10272e",
         str(frame))
   with Image.open(frame) as img:
    shot=img.convert("RGB")
    if shot.size!=(640,360):
     raise AssertionError("Incorrect still size: "+str(shot.size))
    col=i%3;row=i//3;px=col*640;py=row*402
    sheet.paste(shot,(px,py))
   drawer.text((px+22,py+370),f"FRAME {i+1:02d} | {t:.1f}s",
               font=ImageFont.truetype(FONT,19),fill=(237,223,192))
 safe_stem=(edition+"-" if edition else "original-")+stem
 poster=OUT/(safe_stem+".webp")
 sheet.save(poster,quality=84,method=6)
 return {
  "film":stem,"edition":edition or "original",
  "source":"/"+movie.relative_to(ROOT).as_posix(),
  "captions":"/"+vtt.relative_to(ROOT).as_posix(),
  "contact_sheet":"/"+poster.relative_to(ROOT).as_posix(),
  "duration_seconds":round(seconds,3),
  "samples":[round(x,1) for x in samples],
  "sha256":hashlib.sha256(movie.read_bytes()).hexdigest(),
  "caption_cues":subtitles.count("-->"),
  "review_status":"visual inspection and source-rights clearance outstanding"
 }

def main():
 results=[]
 for stem in STANDALONE:
  results.append(audit_movie(stem,None))
 for edition,stem in RESEARCH:
  results.append(audit_movie(stem,edition))
 for stem in CORRECTED:
  results.append(audit_movie(stem,None))
 if len(results)!=16 or len({x["contact_sheet"] for x in results})!=16:
  raise AssertionError("16 unique original, research and corrected film editions expected")
 index={"schema":"ruwaidix-cinema-standalone-qa-v1","films":results,
        "count":len(results),"review_status":"UNAPPROVED DIRECTOR'S CONTACT SHEETS",
        "note":"Frame captures prove what was rendered, not scientific or creative quality."}
 (OUT/"review-index.json").write_text(json.dumps(index,indent=2,ensure_ascii=False)+"\n")
 print("16 preserved and corrected editions inspected; 96 actual movie frames produced.")

if __name__=="__main__":main()
