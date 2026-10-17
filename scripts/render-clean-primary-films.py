#!/usr/bin/env python3
"""Clean, source-specific 120-second Ruwaidix research films.

All images are literal archived manuscript leaves, source-publisher research
figures, or original nonquantitative diagrams. Never copies legacy slates or
publication-review warnings into a rendered movie. Old masters remain intact.
"""
import argparse
import hashlib
import json
import math
import subprocess
import tempfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageChops

ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/"assets/films"
OUT=BASE/"series-v8-primary"
BG=(13,37,43)
MINT=(129,200,185)
GOLD=(225,176,114)
IVORY=(248,244,232)
W,H=1280,720
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
REV="audience-clean-primary-20261018-v1"
PROJECTS={
 "pla-grafting":("series-v3", [
   "assets/films/source-figures/v3/pla-grafting-figure-01.jpg",
   "assets/films/source-figures/v3/pla-grafting-figure-04.jpg",
   "assets/films/source-figures/v3/pla-grafting-figure-08.jpg"]),
 "making-medicines-keep":("series-v4",[
   "assets/films/source-manuscripts/wellcome-ms-arabic-1002/canvas-013.jpg",
   "assets/films/source-manuscripts/wellcome-ms-arabic-1002/canvas-001.jpg"]),
 "flow-chamber-method":("series-v5", [
   "assets/films/source-figures/v3/flow-chamber-method-figure-01.jpg",
   "assets/films/source-figures/v3/flow-chamber-method-figure-05.jpg",
   "assets/films/source-figures/v3/flow-chamber-method-figure-06.jpg"]),
 "pla-scaffolds":("series-v5", [
   "assets/films/source-figures/v4/pla-scaffolds/pla-scaffolds-figure-01.jpg",
   "assets/films/source-figures/v4/pla-scaffolds/pla-scaffolds-figure-05.jpg",
   "assets/films/source-figures/v4/pla-scaffolds/pla-scaffolds-figure-06.jpg",
   "assets/films/source-figures/v4/pla-scaffolds/pla-scaffolds-figure-07.jpg",
   "assets/films/source-figures/v4/pla-scaffolds/pla-scaffolds-figure-03.jpg"]),
 "microfluidic-virus":("series-v5", [
   "assets/films/source-figures/v4/microfluidic-virus/microfluidic-virus-figure-01-source-page.jpg"])
}
PRIMARY_SCENES={
 "pla-grafting":[1,1,None,1,1,0,2,2],
 "making-medicines-keep":[0,1,None,None,None,None,0,1],
 "flow-chamber-method":[0,0,None,1,1,2,2,0],
 "pla-scaffolds":[0,None,None,1,2,3,4,1],
 "microfluidic-virus":[0,None,None,0,None,None,None,0]
}
FALLBACK_TITLES={
 "pla-grafting":["A material changes at its boundary","The original comparator","Plasma first",
   "Two graft routes","The measured surface chemistry","Contact angle matters",
   "Peel resistance","What the control establishes"],
 "making-medicines-keep":["Making Medicines Keep","A working handbook",
   "The syrup base","Prepare and strain","Concentration","Repair a failure",
   "A prescription survives","Pharmacy and trust"],
 "flow-chamber-method":["A bubble crosses cells","The experimental apparatus",
   "A moving interface","Measured cell injury","The comparison","The cytoskeleton",
   "What the result supports","Where the model stops"],
 "pla-scaffolds":["A fibrous scaffold","Electrospinning","Plasma treatment",
   "Scanning electron microscopy","Surface topography","Infrared spectra",
   "Bacterial colonization","The research conclusion"],
 "microfluidic-virus":["The review and its questions","Samples before signals",
   "Different molecular targets","Published detection framework",
   "Binding and capture","An optical response","Electrical signals",
   "From design to validation"]
}

def font(size, bold=False):
    return ImageFont.truetype(BOLD if bold else FONT,size)

def sh(*args):
    result=subprocess.run(args,capture_output=True,text=True)
    if result.returncode:
        raise RuntimeError(" ".join(map(str,args))+"\n"+result.stderr[-2000:])
    return result.stdout

def source_title(slug,i,chapter):
    fallback=FALLBACK_TITLES[slug][i]
    val=chapter.get("title") or chapter.get("headline")
    if isinstance(val,list):val=" ".join(val)
    # Manifests for older cuts have production placeholders, not public titles.
    if not val or val.upper() in ("SOURCE","PROVENANCE","PRIMARY SOURCE","SOURCE-LOCKED"):
        return fallback
    return fallback if slug=="microfluidic-virus" else val.title() if val.isupper() else val

