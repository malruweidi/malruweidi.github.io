"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const {SAMPLE_TIMES,meanRgbDifference,selectFilmRoute}=require("../scripts/sample-film-frames-2026.cjs");
test("decoder samples meaningful separate positions rather than rendering the paused browser control",()=>{
 assert.deepEqual(SAMPLE_TIMES,[1,30,60]);
 assert.equal(meanRgbDifference(Buffer.from([0,0,0,0,0,0]),Buffer.from([0,0,0,0,0,0])),0);
 assert.equal(meanRgbDifference(Buffer.from([0,0,0]),Buffer.from([255,255,255])),100);
 assert.ok(meanRgbDifference(Buffer.from([0,0,0]),Buffer.from([4,4,4]))>1);
 assert.throws(()=>meanRgbDifference(Buffer.from([0]),Buffer.from([1,1])),/length|equal/i);
});
test("the original selected standalone film is sampled, not a guessed v8 or poster asset",()=>{
 const fs=require("node:fs"),path=require("node:path");
 const html=fs.readFileSync(path.join(__dirname,"..","films/what-a-bubble-can-do.html"),"utf8");
 const file=selectFilmRoute(html);
 assert.equal(file,"assets/films/what-a-bubble-can-do-evidence-v2.mp4");
 assert.ok(fs.existsSync(path.join(__dirname,"..",file)));
 assert.ok(!file.includes("poster"));
});
