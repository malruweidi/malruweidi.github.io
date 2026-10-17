const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
test("pulmonary documentary page plays corrected V2, preserves V1 and cites source-specific paper",()=>{
 const html=read("films/what-a-bubble-can-do.html");
 const base="/assets/films/what-a-bubble-can-do-evidence-v2";
 assert(html.includes('<source src="'+base+'.mp4" type="video/mp4">'));
 assert(html.includes('src="'+base+'.vtt"'));
 assert(html.includes('href="/assets/films/what-a-bubble-can-do.mp4"'));
 assert(html.includes('href="/assets/films/what-a-bubble-can-do.vtt"'));
 assert.match(html,/2021.*Journal of Applied Physiology|2021.*Journal|Journal of Applied Physiology/i);
 for(const ext of [".mp4",".vtt","-build.json"]){
   const fp=path.join(root,"assets/films/what-a-bubble-can-do-evidence-v2"+ext);
   assert(fs.existsSync(fp),"V2 movie or manifest missing: "+fp);
 }
 const manifest=JSON.parse(read("assets/films/what-a-bubble-can-do-evidence-v2-build.json"));
 assert.equal(manifest.chapters,8);
 assert(Math.abs(manifest.seconds-120)<0.2);
});
test("histology pages and central film hub play source-corrected V2, while both original cuts survive",()=>{
 const html=read("films/two-materials-no-section.html");
 const hub=read("films.html");
 const base="/assets/films/two-materials-no-section-source-v2";
 for(const page of [html,hub]){
  assert(page.includes('<source src="'+base+'.mp4" type="video/mp4">'));
  assert(page.includes('src="'+base+'.vtt"'));
 }
 assert(html.includes('href="/assets/films/two-materials-no-section-evidence-cut.mp4"'));
 assert(hub.includes('href="/assets/films/two-materials-no-section-evidence-cut.mp4"'));
 assert(hub.includes('href="/assets/films/two-materials-no-section.mp4"'));
 for(const name of ["two-materials-no-section.mp4","two-materials-no-section-evidence-cut.mp4","two-materials-no-section-source-v2.mp4",
                   "two-materials-no-section-source-v2.vtt","two-materials-no-section-source-v2-build.json"]){
  assert(fs.existsSync(path.join(root,"assets/films",name)),"Missing preserved movie: "+name);
 }
 const build=JSON.parse(read("assets/films/two-materials-no-section-source-v2-build.json"));
 assert.equal(build.chapters,8);
 assert(Math.abs(build.seconds-120)<0.2);
});
test("corrected film notes do not contain references to unrelated archival equipment or false outcomes",()=>{
 const data=JSON.parse(read("assets/films/evidence-in-motion.json"));
 const pulmonary=data.films.find(f=>f.slug==="what-a-bubble-can-do");
 const histology=data.films.find(f=>f.slug==="two-materials-no-section");
 assert(pulmonary.publication.endsWith("10.1152/japplphysiol.00574.2020"));
 assert.equal(pulmonary.scenes.at(-1).visual,"publication");
 assert(!histology.scenes.some(x=>x.context_visual==="generic-microtome"));
 assert(histology.scenes.some(x=>/did not establish/i.test(x.narration)));
});
