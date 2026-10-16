"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const data=JSON.parse(read("assets/films/two-materials-scenes.json"));
const video="assets/films/two-materials-no-section.mp4";
test("the histology narrative is a complete 150-second evidence-grounded ten-scene film",()=>{
 assert.equal(data.running_seconds,150);
 assert.equal(data.scenes.length,10);
 let cursor=0; const actualPhotos=new Set();
 for(const scene of data.scenes){
  assert.equal(scene.start,cursor);
  cursor+=scene.duration;
  assert.ok(scene.narration&&scene.title&&scene.kind);
  if(scene.kind==="archival photograph"){
   assert.ok(fs.existsSync(path.join(root,scene.image)));
   actualPhotos.add(scene.image);
  } else {
   assert.equal(scene.kind,"explanatory schematic");
   assert.ok(scene.diagram);
  }
 }
 assert.equal(cursor,150);
 assert.equal(actualPhotos.size,3);
 for(const x of ["zebrafish-paraffin-microtomy-failure.webp","zebrafish-orientation-specimens.webp","zebrafish-histology-processing.webp"]){
  assert.ok([...actualPhotos].some(i=>i.endsWith(x)),x);
 }
 assert.match(data.evidentiary_rule,/No useful histological section/);
});
test("the published video is an actual signed-off binary with aligned captions",()=>{
 assert.ok(fs.existsSync(path.join(root,video)),"Final documentary binary not committed");
 const buffer=fs.readFileSync(path.join(root,video));
 assert.ok(buffer.length>1_000_000);
 assert.equal(buffer.subarray(4,8).toString(),"ftyp");
 const manifest=JSON.parse(read("assets/films/two-materials-build.json"));
 assert.equal(crypto.createHash("sha256").update(buffer).digest("hex"),manifest.video_sha256);
 assert.equal(manifest.scene_count,10);
 assert.ok(Math.abs(manifest.seconds-150)<0.2);
 const captions=read("assets/films/two-materials-no-section.vtt");
 assert.match(captions,/^WEBVTT/);
 assert.ok((captions.match(/-->/g)||[]).length>=20);
});
test("existing failed experiment story and original film remain intact",()=>{
 const original=read("stories/failed-zebrafish-histology.html");
 const film=read("film.html");
 const home=read("index.html");
 assert.match(original,/I did not obtain the reliable, interpretable sections/);
 assert.match(original,/(?:agarose grade and thermal behaviour|grade and thermal behaviour of (?:the )?agarose)/);
 assert.match(film,/what-survives-the-experiment.mp4/);
 assert.match(home,/rx-feature-film/);
});
test("released film is findable, playable, and remains linked to the first-person primary account",()=>{
 const hub=read("films.html"),article=read("films/two-materials-no-section.html");
 for(const html of [hub,article]){
  assert.ok(html.includes("/assets/films/two-materials-no-section.mp4"));
  assert.ok(html.includes("/assets/films/two-materials-no-section.vtt"));
  assert.match(html,/kind="captions"/);
 }
 assert.ok(article.includes('href="/stories/failed-zebrafish-histology.html"'));
 assert.ok(article.includes("id=\"source-record\""));
 const index=JSON.parse(read("assets/discovery-index.json"));
 assert.ok(index.items.some(x=>x.url==="/films/two-materials-no-section.html"));
});