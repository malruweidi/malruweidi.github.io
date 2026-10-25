import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const page = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const dictionary = readFileSync(new URL("../assets/homepage-editorial-i18n-2026.js", import.meta.url), "utf8");
const stylesheet = readFileSync(new URL("../assets/research-fastpaths-2026.css", import.meta.url), "utf8");
const heroStart = page.indexOf('<div class="rx-hero-copy">');
const portraitStart = page.indexOf('<figure class="rx-hero-portrait">', heroStart);
const hero = page.slice(heroStart, portraitStart);

const researchRoutes = [
  ["Which questions have I investigated?", "/research.html"],
  ["What was my contribution?", "/publications.html"],
  ["Which methods support the work?", "/methods-evidence.html"],
  ["What could I investigate next?", "/molecular-therapeutics.html#research-interests"],
];

test("research questions immediately follow the original scientific introduction", () => {
  const lead = hero.indexOf('class="rx-hero-lead"');
  const fastpathsStart = hero.indexOf('<nav class="rx-research-fastpaths"');
  const fastpathsEnd = hero.indexOf("</nav>", fastpathsStart);
  const backstory = hero.indexOf('class="rx-hero-backstory"');
  assert.ok(lead >= 0 && lead < fastpathsStart && fastpathsStart < fastpathsEnd && fastpathsEnd < backstory);
  const fastpaths = hero.slice(fastpathsStart, fastpathsEnd);
  assert.equal((fastpaths.match(/<a href=/g) || []).length, 4);
  for (const [question, path] of researchRoutes) {
    assert.ok(fastpaths.includes(`href="${path}"`), `${path} must remain directly accessible`);
    assert.ok(fastpaths.includes(question), `visible intent label must remain: ${question}`);
    assert.ok(dictionary.includes(JSON.stringify(question)), `Arabic translation key must remain: ${question}`);
  }
  assert.match(page, /assets\/research-fastpaths-2026\.css/);
  assert.match(stylesheet, /@media \(max-width: 760px\)/);
});

test("the complete original hero archive and actual researcher photograph remain", () => {
  const expandable = hero.indexOf('<details class="rx-hero-readmore">');
  const originalLinks = hero.indexOf('<div class="rx-hero-links">', expandable);
  const researchExplanation = hero.indexOf('The question guiding my future research:', expandable);
  const expandableEnd = hero.indexOf("</details>", expandable);
  assert.ok(expandable >= 0 && originalLinks > expandable && researchExplanation > originalLinks && expandableEnd > researchExplanation);
  for (const destination of [
    "/research.html", "/molecular-therapeutics.html", "/stories.html",
    "/illness-and-evidence.html#life-between-diagnoses", "#film", "/reading-map.html", "/methods-evidence.html",
  ]) {
    assert.ok(hero.includes(`href="${destination}"`), `original link must remain: ${destination}`);
  }
  assert.match(page, /Mahmoud Al-Ruweidi photographed in a laboratory coat at Qatar University in 2026/);
  assert.match(page, /class="rx26-portal-card"/);
  assert.equal((page.match(/class="rx26-portal-card"/g) || []).length, 9);
});
