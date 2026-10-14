import {readFileSync} from "node:fs";
import {join, resolve, dirname} from "node:path";
import {fileURLToPath} from "node:url";
import assert from "node:assert/strict";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pages = [
  "stories.html", "computing.html", "grants.html", "imaging.html",
  "archive.html", "cv.html", "engagement.html", "grants/urep19.html",
  "grants/urep21.html", "grants/urep22.html", "grants/urep23.html",
  "illness-and-evidence.html"
];
const read = file => readFileSync(join(root,file), "utf8");
function head(file) {
  const full=read(file);
  assert.ok(full.includes("</head>") && full.includes("</body>"), file);
  return full.split("</head>")[0];
}
test("all twelve enhanced public pages have exactly one self-canonical URL", () => {
  for (const file of pages) {
    const h = head(file);
    const expected = "https://malruweidi.github.io/" + file;
    const tags = [...h.matchAll(/<link[^>]*rel=["']canonical["'][^>]*>/gi)];
    assert.equal(tags.length, 1, file + " requires exactly one canonical");
    assert.ok(tags[0][0].includes(expected), file + ": canonical points elsewhere");
  }
});
test("share previews retain source-derived titles and descriptions", () => {
  for (const file of pages) {
    const h = head(file);
    for (const key of ["og:title", "og:description", "og:image", "og:type"]) {
      assert.ok(h.includes('property="' + key + '"'), file + ": missing " + key);
    }
    assert.ok(h.includes('name="twitter:card"'), file);
    assert.ok(h.includes('name="twitter:image"'), file);
    assert.ok(/<title[^>]*>[\s\S]+?<\/title>/i.test(h), file + ": lost original title");
    assert.ok(/<meta\s+name=["']description["']/i.test(h), file + ": lost description");
  }
});
test("improvements do not replace research content or existing routes", () => {
  for (const file of pages) {
    const html=read(file);
    assert.ok(html.includes("<h1"), file + ": missing primary heading");
    assert.ok(html.includes("<main"), file + ": missing main content");
    assert.ok(html.length>4000, file + ": unexpected reduction");
  }
  assert.match(read("archive.html"), /ARCHIVE 05/);
  assert.match(read("imaging.html"), /MicroZebraLab/);
  assert.match(read("stories.html"), /chapter-zebrafish-histology-materials/);
  assert.match(read("engagement.html"), /Chemistry Festival/);
});