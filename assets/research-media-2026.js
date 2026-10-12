/* Original research archive: display only once binary media are present. */
(()=>{"use strict";
const page=document.documentElement.dataset.rxPage;
if(!["archive","techniques"].includes(page))return;
const base="/assets/research-archive-2026/";
const arabic=()=>document.documentElement.lang.startsWith("ar");
const node=(tag,cls,txt)=>{let e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;};
const available=path=>new Promise(done=>{const i=new Image();i.onload=()=>done(true);i.onerror=()=>done(false);i.src=base+path;});
const makeCard=p=>{const f=node("figure","rx-research26-card"),a=node("a","rx-research26-photo"),img=node("img"),cap=node("figcaption");a.href=base+p.file;a.target="_blank";a.rel="noopener noreferrer";img.src=a.href;img.alt=p.alt;img.loading="lazy";img.decoding="async";a.append(img);cap.append(node("small",null,p.tag),node("strong",null,arabic()?p.arTitle:p.title),node("p",null,p.description));f.append(a,cap);return f;};
const gallery=(id,title,arab,intro,arr)=>{let sec=node("section","rx-research26-section");sec.id=id;let w=node("div","rx-research26-inner"),g=node("div","rx-research26-grid");arr.forEach(p=>g.append(makeCard(p)));w.append(node("small","rx-research26-label",arabic()?"صور من الأرشيف البحثي":"From the research archive"),node("h2",null,arabic()?arab:title),node("p","rx-research26-intro",intro),g,node("p","rx-research26-note",arabic()?"صور من الأرشيف الشخصي؛ تواريخ التصوير غير موثقة، ولا يُستدلّ منها على نتائج التجارب.":"Original owner-supplied photographs. Capture dates unverified. These are documentary views, not proof of experiment results."));sec.append(w);return sec;};
const add=(sec,selector)=>{const t=selector&&document.querySelector(selector);if(t){t.insertAdjacentElement("afterend",sec);return;}const foot=document.querySelector("footer");if(foot)foot.before(sec);else document.body.append(sec);};
async function run(){if(document.getElementById("rx-research26-archive")||document.getElementById("rx-research26-biological"))return;
let manifest;
try{const ready=await fetch(base+"media-ready.json",{cache:"no-store"});if(!ready.ok)return;const r=await fetch("/assets/research-media-manifest-2026.json",{cache:"no-store"});if(!r.ok)return;manifest=await r.json();}catch(_){return;}
const flags=await Promise.all(manifest.photos.map(p=>available(p.file)));const pictures=manifest.photos.filter((p,i)=>flags[i]);if(!pictures.length)return;
if(page==="archive"){let s=gallery("rx-research26-archive","From the bench to the clinic","من المختبر إلى العيادة","Research work has a physical history: preparation benches, microscopes, incubators, imaging rooms and the quieter intervals between experiments.",pictures);add(s,"#rxRecoveredGallery");if(await available(manifest.video.poster)){let v=node("video","rx-research26-video");v.controls=true;v.playsInline=true;v.preload="metadata";v.poster=base+manifest.video.poster;let source=node("source");source.src=base+manifest.video.file;source.type="video/mp4";v.append(source);s.querySelector(".rx-research26-inner").append(node("h3",null,manifest.video.title),node("p","rx-research26-intro",manifest.video.description),v);}return;}
for(const [topic,en,ar,intro,target] of [
["biological","Biological methods and specimen preparation","الطرق البيولوجية وتحضير العينات","Incubation, protected handling and stereomicroscopy as documented by original laboratory photographs.","#biological"],
["molecular","Chemistry and laboratory preparation","الكيمياء والتحضير المخبري","Sample-handling work, molecular-science literature and the preparation bench.","#molecular"],
["cardio","Cardiovascular imaging: spectral Doppler","تصوير القلب بدوبلر الطيفي","Echocardiography imaging observed at a clinical workstation, distinct from a diagnostic interpretation.","#hemodynamics"],
["archive","Other moments inside the research environment","لقطات أخرى من الحياة البحثية","Infrastructure and work sessions accompanying the scientific record.","#molecular"]]){
const arr=pictures.filter(p=>p.topic===topic);if(!arr.length)continue;const s=gallery("rx-research26-"+topic,en,ar,intro,arr);
if(topic==="cardio"){const heading=Array.from(document.querySelectorAll("h2,h3")).find(h=>/hemodynamic|cardio|echocard|doppler|valvular/i.test(h.textContent));if(heading){add(s,null);heading.closest("section")?.insertAdjacentElement("afterend",s);}else add(s,target);}
else {const t=document.querySelector(target);if(t)t.append(s);else add(s,null);}
if(topic==="archive"&&await available(manifest.video.poster)){const v=node("video","rx-research26-video");v.controls=true;v.preload="metadata";v.playsInline=true;v.poster=base+manifest.video.poster;const src=node("source");src.type="video/mp4";src.src=base+manifest.video.file;v.append(src);s.querySelector(".rx-research26-inner").append(node("p",null,manifest.video.title),v);}}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run,{once:true});else run();
})();