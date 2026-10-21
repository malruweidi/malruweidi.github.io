#!/usr/bin/env python3
"""Film 14: 2022 Part-II GI immune-diagnosis chapter as motion-led evidence cinema.
No generated endoscopy/histology or serologic values are presented as clinical
observations. This is a 2022 historical review, not contemporary care guidance.
Original 84-second narration and 12 subtitle cues are preserved unchanged.
"""
import argparse,hashlib,io,json,math,shutil,subprocess,tempfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets/films/series-v22-gi2"
HTML=OUT/"film.html"
MASTER=ROOT/"assets/films/series-v7-pilots/gi-autoimmunity-2.mp4"
CAPTIONS=ROOT/"assets/films/series-v7-pilots/gi-autoimmunity-2.vtt"
CATALOG=ROOT/"assets/films/publication-series.json"
CONTEXT=[ROOT/"assets/research-archive-2026/biological-safety-cabinet-workspace.webp",
         ROOT/"assets/owner-archive-2026-10-16/cell-culture-flask-archive.webp",
         ROOT/"assets/research-archive-2026/molecular-biology-pipette-workbench.webp"]
W,H,FPS,DURATION=1920,1080,24,84
DOI="10.5772/intechopen.106185"
SCENES=[
 ("Symptoms overlap across immune, inflammatory, infectious and functional disease",0,14),
 ("Serological markers, endoscopic appearances and context-dependent pathology",14,28),
 ("Emerging AI-assisted GI interpretation, limitations and source lab archive",28,42),
 ("Condition-specific diet, inflammation management and structural interventions",42,56),
 ("Sensitivity, specificity, generalizability and real-world clinical proof",56,70),
 ("Evidence snapshot from 2022, no medication recommendations",70,84)
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
                "microscopy(","endoscopic(","antibody(","pathNodes(",
                "One symptom.","Many possible causes.","Choose evidence. Interpret limits.",
                "SEROLOGY","ENDOSCOPY","TISSUE CONTEXT","A new tool still needs proof.",
                "CELIAC","GLUTEN-FREE DIET","EoE","ACHALASIA",
                "Not a prescription.","SIMULATED VISUALS · NOT ENDOSCOPY, BIOPSY OR LAB RESULTS"):
        assert key in markup,key
    assert "Math.random(" not in markup
    assert '<h1 class="sr">' in markup
    captions=CAPTIONS.read_text(encoding="utf8")
    assert captions.startswith("WEBVTT") and captions.count("-->")==12
    listing=json.loads(CATALOG.read_text(encoding="utf8"))
    item=next(x for x in listing["items"] if x["id"]=="gi-autoimmunity-2")
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
    target=OUT/"gi-autoimmunity-2.mp4"
    with tempfile.TemporaryDirectory(prefix="ruwaidix-gi-v22-") as temp:
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
                assert len(images)==3 and all(x>220 and y>100 for _,x,y in images),images
                for n in range(FPS*DURATION):
                    t=n/FPS
                    page.evaluate("(t)=>window.__draw(t)",t)
                    jpg=page.screenshot(type="jpeg",quality=94)
                    encode.stdin.write(jpg)
                    if n in chapters:
                        (OUT/f"chapter-{chapters[n]+1:02d}.jpg").write_bytes(jpg)
                    if n==FPS*5:
                        Image.open(io.BytesIO(jpg)).convert("RGB").save(OUT/"gi-autoimmunity-2.webp",quality=90,method=6)
                    if n%(FPS*6)==0:
                        samples.append((t,jpg))
                    if n>0 and n%504==0:
                        print("FILM14 FRAMES",n,"/",FPS*DURATION,flush=True)
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
        shutil.copyfile(CAPTIONS,OUT/"gi-autoimmunity-2.vtt")
        sheet=Image.new("RGB",(4*480,math.ceil(len(samples)/4)*300),"#0b1925")
        drawer=ImageDraw.Draw(sheet)
        for k,(t,jpg) in enumerate(samples):
            thumbnail=Image.open(io.BytesIO(jpg)).convert("RGB")
            thumbnail.thumbnail((480,270),Image.Resampling.LANCZOS)
            x=(k%4)*480;y=(k//4)*300
            sheet.paste(thumbnail,(x,y))
            drawer.text((x+10,y+278),f"{t:05.1f}s",fill="#edf2e9")
        sheet.save(OUT/"gi-autoimmunity-2.contact.webp",quality=90,method=6)
    metadata=info(target)
    duration=float(metadata["format"]["duration"])
    assert abs(duration-DURATION)<.15
    assert {"audio","video"}<={s["codec_type"] for s in metadata["streams"]}
    assert any(s.get("codec_name")=="h264" and s.get("width")==W and s.get("height")==H for s in metadata["streams"])
    results={
      "film_index":14,"title":"The Diagnostic Problem",
      "edition":"V22 cinematic differential diagnosis and interpretation research film",
      "duration_seconds":duration,"fps":FPS,"resolution":[W,H],
      "source":{
         "doi":DOI,
         "title":"Autoimmune Diseases of the GI Tract Part II: Emergence of Diagnostic Tools and Treatments",
         "authors":["Mahmoud Khatib A.A. Al-Ruweidi","Nada Khater","Haya Rashid Alkaabi","Maram Hasan","Mohammed Murtaza","Huseyin C. Yalcin"],
         "publisher":"IntechOpen","published":"2022-11-29",
         "chapter_url":"https://www.intechopen.com/chapters/84957",
         "license":"Creative Commons Attribution 3.0, with credit",
         "scope":"2022 narrative review of autoantibody markers, emerging AI-assisted GI diagnosis, nutritional implications and condition-specific treatments"
      },
      "original_narration":str(MASTER.relative_to(ROOT)),
      "original_webvtt":str(CAPTIONS.relative_to(ROOT)),
      "archival_images":[{"path":str(p.relative_to(ROOT)),
        "sha256":hashlib.sha256(p.read_bytes()).hexdigest(),
        "role":"Genuine contextual laboratory photograph; NOT a GI biopsy, endoscopic image, serum biomarker, patient or AI training set"}
        for p in CONTEXT],
      "selected_evidence":[
        {"topic":"autoantibodies","limit":"Anti-parietal-cell, anti-intrinsic-factor and tissue-transglutaminase antibodies can be context-specific indicators; serology is not sufficient for every GI condition or every patient"},
        {"topic":"endoscopy_and_tissue","limit":"Illustrations are non-diagnostic; site, test quality, symptoms and histologic context determine interpretation"},
        {"topic":"artificial_intelligence","limit":"2022 narrative overview of ML potential; the animation is not a validated trained model, actual heatmap or patient prediction"},
        {"topic":"diet_and_treatment","limit":"Food avoidance, nutritional monitoring, anti-inflammatory drugs and structural interventions serve different disease mechanisms; film is not a prescription"},
        {"topic":"current_evidence","limit":"Historic 2022 chapter may be superseded; current 2026 clinical guidance and specialist review are necessary"}
      ],
      "scenes":[{"name":name,"start":start,"end":end} for name,start,end in SCENES],
      "scientific_limits":[
        "Animated antibodies, lumen rings, tissue-like fields, image-features and model nodes are illustrative and are not clinical assay readouts, microscope slides, biopsies or patient endoscopy.",
        "The animation does not assign any diagnosis to an individual, nor invent test sensitivity, specificity, prevalence, patient records, immune-cell measures or treatment efficacy.",
        "Eosinophilic esophagitis is type-2 immune-mediated, and IBD is immune-mediated; these labels are not flattened into a single classical autoimmune mechanism.",
        "Treatment choices remain indication-specific, and the 2022 review is not a current recommendation to begin, switch or cease any medication or restricted diet.",
        "No authored illustrative network or particle track is a model-validated clinical result."
      ],
      "prior_versions_preserved":True,"live_site_unchanged":True,
      "human_review":"Pending full-length listening and viewing, specialist scientific sign-off, readable text at mobile size and image rights review",
      "sha256":hashlib.sha256(target.read_bytes()).hexdigest()
    }
    (OUT/"gi-autoimmunity-2.json").write_text(json.dumps(results,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print("FILM14 MASTER COMPLETE",json.dumps({"seconds":duration,"bytes":target.stat().st_size,"sha256":results["sha256"]}),flush=True)

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--validate-only",action="store_true")
    args=parser.parse_args()
    if args.validate_only:validate();print("FILM14 SOURCES PASS")
    else:render()
