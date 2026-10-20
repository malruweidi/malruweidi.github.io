#!/usr/bin/env python3
"""Film08 source-figure SHA, story accuracy and eight scene motion preflight."""
import hashlib,importlib.util,io,json
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
SCRIPT=ROOT/"scripts/render-pla-v16.py"
HTML=ROOT/"assets/films/series-v16-pla/film.html"
SPEC=importlib.util.spec_from_file_location("pla_cinema",SCRIPT)
m=importlib.util.module_from_spec(SPEC);SPEC.loader.exec_module(m)
source=m.validate()
assert len(m.CHAPTERS)==8 and m.SECS==120
assert [f["figure_number"] for f in source["figures"]]==[1,4,8]
markup=HTML.read_text(encoding="utf8")
for string in ("window.__draw","window.__ready","FIGURE 1 / WETTING",
               "FIGURE 4 / XPS","FIGURE 8 / PEEL","70.2","55.1","49.6",
               "211","87 N/m","PLASMA + FUMARIC ACID","UNALTERED"):
    assert string in markup,string
assert "Math.random(" not in markup
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=["--no-sandbox","--disable-dev-shm-usage"])
    page=browser.new_page(viewport={"width":1920,"height":1080},device_scale_factor=1)
    errors=[]
    page.on("pageerror",lambda e:errors.append(str(e)))
    page.goto(HTML.resolve().as_uri(),wait_until="load")
    page.wait_for_function("window.__ready === true",timeout=30000)
    figs=page.evaluate("[...document.querySelectorAll('.source')].map(i=>[i.naturalWidth,i.naturalHeight])")
    assert len(figs)==3 and all(w>=450 and h>=180 for w,h in figs),figs
    meta=page.evaluate("window.__meta")
    assert [meta[x] for x in ("W","H","FPS","DURATION")]==[1920,1080,24,120]
    for sec in (6.7,21.4,36.6,52.7,67.8,82.1,98.8,112.3):
        page.evaluate("(t)=>window.__draw(t)",sec)
        a=page.screenshot(type="jpeg",quality=94)
        assert Image.open(io.BytesIO(a)).size==(1920,1080)
        page.evaluate("(t)=>window.__draw(t)",sec+.33)
        b=page.screenshot(type="jpeg",quality=94)
        assert hashlib.sha256(a).digest()!=hashlib.sha256(b).digest(),f"Static chapter at {sec}"
        page.evaluate("(t)=>window.__draw(t)",sec)
        c=page.screenshot(type="jpeg",quality=94)
        assert hashlib.sha256(a).digest()==hashlib.sha256(c).digest(),f"Nonseekable frame at {sec}"
    assert not errors,errors
    browser.close()
print("FILM08 eight motion scenes, figure hashes, film-science data checks and deterministic seeking: PASS")
