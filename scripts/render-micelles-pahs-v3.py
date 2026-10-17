#!/usr/bin/env python3
"""A polymer meets an insoluble problem — owner-archive documentary, V3.

Direct source photographs:
  2017 research poster (archive, not proof of efficacy);
  2017 polymer specimen snapshot (material identity unverified);
  owner 2017 notebook labelled 'A series of unfortunate trials' (not data).
All other imagery consists of self-authored, labelled physical-chemistry
illustrations. No other laboratory's measurement or photograph is used.
"""
import hashlib,importlib.util,json,math,random,subprocess,sys,tempfile
from functools import lru_cache
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageOps,ImageFilter
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets/films/series-v3"
SLUG="micelles-pahs"
W,H=1280,720
DARK=(12,30,37);PALE=(248,238,222);MINT=(110,189,169);GOLD=(229,169,109)
GREY=(127,162,168);SEA=(25,68,78);COPPER=(189,113,73)
BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
SANS="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
SERIF="/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
ASSETS=[
 "assets/owner-archive-2026-10-17/acs-2017-micelles-research-poster.webp",
 "assets/2026-10-15-lab-photos/copolymer-sample-qatar-university-2017.webp",
 "assets/photos-2017-2019/series-of-unfortunate-trials-diblock-2017.webp"
]
CAPTIONS=[
 {"id":"01","title":"THE QUESTION","speech":"Some aromatic pollutants barely dissolve in water. The project asked whether a polymer could give those molecules somewhere else to go.",
  "source":"Project UREP19-110-1-014: hydrophobic PAH solubility, theoretical premise, no specific experimental outcome."},
 {"id":"02","title":"THE PRESENTATION","speech":"At a research meeting in 2017, we presented the theoretical and experimental study. The poster records that question, not an unrestricted claim of environmental cleanup.",
  "source":"Owner 2017 photo showing the actual micelle research poster and co-researchers; archival record, not quantitative assay."},
 {"id":"03","title":"TWO OPPOSING BLOCKS","speech":"A diblock copolymer contains segments that respond differently to water. That contrast can make self-assembly favorable, but only under the right conditions.",
  "source":"Block-copolymer self-assembly, idealized conceptual physical chemistry; project proposal."},
 {"id":"04","title":"A POSSIBLE CORE","speech":"The proposed micelle places water-compatible segments outside and hydrophobic segments inward. Pollutant partitioning into a core is a hypothesis requiring measurement.",
  "source":"Micelle hypothesis, illustrative arrangement; no DLS, CMC, or PAH uptake data implied."},
 {"id":"05","title":"IT DEPENDS ON CONDITIONS","speech":"Composition, concentration and mixing can change what forms. A drawing of a neat micelle tells us nothing about what actually assembled in the vial.",
  "source":"Flory-Huggins-type compatibility argument and concentration effects; no simulated numeric measurements."},
 {"id":"06","title":"THE ACTUAL MATERIAL","speech":"I kept this specimen photograph from the project period. It documents a material in my hand; its appearance alone cannot establish size, loading or removal efficiency.",
  "source":"Owner 2017 photo of bottle/copolymer sample; identity, composition and analytical results cannot be inferred from pixels."},
 {"id":"07","title":"THE UNFORTUNATE TRIALS","speech":"And there was this notebook: a series of unfortunate trials. The archive records the struggle, without proving which experimental procedure failed from the photograph alone.",
  "source":"Owner's photographed Maxi notebook with handwritten note 'A series of unfortunate trials'; no analytical results shown."},
 {"id":"08","title":"WHAT REMAINS TO TEST","speech":"A research question can survive an unsuccessful attempt. The experiment still must answer whether the polymer assembled and whether the pollutant was actually recovered.",
  "source":"Owner project aims, assessment requirements. No successful PAH recovery or pollutant-remediation claim."}
]

def f(n,kind="plain"):
 return ImageFont.truetype({"plain":SANS,"bold":BOLD,"serif":SERIF}[kind],n)
