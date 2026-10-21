#!/usr/bin/env python3
"""Film 12: observational ACE2/angiotensin-II research cinema.
84s/24fps/1920x1080, using original 2022 narration and 12 subtitle cues.
All molecule paths and group layouts are conceptual; we do not show participants
or generate patient data. Avoid conflating cross-sectional associations with
antihypertensive effects or medication advice.
"""
import argparse,hashlib,io,json,math,shutil,subprocess,tempfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets/films/series-v20-ace2"
HTML=OUT/"film.html"
MASTER=ROOT/"assets/films/series-v7-pilots/ace2-covid-drugs.mp4"
CAPTIONS=ROOT/"assets/films/series-v7-pilots/ace2-covid-drugs.vtt"
CATALOG=ROOT/"assets/films/publication-series.json"
CONTEXT=[ROOT/"assets/evidence-pulmonary.webp",
         ROOT/"assets/research-archive-2026/echocardiography-spectral-doppler-workstation.webp"]
W,H,FPS,DURATION=1920,1080,24,84
DOI="10.1080/08037051.2022.2055530"
SCENES=[
 ("The clinical question behind COVID-19 and hypertension",0,14),
 ("Membrane and soluble ACE2, angiotensin II signaling",14,28),
 ("Nonrandomized medication groups and missing drug classification",28,42),
 ("Study-reported relative differences by disease severity",42,56),
 ("Confounding and cross-sectional limitations",56,70),
 ("Evidence and safety before treatment advice",70,84)
]

def run(*cmd):
    q=subprocess.run([str(x) for x in cmd],capture_output=True,text=True)
    if q.returncode:raise RuntimeError(" ".join(map(str,cmd))+"\n"+q.stderr[-2300:])
    return q.stdout

def info(path):
    return json.loads(run("ffprobe","-v","error","-show_format","-show_streams","-of","json",path))

def validate():
    assert HTML.is_file() and MASTER.is_file() and CAPTIONS.is_file() and CATALOG.is_file()
    assert all(p.is_file() and p.stat().st_size>1000 for p in CONTEXT)
    markup=HTML.read_text(encoding="utf8")
    for key in ("window.__draw","window.__ready","window.__meta",
                "enzyme(","membrane(","person(","200 ADMITTED",
                "NOT RECORDED","≈1.9×","≈1.2×","r = 0.30",
                "OBSERVATIONAL · CROSS-SECTIONAL","Never stop medicines from this film"):
        assert key in markup,key
    assert "Math.random(" not in markup
    captions=CAPTIONS.read_text(encoding="utf8")
    assert captions.startswith("WEBVTT") and captions.count("-->")==12
    listing=json.loads(CATALOG.read_text(encoding="utf8"))
    item=next(x for x in listing["items"] if x["id"]=="ace2-covid-drugs")
    assert item["doi"]==DOI and item["duration_seconds"]==DURATION
    media=info(MASTER)
    assert {"video","audio"}<={stream["codec_type"] for stream in media["streams"]}
    assert abs(float(media["format"]["duration"])-DURATION)<.3
    assert len(SCENES)==6 and SCENES[-1][2]==84
    return item

