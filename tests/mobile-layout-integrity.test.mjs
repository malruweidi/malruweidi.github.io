import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {dirname,resolve,join} from "node:path";
import {fileURLToPath} from "node:url";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const file=name=>readFileSync(join(root,name),"utf8");
const questions=file("assets/atlas-of-questions-2026.css");
const kinetic=file("assets/kinetic-atlas-2026.css");
const controller=file("assets/kinetic-atlas-ui-2026.js");
const html=file("index.html");
const classNames=css=>new Set(Array.from(css.matchAll(/(?<![a-zA-Z0-9_-])\.([a-z][a-z0-9_-]+)/gi),m=>m[1]));

test("the two independent atlas modules never share CSS classes",()=>{
 const left=classNames(questions),right=classNames(kinetic);
 const overlap=[...left].filter(name=>right.has(name));
 assert.deepEqual(overlap,[],"CSS collisions caused overlapping cards on 390px screens: "+overlap.join(", "));
 assert.doesNotMatch(controller,/className="rx-atlas-choice"/,"kinetic cards must use unique class");
 assert.doesNotMatch(controller,/class="rx-atlas-kicker"/,"kinetic heading must use unique class");
});

test("mobile question picker uses full-width, readable rows rather than narrow columns",()=>{
 assert.match(questions,/@media\(max-width:600px\)/);
 assert.match(questions,/\.rx-atlas-home \.rx-atlas-choice\s*\{[^}]*grid-template-columns:minmax\(0,1fr\)/s);
 assert.match(questions,/\.rx-atlas-home \.rx-atlas-choice button\s*\{[^}]*grid-template-columns:30px minmax\(0,1fr\) 20px/s);
 assert.match(questions,/\.rx-atlas-choice \.rx-atlas-tabtitle/);
});

test("mobile header keeps a single readable line and a compact menu",()=>{
 const css=file("assets/mobile-layout-integrity-2026.css");
 assert.match(css,/\.header \.brandname[^}]*white-space:nowrap/s);
 assert.match(css,/\.header \.brandline[^}]*white-space:nowrap/s);
 assert.match(css,/\.header \.menu[^}]*min-height:44px/s);
 assert.match(css,/\.rx-atlas-detail h3[^}]*font-size:clamp\(/s);
 assert.ok(html.includes("/assets/mobile-layout-integrity-2026.css"),"final mobile CSS must load on homepage");
 const idx=html.indexOf("/assets/mobile-layout-integrity-2026.css");
 assert.ok(idx>html.indexOf("/assets/kinetic-atlas-2026.css"),"fix must load after both competing stylesheets");
});


test("Arabic and Latin names use automatic direction and mobile decoration cannot obscure cards",()=>{
 const css=file("assets/mobile-layout-integrity-2026.css");
 assert.match(html,/<span class="brandname" dir="auto">/);
 assert.match(html,/<span class="brandline" dir="auto">/);
 assert.doesNotMatch(css,/\.header \.brandline[^}]*direction:rtl/s,
   "A Latin subtitle must not be forced into RTL rendering");
 assert.match(css,/\.rx-atlas-detail::before\s*\{\s*display:none;/s);
 assert.match(css,/\.rx-atlas-home \.rx-atlas-detail\s*\{[^}]*overflow:hidden/s);
});


test("proportional mobile brand caption fits without mono-font clipping",()=>{
 const css=file("assets/mobile-layout-integrity-2026.css");
 assert.match(css,/\.header \.brandline\s*\{[^}]*font-family:"DM Sans",Arial,sans-serif!important;/s);
 assert.match(css,/@media\(max-width:340px\)/);
});
