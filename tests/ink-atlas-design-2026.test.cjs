'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const cssPath = 'assets/ruwaidix-ink-atlas-2026.css';

test('editorial artwork is loaded after the existing blue component imports', () => {
  const blue = read('assets/ruwaidix-one-blue-2026.css');
  const ink = '/assets/ruwaidix-ink-atlas-2026.css?v=20261118-a1';
  const anchor = '/assets/ruwaidix-blue-home-compat-2026.css?v=20261118-b1';
  assert.ok(blue.includes(ink), 'new CSS is imported by the global blue entrypoint');
  assert.ok(blue.indexOf(ink) > blue.indexOf(anchor), 'all existing blue component imports precede the artwork');
  assert.ok(blue.indexOf(ink) < blue.indexOf(':root'), 'CSS imports remain at the start of the stylesheet');
  for (const token of ['--blue-950:#101e35','--blue-700:#345b8e','--blue-050:#f4f7fb'])
    assert.ok(blue.includes(token), 'approved blue token retained: ' + token);
});

test('hand-drawn decorative assets have vector paths, not external dependencies', () => {
  for (const asset of ['assets/ruwaidix-ink-arrow-2026.svg','assets/ruwaidix-ink-orbit-2026.svg']) {
    const svg = read(asset);
    assert.match(svg, /^<svg\b/);
    assert.match(svg, /viewBox=/);
    assert.match(svg, /<path\b/);
    assert.match(svg, /<\/svg>\s*$/);
    assert.doesNotMatch(svg, /<script|<image\b|(?:href|src)=["\x27]https?:\/\//i);
  }
});

test('original pages gain different editorials instead of one global decorative overlay', () => {
  const css = read(cssPath);
  for (const selector of [
    '.rx-hero-copy::after', '.rx26-card-arrow', '.rx-home-film-media',
    '.rs-hero', '.pub-hero', '.fc-hero', '.stories-hero',
    '.rxw-hero', '.rx-book-hero', '.map-hero', 'html[data-rx-page="archive"]'
  ]) assert.ok(css.includes(selector), selector);
  assert.doesNotMatch(css, /position\s*:\s*fixed/);
  assert.doesNotMatch(css, /backdrop-filter/);
});

test('mobile, Arabic and reduced-motion readers retain an accessible layout', () => {
  const css = read(cssPath);
  assert.match(css, /@media\s*\(max-width:\s*767px\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /html\[dir="rtl"\]/);
  assert.match(css, /pointer-events:\s*none/);
  assert.match(css, /@media\s*\(min-width:\s*1171px\)/);
});

test('existing homepage video, nine chapter destinations and reading hierarchy remain', () => {
  const home = read('index.html');
  for (const value of ['id="rx-film-title"','class="rx-home-film-media"','<video',
    'id="rx26-portal"','id="research"','id="publications"','id="rx-home-complete-record"'])
    assert.ok(home.includes(value), value);
  const destinations=['/research.html','/publications.html','/films.html','/stories.html',
    '/illness-and-evidence.html','/writing.html','/chem-squad.html','/leadership.html',
    '/major-revisions.html'];
  const portal = home.slice(home.indexOf('class="rx26-portal-grid"'),home.indexOf('class="rx26-portal-paths"'));
  for (const href of destinations) assert.ok(portal.includes('href="'+href+'"'), href);
  assert.equal((portal.match(/class="rx26-portal-card"/g)||[]).length,9);
});
