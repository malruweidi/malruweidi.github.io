#!/usr/bin/env python3
"""Film 10: advancing air-liquid boundary across cultured epithelial cells.

120s/24fps/1920x1080 review master with unchanged source figures 1/5/6.
Conceptual bubble motion is not measured fluid stress or human lung data.
"""
import argparse,hashlib,io,json,math,shutil,subprocess,tempfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets/films/series-v18-flow"
HTML=OUT/"film.html"
MASTER=ROOT/"assets/films/series-v8-primary/flow-chamber-method.mp4"
CAPTIONS=ROOT/"assets/films/series-v8-primary/flow-chamber-method.vtt"
ARCHIVE_INFO=ROOT/"assets/films/series-v5/flow-chamber-method.json"
FIGURES={j:ROOT/f"assets/films/source-figures/v3/flow-chamber-method-figure-{j:02d}.jpg" for j in (1,5,6)}
W,H,FPS,DURATION=1920,1080,24,120
DOI="10.3390/mps3040065"
SCENES=[
 ("The air–liquid interface and epithelial monolayer",0,15),
 ("Real parallel-plate apparatus",15,30),
 ("Moving bubble as illustrative stress event",30,45),
 ("Fluorescent viability measurements from Figure 5",45,60),
 ("53 percent exposed death versus near-zero control, seven repetitions",60,75),
 ("Original Figure 6 F-actin and nuclei",75,90),
 ("No significant change of actin organization after a single bubble",90,105),
 ("Experiment boundary versus clinical ventilation",105,120)
]

def run(*cmd):
    q=subprocess.run([str(x) for x in cmd],capture_output=True,text=True)
    if q.returncode:raise RuntimeError(" ".join(map(str,cmd))+"\n"+q.stderr[-2300:])
    return q.stdout

def info(path):
    return json.loads(run("ffprobe","-v","error","-show_format","-show_streams","-of","json",path))

