#!/usr/bin/env python3
"""Film 10: advancing air-liquid boundary across cultured epithelial cells.

84s/24fps/1920x1080 review master with one archived paper figure and contextual specimen photographs.
Conceptual biological motion and flow graphics are not a record of measured specimen values.
"""
import argparse,hashlib,io,json,math,shutil,subprocess,tempfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets/films/series-v19-zebrafish"
HTML=OUT/"film.html"
MASTER=ROOT/"assets/films/series-v7-pilots/zebrafish-hemodynamics.mp4"
CAPTIONS=ROOT/"assets/films/series-v7-pilots/zebrafish-hemodynamics.vtt"
CATALOG=ROOT/"assets/films/publication-series.json"
FIGURE=ROOT/"assets/home-archive/figure-zebrafish-microscopy.jpg"
CONTEXT=[ROOT/"assets/zebrafish-larva-microscopy.webp",ROOT/"assets/zebrafish-embryo-microscopy.webp"]
W,H,FPS,DURATION=1920,1080,24,84
DOI="10.1016/j.micron.2020.102876"
SCENES=[
 ("Heart and vessel motion, conceptual illustration",0,14),
 ("Recording moving biology frame by frame",14,28),
 ("Unmodified published blood-flow figure",28,42),
 ("Sampling assumptions and possible aliasing",42,56),
 ("Vessel geometry and moving illustrative red cells",56,70),
 ("From original image to quantified physiological parameter",70,84)
]

def run(*cmd):
    q=subprocess.run([str(x) for x in cmd],capture_output=True,text=True)
    if q.returncode:raise RuntimeError(" ".join(map(str,cmd))+"\n"+q.stderr[-2300:])
    return q.stdout

def info(path):
    return json.loads(run("ffprobe","-v","error","-show_format","-show_streams","-of","json",path))

def validate():
    assert HTML.is_file() and MASTER.is_file() and CAPTIONS.is_file() and FIGURE.is_file() and CATALOG.is_file()
    assert all(path.is_file() for path in CONTEXT)
    markup=HTML.read_text(encoding="utf8")
    for key in ("window.__draw","window.__ready","window.__meta",
                "beating(","vessel(","PUBLISHED FIGURE",
                "SAMPLED FRAMES","not experimental footage","No synthetic outputs"):
        assert key in markup,key
    assert "Math.random(" not in markup
    captions=CAPTIONS.read_text(encoding="utf8")
    assert captions.startswith("WEBVTT") and captions.count("-->")==12
    j=json.loads(CATALOG.read_text(encoding="utf8"))
    item=next(x for x in j["items"] if x["id"]=="zebrafish-hemodynamics")
    assert item["doi"]==DOI and item["duration_seconds"]==84
    assert FIGURE.stat().st_size>100000
    for p in CONTEXT:assert p.stat().st_size>1000
    media=info(MASTER)
    assert {"video","audio"}<={s["codec_type"] for s in media["streams"]}
    assert abs(float(media["format"]["duration"])-DURATION)<.3
    assert len(SCENES)==6 and SCENES[-1][2]==84
    return item

def score(path):
    import numpy as np,soundfile as sf
    sr=32000;n=sr*DURATION;t=np.arange(n,dtype=np.float64)/sr
    audio=np.zeros(n,dtype=np.float64)
    # Purposeful slow sonorities; no fictional lab-audio recording.
    for hz,amp in ((69.30,.0028),(103.82,.0020),(138.59,.0014),(207.65,.0007)):
        env=.39+.61*np.sin(np.pi*np.minimum(1,t/21))**2
        audio+=amp*env*np.sin(2*np.pi*hz*t+.1*np.sin(2*np.pi*.13*t))
    for idx,(_,at,_) in enumerate(SCENES):
        a=int(at*sr);b=min(n,a+sr)
        u=np.arange(b-a)/sr
        audio[a:b]+=(.0034 if idx in (1,2,6) else .0019)*np.exp(-9*u)*np.sin(2*np.pi*51*u)
    fade=np.minimum(1,t/2)*np.minimum(1,(DURATION-t)/3)
    sf.write(path,np.tanh(audio*fade).astype(np.float32),sr,subtype="PCM_16")

