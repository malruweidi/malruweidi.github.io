/* Owner-identified October 13, 2026 media. Additive and media-existence checked. */
(()=>{'use strict';
const DIR='/assets/owner-archive-2026-10-13/';
const data=[
 {id:'library',file:'library-lab-coat-cold.webp',group:'early',title:['A lab coat in the library','معطف المختبر في المكتبة'],alt:['Mahmoud in a library wearing a white lab coat','محمود في المكتبة مرتديًا معطف المختبر'],cap:['The library was cold. I was wearing the coat for warmth, not doing an experiment in shorts.','كان التكييف باردًا فارتديت المعطف لأتدفأ. لم أكن أجري تجربة في المختبر مرتديًا سروالًا قصيرًا.']},
 {id:'chem101',file:'first-chem101-lab-visit.webp',group:'early',title:['Back to Chemistry 101','العودة إلى مختبر الكيمياء ١٠١'],alt:['Mahmoud smiling in a teaching laboratory wearing gloves','محمود يبتسم في مختبر تعليمي وهو يرتدي قفازين'],cap:['A return visit to the classroom where I took my first Chemistry 101 laboratory. The photograph does not identify an experiment underway.','زيارة لاحقة إلى قاعة أول مختبر درست فيه الكيمياء ١٠١. لا تحدد الصورة تجربة بعينها.']},
 {id:'graduation',file:'high-school-graduation.webp',group:'early',title:['High-school graduation','التخرج من الثانوية'],alt:['Three graduates wearing ceremonial gowns in a group photograph','ثلاثة خريجين يرتدون أزياء التخرج في صورة جماعية'],cap:['My high-school graduation. The identities of the other graduates and the exact photograph date are unverified.','ذكرى تخرجي من المدرسة الثانوية. لم يُتحقَّق من أسماء الزميلين أو تاريخ الصورة بدقة.']},
 {id:'school',file:'return-to-early-school.webp',group:'early',title:['A return to the old school','زيارة إلى المدرسة القديمة'],alt:['Three adults at the entrance to a former school, with an infant face obscured for privacy','ثلاثة بالغين عند مدخل مدرسة قديمة بعد حجب ملامح طفل حفاظًا على خصوصيته'],cap:['Returning to the school I attended from kindergarten through primary and preparatory education. This is a later visit, not a childhood photograph.','عدت إلى المدرسة التي درست فيها بالروضة والمرحلتين الابتدائية والإعدادية. هذه صورة من زيارة لاحقة وليست من طفولتي.']},
 {id:'thakhira',file:'al-thakhira-research-judging.webp',group:'service',title:['Student research in Al Thakhira','البحث الطلابي في الذخيرة'],alt:['Audience at a student scientific research and innovation event in Al Thakhira','حضور فعالية للبحث العلمي والابتكار الطلابي في الذخيرة'],cap:['The Al Thakhira event where I served as a research judge. The photograph shows the venue, not the act of judging a particular project.','فعالية الذخيرة التي شاركت فيها محكّمًا لأبحاث الطلاب. تُظهر الصورة الحضور ولا توثق عملية تحكيم مشروع بعينه.']},
 {id:'hbku',file:'hbku-research-visit.webp',group:'instruments',title:['A research visit to HBKU','زيارة بحثية إلى جامعة حمد بن خليفة'],alt:['Mahmoud at a research facility with pipework and technical apparatus behind him','محمود أمام أنابيب وتجهيزات فنية في منشأة بحثية'],cap:['Photographed during a research visit to Hamad Bin Khalifa University. The apparatus has not been independently identified; a visit is not proof of employment or publication there.','صورة من زيارة بحثية لجامعة حمد بن خليفة. لم تُحدَّد الأجهزة تحديدًا مستقلًا، والزيارة لا تثبت عملًا وظيفيًا أو بحثًا منشورًا هناك.']},
 {id:'membrane',file:'sterlitech-ro-nf-membrane-setup.webp',group:'instruments',title:['Reverse osmosis and nanofiltration','التناضح العكسي والترشيح النانوي'],alt:['Sterlitech filtration apparatus, tubes, clamps and a laboratory beaker','جهاز ترشيح من ستيرليتك مع أنابيب ومشابك وكأس زجاجية'],cap:['A Sterlitech apparatus from work involving reverse osmosis and nanofiltration. This is equipment documentation, not a membrane-performance measurement.','جهاز من ستيرليتك في سياق عمل بالتناضح العكسي والترشيح النانوي. توثيق للجهاز لا لنتيجة قياس أداء الغشاء.']},
 {id:'khaled',file:'khaled-jama-thesis-reaction.mp4',poster:'khaled-jama-thesis-reaction-poster.webp',group:'chem',video:true,title:['Khaled explains his reaction','خالد يشرح تفاعله الكيميائي'],alt:['Khaled Jama Mohamoud presenting and explaining a chemistry reaction associated with his thesis','خالد جامع محمود يعرض ويشرح تفاعلًا كيميائيًا متعلقًا بأطروحته'],cap:['A short recording of Khaled Jama Mohamoud explaining a reaction associated with his thesis. It documents the presentation, not the independent confirmation of a chemical mechanism.','تسجيل قصير لخالد جامع محمود يشرح تفاعلًا مرتبطًا بأطروحته. يوثق المقطع العرض ولا يمثل تأكيدًا مستقلًا لآلية التفاعل.']}
,
 {id:'ramadan-room',file:'ramadan-microscopy-room.webp',group:'ramadan',title:['The room after iftar','غرفة المجهر بعد الإفطار'],alt:['A microscope and workstation in the room associated with Mahmoud’s Ramadan zebrafish research sessions','مجهر ومكان عمل في غرفة مرتبطة بجلسات محمود البحثية في رمضان'],cap:['The actual owner-identified microscope-room photograph associated with the Ramadan research memory. It is not a documented imaging result or independent proof of that evening’s protocol.','الصورة الأصلية التي حددها صاحب الأرشيف لغرفة المجهر المرتبطة بذكرياته عن البحث في رمضان؛ لا تثبت بمفردها نتيجة تصوير أو بروتوكول تلك الليلة.']},
];
const ar=()=>document.documentElement.lang.toLowerCase().startsWith('ar');
const node=(tag,cls)=>{const el=document.createElement(tag);if(cls)el.className=cls;return el};
const t=(el,txt)=>{el.dataset.rx13En=txt[0];el.dataset.rx13Ar=txt[1];el.textContent=ar()?txt[1]:txt[0];return el};
const p=txt=>t(node('p'),txt);
const exists=async f=>{try{const res=await fetch(DIR+f,{method:'HEAD'});return res.ok}catch(e){return false}};
function figure(r){
 const f=node('figure','rx13-figure');let m;
 if(r.video){m=node('video','rx13-video');m.controls=true;m.preload='metadata';m.playsInline=true;m.poster=DIR+r.poster;m.setAttribute('aria-label',ar()?r.alt[1]:r.alt[0]);const src=node('source');src.src=DIR+r.file;src.type='video/mp4';m.append(src)}
 else{m=node('img','rx13-image');m.src=DIR+r.file;m.alt=ar()?r.alt[1]:r.alt[0];m.loading='lazy';m.decoding='async'}
 const caption=node('figcaption');caption.append(t(node('strong'),r.title),p(r.cap));f.append(m,caption);return f
}
function gallery(xs){const g=node('div','rx13-gallery');for(const r of xs)g.append(figure(r));return g}
function heading(kicker,title,description){const w=node('div','rx13-heading');w.append(t(node('span','rx13-kicker'),kicker),t(node('h2'),title),p(description));return w}
function buildSection(id,cls,kicker,title,description,entries){
 if(!entries.length||document.getElementById(id))return null;
 const s=node('section','rx13-section '+cls);s.id=id;
 const inner=node('div','rx13-container');inner.append(heading(kicker,title,description),gallery(entries));s.append(inner);return s
}
function updateLanguage(){for(const el of document.querySelectorAll('[data-rx13-en]'))el.textContent=ar()?el.dataset.rx13Ar:el.dataset.rx13En;for(const r of data){for(const img of document.querySelectorAll('.rx13-image')){if(img.src.endsWith('/'+r.file))img.alt=ar()?r.alt[1]:r.alt[0]}}}
async function init(){
 const page=document.documentElement.dataset.rxPage||'';
 if(!['stories','archive','engagement','chem-squad'].includes(page))return;
 const css=node('link');css.rel='stylesheet';css.href='/assets/owner-archive-2026-10-13.css';document.head.append(css);
 const relevant=data.filter(r=>page==='archive'||(page==='stories'&&(r.group==='early'||r.group==='instruments'||r.group==='ramadan'))||(page==='engagement'&&r.group==='service')||(page==='chem-squad'&&r.group==='chem'));
 const checks=await Promise.all(relevant.map(async r=>await exists(r.file)?r:null));const found=checks.filter(Boolean);
 if(!found.length)return;
 if(page==='stories'){
  const early=found.filter(r=>r.group==='early');const anatomy=document.getElementById('anatomy');
  if(anatomy&&early.length){
   const sec=buildSection('rx13SchoolAndChemistry','rx13-story',
    ['EARLY CLASSROOMS / AN INTERLUDE','صفحات الدراسة الأولى'],
    ['The classrooms I came back to.','الصفوف التي عدت إليها.'],
    ['School graduation, a first Chemistry 101 laboratory, a visit to an old school, and a white coat worn because the library was cold. There is more to the early years than a straight line of academic milestones.','صور التخرج وأول مختبر للكيمياء وزيارة المدرسة القديمة ومعطف المختبر الذي ارتديته لأن المكتبة كانت باردة. لا تختزل هذه السنوات في تسلسل مرتب من الشهادات والإنجازات.'],early);
   sec?.querySelector('.rx13-heading')?.append(p(['The shorts were for the library, not the laboratory. There was no extraordinary experiment behind that photograph.','كان السروال القصير للمكتبة لا للمختبر؛ لم تكن وراء تلك الصورة تجربة خارقة كما قد توحي بعض الحكايات.']));
   if(sec)anatomy.insertAdjacentElement('afterend',sec)
  }
  const ramadan=found.filter(r=>r.group==='ramadan');const ramadanTarget=document.querySelector('#ramadan-atvb .stories-chapter-text');
  if(ramadanTarget&&ramadan.length){const sec=buildSection('rx13OriginalRamadanMicroscope','rx13-within-story',['RAMADAN / ORIGINAL ROOM PHOTOGRAPH','رمضان / صورة غرفة المجهر الأصلية'],['The room I returned to.','الغرفة التي عدت إليها.'],['The photograph records the microscope room, while the associated events are a first-person recollection. The camera did not document the date or experimental outcome.','توثق الصورة غرفة المجهر، أما وقائع ذلك المساء فمستمدة من الذاكرة الشخصية، ولا تحدد الصورة تاريخ العمل أو نتيجته.'],ramadan);if(sec){const cite=ramadanTarget.querySelector('.stories-source');if(cite)cite.before(sec);else ramadanTarget.append(sec)}}
  const inst=found.filter(r=>r.group==='instruments');const target=document.querySelector('#research-apparatus .stories-chapter-text');
  if(target&&inst.length){const sec=buildSection('rx13ResearchVisits','rx13-within-story',['RESEARCH VISITS / INSTRUMENTATION','زيارات بحثية / أجهزة'],['Visits, membranes and evidence.','الزيارات والأغشية وحدود الدليل.'],['The HBKU visit and membrane filtration setup belong among the apparatus photographs. Neither image establishes the output of an experiment.','مكان صورة زيارة جامعة حمد بن خليفة وجهاز ترشيح الأغشية هو سجل الأجهزة والزيارات البحثية، لا خانة النتائج التجريبية.'],inst);if(sec){const cite=target.querySelector('.stories-source');if(cite)cite.before(sec);else target.append(sec)}}
 }
 if(page==='archive'){
  const sec=buildSection('rx13ArchiveSet','rx13-archive',['PERSONAL ARCHIVE / 2026 INTAKE','أرشيف شخصي / مواد أضيفت عام ٢٠٢٦'],['The rooms, people and apparatus.','الأمكنة والناس والأجهزة.'],['The photograph identifications come from the archive owner. Exact capture dates are not independently authenticated and no experiment outcome is inferred from these images.','تعريف مناسبات الصور مستمد من صاحب الأرشيف. لم تُوثّق تواريخ التصوير بدقة ولم تستنبط منها نتائج تجريبية.'],found);
  document.querySelector('footer')?.before(sec)
 }
 if(page==='engagement'){
  const sec=buildSection('rx13AlThakhira','rx13-engagement',['SCIENTIFIC SERVICE','الخدمة العلمية'],['Judging student research at Al Thakhira.','تحكيم أبحاث الطلاب في الذخيرة.'],['A scene from the student scientific research and innovation event at Al Thakhira, where I served as a judge.','مشهد من فعالية البحث العلمي والابتكار الطلابي في الذخيرة التي شاركت فيها محكّمًا.'],found);document.querySelector('main')?.append(sec)
 }
 if(page==='chem-squad'){
  const sec=buildSection('rx13KhaledPresentation','rx13-chem',['CHEM SQUAD / THESIS DISCUSSIONS','فريق الكيمياء / مناقشات الأطروحات'],['When a reaction is explained aloud.','حين يُشرح التفاعل بصوت صاحبه.'],['Khaled Jama Mohamoud presenting a thesis-related chemistry reaction. Scientific conversations are part of the group’s history, not merely photographs of its members.','خالد جامع محمود يقدم شرحًا لتفاعل كيميائي متعلق بأطروحته. المناقشات العلمية جزء من تاريخ المجموعة، مثلها مثل صور أعضائها.'],found);document.querySelector('main')?.append(sec)
 }
 const mo=new MutationObserver(updateLanguage);mo.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();