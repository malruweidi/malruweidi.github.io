#!/usr/bin/env python3
"""MAKING MEDICINES KEEP — independent primary-source documentary V3 master.

This is NOT a reskin of the V1/V2 slideshow. Eight individually authored
animated chapters are illustrated from the author's manuscript and a genuine,
catalogued Wellcome copy of Minhaj al-dukkan. Digital manuscript images remain
unaltered and labelled as a 1904 copy; nonhistorical chemistry diagrams are
explicitly marked 'EXPLANATORY RECONSTRUCTION'.
"""
import hashlib,io,json,math,os,subprocess,tempfile
from pathlib import Path

import numpy as np
import soundfile as sf
from PIL import Image,ImageDraw,ImageFont,ImageOps,ImageFilter

ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/"assets/films/source-manuscripts/wellcome-ms-arabic-1002"
OUT=ROOT/"assets/films/series-v3"
NAME="making-medicines-keep"
W,H,FPS,CHAPTER_SECONDS=1280,720,24,15
DURATION=120
DARK=(13,33,36)
IVORY=(246,237,218)
GOLD=(219,170,115)
MINT=(118,179,158)
AMBER=(176,100,55)
BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
REG="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
SERIF="/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"

SCENES=[
 {"title":"AFTER THE FIRE","tag":"CAIRO / 1260","speech":"In thirteenth-century Cairo, a medicine had to remain useful after the fire went out. That was a problem of process, material judgment, and trust.","motion":"prologue","source":"al-Kūhīn al-ʿAṭṭār, original composition Cairo, 658 AH / 1260; historical synthesis in owner's accepted 2026 manuscript."},
 {"title":"A WORKING HANDBOOK","tag":"A GENUINE LATER COPY / 1904","speech":"A pharmacist's handbook composed in Cairo in twelve sixty sets out practical rules. The manuscript pictured here is a later Egyptian copy, dated nineteen oh four.","motion":"manuscript","source":"Wellcome Collection MS Arabic 1002 (Egypt, 1904), Public Domain Mark; introductory scanned spreads in their original context."},
 {"title":"THE BASE AND THE FORM","tag":"ROSE WATER + SUGAR / FRUIT","speech":"Its rose-water and sugar base could become many different syrups. Fruit or medicinal material supplied the distinguishing form. The handbook describes this material relationship explicitly.","motion":"julep","source":"Minhāj al-dukkān syrup chapter; author's English translation of the julāb, hayūlā and ṣūra discussion."},
 {"title":"MAKE, SKIM, STRAIN","tag":"PROCESS IS PART OF THE PRODUCT","speech":"Preparation demanded more than mixing. Sugar was dissolved, foam was removed, the liquid passed through cloth, and the vessel returned to the fire for further concentration.","motion":"clarification","source":"Minhāj al-dukkān syrup chapter; process reconstruction from owner's accepted manuscript, pages 14–16."},
 {"title":"KNOW THE CONSISTENCY","tag":"QIWĀM / ACHIEVED MATERIAL STATE","speech":"A recognized consistency was the endpoint, not a numerical reading. Too little control risked spoilage. Pushing concentration too far could make a syrup crystallize.","motion":"consistency","source":"Minhāj al-dukkān qiwām / ʿaqīd / mushāsh language; qualitative physical interpretation, no historic numerical assays."},
 {"title":"WHAT IF IT FAILS?","tag":"CRYSTALLIZATION / REPAIR RULE","speech":"The handbook also described failure. Sugared syrup could be dissolved with warm water, brought back toward its intended consistency, and adjusted with fruit water.","motion":"repair","source":"Minhāj al-dukkān, end-of-syrup-chapter qawānīn and tasakkur repair instruction."},
 {"title":"REPLACEMENT IS A JUDGMENT","tag":"SUBSTITUTION ≠ FRAUD","speech":"Scarcity raised another problem. The appropriate substitute had to be judged by function and preparation, not simply appearance. Deliberate adulteration posed a different kind of risk.","motion":"substitution","source":"Minhāj al-dukkān substitution and ḥisba discussion; analytical distinction, no modern bioequivalence claim."},
 {"title":"RECIPE IS NOT INVENTORY","tag":"WHAT THE RECORD CANNOT SHOW","speech":"Cairo Genizah prescriptions illuminate the distance between written demand and available supply. Reliability was achieved through practical judgment, not through a medieval version of modern drug regulation.","motion":"document-gap","source":"Or.1081 J39 prescription as discussed in author's manuscript; actual Genizah fragment image NOT reproduced."}
]

