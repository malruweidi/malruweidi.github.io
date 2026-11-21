/* Childhood-to-researcher archival photo reveal (homepage only). */
(() => {
 "use strict";
 if(document.documentElement.dataset.rxPage!=="home")return;
 const childCutout="/assets/yellow-childhood-cutout.svg";
 const childArchive="/archive/archive-7882.jpg";
 const isArabic=()=>document.documentElement.lang.toLowerCase().startsWith("ar");
 const both=(en,ar)=>'<span class="rx-then-now-en" lang="en">'+en+'</span><span class="rx-then-now-ar" lang="ar" dir="rtl">'+ar+'</span>';
 function init(){
  const hero=document.querySelector(".rx-hero-portrait");
  const original=hero&&hero.querySelector(".rx-portrait-mat img");
  const scene=hero&&hero.closest(".rx-hero-grid");
  const open=document.getElementById("rx-then-now-open");
  if(!hero||!original||!scene||!open)return;
  if(document.getElementById("rx-then-now-dialog"))return;
  const currentPortrait=original.getAttribute("src");
  // The visible cutout lives in the homepage HTML, and must be positioned
  // relative to the REAL microscope object, not the research photograph.
  scene.classList.add("rx-then-now-scene");
  function placeTrigger(){
   const scope=document.querySelector(".rx-scope-object");
   if(!scope||!scope.isConnected)return;
   const grid=scene.getBoundingClientRect();
   const microscope=scope.getBoundingClientRect();
   const cutout=open.getBoundingClientRect();
   if(!grid.width||!microscope.width||!cutout.width)return;
   const mobile=window.matchMedia("(max-width: 780px)").matches;
   const left=mobile
    ? microscope.left-grid.left-Math.min(24,cutout.width*.2)
    : microscope.left-grid.left-cutout.width+5;
   // Align the childhood photograph with the microscope's base on desktop,
   // or with its lower half on smaller, single-column layouts.
   const top=mobile
    ? microscope.bottom-grid.top-cutout.height*.86
    : microscope.bottom-grid.top-cutout.height+10;
   open.style.left=Math.round(Math.min(Math.max(0,left),Math.max(0,grid.width-cutout.width)))+"px";
   open.style.top=Math.round(Math.max(0,top))+"px";
  }
  placeTrigger();
  window.addEventListener("resize",placeTrigger,{passive:true});
  window.addEventListener("load",placeTrigger,{once:true});
  // The microscope is injected by the archival-object enhancement after
  // the static hero is parsed. Observe that precise scene until it arrives.
  if("MutationObserver" in window){
   const sceneObserver=new MutationObserver(()=>{
    if(document.querySelector(".rx-scope-object")){
     placeTrigger();sceneObserver.disconnect();
    }
   });
   if(!document.querySelector(".rx-scope-object"))
    sceneObserver.observe(scene,{childList:true,subtree:true});
  }
  if("ResizeObserver" in window){
   const sizeObserver=new ResizeObserver(placeTrigger);
   sizeObserver.observe(scene);
   const microscope=document.querySelector(".rx-scope-object");
   if(microscope)sizeObserver.observe(microscope);
  }
  if(!original.complete)original.addEventListener("load",placeTrigger,{once:true});
  const dialog=document.createElement("dialog");
  dialog.id="rx-then-now-dialog";dialog.className="rx-then-now-dialog";
  dialog.setAttribute("aria-labelledby","rx-then-now-title");
  dialog.setAttribute("aria-describedby","rx-then-now-description");
  dialog.innerHTML='<div class="rx-then-now-shell">'+
   '<button type="button" class="rx-then-now-close" data-then-now-close aria-label="Close photo story">×</button>'+
   '<span class="rx-then-now-kicker">'+both("TWO IMAGES / ONE PERSONAL ARCHIVE","صورتان / أرشيف شخصي واحد")+'</span>'+
   '<h2 id="rx-then-now-title">'+both("Before the lab coat.","قبل المعطف المخبري.")+'</h2>'+
   '<p id="rx-then-now-description" class="rx-then-now-intro">'+both("A childhood photograph from the family album, alongside a later research portrait at Qatar University. Two moments, separated by years of learning.", "صورة من ألبوم العائلة في الطفولة، إلى جانب صورة لاحقة خلال العمل البحثي في جامعة قطر. لحظتان تفصل بينهما سنوات من التعلّم.")+'</p>'+
   '<div class="rx-then-now-plates">'+
    '<figure class="rx-then-now-plate rx-then-now-plate--then"><img src="'+childArchive+'" alt="Mahmoud as a laughing child holding a colorful toy, from the family album" width="750" height="606" loading="lazy"><figcaption><span>'+both("THEN","آنذاك")+'</span><span>'+both("Family album","ألبوم العائلة")+'</span></figcaption></figure>'+
    '<figure class="rx-then-now-plate rx-then-now-plate--now"><img src="'+currentPortrait+'" alt="Mahmoud Al-Ruweidi in a laboratory coat at Qatar University" width="1536" height="2048" loading="lazy"><figcaption><span>'+both("NOW","لاحقًا")+'</span><span>'+both("Research portrait · 2026","صورة بحثية · ٢٠٢٦")+'</span></figcaption></figure>'+
   '</div>'+
   '<div class="rx-then-now-end"><p>'+both("The photographs are archival; the connection is personal.","الصورتان من الأرشيف؛ والرابط بينهما شخصي.")+'</p>'+
   '<div class="rx-then-now-links"><a href="/archive.html">'+both("Open the photo archive ↗","استكشف أرشيف الصور ↗")+'</a><a href="/research.html">'+both("Explore the research ↗","استكشف الأبحاث ↗")+'</a></div></div>'+
   '</div>';
  document.body.appendChild(dialog);
  const close=dialog.querySelector("[data-then-now-close]");
  function syncLabels(){
   open.setAttribute("aria-label",isArabic()?"افتح رحلة مصوّرة من الطفولة إلى البحث العلمي":"Open childhood-to-researcher photo story");
   close.setAttribute("aria-label",isArabic()?"إغلاق قصة الصور":"Close photo story");
   dialog.querySelector(".rx-then-now-plate--then img").alt=isArabic()?"محمود في طفولته يضحك ممسكًا بلعبة ملوّنة من ألبوم العائلة":"Mahmoud as a laughing child holding a colorful toy, from the family album";
   dialog.querySelector(".rx-then-now-plate--now img").alt=isArabic()?"محمود الرويدي مرتديًا المعطف المخبري في جامعة قطر":"Mahmoud Al-Ruweidi in a laboratory coat at Qatar University";
  }
  syncLabels();
  if("MutationObserver" in window)new MutationObserver(syncLabels).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
  open.addEventListener("click",()=>{syncLabels();
   hero.classList.remove("rx-then-now-revealing");
   void hero.offsetWidth;
   hero.classList.add("rx-then-now-revealing");
   if(typeof dialog.showModal==="function")dialog.showModal();
   else dialog.setAttribute("open","");
   close.focus();
  });
  close.addEventListener("click",()=>dialog.close());
  dialog.addEventListener("click",event=>{if(event.target===dialog)dialog.close()});
  dialog.addEventListener("close",()=>open.focus({preventScroll:true}));
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();