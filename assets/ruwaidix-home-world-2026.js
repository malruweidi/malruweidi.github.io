/* Ruwaidix Living Homepage — 21 November 2026.
   A small set of distinct, archival, interactive experiences, not widget tiles.
   Source figures remain unaltered; all motion is decorative or illustrative. */
(() => {
  "use strict";
  if (document.documentElement.dataset.rxPage !== "home") return;
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const isArabic = () => root.lang === "ar";
  const both = (en,ar) => '<span data-rxw-en lang="en">'+en+'</span><span data-rxw-ar lang="ar" dir="rtl">'+ar+'</span>';
  const label = (en,ar) => isArabic() ? ar : en;
  const $ = (query,scope=document) => scope.querySelector(query);
  const make = (name,cls) => {const el=document.createElement(name);el.className=cls;return el;};
  const places = [];
  const observe = node=>{if(node)places.push(node);};

  // An optical research orbit lives alongside the original portrait, not below the introduction.
  const portrait = $(".rx-hero-portrait");
  if (portrait && !$("#rx-world-orbit")) {
    const orbit = make("div","rx-world-orbit");
    orbit.id="rx-world-orbit";
    orbit.innerHTML =
      '<span class="rx-world-orbit-rings" aria-hidden="true"><i></i><i></i><i></i></span>'+
      '<a class="rx-world-orbit-specimen" href="/grants/urep23.html">'+
        '<img src="/assets/2026-10-15-lab-photos/pyridine-4-carboxaldehyde-reagent-front-2018.webp" width="180" height="65" alt="2018 archival chemistry reagent photograph" loading="lazy"/>'+
        '<span>'+both("CHEMISTRY / 2018","الكيمياء / ٢٠١٨")+'</span></a>'+
      '<button type="button" class="rx-world-orbit-lens" aria-pressed="false" aria-controls="rx-world-hero-sample">'+
         '<span class="rx-world-orbit-glass" aria-hidden="true">⌕</span>'+both("VIEW A SPECIMEN","انظر إلى العينة")+'</button>'+
      '<div class="rx-world-hero-sample" id="rx-world-hero-sample" hidden>'+
         '<button class="rx-world-sample-close" type="button" aria-label="Close specimen">×</button>'+
         '<img src="/assets/home-archive/figure-zebrafish-microscopy.jpg" width="360" height="260" loading="lazy" alt="Archived scientific image associated with zebrafish microscopy; original source is linked"/>'+
         '<span>'+both("Archived research image · not a live microscope","صورة بحثية مؤرشفة · ليست مجهرًا مباشرًا")+'</span>'+
         '<a href="/figures.html#zebrafish">'+both("Source & methods","المصدر والمنهجية")+' ↗</a>'+
      '</div>';
    portrait.appendChild(orbit);
    const toggle=$(".rx-world-orbit-lens",orbit),sample=$(".rx-world-hero-sample",orbit),close=$(".rx-world-sample-close",orbit);
    const show=v=>{sample.hidden=!v;toggle.setAttribute("aria-pressed",String(v));if(v)close.focus();else toggle.focus();};
    toggle.addEventListener("click",()=>show(sample.hidden));
    close.addEventListener("click",()=>show(false));
    orbit.addEventListener("keydown",e=>{if(e.key==="Escape"&&!sample.hidden){show(false);e.preventDefault();}});
    let requested=0;
    portrait.addEventListener("pointermove",e=>{
      if(reduce.matches||e.pointerType==="touch")return;
      const r=portrait.getBoundingClientRect();if(!r.width||!r.height)return;
      const x=((e.clientX-r.left)/r.width-.5)*20,y=((e.clientY-r.top)/r.height-.5)*16;
      if(requested)cancelAnimationFrame(requested);
      requested=requestAnimationFrame(()=>{portrait.style.setProperty("--rx-world-x",Math.max(-10,Math.min(10,x))+"px");portrait.style.setProperty("--rx-world-y",Math.max(-8,Math.min(8,y))+"px");});
    },{passive:true});
    portrait.addEventListener("pointerleave",()=>{
      portrait.style.removeProperty("--rx-world-x");portrait.style.removeProperty("--rx-world-y");
    });
    observe(orbit);
  }

  // A documentary journey through four actual research subject areas.
  const journeys=[
    {
      year:"2015 / 2019",kicker:["Molecular sensing","الاستشعار الجزيئي"],
      title:["A colour change is a beginning.","تغيّر اللون ليس إلا بداية."],
      copy:["The curcumin–cyanide investigation led from an observable response to questions of selectivity and analytical interpretation.","قاد البحث في استجابة الكركمين للسيانيد من ظاهرة مرئية إلى أسئلة الانتقائية والتفسير التحليلي."],
      picture:"/assets/home-archive/figure-cyanide-sensor.jpg",alt:"Archived curcumin cyanide sensing figure from the research record",
      link:"https://doi.org/10.1039/C9AY01557D",linkLabel:["Read the published paper","اقرأ البحث المنشور"],
      provenance:["Original research figure · the displayed image is not altered","شكل من البحث الأصلي · تُعرض الصورة دون تعديل"],isConcept:false
    },
    {
      year:"2018",kicker:["Zebrafish vascular imaging","تصوير الأوعية الدموية لسمك الزرد"],
      title:["Make movement measurable.","اجعل الحركة قابلة للقياس."],
      copy:["Developing zebrafish vessels required imaging methods, regions of interest, and careful interpretation of observed movement.","تطلّبت دراسة أوعية سمك الزرد النامية طرائق تصوير ومناطق اهتمام وتفسيرًا دقيقًا للحركة المرصودة."],
      picture:"/assets/home-archive/figure-zebrafish-microscopy.jpg",alt:"Archived zebrafish microscopy figure from the research record",
      link:"/research/high-speed-zebrafish-imaging.html",linkLabel:["Explore the imaging method","استكشف طريقة التصوير"],
      provenance:["Original research figure · scientific measurements belong to the source","شكل بحثي أصلي · القياسات العلمية في المصدر"],isConcept:false
    },
    {
      year:"2021",kicker:["Pulmonary cell injury","إصابة خلايا الرئة"],
      title:["The force changes the cells.","القوة الميكانيكية تغيّر الخلايا."],
      copy:["Injury from an advancing air–liquid interface was investigated experimentally, including cellular outcomes and the effects of pharmacological interventions.","دُرست تجريبيًا إصابة الخلايا الناتجة عن حركة سطح تماس الهواء والسائل، إلى جانب الاستجابات الخلوية وتأثير التدخلات الدوائية."],
      picture:"/assets/home-archive/figure-pulmonary-flow-chamber.jpg",alt:"Archived pulmonary flow-chamber figure from the research record",
      link:"/research/pulmonary-epithelial-injury.html",linkLabel:["Read the pulmonary study","اقرأ دراسة الرئة"],
      provenance:["Original experiment-related figure · refer to the source for the method","شكل مرتبط بالتجربة الأصلية · راجع المصدر للمنهجية"],isConcept:false
    },
    {
      year:"ONGOING",kicker:["Inhalable drug carriers","نواقل الأدوية المستنشقة"],
      title:["A formulation must survive delivery.","يجب أن يتحمّل المستحضر عملية الإيصال."],
      copy:["Current work examines dexamethasone-loaded vesicular carriers, physicochemical characterization, nebulization, and aerosol performance.","يدرس العمل الحالي نواقل حويصلية محمّلة بالديكساميثازون، وخصائصها الفيزيائية الكيميائية، والرذاذ والتوصيل الهوائي."],
      picture:"/assets/niosomes-concept.svg",alt:"Concept illustration of a vesicular drug carrier; not an experimental particle image",
      link:"/research/inhalable-vesicles.html",linkLabel:["Inspect the ongoing investigation","اطّلع على البحث الجاري"],
      provenance:["Concept illustration · not particle microscopy or measured performance","رسم توضيحي · ليس صورة جسيمات أو أداءً مقاسًا"],isConcept:true
    }
  ];
  const research = $("#research");
  if (research&&!$("#rx-world-crossing")) {
    const section=make("section","rx-world-crossing");
    section.id="rx-world-crossing";
    section.setAttribute("aria-labelledby","rx-world-crossing-title");
    section.innerHTML=
      '<div class="rx-world-crossing-frame">'+
       '<div class="rx-world-crossing-head"><p>'+both("FOUR INVESTIGATIONS · ONE EXPERIMENTAL LIFE","أربعة تحقيقات علمية · مسيرة بحثية واحدة")+'</p>'+
        '<span aria-hidden="true">01 — 04</span></div>'+
       '<div class="rx-world-crossing-grid">'+
        '<div class="rx-world-crossing-visual"><span class="rx-world-crossing-orbit" aria-hidden="true"></span>'+
         '<figure class="rx-world-crossing-print"><img src="'+journeys[0].picture+'" alt="'+journeys[0].alt+'" width="680" height="480" loading="lazy"/>'+
           '<figcaption>'+both(...journeys[0].provenance)+'</figcaption></figure>'+
         '<div class="rx-world-crossing-index" aria-hidden="true">01<span> / 04</span></div></div>'+
        '<div class="rx-world-crossing-story"><div class="rx-world-crossing-kicker">'+both(...journeys[0].kicker)+'</div>'+
         '<h2 id="rx-world-crossing-title">'+both(...journeys[0].title)+'</h2>'+
         '<p class="rx-world-crossing-deck" aria-live="polite">'+both(...journeys[0].copy)+'</p>'+
         '<a class="rx-world-crossing-link" href="'+journeys[0].link+'">'+both(...journeys[0].linkLabel)+' ↗</a>'+
         '<div class="rx-world-crossing-steps" role="group" aria-label="Choose an investigation">'+
          journeys.map((j,i)=>'<button type="button" data-world-step="'+i+'" aria-pressed="'+(i===0)+'"><span class="rx-world-step-no">'+String(i+1).padStart(2,"0")+'</span><span>'+both(...j.kicker)+'</span><small>'+j.year+'</small></button>').join("")+
         '</div></div></div>'+
       '<p class="rx-world-crossing-end">'+both("Move between subjects. The evidence is always in the original sources.","انتقل بين الموضوعات؛ والأدلة تبقى في مصادرها الأصلية.")+'</p>'+
      '</div>';
    // The detailed research section lives inside a collapsed archival <details>.
    // Insert the panorama before the VISIBLE chapter directory instead.
    const directory=$("#rx26-portal");
    (directory||research.closest("details")||research).insertAdjacentElement("beforebegin",section);
    const print=$(".rx-world-crossing-print",section),img=$("img",print),caption=$("figcaption",print),
      heading=$("h2",section),kicker=$(".rx-world-crossing-kicker",section),deck=$(".rx-world-crossing-deck",section),
      link=$(".rx-world-crossing-link",section),index=$(".rx-world-crossing-index",section);
    const buttons=[...section.querySelectorAll("[data-world-step]")];
    function activate(i){
      const j=journeys[i];if(!j)return;
      img.src=j.picture;img.alt=j.alt;
      print.dataset.concept=j.isConcept?"true":"false";
      caption.innerHTML=both(...j.provenance);
      heading.innerHTML=both(...j.title);
      kicker.innerHTML=both(...j.kicker);
      deck.innerHTML=both(...j.copy);
      link.innerHTML=both(...j.linkLabel)+' ↗';link.href=j.link;
      index.innerHTML=String(i+1).padStart(2,"0")+'<span> / 04</span>';
      buttons.forEach((b,k)=>b.setAttribute("aria-pressed",String(k===i)));
      section.style.setProperty("--rx-world-step-progress",(i*33.3333)+"%");
    }
    buttons.forEach((b,i)=>b.addEventListener("click",()=>activate(i)));
    section.addEventListener("keydown",e=>{
      const active=buttons.findIndex(b=>b.getAttribute("aria-pressed")==="true");
      if(e.key==="ArrowRight"||e.key==="ArrowLeft"){
        if(!buttons.includes(document.activeElement))return;
        e.preventDefault();
        const dir=(e.key==="ArrowRight"?1:-1)*(root.dir==="rtl"?-1:1);
        const next=(active+dir+buttons.length)%buttons.length;
        activate(next);buttons[next].focus();
      }
    });
    observe(section);
  }

  // A tactile, genuinely draggable photo desk rather than another static grid of memories.
  const story = $("#story .story-prologue");
  if(story&&!$("#rx-world-desk")){
    const archive=[
      {src:"/assets/personal-archive/toy.webp",alt:"Childhood photograph with the yellow jacket and toy",en:"The yellow jacket",ar:"السترة الصفراء",url:"/stories.html"},
      {src:"/assets/owner-archive-2026-10-17/grade10-chemistry-festival-aref-elahmad.webp",alt:"Grade 10 chemistry-festival photograph with chemistry teacher",en:"The chemistry festival",ar:"مهرجان الكيمياء",url:"/stories.html#school-chemistry-and-graduation"},
      {src:"/assets/oct12-owner-photos/microscopy-vacation-morning-2017.webp",alt:"Microscope from Cairo photographed in the personal archive",en:"An instrument at home",ar:"مجهر في المنزل",url:"/stories/cairo-microscope.html"}
    ];
    const desk=make("section","rx-world-desk");desk.id="rx-world-desk";
    desk.setAttribute("aria-labelledby","rx-world-desk-title");
    desk.innerHTML='<div class="rx-world-desk-copy"><p>'+both("PERSONAL ARCHIVE / HANDLE WITH CURIOSITY","الأرشيف الشخصي / تصفّح بفضول")+'</p>'+
      '<h3 id="rx-world-desk-title">'+both("Three things I kept.","ثلاثة أشياء احتفظت بها.")+'</h3>'+
      '<p>'+both("A playful childhood picture, a chemistry festival, and a microscope from Cairo. Move the photographs to bring a different moment forward.","صورة من الطفولة، ومهرجان للكيمياء، ومجهر من القاهرة. حرّك الصور لتقديم ذكرى مختلفة.")+'</p>'+
      '<div class="rx-world-desk-controls"><button type="button" data-desk-prev aria-label="Previous photograph">←</button><span class="rx-world-desk-count" aria-live="polite">01 / 03</span><button type="button" data-desk-next aria-label="Next photograph">→</button></div>'+
      '<a class="rx-world-desk-route" href="/stories.html">'+both("Read the stories behind these objects","اقرأ الحكايات وراء هذه المقتنيات")+' ↗</a></div>'+
      '<div class="rx-world-desk-stack" role="group" aria-label="Interactive archival photograph stack">'+
        archive.map((p,i)=>'<div class="rx-world-desk-print" data-desk-print="'+i+'" data-front="'+(i===0)+'" style="--desk-order:'+i+'">'+
        '<img src="'+p.src+'" alt="'+p.alt+'" width="420" height="500" loading="lazy"/>'+
        '<span class="rx-world-desk-print-caption">'+both(p.en,p.ar)+'</span>'+
        '<a href="'+p.url+'" tabindex="'+(i===0?'0':'-1')+'">'+both("Read the story","اقرأ الحكاية")+' ↗</a></div>').join("")+
      '</div>';
    // Story content is intentionally folded away in the complete record.
    // The photographic desk belongs in the visible narrative after Moving Moments.
    const moments=$("#rx-moving-moments");
    (moments||story.closest("details")||story).insertAdjacentElement("afterend",desk);
    const cards=[...desk.querySelectorAll(".rx-world-desk-print")];
    const count=$(".rx-world-desk-count",desk);
    let active=0;
    function front(index){
      active=(index+cards.length)%cards.length;
      cards.forEach((c,i)=>{
        const order=(i-active+cards.length)%cards.length;
        c.style.setProperty("--desk-order",String(order));
        const spacing=window.innerWidth<=900?18:33;
        c.style.setProperty("--desk-offset",(order*spacing)+"px");
        c.style.setProperty("--desk-drop",(order*16)+"px");
        c.style.setProperty("--desk-tilt",((order-1)*6)+"deg");
        c.dataset.front=String(i===active);
        c.querySelector("a").tabIndex=i===active?0:-1;
        c.setAttribute("aria-hidden",String(i!==active));
      });
      count.textContent=String(active+1).padStart(2,"0")+" / 03";
    }
    desk.querySelector("[data-desk-prev]").addEventListener("click",()=>front(active-1));
    desk.querySelector("[data-desk-next]").addEventListener("click",()=>front(active+1));
    const stack=$(".rx-world-desk-stack",desk);
    let startX=null;
    stack.addEventListener("pointerdown",e=>{
      if(e.target.closest("a"))return;
      startX=e.clientX;
    });
    stack.addEventListener("pointerup",e=>{
      if(startX===null)return;
      const delta=e.clientX-startX;startX=null;
      if(Math.abs(delta)>36)front(active+(delta<0?1:-1));
      else if(!e.target.closest("a"))front(active+1);
    });
    stack.addEventListener("pointercancel",()=>{startX=null;});
    front(0);
    window.addEventListener("resize",()=>front(active),{passive:true});
    observe(desk);
  }

  // A visible historical afterword. The older long-form chapters remain
  // safely folded inside the complete record; the interactive objects do not.
  const complete=$("#rx-home-complete-record");
  let bridge=null;
  if(complete && !$("#rx-world-archive-bridge")){
    bridge=make("section","rx-world-archive-bridge");
    bridge.id="rx-world-archive-bridge";
    bridge.setAttribute("aria-labelledby","rx-world-archive-bridge-title");
    bridge.innerHTML='<div class="rx-world-archive-bridge-inner">'+
      '<div class="rx-world-archive-bridge-heading"><span>'+
        both("FROM THE MANUSCRIPT TO THE COMMUNITY","من المخطوط إلى المجتمع")+
      '</span><h2 id="rx-world-archive-bridge-title">'+
        both("Science has a life beyond the experiment.","للعلم حياة تتجاوز التجربة.")+
      '</h2><p>'+both("Two objects from different parts of the record. Open each to follow its history.","مقتنيان من جانبين مختلفين من السجل؛ افتحهما لتتبع قصتيهما.")+
      '</p></div><div class="rx-world-archive-bridge-cards"></div></div>';
    complete.insertAdjacentElement("beforebegin",bridge);
    observe(bridge);
  }

  // A small, typographic manuscript leaf accompanies historical scholarship without
  // pretending to be an original Mamluk source or an archival reproduction.
  const history=$("#history .history-grid > div:first-child");
  if(history&&bridge&&!$("#rx-world-manuscript")){
    const paper=make("aside","rx-world-manuscript");paper.id="rx-world-manuscript";
    paper.innerHTML='<div class="rx-world-manuscript-inner">'+
      '<span class="rx-world-manuscript-brow">'+both("HISTORY OF PHARMACY / A WRITER’S NOTE","تاريخ الصيدلة / ملاحظة كاتب")+'</span>'+
      '<button class="rx-world-manuscript-turn" type="button" aria-pressed="false">'+
       '<span class="rx-world-manuscript-word" aria-hidden="true">دواء</span>'+
       '<span class="rx-world-manuscript-title">'+both("Making medicines keep","كيف تُحفظ الأدوية")+'</span>'+
       '<span class="rx-world-manuscript-turn-label">'+both("Turn the page ↻","اقلب الصفحة ↻")+'</span></button>'+
      '<p class="rx-world-manuscript-note">'+both("A typographic illustration, not a historical manuscript.","تصميم خطّي توضيحي، وليس مخطوطة تاريخية.")+'</p>'+
      '<div class="rx-world-manuscript-reverse" hidden><p>'+both("The history of pharmacy depends on recipes, substitutions, preservation practices, and the conditions in which medicines were prepared.","يتطلّب تاريخ الصيدلة دراسة الوصفات والبدائل وطرائق الحفظ والظروف التي كانت تُحضَّر فيها الأدوية.")+'</p>'+
       '<a href="/writing.html">'+both("Explore the writing","استكشف الكتابات")+' ↗</a></div>'+
      '</div>';
    $(".rx-world-archive-bridge-cards",bridge).appendChild(paper);
    const btn=$(".rx-world-manuscript-turn",paper),reverse=$(".rx-world-manuscript-reverse",paper);
    btn.addEventListener("click",()=>{const on=btn.getAttribute("aria-pressed")!=="true";btn.setAttribute("aria-pressed",String(on));paper.dataset.open=String(on);reverse.hidden=!on;});
    observe(paper);
  }

  // A real ACS photograph emerges from the community chapter, not synthetic confetti.
  const community=$("#community .leadgrid > div:first-child");
  if(community&&bridge&&!$("#rx-world-festival")){
    const event=make("aside","rx-world-festival");event.id="rx-world-festival";
    event.innerHTML='<div class="rx-world-festival-lead">'+
      '<span class="rx-world-festival-stamp">ACS / 2017</span>'+
      '<button type="button" class="rx-world-festival-trigger" aria-pressed="false" aria-controls="rx-world-festival-image">'+
        both("An archival moment ↗","لحظة من الأرشيف ↗")+'</button></div>'+
      '<figure id="rx-world-festival-image" hidden><img src="/assets/oct12-owner-photos/acs-chapter-recognition-2017.webp" loading="lazy" alt="Archival image of ACS chapter recognition in 2017"/>'+
        '<figcaption>'+both("American Chemical Society student-chapter archive, 2017","أرشيف الفصل الطلابي للجمعية الكيميائية الأمريكية، ٢٠١٧")+
        ' · <a href="/engagement.html">'+both("Read the community record","اقرأ سجل الأنشطة")+' ↗</a></figcaption></figure>';
    $(".rx-world-archive-bridge-cards",bridge).appendChild(event);
    const btn=$(".rx-world-festival-trigger",event),figure=$("figure",event);
    btn.addEventListener("click",()=>{const yes=btn.getAttribute("aria-pressed")!=="true";btn.setAttribute("aria-pressed",String(yes));figure.hidden=!yes;});
    observe(event);
  }

  // A restrained cinematic light reaction is applied around, not over, the film controls.
  const film=$(".rx-home-film-media");
  if(film){
    film.classList.add("rx-world-film-light");
    film.addEventListener("pointermove",e=>{
      if(reduce.matches || e.pointerType==="touch")return;
      const r=film.getBoundingClientRect();
      if(!r.width)return;
      film.style.setProperty("--rx-film-lamp",Math.round((e.clientX-r.left)/r.width*100)+"%");
    },{passive:true});
    film.addEventListener("pointerleave",()=>film.style.removeProperty("--rx-film-lamp"));
  }

  // Lightweight entrance states and offscreen animation suppression.
  if("IntersectionObserver" in window){
    const io=new IntersectionObserver(entries=>{
      entries.forEach(entry=>entry.target.dataset.worldVisible=entry.isIntersecting?"true":"false");
    },{rootMargin:"100px",threshold:0.02});
    places.forEach(node=>io.observe(node));
  }
})();