def render():
    from PIL import Image,ImageDraw
    from playwright.sync_api import sync_playwright
    ref=validate()
    OUT.mkdir(exist_ok=True,parents=True)
    target=OUT/"zebrafish-hemodynamics.mp4"
    with tempfile.TemporaryDirectory(prefix="ruwaidix-zebrafish-v19-") as temp:
        tmp=Path(temp);picture=tmp/"video-only.mp4"
        encode=subprocess.Popen(
            ["ffmpeg","-hide_banner","-loglevel","error","-y",
            "-f","image2pipe","-framerate",str(FPS),"-vcodec","mjpeg","-i","pipe:0",
            "-c:v","libx264","-preset","fast","-crf","19","-pix_fmt","yuv420p",
            "-r",str(FPS),"-an","-movflags","+faststart",str(picture)],
            stdin=subprocess.PIPE,stderr=subprocess.PIPE)
        errors=[];samples=[]
        chapters={round((a+b)*FPS/2):k for k,(_,a,b) in enumerate(SCENES)}
        try:
            with sync_playwright() as p:
                browser=p.chromium.launch(headless=True,args=["--no-sandbox","--disable-dev-shm-usage"])
                page=browser.new_page(viewport={"width":W,"height":H},device_scale_factor=1)
                page.on("pageerror",lambda e:errors.append(str(e)))
                page.goto(HTML.resolve().as_uri(),wait_until="load")
                page.wait_for_function("window.__ready === true",timeout=30000)
                meta=page.evaluate("window.__meta")
                assert (meta["W"],meta["H"],meta["FPS"],meta["DURATION"])==(W,H,FPS,DURATION)
                images=page.evaluate("[...document.querySelectorAll('.src')].map(i=>[i.id,i.naturalWidth,i.naturalHeight])")
                assert len(images)==3 and all(x>220 and y>100 for _,x,y in images),images
                for n in range(FPS*DURATION):
                    t=n/FPS
                    page.evaluate("(t)=>window.__draw(t)",t)
                    jpg=page.screenshot(type="jpeg",quality=94)
                    encode.stdin.write(jpg)
                    if n in chapters:
                        (OUT/f"chapter-{chapters[n]+1:02d}.jpg").write_bytes(jpg)
                    if n==FPS*5:
                        Image.open(io.BytesIO(jpg)).convert("RGB").save(OUT/"zebrafish-hemodynamics.webp",quality=90,method=6)
                    if n%(FPS*6)==0:
                        samples.append((t,jpg))
                    if n>0 and n%504==0:
                        print("FILM11 FRAMES",n,"/",FPS*DURATION,flush=True)
                browser.close()
            encode.stdin.close();err=encode.stderr.read().decode("utf8","replace")
            if encode.wait():raise RuntimeError("FFmpeg picture encode failure "+err[-2300:])
            assert not errors,errors
        except BaseException:
            encode.kill();raise
        original_score=tmp/"original-score.wav";score(original_score)
        filtergraph="[1:a]aresample=48000[voice];[2:a]aresample=48000,volume=0.42[music];[voice][music]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-18:LRA=9:TP=-2,alimiter=limit=0.65:attack=5:release=90:level=false[a]"
        run("ffmpeg","-hide_banner","-loglevel","error","-y",
            "-i",picture,"-i",MASTER,"-i",original_score,
            "-filter_complex",filtergraph,"-map","0:v:0","-map","[a]",
            "-c:v","copy","-c:a","aac","-b:a","192k","-t",str(DURATION),
            "-movflags","+faststart",target)
        shutil.copyfile(CAPTIONS,OUT/"zebrafish-hemodynamics.vtt")
        sheet=Image.new("RGB",(4*480,math.ceil(len(samples)/4)*300),"#08151b")
        drawer=ImageDraw.Draw(sheet)
        for k,(t,jpg) in enumerate(samples):
            thumbnail=Image.open(io.BytesIO(jpg)).convert("RGB")
            thumbnail.thumbnail((480,270),Image.Resampling.LANCZOS)
            x=(k%4)*480;y=(k//4)*300
            sheet.paste(thumbnail,(x,y))
            drawer.text((x+10,y+278),f"{t:05.1f}s",fill="#edf2e9")
        sheet.save(OUT/"zebrafish-hemodynamics.contact.webp",quality=90,method=6)
    metadata=info(target)
    duration=float(metadata["format"]["duration"])
    assert abs(duration-DURATION)<.15
    assert {"audio","video"}<={s["codec_type"] for s in metadata["streams"]}
    assert any(s.get("codec_name")=="h264" and s.get("width")==W and s.get("height")==H for s in metadata["streams"])
    results={
      "film_index":11,"title":"A Heartbeat in High-Speed Frames",
      "edition":"V19 zebrafish high-speed imaging research cinema",
      "duration_seconds":duration,"fps":FPS,"resolution":[W,H],
      "paper":{"doi":DOI,"title":"Cardiac function and blood flow hemodynamics assessment of zebrafish (Danio rerio) using high-speed video microscopy",
       "journal":"Micron 136 (2020) 102876",
       "rights":"Publisher permissions for expanded public movie reuse of figure require independent verification."},
      "published_method":{"recording_seconds":10,"age_dpf_upper_bound_exclusive":5,
       "representative_age_dpf":3,"analysis_software":["MicroZebraLab","ImageJ"],
       "measurements_scope":["cardiac function","blood-flow hemodynamics"]},
      "original_narration":str(MASTER.relative_to(ROOT)),
      "original_captions":str(CAPTIONS.relative_to(ROOT)),
      "paper_figure":{"path":str(FIGURE.relative_to(ROOT)),
         "sha256":hashlib.sha256(FIGURE.read_bytes()).hexdigest(),
         "rendering":"Shown intact; no artificial values or modified data graphs."},
      "archival_context_images":[{"path":str(p.relative_to(ROOT)),
         "sha256":hashlib.sha256(p.read_bytes()).hexdigest(),
         "purpose":"Unassigned independent specimen context; not necessarily from analyzed 2020 recording"} for p in CONTEXT],
      "scenes":[{"title":name,"start":a,"end":b} for name,a,b in SCENES],
      "evidence_boundaries":[
        "Beating stylized heart, drifting blood cell icons, animated vessels and drawn waveforms are interpretive motion graphics, not recovered experimental moving microscopy.",
        "Original published figure is shown as an intact archive image; copyright/reproduction permission for a new film has not been established.",
        "Archived larva and embryo stills have uncertain specimen-to-paper identity and are explicitly labelled contextual.",
        "The film does not invent heart rate, cardiac output, ventricular volume, blood velocity, shear stress or measurement precision.",
        "Published protocol demonstrates laboratory methods with normal zebrafish embryos, not diagnosis of disease in humans."],
      "live_website_unchanged":True,"older_film_masters_preserved":True,
      "human_review":"Full viewing/listening, on-screen legibility, publication-figure rights and formal scientific sign-off remain outstanding.",
      "sha256":hashlib.sha256(target.read_bytes()).hexdigest()
    }
    (OUT/"zebrafish-hemodynamics.json").write_text(json.dumps(results,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print("FILM11 MASTER COMPLETE",json.dumps({"seconds":duration,"bytes":target.stat().st_size,"sha256":results["sha256"]}),flush=True)

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--validate-only",action="store_true")
    args=parser.parse_args()
    if args.validate_only:validate();print("FILM11 SOURCES PASS")
    else:render()
