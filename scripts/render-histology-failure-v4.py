#!/usr/bin/env python3
"""V4 visual retake: documentary photographs dominate the failed-section story.

Uses only three original owner photographs. No generic zebrafish data and no
fabricated histological sections. Original V1/V2/V3 films stay unchanged.
"""
import importlib.util,json,functools,math
from pathlib import Path
from PIL import Image,ImageDraw,ImageFilter,ImageEnhance

ROOT=Path(__file__).resolve().parents[1]
path=ROOT/"scripts/render-histology-failure-v3.py"
spec=importlib.util.spec_from_file_location("histology_original_v3",path)
base=importlib.util.module_from_spec(spec);spec.loader.exec_module(base)
base.OUT=ROOT/"assets/films/series-v4"
W,H=base.W,base.H
WHITE=base.WHITE;GOLD=base.GOLD;TEAL=base.TEAL;GRAY=base.GRAY;DARK=base.DARK

@functools.lru_cache(maxsize=4)
def background(index):
    original=base.photo(index)
    ratio=max(W/original.width,H/original.height)
    resized=original.resize((round(original.width*ratio),round(original.height*ratio)),Image.Resampling.BICUBIC)
    centx=(resized.width-W)//2;centy=(resized.height-H)//2
    cropped=resized.crop((centx,centy,centx+W,centy+H))
    blurred=cropped.filter(ImageFilter.GaussianBlur(18))
    return ImageEnhance.Brightness(blurred).enhance(.22)

@functools.lru_cache(maxsize=8)
def foreground(index,w,h):
    original=base.photo(index)
    return ImageOps.contain(original,(w,h),Image.Resampling.LANCZOS)

from PIL import ImageOps

def backdrop(image,index):
    image.paste(background(index),(0,0))
    draw=ImageDraw.Draw(image)
    draw.rectangle((0,0,W,H),outline=(42,82,78),width=3)
    draw.line((45,76,1232,76),fill=(104,144,132),width=2)
    base.text(draw,55,37,"RUWAIDIX   /   ORIGINAL LABORATORY PHOTOGRAPHS   /   LATE 2025",14,TEAL,"bold")

def film_image(image,index,t,x,y,w,h):
    pic=foreground(index,w,h)
    # slow documentary camera glide, leaving all specimen pixels untouched
    X=x+(w-pic.width)//2+int(5*math.sin(t*.3))
    Y=y+(h-pic.height)//2+int(7*math.sin(t*.23))
    draw=ImageDraw.Draw(image)
    draw.rounded_rectangle((x-10,y-10,x+w+10,y+h+10),radius=7,fill=(218,213,191))
    image.paste(pic,(X,Y))
    draw=ImageDraw.Draw(image)
    draw.rectangle((X-1,Y-1,X+pic.width+1,Y+pic.height+1),outline=GOLD,width=2)
    return draw

def label(draw,msg):
    draw.rectangle((43,653,1236,708),fill=(13,31,35))
    base.text(draw,59,670,msg,14,GRAY)

def photo_scene(index,t,image_num,eyebrow,headlines,note,portrait=False):
    im,d=base.frame(index,t)
    backdrop(im,image_num)
    d=film_image(im,image_num,t,624 if portrait else 504,100,553 if portrait else 670,525)
    d.rectangle((25,145,588,585),fill=(12,27,32))
    base.text(d,65,189,eyebrow.upper(),16,GOLD,"bold")
    size=58 if max(map(len,headlines))<13 else 49
    for k,line in enumerate(headlines):
        base.text(d,61,246+k*(size+14),line,size,WHITE,"serif")
    base.text(d,64,540,note,18,TEAL)
    label(d,"AUTHENTIC OWNER SOURCE PHOTO / FAILED ATTEMPT / NEVER A SUCCESSFUL SECTION")
    return im,d

def s0(im,d,t):
    pic,_=photo_scene(0,t,0,"orientation mattered",["WHAT IF THE","SECTION MISSES","THE ANATOMY?"],"The specimens were aligned before embedding.",portrait=True)
    im.paste(pic,(0,0))

def s1(im,d,t):
    pic,_=photo_scene(1,t,0,"first material",["TWO-PERCENT","AGAROSE"],"Support the chosen orientation.",portrait=True)
    im.paste(pic,(0,0))

def s3(im,d,t):
    pic,_=photo_scene(3,t,1,"actual method photograph",["THIS IS THE","INSTRUMENT"],"An apparatus photo is not a section.",portrait=False)
    im.paste(pic,(0,0))

def s5(im,d,t):
    pic,_=photo_scene(5,t,2,"actual failed paraffin block",["THE BLOCK","BROKE APART"],"The interface would not hold in sectioning.",portrait=True)
    im.paste(pic,(0,0))

def s6(im,d,t):
    pic,_=photo_scene(6,t,2,"negative result",["NO USABLE","SECTION"],"No successful stained slide resulted.",portrait=True)
    im.paste(pic,(0,0))

def main():
    revised=list(base.DRAWERS)
    revised[0]=s0;revised[1]=s1;revised[3]=s3;revised[5]=s5;revised[6]=s6
    base.DRAWERS=revised
    base.main()
    manifest=base.OUT/"histology-failure.json"
    info=json.loads(manifest.read_text())
    info["edition"]="V4 owner-photo-first documentary composition / preserved negative result"
    info["picture_design"]="Full-height original specimen and microtomy photographs over subdued photographic backplates with camera motion, separated from the conceptual mechanics scenes."
    info["human_review"]="NOT APPROVED: full-length scientific and artistic screening required."
    manifest.write_text(json.dumps(info,ensure_ascii=False,indent=2)+"\n")
    print("CINEMATIC NEGATIVE RESULT V4 READY FOR SOURCE-LINKED REVIEW")

if __name__=="__main__":main()
