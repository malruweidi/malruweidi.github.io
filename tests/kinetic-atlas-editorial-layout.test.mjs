import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {dirname,resolve,join} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const read=path=>readFileSync(join(root,path),"utf8");
const source=read("assets/kinetic-atlas-ui-2026.js");
const css=read("assets/kinetic-atlas-2026.css");
const html=read("index.html");

test("editorial layout places scene context inside the right-hand rail, after the main controls",()=>{
  const primary=source.indexOf('class="rx-atlas-primary"');
  const controls=source.indexOf('class="rx-atlas-controllers"');
  const sidebar=source.indexOf('<aside class="rx-atlas-sidebar">');
  const description=source.indexOf('class="rx-atlas-description"');
  const listing=source.indexOf('class="rx-atlas-list"');
  assert.ok(primary>=0 && controls>primary,"primary and controls preserved");
  assert.ok(sidebar>controls,"rail follows main visual and controls");
  assert.ok(description>sidebar && listing>description,"context precedes scene list in the rail");
  assert.ok(source.includes('id="rx-atlas-canvas"'));
  assert.ok(source.includes('id="rx-atlas-boundary"'));
});
test("light paper editorial background replaces distracting vertical grid",()=>{
  assert.match(css,/\/\* KINETIC ATLAS V3/);
  assert.match(css,/\.rx-atlas::before\s*\{[^}]*display:\s*none/s);
  assert.match(css,/\.rx-atlas \.rx-atlas-head\s*\{[^}]*background:transparent!important/s);
  assert.match(css,/\.rx-atlas\s*\{[^}]*background:\s*#f7f4ee/s);
  assert.match(css,/\.rx-atlas \.rx-atlas-sidebar\s*\{[^}]*background:\s*#fffdf8/s);
  assert.match(css,/\.rx-atlas \.rx-atlas-description h3\s*\{[^}]*font-size:\s*clamp\(/s);
  assert.match(css,/@media\s*\(max-width:\s*950px\)/);
  assert.match(css,/@media\s*\(max-width:\s*560px\)/);
});
test("short visible scientific caveat remains readable and localizable",()=>{
  assert.match(source,/Interactive diagrams use normalized settings, not measured research data\./);
  assert.match(source,/الرسوم التفاعلية/);
  assert.match(css,/\.rx-atlas \.rx-atlas-boundary\s*\{[^}]*background:\s*#ebe9e3/s);
  assert.doesNotMatch(html,/kinetic-chapter-cards-2026\.js/);
});


test("interactive atlas title has its own ID, independent of other homepage features",()=>{
 assert.match(source,/id="rx-kinetic-scene-title"/);
 assert.match(source,/q\("rx-kinetic-scene-title"\)/);
 assert.doesNotMatch(source,/id="rx-atlas-title"/);
});
