#!/usr/bin/env python3
"""Film 14: 84-second schematic immune-interface documentary.
Uses the original 2022 open-access chapter and the exact archived narrator/audio.
Original science is a REVIEW, not a new experiment or patient dataset.
"""
import argparse, hashlib, io, json, math, shutil, subprocess, tempfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets/films/series-v22-diagnostics"
HTML=OUT/"film.html"
MASTER=ROOT/"assets/films/series-v6/gi-autoimmunity-2.mp4"
CAPTIONS=ROOT/"assets/films/series-v6/gi-autoimmunity-2.vtt"
SOURCE_JSON=ROOT/"assets/films/series-v6/gi-autoimmunity-2.json"
W,H,FPS,DURATION=1920,1080,24,84
DOI="10.5772/intechopen.106185"
SCENES=[
 ("Overlapping gastrointestinal presentations",0,14),
 ("Four diagnostic evidence layers",14,28),
 ("Disease-specific criteria",28,42),
 ("Treatment mechanisms versus clinical benefit",42,56),
 ("Emerging tests and therapeutics",56,70),
 ("2022 evidence limits and current guidelines",70,84),
]

def run(*argv):
    result=subprocess.run([str(x) for x in argv],capture_output=True,text=True)
    if result.returncode: raise RuntimeError(" ".join(map(str,argv))+"\n"+result.stderr[-2200:])
    return result.stdout

def probe(p):
    return json.loads(run("ffprobe","-v","error","-show_streams","-show_format","-of","json",p))

def validate():
    assert HTML.is_file() and CAPTIONS.is_file() and MASTER.is_file() and SOURCE_JSON.is_file()
    text=HTML.read_text(encoding="utf8")
    for token in ('window.__draw','window.__ready','window.__meta','immuneCell(',
                  'section(','COELIAC','HISTOPATHOLOGY','CLINICAL STUDY','PATIENT OUTCOME',
                  'EoE','IBD','10.5772/intechopen.106185','NO PATIENT RECORDS'):
        assert token in text,token
    assert "Math.random(" not in text
    cues=CAPTIONS.read_text(encoding="utf8")
    assert cues.startswith("WEBVTT") and cues.count("-->")==12
    record=json.loads(SOURCE_JSON.read_text(encoding="utf8"))
    assert record["primary_source"]=="https://doi.org/"+DOI
    assert record["seconds"]==84
    checksum=hashlib.sha256(MASTER.read_bytes()).hexdigest()
    assert checksum==record["sha256"],("source film checksum changed",checksum)
    media=probe(MASTER)
    assert {"video","audio"} <= {s["codec_type"] for s in media["streams"]}
    assert abs(float(media["format"]["duration"])-DURATION)<.3
    assert len(SCENES)==6 and SCENES[-1][-1]==DURATION
    return record

def synthesise_score(target):
    import numpy as np
    import soundfile as sf
    sr=32000
    x=np.arange(sr*DURATION,dtype=np.float64)
    t=x/sr
    score=np.zeros(x.size,dtype=np.float64)
    for hz,volume in [(65.41,.0024),(98,.0016),(130.81,.002),(196,.0009),(261.63,.00045)]:
        modulation=.65+.35*np.sin(2*np.pi*(.035+.0003*hz)*t)
        score+=volume*modulation*np.sin(2*np.pi*hz*t+.1*np.sin(t*.12))
    for k,(_,start,_) in enumerate(SCENES):
        n=int(sr*start)
        s=np.arange(sr)/sr
        end=min(n+sr,len(score))
        waveform=.002*np.sin(2*np.pi*(49+k*8)*s)*np.exp(-7*s)
        score[n:end]+=waveform[:end-n]
    fade=np.minimum(1,t/2.0)*np.minimum(1,np.maximum(0,DURATION-t)/3.0)
    sf.write(target,np.tanh(score*fade).astype(np.float32),sr,subtype="PCM_16")

