import preservation from "./homepage-preservation.cjs";
import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {resolve,dirname,join} from "node:path";
import {fileURLToPath} from "node:url";
import vm from "node:vm";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>readFileSync(join(root,p),"utf8");
const tags='<link rel="stylesheet" href="/assets/atlas-of-questions-2026.css?v=20261118"><script src="/assets/atlas-of-questions-2026.js?v=20261118" defer></script>';
const pagePaths=["index.html","research.html","publications.html","films.html","stories.html","writing.html","archive.html","chem-squad.html","leadership.html","molecular-therapeutics.html","methods-evidence.html","computing.html","illness-and-evidence.html","major-revisions.html","engagement.html","publication-cinema.html","moving-evidence.html","cv.html","grants.html","reading-map.html","search.html","for-supervisors.html","training.html","film.html","research-horizon.html"];

test("homepage preserves the full original record across editorial rearrangement",()=>{
 const original=read("home-legacy-2026.html"),enhanced=read("index.html");
 assert.equal(enhanced.split(tags.replace("js?v=20261118", "js?v=20261118-scenes")).length,2,"only one atlas reference pair");
 assert.equal(enhanced.match(/<link rel="stylesheet" href="\/assets\/ruwaidix-one-blue-2026\.css(?:\?[^"]*)?">/g)?.length,1,"single blue stylesheet required");
 preservation.assertHomepagePreserved(original,enhanced);
 assert.match(enhanced,/anatomy-of-a-question-2026-v2\.mp4/);
 assert.match(enhanced,/anatomy-of-a-question-2026-v2\.vtt/);
 for(const route of ["research.html","publications.html","films.html","stories.html","illness-and-evidence.html","writing.html","chem-squad.html","leadership.html","major-revisions.html"]){
   assert.ok(enhanced.includes('href="/'+route+'"'),"collection missing: "+route);
 }
});
test("all enhanced collections load exactly one pair of additive assets",()=>{
 for(const page of pagePaths){
   const source=read(page);
   assert.equal(source.split(page === "index.html" ? tags.replace("js?v=20261118", "js?v=20261118-scenes") : tags).length,2,"missing or duplicated asset pair: "+page);
 }
});
test("atlas script parses and provides bilingual keyboard-accessible navigation",()=>{
 const js=read("assets/atlas-of-questions-2026.js"),css=read("assets/atlas-of-questions-2026.css");
 assert.doesNotThrow(()=>new vm.Script(js),"JavaScript syntax error");
 for(const phrase of ["aria-modal","aria-pressed","aria-live","aria-expanded","MutationObserver","question-atlas","prefers-reduced-motion"]){
   assert.ok((js+css).includes(phrase),"missing expected feature: "+phrase);
 }
 assert.match(js,/السجل|الأرشيف/);
 assert.doesNotMatch(css,/(?:^|})\s*(?:html|body|video|header|main)\s*\{/gm,"global CSS risks changing source content");
});
test("all atlas section-deep-links resolve to existing source anchors",()=>{
 const js=read("assets/atlas-of-questions-2026.js");
 const found=[...js.matchAll(/\["([a-z0-9-]+\.html#[a-z0-9-]+)"/gi)].map(x=>x[1]);
 assert.ok(found.length>=8,"expected linked scientific threads");
 for(const target of found){
   const [file,id]=target.split("#");
   assert.ok(existsSync(join(root,file)),"missing file: "+file);
   const source=read(file);
   assert.ok(source.includes('id="'+id+'"')||source.includes("id='"+id+"'"),"missing anchor: "+target);
 }
});
