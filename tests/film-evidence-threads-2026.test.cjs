/* Preservation-first acceptance tests for the October 21 evidence-navigation pass.
 * These are content and source-contract tests; visual and media playback QA remain separate.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const filmRecords = [
  ['films/airway-reopening-evidence.html', '/research/pulmonary-epithelial-injury.html', '/assets/films/airway-reopening-evidence-cut.mp4'],
  ['films/cairo-microscope.html', '/stories/cairo-microscope.html', '/assets/films/cairo-microscope.mp4'],
  ['films/making-medicines-keep.html', '/publication-cinema.html#film-making-medicines-keep', '/assets/films/series-v8-primary/making-medicines-keep.mp4'],
  ['films/the-laboratory-we-carried-with-us.html', '/chem-squad.html', '/assets/films/the-laboratory-we-carried-with-us.mp4'],
  ['films/the-ring-that-never-closed.html', '/stories/the-ring-that-never-closed.html', '/assets/films/ring-that-never-closed.mp4'],
  ['films/two-materials-no-section.html', '/stories/failed-zebrafish-histology.html', '/assets/films/two-materials-no-section-source-v2.mp4'],
  ['films/what-a-bubble-can-do.html', '/research/pulmonary-epithelial-injury.html', '/assets/films/what-a-bubble-can-do-evidence-v2.mp4']
];

test('Every released standalone film preserves original player and adds an accessible evidence trail', () => {
  for (const [file, evidence, originalMp4] of filmRecords) {
    const html = read(file);
    assert.match(html, /<main\b[^>]*id="main"/, file);
    assert.equal((html.match(/data-evidence-thread="2026-10-21"/g) || []).length, 1, file);
    assert.match(html, /class="rx-evidence-thread"/, file);
    assert.match(html, /aria-labelledby="rx-evidence-thread-title"/, file);
    assert.ok(html.includes('href="' + evidence + '"'), file + ': link to original record');
    assert.ok(html.includes('src="' + originalMp4 + '"'), file + ': original MP4 preserved');
    assert.match(html, /<track\b[^>]*kind="captions"/, file + ': original captions preserved');
    assert.match(html, /\/assets\/evidence-threads-2026\.css/, file + ': additive shared CSS');
    assert.ok(html.indexOf('data-evidence-thread="2026-10-21"') > html.indexOf('<video'), file + ': evidence reading follows player');
    assert.equal((html.match(/<h1\b/g) || []).length, 1, file + ': one top heading');
  }
});

test('The histology film presents its H1 before the screening section without losing the original film', () => {
  const html = read('films/two-materials-no-section.html');
  assert.ok(html.indexOf('<h1') < html.indexOf('id="complete-film"'), 'story introduction comes first');
  assert.match(html, /src="\/assets\/films\/two-materials-no-section-source-v2\.vtt"/);
  assert.match(html, /The failure is documented\. Its exact cause was not conclusively established\./);
});

test('The scientific research index explains evidence status with existing, specific destinations', () => {
  const html = read('research.html');
  assert.match(html, /class="rs-status-key"/);
  for (const label of ['Published research', 'Ongoing investigation', 'Documented unsuccessful work', 'Prospective research']) {
    assert.ok(html.includes(label), label);
  }
  for (const route of ['/research/pulmonary-epithelial-injury.html', '/research/inhalable-vesicles.html',
                       '/stories/the-ring-that-never-closed.html', '/doctoral-concepts.html']) {
    assert.ok(html.includes('href="' + route + '"'), route);
  }
  assert.match(html, /\/assets\/evidence-threads-2026\.css/);
  assert.match(html, /<h1>What the experiments actually asked\.<\/h1>/);
});

test('Shared evidence styling respects existing design and keyboard/reduced-motion needs', () => {
  const css = read('assets/evidence-threads-2026.css');
  assert.match(css, /rx-evidence-thread/);
  assert.match(css, /rs-status-key/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
  assert.doesNotMatch(css, /@import|font-family:\s*["'](?:Inter|Poppins)/i);
});

test('No grades, false publication status or synthetic source media added in the evidence pass', () => {
  const pages = [...filmRecords.map(x => x[0]), 'research.html'];
  for (const file of pages) {
    const html = read(file);
    assert.doesNotMatch(html, /\bGPA\b|grade[- ]point average/i, file);
    assert.doesNotMatch(html, /<video[^>]*autoplay/i, file);
  }
  const record = read('molecular-therapeutics.html');
  assert.doesNotMatch(record, /\(ADCs\)\s+\./, 'punctuation-only editorial correction');
});

test('The public academic profile has one main landmark after its introductory header', () => {
  const html = read('cv.html');
  assert.equal((html.match(/<main\b/g) || []).length, 1, 'exactly one main');
  assert.match(html, /<main id="main">/);
  assert.ok(html.indexOf('</header>') < html.indexOf('<main id="main">'));
  assert.ok(html.indexOf('<main id="main">') < html.indexOf('<h2 class="label">Research direction'));
  assert.ok(html.indexOf('</main>') < html.indexOf('<footer>'));
  assert.match(html, /This public version intentionally omits private telephone numbers/);
  assert.match(html, /<h2 class="label">Scientific engagement<\/h2>/);
});
