#!/usr/bin/env python3
"""Film 13: original 2022 GI autoimmunity chapter as cinematic mucosal biology.
All illustrations of epithelial, luminal, neuronal and immune cells are
deliberately non-patient procedural art, not biopsy slides or measured events.
Preserves the previously archived 84-second narration with 12 WebVTT cues.
"""
import argparse,hashlib,io,json,math,shutil,subprocess,tempfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets/films/series-v21-gi1"
HTML=OUT/"film.html"
MASTER=ROOT/"assets/films/series-v7-pilots/gi-autoimmunity-1.mp4"
CAPTIONS=ROOT/"assets/films/series-v7-pilots/gi-autoimmunity-1.vtt"
CATALOG=ROOT/"assets/films/publication-series.json"
CONTEXT=[ROOT/"assets/research-archive-2026/molecular-biology-pipette-workbench.webp",
         ROOT/"assets/owner-archive-2026-10-16/cell-culture-flask-archive.webp"]
W,H,FPS,DURATION=1920,1080,24,84
DOI="10.5772/intechopen.106184"
SCENES=[
 ("Intestinal barrier and nonquantitative epithelial movement",0,14),
 ("Immune tolerance, luminal antigen handling and barrier communication",14,28),
 ("Five categories of GI disease with distinct immune mechanisms",28,42),
 ("Archival laboratory context and non-diagnostic tissue illustration",42,56),
 ("Multifactorial pathogenesis and limits of mechanistic inference",56,70),
 ("Gut-brain as one hypothesis in a broader evidence-led overview",70,84)
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
                "epithelium(","dendritic(","microbe(","immuneFlow(",
                "Different mechanisms.","Achalasia","Autoimmune gastritis",
                "Celiac disease","Eosinophilic esophagitis",
                "Inflammatory bowel disease","ILLUSTRATIVE FIELD · NOT HISTOLOGY",
                "Barrier permeability is not sufficient evidence of autoimmunity.",
                "MECHANISM IS NOT PROOF" if False else "Mechanism is not proof."):
        assert key in markup,key
    assert "Math.random(" not in markup
    captions=CAPTIONS.read_text(encoding="utf8")
    assert captions.startswith("WEBVTT") and captions.count("-->")==12
    listing=json.loads(CATALOG.read_text(encoding="utf8"))
    item=next(x for x in listing["items"] if x["id"]=="gi-autoimmunity-1")
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
    for hz,amp in ((73.4,.0024),(110.0,.0021),(146.8,.0014),(220.0,.0006)):
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
    target=OUT/"gi-autoimmunity-1.mp4"
    with tempfile.TemporaryDirectory(prefix="ruwaidix-gi-v21-") as temp:
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
                        Image.open(io.BytesIO(jpg)).convert("RGB").save(OUT/"gi-autoimmunity-1.webp",quality=90,method=6)
                    if n%(FPS*6)==0:
                        samples.append((t,jpg))
                    if n>0 and n%504==0:
                        print("FILM13 FRAMES",n,"/",FPS*DURATION,flush=True)
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
        shutil.copyfile(CAPTIONS,OUT/"gi-autoimmunity-1.vtt")
        sheet=Image.new("RGB",(4*480,math.ceil(len(samples)/4)*300),"#0d1b22")
        drawer=ImageDraw.Draw(sheet)
        for k,(t,jpg) in enumerate(samples):
            thumbnail=Image.open(io.BytesIO(jpg)).convert("RGB")
            thumbnail.thumbnail((480,270),Image.Resampling.LANCZOS)
            x=(k%4)*480;y=(k//4)*300
            sheet.paste(thumbnail,(x,y))
            drawer.text((x+10,y+278),f"{t:05.1f}s",fill="#edf2e9")
        sheet.save(OUT/"gi-autoimmunity-1.contact.webp",quality=90,method=6)
    metadata=info(target)
    duration=float(metadata["format"]["duration"])
    assert abs(duration-DURATION)<.15
    assert {"audio","video"}<={s["codec_type"] for s in metadata["streams"]}
    assert any(s.get("codec_name")=="h264" and s.get("width")==W and s.get("height")==H for s in metadata["streams"])
    results={
      "film_index":13,"title":"What Happens When Immunity Turns on the Gut?",
      "edition":"V21 cinematic intestinal barrier and immune-differential research film",
      "duration_seconds":duration,"fps":FPS,"resolution":[W,H],
      "source":{
        "doi":DOI,
        "title":"Autoimmune Diseases of the GI Tract Part I: Etiology and Pathophysiology",
        "authors":["Mahmoud Khatib A.A. Al-Ruweidi","Nada Khater","Haya Rashid Alkaabi","Maram Hasan","Huseyin C. Yalcin"],
        "publisher":"IntechOpen","year":2022,
        "chapter_url":"https://www.intechopen.com/chapters/83241",
        "scope":"Narrative review of mucosal/immune mechanisms, selected GI conditions and gut-brain research, not an experiment or patient series"
      },
      "original_narration":str(MASTER.relative_to(ROOT)),
      "original_webvtt":str(CAPTIONS.relative_to(ROOT)),
      "archival_images":[{"path":str(p.relative_to(ROOT)),
        "sha256":hashlib.sha256(p.read_bytes()).hexdigest(),
        "role":"Genuine owner laboratory-context image; NOT patient intestine, biopsy, original microscopy result or disease phenotype"}
         for p in CONTEXT],
      "illustrated_mechanisms":[
        {"category":"achalasia","boundary":"Oesophageal motility and myenteric neuronal loss; autoimmune etiology remains heterogeneous and partly proposed"},
        {"category":"autoimmune_atrophic_gastritis","boundary":"Immune-mediated gastric parietal-cell loss; do not equate B12 deficiency with primary etiologic cause"},
        {"category":"celiac_disease","boundary":"HLA-associated, gluten-triggered adaptive immunity and enteropathy"},
        {"category":"eosinophilic_esophagitis","boundary":"Type-2 immune-mediated eosinophilic esophageal disease, NOT generally categorized as classical autoimmune disease"},
        {"category":"inflammatory_bowel_disease","boundary":"Crohn's disease and ulcerative colitis are chronic immune-mediated inflammatory phenotypes, not a single autoantibody disease"}
      ],
      "chapters":[{"name":name,"start":a,"end":b} for name,a,b in SCENES],
      "scientific_boundaries":[
        "Moving villi, tight junctions, epithelial cells, macrophage/dendritic icons, B/T-cell motifs and microbes are nonquantitative mathematical cartoons, NOT clinical GI tissue.",
        "The film depicts a few pathways conceptually; it does not claim antigen permeability directly establishes autoimmunity or histology is diagnostic without clinicopathologic context.",
        "Distinct conditions in the 2022 overview are not all classical autoimmunity: EoE is type-2 immune mediated and IBD is immune mediated without a universal autoantibody etiology.",
        "Laboratory archive imagery is context only; the generated panel of colored cells is labeled NOT HISTOLOGY and contains zero fabricated slides.",
        "Gut-brain communication is presented as an investigational dimension of disease rather than clinical proof of psychiatric causation.",
        "This historical narrative review is not a personalized diagnosis, prognosis, definitive mechanistic proof or a 2026 treatment guideline."
      ],
      "older_film_masters_preserved":True,"live_website_unchanged":True,
      "human_review":"Full audiovisual playback, scientific mechanism and on-screen mobile legibility sign-off required before release",
      "sha256":hashlib.sha256(target.read_bytes()).hexdigest()
    }
    (OUT/"gi-autoimmunity-1.json").write_text(json.dumps(results,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print("FILM13 MASTER COMPLETE",json.dumps({"seconds":duration,"bytes":target.stat().st_size,"sha256":results["sha256"]}),flush=True)

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--validate-only",action="store_true")
    args=parser.parse_args()
    if args.validate_only:validate();print("FILM13 SOURCES PASS")
    else:render()
