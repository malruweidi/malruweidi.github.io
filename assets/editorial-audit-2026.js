/* Ruwaidix editorial audit 2026
 * Progressive enhancement. Move existing DOM nodes only; do not delete research,
 * publications, essays, photos, authentic video, or patient resources.
 */
(function () {
 "use strict";
 function onReady() {
  if (document.documentElement.dataset.rxPage !== "home") return;
  if (document.documentElement.classList.contains("rx-editorial-audited")) return;
  document.documentElement.classList.add("rx-editorial-audited");
  var $ = function (selector) {return document.querySelector(selector);};
  var videoSection = $(".technique-footage-preview");
  var framework = $(".research-identity");
  var quality = $(".quality-section");
  var methodsShowcase = $(".method-showcase");
  var patientSection = $(".patient-perspective");
  var bibliography = $("#publications");
  var publicationSection = bibliography && (bibliography.closest("section") || bibliography);
  /* Move rather than duplicate the real footage. Keep stable source links and captions. */
  if(framework && videoSection && framework.parentElement===videoSection.parentElement) {
   framework.insertAdjacentElement("afterend",videoSection);
  }
  if(methodsShowcase && quality && methodsShowcase.parentElement===quality.parentElement) {
   methodsShowcase.insertAdjacentElement("afterend",quality);
  }
  if(publicationSection && patientSection && publicationSection.parentElement===patientSection.parentElement) {
   publicationSection.insertAdjacentElement("afterend",patientSection);
  }
  /* If moved elements were already deep linked, preserve the original target. */
  var nav = $("#navlinks");
  if(nav){
   var filmLink = document.createElement("a");
   filmLink.href="#technique-footage-title";
   filmLink.textContent="Original footage";
   filmLink.dataset.i18nIgnore="";
   filmLink.className="rx-audit-film-link";
   var panel = nav.querySelector(".rx-more-panel .rx-more-group");
   if(panel && !panel.querySelector(".rx-audit-film-link")){
    panel.appendChild(filmLink);
    var localizeFilmLink=function(){filmLink.textContent=document.documentElement.lang==="ar"?"تسجيلات المختبر الأصلية":"Original footage";};
    localizeFilmLink();
    new MutationObserver(localizeFilmLink).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
   }
  }
  /* Keep hero links fully accessible without seven equally weighted competing calls to action. */
  var row=$(".hero-copy .buttonrow");
  if(row && !row.querySelector(".rx-audit-more-links")) {
   var links=Array.from(row.querySelectorAll(":scope > a"));
   if(links.length>4) {
    var details=document.createElement("details");details.className="rx-audit-more-links";
    var summary=document.createElement("summary");
    summary.dataset.i18nIgnore="";
    var more=document.createElement("div");more.className="rx-audit-more-panel";
    links.slice(3).forEach(function(link){more.appendChild(link);});
    details.append(summary,more);row.appendChild(details);
    var updateSummary=function(){summary.textContent=document.documentElement.lang==="ar"?"مسارات أخرى +":"More paths +";};
    updateSummary();
    new MutationObserver(updateSummary).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
   }
  }
  /* On the long-form medical section, readers should be able to reach the full personal account.
     Do not replace the existing published chapters or official patient-organization links. */
  var personal=$(".patient-perspective .patient-main");
  if(personal && !personal.querySelector(".rx-audit-full-account")) {
    var a=document.createElement("a");a.href="illness-and-evidence.html";a.className="rx-audit-full-account";
    a.dataset.i18nIgnore="";
    var localizeAccount=function(){a.textContent=document.documentElement.lang==="ar"?"قراءة الحكاية الشخصية الكاملة ↗":"Read the full personal account ↗";};
    localizeAccount();
    new MutationObserver(localizeAccount).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
    var opening=personal.querySelector(".patient-opening");
    if(opening)opening.insertAdjacentElement("afterend",a);else personal.prepend(a);
  }
  /* Correct one misleading compressed chronology label without inventing dates.
     The longer timeline and research archive retain their original records. */
  var facts=$(".numbers");
  if(facts){
    Array.from(facts.children).forEach(function(item){
      var label=item.querySelector("b,strong");
      var desc=item.querySelector("p");
      if(label && label.textContent.trim()==="2015" && desc && /beginning of university research and the ACS student chapter/i.test(desc.textContent)) {
       desc.textContent="Undergraduate chemistry research and early scientific community work at Qatar University.";
      }
    });
  }
  /* Respect browser focus and reduced-motion preferences, with a visible anchor index. */
  var hero=$(".hero");
  if(hero && !$("#rx-reading-guide")) {
   var guide=document.createElement("nav");guide.id="rx-reading-guide";guide.setAttribute("aria-label","Quick reading routes");
   var routes=[["#framework","Approach","الفكرة"],["#technique-footage-title","Original footage","التسجيلات"],["#story","The story","المسيرة"],["#research","Research","الأبحاث"],["#publications","Papers","المنشورات"],["#writing","Writing","الكتابة"],["#patient-perspective","Patient perspective","تجربة المريض"]];
   var entries=routes.filter(function(v){return document.getElementById(v[0].slice(1));}).map(function(v){
      var a=document.createElement("a");a.href=v[0];a.dataset.i18nIgnore="";
      a.dataset.en=v[1];a.dataset.ar=v[2];return a;
   });
   var label=document.createElement("span");label.className="rx-reading-guide-label";label.dataset.i18nIgnore="";
   guide.appendChild(label);entries.forEach(function(a){guide.appendChild(a);});
   var localizeGuide=function(){
     var isAr=document.documentElement.lang==="ar";
     label.textContent=isAr?"اختر مسارك":"EXPLORE BY INTEREST";
     entries.forEach(function(a){a.textContent=isAr?a.dataset.ar:a.dataset.en;});
   };
   localizeGuide();new MutationObserver(localizeGuide).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
   var heroParent=hero.parentElement;
   if(heroParent){var anchor=heroParent.classList.contains("wrap")?heroParent:hero;anchor.insertAdjacentElement("afterend",guide);}
  }

  /* A small, sourced record of the first at-home chemistry experiments.
     Keep it inside the existing personal story, not as a promotional hero. */
  var story=$("#story");
  if(story && !document.getElementById("rx-home-elephant-toothpaste")){
    var place=story.querySelector(":scope > .wrap")||story.querySelector(".wrap")||story;
    var scene=document.createElement("figure");
    scene.id="rx-home-elephant-toothpaste";
    scene.className="rx-at-home-science";
    scene.dataset.i18nIgnore="";
    var imageLink=document.createElement("a");
    imageLink.href="/archive/archive-7868.jpg";
    imageLink.setAttribute("aria-label","View the original elephant-toothpaste photograph");
    var photo=document.createElement("img");
    photo.src="/archive/archive-7868.jpg";
    photo.alt="Household table with chemistry glassware and the green foam mixture from an elephant-toothpaste experiment";
    photo.loading="lazy";
    photo.decoding="async";
    imageLink.appendChild(photo);
    var cap=document.createElement("figcaption");
    var label=document.createElement("small");
    var heading=document.createElement("strong");
    var paragraph=document.createElement("p");
    var date=document.createElement("span");
    var archive=document.createElement("a");archive.href="/archive.html#rxRecoveredGallery";
    cap.append(label,heading,paragraph,date,archive);
    scene.append(imageLink,cap);
    place.appendChild(scene);
    var translateExperiment=function(){
      var ar=document.documentElement.lang==="ar";
      label.textContent=ar?"تجربة في المنزل / من السنوات الجامعية الأولى":"AT HOME / EARLY UNIVERSITY YEARS";
      heading.textContent=ar?"الكيمياء لم تكن محصورة في المختبر.":"Chemistry was not confined to the laboratory.";
      paragraph.textContent=ar?
        "في سنتي الجامعية الأولى جرّبت في المنزل عرض «معجون أسنان الفيل». كان المكان طاولة منزلية لا مختبراً، والتجربة عرضاً كيميائياً بسيطاً لا مشروعاً بحثياً. أحتفظ بهذه الصورة لأن الفضول لم يكن شيئاً أمارسه عند وجود تكليف أكاديمي فحسب.":
        "In my freshman year, I tried the elephant-toothpaste demonstration at home. The setting was an ordinary table, not a laboratory, and the experiment was a chemistry demonstration rather than a research result. I keep the photograph because curiosity was never confined to assigned coursework.";
      date.textContent=ar?"تعريف التجربة من صاحب الصورة؛ يعرض سجل الصور تاريخ ٢٢ يونيو ٢٠١٩.":"Identified by the author; photo-library display date: 22 June 2019.";
      archive.textContent=ar?"الصورة ضمن الأرشيف ←":"See the archival record ↗";
    };
    translateExperiment();
    new MutationObserver(translateExperiment).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
  }

 }
 if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",function(){requestAnimationFrame(onReady);});
 else requestAnimationFrame(onReady);
})();