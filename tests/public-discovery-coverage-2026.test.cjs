'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const items=JSON.parse(read('assets/discovery-index.json')).items;
const sitemap=read('sitemap.xml');
const expected=[
  ['/recommended-screen.html','Recommended reading'],
  ['/training.html','Methods & evidence'],
  ['/methods-evidence.html','Methods & evidence']
];
test('three existing public reading and research pages are indexed, not duplicated',()=>{
 for(const [route,category] of expected){
  const matched=items.filter(item=>item.url===route);
  assert.equal(matched.length,1,'One search entry for '+route);
  assert.equal(matched[0].category,category);
  assert.match(matched[0].keywords,/[\u0600-\u06ff]/);
  assert.ok(fs.existsSync(path.join(root,route.slice(1))));
 }
});
test('the same canonical pages are covered by the XML sitemap once each',()=>{
 for(const [route] of expected){
  const target='<loc>https://malruweidi.github.io'+route+'</loc>';
  assert.equal(sitemap.split(target).length-1,1,route);
 }
});
