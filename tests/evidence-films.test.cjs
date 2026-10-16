const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const load = path => fs.readFileSync(require("node:path").join(root,path),"utf8");
const films = JSON.parse(load("assets/films/evidence-in-motion.json")).films;

test("four independent films retain their exact eight-scene evidence-based narration", () => {
  assert.equal(films.length,4);
  assert.equal(new Set(films.map(f=>f.slug)).size,4);
  const expected = ["what-a-bubble-can-do","two-materials-no-section","the-laboratory-we-carried-with-us","making-medicines-keep"];
  assert.deepEqual(films.map(f=>f.slug),expected);
  for(const f of films){
    assert.equal(f.scenes.length,8);
    for(const [i,s] of f.scenes.entries()){
      assert.equal(s.id,String(i+1).padStart(2,"0"));
      assert.ok(s.narration.length>45);
      assert.ok(s.credit.length>15);
      assert.ok(s.link.startsWith("/"));
      if(s.image) assert.ok(fs.existsSync(path.join(root,s.image.replace(/^\//,""))),s.image);
    }
  }
});

test("failure remains a failed result; pictures are not forged as experimental evidence",()=>{
  const failure=films[1];
  assert.ok(failure.scenes.some(s=>s.credit.includes("no usable section")));
  assert.ok(failure.scenes.some(s=>s.credit.includes("hypothesis")));
  const pulm=films[0];
  assert.ok(pulm.scenes.some(s=>s.credit.includes("no invented readings")));
  assert.ok(pulm.scenes.some(s=>s.credit.includes("not patient-treatment evidence")));
});

test("historical footage is presented as illustration, not genuine medieval artifacts",()=>{
  const history=films[3];
  assert.equal(history.status,"Accepted 15 October 2026; not yet reported as formally published");
  assert.ok(history.scenes.every(s=>!s.image), "never attach an uncleared pseudo-manuscript image");
  assert.ok(history.scenes.some(s=>s.credit.includes("scan deliberately not reproduced")));
  assert.ok(history.scenes.some(s=>s.credit.includes("not modern chemical/bioequivalence")));
});

test("the production workflow and four original editorial pages actually exist",()=>{
  const runner=load("scripts/render-evidence-series.py");
  assert.match(runner,/def illustrate\(/);
  assert.match(runner,/kokoro_onnx/);
  assert.match(runner,/ffprobe/);
  assert.match(runner,/120/);
  const action=load(".github/workflows/render-evidence-series.yml");
  assert.match(action,/render-evidence-series\.py/);
  for(const film of films){
    const page=load("films/"+film.slug+".html");
    assert.ok(page.includes(film.title),film.slug);
    assert.ok(page.includes("assets/films/"+(film.media_stem||film.slug)+".mp4"),film.slug);
    for(const s of film.scenes)assert.ok(page.includes(s.narration),film.slug+" scene "+s.id);
  }
  for(const page of ["research/pulmonary-epithelial-injury.html","stories/failed-zebrafish-histology.html","chem-squad.html"]){
    assert.match(load(page),/rx-film-chapter/,page);
  }
  assert.match(load("engagement.html"),/the-laboratory-we-carried-with-us/);
  assert.match(load("index.html"),/films\/making-medicines-keep\.html/);
});

test("artwork varies with its historical scene and film labels fit their safe areas",()=>{
  const renderer=load("scripts/render-evidence-series.py");
  assert.match(renderer,/def historic_process_plate\(/, "distinct historical process scenes are required");
  assert.match(renderer,/film\["number"\]\+" \/ "\+brief_topic\(film\)/, "short legible film metadata");
  assert.doesNotMatch(renderer,/film\["topic"\]\.upper\(\)\[:59\]/, "never truncate a word in the header");
  assert.match(renderer,/def caption_chunks\(/, "captions must fit two mobile lines");
});
test("all scientific and archive plates link back to a high resolution source",()=>{
  for(const film of films){
    const page=load("films/"+film.slug+".html");
    for(const s of film.scenes){
      if(s.image) assert.ok(page.includes('href="'+s.image+'"'),film.slug+"/"+s.id+" cannot open its original image");
    }
  }
});

test("historical substitution and market-oversight captions keep clear of diagrams",()=>{
  const renderer=load("scripts/render-evidence-series.py");
  assert.match(renderer,/def historic_accountability_plates\(/, "historical layouts should be composed in dedicated bounded regions");
  assert.match(renderer,/assert_labels_fit\(/, "drawn text should be measured and confined to safe panels");
  assert.doesNotMatch(renderer,/write_label\(d,\(488,382\),"NECESSITY/, "remove prior text crossing the panels");
  assert.doesNotMatch(renderer,/write_label\(d,\(170,166\),"WEIGHT, TRUST/, "remove prior balance beam and title overlap");
});

test("sourced context photos have explicit credit, rights and actual source links",()=>{
  const data=JSON.parse(load("assets/films/evidence-in-motion.json"));
  assert.ok(data.visual_sources.length>=6);
  const ids=new Set(data.visual_sources.map(v=>v.id));
  assert.equal(ids.size,data.visual_sources.length);
  for(const asset of data.visual_sources){
    assert.ok(asset.asset.endsWith(".webp"));
    assert.ok(asset.download_url.startsWith("https://cdn.creativeclaw.co/"));
    assert.ok(asset.source_url.startsWith("https://"));
    assert.ok(asset.credit.length>=50);
    assert.ok(asset.license.length>8);
    assert.ok(asset.caption.toUpperCase().includes("NOT")||asset.caption.toUpperCase().includes("CONTEXT")||asset.caption.toUpperCase().includes("ILLUSTRATION"));
  }
  const uses=data.films.flatMap(f=>f.scenes.filter(s=>s.context_visual).map(s=>({f,s})));
  assert.equal(uses.length,6);
  assert.ok([

    "what-a-bubble-can-do:01",
    "two-materials-no-section:07",
    "making-medicines-keep:01",
    "making-medicines-keep:02",
    "making-medicines-keep:03",
    "making-medicines-keep:07"
  ].every(id => uses.some(x => x.f.slug+":"+x.s.id===id)));
  for(const {f,s} of uses){
    assert.ok(ids.has(s.context_visual));
    assert.ok(s.context_use.includes("Does not alter narration"));
    assert.ok(!s.image,"context images must never overwrite original evidence");
  }
  const runner=load("scripts/render-evidence-series.py");
  assert.match(runner,/def render_context_scene\(/);
  assert.match(runner,/def photograph_context_frame\(/);
  assert.match(runner,/source\["caption"\]/, "source caption remains the full landscape film credit");
  assert.match(runner,/on_frame_lines/, "portrait images use source-specific short labels, preserving readability");
  const snapshot=load("scripts/snapshot-evidence-visuals.py");
  assert.match(snapshot,/download_url/);
  assert.match(snapshot,/sha256/);
  assert.match(snapshot,/\.webp/);
});

test("portrait source photographs and manuscript scans stay clear of narration titles",()=>{
  const renderer=load("scripts/render-evidence-series.py");
  assert.match(renderer,/portrait=original\.width\/original\.height<1\.35/);
  assert.match(renderer,/kept\.thumbnail\(\(505,355\)/);
  assert.match(renderer,/image_x=734\+/);
  assert.match(renderer,/image_y=143\+/);
  assert.match(renderer,/image_y\+kept\.height>510/);
  assert.match(renderer,/source\.get\("on_frame_lines"\)/);
  assert.match(renderer,/d\.rounded_rectangle\(\(59,190,668,277\)/);
  assert.doesNotMatch(renderer,/backdrop\.paste\(kept,\(W-52-kept\.width/, "portrait must not fill masthead or left title column");
  assert.match(renderer,/NIH \/ NIAID/, "cite the correct NIH institute");
});
