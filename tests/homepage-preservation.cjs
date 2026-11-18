const assert = require("node:assert/strict");

function assertHomepagePreserved(original, current) {
  const body = html => html.slice(html.indexOf("<body>"))
    .replaceAll('<span class="rx26-card-arrow" aria-hidden="true">↗</span>', "");
  let before = body(original);
  let after = body(current);
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
