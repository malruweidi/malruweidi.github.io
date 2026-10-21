"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const {rankAxeImpact,normalizeViolations,AXE_ROUTES}=require("../scripts/axe-accessibility-audit-2026.cjs");
test("WCAG analysis covers representative research, film, storytelling and Arabic-sensitive pages",()=>{
 for(const route of ["/index.html","/stories.html","/archive.html","/research.html",
 "/search.html","/illness-and-evidence.html","/publication-cinema.html",
 "/evidence-viewer.html"] )assert.ok(AXE_ROUTES.includes(route),route);
});
test("concrete WCAG findings retain test ID, impact, node location, repair advice without full private HTML",()=>{
 const input=[{id:"color-contrast",impact:"serious",description:"Low contrast",
  help:"Elements must meet contrast requirements",helpUrl:"https://dequeuniversity.com/rules/axe/4.10/color-contrast",
  nodes:[{target:[".source-note"],failureSummary:"Fix contrast",html:"<p>private medical data</p>"}]}];
 const output=normalizeViolations(input,"/research.html",375);
 assert.equal(output.length,1);
 assert.equal(output[0].impact,"serious");
 assert.equal(output[0].target,".source-note");
 assert.ok(!JSON.stringify(output).includes("private medical data"));
 assert.equal(rankAxeImpact("critical"),4);
 assert.equal(rankAxeImpact("minor"),1);
});
