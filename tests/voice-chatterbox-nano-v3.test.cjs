'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
test('source-only Chatterbox Nano audition planning works without model downloads or paid APIs',()=>{
  const src=fs.readFileSync(path.join(root,'scripts/voice-chatterbox-nano-v3.py'),'utf8');
  assert.match(src,/ChatterboxTurboTTS/);
  assert.match(src,/nano=True/);
  assert.match(src,/reference_consent/);
  assert.match(src,/plan.only|plan_only/);
  assert.doesNotMatch(src,/\b(?:runway|heygen|elevenlabs|replicate|fal\.ai)\b/i);
  const result=spawnSync('python',['scripts/voice-chatterbox-nano-v3.py','--film','making-medicines-keep','--plan-only'],{cwd:root,encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  const obj=JSON.parse(result.stdout);
  assert.equal(obj.film,'making-medicines-keep');
  assert.equal(obj.scenes.length,9);
  assert.equal(obj.status,'UNAPPROVED_NARRATION_PLAN');
  assert.ok(obj.scenes.every(s=>s.narration && s.duration_budget_seconds));
});
