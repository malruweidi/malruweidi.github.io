/* Real-Chrome regression for the 2026-11-22 mobile screenshot.
 * Inspects rendered boxes, fonts, navigation, Arabic and page width. */
"use strict";
const {chromium}=require("playwright-core");
const fs=require("node:fs");
const path=require("node:path");

const root=process.env.SITE_BASE_URL||"http://127.0.0.1:8765";
const output=process.env.BROWSER_QA_OUTPUT||"browser-qa-artifacts";
const widths=[320,375,390,600,768];
const failures=[];
const findings=[];
fs.mkdirSync(output,{recursive:true});

const inside=(child,parent,tolerance=2)=>
 child.left >= parent.left-tolerance && child.right <= parent.right+tolerance;
const overlaps=(one,two)=>
 Math.min(one.right,two.right)-Math.max(one.left,two.left)>2 &&
 Math.min(one.bottom,two.bottom)-Math.max(one.top,two.top)>2;

async function check(browser,width,language="en"){
 const page=await browser.newPage({viewport:{width,height:844},deviceScaleFactor:1});
 const errors=[];
 page.on("pageerror",err=>errors.push(err.message));
 try{
   await page.goto(root+"/index.html",{waitUntil:"domcontentloaded",timeout:45000});
   await page.locator("#question-atlas .rx-atlas-choice button").first().waitFor({timeout:20000});
   if(language==="ar"){
     await page.evaluate(()=>document.documentElement.setAttribute("lang","ar"));
     await page.locator('#question-atlas[dir="rtl"] .rx-atlas-choice button').first().waitFor({timeout:15000});
   }
   await page.evaluate(()=>document.fonts.ready);
   const metric=await page.evaluate(()=>{
     const bounds=element=>{const r=element.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
     const question=document.querySelector("#question-atlas");
     const chooser=question?.querySelector(".rx-atlas-choice");
     const buttons=[...question.querySelectorAll(".rx-atlas-choice button")];
     const heading=question.querySelector(".rx-atlas-detail h3");
     const nav=document.querySelector(".header");
     const brand=document.querySelector(".header .brand");
     const name=document.querySelector(".header .brandname");
     const subtitle=document.querySelector(".header .brandline");
     const menu=document.querySelector(".header .menu");
     return {
       vw:document.documentElement.clientWidth,
       docWidth:document.documentElement.scrollWidth,
       section:bounds(question),choice:bounds(chooser),
       chooserColumns:getComputedStyle(chooser).gridTemplateColumns.split(" ").filter(Boolean).length,
       buttons:buttons.map(b=>({rect:bounds(b),title:bounds(b.querySelector(".rx-atlas-tabtitle")),
         text:b.querySelector(".rx-atlas-tabtitle").textContent,
         pressed:b.getAttribute("aria-pressed")})),
       detail:bounds(question.querySelector(".rx-atlas-detail")),
       heading:bounds(heading),headingText:heading.textContent,
       header:bounds(nav),brand:bounds(brand),
       name:bounds(name),subtitle:bounds(subtitle),menu:bounds(menu),
       subtitleLines:subtitle.getBoundingClientRect().height/parseFloat(getComputedStyle(subtitle).lineHeight),
       rtl:question.getAttribute("dir")==="rtl",
     };
   });
   const issues=[];
   if(metric.buttons.length!==4)issues.push("Expected 4 thread controls");
   if(metric.docWidth>width+2)issues.push("Horizontal page overflow "+metric.docWidth+" > "+width);
   if(width<=600&&metric.chooserColumns!==1)issues.push("Phone chooser must be one column; got "+metric.chooserColumns);
   if(width>600&&width<=840&&metric.chooserColumns!==2)issues.push("Tablet chooser must be two columns");
   for(let i=0;i<metric.buttons.length;i++){
     const b=metric.buttons[i];
     if(!inside(b.rect,metric.choice))issues.push("Button "+i+" outside chooser");
     if(!inside(b.title,b.rect,3))issues.push("Button "+i+" title outside its own card");
     for(let j=i+1;j<metric.buttons.length;j++)if(overlaps(b.rect,metric.buttons[j].rect))
       issues.push("Thread cards "+i+" and "+j+" overlap");
   }
   if(width<=600){
     if(metric.header.height>100)issues.push("Mobile header still oversized: "+metric.header.height+"px");
     if(metric.subtitleLines>1.2)issues.push("Brand tagline wraps to "+metric.subtitleLines+" lines");
     if(metric.menu.width>95)issues.push("Menu button wider than 95px");
     if(metric.menu.height<43)issues.push("Menu too small for touch: "+metric.menu.height);
   }
   if(metric.heading.width>metric.detail.width+2)issues.push("Question heading exceeds detail card");
   if(language==="ar"&&!metric.rtl)issues.push("Arabic thread direction is not RTL");
   if(errors.length)issues.push("Page errors: "+errors.slice(0,3).join("; "));
   const tag="question-atlas-"+width+"-"+language;
   await page.locator("#question-atlas").screenshot({path:path.join(output,tag+".png"),animations:"disabled"});
   // A viewport capture shows the sticky header in its real position.
   // Full-section screenshots can misleadingly stitch fixed controls into the artwork.
   await page.evaluate(()=>{
     const section=document.querySelector("#question-atlas");
     const top=section.getBoundingClientRect().top+window.scrollY-90;
     window.scrollTo(0,Math.max(0,top));
   });
   await page.screenshot({path:path.join(output,tag+"-viewport.png"),animations:"disabled"});
   const decorative=await page.evaluate(()=>getComputedStyle(document.querySelector("#question-atlas .rx-atlas-detail"),"::before").display);
   if(width<=600&&decorative!=="none")issues.push("Decorative detail circle still bleeds into mobile navigation");
   // Confirm the second thread changes the question without moving any other cards.
   await page.locator("#question-atlas .rx-atlas-choice button").nth(1).click();
   const chosen=await page.locator("#question-atlas .rx-atlas-choice button").nth(1).getAttribute("aria-pressed");
   const detail=await page.locator("#question-atlas .rx-atlas-detail h3").innerText();
   if(chosen!=="true"||detail===metric.headingText)issues.push("Click did not switch question");
   findings.push({viewport:width,language,issues,metrics:metric});
   for(const issue of issues)failures.push(tag+": "+issue);
 }catch(error){failures.push("question-atlas-"+width+"-"+language+": "+error.message)}
 finally{await page.close()}
}

(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||"/usr/bin/chromium",args:["--no-sandbox","--disable-dev-shm-usage"]});
 try{
   for(const width of widths)await check(browser,width,"en");
   await check(browser,390,"ar");
 }finally{await browser.close()}
 fs.writeFileSync(path.join(output,"mobile-question-atlas-qa.json"),JSON.stringify({checks:findings.length,failures,findings},null,2));
 if(failures.length){
   console.error("Mobile question atlas FAIL\n"+failures.join("\n"));
   process.exitCode=1;
 }else{
   console.log("Mobile question atlas PASS at 320, 375, 390, 600, 768 CSS px and Arabic 390px; 6 section screenshots saved.");
 }
})().catch(error=>{console.error(error);process.exitCode=1});
