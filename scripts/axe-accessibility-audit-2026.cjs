#!/usr/bin/env node
"use strict";
/* Real Chrome + axe-core WCAG 2.0/2.1 A/AA audit on a local draft.
 * Reports selectors, severity and repair descriptions, not sensitive text,
 * source HTML or personally identifying DOM snippets. An axe pass cannot
 * replace manual keyboard, AT, perception, RTL, or native-device tests.
 */
const fs=require("node:fs"),path=require("node:path");
const AXE_ROUTES=[
 "/index.html","/stories.html","/archive.html","/research.html",
 "/search.html","/illness-and-evidence.html","/publication-cinema.html",
 "/evidence-viewer.html","/films/what-a-bubble-can-do.html"
];
const IMPACT={minor:1,moderate:2,serious:3,critical:4};
const rankAxeImpact=x=>IMPACT[x]||0;
function normalizeViolations(violations,route,width){
 const findings=[];
 for(const v of violations||[]){
  for(const n of (v.nodes||[]).slice(0,35)){
   findings.push({
    route,width,rule:v.id,impact:v.impact||"unknown",
    target:Array.isArray(n.target)?n.target.join(" > ").slice(0,220):"(unresolved)",
    help:(v.help||v.description||"").slice(0,260),
    advice:(n.failureSummary||"").slice(0,440),
    ruleUrl:(v.helpUrl||"").slice(0,240)
   });
  }
 }
 return findings;
}
module.exports={rankAxeImpact,normalizeViolations,AXE_ROUTES};
if(require.main===module)(async()=>{
 const {chromium}=require("playwright-core");
 const axeSource=require.resolve("axe-core/axe.min.js");
 const base=process.env.SITE_BASE_URL||"http://127.0.0.1:8765";
 const output=path.resolve(process.env.BROWSER_QA_OUTPUT||"browser-qa-artifacts");
 fs.mkdirSync(output,{recursive:true});
 const executable=process.env.CHROME_PATH||undefined;
 const browser=await chromium.launch({
   headless:true,...(executable?{executablePath:executable}:{channel:"chrome"}),
   args:["--no-sandbox","--disable-dev-shm-usage"]
 });
 const results=[],errors=[];
 try{
  for(const width of [375,1440]){
   const context=await browser.newContext({viewport:{width,height:width===375?812:900},reducedMotion:"reduce"});
   for(const route of AXE_ROUTES){
    const page=await context.newPage();
    try{
     const res=await page.goto(base+route,{waitUntil:"domcontentloaded",timeout:25000});
     if(!res||res.status()>=400)throw Error("document HTTP "+res?.status());
     await page.waitForTimeout(200);
     await page.addScriptTag({path:axeSource});
     const data=await page.evaluate(async()=>{
      return await window.axe.run(document,{runOnly:{type:"tag",values:[
        "wcag2a","wcag2aa","wcag21a","wcag21aa"
      ]}});
     });
     const findings=normalizeViolations(data.violations,route,width);
     results.push({route,width,violations:data.violations.length,
      affectedNodes:findings.length,incompleteRules:data.incomplete.length,findings});
     process.stdout.write(route+" @ "+width+"px: "+data.violations.length+" rules, "+findings.length+" affected elements\n");
    }catch(e){errors.push({route,width,error:String(e?.message||e).slice(0,450)})}
    finally{await page.close()}
   }
   await context.close();
  }
 }finally{await browser.close()}
 const issues=results.flatMap(r=>r.findings);
 const counts={};
 for(const key of ["critical","serious","moderate","minor","unknown"])
  counts[key]=issues.filter(x=>x.impact===key).length;
 const report={
  scope:"Automated WCAG 2.0/2.1 A/AA rules only. First-fold screenshots and this scan cannot certify accessibility or actual screen-reader behavior.",
  dates:"Draft branch source files; no production deployment",
  routes:AXE_ROUTES,viewports:[375,1440],
  counts,issues,errors,
  reviewRequired:[
   "Manually verify 200% and 400% zoom and viewport reflow",
   "Narrated film captions, language tags and meaningful alternative descriptions",
   "Real keyboard focus and screen-reader control announcements",
   "Arabic RTL and bilingual switching on actual assistive technologies",
   "Perceptual color contrast across states, images and gradients"
  ]
 };
 fs.writeFileSync(path.join(output,"wcag-axe-report.json"),JSON.stringify(report,null,2)+"\n");
 const byRule=new Map();
 for(const x of issues){const key=x.rule+"|"+x.impact;
  if(!byRule.has(key))byRule.set(key,{rule:x.rule,impact:x.impact,count:0,pages:new Set(),example:x.target,help:x.help});
  const d=byRule.get(key);d.count++;d.pages.add(x.route)}
 const sorted=[...byRule.values()].sort((a,b)=>
  rankAxeImpact(b.impact)-rankAxeImpact(a.impact)||b.count-a.count);
 const md=[
  "# Chrome WCAG 2.0/2.1 A/AA audit",
  "Routes: "+results.length+" checked across 375px and 1440px; automated rules only.",
  "Affected nodes by impact: "+JSON.stringify(counts),
  "Browser/setup errors: "+errors.length,
  "",
  "| Impact | Rule | Nodes | Affected routes |",
  "|---|---|---:|---|",
  ...sorted.map(x=>"| "+x.impact+" | "+x.rule+" | "+x.count+" | "+[...x.pages].join(", ").slice(0,250)+" |"),
  "",
  "## Unresolved scan failures",
  ...errors.map(x=>"- "+x.route+" @ "+x.width+": "+x.error),
  "",
  "This report does not include sensitive page HTML, photographs, text or raw medical content.",
  "Fix candidates must be independently verified with keyboard, screen reader and visual review."
 ].join("\n");
 fs.writeFileSync(path.join(output,"wcag-axe-summary.md"),md+"\n");
 process.stdout.write(md.slice(0,5000)+"\n");
 // Baseline is a discovery audit, never a claim that all checks passed.
 // Errors in the audit itself must block; accessibility findings remain
 // actionable review blockers until their changes are separately validated.
 if(errors.length)process.exitCode=1;
})().catch(e=>{process.stderr.write(String(e.stack||e)+"\n");process.exitCode=1});
