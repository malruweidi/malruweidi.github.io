const assert = require("node:assert/strict");

function assertHomepagePreserved(original, current) {
  const body = html => html.slice(html.indexOf("<body>"))
    .replace(/style="[^"]*"/g, attr => attr.replace(/#[0-9a-f]{3,8}\b/gi, "#color"))
    .replaceAll('<span class="rx26-card-arrow" aria-hidden="true">↗</span>', "");
  let before = body(original);
  // The user explicitly withdrew the unsuccessful-histology film from the
  // public homepage. Preserve that removal; don't restore a retired link just
  // to satisfy the snapshot created before the editorial decision.
  const retiredFilm = '<p class="rx-home-film-meta"><a href="/films/two-materials-no-section.html" style="color:inherit;text-decoration:underline;text-underline-offset:4px">New film: Two Materials. No Section. · 02:30 ↗</a></p>';
  const retiredFilmMapping = ',"Zebrafish agarose–paraffin histopathology attempt":"histology-failure"';
  assert.ok(!body(current).includes(retiredFilm), "Retired film must not return to the homepage");
  assert.ok(!body(current).includes(retiredFilmMapping), "Retired film map must not return");
  before = before.replace(retiredFilm, "").replace(retiredFilmMapping, "");
  // Additive, individually identified editorial exhibits are outside the original
  // body snapshot. Only these complete, anchored sections may be excluded;
  // all historical film, archive, links and chapters must still match byte-for-byte.
  let after = body(current)
    .replace(/<nav class="home-contact-sheet" aria-labelledby="home-film-chapters"[^>]*>[\s\S]*?<\/nav>/, "")
    .replace(/<section class="rx-observation" id="research-workbench"[\s\S]*?<\/section>/, "")
    .replace(/<section class="rx-moments" id="rx-moving-moments"[\s\S]*?<\/section>/, "")
    .replace(/<details class="family-drawer" id="family-album">[\s\S]*?<\/details>/, "")
    .replace('<a href="/leadership.html#acs-recognition">Watch the ACS recognition clip ↗</a>', "")
    .replace(/<a class="specimen-swim"[^>]*>[\s\S]*?<\/a>/, "")
    .replace(/<summary class="album-summary"><span class="album-title">([^<]+)<\/span>[\s\S]*?<\/summary>/, "<summary>$1</summary>");
  // The optional gallery retains the original four source cards and their
  // links, but no longer floods the landing page with a second full carousel.
  // Native disclosure and the editor-approved introductory clarification are
  // the only permitted differences from the legacy chapter block.
  const earlierGalleryCopy = "I brought a microscope from Cairo to Qatar, struggled to dissolve a polymer, and watched an agarose-and-paraffin block fall apart while preparing zebrafish sections. Later, the problems of airway reopening took me into the mechanics of injury at the cell surface.";
  const currentGalleryCopy = "Four archival photographs connect an early anatomy lesson to chemistry, quantitative zebrafish imaging and pulmonary epithelial research. Each card leads to the fuller account.";
  assert.ok(after.includes('id="more-scientific-scenes"'), "Optional gallery disclosure missing");
  after = after.replace(/<details class="rx-chapters-expander" id="more-scientific-scenes">[\s\S]*?<\/summary>\s*/, "")
    .replace(/<\/section>\s*<\/details>(?=\s*<section class="rx-evidence-index")/, "</section>");
  for (const block of [
    /<nav class="rx-research-fastpaths"[\s\S]*?<\/nav>/,
    /<details class="rx-hero-readmore"[\s\S]*?<\/details>/,
    /<details class="rx-hero-backstory"[\s\S]*?<\/details>/,
    /<div class="rx-hero-footnote"[\s\S]*?<\/div><\/div>/,
    /<section class="rx-chapters"[\s\S]*?<\/section>/
  ]) {
    const preserved = before.match(block)?.[0];
    assert.ok(preserved, String(block));
    const actual = after.match(block)?.[0];
    if (String(block).includes("rx-chapters")) {
      assert.equal(actual?.replace(currentGalleryCopy, earlierGalleryCopy), preserved,
        "The original four archive cards and their links must remain intact");
    } else {
      assert.equal(actual, preserved, "Moved archive block must remain intact");
    }
    before = before.replace(block, "");
    after = after.replace(block, "");
  }
  after = after.replace(/<div class="rx-opening-links">[\s\S]*?<\/div>/, "")
    .replace(/<div class="rx-opening-notes">\s*<\/div>/, "");
  const trimGaps = html => html.replace(/>\s+</g, "><");
  assert.equal(trimGaps(after), trimGaps(before), "Original homepage body, media and links must survive the rearrangement");
}
module.exports = {assertHomepagePreserved};
