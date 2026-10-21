"use strict";
/* Cinema source integrity checks valid primary film editions, preserving all
 * previous release binaries and refusing invented placeholder sources.
 * This module parses a bounded literal release registry, never evaluates HTML.
 */
function readVerifiedFilmMasters(html){
 const start=html.indexOf("const verifiedFilmMasters=Object.freeze({");
 if(start<0)throw Error("Verified-film primary release registry missing");
 const blockStart=html.indexOf("{",start)+1;
 const end=html.indexOf("});",blockStart);
 if(end<blockStart)throw Error("Verified-film release registry incomplete");
 const contents=html.slice(blockStart,end);
 const expression=/"([a-z0-9-]+)":\{edition:"(series-v[0-9]+-[a-z0-9-]+)",duration:([0-9]+),poster:"(\/assets\/films\/[a-z0-9-]+\/[a-z0-9-]+\.webp)"\}/g;
 const results=[];let remainder=contents;const seen=new Set();
 for(const m of contents.matchAll(expression)){
  const [raw,id,edition,durationRaw,poster]=m;
  if(seen.has(id))throw Error("duplicate release id "+id);
  seen.add(id);
  const duration=Number(durationRaw);
  if(!(duration>0 && duration<=1800))throw Error("invalid duration "+id);
  const expected="/assets/films/"+edition+"/"+id+".webp";
  if(poster!==expected)throw Error("poster does not match selected release "+id);
  results.push({id,edition,duration,poster});
  remainder=remainder.replace(raw,"");
 }
 if(remainder.replace(/[,\s]+/g,"")!=="")throw Error("unknown primary master registry entry or unsupported syntax");
 if(!results.length)throw Error("empty verified-film release registry");
 return results;
}

function validateVerifiedFilmMasters(masters,{fileExists,captionText}){
 const errors=[];
 if(typeof fileExists!=="function"||typeof captionText!=="function")throw TypeError("Provide fileExists and captionText functions");
 for(const f of masters){
  const base="assets/films/"+f.edition+"/"+f.id;
  for(const ext of ["mp4","vtt","webp"]){
   if(!fileExists(base+"."+ext))errors.push("missing verified film "+base+"."+ext);
  }
  if(fileExists(base+".vtt")){
   let txt="";
   try{txt=captionText(base+".vtt");}
   catch(e){errors.push("unreadable subtitles for "+f.id);continue;}
   if(!txt.startsWith("WEBVTT")||/date not verified|production note|shot list|review checklist|manifests? for the editor/i.test(txt)){
    errors.push("subtitle release contamination "+f.id);
   }
  }
 }
 return errors;
}
module.exports={readVerifiedFilmMasters,validateVerifiedFilmMasters};
