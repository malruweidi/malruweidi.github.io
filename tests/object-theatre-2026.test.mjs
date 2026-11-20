import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const file=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const home=file("index.html");
const subpages=["research.html","publications.html","films.html","stories.html","writing.html","archive.html","methods-evidence.html","molecular-therapeutics.html","computing.html","imaging.html","training.html","grants.html","leadership.html","engagement.html","research-horizon.html","recommended-books.html","chem-squad.html","major-revisions.html"];
test("remove the generic homepage workbench without removing the original animations",()=>{
 assert.doesNotMatch(home,/src="\/assets\/ruwaidix-kinetic-objects-2026\.js/);
 assert.match(home,/ruwaidix-object-theatre-2026\.js/);
 assert.match(home,/ruwaidix-object-theatre-2026\.css/);
 assert.match(home,/class="specimen-swim"/);
 assert.match(home,/id="rx-moving-moments"/);
});
test("use an archival scientific exhibit in the full width hero, not a repeat of three cards",()=>{
 const js=file("assets/ruwaidix-object-theatre-2026.js");
 assert.match(js,/rx-theatre-workroom/);
 assert.match(js,/rx-hero-grid/);
 assert.match(js,/evidence-zebrafish\.webp/);
 assert.match(js,/microscopy-vacation-morning-2017\.webp/);
 assert.match(js,/aria-pressed/);
 assert.match(js,/Escape/);
 assert.match(js,/prefers-reduced-motion/);
});
test("each of 18 other pages has original kinetic content but not a widget rectangle",()=>{
 for(const page of subpages){const html=file(page);assert.match(html,/ruwaidix-object-theatre-2026\.css/);assert.match(html,/ruwaidix-object-theatre-2026\.js/);}
 const css=file("assets/ruwaidix-object-theatre-2026.css");
 assert.match(css,/\.rx-z-scene\s*\{/);
 assert.match(css,/background:transparent\s*!important/);
 assert.match(css,/border:0\s*!important/);
 assert.match(css,/float:inline-end/);
 assert.match(css,/@media\s*\(max-width:\s*650px\)/);
 assert.match(css,/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
 assert.match(css,/html\[lang="ar"\]/);
 assert.match(css,/\.rx-theatre-workroom/);
});
