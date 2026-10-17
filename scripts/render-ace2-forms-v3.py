#!/usr/bin/env python3
"""Evidence-first original ACE2 documentary (8 × 15 s).

PDB 6M0J atomic coordinates are rendered directly into moving 3D projected
C-alpha traces; the paper's genuine authored Figure 3 is preserved unchanged.
Other motion is original labelled explanatory geometry, NOT a false microscopy
image, full-length ACE2 structure or simulated clinical outcome. Figure 1/2/4/5/6
are *excluded*: their review-paper captions include third-party rights notices.
"""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageOps
import math,io,hashlib,json,subprocess,tempfile,importlib.util,functools
ROOT=Path(__file__).resolve().parents[1]
ST=ROOT/"assets/films/source-structures/pdb-6m0j"
AS=ROOT/"assets/films/source-figures/ace2-original"
OUT=ROOT/"assets/films/series-v3"
NAME="ace2-forms"
DOI="10.3390/ijms22136703"
W,H=1280,720
BG=(9,21,32);TEXT=(239,237,227);CYAN=(98,193,190);GOLD=(236,171,102);RED=(229,118,109);PINE=(82,160,116)
FNT="/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
SCENES=[
 {"title":"One protein, two states","speech":"ACE2 is not simply a docking site for a virus. Its position matters. The membrane-bound receptor and its shed soluble ectodomain can have different biological consequences.","source":"2021 IJMS review, DOI 10.3390/ijms22136703, sections 2.1–2.3."},
 {"title":"The binding interface is real","speech":"This molecular trace comes from crystal structure six M zero J: human ACE2 bound to the SARS CoV two spike receptor-binding domain. These are experimentally determined coordinates.","source":"PDB 6M0J; Lan et al., Nature 2020; X-ray diffraction at 2.45 Å; this depicts the extracellular binding interface only."},
 {"title":"An enzyme within a network","speech":"ACE2 also processes angiotensin two to angiotensin one to seven, helping counterbalance signalling elsewhere in the renin angiotensin system. It is not a one-way viral-entry switch.","source":"The review's original Figure 3: RAAS schematic, CC BY 4.0. Diagram is illustrative, not a measured trial result."},
 {"title":"The membrane is a boundary","speech":"Membrane ACE2 has an extracellular catalytic domain connected through the cell membrane to an intracellular tail. A picture of the isolated protein cannot represent that whole context.","source":"2021 review ACE2 domain and shedding discussion; original conceptual membrane scene; not drawn from 6M0J."},
 {"title":"Shedding changes the question","speech":"Proteolytic shedding can release ACE2's catalytic ectodomain into extracellular fluid. Soluble ACE2 retains enzymatic activity, but its consequences depend on tissue, timing, and disease state.","source":"2021 review section 2.3: soluble/membrane ACE2 and enzymatically active released ectodomain."},
 {"title":"Binding is not infection","speech":"The receptor-binding event is an initial step, not a complete account of infection. Entry also depends on host proteases and cellular processes. No single diagram explains every tissue.","source":"2021 review section 2.1, membrane fusion/endocytic processes; original author conceptual, no third-party Figure 1 reused."},
 {"title":"Association is not intervention","speech":"ACE2 expression varies across tissues, illnesses, and medication exposure. Observational associations cannot by themselves show that changing ACE2 improves a patient's outcome.","source":"2021 review disease and ACE inhibitor / ARB evidence, limitations; no invented tissue counts or treatment recommendation."},
 {"title":"Two forms, open questions","speech":"The same protein participates in protective enzymatic signalling and viral receptor binding. The review asks how membrane and soluble forms alter risk. It does not settle that question.","source":"Paper Abstract and conclusions, 2021; an evidence-bound review, not a prospective clinical trial."}
]
def font(n=22,t="normal"):return ImageFont.truetype({"normal":FONT,"serif":FNT,"bold":BOLD}[t],n)
def t(d,xy,body,n=23,c=TEXT,style="normal"):d.text(xy,body,font=font(n,style),fill=c)
def clamp(x):return max(0,min(1,x))
def sm(x):x=clamp(x);return x*x*(3-2*x)
def frame(k,time):
 im=Image.new("RGB",(W,H),BG);d=ImageDraw.Draw(im)
 for j in range(0,H,3):
  alpha=j/H;c=(8+int(alpha*8),22+int(alpha*23),32+int(alpha*18))
  d.rectangle((0,j,W,j+2),fill=c)
 d.line((55,77,1225,77),fill=(48,107,108),width=2)
 t(d,(55,37),"RUWAIDIX    /    STRUCTURAL BIOLOGY    /    REVIEW 2021",14,CYAN,"bold")
 t(d,(1108,37),f"{k+1:02d}/08",18,GOLD,"bold")
 t(d,(52,117),SCENES[k]["title"],38,TEXT,"serif")
 d.rectangle((50,678,1234,703),fill=(16,49,52))
 t(d,(63,681),"SOURCE: 10.3390/ijms22136703  |  COORDINATES: PDB 6M0J  |  REVIEW, NOT CLINICAL EXPERIMENT",12,CYAN)
 return im,d
