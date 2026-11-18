'use strict';
/* A source-level contract for the reversible, sitewide editorial art direction.
 * These tests guard presentation/preservation; browser screenshot QA remains separate. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const blue = read('assets/ruwaidix-one-blue-2026.css');
const art = read('assets/ruwaidix-art-direction-2026.css');

test('sitewide art stylesheet loads through the established blue identity after its component imports', () => {
  const link = '@import url("/assets/ruwaidix-art-direction-2026.css?v=20261118-atlas1");';
  assert.equal(blue.split(link).length - 1, 1, 'exactly one art-direction import');
  assert.ok(blue.indexOf(link) > blue.indexOf('ruwaidix-blue-home-compat-2026.css'));
  assert.ok(blue.indexOf(link) < blue.indexOf(':root,html'), 'imports must be before ordinary CSS rules');
  assert.match(art, /--rx-art-ink:#192d4b/);
  assert.match(art, /--rx-art-mid:#345b8e/);
  assert.match(art, /--rx-art-light:#7193bf/);
});

test('drawn SVG arrows recur throughout distinct public page families', () => {
  for (const token of ['--rx-ink-swoop','--rx-ink-arrow','--rx-ink-curve']) {
    assert.ok(art.includes(token+':url("data:image/svg+xml'), token);
  }
  for (const page of [
    'home','research-hub','research-detail','publications','films','stories','archive',
    'writing','major-revisions','research-horizon','reading-map','methods-evidence',
    'molecular-therapeutics','imaging','grants','cv','leadership','supervisors',
    'engagement','computing','training','recommendations','discovery','evidence-reader'
  ]) {
    assert.ok(art.includes('[data-rx-page="'+page+'"]'), 'missing page family: '+page);
  }
  assert.match(art, /rx-art-rule/);
  assert.match(art, /background:var\(--rx-ink-swoop\)/);
});

test('design is responsive and respects directional text, keyboard users, and reduced motion', () => {
  assert.match(art, /@media \(max-width:900px\)/);
  assert.match(art, /@media \(max-width:650px\)/);
  assert.match(art, /html\[dir="rtl"\]/);
  assert.match(art, /html\[lang="ar"\]/);
  assert.match(art, /\/\* rx-art-rtl:/);
  assert.match(art, /@media \(prefers-reduced-motion:reduce\)/);
  assert.match(art, /\/\* rx-art-reduced-motion:/);
  assert.match(art, /focus-visible/);
  assert.match(art, /@media \(forced-colors:active\)/);
});

test('original documentary and nine chapter destinations remain available', () => {
  const home = read('index.html');
  assert.ok(home.includes('Anatomy of a Question'));
  assert.ok((home.match(/<video\b/g) || []).length >= 1);
  assert.equal((home.match(/class="rx26-portal-card"/g) || []).length, 9);
  for (const page of [
    'research.html','publications.html','films.html','stories.html',
    'illness-and-evidence.html','writing.html','chem-squad.html',
    'leadership.html','major-revisions.html'
  ]) assert.ok(home.includes(page), 'lost chapter destination: '+page);
  assert.doesNotMatch(art, /(^|\n)\s*(video|source|track)\s*[{,]/m);
  assert.doesNotMatch(art, /(^|\n)\s*(img|figure)\s*\{[^}]*object-fit/m);
});

test('new global CSS is balanced and stays self-contained', () => {
  let depth=0;
  for (const char of art) {
    if(char==='{') depth++;
    if(char==='}') depth--;
    assert.ok(depth>=0, 'unexpected closing brace');
  }
  assert.equal(depth, 0);
  assert.ok(art.length < 50000, 'avoid another unwieldy global override bundle');
});
