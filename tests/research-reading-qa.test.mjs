import {readFileSync,existsSync} from "node:fs";
import {join,resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import test from "node:test";
import assert from "node:assert/strict";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>readFileSync(join(root,p),"utf8");
const dossiers=[
 ["research/pulmonary-epithelial-injury.html","Viability staining and cytoskeletal microscopy"],
 ["research/zebrafish-vascular-cilia.html","Embryonic vessel imaging and flow-dependent phenotypes"],
 ["research/inhalable-vesicles.html","Particle properties, drug assay and aerosol deposition"]
];
test("research dossiers expose a navigable evidence sequence without removing their existing record",()=>{
 for(const [file,title] of dossiers){
  const html=read(file);
  for(const anchor of ["research-question","approach","contribution","evidence-limits","measurement-readouts","primary-source"]){
   assert.match(html,new RegExp('id="'+anchor+'"'),file+" missing "+anchor);
   assert.match(html,new RegExp('href="#'+anchor+'"'),file+" navigation missing "+anchor);
  }
  assert.ok(html.includes(title),file+" missing topic-specific measurement interpretation");
  assert.match(html,/class="rx-research-toc"/);
  assert.match(html,/class="rx-readout-list"/);
  assert.match(html,/class="rx-readout-limits"/);
  assert.match(html,/href="\/#research"/);
  assert.match(html,/id="contribution"/);
 }
});
test("planned thesis readouts are not portrayed as completed outcomes",()=>{
 const html=read("research/inhalable-vesicles.html");
 for(const phrase of ["DLS","NGI","No aerosol deposition, encapsulation efficiencies","planned analytical endpoints","not established"]){
  assert.ok(html.toLowerCase().includes(phrase.toLowerCase()),phrase);
 }
 assert.doesNotMatch(html,/clinically proven|demonstrated therapeutic efficacy/i);
});
test("navigation and measurement interpretation remain bilingual",()=>{
 const translations=read("assets/deep-reading-i18n-2026.js");
 for(const phrase of ["Jump to section","What the measurement can establish","What it does not establish","Viability staining and cytoskeletal microscopy","Embryonic vessel imaging and flow-dependent phenotypes","Particle properties, drug assay and aerosol deposition"]){
  assert.ok(translations.includes(JSON.stringify(phrase)+":"),"translation missing for "+phrase);
 }
 const css=read("assets/deep-reading-2026.css");
 for(const t of ["rx-research-toc","rx-readout-list","rx-readout-limits",'dir="rtl"',"focus-visible","prefers-reduced-motion","@media print"])assert.ok(css.includes(t),t);
});
test("cross-page anchors are checked in the website workflow",()=>{
 assert.ok(existsSync(join(root,"scripts/check-cross-page-anchors.cjs")));
 assert.match(read(".github/workflows/site-integrity.yml"),/check-cross-page-anchors\.cjs/);
});
