#!/usr/bin/env python3
"""Render Ruwaidix Film 04: original seekable Canvas2D cinema + source narration.

Browser renders each requested t independently at 1920x1080/24fps. No AI-generated
micrographs, patient images, patent facsimiles, binding simulations or statistics.
Archive and website remain unchanged; export only review assets to isolated path.
"""
import argparse, hashlib, io, json, math, shutil, subprocess, tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets/films/series-v12-curcumin"
HTML=OUT/"film.html"
ORIGINAL=ROOT/"assets/films/series-v7-pilots/curcumin-cyanide.mp4"
SUBTITLE=ROOT/"assets/films/series-v7-pilots/curcumin-cyanide.vtt"
FPS=24;W=1920;H=1080;DURATION=84
DOI="10.1039/C9AY01557D"
S=[("Can color explain the chemistry?",0,12.5),("Conjugation enables optical readout",12.5,25.75),("Solvent context: acetonitrile–water",25.75,40.42),("Reported 421→520 nm absorption shift",40.42,55.08),("Cell imaging and analytical limits",55.08,69.83),("The primary research evidence",69.83,84)]
def call(*args):
    r=subprocess.run([str(x) for x in args],capture_output=True,text=True)
    if r.returncode:raise RuntimeError(" ".join(map(str,args))+"\n"+r.stderr[-2500:])
    return r.stdout
def ffinfo(path):
    return json.loads(call("ffprobe","-v","error","-show_streams","-show_format","-of","json",path))
def check_sources():
    assert HTML.is_file(),HTML
    txt=HTML.read_text()
    for marker in ("window.__draw","window.__ready","window.__meta","sourceFigure",DOI,"ACETONITRILE  90%","HYDROXIDE ALSO SHOWED A RESPONSE"):
        assert marker in txt,marker
    assert "Math.random(" not in txt and 'id="primary-figure"' in txt
    for f in (ORIGINAL,SUBTITLE):assert f.is_file(),f
    assert SUBTITLE.read_text().startswith("WEBVTT") and SUBTITLE.read_text().count("-->")==12
    streams=ffinfo(ORIGINAL)
    assert {"video","audio"} <= {x["codec_type"] for x in streams["streams"]}
    assert abs(float(streams["format"]["duration"])-DURATION)<.3
    assert len(S)==6 and S[-1][-1]==84
    return True
def score(out):
    """Original subtle musical pulse synthesized locally; no fake lab sounds."""
    import numpy as np,soundfile as sf
    sr=32000;n=sr*DURATION;t=np.arange(n,dtype=np.float64)/sr
    music=np.zeros(n,dtype=np.float64)
    for freq,amp in [(146.83,.0033),(220.0,.0028),(293.66,.0021),(440.0,.00095)]:
        envelope=.47+.53*np.sin(np.pi*np.minimum(1,t/15))**2
        music+=amp*envelope*np.sin(2*np.pi*freq*t+.16*np.sin(2*np.pi*.13*t))
    for k,at in enumerate([0,12.5,25.75,40.42,55.08,69.83]):
        a=int(at*sr);b=min(n,a+sr)
        tt=np.arange(b-a)/sr
        music[a:b]+=(.007 if k in (2,4) else .004)*np.exp(-8*tt)*(np.sin(2*np.pi*54*tt)+.28*np.sin(2*np.pi*108*tt))
    fade=np.minimum(1,t/2)*np.minimum(1,(DURATION-t)/3)
    sf.write(out,np.tanh(music*fade).astype(np.float32),sr,subtype="PCM_16")
