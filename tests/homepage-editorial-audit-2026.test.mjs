import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read = name => readFileSync(new URL("../"+name,import.meta.url),"utf8");
const home=read("index.html");
const css=read("assets/ruwaidix-audit-polish-2026.css");
const js=read("assets/ruwaidix-audit-behavior-2026.js");
const translations=read("assets/i18n-dictionary.js");

test("original cinema and source workbench remain; duplicate photo cards are optional",()=>{
  for(const id of ["film","rx-moving-moments","research-workbench","rx26-portal",
                    "more-scientific-scenes","rx-chapter-heading"]){
    assert.ok(home.includes('id="'+id+'"'),"missing homepage feature: "+id);
  }
  const at=home.indexOf('id="more-scientific-scenes"');
  const beginning=home.lastIndexOf("<details",at);
  const end=home.indexOf("</details>",at);
  const disclosure=home.slice(beginning,end+10);
  assert.match(disclosure,/^<details class="rx-chapters-expander" id="more-scientific-scenes">/);
  assert.match(disclosure,/<summary class="rx-chapters-expander-summary">/);
  assert.equal((disclosure.match(/class="rx-chapter-card"/g)||[]).length,4);
  assert.ok(disclosure.includes('id="rx-chapter-heading"'));
  assert.ok(!disclosure.includes('watched an agarose-and-paraffin block fall apart'));
  assert.ok(disclosure.includes('href="#story"'));
  assert.ok(disclosure.includes('href="#research"'));
  assert.match(home,/anatomy-of-a-question-2026-v2\.mp4/);
});

test("legacy homepage deep links open the collapsed gallery without changing URLs",()=>{
  assert.match(home,/href="#rx-moving-moments"/);
  assert.match(home,/id="rx-chapter-heading"/);
  assert.match(js,/hashchange/);
  assert.match(js,/disclosure\.open = true/);
  assert.match(js,/requestAnimationFrame/);
  assert.match(js,/disclosure\.contains\(target\)/);
  assert.match(js,/event\.key !== "Escape"/);
  assert.match(js,/pointerdown/);
  assert.match(js,/min-width:1101px/);
  assert.match(js,/menu\.setAttribute\("aria-expanded", "false"\)/);
});

test("new gallery works on small screens and without visual animations",()=>{
  assert.match(home,/ruwaidix-audit-polish-2026\.css/);
  assert.match(home,/ruwaidix-audit-behavior-2026\.js/);
  assert.match(css,/max-width:990px/);
  assert.match(css,/max-width:650px/);
  assert.match(css,/#rx26-portal \.rx26-portal-grid\.rx-cover-catalogue/);
  assert.match(css,/max-width:375px/);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(css,/min-width:0/);
  assert.match(css,/focus-visible/);
  assert.match(css,/min-height:44px/);
  assert.match(css,/html\[lang="ar"\]/);
});

test("new gallery descriptions and navigation are equivalent in Arabic and English",()=>{
  for(const phrase of [
    "OPTIONAL PHOTO ESSAY · 4 SCENES",
    "Four more moments from the work",
    "Explore the photographic notes",
    "Four archival photographs connect an early anatomy lesson to chemistry, quantitative zebrafish imaging and pulmonary epithelial research. Each card leads to the fuller account."
  ]) assert.ok(translations.includes(JSON.stringify(phrase)),
       "missing corresponding Arabic text for: "+phrase);
});

test("main site pages have unique identifiers and no broken same-page fragment links",()=>{
  for(const page of ["index.html","stories.html","archive.html","research.html","writing.html","films.html","publications.html"]){
    const html=read(page);
    const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
    const idset=new Set(ids);
    assert.equal(idset.size,ids.length,page+": duplicate HTML ID");
    const links=[...html.matchAll(/<a\b[^>]*href="#([^"]+)"/g)].map(m=>m[1]);
    for(const link of links)assert.ok(idset.has(link),page+": missing #"+link);
  }
});

test("retired histology story and film are not promoted by main landing pages",()=>{
  for(const page of ["index.html","stories.html","archive.html","films.html"]){
    const html=read(page);
    assert.doesNotMatch(html,/href="\/films\/two-materials-no-section\.html"/);
    assert.doesNotMatch(html,/href="\/stories\/failed-zebrafish-histology\.html"/);
  }
});


test("original card contents and image descriptions have equivalent Arabic entries",()=>{
  const at=home.indexOf('id="more-scientific-scenes"');
  const block=home.slice(at,home.indexOf("</details>",at));
  const normalize=t=>t.replace(/&amp;/g,"&").replace(/&nbsp;/g," ").replace(/&#39;/g,"'").replace(/\\s+/g," ").trim();
  const mapped=new Set([...translations.matchAll(/^\\s*"((?:\\\\.|[^"\\\\])*)"\\s*:/gm)]
    .map(m=>normalize(JSON.parse('"'+m[1]+'"'))));
  const visible=[...block.matchAll(/>([^<>]+)</g)].map(m=>normalize(m[1]));
  const accessible=[...block.matchAll(/\\b(?:alt|aria-label|title)="([^"]+)"/g)].map(m=>normalize(m[1]));
  const english=[...new Set([...visible,...accessible].filter(x=>/[A-Za-z]{3,}/.test(x)&&x.length>4))];
  const missing=english.filter(x=>!mapped.has(x));
  assert.deepEqual(missing,[],"untranslated optional-gallery copy: "+missing.join(" / "));
});
test("search index describes only the seven public archive objects and released films",()=>{
  const data=JSON.parse(read("assets/discovery-index.json"));
  const object=data.items.find(x=>x.url==="/archive.html#archive-objects");
  const films=data.items.find(x=>x.url==="/films.html");
  assert.ok(object?.summary.startsWith("Seven documented archival objects"));
  assert.doesNotMatch(object.summary+" "+object.keywords,/unsuccessful histology|microtome/i);
  assert.ok(films?.summary.includes("Three released scientific"));
  assert.doesNotMatch(films.keywords,/histology documentary/i);
  assert.ok(!data.items.some(x=>x.url==="/films/two-materials-no-section.html"));
  assert.ok(!data.items.some(x=>x.url==="/stories/failed-zebrafish-histology.html"));
});
