import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = name => readFileSync(join(root, name), 'utf8');
const visible = name => read(name)
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<!--[\s\S]*?-->/g, '');

test('primary entry points tell scientific stories rather than reveal editorial workflow', () => {
  for (const page of ['index.html','stories.html','chem-squad.html','films.html','reading-map.html','moving-evidence.html','behind-the-record.html','publication-cinema.html']) {
    const html = visible(page);
    assert.doesNotMatch(html, /original (?:capture )?date unverified|DATE UNVERIFIED|date not verified|owner-supplied original|source-aware film library|archival originals of already featured streams|not counted as extra films/i, page);
    assert.equal((html.match(/<h1\b/g)||[]).length, 1, page);
  }
  assert.match(read('index.html'), /class="rx26-portal-grid"/);
  assert.equal((read('index.html').match(/class="rx26-portal-card"/g)||[]).length, 9);
  assert.match(read('films.html'), /The film begins where/);
  assert.match(read('chem-squad.html'), /Ten years of talking chemistry/);
  assert.match(read('publication-cinema.html'), /Choose the question\. Inspect the source/);
});

test('research evidence and contribution limits survive public copy-editing', () => {
  assert.match(read('methods-evidence.html'), /Personally conducted or developed/);
  assert.match(read('methods-evidence.html'), /Part of a coauthored paper/);
  assert.match(read('research.html'), /Flory.Huggins/);
  assert.match(read('research.html'), /TAVI clinical registry research project/);
  assert.match(read('chem-squad.html'), /Mohamed G\. Nassr/);
  assert.match(read('chem-squad.html'), /Abdelgalil Khalaf Ahmed/);
  assert.match(read('chem-squad.html'), /Author-name variants in the original records/);
  assert.match(read('stories.html'), /did not establish PRMT5 target engagement or therapeutic efficacy/);
  assert.ok((read('stories.html').match(/<details class="stories-source rx-source-fold">/g)||[]).length >= 15);
});

test('bilingual sources and original story destinations remain intact', () => {
  const story = read('stories.html');
  for (const [page,id] of [
    ['stories/cairo-microscope.html','personal-microscope'],
    ['stories/failed-zebrafish-histology.html','zebrafish-histology-materials'],
    ['stories/ramadan-microscope.html','ramadan-atvb'],
    ['stories/unfortunate-copolymer-trials.html','unfortunate-trials']
  ]) {
    const begin = new RegExp('<section class="stories-chapter(?: stories-chapter-tinted)?" id="'+id+'"').exec(story);
    assert.ok(begin,page+' missing original story');
    const end = story.indexOf('</section>',begin.index)+'</section>'.length;
    assert.ok(read(page).includes(story.slice(begin.index,end)),page+' chapter mismatch');
  }
  assert.match(read('assets/stories-i18n.js'), /مصادر ذات صلة/);
  assert.match(read('assets/i18n-dictionary.js'), /عشرة أعوام من الحديث في الكيمياء/);
  assert.match(read('films.html'), /two-materials-no-section-source-v2\.mp4/);
  assert.match(read('moving-evidence.html'), /khaled-jama-thesis-reaction\.mp4/);
});
