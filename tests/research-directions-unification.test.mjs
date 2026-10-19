import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=path=>readFileSync(join(root,path),'utf8');

test('one primary research directions page now contains scientific foundation and future agenda',()=>{
  const page=read('molecular-therapeutics.html');
  assert.match(page,/rel="canonical" href="https:\/\/malruweidi.github.io\/molecular-therapeutics.html"/);
  assert.equal((page.match(/<h1\b/g)||[]).length,1);
  for(const anchor of ['research-entry-points','research-evidence','present-work','research-agenda','research-programmes','doctoral-questions','collaboration']){
    assert.ok(page.includes('id="'+anchor+'"'),'Missing '+anchor);
  }
  for(const concept of ['Find the state that matters.','Discover where function is lost.','Measure the transition, not only the endpoint.','Make a model risk being wrong.']){
    assert.ok(page.includes(concept),'Missing integrated question '+concept);
  }
  assert.match(page,/agenda-research-programmes/);
  assert.match(page,/agenda-scientific-frontiers/);
  assert.match(page,/agenda-laboratory-vision/);
  assert.match(page,/agenda-reading-frontier/);
  assert.match(page,/agenda-validation/);
  assert.match(page,/research-agenda-unified.css/);
  assert.ok(read('assets/research-agenda-unified.css').includes('@media(max-width:780px)'));
});

test('homepage presents one future direction destination rather than two competing shortcuts',()=>{
  const home=read('index.html');
  assert.match(home,/href="\/molecular-therapeutics.html">Research directions ↗<\/a>/);
  assert.doesNotMatch(home,/>Where I want the research to go ↗<\/a>/);
  assert.doesNotMatch(home,/href="\/?research-horizon.html"/);
  assert.ok(home.includes('href="/molecular-therapeutics.html#research-agenda"'));
  assert.equal((home.match(/class="rx26-portal-card"/g)||[]).length,9);
});

test('legacy research essay and specialised source records survive intact and remain accessible',()=>{
  const essay=read('research-horizon.html');
  const agenda=read('molecular-therapeutics.html');
  assert.match(essay,/Where I want <em>the research<\/em> to go/);
  assert.match(essay,/id="research-programmes"/);
  assert.match(essay,/id="scientific-frontiers"/);
  assert.match(essay,/id="reading-frontier"/);
  assert.match(essay,/href="\/molecular-therapeutics.html#research-agenda"/);
  assert.match(agenda,/href="\/research-horizon.html"/);
  assert.match(agenda,/href="\/doctoral-concepts.html"/);
  assert.match(read('sitemap.xml'),/research-horizon.html/);
  assert.match(read('sitemap.xml'),/molecular-therapeutics.html/);
});

test('related visitor routes and bilingual homepage label use the consolidated agenda',()=>{
  for(const page of ['research.html','for-supervisors.html','doctoral-concepts.html','reading-map.html']){
    assert.ok(read(page).includes('/molecular-therapeutics.html#research-agenda'),page);
  }
  const index=JSON.parse(read('assets/discovery-index.json'));
  assert.ok(index.items.some(item=>item.url==='/molecular-therapeutics.html'&&item.title.startsWith('Research Directions')));
  assert.ok(index.items.some(item=>item.url==='/research-horizon.html'&&item.title.includes('Long-form')));
  assert.match(read('assets/home-portal-i18n-2026.js'),/الأجندة البحثية/);
});
