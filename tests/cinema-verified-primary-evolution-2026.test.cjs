"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {readVerifiedFilmMasters,validateVerifiedFilmMasters}=require("../scripts/cinema-verified-masters-integrity.cjs");
const root=path.resolve(__dirname,"..");
const v8=[
 "pla-scaffolds","microfluidic-virus","making-medicines-keep","pla-grafting","flow-chamber-method"
];
const v8Fixture='const verifiedFilmMasters=Object.freeze({\n'+v8.map(id=>
 '  "'+id+'":{edition:"series-v8-primary",duration:120,poster:"/assets/films/series-v8-primary/'+id+'.webp"}'
).join(",\n")+"\n });";
const modernFixture='const verifiedFilmMasters=Object.freeze({\n'+[
 ["making-medicines-keep","series-v13-medieval",120],
 ["pla-grafting","series-v16-pla",120],
 ["pla-scaffolds","series-v17-scaffolds",120],
 ["flow-chamber-method","series-v18-flow",120]
].map(([id,ed,d])=>'  "'+id+'":{edition:"'+ed+'",duration:'+d+',poster:"/assets/films/'+ed+'/'+id+'.webp"}').join(",\n")+"\n });";

test("a valid newer primary master is accepted without reverting to a V8 primary",()=>{
 const modern=readVerifiedFilmMasters(modernFixture);
 const older=readVerifiedFilmMasters(v8Fixture);
 assert.equal(modern.length,4);
 assert.equal(older.length,5);
 assert.equal(modern.find(x=>x.id==="making-medicines-keep").edition,"series-v13-medieval");
 assert.equal(older.find(x=>x.id==="making-medicines-keep").edition,"series-v8-primary");
 const option={fileExists:()=>true,captionText:()=>"WEBVTT\n\n00:00:00.000 --> 00:00:02.000\nEducational film."};
 assert.deepEqual(validateVerifiedFilmMasters(modern,option),[]);
 assert.deepEqual(validateVerifiedFilmMasters(older,option),[]);
});

test("a missing release binary, mismatched poster, duplicate ID or contaminated captions fails",()=>{
 const original=readVerifiedFilmMasters(v8Fixture);
 assert.throws(()=>readVerifiedFilmMasters(v8Fixture.replace('"pla-scaffolds":','"pla-grafting":')),/duplicate/i);
 assert.throws(()=>readVerifiedFilmMasters(v8Fixture.replace('series-v8-primary/pla-scaffolds.webp','series-v8-primary/mislabel.webp')),/poster/i);
 const missing=validateVerifiedFilmMasters(original,{fileExists:p=>!p.endsWith("/pla-scaffolds.mp4"),captionText:()=>"WEBVTT\n"});
 assert.ok(missing.some(x=>x.includes("pla-scaffolds.mp4")));
 const contaminated=validateVerifiedFilmMasters(original,{fileExists:()=>true,captionText:()=>"WEBVTT\n\nProduction note: replace this placeholder"});
 assert.ok(contaminated.some(x=>x.includes("subtitle")));
});

test("the actual site preserves all five V8 releases and keeps every selected primary playable",()=>{
 const html=fs.readFileSync(path.join(root,"publication-cinema.html"),"utf8");
 const masters=readVerifiedFilmMasters(html);
 assert.ok(masters.length>=5);
 const errors=validateVerifiedFilmMasters(masters,{
  fileExists:p=>fs.existsSync(path.join(root,p)),
  captionText:p=>fs.readFileSync(path.join(root,p),"utf8")
 });
 assert.deepEqual(errors,[]);
 for(const id of v8){
  for(const ext of ["mp4","vtt","webp"]){
   assert.ok(fs.existsSync(path.join(root,"assets/films/series-v8-primary",id+"."+ext)),id+" V8 "+ext+" preserved");
  }
 }
 assert.match(html,/const selectedEdition=verifiedResearchEdition \|\|/);
});
