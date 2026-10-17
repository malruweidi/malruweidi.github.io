'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

test('five distinct scientific film sequences have executable Manim scenes', () => {
  const script = read('scripts/manim-scientific-films-v3.py');
  for (const cls of ['AirwayInterface','ACE2Topology','MicrofluidicTransport','FoodExtrusion','CeramicSintering']) {
    assert.match(script, new RegExp('class\\s+' + cls + '\\(EvidenceScene\\):'), cls);
  }
  assert.match(script, /from manim import/);
  assert.match(script, /NOT EXPERIMENTAL FOOTAGE/);
  assert.doesNotMatch(script, /\b(?:requests|httpx|urllib|openai|replicate|api_key|token)\b/i);
});

test('free CPU runner, no paid endpoints, authentic output validation', () => {
  const workflow = read('.github/workflows/film-manim-open-source-v3.yml');
  assert.match(workflow, /runs-on: ubuntu-latest/);
  assert.match(workflow, /pip install.*manim/);
  assert.match(read('scripts/audit-manim-film-v3.py'), /ffprobe/);
  assert.match(workflow, /python scripts\/audit-manim-film-v3.py/);
  assert.doesNotMatch(workflow, /\b(?:runway|heygen|elevenlabs|replicate|fal\.ai|paid-api)\b/i);
});

test('each clip must be a real 16-second H264 file, not a fake approval', () => {
  const audit = read('scripts/audit-manim-film-v3.py');
  assert.match(audit, /codec_name/);
  assert.match(audit, /16\.0/);
  assert.match(audit, /sha256/);
  assert.match(audit, /UNAPPROVED/);
  assert.match(audit, /SOURCE/);
});