def title(d,lines,x=59,y=214,n=54):
 for k,s in enumerate(lines):t(d,(x,y+k*(n+10)),s,n,TEXT,"serif")
def membrane(d,y=452):
 for i in range(35):
  x=50+i*35
  d.ellipse((x,y-13,x+24,y+12),fill=(92,133,143))
  d.ellipse((x,y+30,x+24,y+55),fill=(92,133,143))
  d.line((x+11,y+12,x+11,y+30),fill=(79,110,120),width=4)
def receptor(d,cx,cy,height=200,fill=CYAN):
 d.rounded_rectangle((cx-14,cy,cx+14,cy+height),radius=12,fill=(100,159,143))
 d.ellipse((cx-67,cy-90,cx+67,cy+35),fill=(29,95,103),outline=fill,width=7)
 d.arc((cx-44,cy-60,cx+45,cy+19),15,150,fill=GOLD,width=5)
def gate(d,name,y):
 d.rounded_rectangle((785,y,1172,y+78),radius=14,fill=(28,62,73),outline=CYAN,width=2)
 t(d,(808,y+13),name,23,TEXT)
def s0(im,d,x):
 title(d,["ONE PROTEIN.","TWO LOCATIONS."])
 membrane(d,492)
 receptor(d,828,398,180)
 tx=1072+18*math.sin(x*.4)
 d.ellipse((tx-47,260,tx+47,359),fill=(25,83,85),outline=GOLD,width=5)
 t(d,(738,625),"MEMBRANE-BOUND",20,CYAN,"bold")
 t(d,(1030,392),"SOLUBLE",20,GOLD,"bold")
 t(d,(72,479),"schematic / not a measured distribution",16,GOLD)
def s1(im,d,x):
 title(d,["AN INTERFACE","WE CAN SEE"],x=64,y=178,n=51)
 project_structure(d,x,center=(917,396),scale=2.9)
 t(d,(570,593),"ACE2  /  chain A",17,CYAN,"bold")
 t(d,(893,593),"Viral RBD  /  chain E",17,GOLD,"bold")
 t(d,(571,628),"PDB 6M0J  ·  2.45 Å diffraction  ·  true Cα trace",15,TEXT)
