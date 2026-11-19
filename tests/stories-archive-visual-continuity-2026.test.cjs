/* Preservation-first Stories and archive acceptance tests (RED).
 * Static source contracts are not visual verification or image-rights claims.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = p => fs.readFileSync(path.join(__dirname,'..',p),'utf8');

test('Stories pathway photos open the matching, existing chapter',()=>{
 const s=read('stories.html');
 const covers=[
  ['/assets/oct12-owner-photos/microscopy-vacation-morning-2017.webp','#personal-microscope'],
  ['/assets/2026-10-15-lab-photos/copolymer-sample-qatar-university-2017.webp','#unfortunate-trials'],
  ['/assets/evidence-zebrafish.webp','#living-systems'],
  ['/archive/fifth-chemistry-festival-host.webp','#community']
 ];
 for(const [file,chapter] of covers){
  const img=s.indexOf('src="'+file+'"');
  assert.ok(img>0,file);
  const anchor=s.lastIndexOf('<a class="rx-story-route-image"',img);
  const imageEnd=s.indexOf('</a>',anchor);
  assert.ok(anchor>=0 && img<imageEnd,file+' cover anchor');
  assert.ok(s.slice(anchor,img).includes('href="'+chapter+'"'),file+' links matching chapter');
  assert.ok(s.includes('id="'+chapter.slice(1)+'"'),chapter+' exists');
 }
 assert.match(s,/The stories <em>between<\/em> the experiments/);
});

test('All seven retained public object photos open their stored image while retaining context',()=>{
 const s=read('archive.html');
 const paths=[
  '/assets/oct12-owner-photos/microscopy-vacation-morning-2017.webp',
  '/archive/molecular-model-aged-19.webp',
  '/archive/fifth-chemistry-festival-host.webp',
  '/assets/2026-10-15-lab-photos/pyridine-4-carboxaldehyde-reagent-front-2018.webp',
  '/assets/2026-10-15-lab-photos/copolymer-sample-qatar-university-2017.webp',
  '/assets/2026-10-15-lab-photos/pyridine-4-carboxaldehyde-reagent-rear-2018.webp',
  '/assets/2026-10-15-lab-photos/cell-culture-safety-cabinet-archive.webp'
 ];
 const start=s.indexOf('id="rxOctoberPhotoArchive"'),end=s.indexOf('</section>',start);
 const items=s.slice(start,end).match(/<article class="rx-archive-object"(?:\s+id="[^"]+")?>[\s\S]*?<\/article>/g)||[];
 assert.equal(items.length,7);
 for(let i=0;i<items.length;i++){
  const item=items[i],file=paths[i];
  assert.ok(item.includes('src="'+file+'"'),file+' original unchanged');
  assert.ok(item.includes('href="'+file+'"'),file+' inspection href');
  assert.ok(item.includes('class="rx-archive-image-link"'),file+' clickable image');
  assert.match(item,/aria-label="Open stored archive image:/);
  assert.match(item,/<h3\b[^>]*>[\s\S]*?<\/h3>/);
  assert.match(item,/<p>[\s\S]*?<\/p>/);
 }
});

test('Five original gallery photos are directly inspectable, not replaced',()=>{
 const s=read('archive.html');
 const gallery=s.slice(s.indexOf('id="rxRecoveredGallery"'),s.indexOf('id="rxRecoveredGallery"')+5600);
 for(let i=1;i<=5;i++){
  const file='/assets/archival-inline/archive0'+i+'.jpg';
  assert.ok(gallery.includes('src="'+file+'"'),file+' still displayed');
  assert.ok(gallery.includes('href="'+file+'"'),file+' accessible original path');
 }
 assert.equal((gallery.match(/class="rx-archive-gallery-link"/g)||[]).length,5);
});

test('Withdrawn histology story is absent from reader-facing pages while original image binaries remain',()=>{
 const s=read('stories.html'),archive=read('archive.html');
 for(const slug of ['zebrafish-histology-materials','failed-zebrafish-histology.html']){
  assert.ok(!s.includes(slug),'retired chapter not republished: '+slug);
 }
 assert.ok(!archive.includes('id="object-zebrafish-histology"'));
 for(const file of ['zebrafish-histology-processing.webp','zebrafish-orientation-specimens.webp','zebrafish-paraffin-microtomy-failure.webp']){
   const pathName=path.join(__dirname,'..','assets/2026-10-13-new-photos',file);
   assert.ok(fs.existsSync(pathName),'archival original preserved: '+file);
 }
});

test('New media links have keyboard focus and respect reduced motion and Arabic',()=>{
 const css=read('assets/story-archive-image-inspection-2026.css');
 for(const part of ['rx-story-route-image','rx-archive-image-link','rx-archive-gallery-link','rx-photo-source-link'])assert.ok(css.includes(part),part);
 assert.match(css,/:focus-visible/);
 assert.match(css,/prefers-reduced-motion/);
 assert.match(css,/\[dir="rtl"\]|\[lang="ar"\]/);
 assert.doesNotMatch(css,/@import/);
});
