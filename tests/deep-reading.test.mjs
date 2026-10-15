import {readFileSync,existsSync} from "node:fs";
import {resolve,join,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import test from "node:test";
import assert from "node:assert/strict";
const root=resolve(dirname(fileURLToPath(import.meta.url)),".."), read=p=>readFileSync(join(root,p),"utf8");
const story=read("stories.html"),home=read("index.html"),index=JSON.parse(read("assets/discovery-index.json"));
const storyRoutes=[
 ["stories/cairo-microscope.html","personal-microscope"],
 ["stories/failed-zebrafish-histology.html","zebrafish-histology-materials"],
 ["stories/unfortunate-copolymer-trials.html","unfortunate-trials"],
 ["stories/ramadan-microscope.html","ramadan-atvb"]];
const researchRoutes=[
 ["research/pulmonary-epithelial-injury.html","10.1152/japplphysiol.00574.2020"],
 ["research/zebrafish-vascular-cilia.html","10.1161/ATVBAHA.118.311231"],
 ["research/inhalable-vesicles.html","In progress"]];
test("standalone articles contain all original story chapters without abbreviation",()=>{
 for(const [file,id] of storyRoutes){
  assert.ok(existsSync(join(root,file)),file);
  const body=read(file);
  const chapterMatch=new RegExp('<section class="stories-chapter(?: stories-chapter-tinted)?" id="'+id+'"').exec(story);
  assert.ok(chapterMatch,"original story section missing: "+id);
  const begin=chapterMatch.index, closing=story.indexOf("</section>",begin);
  const original=story.slice(begin,closing+"</section>".length);
  assert.ok(body.includes(original),"original story changed or omitted: "+id);
  assert.ok(body.includes('href="/stories.html#'+id+'"'),"missing original chapter route: "+file);
  assert.ok(story.includes('href="/'+file+'"'),"collection lacks article: "+file);
 }
});
test("dossiers distinguish studies and ongoing work",()=>{
 for(const [file,marker] of researchRoutes){
  assert.ok(existsSync(join(root,file)),file);
  const body=read(file);
  assert.ok(body.includes(marker),"dossier missing source/status: "+file);
  assert.ok(body.includes('id="research-question"'),"scientific question missing: "+file);
  assert.ok(body.includes('id="contribution"'),"contribution missing: "+file);
  assert.ok(body.includes('id="evidence-limits"'),"evidence limitations missing: "+file);
  assert.ok(home.includes('href="/'+file+'"'),"homepage fails to link dossier: "+file);
 }
 assert.match(read("research/inhalable-vesicles.html"),/No aerosol deposition, encapsulation efficiencies/);
 assert.match(read("research/zebrafish-vascular-cilia.html"),/collaborative/);
});
test("article pages use one shared design system, canonical, accessible metadata and bilingual controls",()=>{
 const detail=read("assets/deep-reading-2026.css");
 for(const [path] of [...storyRoutes,...researchRoutes]){
  const body=read(path), h=body.split("</head>")[0];
  assert.equal((body.match(/<h1\b/g)||[]).length,1,path);
  assert.match(h,/rel="canonical"/);
  assert.match(h,/property="og:image"/);
  assert.match(body,/assets\/deep-reading-2026.css/);
  assert.match(body,/assets\/i18n.js/);
  assert.match(body,/assets\/deep-reading-i18n-2026.js/);
  assert.match(body,/<main\b/);
  assert.match(body,/<nav\b/);
 }
 for(const phrase of ["prefers-reduced-motion",'dir="rtl"',"focus-visible"])assert.ok(detail.includes(phrase));
 assert.match(read("assets/deep-reading-i18n-2026.js"),/RuwaidixArabicDictionary/);
});
test("new pages appear in sitemap and the existing bilingual search",()=>{
 const sitemap=read("sitemap.xml");
 assert.equal(index.items.length,50);
 for(const [file] of [...storyRoutes,...researchRoutes]){
  assert.ok(sitemap.includes('https://malruweidi.github.io/'+file),file);
  assert.ok(index.items.some(x=>x.url==='/'+file),file);
 }
});
test("original site remains intact, including the six project dialogs and fourteen stories",()=>{
 for(const id of ["research","story","publications","patient-perspective","framework","quality","history","writing","quacs"])assert.ok(home.includes('id="'+id+'"'));
 for(const key of ["lung","zebrafish","polymer","niosomes","echo","robo"])assert.ok(home.includes('data-project="'+key+'"'));
 for(const id of ["anatomy","community","living-systems","ramadan-atvb","delivery","molecular-models","community-before-lab","personal-microscope","unfortunate-trials","historical-chemistry","surface-science","research-apparatus","zebrafish-histology-materials","zewail-visit-and-portrait"])assert.ok(story.includes('id="'+id+'"'),id);
});
