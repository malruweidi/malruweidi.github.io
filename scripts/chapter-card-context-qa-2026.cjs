/* Chapter-cover placement QA: cards are photographs, not miniature atlas stages.
 * Controlled Chrome screenshots at 390, 768 and 1200 CSS pixels. */
"use strict";
const {chromium}=require("playwright-core");
const fs=require("node:fs");
const path=require("node:path");
const output=process.env.BROWSER_QA_OUTPUT||"browser-qa-artifacts";
const site=process.env.SITE_BASE_URL||"http://127.0.0.1:8765";
fs.mkdirSync(output,{recursive:true});
const failures=[];
const runs=[];
const chapters=["research","publications","films","stories","illness-and-evidence","writing","chem-squad","leadership","major-revisions"];

(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||"/usr/bin/chromium",args:["--no-sandbox","--disable-dev-shm-usage"]});
 try{
  for(const width of [390,768,1200]){
   const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1});
   try{
    await page.goto(site+"/index.html",{waitUntil:"domcontentloaded",timeout:45000});
    await page.locator("#rx26-portal .rx-cover-catalogue > a.rx26-portal-card").first().waitFor({timeout:15000});
    await page.evaluate(()=>document.fonts.ready);
    const result=await page.evaluate(()=>{
      const cards=[...document.querySelectorAll("#rx26-portal .rx26-portal-card")];
      const asRect=node=>{const r=node.getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,height:r.height}};
      return {
       cards:cards.length,
       paths:cards.map(x=>new URL(x.href).pathname.slice(1)),
       photos:cards.filter(x=>x.querySelector(".rx-cover-art img")).length,
       attachedOverlays:cards.filter(x=>x.querySelector(".rx-card-kinetic,.rx-card-kinetic-art,.rx-card-kinetic-label")).length,
       headerSvg:cards.filter(x=>x.querySelector(".rx26-card-top svg")).length,
       statuses:[...document.querySelectorAll("#rx26-portal .rx-cover-count")].map(x=>x.innerText.trim()),
       labelVsPhoto:cards.slice(0,2).map(x=>({
         label:asRect(x.querySelector(".rx26-card-top")),
         photo:asRect(x.querySelector(".rx-cover-art"))
       })),
       overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+2,
      };
    });
    const fail=(msg)=>failures.push(width+"px: "+msg);
    if(result.cards!==9)fail("Expected 9 cards, got "+result.cards);
    if(result.photos!==9)fail("Expected 9 original cover photographs, got "+result.photos);
    if(result.attachedOverlays!==0||result.headerSvg!==0)fail("Unexpected decorative animated chapter overlay");
    if(!result.paths.every((x,i)=>x===chapters[i]+".html"))fail("Chapter destinations changed: "+result.paths.join(", "));
    if(result.statuses[0]!=="9 collections")fail("Confusing collection label: "+result.statuses.join(", "));
    if(result.overflow)fail("Horizontal overflow");
    for(const pair of result.labelVsPhoto)
      if(pair.label.bottom>pair.photo.top+2)fail("Header overlaps original image");
    const first=page.locator("#rx26-portal .rx26-portal-card").first();
    await first.scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(output,"chapter-covers-"+width+".png"),animations:"disabled"});
    // Filter must explain total, not pretend to count through a gallery.
    await page.locator("#rx26-portal .rx-cover-controls button").nth(1).click();
    const filtered=(await page.locator("#rx26-portal .rx-cover-count").innerText()).trim();
    if(!/collections shown · 9 total/.test(filtered))fail("Filtered count unclear: "+filtered);
    runs.push({width,result,filtered});
   }catch(e){failures.push(width+"px: "+e.message)}
   finally{await page.close()}
  }
 }finally{await browser.close()}
 fs.writeFileSync(path.join(output,"chapter-card-placement.json"),JSON.stringify({runs,failures},null,2));
 if(failures.length){console.error("Chapter photographic placement FAIL\n"+failures.join("\n"));process.exitCode=1;}
 else console.log("Chapter photographic placement PASS: 9/9 real images, zero orphan animation overlays, correct filter labels at 390/768/1200; screenshots saved.");
})().catch(e=>{console.error(e);process.exitCode=1});
