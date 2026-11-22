import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const html=read("index.html");
const css=read("assets/microvascular-specimen-2026.css");
const js=read("assets/microvascular-specimen-2026.js");
const portraitStart=html.indexOf('<figure class="rx-hero-portrait">');
const portraitEnd=html.indexOf("</figure>",portraitStart);
const portrait=html.slice(portraitStart,portraitEnd);
const vesselStart=portrait.indexOf('<a class="rx-microvessel"');
const vesselEnd=portrait.indexOf("</a>",vesselStart);
const specimen=portrait.slice(vesselStart,vesselEnd+4);

test("single microvessel belongs to portrait, never the text column",()=>{
 assert.ok(portraitStart>0 && vesselStart>0);
 assert.equal((html.match(/class="rx-microvessel"/g)||[]).length,1);
 assert.match(portrait,/^<figure class="rx-hero-portrait">\s*<a class="rx-microvessel"/);
 assert.doesNotMatch(js,/insertBefore|appendChild|getBoundingClientRect|\.rx-pocket-note/);
 assert.doesNotMatch(css,/data-placement="inline"/);
 assert.match(css,/\.rx-hero-portrait\s*>\s*\.rx-microvessel/);
 assert.match(css,/position:absolute!important/);
 assert.match(css,/top:18px;left:-76px/);
 assert.match(css,/@media\(max-width:1199px\)/);
 assert.match(css,/@media\(max-width:480px\)/);
});
test("existing site elements remain intact",()=>{
 assert.match(html,/class="specimen-swim"/);
 assert.match(html,/id="rx-then-now-open"/);
 assert.match(html,/id="rx-kinetic-atlas"/);
 assert.match(html,/id="rx-moving-moments"/);
 assert.doesNotMatch(html,/rx-object-cabinet/);
 assert.match(html,/microvascular-specimen-2026\.css/);
 assert.match(html,/microvascular-specimen-2026\.js/);
 assert.match(specimen,/href="\/publication-cinema\.html#film-zebrafish-hemodynamics"/);
});
test("caption says hemodynamics, with no visible zebrafish wording",()=>{
 assert.match(specimen,/>Hemodynamics ↗</);
 assert.match(specimen,/>ديناميكا الدم ↗</);
 assert.doesNotMatch(specimen,/Zebrafish vessel flow|Zebrafish microvascular/);
});
test("seven distinguishable oval nucleated RBCs, inside a real filled clip path",()=>{
 assert.equal((specimen.match(/class="rx-erythrocyte"/g)||[]).length,7);
 assert.equal((specimen.match(/class="rx-erythrocyte-nucleus"/g)||[]).length,7);
 assert.equal((specimen.match(/class="rx-cell-disc"/g)||[]).length,7);
 const clip=specimen.match(/<clipPath id="rx-microvessel-lumen"[^>]*>([\s\S]*?)<\/clipPath>/);
 assert.ok(clip,"Lumen clip must exist");
 assert.match(clip[1],/fill="#fff"/);
 assert.doesNotMatch(clip[1],/fill="none"/);
 assert.match(specimen,/clip-path="url\(#rx-microvessel-lumen\)"/);
 assert.match(specimen,/id="rx-microvessel-track"/);
 assert.match(specimen,/title="Animated microvascular blood flow \(conceptual\)/);
 assert.doesNotMatch(specimen,/mmHg|τ_w|V.max/);
});
test("actual movement comes from SVG path geometry, not unsupported CSS offset-path",()=>{
 assert.doesNotMatch(css,/offset-path|offset-distance/);
 assert.match(js,/getTotalLength\(\)/);
 assert.match(js,/getPointAtLength\(/);
 assert.match(js,/requestAnimationFrame/);
 assert.match(js,/setAttribute\("transform"/);
 assert.match(js,/pointerenter/);
 assert.match(js,/factor=accelerated\?2\.4:1/);
 assert.match(js,/IntersectionObserver/);
 assert.match(js,/prefers-reduced-motion/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.doesNotMatch(js,/\bfetch\s*\(|AudioContext|\.play\(/);
 assert.doesNotThrow(()=>new vm.Script(js));
});
test("moving visible cells with an SVG-path animation frame",()=>{
 const positions=[];
 const cells=Array.from({length:7},(_,i)=>({
   dataset:{phase:String([.13,.255,.38,.505,.63,.755,.88][i])},
   setAttribute:(k,v)=>{if(k==="transform")positions[i]=v;}
 }));
 const len=300;
 const track={getTotalLength:()=>len,getPointAtLength:d=>({x:d*.85,y:61-Math.sin(d/len*Math.PI)*9})};
 const events={},queue=[];
 const vessel={
   dataset:{},querySelector:()=>({
     querySelector:()=>track,
     querySelectorAll:()=>cells
   }),setAttribute:()=>{},addEventListener:(n,fn)=>{events[n]=fn;},
   matches:()=>false
 };
 const root={dataset:{rxPage:"home"},lang:"en"};
 const doc={
   documentElement:root,
   hidden:false,
   querySelector:()=>vessel,
   addEventListener:()=>{}
 };
 const scripts={
   document:doc,
   window:{
     matchMedia:()=>({matches:false,addEventListener:()=>{}}),
     requestAnimationFrame:fn=>{queue.push(fn);return queue.length;},
     cancelAnimationFrame:()=>{},
     addEventListener:()=>{}
   },
   MutationObserver:undefined,
   IntersectionObserver:undefined,
   console
 };
 vm.runInNewContext(js,scripts);
 const baseline=[...positions];
 assert.equal(baseline.length,7);
 assert.ok(queue.length>0);
 queue.shift()(1000);
 queue.shift()(1140);
 assert.notDeepEqual(positions,baseline,"At least one RBC must translate along flow");
 assert.ok(positions.every(x=>/^translate\(/.test(x)));
 events.pointerenter();
 assert.equal(vessel.dataset.accelerated,"true");
 events.pointerleave();
 assert.equal(vessel.dataset.accelerated,"false");
});
