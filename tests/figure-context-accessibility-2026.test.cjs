"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const {auditFigures}=require("../scripts/audit-figure-archive-2026.cjs");

test("eight archived object photographs reference the adjacent object title without duplicating captions",()=>{
 const html=read("archive.html");
 const block=html.slice(html.indexOf('id="rxOctoberPhotoArchive"'),html.indexOf('</section>',html.indexOf('id="rxOctoberPhotoArchive"')));
 const items=[...block.matchAll(/<article class="rx-archive-object" id="([^"]+)"[\s\S]*?<\/article>/g)];
 assert.equal(items.length,8,"original eight-object archive is unchanged");
 for(let i=0;i<items.length;i++){
  const [,id,body]=items[i];
  const label="rxo"+(i+1);
  assert.ok(body.includes('<figure aria-labelledby="'+label+'">'),id+" accessible caption context");
  assert.ok(body.includes('<h3 id="'+label+'">'),id+" existing heading becomes caption label");
  assert.match(body,/<img\b/);
  assert.doesNotMatch(body,/<figcaption/,"do not duplicate visible object description");
 }
});

test("three homepage university photographs inherit their existing visible headings",()=>{
 const html=read("index.html");
 const marker=html.indexOf('<div class="photo-opening"');
 const block=html.slice(marker,html.indexOf('</div>\n<div class="story-rewind">',marker));
 for(const [file,id] of [
  ["university-lab-coat.jpg","home-archive-university-title"],
  ["chemistry-chalkboard.jpg","home-archive-classroom-title"],
  ["early-science-talk.jpg","home-archive-talk-title"]
 ]){
  const pos=block.indexOf(file);
  assert.ok(pos>=0,file);
  const figure=block.slice(block.lastIndexOf('<figure ',pos),block.indexOf('</figure>',pos)+9);
  assert.ok(figure.includes('aria-labelledby="'+id+'"'),id);
  assert.ok(figure.includes('<h3 id="'+id+'">'),id);
  assert.match(figure,/<p>Personal photographic archive · 2015<\/p>/);
 }
});

test("whole site figure audit distinguishes missing figcaptions from existing accessible title context",()=>{
 const d=auditFigures(path.resolve(__dirname,".."));
 assert.equal(d.stats.pagesExamined,62);
 assert.ok(d.stats.figuresWithoutCaptions>=14,"raw HTML figcaption completeness remains visible");
 assert.equal(d.stats.figuresWithoutCaptionsOrAccessibleLabels,3,"only the inline historical full-record figures need separate review");
 assert.ok(d.pages["archive.html"].figures.filter(x=>x.hasEquivalentLabel).length>=8);
 assert.ok(d.pages["index.html"].figures.filter(x=>x.hasEquivalentLabel).length>=3);
});
