"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const {scanLegacyFigures}=require("../scripts/legacy-figure-context-audit-2026.cjs");
const root=path.join(__dirname,"..");
test("historical long-form record includes original figures and context-only provenance review",()=>{
 const d=scanLegacyFigures(root);
 assert.equal(d.page,"full-record.html");
 assert.ok(d.figures.length>=6);
 const unresolved=d.figures.filter(f=>!f.captionPresent&&!f.hasEquivalentLabel);
 assert.ok(unresolved.length>=3);
 assert.ok(d.bytesExamined>1_000_000);
 for(const entry of d.figures){
  assert.ok(entry.ordinal>=1 && entry.line>=1);
  assert.ok(Array.isArray(entry.images));
  assert.ok(entry.images.every(i=>!i.url||i.url.length<250));
  assert.ok(entry.heading.length<=200);
  assert.ok(entry.previousContext.length<=280);
  assert.ok(entry.followingContext.length<=280);
  assert.ok(!JSON.stringify(entry).includes(";base64,"));
 }
 assert.ok(d.scope.includes("not"));
});
test("figure-context review cannot modify or leak any inline media payload",()=>{
 const file=path.join(root,"full-record.html");
 const before=crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
 const d=scanLegacyFigures(root);
 const after=crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
 assert.equal(before,after);
 assert.doesNotMatch(JSON.stringify(d),/data:image\/(?:png|jpeg|webp);base64/i);
 assert.ok(d.figures.some(x=>x.images.some(i=>i.type==="embedded")));
});
