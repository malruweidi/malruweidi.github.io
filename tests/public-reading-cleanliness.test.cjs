'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('homepage reads as a scholarly archive rather than its own editorial maintenance log',()=>{
 const home=read('index.html');
 const visible=home.split('<details class="rx-home-complete-record"')[0];
 assert.doesNotMatch(visible,/AN EDITED INDEX|THE COMPLETE RECORD REMAINS AVAILABLE|without deletion|without abbreviation/i);
 assert.doesNotMatch(home,/Read the complete homepage record|original capture date unverified|CHILDHOOD PHOTOGRAPH · DATE UNVERIFIED/i);
 assert.match(home,/Continue into the research and stories/);
 assert.match(home,/id="rx-home-complete-record"/);
 assert.equal((visible.match(/class="rx26-portal-card"/g)||[]).length,9,'all nine chapters stay discoverable');
 assert.match(visible,/href="\/major-revisions.html"/);
 assert.match(visible,/href="\/chem-squad.html"/);
 assert.match(visible,/href="\/leadership.html"/);
 assert.match(visible,/id="film"/);
});

test('public archive, stories and film pages do not display production/version or fake-date labels',()=>{
 const pages=['archive.html','stories.html','films.html','moving-evidence.html','behind-the-record.html','stories/ramadan-microscope.html','stories/failed-zebrafish-histology.html'];
 for(const page of pages){
  const html=read(page).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'');
  assert.doesNotMatch(html,/date (?:not )?unverified|year unverified|Photograph date unverified|Film transcript, all eight original source plates and provenance|Preserved previous 02:00|Preserved 150-second original|Owner-supplied original/i,page);
 }
 assert.match(read('films.html'),/href="\/films\/two-materials-no-section.html"/);
 assert.match(read('stories.html'),/href="\/stories\/unfortunate-copolymer-trials.html"/);
});

test('dynamic archive captions and Arabic homepage translations stay clean',()=>{
 const gallery=['assets/archival-2019-2020.js','assets/archive-moments-2026-10-12.js','assets/archival-photos-oct-2026.js','assets/firsthand-photo-stories-2026.js','assets/oct12-owner-photo-stories.js','assets/photos-2017-2019.js','assets/2017-photo-completion.js'];
 for(const file of gallery){
  assert.doesNotMatch(read(file),/Date (?:not )?unverified|date not independently verified|date unverified · owner recollection/i,file);
 }
 const ar=read('assets/home-portal-i18n-2026.js');
 assert.match(ar,/Continue into the research and stories/);
 assert.match(ar,/RESEARCH · SCHOLARSHIP · PERSONAL HISTORY/);
 assert.doesNotMatch(ar,/Read the complete homepage record|without deletion or abbreviation/);
});
