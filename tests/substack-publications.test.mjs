import {readFileSync} from "node:fs";
import {resolve,join,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import test from "node:test";
import assert from "node:assert/strict";
const root=resolve(dirname(fileURLToPath(import.meta.url)),".."),read=p=>readFileSync(join(root,p),"utf8");
const posts=JSON.parse(read("assets/current-substack.json")), home=read("index.html"),full=read("full-record.html"),page=read("writing.html");
const dead=["the-apocalypse-will-have-plenty-of","oh-captain-my-captain","to-transmit-life-without-knowing","/p/16c"];
test("verified Substack corpus is the exact current five-article public archive",()=>{
 assert.equal(posts.source_archive,"https://malruweidi.substack.com/archive");
 assert.equal(posts.verified_on,"2026-10-15");
 assert.equal(posts.entries.length,5);
 assert.deepEqual(posts.entries.map(p=>p.slug),[
  "the-life-between-diagnoses","sorry-my-first-email-to-you-was-probably",
  "we-taught-people-to-sound-like-machines","fifteen-things-i-wish-young-academics",
  "the-nobel-prize-has-room-for-three"]);
 const ids=posts.entries.map(p=>p.id);
 assert.equal(new Set(ids).size,ids.length);
 for(const p of posts.entries){assert.ok(p.title&&p.description&&p.date&&p.topic);
  assert.equal(p.url,"https://malruweidi.substack.com/p/"+p.slug);
 }
});
test("homepage, complete record, and writing hub match live public Substack articles",()=>{
 for(const [name,html] of [["homepage",home],["full record",full]]){
  const start=html.indexOf('<section class="section writing" id="writing">');
  const end=html.indexOf("</section>",start);
  assert.ok(start>=0&&end>start,name+" writing section must exist");
  const section=html.slice(start,end);
  const links=[...section.matchAll(/href="(https:\/\/malruweidi\.substack\.com\/p\/[^"]+)"/g)].map(x=>x[1]);
  assert.deepEqual(links,posts.entries.map(p=>p.url),name+" lists only live, current posts in newest-first order");
  assert.ok(section.includes('href="/writing.html"'),"writing hub linked on "+name);
  assert.ok(section.includes("Drug Discovery Online"),"preserve separate science columns");
 }
 for(const p of posts.entries){
  assert.ok(page.includes('href="'+p.url+'"'),p.url);
  assert.ok(page.includes('id="essay-'+p.id+'"'),"missing deep link "+p.id);
  assert.ok(page.includes(p.title),p.title);
 }
 assert.ok(page.includes('href="https://malruweidi.substack.com/archive"'));
});
test("deleted Substack links are no longer presented on public webpages",()=>{
 for(const p of ["index.html","full-record.html","writing.html","reading-map.html"]){
  const html=read(p);for(const slug of dead)assert.ok(!html.includes("malruweidi.substack.com/p/"+slug.replace(/^\/p\//,"")),p+" still links removed "+slug);
 }
});
test("the writing collection has stable metadata, RTL and accessible navigation",()=>{
 const html=page,css=read("assets/writing-2026.css"),lang=read("assets/writing-i18n-2026.js");
 for(const key of ['rel="canonical"','property="og:title"','property="og:image"','data-rx-page="writing"','<main','id="essays"','id="publications"','aria-label="Essay topics"','id="essay-the-life-between-diagnoses"'])assert.ok(html.includes(key),key);
 for(const key of ["focus-visible",'dir="rtl"',"prefers-reduced-motion","@media","line-height"])assert.ok(css.includes(key),key);
 assert.match(lang,/RuwaidixArabicDictionary/);
 assert.ok(read("reading-map.html").includes('href="/writing.html"'));
 assert.ok(read("sitemap.xml").includes("https://malruweidi.github.io/writing.html"));
});
test("each article is discoverable locally without introducing offsite search routes",()=>{
 const index=JSON.parse(read("assets/discovery-index.json"));
 assert.equal(index.items.length,57);
 assert.ok(index.items.some(x=>x.url==="/writing.html"));
 for(const p of posts.entries)assert.ok(index.items.some(x=>x.url==="/writing.html#essay-"+p.id),p.id);
});
