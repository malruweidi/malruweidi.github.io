/* Childhood-to-researcher archival photo reveal (homepage only). */
(() => {
 "use strict";
 if(document.documentElement.dataset.rxPage!=="home")return;
 const childCutout="/assets/childhood-portrait-sharp-768-20261121.webp";
 const childArchive="/assets/childhood-portrait-sharp-768-20261121.webp";
 const isArabic=()=>document.documentElement.lang.toLowerCase().startsWith("ar");
 const both=(en,ar)=>'<span class="rx-then-now-en" lang="en">'+en+'</span><span class="rx-then-now-ar" lang="ar" dir="rtl">'+ar+'</span>';
 function init(){
  const hero=document.querySelector(".rx-hero-portrait");
  const mat=hero&&hero.querySelector(".rx-portrait-mat");
  const original=mat&&mat.querySelector(":scope > img");
  const open=mat&&mat.querySelector("#rx-then-now-open");
  if(!hero||!mat||!original||!open)return;
  if(document.getElementById("rx-then-now-dialog"))return;
  // The trigger is statically embedded inside the portrait photograph.
  // Its coordinates are relative to the photo and remain untouched here.
  const currentPortrait=original.getAttribute("src");
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
    '<figure class="rx-then-now-plate rx-then-now-plate--then"><div class="rx-then-now-child-stage"><span class="rx-then-now-child-annotation" aria-hidden="true">01 / '+both("CHILDHOOD","الطفولة")+'</span><img src="'+childArchive+'" alt="Enhanced background-free cutout from a childhood family photograph: a smiling child in an orange-and-yellow jacket holding a toy" width="768" height="768" loading="eager" decoding="async"></div><figcaption><span>'+both("THEN","آنذاك")+'</span><span>'+both("Enhanced cutout · family album","قصاصة محسّنة · ألبوم العائلة")+'</span></figcaption></figure>'+
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
   dialog.querySelector(".rx-then-now-plate--then img").alt=isArabic()?"صورة طفولة محسّنة بخلفية شفافة، لطفل يضحك ويرتدي معطفًا برتقاليًا وأصفر ممسكًا بلعبة":"Enhanced background-free childhood portrait of a laughing child in an orange-and-yellow jacket holding a toy";
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