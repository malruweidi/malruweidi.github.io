'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root,file),'utf8');
const home = read('index.html');

test('the original homepage is preserved except removal of nine redundant card-header arrows', () => {
  const atlasAssets = '<link rel="stylesheet" href="/assets/atlas-of-questions-2026.css?v=20261118"><script src="/assets/atlas-of-questions-2026.js?v=20261118" defer></script>';
  assert.equal(home.split(atlasAssets).length, 2, 'The navigation enhancement must be added exactly once');
  assert.equal(home.split('<link rel="stylesheet" href="/assets/ruwaidix-one-blue-2026.css?v=20261118-blue2">').length,2,'The blue identity must be linked exactly once');
  assert.equal(home.replace(atlasAssets, '').replace('<link rel="stylesheet" href="/assets/ruwaidix-one-blue-2026.css?v=20261118-blue2">', ''), read('home-legacy-2026.html').split('<span class="rx26-card-arrow" aria-hidden="true">↗</span>').join(''),
    'Preserve the original content, video and routes while removing only repeated ornamental arrows');
  assert.match(home, /data-rx-page="home"/);
  assert.doesNotMatch(home, /data-rx-page="living-home"/);
  assert.equal((home.match(/<h1\b/g)||[]).length,1);
});

test('the original 06:26 documentary is prominently available with captions', () => {
  assert.match(home, /<section class="rx-home-film" id="film"/);
  assert.match(home, /id="rx-feature-film"/);
  assert.match(home, /src="\/assets\/films\/anatomy-of-a-question-2026-v2\.mp4"/);
  assert.match(home, /kind="captions" src="\/assets\/films\/anatomy-of-a-question-2026-v2\.vtt"/);
  assert.match(home, /Anatomy <em>of a Question\.<\/em>/);
  assert.ok(fs.existsSync(path.join(root,'assets/films/anatomy-of-a-question-2026-v2.mp4')));
  assert.ok(fs.existsSync(path.join(root,'assets/films/anatomy-of-a-question-2026-v2.vtt')));
});

test('all nine original collections and the historical record remain on the homepage', () => {
  assert.match(home,/id="rx26-portal"/);
  assert.equal((home.match(/class="rx26-portal-card"/g)||[]).length,9);
  for(const page of ['research','publications','films','stories','illness-and-evidence',
                     'writing','chem-squad','leadership','major-revisions']) {
    assert.ok(home.includes('href="/'+page+'.html"'),page);
  }
  for(const section of ['research','publications','film','story','patient-perspective',
                        'framework','methods','imaging','quality','history','writing',
                        'community','quacs','about','three-places']) {
    assert.ok(home.includes('id="'+section+'"'),section);
  }
  assert.match(home,/id="rx-home-complete-record"/);
  assert.match(home,/rxOpenDeepLink/);
  assert.match(home,/hashchange/);
});

test('experimental prototype stays separate and cannot replace the approved homepage', () => {
  assert.ok(fs.existsSync(path.join(root,'living-desk-preview.html')));
  assert.notEqual(home, read('living-desk-preview.html'));
});
