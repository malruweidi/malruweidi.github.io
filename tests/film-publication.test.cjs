const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const crypto = require("node:crypto");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const get = (file) => fs.readFileSync(path.join(root, file));
const read = (file) => get(file).toString("utf8");
const json = (file) => JSON.parse(read(file));
const film = read("film.html");
const home = read("index.html");
const credits = json("assets/films/what-survives-scenes.json");
const manifest = json("assets/films/what-survives-build.json");
const vtt = read("assets/films/what-survives-the-experiment.vtt");

test("released film binary matches the documented reproducible render", () => {
  const data = get("assets/films/what-survives-the-experiment.mp4");
  assert.ok(data.length > 1000000, "film needs a real MP4 payload");
  assert.equal(data.toString("ascii", 4, 8), "ftyp");
  assert.equal(crypto.createHash("sha256").update(data).digest("hex"), manifest.video_sha256);
  assert.ok(Math.abs(manifest.seconds - 120) < 0.2);
  assert.equal(manifest.clip_sources.length, 12);
});

test("twelve accountable scenes remain in the film and archived research record", () => {
  assert.equal(credits.scenes.length, 12);
  assert.equal(credits.running_seconds, 120);
  for (const [i, scene] of credits.scenes.entries()) {
    assert.equal(scene.id, String(i + 1).padStart(2, "0"));
    assert.ok(scene.credit && scene.image && scene.narration && scene.link);
    assert.ok(film.includes(scene.narration), "film page has current spoken narration for scene " + scene.id);
    if (!scene.image.startsWith("https://"))
      assert.ok(fs.existsSync(path.join(root, scene.image)), scene.image);
    if (scene.video && !scene.video.startsWith("https://"))
      assert.ok(fs.existsSync(path.join(root, scene.video)), scene.video);
  }
});

test("captions are time ordered and end within the two-minute film", () => {
  assert.match(vtt, /^WEBVTT\s*\n/);
  const times = [...vtt.matchAll(/(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/g)];
  assert.ok(times.length >= 12);
  const sec = (t) => {
    const [h, m, rest] = t.split(":");
    return Number(h) * 3600 + Number(m) * 60 + Number(rest);
  };
  let previous = -1;
  for (const [, start, end] of times) {
    assert.ok(sec(start) >= previous, "caption starts must be monotone");
    assert.ok(sec(end) > sec(start), "caption has nonzero length");
    assert.ok(sec(end) <= 120, "caption does not overrun video");
    previous = sec(end);
  }
});

test("homepage has an accessible locally hosted film rather than watermarked HeyGen", () => {
  const section = home.match(/<section class="rx-home-film"[\s\S]*?<\/section>/)?.[0];
  assert.ok(section, "featured film section still exists");
  assert.ok(section.includes("/assets/films/what-survives-the-experiment.mp4"));
  assert.match(section, /kind="captions"/);
  assert.ok(section.includes('href="/film.html"'));
  assert.doesNotMatch(section, /heygen\.ai|app\.heygen|resource2\.heygen/i);
});

test("film source page provides playable video, bilingual transcript and correct scholarly links", () => {
  assert.ok(film.includes('lang="ar" dir="rtl"'));
  assert.equal((film.match(/class="film-arabic-num"/g) || []).length, 12);
  assert.ok(film.includes('kind="captions"'));
  assert.ok(film.includes('href="/assets/films/what-survives-the-experiment.mp4"'));
  assert.ok(film.includes('https://schema.org'));
  assert.ok(film.includes("PT2M"));
  assert.ok(film.includes("index.html#writing"));
  assert.doesNotMatch(film, /href="writing\.html"/);
  assert.doesNotMatch(film, /app\.heygen|resource2\.heygen/i);
});
