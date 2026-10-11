/* Documentary student-chemistry photographs alongside QUACS, not generic promotional imagery. */
(function(){
"use strict";
const run=()=>{
  if(document.documentElement.dataset.rxPage!=="home")return;
  const area=document.getElementById("quacs");if(!area)return;
  const target=area.querySelector(".quacs-grid");if(!target||document.getElementById("rxHomeScience"))return;
  const ar=document.documentElement.lang==="ar";
  const section=document.createElement("section");section.id="rxHomeScience";section.className="rx-home-science";
  section.setAttribute("aria-label",ar?"صور من الأنشطة العلمية الطلابية":"Photographs of student science and chemistry outreach");
  section.innerHTML=ar?'<div class="rx-home-science-head"><div><p class="rx-science-eyebrow">من أرشيف الفصل الطلابي</p><h3>العلم في حياة الناس.</h3></div><p class="rx-science-body">امتد نشاط فصل الجمعية الكيميائية الأمريكية إلى العروض العلمية في مقهى الكيميائي ولقاءات الطلاب والفعاليات العامة. شاركت أيضًا في تقديم مهرجان للكيمياء بصفتي مقدّمًا للفعالية. ترد صور المقهى داخل ملصقَي الفصل العلمي لعامي ٢٠١٧ و٢٠١٨؛ أما الصور المعروضة هنا فهي من الأرشيف الطلابي الأصلي مع الاحتفاظ بوصفها التاريخي دون نسبتها إلى فعالية لم تُتحقق هويتها.</p></div>':'<div class="rx-home-science-head"><div><p class="rx-science-eyebrow">From the original chapter record</p><h3>Science among people.</h3></div><p class="rx-science-body">Our ACS chapter took chemistry into public demonstrations and meetings at The Chemist Café. My work also included hosting a Chemistry Festival as MC. The chapter’s 2017 and 2018 research posters preserve photographs of The Chemist Café; the photographs below come from the original student archive and are not labeled as those particular events without verification.</p></div>';
  const gallery=document.createElement("div");gallery.className="rx-home-science-photos";
  const records=[
    {src:"/archive/archive-7887.jpg",name:"Chemistry demonstration",ar:"عرض عملي للكيمياء",label:"Archive label · 22 May 2017",arl:"وصف الأرشيف · ٢٢ مايو ٢٠١٧"},
    {src:"/archive/archive-7886.jpg",name:"Chemistry outreach with a colleague",ar:"نشاط توعوي مع زميل",label:"Archive label · 23 May 2017",arl:"وصف الأرشيف · ٢٣ مايو ٢٠١٧"},
    {src:"/archive/archive-7881.jpg",name:"Research poster in Washington",ar:"ملصق بحثي في واشنطن",label:"Archive label · 20 August 2017",arl:"وصف الأرشيف · ٢٠ أغسطس ٢٠١٧"}
  ];
  for(const rec of records){
    const figure=document.createElement("figure"),a=document.createElement("a"),img=document.createElement("img"),cap=document.createElement("figcaption"),strong=document.createElement("strong");
    a.href=rec.src;a.target="_blank";a.rel="noopener noreferrer";
    img.src=rec.src;img.loading="lazy";img.decoding="async";img.alt=ar?rec.ar:rec.name;
    strong.textContent=ar?rec.ar:rec.name;cap.append(strong,document.createTextNode(ar?rec.arl:rec.label));
    a.append(img);figure.append(a,cap);gallery.append(figure);
  }
  const links=document.createElement("div");links.className="rx-home-science-links";
  const recordsLinks=[
    ["https://www.researchgate.net/publication/321807247_ACS_Successful_Students_Chapter_ACS_Qatar_University_As_a_Model_ACS_254th_National_Meeting_2017",ar?"ملصق ٢٠١٧ · صورة مقهى الكيميائي":"2017 poster · The Chemist Café photograph"],
    ["https://www.researchgate.net/publication/327067959_ACS_Qatar_University%27s_chapter_Updates_on_The_Approach_of_Qatar_University%27s_Chapter_to_Empower_Young_Chemists_and_Reach_Out_to_Community",ar?"ملصق ٢٠١٨ · لقاءات المقهى":"2018 poster · Café public meetings"],
    ["/engagement.html#chemistry-festival",ar?"سياق الفعاليات العلمية":"Science engagement and festival hosting"],
    ["/archive.html#rxRecoveredGallery",ar?"الأرشيف المصور الكامل":"Complete photograph archive"]
  ];
  for(const [href,label] of recordsLinks){const a=document.createElement("a");a.href=href;a.textContent=label;if(href.startsWith("https:")){a.target="_blank";a.rel="noopener noreferrer"}links.append(a);}
  const foot=document.createElement("p");foot.className="rx-provenance";foot.textContent=ar?"تواريخ الصور معروضة كما وردت في الأرشيف الأصلي، وليست تواريخ تصوير موثقة بصورة مستقلة.":"Photo dates reflect original archive display labels; exact event identification and camera metadata remain subject to verification.";
  section.append(gallery,links,foot);target.insertAdjacentElement("afterend",section);
};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run,{once:true});else run();
})();