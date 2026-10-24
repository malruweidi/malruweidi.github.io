/* Source-based inventory acceptance tests. Visual verification is a separate release gate. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { buildInventory } = require('../scripts/build-media-placement-inventory.cjs');
const root = path.join(__dirname, '..');

test('inventory locates every checked-in HTML route and preserves deterministic output', () => {
  const one = buildInventory(root);
  const two = buildInventory(root);
  assert.ok(one.counts.htmlFiles >= 60, 'all public, preview and archival HTML pages included');
  assert.deepEqual(one, two);
  assert.ok(one.counts.mediaReferences > 100);
  assert.ok(one.pages['index.html']);
  assert.ok(one.pages['stories.html']);
  assert.ok(one.pages['publication-cinema.html']);
  assert.ok(one.pages['figures.html']);
  assert.ok(one.pages['techniques.html']);
  assert.ok(one.pages['full-record.html']);
});

test('inventory connects original images and movie editions to their exact owning pages', () => {
  const inventory = buildInventory(root);
  const examples = [
    ['stories.html', '/assets/oct12-owner-photos/microscopy-vacation-morning-2017.webp', 'img'],
    ['stories.html', '/assets/2026-10-13-new-photos/zebrafish-paraffin-microtomy-failure.webp', 'img'],
    ['films/what-a-bubble-can-do.html', '/assets/films/what-a-bubble-can-do-evidence-v2.mp4', 'source'],
    ['publication-cinema.html', '/assets/films/series-v23-sourcefirst/airway-reopening.vtt', 'track']
  ];
  for (const [page, value, tag] of examples) {
    const record = inventory.pages[page].find(x => x.url === value && x.tag === tag);
    assert.ok(record, page + ': ' + value);
    assert.ok(Number.isInteger(record.line) && record.line >= 1);
    assert.equal(record.availability, 'present');
  }
});

test('inventory is read-only and distinguishes embedded and remote images without guessing provenance', () => {
  const i = buildInventory(root);
  const homePortrait = i.pages['index.html'].find(x => x.tag === 'img' && x.url.startsWith('https://cdn.creativeclaw.co/'));
  assert.equal(homePortrait.availability, 'external-unverified');
  const inline = i.pages['illness-and-evidence.html'].find(x => x.tag === 'img' && x.url === '[inline data URI]');
  assert.ok(inline);
  assert.equal(inline.availability, 'embedded-unverified');
  assert.ok(i.scope.includes('HTML source'));
  assert.ok(i.scope.includes('not a photographic provenance'));
  assert.ok(i.counts.htmlFiles >= 60);
});

test('minified HTML positions retain precise character offsets and stable document order', () => {
  const i=buildInventory(root);
  const records=i.pages['cv.html'];
  assert.ok(records.length > 0);
  for(let j=0;j<records.length;j++){
    assert.ok(Number.isInteger(records[j].characterOffset) && records[j].characterOffset>=0);
    assert.equal(records[j].ordinalOnPage,j+1);
    if(j>0)assert.ok(records[j].characterOffset>=records[j-1].characterOffset);
  }
});
