import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve,dirname,join} from "node:path";
import {fileURLToPath} from "node:url";
import {runInNewContext} from "node:vm";
const dir=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>readFileSync(join(dir,p),"utf8");
const context={};
runInNewContext(read("assets/kinetic-atlas-data-2026.js"),context);
for(const file of ["assets/kinetic-atlas-v2-core.js","assets/kinetic-atlas-v2-chemistry.js","assets/kinetic-atlas-v2-carriers.js","assets/kinetic-atlas-v2-lung.js","assets/kinetic-atlas-v2-living.js","assets/kinetic-atlas-v2-measurement.js","assets/kinetic-atlas-v2-history.js"])runInNewContext(read(file),context);
const data=context.RuwaidixAtlasData, render=context.RuwaidixAtlasDraw.draw;
test("all thirty illustrations receive a complete premium SVG scene",()=>{
  assert.equal(data.items.length,30);
  for(const item of data.items){
    const image=render(item[0],.4,{namespace:"atlas-main"});
    assert.match(image,/<svg[^>]+viewBox="0 0 640 380"/);
    assert.match(image,/<linearGradient/,"missing shaded vector treatment: "+item[0]);
    assert.match(image,/<radialGradient/,"missing volumetric treatment: "+item[0]);
    assert.match(image,/<filter/,"missing depth treatment: "+item[0]);
    assert.match(image,/<rect[^>]*rx=/,"missing composed frame: "+item[0]);
    assert.match(image,/aria-label=/);
    assert.doesNotMatch(image,/NaN|Infinity|undefined|<script|\bonload=/i);
    assert.ok(image.length>3500,"underdesigned scene: "+item[0]);
  }
});
test("reusable gradients, clips and filters have independent IDs between card and main panel",()=>{
  for(const item of data.items){
    const a=render(item[0],.33,{namespace:"atlas-main"});
    const b=render(item[0],.33,{namespace:"mini-01"});
    assert.notEqual(a,b,"distinct SVG namespaces required: "+item[0]);
    const defs=svg=>Array.from(svg.matchAll(/\bid="([^"]+)"/g)).map(match=>match[1]);
    const aids=defs(a),bids=defs(b);
    assert.equal(aids.length,new Set(aids).size);
    assert.equal(bids.length,new Set(bids).size);
    assert.ok(aids.every(id=>!bids.includes(id)),"SVG ID collision: "+item[0]);
    for(const [src,ids] of [[a,aids],[b,bids]]){
      const refs=Array.from(src.matchAll(/url\(#([^)]*)\)/g)).map(match=>match[1]);
      for(const ref of refs) assert.ok(ids.includes(ref),"Unresolved gradient/clip/filter #"+ref+" in "+item[0]);
    }
  }
});
test("every scene retains a meaningful interactive visual change and documented illustration boundaries",()=>{
  for(const e of data.items){
    const states=[0,.25,.5,.75,1].map(t=>render(e[0],t,{namespace:"test"}));
    assert.ok(new Set(states).size>=3,"insufficient interactive states: "+e[0]);
    assert.equal(render(e[0],-100),render(e[0],0));
    assert.equal(render(e[0],100),render(e[0],1));
  }
});
test("all thirty visuals stay confined to their interactive scientific atlas",()=>{
  const ui=read("assets/kinetic-atlas-ui-2026.js");
  assert.doesNotMatch(read("index.html"),/kinetic-chapter-cards-2026\\.(?:css|js)/);
  assert.match(ui,/namespace:\s*"atlas-main"/);
  for(const file of ["assets/kinetic-atlas-v2-core.js","assets/kinetic-atlas-v2-chemistry.js","assets/kinetic-atlas-v2-carriers.js","assets/kinetic-atlas-v2-lung.js","assets/kinetic-atlas-v2-living.js","assets/kinetic-atlas-v2-measurement.js","assets/kinetic-atlas-v2-history.js"])assert.ok(read("index.html").includes(file),"Missing V2 module "+file);
});
