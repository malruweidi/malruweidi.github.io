import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('index.html');

test('the new moving-moments chapter preserves the existing homepage record',()=>{
 assert.match(html,/id="rx-moving-moments"/);
 assert.match(html,/data-rx-moments/);
 assert.match(html,/anatomy-of-a-question-2026-v2\.mp4/);
 assert.match(html,/id="research-workbench"/);
 assert.match(html,/class="family-drawer"/);
 assert.match(html,/id="rx26-portal"/);
});

test('four archival moments use original resources with honest provenance',()=>{
 for(const src of [
  '/assets/personal-archive/toy.webp',
  '/assets/oct12-owner-photos/microscopy-vacation-morning-2017.webp',
  '/assets/evidence-zebrafish.webp',
  '/assets/niosomes-concept.svg'])assert.ok(html.includes(src),src);
 assert.match(html,/Undated family photograph/);
 assert.match(html,/Published figure/);
 assert.match(html,/Conceptual illustration/);
 assert.equal((html.match(/data-rx-moment-panel/g)||[]).length,4);
});

test('the sequence has accessible controls and no-JavaScript fallbacks',()=>{
 const js=read('assets/ruwaidix-moving-moments-2026.js');
 const css=read('assets/ruwaidix-moving-moments-2026.css');
 assert.match(js,/aria-selected/);
 assert.match(js,/ArrowRight/);
 assert.match(js,/Escape/);
 assert.match(js,/visibilitychange/);
 assert.match(js,/dataset\.enhanced/);
 assert.match(css,/data-enhanced="true"/);
 assert.match(css,/prefers-reduced-motion:\s*reduce/);
 assert.match(css,/max-width:\s*600px/);
 assert.match(html,/data-rx-moments-play/);
});

test('original gallery section remains available next to the new scene',()=>{
 assert.match(html,/class="rx-chapters"/);
 assert.match(html,/id="rx-chapter-heading"/);
 assert.match(html,/id="film"/);
 assert.match(html,/ruwaidix-moving-moments-2026\.css/);
});
