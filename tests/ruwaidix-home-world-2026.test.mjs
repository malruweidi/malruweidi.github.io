import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read = p => readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("home owns a single immersive experience instead of three overlapping generative layers",()=>{
 const home=read("index.html");
 assert.match(home,/ruwaidix-home-world-2026\.js/);
 assert.match(home,/ruwaidix-home-world-2026\.css/);
 assert.doesNotMatch(home,/src="\/assets\/ruwaidix-object-theatre-2026\.js/);
 assert.doesNotMatch(home,/src="\/assets\/ruwaidix-kinetic-atlas-2026\.js/);
 assert.doesNotMatch(home,/src="\/assets\/ruwaidix-kinetic-objects-2026\.js/);
 for(const id of ['id="rx-moving-moments"','id="research-workbench"','class="specimen-swim"','class="rx-hero-portrait"','id="film"','id="history"','id="writing"'])assert.ok(home.includes(id),id);
});
test("scientific dramaturgy uses linked original evidence without altering research images",()=>{
 const js=read("assets/ruwaidix-home-world-2026.js");
 for(const src of [
  "/assets/home-archive/figure-cyanide-sensor.jpg",
  "/assets/home-archive/figure-zebrafish-microscopy.jpg",
  "/assets/home-archive/figure-pulmonary-flow-chamber.jpg",
  "/assets/niosomes-concept.svg",
  "/assets/personal-archive/toy.webp",
  "/assets/owner-archive-2026-10-17/grade10-chemistry-festival-aref-elahmad.webp"
 ])assert.ok(js.includes(src),src);
 assert.match(js,/Concept illustration/);
 assert.match(js,/aria-live="polite"/);
 assert.match(js,/pointermove/);
 assert.match(js,/pointerdown/);
});
test("homepage has multiple meaningfully different interactive environments",()=>{
 const js=read("assets/ruwaidix-home-world-2026.js");
 for(const scene of ["rx-world-crossing","rx-world-desk","rx-world-manuscript","rx-world-festival"])assert.ok(js.includes(scene),scene);
 assert.doesNotMatch(js,/rx-world-orbit-specimen|rx-world-orbit-lens|rx-world-hero-sample/);
 assert.match(js,/aria-pressed/);
 assert.match(js,/Escape/);
 assert.match(js,/scrollIntoView|IntersectionObserver/);
});
test("language, mobile, reduced motion and keyboard experience survive",()=>{
 const css=read("assets/ruwaidix-home-world-2026.css");
 const js=read("assets/ruwaidix-home-world-2026.js");
 assert.match(css,/@media\s*\(max-width:\s*650px\)/);
 assert.match(css,/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
 assert.match(css,/html\[lang="ar"\]/);
 assert.match(css,/:focus-visible/);
 assert.match(css,/overflow-x:\s*clip/);
 assert.match(js,/prefers-reduced-motion/);
 assert.match(js,/data-rxw-en/);
 assert.match(js,/data-rxw-ar/);
});

test("new experiences are outside the closed complete-record archive",()=>{
 const js=read("assets/ruwaidix-home-world-2026.js");
 assert.match(js,/const directory=\$\("#rx26-portal"\)/);
 assert.match(js,/const moments=\$\("#rx-moving-moments"\)/);
 assert.match(js,/const complete=\$\("#rx-home-complete-record"\)/);
 assert.match(js,/complete\.insertAdjacentElement\("beforebegin",bridge\)/);
 assert.match(js,/rx-world-archive-bridge-cards/);
 const css=read("assets/ruwaidix-home-world-2026.css");
 assert.match(css,/\.rx-world-archive-bridge-cards\{/);
});
