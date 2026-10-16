import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, dirname, join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = path => readFileSync(join(root, path), "utf8");

test("UREP23 first-person story is a preserved and discoverable route", () => {
  const path = "stories/the-ring-that-never-closed.html";
  assert.ok(existsSync(join(root, path)), "Standalone research story must exist");
  const story = read(path), collection = read("stories.html"), grant = read("grants/urep23.html");
  assert.match(story, /The ring that never closed/);
  assert.match(story, /UREP23-133-1-028/);
  assert.match(story, /Schiff bases/);
  assert.match(story, /c-MYC/);
  assert.match(story, /COVID-19/);
  assert.match(story, /in vitro/);
  assert.match(story, /href="\/grants\/urep23\.html"/);
  assert.match(collection, /id="urep23-unfinished-route"/);
  assert.match(collection, /href="#urep23-unfinished-route"/);
  assert.match(grant, /href="\/stories\/the-ring-that-never-closed\.html"/);
  assert.match(read("grants.html"), /href="\/stories\/the-ring-that-never-closed\.html"/);
});

test("the new chapter does not erase existing stories or imply a clinical medicine", () => {
  const collection = read("stories.html");
  for (const original of ["anatomy", "community", "unfortunate-trials", "undergraduate-imines", "zebrafish-histology-materials", "zewail-visit-and-portrait"]) {
    assert.ok(collection.includes('id="' + original + '"'), original);
  }
  const story = read("stories/the-ring-that-never-closed.html");
  assert.doesNotMatch(story, /proved to (?:treat|cure) (?:breast )?cancer/i);
  assert.match(story, /PRMT5/);
  assert.match(story, /did not establish/i);
  assert.match(story, /biology team/i);
});

test("new route is indexed and available in site map with Arabic discovery terms", () => {
  const index = JSON.parse(read("assets/discovery-index.json"));
  const entry = index.items.find(x => x.url === "/stories/the-ring-that-never-closed.html");
  assert.ok(entry);
  assert.equal(entry.category, "Stories");
  assert.match(entry.keywords, /[\u0600-\u06ff]/);
  assert.match(read("sitemap.xml"), /stories\/the-ring-that-never-closed\.html/);
  assert.match(read("assets/stories-i18n.js"), /The ring that never closed/);
  assert.match(read("reading-map.html"), /the-ring-that-never-closed/);
});
