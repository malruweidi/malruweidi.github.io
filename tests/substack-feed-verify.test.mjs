import {readFileSync} from "node:fs";
import {join,resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {createRequire} from "node:module";
import test from "node:test";
import assert from "node:assert/strict";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const read=file=>readFileSync(join(root,file),"utf8");
const require=createRequire(import.meta.url);
const {parseFeed,compareManifestToFeed}=require("../scripts/substack-feed-verify.cjs");
const manifest=JSON.parse(read("assets/current-substack.json"));
const makeFeed=(posts)=>'<?xml version="1.0"?><rss version="2.0"><channel><title>Mahmoud Al-Ruweidi</title>'+posts.map(p=>'<item><title><![CDATA['+p.title+']]></title><link>'+p.url+'</link><guid>'+p.url+'</guid></item>').join("")+'</channel></rss>';
test("feed comparison recognizes the current five canonical Substack posts",()=>{
 const feed=parseFeed(makeFeed(manifest.entries));
 assert.equal(feed.length,5);
 assert.deepEqual(compareManifestToFeed(manifest,feed),{added:[],missing:[],changed:[]});
});
test("new post and withdrawn post generate explicit actionable discrepancies",()=>{
 const newPost={title:"New Essay",url:"https://malruweidi.substack.com/p/new-essay"};
 const feed=parseFeed(makeFeed([...manifest.entries.slice(1),newPost]));
 const diff=compareManifestToFeed(manifest,feed);
 assert.deepEqual(diff.added,["new-essay"]);
 assert.deepEqual(diff.missing,["the-life-between-diagnoses"]);
});
test("the feed parser ignores off-publication links and identifies title changes",()=>{
 const fed=parseFeed(makeFeed([{title:"Fake outside",url:"https://other.substack.com/p/essay"},
   {...manifest.entries[0],title:"Revised published title"}]));
 assert.equal(fed.length,1);
 assert.deepEqual(compareManifestToFeed({...manifest,entries:[manifest.entries[0]]},fed),{added:[],missing:[],changed:["the-life-between-diagnoses"]});
});
test("public writing page presents source feed and distinct non-duplicating reading pathways",()=>{
 const html=read("writing.html"),css=read("assets/writing-2026.css"),lang=read("assets/writing-i18n-2026.js");
 assert.ok(html.includes('rel="alternate" type="application/rss+xml"'));
 assert.ok(html.includes('href="https://malruweidi.substack.com/feed"'));
 assert.ok(html.includes('id="reading-connections"'));
 assert.ok(html.includes('class="rxw-reading-paths"'));
 for(const path of ["/illness-and-evidence.html","/#history","/stories.html"])assert.ok(html.includes('href="'+path+'"'),path);
 assert.ok(css.includes(".rxw-reading-paths"));
 assert.ok(css.includes("prefers-reduced-motion")&&css.includes('dir="rtl"')&&css.includes("@media print"));
 for(const key of ["Read across the record.","Publication feed · RSS","These are related reading routes, not supporting evidence for the essays."]){
  assert.ok(lang.includes(JSON.stringify(key)+":"),key+" needs Arabic translation");
 }
});
test("the checker cannot silently republish deleted entries or alter site files",()=>{
 const script=read("scripts/substack-feed-verify.cjs");
 assert.ok(script.includes("https://malruweidi.substack.com/feed"));
 assert.ok(script.includes("manifest"));
 assert.ok(!script.includes("writeFileSync")&&!script.includes("createWriteStream"));
 assert.ok(read(".github/workflows/substack-publication-verify.yml").includes("workflow_dispatch"));
 assert.ok(!read(".github/workflows/substack-publication-verify.yml").includes("schedule:"));
});
