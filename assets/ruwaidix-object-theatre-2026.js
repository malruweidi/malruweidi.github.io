/* Ruwaidix object theatre: real archival material, no card widget. */
(() => {
 "use strict";
 const root=document.documentElement;
 const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
 const t=(en,ar)=>'<span class="rx-theatre-en" lang="en">'+en+'</span><span class="rx-theatre-ar" lang="ar" dir="rtl">'+ar+'</span>';
 const hero=root.dataset.rxPage==="home" && document.querySelector(".rx-hero-grid");
 if(hero && !document.getElementById("rx-theatre-workroom")){
  const work=document.createElement("section");
  work.id="rx-theatre-workroom";
  work.className="rx-theatre-workroom";
  work.setAttribute("aria-labelledby","rx-theatre-title");
  work.innerHTML=[
   '<div class="rx-theatre-topline"><span class="rx-theatre-index">',t("INSTRUMENT · SPECIMEN · DELIVERY","أداة · عيّنة · توصيل الدواء"),'</span><span class="rx-theatre-sequence" aria-hidden="true">01 / 03</span></div>',
   '<div class="rx-theatre-field"><div class="rx-theatre-diagram" aria-hidden="true"><i></i><i></i><i></i><i></i></div>',
   '<a class="rx-theatre-microscope" href="/stories/cairo-microscope.html"><span class="rx-theatre-photo-mat">',
   '<img src="/assets/oct12-owner-photos/microscopy-vacation-morning-2017.webp" alt="Personal archive photograph of the microscope on the desk in 2017" width="440" height="550" loading="lazy" decoding="async"></span>',
   '<span class="rx-theatre-microscope-tag">',t("01 / Microscope from Cairo","٠١ / مجهر القاهرة"),'</span></a>',
   '<div class="rx-theatre-central"><div class="rx-theatre-kicker">',t("A CLOSER LOOK","نظرة عن قرب"),'</div>',
   '<h2 id="rx-theatre-title">',t("What the instrument reveals.","ما تكشفه الأداة."),'</h2>',
   '<p>',t("An instrument changes what can be seen. A method determines what can be claimed.","تغيّر الأداة ما يمكن رؤيته، وتحدّد المنهجية ما يجوز استنتاجه."),'</p>',
   '<button class="rx-theatre-inspect" type="button" aria-pressed="false" aria-controls="rx-theatre-evidence"><span aria-hidden="true" class="rx-theatre-lens-icon">◉</span>',
   t("Look through the lens","انظر عبر العدسة"),'</button></div>',
   '<a class="rx-theatre-fish" href="/research/high-speed-zebrafish-imaging.html"><img src="/assets/zebrafish-larva-microscopy.webp" loading="lazy" decoding="async" width="252" height="148" alt="Archived larval zebrafish microscopy source image"><span>',
   t("02 / Living vessels","٠٢ / الأوعية الحيّة"),'</span></a>',
   '<a class="rx-theatre-carrier" href="/research/inhalable-vesicles.html"><svg viewBox="0 0 190 190" aria-hidden="true" focusable="false">',
   '<circle class="rx-theatre-pulse" cx="95" cy="95" r="84" fill="none" stroke="#93b4db" stroke-width="1.2"/>',
   '<circle cx="95" cy="95" r="65" fill="#142b47" stroke="#e3caa1" stroke-width="5"/>',
   '<circle class="rx-theatre-membrane" cx="95" cy="95" r="52" fill="none" stroke="#92acd0" stroke-width="8" stroke-dasharray="5 6"/>',
   '<circle cx="95" cy="95" r="36" fill="#1e3e64" stroke="#658ab6" stroke-width="1"/>',
   '<g fill="#d9c39d"><circle cx="85" cy="83" r="6"/><circle cx="115" cy="99" r="4"/><circle cx="94" cy="111" r="5"/><circle cx="106" cy="77" r="3"/></g></svg><span>',
   t("03 / Inhalable carriers · schematic","٠٣ / نواقل الاستنشاق · رسم توضيحي"),'</span></a>',
   '<div class="rx-theatre-evidence" id="rx-theatre-evidence" hidden><div class="rx-theatre-evidence-inner">',
   '<img src="/assets/evidence-zebrafish.webp" loading="lazy" alt="Archived zebrafish cardiovascular research figure, displayed without alteration"/>',
   '<div class="rx-theatre-evidence-caption"><strong>',t("From the research archive","من الأرشيف البحثي"),'</strong><p>',
   t("Original research figure. On-screen enlargement is not a calibrated measurement.","صورة من البحث الأصلي. التكبير المعروض ليس قياسًا مُعايرًا."),'</p>',
   '<a href="/figures.html#zebrafish">',t("Inspect the figure and source","افحص الصورة ومصدرها"),' ↗</a></div></div></div></div>',
   '<div class="rx-theatre-bottomline"><span>',t("ORIGINAL PHOTOGRAPHS AND FIGURES ARE LINKED","الصور والأشكال الأصلية متاحة عبر الروابط"),'</span><span class="rx-theatre-reading">2017 → 2026</span></div>'
  ].join("");
  hero.insertAdjacentElement("afterend",work);
  const inspect=work.querySelector(".rx-theatre-inspect");
  const evidence=work.querySelector(".rx-theatre-evidence");
  function show(value){
   const next=Boolean(value);
   work.dataset.inspecting=String(next);
   inspect.setAttribute("aria-pressed",String(next));
   evidence.hidden=!next;
   if(next)evidence.scrollIntoView?.({behavior:reduced.matches?"instant":"smooth",block:"nearest"});
  }
  inspect.addEventListener("click",()=>show(evidence.hidden));
  document.addEventListener("keydown",event=>{
   if(event.key==="Escape"&&!evidence.hidden){show(false);inspect.focus();}
  });
  const field=work.querySelector(".rx-theatre-field");
  field.addEventListener("pointermove",event=>{
   if(reduced.matches||event.pointerType==="touch")return;
   const r=field.getBoundingClientRect();
   if(!r.width||!r.height)return;
   field.style.setProperty("--rx-theatre-x",Math.max(-11,Math.min(11,((event.clientX-r.left)/r.width-.5)*22))+"px");
   field.style.setProperty("--rx-theatre-y",Math.max(-10,Math.min(10,((event.clientY-r.top)/r.height-.5)*20))+"px");
  },{passive:true});
  field.addEventListener("pointerleave",()=>{
   field.style.removeProperty("--rx-theatre-x");
   field.style.removeProperty("--rx-theatre-y");
  });
 }
 document.querySelectorAll(".rx-z-scene").forEach(scene=>{
  scene.classList.add("rx-z-theatre");
  const svg=scene.querySelector(".rx-z-object svg");
  if(svg)svg.setAttribute("aria-hidden","true");
 });
})();