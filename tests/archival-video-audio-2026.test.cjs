"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const path=require("node:path"),fs=require("node:fs");
const {archivalClips,assessStreams}=require("../scripts/audit-archival-video-audio-2026.cjs");
const root=path.resolve(__dirname,"..");
test("all archived non-cinema MP4 clips are identified without altering their bytes",()=>{
 const clips=archivalClips(root);
 assert.equal(clips.length,10,"ten personal archival recordings, not the publication cinema versions");
 for(const c of clips){
  assert.ok(!c.startsWith("assets/films/"),"exclude publication cinema");
  assert.ok(fs.statSync(path.join(root,c)).size>0,c);
 }
 for(const p of ["archive/archive-video-2016.mp4","assets/research-archive-2026/laboratory-vacuum-pump-archival-clip.mp4",
  "assets/owner-archive-2026-10-13/khaled-jama-thesis-reaction.mp4"])assert.ok(clips.includes(p),p);
});
test("captions cannot be inferred from an MP4 without examining audio streams",()=>{
 assert.equal(assessStreams([{codec_type:"video"}]).status,"silent-stream-no-transcript-required");
 assert.equal(assessStreams([{codec_type:"video"},{codec_type:"audio"}]).status,"audio-present-listen-and-check-captions");
 assert.equal(assessStreams([]).status,"cannot-classify");
});
