/* Ruwaidix / Atlas of Questions 2026. Additive navigation only.
   Does not move, remove, alter or autoplay any film, figure or source content. */
(()=>{"use strict";
const T=(en,ar)=>({en,ar});
const pages={
"research.html":T("Research investigations","الأبحاث"),
"publications.html":T("Publications","المنشورات"),
"films.html":T("Scientific films","الأفلام العلمية"),
"stories.html":T("Research stories","حكايات البحث"),
"writing.html":T("Essays & history","المقالات والتاريخ"),
"archive.html":T("Photo archive","الأرشيف المصوّر"),
"techniques.html":T("Techniques atlas","دليل التقنيات"),
"methods-evidence.html":T("Methods & evidence","المنهج والأدلة"),
"figures.html":T("Figures & sources","الأشكال والمصادر"),
"moving-evidence.html":T("Original recordings","التسجيلات الأصلية"),
"publication-cinema.html":T("Publication cinema","أفلام المنشورات"),
"molecular-therapeutics.html":T("Future research","الأبحاث المستقبلية"),
"computing.html":T("Scientific computing","الحوسبة العلمية"),
"chem-squad.html":T("Chem Squad","فريق الكيمياء"),
"leadership.html":T("Leadership","القيادة"),
"engagement.html":T("Science & society","العلم والمجتمع"),
"major-revisions.html":T("The book","الكتاب"),
"illness-and-evidence.html":T("Illness & evidence","المرض والأدلة"),
"cv.html":T("Academic CV","السيرة الأكاديمية"),
"grants.html":T("Grants","المنح"),
"reading-map.html":T("Reading map","خريطة القراءة"),
"full-record.html":T("Complete record","السجل الكامل"),
"search.html":T("Search","بحث")
};
const groups=[
[T("01 / Investigations","٠١ / الدراسات"),["research.html","publications.html","techniques.html","methods-evidence.html","figures.html","molecular-therapeutics.html","computing.html"]],
[T("02 / Moving evidence","٠٢ / الأدلة المصوّرة"),["films.html","publication-cinema.html","moving-evidence.html","stories.html","archive.html"]],
[T("03 / People & ideas","٠٣ / الناس والأفكار"),["writing.html","illness-and-evidence.html","chem-squad.html","leadership.html","engagement.html","major-revisions.html"]],
[T("04 / The record","٠٤ / السجل"),["cv.html","grants.html","reading-map.html","full-record.html","search.html"]]
];
const tracks=[
{n:T("Molecular beginnings","البدايات الجزيئية"),s:T("Chemistry · sensors · inference","الكيمياء · الاستشعار · الاستدلال"),
q:T("When does a molecular signal become evidence?","متى تصبح الإشارة الجزيئية دليلاً؟"),
d:T("Move from curcumin sensing and molecular design to the published result, the underlying methods and the story of experiments that resisted. A publication is not the entire investigation.","من استشعار الكركمين والتصميم الجزيئي إلى النتائج المنشورة والمنهج وحكايات التجارب الصعبة. فالمنشور ليس كل التجربة."),
links:[["research.html#molecular-chemistry",T("Chemical investigations","دراسات الكيمياء")],["publications.html",T("Published papers","الأبحاث المنشورة")],["techniques.html",T("Methods & measurements","التقنيات والقياسات")],["stories.html#chapter-undergraduate-imines",T("Behind the experiment","ما وراء التجربة")]]},
{n:T("Biology under force","الأحياء تحت تأثير القوة"),s:T("Vessels · flow · lung injury","الأوعية · التدفق · إصابة الرئة"),
q:T("How do living tissues respond to mechanical forces?","كيف تستجيب الأنسجة الحية للقوى الميكانيكية؟"),
d:T("Follow zebrafish vascular imaging and pulmonary epithelial injury across experimental physiology, original recordings and scientific documentary.","تتبّع تصوير أوعية سمك الزرد وإصابة ظهارة الرئة عبر الفيزيولوجيا التجريبية والتسجيلات الأصلية والأفلام العلمية."),
links:[["research.html#research-living-systems",T("Living systems research","أبحاث الأنظمة الحية")],["methods-evidence.html#physiology",T("Experimental evidence","الأدلة التجريبية")],["moving-evidence.html",T("Original footage","التسجيلات الأصلية")],["films.html",T("Film collection","الأفلام")]]},
{n:T("Materials to medicines","من المواد إلى الأدوية"),s:T("Interfaces · aerosols · delivery","الواجهات · الرذاذ · التوصيل"),
q:T("What must an intervention survive before it can work?","ما الذي ينبغي أن يتجاوزه العلاج قبل أن ينجح؟"),
d:T("Polymer surfaces, inhalable formulations and epithelial injury connect materials engineering to exposure and biological response. Completed experiments and proposed directions are distinguished.","تربط أسطح البوليمرات والتركيبات المستنشقة وإصابات الظهارة بين هندسة المواد والتعرّض والاستجابة البيولوجية، مع الفصل بين النتائج الفعلية والمقترحات."),
links:[["research.html#biomaterials",T("Biomaterials","المواد الحيوية")],["research.html#research-delivery",T("Drug-delivery studies","دراسات توصيل الدواء")],["molecular-therapeutics.html#research-interests",T("Future directions","الاتجاهات المستقبلية")],["publication-cinema.html#film-niosomes",T("Publication film","فيلم مرتبط بالبحث")]]},
{n:T("The history of knowing","تاريخ المعرفة"),s:T("Pharmacy · writing · lived experience","الصيدلة · الكتابة · التجربة الإنسانية"),
q:T("How do we decide what the record can establish?","كيف نحدد ما الذي يمكن أن تثبته الشواهد؟"),
d:T("Historical pharmacy, scientific uncertainty and personal experience share an obligation to distinguish observation, interpretation and what remains unknown.","يجمع تاريخ الصيدلة وعدم اليقين العلمي والتجربة الشخصية ضرورة الفصل بين الملاحظة والتفسير وما يظل مجهولاً."),
links:[["research.html#historical-research",T("History of pharmacy","تاريخ الصيدلة")],["writing.html",T("Essays & arguments","المقالات والأفكار")],["illness-and-evidence.html",T("The patient perspective","من منظور المريض")],["archive.html",T("The personal archive","الأرشيف الشخصي")]]}
];
const related={
"research.html":["methods-evidence.html","publications.html","films.html"],
"publications.html":["research.html","figures.html","publication-cinema.html"],
"films.html":["moving-evidence.html","research.html","stories.html"],
"stories.html":["archive.html","research.html","writing.html"],
"writing.html":["stories.html","publications.html","major-revisions.html"],
"archive.html":["stories.html","chem-squad.html","films.html"],
"chem-squad.html":["stories.html","leadership.html","archive.html"],
"leadership.html":["engagement.html","chem-squad.html","archive.html"],
"molecular-therapeutics.html":["research.html","methods-evidence.html","grants.html"],
"methods-evidence.html":["research.html","figures.html","publications.html"],
"techniques.html":["research.html","figures.html","moving-evidence.html"],
"figures.html":["methods-evidence.html","research.html","publications.html"],
"computing.html":["research.html","publications.html","methods-evidence.html"],
"illness-and-evidence.html":["stories.html","writing.html","publications.html"],
"major-revisions.html":["writing.html","stories.html","archive.html"],
"engagement.html":["leadership.html","chem-squad.html","stories.html"],
"publication-cinema.html":["publications.html","films.html","figures.html"],
"moving-evidence.html":["methods-evidence.html","films.html","research.html"],
"cv.html":["publications.html","research.html","leadership.html"],
"reading-map.html":["research.html","stories.html","archive.html"],
"grants.html":["molecular-therapeutics.html","research.html","cv.html"],
"full-record.html":["reading-map.html","publications.html","research.html"]
};
let language="en",overlay=null,opener=null,allTriggers=[],selected=0;
const L=obj=>typeof obj==="string"?obj:(obj?.[language]||obj?.en||"");
const E=(tag,cls,value)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(value!==undefined)x.textContent=L(value);return x;};
const A=(target,label)=>{const a=E("a",null,label);a.href=target.startsWith("#")?target:"/"+target;return a;};
const key=()=>location.pathname.split("/").filter(Boolean).pop()||"index.html";
function close(){if(!overlay||overlay.hidden)return;overlay.hidden=true;allTriggers.forEach(b=>b.setAttribute("aria-expanded","false"));if(opener?.isConnected)opener.focus();}
function open(b){opener=b;overlay.hidden=false;allTriggers.forEach(x=>x.setAttribute("aria-expanded","true"));overlay.querySelector(".rx-atlas-close").focus();}
function trigger(title,klass){const b=E("button",klass,title);b.type="button";b.setAttribute("aria-controls","rx-atlas-overlay");b.setAttribute("aria-expanded","false");b.addEventListener("click",()=>open(b));allTriggers.push(b);return b;}
function currentSections(){
const main=document.querySelector("main");if(!main)return [];
return [...main.querySelectorAll("h2")].filter(h=>!h.closest("details:not([open]),.rx-atlas-home,.rx-atlas-afterword")).slice(0,8).map((h,i)=>{
let id=h.id||h.parentElement?.id||h.closest("section[id]")?.id;
if(!id){id="rx-atlas-heading-"+i;if(!document.getElementById(id))h.id=id;}
return {id,title:h.textContent.replace(/\s+/g," ").trim().slice(0,100)};
}).filter(x=>x.title);
}
function buildOverlay(){
overlay=E("div","rx-atlas-overlay");overlay.hidden=true;overlay.id="rx-atlas-overlay";overlay.dir=language==="ar"?"rtl":"ltr";
const shade=E("button","rx-atlas-shade");shade.type="button";shade.setAttribute("aria-label",L(T("Close index","إغلاق الفهرس")));shade.addEventListener("click",close);
const p=E("div","rx-atlas-panel");p.setAttribute("role","dialog");p.setAttribute("aria-modal","true");p.setAttribute("aria-labelledby","rx-atlas-dialog-title");
const head=E("div","rx-atlas-panel-head"),title=E("div");
title.append(E("span","rx-atlas-kicker",T("Ruwaidix / archive index","رويديكس / فهرس الأرشيف")));
const h=E("h2",null,T("Find your next question.","ابحث عن سؤالك التالي."));h.id="rx-atlas-dialog-title";title.append(h);
const x=E("button","rx-atlas-close","×");x.type="button";x.setAttribute("aria-label",L(T("Close","إغلاق")));x.addEventListener("click",close);
head.append(title,x);p.append(head,E("p","rx-atlas-drawer-intro",T("Follow any question through the experiment, source, film and human record. The complete original pages remain available.","تتبّع أي سؤال عبر التجربة والمصدر والفيلم والسجل الإنساني. جميع الصفحات الأصلية متاحة كاملة.")));
groups.forEach(([heading,arr])=>{
const section=E("section","rx-atlas-drawer-group");section.append(E("h3",null,heading));
const grid=E("div","rx-atlas-drawer-grid");
arr.forEach(k=>{const a=A(k,pages[k]);if(k===key())a.setAttribute("aria-current","page");a.append(E("span",null,"↗"));grid.append(a);});
section.append(grid);p.append(section);
});
if(key()!=="index.html"){const toc=currentSections();if(toc.length){
const section=E("section","rx-atlas-drawer-group");section.append(E("h3",null,T("On this page","في هذه الصفحة")));
const nav=E("nav","rx-atlas-toc");nav.setAttribute("aria-label",L(T("Sections of this page","أقسام هذه الصفحة")));
toc.forEach(item=>{const a=A("#"+encodeURIComponent(item.id),item.title);a.addEventListener("click",close);nav.append(a);});section.append(nav);p.append(section);
}}
p.addEventListener("keydown",ev=>{if(ev.key!=="Tab")return;const focus=[...p.querySelectorAll("button:not([disabled]),a[href]")].filter(el=>el.getClientRects().length);if(!focus.length)return;if(ev.shiftKey&&document.activeElement===focus[0]){ev.preventDefault();focus[focus.length-1].focus();}else if(!ev.shiftKey&&document.activeElement===focus[focus.length-1]){ev.preventDefault();focus[0].focus();}});
overlay.append(shade,p);document.body.append(overlay);
}
function drawTrack(panel,i){
selected=i;panel.replaceChildren();
const t=tracks[i];panel.append(E("span","rx-atlas-detail-top",T("A question across disciplines","سؤال عابر للتخصصات")),E("h3",null,t.q),E("p",null,t.d));
const links=E("div","rx-atlas-links");
t.links.forEach(([path,name],n)=>{const a=A(path,name);a.append(E("span",null,String(n+1).padStart(2,"0")+" ↗"));links.append(a);});panel.append(links);
[...document.querySelectorAll(".rx-atlas-choice button")].forEach((b,j)=>{b.setAttribute("aria-pressed",j===i?"true":"false");b.querySelector(".rx-atlas-indicator").textContent=j===i?"●":"↗";});
}
function buildHome(){
const portal=document.querySelector(".rx26-portal");if(!portal)return;
const section=E("section","rx-atlas-home");section.id="question-atlas";section.dir=language==="ar"?"rtl":"ltr";section.setAttribute("aria-labelledby","rx-atlas-title");
const wrap=E("div","rx-atlas-container"),top=E("div","rx-atlas-home-head"),left=E("div");
left.append(E("span","rx-atlas-kicker",T("The index of questions / 2026","فهرس الأسئلة / ٢٠٢٦")));
const title=E("h2");title.id="rx-atlas-title";title.append(document.createTextNode(L(T("The work is connected.","العمل مترابط."))),document.createElement("br"),E("em",null,T("Follow a question.","تتبّع سؤالاً.")));left.append(title);
top.append(left,E("p","rx-atlas-head-aside",T("An experiment can lead to a published paper, a figure, an original recording, a failed attempt or a personal story. Follow the connections without losing the complete archive.","قد تقود التجربة إلى منشور أو شكل علمي أو تسجيل أصلي أو محاولة لم تنجح أو حكاية شخصية. تتبّع الروابط دون فقدان الأرشيف الكامل.")));
const interact=E("div","rx-atlas-interact"),choices=E("div","rx-atlas-choice");
choices.setAttribute("role","group");choices.setAttribute("aria-label",L(T("Choose a question","اختر سؤالاً")));
choices.append(E("span","rx-atlas-choice-label",T("Choose a thread","اختر مساراً")));
const detail=E("div","rx-atlas-detail");detail.id="rx-atlas-detail";detail.setAttribute("aria-live","polite");
tracks.forEach((t,i)=>{const b=E("button");b.type="button";b.setAttribute("aria-pressed","false");b.setAttribute("aria-controls","rx-atlas-detail");b.append(E("span","rx-atlas-no",String(i+1).padStart(2,"0")));const text=E("span");text.append(E("span","rx-atlas-tabtitle",t.n),E("span","rx-atlas-tabsub",t.s));b.append(text,E("span","rx-atlas-indicator","↗"));b.addEventListener("click",()=>drawTrack(detail,i));choices.append(b);});
interact.append(choices,detail);
const foot=E("div","rx-atlas-foot");foot.append(E("span",null,T("Four paths into nine complete collections; nothing has been removed.","أربعة مسارات إلى تسع مجموعات كاملة، دون حذف.")),trigger(T("Browse the complete archive ↗","تصفّح الأرشيف كاملاً ↗")));
wrap.append(top,interact,foot);section.append(wrap);portal.insertAdjacentElement("beforebegin",section);drawTrack(detail,selected);
const more=document.querySelector(".rx-more-panel");if(more&&!more.querySelector('[href="#question-atlas"]'))more.prepend(A("#question-atlas",T("Interactive question atlas","أطلس الأسئلة التفاعلي")));
}
function buildSecondary(){
const k=key(),targets=related[k]||["research.html","publications.html","stories.html"],main=document.querySelector("main");if(!main)return;
const bar=E("nav","rx-atlas-bar");bar.setAttribute("aria-label",L(T("Explore connected work","استكشف الأعمال المترابطة")));
const inner=E("div","rx-atlas-bar-inner"),crumb=E("span","rx-atlas-bar-eyebrow",T("In the archive /","في الأرشيف /"));crumb.append(E("strong",null,pages[k]));
const nav=E("div","rx-atlas-bar-links");targets.slice(0,2).forEach(t=>nav.append(A(t,pages[t])));nav.append(trigger(T("Explore the index +","استكشف الفهرس +"),"rx-atlas-open"));
inner.append(crumb,nav);bar.append(inner);main.insertAdjacentElement("beforebegin",bar);
const after=E("section","rx-atlas-afterword"),body=E("div","rx-atlas-afterword-inner");
body.append(E("span","rx-atlas-kicker",T("Continue the investigation","أكمل الاستكشاف")),E("h2",null,T("One record leads to another.","كل سجل يقود إلى آخر.")),E("p",null,T("Move between primary research, evidence, documentary material and personal context without losing the full record.","انتقل بين الأبحاث الأصلية والأدلة والأفلام والسياق الشخصي مع بقاء السجل الكامل متاحاً.")));
const grid=E("nav","rx-atlas-afterword-grid");grid.setAttribute("aria-label",L(T("Related collections","مجموعات مرتبطة")));
targets.forEach((t,i)=>{const a=A(t,pages[t]);a.prepend(E("small",null,String(i+1).padStart(2,"0")+" / "+L(T("Continue","متابعة"))));grid.append(a);});
body.append(grid);after.append(body);main.insertAdjacentElement("afterend",after);
}
function render(){
if(overlay)overlay.remove();document.querySelectorAll(".rx-atlas-home,.rx-atlas-bar,.rx-atlas-afterword").forEach(el=>el.remove());
document.querySelector('.rx-more-panel > a[href="#question-atlas"]')?.remove();
allTriggers=[];opener=null;language=document.documentElement.lang.toLowerCase().startsWith("ar")?"ar":"en";
buildOverlay();if(key()==="index.html")buildHome();else buildSecondary();
}
function init(){
render();let prior=language;
const mo=new MutationObserver(()=>{const next=document.documentElement.lang.toLowerCase().startsWith("ar")?"ar":"en";if(next!==prior){prior=next;render();}});
mo.observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
document.addEventListener("keydown",e=>{if(e.key==="Escape")close();});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();