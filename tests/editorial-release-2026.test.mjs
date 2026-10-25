import {readFileSync} from "node:fs";
import {test} from "node:test";
import assert from "node:assert/strict";

const read = name => readFileSync(new URL("../" + name, import.meta.url), "utf8");

test("canonical Research and Publications hubs share site navigation", () => {
  for (const file of ["research.html", "publications.html"]) {
    const html = read(file);
    assert.match(html, /assets\/unified-pages\.css\?v=20261025/);
    assert.match(html, /assets\/unified-pages\.js\?v=20261025/);
    assert.match(html, /class="skip-link"/);
  }
  const nav = read("assets/unified-pages.js");
  for (const route of ["/research.html", "/publications.html", "/stories.html", "/films.html", "/writing.html"])
    assert.ok(nav.includes(JSON.stringify(route)), route);
  assert.doesNotMatch(nav, /"\/full-record\.html#(?:research|publications)"/);
});

test("Arabic visitors are not told an untranslated scientific page is Arabic", () => {
  const nav = read("assets/unified-pages.js");
  assert.match(nav, /englishOnlyHub&&requestedLanguage==="ar"/);
  assert.match(nav, /note\.lang="ar";note\.dir="rtl"/);
  assert.match(nav, /هذا الفهرس العلمي متاح حاليًا بالإنجليزية/);
  assert.match(nav, /back\.href="\/\?lang=ar"/);
  assert.match(read("assets/unified-pages.css"), /\.rx-language-note/);
});

test("supplementary homepage chapters are expandable without deleting original links", () => {
  const script = read("assets/editorial-release-2026.js");
  assert.match(script, /cards\.length !== 9/);
  assert.match(script, /cards\.slice\(4\)\.forEach/);
  assert.match(script, /document\.createElement\("details"\)/);
  for (const route of ["/illness-and-evidence.html", "/writing.html", "/chem-squad.html", "/leadership.html", "/major-revisions.html"])
    assert.ok(read("index.html").includes('href="' + route + '"'), route);
});
