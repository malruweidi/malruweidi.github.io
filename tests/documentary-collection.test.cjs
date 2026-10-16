"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");

test("documentary hub separates released film, original observations and unproduced film treatments", () => {
  const html = read("films.html");
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /id="released"/);
  assert.match(html, /id="observations"/);
  assert.match(html, /id="film-notebooks"/);
  assert.match(html, /what-survives-the-experiment\.mp4/);
  assert.match(html, /Released · two-minute documentary/);
  assert.match(html, /In development · no film released/);
  for (const source of ["/film.html", "/moving-evidence.html", "/stories/failed-zebrafish-histology.html", "/research/pulmonary-epithelial-injury.html"]) {
    assert.ok(html.includes('href="' + source + '"'), "missing existing evidence destination " + source);
  }
});

test("failed histology film notebook uses only three traceable photographs and distinguishes observation from hypothesis", () => {
  const notebook = read("films/two-materials-no-section.html");
  for (const file of [
    "assets/2026-10-13-new-photos/zebrafish-histology-processing.webp",
    "assets/2026-10-13-new-photos/zebrafish-orientation-specimens.webp",
    "assets/2026-10-13-new-photos/zebrafish-paraffin-microtomy-failure.webp"
  ]) {
    assert.ok(fs.existsSync(path.join(root, file)), "original image absent " + file);
    assert.ok(notebook.includes("/" + file), "film notebook omits source " + file);
  }
  assert.match(notebook, /No finished film has been published/);
  assert.match(notebook, /No interpretable histological section was obtained/);
  assert.match(notebook, /not established as the sole cause/);
  assert.match(notebook, /2% agarose/);
  assert.match(notebook, /id="source-record"/);
  assert.ok(notebook.includes('href="/stories/failed-zebrafish-histology.html"'));
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
