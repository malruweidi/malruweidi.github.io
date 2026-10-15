"use strict";
/*
 * Read-only verification of Ruwaidix's maintained public Substack index against
 * the publisher's current RSS feed. No website files are changed automatically.
 * Usage: node scripts/substack-feed-verify.cjs --live
 * Network checks live in the opt-in workflow_dispatch job, not the release
 * integrity suite, so temporary Substack/network errors cannot block Pages.
 */
const fs=require("node:fs");
const path=require("node:path");
const https=require("node:https");
const FEED="https://malruweidi.substack.com/feed";
const ROOT=path.resolve(__dirname,"..");
const normalize=s=>String(s||"").trim().replace(/\s+/g," ");
function xmlDecode(v){
 return String(v).replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi,(match,entity)=>{
  const preset={amp:"&",lt:"<",gt:">",quot:'"',apos:"'"};
  if(preset[entity])return preset[entity];
  const n=entity[1]==="x"?parseInt(entity.slice(2),16):parseInt(entity.slice(1),10);
  return Number.isInteger(n)&&n>=0&&n<=0x10ffff?String.fromCodePoint(n):match;
 });
}
function extractTag(chunk,tag){
 const m=new RegExp("<"+tag+"(?:\\s[^>]*)?>([\\s\\S]*?)<\\/"+tag+">","i").exec(chunk);
 if(!m)return "";
 return normalize(xmlDecode(m[1].replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/,"$1")));
}
function canonicalEntry(href){
 try{
  const u=new URL(href);
  if(u.protocol!=="https:"||u.hostname!=="malruweidi.substack.com")return null;
  const m=/^\/p\/([a-z0-9-]+)\/?$/i.exec(u.pathname);
  return m?m[1]:null;
 }catch{return null;}
}
function parseFeed(xml){
 if(!/<rss\b/i.test(xml)||!/<channel\b/i.test(xml))throw Error("Publication feed was not recognizable RSS XML");
 const seen=new Map();
 for(const match of xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)){
  const body=match[1],url=extractTag(body,"link"),slug=canonicalEntry(url),title=extractTag(body,"title");
  if(slug&&title&&!seen.has(slug))seen.set(slug,{slug,title,url:"https://malruweidi.substack.com/p/"+slug});
 }
 if(!seen.size)throw Error("Publication feed contained no recognizable public posts; refusing to claim all essays deleted");
 return [...seen.values()];
}
function compareManifestToFeed(manifest,feed){
 if(!manifest||!Array.isArray(manifest.entries)||!Array.isArray(feed)||!feed.length)throw Error("Manifest or source-feed data is missing");
 const before=new Map(manifest.entries.map(x=>[x.slug,x]));
 const current=new Map(feed.map(x=>[x.slug,x]));
 const added=[...current.keys()].filter(x=>!before.has(x)).sort();
 // The Substack RSS window currently includes every post. Once the feed
 // reaches 20 entries, older posts may simply fall outside that window;
 // don't report those as withdrawn on RSS evidence alone.
 const missing=feed.length>=20?[]:[...before.keys()].filter(x=>!current.has(x)).sort();
 const changed=[...current].filter(([id,p])=>before.has(id)&&normalize(before.get(id).title)!==normalize(p.title)).map(([id])=>id).sort();
 return {added,missing,changed};
}
function fetchXml(url,redirects=0){
 if(redirects>3) return Promise.reject(Error("Too many redirects"));
 return new Promise((resolve,reject)=>{
  const request=https.get(url,{timeout:20000,headers:{"User-Agent":"Ruwaidix-Publication-Integrity/1.0 (+https://malruweidi.github.io/writing.html)","Accept":"application/rss+xml, application/xml, text/xml"}},response=>{
   const status=response.statusCode||0;
   if(status>=300&&status<400&&response.headers.location){
    const next=new URL(response.headers.location,url);
    response.resume();
    if(next.protocol!=="https:"||next.hostname!=="malruweidi.substack.com")return reject(Error("Untrusted feed redirect target"));
    return resolve(fetchXml(next.href,redirects+1));
   }
   if(status!==200){response.resume();return reject(Error("Substack source returned HTTP "+status));}
   const parts=[];let total=0;
   response.on("data",chunk=>{total+=chunk.length;if(total>2_500_000){response.destroy(Error("RSS feed unexpectedly large"));return;}parts.push(chunk);});
   response.on("end",()=>resolve(Buffer.concat(parts).toString("utf8")));
   response.on("error",reject);
  });
  request.on("timeout",()=>request.destroy(Error("Substack RSS verification timed out")));
  request.on("error",reject);
 });
}
async function main(){
 if(!process.argv.includes("--live"))throw Error("Source verification is opt-in: run with --live");
 const file=path.join(ROOT,"assets","current-substack.json");
 const manifest=JSON.parse(fs.readFileSync(file,"utf8"));
 if(manifest.source_feed!==FEED)throw Error("Manifest feed URL mismatch");
 const xml=await fetchXml(FEED);
 const feed=parseFeed(xml),issues=compareManifestToFeed(manifest,feed);
 console.log("Checked "+feed.length+" RSS publications against "+manifest.entries.length+" indexed articles. Verified snapshot date: "+manifest.verified_on);
 if(issues.added.length||issues.missing.length||issues.changed.length){
  if(issues.added.length)console.error("NEW ARTICLE(S), inspect & publish intentionally: "+issues.added.join(", "));
  if(issues.missing.length)console.error("MISSING FROM RSS (check archive before changing links): "+issues.missing.join(", "));
  if(issues.changed.length)console.error("CHANGED TITLE(S), inspect article: "+issues.changed.join(", "));
  process.exitCode=1;
 } else console.log("PASS: the maintained collection matches the current public RSS feed. No site content changed.");
}
if(require.main===module)main().catch(e=>{console.error("Unable to verify source: "+e.message);process.exitCode=2;});
module.exports={parseFeed,compareManifestToFeed,canonicalEntry};