def text(d,x,y,s,n=22,c=PALE,kind="plain"):d.text((x,y),s,font=f(n,kind),fill=c)
def line(d,points,c,w=3):d.line(points,fill=c,width=w,joint="curve")
def eased(t):
 t=max(0,min(1,t));return t*t*(3-2*t)
def color_mix(a,b,t):
 return tuple(int(a[i]*(1-t)+b[i]*t) for i in range(3))
def frame(k,t):
 im=Image.new("RGB",(W,H),DARK)
 d=ImageDraw.Draw(im)
 for y in range(H):
  v=y/H
  d.line((0,y,W,y),fill=(round(13+12*v),round(31+17*v),round(38+19*v)),width=1)
 text(d,50,36,"RUWAIDIX / MATERIALS NOTEBOOK",15,MINT,"bold")
 text(d,1090,36,f"2017     {k+1:02d}/08",14,GOLD,"bold")
 line(d,[(50,74),(1230,74)],(68,102,105),2)
 d.rectangle((50,680,1230,683),fill=(52,87,91))
 d.rectangle((50,680,50+int(1180*(k+t/15)/8),683),fill=GOLD)
 text(d,50,700,"OWNER ARCHIVE OR EXPLICIT SCIENTIFIC RECONSTRUCTION / NO FABRICATED ASSAY DATA",11,MINT)
 return im,d
@lru_cache(maxsize=4)
def photo(name):
 return Image.open(ROOT/name).convert("RGB")
@lru_cache(maxsize=20)
def resized(name,width,height):
 src=photo(name)
 return ImageOps.fit(src,(width,height),method=Image.Resampling.LANCZOS,centering=(.5,.49))
def image_fit(im,d,name,box,zoom=1,focusx=.5,focusy=.5,t=0,credit="OWNER ARCHIVE / CONTEXT IMAGE"):
 x0,y0,x1,y1=box
 ww=int((x1-x0)*zoom);hh=int((y1-y0)*zoom)
 src=resized(name,ww,hh)
 # Limit pan to already resized pixels. The archival image is never edited in place.
 dx=max(0,ww-(x1-x0));dy=max(0,hh-(y1-y0))
 x=int((focusx+.08*math.sin(t*.09))*dx);y=int((focusy+.06*math.cos(t*.08))*dy)
 crop=src.crop((min(max(0,x),dx),min(max(0,y),dy),min(max(0,x),dx)+x1-x0,min(max(0,y),dy)+y1-y0))
 im.paste(crop,(x0,y0))
 d.rectangle(box,outline=GOLD,width=3)
 text(d,x0+7,y1+7,credit,12,MINT)
def title(d,lines,at=(54,187),size=61):
 x,y=at
 for i,v in enumerate(lines):text(d,x,y+i*(size+14),v,size,PALE,"serif")
def pahrings(d,x,y,sz=72,t=0):
 # Planar fused benzenoid icon of generic PAH: NOT a named identified analyte.
 pts=[(-1,0),(-.5,-.87),(.5,-.87),(1,0),(.5,.87),(-.5,.87)]
 for k in range(3):
  cx=x+k*1.5*sz
  angles=[(cx+v[0]*sz,y+v[1]*sz) for v in pts]
  d.polygon(angles,outline=COPPER,width=5)
  for q in (0,2,4):
   start,end=angles[q],angles[(q+1)%6]
   line(d,[start,end],GOLD,3)
def s0(im,d,t):
 title(d,["THE WATER","WON'T TAKE IT"],size=56)
 pahrings(d,650,333,47)
 for k in range(16):
  x=660+(k*53)%550
  y=500+40*math.sin(k*.7+t*.7)
  r=4+k%3
  d.ellipse((x-r,y-r,x+r,y+r),fill=(88,155,176))
 text(d,65,593,"PAHs / low water solubility is the motivation, not a measured project result",18,MINT)
