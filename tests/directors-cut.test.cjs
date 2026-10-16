'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname,'..');
const cut = JSON.parse(fs.readFileSync(path.join(root,'assets/films/director-cuts/making-medicines-keep.json'),'utf8'));

test('director edition is a source-attributed 120-second distinct treatment, not the original eight static slides', () => {
  assert.equal(cut.seconds,120);
  assert.equal(cut.chapters.length,8);
  const all=cut.chapters.flatMap(x=>x.shots);
  assert.ok(all.length>=16, 'at least two distinct editorial angles per chapter');
  assert.ok(new Set(all.map(x=>x.image||x.remote)).size>=10, 'visual repertoire must be materially expanded');
  assert.ok(new Set(cut.chapters.map(x=>x.narration)).size===8);
  assert.ok(all.filter(x=>x.remote).length>=3,'contextual licensed source images are required');
});

test('historical comparison is not confused with the Cairo manual itself', () => {
  for(const shot of cut.chapters.flatMap(x=>x.shots)) {
    assert.ok(shot.credit && shot.type);
    if(shot.remote){
      assert.match(shot.remote,/^https:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\//);
      assert.match(shot.source,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      assert.match(shot.credit,/CC0|CC BY|public domain/i);
    } else {
      assert.ok(fs.existsSync(path.join(root,shot.image)),shot.image);
    }
  }
  assert.match(cut.chapters[2].shots[0].credit,/Baghdad.*NOT.*Cairo/i);
  assert.match(cut.scientific_status,/NOT.*Cairo manuscript/);
  assert.match(cut.source,/accepted.*15 October 2026/i);
});

test('source-preserving preview cannot overwrite any historical release or current website page', () => {
  const p=fs.readFileSync(path.join(root,'scripts/render-directors-cut.py'),'utf8');
  assert.ok(p.includes('TARGET = ROOT / "assets/films/director-cuts"'));
  assert.ok(p.includes('making-medicines-keep-directors-cut-'));
  assert.ok(p.includes('Human audio approval required'));
  assert.ok(p.includes('raise RuntimeError("Source image cannot be fetched; refusing to replace with fake evidence'));
  assert.ok(fs.existsSync(path.join(root,'assets/films/making-medicines-keep.mp4')));
  assert.ok(fs.existsSync(path.join(root,'assets/films/series/making-medicines-keep.mp4')));
});
