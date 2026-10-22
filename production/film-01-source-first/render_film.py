#!/usr/bin/env python3
"""Film 01 / research-source cinema. Free offline picture renderer.
Embedded published figures extracted WITHOUT changing the pixel data; only scaled for display.
Conceptual air-liquid sequence marked non-data. Voice accepted only from explicit WAV/MP3 supplied.
"""
import cv2, numpy as np, math, hashlib, json, subprocess, argparse
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
R=Path(__file__).resolve().parent
W,H,FPS=1600,900,24
DURATION=120
SCALE=W/1280
FIG={s:cv2.imread(str(R/'assets'/f'figure_{s}.jpeg'),cv2.IMREAD_COLOR) for s in ['01_apparatus','02_live_dead','03_cell_death','04_actin','05_afm']}
assert all(v is not None for v in FIG.values())
FONT='/usr/share/fonts/truetype/lato/Lato-Regular.ttf'
FB='/usr/share/fonts/truetype/lato/Lato-Heavy.ttf'
FS='/usr/share/fonts/truetype/liberation2/LiberationSerif-Regular.ttf'
if not Path(FS).exists():FS='/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf'
if not Path(FONT).exists():FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
if not Path(FB).exists():FB='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
INK=(28,31,35);PAPER=(235,238,241);BLUE=(164,159,62);TURQ=(174,207,108);ORANGE=(100,159,225);WHITE=(246,245,244)
# all colors BGR
SHOTS=[
 ('01','THE QUESTION','Real microscopy / cinematic open',0,9,'open'),
 ('02','AN INVISIBLE FORCE','Original explanatory animation',9,20,'interface'),
 ('03','THE APPARATUS','Original study • Figure 1',20,30,'fig1'),
 ('04','ONE BUBBLE','Experimental setup • Figure 1 detail',30,40,'apparatus'),
 ('05','WHAT SURVIVED?','Original fluorescent micrographs • Figure 2',40,51,'fig2'),
 ('06','THE COMPARISON','Source micrographs • Figure 2 details',51,62,'micros'),
 ('07','THE MEASURED RESULT','Original study graph • Figure 3',62,72,'fig3'),
 ('08','THREE RESPONSES','Paper-reported mean cell death',72,84,'bars'),
 ('09','UNDER THE SURFACE','Actual actin staining • Figure 4',84,94,'fig4'),
 ('10','CELL ARCHITECTURE','Source micrographs • Figure 4 detail',94,103,'actin'),
 ('11','A SECOND MEASUREMENT','Actual AFM images • Figure 5',103,112,'fig5'),
 ('12','THE BOUNDARY OF PROOF','In vitro finding / not a clinical outcome',112,120,'close')]


def fit(src,tw,th):
 sh,sw=src.shape[:2];s=min(tw/sw,th/sh);return cv2.resize(src,(max(1,int(sw*s)),max(1,int(sh*s))),interpolation=cv2.INTER_AREA if s<1 else cv2.INTER_CUBIC)
def paste(bg,im,x,y,w,h,lightborder=True,contain=True,alpha=1):
 x,y,w,h=map(int,[x,y,w,h]);H0,W0=bg.shape[:2]
 if x<0 or y<0 or x+w>W0 or y+h>H0: return
 cv2.rectangle(bg,(x+10,y+12),(x+w+10,y+h+12),(32,30,26),-1)
 cv2.rectangle(bg,(x,y),(x+w,y+h), (252,253,252) if lightborder else (28,36,42),-1)
 if contain:
  a=fit(im,w-18,h-18);xx=x+(w-a.shape[1])//2;yy=y+(h-a.shape[0])//2;bg[yy:yy+a.shape[0],xx:xx+a.shape[1]]=a
 else:
  hh,ww=im.shape[:2];z=max(w/ww,h/hh);src=cv2.resize(im,(int(ww*z),int(hh*z)));dx=(src.shape[1]-w)//2;dy=(src.shape[0]-h)//2;bg[y:y+h,x:x+w]=src[dy:dy+h,dx:dx+w]
 cv2.rectangle(bg,(x,y),(x+w-1,y+h-1),(202,204,201),2)

def letter(s,fontsize=26,bold=False,serif=False,color=(245,245,245),maxw=None):
 ff=FS if serif else (FB if bold else FONT)
 font=ImageFont.truetype(ff,int(fontsize))
 bbox=font.getbbox(s);im=Image.new('RGBA',(max(4,int(bbox[2]-bbox[0]+8)),max(4,int(bbox[3]-bbox[1]+8))),(0,0,0,0))
 dr=ImageDraw.Draw(im);dr.text((4-bbox[0],4-bbox[1]),s,font=font,fill=(*color[::-1],255))
 return cv2.cvtColor(np.array(im),cv2.COLOR_RGBA2BGRA)