def s1(im,d,t):
 # Genuine dated 2017 poster photograph. It is contextual, not a chemical assay.
 image_fit(im,d,ASSETS[0],(603,113,1199,606),zoom=1.05,focusx=.5,focusy=.4,t=t,
   credit="2017 OWNER ARCHIVE / PROJECT POSTER IN BACKGROUND, NOT AN ASSAY")
 title(d,["AN EXPERIMENT","WAS PROPOSED"],at=(56,195),size=46)
 text(d,61,580,"The photograph records a public presentation.",18,PALE)
def s2(im,d,t):
 title(d,["TWO BLOCKS.","ONE MOLECULE."],size=56)
 # two physically distinct polymer chains, shown dynamically, not a particular chemistry.
 a=(100,177,168);b=(223,159,104)
 for k in range(26):
  cx=624+k*21
  cy=410+41*math.sin(k*.39+t*.25)
  radius=13
  color=a if k<13 else b
  if k>0:
   px=624+(k-1)*21;py=410+41*math.sin((k-1)*.39+t*.25)
   line(d,[(px,py),(cx,cy)],color,7)
  d.ellipse((cx-radius,cy-radius,cx+radius,cy+radius),fill=color,outline=PALE,width=2)
 text(d,624,521,"HYDROPHILIC  /  HYDROPHOBIC",22,MINT)
 text(d,623,553,"Idealised chain: not a verified polymer structure",17,GOLD)
def s3(im,d,t):
 title(d,["A MICELLE","IS A HYPOTHESIS"],size=51)
 # The hydrophilic corona and hydrophobic chain segments retain their
 # radial ordering throughout assembly. The initial radius is bounded
 # so unimers cannot overprint or obscure the scientific title.
 center=(948,403);q=eased(t/15)
 for k in range(24):
  angle=2*math.pi*k/24
  r_outer=(252*(1-q)+143*q)
  r_inner=r_outer-69
  x=center[0]+r_outer*math.cos(angle)
  y=center[1]+r_outer*math.sin(angle)
  tx=center[0]+r_inner*math.cos(angle)
  ty=center[1]+r_inner*math.sin(angle)
  line(d,[(x,y),(tx,ty)],COPPER,7)
  d.ellipse((x-11,y-11,x+11,y+11),fill=MINT,outline=PALE,width=2)
 for k in range(10):
  angle=k*2.4
  x=center[0]+34*math.cos(angle+t*.16)
  y=center[1]+34*math.sin(angle+t*.16)
  d.ellipse((x-7,y-7,x+7,y+7),fill=GOLD)
 text(d,63,598,"Conceptual structure; aggregation and pollutant partitioning remain unmeasured",15,MINT)
