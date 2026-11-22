import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";

const read = p => readFileSync(new URL("../" + p, import.meta.url), "utf8");
const page = read("index.html");
const js = read("assets/living-objects-2026.js");
const css = read("assets/living-objects-2026.css");
const context = {};
runInNewContext(js, context);
const cabinet = context.RuwaidixObjectsCabinet;

test("thirty unique physical objects and six five-object chapters", () => {
  assert.ok(cabinet);
  assert.equal(cabinet.objects.length, 30);
  assert.equal(cabinet.groups.length, 6);
  assert.equal(new Set(cabinet.objects.map(o => o.id)).size, 30);
  assert.deepEqual(Array.from(cabinet.groups, g => g.ids.length), [5,5,5,5,5,5]);
  assert.deepEqual(new Set(cabinet.groups.flatMap(g => g.ids)), new Set(cabinet.objects.map(o => o.id)));
});

test("every object is differentiated, bilingual, grounded and has its own motion", () => {
  const motions = new Set();
  cabinet.objects.forEach(o => {
    assert.match(o.id, /^[a-z][a-z0-9-]+$/);
    assert.ok(o.name.en.length > 3 && o.name.ar.length > 3, o.id);
    assert.ok(o.story.en.length > 35 && o.story.ar.length > 35, o.id);
    assert.ok(o.motion && !motions.has(o.motion), o.id + " duplicate motion");
    motions.add(o.motion);
    assert.match(o.link, /^\/(research|techniques|publications|archive|chem-squad|writing|publication-cinema|methods-evidence|figures|films|stories|imaging|computing|major-revisions)[\w/-]*\.html$/, o.id);
    assert.ok(o.source && o.source.en && o.source.ar, o.id);
    assert.match(cabinet.drawObject(o.id), /<svg[\s\S]*<\/svg>/, o.id);
    assert.match(cabinet.drawObject(o.id), /class="rxo-moving"/, o.id);
    assert.doesNotMatch(cabinet.drawObject(o.id), /<script|onload=|onclick=/i, o.id);
  });
});

test("homepage includes accessible progressive enhancement and independent assets", () => {
  assert.match(page, /id="rx-object-cabinet"/);
  assert.match(page, /living-objects-2026\.css/);
  assert.match(page, /living-objects-2026\.js/);
  assert.match(js, /aria-labelledby/);
  assert.match(js, /showModal/);
  assert.match(js, /focus\(\)/);
  assert.match(js, /IntersectionObserver/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /max-width:\s*700px/);
  assert.match(css, /:focus-visible/);
  assert.doesNotMatch(js, /\bfetch\s*\(/);
});

test("the original hero, thirty-scene atlas and photographs stay untouched", () => {
  assert.match(page, /id="hero-title"/);
  assert.match(page, /class="specimen-swim"/);
  assert.match(page, /id="rx-then-now-open"/);
  assert.match(page, /id="rx-moving-moments"/);
  assert.match(page, /id="rx-kinetic-atlas"/);
  assert.ok(page.indexOf('id="rx-object-cabinet"') > page.indexOf('id="rx-moving-moments"'));
  assert.ok(page.indexOf('id="rx-object-cabinet"') < page.indexOf('id="rx-kinetic-atlas"'));
});