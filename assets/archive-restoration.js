/* 30-image archival restoration. Uses the provenance manifest, leaves all existing sections unchanged. */
(function(){
"use strict";
function ready(fn){if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",fn,{once:true});else fn();}
ready(async function(){
  if(document.documentElement.dataset.rxPage!=="archive")return;
  if(document.getElementById("rxRecoveredGallery"))return;
  const anchor=document.querySelector(".photo-section");
  if(!anchor)return;
  const ar=document.documentElement.lang==="ar";
  const words=ar?{
    kicker:"الأرشيف المصور الأصلي · ٣٠ صورة",
    title:"الصور التي تحفظ تاريخ التجربة.",
    intro:"صور أصلية من الأرشيف السابق، تشمل المختبرات والفعاليات العلمية والزملاء والحياة الجامعية. التواريخ هنا من تسميات أرشيف الصور، ولا تثبت بالضرورة تاريخ التصوير الفعلي.",
    all:"جميع الصور",count:"صورة",close:"إغلاق",source:"معلومة المصدر",video:"تسجيل أرشيفي أصلي",
    videoText:"هذا التسجيل القصير محفوظ من الأرشيف الأصلي. لم نتحقق بصورة مستقلة من تاريخ التصوير أو هوية العينة.",
    note:"التواريخ والتسميات مستعادة من أرشيف الصور السابق؛ تسمية الصورة لا تثبت اسم فعالية بعينها. تُحفظ البيانات الأصلية في بيان المصدر.",
    outreach:"أنشطة علمية",lab:"مختبر",academic:"حياة أكاديمية",personal:"شخصية"
  }:{
    kicker:"30 original photographs · recovered archive",
    title:"The people and experiments behind the research.",
    intro:"The original photo collection traces laboratories, chemistry outreach, events, colleagues and university life. Its dates are the supplied archive's display labels, not independently authenticated camera timestamps.",
    all:"All photographs",count:"photographs",close:"Close",source:"Archive source",video:"A short recording from the archive",
    videoText:"The short film has been preserved from the earlier archive. Its recording date and specimen identity have not been independently verified.",
    note:"Image names and date labels were recovered from the original photo gallery. Their event identification should not be assumed without supporting original material.",
    outreach:"Public engagement",lab:"Laboratory",academic:"Academic life",personal:"Personal"
  };
  let data;
  try{
    const response=await fetch("/assets/archive-photo-manifest.json",{cache:"no-store"});
    if(!response.ok)throw new Error("Photo index unavailable: "+response.status);
    data=await response.json();
    if(!Array.isArray(data.photos)||data.photos.length!==30)throw new Error("Archive manifest incomplete");
  }catch(err){
    console.warn("Original archive recovery display could not load",err);
    return;
  }
  const section=document.createElement("section");
  section.id="rxRecoveredGallery";
  section.className="rx-restored-archive";
  section.setAttribute("aria-labelledby","rxRecoveredTitle");
  const wrap=document.createElement("div");wrap.className="rx-restored-wrap";
  function el(tag,cls,txt){const node=document.createElement(tag);if(cls)node.className=cls;if(txt!==undefined)node.textContent=txt;return node;}
  wrap.append(el("p","rx-kicker",words.kicker));
  const title=el("h2",null,words.title);title.id="rxRecoveredTitle";wrap.append(title,el("p","rx-intro",words.intro));
  const filters=el("div","rx-filter-bar");filters.setAttribute("role","group");filters.setAttribute("aria-label",ar?"تصفية صور الأرشيف":"Filter archive photographs");
  const options=[["All",words.all],["Public engagement",words.outreach],["Laboratory",words.lab],["Academic life",words.academic],["Personal",words.personal]];
  const buttons=[];
  for(const [value,label] of options){const button=el("button",null,label);button.type="button";button.dataset.filter=value;button.setAttribute("aria-pressed",String(value==="All"));filters.append(button);buttons.push(button);}
  wrap.append(filters);
  const count=el("span","rx-photo-count",data.photos.length+" "+words.count);count.setAttribute("aria-live","polite");wrap.append(count);
  const gallery=el("div","rx-restored-grid");gallery.id="rxRecoveredGrid";
  const cards=[];
  const dialog=el("dialog","rx-archive-dialog");dialog.id="rxRecoveredDialog";
  dialog.setAttribute("aria-labelledby","rxRecoveredPhotoTitle");
  const zoom=el("img");zoom.alt="";
  const foot=el("div","rx-dialog-caption"),footTxt=el("div"),bigTitle=el("strong"),detail=el("span");
  bigTitle.id="rxRecoveredPhotoTitle";
  const actions=el("div","rx-dialog-actions");
  const previous=el("button",null,ar?"← السابق":"← Previous"),next=el("button",null,ar?"التالي →":"Next →");
  const position=el("span","rx-dialog-position");
  position.setAttribute("aria-live","polite");
  previous.type="button";next.type="button";
  previous.setAttribute("aria-label",ar?"الصورة السابقة":"Previous photograph");
  next.setAttribute("aria-label",ar?"الصورة التالية":"Next photograph");
  const close=el("button",null,words.close+" ×");close.type="button";
  footTxt.append(bigTitle,detail);actions.append(previous,position,next,close);foot.append(footTxt,actions);dialog.append(zoom,foot);
  const displayPhotoMeta=item=>[item.archive_display_location,item.date_label,item.archive_display_time].filter(Boolean).join(" · ");
  let activeItems=data.photos.slice(),activeIndex=0,lastTrigger=null;
  const renderPhoto=()=>{
    const item=activeItems[activeIndex];
    if(!item)return;
    zoom.src="/"+item.file;zoom.alt=item.title;
    bigTitle.textContent=item.title;
    detail.textContent=displayPhotoMeta(item)+" · "+words.source+": "+item.source;
    position.textContent=(activeIndex+1)+" / "+activeItems.length;
    previous.disabled=activeIndex===0;
    next.disabled=activeIndex===activeItems.length-1;
  };
  const movePhoto=delta=>{
    const proposed=activeIndex+delta;
    if(proposed<0||proposed>=activeItems.length)return;
    activeIndex=proposed;renderPhoto();
  };
  const showImage=(item,event)=>{
    if(typeof dialog.showModal!=="function")return;
    event.preventDefault();
    lastTrigger=event.currentTarget;
    const n=activeItems.findIndex(p=>p.file===item.file);
    activeIndex=n>=0?n:0;
    renderPhoto();
    if(!dialog.open)dialog.showModal();
    close.focus();
  };
  for(const item of data.photos){
    const figure=el("figure","rx-restored-card");figure.dataset.category=item.category;
    const link=el("a");link.href="/"+item.file;link.setAttribute("aria-label",(ar?"فتح الصورة: ":"Open photograph: ")+item.title);
    const pic=el("img");pic.src="/"+item.file;pic.alt=item.title;pic.loading="lazy";pic.decoding="async";pic.width=400;pic.height=435;link.append(pic);
    link.addEventListener("click",event=>showImage(item,event));
    const cap=el("figcaption");cap.append(el("span","rx-category",item.category),el("strong",null,item.title),el("span","rx-date",displayPhotoMeta(item)));
    figure.append(link,cap);gallery.append(figure);cards.push(figure);
  }
  for(const button of buttons){button.addEventListener("click",()=>{
    const key=button.dataset.filter;
    activeItems=data.photos.filter(item=>key==="All"||item.category===key);
    let n=0;for(const card of cards){const visible=key==="All"||card.dataset.category===key;card.hidden=!visible;if(visible)n++;}
    count.textContent=n+" "+words.count;
    for(const control of buttons)control.setAttribute("aria-pressed",String(control===button));
  });}
  wrap.append(gallery,el("p","rx-disclaimer",words.note));
  const recording=el("div","rx-recording");recording.id="archival-recording";
  const rtext=el("div");rtext.append(el("p","rx-kicker",ar?"فيديو / ملف أرشيفي لعام ٢٠١٦":"Video / 2016 file record"),el("h3",null,words.video),el("p","rx-intro",words.videoText));
  const video=el("video");video.controls=true;video.preload="metadata";video.playsInline=true;video.poster="/archive/archive-video-poster.jpg";
  const source=el("source");source.src="/archive/archive-video-2016.mp4";source.type="video/mp4";video.append(source);
  recording.append(rtext,video);wrap.append(recording);section.append(wrap,dialog);
  anchor.insertAdjacentElement("afterend",section);
  previous.addEventListener("click",()=>movePhoto(-1));
  next.addEventListener("click",()=>movePhoto(1));
  close.addEventListener("click",()=>dialog.close());
  dialog.addEventListener("keydown",event=>{
    if(event.altKey||event.ctrlKey||event.metaKey)return;
    if(event.key==="ArrowRight"||event.key==="ArrowLeft"){
      event.preventDefault();
      const forward=event.key===(document.documentElement.dir==="rtl"?"ArrowLeft":"ArrowRight");
      movePhoto(forward?1:-1);
    }
  });
  dialog.addEventListener("click",event=>{if(event.target===dialog)dialog.close();});
  dialog.addEventListener("close",()=>{
    zoom.removeAttribute("src");
    if(lastTrigger&&lastTrigger.isConnected)lastTrigger.focus();
    lastTrigger=null;
  });
  const firstLink=document.querySelector(".hero .mini");
  if(firstLink&&!document.getElementById("rxJumpArchive")){
    const jump=el("a",null,ar?"عرض الأرشيف المصور الكامل ↓":"See all 30 restored photographs ↓");
    jump.href="#rxRecoveredGallery";jump.id="rxJumpArchive";jump.style.cssText="display:inline-block;color:#f4d7c8;border-bottom:1px solid currentColor;margin-top:13px;font-size:13px";
    firstLink.insertAdjacentElement("afterend",jump);
  }
});
})();