def label(bg,s,x,y,fontsize=26,bold=False,serif=False,color=WHITE):
 rgba=letter(s,fontsize,bold,serif,color);h,w=rgba.shape[:2];x,y=int(x),int(y)
 if x<0 or y<0 or x+w>W or y+h>H:return
 al=(rgba[:,:,3:4]/255.).astype(np.float32);dst=bg[y:y+h,x:x+w];bg[y:y+h,x:x+w]=np.uint8(dst*(1-al)+rgba[:,:,:3]*al)

def bg(style):
 if style=='paper':
  out=np.empty((H,W,3),np.uint8);out[:]=(239,241,242)
 elif style=='red':
  out=np.empty((H,W,3),np.uint8);out[:]=(27,29,38)
 else:
  out=np.empty((H,W,3),np.uint8);out[:]=(29,39,42)
 return out

def line(im,p,q,color,th=3):cv2.line(im,tuple(map(int,p)),tuple(map(int,q)),color,th,cv2.LINE_AA)
def circ(im,p,r,color,th=-1):cv2.circle(im,tuple(map(int,p)),int(r),color,th,cv2.LINE_AA)
def ease(p):return p*p*(3-2*p)

def header(im,idx,title,sub,light=False):
 col=INK if light else PAPER;dim=(90,104,106) if light else (173,192,193)
 label(im,f'RUWAIDIX  /  RESEARCH FILM 01',67,42,23,True,color=dim)
 line(im,(65,87),(W-65,87),(145,152,151),2)
 label(im,title,65,108,56,serif=True,color=col)
 label(im,sub,68,183,21,color=dim)
 label(im,f'{idx:02d} / 12',W-166,50,21,True,color=dim)

CREDIT='M. K. A. A. Al-Ruweidi et al. | Journal of Applied Physiology (2021) | DOI: 10.1152/japplphysiol.00574.2020'
def footer(im,txt='',light=False):
 color=(82,103,111) if light else (173,196,195)
 line(im,(65,H-75),(W-65,H-75),(109,124,127),1)
 label(im,txt or CREDIT,68,H-60,19,color=color)

def fig_slide(s,idx,title,sub,imgkey,p,light=True,variant='normal'):
 im=bg('paper' if light else 'dark');header(im,idx,title,sub,light)
 source=FIG[imgkey]
 # Original publication figure is ALWAYS shown as a complete, unmodified image.
 # A second optically magnified region appears only after the full figure is established.
 main_width=1160 if imgkey in ('02_live_dead','04_actin') else 880
 if imgkey=='05_afm':main_width=930
 main_x=85; main_y=240; main_h=480
 if imgkey in ('02_live_dead','04_actin'):
  main_x=80;main_h=510;main_width=1010
 paste(im,source,main_x,main_y,main_width,main_h)
 if imgkey in ('01_apparatus','03_cell_death','05_afm'):
  # Documentary close-up inset of an actual figure panel; NOT a fabricated result.
  hh,ww=source.shape[:2]
  if imgkey=='01_apparatus':
   crop=source[int(hh*.55):int(hh*.92),int(ww*.48):int(ww*.98)]
   tlabel='METHOD DETAIL  /  ACTUAL FIGURE'
  elif imgkey=='03_cell_death':
   crop=source[int(hh*.10):int(hh*.79),int(ww*.12):int(ww*.91)]
   tlabel='REPORTED EXPERIMENTAL RESULTS'
  else:
   crop=source[int(hh*.02):int(hh*.55),int(ww*.04):int(ww*.53)]
   tlabel='AFM SOURCE DETAIL'
  # Contained base illustration remains intact; magnification is labelled.
  z=ease(min(1,max(0,(p-.09)/.85)))
  x=int(1030+360*(1-z));x=min(1120,x)
  if z>.005:
   paste(im,crop,x,280,465,387,lightborder=light,contain=True)
   label(im,tlabel,x,693,22,True,color=INK if light else PAPER)
   line(im,(x+10,682),(x+int(435*z),682),ORANGE,3)
 elif imgkey in ('02_live_dead','04_actin'):
  # Original figure remains unchanged on the left; a dynamic, clearly-labelled
  # optical enlargement of its real pixels moves in from the right.
  hh,ww=source.shape[:2]
  if imgkey=='02_live_dead':
   crop=source[int(hh*.56):int(hh*.95),int(ww*.03):int(ww*.53)]
   words='REAL FLUORESCENCE  /  FIGURE 2 DETAIL'
  else:
   crop=source[int(hh*.47):int(hh*.97),int(ww*.46):int(ww*.97)]
   words='ACTIN STAINING  /  FIGURE 4 DETAIL'
  z=ease(min(1,max(0,(p-.09)/.82)))
  if z>.01:
   x=int(1210+310*(1-z));paste(im,crop,x,320,340,365,lightborder=light,contain=True)
   label(im,words,1150,723,20,True,color=PAPER if not light else INK)
   # A tracking bar outside the source figure indicates the inspected panel.
   cy=int(335+280*ease(p));line(im,(1129,325),(1129,cy),ORANGE,5);circ(im,(1129,cy),7,ORANGE)
  # editorial guide appears outside the image; source data pixels untouched
  line(im,(1150,278),(1150+int(355*z),278),ORANGE,4)
 footer(im,'UNALTERED SOURCE FIGURE + LABELED OPTICAL DETAIL  /  '+CREDIT,light)
 travel=int((W-145)*ease(p));line(im,(72,210),(72+travel,210),ORANGE,5)
 return im

