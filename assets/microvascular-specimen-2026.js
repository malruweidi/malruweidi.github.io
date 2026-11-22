/* Ruwaidix / Microvascular flow specimen — 23 Nov 2026.
 * The motion is an illustration of erythrocyte transit, not recorded flow.
 * It deliberately remains the size of the homepage zebrafish.
 * On wide screens its placement is computed from the *actual* zebrafish
 * bounding box and checked against the original headline and photograph.
 * At other widths it becomes a normal-flow item and cannot overlap content. */
(() => {
 "use strict";
 if(document.documentElement.dataset.rxPage!=="home")return;
 const vessel=document.querySelector(".rx-microvessel");
 const grid=document.querySelector(".rx-hero-grid");
 const fish=document.querySelector(".specimen-swim");
 const portrait=document.querySelector(".rx-hero-portrait");
 const title=document.querySelector(".rx-hero-title");
 const kicker=document.querySelector(".rx-hero-kicker");
 const topline=document.querySelector(".rx-hero-topline");
 const copy=document.querySelector(".rx-hero-copy");
 if(!vessel||!grid||!fish||!portrait||!title||!kicker||!copy)return;
 const wide=window.matchMedia("(min-width:1200px)");
 let raf=0;
 const intersects=(a,b,pad=9)=>(
   a.left < b.right+pad && a.right > b.left-pad &&
   a.top < b.bottom+pad && a.bottom > b.top-pad
 );
 function tightTextRects(el){
   if(!el)return [];
   const range=document.createRange();
   range.selectNodeContents(el);
   const boxes=[...range.getClientRects()].filter(rect=>rect.width>0&&rect.height>0);
   range.detach?.();
   return boxes.length?boxes:[el.getBoundingClientRect()];
 }
 function inline(){
   const reference=copy.querySelector(".rx-pocket-note")||copy.querySelector(".rx-hero-footnote");
   if(reference){if(vessel.parentElement!==copy||vessel.nextElementSibling!==reference)copy.insertBefore(vessel,reference);}
   else if(vessel.parentElement!==copy)copy.appendChild(vessel);
   vessel.dataset.placement="inline";
   vessel.style.removeProperty("left");
   vessel.style.removeProperty("top");
 }
 function place(){
   if(!wide.matches){inline();return;}
   if(vessel.parentElement!==grid)grid.appendChild(vessel);
   vessel.dataset.placement="floating";
   vessel.style.left="-1000px";
   vessel.style.top="-1000px";
   const fr=fish.getBoundingClientRect();
   const gr=grid.getBoundingClientRect();
   const w=vessel.offsetWidth||166;
   const h=vessel.offsetHeight||84;
   /* Art remains left of the fish, not between the fish and portrait.
      This is an empty, elevated corner of the existing hero. */
   const x=fr.left-w-21, y=fr.top-10;
   const candidate={left:x,right:x+w,top:y,bottom:y+h};
   const blockers=[
     ...tightTextRects(title),...tightTextRects(kicker),
     portrait.getBoundingClientRect(),topline?.getBoundingClientRect()
   ].filter(Boolean);
   const valid=x>=gr.left-5 &&
     y>=gr.top-100 &&
     candidate.right<fr.left-10 &&
     blockers.every(rect=>!intersects(candidate,rect,8));
   if(!valid){inline();return;}
   vessel.style.left=(x-gr.left)+"px";
   vessel.style.top=(y-gr.top)+"px";
 }
 function schedule(){
   if(raf)cancelAnimationFrame(raf);
   raf=requestAnimationFrame(()=>{raf=0;place();});
 }
 function updateAccessibleLabel(){
   const arabic=document.documentElement.lang.toLowerCase().startsWith("ar");
   vessel.setAttribute("aria-label",arabic
     ?"تدفق كريات الدم الحمراء في وعاء دموي دقيق، رسم توضيحي. افتح دراسة التصوير الوعائي لسمك الزرد."
     :"Microvascular erythrocyte flow, conceptual animation. Open the zebrafish vascular imaging investigation.");
 }
 updateAccessibleLabel();
 const io="IntersectionObserver" in window?new IntersectionObserver(entries=>{
   vessel.dataset.paused=String(document.hidden||!entries[0].isIntersecting);
 },{rootMargin:"120px",threshold:0}):null;
 io?.observe(vessel);
 document.addEventListener("visibilitychange",()=>{
   vessel.dataset.paused=String(document.hidden);
 });
 const mo=typeof MutationObserver!=="undefined"?new MutationObserver(updateAccessibleLabel):null;
 mo?.observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
 window.addEventListener("resize",schedule,{passive:true});
 wide.addEventListener?.("change",schedule);
 if(document.fonts?.ready)document.fonts.ready.then(schedule).catch(()=>{});
 window.addEventListener("load",schedule,{once:true});
 schedule();
})();