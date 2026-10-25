import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const start = html.indexOf('class="rx-hero-copy"');
const end = html.indexOf('class="rx-hero-portrait"', start);
const hero = html.slice(start, end);

test("homepage offers two clear paths before the expandable scientific biography", () => {
  const lead = hero.indexOf('<p class="rx-hero-lead">');
  const links = hero.indexOf('<div class="rx-hero-links">');
  const backstory = hero.indexOf('<details class="rx-hero-backstory">');
  assert.ok(lead >= 0 && links >= 0 && backstory >= 0);
  assert.ok(lead < links && links < backstory, "main actions must precede optional deep reading");
  assert.match(hero, /class="rx-hero-primary" href="\/research\.html"/);
  assert.match(hero, /class="rx-hero-secondary" href="\/stories\.html"/);
  assert.equal((hero.match(/class="rx-hero-(?:primary|secondary)"/g) || []).length, 2);
  assert.doesNotMatch(hero.slice(0, backstory), /The question guiding my future research/);
});

test("the film, nine chapter destinations and original evidence boundaries are preserved", () => {
  assert.match(html, /class="rx-hero-portrait"/);
  assert.match(hero, /My first research project began in 2015/);
  assert.match(hero, /The question guiding my future research/);
  const count = (html.match(/class="rx26-portal-card"/g) || []).length;
  assert.equal(count, 9, "the approved nine-part chapter index remains intact");
  assert.match(html, /editorial-release-2026\.js/);
  assert.match(readFileSync(new URL("../assets/editorial-release-2026.js", import.meta.url),"utf8"), /cards\.slice\(4\)/);
  assert.match(html, /id="film"/);
});
