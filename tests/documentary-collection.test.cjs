"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");

test("documentary hub separates released films, original observations and preserved research notebooks", () => {
  const html = read("films.html");
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /id="released"/);
  assert.match(html, /id="observations"/);
  assert.match(html, /id="film-notebooks"/);
  assert.match(html, /what-survives-the-experiment\.mp4/);
  assert.match(html, /Released · two-minute documentary/);
  assert.doesNotMatch(html, /In development · no film released/);
  assert.match(html, /Watch the source-linked historical edition/);
  assert.match(html, /Watch the formulation film/);
  for (const source of ["/film.html", "/moving-evidence.html", "/stories/failed-zebrafish-histology.html", "/research/pulmonary-epithelial-injury.html"]) {
    assert.ok(html.includes('href="' + source + '"'), "missing existing evidence destination " + source);
  }
});

test("histology documentary stays reader-first while three experimental photographs remain in the original story", () => {
  const film = read("films/two-materials-no-section.html");
  const story = read("stories/failed-zebrafish-histology.html");
  for (const file of [
    "assets/2026-10-13-new-photos/zebrafish-histology-processing.webp",
    "assets/2026-10-13-new-photos/zebrafish-orientation-specimens.webp",
    "assets/2026-10-13-new-photos/zebrafish-paraffin-microtomy-failure.webp"
  ]) {
    assert.ok(fs.existsSync(path.join(root, file)), "original photo absent " + file);
    assert.ok(story.includes("/" + file), "original experimental story omits photograph " + file);
  }
  assert.match(story, /2% agarose/);
  assert.match(film, /<video\\b[^>]*controls/);
  assert.ok(film.includes('href="/stories/failed-zebrafish-histology.html"'));
  assert.match(film, /Its exact cause was not conclusively established/);
  assert.doesNotMatch(film, /No finished film has been published/);
});

test("new collection is additive and searchable without removing published footage", () => {
  const home = read("index.html");
  const oldFilms = read("moving-evidence.html");
  const legacyFilm = read("film.html");
  const story = read("stories.html");
  const index = JSON.parse(read("assets/discovery-index.json"));
  const sitemap = read("sitemap.xml");
  assert.ok(home.includes('href="/films.html"'));
  assert.ok(legacyFilm.includes('href="/films.html"'));
  assert.ok(story.includes('href="/films/two-materials-no-section.html"'));
  assert.ok((oldFilms.match(/<figure class="film-card/g) || []).length >= 7, "preserve six historic recordings and the original colleague recording");
  assert.ok(home.includes("id=\"rx-feature-film\""));
  assert.ok(index.items.some(x => x.url === "/films.html"));
  assert.ok(index.items.some(x => x.url === "/films/two-materials-no-section.html"));
  assert.ok(sitemap.includes("https://malruweidi.github.io/films.html"));
  assert.ok(sitemap.includes("https://malruweidi.github.io/films/two-materials-no-section.html"));
});
