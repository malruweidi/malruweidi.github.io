#!/usr/bin/env python3
"""Check that the twelve new scientific illustration plates are valid and attributable.
This is a technical check; it cannot judge aesthetics or factual accuracy.
"""
import io
import re
import xml.etree.ElementTree as ET
from pathlib import Path
import cairosvg
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
SCENES=ROOT/"assets/films/art"
SOURCES=[
 "v2-ace2-membrane.svg","v2-ace2-soluble.svg","v2-ace2-context.svg",
 "v2-ceramic-lattice.svg","v2-ceramic-processing.svg","v2-ceramic-load.svg",
 "v2-food-deposition.svg","v2-food-rheology.svg","v2-food-shape.svg",
 "v2-microfluid-channel.svg","v2-microfluid-capture.svg","v2-microfluid-readout.svg"
]
def audit():
 for name in SOURCES:
  p=SCENES/name
  assert p.is_file(),name
  source=p.read_text(encoding="utf-8")
  assert re.search(r"ORIGINAL CONCEPTUAL EXPLANATION",source),name
  assert "NOT MEASURED EXPERIMENTAL DATA" in source,name
  root=ET.fromstring(source)
  assert root.tag.endswith("svg"),name
  assert root.attrib.get("viewBox")=="0 0 1280 720",name
  buf=cairosvg.svg2png(bytestring=source.encode("utf-8"),output_width=1280,output_height=720)
  with Image.open(io.BytesIO(buf)) as im:
   assert im.size==(1280,720),name
   assert im.getbbox() is not None,name
  print("Valid scientific editorial plate",name)
 print("Technical proof: 12/12 SVG plates decoded and rasterized; artistic approval NOT implied.")
if __name__=="__main__":audit()
