/* Author-described archival photograph, 2016; Instagram post date not authenticated as capture date. */
(function websiteModule(){
"use strict";
const imageURL="https://videocdn.pollo.ai/web-cdn/pollo/production/cmc17cmjy1f0ob29adcyrx0ks/image/1791823763942-aeb88fd6-4cd4-47c0-bcd4-6c3e998f3889.webp";
const title="A title I had not yet earned";
const titleAr="لقب لم أكن قد حصلت عليه بعد";
const alt="A white lab coat embroidered 'Prof. Mahmoud El-Ruweidi' beside a quantitative chemical analysis textbook, glasses and a case";
const en="In the semester following my withdrawal from university, I was trying to return to my studies while living with a difficult gastrointestinal illness. I embroidered 'Prof. Mahmoud El-Ruweidi' on my lab coat not because I held that title, but because I wanted to imagine a future in science. Doctors had used the term eosinophilic gastritis for my illness; the precise classification of all my symptoms remains uncertain. Adrenal insufficiency was recognized later.";
const ar="في الفصل الدراسي الذي أعقب انسحابي من الجامعة، كنت أحاول العودة إلى الدراسة وسط معاناة مع مرض شديد في الجهاز الهضمي. طبعت على معطفي المخبري عبارة «Prof. Mahmoud El-Ruweidi»، لا لأنني كنت أحمل لقب أستاذ، بل لأتخيل مستقبلاً أرجو أن أصل إليه في العلم. استخدم الأطباء حينها وصف «التهاب المعدة اليوزيني»، لكن التصنيف الدقيق لجميع الأعراض والحالات التي مررت بها ما زال غير محسوم. وقد تبيّن وجود قصور في الغدة الكظرية في مرحلة لاحقة.";
const originEn="Instagram post: 14 February 2016. This dates the post, not necessarily when the photograph was taken. The explanation is the author's firsthand account, recorded 12 October 2026.";
const originAr="نُشرت الصورة على إنستغرام في ١٤ فبراير ٢٠١٦؛ وهو تاريخ النشر، وليس بالضرورة تاريخ الالتقاط. يستند تفسيرها إلى رواية صاحبها بتاريخ ١٢ أكتوبر ٢٠٢٦.";
const make=(tag,cls,content)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(content!==undefined)n.textContent=content;return n;};
const img=()=>{const i=make("img");i.src=imageURL;i.alt=alt;i.loading="lazy";i.decoding="async";i.width=750;i.height=675;return i;};
const p=(lang,value)=>make("p",lang,value);
function archive(){
 if(document.getElementById("labcoat-2016"))return;
 const reference=document.querySelector(".timeline");
 const s=make("section","rx-labcoat2016");s.id="labcoat-2016";
 const inner=make("div","rx-labcoat2016-inner");
 const f=make("figure","rx-labcoat2016-photo");f.append(img());
 const caption=make("figcaption","rx-labcoat2016-source");caption.append(p("en",originEn),p("ar",originAr));f.append(caption);
 const t=make("div","rx-labcoat2016-text");
 t.append(make("p","rx-labcoat2016-eyebrow en","FROM THE PERSONAL ARCHIVE / 14 FEB 2016"),make("p","rx-labcoat2016-eyebrow ar","من الأرشيف الشخصي / ١٤ فبراير ٢٠١٦"));
 t.append(make("h2","en",title),make("h2","ar",titleAr),p("en",en),p("ar",ar));
 const link=make("a","rx-labcoat2016-link","Illness, evidence, and the making of a scientist ↗");link.href="illness-and-evidence.html#labcoat-2016-memory";t.append(link);
 inner.append(f,t);s.append(inner);
 if(reference)reference.after(s);else (document.querySelector("main")||document.body).append(s);
 const timeline=document.querySelector(".timeline-grid");if(timeline){
 const a=make("a");a.href="#labcoat-2016";a.append(make("b",null,"2016"),make("span","en","An embroidered title as motivation while returning to study after illness-related withdrawal."),make("span","ar","لقب طُرز على معطف مخبري تشجيعاً على العودة للدراسة بعد الانسحاب."));
 const entries=timeline.querySelectorAll("a");if(entries.length>1)entries[1].before(a);else timeline.append(a);
 }
}
function essay(){
 if(document.getElementById("labcoat-2016-memory"))return;
 const exam=document.querySelector("#education figure.exam-archive");if(!exam)return;
 const f=make("figure","exam-archive rx-labcoat2016-essay");f.id="labcoat-2016-memory";
 const a=make("a");a.href=imageURL;a.target="_blank";a.rel="noopener noreferrer";a.setAttribute("aria-label","View lab coat posted on 14 February 2016");a.append(img());f.append(a);
 const c=make("figcaption");c.append(make("strong","en","14 February 2016 · A title for the future"),make("strong","ar","١٤ فبراير ٢٠١٦ · لقب للمستقبل"));
 c.append(p("en",en),p("ar",ar),make("small","en",originEn),make("small","ar",originAr));f.append(c);exam.before(f);
}
function styles(){
 if(document.getElementById("rxLabcoat2016Style"))return;
const st=make("style");st.id="rxLabcoat2016Style";
st.textContent=`
.rx-labcoat2016{background:#e9eee7;color:#183d3b;padding:58px 0 75px;scroll-margin-top:80px}
.rx-labcoat2016-inner{max-width:1150px;width:calc(100% - 44px);margin:auto;display:grid;grid-template-columns:minmax(250px,.9fr) minmax(300px,1.1fr);gap:clamp(26px,5vw,80px);align-items:center}
.rx-labcoat2016-photo{margin:0}.rx-labcoat2016-photo img{width:100%;height:auto;max-height:485px;object-fit:contain;display:block;background:#d9ddd4;box-shadow:0 18px 42px rgba(26,45,40,.15)}
.rx-labcoat2016-source{font:11px/1.55 system-ui,sans-serif;color:#51625d;margin-top:12px}
.rx-labcoat2016-eyebrow{font:600 11px/1.3 system-ui,sans-serif;letter-spacing:.13em;color:#9c644b}
.rx-labcoat2016-text h2{font:400 clamp(31px,4vw,50px)/1.12 Georgia,serif;margin:12px 0 20px}
.rx-labcoat2016-text>p:not(.rx-labcoat2016-eyebrow){font:16px/1.83 system-ui,sans-serif}
.rx-labcoat2016-link{display:inline-block;margin-top:13px;color:#9c644b;font-weight:600;text-underline-offset:4px}
.rx-labcoat2016-essay{scroll-margin-top:100px}
.rx-labcoat2016-essay img{object-fit:cover;object-position:center;width:100%;max-height:430px}
.rx-labcoat2016-essay small{display:block;color:#6d7774;margin-top:9px}
html[lang="ar"] .rx-labcoat2016 .en,html[lang="ar"] .rx-labcoat2016-essay .en{display:none}
html:not([lang="ar"]) .rx-labcoat2016 .ar,html:not([lang="ar"]) .rx-labcoat2016-essay .ar{display:none}
@media(max-width:700px){.rx-labcoat2016-inner{grid-template-columns:1fr}.rx-labcoat2016-photo img{max-height:410px}.rx-labcoat2016{padding:34px 0 48px}.rx-labcoat2016-essay{grid-template-columns:1fr}}
`;document.head.append(st);}
function init(){const page=document.documentElement.getAttribute("data-rx-page");if(page!=="archive"&&page!=="illness-evidence")return;styles();if(page==="archive")archive();if(page==="illness-evidence")essay();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
