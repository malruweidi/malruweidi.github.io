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
  assert.match(html,/let selectedEdition=verifiedFilmMasters\[x\.id\]/);
  assert.match(html,/candidate\+"\.webp"/);
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
