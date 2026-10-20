#!/usr/bin/env python3
"""Film 09: continuously animated, scientifically sourced electrospun-PLA documentary.

120s/24fps/1920x1080 review master. Uses CC BY archival SEM Figure 5 intact;
AFM/FTIR are honestly labeled stills extracted from the pre-existing V5 film,
not invented measurements, not pristine publisher image files. No clinical claim.
"""
import argparse,hashlib,io,json,math,shutil,subprocess,tempfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets/films/series-v17-scaffolds"
HTML=OUT/"film.html"
MASTER=ROOT/"assets/films/series-v8-primary/pla-scaffolds.mp4"
CAPTIONS=ROOT/"assets/films/series-v8-primary/pla-scaffolds.vtt"
ARCHIVE=ROOT/"assets/films/series-v5/pla-scaffolds.mp4"
ARCHIVE_INFO=ROOT/"assets/films/series-v5/pla-scaffolds.json"
SEM=ROOT/"assets/films/source-figures/v4/pla-scaffolds/pla-scaffolds-figure-05.jpg"
AFM=OUT/"source-afm-from-v5.jpg"
FTIR=OUT/"source-ftir-from-v5.jpg"
W,H,FPS,DURATION=1920,1080,24,120
DOI="10.1016/j.surfcoat.2020.126216"
SCENES=[
 ("An interface in a fibrous scaffold",0,15),
 ("Electrospinning: a charged polymer jet and collector",15,30),
 ("30-second RF plasma pretreatment",30,45),
 ("Four original SEM conditions",45,60),
 ("AFM surface characterization",60,75),
 ("FTIR-ATR comparative spectra",75,90),
 ("Table 3: ordinal antimicrobial growth scores",90,105),
 ("Limits of in-vitro antimicrobial evidence",105,120)
]

def run(*cmd):
    q=subprocess.run([str(x) for x in cmd],capture_output=True,text=True)
    if q.returncode:raise RuntimeError(" ".join(map(str,cmd))+"\n"+q.stderr[-2300:])
    return q.stdout

def info(path):
    return json.loads(run("ffprobe","-v","error","-show_format","-show_streams","-of","json",path))

def prepare():
    OUT.mkdir(parents=True,exist_ok=True)
    assert ARCHIVE.is_file() and MASTER.is_file(), "Original videos are required; no fake archival sources."
    for destination,stamp in ((AFM,67.2),(FTIR,82.3)):
        if not destination.is_file():
            run("ffmpeg","-hide_banner","-loglevel","error","-y",
                "-ss",str(stamp),"-i",ARCHIVE,"-frames:v","1",
                "-q:v","2",str(destination))
        assert destination.stat().st_size>9000,destination
    print("FILM09 SOURCE FRAMES PREPARED: V5 archival AFM @67.2s, FTIR @82.3s",flush=True)

