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
 assert.match(js,/portrait\.insertBefore\(vessel,portrait\.firstChild\)/);
 assert.doesNotMatch(js,/getBoundingClientRect|\.rx-pocket-note/);
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
 const svg={querySelector:(selector)=>selector==="#rx-microvessel-track"?track:
   selector==="#rx-microvessel-lumen path"?{getAttribute:()=>"#fff"}:null,
   querySelectorAll:()=>cells};
 const events={},queue=[];
 const portrait={firstChild:null};
 const vessel={
   parentElement:portrait,dataset:{},
   querySelector:selector=>selector==="svg"?svg:null,
   setAttribute:()=>{},removeAttribute:()=>{},
   addEventListener:(n,fn)=>{events[n]=fn;},matches:()=>false
 };
 const root={dataset:{rxPage:"home"},lang:"en"};
 const doc={
   documentElement:root,hidden:false,
   querySelector:selector=>selector===".rx-hero-portrait"?portrait:vessel,
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


test("cached legacy layout is moved out of text and missing filled clip repaired",()=>{
 const positions=[],queue=[],changes={},labels={en:{textContent:"Zebrafish vessel flow ↗"},ar:{textContent:"التدفق الوعائي المجهري ↗"}};
 const cellParts=Array.from({length:8},(_,i)=>({
   dataset:{},style:{setProperty:(k,v)=>{changes[k]=v}},
   setAttribute:(k,v)=>{if(k==="transform")positions[i]=v;}
 }));
 const clip={
   values:{fill:"none"},
   getAttribute(k){return this.values[k];},
   setAttribute(k,v){this.values[k]=v;},
   removeAttribute(k){delete this.values[k];}
 };
 let addedTrack=null;
 const trackObject={
   getTotalLength:()=>300,
   getPointAtLength:d=>({x:d*.82,y:62-Math.sin(d/300*Math.PI)*12}),
   setAttribute:(k,v)=>{addedTrack=addedTrack||{};addedTrack[k]=v;}
 };
 const defs={appendChild(node){addedTrack=node;}};
 const svg={
   querySelector(selector){
     if(selector==="#rx-microvessel-lumen path")return clip;
     if(selector==="#rx-microvessel-track")return addedTrack;
     if(selector==="defs")return defs;
     return null;
   },
   querySelectorAll:()=>cellParts
 };
 const portrait={firstChild:null,insertBefore(node){node.parentElement=this;}};
 const legacyParent={};
 const vessel={
   parentElement:legacyParent,dataset:{},style:{},
   querySelector(selector){
     if(selector==="svg")return svg;
     if(selector===".rx-microvessel-label [lang=en]")return labels.en;
     if(selector===".rx-microvessel-label [lang=ar]")return labels.ar;
     return null;
   },
   removeAttribute:()=>{},
   setAttribute:()=>{},
   addEventListener:()=>{},
   matches:()=>false
 };
 const doc={
   documentElement:{dataset:{rxPage:"home"},lang:"en"},
   hidden:false,head:{appendChild(node){this.injected=node;}},
   createElement:()=>({}),
   createElementNS:()=>trackObject,
   querySelector:selector=>selector===".rx-hero-portrait"?portrait:vessel,
   addEventListener:()=>{}
 };
 const browser={
   matchMedia:()=>({matches:false,addEventListener:()=>{}}),
   requestAnimationFrame:fn=>{queue.push(fn);return queue.length;},
   cancelAnimationFrame:()=>{},
   addEventListener:()=>{}
 };
 vm.runInNewContext(js,{
   document:doc,window:browser,
   MutationObserver:undefined,IntersectionObserver:undefined
 });
 assert.equal(vessel.parentElement,portrait,"legacy vessel must leave the text column");
 assert.ok(doc.head.injected?.textContent?.includes("left:-76px"));
 assert.equal(labels.en.textContent,"Hemodynamics ↗");
 assert.equal(labels.ar.textContent,"ديناميكا الدم ↗");
 assert.equal(clip.getAttribute("fill"),"#fff");
 assert.ok(!Object.hasOwn(clip.values,"stroke"));
 assert.ok(addedTrack);
 assert.ok(cellParts.every(c=>c.dataset.phase));
 assert.equal(changes["offset-path"],"none");
 assert.equal(changes["animation"],"none");
 assert.equal(positions.length,8);
 queue.shift()(1000);
 queue.shift()(1140);
 assert.ok(positions.some(Boolean));
});

test("asset URLs are fingerprinted to bypass stale hemodynamics files",()=>{
 assert.match(html,/microvascular-specimen-2026\.css\?v=20261123-portrait-c/);
 assert.match(html,/microvascular-specimen-2026\.js\?v=20261123-portrait-c/);
 assert.match(specimen,/data-version="portrait-20261123-c"/);
});
