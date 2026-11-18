'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('chapter index has no stamped top-right arrows, including the original nine HTML arrow spans',()=>{
 const home=read('index.html');
 const portal=home.slice(home.indexOf('class="rx26-portal-grid"'),home.indexOf('class="rx26-portal-paths"'));
 assert.equal((portal.match(/class="rx26-portal-card"/g)||[]).length,9);
 assert.doesNotMatch(portal,/class="rx26-card-arrow"/);
 for(const dest of ['research','publications','films','stories','illness-and-evidence','writing','chem-squad','leadership','major-revisions']) assert.ok(portal.includes('href="/'+dest+'.html"'));
 assert.equal((portal.match(/class="rx26-card-action"/g)||[]).length,9,'meaningful end-of-card navigation remains');
});
test('card design cannot paint pseudo-circle ornaments or repeat arrows on cards',()=>{
 const css=read('assets/ruwaidix-ink-atlas-2026.css');
 assert.match(css,/\.rx26-portal-card::before/);
 assert.match(css,/\.rx26-portal-card::after/);
 assert.match(css,/content:none!important/);
 assert.doesNotMatch(css,/ruwaidix-ink-arrow-2026\.svg/);
 assert.doesNotMatch(css,/ruwaidix-ink-orbit-2026\.svg/);
});
test('actual research photograph and existing film poster drive two intentional visual treatments',()=>{
 const css=read('assets/ruwaidix-ink-atlas-2026.css');
 assert.ok(css.includes('/archive/archive-7884.jpg'));
 assert.ok(css.includes('/assets/films/anatomy-of-a-question-2026-v2.webp'));
 assert.ok(fs.existsSync(path.join(root,'archive/archive-7884.jpg')));
 assert.ok(fs.existsSync(path.join(root,'assets/films/anatomy-of-a-question-2026-v2.webp')));
 assert.match(css,/\.rx26-portal-card:nth-child\(9\)/);
 assert.match(css,/\.rx26-portal-card:nth-child\(3\)/);
});
test('browser refresh loads a new versioned CSS chain instead of its cached predecessor',()=>{
 const home=read('index.html'),blue=read('assets/ruwaidix-one-blue-2026.css');
 assert.ok(home.includes('ruwaidix-one-blue-2026.css?v=20261118-blue2'));
 assert.ok(blue.includes('ruwaidix-ink-atlas-2026.css?v=20261118-a2'));
 assert.equal(home.split('ruwaidix-one-blue-2026.css?v=20261118-blue2').length,2);
});
test('film source, video captions, source routes and original science survive the repair',()=>{
 const html=read('index.html');
 assert.ok(html.includes('src="/assets/films/anatomy-of-a-question-2026-v2.mp4"'));
 assert.ok(html.includes('kind="captions" src="/assets/films/anatomy-of-a-question-2026-v2.vtt"'));
 assert.ok(html.includes('alt="Original explanatory schematic of epithelial injury, not study data"'));
 assert.ok(html.includes('id="rx-home-complete-record"'));
 const css=read('assets/ruwaidix-ink-atlas-2026.css');
 assert.doesNotMatch(css,/(?:video\s*\{|object-fit\s*:|aspect-ratio\s*:)/);
 assert.match(css,/@media\(max-width:720px\)/);
 assert.match(css,/html\[dir="rtl"\]/);
});
