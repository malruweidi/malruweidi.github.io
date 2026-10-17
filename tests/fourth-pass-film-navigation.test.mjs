import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {join,dirname,resolve} from "node:path";
import {fileURLToPath} from "node:url";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const read=(p)=>readFileSync(join(root,p),"utf8");
test("the four film links promise the experience the reader actually receives",()=>{
 const page=read("films/index.html");
 assert.equal((page.match(/class="rx-film-index-tile"/g)||[]).length,4);
 assert.equal((page.match(/Watch the two-minute film ↗/g)||[]).length,4);
 assert.doesNotMatch(page,/source ledger|include an English transcript/i);
 for(const path of ["what-a-bubble-can-do","two-materials-no-section","the-laboratory-we-carried-with-us","making-medicines-keep"]){
   assert.ok(page.includes('href="/films/'+path+'.html"'),path);
   assert.match(read("films/"+path+".html"),/<video\b[^>]*controls/);
 }
});
