#!/usr/bin/env node
"use strict";
/* Browser-based, preservation-first release inspection.
 * Real Chrome renders the checked-in HTML/CSS/media; this tool never rewrites
 * site content. On CI screenshots and reports are uploaded for human review.
 *
 * Local: npm install --no-save --no-package-lock playwright-core@1.56.1
 *        python3 -m http.server 8765 --bind 127.0.0.1 &
 *        node scripts/browser-release-qa-2026.cjs
 *
 * Actual image identity, film science/rights, perceptual aesthetics, screen
 * reader speech and narrated MP4 approval still need human inspection.
 */
const fs=require("node:fs"),path=require("node:path");
const VIEWPORTS=[
 {width:320,height:740},
 {width:375,height:812},
 {width:768,height:1024},
 {width:1024,height:768},
 {width:1440,height:900}
];
const ROUTES=[
 "/index.html","/stories.html","/archive.html","/research.html",
 "/evidence-viewer.html","/illness-and-evidence.html","/search.html",
 "/publication-cinema.html","/films/what-a-bubble-can-do.html","/cv.html"
];
function checkPageMetrics({route,width,documentWidth,mainCount,visibleH1}){
 const issues=[];
 if(documentWidth>width+5)issues.push({code:"horizontal-overflow",severity:"error",
  details:route+" @ "+width+"px: document scrolls "+(documentWidth-width)+"px beyond viewport"});
 if(mainCount!==1)issues.push({code:"missing-main",severity:"error",
  details:route+" @ "+width+"px: expected one main landmark; got "+mainCount});
 if(visibleH1!==1)issues.push({code:"missing-visible-h1",severity:"error",
  details:route+" @ "+width+"px: expected one visible H1; got "+visibleH1});
 return issues;
}
function linkIsLocal(url,base){
 try{return new URL(url,base).origin===new URL(base).origin}
 catch(_){return false}
}
function formatIssue(issue){return "["+issue.severity+"] "+issue.code+": "+issue.details}
module.exports={VIEWPORTS,ROUTES,checkPageMetrics,linkIsLocal,formatIssue};