def render():
    from PIL import Image, ImageDraw
    from playwright.sync_api import sync_playwright
    original=validate()
    OUT.mkdir(parents=True,exist_ok=True)
    target=OUT/"gi-autoimmunity-2.mp4"
    with tempfile.TemporaryDirectory(prefix="ruwaidix-film13-") as name:
        tmp=Path(name)
        silent=tmp/"film13-picture.mp4"
        ff=subprocess.Popen(["ffmpeg","-hide_banner","-loglevel","error","-y",
                  "-f","image2pipe","-framerate",str(FPS),"-vcodec","mjpeg","-i","pipe:0",
                  "-c:v","libx264","-preset","fast","-crf","19","-pix_fmt","yuv420p",
                  "-r",str(FPS),"-an","-movflags","+faststart",str(silent)],
                  stdin=subprocess.PIPE,stderr=subprocess.PIPE)
        errors=[]
        chapters={round((a+b)*FPS/2):k for k,(_,a,b) in enumerate(SCENES)}
        contact=[]
        try:
            with sync_playwright() as p:
                browser=p.chromium.launch(headless=True,args=["--no-sandbox","--disable-dev-shm-usage"])
                page=browser.new_page(viewport={"width":W,"height":H},device_scale_factor=1)
                page.on("pageerror",lambda e:errors.append(str(e)))
                page.goto(HTML.resolve().as_uri(),wait_until="load")
                page.wait_for_function("window.__ready === true",timeout=20000)
                assert page.evaluate("window.__meta")=={
                  "W":W,"H":H,"FPS":FPS,"DURATION":DURATION,"chapters":6,
                  "scientific_form":"editorial schematic, not patient or measured experimental data"
                }
                for n in range(FPS*DURATION):
                    t=n/FPS
                    page.evaluate("(t) => window.__draw(t)",t)
                    image=page.screenshot(type="jpeg",quality=92)
                    ff.stdin.write(image)
                    if n in chapters:
                        (OUT/f"chapter-{chapters[n]+1:02}.jpg").write_bytes(image)
                    if n==5*FPS:
                        Image.open(io.BytesIO(image)).convert("RGB").save(
                            OUT/"gi-autoimmunity-2.webp",format="WEBP",quality=91,method=6)
                    if n%(6*FPS)==0:contact.append((t,image))
                    if n and n%504==0:print("FILM14",n,"/",FPS*DURATION,"frames",flush=True)
                browser.close()
            ff.stdin.close()
            failure=ff.stderr.read().decode("utf8","replace")
            if ff.wait()!=0:raise RuntimeError("Video encoding failed: "+failure[-2000:])
            if errors:raise RuntimeError("Page exceptions: "+repr(errors))
        except BaseException:
            ff.kill()
            raise

        score=tmp/"score.wav"
        synthesise_score(score)
        # Hard peak limiter after loudness normalisation, with room for AAC overshoot.
        filtergraph=("[1:a]aresample=48000[voice];"
          "[2:a]aresample=48000,volume=0.32[music];"
          "[voice][music]amix=inputs=2:duration=first:normalize=0,"
          "loudnorm=I=-18:LRA=9:TP=-2.5,"
          "alimiter=limit=0.63:attack=5:release=90:level=false[a]")
        run("ffmpeg","-hide_banner","-loglevel","error","-y",
            "-i",silent,"-i",MASTER,"-i",score,
            "-filter_complex",filtergraph,"-map","0:v:0","-map","[a]",
            "-c:v","copy","-c:a","aac","-b:a","192k",
            "-t",str(DURATION),"-movflags","+faststart",target)
        shutil.copyfile(CAPTIONS,OUT/"gi-autoimmunity-2.vtt")
        sheet=Image.new("RGB",(4*480,math.ceil(len(contact)/4)*295),C_BG)
        painter=ImageDraw.Draw(sheet)
        for k,(t,raw) in enumerate(contact):
            frame=Image.open(io.BytesIO(raw)).convert("RGB")
            frame.thumbnail((480,270),Image.Resampling.LANCZOS)
            x=(k%4)*480;y=(k//4)*295
            sheet.paste(frame,(x,y))
            painter.text((x+8,y+273),f"{t:05.1f}s",fill="#edece6")
        sheet.save(OUT/"gi-autoimmunity-2.contact.webp",format="WEBP",quality=89,method=6)

    check=probe(target)
    assert abs(float(check["format"]["duration"])-DURATION)<.15
    assert any(x.get("width")==W and x.get("height")==H and x.get("codec_name")=="h264"
            for x in check["streams"])
    assert any(x["codec_type"]=="audio" and x.get("codec_name")=="aac" for x in check["streams"])
    meta={
      "film_index":14,
      "title":"The Diagnostic Problem",
      "edition":"V22 kinetic GI diagnostics / conceptual clinical-evidence documentary",
      "duration_seconds":float(check["format"]["duration"]),"fps":FPS,"resolution":[W,H],
      "source_chapter":{
        "title":"Autoimmune Diseases of the GI Tract Part II: Emergence of Diagnostic Tools and Treatments",
        "doi":DOI,"type":"Narrative review chapter, 2022, not primary trial data",
        "source":"https://doi.org/"+DOI
      },
      "source_narration":str(MASTER.relative_to(ROOT)),
      "source_mp4_sha256":original["sha256"],
      "source_captions":str(CAPTIONS.relative_to(ROOT)),
      "captions_count":12,
      "visual_provenance":"Original deterministic Canvas2D explanatory schematics. No real histology, patient image, clinical outcome data or experimental recording.",
      "scenes":[{"title":q,"start":s,"end":e} for q,s,e in SCENES],
      "scientific_limitations":[
        "2022 narrative review, not current clinical practice guideline.",
        "Different GI disorders require different diagnostic criteria; no single test is universal.",
        "Treatment mechanism is not a clinical efficacy estimate.",
        "All tissues, assays, trial and molecular motifs are conceptual, not patient or study data."
      ],
      "live_website_unchanged":True,
      "older_film_masters_preserved":True,
      "release":"Review-only until personal scholarly, audiovisual and accessibility approval.",
      "sha256":hashlib.sha256(target.read_bytes()).hexdigest()
    }
    (OUT/"gi-autoimmunity-2.json").write_text(json.dumps(meta,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print("FILM14 VERIFIED MASTER",json.dumps({
      "seconds":meta["duration_seconds"],"bytes":target.stat().st_size,
      "sha256":meta["sha256"]}),flush=True)

C_BG="#101b23"
if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--validate-only",action="store_true")
    args=parser.parse_args()
    if args.validate_only:
        validate();print("FILM14 SOURCE AND SCIENCE LABELS PASS")
    else:render()
