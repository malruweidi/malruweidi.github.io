const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const story = JSON.parse(read("assets/films/what-survives-scenes.json"));
const renderer = read("scripts/render-documentary.py");

test("the zebrafish film is built from three distinct original recordings", () => {
  const scene = story.scenes.find(s => s.id === "07");
  assert.ok(scene, "zebrafish chapter retained");
  assert.equal(scene.videos.length, 3, "three archived recordings are used");
  assert.equal(new Set(scene.videos).size, 3, "each recording is a different file");
  for (const url of scene.videos) {
    assert.ok(url.startsWith("https://cdn.creativeclaw.co/") && url.endsWith(".mp4"), "original microscopy movie");
  }
  assert.match(renderer, /def make_motion_montage\(/, "montage must actually be implemented");
  assert.match(renderer, /required_video/, "film must fail if scientific footage is inaccessible");
});

test("published research figures are not zoom-cropped into false evidence", () => {
  for (const id of ["04", "09", "10"]) {
    const scene = story.scenes.find(s => s.id === id);
    assert.equal(scene.contain, true, "published figure must retain its full plot area");
  }
  assert.match(renderer, /def scientific_image_frame\(/);
  assert.match(renderer, /force_original_aspect_ratio=decrease/, "original footage must fit without cropping");
  assert.match(renderer, /SCIENTIFIC_SAFE_AREA/, "figure safe area is declared");
});

test("narration and film retain a quiet custom-made score, without licensed stock tracks", () => {
  assert.equal(story.running_seconds, 120);
  assert.match(renderer, /def film_score\(/);
  assert.match(renderer, /voice_envelope/, "music is ducked while speech plays");
  assert.match(renderer, /loudnorm/, "final mix has a repeatable loudness target");
  assert.doesNotMatch(renderer, /heygen|elevenlabs|stock_music/i);
});

test("the accessible homepage and full documented account remain intact", () => {
  const home = read("index.html");
  assert.match(home, /id="film"/);
  assert.match(home, /what-survives-the-experiment.mp4/);
  for (const anchor of ["research","story","publications","patient-perspective","quacs","writing"]) {
    assert.ok(home.includes('id="'+anchor+'"'));
  }
});
