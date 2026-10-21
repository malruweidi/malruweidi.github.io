#!/usr/bin/env python3
"""Pre-render adversarial motion, accessibility, integrity and reproducibility QA."""
from pathlib import Path
from hashlib import sha256
from playwright.sync_api import sync_playwright
from PIL import Image
import io,importlib.util
ROOT=Path(__file__).resolve().parents[1]
HTML=ROOT/"assets/films/series-v11-slit2-robo/film.html"
s=HTML.read_text()
for marker in ("window.__draw","window.__ready","window.__meta","REVIEW WORKSHEET",
               "MAY FAVOUR PROGRESSION","MAY HELP RESTRAIN IT",
               "10.1080/13543776.2026.2690118"):
 assert marker in s,marker
assert "Math.random(" not in s
assert "<img" not in s.lower()
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,args=["--no-sandbox","--disable-dev-shm-usage"])
 page=browser.new_page(viewport={"width":1920,"height":1080},device_scale_factor=1)
 errors=[]
 page.on("pageerror",lambda e:errors.append(str(e)))
 page.set_content(s,wait_until="load")
 page.wait_for_function("window.__ready === true",timeout=30000)
 meta=page.evaluate("window.__meta")
 assert (meta["W"],meta["H"],meta["FPS"],meta["DURATION"])==(1920,1080,24,84)
 times=[3.5,19.7,34.8,51.2,66.4,79.2]
 for t in times:
  page.evaluate("(t)=>window.__draw(t)",t)
  first=page.screenshot(type="jpeg",quality=96)
  assert Image.open(io.BytesIO(first)).size==(1920,1080)
  # Another frame before revisiting verifies random-access determinism.
  page.evaluate("(t)=>window.__draw(t)",t+.37)
  second=page.screenshot(type="jpeg",quality=96)
  assert sha256(first).digest()!=sha256(second).digest(),f"Static chapter near {t}"
  page.evaluate("(t)=>window.__draw(t)",t)
  repeated=page.screenshot(type="jpeg",quality=96)
  assert sha256(first).digest()==sha256(repeated).digest(),f"Nonseekable chapter {t}"
 # Source-aware contrasted palettes for patent and molecular segments.
 page.evaluate("(t)=>window.__draw(t)",33)
 paper=Image.open(io.BytesIO(page.screenshot(type="jpeg",quality=95))).convert("RGB")
 page.evaluate("(t)=>window.__draw(t)",19)
 noir=Image.open(io.BytesIO(page.screenshot(type="jpeg",quality=95))).convert("RGB")
 assert sum(paper.getpixel((20,250)))>sum(noir.getpixel((20,250)))+240
 assert not errors,errors
 browser.close()
print("FILM03 MOTION REVIEW PRE-FLIGHT PASS: 6/6 evolving scenes, seekable/deterministic, visual contrast")
