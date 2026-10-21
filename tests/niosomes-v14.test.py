#!/usr/bin/env python3
"""Film 06 scientific-motion preflight: every scene must move and seek deterministically."""
from pathlib import Path
import hashlib,io,importlib.util
from PIL import Image
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
HTML=ROOT/"assets/films/series-v14-niosomes/film.html"
SCRIPT=ROOT/"scripts/render-niosomes-v14.py"
spec=importlib.util.spec_from_file_location("niosomes_v14",SCRIPT)
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
m.validate()
text=HTML.read_text()
for token in ("A study, not a result.","NGI","SURFACTANT","CHOLESTEROL",
              "DLS : SIZE / PDI","DEPOSITION?","VERIFY INTEGRITY",
              "Ongoing MSc investigation"):
    assert token in text,token
assert "Math.random(" not in text
assert "No unpublished performance claims" in text
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=["--no-sandbox","--disable-dev-shm-usage"])
    page=browser.new_page(viewport={"width":1920,"height":1080},device_scale_factor=1)
    errors=[]
    page.on("pageerror",lambda e:errors.append(str(e)))
    page.goto(HTML.resolve().as_uri(),wait_until="load")
    page.wait_for_function("window.__ready === true",timeout=30000)
    images=page.evaluate("[...document.querySelectorAll('.reference')].map(x=>({id:x.id,w:x.naturalWidth,h:x.naturalHeight}))")
    assert len(images)==2 and all(x["w"]>300 for x in images),images
    meta=page.evaluate("window.__meta")
    assert [meta[x] for x in ("W","H","FPS","DURATION")]==[1920,1080,24,84]
    for sec in (6.1,19.1,34.2,48.0,61.5,76.2):
        page.evaluate("(t)=>window.__draw(t)",sec)
        a=page.screenshot(type="jpeg",quality=95)
        assert Image.open(io.BytesIO(a)).size==(1920,1080)
        page.evaluate("(t)=>window.__draw(t)",sec+.31)
        b=page.screenshot(type="jpeg",quality=95)
        assert hashlib.sha256(a).digest()!=hashlib.sha256(b).digest(),f"Scene at {sec} became static"
        page.evaluate("(t)=>window.__draw(t)",sec)
        again=page.screenshot(type="jpeg",quality=95)
        assert hashlib.sha256(a).digest()==hashlib.sha256(again).digest(),f"Seekable frame changed at {sec}"
    assert not errors,errors
    browser.close()
print("FILM06 6/6 scenes dynamic; contextual source images load; frame=f(t) deterministic; original unpublished status documented.")
