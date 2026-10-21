#!/usr/bin/env node
"use strict";
/* Keyboard-only controls and 320 CSS-pixel reflow test. A 320px layout is a
 * 400%-zoom reflow proxy for a 1280px viewport, not an exact browser text-only
 * zoom or proof of screen-reader behavior. Original site files never change.
 */
const fs=require("node:fs"),path=require("node:path");
const KEYBOARD_ROUTES=[
 "/stories.html","/publications.html","/publication-cinema.html",
 "/search.html","/illness-and-evidence.html"
];
function focusReport({tag,visible,outline,focusMatches}){
 const failures=[];
 if(!visible)failures.push("not-visible");
 if(!focusMatches||!tag)failures.push("lost-focus");
 if(!outline||outline==="none")failures.push("focus-indicator-not-detectable");
 return failures;
}
module.exports={KEYBOARD_ROUTES,focusReport};
if(require.main===module)(async()=>{
 const {chromium}=require("playwright-core");
 const base=process.env.SITE_BASE_URL||"http://127.0.0.1:8765";
 const output=path.resolve(process.env.BROWSER_QA_OUTPUT||"browser-qa-artifacts");
 fs.mkdirSync(output,{recursive:true});
 const opt={headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]};
 if(process.env.CHROME_PATH)opt.executablePath=process.env.CHROME_PATH;
 else opt.channel="chrome";
 const browser=await chromium.launch(opt);
 const evidence=[],problems=[];
 const check=async(name,fn)=>{
  try{const detail=await fn();evidence.push({name,status:"PASS",detail})}
  catch(e){const msg=String(e?.message||e).slice(0,600);
   evidence.push({name,status:"FAIL",detail:msg});
   problems.push(name+": "+msg);
   process.stderr.write("[keyboard fail] "+name+": "+msg+"\n");
  }
 };
 try{
  const ctx=await browser.newContext({viewport:{width:320,height:800},reducedMotion:"reduce"});
  for(const route of KEYBOARD_ROUTES){
   await check("320 CSS-pixel reflow / "+route,async()=>{
    const page=await ctx.newPage();
    try{
     const r=await page.goto(base+route,{waitUntil:"domcontentloaded",timeout:30000});
     if(!r||r.status()>=400)throw Error("HTTP "+r?.status());
     await page.waitForTimeout(400);
     const result=await page.evaluate(()=>({width:innerWidth,
      pageWidth:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth),
      h1:document.querySelectorAll("h1").length,
      main:document.querySelectorAll("main").length}));
     if(result.pageWidth>result.width+5)throw Error("horizontal overflow "+JSON.stringify(result));
     if(result.main!==1||result.h1!==1)throw Error("missing main/H1 "+JSON.stringify(result));
     return result;
    }finally{await page.close()}
   });
  }
  const page=await ctx.newPage();
  await check("Stories skip-link keyboard focus and actual target",async()=>{
   await page.goto(base+"/stories.html",{waitUntil:"domcontentloaded"});
   const skip=page.locator("a.rx-skip-link").first();
   await skip.waitFor({state:"visible"});
   await skip.focus();
   const data=await skip.evaluate(el=>{
    const style=getComputedStyle(el),rect=el.getBoundingClientRect();
    return {tag:el.tagName,visible:rect.width>0&&rect.height>0,
      focusMatches:document.activeElement===el,outline:style.outlineStyle};
   });
   const errors=focusReport(data);
   if(errors.length)throw Error("Skip focus "+errors.join(",")+" "+JSON.stringify(data));
   await page.keyboard.press("Enter");
   if(!page.url().includes("#rx-content"))throw Error("Skip link failed to target main");
   return data;
  });
  await check("Explore opens and Escape returns focus to summary",async()=>{
   await page.goto(base+"/stories.html",{waitUntil:"domcontentloaded"});
   const trigger=page.locator(".rx-universal details.rx-more summary").first();
   await trigger.waitFor({state:"visible"});
   await trigger.focus();await page.keyboard.press("Enter");
   const container=page.locator(".rx-universal details.rx-more").first();
   if(!await container.evaluate(el=>el.open))throw Error("Explore did not open with keyboard");
   await page.keyboard.press("Escape");
   if(await container.evaluate(el=>el.open))throw Error("Explore remained open after Escape");
   if(!await trigger.evaluate(el=>document.activeElement===el))throw Error("Focus not returned to summary");
  });
  await check("Publications group button activates with Enter",async()=>{
   await page.goto(base+"/publications.html",{waitUntil:"domcontentloaded"});
   const container=page.locator(".pub-filters[role=group][aria-label='Filter by publication type']");
   if(await container.count()!==1)throw Error("Missing semantic publication filter group");
   const button=container.locator("button[data-pub-category='Original research']");
   await button.focus();await page.keyboard.press("Enter");
   if(await button.getAttribute("aria-pressed")!=="true")throw Error("Research filter not selected");
   if(!await button.evaluate(el=>document.activeElement===el))throw Error("Keyboard focus lost");
  });
  await check("Publication cinema group button activates with Enter",async()=>{
   await page.goto(base+"/publication-cinema.html",{waitUntil:"domcontentloaded"});
   const container=page.locator(".filters[role=group][aria-label='Filter the films']");
   if(await container.count()!==1)throw Error("Missing semantic film filter group");
   const button=container.locator("button[data-filter='Original research']");
   await button.focus();await page.keyboard.press("Enter");
   if(await button.getAttribute("aria-pressed")!=="true")throw Error("Films filter not selected");
   if(!await button.evaluate(el=>document.activeElement===el))throw Error("Keyboard focus lost");
  });
  await check("Arabic narrative language switches by keyboard without broken direction",async()=>{
   await page.goto(base+"/illness-and-evidence.html",{waitUntil:"domcontentloaded"});
   const button=page.locator("button[data-language=ar]");
   await button.focus();await page.keyboard.press("Enter");
   const d=await page.evaluate(()=>({dir:document.documentElement.dir,lang:document.documentElement.lang,
    width:innerWidth,documentWidth:document.documentElement.scrollWidth}));
   if(d.dir!=="rtl"||d.lang!=="ar")throw Error("Arabic language/dir missing "+JSON.stringify(d));
   if(d.documentWidth>d.width+5)throw Error("Arabic reflow overflow "+JSON.stringify(d));
   return d;
  });
  await page.close();await ctx.close();
 }finally{await browser.close()}
 const report={
  source:"Chrome/Playwright real DOM at 320px and keyboard-only controls",
  limitation:"Equivalent-width reflow proxy, not native 400% browser zoom or AT voice certification.",
  checks:evidence,blocking:problems};
 fs.writeFileSync(path.join(output,"keyboard-reflow-report.json"),JSON.stringify(report,null,2)+"\n");
 process.stdout.write("Keyboard/reflow checks: "+evidence.length+", failures: "+problems.length+"\n");
 if(problems.length)process.exitCode=1;
})().catch(e=>{process.stderr.write(String(e.stack||e)+"\n");process.exitCode=1});
