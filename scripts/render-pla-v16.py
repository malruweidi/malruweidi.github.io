#!/usr/bin/env python3
"""Film08: independent, zero-cost native-1080p materials research film.

Deterministic HTML Canvas2D frame seeking in local Chromium. Original 2021
paper Figures 1/4/8 remain unchanged. The study's material response data
are attributed to their actual experiment. Preserve 120s archival narration.
This script never edits public pages or previous video exports.
"""
import argparse,hashlib,io,json,math,shutil,subprocess,tempfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets/films/series-v16-pla"
HTML=OUT/"film.html"
MASTER=ROOT/"assets/films/series-v8-primary/pla-grafting.mp4"
CAPTIONS=ROOT/"assets/films/series-v8-primary/pla-grafting.vtt"
PUB_MANIFEST=ROOT/"assets/films/series-v3/pla-grafting.json"
FIGURES=[ROOT/f"assets/films/source-figures/v3/pla-grafting-figure-{n:02d}.jpg" for n in (1,4,8)]
W,H,FPS,SECS=1920,1080,24,120
DOI="10.3390/polym13213717"
CHAPTERS=[
("Two visually identical sheets",0,15),
("A contact-angle baseline",15,30),
("Plasma activation",30,45),
("Ascorbic versus fumaric grafting",45,60),
("Elemental surface chemistry",60,75),
("Measured wetting changes",75,90),
("The laminate peel experiment",90,105),
("Controls and sequence dependence",105,120)
]

def run(*args):
    q=subprocess.run([str(a) for a in args],text=True,capture_output=True)
    if q.returncode:raise RuntimeError(" ".join(map(str,args))+"\n"+q.stderr[-3400:])
    return q.stdout

def probe(path):
    return json.loads(run("ffprobe","-v","error","-show_format","-show_streams","-of","json",path))

def validate():
    assert HTML.is_file() and MASTER.is_file() and CAPTIONS.is_file() and PUB_MANIFEST.is_file()
    text=HTML.read_text(encoding="utf8")
    for tok in ("window.__draw","window.__ready","window.__meta","sourceCard(",
                "70.2","55.1","49.6","211","87 N/m","doi",
                "PLASMA + FUMARIC ACID","FIGURE 1 / WETTING"):
        assert tok in text,tok
    assert "Math.random(" not in text and '<h1 class="sr-only">' in text
    caps=CAPTIONS.read_text(encoding="utf8")
    assert caps.startswith("WEBVTT") and caps.count("-->")>=30
    for p in FIGURES:assert p.is_file() and p.stat().st_size>50000,p
    provenance=json.loads(PUB_MANIFEST.read_text(encoding="utf8"))
    assert provenance["doi"]==DOI
    assert len(provenance["figures"])==3
    for fig,p in zip(provenance["figures"],FIGURES):
        assert fig["sha256"]==hashlib.sha256(p.read_bytes()).hexdigest(),p
        assert fig["license"].startswith("Creative Commons Attribution 4.0"),p
    info=probe(MASTER)
    assert {"audio","video"}<={s["codec_type"] for s in info["streams"]}
    assert abs(float(info["format"]["duration"])-SECS)<.2
    return provenance

def score(path):
    """Original digitally synthesized minimalist pulse, not purported lab sound."""
    import numpy as np,soundfile as sf
    sr=32000
    t=np.arange(sr*SECS,dtype=np.float64)/sr
    audio=np.zeros(len(t),dtype=np.float64)
    for hz,amplitude in [(98,.0030),(146.8,.0021),(196,.00135),(293.66,.00055)]:
        mod=.47+.53*np.sin(np.pi*np.minimum(1,t/19))**2
        audio+=amplitude*mod*np.sin(2*np.pi*hz*t+.14*np.sin(2*np.pi*.09*t))
    for j,(_,start,_) in enumerate(CHAPTERS):
        a=int(start*sr);b=min(len(t),a+sr);p=np.arange(b-a)/sr
        audio[a:b]+=(.003 if j not in (3,6) else .0045)*np.exp(-10*p)*np.sin(2*np.pi*65*p)
    fade=np.minimum(1,t/2)*np.minimum(1,(SECS-t)/3)
    sf.write(path,np.tanh(audio*fade).astype(np.float32),sr,subtype="PCM_16")

