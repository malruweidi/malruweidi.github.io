/* Ruwaidix / navigation on secondary pages. Original content, links and scripts preserved. */
(()=>{"use strict";
const ready=()=>{
  if(document.documentElement.dataset.rxPage==="editorial-home"||location.pathname==="/"||location.pathname==="/index.html")return;
  if(document.querySelector(".rx-universal"))return;
  const page=location.pathname.split("/").pop()||"index.html";
  const inGrants=location.pathname.includes("/grants/");
  const root="/";
  const logo="/assets/ruwaidix-approved.webp";
  const pages={
    "full-record.html":["Complete research record","السجل العلمي الكامل"],
    "techniques.html":["Methods atlas","أطلس التقنيات"],
    "figures.html":["Figures & evidence","الأشكال والأدلة"],
    "computing.html":["AI & computing","الذكاء الاصطناعي والحوسبة"],
    "grants.html":["Research grants","المشروعات والمنح"],
    "archive.html":["Visual archive","الأرشيف المصور"],
    "stories.html":["Stories","حكايات البحث والحياة"],
    "imaging.html":["Biomedical imaging","التصوير الحيوي"],
    "cv.html":["Academic CV","السيرة الأكاديمية"],
    "research-horizon.html":["Research horizon","آفاق البحث"],
    "chem-squad.html":["Chem Squad","فريق الكيمياء"],
    "engagement.html":["Science & society","العلم والمجتمع"],
    "urep19.html":["UREP 19 case study","دراسة منحة ١٩"],
    "urep21.html":["UREP 21 case study","دراسة منحة ٢١"],
    "urep22.html":["UREP 22 case study","دراسة منحة ٢٢"],
    "urep23.html":["UREP 23 case study","دراسة منحة ٢٣"]
  };
  const current=pages[page]||["Research page","صفحة بحثية"];
  const items=[
    ["/index.html","Home","الرئيسية"],["/full-record.html#research","Research","الأبحاث"],["/research-horizon.html","Research horizon","آفاق البحث"],
    ["/techniques.html","Methods","التقنيات"],["/full-record.html#publications","Publications","المنشورات"],
    ["/figures.html","Figures","الأشكال"],["/computing.html","Computing","الحوسبة"],
    ["/grants.html","Grants","المنح"],["/imaging.html","Imaging","التصوير"],
    ["/archive.html","Archive","الأرشيف"],["/stories.html","Stories","الحكايات"],["/chem-squad.html","Chem Squad","فريق الكيمياء"],
    ["/engagement.html","Science & society","العلم والمجتمع"],["/cv.html","Academic CV","السيرة الأكاديمية"],
    ["/full-record.html#history","History of pharmacy","تاريخ الصيدلة"],
    ["/full-record.html#writing","Writing","الكتابة"],
    ["/full-record.html#quality","Quality & process","الجودة والعمليات"],
    ["/full-record.html#give-eosinophilic","Patient advocacy","دعم المرضى"]
  ];
  function h(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;")}
  const selected=u=>u.split("#")[0]===location.pathname;
  const locale=()=>document.documentElement.lang==="ar"?"ar":"en";
  const label=(en,ar)=>locale()==="ar"?ar:en;
  const link=([u,en,ar])=>'<a href="'+h(u)+'" data-en="'+h(en)+'" data-ar="'+h(ar)+'"'+(selected(u)?' aria-current="page"':'')+'>'+h(label(en,ar))+'</a>';
  const header=document.createElement("header");
  header.className="rx-universal";
  header.setAttribute("aria-label","Global website navigation");
  header.innerHTML='<a class="rx-skip" href="#rx-content">Skip to content</a><div class="rx-inner"><a class="rx-identity" href="/index.html" aria-label="Mahmoud Al-Ruweidi home"><img class="rx-mark" src="'+logo+'" alt="Approved Ruwaidix logo" width="48" height="48"><span class="rx-brand"><strong>Mahmoud Al-Ruweidi</strong><small>RESEARCH / DRUG DELIVERY / LIVING SYSTEMS</small></span></a><nav class="rx-primary" aria-label="Primary">'+items.slice(0,5).map(link).join("")+'<details class="rx-more"><summary data-en="Explore" data-ar="استكشف">'+h(label("Explore","استكشف"))+'</summary><div class="rx-menu-panel"><span class="rx-menu-label">RESEARCH · SCHOLARSHIP · COMMUNITY</span>'+items.slice(5).map(link).join("")+'<div class="rx-langs" role="group" aria-label="Language"><span data-en="Language" data-ar="اللغة">'+h(label("Language","اللغة"))+'</span><button type="button" data-language="en" aria-pressed="'+(locale()==="en")+'">EN</button><button type="button" data-language="ar" aria-pressed="'+(locale()==="ar")+'">العربية</button></div></div></details></nav></div>';
  const currentHeader=Array.from(document.body.children).find(el=>el.tagName==="HEADER"&&el.querySelector("nav")&&!el.classList.contains("heading"));
  if(currentHeader){currentHeader.classList.add("rx-legacy-header");currentHeader.setAttribute("aria-hidden","true");currentHeader.querySelectorAll("a,button,input,select").forEach(el=>el.setAttribute("tabindex","-1"))}
  const directNav=Array.from(document.body.children).find(el=>el.classList&&el.classList.contains("nav")&&el.tagName!=="HEADER"&&el.querySelectorAll("a").length>1);
  if(directNav){directNav.classList.add("rx-legacy-nav");directNav.setAttribute("aria-hidden","true");directNav.querySelectorAll("a,button").forEach(el=>el.setAttribute("tabindex","-1"))}
  const main=document.querySelector("main");
  if(main&&!main.id)main.id="rx-content";
  else if(!document.getElementById("rx-content")){const content=document.createElement("span");content.id="rx-content";content.tabIndex=-1;if(main)main.before(content);else document.body.prepend(content)}
  document.body.prepend(header);
  const context=document.createElement("div");context.className="rx-context";
  context.innerHTML='<div class="rx-context-inner"><a href="/index.html" data-en="Home" data-ar="الرئيسية">'+h(label("Home","الرئيسية"))+'</a><span class="rx-delimiter">/</span><span data-en="'+h(current[0])+'" data-ar="'+h(current[1])+'">'+h(label(current[0],current[1]))+'</span></div>';
  header.insertAdjacentElement("afterend",context);
  /* Retain the original page's in-page navigation without duplicating the old masthead. */
  const originalJumps=currentHeader?Array.from(currentHeader.querySelectorAll('a[href^="#"]')):[];
  const uniqueJumps=new Set();
  const jumpLinks=originalJumps.filter(a=>{
    const target=a.getAttribute("href").slice(1);
    if(!target||!document.getElementById(target)||uniqueJumps.has(target))return false;
    uniqueJumps.add(target);return true;
  }).slice(0,25);
  if(jumpLinks.length>1){
    const details=document.createElement("details");
    details.className="rx-local-jumps";
    const summary=document.createElement("summary");
    summary.dataset.en="On this page";summary.dataset.ar="في هذه الصفحة";
    summary.textContent=label("On this page","في هذه الصفحة");
    details.appendChild(summary);
    const links=document.createElement("div");links.className="rx-jump-panel";
    jumpLinks.forEach(a=>{const link=document.createElement("a");link.href=a.getAttribute("href");link.textContent=a.textContent.trim().replace(/\s+/g," ").slice(0,80);links.appendChild(link)});
    details.appendChild(links);context.querySelector(".rx-context-inner").appendChild(details);
    links.addEventListener("click",()=>{details.open=false});
    document.addEventListener("click",e=>{if(!details.contains(e.target))details.open=false});
  }

  document.documentElement.classList.add("rx-site-theme");
  function refresh(){header.querySelectorAll("[data-en][data-ar]").forEach(el=>{el.textContent=el.dataset[locale()]});header.querySelectorAll("button[data-language]").forEach(el=>el.setAttribute("aria-pressed",String(el.dataset.language===locale())));context.querySelectorAll("[data-en][data-ar]").forEach(el=>{el.textContent=el.dataset[locale()]})}
  header.querySelectorAll("button[data-language]").forEach(button=>button.addEventListener("click",()=>{const l=button.dataset.language;try{localStorage.setItem("ruwaidix-language",l)}catch(e){}const u=new URL(location.href);u.searchParams.set("lang",l);location.assign(u.toString())}));
  document.addEventListener("click",e=>{const d=header.querySelector("details.rx-more");if(d&&!d.contains(e.target))d.open=false});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){const d=header.querySelector("details.rx-more");if(d?.open){d.open=false;d.querySelector("summary").focus()}}});
  new MutationObserver(()=>refresh()).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
  refresh();
};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",ready);else ready();
})();

/* Optional owner-identified photographic archive: only loads on relevant pages. */
(()=>{const rx=document.documentElement.dataset.rxPage;if(rx==='archive'||rx==='engagement'){const s=document.createElement('script');s.src='/assets/archival-photos-oct-2026.js?v=20261012';s.defer=true;document.head.append(s)}})();


/* Additive cross-site discovery; existing navigation and editorial pages remain unchanged. */
(() => {
  if (document.querySelector('script[src*="/assets/discovery-global.js"]')) return;
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = "/assets/discovery-global.css?v=20261014";
  document.head.appendChild(css);
  const script = document.createElement("script");
  script.src = "/assets/discovery-global.js?v=20261014";
  script.defer = true;
  document.head.appendChild(script);
})();
