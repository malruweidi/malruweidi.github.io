import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const start = html.indexOf('class="rx-hero-copy"');
const end = html.indexOf('class="rx-hero-portrait"', start);
const hero = html.slice(start, end);

test("homepage research actions appear immediately after the leading scientific introduction", () => {
  const lead = hero.indexOf('<p class="rx-hero-lead">');
  const links = hero.indexOf('<div class="rx-hero-links">');
  const secondary = hero.indexOf('<p class="rx-hero-detail">');
  assert.ok(lead >= 0 && links >= 0 && secondary >= 0, "all original hero elements remain");
  assert.ok(lead < links && links < secondary, "actions must precede the longer secondary reading");
  assert.match(hero, /class="rx-hero-primary" href="\/research\.html"/);
  assert.match(hero, /class="rx-hero-secondary" href="#film"/);
  assert.match(hero, /class="rx-hero-backstory"/);
});

test("the film, nine chapter destinations and original scientific prose are preserved", () => {
  assert.match(html, /class="rx-hero-portrait"/);
  assert.match(hero, /My first research project, in 2015/);
  assert.match(hero, /The question guiding my future research/);
  const count = (html.match(/class="rx26-portal-card"/g) || []).length;
  assert.equal(count, 9, "the approved nine-part chapter index remains intact");
  assert.match(html, /id="film"/);
});
