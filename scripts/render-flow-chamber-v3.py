#!/usr/bin/env python3
"""Original flow-chamber study film from exact CC BY article figures.

No figure is borrowed from the related Journal of Applied Physiology
pharmacological pretreatment paper or the zebrafish work. Figure 1 apparatus
and Figures 5 and 6 cell images are unaltered except explicit labelled crops.
The moving air-liquid interface is a physically motivated explanatory sketch,
not a simulation claiming measured shear stress values.
"""
import hashlib,importlib.util,io,json,math,subprocess,tempfile
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageOps

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/"assets/films/source-figures/v3"
OUT=ROOT/"assets/films/series-v3"
SLUG="flow-chamber-method"
DOI="10.3390/mps3040065"
W,H=1280,720
INK=(9,26,33)
PALE=(238,239,228)
FLUID=(28,115,133)
MINT=(112,203,176)
ORANGE=(232,172,105)
RED=(228,116,107)
BLUE=(114,193,229)
SANS="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
SERIF="/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
SCENES=[
{"title":"An injured cell in an idealized airway","speech":"When an air liquid boundary moves across epithelial cells, mechanical forces can cause injury. This question motivated a controlled laboratory model, not a trial in patients.","source":"Methods and Protocols 2020 3(4):65, introduction and setup."},
{"title":"The original chamber","speech":"The published apparatus drives fluid over cells through a parallel plate flow chamber. Its components define the model, including the cover slips and the narrow channel.","source":"2020 methods article Figure 1, original experimental apparatus."},
{"title":"One moving interface","speech":"A bubble advances across the monolayer, exposing cells to forces near the moving interface. Our animation explains the geometry without inventing numerical stress measurements.","source":"Figure 1A conceptual mechanics; no quantitative stress field simulated."},
{"title":"Make the geometry repeatable","speech":"The cell bearing cover slip sits beneath a gasket and a second cover slip. Repeating that arrangement helps isolate exposure while limiting what the apparatus can represent.","source":"Original Figure 1C and apparatus methods."},
{"title":"Injury becomes visible","speech":"In the original L2 cell experiment, controls showed almost no cell death. The bubble exposed group averaged around fifty three percent dead cells, across seven experimental repetitions.","source":"2020 methods paper, Expected Results, Figure 5 A–C; control 0–0.2% and bubble ~53%, seven repetitions."},
{"title":"Actin provides another view","speech":"The actin images reveal a subtler picture. There was no significant overall change in cytoskeletal structure after one bubble, although the authors observed slight differences in filament orientation.","source":"Figure 6 and published Effects on Cytoskeletal Structure; orientation difference only, no significant structure difference."},
{"title":"What the images establish","speech":"A mechanical insult in a simplified system can change cell viability and organization. It does not by itself tell us how a patient's entire respiratory tract will respond.","source":"Source paper Results and Discussion; in-vitro model limitations."},
{"title":"A model, not a lung","speech":"The chamber makes a hidden physical event experimentally accessible. Its strength is repeatability; its limit is the distance between a cell monolayer and the living lung.","source":"Experimental model scope; no clinical extrapolation."}
]
def font(n=22,typ="normal"):return ImageFont.truetype({"normal":SANS,"bold":BOLD,"serif":SERIF}[typ],n)
def write(d,p,s,n=24,color=PALE,typ="normal"):d.text(p,s,font=font(n,typ),fill=color)
def clamp(t):return max(0,min(1,t))
def ease(t):t=clamp(t);return t*t*(3-2*t)
def frame(k,t):
 im=Image.new("RGB",(W,H),INK);d=ImageDraw.Draw(im)
 for y in range(H):
  c=int(20+16*y/H)
  d.line((0,y,W,y),fill=(8,c,34+int(y/43)))
 d.rectangle((0,0,16,H),fill=FLUID)
 write(d,(48,30),"RUWAIDIX  /  EXPERIMENTAL METHOD",15,MINT,"bold")
 write(d,(1063,31),f"SCENE {k+1:02d}/08",15,ORANGE,"bold")
 d.line((52,67,1226,67),fill=(86,118,125),width=1)
 d.rectangle((40,655,1235,700),fill=(12,43,51))
 write(d,(59,671),"2020 METHODS AND PROTOCOLS / doi:10.3390/mps3040065 / EXPERIMENTAL SOURCE FIGURES PRESERVED",12,MINT)
 return im,d
