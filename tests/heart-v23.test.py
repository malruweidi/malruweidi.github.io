#!/usr/bin/env python3
"""Film 15 motion and provenance verification; no fictive biomedical data."""
import hashlib, json, sys
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
FILM=ROOT/"assets/films/series-v23-heart/film.html"
sys.path.insert(0,str(ROOT/"scripts"))
from importlib.machinery import SourceFileLoader
renderer=SourceFileLoader("renderer",str(ROOT/"scripts/render-heart-v23.py")).load_module()

def tests():
    record=renderer.validate()
    assert record["primary_source"].endswith("10.1002/9781119813040.ch5")
    markup=FILM.read_text()
    assert markup.count("function scene")==6
    assert "Math.random" not in markup
    assert "EXTERNAL TEST" in markup
    assert "NOT CLINICAL DATA" in markup
    points=((3.25,7.5),(16.0,24.25),(30.25,38.5),(44.25,51.25),
            (58.25,66.5),(72.25,79.75))
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,args=["--no-sandbox","--disable-dev-shm-usage"])
        page=browser.new_page(viewport={"width":1920,"height":1080})
        errors=[]
        page.on("pageerror",lambda e:errors.append(str(e)))
        page.goto(FILM.resolve().as_uri(),wait_until="load")
        page.wait_for_function("window.__ready===true")
        assert page.evaluate("window.__meta.chapters")==6
        snaps=[]
        for s,e in points:
            page.evaluate("(t) => window.__draw(t)",s)
            early=hashlib.sha256(page.screenshot(type="png")).hexdigest()
            page.evaluate("(t) => window.__draw(t)",e)
            late=hashlib.sha256(page.screenshot(type="png")).hexdigest()
            assert early!=late,("Static scene",s,e)
            snaps.extend([early,late])
        assert len(set(snaps))==12
        # Random-access determinism: frame does not depend on previous seek order.
        page.evaluate("(t) => window.__draw(t)",37.625)
        first=hashlib.sha256(page.screenshot(type="png")).hexdigest()
        page.evaluate("(t) => window.__draw(t)",69.25)
        page.evaluate("(t) => window.__draw(t)",37.625)
        second=hashlib.sha256(page.screenshot(type="png")).hexdigest()
        assert first==second,"Frame-seeking must be deterministic"
        browser.close()
        assert not errors,errors
    print("FILM15 TESTS PASS: original film verified, six live-motion chapters, 12 distinct frames, seek deterministic")

if __name__=="__main__":tests()
