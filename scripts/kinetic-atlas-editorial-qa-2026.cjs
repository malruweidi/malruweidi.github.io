/* Kinetic Atlas V3: inspect the rendered context-rail layout, not just CSS text.
 * Real Chrome at 390, 768, 1440 px, including Arabic and scene navigation.
 */
"use strict";
const {chromium}=require("playwright-core");
const fs=require("node:fs");
const path=require("node:path");
const base=process.env.SITE_BASE_URL||"http://127.0.0.1:8765";
const output=process.env.BROWSER_QA_OUTPUT||"browser-qa-artifacts";
fs.mkdirSync(output,{recursive:true});
const failures=[],screens=[];
const overlap=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>2&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2;
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||"/usr/bin/chromium",args:["--no-sandbox","--disable-dev-shm-usage"]});
 try{
   for(const width of [390,768,1440]){
     const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1});
     try{
       const errors=[];
       page.on("pageerror",e=>errors.push(e.message));
       await page.goto(base+"/index.html?atlas=manuscript#rx-kinetic-atlas",{waitUntil:"domcontentloaded",timeout:45000});
       await page.locator("#rx-kinetic-atlas #rx-atlas-canvas svg").waitFor({timeout:20000});
       await page.evaluate(()=>document.fonts.ready);
       await page.locator("#rx-kinetic-atlas").scrollIntoViewIfNeeded();
       const values=await page.evaluate(()=>{
         const q=s=>document.querySelector("#rx-kinetic-atlas "+s);
         const rect=s=>{const r=q(s).getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,height:r.height};};
         const computed=getComputedStyle(document.getElementById("rx-kinetic-atlas"));
         const description=q(".rx-atlas-description");
         const canvas=q(".rx-atlas-canvas");
         return {
          section:rect(".rx-atlas-shell"),primary:rect(".rx-atlas-primary"),
          rail:rect(".rx-atlas-sidebar"),description:rect(".rx-atlas-description"),
          controller:rect(".rx-atlas-controllers"),canvas:rect(".rx-atlas-canvas"),
          chooser:rect(".rx-atlas-sidebar-title"),boundary:rect(".rx-atlas-boundary"),
          source:rect("#rx-atlas-source"),copy:rect("#rx-atlas-copy-link"),
          heading:rect("#rx-kinetic-scene-title"),
          list:rect("#rx-atlas-list"),
          footerText:q("#rx-atlas-boundary").innerText,
          descriptionText:description.innerText,
          bg:computed.backgroundColor,decoration:getComputedStyle(document.getElementById("rx-kinetic-atlas"),"::before").display,
          horizontalOverflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+2,
          sceneId:q(".rx-atlas-canvas svg")?.getAttribute("aria-label"),
          title:q("#rx-kinetic-scene-title").textContent,
          actionHeight:[...q(".rx-atlas-actions").querySelectorAll("button")].map(x=>x.getBoundingClientRect().height),
          inputHeight:canvas.getBoundingClientRect().height,
          selectedText:window.getSelection()?.toString()||""
         };
       });
       const fail=message=>failures.push(width+"px: "+message);
       if(values.bg!=="rgb(247, 244, 238)")fail("Section background not light paper: "+values.bg);
       if(values.decoration!=="none")fail("Distracting vertical technical grid remains");
       if(values.title!=="Opening a folio")fail("Manuscript scene did not initialize");
       if(values.sceneId?.includes("Opening a folio")!==true)fail("Scientific illustration and title disagree");
       if(values.horizontalOverflow)fail("Horizontal page overflow");
       if(values.heading.right>values.rail.right+2||values.heading.left<values.rail.left-2)fail("Scene title spills outside information rail");
       if(values.description.top<values.rail.top-2||values.description.bottom>values.rail.bottom+2)fail("Scene context not contained in the rail");
       if(values.description.bottom>values.chooser.top+3)fail("Scene list overlaps explanatory context");
       if(values.boundary.top<Math.max(values.rail.bottom,values.primary.bottom)-2)fail("Conceptual caveat overlaps gallery");
       if(values.footerText.length>200)fail("Overlong conceptual caveat");
       if(values.actionHeight.some(x=>x<42))fail("Controller has undersized touch targets");
       if(overlap(values.canvas,values.rail))fail("Scientific scene overlaps contextual rail");
       if(width>=1000&&values.rail.left<values.primary.right-2)fail("Desktop information rail not beside instrument");
       if(width<=950&&values.rail.top<values.primary.bottom-2)fail("Tablet/mobile rail not underneath instrument");
       if(values.selectedText.length)fail("Unwanted default selection during loading");
       if(errors.length)fail("JavaScript errors: "+errors.slice(0,2).join("; "));
       await page.locator("#rx-kinetic-atlas").screenshot({path:path.join(output,"kinetic-atlas-v3-"+width+"-en.png"),animations:"disabled"});
       const range=page.locator("#rx-atlas-range");
       await range.evaluate(el=>{el.value="79";el.dispatchEvent(new Event("input",{bubbles:true}));});
       const value=await page.locator("#rx-atlas-output").innerText();
       if(!value.includes("79"))fail("Scene slider is not interactive");
       await page.locator("#rx-atlas-next").click();
       const next=await page.locator("#rx-kinetic-scene-title").innerText();
       if(next==="Opening a folio")fail("Next did not switch scene");
       if(width===390){
         await page.evaluate(()=>document.documentElement.setAttribute("lang","ar"));
         await page.waitForFunction(()=>document.querySelector("#rx-kinetic-atlas")?.dir==="rtl",null,{timeout:8000});
         const arabic=await page.locator("#rx-kinetic-scene-title").innerText();
         if(!/[\u0600-\u06ff]/.test(arabic))fail("Arabic title not rendered");
         await page.locator("#rx-kinetic-atlas").screenshot({path:path.join(output,"kinetic-atlas-v3-390-ar.png"),animations:"disabled"});
       }
       screens.push({width,values,afterNavigate:next});
     }catch(e){failures.push(width+"px: "+e.message);}
     finally{await page.close();}
   }
 }finally{await browser.close();}
 fs.writeFileSync(path.join(output,"kinetic-atlas-v3-report.json"),JSON.stringify({checks:screens.length,failures,screens},null,2));
 if(failures.length){console.error("Kinetic Atlas V3 browser QA FAILED\n"+failures.join("\n"));process.exitCode=1;}
 else console.log("Kinetic Atlas V3 browser QA PASS: editorial rail, no grid/overlap, mobile + Arabic, control behavior; four screenshots saved.");
})().catch(e=>{console.error(e);process.exitCode=1});