def validate():
    prepare()
    assert HTML.is_file() and CAPTIONS.is_file() and ARCHIVE_INFO.is_file() and SEM.is_file()
    src=HTML.read_text(encoding="utf8")
    for key in ("window.__draw","window.__meta","window.__ready","fibermat(",
                "schematic","PUBLISHED FIGURE 5","S. AUREUS","E. COLI",
                "30 s was selected","SOURCE TABLE 3","0 = NO GROWTH"):
        assert key in src,key
    assert "Math.random(" not in src and "<h1 class=" in src
    vtt=CAPTIONS.read_text(encoding="utf8")
    assert vtt.startswith("WEBVTT") and vtt.count("-->")>=30
    archived=json.loads(ARCHIVE_INFO.read_text(encoding="utf8"))
    assert archived["doi"]==DOI and archived["license"].startswith("CC BY")
    item=[x for x in archived["source_figures"] if x["figure"]==5]
    assert item and hashlib.sha256(SEM.read_bytes()).hexdigest()==item[0]["sha256"]
    for p in (MASTER,ARCHIVE):
        video=info(p)
        assert {"video","audio"}<={s["codec_type"] for s in video["streams"]}
        assert abs(float(video["format"]["duration"])-120)<.3
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
    target=OUT/"pla-scaffolds.mp4"
    with tempfile.TemporaryDirectory(prefix="ruwaidix-scaffolds-v17-") as temp:
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
                assert len(images)==3 and all(x>350 and y>180 for _,x,y in images),images
                for n in range(FPS*DURATION):
                    t=n/FPS
                    page.evaluate("(t)=>window.__draw(t)",t)
                    jpg=page.screenshot(type="jpeg",quality=94)
                    encode.stdin.write(jpg)
                    if n in chapters:
                        (OUT/f"chapter-{chapters[n]+1:02d}.jpg").write_bytes(jpg)
                    if n==FPS*5:
                        Image.open(io.BytesIO(jpg)).convert("RGB").save(OUT/"pla-scaffolds.webp",quality=90,method=6)
                    if n%(FPS*6)==0:
                        samples.append((t,jpg))
                    if n>0 and n%720==0:
                        print("FILM09 FRAMES",n,"/",FPS*DURATION,flush=True)
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
        shutil.copyfile(CAPTIONS,OUT/"pla-scaffolds.vtt")
        sheet=Image.new("RGB",(4*480,math.ceil(len(samples)/4)*300),"#09171b")
        drawer=ImageDraw.Draw(sheet)
        for k,(t,jpg) in enumerate(samples):
            thumbnail=Image.open(io.BytesIO(jpg)).convert("RGB")
            thumbnail.thumbnail((480,270),Image.Resampling.LANCZOS)
            x=(k%4)*480;y=(k//4)*300
            sheet.paste(thumbnail,(x,y))
            drawer.text((x+10,y+278),f"{t:05.1f}s",fill="#edf2e9")
        sheet.save(OUT/"pla-scaffolds.contact.webp",quality=90,method=6)
    metadata=info(target)
    duration=float(metadata["format"]["duration"])
    assert abs(duration-DURATION)<.15
    assert {"audio","video"}<={s["codec_type"] for s in metadata["streams"]}
    assert any(s.get("codec_name")=="h264" and s.get("width")==W and s.get("height")==H for s in metadata["streams"])
    results={
        "film_index":9,"title":"A Scaffold Meets Its Environment",
        "edition":"V17 electrospun fiber-world research cinema",
        "duration_seconds":duration,"fps":FPS,"resolution":[W,H],
        "primary_study":{"doi":DOI,"title":"Antimicrobial modification of PLA scaffolds with ascorbic and fumaric acids via plasma treatment",
          "venue":"Surface and Coatings Technology, volume 400, 126216 (2020)",
          "license":"CC BY 4.0","scope":"Electrospun PLA mat characterization and in vitro bacterial growth"},
        "original_narration":str(MASTER.relative_to(ROOT)),
        "original_webvtt":str(CAPTIONS.relative_to(ROOT)),
        "original_SEM":{"path":str(SEM.relative_to(ROOT)),
          "source_figure":5,"sha256":hashlib.sha256(SEM.read_bytes()).hexdigest(),
          "display":"complete four-panel source with original 3 µm bars"},
        "additional_source_frames":[
          {"path":str(AFM.relative_to(ROOT)),"from_archived_film":str(ARCHIVE.relative_to(ROOT)),
            "at_second":67.2,"role":"archived screenshot of research AFM figure; not direct original pixel master",
            "sha256":hashlib.sha256(AFM.read_bytes()).hexdigest()},
          {"path":str(FTIR.relative_to(ROOT)),"from_archived_film":str(ARCHIVE.relative_to(ROOT)),
            "at_second":82.3,"role":"archived screenshot of FTIR figure; not direct original pixel master",
            "sha256":hashlib.sha256(FTIR.read_bytes()).hexdigest()}
        ],
        "published_laboratory_results":{"plasma_pretreatment_seconds":30,
           "tested_organisms":["Staphylococcus aureus","Escherichia coli"],
           "ordinal_colony_score_scale":"0 no growth, 5 overgrown; not colony-forming-unit counts",
           "table_3_scores":{"untreated":{"S_aureus":["5","5","4–5"],"E_coli":["5","5","5"]},
             "plasma_only":{"S_aureus":["0","0","0–1"],"E_coli":["3–4","3","3"]},
             "ascorbic_acid_grafted":{"S_aureus":["0","0","0"],"E_coli":["0","0","0"]},
             "fumaric_acid_grafted":{"S_aureus":["0","0","0"],"E_coli":["0","0","0"]}}},
        "scenes":[{"title":s,"start":a,"end":b} for s,a,b in SCENES],
        "evidence_boundaries":[
          "Electrospinning jet, cylindrical collector, material fiber layers, plasma reactive centers, graft icons and bacterial particles are interpretive animation, not source experiment video.",
          "SEM is an original published research figure and preserved in full with its four condition labels and three-micrometre scale bars.",
          "AFM and FTIR footage consists of extracts from the earlier source-based V5 film, with that lower-fidelity reuse declared explicitly.",
          "The original Table 3 plate-growth scores are ordinal, not colony-forming units, infection rates, or implant efficacy.",
          "The in-vitro antimicrobial findings do not demonstrate long-term implantation safety or efficacy. Distinct 2021 PLA packaging study is not conflated."],
        "earlier_versions_preserved":True,"live_website_unchanged":True,
        "human_approval":"Not completed: must review the whole audiovisual master, original chart legibility, source attribution and artistic finish.",
        "sha256":hashlib.sha256(target.read_bytes()).hexdigest()
    }
    (OUT/"pla-scaffolds.json").write_text(json.dumps(results,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print("FILM09 MASTER COMPLETE",json.dumps({"seconds":duration,"bytes":target.stat().st_size,"sha256":results["sha256"]}),flush=True)

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--prepare",action="store_true")
    parser.add_argument("--validate-only",action="store_true")
    args=parser.parse_args()
    if args.prepare:prepare()
    elif args.validate_only:validate();print("FILM09 SOURCES PASS")
    else:render()
