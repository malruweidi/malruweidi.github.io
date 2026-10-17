#!/usr/bin/env python3
"""Human-facing complete-frame review of new V3 owner/scientific documentaries.

Independent full encoded video evidence check: exact original asset Git blob,
source PDB/PDF-linked figures, MP4 hash, codecs, subtitles, scene count.
Contact-sheet captions are OUTSIDE footage. Not a creative or listening pass.
"""
import hashlib,io,json,subprocess
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/"assets/films/series-v3"
TARGET=["curcumin-cyanide","histology-failure","ace2-forms","micelles-pahs","pla-scaffolds"]
CLOCK=[3,11,18,26,33,41,48,56,63,71,78,86,93,101,108,116]
FACE="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def gitblob(path):
 data=path.read_bytes()
 return hashlib.sha1(b"blob "+str(len(data)).encode()+b"\x00"+data).hexdigest()
def cmd(args):
 p=subprocess.run(args,capture_output=True)
 if p.returncode:raise RuntimeError("Command failed: "+p.stderr.decode()[-600:])
 return p.stdout
def source_gate(name,meta):
 if name=="curcumin-cyanide":
  p=ROOT/meta["original_author_archived_figure"]
  assert gitblob(p)==meta["source_image_git_blob_sha"]
  assert meta["primary_doi"]=="10.1039/C9AY01557D"
 elif name=="histology-failure":
  assert meta["result"].startswith("UNSUCCESSFUL")
  for source in meta["sources"]:
   assert gitblob(ROOT/source["path"])==source["git_sha"]
 elif name=="ace2-forms":
  p=ROOT/"assets/films/source-structures/pdb-6m0j/6M0J.pdb"
  assert sha(p)==meta["pdb_structure_sha256"]
  assert meta["source_pdb"]=="6M0J"
  assert meta["article_doi"]=="10.3390/ijms22136703"
  f=meta["source_figures"]
  assert len(f)==1 and f[0]["figure_number"]==3
  assert sha(ROOT/"assets/films/source-figures/ace2-original/ace2-forms-figure-03.jpg")==f[0]["image_sha256"]
 elif name=="micelles-pahs":
  assert meta["original_grant"]=="UREP19-110-1-014"
  expected={
   "assets/owner-archive-2026-10-17/acs-2017-micelles-research-poster.webp":"c80f9d3dd5cdee81d521189598cb83c8eb8ab9cb",
   "assets/2026-10-15-lab-photos/copolymer-sample-qatar-university-2017.webp":"d1c8301885cdb6f83ff8ef647c7dfa371b4d592c",
   "assets/photos-2017-2019/series-of-unfortunate-trials-diblock-2017.webp":"fec7e23b25fb8b78c149862922b871015e0f0c7d"
  }
  assert set(meta["archival_files"])==set(expected)
  for file,blob_sha in expected.items():assert gitblob(ROOT/file)==blob_sha
  assert "No claim of measured" in meta["scientific_limit"]
 elif name=="pla-scaffolds":
  assert meta["doi"]=="10.1016/j.surfcoat.2020.126216"
  assert len(meta["source_pages"])==5
  assert "2021 PLA-film dataset is distinct" in meta["research_boundary"]
  labels={p["label"] for p in meta["source_pages"]}
  assert labels=={"Figure 1","Figure 5","Figure 6","Figure 7","Table 3"}
  for p in meta["source_pages"]:
   assert sha(ROOT/p["artifact"])==p["sha256"]
 else:raise ValueError("Unauthorized study requested")
def inspect(name):
 m=SRC/(name+".mp4")
 if not m.exists():print("PENDING",name);return False
 meta=json.loads((SRC/(name+".json")).read_text())
 assert meta["sha256"]==sha(m)
 assert len(meta.get("chapter_sources",meta.get("chapters",[])))==8
 assert "NOT " in meta["human_review"]
 assert (SRC/(name+".vtt")).read_text().startswith("WEBVTT")
 assert (ROOT/"assets/films/series"/(name+".mp4")).is_file()
 source_gate(name,meta)
 info=json.loads(cmd(["ffprobe","-v","error","-show_streams","-show_format","-of","json",str(m)]))
 assert {"h264","aac"}<={x["codec_name"] for x in info["streams"]}
 assert abs(float(info["format"]["duration"])-120)<.45
 video=next(s for s in info["streams"] if s["codec_type"]=="video")
 assert (video["width"],video["height"])==(1280,720)
 board=Image.new("RGB",(1920,4*(270+33)),(14,33,38))
 d=ImageDraw.Draw(board)
 ft=ImageFont.truetype(FACE,16)
 for k,sec in enumerate(CLOCK):
  data=cmd(["ffmpeg","-hide_banner","-loglevel","error","-ss",str(sec),"-i",str(m),"-map","0:v:0","-frames:v","1",
            "-f","image2pipe","-vcodec","mjpeg","-q:v","4","pipe:1"])
  pic=Image.open(io.BytesIO(data)).convert("RGB").resize((480,270),Image.Resampling.LANCZOS)
  x=k%4*480;y=k//4*303
  board.paste(pic,(x,y))
  d.text((x+12,y+278),f"{sec:03d}s / ORIGINAL ENCODED MP4 PIXELS",font=ft,fill=(230,236,221))
 out=SRC/"qa";out.mkdir(exist_ok=True)
 img=out/(name+"-contact.jpg");board.save(img,quality=90,subsampling=0)
 audit={"film":name,"hash":meta["sha256"],"source_gate":"Verified actual on-repository original image/experimental coordinate hashes and source identity",
        "runtime":float(info["format"]["duration"]),"sample_seconds":CLOCK,
        "pictured_scientific_evidence":"Source-attributed; chapter-level scientific interpretation still needs human evaluation",
        "note":"Full-frame inspection only. Does not approve pronunciation, art direction or publishing."}
 (out/(name+"-contact.json")).write_text(json.dumps(audit,indent=2)+"\n")
 print("SOURCE-CHECKED COMPLETE FRAMES",name,meta["sha256"][:12])
 return True
def main():
 complete=sum(inspect(x) for x in TARGET)
 if complete==0:raise RuntimeError("No new studies rendered yet")
 print("Audited",complete,"of",len(TARGET))
if __name__=="__main__":main()
