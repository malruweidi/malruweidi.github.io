'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const load=(p)=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const films=load('assets/films/cinematic-library-v2.json').films;
const allowedMoves=new Set(['lock','slow-push','slow-pull','pan-left','pan-right','rise','settle']);
const approvedVoices=new Set(['bm_george','bm_lewis','am_michael','bf_emma']);
test('all 44 film editions receive individualized camera, voice and editorial strategies',()=>{
 const ledger=load('assets/films/directors-ledger-v3.json');
 assert.equal(ledger.status,'UNAPPROVED_DIRECTORIAL_WORKPRINTS');
 assert.equal(ledger.films.length,44);
 assert.equal(new Set(ledger.films.map(f=>f.slug)).size,44);
 assert.deepEqual(new Set(ledger.films.map(f=>f.slug)),new Set(films.map(f=>f.slug)));
 for(const entry of ledger.films){
  const film=films.find(f=>f.slug===entry.slug);
  assert.ok(entry.editorial_argument?.length>=20,entry.slug+' argument');
  assert.ok(entry.visual_motif?.length>=18,entry.slug+' motif');
  assert.ok(approvedVoices.has(entry.voice_preview),entry.slug+' voice');
  assert.equal(entry.camera_moves.length,film.shots.length,entry.slug+' scene-specific camera');
  assert.ok(entry.camera_moves.every(x=>allowedMoves.has(x)),entry.slug+' invalid camera');
  assert.ok(new Set(entry.camera_moves).size>=2,entry.slug+' repetitive one-shot camera');
  assert.ok(entry.review_question?.length>=18,entry.slug+' human review');
  film.shots.forEach((shot,n)=>{
    if(shot.object_id || /figure|microscopy|published|chart|experimental|measurement|historical object/i.test(shot.kind))
      assert.equal(entry.camera_moves[n],'lock',entry.slug+' evidence image must never be cropped');
  });
 }
});
test('director-ledger camera edits are preview only and part of storyboard freshness digest',()=>{
 const filmLibrary=fs.readFileSync(path.join(root,'scripts/render-cinematic-library.py'),'utf8');
 const studio=fs.readFileSync(path.join(root,'scripts/render-directors-cuts.py'),'utf8');
 assert.match(filmLibrary,/directors-ledger-v3\.json/);
 assert.match(filmLibrary,/camera_moves/);
 assert.match(studio,/cinematic_photo_clip/);
 assert.match(studio,/camera_move/);
 assert.match(filmLibrary,/never_auto_publish/);
});
