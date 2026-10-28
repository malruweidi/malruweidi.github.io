#!/usr/bin/env python3
"""Publish Anatomy of a Question to the existing GitHub Pages film slots.

Preserves the previous MP4 and VTT as recoverable archival files. Operates on
exactly film.html, films.html, index.html, and newly named documentary assets.
"""
from __future__ import annotations

import argparse
import html
import json
import re
import shutil
from pathlib import Path

HERE=Path(__file__).resolve().parent
OLD="/assets/films/what-survives-the-experiment"
NEW="/assets/films/anatomy-of-a-question-2026"
DESC=("A 6-minute-26-second documentary portrait of Mahmoud Al-Ruweidi, from school chemistry in "
      "2009 through experimental research, chronic illness, the history of pharmacy and unfinished questions.")


def replace(s:str,old:str,new:str,count:int=1)->str:
    found=s.count(old)
    if found!=count:
        raise ValueError(f"Expected {count} occurrence(s); found {found}: {old[:105]!r}")
    return s.replace(old,new)


def film_page(site:Path,shots:list[dict])->None:
    p=site/"film.html"
    s=p.read_text(encoding="utf-8")
    s=replace(s,"<title>What Survives the Experiment | A Ruwaidix Research Film</title>",
              "<title>Anatomy of a Question | A Mahmoud Al-Ruweidi Documentary</title>")
    s=replace(s,'<meta name="description" content="A two-minute documentary told through original photographs, microscopy, published scientific figures and the experiments behind Mahmoud K. Al-Ruweidi\'s research.">',
              f'<meta name="description" content="{DESC}">')
    s=replace(s,'<meta property="og:title" content="What Survives the Experiment | A Ruwaidix Research Film">',
              '<meta property="og:title" content="Anatomy of a Question | Documentary Portrait">')
    s=replace(s,'<meta name="twitter:title" content="What Survives the Experiment | A Ruwaidix Research Film">',
              '<meta name="twitter:title" content="Anatomy of a Question | Documentary Portrait">')
    s=replace(s,'A two-minute documentary told through original photographs, microscopy, published scientific figures and the experiments behind Mahmoud K. Al-Ruweidi\'s research.',DESC,2)
    s=replace(s,'<h1>What survives <em>the experiment.</em></h1>',
              '<h1>Anatomy <em>of a Question.</em></h1>')
    s=replace(s,'Twelve scenes from a scientific life: a school anatomy lesson, a microscope from Cairo, chemistry, developing vessels, failed materials, damaged lung cells and the difficult journey from molecule to medicine.',
              'Beginning with a school chemistry exhibition in 2009, the film follows experimental failure, living systems, chronic illness, pharmaceutical history and research still in progress. Its central question: what does the evidence allow us to know?')
    s=replace(s,'02:00 running time','06:26 running time')
    s=replace(s,'What Survives the Experiment, a two-minute research documentary',
              'Anatomy of a Question, a six-minute research documentary')
    s=replace(s,'Open the two-minute film directly','Open the full documentary directly')
    s=replace(s,'https://malruweidi.github.io/assets/photos-2017-2019/microscope-morning-still-life-2017.webp',
              'https://malruweidi.github.io/assets/films/anatomy-of-a-question-2026.webp',3)
    s=replace(s,'The documentary\'s original 2017 laboratory microscope archive',
              'Mahmoud Al-Ruweidi in the documentary portrait')
    s=replace(s,'/assets/photos-2017-2019/microscope-morning-still-life-2017.webp',
              NEW+'.webp',1)
    s=s.replace(OLD,NEW)
    # The movie metadata is structured as JSON and not patched by fragile substring.
    match=re.search(r'<script type="application/ld\+json">(\{.*?\})</script>',s,flags=re.S)
    if not match:raise ValueError("Missing VideoObject metadata")
    data=json.loads(match.group(1))
    if data.get("name")!="What Survives the Experiment":raise ValueError("Film identity changed")
    data.update(name="Anatomy of a Question",description=DESC,duration="PT6M26S",
                uploadDate="2026-10-29",
                thumbnailUrl="https://malruweidi.github.io"+NEW+".webp",
                contentUrl="https://malruweidi.github.io"+NEW+".mp4")
    s=s[:match.start(1)]+json.dumps(data,ensure_ascii=False,separators=(",",":"))+s[match.end(1):]

    paragraphs="\n".join(f'<p>{html.escape(shot["voice"])}</p>' for shot in shots if shot["voice"])
    addition=(
        '<section class="film-section" id="transcript" aria-labelledby="transcript-title"><div class="wrap-film">\n'
        '<p class="kicker">The complete script / English</p><h2 id="transcript-title">The narration.</h2>\n'
        '<div class="transcript">'+paragraphs+'</div>\n'
        '<p class="film-note">The narration uses a licensed synthetic third-person voice. '
        'It is not Mahmoud Al-Ruweidi\'s recorded voice and does not imitate it. '
        'The original photographs, archival recordings and scientific figures remain identified by provenance.</p>\n'
        '</div></section>\n'
        '<section class="film-section" id="film-sources" aria-labelledby="sources-title"><div class="wrap-film">\n'
        '<p class="kicker">Sources and limits</p><h2 id="sources-title">What the film can establish.</h2>\n'
        '<p class="film-note">Personal chronology is drawn from the <a href="/stories.html">original stories</a> '
        'and <a href="/illness-and-evidence.html">first-person account of illness</a>. '
        'The curcumin investigation is documented in <a href="https://doi.org/10.1039/C9AY01557D">'
        '<em>Analytical Methods</em> (2019)</a>; the zebrafish collaboration in '
        '<a href="https://doi.org/10.1161/ATVBAHA.118.311231"><em>ATVB</em> (2018)</a>; '
        'and the pulmonary work in <a href="https://doi.org/10.1152/japplphysiol.00574.2020">'
        '<em>Journal of Applied Physiology</em> (2021)</a>. These are experiments under specific '
        'conditions, not proof of clinical treatment. A historical manuscript shown in the film is '
        'a 1904 Egyptian copy of <em>Minhāj al-dukkān</em> from the Wellcome Collection '
        '(MS Arabic 1002); its displayed page is not identified as a syrup passage. '
        'Current inhaled-formulation research is ongoing.</p>\n'
        '</div></section>\n'
    )
    if s.count("\n</main>")!=1:raise ValueError("Unexpected film page structure")
    s=s.replace("\n</main>","\n"+addition+"</main>")
    p.write_text(s,encoding="utf-8")


