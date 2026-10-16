"use strict";
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const test=require("node:test"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const story=JSON.parse(read("assets/films/cairo-microscope-scenes.json"));
test("personal documentary is a complete two-minute archival account",()=>{
 assert.equal(story.running_seconds,120);
 assert.equal(story.scenes.length,9);
 assert.match(story.archival_post,/post date, not verified camera date/);
 let start=0;
 for(const s of story.scenes) {
  assert.equal(s.start,start);
  start+=s.duration;
  assert.ok(s.title && s.text && s.note);
  assert.ok(["archive","context","route","typography"].includes(s.mode));
  if(s.image) assert.ok(fs.existsSync(path.join(root,s.image)),s.image);
 }
 assert.equal(start,120);
 assert.match(story.methodological_note,/not the purchase, travel, or scientific measurements/);
});
test("rendered film is an authenticated MP4 with score and caption manifest",()=>{
 const file="assets/films/cairo-microscope.mp4";
 assert.ok(fs.existsSync(path.join(root,file)),"completed video has not yet been published");
 const bytes=fs.readFileSync(path.join(root,file));
 assert.ok(bytes.length>1_000_000);
 assert.equal(bytes.subarray(4,8).toString(),"ftyp");
 const manifest=JSON.parse(read("assets/films/cairo-microscope-build.json"));
 assert.equal(manifest.video_sha256,crypto.createHash("sha256").update(bytes).digest("hex"));
 assert.ok(Math.abs(manifest.seconds-120)<.2);
 assert.equal(manifest.scene_count,9);
 assert.ok(manifest.source_photo_sha256);
 const vtt=read("assets/films/cairo-microscope.vtt");
 assert.match(vtt,/^WEBVTT/);
 assert.ok((vtt.match(/-->/g)||[]).length>=9);
});
test("film collection adds the microscope without removing or rewriting previous documentaries",()=>{
 const hub=read("films.html"),page=read("films/cairo-microscope.html"),story=read("stories.html");
 const site=read("index.html"),index=JSON.parse(read("assets/discovery-index.json"));
 for(const h of [hub,page]) {
  assert.ok(h.includes("/assets/films/cairo-microscope.mp4"));
  assert.ok(h.includes("/assets/films/cairo-microscope.vtt"));
  assert.ok(h.includes('kind="captions"'));
 }
 assert.ok(hub.includes("what-survives-the-experiment.mp4"));
 assert.ok(hub.includes("two-materials-no-section.mp4"));
 assert.match(page,/posted on 1 July 2017/);
 assert.ok(page.includes('href="/stories/cairo-microscope.html"'));
 assert.ok(story.includes('href="/films/cairo-microscope.html"'));
 assert.ok(site.includes('href="/films/cairo-microscope.html"'));
 assert.ok(index.items.some(x=>x.url==="/films/cairo-microscope.html"));
 assert.ok(read("sitemap.xml").includes("https://malruweidi.github.io/films/cairo-microscope.html"));
});

test("the silent Cairo film has a complete Arabic text transcript accessible without playing video", () => {
 const page=read("films/cairo-microscope.html");
 const css=read("assets/cairo-film.css");
 assert.ok(page.includes('id="arabic-transcript"'), "Arabic reading section is absent");
 assert.ok(page.includes('href="#arabic-transcript"'), "Arabic text needs a visible entry point");
 assert.ok(page.includes('lang="ar" dir="rtl"'), "the transcript must declare Arabic right-to-left");
 const captions=read("assets/films/cairo-microscope.ar.vtt");
 const cues=captions.trim().split(/\n\s*\n/).slice(1);
 assert.equal(cues.length,9,"nine original caption scenes must remain represented");
 for(const cue of cues){
   const phrase=cue.split("\n").slice(1).join(" ").trim();
   assert.ok(page.includes(phrase), "missing published Arabic subtitle passage: "+phrase.slice(0,45));
 }
 assert.equal((page.match(/class="cm-arabic-chapter"/g)||[]).length,9);
 assert.ok(css.includes(".cm-arabic-chapter"),"Arabic film typography is missing");
 assert.match(css,/font-family:[^;]*Noto Naskh Arabic/);
 assert.match(page,/الصوت موسيقى فقط/);
 const english=JSON.parse(read("assets/films/cairo-microscope-scenes.json"));
 for(const scene of english.scenes) assert.ok(page.includes(scene.text),"Do not abridge the original English film text");
});
