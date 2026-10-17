#!/usr/bin/env python3
"""Ruwaidix Cinema V7 — evidence-safe scientific visual direction.

A V7 plate contains ONE explanatory subject, with no baked narration titles.
The publisher overlays a separate, restrained title and a visibly labeled evidence
credit. V7 never manufactures micrographs, journal figures, patients, measured curves,
clinical outcomes or historic manuscripts.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import math, hashlib, random

W,H=1280,720
BG=(13,37,43); INK=(237,235,221); MINT=(117,196,174)
GOLD=(228,178,117); RED=(212,117,103); GRID=(43,74,77)
FNT="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

# Each drawing is a *conceptual explanation*, NOT a diagram of observed data.
TYPES={
 "airway-reopening":"alveoli","cerebral-cilia":"cilia","slit2-robo":"receptor",
 "curcumin-cyanide":"optical","niosomes":"vesicle","echo-cnn-lstm":"echo",
 "pla-grafting":"plasma","pla-scaffolds":"fibres",
 "flow-chamber-method":"alveoli","zebrafish-hemodynamics":"flow",
 "ace2-covid-drugs":"ace2","gi-autoimmunity-1":"epithelium",
 "gi-autoimmunity-2":"biopsy","heart-failure-sensors":"ecg",
 "ace2-forms":"ace2","drug-release-twins":"transport",
 "food-printing":"extrusion","ceramics-printing":"lattice",
 "cubosome-theranostics":"cubic","micelles-pahs":"micelle",
 "heterocycle-cancer":"heterocycle","histology-failure":"interface",
 "cairo-microscope":"microscope","essay-life-between-diagnoses":"epithelium",
 "essay-ai-email":"document","essay-machine-language":"document",
 "essay-academic-mental-health":"document","essay-scientific-credit":"network",
 "essay-tf-states":"conformation","essay-potency-exposure":"transport",
 "essay-trna":"trna","essay-proximity":"ternary","essay-adc":"antibody",
 "microfluidic-virus":"microfluidic","making-medicines-keep":"historical"
}
LABELS={
 "alveoli":("CULTURED EPITHELIAL MONOLAYER","ADVANCING AIR–LIQUID INTERFACE"),
 "cilia":("VESSEL WALL","ENDOTHELIAL CILIUM"),
 "receptor":("LIGAND","RECEPTOR SIGNAL"),
 "optical":("MOLECULAR PROBE","READOUT IS EXPERIMENTAL"),
 "vesicle":("NONIONIC SURFACTANT BILAYER","AEROSOL DELIVERY: CONCEPTUAL"),
 "echo":("ECHOCARDIOGRAPHIC FRAMES","MODEL OUTPUT IS NOT A DIAGNOSIS"),
 "plasma":("POLYMER SURFACE","PLASMA TREATMENT: SCHEMATIC"),
 "fibres":("ELECTROSPUN FIBRE MAT","SURFACE MODIFICATION"),
 "flow":("FLOW DIRECTION","IMAGE-DERIVED MEASUREMENT"),
 "ace2":("MEMBRANE-BOUND ACE2","SOLUBLE ACE2"),
 "epithelium":("EPITHELIAL BARRIER","IMMUNE CELL RESPONSE"),
 "biopsy":("HISTOLOGY IS A CLINICAL MEASUREMENT","SCHEMATIC ONLY"),
 "ecg":("PHYSIOLOGICAL SIGNAL","CLINICAL INTERPRETATION REQUIRES VALIDATION"),
 "transport":("CARRIER / CONCENTRATION","EXPOSURE IS NOT POTENCY"),
 "extrusion":("NOZZLE","DEPOSITED FILAMENT"),
 "lattice":("ADDITIVE PROCESS","POROUS ARCHITECTURE"),
 "cubic":("BICONTINUOUS LIPID STRUCTURE","SYMBOLIC CROSS-SECTION"),
 "micelle":("AMPHIPHILIC POLYMER","HYDROPHOBIC DOMAIN"),
 "heterocycle":("HETEROCYCLIC RING","ASSAY OUTCOME NOT IMPLIED"),
 "interface":("AGAROSE SUPPORT","PARAFFIN INTERFACE"),
 "microscope":("OBSERVATION","ARCHIVAL INSTRUMENT"),
 "document":("WRITTEN WORDS","ATTRIBUTION AND EVIDENCE"),
 "network":("PEOPLE","DOCUMENTED CONTRIBUTIONS"),
 "conformation":("CONFORMATION A","CONFORMATION B"),
 "trna":("tRNA / ANTICODON","RIBOSOMAL TRANSLATION"),
 "ternary":("TARGET PROTEIN","RECRUITED PARTNER"),
 "antibody":("ANTIBODY BINDING","LINKER / PAYLOAD"),
 "microfluidic":("SAMPLE CHANNEL","DETECTION REGION"),
 "historical":("RECIPE / DOCUMENT","RECONSTRUCTION: NOT A FACSIMILE")
}
PHOTO={
 "airway-reopening":["assets/home-archive/figure-pulmonary-flow-chamber.jpg"],
 # The pictured heart-video analysis software belongs to hemodynamics, not
 # the endothelial-cilia distribution experiment. Do not assign it to cilia.
 "cerebral-cilia":[],
 "curcumin-cyanide":["assets/home-archive/figure-cyanide-sensor.jpg"],
 "flow-chamber-method":["assets/home-archive/figure-pulmonary-flow-chamber.jpg"],
 "zebrafish-hemodynamics":["assets/home-archive/figure-zebrafish-microscopy.jpg"],
 "histology-failure":["assets/2026-10-13-new-photos/zebrafish-orientation-specimens.webp","assets/2026-10-13-new-photos/zebrafish-histology-processing.webp","assets/2026-10-13-new-photos/zebrafish-paraffin-microtomy-failure.webp"],
 "cairo-microscope":["assets/photos-2017-2019/microscope-morning-still-life-2017.webp"],
 "micelles-pahs":["assets/oct12-owner-photos/diblock-copolymer-unsuccessful-trials-2017.webp"],
 # A pyridine-4-carboxaldehyde reagent photograph is not verified as evidence
 # of the separate imidazopyridine anticancer synthesis or screening dataset.
 "heterocycle-cancer":[],
 "essay-life-between-diagnoses":["assets/2026-10-13-new-photos/august-2025-hospital-research.webp"],
 "essay-scientific-credit":["assets/2017-acs-el-sayed-group.webp"]
}

def font(px,bold=False):
 return ImageFont.truetype(BOLD if bold else FNT,px)

def txt(d,pos,value,size=19,color=INK,bold=False):
 d.text(pos,value,font=font(size,bold),fill=color)

def line(d,pts,color=MINT,width=5):
 d.line(pts,fill=color,width=width,joint="curve")

def oval(d,x,y,r,outline=MINT,width=5):
 d.ellipse((x-r,y-r,x+r,y+r),outline=outline,width=width)

def rounded(d,box,color=MINT,width=3,r=12):
 d.rounded_rectangle(box,outline=color,width=width,radius=r)

def scene_art(slug,idx,phase,output):
 """Draw a full-frame, title-free scientific storyboard plate.
 idx and phase select the narrative beat and a progressive mechanism state.
 """
 typ=TYPES[slug];phase=int(phase);idx=int(idx)
 canvas=Image.new("RGB",(W,H),BG);d=ImageDraw.Draw(canvas)
 # Spatial hierarchy: mechanism area y=105..530; clean title safe-area below.
 for x in range(100,1181,90):
  line(d,(x,92,x,531),GRID,1)
 for y in range(110,532,90):
  line(d,(88,y,1192,y),GRID,1)
 d.rounded_rectangle((78,86,1203,548),radius=22,fill=(17,45,51),outline=(57,92,90),width=2)
 # Small source-independent guide sits INSIDE diagram but does not repeat title.
 first,second=LABELS[typ]
 txt(d,(112,108),first,18,GOLD,True)
 txt(d,(112,496),second,18,MINT,True)
 x0=250;y0=185
 p=phase/3.0
 if typ=="vesicle":
  # A membrane cross-section, visibly double-layered, never a microscopy result.
  cx=545;cy=318
  for rad in (162,136):
   d.ellipse((cx-rad,cy-rad,cx+rad,cy+rad),outline=MINT if rad==162 else GOLD,width=8)
  for k in range(32):
   th=k*2*math.pi/32
   for rad in (150,147):
    x=int(cx+rad*math.cos(th)); y=int(cy+rad*math.sin(th))
    d.ellipse((x-5,y-5,x+5,y+5),fill=GOLD if rad==150 else MINT)
  for k in range(7):
   th=(k*2.4+idx*.8)
   rad=38+21*(k%3)
   oval(d,545+rad*math.cos(th),318+rad*math.sin(th),5,GOLD,3)
  line(d,(760,318,875,318),GOLD,5)
  d.polygon([(873,306),(893,318),(873,330)],fill=GOLD)
  d.arc((903,210,1076,410),-105,105,fill=MINT,width=10)
  for k in range(8):
   x=934+(k%3)*36+p*28;y=248+(k//3)*48
   oval(d,x,y,4,MINT,3)
  txt(d,(913,431),"NEBULIZED DROPLETS",14,INK)
 elif typ=="ace2":
  for j in range(30):
   x=180+j*30
   d.ellipse((x-12,349,x+12,373),fill=MINT)
   d.ellipse((x-12,387,x+12,411),fill=GOLD)
  for a in ((355,344),(590,344)):
   x,y=a
   line(d,(x,y,x,y-75),GOLD,9)
   rounded(d,(x-29,y-162,x+29,y-77),MINT,7,18)
   oval(d,x,y-174,29,GOLD,5)
  if phase>=1:
   # Soluble ACE2 is completely detached. Never draw a stalk to membrane.
   rounded(d,(905,179,967,274),MINT,6,22)
   oval(d,936,164,30,GOLD,5)
   txt(d,(870,292),"SOLUBLE ACE2",15,INK,True)
  txt(d,(248,437),"PLASMA MEMBRANE",15,INK)
 elif typ=="trna":
  # Symbolic secondary structure; no fabricated crystal structure.
  pts=[(440,205),(440,312),(505,312),(505,390),(550,438),(592,392),(592,310),(655,310),(655,204)]
  line(d,pts,MINT,12)
  for j in range(7):
   y=227+j*14
   line(d,(440,y,478,y),GOLD,3)
   line(d,(617,y,655,y),GOLD,3)
  oval(d,548,449,21,RED,6)
  txt(d,(505,478),"ANTICODON",17,INK)
  d.rounded_rectangle((811,245,1074,396),radius=65,outline=GOLD,width=12)
  line(d,(852,338,1036,338),MINT,7)
  # A single mRNA codon is shown. Letter positions are not made-up sequence data.
  for j,base in enumerate("AUG"):
   txt(d,(880+j*48,350),base,21,INK,True)
  txt(d,(877,391),"mRNA  5′→3′",15,INK)
  txt(d,(848,434),"RIBOSOME / EXPLANATORY",15,INK)
 elif typ=="alveoli":
  rounded(d,(165,220,1043,420),MINT,5,28)
  for j in range(19):
   x=190+j*44
   rounded(d,(x,388,x+38,421),GOLD,2,9)
   d.ellipse((x+12,396,x+26,410),fill=(74,151,149))
  arcx=260+phase*145
  d.ellipse((arcx,236,arcx+155,387),outline=GOLD,width=8)
  d.rectangle((arcx+85,256,arcx+300,381),fill=(17,45,51))
  d.arc((arcx,236,arcx+155,387),82,282,fill=RED,width=9)
  line(d,(arcx+210,275,arcx+315,275),GOLD,5)
  txt(d,(200,451),"EPITHELIAL CELLS / AN AIR–LIQUID INTERFACE",16,INK)
 elif typ=="interface":
  d.rectangle((177,210,1040,313),fill=(57,111,112))
  d.rectangle((177,324,1040,436),fill=(126,104,87))
  d.line((177,319,1040,319),fill=RED,width=9)
  txt(d,(850,235),"AGAROSE",21,INK,True)
  txt(d,(865,369),"PARAFFIN",21,INK,True)
  if phase>=2:
   for k in range(5):
    x=370+k*100
    line(d,(x,299,x+18,344),RED,4)
 elif typ in ("cilia","flow"):
  rounded(d,(175,233,1100,435),MINT,5,75)
  for j in range(13):
   x=215+j*66
   line(d,(x,409,x+25,380-int(15*math.sin(j+.6*phase))),MINT,6)
  for j in range(5):
   x=312+j*160+phase*8
   oval(d,x,305,17,RED,5)
   line(d,(x-60,303,x-104,303),GOLD,4)
  txt(d,(792,452),"FLOW DIRECTION →",17,INK,True)
 elif typ=="heterocycle":
  cx=485;cy=321;r=148
  pts=[]
  for k in range(6):
   th=k*2*math.pi/6-math.pi/2
   pts.append((cx+r*math.cos(th),cy+r*math.sin(th)))
  d.line(pts+[pts[0]],fill=MINT,width=9,joint="curve")
  for k in range(6):
   x,y=pts[k]
   oval(d,x,y,9,GOLD,3)
  txt(d,(465,159),"N",29,RED,True)
  line(d,(650,312,870,312),GOLD,5)
  rounded(d,(905,244,1085,375),MINT,5,25)
  txt(d,(933,301),"ASSAY",21,INK,True)
 elif typ in ("fibres","plasma","lattice","extrusion"):
  rnd=random.Random(int(hashlib.sha256(slug.encode()).hexdigest()[:8],16))
  for j in range(40):
   x=rnd.randrange(192,1080);y=rnd.randrange(204,425)
   line(d,(x-80,y-20,x+80,y+10),MINT if j%3 else GOLD,rnd.randrange(3,8))
  if typ=="plasma":
   for j in range(16):
    x=290+j*48
    line(d,(x,164,x+18,238),RED,3)
  if typ=="extrusion":
   d.polygon([(580,145),(750,145),(700,285),(630,285)],outline=GOLD)
   line(d,(668,290,668,440),GOLD,12)
 elif typ in ("micelle","cubic","antibody","ternary","receptor","conformation"):
  if typ=="micelle":
   oval(d,550,315,140,MINT,9)
   for j in range(22):
    th=j*2*math.pi/22
    line(d,(550+115*math.cos(th),315+115*math.sin(th),550+139*math.cos(th),315+139*math.sin(th)),GOLD,4)
   oval(d,550,315,60,RED,4)
  elif typ=="cubic":
   # A two-dimensional symbolic cut through a periodically curved bilayer.
   # This is NOT a crystallographic unit cell, SAXS reconstruction or TEM image.
   for lane in range(5):
    upper=[];lower=[]
    for x in range(231,1045,7):
     y=192+lane*67+16*math.sin((x-231)/73.0+lane*1.15+phase*.12)
     upper.append((x,y))
     lower.append((x,y+17))
    d.line(upper,fill=MINT,width=7,joint="curve")
    d.line(lower,fill=GOLD,width=7,joint="curve")
   txt(d,(309,435),"PERIODIC LIPID/WATER DOMAINS — SYMBOLIC",16,INK)
  elif typ=="receptor":
   # SLIT2 is extracellular; ROBO is a transmembrane receptor.
   for j in range(29):
    xx=203+j*29
    d.ellipse((xx-11,392,xx+11,414),fill=MINT)
    d.ellipse((xx-11,432,xx+11,454),fill=GOLD)
   rounded(d,(786,205,855,470),MINT,8,21)
   oval(d,820,205,51,GOLD,7)
   oval(d,464+phase*42,246,63,MINT,8)
   txt(d,(386,332),"SLIT2 LIGAND",20,INK,True)
   txt(d,(756,159),"ROBO RECEPTOR",18,INK,True)
   txt(d,(736,474),"PLASMA MEMBRANE",16,INK)
   line(d,(548,246,692,246),GOLD,5)
   d.polygon([(687,237),(703,246),(687,255)],fill=GOLD)
  else:
   oval(d,470,315,120,MINT,8)
   oval(d,850,315,105,GOLD,8)
   line(d,(590,315,744,315),RED if phase<2 else GOLD,8)
   if typ=="antibody":
    line(d,(510,325,600,242),MINT,13);line(d,(510,325,610,422),MINT,13)
    oval(d,728,316,14,RED,5)
 elif typ=="echo":
  # Original-frame illustration; never a claimed fetal scan or patient readout.
  d.polygon([(460,158),(220,447),(997,447)],fill=(27,66,67))
  for k in range(5):
   rad=65+k*46
   d.arc((460-rad,165-rad,460+rad,165+rad),15,165,fill=GRID,width=5)
  for k in range(16):
   xx=306+(k%4)*152; yy=244+(k//4)*53
   oval(d,xx,yy,9+(k%3)*4,MINT if k==phase+4 else GRID,3)
  rounded(d,(822,211,1083,399),GOLD,5,16)
  txt(d,(865,264),"VIDEO",23,INK,True)
  txt(d,(865,300),"FRAMES",23,INK,True)
  txt(d,(220,464),"ULTRASOUND IMAGING — NOT A PATIENT RECORD",16,INK)
 elif typ in ("ecg","transport","optical"):
  points=[]
  for j in range(780):
   x=230+j
   phase_x=j/780*math.pi*7
   if typ=="ecg":
    dy=118*math.sin(phase_x)*math.exp(-((j%165-84)/40)**2)
   elif typ=="optical":
    dy=95*math.sin(phase_x)+25*math.sin(phase_x*2)
   else:
    dy=180*(1-math.exp(-j/230))
   points.append((x,415-dy))
  d.line(points,fill=MINT,width=6)
  line(d,(210,436,1100,436),GOLD,4)
  line(d,(210,179,210,436),GOLD,4)
  txt(d,(900,453),"QUALITATIVE ONLY",15,INK)
 elif typ in ("epithelium","biopsy"):
  for j in range(19):
   x=194+j*43
   rounded(d,(x,310,x+36,412),MINT,3,12)
   oval(d,x+16,363,8,GOLD,3)
  for j in range(4):
   x=270+j*177
   oval(d,x,235,31,RED if (j+phase)%2 else GOLD,5)
  line(d,(204,418,1035,418),MINT,8)
 elif typ=="microfluidic":
  rounded(d,(180,232,1065,402),MINT,6,30)
  d.polygon([(178,276),(410,276),(480,320),(410,363),(178,363)],outline=GOLD)
  for j in range(8):
   oval(d,470+j*60+phase*5,317,8,RED if j%2 else MINT,3)
  rounded(d,(861,259,1020,373),GOLD,6,16)
 elif typ in ("document","historical","microscope","network"):
  if typ=="network":
   nodes=[(303,264),(462,209),(653,361),(800,226),(997,392)]
   for j in range(len(nodes)-1):line(d,(*nodes[j],*nodes[j+1]),GRID,9)
   for j,(x,y) in enumerate(nodes):
    oval(d,x,y,29,GOLD if j==phase else MINT,7)
  elif typ=="microscope":
   d.arc((390,155,878,515),180,335,fill=MINT,width=30)
   line(d,(610,435,610,480),GOLD,24);line(d,(414,483,894,483),MINT,24)
   line(d,(660,242,787,345),GOLD,22)
  else:
   rounded(d,(355,164,843,464),GOLD,6,20)
   for j in range(9):
    y=212+j*25
    line(d,(405,y,772-(j%3)*23,y),MINT if j==phase+2 else GRID,4)
 else:
  # Unrecognised mode must fail loudly, not silently substitute a node diagram.
  raise ValueError("No source-specific concept: "+slug)
 if typ in ("vesicle","ace2","trna") and idx>1:
  chapter_specific_figure(d,typ,idx,phase)
 # Avoid arbitrary reticles that can overlap molecular diagrams, labels or data.
 # Focus instead comes from the subject-specific scene composition.
 # Four visual beats within a single voice-led scene, to guide attention without
 # claims about biological or historical temporal sequences.
 for j in range(4):
  bx=985+j*45
  d.rectangle((bx,116,bx+31,120),fill=GOLD if j==phase else GRID)
 # Restrained proof strip; one title is added later by the actual video overlay.
 txt(d,(100,583),"EDITORIAL ANIMATION / NOT ORIGINAL MEASUREMENTS",15,(160,182,173))
 canvas.save(output,optimize=True)
 return output

def chapter_specific_figure(d,typ,idx,phase):
 """Replace the default diagram with a scientifically bounded chapter-specific argument.
 The figures depict hypotheses, methods, and distinctions, NEVER measured values.
 """
 d.rectangle((95,132,1182,491),fill=(17,45,51))
 def box(x,y,w,label,color=MINT):
  d.rounded_rectangle((x,y,x+w,y+106),radius=18,outline=color,width=5)
  words=label.split();lines=[];cur=""
  for word in words:
   item=(cur+" "+word).strip()
   if len(item)>16 and cur:lines.append(cur);cur=word
   else:cur=item
  if cur:lines.append(cur)
  for j,line_ in enumerate(lines[:3]):
   txt(d,(x+18,y+19+j*25),line_,20,INK,True)
 def arrow(x1,y1,x2,y2):
  line(d,(x1,y1,x2,y2),GOLD,6)
  d.polygon(((x2-14,y2-9),(x2+4,y2),(x2-14,y2+9)),fill=GOLD)
 # Each chapter is a different claim, and is always tied to the catalogue narration.
 if typ=="vesicle":
  if idx==2:
   oval(d,385,316,120,MINT,9);oval(d,385,316,97,GOLD,7)
   for j in range(18):
    th=2*math.pi*j/18
    oval(d,385+109*math.cos(th),316+109*math.sin(th),4,GOLD,3)
   txt(d,(560,253),"SURFACTANT",24,INK,True)
   txt(d,(560,301),"CHOLESTEROL",24,GOLD,True)
   txt(d,(560,353),"DEXAMETHASONE",24,MINT,True)
   txt(d,(560,405),"RATIOS MUST BE MEASURED",16,INK)
  elif idx==3:
   box(153,269,247,"SIZE / PDI")
   box(515,269,247,"CHEMISTRY")
   box(873,269,240,"DRUG LOADING")
   txt(d,(162,410),"DLS",17,GOLD,True)
   txt(d,(540,410),"FTIR",17,GOLD,True)
   txt(d,(892,410),"ANALYTICAL ASSAY",15,GOLD,True)
  elif idx==4:
   rounded(d,(181,224,470,415),MINT,7,26)
   d.rectangle((271,190,382,222),fill=GOLD)
   txt(d,(243,353),"NEBULIZER",19,INK,True)
   arrow(498,325,659,325)
   for j in range(11):
    x=704+j*32
    y=273+(((j+phase)*53)%108)
    oval(d,x,y,5,MINT,3)
   txt(d,(730,409),"AEROSOLIZATION",17,GOLD,True)
  elif idx==5:
   box(155,262,247,"EMITTED DOSE")
   arrow(421,316,525,316)
   box(545,262,247,"DROPLET SIZE")
   arrow(811,316,887,316)
   box(907,262,230,"DEPOSITION")
   txt(d,(220,416),"ALL REQUIRE ACTUAL MEASUREMENT",18,INK,True)
  else:
   box(176,266,240,"FORMULATION")
   box(509,266,240,"DEPOSITION")
   box(843,266,240,"CLINICAL EFFECT")
   txt(d,(193,415),"EACH CLAIM REQUIRES DIFFERENT EVIDENCE",17,INK,True)
 elif typ=="ace2":
  if idx==2:
   box(153,255,235,"ANGIOTENSIN II")
   arrow(408,318,570,318)
   box(591,255,220,"ANG (1–7)")
   box(901,255,212,"ACE2 ENZYME",GOLD)
   txt(d,(413,414),"ACE2 CONVERSION / SCHEMATIC",16,INK)
  elif idx==3:
   box(167,263,369,"MEMBRANE ACE2",MINT)
   box(701,263,369,"SOLUBLE ACE2",GOLD)
   txt(d,(269,411),"DIFFERENT LOCATION, DIFFERENT READOUT",17,INK,True)
  elif idx==4:
   box(151,268,265,"EXPRESSION")
   arrow(446,320,585,320)
   box(606,268,266,"FUNCTION")
   txt(d,(898,286),"≠",65,RED,True)
   txt(d,(911,380),"CAUSALITY",17,INK,True)
  elif idx==5:
   box(180,265,375,"2021 REVIEW")
   arrow(579,320,694,320)
   box(720,265,375,"REASSESS EVIDENCE")
   txt(d,(191,413),"PUBLICATION DATE LIMITS INTERPRETATION",16,INK,True)
  else:
   box(145,262,257,"WHICH FORM?")
   box(503,262,257,"WHICH TISSUE?")
   box(860,262,253,"WHICH ENDPOINT?")
   txt(d,(340,414),"AN IDENTIFIABLE MOLECULAR QUESTION",17,GOLD,True)
 elif typ=="trna":
  if idx==2:
   box(162,266,237,"CHARGING")
   box(530,266,231,"MODIFICATION")
   box(890,266,216,"CLEAVAGE")
   txt(d,(198,413),"DISTINCT BIOLOGICAL INTERVENTIONS",18,INK,True)
  elif idx==3:
   oval(d,405,313,107,MINT,8)
   txt(d,(359,306),"aaRS",28,GOLD,True)
   arrow(538,311,674,311)
   box(711,254,342,"ADDITIONAL ROLES")
   txt(d,(329,434),"CATALYSIS ≠ EVERY SIGNALING FUNCTION",18,INK)
  elif idx==4:
   box(191,266,377,"ESSENTIAL FUNCTION",MINT)
   box(690,266,365,"DISEASE DEPENDENCY",GOLD)
   txt(d,(272,421),"SELECTIVITY MUST BE DEMONSTRATED",20,INK,True)
  elif idx==5:
   box(132,255,303,"ENZYME POCKET")
   box(489,255,303,"RNA FRAGMENT")
   box(848,255,303,"EXTRACELLULAR",GOLD)
   txt(d,(246,414),"DIFFERENT TARGETS DEMAND DIFFERENT DRUG DESIGNS",17,INK)
  else:
   box(151,262,274,"TARGET")
   arrow(450,316,550,316)
   box(567,262,270,"PERTURBATION")
   arrow(856,316,925,316)
   box(943,262,174,"READOUT")
   txt(d,(199,418),"MEASURE THE DEPENDENCY, NOT JUST THE PHENOTYPE",17,INK)

def approved_photo(slug,scene,root):
 """Only explicit scene-matched source photos may enter the V7 film."""
 path=scene.get("image","").lstrip("/")
 kind=scene.get("kind","").lower()
 if path in PHOTO.get(slug,[]) and any(t in kind for t in ("original","research","published","laboratory","firsthand","document")):
  p=root/path
  if p.is_file():return p
 return None
