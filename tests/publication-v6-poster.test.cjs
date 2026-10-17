const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');

test('published V6 video posters originate from their own MP4 frames',()=>{
  const renderer=fs.readFileSync(path.join(root,'scripts/render-publication-series.py'),'utf8');
  const workflow=fs.readFileSync(path.join(root,'.github/workflows/render-publication-v6.yml'),'utf8');
  assert.match(renderer,/--posters-only/,'render script must support filling missing first-frame posters');
  assert.match(renderer,/\.webp/,'render script must create WebP stills');
  assert.match(workflow,/--posters-only/,'render workflow must backfill posters for published video assets');
  assert.match(workflow,/series-v6\/\*\.webp/,'render workflow must actually commit posters');
});

test('website prefers study-specific V5 editions, then V6 poster, then original intact',()=>{
  const html=fs.readFileSync(path.join(root,'publication-cinema.html'),'utf8');
  assert.match(html,/const selectedEdition=verifiedFilmMasters\[x\.id\]/);
  assert.match(html,/isV6\?\{edition:"series-v6",duration:84,poster:/);
  assert.match(html,/selectedEdition\?selectedEdition\.edition:"series"/);
  assert.match(html,/Watch preserved original first edition/);
});

test('site displays playable film elements from one release manifest, not fragile HEAD probes',()=>{
  const html=fs.readFileSync(path.join(root,'publication-cinema.html'),'utf8');
  const renderer=fs.readFileSync(path.join(root,'scripts/render-publication-series.py'),'utf8');
  assert.match(html,/series-v6\/releases\.json/);
  assert.doesNotMatch(html,/method:"HEAD"/);
  assert.match(html,/<video controls playsinline/);
  assert.match(renderer,/releases\.json/);
});

test('the saved HTML contains 35 directly playable source-matched films before catalogue hydration',()=>{
  const html=fs.readFileSync(path.join(root,'publication-cinema.html'),'utf8');
  const staticHTML=html.slice(0,html.indexOf('<script>'));
  const entries=[...staticHTML.matchAll(/<article class="piece" id="film-([a-z0-9-]+)"/g)].map(x=>x[1]);
  const posters=[...staticHTML.matchAll(/<video controls playsinline[^>]*poster="([^"]+)"/g)].map(x=>x[1]);
  const films=[...staticHTML.matchAll(/<source src="([^"]+\.mp4)" type="video\/mp4"/g)].map(x=>x[1]);
  const tracks=[...staticHTML.matchAll(/<track kind="captions" src="([^"]+\.vtt)"/g)].map(x=>x[1]);
  assert.equal(entries.length,35,'do not remove or condense any publication record');
  assert.equal(films.length,35,'every entry must have direct video markup');
  assert.equal(posters.length,35,'every film must supply its own poster or relevant primary figure');
  assert.equal(tracks.length,35,'every film must have captions');
  for(let i=0;i<entries.length;i++){
    assert.match(films[i],new RegExp('/'+entries[i]+'\\.mp4$'));
    assert.match(tracks[i],new RegExp('/'+entries[i]+'\\.vtt$'));
    assert(!/series-v6/.test(films[i]) || /series-v6/.test(posters[i]),'V6 poster must come from its own edition');
  }
});
