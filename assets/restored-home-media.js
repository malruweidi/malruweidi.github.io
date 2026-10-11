/* Original homepage: authentic footage, approved brand, personal introduction.
   Does not remove bibliographies, essays, research, history, archive or patient sections. */
(function(){
"use strict";
function start(){
 if(document.documentElement.getAttribute("data-rx-page")!=="home")return;
 const enLead="I was curious about how living things worked long before I knew what kind of scientist I wanted to become. Anatomy gave me my first questions; chemistry gave me ways to investigate them.";
 const arLead="بدأ فضولي حول كيفية عمل الكائنات الحية قبل أن أعرف أي نوع من العلماء أريد أن أصبح. منحني علم التشريح أسئلتي الأولى، ثم منحتني الكيمياء وسائل لاختبارها.";
 const enSubtitle="In 2011, anatomy had already captured my curiosity at school. Around those years, recurrent eosinophilic gastrointestinal illness brought the uncertainty of medicine into my life. The illness did not create my interest in science, but it sharpened my attention to what evidence can and cannot establish. My research later moved through molecular sensing, materials, zebrafish development and pulmonary epithelial injury toward inhalable drug delivery.";
 const arSubtitle="في عام ٢٠١١ كان علم التشريح قد استحوذ على فضولي في المدرسة. وفي تلك السنوات دخل المرض اليوزيني الهضمي المتكرر حياتي وجعل عدم اليقين الطبي تجربة شخصية. لم يصنع المرض اهتمامي بالعلم، لكنه زاد انتباهي إلى ما تستطيع الأدلة إثباته وما تعجز عن إثباته. ثم انتقلت أبحاثي بين الاستشعار الجزيئي والمواد وتطور أسماك الزرد وإصابة ظهارة الرئة وصولاً إلى توصيل الأدوية المستنشقة.";
 const lead=document.querySelector(".hero-copy .lead"),subtitle=document.querySelector(".hero-copy .subtitle");
 function localizeIntro(){
  const ar=document.documentElement.lang==="ar";
  if(lead){lead.textContent=ar?arLead:enLead;lead.dataset.i18nIgnore="true";}
  if(subtitle){subtitle.textContent=ar?arSubtitle:enSubtitle;subtitle.dataset.i18nIgnore="true";}
 }
 localizeIntro();
 new MutationObserver(localizeIntro).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
 const logo="/assets/ruwaidix-approved.webp";
 const fav="/assets/ruwaidix-tab-2026.svg";
 document.querySelectorAll(".header .ruwaidix-mark img,.hero .portrait-overlay img").forEach(img=>{img.src=logo;img.alt="Approved Ruwaidix identity";});
 const favicons=document.querySelectorAll("link[rel='icon'],link[rel='shortcut icon']");
 if(favicons.length)favicons.forEach(el=>{el.href=fav;el.type="image/svg+xml";});
 else {const icon=document.createElement("link");icon.rel="icon";icon.type="image/svg+xml";icon.href=fav;document.head.appendChild(icon);}
 const grid=document.querySelector(".technique-footage-grid");
 if(!grid || grid.querySelector(".rx-film"))return;
 const archiveLink="/archive/archive-video-2016.mp4";
 const films=[
 {kind:"ZEBRAFISH / ORIGINAL MICROSCOPY",title:"Watching a developing heart",description:"High-speed microscopy from the zebrafish cardiovascular archive. The film records motion; interpretation requires the experimental context and quantitative analysis.",src:"https://cdn.creativeclaw.co/u/8a002dd8/videos/a36572cf-79ea-4108-83c1-66794c061732.mp4",poster:"https://cdn.creativeclaw.co/u/8a002dd8/images/f76cc7ee-d202-4d76-b55e-2f8f29b3f790.jpg",href:"techniques.html#animal-videos",link:"Methods and full recordings",
 arkind:"سمك الزرد / تصوير مجهري أصلي",artitle:"مشاهدة القلب أثناء التطور",ardesc:"تصوير مجهري عالي السرعة من الأرشيف البحثي للقلب والأوعية في أسماك الزرد. يُظهر الفيلم الحركة، بينما يتطلب تفسيرها منهجية وقياساً كمياً.",arlink:"طرق البحث والتسجيلات الكاملة"},
 {kind:"ZEBRAFISH / ORIGINAL MICROSCOPY",title:"A second view of cardiovascular motion",description:"A separate microscopy sequence from the developmental-imaging archive. The distinction between observation and inference is part of the science.",src:"https://cdn.creativeclaw.co/u/8a002dd8/videos/0b2fc0e1-5310-4f0a-a94a-94f3471960a2.mp4",poster:"https://cdn.creativeclaw.co/u/8a002dd8/images/5f515de4-5961-44cb-ba0e-8c55c174ef89.jpg",href:"figures.html#zebrafish",link:"Published imaging evidence",
 arkind:"سمك الزرد / تصوير مجهري أصلي",artitle:"مشهد آخر للحركة القلبية الوعائية",ardesc:"لقطة مجهرية مستقلة من أرشيف تصوير التطور الحيوي. إن التمييز بين الملاحظة والاستنتاج جزء أساسي من المنهج العلمي.",arlink:"الأشكال المنشورة"},
 {kind:"AVIAN EMBRYOLOGY / ARCHIVAL RECORDING",title:"An early laboratory preparation",description:"A short archival recording of an opened avian egg preparation. This is not a claim that the film shows a developing embryo or a completed experiment.",src:archiveLink,poster:"https://cdn.creativeclaw.co/u/8a002dd8/images/d388acc2-b8b1-4b11-9f72-8e63ffd3f7b1.jpg",href:"techniques.html#chick-embryo",link:"Avian preparation in the methods atlas",
 arkind:"علم الأجنة الطيري / تسجيل أرشيفي",artitle:"تجهيز مخبري من البدايات",ardesc:"تسجيل أرشيفي قصير لعملية تجهيز بيضة طائر مفتوحة. لا ندّعي أن التسجيل يُظهر جنيناً نامياً أو تجربة مكتملة.",arlink:"التحضير الطيري في أطلس التقنيات"}
 ];
 const fragment=document.createDocumentFragment();
 const cards=[];
 films.forEach((item,index)=>{
  const figure=document.createElement("figure");figure.className="rx-film";
  const video=document.createElement("video");
  video.controls=true;video.playsInline=true;video.preload="none";video.poster=item.poster;video.setAttribute("aria-label",item.title);
  const source=document.createElement("source");source.src=item.src;source.type="video/mp4";video.appendChild(source);
  const caption=document.createElement("figcaption");
  const kind=document.createElement("span");kind.className="rx-kind";
  const title=document.createElement("strong"),description=document.createElement("p"),link=document.createElement("a");
  link.href=item.href;link.textContent=item.link+" ↗";link.setAttribute("aria-label",item.link);
  caption.append(kind,title,description,link);figure.append(video,caption);fragment.append(figure);
  cards.push({item,kind,title,description,link,video});
 });
 grid.replaceChildren(fragment);
 function localizeFilms(){
  const ar=document.documentElement.lang==="ar";
  cards.forEach(({item,kind,title,description,link,video})=>{
   kind.textContent=ar?item.arkind:item.kind;title.textContent=ar?item.artitle:item.title;
   description.textContent=ar?item.ardesc:item.description;
   link.textContent=(ar?item.arlink:item.link)+" ↗";
   video.setAttribute("aria-label",ar?item.artitle:item.title);
  });
 }
 localizeFilms();
 new MutationObserver(localizeFilms).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
 const text=document.querySelector(".technique-footage-intro > p");
 if(text){
  const eng="These are recordings from the research archive, not decorative stock footage. The zebrafish clips show developmental cardiovascular motion; the avian film documents egg preparation. Full methods, provenance and contextual figures remain available in the linked research pages.";
  const arb="هذه تسجيلات من الأرشيف البحثي، وليست لقطات تزيينية. تُظهر مقاطع أسماك الزرد حركة القلب والأوعية أثناء التطور، ويوثّق الفيلم الطيري إعداد البيضة. تتوفر التفاصيل والمنهجيات والأشكال العلمية في الصفحات المرتبطة.";
  const update=()=>{text.textContent=document.documentElement.lang==="ar"?arb:eng;text.dataset.i18nIgnore="true";};
  update();new MutationObserver(update).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
 }
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();
