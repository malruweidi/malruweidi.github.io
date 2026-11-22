import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {dirname,resolve,join} from "node:path";
import {fileURLToPath} from "node:url";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const read=file=>readFileSync(join(root,file),"utf8");
const html=read("index.html");
const archive=read("assets/archive-scenes.js");
const atlas=read("assets/kinetic-atlas-ui-2026.js");

const chapters=["research","publications","films","stories","illness-and-evidence",
                "writing","chem-squad","leadership","major-revisions"];
test("chapter cards contain actual archival photographs, not injected decorative animations",()=>{
 const grid=html.match(/<div class="rx26-portal-grid">([\s\S]*?)<\/div><\/section>/)?.[1]||html;
 for(const slug of chapters)
   assert.match(grid,new RegExp('class="rx26-portal-card" href="/'+slug+'\\.html"'),
     slug+" chapter link missing");
 assert.doesNotMatch(html,/src="[^"]*kinetic-chapter-cards-2026\.js/);
 assert.doesNotMatch(html,/href="[^"]*kinetic-chapter-cards-2026\.css/);
 assert.doesNotMatch(archive,/rx-card-kinetic/);
 assert.match(archive,/className = "rx-cover-art"/);
 assert.match(archive,/a\.querySelector\("\.rx26-card-top"\)\.after\(frame\)/);
});
test("all thirty interactive scientific illustrations remain inside the dedicated atlas",()=>{
 assert.match(html,/src="[^"]*kinetic-atlas-v2-core\.js/);
 assert.match(html,/src="[^"]*kinetic-atlas-ui-2026\.js/);
 assert.match(atlas,/rx-atlas-canvas/);
 assert.match(atlas,/Interactive diagrams use normalized settings, not measured research data/);
});
test("catalogue counter distinguishes collection totals from carousel position",()=>{
 assert.match(archive,/collections/i);
 assert.match(archive,/status\.hidden\s*=\s*active\s*===\s*"all"/);
 assert.doesNotMatch(archive,/number\.format\(count\)\+" of "\+number\.format\(cards\.length\)/);
});
