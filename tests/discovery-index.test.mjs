import {readFileSync, existsSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {resolve, dirname, join} from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = path => readFileSync(join(root, path), "utf8");
const index = JSON.parse(read("assets/discovery-index.json"));
const normalize = value => String(value || "").normalize("NFKD")
  .replace(/[\u0300-\u036f\u064b-\u065f\u0670\u0640]/g, "")
  .replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه")
  .toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

function search(query) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  return index.items.filter(entry => {
    const searchable = normalize([entry.title, entry.summary, entry.keywords, entry.category].join(" "));
    return terms.every(term => searchable.includes(term));
  });
}

test("no existing material has to move for discovery to work", () => {
  assert.ok(existsSync(join(root, "search.html")));
  assert.ok(existsSync(join(root, "reading-map.html")));
  assert.ok(existsSync(join(root, "stories.html")));
  assert.ok(existsSync(join(root, "archive.html")));
  assert.ok(existsSync(join(root, "full-record.html")));
  assert.ok(existsSync(join(root, "assets/ruwaidix-approved.webp")));
});

test("the index is substantive, structurally valid and locally scoped", () => {
  assert.ok(index.items.length >= 40);
  assert.ok(index.items.length>=58,"preexisting discovery routes must remain available");
  assert.equal(new Set(index.items.map(x => x.id)).size, index.items.length);
  assert.ok(index.categories.includes("Stories"));
  for (const item of index.items) {
    assert.ok(item.title && item.summary && item.category && item.keywords, item.title);
    assert.ok(/^\/(?!\/)/.test(item.url), item.url);
    assert.ok(index.categories.includes(item.category), item.title);
    assert.match(item.keywords, /[\u0600-\u06ff]/, item.title);
  }
});

test("every indexed page exists and every anchored route resolves", () => {
  const cache = new Map();
  for (const item of index.items) {
    const [path, fragment] = item.url.split("#");
    const file = path === "/" ? "index.html" : decodeURIComponent(path.slice(1));
    assert.ok(existsSync(join(root, file)), "Missing page for " + item.title + ": " + item.url);
    if (!fragment) continue;
    if (!cache.has(file)) cache.set(file, read(file));
    const html = cache.get(file);
    const id = decodeURIComponent(fragment);
    assert.ok(html.includes('id="' + id + '"') || html.includes("id='" + id + "'"),
      "Missing anchor for " + item.url);
  }
});

test("search finds concrete experimental topics in both languages", () => {
  for (const [query, expected] of [
    ["niosomes", "Inhalable drug carriers"],
    ["agarose", "A histology embedding failure"],
    ["SPION", "At Zewail City"],
    ["Ramadan", "The Ramadan microscope"],
    ["أرشيف", "Photographic & film archive"],
    ["مجهر", "The microscope brought from Cairo"],
    ["الجدول الدوري", "The history of the periodic table"]
  ]) {
    assert.ok(search(query).some(entry => entry.title === expected), query + " should find " + expected);
  }
});

test("the source record and no-JavaScript fallback remain accessible", () => {
  const html = read("search.html");
  assert.match(html, /id="rx-search-fallback"/);
  assert.match(html, /href="\/full-record\.html"/);
  assert.match(html, /href="\/reading-map\.html"/);
  assert.match(html, /href="\/archive\.html"/);
  assert.match(read("sitemap.xml"), /\/search\.html/);
  assert.match(read("assets/discovery-search.js"), /createTextNode/);
  assert.doesNotMatch(read("assets/discovery-search.js"), /innerHTML\s*=/);
  assert.match(read("assets/unified-pages.js"), /discovery-global\.js/);
  assert.match(read("assets/site-enhancements.js"), /discovery-global\.js/);
});