"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const films = read("moving-evidence.html");
const techniques = read("techniques.html");
const stories = read("stories.html");
const ownerArchive = read("assets/owner-archive-2026-10-13.js");
const homepage = read("index.html");
const engagements = read("engagement.html");
const archive = read("archive.html");
const discovery = JSON.parse(read("assets/discovery-index.json"));

test("Moving Evidence preserves seven separately annotated recordings", () => {
  assert.equal((films.match(/<figure class="film-card/g) || []).length, 7);
  assert.equal((films.match(/<video\b/g) || []).length, 6);
  assert.equal((films.match(/<iframe\b/g) || []).length, 1);
  assert.equal((films.match(/<figcaption\b/g) || []).length, 7);
  assert.equal((films.match(/<h1\b/g) || []).length, 1);
  for (const anchor of ["zebrafish-films", "avian-film", "lab-film", "chem-squad-film", "seminar-film"]) {
    assert.ok(films.includes('id="' + anchor + '"'), "missing anchored chapter " + anchor);
  }
});

test("every original film links to an already-published media source", () => {
  const sources = [...films.matchAll(/<source\b[^>]*src="([^"]+)"[^>]*>/g)].map(m => m[1]);
  assert.equal(sources.length, 6);
  assert.equal(new Set(sources).size, 6, "duplicate footage shown as a new film");
  for (const src of sources) {
    if (src.startsWith("/")) {
      assert.ok(fs.existsSync(path.join(root, src.slice(1))), "missing local original " + src);
    } else {
      assert.ok(src.startsWith("https://"), "untrusted remote media scheme " + src);
    }
    assert.ok(techniques.includes(src) || stories.includes(src) || ownerArchive.includes(src.split("/").pop()), "untraced original recording " + src);
  }
  assert.ok(films.includes("https://www.youtube-nocookie.com/embed/62hbr51K3GE"));
  assert.ok(homepage.includes("https://www.youtube-nocookie.com/embed/62hbr51K3GE"));
});

test("videos have control, accessible labels and metadata-first loading", () => {
  const players = [...films.matchAll(/<video\b([^>]+)>/g)].map(m => m[1]);
  assert.equal(players.length, 5);
  for (const attributes of players) {
    assert.match(attributes, /\bcontrols\b/);
    assert.match(attributes, /\bplaysinline\b/);
    assert.match(attributes, /preload="none"/);
    assert.match(attributes, /aria-label="[^"]+"/);
    assert.match(attributes, /poster="[^"]+"/);
  }
  assert.match(films, /Exact model|model, experiment and function|source filenames|specimen details/i);
  assert.ok(/<source[^>]*khaled-jama-thesis-reaction\.mp4/i.test(films), "restored colleague video not published");
});

test("film index is linked without replacing original archive entries", () => {
  for (const [filename, source] of [
    ["index.html", homepage],
    ["archive.html", archive],
    ["engagement.html", engagements],
    ["stories.html", stories],
    ["assets/unified-pages.js", read("assets/unified-pages.js")]
  ]) assert.ok(source.includes("moving-evidence.html"), "missing discovery link on " + filename);

  assert.ok(read("sitemap.xml").includes("https://malruweidi.github.io/moving-evidence.html"));
  assert.ok(discovery.items.some(item => item.url === "/moving-evidence.html"));
  assert.ok(techniques.includes("animal-videos"), "legacy microscopy atlas missing");
  assert.ok(stories.includes("laboratory-vacuum-pump-archival-clip.mp4"), "legacy apparatus story missing");
});
