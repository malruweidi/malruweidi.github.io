import {readFileSync, existsSync, statSync} from "node:fs";
import {join, dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {createHash} from "node:crypto";
import test from "node:test";
import assert from "node:assert/strict";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = path => readFileSync(join(root, path), "utf8");
const fixtures = [
  ["archive.html", "assets/archival-inline/archive01.jpg", "16864b5bd8fa1c78c8af0afa3e6d4b6792689d3c"],
  ["archive.html", "assets/archival-inline/archive02.jpg", "3630edb7e870aeafb341032033d51b2873d0ca67"],
  ["archive.html", "assets/archival-inline/archive03.jpg", "9900930acf04aed971ba84c54da7c63d521b30ae"],
  ["archive.html", "assets/archival-inline/archive04.jpg", "c915aa9919fe8f982fdbbd17a42c444543de46d2"],
  ["archive.html", "assets/archival-inline/archive05.jpg", "bce6b296a1a34557c90a2c37d59359e0af1e4c45"],
  ["imaging.html", "assets/archival-inline/microzebralab-published-figure.jpg", "70712d36ea9a2fc50e530a9ace5471d4a5f9aeeb"],
  ["chem-squad.html", "assets/archival-inline/chem-squad-member.webp", "d5aa97b00bad57c32d461b938288f12849f7b5af"],
  ["chem-squad.html", "assets/archival-inline/chem-squad-sprite.webp", "4bc074de4fec495a8acd7fa6b02a3d1e123704c4"]
];
function gitSha(bytes) {
  const header = Buffer.from("blob " + bytes.length + "\0", "utf8");
  return createHash("sha1").update(header).update(bytes).digest("hex");
}

test("all eight original photo payloads are present byte-for-byte", () => {
  for (const [page, path, expected] of fixtures) {
    assert.ok(existsSync(join(root,path)), page + ": " + path);
    const bytes = readFileSync(join(root,path));
    assert.equal(gitSha(bytes), expected, "Original archive content changed: " + path);
    if (path.endsWith(".jpg")) {
      assert.equal(bytes[0], 0xff);
      assert.equal(bytes[1], 0xd8);
      assert.equal(bytes[2], 0xff);
    } else {
      assert.equal(bytes.subarray(0,4).toString("ascii"), "RIFF");
      assert.equal(bytes.subarray(8,12).toString("ascii"), "WEBP");
    }
  }
});

test("each original photo is still referenced at its original location", () => {
  for (const [page, path] of fixtures) {
    assert.ok(read(page).includes("/" + path), "Broken media reference: " + page + " " + path);
  }
  assert.doesNotMatch(read("archive.html"), /data:image\/jpeg;base64/);
  assert.doesNotMatch(read("imaging.html"), /data:image\/jpeg;base64/);
  assert.doesNotMatch(read("chem-squad.html"), /data:image\/webp;base64/);
});

test("captions, methods and scientific provenance remain intact", () => {
  const archive = read("archive.html");
  const imaging = read("imaging.html");
  const chemistry = read("chem-squad.html");
  for (const name of ["ARCHIVE 01", "ARCHIVE 02", "ARCHIVE 03", "ARCHIVE 04", "ARCHIVE 05",
    "Before the research career", "People, places, beginnings."]) {
    assert.ok(archive.includes(name), name);
  }
  assert.ok(imaging.includes("PUBLISHED RESEARCH FIGURE"));
  assert.ok(imaging.includes("MicroZebraLab"));
  assert.ok(chemistry.includes("Two archival photographs of Ahmed Elgendy"));
  assert.ok(chemistry.includes("Abdelgalil Khalaf"));
  assert.ok((archive.match(/<img\b/gi)||[]).length >= 12);
  assert.ok((imaging.match(/<img\b/gi)||[]).length >= 3);
  assert.ok((chemistry.match(/<img\b/gi)||[]).length >= 5);
});

test("HTML is lighter without decreasing the total public research archive", () => {
  // Allow a modest increase for carefully captioned, owner-provided photographs while keeping HTML lightweight.
  assert.ok(statSync(join(root,"archive.html")).size < 26000);
  assert.ok(statSync(join(root,"imaging.html")).size < 20000);
  assert.ok(statSync(join(root,"chem-squad.html")).size < 45000);
  assert.ok(existsSync(join(root,"stories.html")));
  assert.ok(existsSync(join(root,"figures.html")));
  assert.ok(existsSync(join(root,"archive/archive-video-2016.mp4")));
});

test("new archival photographs are small standalone WebP assets, not inlined images",()=>{
 const manifest=JSON.parse(read("assets/owner-archive-2026-10-15-manifest.json"));
 assert.equal(manifest.entries.length,4);
 for(const entry of manifest.entries){
  const path=join(root,entry.target);
  assert.ok(existsSync(path),entry.target);
  const data=readFileSync(path);
  assert.ok(data.length<90000,"Oversized WebP: "+entry.target);
  assert.equal(data.subarray(0,4).toString("ascii"),"RIFF");
  assert.equal(data.subarray(8,12).toString("ascii"),"WEBP");
 }
 assert.equal(read("stories.html").includes("data:image/webp;base64"),false);
});