if(require.main===module)(async()=>{
 const base=process.env.SITE_BASE_URL||"http://127.0.0.1:8765";
 const artifact=path.resolve(process.env.BROWSER_QA_OUTPUT||"browser-qa-artifacts");
 fs.mkdirSync(artifact,{recursive:true});
 const playwright=require("playwright-core");
 const launcher={headless:true,args:["--no-sandbox","--disable-dev-shm-usage","--mute-audio"]};
 if(process.env.CHROME_PATH)launcher.executablePath=process.env.CHROME_PATH;
 else launcher.channel="chrome";
 let browser,report={startedAt:new Date().toISOString(),site:base,viewports:VIEWPORTS,
  routes:ROUTES,checks:[],issues:[],warnings:[],screenshots:[],
  note:"Screenshots/DOM checks on the draft branch only. External CDN media availability and manual aesthetics/rights review are not certified."};
 function record(issue){report.issues.push(issue);process.stderr.write(formatIssue(issue)+"\n")}
 function warn(msg){report.warnings.push(msg);process.stderr.write("[advisory] "+msg+"\n")}
 async function runCheck(name,fn){
  try {const detail=await fn();report.checks.push({name,passed:true,detail:detail||"passed"})}
  catch(e){const msg=String(e?.message||e).slice(0,850);
   report.checks.push({name,passed:false,detail:msg});
   record({code:"interaction-check",severity:"error",details:name+": "+msg})}
 }
 try{
  browser=await playwright.chromium.launch(launcher);
  const selected=new Set(["/index.html","/stories.html","/archive.html",
   "/evidence-viewer.html","/illness-and-evidence.html",
   "/search.html","/publication-cinema.html"]);
  for(const viewport of VIEWPORTS){
   const context=await browser.newContext({
    viewport,screen:viewport,deviceScaleFactor:1,
    isMobile:viewport.width<=375,hasTouch:viewport.width<=375,
    reducedMotion:"reduce",serviceWorkers:"block",
    colorScheme:"light",acceptDownloads:false
   });
   for(const route of ROUTES){
    // All routes at three representative breakpoints; only key paths at 320/1024
    if((viewport.width===320||viewport.width===1024) &&
      !["/index.html","/stories.html","/archive.html","/research.html",
        "/illness-and-evidence.html","/search.html"].includes(route))continue;
    const page=await context.newPage();
    const pageErrors=[];
    page.on("pageerror",e=>pageErrors.push(String(e).slice(0,180)));
    const label=route.replace(/^\/|\.html$/g,"").replace(/\//g,"-")+"-"+viewport.width;
    try{
     const response=await page.goto(base+route,{waitUntil:"domcontentloaded",timeout:30000});
     if(!response||response.status()>=400)throw Error("document HTTP "+response?.status());
     await page.waitForTimeout(500);
     const result=await page.evaluate(()=>{
      const h1=[...document.querySelectorAll("h1")].filter(x=>{
       const r=x.getBoundingClientRect(),s=getComputedStyle(x);
       return r.width>0 && r.height>0 && s.visibility!=="hidden" && s.display!=="none";
      });
      const localImgs=[...document.images].filter(i=>i.currentSrc.startsWith(location.origin));
      const loaded=localImgs.filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.currentSrc);
      const visibleNav=[...document.querySelectorAll("a,button,summary")].filter(e=>{
       const r=e.getBoundingClientRect();
       return r.width>0&&r.height>0&&r.top>=0&&r.top<innerHeight;
      }).length;
      return {
       width:window.innerWidth,
       documentWidth:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth),
       mainCount:document.querySelectorAll("main").length,
       visibleH1:h1.length,
       localImageErrors:[...new Set(loaded)].slice(0,10),
       visibleControls:visibleNav,
       htmlLang:document.documentElement.lang,
       direction:document.documentElement.dir||getComputedStyle(document.documentElement).direction,
       title:document.title
      };
     });
     report.checks.push({name:label,passed:true,metrics:result,pageErrors});
     for(const issue of checkPageMetrics({route,width:result.width,documentWidth:result.documentWidth,
       mainCount:result.mainCount,visibleH1:result.visibleH1}))record(issue);
     if(result.localImageErrors.length)record({code:"local-image-not-loaded",severity:"error",
       details:label+": "+result.localImageErrors.join(", ")});
     if(pageErrors.length)warn(label+" JavaScript errors: "+pageErrors.join(" | "));
     if(selected.has(route)&&(viewport.width===375||viewport.width===1440)){
      const filename=label+".jpg";
      await page.screenshot({path:path.join(artifact,filename),type:"jpeg",
       quality:78,animations:"disabled",timeout:20000});
      report.screenshots.push(filename);
     }
    }catch(e){record({code:"render-failure",severity:"error",
      details:label+": "+String(e?.message||e).slice(0,350)})}
    await page.close();
   }
   await context.close();
  }
  const context=await browser.newContext({viewport:{width:375,height:812},reducedMotion:"reduce"});
  const page=await context.newPage();
  await runCheck("research hub mobile navigation exposes real destinations",async()=>{
   await page.goto(base+"/research.html",{waitUntil:"domcontentloaded"});
   // Canonical navigation uses a disclosure on mobile; hidden legacy links
   // are not a valid accessibility target.
   const explore=page.locator(".rx-universal details.rx-more > summary").first();
   await explore.waitFor({state:"visible",timeout:8000});
   await explore.click();
   const nav=page.locator(".rx-universal .rx-menu-panel a.rx-mobile-route[href='/stories.html']").first();
   await nav.waitFor({state:"visible",timeout:8000});
   if(!await nav.isVisible())throw Error("Stories link is not reachable on mobile");
   const url=await nav.getAttribute("href");
   if(url!=="/stories.html")throw Error("Unexpected destination: "+url);
  });
  await runCheck("Stories microscope visual link reaches its source chapter",async()=>{
   await page.goto(base+"/stories.html",{waitUntil:"domcontentloaded"});
   await page.locator("a.rx-story-route-image[href='#personal-microscope']").first().click();
   if(!page.url().includes("#personal-microscope"))throw Error("wrong chapter URL");
   if(await page.locator("#personal-microscope").count()!==1)throw Error("story target missing");
  });
  await runCheck("Arabic language toggle changes direction and readable labels",async()=>{
   await page.goto(base+"/illness-and-evidence.html",{waitUntil:"domcontentloaded"});
   await page.locator("button[data-language='ar']").click();
   const state=await page.evaluate(()=>({lang:document.documentElement.lang,
     dir:document.documentElement.dir,arabic:document.querySelectorAll("[lang='ar']").length}));
   if(state.lang!=="ar"||state.dir!=="rtl")throw Error("Arabic did not set html lang/dir: "+JSON.stringify(state));
   if(!state.arabic)throw Error("No Arabic content retained");
   const ar=await page.evaluate(()=>({inner:innerWidth,scroll:document.documentElement.scrollWidth}));
   if(ar.scroll>ar.inner+5)throw Error("Arabic layout overflows viewport: "+JSON.stringify(ar));
   const filename="illness-arabic-375.jpg";
   await page.screenshot({path:path.join(artifact,filename),type:"jpeg",quality:78,animations:"disabled"});
   report.screenshots.push(filename);
  });
  await runCheck("existing evidence-page Find link is not duplicated by discovery enhancement",async()=>{
   await page.goto(base+"/evidence-viewer.html",{waitUntil:"domcontentloaded"});
   const count=await page.locator(".ev-nav nav a[href='/search.html']").count();
   if(count!==1)throw Error("Expected one preserved Find link; found "+count);
  });
  await runCheck("Research search returns navigable results",async()=>{
   await page.goto(base+"/search.html",{waitUntil:"domcontentloaded"});
   const input=page.locator("#rx-search-input");
   await input.waitFor({state:"visible",timeout:8000});
   await input.fill("zebrafish");
   await page.waitForTimeout(800);
   const links=await page.locator("#rx-search-results a[href]").count();
   if(links===0)throw Error("No search links for zebrafish");
   return links+" result links";
  });
  await runCheck("Standalone movie exposes real video, poster and captions",async()=>{
   await page.goto(base+"/films/what-a-bubble-can-do.html",{waitUntil:"domcontentloaded"});
   const status=await page.locator("video").first().evaluate(async v=>{
    if(!v)return {error:"video missing"};
    const src=v.querySelector("source")?.getAttribute("src")||v.getAttribute("src");
    const tracks=v.querySelectorAll("track[kind='captions']").length;
    await new Promise(resolve=>{
     if(v.readyState>=1){resolve();return;}
     v.addEventListener("loadedmetadata",resolve,{once:true});
     v.addEventListener("error",resolve,{once:true});
     setTimeout(resolve,8500);
    });
    return {src,tracks,videoWidth:v.videoWidth,duration:v.duration,
      error:v.error?.message||null,poster:v.getAttribute("poster")};
   });
   if(!status.src||!status.poster||status.tracks<1)throw Error("video source/poster/caption incomplete: "+JSON.stringify(status));
   if(!Number.isFinite(status.duration)||status.duration<=0)throw Error("Chrome could not decode local MP4 metadata: "+JSON.stringify(status));
   // Two representative documentary frames for manual screening; a frame is
   // evidence of rendering, not approval of pacing, sound or scientific claims.
   for(const second of [1,30,60]){
    if(second>=status.duration-1)continue;
    try{
     await page.locator("video").first().evaluate(async(video,target)=>{
      await new Promise((resolve,reject)=>{
       const timeout=setTimeout(()=>reject(new Error("seek timeout")),6500);
       video.addEventListener("seeked",()=>{clearTimeout(timeout);resolve()},{once:true});
       video.currentTime=target;
      });
     },second);
     const shot="film-what-a-bubble-"+second+"s.jpg";
     await page.locator("video").first().screenshot({path:path.join(artifact,shot),type:"jpeg",quality:82,animations:"disabled"});
     report.screenshots.push(shot);
    }catch(e){warn("Film seek/frame preview at "+second+"s could not be captured: "+String(e.message||e).slice(0,200))}
   }
   return status;
  });
  await page.close();await context.close();
 }catch(e){record({code:"browser-setup",severity:"error",details:String(e?.stack||e).slice(0,1500)})}
 finally{
  try{await browser?.close()}catch(_){}
  report.finishedAt=new Date().toISOString();
  report.result=report.issues.filter(x=>x.severity==="error").length?"FAIL":"PASS";
  fs.writeFileSync(path.join(artifact,"report.json"),JSON.stringify(report,null,2)+"\n");
  const summary=[
   "# Browser QA — "+report.result,
   "Routes: "+ROUTES.length+"; widths: "+VIEWPORTS.map(v=>v.width).join(", "),
   "Checks completed: "+report.checks.length+"; screenshots: "+report.screenshots.length,
   "Blocking issues: "+report.issues.length+"; advisories: "+report.warnings.length,
   "",
   ...report.issues.map(formatIssue),
   "",
   "Images, page readability, video frames, rights and narration require human visual review."
  ].join("\n");
  fs.writeFileSync(path.join(artifact,"summary.md"),summary+"\n");
  process.stdout.write(summary+"\n");
  if(report.result==="FAIL")process.exitCode=1;
 }
})().catch(e=>{process.stderr.write(String(e.stack||e)+"\n");process.exitCode=1});
