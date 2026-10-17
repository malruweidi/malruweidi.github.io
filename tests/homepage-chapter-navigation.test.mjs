import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root=resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read=path=>readFileSync(join(root,path),"utf8");
const home=read("index.html");

test("homepage is a compact directory of the eight primary collections",()=>{
  assert.ok(home.includes('id="rx26-portal"'));
  const start=home.indexOf('id="rx26-portal"');
  const end=home.indexOf('id="rx-home-complete-record"');
  const portal=home.slice(start,end);
  assert.ok(end>start);
  for(const route of ["/research.html","/publications.html","/films.html","/stories.html","/illness-and-evidence.html","/writing.html","/chem-squad.html","/leadership.html"]){
    assert.ok(portal.includes('href="'+route+'"'),"missing homepage collection "+route);
  }
  assert.ok(portal.includes('aria-labelledby="rx26-portal-title"'));
  assert.ok(home.indexOf('id="rx26-portal"')<home.indexOf('id="research"'));
});

test("complete original research and personal chapters remain accessible without forced scrolling",()=>{
  assert.ok(home.includes('<details class="rx-home-complete-record" id="rx-home-complete-record">'));
  assert.ok(home.includes('<summary class="rx-home-complete-summary">'));
  for(const section of ["research","publications","film","story","patient-perspective","framework","methods","imaging","quality","history","writing","community","quacs","about"]){
    assert.ok(home.includes('id="'+section+'"'),"historical chapter missing "+section);
  }
  assert.ok(home.includes('rxOpenDeepLink'));
  assert.ok(home.includes("hashchange"));
  assert.equal((home.match(/<h1\b/g)||[]).length,1);
});

test("new landing cards use approved visual identity and bilingual source entries",()=>{
  assert.ok(home.includes("rx26-portal-grid"));
  assert.ok(home.includes("var(--ink)")&&home.includes("var(--terra)")&&home.includes("var(--serif)"));
  const dict=read("assets/home-portal-i18n-2026.js");
  for(const phrase of ["Choose a chapter.","Research & experiments","Illness & evidence","Read the complete homepage record"]){
    assert.ok(dict.includes(JSON.stringify(phrase)+":"),"missing Arabic translation for "+phrase);
  }
  assert.ok(home.includes("/assets/home-portal-i18n-2026.js"));
});
