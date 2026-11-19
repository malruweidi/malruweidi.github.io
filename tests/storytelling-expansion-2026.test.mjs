import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source = p => readFileSync(new URL("../" + p, import.meta.url),"utf8");

test("the original Stories route and chapters remain intact beside the new physical specimen drawer",()=>{
  const s=source("stories.html");
  assert.match(s,/id="story-pathways"/);
  for(const id of ["personal-microscope","unfortunate-trials"]) assert.ok(s.includes('id="'+id+'"'));
  assert.match(s,/id="rx-evidence-cabinet"/);
  assert.match(s,/data-rx-display="cabinet"/);
  assert.match(s,/copolymer-sample-qatar-university-2017\.webp/);
  assert.equal((s.match(/data-rx-panel/g)||[]).length,2,"the intentionally curated cabinet contains two original photographic records");
  assert.doesNotMatch(s,/\/stories\/failed-zebrafish-histology\.html/);
  assert.match(s,/cairo-microscope\.html/);
});
test("method switcher uses distinguishable actual figure and conceptual drawings, links to dossiers",()=>{
  const s=source("research.html");
  assert.match(s,/id="rx-method-scale"/);
  assert.match(s,/data-rx-display="scales"/);
  assert.match(s,/evidence-zebrafish\.webp/);
  assert.match(s,/SCHEMATIC/);
  assert.match(s,/\/research\/high-speed-zebrafish-imaging\.html/);
  assert.match(s,/\/research\/inhalable-vesicles\.html/);
  assert.match(s,/id="research-sections"/);
  assert.match(s,/id="historical-research"/);
});
test("all visual controls are keyboard accessible with no-JS readable fallback",()=>{
  const js=source("assets/ruwaidix-gallery-atelier-2026.js");
  const css=source("assets/ruwaidix-gallery-atelier-2026.css");
  assert.match(js,/ArrowRight/);
  assert.match(js,/ArrowLeft/);
  assert.match(js,/Home/);
  assert.match(js,/End/);
  assert.match(js,/aria-selected/);
  assert.match(js,/dataset\.enhanced/);
  assert.match(css,/data-enhanced="true"/);
  assert.match(css,/prefers-reduced-motion:\s*reduce/);
  assert.match(css,/max-width:\s*600px/);
});
test("the archive has provenance-led decorative file indices, not replacement cards",()=>{
  const archive=source("archive.html");
  const css=source("assets/ruwaidix-gallery-atelier-2026.css");
  assert.match(archive,/id="rxOctoberPhotoArchive"/);
  assert.match(archive,/id="rxRecoveredGallery"/);
  assert.match(css,/rx-archive-object-grid/);
  assert.match(css,/counter-increment/);
});
test("homepage retains original film, portrait and chapter routes while editorial cards gain detail",()=>{
 const home=source("index.html");
 const css=source("assets/ruwaidix-gallery-atelier-2026.css");
 assert.match(home,/anatomy-of-a-question-2026-v2\.mp4/);
 assert.match(home,/class="family-drawer"/);
 assert.match(home,/id="research-workbench"/);
 assert.match(css,/rx-chapter-card/);
 assert.match(home,/ruwaidix-gallery-atelier-2026\.css/);
});