def render():
    from PIL import Image,ImageDraw
    from playwright.sync_api import sync_playwright
    check_sources()
    OUT.mkdir(parents=True,exist_ok=True)
    master=OUT/"curcumin-cyanide.mp4"
    poster=OUT/"curcumin-cyanide.webp"
    with tempfile.TemporaryDirectory(prefix="ruwaidix-curcumin-v12-") as tmp:
        tmp=Path(tmp);silent=tmp/"visual-master.mp4"
        cmd=["ffmpeg","-hide_banner","-loglevel","error","-y",
            "-f","image2pipe","-framerate",str(FPS),"-vcodec","mjpeg","-i","pipe:0",
            "-c:v","libx264","-preset","medium","-crf","18","-pix_fmt","yuv420p",
            "-r",str(FPS),"-an","-movflags","+faststart",str(silent)]
        process=subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=subprocess.PIPE)
        contact=[]; errors=[];review=[]
        target={round((a+b)*FPS/2):i for i,(_,a,b) in enumerate(S)}
        try:
            with sync_playwright() as p:
                browser=p.chromium.launch(headless=True,args=["--no-sandbox","--disable-dev-shm-usage"])
                page=browser.new_page(viewport={"width":W,"height":H},device_scale_factor=1)
                page.on("pageerror",lambda err:errors.append(str(err)))
                page.goto(HTML.resolve().as_uri(),wait_until="load")
                page.wait_for_function("window.__ready === true",timeout=30000)
                assert page.evaluate("document.getElementById('primary-figure').naturalWidth >= 600"), "Original published figure unavailable"
                meta=page.evaluate("window.__meta")
                assert (meta["W"],meta["H"],meta["FPS"],meta["DURATION"])==(W,H,FPS,DURATION),meta
                for frame in range(FPS*DURATION):
                    t=frame/FPS
                    page.evaluate("(t)=>window.__draw(t)",t)
                    jpg=page.screenshot(type="jpeg",quality=96)
                    process.stdin.write(jpg)
                    if frame in target:
                        (OUT/f"chapter-{target[frame]+1:02d}.jpg").write_bytes(jpg)
                    if frame==FPS*3:
                        Image.open(io.BytesIO(jpg)).convert("RGB").save(poster,quality=90,method=6)
                    if frame%(FPS*6)==0:
                        contact.append((t,jpg))
                    if frame%480==0:print("FILM04 FRAMES",frame+1,"/",FPS*DURATION,flush=True)
                browser.close()
            process.stdin.close()
            stderr=process.stderr.read().decode("utf8","replace")
            if process.wait():raise RuntimeError("Picture pipeline failed "+stderr[-2000:])
            if errors:raise RuntimeError("Browser errors: "+str(errors))
        except BaseException:
            process.kill();raise
        music=tmp/"original-score.wav";score(music)
        audio="[1:a]aresample=48000[voice];[2:a]aresample=48000,volume=0.45[score];[voice][score]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-18:LRA=9:TP=-2[a]"
        call("ffmpeg","-hide_banner","-loglevel","error","-y","-i",silent,"-i",ORIGINAL,"-i",music,
            "-filter_complex",audio,"-map","0:v:0","-map","[a]","-c:v","copy","-c:a","aac",
            "-b:a","192k","-t",str(DURATION),"-movflags","+faststart",master)
        shutil.copyfile(SUBTITLE,OUT/"curcumin-cyanide.vtt")
        sheet=Image.new("RGB",(4*480,math.ceil(len(contact)/4)*300),"#eee9de")
        d=ImageDraw.Draw(sheet)
        for k,(t,jpg) in enumerate(contact):
            im=Image.open(io.BytesIO(jpg)).convert("RGB");im.thumbnail((480,270),Image.Resampling.LANCZOS)
            xx=(k%4)*480;yy=(k//4)*300;sheet.paste(im,(xx,yy));d.text((xx+10,yy+277),f"{t:05.1f}s",fill="#333")
        sheet.save(OUT/"curcumin-cyanide.contact.webp",quality=90,method=6)
    info=ffinfo(master);runtime=float(info["format"]["duration"])
    assert abs(runtime-DURATION)<.15,runtime
    assert {"video","audio"}<={x["codec_type"] for x in info["streams"]}
    assert any(x["codec_type"]=="video" and x["codec_name"]=="h264" and x.get("width")==W and x.get("height")==H for x in info["streams"])
    manifest={
      "film_index":4,"title":"When a Molecule Becomes a Question","film_release":"v12 review master",
      "seconds":runtime,"fps":FPS,"resolution":[W,H],
      "original_audio":str(ORIGINAL.relative_to(ROOT)),"source_narration":"84-second source audio retained on its original timeline, with quiet original-score mix",
      "original_captions":str(SUBTITLE.relative_to(ROOT)),"primary_paper_doi":DOI,
      "source_range":"Analytical Methods (2019), 11, 5169–5176","source_figure":"assets/home-archive/figure-cyanide-sensor.jpg",
      "source_figure_integrity":"Original published four-panel figure used with full extent; not modified or synthesized",
      "reported_optical_results":{"absorption_before_nm":421,"absorption_after_nm":520,"bathochromic_shift_nm":99,"detection_limit_molar":2.3e-6,"medium":"acetonitrile:water 90:10","hydroxide_interference":"reported optical response","cell_fluorescence":"quenching after cyanide exposure"},
      "scenes":[{"name":name,"start":a,"end":b} for name,a,b in S],
      "animation_system":"deterministic time-seekable Canvas2D via Chromium Playwright, FFmpeg, 24fps native 1920x1080",
      "visual_status":"Original published spectroscopic figure presented intact. Explanatory chromophore/cell/cuvette animations are conceptual; no invented spectra, microscopy, clinical detection or pure-water validation.",
      "originals_preserved":True,"live_site_modified":False,
      "human_signoff":"Not yet completed; user screening, scholarly check, legal review and listening required",
      "sha256":hashlib.sha256(master.read_bytes()).hexdigest()}
    (OUT/"curcumin-cyanide.json").write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+"\n")
    print("FILM04 MASTER COMPLETE",json.dumps({"seconds":runtime,"size":master.stat().st_size,"sha256":manifest["sha256"]}),flush=True)
if __name__=="__main__":
    args=argparse.ArgumentParser();args.add_argument("--validate-only",action="store_true")
    opt=args.parse_args()
    if opt.validate_only:check_sources();print("FILM04 SOURCES PASS")
    else:render()
