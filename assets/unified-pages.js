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
    "research.html":["Research investigations","الأبحاث والدراسات"],
    "publications.html":["Publications & scholarly works","المنشورات والأعمال العلمية"],
    "writing.html":["Essays & writing","المقالات والكتابة"],
    "reading-map.html":["A reader’s map","خريطة القراءة"],
    "search.html":["Find the thread","البحث في الأرشيف"],
    "recommendations.html":["Recommendations","ترشيحات للقراءة والمشاهدة"],
    "recommended-books.html":["Recommended books","كتب مقترحة"],
    "recommended-essays.html":["Recommended essays","مقالات مقترحة"],
    "recommended-screen.html":["Film & television recommendations","ترشيحات السينما والتلفزيون"],
    "training.html":["Research training","التدريب والتطوير المهني"],
    "films.html":["Scientific films","الأفلام العلمية"],
    "film.html":["Research film","فيلم بحثي"],
    "publication-cinema.html":["Publication cinema","سينما المنشورات"],
    "molecular-therapeutics.html":["Molecular therapeutics","العلاجات الجزيئية"],
    "illness-and-evidence.html":["Illness & evidence","المرض والدليل"],
    "behind-the-record.html":["Behind the record","خلف السجل"],
    "major-revisions.html":["Major Revisions","المراجعات الكبرى"],
    "scientific-fieldnotes-2026.html":["Scientific fieldnotes","ملاحظات علمية"],
    "doctoral-concepts.html":["Doctoral research concepts","تصورات البحث للدكتوراه"],
    "evidence-viewer.html":["Research evidence viewer","عارض الأدلة البحثية"],
    "methods-evidence.html":["Methods & evidence","الطرق والأدلة"],
    "techniques.html":["Methods atlas","أطلس التقنيات"],
    "figures.html":["Figures & evidence","الأشكال والأدلة"],
    "computing.html":["AI & computing","الذكاء الاصطناعي والحوسبة"],
    "grants.html":["Research grants","المشروعات والمنح"],
    "archive.html":["Visual archive","الأرشيف المصور"],
    "moving-evidence.html":["Moving Evidence · Films","الأدلة المتحركة · أفلام"],
    "stories.html":["Stories","حكايات البحث والحياة"],
    "imaging.html":["Biomedical imaging","التصوير الحيوي"],
    "cv.html":["Academic CV","السيرة الأكاديمية"],
    "research-horizon.html":["Research horizon","آفاق البحث"],
    "chem-squad.html":["Chem Squad","فريق الكيمياء"],
    "leadership.html":["Leadership & management","القيادة والإدارة"],
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
    ["/archive.html","Archive","الأرشيف"],["/moving-evidence.html","Films","أفلام البحث"],["/stories.html","Stories","الحكايات"],["/chem-squad.html","Chem Squad","فريق الكيمياء"],
    ["/engagement.html","Science & society","العلم والمجتمع"],["/leadership.html","Leadership & management","القيادة والإدارة"],["/cv.html","Academic CV","السيرة الأكاديمية"],
    ["/full-record.html#history","History of pharmacy","تاريخ الصيدلة"],
    ["/full-record.html#writing","Writing","الكتابة"],
    ["/full-record.html#quality","Quality & process","الجودة والعمليات"],
    ["/full-record.html#give-eosinophilic","Patient advocacy","دعم المرضى"]
  ];
  const hubLinks=[
    ["/research.html","Research investigations","الأبحاث والدراسات"],
    ["/publications.html","Publications index","فهرس المنشورات"],
    ["/writing.html","Essays & writing","المقالات والكتابة"],
    ["/reading-map.html","Reader’s map","خريطة القراءة"],
    ["/recommendations.html","Reading & viewing","القراءة والمشاهدة"],
    ["/training.html","Research training","التدريب البحثي"],
    ["/full-record.html","Complete historical record","السجل التاريخي الكامل"]
  ];
  function h(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;")}
  const selected=u=>u.split("#")[0]===location.pathname;
  const locale=()=>document.documentElement.lang==="ar"?"ar":"en";
  const label=(en,ar)=>locale()==="ar"?ar:en;
  const link=([u,en,ar],extraClass="")=>'<a'+(extraClass?' class="'+h(extraClass)+'"':'')+' href="'+h(u)+'" data-en="'+h(en)+'" data-ar="'+h(ar)+'"'+(selected(u)?' aria-current="page"':'')+'>'+h(label(en,ar))+'</a>';
  const header=document.createElement("header");
  header.className="rx-universal";
  header.setAttribute("aria-label","Global website navigation");
  header.innerHTML='<a class="rx-skip" href="#rx-content">Skip to content</a><div class="rx-inner"><a class="rx-identity" href="/index.html" aria-label="Mahmoud Al-Ruweidi home"><img class="rx-mark" src="'+logo+'" alt="Approved Ruwaidix logo" width="48" height="48"><span class="rx-brand"><strong>Mahmoud Al-Ruweidi</strong><small>RESEARCH / DRUG DELIVERY / LIVING SYSTEMS</small></span></a><nav class="rx-primary" aria-label="Primary">'+items.slice(0,5).map(link).join("")+'<details class="rx-more"><summary data-en="Explore" data-ar="استكشف">'+h(label("Explore","استكشف"))+'</summary><div class="rx-menu-panel"><span class="rx-menu-label rx-mobile-route" data-en="START HERE" data-ar="ابدأ هنا">'+h(label("START HERE","ابدأ هنا"))+'</span>'+items.slice(0,5).map(entry=>link(entry,"rx-mobile-route")).join("")+'<span class="rx-menu-label" data-en="FEATURED DESTINATIONS" data-ar="الأقسام الرئيسية">'+h(label("FEATURED DESTINATIONS","الأقسام الرئيسية"))+'</span>'+hubLinks.map(entry=>link(entry)).join("")+'<span class="rx-menu-label" data-en="MORE FROM THE RECORD" data-ar="المزيد من السجل">'+h(label("MORE FROM THE RECORD","المزيد من السجل"))+'</span>'+items.slice(5).map(link).join("")+'<div class="rx-langs" role="group" aria-label="Language"><span data-en="Language" data-ar="اللغة">'+h(label("Language","اللغة"))+'</span><button type="button" data-language="en" aria-pressed="'+(locale()==="en")+'">EN</button><button type="button" data-language="ar" aria-pressed="'+(locale()==="ar")+'">العربية</button></div></div></details></nav></div>';
  const currentHeader=Array.from(document.body.children).find(el=>el.tagName==="HEADER"&&el.querySelector("nav")&&!el.classList.contains("heading"));
  if(currentHeader){currentHeader.classList.add("rx-legacy-header");currentHeader.setAttribute("aria-hidden","true");currentHeader.querySelectorAll("a,button,input,select").forEach(el=>el.setAttribute("tabindex","-1"))}
  const directNav=Array.from(document.body.children).find(el=>el.classList&&el.classList.contains("nav")&&el.tagName!=="HEADER"&&el.querySelectorAll("a").length>1);
  if(directNav){directNav.classList.add("rx-legacy-nav");directNav.setAttribute("aria-hidden","true");directNav.querySelectorAll("a,button").forEach(el=>el.setAttribute("tabindex","-1"))}
  const main=document.querySelector("main");
  if(main){
    if(!main.id)main.id="rx-content";
    header.querySelector(".rx-skip").setAttribute("href","#"+main.id);
    if(!main.hasAttribute("tabindex"))main.tabIndex=-1;
  } else if(!document.getElementById("rx-content")){
    const content=document.createElement("span");content.id="rx-content";content.tabIndex=-1;document.body.prepend(content);
  }
  document.body.prepend(header);
  const context=document.createElement("nav");context.className="rx-context";context.setAttribute("aria-label",label("Breadcrumb","مسار التصفح"));
  context.innerHTML='<div class="rx-context-inner"><a href="/index.html" data-en="Home" data-ar="الرئيسية">'+h(label("Home","الرئيسية"))+'</a><span class="rx-delimiter" aria-hidden="true">/</span><span aria-current="page" data-en="'+h(current[0])+'" data-ar="'+h(current[1])+'">'+h(label(current[0],current[1]))+'</span></div>';
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
    document.addEventListener("keydown",e=>{if(e.key==="Escape"&&details.open){details.open=false;summary.focus()}});
  }

  document.documentElement.classList.add("rx-site-theme");
  function refresh(){context.setAttribute("aria-label",label("Breadcrumb","مسار التصفح"));header.setAttribute("aria-label",label("Global website navigation","التنقل في الموقع"));header.querySelectorAll("[data-en][data-ar]").forEach(el=>{el.textContent=el.dataset[locale()]});header.querySelectorAll("button[data-language]").forEach(el=>el.setAttribute("aria-pressed",String(el.dataset.language===locale())));context.querySelectorAll("[data-en][data-ar]").forEach(el=>{el.textContent=el.dataset[locale()]})}
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
  css.href = "/assets/discovery-global.css?v=20261016-nav-craft";
  document.head.appendChild(css);
  const script = document.createElement("script");
  script.src = "/assets/discovery-global.js?v=20261016-nav-craft";
  script.defer = true;
  document.head.appendChild(script);
})();

/* Owner-archive 16 Oct 2026: add verified archival stills and film clips without replacing existing content. */
(() => {
  const page = document.documentElement.dataset.rxPage || (location.pathname.split('/').pop() || '').replace('.html','');
  if (!['archive','stories','chem-squad','techniques'].includes(page)) return;
  if (document.querySelector('script[data-rx-hours-2026]')) return;
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = '/assets/after-hours-archive-2026.css?v=20261016';
  document.head.appendChild(style);
  const script = document.createElement('script');
  script.src = '/assets/after-hours-archive-2026.js?v=20261016b';
  script.defer = true;
  script.dataset.rxHours2026 = '';
  document.head.appendChild(script);
})();
