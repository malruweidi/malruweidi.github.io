#!/usr/bin/env python3
"""Motion-first film 02 regression tests; no fabricated experimental results."""
from pathlib import Path
import importlib.util
import hashlib
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
path=ROOT/"scripts/render-cilia-v10.py"
spec=importlib.util.spec_from_file_location("cerebral_cinema",path)
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
bounds=mod.validate()
assert len(bounds)==7 and abs(bounds[-1]-84.0)<1e-4
assert len(mod.SCENE_TITLES)==6
background=mod.backdrop()
with Image.open(mod.PAPER_IMAGE) as f:
    original=f.convert("RGB")
    dummy=Image.new("RGB",(1280,720),mod.INK)
    rectangle=mod.draw_figure(dummy,original)
    assert rectangle[2]<=954 and rectangle[3]<=380,rectangle

times=[(bounds[i]+bounds[i+1])*.5 for i in range(6)]
for t in times:
    a=mod.actual_frame(t,background,original,{},bounds)
    assert a.size==(1280,720)
    other=mod.actual_frame(t+.18,background,original,{},bounds)
    assert hashlib.sha256(a.tobytes()).digest()!=hashlib.sha256(other.tobytes()).digest(),f"Static film scene at {t}"
    # Random access cannot change content; frames must be seekable.
    again=mod.actual_frame(t,background,original,{},bounds)
    assert a.tobytes()==again.tobytes(),f"Nondeterministic visual frame at {t}"
# Assert archive frame mapper draws the actual supplied image rather than simulating it.
source=Image.new("RGB",(320,240),(221,24,37))
target=Image.new("RGB",(1280,720),mod.INK)
mod.draw_archival(target,source,2.5,1)
assert (221,24,37) in target.getdata(), "Actual moving-source frame was not incorporated"
# Short original clips must never become frozen final frames.
first=[Image.new("RGB",(320,240),(150+i,20,22)) for i in range(8)]
second=[Image.new("RGB",(320,240),(20,22,150+i)) for i in range(9)]
pair={1:first,4:second}
early=mod.frame_for_scene(1,.15,pair)
late=mod.frame_for_scene(1,1.7,pair)
assert early.getpixel((0,0))[0]>100
assert late.getpixel((0,0))[2]>100, "End of source clip wrongly frozen"
assert mod.frame_for_scene(1,1.71,pair).size==(320,240)
single=mod.frame_for_scene(1,1.7,{1:first})
assert single.tobytes()!=first[-1].tobytes(), "Single source must loop instead of freeze"
# No claim of cilia beating from a nonmotile primary cilium.
script=path.read_text()
assert "Passive bending only" in script
assert "not particle data" in script
assert "silently substitutes" not in script
print("V10 Film 02 seekable animation + primary figures + archived video test PASSED")
