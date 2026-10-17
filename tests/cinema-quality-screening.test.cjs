const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
test("V7 review room offers three real synchronized pilots and preserves original comparisons",()=>{
 const html=fs.readFileSync(path.join(root,"cinema-quality-preview.html"),"utf8");
 assert.match(html,/<meta name="robots" content="noindex, nofollow">/);
 const slugs=["niosomes","ace2-forms","essay-trna"];
 for(const id of slugs){
   assert(html.includes('data-slug="'+id+'"'));
   for(const ext of [".mp4",".vtt",".webp",".json"]){
      const v7=path.join(root,"assets/films/series-v7-pilots",id+ext);
      assert(fs.existsSync(v7),"Missing original pilot asset: "+v7);
   }
   for(const ext of [".mp4",".vtt",".json"]){
      assert(fs.existsSync(path.join(root,"assets/films/series-v6",id+ext)),"Lost V6 edition "+id+ext);
   }
   const manifest=JSON.parse(fs.readFileSync(path.join(root,"assets/films/series-v7-pilots",id+".json"),"utf8"));
   assert.equal(manifest.visual_beat_count,24);
   assert.equal(manifest.scene_count,6);
   assert.match(manifest.status,/STAGING ONLY/);
 }
 const code=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
 assert.equal(code.length,1);
 assert.doesNotThrow(()=>new vm.Script(code[0]));
});
test("V7 quality review register contains every paper and its four actual artwork plates",()=>{
 const filename=path.join(root,"assets/films/quality-review-v7/review-index.json");
 const ledger=JSON.parse(fs.readFileSync(filename,"utf8"));
 assert.equal(ledger.films.length,35);
 const catalogue=JSON.parse(fs.readFileSync(path.join(root,"assets/films/publication-series.json"),"utf8")).items;
 assert.deepEqual(ledger.films.map(x=>x.slug),catalogue.map(x=>x.id));
 for(const entry of ledger.films){
  assert.equal(entry.frames.length,4);
  for(const frame of entry.frames){
   assert(!frame.image_source.includes("../"),"Unsafe art reference "+entry.slug);
   assert(fs.existsSync(path.join(root,frame.file)),"Unavailable storyboard "+frame.file);
  }
 }
});
