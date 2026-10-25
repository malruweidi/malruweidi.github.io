import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";

const files = [
  { name: "pulmonary-epithelial-injury", source: "primary-source", sections: 10, images: 2, videos: 1, localizes: true },
  { name: "plasma-modified-pla", source: "sources", sections: 7, images: 1, videos: 0, localizes: false },
  { name: "high-speed-zebrafish-imaging", source: "sources", sections: 7, images: 1, videos: 0, localizes: false },
  { name: "zebrafish-vascular-cilia", source: "primary-source", sections: 9, images: 5, videos: 0, localizes: true },
  { name: "inhalable-vesicles", source: "work-status", sections: 9, images: 2, videos: 0, localizes: true },
];
const css = readFileSync(new URL("../assets/dossier-scan-2026.css", import.meta.url), "utf8");
const translations = readFileSync(new URL("../assets/dossier-scan-i18n-2026.js", import.meta.url), "utf8");
const window = { RuwaidixArabicDictionary: {} };
runInNewContext(translations, { window });
const dictionary = window.RuwaidixArabicDictionary;

test("five existing dossiers expose the same evidence-first scan without losing scientific media", () => {
  const labels = ["System and method", "Reported finding or status", "My contribution", "Interpretive boundary"];
  for (const file of files) {
    const html = readFileSync(new URL(`../research/${file.name}.html`, import.meta.url), "utf8");
    const marker = '<section class="rx-dossier-scan"';
    const start = html.indexOf(marker);
    const end = html.indexOf("</section>", start) + "</section>".length;
    assert.ok(start > 0 && end > start, `${file.name} has one scannable evidence panel`);
    assert.equal(html.split(marker).length - 1, 1);
    const scan = html.slice(start, end);
    assert.ok(html.indexOf('<section class="rx-deep-hero rx-research-hero">') < start);
    assert.ok(html.indexOf('class="rx-research-toc"') > end);
    assert.match(scan, new RegExp(`href="#${file.source}"`));
    assert.ok(html.includes(`id="${file.source}"`));
    assert.equal((scan.match(/<dt>/g) || []).length, 4);
    assert.equal((scan.match(/<dd>/g) || []).length, 4);
    assert.ok(!/<(?:img|video|picture|svg)\b/.test(scan), "no new or fabricated media");
    for (const label of labels) assert.ok(scan.includes(`<dt>${label}</dt>`));
    assert.equal((html.match(/<section\b/g) || []).length, file.sections);
    assert.equal((html.match(/<img\b/g) || []).length, file.images);
    assert.equal((html.match(/<video\b/g) || []).length, file.videos);
    assert.match(html, /assets\/dossier-scan-2026\.css\?v=1/);
    assert.match(html, /class="rx-research-intro"/);
    if (file.localizes) {
      assert.match(html, /assets\/dossier-scan-i18n-2026\.js\?v=1/);
      for (const text of scan.matchAll(/<(?:dt|dd)>([^<]+)<\/(?:dt|dd)>/g)) {
        assert.ok(dictionary[text[1]], `${file.name} has Arabic copy for ${text[1]}`);
      }
    }
  }
});

test("the ongoing thesis stays separate from published study claims", () => {
  const ongoing = readFileSync(new URL("../research/inhalable-vesicles.html", import.meta.url), "utf8");
  const summary = ongoing.slice(ongoing.indexOf('class="rx-dossier-scan"'), ongoing.indexOf("</section>", ongoing.indexOf('class="rx-dossier-scan"')));
  assert.match(summary, /The MSc project is ongoing/);
  assert.match(summary, /not yet quantitative proof/);
  assert.match(summary, /No encapsulation efficiencies/);
  assert.match(ongoing, /MSc investigation in progress; no thesis results or publication claimed/);
  assert.match(css, /@media\(max-width: 700px\)/);
  assert.match(css, /@media print/);
});
