#!/usr/bin/env node
/* Read-only structural inventory across all HTML routes, including the large
 * scientific figure atlas. This tool does NOT verify the image pixels,
 * provenance, the paper's figure legend or permission to redistribute.
 *
 * node scripts/audit-figure-archive-2026.cjs --summary
 * node scripts/audit-figure-archive-2026.cjs --output /tmp/figures.json
 */
"use strict";
const fs=require("node:fs"),path=require("node:path");
function htmlFiles(root){
 const files=[];
 function walk(dir){
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
   if(e.name===".git" || e.name==="node_modules")continue;
   const abs=path.join(dir,e.name);
   if(e.isDirectory())walk(abs);
   else if(e.isFile()&&e.name.endsWith(".html"))files.push(path.relative(root,abs).split(path.sep).join("/"));
  }
 }
 walk(root);
 return files.sort();
}
function attr(t,k){
 const m=t.match(new RegExp("(?:^|\\s)"+k+"\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)')","i"));
 return m ? (m[1]===undefined?m[2]:m[1]):null;
}
function cleanse(s){
 return s.replace(/<[^>]*>/g," ").replace(/&amp;/g,"&")
  .replace(/\s+/g," ").trim().slice(0,260);
}
function lines(s){
 const offsets=[0];
 for(let i=0;i<s.length;i++)if(s.charCodeAt(i)===10)offsets.push(i+1);
 return offsets;
}
function lineAt(offset,starts){
 let low=0,high=starts.length-1;
 while(low<=high){
  let mid=(low+high)>>1;
  if(starts[mid]<=offset)low=mid+1;
  else high=mid-1;
 }
 return high+1;
}
function displayUrl(u){
 if(!u)return null;
 if(/^data:/i.test(u))return "[inline media; data omitted]";
 return u.length>450 ? "[long/dynamic src; data omitted]" : u;
}
function resolveUrl(root,page,url){
 if(!url)return "unspecified";
 if(/^data:/i.test(url))return "embedded-unverified";
 if(/^(https?:)?\/\//i.test(url))return "external-unverified";
 if(/^(blob:|javascript:)/i.test(url))return "dynamic-unverified";
 const raw=url.split(/[?#]/)[0];
 if(!raw)return "dynamic-unverified";
 const rel=raw.startsWith("/") ? raw.slice(1) : path.posix.normalize(path.posix.join(path.posix.dirname(page),raw));
 if(rel===".."||rel.startsWith("../"))return "outside-repository";
 return fs.existsSync(path.join(root,rel)) ? "local-present":"local-missing";
}
function auditFigures(root){
 const pages={};
 const stats={pagesExamined:0,figureElements:0,figureImages:0,missingAltAttributes:0,
  decorativeEmptyAlt:0,figuresWithoutCaptions:0,missingLocalImageReferences:0};
 for(const page of htmlFiles(root)){
  const html=fs.readFileSync(path.join(root,page),"utf8");
  const offsets=lines(html);
  const figures=[],source=html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,
    x=>x.replace(/[^\n\r]/g," "));
  for(const m of source.matchAll(/<figure\b[^>]*>[\s\S]*?<\/figure>/gi)){
   const chunk=m[0];
   const imgs=[];
   for(const match of chunk.matchAll(/<img\b[^>]*>/gi)){
    const img=match[0],u=attr(img,"src"),alt=attr(img,"alt");
    imgs.push({url:displayUrl(u),availability:resolveUrl(root,page,u),
      altText:alt,declaredWidth:attr(img,"width"),declaredHeight:attr(img,"height")});
    stats.figureImages++;
    if(alt===null)stats.missingAltAttributes++;
    else if(alt==="")stats.decorativeEmptyAlt++;
    if(resolveUrl(root,page,u)==="local-missing")stats.missingLocalImageReferences++;
   }
   const cap=/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/i.exec(chunk);
   if(!cap)stats.figuresWithoutCaptions++;
   const doi=[...chunk.matchAll(/https?:\/\/doi\.org\/(10\.[0-9]{4,9}\/[^\s"'<>]+)/gi)]
    .map(d=>d[1].replace(/&amp;/g,"&").replace(/[.,;]$/,""));
   const anchorCount=(chunk.match(/<a\b/g)||[]).length;
   figures.push({
    figureOrdinal:figures.length+1,sourceOffset:m.index,sourceLine:lineAt(m.index,offsets),
    captionPresent:!!cap,captionExcerpt:cap?cleanse(cap[1]):null,
    figureImages:imgs,paperIdentifiers:[...new Set(doi)],
    contextLinkCount:anchorCount
   });
   stats.figureElements++;
  }
  pages[page]={sourceBytes:Buffer.byteLength(html,"utf8"),figures};
  stats.pagesExamined++;
 }
 return {notes:"Read-only HTML structural scan, not an image-pixel review, visual crop audit, rights clearance, original paper-panel identity check, figure image authentication, or assessment of dynamically injected galleries.",stats,pages};
}
module.exports={auditFigures};
if(require.main===module){
 const root=path.resolve(__dirname,".."),args=process.argv.slice(2);
 const data=auditFigures(root);
 const ix=args.indexOf("--output");
 if(ix!==-1){
  if(!args[ix+1])throw Error("--output requires a file path");
  fs.writeFileSync(path.resolve(args[ix+1]),JSON.stringify(data,null,2)+"\n");
 } else if(args.includes("--summary")){
  process.stdout.write(JSON.stringify({notes:data.notes,stats:data.stats,
    pages:Object.fromEntries(Object.entries(data.pages).map(([k,v])=>[k,
      {bytes:v.sourceBytes,figures:v.figures.length,images:v.figures.reduce((n,f)=>n+f.figureImages.length,0)}]))},null,2)+"\n");
 } else process.stdout.write(JSON.stringify(data,null,2)+"\n");
}
