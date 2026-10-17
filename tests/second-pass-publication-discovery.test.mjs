import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {join, resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read=p=>readFileSync(join(root,p),'utf8');

test('archive overview dates its coverage from the first documented 2009 school exhibition',()=>{
 const html=read('archive.html');
 assert.match(html, /2009–present · Research/);
 assert.doesNotMatch(html, /2011–present · Research/);
 assert.match(html, /Grade 10 research presentation/);
});

test('public film and original research notebook pages supply meaningful social previews',()=>{
 const pages=[
  ['film.html','/assets/photos-2017-2019/microscope-morning-still-life-2017.webp'],
  ['films/index.html','/assets/films/what-a-bubble-can-do-poster.webp'],
  ['publication-cinema.html','/assets/home-archive/figure-pulmonary-flow-chamber.jpg'],
  ['scientific-fieldnotes-2026.html','/assets/owner-archive-2026-10-17/laboratory-portrait-poster.webp']
 ];
 for(const [file,image] of pages){
   const html=read(file);
   assert.match(html,/<meta property="og:title" content="[^"]+"/,file+' title');
   assert.match(html,/<meta property="og:description" content="[^"]+"/,file+' description');
   assert.match(html,/<meta property="og:image" content="https:\/\/malruweidi\.github\.io\//,file+' image');
   assert.match(html,/<meta name="twitter:card" content="summary_large_image"/,file+' share card');
   assert.ok(html.includes(image),file+' uses a related archive image');
   assert.ok(existsSync(join(root,image.replace(/^\//,''))),file+' original asset remains');
 }
});
