#!/usr/bin/env python3
"""Film 04: fail-fast animation, source-figure and scientific-claims tests."""
from pathlib import Path
from hashlib import sha256
import io
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
HTML=ROOT/"assets/films/series-v12-curcumin/film.html"
PAPER=ROOT/"assets/home-archive/figure-cyanide-sensor.jpg"
t=HTML.read_text(encoding="utf8")
for token in ["window.__draw","window.__meta","window.__ready","sourceFigure",
              "ACETONITRILE  90%","WATER  10%",
              "HYDROXIDE ALSO SHOWED A RESPONSE","421 nm","520 nm",
              "NOT PURE WATER","BIOIMAGING ≠ CLINICAL VALIDATION"]:
    assert token in t,token
assert "Math.random(" not in t
assert PAPER.stat().st_size>20000
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=["--no-sandbox","--disable-dev-shm-usage"])
    page=browser.new_page(viewport={"width":1920,"height":1080},device_scale_factor=1)
    errors=[]
    page.on("pageerror",lambda e:errors.append(str(e)))
    page.goto(HTML.resolve().as_uri(),wait_until="load")
    page.wait_for_function("window.__ready === true",timeout=30000)
    size=page.evaluate("({w:document.getElementById('primary-figure').naturalWidth,h:document.getElementById('primary-figure').naturalHeight})")
    assert size["w"]>=600 and size["h"]>=300,size
    meta=page.evaluate("window.__meta")
    assert [meta[k] for k in ("W","H","FPS","DURATION")]==[1920,1080,24,84]
    times=[5.0,19.7,31.4,47.2,62.3,78.0]
    for second in times:
        page.evaluate("(t)=>window.__draw(t)",second)
        a=page.screenshot(type="jpeg",quality=95)
        assert Image.open(io.BytesIO(a)).size==(1920,1080)
        page.evaluate("(t)=>window.__draw(t)",second+.42)
        b=page.screenshot(type="jpeg",quality=95)
        assert sha256(a).digest()!=sha256(b).digest(),f"Static scene at {second}"
        page.evaluate("(t)=>window.__draw(t)",second)
        c=page.screenshot(type="jpeg",quality=95)
        assert sha256(c).digest()==sha256(a).digest(),f"Nonseekable scene {second}"
    # Audited aesthetic: measured difference between spectral noir and research page.
    page.evaluate("(t)=>window.__draw(t)",77.9)
    paper=Image.open(io.BytesIO(page.screenshot(type="jpeg",quality=93))).convert("RGB")
    page.evaluate("(t)=>window.__draw(t)",5.0)
    noir=Image.open(io.BytesIO(page.screenshot(type="jpeg",quality=93))).convert("RGB")
    assert sum(paper.getpixel((32,350)))>sum(noir.getpixel((32,350)))+200
    assert not errors,errors
    browser.close()
print("Film 04: 6 moving scenes, random-access motion, full original source figure, scientific qualifications — PASS")
