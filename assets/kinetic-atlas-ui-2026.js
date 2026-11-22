/* Kinetic Atlas interface: keyboard accessible, progressive, bilingual and low-power. */
(function(){
"use strict";
if(typeof document==="undefined"||document.documentElement.dataset.rxPage!=="home")return;
function initialize(){
 const data=globalThis.RuwaidixAtlasData,drawer=globalThis.RuwaidixAtlasDraw;
 const existing=document.getElementById("rx-kinetic-atlas");
 if(!data||!drawer||(existing&&existing.dataset.rxAtlasReady==="true"))return;
 const target=document.getElementById("research-workbench")||document.getElementById("rx26-portal");
 if(!target&&!existing)return;
 const node=existing||document.createElement("section");
 node.dataset.rxAtlasReady="true";
 node.className="rx-atlas";node.id="rx-kinetic-atlas";node.dataset.i18nIgnore="";
 node.setAttribute("aria-labelledby","rx-atlas-heading");
 node.innerHTML='<div class="rx-atlas-shell">'+
  '<header class="rx-atlas-head"><div><p class="rx-kinetic-kicker" id="rx-kinetic-kicker">THE MOVING FIELD GUIDE / 30 SCENES</p><h2 id="rx-atlas-heading">Touch the <em>question.</em></h2></div>'+
  '<p id="rx-atlas-lead">A cabinet of working illustrations. Choose a subject and move the control. All drawings are conceptual, never experimental observations.</p></header>'+
  '<div class="rx-atlas-categories" id="rx-atlas-categories" role="group" aria-label="Filter scenes by subject"></div>'+
  '<div class="rx-atlas-columns"><div class="rx-atlas-primary"><div class="rx-atlas-device"><div class="rx-atlas-topline"><span id="rx-atlas-serial">FIELD GUIDE / 01</span>'+
  '<i class="rx-atlas-light" aria-hidden="true"></i><span id="rx-atlas-mode">ILLUSTRATION / NOT DATA</span></div>'+
  '<div id="rx-atlas-canvas" class="rx-atlas-canvas"></div><div class="rx-atlas-footprint"><span>RUWAIDIX / KINETIC ATLAS</span><span id="rx-atlas-folio">01 / 30</span></div></div>'+
  '<div class="rx-atlas-controllers"><label for="rx-atlas-range" id="rx-atlas-range-label">Change setting</label>'+
  '<input id="rx-atlas-range" type="range" min="0" max="100" step="1" value="37">'+
  '<div class="rx-atlas-scale"><span id="rx-atlas-min">Initial</span><output id="rx-atlas-output" for="rx-atlas-range">37%</output><span id="rx-atlas-max">Changed</span></div>'+
  '<div class="rx-atlas-actions"><button type="button" id="rx-atlas-prev">← Previous</button><button type="button" id="rx-atlas-play" aria-pressed="false">▶ Animate</button>'+
  '<button type="button" id="rx-atlas-next">Next →</button></div></div>'+
  '</div><aside class="rx-atlas-sidebar"><div class="rx-atlas-description"><span id="rx-atlas-category"></span><h3 id="rx-kinetic-scene-title"></h3><p id="rx-atlas-explanation"></p>'+
  '<div class="rx-atlas-related"><a id="rx-atlas-source" href="/research.html">See the related work ↗</a><button id="rx-atlas-copy-link" type="button" aria-label="Copy a link to this scene">Copy scene link</button><output id="rx-atlas-copy-status" role="status" aria-live="polite"></output></div></div>'+
  '<div class="rx-atlas-sidebar-title"><strong id="rx-atlas-choose">Choose a movement</strong><span id="rx-atlas-total">30 / 30</span></div>'+
  '<label class="rx-atlas-search-label" for="rx-atlas-search" id="rx-atlas-search-caption">Search the collection</label>'+
  '<input type="search" class="rx-atlas-search" id="rx-atlas-search" autocomplete="off" placeholder="Search the 30 studies...">'+
  '<div id="rx-atlas-list" class="rx-atlas-list" role="group" aria-label="Choose a moving illustration"></div>'+
  '<button type="button" id="rx-atlas-surprise" class="rx-atlas-surprise">A different question ↗</button><button type="button" id="rx-atlas-guided" class="rx-atlas-guided">Follow six discoveries →</button></aside></div>'+
  '<p class="rx-atlas-boundary" id="rx-atlas-boundary">Interactive diagrams use normalized settings, not measured research data. Motion illustrates concepts; it does not establish experimental mechanisms or clinical outcomes.</p>'+
  '</div>';
 if(!existing)target.insertAdjacentElement(target.id==="research-workbench"?"afterend":"beforebegin",node);
 const q=id=>node.querySelector("#"+id), entries=data.items, groups=data.groups;
 let active=entries[0][0], group="all", search="", timer=null, direction=1;
 const guided=["indicator","bilayer","meniscus","zebrafish","focus","manuscript"];
 let guidedIndex=-1;
 const shareUrl=(id)=>{const u=new URL(window.location.href);u.searchParams.set("atlas",id);u.hash="rx-kinetic-atlas";return u.toString();};
 const requestedScene=()=>{try{const v=new URL(window.location.href).searchParams.get("atlas");return entries.some(e=>e[0]===v)?v:null;}catch{return null;}};
 active=requestedScene()||active;
 const isAr=()=>document.documentElement.lang==="ar";
 const T=(en,ar)=>isAr()?ar:en;
 const find=id=>entries.find(e=>e[0]===id);
 const matches=()=>entries.filter(e=>(group==="all"||e[1]===group)&&(!search||e[2].toLowerCase().includes(search)||e[3].includes(search)||e[4].toLowerCase().includes(search)||e[5].includes(search)));
 const reduced=()=>window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 const range=q("rx-atlas-range"),play=q("rx-atlas-play"),canvas=q("rx-atlas-canvas"),list=q("rx-atlas-list"),cats=q("rx-atlas-categories");
 function stop(){
   if(timer!==null){window.clearInterval(timer);timer=null;}
   node.classList.remove("rx-atlas-playing");
   play.setAttribute("aria-pressed","false");
   play.textContent=T("▶ Animate","▶ حرّك");
 }
 function draw(){
   const value=Number(range.value),e=find(active);
   canvas.innerHTML=drawer.draw(active,value/100,{namespace:"atlas-main",locale:isAr()?"ar":"en"});
   canvas.querySelector("svg")?.setAttribute("aria-label",T("Conceptual illustration: ","رسم توضيحي: ")+T(e[2],e[3]));
   q("rx-atlas-output").textContent=T("Illustrative: ","توضيحي: ")+value+"%";
 }
 function renderCategories(){
   cats.replaceChildren();
   [["all","All 30","الكل: ٣٠"]].concat(groups).forEach(g=>{
     const b=document.createElement("button");b.type="button";b.className="rx-atlas-cat";
     b.textContent=T(g[1],g[2]);b.setAttribute("aria-pressed",String(group===g[0]));
     b.addEventListener("click",()=>{stop();group=g[0];const visible=matches();if(visible.length&&!visible.some(e=>e[0]===active))active=visible[0][0];renderCategories();renderList();renderCurrent();});
     cats.appendChild(b);
   });
   cats.setAttribute("aria-label",T("Filter scenes by subject","تصفية المشاهد حسب الموضوع"));
 }
 function renderList(){
   const shown=matches();
   list.replaceChildren();
   q("rx-atlas-total").textContent=shown.length+" / 30";
   if(!shown.length){const p=document.createElement("p");p.className="rx-atlas-empty";p.textContent=T("No matching subjects. Try another word.","لم يُعثر على موضوع مطابق. جرّب كلمة أخرى.");list.append(p);return;}
   shown.forEach(e=>{
     const index=entries.indexOf(e)+1,b=document.createElement("button");
     b.type="button";b.className="rx-kinetic-pick";b.dataset.id=e[0];
     b.setAttribute("aria-pressed",String(active===e[0]));
     const no=document.createElement("span");no.className="rx-atlas-choice-no";no.textContent=String(index).padStart(2,"0");
     const title=document.createElement("span");title.className="rx-atlas-choice-name";title.textContent=T(e[2],e[3]);
     const arrow=document.createElement("span");arrow.setAttribute("aria-hidden","true");arrow.textContent="↗";
     b.append(no,title,arrow);
     b.addEventListener("click",()=>choose(e[0]));
     b.addEventListener("keydown",ev=>{
       if(ev.key!=="ArrowDown"&&ev.key!=="ArrowUp")return;
       ev.preventDefault();const buttons=Array.from(list.querySelectorAll("button"));
       buttons[(buttons.indexOf(b)+(ev.key==="ArrowDown"?1:-1)+buttons.length)%buttons.length]?.focus();
     });
     list.append(b);
   });
 }
 function renderCurrent(){
   const e=find(active);if(!e)return;
   node.dir=isAr()?"rtl":"ltr";
   const current=entries.indexOf(e)+1;
   q("rx-atlas-heading").innerHTML=T("Touch the <em>question.</em>","<em>المس</em> السؤال.");
   q("rx-kinetic-kicker").textContent=T("THE MOVING FIELD GUIDE / 30 SCENES","الدليل المتحرك / ٣٠ مشهدًا");
   q("rx-atlas-lead").textContent=T("A cabinet of working illustrations. Choose a subject and move the control. All drawings are conceptual, never experimental observations.","مجموعة رسوم تفاعلية؛ اختر موضوعًا وحرّك أداة التحكم. جميع الرسوم توضيحية ولا تعرض نتائج تجريبية.");
   q("rx-atlas-serial").textContent=T("FIELD GUIDE / ","الدليل / ")+String(current).padStart(2,"0");
   q("rx-atlas-mode").textContent=T("ILLUSTRATION / NOT DATA","توضيح / ليست بيانات");
   q("rx-atlas-folio").textContent=String(current).padStart(2,"0")+" / 30";
   const cat=groups.find(g=>g[0]===e[1]);q("rx-atlas-category").textContent=T(cat[1],cat[2])+" / "+String(current).padStart(2,"0");
   q("rx-kinetic-scene-title").textContent=T(e[2],e[3]);q("rx-atlas-explanation").textContent=T(e[4],e[5]);
   q("rx-atlas-range-label").textContent=T(e[6],e[7]);
   range.setAttribute("aria-label",T(e[6],e[7])+" — "+T("illustrative scale","مقياس توضيحي"));
   q("rx-atlas-min").textContent=T("Initial","بداية");q("rx-atlas-max").textContent=T("Changed","تغيير");
   q("rx-atlas-source").href=e[8];q("rx-atlas-source").textContent=T("Explore the related work ↗","استكشف العمل المرتبط ↗");
   q("rx-atlas-copy-link").textContent=T("Copy scene link","انسخ رابط المشهد");
   q("rx-atlas-copy-link").setAttribute("aria-label",T("Copy a direct link to this illustration","انسخ رابطًا مباشرًا لهذا الرسم"));
   q("rx-atlas-copy-status").textContent="";
   q("rx-atlas-choose").textContent=T("Choose a movement","اختر حركة");
   q("rx-atlas-search-caption").textContent=T("Search the collection","ابحث في المجموعة");
   q("rx-atlas-search").placeholder=T("Search the 30 studies...","ابحث في المشاهد الثلاثين...");
   q("rx-atlas-surprise").textContent=T("A different question ↗","سؤال آخر ↗");
   q("rx-atlas-guided").textContent=guidedIndex<0?T("Follow six discoveries →","اتبع ست محطات علمية ←"):guidedIndex>=guided.length-1?T("Restart the six-stop tour ↻","أعد الجولة ذات المحطات الست ↻"):T("Guided route · Stop "+(guidedIndex+1)+"/6 · Next →","الجولة · المحطة "+(guidedIndex+1)+"/٦ · التالي ←");
   q("rx-atlas-prev").textContent=T("← Previous","→ السابق");
   q("rx-atlas-next").textContent=T("Next →","التالي ←");
   play.textContent=timer===null?T("▶ Animate","▶ حرّك"):T("■ Stop","■ إيقاف");
   q("rx-atlas-boundary").textContent=T("Interactive diagrams use normalized settings, not measured research data. Motion illustrates concepts; it does not establish experimental mechanisms or clinical outcomes.","الرسوم التفاعلية تستخدم إعدادات توضيحية وليست بيانات بحثية مقاسة. تُظهر الحركة المفهوم ولا تثبت آلية تجريبية أو نتيجة سريرية.");
   draw();
   list.querySelectorAll("button[data-id]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.id===active)));
 }
 function choose(id){if(!find(id))return;stop();active=id;range.value="37";renderCurrent();
   try{window.history.replaceState(window.history.state,"",shareUrl(id));}catch{ /* URLs stay optional if history is restricted. */ }
 }
 function navigate(by){
   const all=matches();if(!all.length)return;
   let i=all.findIndex(e=>e[0]===active);
   choose(all[(i+by+all.length)%all.length][0]);
 }
 q("rx-atlas-prev").addEventListener("click",()=>navigate(-1));
 q("rx-atlas-next").addEventListener("click",()=>navigate(1));
 range.addEventListener("input",()=>{stop();draw();});
 play.addEventListener("click",()=>{
   if(timer!==null){stop();return;}
   if(reduced()){play.textContent=T("Motion disabled in system settings","الحركة معطّلة في إعدادات النظام");return;}
   node.classList.add("rx-atlas-playing");play.setAttribute("aria-pressed","true");play.textContent=T("■ Stop","■ إيقاف");
   timer=window.setInterval(()=>{
     let v=Number(range.value)+3*direction;
     if(v>=100){v=100;direction=-1;}
     if(v<=0){v=0;direction=1;}
     range.value=String(v);draw();
   },90);
 });
 q("rx-atlas-search").addEventListener("input",ev=>{
   search=ev.target.value.trim().toLocaleLowerCase();stop();
   if(matches().length&&!matches().some(e=>e[0]===active))active=matches()[0][0];
   renderList();renderCurrent();
 });
 q("rx-atlas-copy-link").addEventListener("click",()=>{
   const button=q("rx-atlas-copy-link"), status=q("rx-atlas-copy-status");
   const url=shareUrl(active);
   if(!navigator.clipboard?.writeText){
     status.textContent=T("Use the browser's address bar to copy the scene URL.","استخدم شريط العنوان لنسخ رابط المشهد.");
     try{window.history.replaceState(window.history.state,"",url);}catch{}
     return;
   }
   navigator.clipboard.writeText(url).then(()=>{
      status.textContent=T("Scene link copied.","تم نسخ رابط المشهد.");
   }).catch(()=>{
      status.textContent=T("Copy from the address bar instead.","انسخ الرابط من شريط العنوان.");
      try{window.history.replaceState(window.history.state,"",url);}catch{}
   });
 });
 q("rx-atlas-guided").addEventListener("click",()=>{
   guidedIndex=(guidedIndex+1)%guided.length;
   group="all";search="";q("rx-atlas-search").value="";
   renderCategories();renderList();choose(guided[guidedIndex]);
 });
 q("rx-atlas-surprise").addEventListener("click",()=>{
   const vis=matches();if(!vis.length)return;
   const possible=vis.filter(e=>e[0]!==active);
   choose((possible.length?possible:vis)[Math.floor(Math.random()*(possible.length||vis.length))][0]);
 });
 document.addEventListener("visibilitychange",()=>{if(document.hidden)stop();});
 if("IntersectionObserver" in window){
   const observer=new IntersectionObserver(ob=>{if(!ob[0].isIntersecting)stop();},{threshold:0});
   observer.observe(node);
 }
 if(typeof MutationObserver!=="undefined"){
   new MutationObserver(()=>{renderCategories();renderList();renderCurrent();})
      .observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
 }
 renderCategories();renderList();renderCurrent();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initialize,{once:true});else initialize();
})();