def s2(im,d,x):
 title(d,["ACE2 IS AN","ENZYME TOO"],y=170,n=51)
 src=FIG3
 imdata=ImageOps.contain(src,(610,400),Image.Resampling.LANCZOS)
 bw,bh=imdata.size
 base=Image.new("RGB",(631,416),(245,245,245))
 base.paste(imdata,((631-bw)//2,(416-bh)//2))
 im.paste(base,(587,214))
 d=ImageDraw.Draw(im)
 d.rectangle((587,214,1218,630),outline=CYAN,width=2)
 t(d,(588,641),"Original review Figure 3 / RAAS conceptual pathways / CC BY 4.0",14,GOLD)
def s3(im,d,x):
 title(d,["THE CELL","BOUNDARY"],y=166)
 membrane(d,467)
 receptor(d,890,371,210)
 t(d,(764,234),"EXTRACELLULAR",17,GOLD,"bold")
 t(d,(774,577),"CYTOPLASM",17,CYAN,"bold")
 d.line((1152,252,1152,590),fill=(129,164,159),width=3)
 for cy,lab in [(296,"CATALYTIC ECTODOMAIN"),(489,"MEMBRANE SPAN"),(572,"SHORT CYTOSOLIC TAIL")]:
  d.line((1050,cy,1140,cy),fill=GOLD,width=3)
  t(d,(730,606 if cy>550 else 638),"" if cy!=296 else "Schematic receptor topology; not a 6M0J atomic model.",14,CYAN)
 d.text((708,626),"Domain positions are schematic.",font=font(15),fill=GOLD)
def s4(im,d,x):
 title(d,["A SHEDDING","EVENT"],y=168)
 membrane(d,480)
 receptor(d,787,391,200)
 q=sm(x/15);ty=281-int(144*q);tx=1068+21*math.sin(x)
 d.ellipse((tx-66,ty-57,tx+66,ty+57),fill=(25,91,102),outline=GOLD,width=6)
 d.line((850,348,954,332),fill=GOLD,width=4)
 d.polygon([(946,324),(969,329),(948,339)],fill=GOLD)
 t(d,(901,556),"Released catalytic ectodomain",17,GOLD)
 t(d,(69,607),"Proteolytic cleavage is the mechanism; this is not a direct measured movie.",15,CYAN)
def s5(im,d,x):
 title(d,["BINDING","IS THE START"],y=169)
 membrane(d,476)
 receptor(d,778,386,194)
 d.ellipse((1000-51,285,1000+51,387),fill=(131,72,83),outline=GOLD,width=4)
 for q in range(9):
  a=q*math.pi*2/9 + x*.12
  xx=1000+69*math.cos(a);yy=338+67*math.sin(a)
  d.line((1000+42*math.cos(a),338+42*math.sin(a),xx,yy),fill=GOLD,width=3)
 t(d,(664,602),"RBD binding ≠ productive cell entry",20,CYAN,"bold")
 t(d,(660,631),"Fusion and endocytosis require additional host mechanisms.",15,TEXT)
def s6(im,d,x):
 title(d,["A TISSUE","IS NOT A TRIAL"],y=167,n=53)
 nodes=[("LUNG",757,316),("INTESTINE",1069,302),("HEART",760,528),("KIDNEY",1075,526)]
 for name,cx,cy in nodes:
  r=43+int(5*math.sin(x*.4+cx))
  d.ellipse((cx-r,cy-r,cx+r,cy+r),outline=CYAN,width=4,fill=(18,65,74))
  t(d,(cx-53,cy+56),name,15,GOLD,"bold")
 for name,cx,cy in nodes[:-1]:
  d.line((cx+65,cy,928,409),fill=(63,121,115),width=2)
 t(d,(676,634),"No invented expression levels or patient outcomes.",16,TEXT)
def s7(im,d,x):
 title(d,["THE OPEN","QUESTION"],y=167)
 receptor(d,765,340,190)
 membrane(d,469)
 q=sm(x/15)
 d.ellipse((1077,276-q*104,1167,367-q*104),fill=(32,78,81),outline=GOLD,width=5)
 d.line((839,373,1037,354-q*44),fill=CYAN,width=4)
 t(d,(684,621),"Enzymatic function  /  receptor function",21,TEXT)
 t(d,(668,648),"The review weighs mechanisms; it does not establish treatment effects.",13,GOLD)
def parse_ca():
 pdb=(ST/"6M0J.pdb").read_text(encoding="ascii",errors="replace")
 result={"A":[],"E":[]}
 for line in pdb.splitlines():
  if line.startswith("ATOM  ") and line[12:16].strip()=="CA" and line[21] in result:
   chain=line[21]
   a=(int(line[22:26]),line[26])
   xyz=(float(line[30:38]),float(line[38:46]),float(line[46:54]))
   if not result[chain] or result[chain][-1][0]!=a:result[chain].append((a,xyz))
 return result
@functools.lru_cache(maxsize=1)
def load_pdb():
 r=json.loads((ST/"structure-provenance.json").read_text())
 p=(ST/"6M0J.pdb").read_bytes()
 if hashlib.sha256(p).hexdigest()!=r["sha256"]:raise ValueError("PDB structure bytes changed")
 if r["id"]!="6M0J":raise ValueError("Unmatched ACE2 structure")
 return parse_ca()
def project_structure(d,x,center=(910,381),scale=2.9):
 chains=load_pdb()
 raw=[xyz for seq in chains.values() for _,xyz in seq]
 center3=tuple(sum(pt[i] for pt in raw)/len(raw) for i in range(3))
 angle=.2+x*.16;ca,sa=math.cos(angle),math.sin(angle)
 phi=-.3;cc,ss=math.cos(phi),math.sin(phi)
 def proj(a):
  xx,yy,zz=[a[i]-center3[i] for i in range(3)]
  rx=ca*xx+sa*zz;rz=-sa*xx+ca*zz
  ry=cc*yy-ss*rz
  return (int(center[0]+rx*scale),int(center[1]-ry*scale))
 for label,col in [("A",CYAN),("E",GOLD)]:
  prev=None;lastnum=None
  for (n,ins),xyz in chains[label]:
   pt=proj(xyz)
   if prev is not None and lastnum is not None and n-lastnum==1:
    d.line((*prev,*pt),fill=col,width=3)
   d.ellipse((pt[0]-2,pt[1]-2,pt[0]+2,pt[1]+2),fill=col)
   prev=pt;lastnum=n
DRAW=[s0,s1,s2,s3,s4,s5,s6,s7]
def validate():
 fig=json.loads((AS/"source-provenance.json").read_text())
 row=next((f for f in fig["figures"] if f["figure_number"]==3),None)
 if fig["doi"]!=DOI or not row:raise ValueError("Only original exact-paper figure 3 allowed")
 p=AS/"ace2-forms-figure-03.jpg"
 if hashlib.sha256(p.read_bytes()).hexdigest()!=row["image_sha256"]:
  raise ValueError("Original paper RAAS figure tampered")
 cs=load_pdb()
 if len(cs["A"])<500 or len(cs["E"])<160:raise ValueError("PDB chain metadata invalid")
 return row
def main():
 row=validate()
 engine_path=ROOT/"scripts/render-making-medicines-v3.py"
 spec=__import__("importlib.util",fromlist=["spec_from_file_location"])
 s=spec.spec_from_file_location("ruwaidix_movie_engine",engine_path)
 e=spec.module_from_spec(s);s.loader.exec_module(e)
 e.OUT=OUT;e.NAME=NAME;e.SCENES=SCENES;e.DRAWERS=DRAW;e.frame_base=frame
 OUT.mkdir(parents=True,exist_ok=True)
 with tempfile.TemporaryDirectory(prefix="ruwaidix-ace2-v3") as td:
  folder=Path(td)
  _,narr=e.wav_voice(ROOT/"film-models",folder)
  e.subtitles(folder,narr)
  movie_clips=[e.clip(i,folder) for i in range(8)]
  listfile=folder/"concat.txt"
  listfile.write_text("".join(f"file '{p}'\n" for p in movie_clips))
  master=OUT/(NAME+".mp4")
  subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-f","concat","-safe","0","-i",str(listfile),"-i",str(folder/"narration.wav"),
      "-map","0:v","-map","1:a","-c:v","copy","-c:a","aac","-b:a","160k","-t","120","-movflags","+faststart",str(master)],check=True)
  (OUT/(NAME+".vtt")).write_bytes((folder/"captions.vtt").read_bytes())
  check=json.loads(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","json",str(master)]))
  duration=float(check["format"]["duration"])
  assert abs(duration-120)<.36 and master.stat().st_size<98_000_000
  record={"id":NAME,"edition":"V3 source-matched ACE2 forms research documentary",
          "article_doi":DOI,"source_pdb":"6M0J","source_pdb_doi":"10.2210/pdb6M0J/pdb",
          "source_figures":[row],"pdb_structure_sha256":hashlib.sha256((ST/"6M0J.pdb").read_bytes()).hexdigest(),
          "duration_seconds":duration,"sha256":hashlib.sha256(master.read_bytes()).hexdigest(),
          "chapter_sources":SCENES,
          "human_review":"NOT YET APPROVED; inspect biological labels, narration, original Figure 3 and 6M0J chain connectivity.",
          "research_boundary":"2021 review; this film depicts hypotheses and source structures, not prospective clinical studies or treatments; PDB 6M0J is only extracellular ACE2–RBD."}
  (OUT/(NAME+".json")).write_text(json.dumps(record,indent=2)+"\n")
  print("ACE2 source-specific film",master,master.stat().st_size,duration)
if __name__=="__main__":
 FIG3=Image.open(AS/"ace2-forms-figure-03.jpg").convert("RGB")
 main()
