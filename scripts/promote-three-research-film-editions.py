#!/usr/bin/env python3
"""Promote only 3 newly source-verified films in the live cinema catalogue.

The 32 other films, 54 existing original MP4s, original six-scene provenance,
site aesthetics and all routes are preserved. This code is idempotent and
refuses to guess replacement anchors on an unexpectedly edited web page.
"""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
HTML=ROOT/"publication-cinema.html"
NEW=""" const verifiedFilmMasters=Object.freeze({
  "making-medicines-keep":{edition:"series-v4",duration:120,poster:"/assets/films/source-manuscripts/wellcome-ms-arabic-1002/canvas-013.jpg"},
  "pla-grafting":{edition:"series-v3",duration:120,poster:"/assets/films/source-figures/v3/pla-grafting-figure-08.jpg"},
  "flow-chamber-method":{edition:"series-v3",duration:120,poster:"/assets/films/source-figures/v3/flow-chamber-method-figure-01.jpg"}
 });
"""
def replace_exact(content,before,after):
 if after in content:return content
 count=content.count(before)
 if count!=1:raise RuntimeError("Cannot safely edit live page; ambiguous source anchor: "+before[:60]+"; occurrences "+str(count))
 return content.replace(before,after,1)
def main():
 s=HTML.read_text()
 if "const verifiedFilmMasters=Object.freeze(" not in s:
  s=replace_exact(s,' const playerPromises=new Set();',NEW+' const playerPromises=new Set();')
 s=replace_exact(s,
    '   let mediaId="film-"+esc(x.id);',
    '   let mediaId="film-"+esc(x.id);\n   let sourcePoster=(verifiedFilmMasters[x.id]&&verifiedFilmMasters[x.id].poster)||x.poster;')
 s=replace_exact(s,'(x.poster.endsWith(".svg")?"true":"false")',
                   '(sourcePoster.endsWith(".svg")?"true":"false")')
 s=replace_exact(s,'<img src="\'+esc(x.poster)+\'" loading="lazy"',
                   '<img src="\'+esc(sourcePoster)+\'" loading="lazy"')
 s=replace_exact(s,'let details=x.scenes.length?', 'let details=x.scenes.length?')
 # Old scene descriptions remain explicitly identifiable as original-archive
 # documentation, not the new eight-chapter film.
 s=replace_exact(s,
       '<details><summary>Read the six scenes and visual credits</summary>',
       '<details><summary>\'+(verifiedFilmMasters[x.id]?"Original first-edition six-scene research archive":"Read the six scenes and visual credits")+\'</summary>')
 s=replace_exact(s,'   const url="/assets/films/series/"+x.id+".mp4";',
       '   const selectedEdition=verifiedFilmMasters[x.id];\n   const base="/assets/films/"+(selectedEdition?selectedEdition.edition:"series")+"/"+x.id;\n   const url=base+".mp4";')
 s=replace_exact(s,'poster="\'+esc(x.poster)+\'" aria-label',
                 'poster="\'+esc((selectedEdition&&selectedEdition.poster)||x.poster)+\'" aria-label')
 s=replace_exact(s,
   'src="/assets/films/series/\'+esc(x.id)+\'.vtt" srclang',
   'src="\'+esc(base+".vtt")+\'" srclang')
 s=replace_exact(s,
  '"Film available · "+x.duration_seconds+" seconds · English captions"',
  '"Film available · "+(selectedEdition?selectedEdition.duration:x.duration_seconds)+" seconds · English captions"+(selectedEdition?" · revised study-specific research edition":"")')
 s=replace_exact(s,
  'link.href="/assets/films/series/"+encodeURIComponent(x.id)+".vtt";',
  'link.href=base+".vtt";')
 s=replace_exact(s,
  'actions.appendChild(link);}',
  'actions.appendChild(link);if(selectedEdition){const orig=document.createElement("a");orig.href="/assets/films/series/"+encodeURIComponent(x.id)+".mp4";orig.textContent="Watch preserved original first edition ↗";actions.appendChild(orig);const map=document.createElement("a");map.href=base+".json";map.textContent="View verified new chapter sources ↗";actions.appendChild(map);}}')
 assert s.count('const verifiedFilmMasters=Object.freeze(')==1
 assert s.count('const url=base+".mp4";')==1
 assert 'assets/films/publication-series.json' in s
 HTML.write_text(s)
 print("Live catalogue now prefers 3 independently verified film masters; 32 original pairings unchanged.")
if __name__=="__main__":main()
