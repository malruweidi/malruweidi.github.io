/* Firsthand photo identifications supplied 11 October 2026.
   Archival material, not evidence of outcomes. Additive; no original content is removed. */
(function(){
"use strict";
const root=document.documentElement;
const page=root.dataset.rxPage||"";
const source="Personal photographic archive · identification supplied by Mahmoud Al-Ruweidi";
const photos=[
{id:"el-sayed-washington-2017",src:"/assets/2017-acs-el-sayed-group.webp",group:"People & ACS",title:"With Professor Mostafa El-Sayed at ACS 254",desc:"Ahmed Elgendy, Ali El-Sammak and I with Professor Mostafa El-Sayed during our 2017 visit to Washington, DC. A photograph from the scientific community around the Qatar University student chapter.",arTitle:"مع البروفيسور مصطفى السيد في واشنطن ٢٠١٧",arDesc:"أحمد الجندي وعلي السماك وأنا مع البروفيسور مصطفى السيد خلال زيارتنا إلى واشنطن عام ٢٠١٧، ضمن أنشطة الفصل الطلابي للجمعية الكيميائية الأمريكية.",alt:"Mahmoud Al-Ruweidi, Ahmed Elgendy and Ali El-Sammak with Professor Mostafa El-Sayed at a 2017 ACS gathering in Washington",when:"Washington, DC · 21 August 2017 (photo-library label)"},
{id:"heart-models",src:"https://cdn.creativeclaw.co/u/8a002dd8/images/057f4b1d-86a8-4731-99fd-af56bcf037c4.jpg",group:"Laboratory & making",title:"A heart in pieces",desc:"3D-printed anatomical heart components laid out on a laboratory bench.",arTitle:"قلب مطبوع على أجزاء",arDesc:"مكوّنات تشريحية لقلب مطبوعة ثلاثيًّا وموضوعة على طاولة مختبر.",alt:"White 3D-printed heart components and lab containers arranged on a dark bench",when:"Undated"},
{id:"acs-year-end",src:"https://cdn.creativeclaw.co/u/8a002dd8/images/b244ef22-3c3e-48ea-ac41-9c52bb9c34d1.jpg",group:"People & ACS",title:"The end of a semester, not of the conversation",desc:"My last day of the semester, closing a year of American Chemical Society student-chapter activities at Qatar University. The chapter mattered because science was something we did with other people.",arTitle:"نهاية فصل دراسي وبداية حديث آخر",arDesc:"اليوم الأخير من الفصل الدراسي واختتام عام من أنشطة الفصل الطلابي للجمعية الكيميائية الأمريكية في جامعة قطر. كانت قيمة الفصل في ممارسة العلم مع الآخرين.",alt:"Mahmoud beside the ACS Qatar University student chapter banner",when:"End-of-semester archive"},
{id:"washington-eclipse",src:"https://cdn.creativeclaw.co/u/8a002dd8/images/1ca69d9c-8914-41e0-985f-d6e208aa9a3a.png",group:"People & ACS",title:"Watching the 2017 eclipse with Ahmed Elgendy",desc:"Ahmed Elgendy and I watched the 2017 solar eclipse outside the Walter E. Washington Convention Center during the ACS visit to Washington, DC. An ordinary moment of shared curiosity between conference activities.",arTitle:"كسوف ٢٠١٧ مع أحمد الجندي",arDesc:"شاهدت كسوف الشمس عام ٢٠١٧ مع أحمد الجندي خارج مركز والتر واشنطن للمؤتمرات أثناء زيارة مرتبطة بالجمعية الكيميائية الأمريكية في واشنطن.",alt:"Mahmoud K. Al-Ruweidi and Ahmed Elgendy wearing eclipse glasses outside the Walter E. Washington Convention Center, shown in an ACS Qatar University Instagram archive screenshot",when:"Washington, DC · 2017",crop:"eclipse"},
{id:"visiting-professor",src:"https://cdn.creativeclaw.co/u/8a002dd8/images/ebfb8b46-0773-4a6e-afe2-1d23f049d62b.png",group:"People & ACS",title:"A conversation with Professor Sossina M. Haile",desc:"Helping host Professor Sossina M. Haile at Qatar University. She is Northwestern University's Walter P. Murphy Professor of Materials Science and Engineering, known for her research on solid-state ionics and electrochemical energy materials.",arTitle:"لقاء مع البروفيسورة سوسينا م. هايلي",arDesc:"أثناء المساعدة في استضافة البروفيسورة سوسينا م. هايلي في جامعة قطر، وهي أستاذة والتر بي. مورفي لعلوم وهندسة المواد في جامعة نورث وسترن، والمعروفة بأبحاثها في انتقال الأيونات في المواد الصلبة والمواد الكهروكيميائية للطاقة.",alt:"Scientific meeting around a table during Professor Sossina M. Haile's visit to Qatar University",when:"Qatar University · ACS chapter activities"},
{id:"acs-254",src:"https://cdn.creativeclaw.co/u/8a002dd8/images/4fcdb84c-e3bd-4940-b30f-042f5645da86.jpg",group:"People & ACS",title:"Taking the chapter to ACS 254",desc:"Presenting the Qatar University ACS student chapter's work at the 254th ACS National Meeting. Behind the poster was a group effort built over many ordinary meetings.",arTitle:"عرض نشاط الفصل الطلابي في اجتماع ACS 254",arDesc:"عرض أعمال الفصل الطلابي في جامعة قطر ضمن فعاليات الطلاب ومرحلة البكالوريوس في الاجتماع الوطني رقم ٢٥٤ للجمعية الكيميائية الأمريكية.",alt:"Group photograph in front of ACS Qatar University student chapter conference poster",when:"254th ACS National Meeting · 2017"},
{id:"natural-history",src:"https://cdn.creativeclaw.co/u/8a002dd8/images/39b68753-d633-4a96-813e-695ba79519e4.jpg",group:"Away from the bench",title:"The museum was never really a detour",desc:"Under a dinosaur skeleton at the American Museum of Natural History. There is a happily nerdy side of my curiosity that survives outside the laboratory, and I would not want it edited out.",arTitle:"لم تكن زيارة المتحف خروجاً عن العلم",arDesc:"أمام هيكل عظمي لديناصور في المتحف الأمريكي للتاريخ الطبيعي. للفضول العلمي جانب شخصي مرح يعيش خارج المختبر أيضاً.",alt:"Mahmoud standing beneath a dinosaur skeleton in a natural history museum",when:"New York · date unverified"},
{id:"copolymer-dialysis",src:"https://cdn.creativeclaw.co/u/8a002dd8/images/57b4c493-5da7-4aed-ab9b-3e67513bbd2a.jpg",group:"Laboratory & making",title:"A copolymer, a dialysis bag, and the less photogenic work",desc:"Handling a dialysis bag during our copolymer research. Preparative procedures are an important part of materials science, even when the final publication shows something much cleaner.",arTitle:"كيس الديلزة في بحث البوليمرات المشتركة",arDesc:"التعامل مع كيس ديلزة أثناء عملنا البحثي على البوليمرات المشتركة. خطوات التحضير جزء من البحث حتى عندما لا تظهر في الشكل النهائي المنشور.",alt:"Gloved hands holding a filled dialysis bag in a laboratory",when:"Copolymer research · date unverified"},
{id:"nature-seminar",src:"https://cdn.creativeclaw.co/u/8a002dd8/images/43bb8930-2532-49f1-876d-d7bbda03743f.jpg",group:"Words & argument",title:"Learning to write what an experiment means",desc:"At a Nature Masterclasses scientific-writing seminar at Hamad Bin Khalifa University. Scientific writing is part of the reasoning: the claim has to remain proportionate to the evidence.",arTitle:"تعلّم كتابة ما تعنيه التجربة",arDesc:"خلال ندوة في الكتابة العلمية من Nature Masterclasses بجامعة حمد بن خليفة. تتطلّب الكتابة العلمية أن يكون الادعاء متناسباً مع الدليل.",alt:"Lecture screen at a Nature Masterclasses scientific writing seminar",when:"Hamad Bin Khalifa University · date unverified"},
{id:"coffee-lab",src:"https://cdn.creativeclaw.co/u/8a002dd8/images/954455c9-a668-41c4-b88b-4d37ea3be59a.jpg",group:"Away from the bench",title:"Coffee, a laptop, and glassware",desc:"A small still life from the student years. There were days when coffee and laboratory glassware occupied the same bit of mental real estate.",arTitle:"قهوة وحاسوب وزجاجيات المختبر",arDesc:"تفصيل صغير من سنوات الدراسة، حين كانت القهوة والزجاجيات المخبرية في المشهد نفسه.",alt:"Blue sticker-covered HP laptop beside a small box of laboratory glassware and coffee",when:"University years · date unverified"},
{id:"qu-debate",src:"https://cdn.creativeclaw.co/u/8a002dd8/images/019879ba-4640-48a4-8d65-9b99fef70955.jpg",group:"Words & argument",title:"A different kind of hypothesis testing",desc:"Representing Qatar University in a debate-team round. Debate taught me to examine an argument in public, including arguments I was assigned rather than ones I personally held.",arTitle:"اختبار الأفكار خارج المختبر",arDesc:"أمثّل جامعة قطر في إحدى جولات المناظرة. منحتني المناظرات تمريناً على فحص الحجج علناً، بما فيها المواقف التي لا تعبّر بالضرورة عن رأيي الشخصي.",alt:"Archive social-media story of Mahmoud speaking at a Qatar University debate round",when:"Qatar University debate team · date unverified",crop:"debate"}
];
const ar=()=>root.lang==="ar";
function make(tag,cls,txt){const el=document.createElement(tag);if(cls)el.className=cls;if(txt!==undefined)el.textContent=txt;return el;}
function showTitle(p){return ar()?p.arTitle:p.title}
function showDesc(p){return ar()?p.arDesc:p.desc}
function picture(p,mode="card"){
 const figure=make("figure","rx-field-photo rx-field-picture-"+mode);figure.dataset.photo=p.id;
 const link=make("a","rx-field-frame");link.href=p.src;link.target="_blank";link.rel="noopener noreferrer";link.title=ar()?"افتح الصورة الأصلية":"Open original photograph";
 if(p.crop)link.dataset.crop=p.crop;
 const img=document.createElement("img");img.src=p.src;img.alt=p.alt;img.loading="lazy";img.decoding="async";link.appendChild(img);
 const caption=make("figcaption","rx-field-caption");
 const meta=make("span","rx-field-meta",ar()?"من الأرشيف الشخصي":p.group+" / "+p.when);
 const title=make("strong","rx-field-title",showTitle(p));
 const desc=make("p","rx-field-desc",showDesc(p));
 caption.append(meta,title,desc);figure.append(link,caption);
 return figure;
}
function section(id,kicker,title,desc,items,mode="cards"){
 const s=make("section","rx-field-section rx-field-"+mode);s.id=id;s.setAttribute("aria-label",title);
 const wrap=make("div","rx-field-wrap");
 const hd=make("div","rx-field-heading");
 hd.append(make("span","rx-field-kicker",kicker),make("h2",null,title),make("p","rx-field-intro",desc));
 const grid=make("div","rx-field-grid");items.forEach(p=>grid.append(picture(p)));
 wrap.append(hd,grid);s.append(wrap);return s;
}
function after(anchor,what){if(anchor)anchor.insertAdjacentElement("afterend",what);}
function beforeFooter(what){const main=document.querySelector("main");if(main)main.append(what);else{const footer=document.querySelector("footer");if(footer)footer.before(what);else document.body.append(what);}}
function ready(){
 if(!["home","archive","techniques","engagement"].includes(page))return;
 if(document.getElementById("rxFieldNotes2026"))return;
 const token=make("div");token.id="rxFieldNotes2026";token.hidden=true;document.body.append(token);
 const P=id=>photos.find(p=>p.id===id);
 if(page==="archive"){
   const s=section("rxFirsthandArchive",ar()?"إحدى عشرة صورة من الأرشيف":"Eleven photographs / firsthand identifications",ar()?"تفاصيل أخرى من حياة علمية":"The life around the experiments",ar()?"وجوه وأماكن من سنوات دراستي وعملي في الكيمياء: فعاليات طلابية وأصدقاء وعلماء زائرون وتجارب أولى ورحلات خارج المختبر.":"These photographs follow the people and places I encountered while studying and working in chemistry: student events, friends, visiting scientists, early experiments and journeys outside the laboratory.",[P("el-sayed-washington-2017"),P("acs-year-end"),P("acs-254"),P("visiting-professor"),P("washington-eclipse"),P("copolymer-dialysis"),P("heart-models"),P("coffee-lab"),P("nature-seminar"),P("qu-debate"),P("natural-history")],"archive");
   beforeFooter(s);
   const note=make("p","rx-field-source",ar()?"تُحفظ التفاصيل الإضافية والتواريخ في أوصاف الصور المرافقة.":"Additional photographic details and dates are recorded in the accompanying archival descriptions.");
   s.querySelector(".rx-field-wrap").append(note);
 }
 if(page==="home"){
   const qu=document.getElementById("quacs");
   if(qu){const s=section("rxChapterMoments",ar()?"من حياة الفصل الطلابي":"From the student chapter",ar()?"ما بقي بعد انتهاء الأنشطة":"The year ended. The conversations continued.",ar()?"كان العمل الجماعي أهم من الملصق والمؤتمر. بقيت منه تجارب وصداقات وأسئلة جديدة.":"A semester-ending photograph, a visiting researcher's conversation, and a student-chapter poster at ACS 254. What made these years important was the habit of showing up for science together.",[P("el-sayed-washington-2017"),P("acs-year-end"),P("visiting-professor"),P("acs-254")],"home");qu.append(s);}
   const story=document.getElementById("story");
   if(story){const feature=make("div","rx-field-story");feature.id="rxMuseumInterlude";const pic=picture(P("natural-history"),"story");const copy=make("div","rx-field-story-copy");copy.append(make("span","rx-field-kicker",ar()?"خارج المختبر":"Outside the laboratory"),make("h3",null,ar()?"الفضول لم يكن وظيفة.":"Curiosity was never a job description."),make("p",null,ar()?"كانت المتاحف والتاريخ الطبيعي جزءاً من المتعة نفسها التي دفعتني إلى دراسة الكيمياء والبيولوجيا.":"The trip to the natural history museum belongs in this story as much as the lab photographs. I have always liked the world before it was reduced to my research question."));feature.append(pic,copy);story.append(feature);}
 }
 if(page==="techniques"){
   const target=document.querySelector("#materials")||document.querySelector("#molecular")||document.querySelector("#biological");
   if(target){const s=section("rxTangibleMethods",ar()?"من أرشيف المختبر":"From the experimental archive",ar()?"البحث كما يبدو أثناء العمل":"What the work actually looked like",ar()?"نماذج قلب مطبوعة ثلاثيّاً وخطوات تحضير في بحث البوليمرات المشتركة. صورتان للعمل التجريبي، لا ادعاء بنتائج لم تُنشر.":"3D-printed cardiac components and a dialysis-bag preparation from copolymer research. They show fabrication and bench practice without being mistaken for results.",[P("heart-models"),P("copolymer-dialysis")],"methods");target.append(s);}
 }
 if(page==="engagement"){
   const s=section("rxMeetingsAndArguments",ar()?"المجتمع العلمي والنقاش":"Meetings, ideas and arguments",ar()?"العلم ليس محصوراً في المختبر":"Not every scientific lesson happened at the bench",ar()?"من تقديم أعمال الفصل الطلابي في مؤتمر ACS إلى المشاركة في المناظرات ودروس الكتابة العلمية.":"A solar eclipse outside an ACS conference, a chapter presentation, a writing seminar, and university debate. They belong together because research also depends on how we meet, write and argue.",[P("el-sayed-washington-2017"),P("acs-254"),P("washington-eclipse"),P("nature-seminar"),P("qu-debate")],"engagement");beforeFooter(s);
 }
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",ready,{once:true});else ready();
})();