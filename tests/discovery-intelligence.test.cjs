const test = require("node:test");
const assert = require("node:assert/strict");
const {readFileSync} = require("node:fs");
const {join} = require("node:path");
const intelligence = require("../assets/discovery-intelligence.js");
const items = JSON.parse(readFileSync(join(__dirname, "../assets/discovery-index.json"), "utf8")).items;
const ranked = query => intelligence.search(items, query).map(result => result.entry.url);

test("plain-language search recovers relevant original evidence", () => {
  assert.ok(ranked("nebulizer").includes("/research/inhalable-vesicles.html"));
  assert.ok(ranked("mechanical lung injury").includes("/research/pulmonary-epithelial-injury.html"));
  assert.ok(ranked("chemical target degradation").includes("/doctoral-concepts.html"));
});
test("Arabic discovery finds the same scientific record", () => {
  assert.ok(ranked("الاستنشاق").includes("/research/inhalable-vesicles.html"));
  assert.ok(ranked("إصابة الرئة").includes("/research/pulmonary-epithelial-injury.html"));
  assert.ok(ranked("تاريخ الصيدلة").includes("/full-record.html#history"));
});
test("exact scientific terms and past bookmarks still resolve", () => {
  assert.ok(ranked("niosomes").includes("/research/inhalable-vesicles.html"));
  assert.ok(ranked("SPION").includes("/stories.html#chapter-zewail-visit-and-portrait"));
  assert.deepEqual(ranked("zzzxxyyunknown"), []);
});
test("ranked results are deterministic, deduplicated and ordered", () => {
  const a = intelligence.search(items, "pulmonary epithelial injury");
  const b = intelligence.search(items, "pulmonary epithelial injury");
  assert.deepEqual(a.map(x=>x.entry.url), b.map(x=>x.entry.url));
  assert.equal(new Set(a.map(x=>x.entry.id)).size, a.length);
  assert.ok(a.every((item, i) => item.score > 0 && (i===0 || a[i-1].score >= item.score)));
});
test("navigation enhances rather than replaces the published archive", () => {
  const html = readFileSync(join(__dirname, "../search.html"), "utf8");
  assert.match(html, /assets\\/discovery-intelligence\\.js/);
  assert.match(html, /id="rx-search-fallback"/);
  assert.match(html, /data-query="/);
  const js = readFileSync(join(__dirname, "../assets/discovery-search.js"), "utf8");
  assert.match(js, /RuwaidixDiscovery/);
  assert.doesNotMatch(js, /innerHTML\\s*=/);
});
