/* Public-facing editorial cleanup; maintain provenance without internal QA annotations. */
(function(){
 "use strict";
 const replacements=[
  [/Before university\s*·\s*Personal archive\s*·\s*Original date unverified/gi,"Before university · Personal archive"],
  [/Away from the bench\s*\/\s*New York\s*·\s*date unverified/gi,"Away from the bench / New York · Personal archive"],
  [/New York\s*·\s*date unverified/gi,"New York · Personal archive"],
  [/CHILDHOOD PHOTOGRAPH\s*·\s*DATE UNVERIFIED/g,"CHILDHOOD PHOTOGRAPH · FAMILY ARCHIVE"],
  [/Personal archive\s*·\s*Original date unverified/gi,"Personal archive"],
  [/Personal archive\s*·\s*date unverified/gi,"Personal archive"],
  [/A much earlier version of me\s*·\s*Personal archive\s*·\s*Undated/gi,"A childhood photograph · Personal archive"],
  [/قبل الجامعة\s*·\s*أرشيف شخصي\s*·\s*التاريخ الأصلي غير مؤكد/g,"قبل الجامعة · أرشيف شخصي"],
  [/صورة من الطفولة\s*·\s*التاريخ غير مؤكد/g,"صورة من الطفولة · أرشيف عائلي"],
  [/نيويورك\s*·\s*التاريخ غير مؤكد/g,"نيويورك · أرشيف شخصي"]
 ];
 const eligible="figcaption,.rx-field-meta,.rx-field-source,.story-photo figcaption,.photo-opening p,.photo-card small,.archive-caption,.photo-caption,.archive-meta";
 function patch(){
  if(document.documentElement.dataset.rxPage==="editorial-home")return;
  document.querySelectorAll(eligible).forEach(function(el){
   const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
   let n;while((n=walker.nextNode())){
    let value=n.nodeValue;
    for(const pair of replacements)value=value.replace(pair[0],pair[1]);
    if(value!==n.nodeValue)n.nodeValue=value;
   }
  });
  document.querySelectorAll('a[target="_blank"]').forEach(function(a){
   const existing=a.getAttribute("rel")||"";
   if(!/(^|\s)noopener(\s|$)/.test(existing))a.setAttribute("rel",(existing+" noopener noreferrer").trim());
  });
  if(location.pathname.endsWith("/preview-rx23.html")){
   let meta=document.querySelector('meta[name="robots"]');
   if(!meta){meta=document.createElement("meta");meta.name="robots";document.head.appendChild(meta)}
   meta.content="noindex, nofollow";
   document.querySelectorAll(".preview-strip,.eyebrow,.smallcaps").forEach(function(e){
    if(/REDESIGN PREVIEW\s*·\s*PUBLIC HOMEPAGE UNCHANGED/i.test(e.textContent.trim()))e.textContent="Design study";
   });
  }
 }
 function ready(){
  patch();
  new MutationObserver(function(){requestAnimationFrame(patch)}).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",ready,{once:true});
 else ready();
})();
