#!/usr/bin/env python3
"""Film 06: render exactly one 84-second thesis-workflow film in 1920×1080.

Preserves the existing 84-second spoken narration and timed WebVTT, layers a
quiet self-generated score, and makes evidence vs interpretation explicit.
Browser seeks to each numeric frame time. No fictitious measurements, deposition
distributions, confocal microscopy, DLS traces, or patient benefits are implied.
"""
import argparse,hashlib,io,json,math,shutil,subprocess,tempfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets/films/series-v14-niosomes"
HTML=OUT/"film.html"
ORIGINAL=ROOT/"assets/films/series-v7-pilots/niosomes.mp4"
CAPTIONS=ROOT/"assets/films/series-v7-pilots/niosomes.vtt"
PHOTO=ROOT/"assets/research-archive-2026/molecular-biology-pipette-workbench.webp"
OTHER=ROOT/"assets/research-archive-2026/qatar-university-research-workstation.webp"
WORKFLOW=ROOT/"research/inhalable-vesicles.html"
W,H,FPS,DURATION=1920,1080,24,84
CHAPTERS=[
 ("The vial is not the lung",0,12.4),
 ("Surfactant and cholesterol in vesicle design",12.4,27.7),
 ("Establish particle, formulation and drug assay",27.7,42.55),
 ("Mechanical challenge: nebulization",42.55,53.8),
 ("Aerosol distribution and deposition questions",53.8,69.05),
 ("Research design without premature performance claims",69.05,84)
]

def run(*args):
    p=subprocess.run([str(s) for s in args],capture_output=True,text=True)
    if p.returncode:
        raise RuntimeError(" ".join(map(str,args))+"\n"+p.stderr[-2500:])
    return p.stdout

def media(path):
    return json.loads(run("ffprobe","-v","error","-show_streams","-show_format","-of","json",path))

def validate():
    assert HTML.is_file()
    h=HTML.read_text(encoding="utf-8")
    for token in ("window.__draw","window.__ready","window.__meta","bilayer(d,",
       "SURFACTANT","CHOLESTEROL","VERIFY INTEGRITY","DEPOSITION?",
       "Ongoing MSc investigation","DLS : SIZE / PDI"):
        assert token in h,token
    assert "Math.random(" not in h and '<h1 class="sr-only">' in h
    for p in (ORIGINAL,CAPTIONS,PHOTO,OTHER,WORKFLOW):assert p.is_file(),p
    v=CAPTIONS.read_text(encoding="utf-8")
    assert v.startswith("WEBVTT") and v.count("-->")==12
    info=media(ORIGINAL)
    assert {"video","audio"}<={s["codec_type"] for s in info["streams"]}
    assert abs(float(info["format"]["duration"])-DURATION)<.3
    assert len(CHAPTERS)==6 and CHAPTERS[-1][2]==84
    record=WORKFLOW.read_text()
    for word in ("NGI","DLS","unpublished","proniosomes","cholesterol"):
        assert word in record
    return True

def score(path):
    import numpy as np,soundfile as sf
    sr=32000;n=sr*DURATION;t=np.arange(n,dtype=np.float64)/sr
    voice_space=np.zeros(n,dtype=np.float64)
    # Restrained, original marine-like drones/pulses: NEVER laboratory effects.
    for f,amp in ((73.416,.0031),(109.999,.0026),(146.832,.0012),(196,.001)):
        env=.43+.57*np.sin(np.pi*np.minimum(1,t/19))**2
        voice_space+=amp*env*np.sin(2*np.pi*f*t+.15*np.sin(2*np.pi*.11*t))
    for a in (0,12.4,27.7,42.55,53.8,69.05):
        start=int(a*sr);stop=min(n,start+sr)
        tt=np.arange(stop-start)/sr
        voice_space[start:stop]+=.0035*np.exp(-8*tt)*np.sin(2*np.pi*68*tt)
    fade=np.minimum(1,t/2)*np.minimum(1,(DURATION-t)/3)
    sf.write(path,np.tanh(voice_space*fade).astype(np.float32),sr,subtype="PCM_16")

