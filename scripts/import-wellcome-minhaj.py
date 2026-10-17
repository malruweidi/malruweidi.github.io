#!/usr/bin/env python3
"""Stage genuine Minhaj al-dukkān folios using Wellcome's official open API.

This script is strict by design. No unrelated Wellcome medical manuscript can
be silently substituted. A canvas is a scanned page, NOT automatically the
specific syrup passage cited in the article; page identity requires review.
"""
import hashlib,json,os,urllib.parse,urllib.request
from io import BytesIO
from pathlib import Path
from PIL import Image,ImageOps

WORK_IDS=("cesersut","qgq88pbk")
API="https://api.wellcomecollection.org/catalogue/v2/works/"
DEST=Path(__file__).resolve().parents[1]/"assets/films/source-manuscripts/wellcome-ms-arabic-1002"

def get(url,maxbytes=30_000_000):
    address=urllib.parse.urlparse(url)
    domains=("api.wellcomecollection.org","iiif.wellcomecollection.org","wellcomecollection.org")
    if address.scheme!="https" or address.hostname not in domains:
        raise ValueError("Only official Wellcome Collection HTTPS media is permitted: "+url[:150])
    req=urllib.request.Request(url,headers={"Accept":"application/json,image/jpeg,*/*","User-Agent":"Ruwaidix-research-film/2.0 academic-review"})
    with urllib.request.urlopen(req,timeout=45) as response:
        data=response.read(maxbytes+1)
        if len(data)>maxbytes or not data:raise ValueError("Image/API response exceeds strict bounds")
        return data

def canonical(obj):
    return obj["@id"] if isinstance(obj,dict) else obj

def presentation(manifest):
    if "sequences" in manifest:
        canvases=manifest["sequences"][0].get("canvases",[])
        yield from ((str(c.get("label","")),c.get("images",[{}])[0].get("resource",{}).get("@id"),c.get("@id","")) for c in canvases)
    elif "items" in manifest:
        for c in manifest["items"]:
            paintings=c.get("items",[])
            body=paintings[0].get("items",[{}])[0].get("body",{}) if paintings else {}
            label=c.get("label",{})
            names=label.get("en",[]) if isinstance(label,dict) else [str(label)]
            yield (" ".join(names),body.get("id"),c.get("id",""))

def run():
    works=[];links=[];errors=[]
    for work in WORK_IDS:
        try:
            doc=json.loads(get(API+work+"?include=items,identifiers"))
            works.append({"id":work,"title":doc.get("title"),"catalogue_id":doc.get("id"),"work_type":doc.get("workType",{}),"original_url":"https://wellcomecollection.org/works/"+work})
            title=doc.get("title","").lower()
            if not any(w in title for w in ("دكان","dukkan","dukān","dukkan","1002")):
                raise ValueError("Unrelated manuscript returned from work "+work+": "+doc.get("title",""))
            for i in doc.get("items",[]):
                for location in i.get("locations",[]):
                    if location.get("locationType",{}).get("id")=="iiif-presentation":
                        url=location.get("url")
                        if url:links.append(url)
        except Exception as e:errors.append(str(e))
    if not links:
        raise RuntimeError("No official IIIF presentation in the *specific* Minhaj work. Errors: "+"; ".join(errors))
    first=max(links,key=lambda x:("wellcomecollection.org" in x))
    if urllib.parse.urlparse(first).hostname not in ("iiif.wellcomecollection.org","wellcomecollection.org"):
        raise ValueError("Unapproved Wellcome IIIF host")
    manifest=json.loads(get(first))
    canvases=list(presentation(manifest))
    if len(canvases)<120:raise RuntimeError("Digitized manuscript should have >120 pages; refusing unrelated IIIF source")
    DEST.mkdir(parents=True,exist_ok=True)
    record={"work_id":WORK_IDS,"title":"Minhāj al-dukkān / MS Arabic 1002","copy_date":"Egypt, 1904 CE","holdings":"Wellcome Collection","rights":"Public Domain Mark, Wellcome Collection","manifest":first,"canvas_count":len(canvases),"staged_pages":[],"publication_use":"Do not identify any staged page with a specific syrup rule until the Arabic page has been checked by a reader."}
    for idx in [0,5,12,25]:
        label,image_url,canvas=canvases[idx]
        if not image_url:raise RuntimeError("IIIF canvas lacking image: "+str(idx))
        url=image_url.split("?")[0]
        if "/full/" not in url:
            url=url.rstrip("/")+"/full/1200,/0/default.jpg"
        else:
            url=url.replace("/full/max/","/full/1200,")
        content=get(url)
        with Image.open(BytesIO(content)) as original:
            page=ImageOps.exif_transpose(original).convert("RGB")
            if min(page.size)<500:raise ValueError("Unusable manuscript folio resolution")
            page.thumbnail((1400,1400),Image.Resampling.LANCZOS)
            name=f"canvas-{idx+1:03d}.jpg"
            path=DEST/name
            page.save(path,quality=89,optimize=True)
            record["staged_pages"].append({"canvas_index_zero_based":idx,"label":label,"iiif_canvas":canvas,"image_url":url,"filename":name,"sha256":hashlib.sha256(path.read_bytes()).hexdigest(),"width":page.width,"height":page.height,"subject_identification":"UNVERIFIED PAGE; NOT YET CLAIMED AS SYRUP CHAPTER"})
    (DEST/"source-register.json").write_text(json.dumps(record,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print("STAGED",len(record["staged_pages"]),"GENUINE Minhaj MANUSCRIPT PAGES",flush=True)

if __name__=="__main__":
    run()
