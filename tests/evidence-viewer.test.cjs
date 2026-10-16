"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root,file),"utf8");

test("scientific evidence reader keeps each published image unmodified and traceable", () => {
  const body = read("evidence-viewer.html");
  assert.equal((body.match(/<h1\b/g)||[]).length,1);
  for(const file of ["assets/home-archive/figure-pulmonary-flow-chamber.jpg","assets/home-archive/figure-zebrafish-microscopy.jpg","assets/home-archive/figure-pla-surface.jpg","assets/home-archive/figure-cyanide-sensor.jpg"]){
    assert.ok(fs.existsSync(path.join(root,file)),file);
    assert.ok(body.includes('src="/'+file+'"'),file);
    assert.ok(body.includes('href="/'+file+'"'),"original-image link missing "+file);
  }
  for(const id of ["pulmonary","zebrafish","surfaces","chemistry"]) assert.ok(body.includes('id="'+id+'"'));
  assert.ok((body.match(/<details\b/g)||[]).length >= 8);
  assert.match(body,/What this figure cannot establish/);
  assert.match(body,/not a clinical outcome/);
  assert.match(body,/published figures are not interchangeable with raw data/);
});
test("interpretive layer is additive, accessible and connected to research",()=>{
  const body=read("evidence-viewer.html");
  const css=read("assets/evidence-reading-2026.css");
  const home=read("index.html");
  const films=read("films.html");
  const discovery=JSON.parse(read("assets/discovery-index.json"));
  const sitemap=read("sitemap.xml");
  assert.match(body,/href="\/research\/pulmonary-epithelial-injury.html"/);
  assert.match(body,/href="\/research\/zebrafish-vascular-cilia.html"/);
  assert.match(body,/https:\/\/doi.org\/10.3390\/polym13213717/);
  assert.match(body,/href="\/figures.html#chemistry"/);
  assert.match(css,/object-fit:contain/);
  assert.match(css,/prefers-reduced-motion/);
  assert.ok(home.includes('href="/evidence-viewer.html"'));
  assert.ok(films.includes('href="/evidence-viewer.html"'));
  assert.ok(discovery.items.some(x=>x.url==="/evidence-viewer.html"));
  assert.match(sitemap,/\/evidence-viewer.html/);
});