def render():
    from PIL import Image,ImageDraw
    from playwright.sync_api import sync_playwright
    source=validate()
    OUT.mkdir(exist_ok=True,parents=True)
    outfile=OUT/"pla-grafting.mp4"
    with tempfile.TemporaryDirectory(prefix="ruwaidix-pla-v16-") as tmp:
        tmp=Path(tmp)
        picture=tmp/"visual-master.mp4"
        ff=subprocess.Popen([
          "ffmpeg","-hide_banner","-loglevel","error","-y",
          "-f","image2pipe","-framerate",str(FPS),"-vcodec","mjpeg","-i","pipe:0",
          "-c:v","libx264","-preset","fast","-crf","19","-pix_fmt","yuv420p",
          "-r",str(FPS),"-an","-movflags","+faststart",str(picture)
        ],stdin=subprocess.PIPE,stderr=subprocess.PIPE)
        exceptions=[]
        thumb=[]
        contact_indices={round((a+b)/2*FPS):i for i,(_,a,b) in enumerate(CHAPTERS)}
        try:
            with sync_playwright() as p:
                browser=p.chromium.launch(headless=True,args=["--no-sandbox","--disable-dev-shm-usage"])
                page=browser.new_page(viewport={"width":W,"height":H},device_scale_factor=1)
                page.on("pageerror",lambda e:exceptions.append(str(e)))
                page.goto(HTML.resolve().as_uri(),wait_until="load")
                page.wait_for_function("window.__ready === true",timeout=30000)
                meta=page.evaluate("window.__meta")
                assert (meta["W"],meta["H"],meta["FPS"],meta["DURATION"])==(W,H,FPS,SECS),meta
                assert page.evaluate("[...document.querySelectorAll('.source')].every(i=>i.naturalWidth>=450 && i.naturalHeight>=250)")
                for n in range(FPS*SECS):
                    t=n/FPS
                    page.evaluate("(t)=>window.__draw(t)",t)
                    jpg=page.screenshot(type="jpeg",quality=94)
                    ff.stdin.write(jpg)
                    if n==FPS*4:
                        Image.open(io.BytesIO(jpg)).convert("RGB").save(OUT/"pla-grafting.webp",quality=89,method=6)
                    if n in contact_indices:
                        i=contact_indices[n]
                        (OUT/f"chapter-{i+1:02d}.jpg").write_bytes(jpg)
                    if n%(FPS*6)==0:thumb.append((t,jpg))
                    if n>0 and n%720==0:print("FILM08 PROGRESS",n,"/",SECS*FPS,flush=True)
                browser.close()
            ff.stdin.close()
            err=ff.stderr.read().decode("utf8","replace")
            if ff.wait():raise RuntimeError("Video encoder failed: "+err[-2200:])
            assert not exceptions,exceptions
        except BaseException:
            ff.kill();raise
        music=tmp/"original-score.wav";score(music)
        filt="[1:a]aresample=48000[voice];[2:a]aresample=48000,volume=0.4[music];[voice][music]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-18:LRA=9:TP=-2[a]"
        run("ffmpeg","-hide_banner","-loglevel","error","-y",
            "-i",picture,"-i",MASTER,"-i",music,
            "-filter_complex",filt,"-map","0:v:0","-map","[a]",
            "-c:v","copy","-c:a","aac","-b:a","192k","-t",str(SECS),
            "-movflags","+faststart",outfile)
        shutil.copyfile(CAPTIONS,OUT/"pla-grafting.vtt")
        contact=Image.new("RGB",(4*480,math.ceil(len(thumb)/4)*300),COVER:="#101e24")
        dr=ImageDraw.Draw(contact)
        for k,(t,jpg) in enumerate(thumb):
            frame=Image.open(io.BytesIO(jpg)).convert("RGB")
            frame.thumbnail((480,270),Image.Resampling.LANCZOS)
            x=(k%4)*480;y=(k//4)*300
            contact.paste(frame,(x,y))
            dr.text((x+12,y+276),f"{t:05.1f}s",fill="#eff2e7")
        contact.save(OUT/"pla-grafting.contact.webp",quality=89,method=6)
    info=probe(outfile)
    duration=float(info["format"]["duration"])
    assert abs(duration-SECS)<.15
    assert {"video","audio"}<={s["codec_type"] for s in info["streams"]}
    assert any(s.get("codec_name")=="h264" and s.get("width")==W and s.get("height")==H for s in info["streams"])
    provenance=[
      {"figure":f["figure_number"],"title":f["caption"],"path":f["local_path"],
       "sha256":f["sha256"],"license":f["license"],"treatment":"shown intact, never transformed into a synthetic measurement"}
      for f in source["figures"]
    ]
    report={
      "film":8,"title":"The Surface Is Not the Material","edition":"V16 / kinetic experimental interface film",
      "runtime_seconds":duration,"fps":FPS,"resolution":[W,H],
      "paper":{"doi":DOI,"title":source["paper"],"journal":"Polymers (2021) 13(21), 3717",
       "scope":"poly(lactic acid) surface wettability and PLA/aluminum laminate adhesion, packaging materials",
       "license":"CC BY 4.0"},
      "source_narration":str(MASTER.relative_to(ROOT)),"source_captions":str(CAPTIONS.relative_to(ROOT)),
      "published_values":{"water_contact_angle_degrees":{"untreated":70.2,"plasma":55.1,"plasma_fumaric_acid":49.6},
        "peel_resistance_newtons_per_meter":{"untreated_approx":74.4,"fumaric_acid_no_plasma_approx":87.2,"fumaric_acid_plasma":211}},
      "unaltered_original_figures":provenance,
      "scenes":[{"name":title,"start":a,"end":b} for title,a,b in CHAPTERS],
      "motion":"Frame-seekable 24fps Canvas2D polymer interface, plasma trajectories, grafts, wetting and peel separation plus unaltered scientific chart dwell",
      "evidence_limits":[
        "Plasma particles, activated bonds, chemical graft icons, droplets and peeling laminate are interpretive illustrations, NOT observed video or actual molecular positions.",
        "Original XPS, contact-angle and peel charts remain complete and unmodified; scientific values are transcribed from the 2021 paper.",
        "Wettability and PLA/Al peel improvements do not establish clinical biocompatibility, antimicrobial efficacy, or performance inside a patient.",
        "No claim of an effect in the distinct 2020 PLA scaffold study; this film is only about the 2021 PLA film-grafting study."],
      "earlier_masters_preserved":True,"live_site_unchanged":True,
      "review_state":"Technical review export; final audiovisual, caption, scientific and attribution sign-off pending",
      "sha256":hashlib.sha256(outfile.read_bytes()).hexdigest()
    }
    (OUT/"pla-grafting.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print("FILM08 MASTER COMPLETE",json.dumps({"seconds":duration,"bytes":outfile.stat().st_size,"sha256":report["sha256"]}),flush=True)

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--validate-only",action="store_true")
    args=parser.parse_args()
    if args.validate_only:validate();print("FILM08 SOURCES PASS")
    else:render()