def validate():
    assert HTML.is_file() and CAPTIONS.is_file() and ARCHIVE_INFO.is_file() and MASTER.is_file()
    src=HTML.read_text(encoding="utf8")
    for key in ("window.__draw","window.__meta","window.__ready","stresser(",
                "ORIGINAL FIGURE 5","ORIGINAL FIGURE 6","~53%","0–0.2%",
                "n = 7","NO STATISTICALLY SIGNIFICANT DIFFERENCE"):
        assert key in src,key
    assert "Math.random(" not in src and "<h1 class=" in src
    assert CAPTIONS.read_text(encoding="utf8").startswith("WEBVTT")
    assert CAPTIONS.read_text(encoding="utf8").count("-->")==29
    archived=json.loads(ARCHIVE_INFO.read_text(encoding="utf8"))
    assert archived["doi"]==DOI and archived["license"].startswith("CC BY")
    for j,path in FIGURES.items():
        assert path.is_file() and path.stat().st_size>70000,path
        matching=[x for x in archived["source_figures"] if x["figure"]==j]
        assert matching and hashlib.sha256(path.read_bytes()).hexdigest()==matching[0]["sha256"],path
    video=info(MASTER)
    assert {"video","audio"}<={s["codec_type"] for s in video["streams"]}
    assert abs(float(video["format"]["duration"])-DURATION)<.3
    assert len(SCENES)==8 and SCENES[-1][2]==120
    return archived

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
    target=OUT/"flow-chamber-method.mp4"
    with tempfile.TemporaryDirectory(prefix="ruwaidix-flow-v18-") as temp:
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
                images=page.evaluate("[...document.querySelectorAll('.primary')].map(i=>[i.id,i.naturalWidth,i.naturalHeight])")
                assert len(images)==3 and all(x>350 and y>180 for _,x,y in images),images
                for n in range(FPS*DURATION):
                    t=n/FPS
                    page.evaluate("(t)=>window.__draw(t)",t)
                    jpg=page.screenshot(type="jpeg",quality=94)
                    encode.stdin.write(jpg)
                    if n in chapters:
                        (OUT/f"chapter-{chapters[n]+1:02d}.jpg").write_bytes(jpg)
                    if n==FPS*5:
                        Image.open(io.BytesIO(jpg)).convert("RGB").save(OUT/"flow-chamber-method.webp",quality=90,method=6)
                    if n%(FPS*6)==0:
                        samples.append((t,jpg))
                    if n>0 and n%720==0:
                        print("FILM10 FRAMES",n,"/",FPS*DURATION,flush=True)
                browser.close()
            encode.stdin.close();err=encode.stderr.read().decode("utf8","replace")
            if encode.wait():raise RuntimeError("FFmpeg picture encode failure "+err[-2300:])
            assert not errors,errors
        except BaseException:
            encode.kill();raise
        original_score=tmp/"original-score.wav";score(original_score)
        filtergraph="[1:a]aresample=48000[voice];[2:a]aresample=48000,volume=0.42[music];[voice][music]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-18:LRA=9:TP=-2[a]"
        run("ffmpeg","-hide_banner","-loglevel","error","-y",
            "-i",picture,"-i",MASTER,"-i",original_score,
            "-filter_complex",filtergraph,"-map","0:v:0","-map","[a]",
            "-c:v","copy","-c:a","aac","-b:a","192k","-t",str(DURATION),
            "-movflags","+faststart",target)
        shutil.copyfile(CAPTIONS,OUT/"flow-chamber-method.vtt")
        sheet=Image.new("RGB",(4*480,math.ceil(len(samples)/4)*300),"#0a1920")
        drawer=ImageDraw.Draw(sheet)
        for k,(t,jpg) in enumerate(samples):
            thumbnail=Image.open(io.BytesIO(jpg)).convert("RGB")
            thumbnail.thumbnail((480,270),Image.Resampling.LANCZOS)
            x=(k%4)*480;y=(k//4)*300
            sheet.paste(thumbnail,(x,y))
            drawer.text((x+10,y+278),f"{t:05.1f}s",fill="#edf2e9")
        sheet.save(OUT/"flow-chamber-method.contact.webp",quality=90,method=6)
    metadata=info(target)
    duration=float(metadata["format"]["duration"])
    assert abs(duration-DURATION)<.15
    assert {"audio","video"}<={s["codec_type"] for s in metadata["streams"]}
    assert any(s.get("codec_name")=="h264" and s.get("width")==W and s.get("height")==H for s in metadata["streams"])
    results={
        "film_index":10,
        "title":"How to Make a Reproducible Injury",
        "edition":"V18 advancing-air-liquid interface motion cinema",
        "duration_seconds":duration,"fps":FPS,"resolution":[W,H],
        "primary_study":{"doi":DOI,
          "title":"Application of a Flow-Induced Stress Wave and Investigation of Associated Injuries on Cell Monolayers Using a Parallel Plate Flow Chamber",
          "journal":"Methods and Protocols 2020, 3(4), 65",
          "license":"CC BY 4.0"},
        "original_narration":str(MASTER.relative_to(ROOT)),
        "original_webvtt":str(CAPTIONS.relative_to(ROOT)),
        "complete_source_figures":[
          {"figure":j,"path":str(path.relative_to(ROOT)),
            "sha256":hashlib.sha256(path.read_bytes()).hexdigest(),
            "display":"unaltered original paper raster shown in full"}
          for j,path in FIGURES.items()
        ],
        "published_results":{
          "cell_model":"149 L2 lung epithelial cell monolayer",
          "death_control_percent_range":[0,0.2],
          "death_after_bubble_percent_approx":53,
          "experimental_repetitions":7,
          "live_dead_t_test_p_less_than":0.01,
          "single_bubble_actin_organization_significant":False
        },
        "scenes":[{"name":label,"start":start,"end":end} for label,start,end in SCENES],
        "evidence_boundaries":[
          "Fluid/air interface, cell cartoons, stress-wave lines and cytoskeletal animations are conceptual editorial geometry; not measured flow, velocity, stress distribution, patient data or live experimental footage.",
          "Figure 1 actual apparatus, Figure 5 fluorescence and source bar chart, Figure 6 F-actin/blue nuclei are the unaltered primary figures, with verified source SHA values.",
          "Reported 53 percent exposed-group death versus 0 to 0.2 percent control and seven experiment repeats are source values; they do not generalize directly to in-vivo lungs.",
          "Single-bubble actin reorganization did not achieve significance, even if examples look visually different.",
          "In-vitro epithelial cell model is not clinical ventilation outcome; no human safety, treatment, or unmeasured mechanical stress is inferred."
        ],
        "earlier_versions_preserved":True,"live_website_unchanged":True,
        "human_approval":"Full audiovisual, microscopy legibility, source attribution and interpretive science screening pending; draft only.",
        "sha256":hashlib.sha256(target.read_bytes()).hexdigest()
    }
    (OUT/"flow-chamber-method.json").write_text(json.dumps(results,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print("FILM10 MASTER COMPLETE",json.dumps({"seconds":duration,"bytes":target.stat().st_size,"sha256":results["sha256"]}),flush=True)

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--validate-only",action="store_true")
    args=parser.parse_args()
    if args.validate_only:validate();print("FILM10 SOURCES PASS")
    else:render()
