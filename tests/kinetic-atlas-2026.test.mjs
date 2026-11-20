import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read = p => readFileSync(new URL('../'+p, import.meta.url), 'utf8');
const otherPages = [
  'research.html','publications.html','films.html','stories.html','writing.html',
  'archive.html','methods-evidence.html','molecular-therapeutics.html','computing.html',
  'imaging.html','training.html','grants.html','leadership.html','engagement.html',
  'research-horizon.html','recommended-books.html','chem-squad.html','major-revisions.html'
];

test('four new homepage scenes and eighteen additional page-specific scenes',()=>{
  const js=read('assets/ruwaidix-kinetic-atlas-2026.js');
  const homes=[...js.matchAll(/key:\s*"h-[a-z-]+"/g)].map(m=>m[0]);
  const pages=[...js.matchAll(/key:\s*"p-[a-z-]+"/g)].map(m=>m[0]);
  assert.equal(homes.length,4);
  assert.equal(pages.length,18);
  assert.equal(new Set([...homes,...pages]).size,22);
  for(const page of otherPages) assert.ok(js.includes('page: "'+page+'"'),page);
});

test('all nineteen pages load the additive motion module and preserve historical content',()=>{
  for(const page of ['index.html',...otherPages]){
    const html=read(page);
    assert.match(html,/ruwaidix-kinetic-atlas-2026\.css/);
    assert.match(html,/ruwaidix-kinetic-atlas-2026\.js/);
    assert.match(html,/<main\b/);
    assert.match(html,/<\/main>/);
  }
  const home=read('index.html');
  for(const anchor of ['id="rx-moving-moments"','id="research-workbench"','class="specimen-swim"','id="rx-film-title"'])
    assert.ok(home.includes(anchor),anchor);
  assert.match(read('major-revisions.html'),/major-revisions-cover\.svg/);
  assert.match(read('stories.html'),/id="personal-microscope"/);
});

test('scientific diagrams are described as schematic, not measured results',()=>{
  const js=read('assets/ruwaidix-kinetic-atlas-2026.js');
  assert.match(js,/Schematic.*illustration/i);
  assert.match(js,/رسم توضيحي/);
  assert.doesNotMatch(js,/measured (dose|flow|efficacy|concentration)/i);
  assert.match(js,/\/research\/pulmonary-epithelial-injury\.html/);
  assert.match(js,/\/research\/inhalable-vesicles\.html/);
});

test('responsive accessible interactions respect user preferences',()=>{
  const css=read('assets/ruwaidix-kinetic-atlas-2026.css');
  const js=read('assets/ruwaidix-kinetic-atlas-2026.js');
  assert.match(css,/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css,/@media\s*\(max-width:\s*650px\)/);
  assert.match(css,/html\[lang="ar"\]/);
  assert.match(css,/:focus-visible/);
  assert.match(css,/animation-play-state:\s*paused/);
  assert.match(js,/aria-pressed/);
  assert.match(js,/aria-labelledby/);
  assert.match(js,/pointermove/);
  assert.match(js,/IntersectionObserver/);
  assert.match(js,/matchMedia/);
  assert.match(js,/data-rx-z-en/);
  assert.match(js,/data-rx-z-ar/);
});
