#!/usr/bin/env python3
"""Purpose-built explanatory animation for Ruwaidix v2 films.

All motion is schematic. Source photographs remain visible; published figures
are never panned, re-touched, numerically animated or represented as data.
No paid media service or proprietary model is involved.
"""
import io
import math
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps

W, H, FPS = 1280, 720, 24
INK = (13, 33, 39)
CREAM = (244, 241, 230)
GREEN = (146, 203, 176)
GOLD = (218, 173, 129)
FONT_ROOT = Path("/usr/share/fonts/truetype/dejavu")
FONT = FONT_ROOT / "DejaVuSans.ttf"
BOLD = FONT_ROOT / "DejaVuSans-Bold.ttf"

def ft(size=21, bold=False):
    return ImageFont.truetype(str(BOLD if bold else FONT), size)

def mix(a, b, t):
    return a + (b-a)*min(1,max(0,t))

def label(d, xy, text, color=CREAM, size=19, bold=False, max_chars=43):
    d.text(xy, text[:max_chars], font=ft(size,bold), fill=color)

def card(d, rect, fill=(19,45,51), outline=(66,104,103), width=2):
    d.rounded_rectangle(rect, radius=14, fill=fill, outline=outline, width=width)

def make_base(picture, original_label):
    """The original scene photograph/drawing is deliberately shown at left."""
    im=Image.new("RGB",(W,H),INK)
    d=ImageDraw.Draw(im)
    for y in range(H):
        v=y/H
        d.line((0,y,W,y),fill=(int(13+9*v),int(34+10*v),int(41+9*v)))
    card(d,(50,143,616,480))
    card(d,(632,143,1227,480))
    with Image.open(picture) as src:
        src=ImageOps.exif_transpose(src).convert("RGB")
        src.thumbnail((534,300),Image.Resampling.LANCZOS)
        im.paste(src,(333-src.width//2,312-src.height//2))
    label(d,(67,455),"ORIGINAL SOURCE VISUAL",GREEN,14,True)
    # Never call source figures experimental footage.
    label(d,(646,153),"EXPLANATORY MOTION  /  NOT MEASURED DATA",GOLD,13,True,58)
    return im

def draw_progress(d,t):
    x0,x1,y=62,1220,711
    d.line((x0,y,x1,y),fill=(61,83,82),width=2)
    x=int(mix(x0,x1,t))
    d.line((x0,y,x,y),fill=GOLD,width=3)
    d.ellipse((x-4,y-4,x+4,y+4),fill=CREAM)

def dots_on_arc(d,cx,cy,r,phase, count=14):
    for i in range(count):
        a=2*math.pi*i/count
        ox=cx+r*math.cos(a)
        oy=cy+r*math.sin(a)
        rr=4+2*math.sin(phase*7+a)**2
        d.ellipse((ox-rr,oy-rr,ox+rr,oy+rr),fill=GREEN)

def motif(d,kind,t,annotations):
    """Draw genuinely moving explanatory topology, never synthetic observations."""
    x0,y0,x1,y1=652,194,1203,418
    ease=t*t*(3-2*t)
    if kind=="interface":
        yy=340
        for n in range(10):
            x=660+51*n
            d.rounded_rectangle((x,yy,x+43,yy+44),radius=9,outline=GREEN,width=2)
            d.ellipse((x+17,yy+14,x+26,yy+23),fill=(62,133,133))
        pos=670+430*ease
        d.arc((pos-78,244,pos+90,402),80,280,fill=GOLD,width=9)
        for k in range(3):
            arrow_x=int(685+(k*79+290*t)%380)
            d.line((arrow_x,275,arrow_x+37,275),fill=(101,171,200),width=3)
            d.line((arrow_x+31,270,arrow_x+38,275,arrow_x+31,280),fill=(101,171,200),width=3)
    elif kind=="vessel":
        pts1=[(x,264+22*math.sin((x-655)/68)) for x in range(658,1190,8)]
        pts2=[(x,358+22*math.sin((x-655)/68)) for x in range(658,1190,8)]
        d.line(pts1,fill=GREEN,width=7,joint="curve")
        d.line(pts2,fill=GREEN,width=7,joint="curve")
        for k in range(5):
            x=658+(k*97+450*t)%510
            y=311+22*math.sin((x-655)/68)
            d.ellipse((x-7,y-5,x+7,y+5),fill=(220,119,113))
        for k in range(7):
            x=687+k*65
            y=264+22*math.sin((x-655)/68)
            d.line((x,y,x+10*math.sin(12*t+k),y+20),fill=GOLD,width=2)
    elif kind=="vesicle":
        cx,cy=928,314
        d.ellipse((cx-107,cy-107,cx+107,cy+107),outline=GOLD,width=6)
        d.ellipse((cx-86,cy-86,cx+86,cy+86),outline=GREEN,width=6)
        dots_on_arc(d,cx,cy,97,t)
        for k in range(9):
            theta=2*math.pi*k/9+0.8*t
            x=cx+54*math.cos(theta)
            y=cy+54*math.sin(theta)
            d.ellipse((x-5,y-5,x+5,y+5),fill=(137,174,219))
        d.arc((790,171,1065,459),30,110,fill=(73,110,113),width=2)
    elif kind=="pharmacy":
        d.line((831,228,831,256,805,286,805,377,1040,377,1040,286,1014,256,1014,228),fill=GOLD,width=5)
        d.line((807,349,1038,349),fill=GREEN,width=3)
        for k in range(5):
            y=219+(k*46+200*t)%120
            x=910+15*math.sin(k*7+t*11)
            d.ellipse((x-6,y-10,x+6,y+10),fill=GOLD)
        d.arc((859,293,979,350),0,185,fill=GREEN,width=4)
        label(d,(843,401),"RECONSTRUCTED PROCESS",GREEN,14,True)
    elif kind=="histology":
        d.rectangle((704,247,1110,284),outline=GREEN,width=4)
        d.rectangle((704,288,1110,360),outline=GOLD,width=4)
        d.line((704,285+6*math.sin(t*4),1110,285-6*math.sin(t*4)),fill=(222,112,106),width=5)
        bx=1100-340*ease
        d.polygon([(bx,200),(bx+28,205),(bx-26,385)],fill=(190,203,208))
        label(d,(712,222),"AGAROSE",GREEN,14,True)
        label(d,(712,371),"PARAFFIN  /  SECTION FAILED",GOLD,13,True)
    elif kind=="materials":
        for j in range(4):
            for k in range(7):
                x=736+k*61
                y=236+j*48
                d.line((x,y,x+60,y),fill=(88,130,121),width=3)
                d.ellipse((x-7,y-7,x+7,y+7),fill=GREEN)
        for k in range(7):
            x=736+k*61
            dy=30*min(1,max(0,3*t-k*.30))
            d.line((x,235,x+12,235-dy),fill=GOLD,width=3)
            if dy>4: d.ellipse((x+7,230-dy,x+17,240-dy),fill=GOLD)
    elif kind=="chip":
        d.line((695,278,858,278,930,238,1132,238),fill=GREEN,width=13,joint="curve")
        d.line((858,278,930,346,1132,346),fill=GOLD,width=13,joint="curve")
        for k in range(6):
            xx=708+((k*87+430*t)%399)
            yy=278 if xx<858 else 238+(858-xx)*.15
            d.ellipse((xx-7,yy-7,xx+7,yy+7),fill=(172,210,228))
    elif kind=="organ":
        for k in range(9):
            x=684+k*55
            d.rounded_rectangle((x,285,x+43,351),radius=13,outline=GREEN,width=3)
        for k in range(9):
            xx=700+(k*91+182*t)%430
            yy=244+12*math.sin(k*5+t*10)
            d.ellipse((xx-7,yy-7,xx+7,yy+7),fill=GOLD)
        d.line((682,356,1170,356),fill=(213,127,116),width=4)
    elif kind=="signal":
        points=[]
        for i in range(470):
            xx=672+i
            wave=math.sin(i/23+t*12)*22+math.sin(i/47+t*5)*12
            points.append((xx,306+wave))
        d.line(points,fill=GREEN,width=4)
        xx=672+int(470*t)
        d.line((xx,217,xx,386),fill=GOLD,width=3)
        label(d,(758,393),"ILLUSTRATIVE SIGNAL, NOT A READOUT",GOLD,13,True,53)
    elif kind=="assay":
        # Qualitative cell fate, with NO numeric counts, viability threshold or data.
        for ix in range(8):
            for iy in range(3):
                x=719+ix*54
                y=234+iy*58
                phase=math.sin(ix*1.3+iy*.7+2*t*math.pi)
                d.rounded_rectangle((x-17,y-15,x+17,y+15),radius=12,
                    outline=GREEN if phase>-.16 else GOLD,width=2)
                d.ellipse((x-4,y-4,x+4,y+4),fill=GREEN if phase>-.16 else GOLD)
        label(d,(725,413),"ILLUSTRATIVE CELLS / NO COUNT DATA",GOLD,14,True)
    elif kind=="chamber":
        d.rectangle((702,252,1146,389),outline=GREEN,width=5)
        d.line((709,360,1139,360),fill=GOLD,width=6)
        for k in range(10):
            x=722+k*43
            d.ellipse((x-12,367,x+12,387),outline=GREEN,width=2)
        pos=718+378*t
        d.arc((pos-65,274,pos+65,360),40,160,fill=GOLD,width=6)
        for k in range(5):
            x=713+(k*86+200*t)%420
            d.line((x,312,x+37,312),fill=(115,184,211),width=3)
            d.polygon([(x+31,307),(x+39,312),(x+31,317)],fill=(115,184,211))
        label(d,(704,410),"SCHEMATIC / DIMENSIONS NOT TO SCALE",GOLD,12,True)
    elif kind=="translation":
        card(d,(678,255,876,359),fill=(24,57,61),outline=GREEN)
        card(d,(968,255,1168,359),fill=(45,39,35),outline=GOLD)
        label(d,(706,276),"EXPERIMENT",GREEN,20,True)
        label(d,(984,276),"HUMAN USE?",GOLD,20,True)
        d.line((886,305,946,305),fill=GOLD,width=4)
        d.polygon([(940,297),(952,305),(940,313)],fill=GOLD)
        for k in range(3):
            if t > (.18+k*.19):
                d.line((998+k*38,337,1014+k*38,337),fill=GOLD,width=3)
        label(d,(721,396),"TRANSLATION REQUIRES INDEPENDENT EVIDENCE",GOLD,13,True,57)
    elif kind=="molecule":
        pts=[(757,285),(851,251),(930,313),(1022,250),(1090,329),(946,374),(801,370)]
        edges=[(0,1),(1,2),(2,3),(3,4),(2,5),(5,6),(6,0)]
        for a,b in edges:
            d.line((*pts[a],*pts[b]),fill=(85,153,145),width=3)
        for k,(x,y) in enumerate(pts):
            rad=10+2*math.sin(10*t+k)
            d.ellipse((x-rad,y-rad,x+rad,y+rad),fill=GOLD if k in (1,3) else GREEN)
        moving=pts[min(len(pts)-1,int(t*(len(pts)-1)))]
        d.ellipse((moving[0]-23,moving[1]-23,moving[0]+23,moving[1]+23),outline=(211,231,230),width=3)
        label(d,(710,409),"TOPOLOGY SYMBOL ONLY / NO ASSIGNED STRUCTURE",GOLD,12,True,57)
    elif kind=="editorial":
        for k,entry in enumerate(annotations):
            reveal=min(1,max(0,4*t-k*.9))
            xx=670+int((1-reveal)*120)
            yy=223+k*69
            card(d,(xx,yy,1165,yy+51),fill=(26,58,61),outline=GREEN if k==min(2,int(t*3)) else (56,87,83))
            label(d,(xx+15,yy+13),entry,GOLD if k==min(2,int(t*3)) else CREAM,18,True,42)
    else:   # network / receptor / molecular binding as symbolic relationships
        pts=[(730,313),(921,250),(1101,315),(922,385)]
        edges=[(0,1),(1,2),(0,3),(3,2),(1,3)]
        for a,b in edges:
            d.line((*pts[a],*pts[b]),fill=(74,125,120),width=4)
            u=(t*1.5+(a+b)*.17)%1
            qx=mix(pts[a][0],pts[b][0],u)
            qy=mix(pts[a][1],pts[b][1],u)
            d.ellipse((qx-5,qy-5,qx+5,qy+5),fill=GOLD)
        for k,(x,y) in enumerate(pts):
            rr=22+3*math.sin(t*6+k)
            d.ellipse((x-rr,y-rr,x+rr,y+rr),fill=INK,outline=GREEN,width=5)
    if kind!="editorial":
        # A manually authored 3-beat explanatory legend.
        for i,ann in enumerate(annotations):
            active=min(2,int(t*3.1))==i
            label(d,(662,431+i*0),ann,GOLD if active else (148,169,160),15,active,max_chars=39) if i==min(2,int(t*3.1)) else None

def animate_scene(scene, picture, title_overlay, duration, output):
    """Encode a time-varying 24-fps shot with source image and provenance intact."""
    notes=scene.get("_remake")
    if not notes: raise ValueError("Missing explicit film motion plan")
    base=make_base(picture, scene.get("kind",""))
    over=Image.open(title_overlay).convert("RGBA")
    frames=int(round(duration*FPS))
    cmd=["ffmpeg","-hide_banner","-loglevel","error","-y",
         "-f","image2pipe","-framerate",str(FPS),"-vcodec","mjpeg","-i","pipe:0",
         "-an","-r",str(FPS),"-c:v","libx264","-preset","veryfast",
         "-crf","22","-pix_fmt","yuv420p","-frames:v",str(frames),
         "-movflags","+faststart",str(output)]
    proc=subprocess.Popen(cmd,stdin=subprocess.PIPE,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
    try:
        for i in range(frames):
            t=i/max(1,frames-1)
            canvas=base.copy()
            d=ImageDraw.Draw(canvas)
            motif(d,notes["motif"],t,notes["annotations"])
            draw_progress(d,t)
            canvas=Image.alpha_composite(canvas.convert("RGBA"),over).convert("RGB")
            memory=io.BytesIO()
            canvas.save(memory,format="JPEG",quality=86,subsampling=0)
            proc.stdin.write(memory.getvalue())
    finally:
        proc.stdin.close()
    error=proc.stderr.read().decode("utf-8",errors="replace")
    if proc.wait()!=0:
        raise RuntimeError("Animated shot encoding failed: "+error[-3000:])
    return "source-backed authored schematic animation"
