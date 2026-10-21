"use strict";
/* Evidence-figure inventory integrity: detect inadvertent binary replacement.
 * Git blob SHA is an identity checksum, NOT a publication/permissions audit.
 */
const {test}=require("node:test"),assert=require("node:assert/strict");
const {readFileSync,existsSync}=require("node:fs");
const {join,resolve}=require("node:path");
const {createHash}=require("node:crypto");
const root=resolve(__dirname,"..");
const read=p=>readFileSync(join(root,p),"utf8");
function gitBlobHash(bytes){
 const prefix=Buffer.from("blob "+bytes.length+"\0");
 return createHash("sha1").update(prefix).update(bytes).digest("hex");
}

test("four scientific archive images remain bitwise identical to registered original Git blobs",()=>{
 const manifest=JSON.parse(read("assets/scientific-figure-integrity-2026.json"));
 assert.equal(manifest.entries.length,4);
 for(const item of manifest.entries){
  const pathname=join(root,item.path);
  assert.ok(existsSync(pathname),item.path);
  const bytes=readFileSync(pathname);
  assert.equal(bytes.length,item.size_bytes,item.path+" exact size");
  assert.equal(gitBlobHash(bytes),item.git_blob_sha1,item.path+" original preserved");
  assert.equal(bytes.subarray(0,3).toString("hex"),"ffd8ff",item.path+" JPEG magic");
  assert.ok(read("evidence-viewer.html").includes('src="/'+item.path+'"'));
  assert.ok(typeof item.panel_provenance_verified==="boolean" && !item.panel_provenance_verified);
 }
});

test("provenance table separates verified papers from as-yet unverified figure-panel assignments",()=>{
 const d=JSON.parse(read("assets/scientific-figure-integrity-2026.json"));
 assert.equal(d.entries.filter(e=>e.cited_paper_identified).length,3);
 for(const e of d.entries){
  assert.ok(e.source_context && e.image_role && e.citation_status);
  assert.ok(typeof e.exact_figure_legend_checked==="boolean" && !e.exact_figure_legend_checked);
 }
 const chemistry=d.entries.find(e=>e.id==="chemistry");
 assert.equal(chemistry.cited_paper_identified,false);
 assert.equal(chemistry.project_record,"/grants/urep23.html");
 assert.notEqual(chemistry.separate_related_paper,"");
 assert.ok(d.scope.includes("not"));
});