def render():
    from playwright.sync_api import sync_playwright
    from PIL import Image,ImageDraw
    validate()
    OUT.mkdir(parents=True,exist_ok=True)
    dest=OUT/"niosomes.mp4"
    with tempfile.TemporaryDirectory(prefix="ruwaidix-niosomes-v14-") as temp:
        temp=Path(temp);picture=temp/"visual-master.mp4"
        encoder=subprocess.Popen(
          ["ffmpeg","-hide_banner","-loglevel","error","-y",
           "-f","image2pipe","-framerate",str(FPS),"-vcodec","mjpeg","-i","pipe:0",
           "-c:v","libx264","-preset","medium","-crf","18","-pix_fmt","yuv420p",
           "-r",str(FPS),"-an","-movflags","+faststart",str(picture)],
          stdin=subprocess.PIPE,stderr=subprocess.PIPE)
        errors=[]; samples=[];targets={round((a+b)*FPS/2):i for i,(_,a,b) in enumerate(CHAPTERS)}
        try:
            with sync_playwright() as p:
                browser=p.chromium.launch(headless=True,args=["--no-sandbox","--disable-dev-shm-usage"])
                page=browser.new_page(viewport={"width":W,"height":H},device_scale_factor=1)
                page.on("pageerror",lambda x:errors.append(str(x)))
                page.goto(HTML.resolve().as_uri(),wait_until="load")
                page.wait_for_function("window.__ready === true",timeout=30000)
                meta=page.evaluate("window.__meta")
                assert (meta["W"],meta["H"],meta["FPS"],meta["DURATION"])==(W,H,FPS,DURATION),meta
                for n in range(FPS*DURATION):
                    t=n/FPS
                    page.evaluate("(t)=>window.__draw(t)",t)
                    jpg=page.screenshot(type="jpeg",quality=95)
                    encoder.stdin.write(jpg)
                    if n in targets:
                        (OUT/f"chapter-{targets[n]+1:02d}.jpg").write_bytes(jpg)
                    if n==FPS*4:
                        Image.open(io.BytesIO(jpg)).convert("RGB").save(OUT/"niosomes.webp",quality=90,method=6)
                    if n%(FPS*6)==0:samples.append((t,jpg))
                    if n and n%480==0:print("FILM06 FRAMES",n,"/",FPS*DURATION,flush=True)
                browser.close()
            encoder.stdin.close();err=encoder.stderr.read().decode("utf-8","replace")
            if encoder.wait():raise RuntimeError("Picture encoding failed "+err[-2300:])
            assert not errors,errors
        except BaseException:
            encoder.kill();raise
        music=temp/"original-score.wav";score(music)
        filtergraph="[1:a]aresample=48000[voice];[2:a]aresample=48000,volume=0.45[score];[voice][score]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-18:LRA=9:TP=-2[a]"
        run("ffmpeg","-hide_banner","-loglevel","error","-y",
            "-i",picture,"-i",ORIGINAL,"-i",music,
            "-filter_complex",filtergraph,"-map","0:v:0","-map","[a]",
            "-c:v","copy","-c:a","aac","-b:a","192k",
            "-t",str(DURATION),"-movflags","+faststart",dest)
        shutil.copyfile(CAPTIONS,OUT/"niosomes.vtt")
        sheet=Image.new("RGB",(4*480,math.ceil(len(samples)/4)*300),"#071b26")
        draw=ImageDraw.Draw(sheet)
        for j,(t,jpg) in enumerate(samples):
            thumbnail=Image.open(io.BytesIO(jpg)).convert("RGB")
            thumbnail.thumbnail((480,270),Image.Resampling.LANCZOS)
            x=(j%4)*480;y=(j//4)*300
            sheet.paste(thumbnail,(x,y))
            draw.text((x+10,y+278),f"{t:05.1f}s",fill="#daf3ea")
        sheet.save(OUT/"niosomes.contact.webp",quality=90,method=6)
    info=media(dest);duration=float(info["format"]["duration"])
    assert abs(duration-DURATION)<.15,duration
    assert {"video","audio"}<={s["codec_type"] for s in info["streams"]}
    assert any(s.get("codec_name")=="h264" and s.get("width")==W and s.get("height")==H for s in info["streams"])
    report={
      "film_index":6,"title":"Will the Medicine Survive the Nebulizer?",
      "release":"v14 cinematic research-workflow review",
      "seconds":duration,"fps":FPS,"resolution":[W,H],
      "source":"research/inhalable-vesicles.html",
      "research_status":"ongoing MSc, October 2026; no unpublished quantified results released",
      "original_audio":str(ORIGINAL.relative_to(ROOT)),
      "original_captions":str(CAPTIONS.relative_to(ROOT)),
      "image_sources":[
        {"file":str(PHOTO.relative_to(ROOT)),"use":"real contextual laboratory-workbench photograph; not a niosome experiment"},
        {"file":str(OTHER.relative_to(ROOT)),"use":"real contextual research-workstation archive; loaded but not exposed as experimental data"}],
      "scenes":[{"name":label,"start":a,"end":b} for label,a,b in CHAPTERS],
      "scientific_boundary":[
       "All bilayer geometries, droplet shapes, particles and transport trajectories are conceptual moving illustrations.",
       "No measured DLS distribution, chromatographic output, encapsulation percentage, post-nebulization membrane stability or NGI deposition data are displayed.",
       "NGI stage question marks do not signify measured regional deposition, clinical efficacy or achieved therapeutic dose.",
       "The moving vesicle in jet and droplet sequences illustrates a question, not a photographed or confirmed surviving carrier."],
      "render_system":"deterministic frame=f(time) Canvas2D, Chromium Playwright, FFmpeg native Full HD/24fps",
      "old_versions_preserved":True,"live_site_modified":False,
      "human_review":"Scientific, audiovisual, editorial and rights review pending before approval.",
      "sha256":hashlib.sha256(dest.read_bytes()).hexdigest()
    }
    (OUT/"niosomes.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print("FILM06 MASTER COMPLETE",json.dumps({"seconds":duration,"bytes":dest.stat().st_size,"sha256":report["sha256"]}),flush=True)

if __name__=="__main__":
    p=argparse.ArgumentParser();p.add_argument("--validate-only",action="store_true")
    args=p.parse_args()
    if args.validate_only:validate();print("FILM06 SOURCES PASSED")
    else:render()
