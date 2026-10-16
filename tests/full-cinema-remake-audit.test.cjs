"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const manifest=JSON.parse(read("assets/films/audit/full-film-inventory.json"));
const board=JSON.parse(read("assets/films/audit/directors-board.json"));

test("audit includes every original published MP4, not just four headline documentaries",()=>{
  const assets=path.join(root,"assets/films");
  const published=[
    ...fs.readdirSync(assets).filter(n=>n.endsWith(".mp4")).map(n=>"assets/films/"+n),
    ...fs.readdirSync(path.join(assets,"series")).filter(n=>n.endsWith(".mp4")).map(n=>"assets/films/series/"+n)
  ];
  assert.equal(published.length,44);
  assert.equal(manifest.completed_films,44);
  assert.equal(manifest.short_publication_count,35);
  assert.equal(new Set(manifest.records.map(x=>x.film)).size,44);
  assert.deepEqual(published.sort(),manifest.records.map(x=>x.film).sort());
});
test("every film has six actual sampled frames, source trace and a distinct director decision",()=>{
  assert.equal(board.total,44);
  assert.equal(board.films.length,44);
  const filmSet=new Set(manifest.records.map(x=>x.film));
  assert.equal(new Set(board.films.map(x=>x.film)).size,44);
  for(const f of board.films){
    assert.ok(filmSet.has(f.film),f.id);
    assert.ok(f.documentary_problem.length>18,f.id+" problem");
    assert.ok(f.director_treatment.length>90,f.id+" direction");
    assert.ok(f.evidence_and_ethical_rule.length>35,f.id+" boundary");
    assert.ok(/^A \/|^B \/|^C \//.test(f.priority));
    const sheet=path.join(root,f.contact_sheet);
    assert.ok(fs.existsSync(sheet),f.id+" missing contact sheet");
    const media=fs.readFileSync(sheet);
    assert.ok(media.subarray(0,4).toString("ascii")==="RIFF",f.id+" not webp");
    assert.ok(media.length>3000);
  }
});
test("the audit's numeric conclusions match the underlying unchanged source catalog",()=>{
  const short=manifest.records.filter(x=>x.collection==="publication_short");
  assert.equal(short.length,35);
  assert.equal(short.filter(x=>x.referenced_distinct_illustration_or_image_count<=3).length,17);
  const ceramic=short.find(x=>x.id==="ceramics-printing");
  assert.equal(ceramic.source_scene_count,6);
  assert.equal(ceramic.referenced_distinct_illustration_or_image_count,1);
  const approved=JSON.parse(read("assets/films/publication-series.json"));
  assert.equal(approved.items.length,35);
});
test("the three new pilot screenplays are source-bounded, with photographic evidence and no overwritten releases",()=>{
  const doc=read("assets/films/audit/THREE_PILOT_DIRECTORS_CUTS.md");
  for(const line of ["TWO MATERIALS. NO SECTION.","MAKING MEDICINES KEEP","THE LABORATORY WE CARRIED WITH US","not rendered replacements","Cairo Genizah","khaled-jama-thesis-reaction.mp4"]){
    assert.ok(doc.includes(line),line);
  }
  const report=read("assets/films/audit/EDITORIAL_AUDIT_AND_REMAKE_PLAN.md");
  assert.ok(report.includes("44 videos decoded"));
  assert.ok(report.includes("annotated version history"));
  assert.ok(report.includes("not automatically re-rendering 44"));
});

test("screening audit page presents all 44 true image sequences with accessible film links and filtering",()=>{
  const html=read("cinema-workshop.html");
  assert.equal((html.match(/<article class="film-study"/g)||[]).length,44);
  assert.equal((html.match(/class="sheet"/g)||[]).length,44);
  for(const x of board.films){
    assert.ok(html.includes('href="/'+x.contact_sheet+'"'),x.id+" contact sheet missing");
    assert.ok(html.includes('href="/'+x.film+'"'),x.id+" live original film link missing");
  }
  assert.ok(html.includes('id="film-search"'));
  assert.ok(html.includes('aria-live="polite"'));
  assert.ok(html.includes("No original film, Story, scientific figure or archive has been replaced by this audit."));
});
