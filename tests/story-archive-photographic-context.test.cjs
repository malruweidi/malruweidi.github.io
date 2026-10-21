/* Visual-archive reading contract, pass 2. Tests precede source changes.
 * Keeps every original story/photo/route and adds source access.
 */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const objects=[
 ['object-cairo-microscope','/assets/oct12-owner-photos/microscopy-vacation-morning-2017.webp'],
 ['object-molecular-model','/archive/molecular-model-aged-19.webp'],
 ['object-zebrafish-histology','/assets/2026-10-13-new-photos/zebrafish-paraffin-microtomy-failure.webp'],
 ['object-chemistry-festival','/archive/fifth-chemistry-festival-host.webp'],
 ['object-reagent-front','/assets/2026-10-15-lab-photos/pyridine-4-carboxaldehyde-reagent-front-2018.webp'],
 ['object-copolymer-sample','/assets/2026-10-15-lab-photos/copolymer-sample-qatar-university-2017.webp'],
 ['object-reagent-reverse','/assets/2026-10-15-lab-photos/pyridine-4-carboxaldehyde-reagent-rear-2018.webp'],
 ['object-culture-hood','/assets/2026-10-15-lab-photos/cell-culture-safety-cabinet-archive.webp']
];
test('Eight archive object photographs are directly inspectable, individually anchored and preserve context',()=>{
 const html=read('archive.html');
 for(const [id,asset] of objects){
  assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
  const at=html.indexOf('id="'+id+'"');
  const until=html.indexOf('</article>',at);
  assert.ok(at>=0&&until>at,id+' archive object');
  const body=html.slice(at,until);
  assert.ok(body.includes('src="'+asset+'"'),id+' original photo remains displayed');
  assert.ok(body.includes('href="'+asset+'"'),id+' direct asset link');
  assert.match(body,/class="rx-object-source-link"/,id);
  assert.match(body,/Open archived photograph ↗/,id);
  assert.ok(fs.existsSync(path.join(root,asset.slice(1))),id+' media exists');
  assert.match(body,/class="rx-archive-object-copy"/,id+' narrative kept');
 }
 assert.match(html,/id="rxOctoberPhotoArchive"/);
 assert.match(html,/id="rxRecoveredGallery"/);
 assert.match(html,/class="filmstrip"/);
});
test('Front and reverse labels are connected without removing separate cards',()=>{
 const html=read('archive.html');
 const first=html.slice(html.indexOf('id="object-reagent-front"'),html.indexOf('</article>',html.indexOf('id="object-reagent-front"')));
 const reverse=html.slice(html.indexOf('id="object-reagent-reverse"'),html.indexOf('</article>',html.indexOf('id="object-reagent-reverse"')));
 assert.match(first,/href="#object-reagent-reverse"/);
 assert.match(reverse,/href="#object-reagent-front"/);
});
test('Story photographs lead to the chapter actually depicted',()=>{
 const html=read('stories.html');
 const routes=[...html.matchAll(/<a class="rx-story-route-image"[^>]*>[\s\S]*?<\/a>/g)].map(m=>m[0]);
 assert.equal(routes.length,4,'original four groups preserved');
 assert.match(routes[0],/href="#personal-microscope"/);
 assert.match(routes[0],/microscopy-vacation-morning-2017\.webp/);
 assert.match(routes[1],/href="#zebrafish-histology-materials"/);
 assert.match(routes[1],/zebrafish-paraffin-microtomy-failure\.webp/);
 assert.match(routes[2],/href="#living-systems"/);
 assert.match(routes[2],/not an experimental micrograph/);
 assert.match(routes[3],/href="#community"/);
 for(const route of routes){
  const id=(route.match(/href="#([^"]+)"/)||[])[1];
  assert.ok(html.includes('id="'+id+'"'),id+' deep link resolves');
 }
 for(const id of ['anatomy','unfortunate-trials','personal-microscope','zebrafish-histology-materials'])assert.ok(html.includes('href="#'+id+'"'),id);
});
test('Standalone stories reach exact original photograph rather than only generic archive landing',()=>{
 for(const [page,id] of [
  ['stories/cairo-microscope.html','object-cairo-microscope'],
  ['stories/failed-zebrafish-histology.html','object-zebrafish-histology'],
  ['stories/unfortunate-copolymer-trials.html','object-copolymer-sample']
 ]){
   const html=read(page);
   assert.ok(html.includes('href="/archive.html#'+id+'"'),page);
   assert.ok(html.includes('class="rx-deep-related"'),page);
 }
});
test('Reader-facing source links are styled within the existing palette and localized',()=>{
 const archive=read('archive.html');
 assert.match(archive,/\/assets\/story-archive-photo-access-2026\.css/);
 const css=read('assets/story-archive-photo-access-2026.css');
 for(const text of ['rx-object-source-link','focus-visible','prefers-reduced-motion','#17343b'])assert.ok(css.includes(text),text);
 const ar=read('assets/archive-wayfinding-i18n-2026.js');
 for(const label of ['Open archived photograph ↗','See reverse label ↗','See front label ↗'])assert.ok(ar.includes('"'+label+'"'),label);
});
