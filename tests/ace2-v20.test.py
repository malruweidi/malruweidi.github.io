#!/usr/bin/env python3
"""Fail fast: 2022 observational clinical evidence, six physically animated chapters, random-access reproducibility."""
import hashlib,io,importlib.util
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
HTML=ROOT/"assets/films/series-v20-ace2/film.html"
SPEC=importlib.util.spec_from_file_location("ace2v20",ROOT/"scripts/render-ace2-v20.py")
m=importlib.util.module_from_spec(SPEC);SPEC.loader.exec_module(m)
m.validate()
src=HTML.read_text(encoding="utf8")
for key in ("MEMBRANE ACE2","SOLUBLE ACE2","200 ADMITTED",
 "NOT RECORDED","≈1.9×","≈1.2×","r = 0.30",
 "OBSERVATIONAL · CROSS-SECTIONAL","Never stop medicines from this film"):
    assert key in src,key
assert "Math.random(" not in src
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=["--no-sandbox","--disable-dev-shm-usage"])
    page=browser.new_page(viewport={"width":1920,"height":1080},device_scale_factor=1)
    errors=[]
    page.on("pageerror",lambda e:errors.append(str(e)))
    page.goto(HTML.resolve().as_uri(),wait_until="load")
    page.wait_for_function("window.__ready === true",timeout=30000)
    dims=page.evaluate("[...document.querySelectorAll('.src')].map(x=>[x.id,x.naturalWidth,x.naturalHeight])")
    assert len(dims)==2 and all(w>200 and h>130 for _,w,h in dims),dims
    md=page.evaluate("window.__meta")
    assert [md[k] for k in ("W","H","FPS","DURATION")]==[1920,1080,24,84]
    for sec in (6.4,20.1,34.2,48.4,62.1,76.8):
        page.evaluate("(t)=>window.__draw(t)",sec)
        a=page.screenshot(type="jpeg",quality=93)
        assert Image.open(io.BytesIO(a)).size==(1920,1080)
        page.evaluate("(t)=>window.__draw(t)",sec+.47)
        b=page.screenshot(type="jpeg",quality=93)
        assert hashlib.sha256(a).digest()!=hashlib.sha256(b).digest(),f"Static scene {sec}"
        page.evaluate("(t)=>window.__draw(t)",sec)
        assert hashlib.sha256(a).digest()==hashlib.sha256(page.screenshot(type="jpeg",quality=93)).digest(),f"Nondeterministic scene {sec}"
    assert not errors,errors
    browser.close()
print("FILM12 PRE-FLIGHT PASS — six moving seekable chapters, contextual photographs and source-cited clinical numbers without causal claims")
