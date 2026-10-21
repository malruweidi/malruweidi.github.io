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

function verifySelectedMediaHashes(masters,{readBinary,readManifest}){
 if(typeof readBinary!=="function"||typeof readManifest!=="function")throw TypeError("Provide readBinary and readManifest");
 const crypto=require("node:crypto"),errors=[];
 for(const film of masters){
  const base="assets/films/"+film.edition+"/"+film.id;
  let manifest,actual;
  try{manifest=JSON.parse(readManifest(base+".json"));}
  catch(e){errors.push("missing or invalid movie checksum manifest "+base+".json");continue;}
  const checksum=manifest.mp4_sha256||manifest.movie_sha256||manifest.sha256;
  if(typeof checksum!=="string"||!/^[a-f0-9]{64}$/.test(checksum)){
   errors.push("missing verified MP4 SHA256 in manifest "+base+".json");continue;
  }
  try{actual=crypto.createHash("sha256").update(readBinary(base+".mp4")).digest("hex");}
  catch(e){errors.push("unreadable primary movie "+base+".mp4");continue;}
  if(actual!==checksum)errors.push("MP4 checksum mismatch "+base+".mp4");
  const duration=manifest.seconds??manifest.duration_seconds??manifest.runtime_seconds;
  if(duration!==undefined&&Math.abs(Number(duration)-film.duration)>.51)
   errors.push("primary movie manifest duration mismatch "+base+".json");
 }
 return errors;
}

module.exports={readVerifiedFilmMasters,validateVerifiedFilmMasters,verifySelectedMediaHashes};
