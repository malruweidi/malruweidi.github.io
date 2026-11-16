'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
test('living desk is production home with source-led metadata',()=>{
 assert.match(html,/<link rel="canonical" href="https:\/\/malruweidi.github.io\/">/);
 assert.doesNotMatch(html,/noindex,nofollow|CONCEPT PREVIEW/);
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.match(html,/data-rx-page="living-home"/);
});
test('preserve archive and all nine original destinations',()=>{
 assert.ok(fs.existsSync(path.join(root,'home-legacy-2026.html')));
 const legacy=fs.readFileSync(path.join(root,'home-legacy-2026.html'),'utf8');
 assert.match(legacy,/id="rx26-portal"/);
 const portion=html.slice(html.indexOf('id="directory"'),html.indexOf('<footer'));
 for(const route of ['research','publications','films','stories','illness-and-evidence','writing','chem-squad','leadership','major-revisions'])
  assert.ok(portion.includes('href="/'+route+'.html"'),route);
 assert.match(html,/href="\/home-legacy-2026.html"/);
});
test('six desks, scientific status boundaries and bilingual accessible navigation',()=>{
 for(const part of ['card-lab','card-notes','card-history','card-film','card-people','card-future'])
  assert.ok(html.includes('class="desk-card '+part+'"'),part);
 for(const part of ['id="search-layer"','aria-modal="true"','id="menu-toggle"','aria-expanded="false"','id="mobile-nav"'])
  assert.ok(html.includes(part),part);
 assert.match(html,/function closeMobileNav\(\)/);
 assert.match(html,/RESEARCH IN PROGRESS/);
 assert.match(html,/Conceptual vesicle illustration, not an experimental result/);
 assert.match(html,/document.documentElement.dir=next==='ar'\?'rtl':'ltr'/);
});
