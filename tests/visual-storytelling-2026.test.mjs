import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const home = read('index.html');
const mask = read('assets/personal-archive/toy-silhouette-mask.svg');
const art = read('assets/ruwaidix-field-notes-2026.css');
const behavior = read('assets/ruwaidix-field-notes-2026.js');

test('the original childhood photo is displayed with a detailed, reversible silhouette mask', () => {
  assert.match(mask, /viewBox="0 0 1170 1138"/);
  assert.match(mask, /<path fill="white" d="M/);
  assert.match(art, /mask-image:url\('\/assets\/personal-archive\/toy-silhouette-mask\.svg'\)/);
  assert.match(art, /background:url\('\/assets\/personal-archive\/toy\.webp'\)/);
  assert.match(home, /Before the lab coat/);
  assert.match(home, /class="drawer-print" style="--detail:50% 76%"/);
});

test('new specimen workbench is keyboard accessible and has provenance links', () => {
  assert.match(home, /id="research-workbench"/);
  assert.match(home, /class="rx-observation-stage" tabindex="0"/);
  assert.match(home, /aria-label="Image magnification controls"/);
  assert.match(home, /\/figures\.html#zebrafish/);
  assert.match(home, /\/research\/inhalable-vesicles\.html/);
  assert.match(home, /SCHEMATIC \/ NOT TO SCALE/);
  assert.match(behavior, /stage\.addEventListener\("keydown"/);
  assert.match(behavior, /toggle\.addEventListener\("click"/);
  assert.match(art, /prefers-reduced-motion:reduce/);
});

test('previous film, archive drawer, atlas, and site map remain in homepage', () => {
  for (const token of [
    '/assets/films/anatomy-of-a-question-2026-v2.mp4',
    'class="family-drawer"',
    'class="rx-hero-backstory"',
    'id="rx26-portal"',
    '/assets/atlas-of-questions-2026.js'
  ]) assert.ok(home.includes(token), token);
});

test('narrative refinements are additive across Stories, Archive and Research', () => {
  for (const page of ['stories.html','archive.html','research.html']) {
    assert.match(read(page), /ruwaidix-story-materiality-2026\.css/);
  }
  const sourceStyles = read('assets/ruwaidix-story-materiality-2026.css');
  assert.match(sourceStyles, /rx-archive-image-link/);
  assert.match(sourceStyles, /rx-story-route-image/);
  assert.match(sourceStyles, /research-section/);
  assert.match(sourceStyles, /prefers-reduced-motion:reduce/);
});
