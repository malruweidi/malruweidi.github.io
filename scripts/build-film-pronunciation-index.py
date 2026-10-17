#!/usr/bin/env python3
"""Prepare time-coded human pronunciation audition list from actual film captions.

This DOES NOT analyze audio, pronounce terms, or certify speech. It identifies
where a listener should hear rare names and technical terminology in the MP4.
"""
import json
import re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
F=ROOT/"assets"/"films"
LEX=F/"pronunciation-review-lexicon.json"

def seconds(hhmmss):
    h,m,s=hhmmss.split(":")
    return round(int(h)*3600+int(m)*60+float(s),3)

def find_mentions(text,vocab):
    words=text.casefold()
    matches=[]
    for item in vocab:
        for phrase in item["find"]:
            if phrase.casefold() in words:
                matches.append(item["id"])
                break
    return matches

def cues(path):
    source=path.read_text(encoding="utf8")
    found=re.findall(r"(\d\d:\d\d:\d\d\.\d{3}) --> (\d\d:\d\d:\d\d\.\d{3})([^\n]*)\n([\s\S]*?)(?=\n\s*\n|$)",source)
    if len(found)<10:raise ValueError("Insufficient timed spoken cues "+str(path))
    for start,end,settings,wording in found:
        phrase=" ".join(wording.split())
        yield {"start":seconds(start),"end":seconds(end),"spoken_caption":phrase}

def main():
    vocabulary=json.loads(LEX.read_text(encoding="utf8"))["items"]
    if len({v["id"] for v in vocabulary})!=len(vocabulary):raise ValueError("Duplicate review term")
    output={"scope":"Open-source Ruwaidix film v2 editions only",
            "status":"HUMAN AUDITION REQUIRED / NOT VERIFIED",
            "limit":"Timing follows published VTT captions, not forced alignment to acoustic phonemes; quality of TTS or pronunciation is not inferred.",
            "films":[]}
    for group in ("series-v2","longform-v2"):
        for subtitles in sorted((F/group).glob("*.vtt")):
            hits=[]
            for cue in cues(subtitles):
                for name in find_mentions(cue["spoken_caption"],vocabulary):
                    hits.append({"term_id":name,"start_second":cue["start"],
                        "cue":cue["spoken_caption"],
                        "video":"/assets/films/"+group+"/"+subtitles.stem+".mp4#t="+str(cue["start"])})
            output["films"].append({"film":subtitles.stem,"collection":group,
                                    "review_cues":hits,"number_of_review_cues":len(hits)})
    p=F/"pronunciation-review-v2.json"
    p.write_text(json.dumps(output,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    print("Pronunciation review index generated for",len(output["films"]),
          "films,",sum(x["number_of_review_cues"] for x in output["films"]),"audition cue instances.")

if __name__=="__main__":
    main()
