import { readFileSync, existsSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("geographic identity exists exactly once without replacing the existing homepage", () => {
  const html = read("index.html");
  assert.equal((html.match(/id="three-places"/g) || []).length, 1);
  assert.match(html, /id="about"/);
  assert.match(html, /id="story"/);
  assert.match(html, /three-places-2026\.css/);
  assert.match(html, /three-places-2026\.js/);
  assert.match(html, /three-places-i18n-2026\.js/);
  assert.match(html, /GSHHG/);
  assert.ok(html.indexOf('id="three-places"') < html.indexOf("</main>"));
});

test("three places use accessible controls and distinguish real formation from future prospects", () => {
  const html = read("index.html");
  const start = html.indexOf('<section class="geographies"');
  const stop = html.indexOf("</section>", start);
  const map = html.slice(start, stop);
  assert.match(map, /<svg class="geo-map"/);
  for (const place of ["egypt", "qatar", "usa"]) {
    assert.match(map, new RegExp('class="geo-place" data-place="' + place + '"'));
    assert.match(map, new RegExp('geo-point--' + place));
  }
  assert.match(map, /Roots &amp; historical imagination/);
  assert.match(map, /Home, education &amp; laboratory/);
  assert.match(map, /Scientific exchange &amp; horizons/);
  assert.doesNotMatch(map, /\bGPA\b|grade.point average/i);
  assert.doesNotMatch(map, /<button[^>]*>\s*<h3>/);
});

test("map enhancements and bilingual text are standalone and dependency free", () => {
  for (const path of ["assets/three-places-2026.js","assets/three-places-2026.css","assets/three-places-i18n-2026.js"]) assert.ok(existsSync(new URL("../"+path,import.meta.url)),path);
  assert.match(read("assets/three-places-2026.js"), /MutationObserver/);
  assert.match(read("assets/three-places-i18n-2026.js"), /جذوري مصرية/);
  assert.doesNotMatch(read("assets/three-places-2026.js"), /fetch\(|XMLHttpRequest|geolocation/);
});