def font(size=21,bold=False,serif=False):
    return ImageFont.truetype(SERIF if serif else BOLD if bold else REG,size)

def lerp(a,b,t):return a+(b-a)*max(0,min(1,t))
def smooth(t):t=max(0,min(1,t));return t*t*(3-2*t)

def txt(d,xy,text,size=24,color=IVORY,bold=False,serif=False):
    d.text(xy,text,font=font(size,bold,serif),fill=color)

def linewrap(draw,text,width,face):
    words=text.split();lines=[];chunk=""
    for word in words:
        trial=(chunk+" "+word).strip()
        if chunk and draw.textbbox((0,0),trial,font=face)[2]>width:
            lines.append(chunk);chunk=word
        else:chunk=trial
    if chunk:lines.append(chunk)
    return lines

def backdrop():
    im=Image.new("RGB",(W,H),DARK);d=ImageDraw.Draw(im)
    for y in range(H):
        q=y/H
        d.line((0,y,W,y),fill=(int(12+18*q),int(31+17*q),int(34+14*q)),width=1)
    for k in range(12):
        xx=80+k*102
        d.line((xx,0,xx,H),fill=(21,47,49),width=1)
    return im

def fade(i,t,duration=1.3):
    alpha=max(0,min(1,t/duration,(15-t)/duration))
    d.rectangle((0,H-7,W,H),fill=GOLD)
    return alpha

def frame_base(k,t):
    im=backdrop();d=ImageDraw.Draw(im)
    d.line((54,60,1225,60),fill=(59,97,87),width=2)
    txt(d,(58,28),"RUWAIDIX  /  RESEARCH CINEMA",15,MINT,True)
    txt(d,(970,28),f"ARCHIVE   {k+1:02d} / 08",15,GOLD,True)
    txt(d,(58,95),SCENES[k]["title"],48,IVORY,False,True)
    txt(d,(60,161),SCENES[k]["tag"],17,GOLD,True)
    d.rectangle((57,681,1218,683),fill=(54,87,82))
    d.rectangle((57,681,57+int((1161)*(k+t/CHAPTER_SECONDS)/8),683),fill=GOLD)
    txt(d,(59,695),"HISTORICAL DOCUMENTS ARE PRIMARY SOURCES / DIAGRAMS ARE MODERN EXPLANATIONS",10,MINT)
    return im,d

def documentary_page(im,number,box=(663,215,1186,603)):
    name=f"canvas-{number:03d}.jpg"
    src=Image.open(SRC/name).convert("RGB")
    x0,y0,x1,y1=box
    src.thumbnail((x1-x0,y1-y0),Image.Resampling.LANCZOS)
    x=(x0+x1-src.width)//2;y=(y0+y1-src.height)//2
    im.paste(src,(x,y))
    ImageDraw.Draw(im).rectangle((x-4,y-4,x+src.width+4,y+src.height+4),outline=GOLD,width=2)
    return (x,y,x+src.width,y+src.height)

def left_text(d,heading,lines,y=258):
    txt(d,(71,y),heading,25,GOLD,True)
    for k,line in enumerate(lines):
        txt(d,(72,y+52+k*42),line,24,IVORY)

def prologue(im,d,t):
    documentary_page(im,1,(696,205,1163,605))
    left_text(d,"AN ANCIENT PROBLEM",["A medicine changes","as it is made.","Can it remain usable?"],267)
    d.arc((110,454,476,611),190+int(t*6),348+int(t*5),fill=GOLD,width=3)
    txt(d,(75,617),"Manuscript: later Egyptian copy, 1904",16,MINT)

def manuscript(im,d,t):
    documentary_page(im,13,(667,218,1192,612))
    left_text(d,"NOT A GENERIC ARABIC TEXT",["This is the actual","pharmacy handbook.","Copy: Egypt, 1904."],258)
    d.line((91,558,530,558),fill=GOLD,width=3)
    txt(d,(90,579),"Wellcome Collection  /  MS Arabic 1002",16,MINT)

