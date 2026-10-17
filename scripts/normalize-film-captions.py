#!/usr/bin/env python3
"""Re-time VTT captions into short, readable clauses while preserving spoken text.

Does not change MP4, research claims or published original captions. A long
cue is divided by word boundaries with proportional timing, retaining exactly
the source cue wording and chronological bounds.
"""
import argparse
import re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]/"assets"/"films"
STAMP=re.compile(r"^(\d\d):(\d\d):(\d\d)\.(\d{3}) --> (\d\d):(\d\d):(\d\d)\.(\d{3})(.*)$")

def seconds(numbers):
    h,m,s,ms=map(int,numbers)
    return h*3600+m*60+s+ms/1000

def stamp(seconds_value):
    ms=round(max(0.0,seconds_value)*1000)
    return f"{ms//3600000:02d}:{(ms//60000)%60:02d}:{(ms//1000)%60:02d}.{ms%1000:03d}"

def clauses(text,width):
    words=text.split()
    result=[];buffer=""
    for word in words:
        next_word=(buffer+" "+word).strip()
        if len(next_word)>width and buffer:
            result.append(buffer);buffer=word
        else:buffer=next_word
    if buffer:result.append(buffer)
    return result

def normalize(path,width=54):
    contents=path.read_text(encoding="utf8").replace("\r\n","\n")
    entries=re.split(r"\n\s*\n",contents.strip())
    output=["WEBVTT",""]
    cue_count=0;split_count=0;last=0
    for block in entries:
        lines=block.strip().splitlines()
        if not lines:continue
        if lines[0].startswith("WEBVTT"):continue
        if lines[0].startswith("NOTE"):
            output.extend([block.strip(),""])
            continue
        tindex=next((i for i,line in enumerate(lines) if STAMP.fullmatch(line)),None)
        if tindex is None:
            # VTT metadata remain unchanged if they precede any cues.
            output.extend([block.strip(),""])
            continue
        raw=lines[tindex]
        m=STAMP.fullmatch(raw)
        a=seconds(m.groups()[:4]);b=seconds(m.groups()[4:8])
        if b<=a:raise ValueError("Invalid cue timing in "+str(path))
        # Preserve cue settings from the timestamp line.
        settings=m.group(9)
        spoken=" ".join(line.strip() for line in lines[tindex+1:] if line.strip())
        if not spoken:raise ValueError("Empty spoken subtitle "+str(path))
        phrases=clauses(spoken,width)
        word_count=sum(len(p) for p in phrases)
        elapsed=0
        for phrase in phrases:
            begin=a+(b-a)*elapsed/word_count
            elapsed+=len(phrase)
            end=b if phrase is phrases[-1] else a+(b-a)*elapsed/word_count
            if begin<last-.08:raise ValueError("Subtitle cues not in temporal order "+str(path))
            if end<=begin:raise ValueError("Zero-length subtitle "+str(path))
            output.extend([stamp(begin)+" --> "+stamp(end)+settings,phrase,""])
            cue_count+=1;last=end
        split_count+=max(0,len(phrases)-1)
    rendered="\n".join(output).rstrip()+"\n"
    if cue_count<10:raise ValueError("Too few subtitles in "+str(path))
    # Do not modify a VTT if its current contents are equivalent.
    if rendered!=contents:path.write_text(rendered,encoding="utf8")
    return cue_count,split_count

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--collection",choices=["series-v2","longform-v2"],required=True)
    opts=p.parse_args()
    folder=ROOT/opts.collection
    inputs=list(sorted(folder.glob("*.vtt")))
    if not inputs:raise RuntimeError("No captions in "+str(folder))
    for item in inputs:
        n,split=normalize(item)
        print(item.name,"total cues",n,"split added",split)

if __name__=="__main__":
    main()
