#!/usr/bin/env python3
"""Fail-fast moving-film checks, 8 chapters; historical witness provenance."""
from hashlib import sha256
from pathlib import Path
import io,json
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
HTML=ROOT/"assets/films/series-v13-medieval/film.html"
SOURCE=ROOT/"assets/films/source-manuscripts/wellcome-ms-arabic-1002/canvas-013.jpg"
REGISTER=ROOT/"assets/films/source-manuscripts/wellcome-ms-arabic-1002/source-register.json"
VTT=ROOT/"assets/films/series-v8-primary/making-medicines-keep.vtt"
assert SOURCE.is_file() and SOURCE.stat().st_size>100000
data=json.loads(REGISTER.read_text(encoding="utf8"))
assert data["copy_date"]=="Egypt, 1904 CE"
assert data["staged_pages"][2]["subject_identification"].startswith("UNVERIFIED")
html=HTML.read_text(encoding="utf8")
for word in ("window.__draw","window.__ready","window.__meta",
             "Minhāj al-dukkān","A pharmacy in the text.","A base. Many syrups.",
             "Consistency was the endpoint.","And when a syrup failed?",
             "not verified as the syrup passage"):
    assert word in html,word
assert "Math.random(" not in html
assert VTT.read_text().count("-->")>=28
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=["--no-sandbox","--disable-dev-shm-usage"])
    page=browser.new_page(viewport={"width":1920,"height":1080},device_scale_factor=1)
    errors=[]
    page.on("pageerror",lambda e:errors.append(str(e)))
    page.goto(HTML.resolve().as_uri(),wait_until="load")
    page.wait_for_function("window.__ready === true",timeout=30000)
    n=page.evaluate("document.getElementById('manuscript').naturalWidth")
    assert n>=1200,n
    meta=page.evaluate("window.__meta")
    assert [meta[k] for k in ("W","H","FPS","DURATION")]==[1920,1080,24,120]
    for t in (7.2,22.1,37.3,52.4,67.5,82.6,97.7,112.8):
        page.evaluate("(t)=>window.__draw(t)",t)
        first=page.screenshot(type="jpeg",quality=93)
        assert Image.open(io.BytesIO(first)).size==(1920,1080)
        page.evaluate("(t)=>window.__draw(t)",t+.48)
        second=page.screenshot(type="jpeg",quality=93)
        assert sha256(first).digest()!=sha256(second).digest(),f"Static historical scene at {t}"
        page.evaluate("(t)=>window.__draw(t)",t)
        assert sha256(first).digest()==sha256(page.screenshot(type="jpeg",quality=93)).digest(),f"Not frame seekable {t}"
    assert not errors,errors
    browser.close()
print("FILM05 PRE-RENDER PASS: eight dynamic scenes, intact 1904 source, accurate later-witness label, deterministic motion")