def julep(im,d,t):
    left_text(d,"ONE BASE. MANY FORMS.",["Rose-water and","sugar form a base.","Fruit differentiates."],269)
    cx,cy=926,412
    d.ellipse((cx-173,cy-132,cx+173,cy+132),outline=(111,162,152),width=6)
    d.arc((cx-161,cy-85,cx+161,cy+103),0,180,fill=GOLD,width=7)
    for i in range(16):
        x=cx-144+(i*31)%288
        y=cy+29+18*math.sin(i*.85+t*.45)
        rr=3+(i%3)
        d.ellipse((x-rr,y-rr,x+rr,y+rr),fill=IVORY)
    for i in range(7):
        q=min(1,max(0,t/11))
        x=817+i*35+math.sin(t*1.4+i)*9
        y=243+(cy-243)*smooth((q+i*.045)%1)
        d.ellipse((x-9,y-9,x+9,y+9),fill=(188,104,69))
    txt(d,(746,584),"Illustrative process chemistry; not a measured concentration.",14,MINT)

def clarification(im,d,t):
    left_text(d,"A SEQUENCE OF OPERATIONS",["Dissolve sugar","Remove surface foam","Pass through cloth","Return to gentle fire"],254)
    x0,y0,x1,y1=775,327,1145,553
    d.arc((x0,264,x1,575),5,175,fill=GOLD,width=10)
    for j in range(12):
        x=797+j*29
        y=411+9*math.sin(t*.8+j)
        d.ellipse((x-5,y-5,x+5,y+5),fill=(190,112,71))
    foam=12-int(10*smooth(t/15))
    for j in range(foam):
        x=810+j*23
        y=330+6*math.sin(j*2+t*.7)
        d.ellipse((x-8,y-7,x+8,y+7),outline=IVORY,width=2)
    skimx=775+int(360*smooth(t/15))
    d.line((skimx,324,skimx+77,315),fill=MINT,width=7)
    txt(d,(801,594),"The vessel and implements are schematic, not surviving objects.",13,MINT)

def consistency(im,d,t):
    left_text(d,"THE ENDPOINT IS SENSORY",["Named material state","Recognised by craft","No numeric readout"],253)
    x0,x1,cy=804,1098,420
    d.line((x0,235,x0,533,x1,533,x1,235),fill=GOLD,width=7)
    y=470-80*smooth(t/15)
    d.rectangle((x0+6,y,x1-5,525),fill=(127,76,49))
    for j in range(8):
        x=x0+27+j*31
        dx=5*math.sin(t*2+j)
        d.ellipse((x+dx,y-7,x+13+dx,y+7),fill=(201,147,83))
    d.line((x0,y,x1,y),fill=(230,184,117),width=6)
    txt(d,(797,573),"qiwām  /  achieved consistency",21,IVORY)
    txt(d,(794,605),"No invented viscosity, temperature or shelf-life measurement.",12,MINT)

def repair(im,d,t):
    left_text(d,"THE TEXT EXPECTS FAILURE",["Crystallization is","a process deviation.","The rule offers repair."],260)
    cx=934
    d.rounded_rectangle((778,293,1140,526),radius=24,outline=GOLD,width=5)
    for i in range(38):
        x=795+((i*67)%310);y=325+(i*41)%155
        radius=7*(1-smooth((t-i*.12)/14))+1
        d.polygon([(x-radius,y),(x,y-radius),(x+radius,y),(x,y+radius)],fill=(230,208,157))
    drops=int(1+6*t/15)
    for i in range(drops):
        x=835+i*42
        d.ellipse((x-6,248+i*2,x+6,266+i*2),fill=MINT)
    txt(d,(776,559),"Warm water → dissolve → restore the intended state",17,IVORY)
    txt(d,(776,594),"Historical repair rule, not a modern GMP authorization.",13,MINT)

def substitution(im,d,t):
    left_text(d,"A DIFFERENT KIND OF RISK",["A missing material","creates a choice.","Fraud is not substitution."],265)
    labels=[("Scarcity","Known material absent"),("Judgment","Functional replacement"),("Boundary","Identity / honesty")]
    for i,(h,sub) in enumerate(labels):
        x=730+int(90*(1-smooth(t/15)));y=239+i*122
        d.rounded_rectangle((x,y,x+440,y+88),radius=15,fill=(29,65,64),outline=GOLD if i==1 else (82,115,103),width=2)
        txt(d,(x+19,y+12),h,24,GOLD,True)
        txt(d,(x+21,y+51),sub,17,IVORY)
        if i<2:d.line((x+218,y+88,x+218,y+120),fill=MINT,width=4)
    txt(d,(726,628),"No claim of generic equivalence or uniform medieval oversight.",12,MINT)

