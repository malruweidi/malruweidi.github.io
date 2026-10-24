import {readFileSync,existsSync} from "node:fs";
import {test} from "node:test";
import assert from "node:assert/strict";

const read = p => readFileSync(new URL("../"+p, import.meta.url));
const home = read("index.html").toString("utf8");
const stories = read("stories.html").toString("utf8");

test("homepage social preview dimensions describe the actual preserved portrait asset", () => {
  const imagePath="assets/2026-10-13-new-photos/research-portrait-calligraphy.webp";
  const bytes=read(imagePath);
  assert.equal(bytes.toString("ascii",0,4),"RIFF");
  assert.equal(bytes.toString("ascii",8,12),"WEBP");
  assert.equal(bytes.toString("ascii",12,16),"VP8 ");
  const width=bytes.readUInt16LE(26)&0x3fff;
  const height=bytes.readUInt16LE(28)&0x3fff;
  const ogWidth=Number(home.match(/<meta property="og:image:width" content="(\d+)"/)?.[1]);
  const ogHeight=Number(home.match(/<meta property="og:image:height" content="(\d+)"/)?.[1]);
  assert.equal(ogWidth,width,"Open Graph width must be the real pixel width");
  assert.equal(ogHeight,height,"Open Graph height must be the real pixel height");
  assert.ok(home.includes('https://malruweidi.github.io/'+imagePath));
});

test("approved live homepage portrait stays primary but has a local source-safe fallback", () => {
  assert.ok(home.includes('src="https://cdn.creativeclaw.co/u/8a002dd8/images/5e4b3ffb-a810-4d3c-99c9-cc38782d7b4d.jpg"'));
  const js=read("assets/site-enhancements.js").toString("utf8");
  assert.ok(js.includes('"/assets/2026-10-13-new-photos/research-portrait-calligraphy.webp"'));
  assert.match(js, /homePortrait\.addEventListener\("error", restorePortrait/);
  assert.match(js, /homePortrait\.complete\s*&&\s*homePortrait\.naturalWidth\s*===\s*0/);
  assert.match(js, /homePortrait\.removeEventListener\("error", restorePortrait\)/);
  assert.ok(existsSync(new URL("../assets/2026-10-13-new-photos/research-portrait-calligraphy.webp",import.meta.url)));
});

test("Stories Arabic portrait caption matches the clean English public description", () => {
  const figure=stories.match(/<figure><img src="\/assets\/2026-10-13-new-photos\/research-portrait-calligraphy\.webp"[\s\S]*?<\/figure>/)?.[0];
  assert.ok(figure);
  assert.match(figure,/An informal portrait in front of Arabic calligraphy, from a separate occasion/);
  assert.match(figure,/صورة شخصية أمام لوحة من الخط العربي، في مناسبة أخرى/);
  assert.doesNotMatch(figure,/لم يُتحقق/);
});
