"use strict";
const {test} = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const root=path.resolve(__dirname,"..");
const dir="assets/chem-squad-owner-archive-2026-10-12/";
const hashes={
"abdelrahman-casual-selfie.webp":"0b04f87c3417ad9007eaf917b56c6b31c5c6170d",
"elgendy-abdelrahman-three-person-selfie.webp":"05d613d5a654a09d268459cf06f9026205fb6cbe",
"elgendy-abdelrahman-university-room.webp":"adc4ca3f40119c2918290a599dd3215d5417c090",
"elgendy-formal-portrait.webp":"430bb768adc7a462b09342611d76ae9a92cbd495",
"khaled-jama-nitrogen-laboratory.webp":"370f8946991697eca1dace0b4db1a9de5aec055e",
"nassr-formal-white-dress.webp":"3b96cb9813c7f1a234f5aec4d329b9eb2244fd2b",
"qu-chemistry-department-ramadan-iftar.webp":"878efb91532bd5af2be55e4a1233cbf4ae7e1238",
"rakan-gathering.webp":"a6eb491e8a670683a29527530eef1c19c4425cac"
};
test("eight original Chem Squad photograph derivatives remain intact",()=>{
 for(const [name,sha] of Object.entries(hashes)){
  const file=path.join(root,dir,name);
  assert.ok(fs.existsSync(file),name+" absent");
  const buf=fs.readFileSync(file);
  const digest=crypto.createHash("sha1").update(Buffer.from("blob "+buf.length+"\0")).update(buf).digest("hex");
  assert.equal(digest,sha,"binary changed: "+name);
  assert.equal(buf.toString("ascii",0,4),"RIFF",name);
  assert.equal(buf.toString("ascii",8,12),"WEBP",name);
 }
});
test("photographs appear alongside, not in place of, the original Chem Squad content",()=>{
 const page=fs.readFileSync(path.join(root,"chem-squad.html"),"utf8");
 const script=fs.readFileSync(path.join(root,"assets/chem-squad-owner-archive-2026.js"),"utf8");
 const style=fs.readFileSync(path.join(root,"assets/chem-squad-owner-archive-2026.css"),"utf8");
 assert.ok(page.includes('id="origin"'));
 assert.ok(page.includes('id="people"'));
 assert.ok(page.includes('id="weekly"'));
 assert.ok(page.includes('owner-archive-2026-10-13.js'));
 assert.ok(page.includes('chem-squad-owner-archive-2026.js'));
 assert.ok(style.includes("@media"));
 assert.ok(script.includes("MutationObserver"));
 assert.ok(script.includes("khaled-jama-nitrogen-laboratory.webp"));
 assert.ok(script.includes("It does not identify the experiment")||script.includes("does not identify the experiment"));
 for(const name of Object.keys(hashes))assert.ok(script.includes(name),name+" absent from editorial records");
 assert.ok(script.includes("/moving-evidence.html#chem-squad-film"));
});
