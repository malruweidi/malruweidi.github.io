import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname,join} from 'node:path';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=path=>readFileSync(join(root,path),'utf8');
const home=read('index.html');
const stories=read('stories.html');
const archive=read('archive.html');
const illness=read('illness-and-evidence.html');
const index=JSON.parse(read('assets/discovery-index.json'));
const image='assets/owner-archive-2026-10-17/grade10-chemistry-festival-aref-elahmad.webp';

test('first chemistry teacher is visible without JavaScript on all three archival paths',()=>{
  assert.ok(existsSync(join(root,image)));
  for(const [path,html] of [['index.html',home],['stories.html',stories],['archive.html',archive]]){
    assert.ok(html.includes(image),path);
    assert.ok(html.includes('Mr. Aref Elahmad'),path);
  }
  assert.ok(stories.includes('id="school-chemistry-and-graduation"'));
});
test('2009 school chemistry beginning predates the 2011 anatomy story without false photo dates',()=>{
  assert.match(home,/2009/);
  assert.match(stories,/2009/);
  assert.match(archive,/2009/);
  assert.doesNotMatch(home,/The first system that truly puzzled me was a body/);
  assert.doesNotMatch(archive,/The archive begins with a school anatomy lesson/);
  assert.match(stories,/I organized my first school chemistry exhibition at Doha Independent School in 2009/);
  assert.match(stories,/In a photograph from a Grade 10 chemistry festival/);
  assert.doesNotMatch(stories,/photograph (?:taken|captured) in 2009/i);
});
test('illness story is a real static chapter linked to both the original essay and archive',()=>{
  assert.ok(stories.includes('id="life-between-diagnoses-story"'));
  assert.ok(stories.includes('/archive/archive-7885.jpg'));
  assert.ok(stories.includes('eosinophilic-diagnosis-dr-elsheikh-abdelrahim.webp'));
  assert.ok(illness.includes('id="life-between-diagnoses"'));
  assert.ok(illness.includes('id="the-week-before-the-flight"'));
  assert.match(illness,/A severe flare shortly before an important journey required endoscopy and glucocorticoid treatment/i);
  assert.ok(home.includes('href="/illness-and-evidence.html#life-between-diagnoses"'));
  assert.ok(stories.includes('https://malruweidi.substack.com/p/the-life-between-diagnoses'));
});
test('search finds both overlooked stories and all discovery entries have bilingual keywords',()=>{
  assert.ok(index.items.some(x=>x.url==='/stories.html#school-chemistry-and-graduation'));
  assert.ok(index.items.some(x=>x.url==='/stories.html#life-between-diagnoses-story'));
  assert.ok(index.items.every(x=>/[\u0600-\u06ff]/.test(x.keywords)));
});
test('public film dossiers and the scientific fieldnotes are in the sitemap',()=>{
 const sitemap=read('sitemap.xml');
 for(const path of ['/films/making-medicines-keep.html','/films/the-laboratory-we-carried-with-us.html','/films/what-a-bubble-can-do.html','/scientific-fieldnotes-2026.html']){
   assert.ok(sitemap.includes('https://malruweidi.github.io'+path),path);
 }
});

test('reader map offers both overlooked stories as direct accessible destinations',()=>{
 const map=read('reading-map.html');
 assert.ok(map.includes('href="/stories.html#school-chemistry-and-graduation"'));
 assert.ok(map.includes('href="/stories.html#life-between-diagnoses-story"'));
 assert.ok(map.includes('First chemistry teacher'));
 assert.ok(map.includes('The Life Between Diagnoses'));
});
