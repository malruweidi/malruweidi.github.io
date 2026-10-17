#!/usr/bin/env python3
"""Promote five source-matched film masters after file, evidence and timing checks."""
from pathlib import Path
import hashlib,json,re,subprocess
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets/films/series-v8-primary"
OLD={
 "pla-grafting":"series-v3",
 "making-medicines-keep":"series-v4",
 "flow-chamber-method":"series-v5",
 "pla-scaffolds":"series-v5",
 "microfluidic-virus":"series-v5",
}
def video_probe(path):
    j=json.loads(subprocess.check_output(
        ["ffprobe","-v","error","-show_format","-show_streams","-of","json",str(path)],
        text=True))
    assert abs(float(j["format"]["duration"])-120)<.3,path
    types={s["codec_type"] for s in j["streams"]}
    assert {"video","audio"}<=types,path
    assert any(s["codec_type"]=="video" and s.get("width")==1280 and s.get("height")==720
               for s in j["streams"]),path

def main():
    releases=[]
    for slug,edition in OLD.items():
        movie=OUT/(slug+".mp4")
        manifest=OUT/(slug+".json")
        vtt=OUT/(slug+".vtt")
        poster=OUT/(slug+".webp")
        assert all(x.is_file() for x in [movie,manifest,vtt,poster])
        video_probe(movie)
        data=json.loads(manifest.read_text())
        assert data["visual_revision"]=="audience-clean-primary-20261018-v1"
        assert data["source_edition"]==edition
        assert data["movie_sha256"]==hashlib.sha256(movie.read_bytes()).hexdigest()
        source=ROOT/"assets/films"/edition/(slug+".mp4")
        assert data["old_movie_sha256"]==hashlib.sha256(source.read_bytes()).hexdigest()
        assert len(data["beats"])==32
        assert all(beat["source"]=="original-nonquantitative-illustration" or
                   (ROOT/beat["source"]).is_file() for beat in data["beats"])
        assert vtt.read_text(encoding="utf8").startswith("WEBVTT")
        with Image.open(poster) as pic:assert pic.size==(1280,720)
        releases.append({"id":slug,"edition":"series-v8-primary",
                         "poster":"/assets/films/series-v8-primary/"+slug+".webp",
                         "video":"/assets/films/series-v8-primary/"+slug+".mp4",
                         "captions":"/assets/films/series-v8-primary/"+slug+".vtt",
                         "movie_sha256":data["movie_sha256"],
                         "original_source_sha256":data["old_movie_sha256"],
                         "source_edition":edition,
                         "duration_seconds":120})
        print("PRIMARY VERIFIED",slug,flush=True)
    (OUT/"releases.json").write_text(json.dumps(
       {"schema":"ruwaidix-primary-clean-v1","count":5,"films":releases,
        "review_limit":"All five source-specific records checked; artistic and legal screening remains human."},
        ensure_ascii=False,indent=2)+"\n")

    # The original producer's gallery is archived. Only its public screening
    # references are changed. No paper, photo, manuscript or original master is deleted.
    path=ROOT/"publication-cinema.html"
    h=path.read_text(encoding="utf8")
    for slug,old in OLD.items():
        expected=f'"{slug}":{{edition:"{old}",duration:120,poster:'
        assert expected in h,slug+" missing scholarly register"
        pat=re.compile(r'("'+re.escape(slug)+r'":\{edition:")'+re.escape(old)+r'(",duration:120,poster:")[^"]+(")')
        h,n=pat.subn(lambda m:m.group(1)+"series-v8-primary"+m.group(2)+
                   "/assets/films/series-v8-primary/"+slug+".webp"+m.group(3),h)
        assert n==1,(slug,n)
        for ext in (".mp4",".vtt"):
            h=h.replace("/assets/films/"+old+"/"+slug+ext,
                        "/assets/films/series-v8-primary/"+slug+ext)
        # Static first paint uses the same clean poster as the new player.
        h=h.replace('poster="/assets/films/'+old+'/'+slug+'.webp"',
                    'poster="/assets/films/series-v8-primary/'+slug+'.webp"')
    assert "series-v8-primary" in h
    path.write_text(h,encoding="utf8")
    for name in ("films/making-medicines-keep.html","cinema-research-preview.html"):
        page=ROOT/name
        h=page.read_text(encoding="utf8")
        old="/assets/films/series-v4/making-medicines-keep."
        assert old in h,name
        h=h.replace(old,"/assets/films/series-v8-primary/making-medicines-keep.")
        # No automatic captions. The WebVTT is still accessible.
        h=re.sub(r'(<track\b[^>]*?)\s+default(?=[\s>])',r'\1',h,flags=re.I)
        page.write_text(h,encoding="utf8")
    print("PUBLIC PLAYERS REGISTERED: 5 scientifically grounded clean masters",flush=True)

if __name__=="__main__":main()
