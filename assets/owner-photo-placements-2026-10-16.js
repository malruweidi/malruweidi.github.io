/* Ruwaidix / owner-identified photographs, 16 Oct 2026.
   Non-destructive placements within existing editorial pages.
   Display dates visible in phone screenshots are not treated as capture dates. */
(()=>{
  'use strict';
  const root = document.documentElement;
  const page = root.dataset.rxPage || '';
  const base = '/assets/owner-archive-2026-10-16/';
  const ownerNote = {
    en:'Image supplied and identified by the archive owner. Original capture date not independently established.',
    ar:'الصورة وتحديد موضوعها من الأرشيف الشخصي، ولم يُتحقق بصورة مستقلة من تاريخ التقاطها.'
  };
  const records = {
    extracts:{file:'chem-squad-lab-medicinal-plant-extracts.webp',alt:'An archival chemistry laboratory workbench with glassware and extraction-related apparatus',title:{en:'The bench, before the finished ideas',ar:'منضدة المختبر قبل اكتمال الأفكار'},caption:{en:'The laboratory environment associated with Chem Squad’s early interest in natural products and extracts from medicinal plants. The photograph does not, on its own, identify the individual extraction procedure.',ar:'مشهد من بيئة المختبر المرتبطة باهتمام مجموعة كيم سكواد المبكر بالمواد الطبيعية ومستخلصات النباتات الطبية. لا تحدد الصورة وحدها طريقة الاستخلاص التي كانت تُجرى.'}},
    elgendy:{file:'chem-squad-elgendy-asleep-selfie.webp',alt:'Mahmoud taking a photograph while Ahmed Elgendy sleeps with his head on a chair',title:{en:'I took the picture. Ahmed slept.',ar:'كنت ألتقط الصورة، وكان أحمد نائمًا'},caption:{en:'A small contrast from the Chem Squad years: I was still taking pictures while Ahmed Elgendy caught some sleep. Not every photograph in a chemist’s archive has to be about chemistry.',ar:'لقطة طريفة من سنوات كيم سكواد: كنت ألتقط الصور بينما كان أحمد الجندي نائمًا. ليست كل صورة في أرشيف الكيميائي عن الكيمياء.'}},
    fifa:{file:'chem-squad-rakan-winter-fifa.webp',alt:'Mahmoud and Rakan Al-Zu’Bi seated in a winter tent with game controllers, playing FIFA',title:{en:'Winter break in the tent, with Rakan',ar:'إجازة الشتاء في الخيمة مع راكان'},caption:{en:'Rakan Al-Zu’Bi and I playing FIFA during winter break. Our friendship also had an ordinary life away from the laboratory.',ar:'أنا وراكان الزعبي نلعب فيفا في الخيمة خلال إجازة الشتاء. كانت للصداقة حياة يومية خارج المختبر.'}},
    ramadan:{file:'chemistry-ramadan-group-gathering.webp',alt:'Group of chemistry friends gathered together during Ramadan',title:{en:'Chemistry friends, Ramadan gathering',ar:'لقاء رمضان مع أصدقاء الكيمياء'},caption:{en:'A gathering of chemistry friends during Ramadan, part of the continuing social life of the community. The photograph is not assigned an unverified year.',ar:'لقاء رمضاني جمع أصدقاء الكيمياء، من الحياة الاجتماعية المستمرة لهذه المجموعة. لا تُنسب الصورة إلى سنة غير مؤكدة.'}},
    acs:{file:'acs-orange-balloon-portrait.webp',alt:'Mahmoud Al-Ruweidi wearing a suit and tie beside an orange American Chemical Society balloon',title:{en:'With the ACS balloon',ar:'مع بالون الجمعية الكيميائية الأمريكية'},caption:{en:'A personal photograph from the American Chemical Society chapter years. The balloon is a small reminder of the student chemistry community we worked to build.',ar:'صورة شخصية من سنوات أنشطة الجمعية الكيميائية الأمريكية؛ يذكّرني البالون بمجتمع الكيمياء الطلابي الذي شاركت في بنائه.'}},
    yce:{file:'yce-youth-event-podium-2013.webp',alt:'Mahmoud speaking at a podium during a Youth Change Everything event in 2013',title:{en:'Youth Change Everything / 2013',ar:'الشباب يغيّر كل شيء / ٢٠١٣'},caption:{en:'Working on the management of a 2013 Youth Change Everything (YCE) event, photographed at the lectern. The event and role are identified from my personal archive.',ar:'ضمن عملي في إدارة إحدى فعاليات مؤتمر «الشباب يغيّر كل شيء» عام ٢٠١٣، والصورة أثناء الحديث على المنصة. تحديد الحدث والدور من أرشيفي الشخصي.'}},
    run:{file:'run-the-world-youth-festival-2013.webp',alt:'Mahmoud aged eighteen at a 2013 youth festival in front of Youth Got Talent signs',title:{en:'Run the World Festival, age eighteen',ar:'مهرجان Run the World في الثامنة عشرة'},caption:{en:'In 2013, at eighteen, I worked as a manager for the Run the World Festival. It belonged to my early work in youth engagement and empowerment, years before I held any formal research title.',ar:'عام ٢٠١٣، وأنا في الثامنة عشرة، عملت مديرًا لفعالية مهرجان Run the World. كانت من تجاربي المبكرة في العمل الشبابي وتمكين الشباب قبل أي مسمى مهني في البحث العلمي.'}},
    chick:{file:'chick-embryo-heart-observation.webp',alt:'Opened chick egg preparation showing the developing chick embryo and visible blood vessels',title:{en:'A chick embryo and its developing heart',ar:'قلب جنين الدجاج أثناء التطور'},caption:{en:'An embryology observation in an opened egg preparation. The developing vascular structures are visible; the exact developmental stage and experimental conditions are not established from this image.',ar:'ملاحظة جنينية في بيضة مفتوحة تظهر فيها الأوعية الدموية النامية. لا تسمح الصورة وحدها بتحديد مرحلة التطور الدقيقة أو ظروف التجربة.'}},
    cells:{file:'cell-culture-flask-archive.webp',alt:'Transparent laboratory cell-culture flask with pink culture medium and handwritten labeling',title:{en:'Cell culture, in the everyday record',ar:'زراعة الخلايا ضمن السجل اليومي'},caption:{en:'A cell-culture flask from the laboratory archive. The label remains visible as photographed, but no cell identity, treatment or result is inferred from it.',ar:'دورق لزراعة الخلايا من أرشيف المختبر، وقد أبقيت الكتابة الموجودة عليه كما ظهرت في الصورة دون استنتاج نوع الخلايا أو المعالجة أو النتائج.'}},
    doctor:{file:'eosinophilic-diagnosis-dr-elsheikh-abdelrahim.webp',alt:'Mahmoud with Dr. Elsheikh Abdelrahim, wearing a white coat and stethoscope, during the early eosinophilic gastroenteritis years',title:{en:'With Dr. Elsheikh Abdelrahim',ar:'مع الدكتور الشيخ عبد الرحيم'},caption:{en:'With Dr. Elsheikh Abdelrahim, who was a resident doctor when my eosinophilic gastroenteritis was first detected. He later went into cardiology. This photograph belongs to the personal history of that diagnosis, not to a clinical case report.',ar:'مع الدكتور الشيخ عبد الرحيم، الذي كان طبيبًا مقيمًا عند اكتشاف التهاب المعدة والأمعاء اليوزيني لديّ لأول مرة، ثم اتجه لاحقًا إلى طب القلب. هذه صورة من تاريخ تجربتي مع المرض وليست تقرير حالة سريرية.'}}
  };
  const L=v=>typeof v==='string'?v:(root.lang==='ar'?v.ar:v.en);
  const tag=(name,cl,txt)=>{const el=document.createElement(name);if(cl)el.className=cl;if(txt!==undefined)el.textContent=L(txt);if(typeof txt==='object'){el.dataset.rx16En=txt.en;el.dataset.rx16Ar=txt.ar;}return el};
  function figure(id){
    const p=records[id], f=tag('figure','rx16-photo');
    const link=tag('a','rx16-media');link.href=base+p.file;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label','Open archival photograph: '+p.alt);
    const img=tag('img');img.src=base+p.file;img.alt=p.alt;img.loading='lazy';img.decoding='async';link.append(img);
    const caption=tag('figcaption','rx16-copy');caption.append(tag('strong','rx16-title',p.title),tag('span','rx16-description',p.caption));
    if(id==='doctor'){
      const doctorLink=tag('a','rx16-source-link',{en:'Dr. Elsheikh Abdelrahim · professional profile ↗',ar:'الدكتور الشيخ عبد الرحيم · ملفه المهني ↗'});
      doctorLink.href='https://www.linkedin.com/in/elsheikh-abdelrahim-54327322a';doctorLink.target='_blank';doctorLink.rel='noopener noreferrer';caption.append(doctorLink);
    }
    caption.append(tag('small','rx16-provenance',ownerNote));f.append(link,caption);return f;
  }
  function group(id,opts,photoIds){
    const sec=tag('section','rx16-fieldnote');sec.id=id;sec.setAttribute('aria-label',L(opts.label));
    const heading=tag('div','rx16-heading');heading.append(tag('span','rx16-kicker',opts.kicker),tag('h3','rx16-heading-title',opts.label));
    if(opts.description)heading.append(tag('p','rx16-heading-description',opts.description));sec.append(heading);
    const grid=tag('div','rx16-grid '+(photoIds.length===1?'rx16-single':''));photoIds.forEach(x=>grid.append(figure(x)));sec.append(grid);return sec;
  }
  const insertAfter=(selector,item)=>{const p=document.querySelector(selector);if(p)p.after(item);};
  const append=(selector,item)=>{const p=document.querySelector(selector);if(p)p.append(item);};
  const createContainer=(cls,section)=>{const outer=tag('section','rx16-band');const c=tag('div',cls);c.append(section);outer.append(c);return outer;};
  function place(){
    const css=document.createElement('link');css.rel='stylesheet';css.href='/assets/owner-photo-placements-2026-10-16.css?v=1';document.head.append(css);
    if(page==='chem-squad'){
      append('#origin .wrap',group('rx16-chem-extraction',{kicker:{en:'CHEM SQUAD / THE LABORATORY',ar:'كيم سكواد / المختبر'},label:{en:'The extraction years.',ar:'سنوات الاستخلاص'},description:{en:'A photographic note beside the story of the first organic chemistry discussions.',ar:'ملاحظة مصوّرة بجوار قصة نقاشات الكيمياء العضوية الأولى.'}},['extracts']));
      insertAfter('#weekly',createContainer('wrap',group('rx16-chem-life',{kicker:{en:'CHEM SQUAD / THE LIFE AROUND IT',ar:'كيم سكواد / ما بين اللقاءات'},label:{en:'Away from the bench.',ar:'بعيدًا عن منضدة المختبر'},description:{en:'The photographs also record friendships, games and time together.',ar:'تحتفظ الصور أيضًا بذكريات الصداقة والألعاب واللقاءات.'}},['elgendy','fifa','ramadan'])));
    } else if(page==='engagement'){
      append('#acs-2019 article',group('rx16-acs-balloon',{kicker:{en:'ACS / PERSONAL ARCHIVE',ar:'الجمعية الكيميائية الأمريكية / أرشيف شخصي'},label:{en:'One photograph from those years.',ar:'صورة من تلك السنوات'}},['acs']));
      const y=group('rx16-youth-2013',{kicker:{en:'PUBLIC ENGAGEMENT / 2013',ar:'المشاركة المجتمعية / ٢٠١٣'},label:{en:'Event management at eighteen.',ar:'إدارة الفعاليات في سن الثامنة عشرة'},description:{en:'Two different events, recorded separately: Youth Change Everything and Run the World Festival.',ar:'فعاليتان مختلفتان، لكل منهما صورتها: الشباب يغيّر كل شيء ومهرجان Run the World.'}},['yce','run']);
      insertAfter('.hero',createContainer('container',y));
    } else if(page==='stories'){
      append('#living-systems .stories-chapter-text',group('rx16-chick-heart',{kicker:{en:'EMBRYOLOGY / OBSERVATION',ar:'علم الأجنة / ملاحظة'},label:{en:'A heart inside a developing organism.',ar:'قلب داخل كائن في طور التكوّن'}},['chick']));
      append('#research-apparatus .stories-chapter-text',group('rx16-cultured-cells',{kicker:{en:'CELL CULTURE / LABORATORY ARCHIVE',ar:'زراعة الخلايا / أرشيف المختبر'},label:{en:'Another ordinary laboratory scene.',ar:'مشهد آخر من العمل اليومي في المختبر'}},['cells']));
    } else if(page==='illness-evidence'){
      append('#early-years .prose.en',group('rx16-diagnosis-photo',{kicker:{en:'PERSONAL ARCHIVE / EARLY DIAGNOSIS',ar:'الأرشيف الشخصي / التشخيص المبكر'},label:{en:'A physician from the beginning of the story.',ar:'طبيب من بدايات هذه القصة'}},['doctor']));
      // The page has distinct language-specific prose blocks; keep each caption within its own language view.
      if(document.querySelector('#early-years .prose.ar')) append('#early-years .prose.ar',group('rx16-diagnosis-photo-ar',{kicker:{en:'PERSONAL ARCHIVE / EARLY DIAGNOSIS',ar:'الأرشيف الشخصي / التشخيص المبكر'},label:{en:'A physician from the beginning of the story.',ar:'طبيب من بدايات هذه القصة'}},['doctor']));
    }
    // Localised labels refresh when the site's existing language switch changes the HTML language.
    const update=()=>{const ar=root.lang==='ar';document.querySelectorAll('[data-rx16-en]').forEach(el=>{el.textContent=ar?el.dataset.rx16Ar:el.dataset.rx16En;});};
    const mo=new MutationObserver(update);mo.observe(root,{attributes:true,attributeFilter:['lang']});update();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',place,{once:true});else place();
})();

/* Public 2017 owner-supplied research/ACS archive: additive, de-duplicated across loaders. */
(() => {
  if (document.querySelector('script[data-rx17-archive]')) return;
  const css=document.createElement('link');
  css.rel='stylesheet';
  css.href='/assets/archival-2017-additions.css?v=20261016';
  document.head.appendChild(css);
  const script=document.createElement('script');
  script.src='/assets/archival-2017-additions.js?v=20261016';
  script.defer=true;
  script.setAttribute('data-rx17-archive','');
  document.head.appendChild(script);
})();
