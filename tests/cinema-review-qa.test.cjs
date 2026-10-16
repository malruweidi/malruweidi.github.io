'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('cinema-review-v2.html');
const films=JSON.parse(read('assets/films/cinematic-library-v2.json')).films;
const script=html.match(/<script>([\s\S]*?)<\/script>/);
test('cinema review script is JavaScript, with valid static controls',()=>{
 assert.ok(script && script[1].length>300);
 assert.doesNotThrow(()=>new vm.Script(script[1],{filename:'cinema-review-v2-inline.js'}));
 assert.match(html,/id="original"/);
 assert.match(html,/id="preview"/);
 assert.match(html,/id="voice-samples"/);
 assert.match(html,/noindex,nofollow/);
 assert.match(html,/not approved|unapproved/i);
});
test('old film and all 44 technical V2 exports remain separate and addressable',()=>{
 assert.equal(films.length,44);
 for(const f of films){
   const originalSlug=f.slug.replace(/^pub-/,'').replace(/^feature-/,'');
   const oldMovie=f.slug.startsWith('pub-')
     ? 'assets/films/series/'+originalSlug+'.mp4'
     : 'assets/films/'+originalSlug+'.mp4';
   assert.ok(fs.existsSync(path.join(root,oldMovie)),'missing preserved original '+oldMovie);
   for(const ext of ['.mp4','.json','.vtt']){
     const preview='assets/films/library-v2/'+f.slug+'-rough-cut'+ext;
     assert.ok(fs.existsSync(path.join(root,preview)),'missing source-preserving V2 preview '+preview);
   }
 }
});
test('all audition audio files referenced by review screen exist',()=>{
 for(const stem of ['making-medicines-keep-01','making-medicines-keep-03','pub-airway-reopening-01','pub-airway-reopening-06']){
   for(const voice of ['bm_lewis','am_michael','bm_george','bf_emma']){
     const p='assets/films/voice-auditions-v2/'+stem+'-'+voice+'.m4a';
     assert.ok(fs.existsSync(path.join(root,p)),p);
   }
 }
});
test('review page never substitutes new editions for the production website',()=>{
 assert.ok(!html.includes('window.location.replace'));
 assert.ok(!html.includes('localStorage.setItem'));
 const main=read('index.html');
 assert.ok(!main.includes('cinema-review-v2.html'));
});
