const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const get=p=>fs.readFileSync(path.join(root,p),"utf8");
const plan=JSON.parse(get("assets/films/what-survives-scenes.json"));
test("The film is two minutes, twelve traceable scenes and actual archival media",()=>{
 assert.equal(plan.running_seconds,120);
 assert.equal(plan.scenes.length,12);
 for(const [i,scene] of plan.scenes.entries()){
   assert.equal(scene.id,String(i+1).padStart(2,"0"));
   assert.ok(scene.title&&scene.narration&&scene.credit&&scene.link&&scene.image);
   assert.ok(!/proof of clinical benefit|cured|successful histology/i.test(scene.narration));
   for(const key of ["image","video","fallback"]){
     const p=scene[key];
     if(p&&!p.startsWith("https://")) assert.ok(fs.existsSync(path.join(root,p)),p);
   }
 }
});
test("Homepage removes embedded HeyGen watermark source without deleting primary record",()=>{
 const home=get("index.html");
 assert.doesNotMatch(home,/caption_83dd291755454eed969cbd6228446288|app\.heygen\.com\/videos/);
 assert.match(home,/id="film"/);
 assert.match(home,/what-survives-the-experiment\.mp4/);
 assert.match(home,/href="\/film\.html"/);
 for(const id of ["research","story","publications","contact","visual-archive","patient-perspective","quacs"])assert.ok(home.includes('id="'+id+'"'),id);
});
test("Film page provides accessible script, scientific source links, and graceful fallback",()=>{
 const film=get("film.html");
 const sourcebook=get("film-sourcebook.html");
 assert.match(film,/film-sourcebook\.html#portrait/);
 assert.match(film,/id="film-fallback"/);
 assert.match(film,/kind="captions"/);
 for(const s of plan.scenes)assert.ok(sourcebook.includes(s.narration),s.id);
 assert.match(sourcebook,/Original footage/i);
});
