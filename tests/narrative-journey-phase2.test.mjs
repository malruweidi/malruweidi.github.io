import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(join(root, path), 'utf8');

test('the reader can follow a five-scene narrative without mistaking memory, project reports or plans for publications', () => {
  const html = read('reading-map.html');
  const fiveScenes = html.match(/<li><a href="(?:\/[^"]+)"><span>0[1-5] \/ /g) || [];
  assert.equal(fiveScenes.length, 5, 'the optional throughline should have five distinct scenes');
  for (const heading of [
    'PERSONAL MEMORY', 'PROJECT RECORD', 'PUBLISHED STUDY',
    'LABORATORY PHOTOGRAPHS', 'ONGOING RESEARCH',
  ]) assert.ok(html.includes(heading), `missing source boundary: ${heading}`);
  for (const destination of [
    '/stories.html#anatomy', '/stories/the-ring-that-never-closed.html',
    '/research/pulmonary-epithelial-injury.html',
    '/stories/failed-zebrafish-histology.html', '/research/inhalable-vesicles.html',
  ]) assert.ok(html.includes(`href="${destination}"`), `missing chapter: ${destination}`);
  assert.match(html, /thematic, not a claim that every project caused the next/);
  assert.match(html, /id="paths"/);
});

test('the stories page preserves its original chapters and makes the long index optional', () => {
  const html = read('stories.html');
  assert.match(html, /<details class="stories-complete-index">/);
  assert.match(html, /All 18 chapter stops/);
  assert.match(html, /Begin where the question changed/);
  assert.match(html, /id="story-pathways"/);
  for (const chapter of ['anatomy','personal-microscope','unfortunate-trials','delivery',
    'zebrafish-histology-materials','urep23-unfinished-route']) {
    assert.ok(html.includes(`id="${chapter}"`), `original chapter removed: ${chapter}`);
  }
  assert.ok((html.match(/<details class="stories-source rx-source-fold">/g) || []).length >= 15);
  assert.match(html, /five-scene route across the entire website/);
  const dictionary = read('assets/stories-i18n.js');
  for (const phrase of ['Begin where the question changed.', 'All 18 chapter stops']) {
    assert.ok(dictionary.includes(`"${phrase}"`), `Arabic navigation string missing: ${phrase}`);
  }
});

test('documentaries, preserved observation and companion evidence remain separate film journeys', () => {
  const html = read('films.html');
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.ok(html.indexOf('id="films-title"') < html.indexOf('id="released"'), 'hero must lead the collection');
  assert.ok(html.indexOf('id="released"') < html.indexOf('id="observations"'));
  assert.ok(html.indexOf('id="observations"') < html.indexOf('id="film-notebooks"'));
  assert.match(html, /<details class="fc-companion-index">/);
  assert.match(html, /<aside class="fc-screening-note"/);
  assert.match(html, /Companion dossier/);
  assert.equal((html.match(/<video controls playsinline/g) || []).length, 5, 'preserve all five principal film players');
  assert.ok(html.indexOf('cairo-microscope.mp4') < html.indexOf('ring-that-never-closed.mp4'));
  assert.ok(html.indexOf('ring-that-never-closed.mp4') < html.indexOf('two-materials-no-section-source-v2.mp4'));
  assert.ok(html.indexOf('two-materials-no-section-source-v2.mp4') < html.indexOf('airway-reopening-evidence-cut.mp4'));
  for (const dest of ['/films/index.html','/publication-cinema.html#film-niosomes',
    '/moving-evidence.html#zebrafish-films','/research/pulmonary-epithelial-injury.html']) {
    assert.ok(html.includes(`href="${dest}"`), `source or edition link missing: ${dest}`);
  }
});