def render_frame(t,shot):
 num,title,sub,start,end,kind=shot;p=min(1,max(0,(t-start)/(end-start)));mode='paper' if kind in ('fig1','fig2','fig3','fig4','fig5','bars','apparatus','close') else 'dark'
 if kind.startswith('fig'):
  key={'fig1':'01_apparatus','fig2':'02_live_dead','fig3':'03_cell_death','fig4':'04_actin','fig5':'05_afm'}[kind]
  return fig_slide(t,int(num),title,sub,key,p,light=(kind in ['fig1','fig3','fig4']),variant='wide' if kind in ['fig2','fig4','fig5'] else 'normal')
 im=bg(mode);header(im,int(num),title,sub,mode=='paper')
 if kind=='open':
  # large detail from actual published micrograph (no fictitious fluorescence)
  f=FIG['02_live_dead'];hh,ww=f.shape[:2];crop=f[int(hh*.28):int(hh*.95),int(ww*.04):int(ww*.95)]
  paste(im,crop,68,225,970,505,False,False)
  cv2.rectangle(im,(995,310),(1575,715),(29,39,42),-1)
  label(im,'AN AIRWAY',1044,356,63,serif=True)
  label(im,'CAN REOPEN',1044,427,57,serif=True)
  label(im,'AND STILL',1044,499,57,serif=True)
  label(im,'BE INJURED.',1044,570,57,serif=True,color=ORANGE)
  label(im,'Figure 2 / real experiment',80,731,22,color=(180,202,192))
  footer(im,'ORIGINAL MICROSCOPY • FIGURE 2 • NOT A RECREATION')
  # bar of light passes across source inset as editorial spotlight, not new science
  xx=85+int(p*930); cv2.line(im,(xx,236),(xx,704),(167,220,211),2)
 elif kind=='interface':
  label(im,'Air advances. The liquid boundary moves.',110,250,34,serif=True)
  # Cross-section with physically progressing air-liquid boundary
  cv2.rectangle(im,(105,400),(1500,615),(142,124,93),-1)
  cv2.rectangle(im,(105,400),(1500,615),(177,213,215),3)
  front=300+950*ease(p)
  mask=np.zeros((H,W),np.uint8)
  cv2.rectangle(mask,(106,405),(int(front),610),255,-1)
  # curved meniscus (air on left of advancing boundary); conceptual only
  cv2.ellipse(mask,(int(front),507),(75,102),0,90,270,255,-1)
  water=(212,194,143);air=(54,63,67)
  im[405:611,106:1498]=water
  zone=(mask[405:611,106:1498].astype(np.float32)/255.)[:,:,None]
  im[405:611,106:1498]=np.uint8(im[405:611,106:1498]*(1-zone)+np.array(air)[None,None,:]*zone)
  # true epithelial layer: cell outlines not simulated microscopy
  for x in range(123,1488,65):
   cv2.rectangle(im,(x,611),(x+60,656),(130,170,196),1)
   circ(im,(x+30,635),9,(123,180,196))
  line(im,(90,668),(1515,668),(117,157,158),3)
  # moving stress along leading edge only
  cx=int(front); yy=677
  for k in range(5):
   px=cx+(k-2)*23;line(im,(px,686),(px,706),(91,167,235),2)
  label(im,'AIR',207,445,29,True,color=WHITE)
  label(im,'LIQUID',1250,445,29,True,color=INK)
  label(im,'EPITHELIAL CELL LAYER',510,703,24,color=(198,210,204))
  footer(im,'SCIENTIFIC RECONSTRUCTION • CONCEPTUAL, NOT EXPERIMENTAL FOOTAGE')
 elif kind=='apparatus':
  f=FIG['01_apparatus'];h,w=f.shape[:2]
  # actual component photo (source image B) on left; on right original complete figure thumb
  crop=f[int(h*.07):int(h*.52),int(w*.76):int(w*.995)]
  paste(im,crop,95,242,590,525)
  paste(im,f,760,245,755,504)
  label(im,'Original chamber photograph',106,770,25,color=INK)
  label(im,'The complete Figure 1',766,770,25,color=INK)
  # purposeful track over two original pieces, but not modifying figure content
  cx=690+int(53*math.sin(p*math.pi));line(im,(690,503),(690+int(78*ease(p)),503),ORANGE,5)
  # Time-resolved flow guide OUTSIDE the original image.
  # Progress follows the camera's explanation of how a single bubble propagated.
  sx,ex=790,1473
  yy=739
  line(im,(sx,yy),(ex,yy),(210,213,208),7)
  cx=sx+int((ex-sx)*ease(p))
  line(im,(sx,yy),(cx,yy),ORANGE,7)
  circ(im,(cx,yy),14,ORANGE)
  label(im,'ILLUSTRATIVE PROPAGATION DIRECTION',815,690,21,True,color=INK)
  footer(im,'SOURCE PHOTO AND SCHEMATIC • FIGURE 1 • NOT A NEW EXPERIMENT',True)
 elif kind=='micros':
  f=FIG['02_live_dead'];h,w=f.shape[:2]
  # exactly source halves from same figure; reveal 2 actual groups, no fabricated imagery
  shift=int(40*math.sin(p*math.pi))
  c1=f[int(h*.23):int(h*.56),int(w*.087)+shift:int(w*.30)+shift]
  c2=f[int(h*.63):int(h*.96),int(w*.087)+shift:int(w*.30)+shift]
  paste(im,c1,115,265,636,475,False,False)
  paste(im,c2,827,265,636,475,False,False)
  label(im,'STATIC CONTROL',126,749,31,True,color=WHITE)
  label(im,'SINGLE BUBBLE EXPOSURE',835,749,31,True,color=WHITE)
  # band accent only on frame, not overlay microscope data
  line(im,(770,282),(770,722),ORANGE,3)
  footer(im,'CROPPED VIEWS FROM PUBLISHED FIGURE 2 • SEE FULL FIGURE AT 00:40')
 elif kind=='bars':
  label(im,'Mean cell death after bubble propagation',95,248,34,serif=True,color=INK)
  groups=[('BUBBLE ALONE',54.7,3.94,(79,105,205)),('DEX PRETREATMENT',15.1,3.43,(135,162,55)),('DHEA PRETREATMENT',16.1,2.9,(187,114,102))]
  # independent editorial redraw of exact published values and ± uncertainty
  for i,(nm,v,er,col) in enumerate(groups):
   yy=355+i*153
   label(im,nm,108,yy,25,True,color=INK)
   w=int(760*min(1,v/65)*ease(max(0,min(1,(p-i*.18)/.68))))
   cv2.rectangle(im,(480,yy),(480+760,yy+44),(222,226,229),-1)
   cv2.rectangle(im,(480,yy),(480+w,yy+44),col,-1)
   label(im,f'{v:.1f}%   +/- {er:g}',1260,yy+4,25,True,color=INK)
   if p>i*.18:
    x=480+int((760*min(1,v/65))*ease(max(0,min(1,(p-i*.18)/.68))))
    circ(im,(x,yy+22),8,(249,244,239))
  footer(im,'ORIGINAL DATA REDRAWN WITH REPORTED VARIABILITY • CULTURED RAT CELLS',True)
 elif kind=='actin':
  f=FIG['04_actin'];h,w=f.shape[:2]
  # crop original fig around top row and lower row; full already shown
  shift=int(25*math.sin(p*math.pi))
  left=f[int(h*.03):int(h*.44),shift:int(w*.50)+shift];right=f[int(h*.51):int(h*.92),int(w*.50)-shift:w-shift]
  paste(im,left,100,267,670,470,False,False)
  paste(im,right,845,267,670,470,False,False)
  label(im,'PUBLISHED FLUORESCENCE',100,760,25,color=(201,224,207))
  label(im,'CELLS AND ACTIN',850,760,25,color=(201,224,207))
  footer(im,'DETAILS FROM FIGURE 4 • NO SYNTHETIC MICROSCOPY')
 elif kind=='close':
  paste(im,FIG['01_apparatus'],90,248,690,485)
  # Progressive separation of measured in-vitro evidence and clinical inference.
  xx=90+int(690*ease(p));line(im,(90,760),(xx,760),ORANGE,6)
  label(im,'WHAT THE EXPERIMENT SHOWED',835,273,30,True,color=INK)
  for i,s in enumerate(['A controlled cell-culture model.','A single advancing air-liquid interface.','Lower cell death after pretreatment.']):
   if p>(.05+i*.22):label(im,s,835,342+i*75,25,color=INK)
  cv2.rectangle(im,(825,590),(1515,703),(221,228,234),-1)
  if p>.36:
   w=int(580*ease(min(1,(p-.36)/.55)));line(im,(855,701),(855+w,701),(70,100,169),5)
   label(im,'NOT PROOF OF PATIENT BENEFIT',855,621,34,True,color=(70,100,169))
  footer(im,'PAPER: AL-RUWEIDI ET AL. (2021) • RESEARCH RESULT, NOT CLINICAL GUIDANCE',True)
 else:raise ValueError(kind)
 # fade on actual scene boundaries (soft 0.4s, avoids clipping text; no static slide transition)
 f=min(1,p*9,(1-p)*11)
 if f<1:im=np.uint8(im*f+np.array((23,31,31),np.float32)[None,None,:]*(1-f))
 return im


