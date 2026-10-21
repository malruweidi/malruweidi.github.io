"use strict";
/* Scientific figure provenance: source assertions, not a substitute for
 * inspecting original image pixels, publisher legends or reproduction rights.
 */
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");

test("the evidence viewer gives each of four figures a bounded scholarly provenance record",()=>{
  const html=read("evidence-viewer.html");
  for(const id of ["pulmonary","zebrafish","surfaces","chemistry"]){
    const match=html.match(new RegExp('<section id="'+id+'"[^>]*>[\\s\\S]*?<\\/section>'));
    assert.ok(match,id+" section");
    assert.match(match[0],/class="ev-source-status"/,id+" source status");
    assert.match(match[0],/class="ev-source-note"/,id+" source context");
    assert.match(match[0],/class="ev-verify-link"/,id+" original or project source");
    assert.match(match[0],/class="ev-open-original"/,id+" inspect stored image");
    assert.match(match[0],/What this figure cannot establish/,id+" critical interpretation");
  }
  assert.equal((html.match(/class="ev-source-status"/g)||[]).length,4);
  assert.match(html,/https:\/\/doi.org\/10.1152\/japplphysiol.00574.2020/);
  assert.match(html,/https:\/\/doi.org\/10.1161\/ATVBAHA.118.311231/);
  assert.match(html,/https:\/\/doi.org\/10.3390\/polym13213717/);
  assert.match(html,/https:\/\/doi.org\/10.1039\/C9AY01557D/);
});

test("chemical sensor images do not conflate unpublished imine research with a distinct curcumin publication",()=>{
  const html=read("evidence-viewer.html");
  const chemicals=html.slice(html.indexOf('id="chemistry"'),html.indexOf('class="ev-caution"'));
  assert.match(chemicals,/separate curcumin/i);
  assert.match(chemicals,/image-to-publication attribution[^<]*unverified/i);
  assert.match(chemicals,/project record/i);
  assert.match(chemicals,/href="\/grants\/urep23.html"/);
  assert.match(chemicals,/href="https:\/\/doi.org\/10.1039\/C9AY01557D"/);
  assert.doesNotMatch(chemicals,/(?:2019 curcumin figure|verified UREP23 panel)/i);
});

test("materials source annotation cites published SEM evidence without assigning an unseen figure panel",()=>{
  const html=read("evidence-viewer.html");
  const part=html.slice(html.indexOf('id="surfaces"'),html.indexOf('id="chemistry"'));
  assert.match(part,/Figure 5/);
  assert.match(part,/exact local-image panel match[^<]*not verified/i);
  assert.match(part,/href="https:\/\/doi.org\/10.3390\/polym13213717"/);
});

test("the MicroZebraLab photograph can be inspected separately from its published context",()=>{
  const html=read("imaging.html");
  assert.match(html,/href="\/assets\/archival-inline\/microzebralab-published-figure.jpg"/);
  assert.match(html,/href="https:\/\/doi.org\/10.1016\/j.micron.2020.102876"/);
  assert.match(html,/href="\/figures.html#zebrafish"/);
  assert.match(html,/src="\/assets\/archival-inline\/microzebralab-published-figure.jpg"/);
});

test("a new visual style preserves the existing research image originals and accessibility",()=>{
  const html=read("evidence-viewer.html"),css=read("assets/evidence-reading-source-2026.css");
  for(const file of [
    "figure-pulmonary-flow-chamber.jpg","figure-zebrafish-microscopy.jpg",
    "figure-pla-surface.jpg","figure-cyanide-sensor.jpg"
  ])assert.ok(html.includes('src="/assets/home-archive/'+file+'"'));
  assert.match(html,/\/assets\/evidence-reading-source-2026\.css/);
  assert.match(css,/\.ev-source-status/);
  assert.match(css,/:focus-visible/);
  assert.match(css,/prefers-reduced-motion/);
  assert.match(css,/max-width:600px/);
  assert.doesNotMatch(css,/@import|backdrop-filter/);
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.equal((html.match(/<figure\b/g)||[]).length,4);
});
