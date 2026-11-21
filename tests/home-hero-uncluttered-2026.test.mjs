import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("homepage does not render the rejected Family Album or How I got here panels",()=>{
 const html=read("index.html");
 assert.doesNotMatch(html,/<details\s+class="family-drawer"\s+id="family-album"/);
 assert.doesNotMatch(html,/<details\s+class="rx-hero-backstory"/);
 assert.doesNotMatch(html,/<summary>How I got here<\/summary>/);
 assert.doesNotMatch(html,/src="\/assets\/photo-drawer\.js"/);
 assert.match(html,/class="rx-hero-readmore"/);
});
test("no chemistry reagent or View a Specimen overlays are injected into portrait",()=>{
 const js=read("assets/ruwaidix-home-world-2026.js");
 assert.doesNotMatch(js,/rx-world-orbit-specimen|rx-world-orbit-lens|rx-world-hero-sample/);
 assert.doesNotMatch(js,/pyridine-4-carboxaldehyde-reagent-front-2018/);
 assert.doesNotMatch(js,/VIEW A SPECIMEN/);
 assert.match(js,/rx-world-crossing/);
 assert.match(js,/rx-world-desk/);
 const css=read("assets/ruwaidix-home-world-2026.css");
 assert.doesNotMatch(css,/\.rx-world-orbit-specimen\s*\{|\.rx-world-orbit-lens\s*\{/);
});
test("the original hero, scientific references, and personal photographs remain accessible",()=>{
 const html=read("index.html");
 for(const key of ['class="rx-hero-portrait"','class="specimen-swim"','id="rx-moving-moments"','id="film"','id="research-workbench"']) assert.ok(html.includes(key),key);
 const js=read("assets/ruwaidix-home-world-2026.js");
 assert.match(js,/figure-zebrafish-microscopy\.jpg/);
 assert.match(js,/figure-pulmonary-flow-chamber\.jpg/);
 assert.match(html,/personal-archive\/suspenders\.webp/);
 assert.doesNotMatch(html,/personal-archive\/toy\.webp/);
 assert.match(html,/href="\/stories\.html"/);
});
