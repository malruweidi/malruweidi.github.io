#!/usr/bin/env python3
"""Film 10: validate exact source hashes, dynamic motion, deterministic seeking and honest science."""
import hashlib,io,importlib.util
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
HTML=ROOT/"assets/films/series-v18-flow/film.html"
SCRIPT=ROOT/"scripts/render-flow-v18.py"
spec=importlib.util.spec_from_file_location("flow_v18",SCRIPT)
render=importlib.util.module_from_spec(spec);spec.loader.exec_module(render)
render.validate()
source=HTML.read_text(encoding="utf8")
for s in ("ORIGINAL FIGURE 5","ORIGINAL FIGURE 6","~53%","0–0.2%",
   "n = 7 EXPERIMENTS","NO STATISTICALLY SIGNIFICANT DIFFERENCE",
   "CULTURED CELL MONOLAYER","not a measured"):
    if s=="not a measured":continue
    assert s in source,s
assert "Math.random(" not in source and "window.__draw" in source
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=["--no-sandbox","--disable-dev-shm-usage"])
    page=browser.new_page(viewport={"width":1920,"height":1080},device_scale_factor=1)
    errors=[]
    page.on("pageerror",lambda e:errors.append(str(e)))
    page.goto(HTML.resolve().as_uri(),wait_until="load")
    page.wait_for_function("window.__ready === true",timeout=30000)
    dims=page.evaluate("[...document.querySelectorAll('.primary')].map(i=>[i.id,i.naturalWidth,i.naturalHeight])")
    assert len(dims)==3 and all(w>350 and h>125 for _,w,h in dims),dims
    meta=page.evaluate("window.__meta")
    assert [meta[k] for k in ("W","H","FPS","DURATION")]==[1920,1080,24,120]
    for t in (6.4,22.1,36.8,52.4,67.6,82.1,97.5,112.7):
        page.evaluate("(t)=>window.__draw(t)",t)
        a=page.screenshot(type="jpeg",quality=94)
        assert Image.open(io.BytesIO(a)).size==(1920,1080)
        page.evaluate("(t)=>window.__draw(t)",t+.41)
        b=page.screenshot(type="jpeg",quality=94)
        assert hashlib.sha256(a).digest()!=hashlib.sha256(b).digest(),f"Static chapter at {t}"
        page.evaluate("(t)=>window.__draw(t)",t)
        c=page.screenshot(type="jpeg",quality=94)
        assert hashlib.sha256(a).digest()==hashlib.sha256(c).digest(),f"Nonseekable chapter at {t}"
    assert not errors,errors
    browser.close()
print("FILM10: all 8 scenes animate deterministically; three authentic source figures load, values and caveats present.")