def score(path):
    import numpy as np,soundfile as sf
    sr=32000;n=sr*DURATION;t=np.arange(n,dtype=np.float64)/sr
    audio=np.zeros(n,dtype=np.float64)
    # Purposeful slow sonorities; no fictional lab-audio recording.
    for hz,amp in ((82.41,.0025),(123.47,.0019),(164.81,.0013),(247,.0007)):
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
    target=OUT/"ace2-covid-drugs.mp4"
    with tempfile.TemporaryDirectory(prefix="ruwaidix-ace2-v20-") as temp:
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
                assert len(images)==2 and all(x>220 and y>100 for _,x,y in images),images
                for n in range(FPS*DURATION):
                    t=n/FPS
                    page.evaluate("(t)=>window.__draw(t)",t)
                    jpg=page.screenshot(type="jpeg",quality=94)
                    encode.stdin.write(jpg)
                    if n in chapters:
                        (OUT/f"chapter-{chapters[n]+1:02d}.jpg").write_bytes(jpg)
                    if n==FPS*5:
                        Image.open(io.BytesIO(jpg)).convert("RGB").save(OUT/"ace2-covid-drugs.webp",quality=90,method=6)
                    if n%(FPS*6)==0:
                        samples.append((t,jpg))
                    if n>0 and n%504==0:
                        print("FILM12 FRAMES",n,"/",FPS*DURATION,flush=True)
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
        shutil.copyfile(CAPTIONS,OUT/"ace2-covid-drugs.vtt")
        sheet=Image.new("RGB",(4*480,math.ceil(len(samples)/4)*300),"#0c1822")
        drawer=ImageDraw.Draw(sheet)
        for k,(t,jpg) in enumerate(samples):
            thumbnail=Image.open(io.BytesIO(jpg)).convert("RGB")
            thumbnail.thumbnail((480,270),Image.Resampling.LANCZOS)
            x=(k%4)*480;y=(k//4)*300
            sheet.paste(thumbnail,(x,y))
            drawer.text((x+10,y+278),f"{t:05.1f}s",fill="#edf2e9")
        sheet.save(OUT/"ace2-covid-drugs.contact.webp",quality=90,method=6)
    metadata=info(target)
    duration=float(metadata["format"]["duration"])
    assert abs(duration-DURATION)<.15
    assert {"audio","video"}<={s["codec_type"] for s in metadata["streams"]}
    assert any(s.get("codec_name")=="h264" and s.get("width")==W and s.get("height")==H for s in metadata["streams"])
    results={
      "film_index":12,"title":"An Enzyme, a Receptor, a Clinical Question",
      "edition":"V20 causal-caution molecular/clinical documentary",
      "duration_seconds":duration,"fps":FPS,"resolution":[W,H],
      "paper":{
         "doi":DOI,"title":"Soluble ACE2 and angiotensin II levels are modulated in hypertensive COVID-19 patients treated with different antihypertension drugs",
         "journal":"Blood Pressure 31 (2022) 80–90",
         "type":"Multicenter cross-sectional observational study, not a randomized experiment",
         "source":"https://doi.org/10.1080/08037051.2022.2055530"
      },
      "source_narration":str(MASTER.relative_to(ROOT)),
      "source_captions":str(CAPTIONS.relative_to(ROOT)),
      "published_numbers":{
        "total_participants":200,
        "cohorts":{"ACEi":57,"ARB":68,"beta_blocker":15,"calcium_channel_blocker":30,
            "unknown_medication_class":30},
        "biomarker_assay":"Commercial ELISA for soluble ACE2 and angiotensin II",
        "soluble_ACE2_severe_vs_mild_fold_approx":1.9,
        "angiotensin_II_mild_vs_severe_fold_approx":1.2,
        "ACE2_hospital_stay_correlation_r":0.3,
        "ACE2_hospital_stay_correlation_p":0.003
      },
      "data_quality_note":"Publication reports severity category counts whose sum differs from the 200 enrolled participants; this film deliberately does not plot that unresolved breakdown.",
      "contextual_images":[{"file":str(p.relative_to(ROOT)),"sha256":hashlib.sha256(p.read_bytes()).hexdigest(),
         "role":"contextual graphic or healthcare workstation photograph, not the clinical cohort and not an ELISA output"} for p in CONTEXT],
      "scenes":[{"name":name,"start":a,"end":b} for name,a,b in SCENES],
      "limitations":[
         "Cell membrane, enzyme conformation, protein transport and AngII conversion are artistic explanatory depictions, not structure models or patient-level mechanisms.",
         "Five groups represent recorded antihypertensive medication categories and the 30 missing classifications; no random treatment allocation is claimed.",
         "Study-reported biomarker ratios and correlation are labeled; no fabricated raw concentration data, confidence intervals or patient profiles are graphed.",
         "Medication class, disease severity and outcomes are confounded in cross-sectional observational comparisons. Beta blocker n=15 is a small subgroup.",
         "The film is not a drug recommendation: patients should not stop or change ACEi, ARB, beta blockers or CCB on the basis of this study."
      ],
      "live_website_unchanged":True,"older_film_masters_preserved":True,
      "human_review":"Full viewing/listening and medical/scholarly review pending; no clinical or release approval claimed.",
      "sha256":hashlib.sha256(target.read_bytes()).hexdigest()
    }
    (OUT/"ace2-covid-drugs.json").write_text(json.dumps(results,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print("FILM12 MASTER COMPLETE",json.dumps({"seconds":duration,"bytes":target.stat().st_size,"sha256":results["sha256"]}),flush=True)

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--validate-only",action="store_true")
    args=parser.parse_args()
    if args.validate_only:validate();print("FILM12 SOURCES PASS")
    else:render()
