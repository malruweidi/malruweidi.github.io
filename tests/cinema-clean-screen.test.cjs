"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

test("all publicly registered V7 cinema cuts use cleaned, provenance-preserving frames",()=>{
  const register=JSON.parse(read("assets/films/series-v7-pilots/releases.json"));
  const catalog=JSON.parse(read("assets/films/publication-series.json")).items;
  const protectedIds=new Set(["making-medicines-keep","pla-grafting",
     "pla-scaffolds","flow-chamber-method","microfluidic-virus"]);
  assert.equal(catalog.length,35);
  assert(register.count>=0 && register.count<=30);
  assert.equal(register.films.length,register.count);
  assert.equal(new Set(register.films.map(f=>f.id)).size,register.count);
  assert(register.count>=14,"Do not silently lose the fourteen clean-screen releases");
  for(const film of register.films){
    assert(!protectedIds.has(film.id),"Do not displace better primary-source edition: "+film.id);
    assert.match(film.visual_revision,/^(?:v7\.8-clean-screen|v8\.0-audience-clean-20261018)\//,"Older on-screen-production-note render: "+film.id);
    assert.equal(film.distinct_chapters,6);
    const source=JSON.parse(read(film.scene_manifest.slice(1)));
    assert.equal(source.movie_sha256,film.sha256);
    assert.equal(source.visual_revision,film.visual_revision);
    assert.equal(source.beats.length,24);
    assert(source.beats.every(beat=>!String(beat.source).startsWith("/tmp/")),
      "Ephemeral provenance cannot be published: "+film.id);
  }
});

test("V7 picture renderer separates viewer copy from audit notes",()=>{
  const builder=read("scripts/build-cinema-v7-previews.py");
  const art=read("scripts/film-art-direction-v7.py");
  assert.doesNotMatch(builder,/d\.text\(\(72,46\),media/);
  assert.doesNotMatch(builder,/d\.text\(\(1120,554\),scene\["id"\]/);
  assert.doesNotMatch(builder,/d\.text\([^\n]*SCIENTIFIC FILM/);
  assert.doesNotMatch(art,/txt\(d,\(100,583\),\"EDITORIAL ANIMATION/);
  assert.match(builder,/empty_top/);
  assert.match(builder,/empty_caption_band/);
  assert.match(builder,/y\+im\.height<=515/);
});

test("film catalogue stays playable without JavaScript while progressive V7 delivery stays source-first",()=>{
  const html=read("publication-cinema.html");
  const staticHTML=html.split("<script>")[0];
  assert.equal((staticHTML.match(/<video controls playsinline/g)||[]).length,35);
  assert.equal((staticHTML.match(/<track kind="captions"/g)||[]).length,35);
  assert.equal((staticHTML.match(/<source src="\/assets\/films\/series-v6\//g)||[]).length,30);
  assert(!staticHTML.includes("illustration or original research-context photograph"),
    "Unverified stock/editorial fallback prose must not appear in a film player");
  assert.match(html,/v8\.0-audience-clean-20261018/);
  assert.match(html,/verifiedFilmMasters\[x\.id\]/);
  assert.match(html,/series-v6\/releases\.json/);
});
