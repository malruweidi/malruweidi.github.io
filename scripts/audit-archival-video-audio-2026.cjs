#!/usr/bin/env node
"use strict";
/* Original 10 personal/laboratory clips. Nonmutating audio-track inventory.
 * ffprobe inspects container metadata only; no listening, transcription,
 * facial recognition, identity claims, date authentication or re-encoding.
 * Use: node scripts/audit-archival-video-audio-2026.cjs
 */
const fs=require("node:fs"),path=require("node:path"),cp=require("node:child_process");
function archivalClips(root){
 const found=[];
 function recurse(dir){
  for(const item of fs.readdirSync(path.join(root,dir),{withFileTypes:true})){
   if(item.name===".git"||item.name==="node_modules")continue;
   const file=path.posix.join(dir,item.name);
   if(item.isDirectory() && file==="assets/films")continue;
   if(item.isDirectory())recurse(file);
   else if(item.isFile()&&file.toLowerCase().endsWith(".mp4"))found.push(file);
  }
 }
 for(const dir of ["archive","assets"])if(fs.existsSync(path.join(root,dir)))recurse(dir);
 return found.sort();
}
function assessStreams(streams){
 if(!Array.isArray(streams)||streams.length===0)return {status:"cannot-classify",audioStreams:null};
 const n=streams.filter(x=>x.codec_type==="audio").length;
 return {status:n?"audio-present-listen-and-check-captions":"silent-stream-no-transcript-required",audioStreams:n};
}
module.exports={archivalClips,assessStreams};
if(require.main===module){
 const root=path.resolve(__dirname,"..");
 const dest=path.resolve(process.env.BROWSER_QA_OUTPUT||"browser-qa-artifacts");
 fs.mkdirSync(dest,{recursive:true});
 const entries=[],issues=[];
 for(const file of archivalClips(root)){
  const absolute=path.join(root,file);
  const meta=cp.spawnSync("ffprobe",["-v","error","-show_entries",
   "stream=codec_type:format=duration","-of","json",absolute],
   {encoding:"utf8",timeout:30000,maxBuffer:50000});
  let report={file,bytes:fs.statSync(absolute).size};
  if(meta.error||meta.status!==0){
   report.status="cannot-classify";
   report.reason=String(meta.error?.message||meta.stderr||"metadata unreadable").slice(0,200);
   issues.push(file+": ffprobe could not read container");
  }else{
   try{
    const info=JSON.parse(meta.stdout);
    const streams=assessStreams(info.streams);
    report={...report,...streams,durationSeconds:Number(info.format?.duration)||null};
    const base=file.replace(/\.mp4$/i,"");
    report.siblingSubtitleExists=fs.existsSync(path.join(root,base+".vtt"));
    if(streams.audioStreams>0)issues.push(file+": contains audio; manual audition and dialogue/music caption policy review required");
   }catch(e){report.status="cannot-classify";issues.push(file+": metadata parse issue");}
  }
  entries.push(report);
 }
 const result={
  scope:"Original non-publication archival MP4s; a stream with audio does not prove speech. A silent stream does not certify descriptive accessibility. Source media unmodified.",
  clips:entries,reviewQueue:issues,
  note:"Do not generate invented speech or turn private conversations into transcripts. Obtain owner approval before publishing any subtitles of other people's audio."
 };
 fs.writeFileSync(path.join(dest,"archival-video-audio-inventory.json"),JSON.stringify(result,null,2)+"\n");
 process.stdout.write(JSON.stringify({total:entries.length,
  silent:entries.filter(x=>x.status==="silent-stream-no-transcript-required").length,
  audioPresent:entries.filter(x=>x.status==="audio-present-listen-and-check-captions").length,
  unknown:entries.filter(x=>x.status==="cannot-classify").length,
  reviewQueue:issues},null,2)+"\n");
 if(entries.length===0||entries.some(x=>x.status==="cannot-classify"))process.exitCode=1;
}
