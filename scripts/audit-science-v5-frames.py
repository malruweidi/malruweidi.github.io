#!/usr/bin/env python3
"""Complete-picture contact sheets for new real-source V5 science documentaries.

QA timestamps are added BELOW the frame and linked to the film's SHA. No
text or false overlays obscure panel scales, titres, charts or the source
camera view. Technical inspection is not an editorial/narrator approval.
"""
import hashlib,io,json,subprocess
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageOps

ROOT=Path(__file__).resolve().parents[1]
F=ROOT/"assets/films/series-v5"
QA=F/"qa"
SAMPLE=[4,11,19,26,34,41,49,56,64,71,79,86,94,101,109,116]
FT="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

def frame(movie,t):
    p=subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-ss",str(t),"-i",str(movie),
                      "-map","0:v:0","-frames:v","1","-f","image2pipe","-vcodec","mjpeg","-q:v","4","pipe:1"],
                      capture_output=True)
    if p.returncode:raise RuntimeError(p.stderr.decode("utf8","replace")[-300:])
    with Image.open(io.BytesIO(p.stdout)) as i:
        return ImageOps.contain(i.convert("RGB"),(480,270),Image.Resampling.LANCZOS)

def main():
    QA.mkdir(exist_ok=True,parents=True)
    count=0
    for mp4 in sorted(F.glob("*.mp4")):
        manifest=json.loads(mp4.with_suffix(".json").read_text())
        blob=hashlib.sha256(mp4.read_bytes()).hexdigest()
        if blob!=manifest.get("sha256"):raise ValueError("Source SHA mismatch "+mp4.name)
        board=Image.new("RGB",(480*4,309*4),(12,31,36));d=ImageDraw.Draw(board)
        font=ImageFont.truetype(FT,16)
        for index,t in enumerate(SAMPLE):
            im=frame(mp4,t)
            x=(index%4)*480;y=(index//4)*309
            board.paste(im,(x,y))
            d.text((x+12,y+277),f"{t:03d} s  |  ACTUAL ENCODED VIDEO FRAME",font=font,fill=(239,230,210))
        dest=QA/(mp4.stem+"-contact.jpg")
        board.save(dest,quality=89,subsampling=0,optimize=True)
        meta={"film":mp4.stem,"source_mp4":str(mp4.relative_to(ROOT)),
              "source_sha256":blob,"frames_seconds":SAMPLE,
              "full_encoded_pixels_preserved":True,
              "approval":"SOURCE/QC-REVIEW ONLY; not a guarantee of artistic or scientific approval"}
        (QA/(mp4.stem+"-contact.json")).write_text(json.dumps(meta,indent=2)+"\n")
        count+=1
        print("V5 SOURCE-HASHED FRAME REVIEW",mp4.stem,flush=True)
    if count<2:raise ValueError("Expect multiple real-source films before cross-film visual audit")
if __name__=="__main__":main()
