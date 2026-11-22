import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const fromRoot=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const html=fromRoot("index.html");
const css=fromRoot("assets/microvascular-specimen-2026.css");
const js=fromRoot("assets/microvascular-specimen-2026.js");

test("single small vascular specimen within original homepage hero, not a new gallery",()=>{
 assert.equal((html.match(/class="rx-microvessel"/g)||[]).length,1);
 assert.ok(html.includes('class="specimen-swim"'),"original zebrafish must stay");
 assert.ok(html.includes('id="rx-then-now-open"'),"childhood photo must stay");
 assert.ok(html.includes('id="rx-kinetic-atlas"'),"existing studies must stay");
 assert.ok(!html.includes("rx-object-cabinet"),"old gallery must not return");
 assert.match(html,/microvascular-specimen-2026\.css/);
 assert.match(html,/microvascular-specimen-2026\.js/);
 assert.match(html,/href="\/research\/high-speed-zebrafish-imaging\.html"/);
});
test("biologically defensible microvessel",()=>{
 assert.match(html,/Microvascular flow/);
 assert.match(html,/Conceptual illustration/);
 assert.match(html,/clipPath id="rx-microvessel-lumen"/);
 assert.match(html,/class="rx-erythrocyte/);
 assert.match(html,/rx-vessel-inner/);
 assert.match(css,/rx-flow-transit/);
 assert.match(css,/--travel-time/);
 assert.match(css,/prefers-reduced-motion:\s*reduce/);
 assert.doesNotMatch(html,/V.max|τ_w|mmHg|1-3 Pa/);
});
test("smart hero placement avoids headline and portrait collisions",()=>{
 assert.match(js,/getBoundingClientRect\(\)/);
 assert.match(js,/specimen-swim/);
 assert.match(js,/rx-hero-portrait/);
 assert.match(js,/rx-hero-title/);
 assert.match(js,/rx-hero-kicker/);
 assert.match(js,/intersects/);
 assert.match(js,/appendChild/);
 assert.match(js,/resize/);
 assert.match(css,/position:\s*absolute/);
 assert.match(css,/max-width:\s*900px/);
 assert.match(css,/min-width:\s*1200px/);
});
test("no sound, third-party requests or forced autoplay media",()=>{
 assert.doesNotMatch(js,/\bfetch\s*\(|AudioContext|<iframe|\.play\(/i);
 assert.match(js,/IntersectionObserver/);
 assert.match(js,/matchMedia/);
 assert.match(html,/aria-label="[^"]*vascular[^"]*"/i);
});