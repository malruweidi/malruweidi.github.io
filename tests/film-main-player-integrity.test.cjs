const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const text=f=>fs.readFileSync(path.join(ROOT,f),'utf8');

test('main documentary page presents corrected 120-second histology cut and preserves older full film',()=>{
 const page=text('films.html');
 assert.match(page,/two-materials-no-section-evidence-cut\.mp4/);
 assert.match(page,/two-materials-no-section-evidence-cut\.vtt/);
 assert.match(page,/two-materials-no-section-poster\.webp/);
 assert.match(page,/Watch preserved 150-second original/);
 const source=JSON.parse(text('assets/films/two-materials-no-section-build.json'));
 assert.equal(source.seconds,120);
 assert.ok(source.media.some(x=>/unsuccessful|failed/i.test(x.type+" "+x.credit)));
});

test('every main cinema video has its own English captions and site-local source',()=>{
 const page=text('films.html');
 const videos=[...page.matchAll(/<video[^>]*>[\s\S]*?<\/video>/g)].map(m=>m[0]);
 assert.ok(videos.length>=5);
 for(const video of videos){
  const mp4=video.match(/<source\s+src="([^"]+\.mp4)"/);
  const captions=video.match(/<track\s+kind="captions"\s+src="([^"]+\.vtt)"/);
  assert.ok(mp4&&captions,video.slice(0,100));
  const m=path.join(ROOT,mp4[1].slice(1));
  const v=path.join(ROOT,captions[1].slice(1));
  assert.ok(fs.statSync(m).size>1_000_000,mp4[1]);
  assert.match(fs.readFileSync(v,'utf8'),/^WEBVTT/);
 }
});
