import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = name => readFileSync(join(root, name), 'utf8');

test('the documentary restores its complete narration and inspectable primary-source boundaries', () => {
  const film = read('film.html');
  const sourcebook = read('film-sourcebook.html');
  const scenes = JSON.parse(read('assets/films/what-survives-scenes.json')).scenes;
  assert.equal(scenes.length, 12);
  assert.match(film, /film-sourcebook\.html#portrait/);
  assert.doesNotMatch(film, /id="transcript"/);
  assert.match(sourcebook, /id="narration"/);
  assert.match(sourcebook, /Read the evidence behind the films/);
  assert.match(sourcebook, /<details class="source-note">/);
  for (const scene of scenes) {
    assert.ok(sourcebook.includes(scene.narration), `missing exact scene narration ${scene.id}`);
    assert.ok(sourcebook.includes(scene.credit), `missing original visual credit ${scene.id}`);
  }
  const linked = [...sourcebook.matchAll(/<a href="(\/[^"#]+)(?:#[^"]+)?"/g)].map(match => match[1]);
  for (const url of linked) {
    if (url.endsWith('.html') || url.endsWith('.json') || url.endsWith('.vtt')) {
      assert.ok(existsSync(join(root, url)), `missing primary source or caption: ${url}`);
    }
  }
  assert.match(sourcebook, /not a claim of demonstrated clinical delivery/);
  assert.match(sourcebook, /not a historical manuscript facsimile/);
  assert.match(sourcebook, /not a recording of the extracts experiment/);
});

test('the optional sourcebook opens six credited scenes for each film without changing the cinema players', async () => {
  const page = read('film-sourcebook.html');
  const script = page.slice(page.lastIndexOf('<script>') + 8, page.lastIndexOf('</script>'));
  const catalogue = JSON.parse(read('assets/films/publication-series.json'));
  class Element {
    constructor(tag) { this.tag = tag; this.children = []; this.dataset = {}; this.listeners = {}; this.open = false; }
    append(...nodes) { this.children.push(...nodes); }
    replaceChildren(...nodes) { this.children = [...nodes]; }
    addEventListener(name, callback) { this.listeners[name] = callback; }
    get lastChild() { return this.children.at(-1); }
  }
  const register = new Element('div');
  const search = { value: '', addEventListener(name, callback) { this[name] = callback; } };
  const count = { textContent: '' };
  const document = {
    getElementById: name => ({ 'film-register': register, 'film-search': search, 'film-count': count })[name],
    createElement: tag => new Element(tag),
  };
  let requests = 0;
  vm.runInNewContext(script, {
    document,
    location: { hash: '' },
    fetch: async url => {
      requests++;
      assert.equal(url, '/assets/films/publication-series.json');
      return { ok: true, json: async () => catalogue };
    }
  });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(count.textContent, '35 of 35 film source records');
  assert.equal(requests, 1);
  assert.equal(register.children.length, 35);
  assert.ok(register.children.every(node => node.tag === 'details'));
  const first = register.children[0];
  assert.equal(first.children[0].textContent, catalogue.items[0].film_title);
  first.open = true;
  first.listeners.toggle();
  assert.equal(requests, 1);
  const scenes = first.lastChild.children;
  assert.equal(scenes.length, 6);
  assert.equal(scenes[0].children[0].textContent, `01 / ${catalogue.items[0].scenes[0].kind}`);
  assert.equal(scenes[0].children[3].textContent, `Visual credit: ${catalogue.items[0].scenes[0].credit}`);
  assert.equal(scenes[0].children[4].href, catalogue.items[0].scenes[0].link);
  const second = register.children[1];
  second.open = true;
  second.listeners.toggle();
  assert.equal(requests, 1, 'reuse one catalogue request for multiple scene disclosures');
  search.value = catalogue.items[0].film_title.toLowerCase();search.input();
  assert.equal(count.textContent, '1 of 35 film source records');
  assert.equal(register.children.filter(node => !node.hidden).length, 1);
});
