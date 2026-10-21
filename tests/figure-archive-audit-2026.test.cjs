"use strict";
/* Archive-wide source audit is informational; never auto-replace a figure. */
const {test}=require("node:test"),assert=require("node:assert/strict");
const path=require("node:path"),fs=require("node:fs");
const {auditFigures}=require("../scripts/audit-figure-archive-2026.cjs");
const root=path.resolve(__dirname,"..");

test("scientific figure audit covers the enormous original atlas and related evidence routes",()=>{
 const d=auditFigures(root);
 assert.ok(d.pages["figures.html"],"full figure atlas included even when repository file retrieval is limited");
 assert.ok(d.pages["evidence-viewer.html"]);
 assert.ok(d.pages["imaging.html"]);
 assert.ok(d.pages["research/zebrafish-vascular-cilia.html"]);
 assert.equal(d.pages["evidence-viewer.html"].figures.length,4,"all four viewer figures counted");
 assert.ok(d.stats.figureElements>=8,"all covered figure elements");
 assert.equal(d.stats.pagesExamined,4);
 assert.ok(d.notes.includes("not an image-pixel review"));
});

test("scientific figure audit tracks accessibility and source links without revealing embedded binary strings",()=>{
 const d=auditFigures(root);
 const viewer=d.pages["evidence-viewer.html"].figures;
 for(const x of viewer){
  assert.ok(x.figureOrdinal>0);
  assert.ok(x.sourceOffset>=0);
  assert.ok(x.sourceLine>=1);
  assert.ok(x.figureImages.length>0);
  assert.ok(x.captionPresent);
  assert.ok(x.figureImages[0].altText);
  assert.ok(x.figureImages[0].url.startsWith("/assets/home-archive/"));
  assert.ok(x.paperIdentifiers.length>0||x.contextLinkCount>0);
 }
 assert.doesNotMatch(JSON.stringify(d),/data:image\/(?:png|jpeg|webp);base64/);
 assert.ok(d.pages["figures.html"].figures.length>=0);
});

test("figure audit does not write or alter original source images",()=>{
 const pathName=path.join(root,"assets/home-archive/figure-cyanide-sensor.jpg");
 const original=fs.readFileSync(pathName);
 auditFigures(root);
 const after=fs.readFileSync(pathName);
 assert.deepEqual(after,original);
});
