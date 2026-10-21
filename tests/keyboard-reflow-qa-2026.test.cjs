"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const {KEYBOARD_ROUTES,focusReport}=require("../scripts/keyboard-reflow-qa-2026.cjs");
test("keyboard QA targets public story, bibliographic, film, search and Arabic journeys",()=>{
 for(const u of ["/stories.html","/publications.html","/publication-cinema.html",
  "/search.html","/illness-and-evidence.html"])assert.ok(KEYBOARD_ROUTES.includes(u),u);
});
test("keyboard report explicitly detects invisible focus and lost active element",()=>{
 assert.equal(focusReport({tag:"A",visible:true,outline:"solid",focusMatches:true}).length,0);
 assert.ok(focusReport({tag:"A",visible:false,outline:"none",focusMatches:true}).includes("not-visible"));
 assert.ok(focusReport({tag:"BUTTON",visible:true,outline:"none",focusMatches:false}).includes("lost-focus"));
});
