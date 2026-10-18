import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {dirname,join,resolve} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const read=f=>readFileSync(join(root,f),"utf8");
test("Chem Squad and Leadership & Management are distinct full-sized homepage categories",()=>{
 const home=read("index.html");
 const section=home.slice(home.indexOf('<section class="rx26-portal"'),home.indexOf('<details class="rx-home-complete-record"'));
 assert.ok(section.includes('href="/chem-squad.html"'));
 assert.ok(section.includes('href="/leadership.html"'));
 assert.equal((section.match(/class="rx26-portal-card"/g)||[]).length,9);
 assert.ok(section.includes('href="/major-revisions.html"'),"forthcoming book remains a separate homepage chapter");
 assert.match(section,/07 \/ Chem Squad/);
 assert.match(section,/08 \/ Leadership/);
 assert.match(section,/Leadership &amp; management/);
 assert.ok(!section.includes('href="/#quality"'),"quality should live within leadership, not replace its directory");
});
test("Leadership destination groups YVE, TYC, ACS and quality without folding Chem Squad into them",()=>{
 assert.ok(existsSync(join(root,"leadership.html")));
 const page=read("leadership.html");
 for(const marker of ['<main','<h1','id="yve"','id="tyc"','id="acs"','id="quality"','YVE','The Youth Company','Youth Change Everything','American Chemical Society','Lean Six Sigma']){
   assert.ok(page.includes(marker),"missing leadership section or source "+marker);
 }
 assert.ok(page.includes('href="/stories.html#community-before-lab"'));
 assert.ok(page.includes('href="/engagement.html#acs-2019"'));
 assert.ok(page.includes('href="/cv.html#quality-credentials"'));
 assert.ok(!page.includes('YVE stands for'),"do not guess unidentified acronym");
 assert.ok(!page.includes('Chem Squad quality management'),"keep independent scientific circle separate");
});
test("New leadership category is a visible, accessible and bilingual destination",()=>{
 const page=read("leadership.html"),home=read("index.html");
 assert.equal((page.match(/<h1\b/g)||[]).length,1);
 assert.match(page,/rel="canonical"/);
 assert.match(page,/aria-labelledby="leadership-title"/);
 assert.ok(page.includes('/assets/i18n.js'));
 const dict=read("assets/home-portal-i18n-2026.js");
 for(const phrase of ["Leadership & management","Chem Squad","08 / Leadership"])assert.ok(dict.includes(JSON.stringify(phrase)+":"),"no Arabic translation "+phrase);
 assert.ok(home.includes('class="rx26-portal-grid"'));
 assert.ok(read("sitemap.xml").includes('https://malruweidi.github.io/leadership.html'));
 assert.ok(JSON.parse(read("assets/discovery-index.json")).items.some(item=>item.url==="/leadership.html"));
});