def write_vtt():
 # Voice timing is NOT faked. A timed editorial transcript guide is recorded separately, not attached as synchronized captions.
 txt='# Speech cue draft; not timed to any delivered narration.\n'
 for n,title,sub,start,end,kind in SHOTS:txt+=f'{start:05.1f}–{end:05.1f} {title} — {sub}\n'
 (R/'project'/'EDITORIAL_TIMELINE.txt').write_text(txt)

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--voice',help='Real narrated audio file, audited and licensed');parser.add_argument('--preview',action='store_true');parser.add_argument('--scene',type=int,help='one scene 1–12');args=parser.parse_args()
 out=R/'render';out.mkdir(exist_ok=True)
 frames=DURATION*FPS if not args.preview else FPS*22
 if args.scene:
  selected=SHOTS[args.scene-1];frames=round((selected[4]-selected[3])*FPS)
 target=out/(f'part-{args.scene:02d}.mp4' if args.scene else ('Film_01_SOURCE_FIRST_PICTURE.mp4' if not args.preview else 'Film_01_preview.mp4'))
 cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pixel_format','bgr24','-video_size',f'{W}x{H}','-framerate',str(FPS),'-i','-','-an','-c:v','mpeg4','-q:v','3','-threads','1','-pix_fmt','yuv420p','-movflags','+faststart',str(target)]
 q=subprocess.Popen(cmd,stdin=subprocess.PIPE)
 try:
  for fi in range(frames):
   t=fi/FPS+(selected[3] if args.scene else 0); shot=selected if args.scene else next(s for s in SHOTS if t<s[4]);f=render_frame(t,shot)
   q.stdin.write(f.tobytes())
   if fi%96==0:print('frame',fi,'/',frames,flush=True)
 finally:
  q.stdin.close();rc=q.wait()
 if rc:raise RuntimeError(f'ffmpeg exited {rc}')
 print('Rendered',target,target.stat().st_size)
 write_vtt()
 if args.voice:
  src=Path(args.voice);assert src.exists() and src.stat().st_size>100000
  a=R/'audio'/'original_score.wav';assert a.exists()
  final=out/'Film_01_A_Breath_Can_Injure_NARRATED_REVIEW.mp4'
  # sidechain ducking under dialogue with conservative mastering
  cmd=['ffmpeg','-y','-i',str(target),'-i',str(src),'-i',str(a),'-filter_complex',
    '[2:a]volume=0.27[score];[score][1:a]sidechaincompress=threshold=0.015:ratio=6:attack=50:release=650[ducked];[1:a][ducked]amix=inputs=2:weights=1 1:duration=first,alimiter=limit=0.89[a]',
    '-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','192k','-movflags','+faststart','-shortest',str(final)]
  subprocess.run(cmd,check=True)
  print('NARRATED CANDIDATE',final)
if __name__=='__main__':main()