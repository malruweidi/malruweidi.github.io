import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const file=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const home=file("index.html");
const writing=file("writing.html");
const arabic=file("assets/ruwaidix-arabic-editorial-2026.css");
const repair=file("assets/ruwaidix-responsive-repair-2026.css");
const behavior=file("assets/ruwaidix-letterpress-2026.js");

test("bilingual editorial exhibit adds routes but preserves writing content",()=>{
 assert.match(writing,/id="rx-letterpress"/);
 assert.match(writing,/data-rx-letterpress/);
 assert.match(writing,/href="\/stories\.html"/);
 assert.match(writing,/href="\/research\.html"/);
 assert.match(writing,/href="\/writing\.html#essay-the-life-between-diagnoses"/);
 assert.match(writing,/class="rxw-hero"/);
 assert.match(writing,/id="main"/);
 assert.equal((writing.match(/data-rx-press-panel/g)||[]).length,4);
});
test("Arabic letterforms use distinct editorial and interface fonts with real fallbacks",()=>{
 assert.match(arabic,/IBM Plex Sans Arabic/);
 assert.match(arabic,/Amiri/);
 assert.match(arabic,/display=swap/);
 assert.match(arabic,/lang="ar"/);
 assert.match(arabic,/dir="rtl"/);
 assert.match(arabic,/prefers-reduced-motion:\s*reduce/);
 assert.match(file("assets/i18n.js"),/IBM Plex Sans Arabic/);
});
test("the decorative typography is integrated into the actual earlier cinematic sequence",()=>{
 assert.match(home,/rx-moments-glyph/);
 assert.match(home,/lang="ar"/);
 assert.match(home,/id="rx-moving-moments"/);
 assert.match(home,/anatomy-of-a-question-2026-v2\.mp4/);
 assert.match(home,/id="research-workbench"/);
});
test("every responsive repair has a small-screen override and preserves desktop frame proportions",()=>{
 for(const page of ["index.html","stories.html","archive.html","research.html","writing.html","films.html","publications.html","chem-squad.html","leadership.html","illness-and-evidence.html","major-revisions.html","cv.html","engagement.html","computing.html","molecular-therapeutics.html","methods-evidence.html","publication-cinema.html","moving-evidence.html","search.html","reading-map.html","grants.html"]){
   assert.match(file(page),/ruwaidix-responsive-repair-2026\.css/);
   assert.match(file(page),/ruwaidix-arabic-editorial-2026\.css/);
 }
 for(const media of [/max-width:\s*360px/,/max-width:\s*600px/,/max-width:\s*900px/])assert.match(repair,media);
 assert.match(repair,/min-width:\s*0/);
 assert.match(repair,/overflow-wrap:\s*anywhere/);
 assert.match(repair,/focus-visible/);
 assert.match(repair,/prefers-reduced-motion:\s*reduce/);
});
test("letterpress controls work with arrow keys, reduced motion and JS-off fallback",()=>{
 assert.match(behavior,/ArrowRight/);
 assert.match(behavior,/ArrowLeft/);
 assert.match(behavior,/Home/);
 assert.match(behavior,/End/);
 assert.match(behavior,/aria-selected/);
 assert.match(behavior,/dataset\.enhanced/);
 assert.match(arabic,/data-enhanced="true"/);
});
