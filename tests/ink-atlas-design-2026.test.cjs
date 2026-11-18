'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const css = read('assets/ruwaidix-ink-atlas-2026.css');
const home = read('index.html');

test('the blue site loads one revised editorial composition layer, without stacking another stylesheet', () => {
 const blue=read('assets/ruwaidix-one-blue-2026.css');
 const active='/assets/ruwaidix-ink-atlas-2026.css?v=20261118-a1';
 assert.equal(blue.split(active).length-1,1);
 assert.ok(blue.indexOf(active)>blue.indexOf('/assets/ruwaidix-blue-home-compat-2026.css'));
 assert.ok(blue.indexOf(active)<blue.indexOf(':root'));
 assert.doesNotMatch(blue,/ruwaidix-art-direction-2026\.css/);
 for(const token of ['--blue-950:#101e35','--blue-700:#345b8e','--blue-050:#f4f7fb'])
  assert.ok(blue.includes(token),'retained existing blue token: '+token);
});

test('a drawn arrow appears only on the primary Research chapter destination', () => {
 assert.equal((css.match(/ruwaidix-ink-arrow-2026\.svg/g)||[]).length,1);
 assert.match(css,/\.rx26-portal-card:nth-child\(1\) \.rx26-card-arrow/);
 assert.doesNotMatch(css,/ruwaidix-ink-orbit-2026\.svg/);
 assert.doesNotMatch(css,/content:\s*["\u0027]/);
 assert.match(css,/No generic ::before\/::after arrow graphics appear/);
 const arrow=read('assets/ruwaidix-ink-arrow-2026.svg');
 assert.match(arrow,/^<svg\b/);
 assert.match(arrow,/<path\b/);
 assert.doesNotMatch(arrow,/<script|<image\b|(?:href|src)=["\u0027]https?:\/\//i);
});

test('creative composition alters real layouts and uses distinct visual treatments', () => {
 for(const selector of [
  '.rx-editorial-hero','.rx-home-film','.rx26-portal-card',
  '.rs-side','.rs-card','#molecular-chemistry .rs-grid',
  '.pub-list','.pub-card','.fc-release','.fc-card',
  '.stories-chapter-meta','.stories-chapter-text','.photo-card',
  '.rxw-feature','.rxw-essay-grid','.rx-book-hero',
  '.map-route','.rh-question','.rr-entry'
 ]) assert.ok(css.includes(selector),'missing content-aware styling '+selector);
 assert.match(css,/grid-template-columns:repeat\(12,minmax\(0,1fr\)\)/);
 assert.match(css,/\.map-route:nth-of-type\(even\)/);
 assert.match(css,/font-family:var\(--rx-compose-serif\)/);
 assert.doesNotMatch(css,/position\s*:\s*fixed/);
 assert.doesNotMatch(css,/backdrop-filter/);
});

test('supporting technical, clinical, literary and institutional pages have appropriate restraint', () => {
 for(const p of [
  'research-detail','methods-evidence','molecular-therapeutics','imaging',
  'evidence-reader','cv','grants','leadership','supervisors',
  'training','engagement','computing','recommendations','discovery',
  'illness-evidence','major-revisions','research-horizon','reading-map'
 ]) assert.ok(css.includes('data-rx-page="'+p+'"'),p);
 assert.doesNotMatch(css,/(?:object-fit|aspect-ratio|video\s*\{)/);
 assert.match(css,/Never draw imaginary relationships between clinical events/);
});

test('Arabic layouts, mobile widths, and motion sensitivity are respected', () => {
 assert.match(css,/html\[dir="rtl"\]/);
 assert.match(css,/@media\(max-width:720px\)/);
 assert.match(css,/@media\(max-width:959px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/:focus-visible/);
 assert.match(css,/outline:3px/);
});

test('actual homepage film, source context and all nine real chapters are preserved', () => {
 const dirs=['/research.html','/publications.html','/films.html','/stories.html',
  '/illness-and-evidence.html','/writing.html','/chem-squad.html',
  '/leadership.html','/major-revisions.html'];
 const portal=home.slice(home.indexOf('class="rx26-portal-grid"'),home.indexOf('class="rx26-portal-paths"'));
 for(const page of dirs)assert.ok(portal.includes('href="'+page+'"'),page);
 assert.equal((portal.match(/class="rx26-portal-card"/g)||[]).length,9);
 for(const id of ['id="rx-film-title"','class="rx-home-film-media"','id="research"','id="publications"'])
  assert.ok(home.includes(id),id);
 assert.ok(home.includes('<video'));
});

test('the CSS remains self-contained and syntactically balanced',()=>{
 let depth=0;
 for(const c of css){if(c==='{')depth++;else if(c==='}')depth--;assert.ok(depth>=0);}
 assert.equal(depth,0);
 assert.ok(css.length<36000);
});
