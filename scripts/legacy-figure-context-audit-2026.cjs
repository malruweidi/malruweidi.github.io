#!/usr/bin/env node
/* Read-only contextual inventory of preserved embedded figures in the
 * large historical record. Never outputs embedded media or edits that record.
 * Usage: node scripts/legacy-figure-context-audit-2026.cjs [--unresolved]
 */
"use strict";
const fs=require("node:fs"),path=require("node:path");

function attr(tag,key){
 const m=tag.match(new RegExp("(?:^|\\s)"+key+"\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)')","i"));
 return m ? (m[1]===undefined?m[2]:m[1]):null;
}
function clean(s,limit=280){
 return s.replace(/<img\b[^>]*>/gi," [existing image] ")
  .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi," ")
  .replace(/<[^>]*>/g," ")
  .replace(/[A-Za-z0-9+/=]{120,}/g," [opaque data withheld] ")
  .replace(/&nbsp;|&#160;/g," ").replace(/&amp;/g,"&")
  .replace(/&lt;/g,"<").replace(/&gt;/g,">")
  .replace(/\s+/g," ").trim().slice(0,limit);
}
function scrubSrc(url){
 if(!url)return {type:"unknown",url:null};
 if(/^data:/i.test(url))return {type:"embedded",url:"[inline image data withheld]"};
 if(/^https?:/i.test(url))return {type:"remote",url:url.slice(0,180)};
 return {type:"local",url:url.slice(0,180)};
}
function lineOf(source,offset){
 let count=1;
 for(let i=0;i<offset;i++)if(source.charCodeAt(i)===10)count++;
 return count;
}
function scanLegacyFigures(root){
 const page="full-record.html",html=fs.readFileSync(path.join(root,page),"utf8");
 let precedingEnd=0,ordinal=0;
 const figures=[],headingPattern=/<h([1-4])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
 const headings=[...html.matchAll(headingPattern)].map(m=>({offset:m.index,text:clean(m[2],200)}));
 for(const match of html.matchAll(/<figure\b[^>]*>[\s\S]*?<\/figure>/gi)){
  ordinal++;
  const start=match.index,body=match[0],firstTag=body.match(/^<figure\b[^>]*>/i)?.[0]||"";
  const images=[...body.matchAll(/<img\b[^>]*>/gi)].map(m=>({
   ...scrubSrc(attr(m[0],"src")),
   alt:(attr(m[0],"alt")||"").slice(0,220)
  }));
  const cap=/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/i.exec(body);
  const accessible=attr(firstTag,"aria-label")||attr(firstTag,"aria-labelledby");
  const heading=[...headings].reverse().find(h=>h.offset<start);
  const afterEnd=html.indexOf("<figure",start+body.length);
  const after=html.slice(start+body.length,Math.min(start+body.length+1700,afterEnd<0?html.length:afterEnd));
  figures.push({
   ordinal,line:lineOf(html,start),characterOffset:start,
   heading:heading?.text||"",
   figureRole:attr(firstTag,"class")||"",
   captionPresent:!!cap,captionExcerpt:cap?clean(cap[1],250):null,
   hasEquivalentLabel:Boolean(accessible),
   accessibilityReference:accessible?accessible.slice(0,150):null,
   images,
   previousContext:clean(html.slice(Math.max(precedingEnd,start-1800),start)).slice(-280),
   figureText:clean(body,260),
   followingContext:clean(after,280),
   reviewStatus:!cap&&!accessible?"manual source and caption review":"preserved existing caption or label"
  });
  precedingEnd=start+body.length;
 }
 return {
  page,bytesExamined:Buffer.byteLength(html,"utf8"),
  scope:"Non-mutating HTML-context record; not a visual image-pixel, publisher legend, figure ownership, copyright, or clinical scientific authentication. Embedded media are redacted.",
  figures
 };
}
module.exports={scanLegacyFigures};
if(require.main===module){
 const result=scanLegacyFigures(path.resolve(__dirname,".."));
 const subset=process.argv.includes("--unresolved")?
   {...result,figures:result.figures.filter(f=>f.reviewStatus.startsWith("manual"))}:result;
 process.stdout.write(JSON.stringify(subset,null,2)+"\n");
}
