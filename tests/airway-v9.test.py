#!/usr/bin/env python3
"""Regression tests for the first independently rendered Ruwaidix cinematic film."""
from pathlib import Path
import importlib.util
import hashlib

R = Path(__file__).resolve().parents[1]
S = R / "scripts/render-airway-v9.py"
spec = importlib.util.spec_from_file_location("airway_v9",S)
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
m.validate()
from PIL import Image
with Image.open(m.FIGURE) as f:
    source=f.convert("RGBA")
    fitted,xy=m.crop_contain(source)
    assert fitted.width<=960 and fitted.height<=422
    assert xy[0]>=150 and xy[1]>=143
bg=m.visual_background()
# A seekable frame always has exactly the same pixels, regardless of call order.
for t in (0.4,8.0,14.0,28.0,43.0,58.0,75.0):
    a=m.frame(t,source,bg)
    assert a.size==(1280,720)
    ha=hashlib.sha256(a.tobytes()).hexdigest()
    _=m.frame(t+0.15,source,bg)
    hb=hashlib.sha256(m.frame(t,source,bg).tobytes()).hexdigest()
    assert ha==hb, f"Non-seekable frame {t}"
# Genuine temporal changes rather than old stationary slide scenes.
for a,b in ((2.0,5.0),(12.0,18.0),(38.5,42.0),(53.0,62.0)):
    x=m.frame(a,source,bg); y=m.frame(b,source,bg)
    assert hashlib.sha256(x.tobytes()).digest()!=hashlib.sha256(y.tobytes()).digest()
# Nothing on the public film contains earlier workflow-status captions.
script=S.read_text()
for prohibited in ("FAKE P VALUE","VISUAL PROOF /","EDITORIAL SCHEMATIC /","INTERNAL REVIEW /"):
    assert prohibited not in script.upper()
print("V9 airway motion, source containment, seekability, research claims: PASS")