def diagram(d,slug,chapter,phase):
    # A distinct explanatory process, never measured curves, patient scans or microscopy.
    d.rounded_rectangle((155,138,1125,489),radius=25,outline=(50,92,90),width=3)
    t=chapter+phase/4
    if slug=="flow-chamber-method":
        d.rounded_rectangle((210,220,1065,405),radius=28,outline=MINT,width=6)
        for j in range(17):
            x=231+j*49
            d.rounded_rectangle((x,366,x+40,410),radius=12,outline=MINT,width=3)
            d.ellipse((x+12,381,x+27,396),fill=GOLD)
        x=250+((chapter*2+phase)%13)*48
        d.arc((x,238,x+190,370),55,310,fill=GOLD,width=10)
        d.line((x+150,286,x+248,286),fill=GOLD,width=5)
    elif slug in ("pla-scaffolds","pla-grafting"):
        for row in range(7):
            pts=[]
            for x in range(205,1060,14):
                y=210+row*41+14*math.sin(x/72+row*1.15+t/3)
                pts.append((x,int(y)))
            d.line(pts,fill=MINT if row%2 else GOLD,width=6)
        if slug=="pla-grafting":
            for j in range(7):
                x=275+112*j
                d.ellipse((x,175+phase*6,x+15,190+phase*6),outline=GOLD,width=3)
    elif slug=="microfluidic-virus":
        d.rounded_rectangle((205,225,1037,421),radius=25,outline=MINT,width=6)
        for i in range(3):
            y=261+i*56
            d.line((210,y,445,y,517,y+21,716,y+21,788,y,1032,y),fill=GOLD if i==phase%3 else MINT,width=7)
            for j in range(3):
                x=265+j*62+phase*12
                d.ellipse((x,y-8,x+16,y+8),fill=GOLD)
        d.ellipse((755,259,852,358),outline=MINT,width=7)
    else:
        # Material preparation shown diagrammatically, never claimed as a
        # photograph of a historical laboratory or an original experiment.
        d.ellipse((460,265,840,410),outline=GOLD,width=9)
        d.polygon([(480,284),(820,284),(773,427),(528,427)],fill=(73,90,73))
        d.line((645,170,735+phase*12,330),fill=GOLD,width=12)
        for j in range(7):
            x=529+j*38
            d.ellipse((x,318+8*math.sin(j+t),x+10,328+8*math.sin(j+t)),fill=MINT)

def wrap_title(draw,title):
    text=title.strip()
    words=text.split()
    lines=[]
    current=""
    for word in words:
        test=(current+" "+word).strip()
        if draw.textbbox((0,0),test,font=font(35,True))[2]>1045 and current:
            lines.append(current);current=word
        else:current=test
    if current:lines.append(current)
    assert len(lines)<=2,(title,lines)
    return lines

def frame(slug,chapter,phase,source_file,title,output):
    im=Image.new("RGB",(W,H),BG)
    d=ImageDraw.Draw(im)
    if source_file:
        p=ROOT/source_file
        assert p.is_file(),p
        with Image.open(p) as raw:
            original=raw.convert("RGB")
            original.thumbnail((1025,406),Image.Resampling.LANCZOS)
            x=(W-original.width)//2
            y=105+(406-original.height)//2
            assert y>=105 and y+original.height<=511
            im.paste(original,(x,y))
        d=ImageDraw.Draw(im)
    else:
        diagram(d,slug,chapter,phase)
    # Public film design: only title and film branding. Internal source-credit
    # classes, report-status warnings and director annotations are not drawn.
    d.rectangle((0,530,W,H),fill=BG)
    d.rectangle((70,553,128,557),fill=GOLD)
    d.text((72,569),"RUWAIDIX",font=font(15,True),fill=MINT)
    for i,row in enumerate(wrap_title(d,title)):
        d.text((72,599+i*33),row,font=font(35,True),fill=IVORY)
    assert not ImageChops.difference(im.crop((0,0,W,70)),
           Image.new("RGB",(W,70),BG)).getbbox(),"Internal upper stripe found"
    assert not ImageChops.difference(im.crop((0,690,W,720)),
           Image.new("RGB",(W,30),BG)).getbbox(),"Caption safe area blocked"
    im.save(output,optimize=True)

