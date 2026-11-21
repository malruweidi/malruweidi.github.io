"use strict";
const fs=require("node:fs");
const path=require("node:path");
(async()=>{
 const {chromium}=require("playwright-core");
 const output=path.resolve(process.env.BROWSER_QA_OUTPUT||"browser-qa-artifacts");
 fs.mkdirSync(output,{recursive:true});
 const executablePath=process.env.CHROME_PATH||"/usr/bin/chromium";
 const browser=await chromium.launch({executablePath,headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
 const report=[];
 try{
  for(const width of [390,1440]){
   const page=await browser.newPage({viewport:{width,height:900},reducedMotion:"reduce",deviceScaleFactor:1});
   const errors=[];page.on("pageerror",e=>errors.push(e.message));
   await page.goto((process.env.SITE_BASE_URL||"http://127.0.0.1:8765")+"/index.html",{waitUntil:"domcontentloaded",timeout:35000});
   await page.waitForTimeout(650);
   for(const [selector,name] of [[".rx-editorial-hero","hero"],["#rx-world-crossing","crossing"],["#rx-world-desk","desk"]]){
    const locator=page.locator(selector);
    if(await locator.count()!==1)throw Error(width+"px missing "+selector);
    await locator.scrollIntoViewIfNeeded();
    await locator.screenshot({path:path.join(output,"living-home-"+width+"-"+name+".png"),animations:"disabled",timeout:20000});
   }
   const unwanted=".family-drawer,.rx-hero-backstory,.rx-world-orbit-specimen,.rx-world-orbit-lens,.rx-world-hero-sample";
   if(await page.locator(unwanted).count())throw Error(width+"px rejected homepage panels still present");
   if(await page.locator(".rx-hero-portrait").count()!==1)throw Error(width+"px original portrait missing");
   if(await page.locator(".specimen-swim").count()!==1)throw Error(width+"px original zebrafish link missing");
   await page.locator('[data-world-step="2"]').click();
   const src=await page.locator(".rx-world-crossing-print img").getAttribute("src");
   if(!src?.endsWith("/figure-pulmonary-flow-chamber.jpg"))throw Error(width+"px study switch failed: "+src);
   if(await page.locator("#film .home-contact-sheet").count()!==0)throw Error(width+"px Find a scene is still inside film");
   if(await page.locator("#rx-world-desk .home-contact-sheet").count()!==1)throw Error(width+"px Find a scene missing from Things I Kept");
   if(await page.locator("#rx-world-desk .home-contact-sheet [data-film-time]").count()!==6)throw Error(width+"px documentary chapter links missing");
   if(await page.locator(".rx-world-desk-print").count()!==8)throw Error(width+"px expected eight unique archival photographs");
   if(await page.locator('.rx-world-desk-print img[src*="toy.webp"]').count())throw Error(width+"px repeated yellow-jacket image still in archive");
   if(await page.locator("#rx-world-desk-title").innerText()!=="Things I kept.")throw Error(width+"px archive heading still says three things");
   await page.locator("[data-desk-next]").click();
   const front=await page.locator('.rx-world-desk-print[data-front="true"]').getAttribute("data-desk-print");
   if(front!=="1")throw Error(width+"px photo desk did not advance");
   if(await page.locator(".rx-world-desk-count").innerText()!=="02 / 08")throw Error(width+"px archive count failed to update");

   await page.locator(".rx-world-manuscript-turn").click();
   if(!await page.locator(".rx-world-manuscript-reverse").isVisible())throw Error(width+"px manuscript didn't open");
   await page.locator(".rx-world-festival-trigger").click();
   if(!await page.locator("#rx-world-festival-image").isVisible())throw Error(width+"px historical photo didn't open");
   const dimensions=await page.evaluate(()=>({
    vw:innerWidth,
    documentWidth:Math.max(document.body.scrollWidth,document.documentElement.scrollWidth),
    imgErrors:[...document.querySelectorAll(".rx-world-crossing img,.rx-world-desk img")].filter(x=>x.complete&&!x.naturalWidth).map(x=>x.src)
   }));
   if(dimensions.documentWidth>width+5)throw Error(width+"px document overflow "+JSON.stringify(dimensions));
   if(dimensions.imgErrors.length)throw Error(width+"px missing media "+dimensions.imgErrors);
   if(errors.length)throw Error(width+"px page JS errors "+errors.join(" | "));
   if(width===390){
    await page.evaluate(()=>{document.documentElement.lang="ar";document.documentElement.dir="rtl";});
    const ar=page.locator("#rx-world-crossing-title [data-rxw-ar]");
    if(!await ar.isVisible())throw Error("Arabic translation not visible");
    await page.locator("#rx-world-crossing").screenshot({path:path.join(output,"living-home-390-arabic.png"),animations:"disabled"});
   }
   report.push({width,status:"passed",dimensions});
   console.log("LIVING HOME CHROME PASS "+width+" "+JSON.stringify(dimensions));
   await page.close();
  }
 }finally{await browser.close();fs.writeFileSync(path.join(output,"living-home-qa.json"),JSON.stringify(report,null,2));}
})().catch(err=>{console.error("LIVING HOME CHROME FAILURE",err.stack||err);process.exitCode=1;});
