'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('overlooked archival and personal sources receive their own edited doorway',()=>{
  assert.ok(fs.existsSync(path.join(root,'behind-the-record.html')),'Missing permanent editorial archive guide');
  const page=read('behind-the-record.html');
  assert.match(page,/<h1\b[^>]*>/);
  assert.match(page,/href="\/stories\.html#school-chemistry-and-graduation"/);
  assert.match(page,/href="\/illness-and-evidence\.html#life-between-diagnoses"/);
  for(const route of ['/scientific-fieldnotes-2026.html','/moving-evidence.html','/engagement.html#acs-2019','/archive.html#rxRecoveredGallery','/full-record.html','/major-revisions.html','/research-horizon.html']){
    assert.ok(page.includes('href="'+route+'"'),'Missing important, existing source route '+route);
  }
  const images=[...page.matchAll(/<img[^>]*src="(\/assets\/[^"]+)"/g)].map(m=>m[1]);
  assert.ok(images.length>=6,'Reuse substantial original, verified archive imagery');
  for(const src of images)assert.ok(fs.existsSync(path.join(root,src.slice(1))),'Missing or fabricated media '+src);
});

test('homepage remains concise while revealing preserved archival collections',()=>{
  const home=read('index.html');
  const visible=home.split('<details class="rx-home-complete-record"')[0];
  assert.match(visible,/href="\/behind-the-record\.html"/);
  assert.equal((visible.match(/class="rx26-portal-card"/g)||[]).length,9,'Do not lengthen the main chapter grid');
  assert.match(visible,/href="\/major-revisions\.html"/);
  assert.match(home,/id="rx-home-complete-record"/);
});

test('archive route, bilingual homepage shortcut and internal search point to the new guide',()=>{
 const page=read('archive.html');
 assert.match(page,/href="\/behind-the-record\.html"/);
 assert.match(read('sitemap.xml'),/\/behind-the-record\.html/);
 const index=JSON.parse(read('assets/discovery-index.json'));
 for(const route of ['/behind-the-record.html','/research-horizon.html']){
   assert.ok(index.items.some(item=>item.url===route),'Missing source from public search '+route);
 }
 const i18n=read('assets/home-portal-i18n-2026.js');
 assert.ok(i18n.includes('"Beyond the homepage ↗":'));
});

test('editorial navigation does not display internal producer manifests or superseded pages',()=>{
 const guide=read('behind-the-record.html');
 assert.doesNotMatch(guide,/PROVENANCE-LEDGER|MEDIA-INTAKE|date not verified|producer notes|v7-staging/i);
 assert.doesNotMatch(guide,/cinema-quality-preview\.html|preview-rx23\.html/);
});
