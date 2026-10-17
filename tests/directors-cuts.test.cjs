'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const bible=JSON.parse(read('assets/films/directors-cuts-v2.json')),render=read('scripts/render-directors-cuts.py');
test('pilots have distinct visuals, pacing and provenance',()=>{
 assert.equal(bible.films.length,3);
 for(const f of bible.films){
  assert.equal(f.shots.reduce((n,s)=>n+s.sec,0),120,f.slug);
  assert.ok(f.shots.length>=8 && f.voiceDirection.length>60,f.slug);
  const sources=new Set();
  for(const s of f.shots){
   assert.ok(s.title && s.credit && s.narration);
   assert.ok(s.narration.split(/\s+/).length/s.sec<=2.55,f.slug+': '+s.title);
   if(s.kind==='museum_public_domain'){ assert.ok([451400,446288].includes(s.object_id));sources.add('MET'+s.object_id); }
   else{ assert.ok(fs.existsSync(path.join(root,s.image)),s.image);sources.add(s.image); }
  }
  assert.ok(sources.size>=5,f.slug+' too visually repetitive');
 }
});
test('failed histology stays a failed histology',()=>{
 const text=bible.films.find(f=>f.slug==='two-materials-no-section').shots.map(s=>s.narration).join(' ');
 assert.match(text,/no useful section formed/i);
 assert.match(text,/photograph alone cannot establish/i);
 assert.match(text,/no final histological section/i);
});
test('historical manuscript is correctly distinguished from medieval Cairo source',()=>{
 const f=bible.films.find(f=>f.slug==='making-medicines-keep');
 assert.deepEqual(f.shots.filter(s=>s.object_id).map(s=>s.object_id),[451400,446288]);
 for(const s of f.shots.filter(s=>s.object_id)) assert.match(s.credit,/Baghdad.*not a Cairo document|Baghdad.*not a depiction/);
 assert.ok(render.includes('record.get("isPublicDomain")'));
});
test('airway film respects the laboratory-to-clinic boundary',()=>{
 const f=bible.films.find(f=>f.slug==='what-a-bubble-can-do'),t=f.shots.map(s=>s.narration).join(' ');
 assert.match(t,/Cell culture is not clinical ventilation/);
 assert.match(t,/dexamethasone and transdehydroandrosterone/);
 assert.match(f.primary,/japplphysiol\.00574\.2020/);
});
test('new films cannot overwrite public movies or be silently published',()=>{
 assert.ok(render.includes('assets/films/preview-v2'));
 assert.ok(render.includes('UNAPPROVED ROUGH CUT'));
 assert.ok(render.includes('voice_approved":False'));
 assert.ok(render.includes('default="human"'));
 assert.ok(!render.includes('assets/films/series/'));
 assert.ok(fs.existsSync(path.join(root,'assets/films/what-survives-the-experiment.mp4')));
 assert.ok(fs.existsSync(path.join(root,'assets/films/making-medicines-keep.mp4')));
});
