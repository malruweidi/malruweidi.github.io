import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(join(root, file), 'utf8');

test('Publication Cinema preserves its 35 source-specific static players and captions', () => {
  const page = read('publication-cinema.html');
  const staticHtml = page.split('<script>')[0];
  assert.equal((staticHtml.match(/<article class="piece" id="film-/g) || []).length, 35);
  const videos = [...staticHtml.matchAll(/<source src="(\/assets\/films\/[^" ]+\.mp4)"/g)].map(m => m[1]);
  const captions = [...staticHtml.matchAll(/<track kind="captions" src="(\/assets\/films\/[^" ]+\.vtt)"/g)].map(m => m[1]);
  assert.equal(videos.length, 35);
  assert.equal(captions.length, 35);
  for (const file of [...videos, ...captions]) assert.ok(existsSync(join(root, file)), `missing released source: ${file}`);
  assert.match(page, /originalPlayers\.length===35/);
  assert.match(page, /All 35 films and source links remain playable without JavaScript/);
  assert.match(page, /<aside class="cinema-source-guide"/);
  assert.match(page, /When the intended ring did not close/);
  assert.match(page, /not an achieved heterocyclic product/);
  assert.match(page, /Inspect the preserved manuscript/);
});

test('filters operate on existing cinema nodes; they neither fetch an old master nor rewrite markup', async () => {
  const page = read('publication-cinema.html');
  const script = page.slice(page.lastIndexOf('<script>') + 8, page.lastIndexOf('</script>'));
  const entry = (category, name) => ({
    hidden: false,
    querySelector(selector) {
      if (selector.startsWith('video source')) return {};
      if (selector === 'h3') return { textContent: name };
      if (selector === '.meta') return { textContent: `2026 · ${category}` };
      if (selector === '.piece-copy') return { textContent: `${category} ${name}` };
      if (selector === 'video') return { paused: true, pause() { throw Error('a paused film was restarted'); } };
      return null;
    }
  });
  const entries = [entry('Original research', 'Pulmonary injury'), entry('Public essay', 'Scientific credit'),
    ...Array.from({ length: 33 }, (_, i) => entry('Book chapters', `Chapter ${i}`))];
  const rootNode = { querySelectorAll() { return entries; }, after(value) { this.empty = value; } };
  Object.defineProperty(rootNode, 'innerHTML', { set() { throw Error('Static cinema was replaced'); } });
  const search = { value: '', addEventListener(name, fn) { this[name] = fn; } };
  const count = { textContent: '' };
  const filters = ['all', 'Original research', 'Book chapters', 'Patent review', 'Public essay', 'Research project'].map(filter => ({
    dataset: { filter },
    addEventListener(name, fn) { this[name] = fn; },
    setAttribute(name, value) { this[name] = value; }
  }));
  const document = {
    getElementById(id) { return { collection: rootNode, q: search, count }[id]; },
    createElement() { return { hidden: false }; },
    querySelectorAll() { return filters; }
  };
  await vm.runInNewContext(script, {
    document,
    fetch() { throw Error('A legacy film register must not override checked-in sources'); },
    location: { hash: '' }
  });
  assert.equal(count.textContent, '35 films');
  assert.ok(entries.every(e => !e.hidden));
  search.value = 'pulmonary';
  search.input();
  assert.equal(count.textContent, '1 of 35 films');
  assert.equal(entries.filter(e => !e.hidden).length, 1);
  search.value = '';
  filters.find(b => b.dataset.filter === 'Public essay').click();
  assert.equal(count.textContent, '1 of 35 films');
  assert.equal(entries.filter(e => !e.hidden).length, 1);
  assert.equal(filters.find(b => b.dataset.filter === 'Public essay')['aria-pressed'], 'true');
});

test('the research pages separate documented work, current experiments and prospective questions', () => {
  const agenda = read('molecular-therapeutics.html');
  const essay = read('research-horizon.html');
  const primary = agenda.match(/<div class="actionlinks">([\s\S]*?)<\/div>/)?.[1] || '';
  assert.equal((primary.match(/<a /g) || []).length, 2);
  assert.match(primary, /#research-entry-points/);
  assert.match(primary, /#selected-experiments/);
  assert.match(agenda, /<details class="research-hero-routes">/);
  assert.match(agenda, /<details class="research-deepdive discovery-loop" id="discovery-to-synthesis">/);
  assert.match(agenda, /The selection rule:/);
  for (const claim of ['74%', '184%', '10.1152/japplphysiol.00574.2020', '10.3390/polym13213717', 'id="present-work"']) {
    assert.ok(agenda.includes(claim), `original research evidence lost: ${claim}`);
  }
  assert.match(essay, /<details class="rh-more-routes">/);
  assert.match(essay, /documented research, present MSc work and prospective doctoral ideas remain distinct/);
  assert.match(essay, /id="record"/);
});
