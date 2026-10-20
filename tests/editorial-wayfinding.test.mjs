import {readFileSync,existsSync} from "node:fs";
import {resolve,join,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import test from "node:test";
import assert from "node:assert/strict";
const root=resolve(dirname(fileURLToPath(import.meta.url)),".."), read=p=>readFileSync(join(root,p),"utf8");
const home=read("index.html"), stories=read("stories.html");
const chapters=["anatomy","community","living-systems","ramadan-atvb","delivery","molecular-models","community-before-lab","personal-microscope","unfortunate-trials","historical-chemistry","surface-science","research-apparatus","zebrafish-histology-materials","zewail-visit-and-portrait"];
test("bibliography follows research before the long autobiography",()=>{
 assert.ok(home.indexOf('id="research"')<home.indexOf('id="publications"'));
 assert.ok(home.indexOf('id="publications"')<home.indexOf('id="story"'));
 assert.equal((home.match(/id="publications"/g)||[]).length,1);
 for(const anchor of ["pubsearch","publicationlist","filters"]) assert.ok(home.includes('id="'+anchor+'"'));
});
test("six original study dialogs and direct supporting-record links coexist",()=>{
 for(const k of ["lung","zebrafish","polymer","niosomes","robo","echo"]) assert.ok(home.includes('data-project="'+k+'"'));
 assert.ok((home.match(/class="rx-dossier-links"/g)||[]).length>=6);
 for(const link of ["figures.html#pulmonary","figures.html#zebrafish","techniques.html#delivery","stories.html#surface-science"]) assert.ok(home.includes('href="'+link+'"'));
 assert.ok(home.includes('id="rx-research-connection"'));
});
test("themed story journeys retain all fourteen original chapters and index",()=>{
 assert.ok(stories.includes('id="story-pathways"'));
 assert.equal((stories.match(/class="rx-story-route"/g)||[]).length,4);
 assert.ok((stories.match(/class="stories-chapter(?: stories-chapter-tinted)?"/g)||[]).length>=14, "Original chapters must survive additions");
 for(const anchor of chapters){assert.ok(stories.includes('id="'+anchor+'"'),anchor);assert.ok(stories.includes('href="#'+anchor+'"'),anchor);}
 for(const name of ["stories-contents","stories-afterword"]) assert.ok(stories.includes('class="'+name+'"'));
});
test("four editorial index photographs are preserved repository files",()=>{
 for(const p of ["assets/oct12-owner-photos/microscopy-vacation-morning-2017.webp","assets/2026-10-13-new-photos/zebrafish-paraffin-microtomy-failure.webp","assets/evidence-zebrafish.webp","archive/fifth-chemistry-festival-host.webp"]) assert.ok(existsSync(join(root,p)),p);
});
test("new styles retain palette, RTL, focus visibility and reduced-motion",()=>{
 const css=read("assets/editorial-wayfinding-2026.css");
 assert.match(home,/editorial-wayfinding-2026\.css/);assert.match(stories,/editorial-wayfinding-2026\.css/);
 for(const v of ["#17343b","prefers-reduced-motion",'dir="rtl"',"focus-visible"]) assert.ok(css.includes(v),v);
});
test("homepage and story index routes are translated into Arabic",()=>{
 const a=read("assets/homepage-editorial-i18n-2026.js"),b=read("assets/stories-i18n.js");
 for(const k of ["Supporting records","Where the questions connect","Research / Bibliography"]) assert.ok(a.includes('"'+k+'"'),k);
 for(const k of ["Four ways into the stories.","Experiments that resisted","People and scientific exchange"]) assert.ok(b.includes('"'+k+'"'),k);
});
test("original homepage sections and hero remain intact",()=>{
 for(const id of ["patient-perspective","visual-archive","framework","methods","imaging","wisconsin-collaboration","quality","history","writing","press","initiatives","community","quacs","about","contact"]) assert.ok(home.includes('id="'+id+'"'),id);
 for(const k of ["I follow molecules","rx-evidence-index","rx-chapters"]) assert.ok(home.includes(k),k);
});

test("archival object routes retain the existing chronology and photo collection",()=>{
 const ar=read("archive.html");
 assert.ok(ar.includes('id="archive-objects"'));
 assert.ok((ar.match(/class="rx-archive-object"/g)||[]).length>=4, "Original archive objects must survive additions");
 for(const p of ["stories.html#personal-microscope","stories.html#molecular-models","stories.html#zebrafish-histology-materials","stories.html#community"])
   assert.ok(ar.includes('href="'+p+'"'),p);
 for(const cls of ['class="timeline"','class="photo-section"','class="filmstrip"']) assert.ok(ar.includes(cls),cls);
 assert.match(ar,/editorial-wayfinding-2026\.css/);
 assert.match(ar,/archive-wayfinding-i18n-2026.js/);
});

test("15 October photographs remain published, traceable and linked to their chapters",()=>{
 const ar=read("archive.html"), provenance=JSON.parse(read("assets/owner-archive-2026-10-15-manifest.json"));
 assert.equal(provenance.entries.length,4);
 const chapterTargets=["undergraduate-imines","unfortunate-trials","research-apparatus"];
 for(const anchor of chapterTargets) assert.ok(stories.includes('id="'+anchor+'"'),anchor);
 for(const entry of provenance.entries){
  assert.ok(existsSync(join(root,entry.target)),entry.target);
  assert.ok(stories.includes('/'+entry.target),entry.target+' in stories');
  assert.ok(ar.includes('/'+entry.target),entry.target+' in archive');
 }
 for(const link of ["stories.html#undergraduate-imines","stories.html#unfortunate-trials","stories.html#research-apparatus"])
  assert.ok(ar.includes('href="'+link+'"'),link);
});
