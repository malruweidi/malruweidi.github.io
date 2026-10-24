import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { test } from "node:test";
import assert from "node:assert/strict";

const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("dynamic navigation controls have specific Arabic labels", () => {
  const sandbox = { window: {} };
  runInNewContext(read("assets/i18n-dictionary.js"), sandbox, { timeout: 3000 });
  const words = sandbox.window.RuwaidixArabicDictionary;
  for (const source of [
    "Sections +",
    "Open site navigation",
    "Close site navigation",
    "Primary navigation"
  ]) {
    assert.equal(typeof words[source], "string", source + " must be translated");
    assert.match(words[source], /[\u0600-\u06FF]/, source + " needs Arabic text");
  }
});

test("the translation observer notices dynamically replaced ARIA labels", () => {
  const source = read("assets/i18n.js");
  assert.match(source, /change\.type\s*===\s*["']attributes["']\)\s*localizeAttributes\(change\.target\)/);
  assert.match(source, /attributes:\s*true/);
  for (const attribute of ["aria-label", "placeholder", "title"]) {
    assert.match(source, new RegExp("attributeFilter:[^\\n]*" + attribute));
  }
});

test("approved header logo is not reassigned when the URL is already correct", () => {
  const source = read("assets/site-enhancements.js");
  assert.match(source, /img\.getAttribute\(["']src["']\)\s*!==\s*approvedLogo/);
  assert.doesNotMatch(source, /img\.src\s*!==\s*approvedLogo/);
});
