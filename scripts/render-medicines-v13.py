#!/usr/bin/env python3
"""Render Ruwaidix Film 05: original seekable Canvas2D cinema + source narration.

Browser renders each requested t independently at 1920x1080/24fps. No AI-generated
micrographs, patient images, patent facsimiles, binding simulations or statistics.
Archive and website remain unchanged; export only review assets to isolated path.
"""
import argparse, hashlib, io, json, math, shutil, subprocess, tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets/films/series-v13-medieval"
HTML=OUT/"film.html"
ORIGINAL=ROOT/"assets/films/series-v7-pilots/making-medicines-keep.mp4"
SUBTITLE=ROOT/"assets/films/series-v7-pilots/making-medicines-keep.vtt"
FPS=24;W=1920;H=1080;DURATION=120
DOI="Wellcome MS Arabic 1002"
S=[("Preparation must endure",0,15),("Text and manuscript witness",15,30),("Rose water sugar and syrup",30,45),("Dissolve, skim, strain, concentrate",45,60),("Consistency and crystallization",60,75),("Corrective repair",75,90),("Substitution and supply",90,105),("Reliability and documentary traces",105,120)]
def call(*args):
    r=subprocess.run([str(x) for x in args],capture_output=True,text=True)
    if r.returncode:raise RuntimeError(" ".join(map(str,args))+"\n"+r.stderr[-2500:])
    return r.stdout
def ffinfo(path):
    return json.loads(call("ffprobe","-v","error","-show_streams","-show_format","-of","json",path))
def check_sources():
    assert HTML.is_file(),HTML
    txt=HTML.read_text()
    for marker in ("window.__draw","window.__ready","window.__meta","manuscript(d,","Minhāj al-dukkān","Wellcome MS Arabic 1002","not verified as the syrup passage"):
        assert marker in txt,marker
    assert "Math.random(" not in txt and 'id="manuscript"' in txt
    for f in (ORIGINAL,SUBTITLE):assert f.is_file(),f
    assert SUBTITLE.read_text().startswith("WEBVTT") and SUBTITLE.read_text().count("-->")==12
    streams=ffinfo(ORIGINAL)
    assert {"video","audio"} <= {x["codec_type"] for x in streams["streams"]}
    assert abs(float(streams["format"]["duration"])-DURATION)<.3
    assert len(S)==6 and S[-1][-1]==120
    return True
def score(out):
    """Original subtle musical pulse synthesized locally; no fake lab sounds."""
    import numpy as np,soundfile as sf
    sr=32000;n=sr*DURATION;t=np.arange(n,dtype=np.float64)/sr
    music=np.zeros(n,dtype=np.float64)
    for freq,amp in [(73.42,.0030),(110.0,.0025),(146.83,.0017),(220.0,.00085)]:
        envelope=.47+.53*np.sin(np.pi*np.minimum(1,t/15))**2
        music+=amp*envelope*np.sin(2*np.pi*freq*t+.16*np.sin(2*np.pi*.13*t))
    for k,at in enumerate([0,15,30,45,60,75,90,105]):
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
    master=OUT/"making-medicines-keep.mp4"
    poster=OUT/"making-medicines-keep.webp"
    with tempfile.TemporaryDirectory(prefix="ruwaidix-making-medicines-v13-") as tmp:
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
                assert page.evaluate("document.getElementById('manuscript').naturalWidth >= 900"), "Later manuscript image unavailable"
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
                    if frame%480==0:print("FILM05 FRAMES",frame+1,"/",FPS*DURATION,flush=True)
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
        shutil.copyfile(SUBTITLE,OUT/"making-medicines-keep.vtt")
        sheet=Image.new("RGB",(4*480,math.ceil(len(contact)/4)*300),"#eee9de")
        d=ImageDraw.Draw(sheet)
        for k,(t,jpg) in enumerate(contact):
            im=Image.open(io.BytesIO(jpg)).convert("RGB");im.thumbnail((480,270),Image.Resampling.LANCZOS)
            xx=(k%4)*480;yy=(k//4)*300;sheet.paste(im,(xx,yy));d.text((xx+10,yy+277),f"{t:05.1f}s",fill="#333")
        sheet.save(OUT/"making-medicines-keep.contact.webp",quality=90,method=6)
    info=ffinfo(master);runtime=float(info["format"]["duration"])
    assert abs(runtime-DURATION)<.15,runtime
    assert {"video","audio"}<={x["codec_type"] for x in info["streams"]}
    assert any(x["codec_type"]=="video" and x["codec_name"]=="h264" and x.get("width")==W and x.get("height")==H for x in info["streams"])
    manifest={
      "film_index":5,"title":"When a Molecule Becomes a Question","film_release":"v13 review master",
      "seconds":runtime,"fps":FPS,"resolution":[W,H],
      "original_audio":str(ORIGINAL.relative_to(ROOT)),"source_narration":"120-second source audio retained on its original timeline, with quiet original-score mix",
      "original_captions":str(SUBTITLE.relative_to(ROOT)),"primary_paper_doi":DOI,
      "source_range":"Ayyubid-Mamluk Cairo, 1260 formulary and later sources",
      "primary_text":"Minhaj al-dukkan by al-Kuhin al-Attar, composed in Cairo, 658 AH / 1260 CE",
      "manuscript":"assets/films/source-manuscripts/wellcome-ms-arabic-1002/canvas-013.jpg",
      "manuscript_witness_date":"Egypt 1904 (later copy, not original 1260 autograph)",
      "manuscript_page_verification":"Page not verified as particular syrup instructions",
      "manuscript_source_register":"assets/films/source-manuscripts/wellcome-ms-arabic-1002/source-register.json",
      "source_IIIF":"https://iiif.wellcomecollection.org/presentation/v2/b21417283",
      "scenes":[{"name":name,"start":a,"end":b} for name,a,b in S],
      "animation_system":"deterministic time-seekable Canvas2D via Chromium Playwright, FFmpeg, 24fps native 1920x1080",
      "visual_status":"Later 1904 manuscript page shown unaltered and explicitly distinguished from 1260 composition. All other process and apparatus imagery is modern interpretive illustration, not period footage, actual equipment, or a medieval clinical efficacy claim.",
      "originals_preserved":True,"live_site_modified":False,
      "human_signoff":"Not yet completed; user screening, scholarly check, legal review and listening required",
      "sha256":hashlib.sha256(master.read_bytes()).hexdigest()}
    (OUT/"making-medicines-keep.json").write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+"\n")
    print("FILM05 MASTER COMPLETE",json.dumps({"seconds":runtime,"size":master.stat().st_size,"sha256":manifest["sha256"]}),flush=True)
if __name__=="__main__":
    args=argparse.ArgumentParser();args.add_argument("--validate-only",action="store_true")
    opt=args.parse_args()
    if opt.validate_only:check_sources();print("FILM05 SOURCES PASS")
    else:render()
