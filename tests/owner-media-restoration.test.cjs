"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const base = "assets/owner-archive-2026-10-13/";
const blobs = {
  "library-lab-coat-cold.webp": "92a2a1a1afc86f3d86349c77d7a2619ee13d9409",
  "first-chem101-lab-visit.webp": "5b957c9f586b0b48e30f13481c1e87d6c3fb7c56",
  "high-school-graduation.webp": "06424646bafd913c760b5ff766ade42ba2591f5d",
  "return-to-early-school.webp": "854629b52b8a0df8679f008e7b5397b4cff7897f",
  "al-thakhira-research-judging.webp": "a8c11dbc14786889ae65c0a2530b03d9b65f64a6",
  "hbku-research-visit.webp": "5eb8ca5d6cd3b6bf06a2ff43603effc0e1b8297f",
  "sterlitech-ro-nf-membrane-setup.webp": "a7582b63888a14ff456f2f45172ebc9b84164130",
  "ramadan-microscopy-room.webp": "d1d02cab479f87ed8e87423ac139f93b93a77144",
  "khaled-jama-thesis-reaction.mp4": "e9c399fd44a6ec5e93735bfb3e3af8a549316401",
  "khaled-jama-thesis-reaction-poster.webp": "9cdbba7cd443a34c7f602ba1cc569a6019908145"
};
test("all ten recovered binary assets are original byte-exact copies of the approved publication derivatives", () => {
  for (const [filename, expected] of Object.entries(blobs)) {
    const file = path.join(root, base, filename);
    assert.ok(fs.existsSync(file), "missing restored media " + filename);
    const bytes = fs.readFileSync(file);
    const sha = crypto.createHash("sha1").update(Buffer.from("blob " + bytes.length + "\0")).update(bytes).digest("hex");
    assert.equal(sha, expected, "unexpected byte changes to " + filename);
    if (filename.endsWith(".webp")) {
      assert.equal(bytes.toString("ascii", 0, 4), "RIFF", filename);
      assert.equal(bytes.toString("ascii", 8, 12), "WEBP", filename);
    } else {
      assert.equal(bytes.toString("ascii", 4, 8), "ftyp", filename);
    }
  }
});
test("conditional archival placements identify subjects correctly and preserve existing stories", () => {
  const source = fs.readFileSync(path.join(root, "assets/owner-archive-2026-10-13.js"), "utf8");
  const story = fs.readFileSync(path.join(root, "stories.html"), "utf8");
  const film = fs.readFileSync(path.join(root, "moving-evidence.html"), "utf8");
  const pages = ["stories.html","archive.html","engagement.html","chem-squad.html"];
  for (const p of pages) {
    const page = fs.readFileSync(path.join(root,p),"utf8");
    assert.ok(page.includes('owner-archive-2026-10-13.js'), "conditional gallery not loaded: " + p);
  }
  for (const f of Object.keys(blobs)) {
    if (f.includes("poster")) continue;
    assert.ok(source.includes(f), "missing owned source registration: " + f);
  }
  assert.match(source, /Khaled Jama Mohamoud/);
  assert.match(source, /library was cold/);
  assert.match(source, /research visit/);
  assert.ok(story.includes('id="ramadan-atvb"'));
  assert.ok(film.includes(base + "khaled-jama-thesis-reaction.mp4"));
  assert.ok(!film.includes("Khaled's own thesis"), "avoid attributing mechanism to the wrong researcher");
});
