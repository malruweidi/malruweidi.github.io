#!/usr/bin/env python3
"""Cerebral-cilia Film 02. Motion-first, seekable, evidence-aware documentary.

Creates an 84-second H264 review master, synchronized original narration, captions,
a real-frame poster and six-scene contact sheet. Optional owner-provided zebrafish
microscopy is downloaded from URLs already documented in the website repository.
When footage is unavailable, animated editorial science is used; no footage is
invented or misidentified as a study experiment. Nothing is published to the site.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import math
import os
import re
import shutil
import subprocess
import tempfile
import urllib.request
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageFilter

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets/films/series-v10-cilia"
PREVIOUS=ROOT/"assets/films/series-v7-pilots/cerebral-cilia.mp4"
CAPTIONS=ROOT/"assets/films/series-v7-pilots/cerebral-cilia.vtt"
PAPER_IMAGE=ROOT/"assets/home-archive/figure-zebrafish-microscopy.jpg"
CONTEXT_IMAGE=ROOT/"assets/evidence-zebrafish.webp"
W,H,FPS,DURATION=1280,720,24,84
INK=(8,23,31); DEEP=(13,40,53); AQUA=(112,225,212); CERULEAN=(72,147,180)
GOLD=(238,179,114); WHITE=(244,242,229); MIST=(167,192,197); MUTED=(108,149,160)
SANS="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
SERIF="/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
MONO="/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
SOURCE_DOI="10.1161/ATVBAHA.118.311231"
MICROSCOPY_URLS=[
 "https://cdn.creativeclaw.co/u/8a002dd8/videos/a36572cf-79ea-4108-83c1-66794c061732.mp4",
 "https://cdn.creativeclaw.co/u/8a002dd8/videos/0b2fc0e1-5310-4f0a-a94a-94f3471960a2.mp4"
]
FRAMES=int(DURATION*FPS)
SCENE_TITLES=[
 "The vessel is alive",
 "Watch development unfold",
 "The sensory projection",
 "Evidence in moving systems",
 "The work of a team",
 "A moment is not a flow"
]

def cmd(args, timeout=None):
 p=subprocess.run(list(map(str,args)),capture_output=True,text=True,timeout=timeout)
 if p.returncode:raise RuntimeError(" ".join(map(str,args))+"\n"+p.stderr[-3000:])
 return p.stdout

def font(size,style="sans"):
 return ImageFont.truetype({"sans":SANS,"bold":BOLD,"serif":SERIF,"mono":MONO}[style],size)

def ease(x):
 x=max(0.,min(1.,x))
 return x*x*(3.-2.*x)

def lerp(a,b,q):return a+(b-a)*q

def fade_color(base,c,alpha):
 a=ease(alpha);return tuple(int(lerp(base[i],c[i],a)) for i in range(3))

def draw_title(d,s,x,y,size=48,color=WHITE,style="serif",visible=1,delay_x=24):
 if visible<0.006:return
 a=ease(visible)
 d.text((int(x+(1-a)*delay_x),int(y+(1-a)*11)),s,
        fill=fade_color(INK,color,a),font=font(size,style))

def line(d,pts,color,width=2):
 d.line([(round(x),round(y)) for x,y in pts],fill=color,width=width,joint="curve")

def circle(d,x,y,r,fill=None,outline=None,width=2):
 d.ellipse((round(x-r),round(y-r),round(x+r),round(y+r)),fill=fill,outline=outline,width=width)

def bezier(P,t):
 u=1-t
 return (u*u*u*P[0][0]+3*u*u*t*P[1][0]+3*u*t*t*P[2][0]+t*t*t*P[3][0],
         u*u*u*P[0][1]+3*u*u*t*P[1][1]+3*u*t*t*P[2][1]+t*t*t*P[3][1])

def paths_for_scene(t,scale=1.0):
 paths=[
  [(70,420),(360,278),(650,335),(1210,182)],
  [(305,370),(430,510),(790,490),(1175,625)],
  [(600,326),(774,255),(812,96),(1110,73)],
  [(418,369),(470,269),(478,196),(575,116)],
  [(714,350),(875,470),(1001,434),(1174,392)],
  [(-80,592),(149,533),(320,570),(560,455)]
 ]
 dx=13*math.sin(t*.27);dy=6*math.cos(t*.23)
 return [[((x-640)*scale+640+dx,(y-360)*scale+360+dy) for x,y in P] for P in paths]

def vascular_network(d,t,intensity=1):
 paths=paths_for_scene(t,scale=1.02+.022*math.sin(t*.3))
 for i,P in enumerate(paths):
  points=[bezier(P,k/70) for k in range(71)]
  # Layers give the tubes depth; actual particles are artistic, not tracers.
  line(d,points,(22,70,82),max(9,round(24*intensity)))
  line(d,points,(43,122,140),max(5,round(12*intensity)))
  line(d,points,(86,188,187),max(2,round(3*intensity)))
  n=7 if i<4 else 5
  for k in range(n):
   q=(t*(.085+.01*i)+k/n+.09*i)%1
   x,y=bezier(P,q)
   r=2.5+1.7*math.sin(math.pi*q)
   circle(d,x,y,r,fill=GOLD if k%4==0 else AQUA)

def lumen(d,t,focus=False):
 # Continuous 2.5-D camera drift, streaming particles and passively bending cilia.
 shift=20*math.sin(t*.27)
 upper=[(x,220+26*math.sin(x/185+t*.13)+shift*.17) for x in range(-25,1320,12)]
 lower=[(x,506+27*math.sin(x/180+t*.13+.7)+shift*.13) for x in range(-25,1320,12)]
 d.polygon(upper+[(1310,-20),(-20,-20)],fill=(11,34,47))
 d.polygon(lower+[(1310,750),(-20,750)],fill=(22,57,66))
 d.polygon(upper+list(reversed(lower)),fill=(14,53,66))
 line(d,upper,(78,177,184),7)
 line(d,lower,(85,186,175),9)
 line(d,[(x,y+12) for x,y in lower],(31,101,110),4)
 for k in range(48):
  u=(k*.61803398875 + t*(.13+(k%5)*.012))%1
  x=-40+u*1380
  yr=((k*71)%257)/257
  y=lerp(270+15*math.sin(x/175),452+22*math.sin(x/185),yr)
  radius=3.0+(k%3)*.75
  circle(d,x,y,radius,fill=GOLD if k%11==0 else CERULEAN)
  if k%5==0:
   line(d,[(x-12,y),(x-4,y)],(43,116,138),2)
 # Static nonmotile primary cilia deflected by conceptual flow.
 for i in range(13):
  x=130+87*i
  y=509+27*math.sin(x/180+t*.13+.7)+shift*.13
  length=(117 if focus and i in (5,6,7) else 37+(i%3)*4)
  bend=10*math.sin(t*.65+i*.16) if focus else 7*math.sin(t*.52+i*.31)
  pts=[(x,y),(x+8+bend*.3,y-length*.36),
       (x+15+bend*.7,y-length*.7),(x+23+bend,y-length)]
  for w,col in ((7,(25,80,93)),(3,(136,222,207))):
   curve=[bezier(pts,s/18) for s in range(19)]
   line(d,curve,col,w)
  circle(d,x+23+bend,y-length,4,AQUA)

def selection_overlay(d,t):
 """A moving editorial tracking grid. Never a particle-tracking measurement."""
 x=int(166+720*ease((t%5)/5))
 line(d,[(x,170),(x,540)],(57,110,121),1)
 line(d,[(x-32,184),(x+32,184)],GOLD,2)
 line(d,[(x-32,526),(x+32,526)],GOLD,2)
 for i in range(10):
  px=166+i*101
  circle(d,px,565,2,fill=CERULEAN)

def backdrop():
 # One cached still backing; all foreground geometry has genuine frame motion.
 # The subtle optical gradient is constructed once, never recalculated per frame.
 bg=Image.new("RGB",(W,H),INK);p=bg.load()
 for y in range(H):
  for x in range(W):
   v=max(0.,1-math.sqrt(((x-920)/1100)**2+((y-260)/790)**2))
   k=.26*v
   p[x,y]=(round(INK[0]*(1-k)+DEEP[0]*k),
           round(INK[1]*(1-k)+DEEP[1]*k),
           round(INK[2]*(1-k)+DEEP[2]*k))
 return bg

def metadata(d,scene,time):
 line(d,[(65,89),(1210,89)],(39,84,95),2)
 draw_title(d,"RUWAIDIX   /   VISUAL RESEARCH",67,52,16,AQUA,"mono")
 draw_title(d,f"{scene+1:02d}  /  06",70,657,15,MUTED,"mono")
 draw_title(d,"CEREBRAL VESSELS  /  ZEBRAFISH",790,657,14,MUTED,"mono")
 line(d,[(70,695),(70+1140*time/84,695)],GOLD,3)

def draw_figure(im,fig,x=160,y=155,w=954,h=380):
 # Entire archived source figure is contained with its original aspect ratio.
 image=fig.copy();image.thumbnail((w,h),Image.Resampling.LANCZOS)
 d=ImageDraw.Draw(im)
 d.rounded_rectangle((x-14,y-14,x+w+14,y+h+14),radius=12,fill=(224,228,217))
 px=x+(w-image.width)//2;py=y+(h-image.height)//2
 im.paste(image,(px,py))
 return px,py,image.width,image.height

def draw_archival(im,video_frame,t,scene):
 d=ImageDraw.Draw(im)
 # Footage is not retouched/annotated to imply observed cilia or measurements.
 if video_frame is not None:
  x0,y0,x1,y1=100,135,1180,555
  d.rounded_rectangle((x0-11,y0-11,x1+11,y1+11),radius=10,fill=(29,65,76))
  source=video_frame.copy()
  source.thumbnail((x1-x0,y1-y0),Image.Resampling.BICUBIC)
  px=(W-source.width)//2;py=y0+((y1-y0-source.height)//2)
  im.paste(source,(px,py))
  line(d,[(100,574),(1180,574)],(52,117,127),2)
  draw_title(d,"ARCHIVAL ZEBRAFISH MICROSCOPY",111,587,18,AQUA,"mono")
 else:
  # Clearly conceptual motion, not a counterfeit 'microscopy' movie.
  lumen(d,t,focus=False)
  draw_title(d,"A LIVING VASCULAR SYSTEM",105,580,22,AQUA,"mono")

def chapter_bounds(caption_text):
 starts=[]
 for hh,mm,ss in re.findall(r"(\d\d):(\d\d):(\d\d\.\d\d\d)\s*-->",caption_text):
  starts.append(int(hh)*3600+int(mm)*60+float(ss))
 assert len(starts)==12,len(starts)
 bounds=[0.]+[max(0.,starts[i]-0.55) for i in (2,4,6,8,10)]+[float(DURATION)]
 assert all(bounds[i]<bounds[i+1] for i in range(6)),bounds
 return bounds

def chapter_of(t,bounds):
 for i in range(6):
  if t<bounds[i+1]:return i,t-bounds[i],bounds[i+1]-bounds[i]
 return 5,bounds[-1]-bounds[-2],bounds[-1]-bounds[-2]

def actual_frame(t,background,figure,archive_frames,bounds):
 j,loc,duration=chapter_of(t,bounds)
 p=loc/duration
 im=background.copy(); d=ImageDraw.Draw(im)
 # Each scene includes continuous, semantic motion. Not still-shot Ken Burns.
 if j==0:
  vascular_network(d,t)
  # Typographic reveal while light packets travel through the branching tree.
  d.rectangle((85,108,1006,300),fill=(9,26,35))
  draw_title(d,"How does a vessel",93,129,65,WHITE,"serif",)
  draw_title(d,"know blood is moving?",93,202,53,GOLD,"serif")
  draw_title(d,"Flow meets developing tissue.",93,347,24,AQUA,"sans",)
  for k in range(5):
   x=123+96*k+36*math.sin(t*.52+k*.6)
   circle(d,x,535+20*math.sin(t*.31+k*.7),4,fill=AQUA)
 elif j==1:
  frm=frame_for_scene(j,loc,archive_frames)
  draw_archival(im,frm,t,j)
  d=ImageDraw.Draw(im)
  if frm is not None:
   draw_title(d,"DEVELOPMENT / MOTION",110,97,22,WHITE,"mono")
  # Small progress cursor glides continuously beneath unaltered source footage.
  x=104+(1070*p)
  line(d,[(105,620),(1177,620)],(58,118,129),2)
  circle(d,x,620,5,fill=GOLD)
 elif j==2:
  lumen(d,t,focus=True)
  draw_title(d,"A sensory projection",88,122,60,WHITE,"serif")
  # Passive bending only; primary cilia do NOT wave like motile flagella.
  if loc>1.1:
   x=668; yy=327
   line(d,[(x,yy),(x-50,yy-56)],GOLD,2)
   circle(d,x,yy,8,outline=GOLD,width=2)
   draw_title(d,"PRIMARY CILIUM",330,230,18,GOLD,"mono")
  draw_title(d,"Fluid movement changes the mechanical setting.",
             99,601,20,AQUA,"sans")
 elif j==3:
  # Moving inspection diagram, never fictitious measured bar charts.
  lumen(d,t*.75,focus=False)
  selection_overlay(d,t)
  draw_title(d,"Image. Locate. Compare.",93,115,53,WHITE,"serif")
  stages=["VESSEL GEOMETRY","CILIA DISTRIBUTION","FLOW CONDITIONS"]
  for n,s in enumerate(stages):
   reveal=ease((loc-n*.9-.5)/.75)
   if reveal:
    px=104+n*355
    d.rounded_rectangle((px,585,px+324,632),radius=8,fill=(17,56,70))
    draw_title(d,s,px+9,600,16,fade_color((17,56,70),AQUA,reveal),"mono")
  # Source figure gets a distinct uninterrupted readable dwell, not a zoom crop.
  if loc>=duration-4.7:
   im=background.copy();d=ImageDraw.Draw(im)
   draw_figure(im,figure)
   d=ImageDraw.Draw(im)
   draw_title(d,"PUBLISHED RESEARCH FIGURE",160,563,17,AQUA,"mono")
   draw_title(d,SOURCE_DOI,160,597,16,MIST,"mono")
 elif j==4:
  frm=frame_for_scene(j,loc,archive_frames)
  if frm is not None and loc<duration*.64:
   draw_archival(im,frm,t,j)
   d=ImageDraw.Draw(im)
   draw_title(d,"THE ARCHIVE",111,96,23,WHITE,"serif")
  else:
   vascular_network(d,t,intensity=.85)
   # Collaborative work: intersecting nodes converge on research practice.
   anchors=[(240,340),(508,245),(780,348),(1014,230),(876,530)]
   for a,bb in ((0,1),(1,2),(2,3),(2,4),(0,4)):
    line(d,[anchors[a],anchors[bb]],(60,134,141),2)
   for k,(x,y) in enumerate(anchors):
    circle(d,x+8*math.sin(t*.5+k),y+8*math.cos(t*.4+k),13,fill=(23,69,79),outline=AQUA,width=3)
   d.rectangle((77,99,1147,214),fill=(10,31,39))
   draw_title(d,"A collaborative experiment.",88,119,54,WHITE,"serif")
   draw_title(d,"Microscopy is a record, not a whole explanation.",
              95,587,19,AQUA,"sans")
 elif j==5:
  vascular_network(d,t,intensity=.8)
  d.rectangle((82,115,1150,347),fill=(9,28,37))
  draw_title(d,"A still image holds a moment.",94,146,52,WHITE,"serif")
  draw_title(d,"Flow changes the question.",94,228,54,GOLD,"serif")
  if loc>duration*.58:
   d.rectangle((100,425,1100,572),fill=(12,38,49))
   draw_title(d,"Endothelial cilia during cerebral-vascular development",
              124,444,25,WHITE,"sans")
   draw_title(d,"Zebrafish  /  Collaborative study  /  2018",
              124,493,18,AQUA,"mono")
   draw_title(d,SOURCE_DOI,124,535,16,MIST,"mono")
 d=ImageDraw.Draw(im)
 metadata(d,j,t)
 # Motivated dark dissolves: never hard white flashes or seizure-like strobes.
 edge=ease(loc/.52)*ease((duration-loc)/.42)
 if edge<.999:
  plate=Image.new("RGB",(W,H),INK)
  im=Image.blend(plate,im,edge)
 return im

def frame_for_scene(scene,local,frames):
 series=frames.get(scene)
 if not series:return None
 # Preserve original recording direction. We do not freeze the last frame
 # or reverse microscopic motion (which would misstate flow direction).
 duration=len(series)/12.
 other=frames.get(4 if scene==1 else 1)
 if other and local>duration-.35:
  q=ease((local-(duration-.35))/.65)
  if q<1:
   a=series[min(len(series)-1,max(0,int(local*12)))]
   b=other[min(len(other)-1,max(0,int((local-duration+.35)*12)))]
   # Brief cinematic dissolve between two REAL recordings, each contained.
   canvas=[]
   for source in (a,b):
    mat=Image.new("RGB",(1000,540),INK)
    original=source.copy()
    original.thumbnail((1000,540),Image.Resampling.BICUBIC)
    mat.paste(original,((1000-original.width)//2,(540-original.height)//2))
    canvas.append(mat)
   return Image.blend(canvas[0],canvas[1],q)
  # Continue moving forward in the other archive without reverse playback.
  index=int(max(0,local-duration+.35)*12)%len(other)
  return other[index]
 # If only one original source is retrievable, loop its authentic frames.
 # This is a visible archive replay, never synthetic experimental evidence.
 index=max(0,int(local*12))%len(series)
 return series[index]

def prepare_clips(workspace,with_clips=True):
 """"Optional" means no claim or counterfeit footage if the source goes offline."""
 mapping={}; sources=[]
 if not with_clips:return mapping,sources
 for i,url in enumerate(MICROSCOPY_URLS):
  raw=workspace/f"owner-archive-{i}.mp4"
  try:
   req=urllib.request.Request(url,headers={"User-Agent":"Ruwaidix-science-cinema/1.0"})
   with urllib.request.urlopen(req,timeout=28) as response,raw.open("wb") as sink:
    shutil.copyfileobj(response,sink)
   if raw.stat().st_size<5000:raise ValueError("Empty source")
   meta=json.loads(cmd(["ffprobe","-v","error","-show_format","-show_streams","-of","json",raw],timeout=25))
   if not any(s.get("codec_type")=="video" for s in meta.get("streams",[])):raise ValueError("No source video")
   if float(meta["format"]["duration"])<2.0:raise ValueError("Source too short")
   scene=(1 if i==0 else 4)
   folder=workspace/f"extracted-{i}"
   folder.mkdir()
   segment=(12 if i==0 else 10)
   # Extraction may show the same genuine frames looped if shorter than the scene.
   cmd(["ffmpeg","-hide_banner","-loglevel","error","-y",
        "-i",raw,"-t",str(min(segment,float(meta["format"]["duration"]))),
        "-vf","fps=12,scale=1000:540:force_original_aspect_ratio=decrease",
        "-vsync","0",str(folder/"%04d.jpg")],timeout=120)
   paths=sorted(folder.glob("*.jpg"))
   if len(paths)<15:raise ValueError("No usable extracted frames")
   # Read the moderately sized archive frames once for time-seekable access.
   mapping[scene]=[Image.open(p).convert("RGB") for p in paths]
   sources.append({"scene":scene+1,"url":url,"original_duration":float(meta["format"]["duration"]),
                   "frames_extracted":len(paths),"use":"archival cardiovascular motion / contextual, not direct proof of cilia"})
   print("ARCHIVAL CLIP",i,len(paths),"frames",flush=True)
  except Exception as ex:
   # No fake microscopy; the corresponding shot becomes visibly stylized.
   print("ARCHIVAL SOURCE UNAVAILABLE",i,str(ex)[:220],flush=True)
 return mapping,sources

def probe(path):
 return json.loads(cmd(["ffprobe","-v","error","-show_format","-show_streams","-of","json",path]))

def validate():
 for p in (PREVIOUS,CAPTIONS,PAPER_IMAGE,CONTEXT_IMAGE):
  assert p.is_file(),p
 assert CAPTIONS.read_text(encoding="utf8").startswith("WEBVTT")
 info=probe(PREVIOUS)
 assert {"audio","video"} <= {s["codec_type"] for s in info["streams"]}
 assert abs(float(info["format"]["duration"])-DURATION)<.3
 bounds=chapter_bounds(CAPTIONS.read_text(encoding="utf8"))
 with Image.open(PAPER_IMAGE) as f:
  assert f.width>=350 and f.height>=200
 return bounds

def render(skip_archive=False):
 bounds=validate()
 OUT.mkdir(parents=True,exist_ok=True)
 with tempfile.TemporaryDirectory(prefix="ruwaidix-cilia-v10-") as tmp:
  work=Path(tmp);archival,sources=prepare_clips(work,not skip_archive)
  with Image.open(PAPER_IMAGE) as f: figure=f.convert("RGB")
  bg=backdrop()
  movie=OUT/"cerebral-cilia.mp4"
  raw=work/"visual-master.mp4"
  args=["ffmpeg","-hide_banner","-loglevel","error","-y",
        "-f","rawvideo","-pix_fmt","rgb24","-s",f"{W}x{H}",
        "-r",str(FPS),"-i","-","-an","-c:v","libx264",
        "-preset","fast","-crf","20","-pix_fmt","yuv420p",
        "-movflags","+faststart",str(raw)]
  process=subprocess.Popen(args,stdin=subprocess.PIPE,stderr=subprocess.PIPE)
  sheet=Image.new("RGB",(1200,1080),INK)
  poster=None
  review_times=[(bounds[j]+bounds[j+1])*.5 for j in range(6)]
  review_ids={round(FPS*t):j for j,t in enumerate(review_times)}
  try:
   for n in range(FRAMES):
    t=n/FPS
    frame=actual_frame(t,bg,figure,archival,bounds)
    if n in review_ids:
     j=review_ids[n]
     sheet.paste(frame.resize((600,338),Image.Resampling.LANCZOS),
                 ((j%2)*600,(j//2)*360))
    if n==FPS*3:poster=frame.copy()
    process.stdin.write(frame.tobytes())
    if n and n%(FPS*20)==0:print("FRAME",n,"/",FRAMES,flush=True)
   process.stdin.close()
   error=process.stderr.read().decode("utf8","replace")
   if process.wait():raise RuntimeError("Encoder error "+error[-2000:])
  except BaseException:
   process.kill()
   raise
  # Unchanged narration/caption timeline; normalize existing audio program.
  cmd(["ffmpeg","-hide_banner","-loglevel","error","-y",
       "-i",raw,"-i",PREVIOUS,"-map","0:v:0","-map","1:a:0",
       "-t","84","-c:v","copy","-af","loudnorm=I=-18:LRA=9:TP=-2",
       "-c:a","aac","-b:a","192k","-movflags","+faststart",movie])
  if poster is None:raise RuntimeError("Missing poster image")
  poster.save(OUT/"cerebral-cilia.webp",quality=87,method=6)
  sheet.save(OUT/"cerebral-cilia.contact.webp",quality=91,method=6)
  shutil.copyfile(CAPTIONS,OUT/"cerebral-cilia.vtt")
  info=probe(movie)
  seconds=float(info["format"]["duration"])
  assert abs(seconds-DURATION)<.15,(seconds,info)
  assert {"audio","video"} <= {s["codec_type"] for s in info["streams"]}
  size=(W,H)
  assert any(s.get("codec_name")=="h264" and (s.get("width"),s.get("height"))==size
             for s in info["streams"])
  meta={
   "title":"How Does a Vessel Know the Blood Is Moving?",
   "edition":"V10 / motion-first cinema / Film 02",
   "duration_seconds":seconds,"fps":FPS,
   "original_narration":str(PREVIOUS.relative_to(ROOT)),
   "original_captions":str(CAPTIONS.relative_to(ROOT)),
   "primary_publication_doi":SOURCE_DOI,
   "source_figure":str(PAPER_IMAGE.relative_to(ROOT)),
   "source_figure_policy":"Original scientific image contained; axes and labels unmodified",
   "archival_microscopy_sources":sources,
   "used_genuine_microscopy":bool(sources),
   "archival_continuity":"Only forward playback; cross-dissolve between genuine recordings if both available; no frozen last frames",
   "fallback":"Purely editorial animation if archived video not available; no counterfeit footage",
   "scene_bounds":bounds,
   "scenes":SCENE_TITLES,
   "motion_construction":"24 seekable fps; path growth, particle advection, cinematic parallax, passive cilium deflection, moving scan and masks, archival media, chapter-locked transitions",
   "scientific_limit":"Nonmotile primary cilium has passive small deformation; flow drawing is conceptual, not particle data; no causal or clinical extrapolation",
   "preservation":"Distinct review folder. Does not overwrite originals or public website video.",
   "human_review":"Full screening, pronunciation and legal usage still required",
   "sha256":hashlib.sha256(movie.read_bytes()).hexdigest()
  }
  (OUT/"cerebral-cilia.json").write_text(json.dumps(meta,indent=2,ensure_ascii=False)+"\n")
  print("V10 FILM COMPLETE",json.dumps({"duration":seconds,"bytes":movie.stat().st_size,
         "clip_count":len(sources),"sha256":meta["sha256"]}),flush=True)

if __name__=="__main__":
 parser=argparse.ArgumentParser()
 parser.add_argument("--validate-only",action="store_true")
 parser.add_argument("--no-archive",action="store_true",help="Explicit offline fallback")
 args=parser.parse_args()
 if args.validate_only:
  print("SOURCES PASS",validate())
 else:render(skip_archive=args.no_archive)
