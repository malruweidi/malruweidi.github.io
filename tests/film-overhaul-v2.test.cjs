'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const original=JSON.parse(read('assets/films/publication-series.json'));
const directions=JSON.parse(read('assets/films/remake-direction.json'));
test('the full 35-film archive remains untouched and each remake has original direction',()=>{
  assert.equal(original.items.length,35);
  assert.deepEqual(new Set(Object.keys(directions.films)),new Set(original.items.map(x=>x.id)));
  for(const film of original.items){
    assert.equal(film.scenes.length,6,film.id);
    const plan=directions.films[film.id];
    assert.ok(plan.motif&&plan.evidence_boundary&&plan.motion_rule,film.id);
    assert.equal(plan.annotations.length,3,film.id);
    for(const scene of film.scenes){
      assert.ok(scene.credit&&scene.link&&scene.narration,film.id);
      assert.ok(fs.existsSync(path.join(root,scene.image.replace(/^\//,''))),scene.image);
    }
  }
});
test('the alternative renderer cannot replace the original released films',()=>{
  const script=read('scripts/remaster-publication-series.py');
  assert.ok(script.includes('series-v2'));
  assert.ok(!script.includes('shutil.rmtree'));
  assert.ok(script.includes('pub.OUTPUT=DIR'));
  assert.ok(script.includes('pub.render(entry,models)'));
  assert.ok(script.includes('story-motion-v2.2'));
  assert.ok(script.includes('and not scene.get("video")'));
  assert.ok(script.includes('scene.get("_remake") and not video'));
});
test('cinematic animation has conspicuous scientific-provenance labelling',()=>{
  const script=read('scripts/film-overhaul-motion.py');
  assert.ok(script.includes('NOT MEASURED DATA'));
  assert.ok(script.includes('ORIGINAL SOURCE VISUAL'));
  assert.ok(script.includes('PARAFFIN  /  SECTION FAILED'));
  assert.ok(script.includes('ILLUSTRATIVE SIGNAL, NOT A READOUT'));
  assert.ok(script.includes('RECONSTRUCTED PROCESS'));
});
test('source-based preview will not claim remakes are human approved',()=>{
  const page=read('film-studio.html');
  assert.ok(page.includes('NOT YET HUMAN-SCREENED'));
  assert.ok(page.includes('remake-direction.json'));
  assert.ok(page.includes('series-v2'));
  assert.ok(page.includes('series') && page.includes("'v1'"));
  assert.ok(page.includes('publication-cinema.html'));
});

test('every authored long-form documentary has an accessible original-vs-recut comparison',()=>{
  const page=read('feature-film-studio.html');
  const directions=JSON.parse(read('assets/films/longform-remake-direction.json'));
  const films=Object.keys(directions.films);
  assert.equal(films.length,9);
  for(const slug of films){
    assert.ok(page.includes('"'+slug+'"'), 'missing feature studio title: '+slug);
    assert.ok(fs.existsSync(path.join(root,'assets','films',slug+'.mp4')), 'original preserved: '+slug);
  }
  assert.ok(page.includes('longform-v2/'));
  assert.ok(page.includes('method:"HEAD"'));
  assert.ok(page.includes('not yet human-screened'));
  assert.ok(read('film-studio.html').includes('feature-film-studio.html'));
  assert.ok(read('films.html').includes('feature-film-studio.html'));
});
