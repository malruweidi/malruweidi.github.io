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

test('the original films, every publication and essay, and all source material remain intact', () => {
  assert.equal(catalog.items.length, 35);
  assert.equal(new Set(catalog.items.map(x => x.id)).size, 35);
  assert.ok(html.includes('const publications='));
  assert.ok(html.includes('publicationFilmId'));
  assert.ok(html.includes('publication-cinema.html'));
  assert.ok(films.includes('publication-cinema.html'));
  assert.ok(cinema.includes('publication-series.json'));
  assert.ok(fs.existsSync(file('assets/films/what-survives-scenes.json')));
  assert.ok(fs.existsSync(file('assets/films/what-survives-the-experiment.mp4')));
  assert.ok(fs.existsSync(file('assets/films/what-survives-the-experiment.vtt')));
});

test('all 35 have individually written, attributable six-scene editorial scripts', () => {
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

test('all 35 films are discoverable from a source-preserving public route', () => {
  const discovery = JSON.parse(fs.readFileSync(file('assets/discovery-index.json'), 'utf8'));
  const sitemap = fs.readFileSync(file('sitemap.xml'), 'utf8');
  assert.ok(discovery.items.find(x => x.url === '/publication-cinema.html'));
  assert.ok(sitemap.includes('https://malruweidi.github.io/publication-cinema.html'));
  assert.ok(cinema.includes('method:"HEAD"'));
  assert.ok(cinema.includes('English captions'));
});


test('all ten independently published essays and columns retain source links and distinct films', () => {
  const writing = fs.readFileSync(file('writing.html'), 'utf8');
  const essays = catalog.items.filter(x => x.category === 'Public essay' || x.category === 'Drug discovery column');
  assert.equal(essays.length, 10);
  assert.equal(essays.filter(x => x.source_url.startsWith('https://')).length, essays.length);
  for (const entry of essays) {
    assert.ok(writing.includes('/publication-cinema.html#film-' + entry.id), entry.id);
    assert.ok(writing.includes(entry.source_url.replaceAll('&', '&amp;')) || writing.includes(entry.source_url), entry.id);
    assert.equal(entry.production, 'render_requested');
  }
  const page = fs.readFileSync(file('publication-cinema.html'), 'utf8');
  assert.ok(page.includes('x.source_url||x.page'));
  assert.ok(page.includes('Essays &amp; columns'));
  const engine = fs.readFileSync(file('scripts/render-publication-series.py'), 'utf8');
  assert.ok(engine.includes('entry.get("source_url", entry["page"])'));
  assert.ok(engine.includes('--missing-only'));
});


test('documentary checkpointing is restartable and keeps existing source releases', () => {
  const script = fs.readFileSync(file('scripts/render-publication-series.py'), 'utf8');
  const workflow = fs.readFileSync(file('.github/workflows/render-publication-series.yml'), 'utf8');
  assert.ok(script.includes('p.add_argument("--limit",type=int'), 'bounded rendering flag');
  assert.ok(script.includes('p.add_argument("--remaining-count",action="store_true"'), 'remaining count flag');
  assert.ok(script.includes('items = items[:opts.limit]'), 'restrict each batch without removing catalogue entries');
  assert.ok(script.includes('if opts.missing_only or opts.remaining_count:'), 'existing releases checked before rendering');
  assert.ok(workflow.includes('--missing-only --limit 3'), 'three-film checkpoint');
  assert.ok(workflow.includes('git rebase FETCH_HEAD'), 'keep concurrent site edits');
  assert.ok(workflow.includes('gh workflow run render-publication-series.yml --ref main'), 'continue remaining renders');
  assert.ok(workflow.includes('actions: write'), 'workflow may schedule its next batch');
  assert.ok(workflow.includes('actions/cache@v4'), 'reuse narrator model downloads');
});

test('film players require actual MP4 responses and expose a standalone caption link', () => {
  const page = fs.readFileSync(file('publication-cinema.html'), 'utf8');
  assert.ok(page.includes('r.headers.get("content-type")'), 'HTML fallbacks do not masquerade as films');
  assert.ok(page.includes('Read captions ↗'), 'captions separately readable');
  assert.ok(page.includes('target.isConnected'), 'check visual still exists when asynchronous video probe completes');
  assert.ok(page.includes('method:"HEAD"'), 'do not download large MP4 files merely to check availability');
});


test('release evidence manifests take scene descriptions from the source catalogue, not image codecs', () => {
  const script = fs.readFileSync(file('scripts/render-publication-series.py'), 'utf8');
  const workflow = fs.readFileSync(file('.github/workflows/render-publication-series.yml'), 'utf8');
  assert.ok(script.includes('def scene_provenance(entry):'));
  assert.ok(script.includes('"image_classes":classes,'));
  assert.ok(script.includes('classes.append(scene["kind"])'), 'concept art is not called archival just because it is a still');
  assert.ok(script.includes('"scene_provenance":scene_provenance(entry)'));
  assert.ok(script.includes('actual_digest = hashlib.sha256(film.read_bytes()).hexdigest()'), 'metadata repair verifies unchanged original film');
  assert.ok(script.includes('if old.get("sha256") != actual_digest:'), 'refuse to rewrite a mismatched film record');
  assert.ok(workflow.includes('--reconcile-manifests'), 'repair existing releases incrementally');
});


test('all documentary scene credits are inspectable on the film collection', () => {
  const page = fs.readFileSync(file('publication-cinema.html'), 'utf8');
  assert.ok(page.includes('Read the six scenes and visual credits'));
  assert.ok(page.includes('Visual record: '));
  assert.ok(page.includes('Credit: '));
  assert.ok(page.includes('Related source or context'));
  assert.ok(page.includes('rel="noopener noreferrer"'));
  for (const item of catalog.items) {
    for (const scene of item.scenes) {
      assert.ok(scene.link.startsWith('/') || scene.link.startsWith('https://'), item.id + ' invalid visual provenance URL');
      assert.ok(scene.credit.length > 5, item.id + ' missing visual evidence credit');
    }
  }
});


test('completed documentary releases preserve video hashes, timed captions and scene provenance', () => {
  const crypto = require('node:crypto');
  const directory = file('assets/films/series');
  const entries = fs.readdirSync(directory);
  const stems = entries.filter(x => x.endsWith('.mp4')).map(x => x.slice(0, -4));
  const catalogIds = new Set(catalog.items.map(x => x.id));
  assert.ok(stems.length >= 14, 'keep existing completed films');
  for (const stem of stems) {
    assert.ok(catalogIds.has(stem), stem + ': orphan release');
    const videoPath = path.join(directory, stem + '.mp4');
    const captionPath = path.join(directory, stem + '.vtt');
    const manifestPath = path.join(directory, stem + '.json');
    assert.ok(fs.existsSync(captionPath), stem + ': captions missing');
    assert.ok(fs.existsSync(manifestPath), stem + ': provenance manifest missing');
    const buffer = fs.readFileSync(videoPath);
    assert.ok(buffer.length > 100000, stem + ': incomplete MP4');
    assert.equal(buffer.subarray(4, 8).toString(), 'ftyp', stem + ': MP4 container');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.equal(manifest.id, stem);
    assert.equal(manifest.sha256, crypto.createHash('sha256').update(buffer).digest('hex'), stem + ': altered film');
    assert.ok(Math.abs(manifest.seconds - 84) < 0.3, stem + ': duration');
    const record = catalog.items.find(x => x.id === stem);
    assert.equal(manifest.image_classes?.length, record.scenes.length, stem + ': historical classification count');
    assert.equal(manifest.scene_provenance?.length, record.scenes.length, stem + ': historical source record');
    // Released V1 movies are immutable. A new V2 visual source catalogue must
    // NOT rewrite their historical manifests to match newly curated artwork.
    if (!record.source_visual_revision) {
      assert.deepEqual(manifest.image_classes, record.scenes.map(x => x.kind), stem + ': scene classifications');
    }
    for (let i = 0; i < record.scenes.length; i++) {
      assert.ok(manifest.scene_provenance[i].image, stem + ': original image provenance');
      assert.ok(manifest.scene_provenance[i].source, stem + ': original source provenance');
      assert.ok(manifest.image_classes[i], stem + ': original visual classification');
      if (!record.source_visual_revision) {
        assert.equal(manifest.scene_provenance[i].image, record.scenes[i].image, stem + ': image provenance');
        assert.equal(manifest.scene_provenance[i].source, record.scenes[i].link, stem + ': source provenance');
      }
    }
    const subtitles = fs.readFileSync(captionPath, 'utf8');
    assert.match(subtitles, /^WEBVTT\s*\n/, stem + ': subtitle header');
    const stamps = [...subtitles.matchAll(/(\d\d):(\d\d):(\d\d)\.(\d{3}) --> (\d\d):(\d\d):(\d\d)\.(\d{3})/g)]
      .map(m => {
        const n = m.slice(1).map(Number);
        return [n[0]*3600 + n[1]*60 + n[2] + n[3]/1000,
                n[4]*3600 + n[5]*60 + n[6] + n[7]/1000];
      });
    assert.equal(stamps.length, record.scenes.length * 2, stem + ': subtitle coverage');
    for (let i = 0; i < stamps.length; i++) {
      assert.ok(stamps[i][0] < stamps[i][1], stem + ': negative subtitle interval');
      assert.ok(stamps[i][1] <= 84.25, stem + ': subtitles exceed film');
      if (i > 0) assert.ok(stamps[i][0] >= stamps[i-1][1] - .05, stem + ': captions overlap');
    }
  }
  for (const suffix of ['.vtt', '.json']) {
    for (const name of entries.filter(x => x.endsWith(suffix))) {
      assert.ok(stems.includes(name.slice(0, -suffix.length)), name + ': orphan metadata');
    }
  }
});
