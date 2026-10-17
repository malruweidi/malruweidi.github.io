#!/usr/bin/env python3
"""Build visual proof for every V7 cinematic treatment before any release."""
import argparse, json, importlib.util, hashlib, tempfile, shutil
from pathlib import Path
from PIL import Image, ImageDraw
ROOT=Path(__file__).resolve().parents[1]
MODEL=ROOT/"scripts/film-art-direction-v7.py"
CATALOG=ROOT/"assets/films/publication-series.json"
OUT=ROOT/"assets/films/quality-review-v7"
spec=importlib.util.spec_from_file_location("ruwaidix_cinema_art_v7",MODEL)
art=importlib.util.module_from_spec(spec);spec.loader.exec_module(art)
PAPER=(245,240,226);GOLD=(228,178,117);BG=art.BG

def fit_text(draw,text,font,size=38,max_width=1080):
    # No text overlap, max 2 lines; truncation is forbidden.
    words=text.split();lines=[];line=""
    for word in words:
        candidate=(line+" "+word).strip()
        if draw.textbbox((0,0),candidate,font=font)[2]>max_width and line:
            lines.append(line);line=word
        else:line=candidate
    if line:lines.append(line)
    if len(lines)>2:
        return fit_text(draw,text,art.font(size-2,True),size-2,max_width)
    return lines,size

def frame(entry,scene,phase,out,root=ROOT):
    slug=entry["id"]
    real=art.approved_photo(slug,scene,root)
    if real and phase in (0,1):
        with Image.open(real) as im:
            im=im.convert("RGB")
            # Entire research figure or personal photograph is kept visible.
            image=Image.new("RGB",(art.W,art.H),BG)
            im.thumbnail((1120,452),Image.Resampling.LANCZOS)
            x=(art.W-im.width)//2;y=94+(440-im.height)//2
            image.paste(im,(x,y))
        media=f"ARCHIVAL OR PUBLISHED SOURCE / {scene['kind']}"
        provenance=scene["image"]
    else:
        image=art.scene_art(slug,int(scene["id"]),phase,out.with_name(out.stem+"-plate.png"))
        image=Image.open(image).convert("RGB")
        media="EDITORIAL SCHEMATIC / NOT A RESEARCH FIGURE OR MEASURED RESULT"
        provenance="v7-original-illustration"
    # Avoid copying long title into an image that already contains it.
    d=ImageDraw.Draw(image)
    d.rectangle((0,542,art.W,720),fill=(13,37,43))
    d.rectangle((74,564,126,569),fill=GOLD)
    d.text((77,581),"RUWAIDIX   /   SCIENTIFIC FILM",font=art.font(15,True),fill=PAPER)
    lines,size=fit_text(d,scene["title"],art.font(34,True),34)
    for i,line in enumerate(lines):
        d.text((77,615+i*38),line,font=art.font(size,True),fill=PAPER)
    d.text((75,696),media[:90],font=art.font(11),fill=(179,201,192))
    d.text((1120,582),scene["id"]+" / 06",font=art.font(20,True),fill=GOLD)
    image.save(out,optimize=True)
    try:
        review_path=str(out.relative_to(ROOT))
    except ValueError:
        review_path=str(out)  # In a disposable render workspace, not a published file.
    return {"title":scene["title"],"phase":phase,"real_image":bool(real and phase in (0,1)),
            "image_source":provenance,"caption":media,"file":review_path}

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--all",action="store_true",help="Preview the first scene of all 35 titles")
    p.add_argument("--film",action="append",help="Film slug, can repeat")
    p.add_argument("--scene",type=int,default=1)
    p.add_argument("--phases",type=int,default=4)
    args=p.parse_args()
    catalog=json.loads(CATALOG.read_text())["items"]
    if len(catalog)!=35 or len(art.TYPES)!=35:
        raise AssertionError("The complete original bibliography must remain 35")
    selected=catalog if args.all else [x for x in catalog if x["id"] in (args.film or [])]
    if not selected:raise ValueError("No films selected")
    OUT.mkdir(parents=True,exist_ok=True)
    records=[]
    for entry in selected:
        if args.scene<1 or args.scene>6:raise ValueError("Scene out of bounds")
        scene=entry["scenes"][args.scene-1]
        row={"slug":entry["id"],"scene":scene["id"],"frames":[]}
        for k in range(args.phases):
            out=OUT/(entry["id"]+"-s"+scene["id"]+"-p"+str(k)+".webp")
            row["frames"].append(frame(entry,scene,k,out))
        records.append(row)
        print("PREVIEW",entry["id"],len(row["frames"]))
    manifest={"name":"Ruwaidix Cinema V7 source-safe storyboards","count":len(records),"films":records,
              "human_approval":"NOT COMPLETE: scientific peer and artistic review required before replacing published films"}
    (OUT/"review-index.json").write_text(json.dumps(manifest,indent=2))
if __name__=="__main__":main()
