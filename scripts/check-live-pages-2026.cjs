#!/usr/bin/env node
"use strict";
/* Observe the published GitHub Pages site, independently of local build tests.
 * Read-only. Reports verified HTTP status and release sentinels; no indexing
 * of private records, no external CDN requests or user telemetry.
 */
const base="https://malruweidi.github.io";
const targets=[
 {path:"/",type:"text/html",tokens:['property="og:image:width" content="710"','property="og:image:height" content="960"','class="rx-hero-links"']},
 {path:"/stories.html",type:"text/html",tokens:["صورة شخصية أمام لوحة من الخط العربي، في مناسبة أخرى.","Stories Between the Experiments"]},
 {path:"/assets/site-enhancements.js",type:"javascript",tokens:["fallbackPortrait","research-portrait-calligraphy.webp"]},
 {path:"/assets/2026-10-13-new-photos/research-portrait-calligraphy.webp",type:"image/webp",tokens:[]}
];
(async()=>{
 let failures=0;
 for(const item of targets){
  const url=base+item.path+(item.path.includes("?")?"&":"?")+"audit="+Date.now();
  try{
   const res=await fetch(url,{signal:AbortSignal.timeout(12000),headers:{"Cache-Control":"no-cache"}});
   const mime=res.headers.get("content-type")||"";
   const body=item.tokens.length?await res.text():"";
   const missing=item.tokens.filter(t=>!body.includes(t));
   const good=res.status===200&&mime.includes(item.type)&&missing.length===0;
   if(!good)failures++;
   console.log(JSON.stringify({path:item.path,status:res.status,contentType:mime,missingSentinels:missing,pass:good}));
  }catch(err){
   failures++;
   console.error(JSON.stringify({path:item.path,pass:false,error:String(err)}));
  }
 }
 if(failures){console.error("Live-site verification failed for "+failures+" route(s)");process.exitCode=1;}
})().catch(err=>{console.error(err);process.exitCode=2;});
