const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const p=rel=>fs.readFileSync(path.join(root,rel),"utf8");
test("a pulmonary documentary may never use a pharmacy manuscript as its final source",()=>{
 const data=JSON.parse(p("assets/films/evidence-in-motion.json"));
 const film=data.films.find(f=>f.slug==="what-a-bubble-can-do");
 assert.equal(film.media_stem,"what-a-bubble-can-do-evidence-v2");
 assert.equal(film.scenes[7].visual,"publication");
 assert.equal(film.publication,"https://doi.org/10.1152/japplphysiol.00574.2020");
 const renderer=p("scripts/render-evidence-series.py");
 assert(renderer.includes('elif film["slug"]=="what-a-bubble-can-do"'));
 assert(renderer.includes("J Appl Physiol (2021)"));
 assert(renderer.includes("10.1152/japplphysiol.00574.2020"));
 assert(fs.existsSync(path.join(root,"assets/films/what-a-bubble-can-do.mp4")));
});
test("failed zebrafish histology film must not depict a different laboratory's microtome",()=>{
 const data=JSON.parse(p("assets/films/evidence-in-motion.json"));
 const film=data.films.find(f=>f.slug==="two-materials-no-section");
 assert.equal(film.media_stem,"two-materials-no-section-source-v2");
 assert.equal(film.scenes[6].visual,"agarose");
 assert(!Object.hasOwn(film.scenes[6],"context_visual"));
 assert(!Object.hasOwn(film.scenes[6],"image_url"));
 assert(fs.existsSync(path.join(root,"assets/films/two-materials-no-section.mp4")));
});
test("cerebral-cilia and anticancer stories cannot inherit another study's source image",()=>{
 const art=p("scripts/film-art-direction-v7.py");
 const cilia=art.match(/"cerebral-cilia":\s*\[([^\]]*)\]/);
 const synthesis=art.match(/"heterocycle-cancer":\s*\[([^\]]*)\]/);
 assert(cilia && cilia[1].trim()==="");
 assert(synthesis && synthesis[1].trim()==="");
});
