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
