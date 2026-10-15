"use strict";
// Cross-page anchor audit for static, author-visible HTML hyperlinks.
// No changes to page content; only links with explicit static URL fragments are checked.
const fs=require("node:fs"), path=require("node:path");
const root=path.resolve(__dirname,"..");
const files=[];
(function walk(dir){
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  if([".git","node_modules",".DS_Store"].includes(entry.name))continue;
  const f=path.join(dir,entry.name);
  if(entry.isDirectory())walk(f);
  else if(entry.isFile() && entry.name.endsWith(".html"))files.push(path.relative(root,f).split(path.sep).join("/"));
 }
})(root);
const html=new Map(files.map(p=>[p,fs.readFileSync(path.join(root,p),"utf8")]));
const stripNonMarkup=s=>s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"")
 .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,"")
 .replace(/<!--[\s\S]*?-->/g,"");
const ids=new Map([...html.entries()].map(([name,source])=>[name,new Set([...stripNonMarkup(source).matchAll(/\bid\s*=\s*(["'])([^"']+)\1/g)].map(m=>m[2]))]));
const missing=[],count={checked:0,anchors:0};
function resolveLink(origin,href){
 if(!href || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href) || /[{}]/.test(href))return null;
 const hashIndex=href.indexOf("#");if(hashIndex<0)return null;
 const frag=href.slice(hashIndex+1);if(!frag)return null;
 let pathname=href.slice(0,hashIndex).split("?")[0];
 let target;
 if(!pathname)target=origin;
 else if(pathname==="/")target="index.html";
 else if(pathname.startsWith("/"))target=pathname.slice(1);
 else target=path.posix.join(path.posix.dirname(origin),pathname);
 target=path.posix.normalize(target);
 if(target.endsWith("/"))target+="index.html";
 if(target===".")target="index.html";
 if(!target.endsWith(".html")||target.startsWith("../"))return null;
 let fragment;
 try{fragment=decodeURIComponent(frag)}catch{return null}
 return {target,fragment};
}
for(const [file,source] of html){
 const clean=stripNonMarkup(source);
 for(const m of clean.matchAll(/<a\b[^>]*\bhref\s*=\s*(["'])([^"']+)\1[^>]*>/gi)){
  count.checked++;
  const link=resolveLink(file,m[2]);if(!link)continue;
  count.anchors++;
  if(html.has(link.target)&&!ids.get(link.target).has(link.fragment))missing.push(file+" -> "+m[2]+" (missing #"+link.fragment+" on "+link.target+")");
 }
}
if(missing.length){console.error("FAIL "+missing.length+" cross-page anchors missing:\n"+missing.join("\n"));process.exitCode=1;}
else console.log("PASS "+count.anchors+" static fragment links checked across "+files.length+" HTML pages ("+count.checked+" hyperlinks inspected).");
