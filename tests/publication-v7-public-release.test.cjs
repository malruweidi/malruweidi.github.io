"use strict";
// Reversible publication: source-specific masters first; V7 next; V6 kept.
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const root=path.resolve(__dirname,"..");
const read=rel=>fs.readFileSync(path.join(root,rel),"utf8");
const release=JSON.parse(read("assets/films/series-v7-pilots/releases.json"));
const v6=JSON.parse(read("assets/films/series-v6/releases.json"));
const catalog=JSON.parse(read("assets/films/publication-series.json")).items;
const special={
 "making-medicines-keep":"series-v4",
 "pla-grafting":"series-v3",
 "pla-scaffolds":"series-v5",
 "flow-chamber-method":"series-v5",
 "microfluidic-virus":"series-v5"
};
test("each released clean-screen V7 film is source-matched, checksum verified and captioned",()=>{
 assert.equal(release.schema,"ruwaidix-cinema-v7-registered-releases-v1");
 assert.equal(release.count,release.films.length);
 assert(release.count>=0 && release.count<=30);
 assert.match(release.review_limit,/review|not certify|expert/i);
 const allowed=new Set(catalog.filter(x=>!Object.hasOwn(special,x.id)).map(x=>x.id));
 assert.equal(allowed.size,30);
 assert.equal(new Set(release.films.map(x=>x.id)).size,release.count);
 for(const f of release.films)assert(allowed.has(f.id),"Unexpected or protected V7 release: "+f.id);
 for(const movie of release.films){
  assert.equal(movie.edition,"series-v7-pilots",movie.id);
  assert.equal(movie.duration_seconds,84,movie.id);
  assert.equal(movie.distinct_chapters,6,movie.id);
  assert.match(movie.visual_revision,/^v7\.8-clean-screen\//,"No internal-production-label V7 movies may be published: "+movie.id);
  assert.match(movie.sha256,/^[a-f0-9]{64}$/,movie.id);
  const filmPath=path.join(root,movie.video.slice(1));
  assert(fs.existsSync(filmPath),movie.video);
  const bytes=fs.readFileSync(filmPath);
  assert(bytes.length>1_000_000,movie.id);
  assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"),movie.sha256,"stale V7 movie "+movie.id);
  assert.equal(bytes.toString("ascii",4,8),"ftyp",movie.id);
  const captions=read(movie.captions.slice(1));
  assert(captions.startsWith("WEBVTT"));
  assert.equal((captions.match(/-->/g)||[]).length,12,movie.id);
  assert(fs.statSync(path.join(root,movie.poster.slice(1))).size>3000,movie.id);
  assert(fs.statSync(path.join(root,movie.source_review.slice(1))).size>12000,movie.id);
  const source=JSON.parse(read(movie.scene_manifest.slice(1)));
  assert.equal(source.slug,movie.id);
  assert.equal(source.visual_beat_count,24);
  assert.equal(source.movie_sha256,movie.sha256);
  assert.equal(source.visual_revision,movie.visual_revision);
  assert.equal(source.scene_count,6);
  assert.equal(source.beats.length,24);
  assert(!source.beats.some(b=>String(b.source).startsWith("/")),movie.id);
 }
});
test("five original article-specific research cuts and every older V6/first edition remain",()=>{
 const all=new Set(catalog.map(x=>x.id));
 assert.equal(all.size,35);
 for(const [id,edition] of Object.entries(special)){
  assert(!release.films.some(x=>x.id===id),"Protected source film overwritten: "+id);
  for(const ext of [".mp4",".vtt",".json"]){
   assert(fs.existsSync(path.join(root,"assets/films/"+edition+"/"+id+ext)));
  }
 }
 assert.equal(v6.films.length,30);
 for(const id of release.films.map(x=>x.id)){
  for(const dir of ["series-v6","series"]){
   for(const ext of [".mp4",".vtt"]){
    assert(fs.existsSync(path.join(root,"assets/films/"+dir+"/"+id+ext)),dir+" preservation "+id+ext);
   }
  }
 }
});
test("saved 35-piece cinema page remains playable while progressively verifying V7 updates",()=>{
 const html=read("publication-cinema.html"),staticHtml=html.split("<script>")[0];
 const rows=[...staticHtml.matchAll(/<article class="piece" id="film-([a-z0-9-]+)"/g)].map(m=>m[1]);
 assert.equal(rows.length,35);
 assert.equal(new Set(rows).size,35);
 const sources=[...staticHtml.matchAll(/<source src="(\/assets\/films\/[^"]+\.mp4)"/g)].map(m=>m[1]);
 assert.equal(sources.length,35);
 const captions=[...staticHtml.matchAll(/<track kind="captions" src="(\/assets\/films\/[^"]+\.vtt)"/g)].map(m=>m[1]);
 assert.equal(captions.length,35);
 for(let i=0;i<rows.length;i++){
  const edition=special[rows[i]]||"series-v6";
  assert.equal(sources[i],"/assets/films/"+edition+"/"+rows[i]+".mp4");
  assert.equal(captions[i],"/assets/films/"+edition+"/"+rows[i]+".vtt");
 }
 assert.match(html,/series-v7-pilots\/releases\.json/);
 assert.match(html,/const selectedEdition=verifiedResearchEdition \|\| \(isV7\?/);
 assert.match(html,/Watch preserved previous V6 edition/);
 assert.match(html,/Watch preserved original first edition/);
 assert.match(html,/const fallback=\(isV7&&isV6\?/);
});

test("all new player chapter menus seek to the source narration rather than approximate chapter times",()=>{
 const html=read("publication-cinema.html");
 assert.match(html,/Jump to any of six narrated chapters/);
 assert.match(html,/chapterNav\.addEventListener\("toggle",async/);
 assert.match(html,/chapterList\.appendChild\(button\)/);
 const parse=cap=>[...cap.matchAll(/(\d{2}):(\d{2}):(\d{2}\.\d{3})\s*-->/g)]
   .map(m=>Number(m[1])*3600+Number(m[2])*60+Number(m[3]));
 for(const f of release.films){
  const times=parse(read(f.captions.slice(1)));
  assert.equal(times.length,12,f.id);
  const chapters=Array.from({length:6},(_,i)=>times[i*2]);
  assert(chapters[0]>=0 && chapters[0]<1.5,f.id);
  for(let i=1;i<6;i++)assert(chapters[i]>chapters[i-1] && chapters[i]<84,f.id);
 }
});
