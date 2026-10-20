'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('mobile Explore preserves the same five primary destinations', () => {
  const js = read('assets/unified-pages.js');
  const css = read('assets/unified-pages.css');
  assert.match(js, /items\.slice\(0,5\)\.map\(entry=>link\(entry,"rx-mobile-route"\)\)/);
  assert.match(js, /rx-menu-panel/);
  assert.match(css, /\.rx-universal \.rx-menu-panel \.rx-mobile-route\s*\{\s*display:none/);
  assert.match(css, /@media\(max-width:1100px\)[\s\S]*?\.rx-universal \.rx-menu-panel \.rx-mobile-route\s*\{\s*display:block/);
  assert.match(js, /"\/research\.html"/);
  assert.match(js, /"\/publications\.html"/);
});

test('secondary-page breadcrumbs are semantic and describe current sections', () => {
  const js = read('assets/unified-pages.js');
  for (const page of [
    'research.html','publications.html','writing.html','reading-map.html',
    'recommendations.html','recommended-books.html','recommended-essays.html',
    'recommended-screen.html','training.html','films.html','search.html'
  ]) assert.ok(js.includes('"'+page+'":'), page);
  assert.match(js, /document\.createElement\("nav"\);context\.className="rx-context"/);
  assert.match(js, /setAttribute\("aria-label",label\("Breadcrumb","مسار التصفح"\)\)/);
  assert.match(js, /aria-current="page"/);
});

test('skip link jumps to the real main landmark even if that main already has an ID', () => {
  const js = read('assets/unified-pages.js');
  assert.match(js, /header\.querySelector\("\.rx-skip"\)\.setAttribute\("href","#"\+main\.id\)/);
  assert.match(js, /main\.tabIndex=-1/);
});

test('very narrow and RTL layouts keep the Explore panel reachable', () => {
  const css = read('assets/unified-pages.css');
  assert.match(css, /@media\(max-width:420px\)/);
  assert.match(css, /grid-template-columns:1fr/);
  assert.match(css, /html\[dir=rtl\] \.rx-universal \.rx-menu-panel/);
  assert.match(css, /max-height:.*vh/);
});

test('content and public routes remain unchanged by navigation repair', () => {
  const home = read('index.html');
  const js = read('assets/unified-pages.js');
  for (const route of ['full-record.html#research','full-record.html#publications',
    'full-record.html#writing','full-record.html#history','/archive.html',
    '/stories.html','/techniques.html']) assert.ok(js.includes(route),route);
  for (const marker of ['id="research"','id="publications"','id="rx-home-complete-record"'])
    assert.ok(home.includes(marker),marker);
});
