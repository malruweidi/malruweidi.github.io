#!/usr/bin/env python3
"""Film 14: 2022 Part-II GI immune-diagnosis chapter as motion-led evidence cinema.
No generated endoscopy/histology or serologic values are presented as clinical
observations. This is a 2022 historical review, not contemporary care guidance.
Original 84-second narration and 12 subtitle cues are preserved unchanged.
"""
import argparse,hashlib,io,json,math,shutil,subprocess,tempfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets/films/series-v23-heart"
HTML=OUT/"film.html"
MASTER=ROOT/"assets/films/series-v7-pilots/heart-failure-sensors.mp4"
CAPTIONS=ROOT/"assets/films/series-v7-pilots/heart-failure-sensors.vtt"
CATALOG=ROOT/"assets/films/publication-series.json"
CONTEXT=[]
W,H,FPS,DURATION=1920,1080,24,84
DOI="10.1002/9781119813040.ch5"
SCENES=[("Physiological warning signals",0,14),("Non-invasive sensing modalities",14,28),("Pressure ultrasound and Doppler",28,42),("Noise and motion artifact",42,56),("Validation and clinical utility",56,70),("The 2022 Wiley chapter and scope",70,84)]

def run(*cmd):
    q=subprocess.run([str(x) for x in cmd],capture_output=True,text=True)
    if q.returncode:raise RuntimeError(" ".join(map(str,cmd))+"\n"+q.stderr[-2300:])
    return q.stdout

def info(path):
    return json.loads(run("ffprobe","-v","error","-show_format","-show_streams","-of","json",path))

def validate():
    assert HTML.is_file() and MASTER.is_file() and CAPTIONS.is_file() and CATALOG.is_file()
    markup=HTML.read_text(encoding="utf8")
    for key in ("window.__draw","window.__ready","window.__meta","heart(","waveform(","scene0(","scene5(","A signal can mislead","The validation question","ILLUSTRATIVE PHYSIOLOGY — NOT PATIENT DATA"):
        assert key in markup,key
    assert "Math.random(" not in markup
    captions=CAPTIONS.read_text(encoding="utf8")
    assert captions.startswith("WEBVTT") and captions.count("-->")==12
    listing=json.loads(CATALOG.read_text(encoding="utf8"))
    item=next(x for x in listing["items"] if x["id"]=="heart-failure-sensors")
    assert item["doi"]==DOI and item["duration_seconds"]==DURATION
    media=info(MASTER)
    assert {"video","audio"}<={stream["codec_type"] for stream in media["streams"]}
    assert abs(float(media["format"]["duration"])-DURATION)<.3
    return item

def score(path):
    import numpy as np,soundfile as sf
    sr=32000;n=sr*DURATION;t=np.arange(n,dtype=np.float64)/sr
    audio=np.zeros(n,dtype=np.float64)
    # Purposeful slow sonorities; no fictional lab-audio recording.
    for hz,amp in ((82.41,.0026),(123.47,.0019),(164.81,.0013),(246.94,.0007)):
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
    target=OUT/"heart-failure-sensors.mp4"
    with tempfile.TemporaryDirectory(prefix="ruwaidix-heart-v23-") as temp:
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
                images=page.evaluate("[...document.querySelectorAll('.archive')].map(i=>[i.id,i.naturalWidth,i.naturalHeight])")
                assert len(images)==0 and all(x>220 and y>100 for _,x,y in images),images
                for n in range(FPS*DURATION):
                    t=n/FPS
                    page.evaluate("(t)=>window.__draw(t)",t)
                    jpg=page.screenshot(type="jpeg",quality=94)
                    encode.stdin.write(jpg)
                    if n in chapters:
                        (OUT/f"chapter-{chapters[n]+1:02d}.jpg").write_bytes(jpg)
                    if n==FPS*5:
                        Image.open(io.BytesIO(jpg)).convert("RGB").save(OUT/"heart-failure-sensors.webp",quality=90,method=6)
                    if n%(FPS*6)==0:
                        samples.append((t,jpg))
                    if n>0 and n%504==0:
                        print("FILM15 FRAMES",n,"/",FPS*DURATION,flush=True)
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
        shutil.copyfile(CAPTIONS,OUT/"heart-failure-sensors.vtt")
        sheet=Image.new("RGB",(4*480,math.ceil(len(samples)/4)*300),"#0b1925")
        drawer=ImageDraw.Draw(sheet)
        for k,(t,jpg) in enumerate(samples):
            thumbnail=Image.open(io.BytesIO(jpg)).convert("RGB")
            thumbnail.thumbnail((480,270),Image.Resampling.LANCZOS)
            x=(k%4)*480;y=(k//4)*300
            sheet.paste(thumbnail,(x,y))
            drawer.text((x+10,y+278),f"{t:05.1f}s",fill="#edf2e9")
        sheet.save(OUT/"heart-failure-sensors.contact.webp",quality=90,method=6)
    metadata=info(target)
    duration=float(metadata["format"]["duration"])
    assert abs(duration-DURATION)<.15
    assert {"audio","video"}<={s["codec_type"] for s in metadata["streams"]}
    assert any(s.get("codec_name")=="h264" and s.get("width")==W and s.get("height")==H for s in metadata["streams"])
    results={"film_index":15,"title":"Listening for a Failing Heart","edition":"V23 original kinetic cardiac sensing research documentary","duration_seconds":duration,"fps":FPS,"resolution":[W,H],
"source":{"doi":DOI,"title":"Minimally Invasive and Non-Invasive Sensor Technologies for Predicting Heart Failure: An Overview","authors":["Huseyin Enes Salman","Mahmoud Khatib A. A. Al-Ruweidi","Hassen M. Ouakad","Huseyin Cagatay Yalcin"],"publisher":"Wiley","year":2022,"chapter_url":"https://onlinelibrary.wiley.com/doi/10.1002/9781119813040.ch5","scope":"2022 narrative review, not a patient study or current clinical guideline"},
"original_narration":str(MASTER.relative_to(ROOT)),"original_webvtt":str(CAPTIONS.relative_to(ROOT)),
"archival_images":[],"scenes":[{"name":name,"start":a,"end":b} for name,a,b in SCENES],
"scientific_limits":["All heart, ECG, pressure, Doppler, impedance and ultrasound imagery is procedural art, not patient data.","Sensor accuracy is not clinical outcome improvement.","Do not infer heart failure diagnosis from any single animated trace.","No publisher-owned figures are reproduced."],
"prior_versions_preserved":True,"live_site_unchanged":True,"human_review":"Pending audiovisual, mobile accessibility, specialist and rights signoff","sha256":hashlib.sha256(target.read_bytes()).hexdigest()}
    (OUT/"heart-failure-sensors.json").write_text(json.dumps(results,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print("FILM15 MASTER COMPLETE",json.dumps({"seconds":duration,"bytes":target.stat().st_size,"sha256":results["sha256"]}),flush=True)

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--validate-only",action="store_true")
    args=parser.parse_args()
    if args.validate_only:validate();print("FILM15 SOURCES PASS")
    else:render()
