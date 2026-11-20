import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('scientific objects remain an additive homepage enhancement',()=>{
  const html=read('index.html');
  assert.match(html,/ruwaidix-kinetic-objects-2026\.css/);
  assert.match(html,/ruwaidix-kinetic-objects-2026\.js/);
  for(const protectedPart of ['id="rx-moving-moments"','class="specimen-swim"','class="rx-hero-portrait"','id="research-workbench"']) {
    assert.ok(html.includes(protectedPart),protectedPart);
  }
});

test('research and stories receive different, contextual interactions',()=>{
  const research=read('research.html');
  const stories=read('stories.html');
  assert.match(research,/ruwaidix-kinetic-objects-2026\.js/);
  assert.match(stories,/ruwaidix-kinetic-objects-2026\.js/);
  const behavior=read('assets/ruwaidix-kinetic-objects-2026.js');
  assert.match(behavior,/\.rs-hero-actions/);
  assert.match(behavior,/\.stories-hero-photo/);
  assert.match(behavior,/\.rx-opening-links/);
  assert.match(behavior,/high-speed-zebrafish-imaging\.html/);
  assert.match(behavior,/inhalable-vesicles\.html/);
  assert.match(behavior,/pointermove/);
  assert.match(behavior,/Escape/);
});

test('original research evidence is never represented as an animated measurement',()=>{
  const behavior=read('assets/ruwaidix-kinetic-objects-2026.js');
  assert.match(behavior,/Schematic illustration/);
  assert.match(behavior,/رسم توضيحي/);
  assert.doesNotMatch(behavior,/\bmeasured (flow|size|velocity|efficacy)\b/i);
});

test('motion, mobile layout, and both language directions are supported',()=>{
  const css=read('assets/ruwaidix-kinetic-objects-2026.css');
  assert.match(css,/prefers-reduced-motion:\s*reduce/);
  assert.match(css,/@media\s*\(max-width:\s*650px\)/);
  assert.match(css,/html\[lang="ar"\]/);
  assert.match(css,/:focus-visible/);
  assert.match(css,/animation-play-state:\s*paused/);
  const js=read('assets/ruwaidix-kinetic-objects-2026.js');
  assert.match(js,/matchMedia/);
  assert.match(js,/aria-pressed/);
  assert.match(js,/data-rx-en/);
  assert.match(js,/data-rx-ar/);
});

test('screen-reader labels follow the visible language and magnifier scales with viewport',()=>{
  const js=read('assets/ruwaidix-kinetic-objects-2026.js');
  assert.match(js,/aria-labelledby/);
  assert.doesNotMatch(js,/aria-label","Explore the original zebrafish/);
  assert.match(js,/lens\.getBoundingClientRect\(\)\.width/);
});
