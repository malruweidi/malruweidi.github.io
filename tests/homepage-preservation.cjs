const assert = require("node:assert/strict");

function assertHomepagePreserved(original, current) {
  const body = html => html.slice(html.indexOf("<body>"))
    .replace(/style="[^"]*"/g, attr => attr.replace(/#[0-9a-f]{3,8}\b/gi, "#color"))
    .replaceAll('<span class="rx26-card-arrow" aria-hidden="true">↗</span>', "");
  let before = body(original);
  let after = body(current)
    .replace(/<details class="family-drawer" id="family-album">[\s\S]*?<\/details>/, "")
    .replace('<a href="/leadership.html#acs-recognition">Watch the ACS recognition clip ↗</a>', "")
    .replace(/<a class="specimen-swim"[^>]*>[\s\S]*?<\/a>/, "")
    .replace(/<summary class="album-summary"><span class="album-title">([^<]+)<\/span>[\s\S]*?<\/summary>/, "<summary>$1</summary>");
  for (const block of [
    /<nav class="rx-research-fastpaths"[\s\S]*?<\/nav>/,
    /<details class="rx-hero-readmore"[\s\S]*?<\/details>/,
    /<details class="rx-hero-backstory"[\s\S]*?<\/details>/,
    /<div class="rx-hero-footnote"[\s\S]*?<\/div><\/div>/,
    /<section class="rx-chapters"[\s\S]*?<\/section>/
  ]) {
    const preserved = before.match(block)?.[0];
    assert.ok(preserved, String(block));
    assert.equal(after.match(block)?.[0], preserved, "Moved archive block must remain intact");
    before = before.replace(block, "");
    after = after.replace(block, "");
  }
  after = after.replace(/<div class="rx-opening-links">[\s\S]*?<\/div>/, "")
    .replace(/<div class="rx-opening-notes">\s*<\/div>/, "");
  const trimGaps = html => html.replace(/>\s+</g, "><");
  assert.equal(trimGaps(after), trimGaps(before), "Original homepage body, media and links must survive the rearrangement");
}
module.exports = {assertHomepagePreserved};
