#!/usr/bin/env python3
"""Full-frame source-bound film inspection: curcumin/cyanide & zebrafish failure.

Only validated owner-supplied images are admitted as documentary evidence.
Generate 16 real MP4 frames without synthetic content or occluding labels.
"""
import hashlib,io,json,subprocess
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont

ROOT=Path(__file__).resolve().parents[1]
MOVIES=ROOT/"assets/films/series-v3"
TIMES=[3,11,18,26,33,41,48,56,63,71,78,86,93,101,108,116]
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
NAMES={
"curcumin-cyanide":{
"orig":"assets/home-archive/figure-cyanide-sensor.jpg",
"source_git_sha":"05f658f81f63fe0811699dd686955a232be97e36",
"doi":"10.1039/C9AY01557D",
"boundary":"A four-panel author-archived study figure; hydroxide and organic co-solvent caveats."
},
"histology-failure":{
"orig":"assets/2026-10-13-new-photos/zebrafish-paraffin-microtomy-failure.webp",
"source_git_sha":"746a499ab1571a351a60bbacdcdb694560ea952f",
"doi":None,
"boundary":"First-person unsuccessful experiment; not a published successful histology figure."
}}

def run(args):
    p=subprocess.run(args,capture_output=True)
    if p.returncode:raise RuntimeError("Failed: "+str(args)+" "+p.stderr.decode()[-600:])
    return p.stdout

def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def gitsha(p):
    data=p.read_bytes()
    return hashlib.sha1(b"blob "+str(len(data)).encode()+b"\0"+data).hexdigest()

def examine(stem,expected):
    mp4=MOVIES/(stem+".mp4")
    if not mp4.exists():
        print("PENDING NO ARTIFACT:",stem)
        return False
    meta=json.loads((MOVIES/(stem+".json")).read_text())
    assert sha(mp4)==meta["sha256"]
    assert gitsha(ROOT/expected["orig"])==expected["source_git_sha"]
    assert (MOVIES/(stem+".vtt")).read_text().startswith("WEBVTT")
    assert len(meta["chapters"])==8
    if expected["doi"]:assert meta["primary_doi"]==expected["doi"]
    else:assert meta["result"].startswith("UNSUCCESSFUL")
    ff=json.loads(run(["ffprobe","-loglevel","error","-show_format","-show_streams","-of","json",str(mp4)]))
    assert abs(float(ff["format"]["duration"])-120)<.45
    v=next(x for x in ff["streams"] if x["codec_type"]=="video")
    a=next(x for x in ff["streams"] if x["codec_type"]=="audio")
    assert (v["width"],v["height"])==(1280,720) and v["codec_name"]=="h264" and a["codec_name"]=="aac"
    w,h,pad=480,270,33
    im=Image.new("RGB",(4*w,4*(h+pad)),(10,27,32))
    draw=ImageDraw.Draw(im);face=ImageFont.truetype(FONT,14)
    for i,t in enumerate(TIMES):
        raw=run(["ffmpeg","-hide_banner","-loglevel","error","-ss",str(t),"-i",str(mp4),"-frames:v","1",
                 "-f","image2pipe","-vcodec","mjpeg","-q:v","4","pipe:1"])
        shot=Image.open(io.BytesIO(raw)).convert("RGB").resize((w,h),Image.Resampling.LANCZOS)
        x=i%4*w;y=i//4*(h+pad)
        im.paste(shot,(x,y))
        draw.text((x+12,y+h+8),f"{t:03d}s  •  EXACT MP4 SOURCE FRAME",font=face,fill=(240,232,216))
    out=MOVIES/"qa";out.mkdir(exist_ok=True)
    dest=out/(stem+"-contact.jpg")
    im.save(dest,quality=90,subsampling=1)
    record={"film":stem,"master_sha256":sha(mp4),"owner_primary_source":expected["orig"],"owner_primary_git_sha":expected["source_git_sha"],
            "doi":expected["doi"],"provenance_boundary":expected["boundary"],"sampled_seconds":TIMES,
            "full_original_frame_preserved":True,"human_review":"NOT PERFORMED — listen and inspect source caption/permissions before live replacement"}
    (out/(stem+"-contact.json")).write_text(json.dumps(record,indent=2,ensure_ascii=False)+"\n")
    print("PASSED",stem,"source and movie streams / 16 true frames",flush=True)
    return True

def main():
    count=sum(examine(name,item) for name,item in NAMES.items())
    if count<1:raise RuntimeError("No study-specific new movies have been rendered yet")
if __name__=="__main__":main()
