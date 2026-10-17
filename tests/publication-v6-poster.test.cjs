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

test('website selects registered editions, preserves research-specific versions and original films',()=>{
  const html=fs.readFileSync(path.join(root,'publication-cinema.html'),'utf8');
  assert.match(html,/const selectedEdition=verifiedResearchEdition \\|\\|/);
  assert.match(html,/releasedV6\.get\(x\.id\)/);
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

test('every referenced film master, caption and poster is in the preserved site repository',()=>{
  const html=fs.readFileSync(path.join(root,'publication-cinema.html'),'utf8').split('<script>')[0];
  const assets=[...html.matchAll(/<(?:source|track|video)\b[^>]*\b(?:src|poster)="(\/assets\/films\/[^"]+)"/g)].map(x=>x[1]);
  const posters=[...html.matchAll(/<video controls playsinline[^>]+poster="([^"]+)"/g)].map(x=>x[1]);
  for(const poster of posters)assets.push(poster);
  assert(assets.length>=105,'35 videos with captions and posters');
  for(const asset of new Set(assets)){
    assert(fs.existsSync(path.join(root,asset.slice(1))), 'Missing website asset: '+asset);
  }
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/films/series-v6/releases.json'),'utf8'));
  assert.equal(manifest.count,30,'retain the complete 30-video V6 remakes');
  assert.equal(manifest.films.length,30);
  assert.equal(new Set(manifest.films.map(x=>x.id)).size,30);
  for(const film of manifest.films){
    assert(fs.existsSync(path.join(root,'assets/films/series-v6',film.id+'.mp4')));
    assert(fs.existsSync(path.join(root,'assets/films/series-v6',film.id+'.vtt')));
    assert(fs.existsSync(path.join(root,'assets/films/series-v6',film.id+'.json')));
    assert(fs.existsSync(path.join(root,'assets/films/series-v6',film.id+'.webp')));
  }
});

test('Making Medicines Keep standalone page plays the improved manuscript-sourced cut and retains the first-edition transcript',()=>{
  const page=fs.readFileSync(path.join(root,'films/making-medicines-keep.html'),'utf8');
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/films/series-v4/making-medicines-keep.json'),'utf8'));
  assert.match(page,/<source src="\/assets\/films\/series-v4\/making-medicines-keep\.mp4"/);
  assert.match(page,/<track[^>]+src="\/assets\/films\/series-v4\/making-medicines-keep\.vtt"/);
  assert.match(page,/id="first-edition-transcript"/);
  assert.match(page,/href="\/assets\/films\/making-medicines-keep\.mp4"/);
  assert.match(page,/1904/);
  assert.equal(manifest.chapters.length,8);
  for(const chapter of manifest.chapters){
    assert(page.includes(chapter.speech),'Revised spoken chapter missing from web transcript: '+chapter.title);
  }
});

test('documentary collection links its already released work instead of labelling it unfinished',()=>{
  const page=fs.readFileSync(path.join(root,'films.html'),'utf8');
  assert.doesNotMatch(page,/In development · no film released/);
  for(const destination of [
    '/films/airway-reopening-evidence.html',
    '/publication-cinema.html#film-cerebral-cilia',
    '/publication-cinema.html#film-niosomes',
    '/films/the-laboratory-we-carried-with-us.html',
    '/films/making-medicines-keep.html'
  ]){
    assert(page.includes('href="'+destination+'"'),'Missing release link: '+destination);
  }
});

test('verified primary-source research films are preferred to generic release-index entries',()=>{
  const html=fs.readFileSync(path.join(root,'publication-cinema.html'),'utf8');
  assert.match(html,/let sourcePoster=verifiedFilmMasters\[x\.id\]\?\.poster \|\| releasedV6\.get\(x\.id\)\?\.poster/);
  assert.match(html,/const v6Release=verifiedResearchEdition\?null:releasedV6\.get\(x\.id\)/);
  assert.match(html,/const selectedEdition=verifiedResearchEdition \|\|/);
});
