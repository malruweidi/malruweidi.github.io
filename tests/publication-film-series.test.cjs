'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'assets/films/publication-series.json'), 'utf8'));
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const cinema = fs.readFileSync(path.join(root, 'publication-cinema.html'), 'utf8');
const films = fs.readFileSync(path.join(root, 'films.html'), 'utf8');
const file = src => path.resolve(root, src.replace(/^\//, ''));

test('the original films, every publication, and all source material remain intact', () => {
  assert.equal(catalog.items.length, 25);
  assert.equal(new Set(catalog.items.map(x => x.id)).size, 25);
  assert.ok(html.includes('const publications='));
  assert.ok(html.includes('publicationFilmId'));
  assert.ok(html.includes('publication-cinema.html'));
  assert.ok(films.includes('publication-cinema.html'));
  assert.ok(cinema.includes('publication-series.json'));
  assert.ok(fs.existsSync(file('assets/films/what-survives-scenes.json')));
  assert.ok(fs.existsSync(file('assets/films/what-survives-the-experiment.mp4')));
  assert.ok(fs.existsSync(file('assets/films/what-survives-the-experiment.vtt')));
});

test('all 25 have individually written, attributable six-scene editorial scripts', () => {
  for (const item of catalog.items) {
    assert.equal(item.production, 'render_requested', item.id);
    assert.equal(item.duration_seconds, 84, item.id);
    assert.equal(item.scenes.length, 6, item.id);
    assert.ok(fs.existsSync(file(item.poster)), item.poster);
    assert.ok(item.publication_title && item.film_title && item.premise, item.id);
    assert.ok(item.page.startsWith('/'), item.id);
    if (item.doi) assert.match(item.doi, /^10\.\d{4,9}\//, item.id);
    const uniqueShots = new Set();
    for (const [position, scene] of item.scenes.entries()) {
      assert.equal(scene.id, String(position + 1).padStart(2, '0'));
      assert.ok(scene.title.length > 6, item.id);
      assert.ok(scene.narration.length >= 60, item.id);
      assert.ok(scene.kind && scene.credit && scene.link, item.id);
      assert.ok(fs.existsSync(file(scene.image)), item.id + ': ' + scene.image);
      if (scene.video) assert.match(scene.video, /^https:\/\//, item.id);
      uniqueShots.add(scene.title);
    }
    assert.equal(uniqueShots.size, 6, item.id);
  }
});

test('all 20 citations in the unchanged homepage bibliography have matching film entries', () => {
  const source = html.match(/const publications=(\[[\s\S]*?\]);const projects=/);
  assert.ok(source, 'preserved original inline bibliography');
  const bib = JSON.parse(source[1]);
  assert.equal(bib.length, 20);
  for (const p of bib) {
    assert.ok(catalog.items.some(x => x.doi && x.doi === p.doi || x.publication_title === p.title), p.title);
  }
});

test('concept imagery explicitly declines false claims of historical or scientific provenance', () => {
  for (const item of catalog.items) {
    for (const scene of item.scenes) {
      if (scene.image.startsWith('assets/films/art/')) {
        assert.match(scene.kind, /conceptual|illustrat/i, item.id);
      }
    }
  }
  const conceptFiles = ['medieval-pharmacy', 'cubosome-topology', 'edible-printing', 'bioceramic-lattice', 'microfluidic-sensing'];
  for (const basename of conceptFiles) {
    const svg = fs.readFileSync(file('assets/films/art/' + basename + '.svg'), 'utf8');
    assert.ok(svg.includes('NOT PRIMARY RESEARCH OR ARCHIVAL FOOTAGE'), basename);
  }
});

test('all 25 films are discoverable from a source-preserving public route', () => {
  const discovery = JSON.parse(fs.readFileSync(file('assets/discovery-index.json'), 'utf8'));
  const sitemap = fs.readFileSync(file('sitemap.xml'), 'utf8');
  assert.ok(discovery.items.find(x => x.url === '/publication-cinema.html'));
  assert.ok(sitemap.includes('https://malruweidi.github.io/publication-cinema.html'));
  assert.ok(cinema.includes('method:"HEAD"'));
  assert.ok(cinema.includes('English captions'));
});
