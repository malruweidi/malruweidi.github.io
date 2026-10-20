'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const pages=[
  ['research.html',['/publications.html','/films.html','/stories.html','/cv.html']],
  ['publications.html',['/#research','/films.html','/stories.html','/cv.html']],
  ['molecular-therapeutics.html',['/research.html','/publications.html','#research-agenda','/cv.html']]
];
for(const [page,originalRoutes] of pages){
  test(page+' retains its original navigation and adds a first-class Find link',()=>{
    const html=read(page),header=(html.match(/<header\b[\s\S]*?<\/header>/i)||[])[0]||'';
    const nav=(header.match(/<nav\b[\s\S]*?<\/nav>/i)||[])[0]||'';
    assert.ok(nav,page+' needs a visible HTML navigation landmark');
    assert.equal((nav.match(/href="\/search\.html"/g)||[]).length,1,'Find is present exactly once');
    assert.match(nav,/<a href="\/search\.html"[^>]*>Find<\/a>/);
    for(const route of originalRoutes) assert.ok(nav.includes('href="'+route+'"'),route);
    assert.ok(html.includes('<main'),page+' main content preserved');
  });
}
test('Find links work with JavaScript disabled and resolve to the existing search page',()=>{
  assert.ok(fs.existsSync(path.join(root,'search.html')));
  for(const [page] of pages){
    const html=read(page);
    assert.ok(html.includes('href="/search.html"'),page);
    assert.ok(html.includes('rel="canonical"'),page+' keeps canonical metadata');
  }
});
