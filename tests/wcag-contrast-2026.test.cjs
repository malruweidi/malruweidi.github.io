"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
function linear(ch){const v=parseInt(ch,16)/255;return v<=0.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)}
function luminance(h){return .2126*linear(h.slice(1,3))+.7152*linear(h.slice(3,5))+.0722*linear(h.slice(5,7))}
function contrast(f,b){const a=luminance(f),c=luminance(b);return (Math.max(a,c)+.05)/(Math.min(a,c)+.05)}
test("contrast fixes are source-preserving opt-in CSS shared by the seven affected routes",()=>{
 const href='<link rel="stylesheet" href="/assets/wcag-contrast-2026.css?v=1">';
 for(const p of ["index.html","stories.html","archive.html","search.html",
 "illness-and-evidence.html","publication-cinema.html","films/what-a-bubble-can-do.html"]){
  const page=read(p);
  assert.ok(page.includes(href),"contrast audit CSS must be loaded on "+p);
  assert.ok(page.includes("<main"),"main unchanged on "+p);
 }
 const css=read("assets/wcag-contrast-2026.css");
 assert.match(css,/html\[data-rx-page="archive"\]/,"styles are page-scoped");
 for(const s of [".geo-source",".rx26-figures figure figcaption",
  ".rx-freshman-archive-inner > .mini",".rx-result-category",
  ".rx16-kicker","#count",".rx-series-kicker"]){
  assert.ok(css.includes(s),"source-specified accessibility selector "+s);
 }
 assert.doesNotMatch(css,/@import|display\s*:\s*none|visibility\s*:\s*hidden|font-size\s*:/i);
});
test("audited text colors achieve at least 4.5:1 against measured light backgrounds",()=>{
 for(const [fg,bg] of [
  ["#87412f","#f6f3eb"],["#864a35","#e8eee6"],["#465b56","#f6f3eb"],
  ["#435e60","#e3e8e1"],["#465b56","#f7f5ee"],
  ["#355653","#ecf0e8"],["#87412f","#edf0e9"],["#87412f","#f4f1e9"],
  ["#465b56","#f5f3ea"],["#7c4232","#e6ece5"],
  ["#465b56","#f7f5ee"],["#87412f","#f7f5ee"]]){
  assert.ok(contrast(fg,bg)>=4.5,fg+" / "+bg+" is too faint");
 }
});