def homepage(site:Path)->None:
    p=site/"index.html"
    s=p.read_text(encoding="utf-8")
    s=replace(s,'Watch my two-minute film <span aria-hidden="true">↘</span>',
              'Watch the research documentary <span aria-hidden="true">↘</span>')
    start=s.index('<section class="rx-home-film" id="film"')
    end=s.index('</section>',start)+len('</section>')
    frag=s[start:end]
    frag=replace(frag,'A two-minute introduction / 02:00','Research documentary / 06:26')
    frag=replace(frag,'What survives <em>the experiment.</em>','Anatomy <em>of a Question.</em>')
    frag=replace(frag,'A short film about the questions that stayed with me: a fox specimen on the anatomy table, a microscope from Cairo, a histology preparation that fell apart, developing vessels in zebrafish and lung cells injured when an airway reopens. The story reaches my current work on inhaled medicines.',
                 'Beginning in 2009, this documentary follows chemistry, the living body, experiments that failed, chronic illness and the history of medicine. It asks what can be known from an observation, and where the evidence stops.')
    frag=replace(frag,'poster="/assets/photos-2017-2019/microscope-morning-still-life-2017.webp"',
                 'poster="'+NEW+'.webp"')
    frag=replace(frag,"What Survives the Experiment, a two-minute introduction to Mahmoud Al-Ruweidi's research and life",
                 "Anatomy of a Question, a documentary of Mahmoud Al-Ruweidi's research and life")
    frag=replace(frag,'Open the two-minute film.','Open the full documentary.')
    frag=replace(frag,'What Survives the Experiment · Two-minute documentary',
                 'Anatomy of a Question · 06:26 documentary')
    frag=frag.replace(OLD,NEW)
    p.write_text(s[:start]+frag+s[end:],encoding="utf-8")


def film_catalogue(site:Path)->None:
    p=site/"films.html"
    s=p.read_text(encoding="utf-8")
    start=s.index('<div class="fc-heading"><div><p class="fc-kicker">01 / released documentaries')
    end=s.index('<div class="fc-release" style="margin-top:24px">',start)
    frag=s[start:end]
    frag=replace(frag,'What survives the experiment.','Anatomy of a Question.')
    frag=replace(frag,'The opening film begins in a school anatomy room and follows the experiments that drew me from chemistry into living systems and inhaled medicines.',
                 'The opening film begins with a school chemistry photograph from 2009, before illness altered my education. It follows an experimental life through chemistry, living systems, medical history and unfinished questions.')
    frag=replace(frag,'poster="/assets/photos-2017-2019/microscope-morning-still-life-2017.webp"',
                 'poster="'+NEW+'.webp"')
    frag=replace(frag,'What Survives the Experiment, released two-minute Ruwaidix documentary',
                 'Anatomy of a Question, released six-minute research documentary')
    frag=replace(frag,'Released · two-minute documentary','Released · 06:26 research documentary')
    frag=replace(frag,'<h3>What Survives the Experiment</h3>','<h3>Anatomy of a Question</h3>')
    frag=replace(frag,'From school anatomy and a microscope carried from Cairo to unsuccessful polymers, developing vessels, injured lung cells and the challenge of inhaled medicines.',
                 'A research documentary about Mahmoud Al-Ruweidi: 2009 beginnings, experimental uncertainty, illness, medieval pharmacy and ongoing drug-delivery research.')
    frag=frag.replace(OLD,NEW)
    p.write_text(s[:start]+frag+s[end:],encoding="utf-8")


def publish(site:Path,media:Path,shots:Path)->None:
    assets=site/"assets"/"films"
    assets.mkdir(parents=True,exist_ok=True)
    for name in ["anatomy-of-a-question-2026.mp4","anatomy-of-a-question-2026.vtt",
                 "anatomy-of-a-question-2026.webp"]:
        from_name=("anatomy-of-a-question.vtt" if name.endswith(".vtt") else name)
        src=media/from_name
        if not src.exists() or src.stat().st_size==0:raise FileNotFoundError(src)
        shutil.copy2(src,assets/name)
    shutil.copy2(media/"source_manifest.json",assets/"anatomy-of-a-question-2026-source.json")
    scenes=json.loads(shots.read_text(encoding="utf-8"))
    film_page(site,scenes)
    homepage(site)
    film_catalogue(site)
    print("STAGED: full film, VTT, poster, manifest, film.html, films.html, index.html")


if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--site-root",type=Path,required=True)
    p.add_argument("--media",type=Path,required=True)
    p.add_argument("--shots",type=Path,default=HERE/"full_shots.json")
    args=p.parse_args()
    publish(args.site_root,args.media,args.shots)
