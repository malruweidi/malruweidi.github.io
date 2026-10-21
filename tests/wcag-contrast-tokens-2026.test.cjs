"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(root,f),"utf8");
const pages=["index.html","stories.html","archive.html","search.html",
 "illness-and-evidence.html","publication-cinema.html","films/what-a-bubble-can-do.html"];
function lum(hex){const c=hex.slice(1).match(/.{2}/g).map(x=>parseInt(x,16)/255);
 const [r,g,b]=c.map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*r+.7152*g+.0722*b;}
function contrast(a,b){let x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
test("contrast corrections only add a scoped stylesheet to seven affected pages",()=>{
 for(const page of pages)assert.match(read(page),/<link rel="stylesheet" href="\/assets\/wcag-contrast-2026.css\?v=1">/);
 const css=read("assets/wcag-contrast-2026.css");
 for(const scope of ["home","stories","archive","discovery","illness-evidence","publication-cinema","film"])
  assert.ok(css.includes('[data-rx-page="'+scope+'"]'),scope);
 assert.doesNotMatch(css,/@import|display:\s*none|visibility:\s*hidden/);
});
test("new restrained copper and pine labels meet WCAG 4.5:1 on all documented original paper backgrounds",()=>{
 const pairs=[
 ["#87412f","#f4f1e9"],["#87412f","#edf0e9"],
 ["#864a35","#e8eee6"],["#465b56","#f6f3eb"],
 ["#435e60","#e3e8e1"],["#355653","#ecf0e8"],
 ["#465b56","#f5f3ea"],["#884a33","#f5f2e9"],
 ["#87412f","#f7f5ee"],["#465b56","#f7f5ee"],
 ["#7c4232","#e6ece5"],["#884a33","#f0eee5"]
 ];
 for(const [fg,bg] of pairs)assert.ok(contrast(fg,bg)>=4.5,fg+" against "+bg+" = "+contrast(fg,bg).toFixed(2));
});

test("dynamic figure captions and both Arabic timelines keep the readable pine/copper contrast",()=>{
 const css=read("assets/wcag-contrast-2026.css");
 for(const selector of ['.rx26-figures > figure > figcaption',
   '#rx16-diagnosis-photo > .rx16-heading > .rx16-kicker',
   '.sequence.ar article small',
   '.narrative > .side > span']){
   assert.ok(css.includes(selector),"missing dynamic accessibility selector "+selector);
 }
 assert.match(css,/html\[data-rx-page="stories"\][\s\S]*?figcaption\s*\{\s*color:\s*#435e60\s*!important/);
});

test("dynamic scientific captions and early medical photo labels cannot fade their measured color",()=>{
 const css=read("assets/wcag-contrast-2026.css");
 assert.match(css,/\.rx26-figures\s*>\s*figure\s*>\s*figcaption\s*\{[^}]*opacity:\s*1\s*!important/s);
 assert.match(css,/#rx16-diagnosis-photo\s*>\s*\.rx16-heading\s*>\s*\.rx16-kicker[\s\S]*?\{[^}]*opacity:\s*1\s*!important/);
});
