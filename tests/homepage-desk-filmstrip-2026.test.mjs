import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("documentary scene navigation moves out of film into the expanded archive desk",()=>{
 const home=read("index.html"),js=read("assets/ruwaidix-home-world-2026.js");
 assert.match(home,/class="home-contact-sheet"/);
 assert.match(home,/data-film-time="333"/);
 assert.match(js,/desk\.appendChild\(sheet\)/);
 assert.match(js,/home-contact-sheet/);
 assert.match(js,/home-film-chapters/);
 assert.match(js,/rx-world-desk-scenes/);
});
test("Things I Kept contains eight unique photos, excluding the repeated yellow jacket",()=>{
 const js=read("assets/ruwaidix-home-world-2026.js");
 const block=js.slice(js.indexOf("const archive=["),js.indexOf("const desk=make",js.indexOf("const archive=[")));
 const paths=[...block.matchAll(/src:"([^"]+)"/g)].map(m=>m[1]);
 assert.equal(paths.length,8);
 assert.equal(new Set(paths).size,8);
 assert.ok(!paths.some(p=>p.includes("toy.webp")));
 assert.ok(!block.includes("The yellow jacket"));
 assert.match(js,/Things I kept/);
 assert.doesNotMatch(js,/Three things I kept/);
 assert.match(js,/String\(cards\.length\)/);
});
test("both the photo desk and moved film chapter navigator stay responsive and accessible",()=>{
 const css=read("assets/ruwaidix-home-world-2026.css");
 assert.match(css,/rx-world-desk-scenes/);
 assert.match(css,/@media\s*\(max-width:650px\)/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 const js=read("assets/ruwaidix-home-world-2026.js");
 assert.match(js,/aria-hidden/);
 assert.match(js,/dataset\.deskDepth/);
});
