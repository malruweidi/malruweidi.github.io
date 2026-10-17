import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {resolve,dirname,join} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>readFileSync(join(root,p),"utf8");
test("original two-minute film is not hidden by a preliminary HTTP HEAD check",()=>{
  const html=read("film.html");
  assert.match(html,/<video\b[^>]*id="research-film"[^>]*controls/);
  const tag=html.match(/<video\b[^>]*id="research-film"[^>]*>/)?.[0];
  assert.ok(tag,"film player present");
  assert.doesNotMatch(tag,/\bhidden\b/,"film player is not hidden until a HEAD response");
  assert.doesNotMatch(html,/fetch\([^;]*method:\s*["']HEAD["']/);
  assert.ok(html.includes("what-survives-the-experiment.mp4"));
  assert.ok(existsSync(join(root,"assets/films/what-survives-the-experiment.mp4")));
  assert.doesNotMatch(html,/·\s*·/,"reader-visible empty link separators");
});
test("film library introduces playable films rather than exposing production transcripts",()=>{
  const hub=read("films.html");
  assert.doesNotMatch(hub,/Each two-minute film comes with an English transcript, caption file, and a source-by-source explanation/);
  assert.match(hub,/films\/index\.html/);
  assert.match(hub,/films\/what-a-bubble-can-do\.html/);
});

test("homepage historical pharmacy film uses the released documentary cut and tells readers where it leads",()=>{
 const home=read("index.html"),article=read("films/making-medicines-keep.html");
 assert.match(home,/source src="\/assets\/films\/series-v4\/making-medicines-keep\.mp4"/);
 assert.match(home,/src="\/assets\/films\/series-v4\/making-medicines-keep\.vtt"/);
 assert.match(article,/source src="\/assets\/films\/series-v4\/making-medicines-keep\.mp4"/);
 assert.doesNotMatch(home,/The entire transcript appears on the film page/);
 assert.doesNotMatch(home,/Read the script and examine each source/);
});
