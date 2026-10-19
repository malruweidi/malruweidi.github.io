'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const archive=JSON.parse(read('assets/films/cinematic-library-v2.json'));
const modern=JSON.parse(read('assets/films/publication-series-directors-v2.json'));
const original=JSON.parse(read('assets/films/publication-series.json'));
test('44 source-grounded remakes retain distinct ids, images, time budgets and records',()=>{
 assert.equal(archive.films.length,44);
 assert.equal(new Set(archive.films.map(f=>f.slug)).size,44);
 assert.equal(modern.films.length,original.items.length);
 assert.equal(archive.films.filter(f=>f.output_collection==='publication').length,35);
 assert.equal(archive.films.filter(f=>f.output_collection==='feature').length,9);
 for(const f of archive.films){
   assert.ok(f.title && f.primary && f.source_path,f.slug);
   assert.ok(f.shots.length>=8,f.slug);
   const sec=f.shots.reduce((n,s)=>n+s.sec,0);
   assert.ok(sec>=120 && sec<=168,f.slug+': '+sec);
   for(const s of f.shots){
     assert.ok(s.title && s.narration && s.credit,f.slug);
     if(s.object_id)assert.ok([451400,446288].includes(s.object_id));
     else assert.ok(fs.existsSync(path.join(root,s.image)),f.slug+': '+s.image);
     assert.ok(s.narration.split(/\s+/).length/s.sec<=2.8,f.slug+' '+s.title);
   }
 }
});
test('all 35 publications have a changed beginning, middle and conclusion',()=>{
 const prior=new Map(original.items.map(f=>[f.id,f]));
 for(const f of modern.films){
   const old=prior.get(f.source_id);assert.ok(old,f.source_id);
   assert.notEqual(f.shots[0].narration,old.scenes[0].narration,f.id);
   assert.notEqual(f.shots[5].narration,old.scenes[4].narration,f.id);
   assert.notEqual(f.shots[7].narration,old.scenes[5].narration,f.id);
   assert.equal(f.shots.reduce((n,s)=>n+s.sec,0),120);
   assert.ok(f.story_spine,f.id);
 }
});
test('unsuccessful histology is not represented as successful',()=>{
 for(const id of ['two-materials-no-section','pub-histology-failure','feature-two-materials-no-section-evidence-cut']){
  const f=archive.films.find(x=>x.slug===id);assert.ok(f,id);
  const s=f.shots.map(x=>x.narration).join(' ').toLowerCase();
  assert.match(s,/fail|no useful section|no interpretable section|never emerged|did not work/,id);
 }
});
test('comparative medieval art is public domain and identified correctly',()=>{
 const f=archive.films.find(x=>x.slug==='making-medicines-keep');
 const met=f.shots.filter(s=>s.object_id);
 assert.deepEqual(met.map(s=>s.object_id),[451400,446288]);
 assert.ok(met.every(s=>s.credit.includes('Baghdad')));
 const renderer=read('scripts/render-directors-cuts.py');
 assert.ok(renderer.includes('record.get("isPublicDomain")'));
 assert.ok(renderer.includes('record.get("objectID") != object_id'));
});
test('both original collections stay and new videos use preview-only route',()=>{
 for(const p of ['assets/films/what-survives-the-experiment.mp4','assets/films/what-a-bubble-can-do.mp4','assets/films/making-medicines-keep.mp4','assets/films/ring-that-never-closed.mp4','assets/films/series/airway-reopening.mp4','assets/films/series/essay-adc.mp4'])assert.ok(fs.existsSync(path.join(root,p)),p);
 const r=read('scripts/render-cinematic-library.py');
 assert.ok(r.includes('OUT=ROOT/"assets/films/library-v2"'));
 assert.ok(r.includes('needs_human_narration_review'));
 assert.ok(r.includes('never_auto_publish'));
 assert.ok(!r.includes('assets/films/series/'));
});
