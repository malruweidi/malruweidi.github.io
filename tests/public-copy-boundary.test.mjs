import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(join(root, path), 'utf8');

test('reader-facing archive captions never show verification placeholders', () => {
  const archive = read('archive.html');
  assert.doesNotMatch(archive, /DATE (?:NOT )?VERIFIED|ARCHIVE FILENAME DATED/i);
  assert.match(archive, /ARCHIVE 04 \/ EARLY YEARS/);
  assert.doesNotMatch(read('assets/archive-moments-2026-10-12.js'), /"dateLabel":"Date unverified"|p\.dateLabel\|\|"Date unverified"/);
  assert.doesNotMatch(read('assets/archival-2019-2020.js'), /date:"Date not verified"/);
  assert.doesNotMatch(read('assets/firsthand-photo-stories-2026.js'), /date unverified/i);
});

test('embedded documentaries link to real film pages without promising absent materials', () => {
  for (const [file, destination] of [
    ['stories/failed-zebrafish-histology.html', '/films/two-materials-no-section.html'],
    ['chem-squad.html', '/films/the-laboratory-we-carried-with-us.html'],
    ['engagement.html', '/films/the-laboratory-we-carried-with-us.html'],
  ]) {
    const html = read(file);
    assert.ok(html.includes('href="' + destination + '"'), file + ': film route missing');
    assert.doesNotMatch(html, /Film transcript, all eight original source plates and provenance|complete narration is available in the linked film transcript|Evidence Cut<\/small>/i, file);
    assert.match(html, /Watch the documentary ↗/);
  }
});

test('Ramadan story keeps a complete equivalent chapter on the standalone route', () => {
  const collection = read('stories.html');
  const standalone = read('stories/ramadan-microscope.html');
  const start = collection.indexOf('<section class="stories-chapter stories-chapter-tinted" id="ramadan-atvb"');
  assert.notEqual(start, -1);
  const end = collection.indexOf('</section>', start) + '</section>'.length;
  assert.ok(standalone.includes(collection.slice(start, end)), 'standalone chapter drifted');
  assert.doesNotMatch(standalone, /year unverified|not verified as a frame/i);
});

test('Arabic story dictionary includes new reader-facing corrections', () => {
  const dictionary = read('assets/stories-i18n.js');
  for (const phrase of [
    'I organized my first school chemistry exhibition at Doha Independent School in 2009.',
    'The photograph comes from my school archive.',
    'Zebrafish vascular microscopy from the research archive',
  ]) assert.ok(dictionary.includes(phrase), phrase);
});

test('research attribution identifies different individual roles instead of a broad disclaimer', () => {
  const profile = read('molecular-therapeutics.html');
  assert.match(profile, /My responsibilities differed across projects/);
  assert.match(profile, /I performed experiments in collaborative vascular work/);
  assert.doesNotMatch(profile, /rather than independent certification of author contributions/);
  assert.match(read('methods-evidence.html'), /not authorship, data analysis for, or any other contribution to a resulting paper/);
});

test('Stories captions separate reader context from production notes', () => {
  const stories = read('stories.html');
  const trials = read('stories/unfortunate-copolymer-trials.html');
  const ring = read('stories/the-ring-that-never-closed.html');
  assert.doesNotMatch(stories, /Photograph date unverified|Qatar University photo-library label:|compound identity unverified/i);
  assert.doesNotMatch(trials, /Qatar University photo-library label:/);
  const revisedCaption = 'A laboratory sample photographed during the copolymer trials at Qatar University';
  assert.ok(stories.includes(revisedCaption));
  assert.ok(trials.includes(revisedCaption));
  assert.match(ring, /Watch The Ring That Never Closed \(03:00\) ↗/);
  assert.doesNotMatch(ring, /full scene transcript/i);
  assert.ok(stories.includes('src="/archive/archive-7885.jpg"'));
  const translations = read('assets/stories-i18n.js');
  assert.ok(translations.includes(revisedCaption));
  assert.ok(translations.includes('With Dr. Elsheikh Abdelrahim, one of the physicians'));
});

test('science-community and leadership pages avoid internal production notes', () => {
  const engagement = read('engagement.html');
  const leadership = read('leadership.html');
  assert.doesNotMatch(engagement, /any stand-alone extraction should retain|These four photographs are now captioned|Dates and places are reproduced from the photo-library display|Archive filename:/i);
  assert.doesNotMatch(leadership, /unverified camera capture dates/i);
  assert.match(engagement, /the outcome of a specific experiment/);
  assert.match(leadership, /Photographs from the 2013 community-health outreach/);
  const translations = read('assets/i18n-dictionary.js');
  assert.ok(translations.includes('An original recording from the cardiovascular microscopy archive.'));
  assert.ok(read('assets/leadership-i18n-2026.js').includes('associated youth initiatives appear below.'));
});
