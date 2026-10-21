"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
test("publication filters expose native, named button groups rather than invalid aria-label on plain div",()=>{
 const s=read("publications.html");
 assert.match(s,/<div class="pub-filters" role="group" aria-label="Filter by publication type">/);
 assert.match(s,/data-pub-category="All" aria-pressed="true"/);
});
test("film filters preserve their native pressed-button interactions in a named group",()=>{
 const s=read("publication-cinema.html");
 assert.match(s,/<div class="filters" role="group" aria-label="Filter the films">/);
 assert.match(s,/data-filter="all" aria-pressed="true"/);
 assert.ok((s.match(/<video\b/g)||[]).length>=30);
});
