import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const publications = readFileSync(new URL("../publications.html", import.meta.url), "utf8");
const methods = readFileSync(new URL("../methods-evidence.html", import.meta.url), "utf8");
const directions = readFileSync(new URL("../molecular-therapeutics.html", import.meta.url), "utf8");
const script = readFileSync(new URL("../assets/publications-discovery-2026.js", import.meta.url), "utf8");

const methodRoutes = {
  "work-8": "physiology", "work-9": "materials", "work-6": "clinical",
  "work-11": "physiology", "work-7": "clinical", "work-10": "materials",
  "work-12": "zebrafish", "work-13": "molecular", "work-14": "zebrafish"
};

test("original research and methods papers link directly to their matching method chapters", () => {
  for (const [work, chapter] of Object.entries(methodRoutes)) {
    const article = publications.match(new RegExp(`<article class="pub-card"[^>]+id="${work}"[\\s\\S]*?<\\/article>`))?.[0];
    assert.ok(article, `${work} remains in the selected bibliography`);
    assert.ok(article.includes(`href="/methods-evidence.html#${chapter}"`), `${work} links to ${chapter}`);
    assert.ok(methods.includes(`id="${chapter}"`), `${chapter} is a real anchor`);
    assert.ok(article.includes("My contribution:"), `${work} retains explicit personal attribution`);
  }
  assert.equal((publications.match(/class="pub-card"/g) || []).length, 20, "all selected publication entries remain");
});

test("publication search covers contributions and method terms with a recoverable empty state", () => {
  assert.match(publications, /assets\/publications-discovery-2026\.js\?v=1/);
  assert.match(publications, /id="publication-empty"[^>]*hidden/);
  assert.match(publications, /id="publication-reset"/);
  assert.match(script, /card\.textContent/);
  assert.match(script, /card\.dataset\.search/);
  assert.match(script, /all\.click\(\)/);
  assert.match(publications, /data-pub-category="Original research"/);
});

test("the future-research page now separates published, ongoing and prospective work", () => {
  assert.match(directions, /aria-label="Read research by evidence status"/);
  for (const id of ["selected-experiments", "present-work", "research-agenda"]) {
    assert.ok(directions.includes(`href="#${id}"`), `${id} is linked`);
    assert.ok(directions.includes(`id="${id}"`), `${id} exists`);
  }
  assert.match(directions, /assets\/evidence-status-navigation-2026\.css\?v=1/);
  assert.match(methods, /This methods portfolio distinguishes my current inhalable-vesicle investigation/);
});
