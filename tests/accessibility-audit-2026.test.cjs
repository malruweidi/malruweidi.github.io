"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const {AUDIT_ROUTES,VIEWPORTS,asFinding,resolvePolicy,uniqueFindings}=require("../scripts/accessibility-audit-2026.cjs");

test("critical reader journeys and both mobile/desktop are represented",()=>{
 for(const p of ["/index.html","/stories.html","/archive.html","/research.html","/publications.html",
 "/evidence-viewer.html","/illness-and-evidence.html","/search.html","/cv.html",
 "/publication-cinema.html","/films/what-a-bubble-can-do.html"])assert.ok(AUDIT_ROUTES.includes(p),p);
 assert.deepEqual(VIEWPORTS.map(x=>x.width),[375,1440]);
});
test("automated rule findings retain precise target, harm level, provenance and no snippets of health prose",()=>{
 const issue={id:"color-contrast",impact:"serious",help:"Elements must have sufficient color contrast",
  helpUrl:"https://dequeuniversity.com/rules/axe/4.10/color-contrast",
  nodes:[{target:[".rx-heading > a"],failureSummary:"Fix color contrast: 2.1:1",html:'<a>private history</a>'}]};
 const f=asFinding(issue,"/illness-and-evidence.html",375,"en");
 assert.equal(f.rule,"color-contrast");assert.equal(f.impact,"serious");
 assert.deepEqual(f.targets,[".rx-heading > a"]);
 assert.ok(f.helpUrl.startsWith("https://"));
 assert.ok(!JSON.stringify(f).includes("private history"));
 assert.equal(f.page,"/illness-and-evidence.html");
});
test("duplicate violations merge by page/state/rule, not across different pages",()=>{
 const v={id:"button-name",impact:"critical",help:"Buttons must have discernible text",nodes:[{target:[".missing"]}]};
 const items=[asFinding(v,"/stories.html",375,"en"),asFinding(v,"/stories.html",375,"en"),
 asFinding(v,"/research.html",375,"en")];
 assert.equal(uniqueFindings(items).length,2);
});
test("WCAG failures are never represented as passing even in non-blocking inventory mode",()=>{
 const issues=[asFinding({id:"image-alt",impact:"critical",nodes:[{target:["img"]}]},"/stories.html",375,"en")];
 const inventory=resolvePolicy(issues,"inventory");
 assert.equal(inventory.status,"ISSUES FOUND");assert.equal(inventory.exitCode,0);
 const release=resolvePolicy(issues,"release");
 assert.equal(release.status,"FAIL");assert.equal(release.exitCode,1);
 const clean=resolvePolicy([],"release");assert.equal(clean.status,"PASS");
});
