#!/usr/bin/env python3
"""Independent visual QC for V5 scaffold documentary, using actual encoded MP4 frames."""
import hashlib,io,json,subprocess
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parents[1]
F=ROOT/"assets/films/series-v5"
M=F/"pla-scaffolds.mp4"
T=[4,11,19,26,34,41,49,56,64,71,79,86,94,101,109,116]
def frame(t):
    result=subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-ss",str(t),"-i",str(M),
            "-frames:v","1","-f","image2pipe","-vcodec","mjpeg","-q:v","3","pipe:1"],capture_output=True)
    if result.returncode or len(result.stdout)<900:
        raise RuntimeError("Cannot decode "+str(t)+"s: "+result.stderr.decode()[-400:])
    return Image.open(io.BytesIO(result.stdout)).convert("RGB")
def main():
    rec=json.loads((F/"pla-scaffolds.json").read_text())
    digest=hashlib.sha256(M.read_bytes()).hexdigest()
    assert rec["sha256"]==digest and rec["edition"].startswith("V5 cinematic")
    out=F/"qa";out.mkdir(exist_ok=True)
    tilew,tileh,lab=480,270,33
    image=Image.new("RGB",(tilew*4,(tileh+lab)*4),(12,31,33))
    d=ImageDraw.Draw(image)
    face=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",16)
    for k,t in enumerate(T):
        f=frame(t)
        f.thumbnail((tilew,tileh))
        x=(k%4)*tilew
        y=(k//4)*(tileh+lab)
        image.paste(f,(x+(tilew-f.width)//2,y))
        d.text((x+9,y+tileh+7),f"{t:03}s | FULL 2020 SOURCE-CORRECT V5 FRAME",
               font=face,fill=(237,224,209))
    jpg=out/"pla-scaffolds-contact.jpg"
    image.save(jpg,quality=90,optimize=True)
    info={"film":"pla-scaffolds","edition":"V5",
          "video_file":str(M.relative_to(ROOT)),"sha256":digest,
          "source_doi":"10.1016/j.surfcoat.2020.126216",
          "samples_seconds":T,"metadata":"Original figure source scales and axis text reviewed separately",
          "screening":"AUTOMATED FRAME CONTACT ONLY, HUMAN CONTENT AND ARTISTIC REVIEW OUTSTANDING"}
    (out/"pla-scaffolds-contact.json").write_text(json.dumps(info,indent=2)+"\n")
    print("V5 QA contact sheet",jpg,"hash",digest[:15])
if __name__=="__main__":main()
