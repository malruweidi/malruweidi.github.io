"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
test("global discovery enhancement preserves an existing direct Find link without injecting a duplicate",()=>{
 const script=read("assets/discovery-global.js");
 assert.match(script,/nav\.querySelector\(":scope > a\[href='\/search\.html'\]"\)/);
 assert.match(script,/if \(existingSearch\) return/);
 assert.match(script,/aria-keyshortcuts/);
 assert.match(script,/location\.assign\("\/search\.html\?focus=1"\)/);
 const page=read("evidence-viewer.html");
 assert.ok(page.includes('href="/search.html"'));
 assert.ok(page.includes('src="/assets/discovery-global.js'));
});
