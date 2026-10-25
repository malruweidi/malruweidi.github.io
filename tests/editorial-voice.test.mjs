import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(root, path), 'utf8');

test('publication stories have distinct scientific premises, not duplicated film-maker placeholders', () => {
  const cinema = read('publication-cinema.html');
  assert.doesNotMatch(cinema, /An evidence-driven film adaptation of the published column/);
  for (const phrase of [
    'A transcription factor rarely offers a permanent pocket.',
    'A nanomolar assay result says little about unbound drug exposure',
    'Every protein depends on charged and modified tRNAs.',
    'An induced-proximity drug recruits two proteins',
    'An antibody delivers the payload only as far as the delivery system allows.'
  ]) assert.ok(cinema.includes(phrase), 'missing distinctive scientific premise: ' + phrase);
});

test('personal photo captions stay factual, without curator boilerplate', () => {
  const photos = read('assets/owner-photo-placements-2026-10-16.js');
  assert.match(photos, /Ahmed catches some sleep/);
  assert.doesNotMatch(photos, /Not every photograph in a chemist/);
  assert.doesNotMatch(photos, /Image supplied and identified by the archive owner/);
  const research = read('assets/research-media-2026.js');
  assert.doesNotMatch(research, /documentary views, not proof of experiment results/);
});

test('Ramadan first-person narrative matches its available archive and Arabic source', () => {
  const stories = read('stories.html');
  const archive = read('assets/owner-archive-2026-10-13.js');
  const dictionary = read('assets/stories-i18n.js');
  assert.doesNotMatch(stories, /is not yet hosted here/);
  assert.match(stories, /photograph of the microscopy room now appears in the accompanying archive/);
  assert.match(archive, /ramadan-microscopy-room\.webp/);
  assert.match(dictionary, /أصبحت صورة غرفة المجهر معروضة في الأرشيف المرافق/);
});

test('documentary scientific cautions remain discoverable without duplicating owner notes in every scene', () => {
  const film = read('films/two-materials-no-section.html');
  assert.doesNotMatch(film, /Source designation: archival photograph; original owner-supplied photograph/);
  assert.ok(film.includes('src="/assets/films/two-materials-no-section-source-v2.mp4"'), "released source-corrected video must remain playable");
  assert.ok(film.includes('href="/stories/failed-zebrafish-histology.html"'), "full experimental account remains linked outside screening page");
  assert.match(film, /unsuccessful attempt at zebrafish histology|not with interpretable tissue sections|did not form a stable sectioning block/i);
  const stories = read('stories.html');
  assert.ok((stories.match(/<details class="stories-source rx-source-fold">/g) || []).length >= 15,
    'source documentation disclosures must remain accessible');
});

test('avoid mirrored defensive biography across homepage and complete archive', () => {
  const home = read('index.html');
  const complete = read('full-record.html');
  const horizon = read('research-horizon.html');
  for (const text of [home, complete, horizon]) {
    assert.doesNotMatch(text, /The aim was never to collect disciplines/);
    assert.doesNotMatch(text, /These are not just subject areas/);
    assert.doesNotMatch(text, /not another line on our CVs/);
  }
  assert.match(home, /I have worked on molecular sensors, polymers, vascular imaging and pulmonary drug delivery/);
  assert.match(complete, /My work moved through chemistry, materials, imaging and pharmaceutics/);
  assert.match(horizon, /what a material is at preparation is not necessarily what a biological system encounters/);
});

test('illness and historical photographs avoid invented editorial defenses', () => {
  const illness = read('illness-and-evidence.html');
  const photos = read('assets/2017-photo-completion.js');
  assert.doesNotMatch(illness, /It does not turn missed examinations into achievements/);
  assert.doesNotMatch(photos, /The eggs are visible through the incubator window/);
  assert.match(illness, /I fell asleep between university examinations in June 2017/);
  assert.match(photos, /The incubator we used for chick-embryo work/);
});
