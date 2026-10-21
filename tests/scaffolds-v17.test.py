#!/usr/bin/env python3
"""Fail-fast check: primary scientific source identity, 8 nonstatic scenes and deterministic frames."""
from pathlib import Path
from hashlib import sha256
import io,importlib.util
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
FILM=ROOT/"assets/films/series-v17-scaffolds/film.html"
SCRIPT=ROOT/"scripts/render-scaffolds-v17.py"
spec=importlib.util.spec_from_file_location("scaffolds17",SCRIPT)
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
module.validate()
source=FILM.read_text(encoding="utf8")
for keyword in ("PUBLISHED FIGURE 5","3 μm SCALE BARS",
  "ARCHIVED V5 FRAME OF PUBLISHED FIGURE 6",
  "ARCHIVED V5 FRAME OF PUBLISHED FIGURE 7",
  "SOURCE TABLE 3","0 = NO GROWTH",
  "30 s was selected","S. AUREUS","E. COLI","Not a clinical implant."):
    assert keyword in source,keyword
assert "Math.random(" not in source
assert "scenes=[chapter0" in source
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=["--no-sandbox","--disable-dev-shm-usage"])
    page=browser.new_page(viewport={"width":1920,"height":1080},device_scale_factor=1)
    errors=[]
    page.on("pageerror",lambda e:errors.append(str(e)))
    page.goto(FILM.resolve().as_uri(),wait_until="load")
    page.wait_for_function("window.__ready === true",timeout=30000)
    dims=page.evaluate("[...document.querySelectorAll('.archive')].map(z=>[z.id,z.naturalWidth,z.naturalHeight])")
    assert len(dims)==3 and all(x>=350 and y>=180 for _,x,y in dims),dims
    meta=page.evaluate("window.__meta")
    assert [meta[x] for x in ("W","H","FPS","DURATION")]==[1920,1080,24,120]
    for t in (7.3,22.1,36.8,53.1,67.9,82.2,98.1,112.5):
        page.evaluate("(t)=>window.__draw(t)",t)
        first=page.screenshot(type="jpeg",quality=94)
        assert Image.open(io.BytesIO(first)).size==(1920,1080)
        page.evaluate("(t)=>window.__draw(t)",t+.33)
        second=page.screenshot(type="jpeg",quality=94)
        assert sha256(first).digest()!=sha256(second).digest(),f"Static Film 09 chapter near {t}"
        page.evaluate("(t)=>window.__draw(t)",t)
        assert sha256(first).digest()==sha256(page.screenshot(type="jpeg",quality=94)).digest(),f"Seekability failure {t}"
    assert not errors,errors
    browser.close()
print("FILM09: original SEM hash, 2 archived research figures, 8 nonstatic deterministic scenes and clinical limitation PASSED")