def s4(im,d,t):
 title(d,["A MODEL","IS NOT A VIAL"],size=57)
 nodes=[("POLYMER","BLOCK RATIO"),("SOLVENT","COMPATIBILITY"),("CONCENTRATION","AGGREGATION"),("HANDLING","HISTORY")]
 for i,(a,b) in enumerate(nodes):
  x=586+(i%2)*295;y=208+(i//2)*194
  q=eased(t/15)
  d.rounded_rectangle((x,y,x+265,y+154),radius=18,fill=(29,65,70),outline=GOLD if i==round(3*q) else MINT,width=3)
  text(d,x+23,y+30,a,24,PALE,"bold")
  text(d,x+23,y+81,b,19,GOLD)
 text(d,594,607,"Parameters shown are categories, not measured project values",16,MINT)
def s5(im,d,t):
 # Owner screenshot was from archival phone photo; contains screen thumbnail strip.
 # Crop is acknowledged; source unmodified, sample composition unverified.
 image_fit(im,d,ASSETS[1],(672,100,1196,619),zoom=1.08,focusx=.52,focusy=.34,t=t,
           credit="OWNER SPECIMEN PHOTO / IDENTITY OR LOADING CANNOT BE READ FROM APPEARANCE")
 title(d,["THE ACTUAL","MATERIAL"],size=62)
 text(d,57,551,"A sample photograph is not a",23,PALE)
 text(d,57,587,"particle-size distribution.",23,PALE)
def s6(im,d,t):
 image_fit(im,d,ASSETS[2],(637,109,1189,625),zoom=1.03,focusx=.4,focusy=.5,t=t,
           credit="OWNER NOTEBOOK / HANDWRITTEN 2017 LABEL, NO EXPERIMENTAL VALUES")
 title(d,["UNFORTUNATE","TRIALS"],size=62)
 text(d,60,583,"Not every attempt gets a neat conclusion.",19,PALE)
def s7(im,d,t):
 # The conclusion visually contrasts observational evidence with untested claims.
 title(d,["WHAT WOULD","PROVE IT?"],size=60)
 actions=[("SELF-ASSEMBLY","measure size/aggregation"),("PAH UPTAKE","measure the loaded fraction"),
          ("RECOVERY","show a mass balance")]
 for k,(heading,sub) in enumerate(actions):
  x=638;y=195+k*137
  d.rounded_rectangle((x,y,x+548,y+102),radius=17,fill=(26,61,68),outline=MINT if k==int(min(2,3*t/15)) else GREY,width=3)
  text(d,x+19,y+16,heading,24,PALE,"bold")
  text(d,x+19,y+60,sub,18,GOLD)
 text(d,54,616,"The project question is documented. The outcomes need the data.",17,MINT)
DRAW=[s0,s1,s2,s3,s4,s5,s6,s7]

def run():
 for a in ASSETS:
  if not (ROOT/a).is_file():raise FileNotFoundError(ROOT/a)
 OUT.mkdir(parents=True,exist_ok=True)
 spec=importlib.util.spec_from_file_location("ruwaidix_audio_encoder",ROOT/"scripts/render-making-medicines-v3.py")
 engine=importlib.util.module_from_spec(spec);spec.loader.exec_module(engine)
 engine.SCENES=[{"id":c["id"],"title":c["title"],"speech":c["speech"],"source":c["source"]} for c in CAPTIONS]
 engine.OUT=OUT;engine.NAME=SLUG;engine.frame_base=frame;engine.DRAWERS=DRAW
 with tempfile.TemporaryDirectory(prefix="ruwaidix-pah-film-") as temp:
  wd=Path(temp)
  _,voice=engine.wav_voice(ROOT/"film-models",wd)
  engine.subtitles(wd,voice)
  paths=[engine.clip(k,wd) for k in range(8)]
  listing=wd/"concat.txt"
  listing.write_text("".join(f"file '{p}'\n" for p in paths))
  dest=OUT/(SLUG+".mp4")
  subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-f","concat","-safe","0","-i",str(listing),"-i",str(wd/"narration.wav"),"-map","0:v","-map","1:a","-c:v","copy","-c:a","aac","-b:a","160k","-t","120","-movflags","+faststart",str(dest)],check=True)
  (OUT/(SLUG+".vtt")).write_bytes((wd/"captions.vtt").read_bytes())
  probe=json.loads(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","json",str(dest)]))
  runtime=float(probe["format"]["duration"])
  if abs(runtime-120)>.35:raise RuntimeError("Incorrect film length")
  manifest={"film_id":SLUG,"edition":"V3 owner-archive research documentary","duration_seconds":runtime,
   "sha256":hashlib.sha256(dest.read_bytes()).hexdigest(),"original_grant":"UREP19-110-1-014",
   "archival_files":ASSETS,"description":"Conference photo and notebook are authentic owner-context records. Polymer visualizations are physically motivated, unverified conceptual designs.","release_rights":"Owner archive photos still require confirmation of rights for individuals appearing in the group photograph.","scientific_limit":"No claim of measured micelle formation, CMC, PAH loading, solubilization improvement, or treatment/remediation success without primary reported measurements.","chapters":CAPTIONS,"voice":"Kokoro ONNX synthetic narrator","human_review":"NOT APPROVED: scientific, rights, visual and speech screening outstanding"}
  (OUT/(SLUG+".json")).write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+"\n")
  print("RENDERED authentic owner-archive micelle film",dest,dest.stat().st_size,flush=True)
if __name__=="__main__":run()
