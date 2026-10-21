#!/usr/bin/env node
"use strict";
/* Real WCAG automated checks on checked-in site, with only minimal reporting:
 * no source fragments, patient prose, raw HTML, personal photos, or media bytes.
 * Manual AT, Arabic reading order, audiovisual content and figure permissions
 * are outside what automated accessibility scanners can certify.
 */
const fs=require("node:fs"),path=require("node:path");
const AUDIT_ROUTES=[
 "/index.html","/stories.html","/archive.html","/research.html",
 "/publications.html","/evidence-viewer.html","/illness-and-evidence.html",
 "/search.html","/cv.html","/publication-cinema.html",
 "/films/what-a-bubble-can-do.html"
];
const VIEWPORTS=[{width:375,height:812},{width:1440,height:900}];
const TAGS=["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22aa"];
function asFinding(v,page,width,language){
 return {
  page,width,language,rule:String(v.id||"unknown"),impact:String(v.impact||"unknown"),
  help:String(v.help||"").slice(0,220),helpUrl:String(v.helpUrl||"").slice(0,300),
  affectedElements:(v.nodes||[]).length,
  targets:(v.nodes||[]).flatMap(n=>n.target||[]).map(String).slice(0,15)
 };
}
function uniqueFindings(arr){
 const keys=new Set();return arr.filter(x=>{
  const key=[x.page,x.width,x.language,x.rule,x.targets.join("|")].join(":");
  if(keys.has(key))return false;keys.add(key);return true;
 });
}
function resolvePolicy(findings,mode){
 if(!findings.length)return {status:"PASS",exitCode:0};
 if(mode==="release")return {status:"FAIL",exitCode:1};
 return {status:"ISSUES FOUND",exitCode:0};
}
module.exports={AUDIT_ROUTES,VIEWPORTS,asFinding,uniqueFindings,resolvePolicy,TAGS};
if(require.main===module)(async()=>{
 const playwright=require("playwright-core");
 const axePath=require.resolve("axe-core/axe.min.js");
 const base=process.env.SITE_BASE_URL||"http://127.0.0.1:8765";
 const out=path.resolve(process.env.ACCESSIBILITY_QA_OUTPUT||"accessibility-qa-artifacts");
 const mode=process.env.ACCESSIBILITY_QA_MODE==="release"?"release":"inventory";
 fs.mkdirSync(out,{recursive:true});
 const report={sourceCommit:process.env.GITHUB_SHA||"local",mode,
  startedAt:new Date().toISOString(),pages:[],findings:[],incomplete:[],
  browserFailures:[],note:"WCAG automated checks; not an accessibility certification or screen-reader/visual sign-off."};
 let browser;
 const launch={headless:true,args:["--no-sandbox","--disable-dev-shm-usage","--mute-audio"]};
 if(process.env.CHROME_PATH)launch.executablePath=process.env.CHROME_PATH;
 else launch.channel="chrome";
 async function runOne(context,route,language,action){
  const page=await context.newPage();
  try{
   const response=await page.goto(base+route,{waitUntil:"domcontentloaded",timeout:25000});
   if(!response||response.status()>=400)throw Error("Page returned HTTP "+response?.status());
   if(language==="ar"){
    if(route==="/illness-and-evidence.html")
     await page.locator('button[data-language="ar"]').click();
    else{
     await page.evaluate(()=>{
      document.documentElement.lang="ar";
      document.documentElement.dir="rtl";
     });
    }
   }
   if(action==="mobile-explore"){
    const trigger=page.locator(".rx-universal details.rx-more summary").first();
    await trigger.waitFor({state:"visible",timeout:8000});
    await trigger.click();
   }
   if(action==="search-results"){
    await page.locator("#rx-search-input").fill("zebrafish");
    await page.waitForTimeout(300);
   }
   await page.addScriptTag({path:axePath});
   const data=await page.evaluate(async tags=>{
    if(!window.axe?.run)throw Error("axe-core failed to inject into rendered page");
    const result=await window.axe.run(document,{runOnly:{type:"tag",values:tags}});
    return{
     violations:result.violations.map(x=>({
      id:x.id,impact:x.impact,help:x.help,helpUrl:x.helpUrl,
      nodes:x.nodes.map(n=>({target:n.target}))
     })),
     incomplete:result.incomplete.map(x=>({id:x.id,impact:x.impact,nodes:x.nodes.length})),
     contrastDiagnostics:[
      ".rx26-figures > figure > figcaption",
      "#rx16-diagnosis-photo > .rx16-heading > .rx16-kicker"
     ].map(selector=>{
      const e=document.querySelector(selector);
      if(!e)return {selector,present:false};
      const css=getComputedStyle(e),parent=getComputedStyle(e.parentElement);
      return {selector,present:true,color:css.color,
       background:css.backgroundColor,parentBackground:parent.backgroundColor,
       directPriority:e.style.getPropertyPriority("color"),
       stylesheetPresent:[...document.styleSheets].some(ss=>String(ss.href||"").includes("wcag-contrast-2026.css"))};
     }),
     passes:result.passes.length,testsTotal:result.violations.length+result.incomplete.length+result.passes.length
    };
   },TAGS);
   for(const x of data.violations)report.findings.push(asFinding(x,route,page.viewportSize()?.width||0,language));
   for(const x of data.incomplete)report.incomplete.push({
    page:route,width:page.viewportSize()?.width||0,language,
    rule:x.id,impact:x.impact,affectedElements:x.nodes
   });
   if(data.contrastDiagnostics.some(x=>x.present))report.contrastDiagnostics=(report.contrastDiagnostics||[]).concat(data.contrastDiagnostics.filter(x=>x.present).map(x=>({...x,route,language,width:page.viewportSize()?.width||0})));
   report.pages.push({route,width:page.viewportSize()?.width||0,language,
    action:action||"initial",passes:data.passes,violations:data.violations.length,
    incomplete:data.incomplete.length,testsTotal:data.testsTotal});
  }catch(e){
   report.browserFailures.push({route,language,action:action||"initial",details:String(e.message||e).slice(0,550)});
  }finally{await page.close()}
 }
 try{
  browser=await playwright.chromium.launch(launch);
  for(const viewport of VIEWPORTS){
   const ctx=await browser.newContext({viewport,reducedMotion:"reduce",colorScheme:"light",
    serviceWorkers:"block"});
   for(const route of AUDIT_ROUTES)await runOne(ctx,route,"en","");
   if(viewport.width===375){
    await runOne(ctx,"/stories.html","ar","");
    await runOne(ctx,"/illness-and-evidence.html","ar","");
    await runOne(ctx,"/stories.html","en","mobile-explore");
    await runOne(ctx,"/search.html","en","search-results");
   }
   await ctx.close();
  }
 }catch(e){report.browserFailures.push({route:"[browser]",details:String(e.stack||e).slice(0,650)})}
 finally{
  try{await browser?.close()}catch(_){}
  report.findings=uniqueFindings(report.findings);
  const policy=resolvePolicy(report.findings,mode);
  report.status=report.browserFailures.length?"FAIL":policy.status;
  report.completedAt=new Date().toISOString();
  report.screenReaderReview="NOT DONE";
  report.manualContrastReview="NOT DONE";
  fs.writeFileSync(path.join(out,"axe-report.json"),JSON.stringify(report,null,2)+"\n");
  const summary=[
   "# WCAG automated browser audit — "+report.status,
   "Mode: "+mode+"; pages/states scanned: "+report.pages.length,
   "Distinct rule findings: "+report.findings.length+"; needs manual determination: "+report.incomplete.length,
   "Browser execution errors: "+report.browserFailures.length,
   "",...report.findings.map(f=>"- "+f.impact+" "+f.rule+" | "+f.page+" "+f.width+"px "+f.language+
    " | "+f.affectedElements+" elements | "+f.targets.slice(0,2).join(", ")),
   "",...report.browserFailures.map(f=>"- Browser failure: "+f.route+" "+f.details),
   "",...(report.contrastDiagnostics||[]).map(d=>"- Computed text: "+d.route+" "+d.language+" "+d.width+"px "+d.selector+" "+d.color+" / "+d.background+" parent="+d.parentBackground+" local-important="+d.directPriority+" CSS="+d.stylesheetPresent),
   "", "No automatic WCAG scan verifies full accessibility, screen-reader behavior or clinical narrative comprehension."
  ].join("\n");
  fs.writeFileSync(path.join(out,"summary.md"),summary+"\n");
  process.stdout.write(summary+"\n");
  if(report.browserFailures.length||policy.exitCode)process.exitCode=1;
 }
})().catch(e=>{process.stderr.write(String(e.stack||e)+"\n");process.exitCode=1});
