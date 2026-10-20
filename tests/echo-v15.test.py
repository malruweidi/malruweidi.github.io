#!/usr/bin/env python3
"""Film 07 evidence, scene movement, seekability and source-audit regression suite."""
from pathlib import Path
import hashlib,io,importlib.util
from PIL import Image
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
FILM=ROOT/"assets/films/series-v15-echo/film.html"
SPEC=importlib.util.spec_from_file_location("echo_v15",ROOT/"scripts/render-echo-v15.py")
module=importlib.util.module_from_spec(SPEC);SPEC.loader.exec_module(module)
module.validate()
source=FILM.read_text()
for token in ("SCHEMATIC · NOT PATIENT ULTRASOUND","91%",
    "13 CHD subjects","9 controls","CNN","LSTM","STACKING MODEL",
    "10.1109/ACCESS.2023.3316719","ARCHIVAL ULTRASOUND WORKSTATION"):
    assert token in source,token
assert "Math.random(" not in source
assert "13 CHD subjects" in source and "9 controls" in source
assert "window.__draw" in source
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=["--no-sandbox","--disable-dev-shm-usage"])
    page=browser.new_page(viewport={"width":1920,"height":1080},device_scale_factor=1)
    errors=[]
    page.on("pageerror",lambda e:errors.append(str(e)))
    page.goto(FILM.resolve().as_uri(),wait_until="load")
    page.wait_for_function("window.__ready === true",timeout=30000)
    img=page.evaluate("({width:document.getElementById('workstation').naturalWidth,height:document.getElementById('workstation').naturalHeight})")
    assert img["width"]>300 and img["height"]>180,img
    meta=page.evaluate("window.__meta")
    assert [meta[k] for k in ("W","H","FPS","DURATION")]==[1920,1080,24,84]
    for sec in (6.3,19.9,34.1,48.4,61.6,77.1):
        page.evaluate("(t)=>window.__draw(t)",sec)
        first=page.screenshot(type="jpeg",quality=94)
        assert Image.open(io.BytesIO(first)).size==(1920,1080)
        page.evaluate("(t)=>window.__draw(t)",sec+.48)
        later=page.screenshot(type="jpeg",quality=94)
        assert hashlib.sha256(first).digest()!=hashlib.sha256(later).digest(),f"Static scene {sec}"
        page.evaluate("(t)=>window.__draw(t)",sec)
        assert hashlib.sha256(first).digest()==hashlib.sha256(page.screenshot(type="jpeg",quality=94)).digest(),f"Nondeterministic scene {sec}"
    # Editorial pilot cohort scene must be in high contrast from pulse sonar world.
    page.evaluate("(t)=>window.__draw(t)",61)
    pilot=Image.open(io.BytesIO(page.screenshot(type="jpeg",quality=94))).convert("RGB")
    page.evaluate("(t)=>window.__draw(t)",8)
    echo=Image.open(io.BytesIO(page.screenshot(type="jpeg",quality=94))).convert("RGB")
    assert sum(pilot.getpixel((30,350)))>sum(echo.getpixel((30,350)))+220
    assert not errors,errors
    browser.close()
print("FILM07 PRE-FLIGHT PASSED: 6 changing scenes; 6/6 deterministic; authentic archive loads; clear pilot/cohort caveat")