IMAGES={n:Image.open(SOURCE/f"flow-chamber-method-figure-{n:02d}.jpg").convert("RGB") for n in (1,5,6)}
def figure(im,d,n,box,label="ORIGINAL PUBLISHED FIGURE"):
 x0,y0,x1,y1=box
 # Never crop any axis, control condition or photomicrograph labels.
 image=ImageOps.contain(IMAGES[n],(x1-x0-14,y1-y0-14),method=Image.Resampling.LANCZOS)
 bg=Image.new("RGB",(x1-x0,y1-y0),(245,245,242))
 bg.paste(image,((x1-x0-image.width)//2,(y1-y0-image.height)//2))
 im.paste(bg,(x0,y0))
 d=ImageDraw.Draw(im)
 d.rectangle((x0,y0,x1,y1),outline=MINT,width=3)
 write(d,(x0+6,y1+7),f"Published Figure {n} / {label}",14,ORANGE)
 return d
def title(d,lines,x=56,y=188,n=56):
 for k,line in enumerate(lines):write(d,(x,y+k*(n+12)),line,n,PALE,"serif")
def film_cells(d,offset=0,dead=False):
 # The epithelial cartoon is tagged conceptual, unlike the published images.
 for i in range(16):
  x=90+i*70
  y=553+6*math.sin(offset*.6+i)
  d.rounded_rectangle((x,y,x+65,y+53),9,fill=(42,113,104) if not dead else (66,96,90),outline=MINT,width=2)
  color=RED if dead and i%4==0 else (123,182,205)
  d.ellipse((x+26,y+13,x+43,y+30),fill=color)
def bubble(d,t,shift=0):
 x=300+530*ease(t/15)+shift
 # Single advancing convex bubble interface; illustrative, not a field solver.
 d.rounded_rectangle((80,382,x,534),46,fill=(221,240,237),outline=BLUE,width=3)
 d.arc((x-76,382,x+78,534),265,95,fill=ORANGE,width=7)
 d.line((x+30,475,x+145,475),fill=ORANGE,width=5)
 write(d,(x+100,432),"U  →",24,ORANGE,"bold")
def s0(im,d,t):
 title(d,["THE INVISIBLE","COLLISION"])
 film_cells(d,t)
 bubble(d,t,-170)
 write(d,(56,606),"A migrating air–liquid interface over cultured epithelium",16,MINT)
def s1(im,d,t):
 write(d,(56,116),"THE EXPERIMENTAL APPARATUS",42,PALE,"serif")
 d=figure(im,d,1,(62,203,1217,608))
 write(d,(72,621),"Real syringe pump and parallel-plate chamber / published Figure 1",16,MINT)
def s2(im,d,t):
 title(d,["THE BUBBLE","MOVES"])
 film_cells(d,t)
 bubble(d,t)
 write(d,(62,613),"Conceptual bubble movement / not measured shear-stress field",16,MINT)
def s3(im,d,t):
 title(d,["BUILT AS","A SANDWICH"],n=52)
 # Exploded specimen chamber, glass layers descend into their right positions.
 yy=[226+int(45*ease(t/15)),360,520-int(45*ease(t/15))]
 for i,(label,color) in enumerate([("Upper coverslip",(170,213,222)),
                                   ("Gasket / chamber gap",(227,169,91)),
                                   ("Cell-bearing coverslip",(135,188,174))]):
  y=yy[i]
  d.rounded_rectangle((488,y,1168,y+44),14,fill=color)
  write(d,(575,y+4),label,21,INK,"bold")
 for i in range(17):
  x=500+i*38
  d.ellipse((x,536,x+22,550),fill=RED if i%5==0 else MINT)
 write(d,(490,611),"Exploded explanatory geometry; actual apparatus in Figure 1",15,MINT)
def s4(im,d,t):
 write(d,(54,113),"THE L2 CELL-VIABILITY EXPERIMENT",39,PALE,"serif")
 d=figure(im,d,5,(69,198,1221,592),"A–C / COMPLETE PUBLISHED PANEL")
 write(d,(80,612),"Control: ~0–0.2%  /  Bubble exposure: ~53% dead; n=7, p<0.01",17,MINT)
def s5(im,d,t):
 write(d,(55,112),"THE ACTIN CYTOSKELETON",42,PALE,"serif")
 d=figure(im,d,6,(69,200,1218,594),"A–B / CONTROL VS BUBBLE")
 write(d,(77,613),"No significant overall structural change / slight orientation differences",16,MINT)
def s6(im,d,t):
 title(d,["AN ASSAY","HAS LIMITS"],n=53)
 film_cells(d,t,dead=True)
 for j in range(18):
  x=103+j*61
  y=470+8*math.sin(j+t)
  d.line((x,y,x+31,y+50),fill=ORANGE,width=2)
 write(d,(62,615),"Conceptual cell layer · not extracted from a patient",16,MINT)
def s7(im,d,t):
 title(d,["A MODEL IS","NOT A LUNG"],n=56)
 # Two distinct labeled silhouettes: flat cell monolayer versus branching
 # airway architecture, without implying experimentally studied morphology.
 film_cells(d,t)
 sx,sy=915,430
 for k in range(5):
  a=(-1+k*.5)
  end=(sx+math.sin(a)*170,sy-130-math.cos(a)*35)
  d.line((sx,sy,*end),fill=ORANGE,width=12)
 d.ellipse((sx-17,sy-23,sx+17,sy+23),fill=ORANGE)
 write(d,(744,598),"Different experimental scales",22,PALE)
draw=[s0,s1,s2,s3,s4,s5,s6,s7]
def validate():
 meta=json.loads((SOURCE/"source-figure-provenance.json").read_text())
 figures={row["figure_number"]:row for row in meta["figures"] if row["film"]==SLUG}
 assert set(figures)=={1,5,6}
 for number in figures:
  record=figures[number]
  file=SOURCE/f"flow-chamber-method-figure-{number:02d}.jpg"
  assert record["doi"]==DOI and hashlib.sha256(file.read_bytes()).hexdigest()==record["sha256"]
 return figures
def main():
 source=validate()
 path=ROOT/"scripts/render-making-medicines-v3.py"
 spec=importlib.util.spec_from_file_location("cinema_encoder_engine",path)
 engine=importlib.util.module_from_spec(spec)
 spec.loader.exec_module(engine)
 engine.OUT=OUT;engine.NAME=SLUG;engine.SCENES=SCENES
 engine.frame_base=frame;engine.DRAWERS=draw
 OUT.mkdir(parents=True,exist_ok=True)
 with tempfile.TemporaryDirectory(prefix="ruwaidix-chamber") as tmp:
  td=Path(tmp)
  _,narr=engine.wav_voice(ROOT/"film-models",td)
  engine.subtitles(td,narr)
  parts=[engine.clip(k,td) for k in range(8)]
  lst=td/"concat.txt"
  lst.write_text("".join(f"file '{p}'\n" for p in parts))
  out=OUT/(SLUG+".mp4")
  subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-f","concat","-safe","0","-i",str(lst),
                  "-i",str(td/"narration.wav"),"-map","0:v","-map","1:a","-c:v","copy","-c:a","aac",
                  "-b:a","160k","-t","120","-movflags","+faststart",str(out)],check=True)
  (OUT/(SLUG+".vtt")).write_bytes((td/"captions.vtt").read_bytes())
  p=json.loads(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","json",str(out)]))
  assert abs(float(p["format"]["duration"])-120)<.4
  manifest={"id":SLUG,"edition":"V3 original experimental-method film / verified 2020 paper",
           "primary_doi":DOI,"duration_seconds":float(p["format"]["duration"]),
           "sha256":hashlib.sha256(out.read_bytes()).hexdigest(),
           "source_figures":[source[n] for n in (1,5,6)],
           "chapters":SCENES,"human_review":"NOT APPROVED / visually check apparatus, cell labels and all narration",
           "research_boundary":"Simplified L2 epithelial-monolayer flow chamber, not evidence of patient injury or a completed clinical test. Cell cartoons are not microscope images."}
  (OUT/(SLUG+".json")).write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+"\n")
  print("SAVED SOURCE-CORRECT CHAMBER FILM",out,out.stat().st_size)
if __name__=="__main__":main()
