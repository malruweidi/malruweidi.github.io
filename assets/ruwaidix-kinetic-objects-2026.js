/* Ruwaidix / scientific objects. 21 November 2026.
   Motion is illustrative, never experimental data. No added network requests,
   third-party dependencies, sounds, persistent settings, or source-image edits. */
(() => {
  "use strict";

  const select = (s, root=document) => root.querySelector(s);
  const match = window.matchMedia("(prefers-reduced-motion: reduce)");
  const bilingual = (en, ar) =>
    '<span class="rx-k-en" data-rx-en lang="en">'+en+'</span>'+
    '<span class="rx-k-ar" data-rx-ar lang="ar" dir="rtl">'+ar+'</span>';
  const atoms = (radius, n, fill) => Array.from({length:n},(_,i)=>{
    const a=(2*Math.PI*i/n)-Math.PI/2;
    return '<circle cx="'+(80+radius*Math.cos(a)).toFixed(1)+'" cy="'+(80+radius*Math.sin(a)).toFixed(1)+'" r="4.3" fill="'+fill+'" />';
  }).join("");
  const molecular = '<svg viewBox="0 0 160 160" aria-hidden="true" focusable="false">'+
    '<g fill="none" stroke="#decba7" stroke-width="2.1" stroke-linejoin="round">'+
    '<path d="M18 72L40 58L62 72L62 99L40 113L18 99Z"/><path d="M92 50L115 36L138 50L138 78L115 92L92 78Z"/>'+
    '<path d="M62 85L92 65"/><path d="M40 63V108M22 96L40 108M97 53L115 42M133 54V74"/></g>'+
    '<g class="rx-k-signal" fill="#94b2df"><circle cx="18" cy="72" r="5"/><circle cx="92" cy="65" r="5"/><circle cx="138" cy="50" r="5"/></g>'+
    '<circle class="rx-k-halo" cx="80" cy="80" r="73" fill="none" stroke="#aac3e2" stroke-dasharray="2 10" opacity=".54"/>'+
    '<path class="rx-k-spark" d="M72 28l5-9 5 9 9 5-9 5-5 9-5-9-9-5z" fill="#f6f1e8" opacity=".7"/></svg>';
  const vessel = '<svg viewBox="0 0 160 160" aria-hidden="true" focusable="false">'+
    '<path d="M0 112C28 108 32 52 75 65S118 125 160 43" fill="none" stroke="#d9c3a2" stroke-width="37" stroke-linecap="round" opacity=".78"/>'+
    '<path d="M0 112C28 108 32 52 75 65S118 125 160 43" fill="none" stroke="#365f90" stroke-width="28" stroke-linecap="round"/>'+
    '<path d="M0 112C28 108 32 52 75 65S118 125 160 43" fill="none" stroke="#8fb1d5" stroke-width="1.3" stroke-dasharray="3 6"/>'+
    '<g class="rx-k-cell rx-k-cell-a"><ellipse cx="36" cy="91" rx="12" ry="7" fill="#e9d9bb" transform="rotate(-27 36 91)"/><ellipse cx="36" cy="91" rx="6" ry="3" fill="#597ba8" transform="rotate(-27 36 91)"/></g>'+
    '<g class="rx-k-cell rx-k-cell-b"><ellipse cx="108" cy="95" rx="12" ry="7" fill="#e9d9bb" transform="rotate(38 108 95)"/><ellipse cx="108" cy="95" rx="6" ry="3" fill="#597ba8" transform="rotate(38 108 95)"/></g>'+
    '<circle cx="123" cy="25" r="22" fill="none" stroke="#d9c3a2" stroke-dasharray="2 5" opacity=".72"/></svg>';
  const vesicle = '<svg viewBox="0 0 160 160" aria-hidden="true" focusable="false">'+
    '<circle class="rx-k-vesicle-outer" cx="80" cy="80" r="62" fill="#263e61" stroke="#c6d7e8" stroke-width="1"/>'+
    '<circle cx="80" cy="80" r="47" fill="#6d91bc" fill-opacity=".25" stroke="#e1cfac" stroke-width="7"/>'+
    '<g class="rx-k-membrane">'+atoms(61,18,"#e0c69f")+atoms(45,18,"#a5c0de")+'</g>'+
    '<circle cx="80" cy="80" r="30" fill="#182d4a"/>'+
    '<g fill="#b4cbe5" opacity=".9"><circle cx="69" cy="70" r="6"/><circle cx="91" cy="86" r="5"/><circle cx="76" cy="98" r="3.5"/><circle cx="94" cy="63" r="3"/></g>'+
    '<circle class="rx-k-pulse" cx="80" cy="80" r="71" fill="none" stroke="#9ebbe0" stroke-width="1.5"/></svg>';

  /* The original microscope and zebrafish cutout remain untouched.
     The small objects extend the visual vocabulary without reproducing a research figure. */
  const home = select('html[data-rx-page="home"] .rx-opening-links');
  if (home && !select(".rx-kinetic-shelf")) {
    const nav=document.createElement("nav");
    nav.className="rx-kinetic-shelf";
    nav.setAttribute("aria-labelledby","rx-kinetic-shelf-heading");
    nav.innerHTML='<span id="rx-kinetic-shelf-heading" class="rx-k-shelf-title">'+bilingual("AT THE WORKBENCH · SELECT AN OBJECT","على طاولة المختبر · اختر عنصرًا")+'</span>'+
      '<div class="rx-k-objects">'+[
        {id:"molecule",url:"/research.html#molecular-chemistry",svg:molecular,en:"Molecular sensing",ar:"الاستشعار الجزيئي"},
        {id:"vessel",url:"/research/high-speed-zebrafish-imaging.html",svg:vessel,en:"Living vessels",ar:"الأوعية الدموية"},
        {id:"vesicle",url:"/research/inhalable-vesicles.html",svg:vesicle,en:"Drug carriers",ar:"نواقل الدواء"}
      ].map(o=>'<a class="rx-k-object rx-k-'+o.id+'" href="'+o.url+'">'+
        '<span class="rx-k-object-art">'+o.svg+'</span><span class="rx-k-object-name">'+bilingual(o.en,o.ar)+'</span></a>').join("")+
      '</div><span class="rx-k-context">'+bilingual("Schematic illustrations · open the corresponding research","رسوم توضيحية · افتح البحث المرتبط بكل عنصر")+'</span>';
    home.insertAdjacentElement("afterend",nav);
    nav.querySelectorAll(".rx-k-object").forEach(object=>{
      object.addEventListener("pointermove",event=>{
        if (match.matches || event.pointerType==="touch") return;
        const r=object.getBoundingClientRect();
        const dx=Math.max(-1,Math.min(1,(event.clientX-r.left-r.width/2)/(r.width/2)));
        const dy=Math.max(-1,Math.min(1,(event.clientY-r.top-r.height/2)/(r.height/2)));
        object.style.setProperty("--rx-k-tilt-x",(dy*-5).toFixed(2)+"deg");
        object.style.setProperty("--rx-k-tilt-y",(dx*6).toFixed(2)+"deg");
      });
      object.addEventListener("pointerleave",()=>{
        object.style.removeProperty("--rx-k-tilt-x");
        object.style.removeProperty("--rx-k-tilt-y");
      });
      object.addEventListener("blur",()=>{
        object.style.removeProperty("--rx-k-tilt-x");
        object.style.removeProperty("--rx-k-tilt-y");
      });
    });
  }

  /* A distinct, non-quantitative anatomical sketch in the research introduction. */
  const research = select('html[data-rx-page="research-hub"] .rs-hero-actions');
  if (research && !select(".rx-k-capillary")) {
    const link=document.createElement("a");
    link.className="rx-k-capillary";
    link.href="/research/high-speed-zebrafish-imaging.html";
    link.innerHTML='<span class="rx-k-capillary-art">'+vessel+'</span>'+
      '<span class="rx-k-capillary-copy"><strong>'+bilingual("Movement is a question.","الحركة تطرح سؤالًا.")+'</strong>'+
      '<small>'+bilingual("Schematic illustration · examine the actual imaging method","رسم توضيحي · اطّلع على طريقة التصوير الفعلية")+'</small></span>'+
      '<span class="rx-k-capillary-arrow" aria-hidden="true">↗</span>';
    research.insertAdjacentElement("afterend",link);
  }

  /* Archival-photo loupe: enlarges the original source photograph, not a substitute image. */
  const photo = select('html[data-rx-page="stories"] .stories-hero-photo');
  const original = photo && select("img",photo);
  if (photo && original && !select(".rx-k-loupe-toggle",photo)) {
    const button=document.createElement("button");
    button.type="button";
    button.className="rx-k-loupe-toggle";
    button.setAttribute("aria-pressed","false");
    button.innerHTML='<span aria-hidden="true" class="rx-k-loupe-icon">⌕</span> '+bilingual("Inspect the photograph","تأمّل الصورة");
    const lens=document.createElement("span");
    lens.className="rx-k-photo-lens";
    lens.setAttribute("aria-hidden","true");
    photo.append(button,lens);
    let open=false,x=.5,y=.5;
    function draw() {
      if(!open)return;
      const r=original.getBoundingClientRect(),outer=photo.getBoundingClientRect();
      if(!r.width||!r.height)return;
      const px=x*r.width,py=y*r.height,size=lens.getBoundingClientRect().width||144,zoom=2;
      lens.style.left=(r.left-outer.left+px)+"px";
      lens.style.top=(r.top-outer.top+py)+"px";
      lens.style.backgroundImage='url("'+(original.currentSrc||original.src).replaceAll('"','%22')+'")';
      lens.style.backgroundSize=(r.width*zoom)+"px "+(r.height*zoom)+"px";
      lens.style.backgroundPosition=(-px*zoom+size/2)+"px "+(-py*zoom+size/2)+"px";
    }
    function setOpen(value) {
      open=value;
      photo.classList.toggle("rx-k-loupe-open",open);
      button.setAttribute("aria-pressed",String(open));
      if(open)draw();
    }
    button.addEventListener("click",()=>setOpen(!open));
    original.addEventListener("pointermove",e=>{
      if(!open||match.matches)return;
      const r=original.getBoundingClientRect();
      x=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));
      y=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));
      draw();
    });
    original.addEventListener("pointerdown",e=>{
      if(!open)return;
      const r=original.getBoundingClientRect();
      x=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));
      y=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));
      draw();
    });
    button.addEventListener("keydown",e=>{
      const steps={ArrowLeft:[-.08,0],ArrowRight:[.08,0],ArrowUp:[0,-.08],ArrowDown:[0,.08]};
      if(e.key==="Escape" && open){setOpen(false);e.preventDefault();return;}
      if(!open || !steps[e.key])return;
      e.preventDefault();
      x=Math.max(0,Math.min(1,x+steps[e.key][0]));
      y=Math.max(0,Math.min(1,y+steps[e.key][1]));
      draw();
    });
    document.addEventListener("keydown",e=>{if(e.key==="Escape" && open)setOpen(false);});
    window.addEventListener("resize",draw,{passive:true});
    original.addEventListener("load",draw);
  }

  /* Pause continuously animated objects while outside the viewport. */
  if ("IntersectionObserver" in window) {
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        entry.target.dataset.rxKVisible=entry.isIntersecting?"true":"false";
      });
    },{rootMargin:"70px"});
    document.querySelectorAll(".rx-kinetic-shelf,.rx-k-capillary").forEach(node=>observer.observe(node));
  }
})();