def documentary_gap(im,d,t):
    left_text(d,"THE PRACTICAL GAP",["A prescription can","request a substance.","It cannot prove stock."],251)
    for i,(x,title,body) in enumerate([(739,"PRESCRIPTION",["Therapeutic demand","Dosage form","Instructions"]),(967,"SHELF",["Available identity?","Fresh and unaltered?","Ready to compound?"])]):
        d.rounded_rectangle((x,253,x+204,565),radius=14,fill=(37,65,63),outline=MINT if i==0 else GOLD,width=3)
        txt(d,(x+12,278),title,16,GOLD,True)
        for j,s in enumerate(body):
            d.line((x+14,334+j*54,x+184,334+j*54),fill=(85,120,111),width=1)
            txt(d,(x+13,345+j*54),s,13,IVORY)
    p=(math.sin(t*.85)+1)/2
    d.line((943,417,967,417),fill=GOLD,width=3)
    txt(d,(759,609),"Genizah fragment not shown; these are editorial documents.",13,MINT)

DRAWERS=[prologue,manuscript,julep,clarification,consistency,repair,substitution,documentary_gap]

def wav_voice(models,space):
    from kokoro_onnx import Kokoro
    voice=Kokoro(str(models/"kokoro-v1.0.fp16.onnx"),str(models/"voices-v1.0.bin"))
    fs=None;spoken=[];report=[]
    for i,scene in enumerate(SCENES):
        arr,rate=voice.create(scene["speech"],voice="bm_george",speed=1.15,lang="en-gb")
        arr=np.asarray(arr,dtype=np.float32).reshape(-1)
        if fs and fs!=rate:raise RuntimeError("TTS unexpectedly changed sample rate")
        fs=rate
        seconds=len(arr)/rate
        if seconds>CHAPTER_SECONDS-0.9:
            raise ValueError(f"Scene {i+1} voice length {seconds:.2f}s exceeds {CHAPTER_SECONDS-0.9}s — rewrite, never truncate speech.")
        spoken.append(arr);report.append({"scene":i+1,"tts_seconds":round(seconds,3),"words":len(scene["speech"].split())})
    timeline=np.zeros((DURATION*fs,),dtype=np.float32)
    for i,v in enumerate(spoken):
        offset=int((i*15+0.8)*fs)
        timeline[offset:offset+len(v)]+=v*.89
    # Original restrained ambient music, mathematically generated rather than
    # unlicensed background stock audio. Low level under intelligible speech.
    times=np.arange(len(timeline),dtype=np.float64)/fs
    ambient=(np.sin(times*2*math.pi*55)*.0045+
             np.sin(times*2*math.pi*82.4)*.0038+
             np.sin(times*2*math.pi*110)*.0015).astype(np.float32)
    fade=np.minimum(1,np.minimum(times/2,(DURATION-times)/2)).astype(np.float32)
    timeline=np.tanh(timeline+ambient*fade)
    sf.write(space/"narration.wav",timeline,fs,subtype="PCM_16")
    return fs,report

def subtitles(space,report):
    def clock(t):
        ms=round(t*1000)
        return f"{ms//3600000:02d}:{ms//60000%60:02d}:{ms//1000%60:02d}.{ms%1000:03d}"
    out=["WEBVTT",""]
    for i,s in enumerate(SCENES):
        tokens=s["speech"].split()
        groups=[" ".join(tokens[j:j+7]) for j in range(0,len(tokens),7)]
        den=sum(len(w.split()) for w in groups)
        elapsed=0;start=i*15+.8
        duration=report[i]["tts_seconds"]
        for g in groups:
            a=start+duration*elapsed/den
            elapsed+=len(g.split())
            b=start+duration*elapsed/den
            out.extend([f"{clock(a)} --> {clock(b)}",g,""])
    (space/"captions.vtt").write_text("\n".join(out),encoding="utf8")

