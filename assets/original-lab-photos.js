/* Contextual original lab photographs from user's 2017 archive. No procedure invented. */
(function(){
"use strict";
const run=()=>{
 if(document.documentElement.dataset.rxPage!=="techniques")return;
 if(document.getElementById("rxOriginalLabEggs"))return;
 const ar=document.documentElement.lang==="ar";
 function make({id,src,alt,title,titleAr,text,textAr,date,dateAr}){
   const figure=document.createElement("figure");figure.className="rx-lab-provenance";figure.id=id;
   const link=document.createElement("a");link.href=src;link.target="_blank";link.rel="noopener noreferrer";
   link.setAttribute("aria-label",ar?titleAr:title);
   const img=document.createElement("img");img.loading="lazy";img.decoding="async";img.src=src;img.alt=ar?titleAr:alt;link.append(img);
   const block=document.createElement("figcaption");
   const eyebrow=document.createElement("span");eyebrow.className="rx-archive-kicker";eyebrow.textContent=ar?"صورة أصلية من الأرشيف":"Original archive photograph";
   const name=document.createElement("h3");name.textContent=ar?titleAr:title;
   const desc=document.createElement("p");desc.textContent=ar?textAr:text;
   const meta=document.createElement("p");meta.className="rx-photo-meta";meta.textContent=ar?dateAr:date;
   const ref=document.createElement("a");ref.href="/archive.html#rxRecoveredGallery";ref.className="rx-provenance-link";ref.textContent=ar?"شاهد الأرشيف المصور ←":"Full photographic archive ↗";
   block.append(eyebrow,name,desc,meta,ref);figure.append(link,block);return figure;
 }
 const biological=document.querySelector("#biological .wrap.cols > div:first-child");
 if(biological){
   const pic=make({id:"rxOriginalLabEggs",src:"/archive/archive-7889.jpg",
   alt:"Numbered eggs arranged in a blue tray on a chemistry laboratory bench",
   title:"Preparation before observation",titleAr:"التحضير قبل الملاحظة",
   text:"A tray of individually marked eggs photographed at Qatar University in 2017. The image documents preparation, not a confirmed embryo stage, specimen viability or an experimental outcome.",
   textAr:"صينية بيض مرقّم التُقطت صورتها في جامعة قطر عام ٢٠١٧. توثّق الصورة مرحلة التحضير، لكنها لا تثبت عمر الأجنّة أو قابليتها للحياة أو نتيجة تجربة بعينها.",
   date:"29 April 2017 · 10:59 · Qatar University · photo-library display",
   dateAr:"٢٩ أبريل ٢٠١٧ · ١٠:٥٩ · جامعة قطر · حسب سجل مكتبة الصور"});
   const figs=biological.querySelectorAll("figure");
   const after=figs[figs.length-1];
   if(after)after.insertAdjacentElement("afterend",pic);else biological.append(pic);
 }
 const mol=document.querySelector("#molecular .wrap.columns > div:first-child");
 if(mol){
   const photo=make({id:"rxOriginalLabRotavap",src:"/archive/archive-7884.jpg",
    alt:"Rotary evaporator with glass condenser, round-bottom flask and water bath",
    title:"The bench behind the chemistry",titleAr:"جانب من العمل في مختبر الكيمياء",
    text:"A rotary evaporator photographed during university laboratory work. It records a familiar piece of synthesis and solvent-handling equipment, without assigning it to a particular publication.",
    textAr:"جهاز تبخير دوّار صُوّر أثناء العمل في مختبر الجامعة. توثّق الصورة أداة مستخدمة في التحضير والتعامل مع المذيبات، دون نسبتها إلى منشور علمي معيّن.",
    date:"16 July 2017 · 11:32 · Qatar University · photo-library display",
    dateAr:"١٦ يوليو ٢٠١٧ · ١١:٣٢ · جامعة قطر · حسب سجل مكتبة الصور"});
   const tags=mol.querySelector(".method-tags");
   if(tags)tags.insertAdjacentElement("afterend",photo);else mol.append(photo);
 }
};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run,{once:true});else run();
})();