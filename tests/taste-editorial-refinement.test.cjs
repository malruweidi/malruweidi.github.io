'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('Taste refinement is loaded last and remains a reversible stylesheet', () => {
  const html = read('index.html');
  const css = read('assets/taste-editorial-2026-10-18.css');
  const link = '<link rel="stylesheet" href="/assets/taste-editorial-2026-10-18.css?v=1">';
  assert.equal(html.split(link).length - 1, 1, 'Exactly one homepage style import');
  assert.ok(html.indexOf(link) > html.indexOf('rx26-home-portal-style'), 'Taste should override existing chapter CSS');
  assert.ok(html.indexOf(link) < html.indexOf('</head>'), 'Stylesheet belongs in head');
  assert.match(css, /data-rx-page="home"/, 'Rules must be homepage-specific');
  assert.match(css, /prefers-reduced-motion:reduce/, 'Honor reduced-motion preference');
  assert.match(css, /max-width:610px/, 'Retain narrow phone layout');
  assert.match(css, /max-width:900px/, 'Retain tablet layout');
  assert.match(css, /min-width:1171px/, 'Wide-screen layout is intentional');
  assert.doesNotMatch(css, /@import|url\(https?:|@font-face/i, 'No new remote font/image dependencies');
});

test('nine curated home chapters and original academic record remain accessible', () => {
  const home = read('index.html');
  const aboveRecord = home.split('<details class="rx-home-complete-record"')[0];
  const urls = [
    '/research.html', '/publications.html', '/films.html', '/stories.html',
    '/illness-and-evidence.html', '/writing.html', '/chem-squad.html',
    '/leadership.html', '/major-revisions.html'
  ];
  const cards = [...aboveRecord.matchAll(/<a class="rx26-portal-card" href="([^"]+)"/g)].map(x => x[1]);
  assert.deepEqual(cards, urls, 'No removed, reordered or duplicated chapters');
  assert.match(home, /id="rx-home-complete-record"/, 'Complete earlier homepage remains');
  assert.match(home, /id="film"/, 'Original film remains');
  assert.match(home, /class="rx-hero-portrait"/, 'Original portrait remains');
  assert.match(home, /I learned to make molecules/, 'Original autobiographical opening remains');
  assert.match(home, /My current MSc work examines dexamethasone niosomes and proniosomes/);
  assert.match(home, /href="\/for-supervisors\.html"/);
  assert.match(home, /href="\/research-horizon\.html"|href="research-horizon\.html"/);
});

test('the new CSS never collapses or hides primary content', () => {
  const css = read('assets/taste-editorial-2026-10-18.css');
  for (const forbidden of [
    /(?:\.rx26-portal|\.rx-home-complete-record|\.rx-home-film)\s*\{[^}]*display\s*:\s*none/s,
    /(?:\.rx26-portal|\.rx-home-complete-record|\.rx-home-film)\s*\{[^}]*visibility\s*:\s*hidden/s,
    /(?:\.rx26-portal|\.rx-home-complete-record|\.rx-home-film)\s*\{[^}]*max-height\s*:\s*0/s
  ]) assert.doesNotMatch(css, forbidden);
  assert.match(css, /nth-child\(9\)/, 'Last chapter explicitly fitted to the grid');
});
