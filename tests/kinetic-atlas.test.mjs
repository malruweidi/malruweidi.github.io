import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = path => readFileSync(join(root,path),"utf8");
const html = read("index.html");
const data = read("assets/kinetic-atlas-data-2026.js");
const svg = read("assets/kinetic-atlas-draw-2026.js");
const controller = read("assets/kinetic-atlas-ui-2026.js");
const css = read("assets/kinetic-atlas-2026.css");
const context = {};
runInNewContext(data,context);
runInNewContext(svg,context);
const {items,groups} = context.RuwaidixAtlasData;
const {draw} = context.RuwaidixAtlasDraw;

test("exactly thirty unique, fully bilingual experiences in six balanced chapters",()=>{
  assert.equal(items.length,30);
  assert.equal(groups.length,6);
  assert.equal(new Set(items.map(e=>e[0])).size,30);
  for(const group of groups)assert.equal(items.filter(e=>e[1]===group[0]).length,5);
  for(const e of items){
    assert.equal(e.length,9,e[0]);
    assert.ok(e[2]&&e[3]&&e[4]&&e[5]&&e[6]&&e[7],e[0]);
    assert.match(e[3],/[\u0600-\u06ff]/);
    assert.match(e[5],/[\u0600-\u06ff]/);
    assert.ok(e[8].startsWith("/")&&!e[8].startsWith("//"),e[0]);
    assert.ok(existsSync(join(root,e[8].slice(1))),"Missing related work: "+e[8]);
  }
});

test("every scene renders deterministic, bounded, visibly responsive SVG",()=>{
  for(const entry of items){
    const id=entry[0];
    const states=[0,.25,.5,.75,1].map(p=>draw(id,p));
    assert.equal(new Set(states).size>1,true,"No visible response: "+id);
    assert.equal(draw(id,.5),draw(id,.5),"Non-deterministic drawing: "+id);
    for(const state of states){
      assert.match(state,/^<svg /,id);
      assert.match(state,/<\/svg>$/,id);
      assert.doesNotMatch(state,/NaN|Infinity|undefined|<script|onload=/i,id);
    }
    assert.equal(draw(id,-5),draw(id,0),"Control lower bound: "+id);
    assert.equal(draw(id,6),draw(id,1),"Control upper bound: "+id);
  }
});

test("homepage preserves existing content and loads atlas dependencies in order",()=>{
  const imports=[
    "kinetic-atlas-2026.css",
    "kinetic-atlas-data-2026.js",
    "kinetic-atlas-draw-2026.js",
    "kinetic-atlas-ui-2026.js"
  ];
  let last=-1;
  for(const name of imports){
    const at=html.indexOf(name);
    assert.ok(at>last,"Missing or out-of-order resource "+name);
    last=at;
  }
  assert.match(html,/id="research-workbench"/);
  assert.match(html,/id="rx-moving-moments"/);
  assert.match(html,/id="rx-then-now-open"/);
  assert.match(html,/id="rx-feature-film"/);
  assert.match(html,/id="rx-home-complete-record"/);
  assert.doesNotMatch(html,/agarose[\u2013-]paraffin|أجاروز|البارافين/i,
    "Withdrawn incident must never be attributed to the author on the homepage");
});

test("accessibility, consent for motion and scientific boundaries are explicit",()=>{
  assert.match(controller,/aria-pressed/);
  assert.match(controller,/type="range"/);
  assert.match(controller,/visibilitychange/);
  assert.match(controller,/IntersectionObserver/);
  assert.match(controller,/prefers-reduced-motion/);
  assert.match(controller,/MutationObserver/);
  assert.match(controller,/aria-label/);
  assert.match(controller,/normalized for illustration/);
  assert.match(css,/prefers-reduced-motion/);
  assert.match(css,/@media\(max-width:560px\)/);
  for(const source of [data,svg,controller,css])
    assert.doesNotMatch(source,/agarose|paraffin|أجاروز|بارافين/i);
});


test("nine chapter cards acquire distinct, topic-specific visual specimens", () => {
  const mini = read("assets/kinetic-chapter-cards-2026.js");
  const miniCss = read("assets/kinetic-chapter-cards-2026.css");
  const pairPattern = /"(\/[^"]+\.html)": "([a-z0-9-]+)"/g;
  const pairs = Array.from(mini.matchAll(pairPattern));
  assert.equal(pairs.length,9);
  assert.equal(new Set(pairs.map(pair => pair[1])).size,9);
  assert.equal(new Set(pairs.map(pair => pair[2])).size,9);
  for(const [,page,scene] of pairs){
    assert.ok(items.some(item=>item[0]===scene),scene);
    assert.ok(html.includes('class="rx26-portal-card" href="'+page+'"'),page);
  }
  assert.match(mini,/prefers-reduced-motion/);
  assert.match(mini,/pointerenter/);
  assert.match(mini,/pointerleave/);
  assert.match(mini,/focusin/);
  assert.match(mini,/visibilitychange/);
  assert.match(mini,/rx-card-focus-/);
  assert.match(miniCss,/@media\(prefers-reduced-motion:reduce\)/);
  assert.ok(html.includes("kinetic-chapter-cards-2026.js"));
  assert.ok(html.includes("kinetic-chapter-cards-2026.css"));
});

test("all scenes support shareable deep links and six guided scientific discoveries",()=>{
  for(const scene of ["indicator","bilayer","meniscus","zebrafish","focus","manuscript"])
    assert.ok(items.some(e=>e[0]===scene),"Missing guided scene "+scene);
  assert.match(controller,/requestedScene\(\)/);
  assert.match(controller,/new URL\(window\.location\.href\)/);
  assert.match(controller,/searchParams\.set\("atlas",id\)/);
  assert.match(controller,/window\.history\.replaceState/);
  assert.match(controller,/navigator\.clipboard\.writeText/);
  assert.match(controller,/rx-atlas-guided/);
  assert.match(controller,/rx-atlas-copy-status/);
  assert.match(html,/id="rx-kinetic-atlas"/);
  assert.match(html,/href="#rx-kinetic-atlas"/);
  assert.match(css,/\.rx-atlas-guided\{/);
  assert.match(css,/\.rx-atlas-related\{/);
});
