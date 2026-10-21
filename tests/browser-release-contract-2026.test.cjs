"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const {
  VIEWPORTS,ROUTES,checkPageMetrics,linkIsLocal,formatIssue
}=require("../scripts/browser-release-qa-2026.cjs");

test("real-browser release review covers five viewport widths and all essential editorial routes",()=>{
 assert.deepEqual(VIEWPORTS.map(v=>v.width),[320,375,768,1024,1440]);
 for(const route of ["/index.html","/stories.html","/archive.html","/research.html",
 "/evidence-viewer.html","/illness-and-evidence.html","/search.html",
 "/publication-cinema.html","/films/what-a-bubble-can-do.html"]){
  assert.ok(ROUTES.includes(route),route);
 }
});

test("browser QA fails meaningful horizontal overflow and missing accessible main, not harmless scrollbars",()=>{
 assert.deepEqual(checkPageMetrics({route:"/stories.html",width:375,documentWidth:376,mainCount:1,visibleH1:1}),[]);
 const overflow=checkPageMetrics({route:"/stories.html",width:375,documentWidth:394,mainCount:1,visibleH1:1});
 assert.ok(overflow.some(x=>x.code==="horizontal-overflow" && x.severity==="error"));
 const missing=checkPageMetrics({route:"/stories.html",width:375,documentWidth:375,mainCount:0,visibleH1:0});
 assert.ok(missing.some(x=>x.code==="missing-main"));
 assert.ok(missing.some(x=>x.code==="missing-visible-h1"));
});

test("browser QA discriminates same-origin local media from remote originals",()=>{
 assert.equal(linkIsLocal("http://127.0.0.1:8765/assets/ruwaidix-approved.webp","http://127.0.0.1:8765"),true);
 assert.equal(linkIsLocal("https://cdn.creativeclaw.co/photo.jpg","http://127.0.0.1:8765"),false);
 assert.equal(linkIsLocal("data:image/png;base64,aGVsbG8=","http://127.0.0.1:8765"),false);
 assert.ok(formatIssue({code:"horizontal-overflow",severity:"error",details:"20 px"}).includes("horizontal-overflow"));
});
