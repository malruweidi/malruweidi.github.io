import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {join,dirname,resolve} from "node:path";
import {fileURLToPath} from "node:url";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const read=(p)=>readFileSync(join(root,p),"utf8");
test("the three retained film links promise the experience the reader actually receives",()=>{
 const page=read("films/index.html");
 assert.equal((page.match(/class="rx-film-index-tile"/g)||[]).length,3);
 assert.equal((page.match(/Watch the two-minute film ↗/g)||[]).length,3);
 assert.doesNotMatch(page,/source ledger|include an English transcript/i);
 for(const path of ["what-a-bubble-can-do","the-laboratory-we-carried-with-us","making-medicines-keep"]){
   assert.ok(page.includes('href="/films/'+path+'.html"'),path);
   assert.match(read("films/"+path+".html"),/<video\b[^>]*controls/);
 }
});

test("the withdrawn histology documentary is not reintroduced as a public film",()=>{
 const index=read("films/index.html");
 const hub=read("films.html");
 const stories=read("stories.html");
 for(const html of [index,hub,stories]){
   assert.doesNotMatch(html,/href="\/films\/two-materials-no-section\.html"/);
   assert.doesNotMatch(html,/href="\/stories\/failed-zebrafish-histology\.html"/);
 }
});
