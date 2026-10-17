// Verify the entire existing Ruwaidix film inventory, not only the 35-paper catalogue.
// Technical checks do not certify scientific claims, cinematic quality or narration.
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const asset=p=>path.join(root,"assets/films",p);
const special={
  "making-medicines-keep":"series-v4",
  "pla-grafting":"series-v3",
  "flow-chamber-method":"series-v5",
  "microfluidic-virus":"series-v5",
  "pla-scaffolds":"series-v5"
};
const rootMovies=[
  "airway-reopening-evidence-cut",
  "cairo-microscope",
  "making-medicines-keep",
  "ring-that-never-closed",
  "the-laboratory-we-carried-with-us",
  "two-materials-no-section-evidence-cut",
  "two-materials-no-section",
  "what-a-bubble-can-do",
  "what-survives-the-experiment"
];

function cueSeconds(t){
  const m=t.match(/^(\d\d):(\d\d):(\d\d)\.(\d\d\d)$/);
  assert(m,"Unexpected WebVTT time "+t);
  return (+m[1])*3600+(+m[2])*60+(+m[3])+(+m[4])/1000;
}
function verifyMovie(base){
  const mp4=asset(base+".mp4");
  const vtt=asset(base+".vtt");
  assert(fs.existsSync(mp4),"Missing movie: "+mp4);
  assert(fs.statSync(mp4).size>100000,"Truncated movie: "+mp4);
  const fd=fs.openSync(mp4,"r"),header=Buffer.alloc(8);
  try{assert.equal(fs.readSync(fd,header,0,8,0),8);}
  finally{fs.closeSync(fd);}
  assert.equal(header.toString("ascii",4,8),"ftyp","Not an MP4: "+mp4);
  assert(fs.existsSync(vtt),"Missing caption track: "+vtt);
  const subtitles=fs.readFileSync(vtt,"utf8");
  assert(subtitles.startsWith("WEBVTT"),"Malformed caption file "+vtt);
  const cues=[...subtitles.matchAll(/(\d\d:\d\d:\d\d\.\d\d\d) --> (\d\d:\d\d:\d\d\.\d\d\d)/g)];
  assert(cues.length>=4,"Not enough cues: "+vtt);
  let previous=-1;
  for(const cue of cues){
    const start=cueSeconds(cue[1]),end=cueSeconds(cue[2]);
    assert(start>=previous,"Caption time decreased: "+vtt);
    assert(end>start,"Zero-length caption: "+vtt);
    previous=end;
  }
}

test("complete catalogue of 35 works retains unique published film IDs",()=>{
  const register=JSON.parse(fs.readFileSync(asset("publication-series.json"),"utf8"));
  const slugs=register.items.map(x=>x.id);
  assert.equal(slugs.length,35);
  assert.equal(new Set(slugs).size,35);
  const v6=JSON.parse(fs.readFileSync(asset("series-v6/releases.json"),"utf8"));
  assert.equal(v6.films.length,30);
  const preferred=new Set(Object.keys(special));
  assert.equal(preferred.size,5);
  for(const id of slugs){
    const edition=preferred.has(id)?special[id]:"series-v6";
    verifyMovie(edition+"/"+id);
  }
});
test("preserve all nine standalone films and their independent transcripts",()=>{
  assert.equal(rootMovies.length,9);
  for(const slug of rootMovies)verifyMovie(slug);
});
test("none of the experimental source figures are replaced by arbitrary figures in the V6 manifest",()=>{
  const catalog=JSON.parse(fs.readFileSync(asset("publication-series.json"),"utf8")).items;
  for(const item of catalog){
    const manifest=asset((special[item.id]||"series-v6")+"/"+item.id+".json");
    assert(fs.existsSync(manifest),"Missing production provenance: "+manifest);
    const record=JSON.parse(fs.readFileSync(manifest,"utf8"));
    assert.equal(record.id||item.id,item.id);
    const source=record.scene_provenance||record.source_figures||record.chapters||[];
    assert(source.length>=6,"Insufficient evidence records in "+item.id);
  }
});
