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

 // The operator identified this exact device photograph as the pump used for shear-stress experiments.
 // Flow in mL/min is not, by itself, a wall-shear-stress measurement.
 if(!document.getElementById("rxShearPumpPhoto")){
   const targetHeading=Array.from(document.querySelectorAll("h2,h3,h4")).find(h=>/shear stress|fluid mechanics|hemodynamic|mechanobiolog|airway reopening|biophysical flow|parallel.plate/i.test(h.textContent));
   const targetSection=targetHeading&&targetHeading.closest("section");
   const bio=document.querySelector("#biological .wrap.cols > div:first-child");
   const dest=(targetSection&&targetSection.querySelector(".wrap.cols > div:first-child, .wrap.columns > div:first-child"))||bio;
   const pump=make({id:"rxShearPumpPhoto",src:"/archive/archive-7873.jpg",
     alt:"Syringe pump multi-step mode showing a 0.1 millilitre volume and two programmed flow rates",
     title:"Controlling flow during shear-stress experiments",titleAr:"التحكم بالتدفق في تجارب إجهاد القص",
     text:"A syringe pump used in a shear-stress experiment. The archived screen shows a 0.1 mL volume and programmed rates of 4 and 9 mL/min. These are flow settings; wall shear stress must be calculated from channel geometry, medium rheology and flow conditions rather than read directly from the pump.",
     textAr:"مضخة محقنة استُخدمت في تجربة لإجهاد القص. تُظهر شاشة الجهاز حجماً مقداره ٠٫١ مل ومعدلي تدفق ٤ و٩ مل/دقيقة. هذه إعدادات للتدفق وليست قياساً مباشراً لإجهاد القص على الجدار، الذي يتطلب معرفة هندسة القناة وخواص السائل وظروف الجريان.",
     date:"Original laboratory photograph · experimental date not verified",
     dateAr:"صورة مختبرية أصلية · تاريخ التجربة غير موثق"});
   if(dest)dest.append(pump);
   else if(targetSection)targetSection.append(pump);
 }


 // Two owner-identified photographs from 2017, presented as personal records
 // rather than analytical evidence or microscopy results.
 if(biological && !document.getElementById("rxOct12MicroscopyMorning")){
   const morning=make({
     id:"rxOct12MicroscopyMorning",
     src:"/assets/oct12-owner-photos/microscopy-vacation-morning-2017.webp",
     alt:"Microscope, books, ACS mug and writing materials on Mahmoud's desk",
     title:"A vacation morning with a microscope",
     titleAr:"صباح عطلة مع المجهر",
     text:"I bought this microscope in the Qasr El Einy area of Cairo and brought it to Qatar. It became part of how I pursued my own questions beyond scheduled university laboratory work. The full account now belongs in Stories; the photograph is not a microscopy result.",
     textAr:"اشتريت هذا المجهر من منطقة القصر العيني في القاهرة وجئت به إلى قطر. صار وسيلتي إلى متابعة الأسئلة التي تثير فضولي خارج مواعيد مختبر الجامعة. أما الحكاية كاملة فمكانها الآن في قسم الحكايات؛ وهذه صورة للمجهر، لا نتيجة تصوير مجهري.",
     date:"Original Instagram post · 1 July 2017; camera date unverified",
     dateAr:"منشور إنستغرام · ١ يوليو ٢٠١٧؛ تاريخ التصوير غير موثق"
   });
   const storyLink=document.createElement("a");storyLink.href="/stories.html#personal-microscope";storyLink.className="rx-provenance-link";storyLink.textContent=ar?"اقرأ حكاية المجهر: من القاهرة إلى قطر ↗":"Read the microscope's journey from Cairo to Qatar ↗";
   morning.querySelector("figcaption").append(storyLink);
   biological.append(morning);
 }

};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run,{once:true});else run();
})();