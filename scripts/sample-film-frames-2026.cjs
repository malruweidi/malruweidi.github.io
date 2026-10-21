#!/usr/bin/env node
"use strict";
/* Decode film frames independently from HTML5 video controls.
 * This is a file/decoder and frame-identity audit, NOT visual, scientific,
 * soundtrack, pacing, rights or artistic certification.
 *
 * Requires ffmpeg and ffprobe. The original MP4 is never modified.
 * node scripts/sample-film-frames-2026.cjs
 */
const fs=require("node:fs"),path=require("node:path"),cp=require("node:child_process");
const SAMPLE_TIMES=[1,30,60];
function meanRgbDifference(a,b){
 if(!Buffer.isBuffer(a)||!Buffer.isBuffer(b)||a.length!==b.length||!a.length)
  throw Error("RGB frame buffers must have equal nonzero length");
 let diff=0;
 for(let i=0;i<a.length;i++)diff+=Math.abs(a[i]-b[i]);
 return 100*diff/(255*a.length);
}
function selectFilmRoute(html){
 const video=/<video\b[\s\S]*?<\/video>/i.exec(html)?.[0];
 if(!video)throw Error("Standalone film lacks a video element");
 const source=/<source\b[^>]*src="([^"]+\.mp4)"[^>]*>/i.exec(video)?.[1]
   ||/<video\b[^>]*src="([^"]+\.mp4)"/i.exec(video)?.[1];
 if(!source)throw Error("Standalone film has no MP4 source");
 if(!/^\/assets\/films\/[a-z0-9-]+\.mp4$/i.test(source))throw Error("Unexpected film source "+source);
 return source.slice(1);
}
module.exports={SAMPLE_TIMES,meanRgbDifference,selectFilmRoute};
function run(binary,args,{binaryOutput=false}={}){
 const r=cp.spawnSync(binary,args,{encoding:binaryOutput?null:"utf8",maxBuffer:12*1024*1024,timeout:90000});
 if(r.error||r.status!==0)throw Error(binary+" failed: "+String(r.error?.message||r.stderr||"").slice(0,700));
 return r.stdout;
}
if(require.main===module){
 const root=path.resolve(__dirname,"..");
 const dest=path.resolve(process.env.BROWSER_QA_OUTPUT||"browser-qa-artifacts");
 fs.mkdirSync(dest,{recursive:true});
 const page=fs.readFileSync(path.join(root,"films/what-a-bubble-can-do.html"),"utf8");
 const mediaPath=selectFilmRoute(page),absolute=path.join(root,mediaPath);
 const duration=Number(run("ffprobe",["-v","error","-show_entries","format=duration","-of","default=noprint_wrappers=1:nokey=1",absolute]).trim());
 if(!Number.isFinite(duration)||duration<62)throw Error("Source film too short for sampled timestamps: "+duration);
 const sampled=[];
 for(const sec of SAMPLE_TIMES){
  const input=["-v","error","-ss",String(sec),"-i",absolute,"-frames:v","1"];
  const raw=run("ffmpeg",[...input,"-vf","scale=160:90:flags=bilinear","-pix_fmt","rgb24","-f","rawvideo","-"],{binaryOutput:true});
  if(raw.length!==160*90*3)throw Error("Cannot decode RGB at "+sec+" s; bytes="+raw.length);
  const outfile=path.join(dest,"decoded-film-what-a-bubble-"+sec+"s.jpg");
  run("ffmpeg",[...input,"-vf","scale=960:-2:flags=lanczos","-q:v","3","-y",outfile]);
  sampled.push({second:sec,file:path.basename(outfile),bytes:raw});
 }
 const comparisons=[];
 for(let i=0;i<sampled.length;i++)for(let j=i+1;j<sampled.length;j++)
  comparisons.push({from:sampled[i].second,to:sampled[j].second,
   averageRgbDifferencePercent:+meanRgbDifference(sampled[i].bytes,sampled[j].bytes).toFixed(3)});
 // Near-identical frames across all widely spaced timestamps can indicate
 // the wrong source, decode problems or genuine almost-still motion.
 // Flag as review-required rather than certifying cinematic variation.
 const greatest=Math.max(...comparisons.map(x=>x.averageRgbDifferencePercent));
 const warning=greatest<1?"All sampled frames differ by <1% average RGB: verify original film motion visually.":null;
 const report={source:mediaPath,durationSeconds:duration,
  samples:sampled.map(x=>({second:x.second,file:x.file})),comparisons,
  independentDecoder:"ffmpeg/ffprobe",warnings:warning?[warning]:[],
  limitation:"Distinct decoded frames do not prove scientifically accurate motion, artwork ownership, readable captions, narration or rights."};
 fs.writeFileSync(path.join(dest,"decoded-film-review.json"),JSON.stringify(report,null,2)+"\n");
 process.stdout.write(JSON.stringify(report,null,2)+"\n");
 if(warning)process.stderr.write("VISUAL REVIEW REQUIRED: "+warning+"\n");
}
