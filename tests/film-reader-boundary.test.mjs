import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const pages = [
  'publication-cinema.html', 'films.html', 'film.html',
  'films/what-a-bubble-can-do.html',
  'films/two-materials-no-section.html',
  'films/the-laboratory-we-carried-with-us.html',
  'films/making-medicines-keep.html',
  'films/cairo-microscope.html',
  'films/airway-reopening-evidence.html',
  'films/the-ring-that-never-closed.html',
];
const raw = (path) => readFileSync(resolve(root, path), 'utf8');
const visible = (s) => s.replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<style\b[\s\S]*?<\/style>/gi, '');

test('public film routes retain playable films', () => {
  for (const path of pages) {
    assert.match(visible(raw(path)), /<video\b/i, path);
    assert.match(visible(raw(path)), /\.mp4/i, path);
  }
});

test('film pages do not display internal filmmaker annotations', () => {
  const forbidden = [
    /id=["'](?:transcript|source-ledger|film-transcript|scene-plan|arabic-transcript|original-image-files|documentary-photo-sources)["']/i,
    /View visual-source manifest/i,
    /Complete shot-by-shot provenance/i,
    /Original storyboard notice/i,
    /How the film is made/i,
    /Director.s notes/i,
    /Date unverified/i,
    /film rendering prepared/i,
    /Read the six scenes and visual credits/i,
  ];
  for (const path of pages) {
    const html=visible(raw(path));
    for (const rule of forbidden) assert.doesNotMatch(html, rule, path+' / '+rule);
  }
});

test('captions remain available in screening players', () => {
  for (const path of pages) {
    if (path === 'films.html' || path === 'publication-cinema.html') continue; 
    assert.match(visible(raw(path)), /<track\b[^>]*kind=["']captions["']/i, path);
  }
});
