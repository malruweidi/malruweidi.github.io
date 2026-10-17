#!/usr/bin/env python3
"""Validate topic-specific, attributable scientific concept visuals.

This detects substitution of unrelated research figures and ensures every
curated SVG actually rasterizes into the 1280x720 moving-image pipeline.
"""
import io
import json
import xml.etree.ElementTree as ET
from collections import Counter
from pathlib import Path

import cairosvg
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
ART=ROOT/"assets"/"films"/"art"/"source-specific"
SRC=ROOT/"assets"/"films"/"publication-series.json"
CLEAN_CREDIT="Original topic-specific conceptual scientific diagram"

def main():
    items=json.loads(SRC.read_text(encoding="utf8"))["items"]
    audited=[];asset_paths=set()
    for film in items:
        curated=[s for s in film["scenes"] if s["image"].startswith("assets/films/art/source-specific/")]
        if curated and film.get("source_visual_revision")!="curated-2026-10-17-v1":
            raise ValueError("Film has source-specific images but does not request a source refresh "+film["id"])
        for scene in curated:
            if not scene["image"].endswith(".svg"): raise ValueError("Expected source-specific SVG")
            if CLEAN_CREDIT not in scene["kind"]:raise ValueError("Missing explicit conceptual classification "+film["id"])
            if "not experimental" not in scene["credit"].lower():raise ValueError("Missing explicit non-experiment credit "+film["id"])
            img=ROOT/scene["image"]
            if not img.is_file():raise FileNotFoundError(img)
            asset_paths.add(img)
            audited.append((film["id"],scene["id"],img.name))
    if len(asset_paths)!=10 or len(audited)<40:
        raise ValueError("Topic-specific source atlas incomplete, expected ten designs and >40 scenes")
    for src in asset_paths:
        tree=ET.parse(src);root=tree.getroot()
        if root.tag!="{http://www.w3.org/2000/svg}svg":
            raise ValueError("Invalid SVG root "+str(src))
        if root.attrib.get("viewBox")!="0 0 1280 720":
            raise ValueError("Unexpected editorial drawing aspect ratio "+str(src))
        xml=src.read_text(encoding="utf8")
        if "SCHEMATIC ONLY" not in xml or "RUWAIDIX" not in xml:
            raise ValueError("Missing explanatory art disclosure "+str(src))
        png=cairosvg.svg2png(url=str(src),output_width=1280,output_height=720)
        with Image.open(io.BytesIO(png)) as image:
            if image.size!=(1280,720):raise ValueError("SVG raster output wrong size "+str(src))
        if len(png)<15000:raise ValueError("Concept SVG appears blank "+str(src))
    counts=Counter(a for _,_,a in audited)
    print("VALID: ",len(audited),"topic-specific scenes,",len(asset_paths),"rasterized source artboards")
    for name,c in sorted(counts.items()):print(name,c)

if __name__=="__main__":
    main()
