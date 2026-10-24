#!/usr/bin/env node
"use strict";
/* Read-only, actual Chromium mobile reflow diagnostics.
 * No remote tracking, cookies, screen capture of personal content or mutation.
 * A 1px allowance addresses fractional-device rounding, not layout overflow.
 */
const { chromium } = require("playwright-core");
const chrome = process.env.CHROME_PATH || "/usr/bin/google-chrome";
const base = process.env.AUDIT_BASE || "http://127.0.0.1:8765";
const widths = [320,375,768];
(async()=>{
 const browser=await chromium.launch({executablePath:chrome,headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
 let violations=0;
 try{
  for(const lang of ["en","ar"]){
   for(const width of widths){
    const page=await browser.newPage({viewport:{width,height:740},deviceScaleFactor:1});
    const url=base+"/stories.html"+(lang==="ar"?"?lang=ar":"");
    await page.goto(url,{waitUntil:"domcontentloaded",timeout:30000});
    await page.waitForTimeout(900);
    const measurement=await page.evaluate(()=>{
      const root=document.documentElement;
      const viewport=document.documentElement.clientWidth;
      const overflowing=[];
      const nodes=document.body.querySelectorAll("*");
      for(const element of nodes){
        const style=getComputedStyle(element);
        if(style.display==="none"||style.visibility==="hidden")continue;
        const rect=element.getBoundingClientRect();
        if(rect.width===0||rect.height===0)continue;
        const overshootRight=Math.max(0,rect.right-viewport);
        const overshootLeft=Math.max(0,-rect.left);
        if(overshootRight>0.7||overshootLeft>0.7){
          const nodeName=element.tagName.toLowerCase();
          const identifier=element.id?"#"+element.id:"";
          const classes=typeof element.className==="string"?element.className.trim().split(/\s+/).slice(0,3).map(c=>"."+c).join(""):"";
          overflowing.push({selector:nodeName+identifier+classes,left:+rect.left.toFixed(1),right:+rect.right.toFixed(1),width:+rect.width.toFixed(1),overshoot:+Math.max(overshootLeft,overshootRight).toFixed(1),text:(element.textContent||"").trim().slice(0,50)});
        }
      }
      overflowing.sort((a,b)=>b.overshoot-a.overshoot);
      return {innerWidth:window.innerWidth,clientWidth:viewport,docScrollWidth:root.scrollWidth,bodyScrollWidth:document.body.scrollWidth,htmlDir:root.dir,topOverflow:overflowing.slice(0,12)};
    });
    const overflow=Math.max(0,measurement.docScrollWidth-measurement.clientWidth);
    const failing=overflow>1;
    if(failing)violations++;
    console.log(JSON.stringify({route:"stories",lang,requestedWidth:width,overflowPixels:overflow,pass:!failing,...measurement}));
    await page.close();
   }
  }
 }finally{await browser.close();}
 if(violations){console.error("Detected "+violations+" reproducible >1px Stories reflow violation(s)");process.exitCode=1}
})().catch(err=>{console.error(err);process.exitCode=2});