def compose(slug):
    old,assets=PROJECTS[slug]
    source=BASE/old/(slug+".mp4")
    subtitle=BASE/old/(slug+".vtt")
    manifest=BASE/old/(slug+".json")
    record=json.loads(manifest.read_text())
    assert len(record["chapters"])==8,slug
    assert all((ROOT/path).is_file() for path in assets)
    assert source.is_file() and subtitle.read_text(encoding="utf8").startswith("WEBVTT")
    OUT.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="ruwaidix-primary-"+slug+"-") as tmp:
        p=Path(tmp)
        entries=["ffconcat version 1.0"]
        scenes=[]
        for ci,ch in enumerate(record["chapters"]):
            title=source_title(slug,ci,ch)
            image_i=PRIMARY_SCENES[slug][ci]
            research_source=assets[image_i] if image_i is not None else None
            for phase in range(4):
                still=p/f"scene-{ci+1:02d}-{phase:02d}.png"
                frame(slug,ci,phase,research_source if phase<2 else None,
                      title,still)
                entries.extend(["file '"+str(still)+"'","duration 3.750000"])
                scenes.append({"chapter":ci+1,"beat":phase+1,
                               "source":research_source if phase<2 else "original-nonquantitative-illustration"})
        entries.append("file '"+str(still)+"'")
        ffcat=p/"render.ffcat"
        ffcat.write_text("\n".join(entries)+"\n")
        movie=OUT/(slug+".mp4")
        sh("ffmpeg","-hide_banner","-loglevel","error","-y",
           "-safe","0","-f","concat","-i",str(ffcat),"-i",str(source),
           "-filter_complex","[0:v]fps=24,scale=1312:738:flags=lanczos,"
              "crop=1280:720:x='16+8*sin(n/37)':y='9+6*cos(n/41)',"
              "setsar=1,format=yuv420p[v]",
           "-map","[v]","-map","1:a:0",
           "-t","120","-r","24","-c:v","libx264",
           "-preset","veryfast","-crf","21","-c:a","copy",
           "-movflags","+faststart",str(movie))
        info=json.loads(sh("ffprobe","-v","error","-show_format","-show_streams",
                            "-of","json",str(movie)))
        duration=float(info["format"]["duration"])
        assert abs(duration-120)<.25,(slug,duration)
        assert any(x["codec_type"]=="audio" for x in info["streams"])
        assert any(x["codec_type"]=="video" and x.get("width")==1280
                   and x.get("height")==720 for x in info["streams"])
        import shutil
        shutil.copyfile(subtitle,OUT/(slug+".vtt"))
        sh("ffmpeg","-hide_banner","-loglevel","error","-y",
           "-ss","1","-i",str(movie),"-frames:v","1",
           str(OUT/(slug+".webp")))
        sheet=Image.new("RGB",(1920,804),BG)
        sd=ImageDraw.Draw(sheet)
        for n in range(6):
            ci=n if n<6 else 7
            still=p/f"scene-{ci+1:02d}-01.png"
            with Image.open(still) as original:
                tile=original.resize((640,360),Image.Resampling.LANCZOS)
            px=(n%3)*640;py=(n//3)*402
            sheet.paste(tile,(px,py))
            sd.text((px+18,py+371),f"INTERNAL REVIEW / SCENE {ci+1:02d}",
                    font=font(17),fill=IVORY)
        sheet.save(OUT/(slug+".contact.webp"),quality=86,method=6)
        meta={"slug":slug,"edition":"series-v8-primary",
            "visual_revision":REV,"duration_seconds":duration,
            "source_edition":old,"old_movie_sha256":hashlib.sha256(source.read_bytes()).hexdigest(),
            "movie_sha256":hashlib.sha256(movie.read_bytes()).hexdigest(),
            "narration":"Original research-edition audio stream, untouched",
            "captions":"Original source WebVTT, optional on the screening site",
            "original_scholarship":record.get("doi") or record.get("primary_work"),
            "beats":scenes,
            "human_review":"Further scientific and art direction review pending"}
        (OUT/(slug+".json")).write_text(json.dumps(meta,indent=2,ensure_ascii=False)+"\n")
        print("PRIMARY CLEAN",slug,round(duration,2),movie.stat().st_size,flush=True)

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--all",action="store_true")
    p.add_argument("--film",action="append")
    args=p.parse_args()
    chosen=list(PROJECTS) if args.all else args.film or []
    if not chosen:raise ValueError("Choose --all or --film")
    for slug in chosen:
        if slug not in PROJECTS:raise ValueError(slug)
        compose(slug)

if __name__=="__main__":
    main()