def clip(k,space):
    path=space/f"clip-{k:02d}.mp4"
    cmd=["ffmpeg","-hide_banner","-loglevel","error","-y","-f","image2pipe","-framerate",str(FPS),"-vcodec","mjpeg","-i","pipe:0",
         "-an","-c:v","libx264","-preset","faster","-crf","22","-pix_fmt","yuv420p","-r",str(FPS),"-movflags","+faststart",str(path)]
    stderr=(space/f"ffmpeg-{k:02d}.log").open("wb")
    pipe=subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=stderr,stdout=subprocess.DEVNULL)
    try:
        for i in range(FPS*CHAPTER_SECONDS):
            t=i/FPS
            im,d=frame_base(k,t)
            DRAWERS[k](im,d,t)
            fade_factor=min(1,t/.7,(CHAPTER_SECONDS-t)/.7)
            if fade_factor<1:
                shade=Image.new("RGB",(W,H),DARK)
                im=Image.blend(shade,im,max(0,fade_factor))
            obj=io.BytesIO()
            im.save(obj,"JPEG",quality=86,subsampling=0)
            pipe.stdin.write(obj.getvalue())
    finally:
        pipe.stdin.close()
    stderr.close()
    if pipe.wait()!=0:raise RuntimeError(f"Video scene {k+1} failed. See {space}/ffmpeg-{k:02d}.log")
    return path

def main():
    register=json.loads((SRC/"source-register.json").read_text(encoding="utf8"))
    assert register["copy_date"]=="Egypt, 1904 CE" and register["canvas_count"]>=120
    for n in (1,13):
        if not (SRC/f"canvas-{n:03d}.jpg").exists():raise FileNotFoundError("Missing genuine manuscript source canvas")
    models=(ROOT/"film-models").resolve()
    OUT.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="ruwaidix-making-v3-") as tmp:
        space=Path(tmp)
        sample_rate,timing=wav_voice(models,space)
        subtitles(space,timing)
        fragments=[clip(k,space) for k in range(len(SCENES))]
        listing=space/"concat.txt"
        listing.write_text("".join(f"file '{p}'\n" for p in fragments))
        video=OUT/(NAME+".mp4")
        cmd=["ffmpeg","-hide_banner","-loglevel","error","-y","-f","concat","-safe","0","-i",str(listing),"-i",str(space/"narration.wav"),
             "-map","0:v:0","-map","1:a:0","-c:v","copy","-c:a","aac","-b:a","160k","-t",str(DURATION),"-movflags","+faststart",str(video)]
        subprocess.run(cmd,check=True)
        (OUT/(NAME+".vtt")).write_bytes((space/"captions.vtt").read_bytes())
        info=json.loads(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","json",str(video)]))
        seconds=float(info["format"]["duration"])
        if abs(seconds-DURATION)>.30 or video.stat().st_size>97_000_000:
            raise ValueError(f"Unusable movie size or runtime: {seconds}s {video.stat().st_size}bytes")
        meta={"id":NAME,"edition":"V3 original primary-source documentary","duration_seconds":seconds,
              "sha256":hashlib.sha256(video.read_bytes()).hexdigest(),
              "source_witness":"Wellcome MS Arabic 1002, later copy Egypt 1904; genuine images used only as whole manuscript/spread contextual documents",
              "archive_images":[{"file":"canvas-001.jpg","canvas":"b21417283_WMS_Arabic_1002_0001.jp2"},{"file":"canvas-013.jpg","canvas":"b21417283_WMS_Arabic_1002_0013.jp2"}],
              "source_credit":"Wellcome Collection, MS Arabic 1002, Public Domain Mark; IIIF b21417283.",
              "primary_work":"al-Kūhīn al-ʿAṭṭār, Minhāj al-dukkān, composed Cairo 658 AH / 1260",
              "author_source":"Making Medicines Keep — Syrups, Substitution, and Pharmaceutical Reliability in Ayyubid-Mamluk Cairo; accepted manuscript 15 October 2026",
              "source_limit":"Wellcome physical copy produced 1904. Scene pictograms are contemporary explanatory diagrams; no authentic Genizah fragment has been displayed. No numerical historical assay, clinical efficacy, or GMP genealogy asserted.",
              "human_review":"NOT YET APPROVED; audition factual performance, Arabic pronunciation, chapter pacing and legibility",
              "tts":"Kokoro ONNX bm_george; English synthetic narration; locally generated low-level abstract ambience",
              "chapters":[{**scene,**timing[i]} for i,scene in enumerate(SCENES)]}
        (OUT/(NAME+".json")).write_text(json.dumps(meta,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    print("V3 SOURCE DOCUMENTARY ENCODED",video,round(seconds,2),"s",video.stat().st_size,"bytes",flush=True)

if __name__=="__main__":
    main()
