/* Ruwaidix / owner-identified photographs, 16 Oct 2026.
   Non-destructive placements within existing editorial pages.
   Display dates visible in phone screenshots are not treated as capture dates. */
(()=>{
  'use strict';
  const root = document.documentElement;
  const page = root.dataset.rxPage || '';
  const base = '/assets/owner-archive-2026-10-16/';
  const ownerNote = {
    en:'Photographic archive: subject identified firsthand; capture metadata retained in the provenance manifest.',
    ar:'الصورة وتحديد موضوعها من الأرشيف الشخصي، ولم يُتحقق بصورة مستقلة من تاريخ التقاطها.'
  };
  const records = {
    extracts:{file:'chem-squad-lab-medicinal-plant-extracts.webp',alt:'An archival chemistry laboratory workbench with glassware and extraction-related apparatus',title:{en:'Medicinal plants on the bench',ar:'منضدة المختبر قبل اكتمال الأفكار'},caption:{en:'Glassware and extraction equipment from our early Chem Squad work with medicinal plants.',ar:'أدوات زجاجية ومعدات استخلاص من بدايات عملنا في كيم سكواد على النباتات الطبية.'}},
    elgendy:{file:'chem-squad-elgendy-asleep-selfie.webp',alt:'Mahmoud taking a photograph while Ahmed Elgendy sleeps with his head on a chair',title:{en:'Ahmed catches some sleep',ar:'أحمد يغفو قليلًا'},caption:{en:'Ahmed Elgendy was asleep while I took this photograph during our Chem Squad years.',ar:'أحمد الجندي نائم وأنا ألتقط هذه الصورة من أيام كيم سكواد.'}},
    fifa:{file:'chem-squad-rakan-winter-fifa.webp',alt:'Mahmoud and Rakan Al-Zu’Bi seated in a winter tent with game controllers, playing FIFA',title:{en:'Winter break in the tent, with Rakan',ar:'إجازة الشتاء في الخيمة مع راكان'},caption:{en:'Rakan Al-Zu’Bi and I playing FIFA in the tent during winter break.',ar:'أنا وراكان الزعبي نلعب فيفا في الخيمة خلال إجازة الشتاء.'}},
    ramadan:{file:'chemistry-ramadan-group-gathering.webp',alt:'Group of chemistry friends gathered together during Ramadan',title:{en:'Chemistry friends, Ramadan gathering',ar:'لقاء رمضان مع أصدقاء الكيمياء'},caption:{en:'Some of my chemistry friends together for Ramadan.',ar:'لقاء رمضاني مع بعض أصدقائي من قسم الكيمياء.'}},
    acs:{file:'acs-orange-balloon-portrait.webp',alt:'Mahmoud Al-Ruweidi wearing a suit and tie beside an orange American Chemical Society balloon',title:{en:'With the ACS balloon',ar:'مع بالون الجمعية الكيميائية الأمريكية'},caption:{en:'With an ACS balloon during the years we were building the student chapter.',ar:'مع بالون الجمعية الكيميائية الأمريكية في سنوات تأسيس فرعها الطلابي.'}},
    yce:{file:'yce-youth-event-podium-2013.webp',alt:'Mahmoud speaking at a podium during a Youth Change Everything event in 2013',title:{en:'Youth Change Everything / 2013',ar:'الشباب يغيّر كل شيء / ٢٠١٣'},caption:{en:'Speaking at the lectern during a 2013 Youth Change Everything event that I helped manage.',ar:'أتحدث على المنصة خلال إحدى فعاليات «الشباب يغيّر كل شيء» عام ٢٠١٣ التي شاركت في إدارتها.'}},
    run:{file:'run-the-world-youth-festival-2013.webp',alt:'Mahmoud aged eighteen at a 2013 youth festival in front of Youth Got Talent signs',title:{en:'Run the World Festival, age eighteen',ar:'مهرجان Run the World في الثامنة عشرة'},caption:{en:'I was eighteen when I worked as a manager for the Run the World Festival in 2013.',ar:'كنت في الثامنة عشرة حين عملت مديرًا لمهرجان Run the World عام ٢٠١٣.'}},
    chick:{file:'chick-embryo-heart-observation.webp',alt:'Opened chick egg preparation showing the developing chick embryo and visible blood vessels',title:{en:'A chick embryo and its developing heart',ar:'قلب جنين الدجاج أثناء التطور'},caption:{en:'An opened chick egg during an embryology observation, with developing blood vessels visible.',ar:'بيضة دجاج مفتوحة خلال ملاحظة جنينية، وتظهر الأوعية الدموية في طور النمو.'}},
    cells:{file:'cell-culture-flask-archive.webp',alt:'Transparent laboratory cell-culture flask with pink culture medium and handwritten labeling',title:{en:'Cell culture, in the everyday record',ar:'زراعة الخلايا ضمن السجل اليومي'},caption:{en:'A cell-culture flask with pink medium and a handwritten label on the bench.',ar:'دورق لزراعة الخلايا يحتوي وسطًا وردي اللون وعلى سطحه ملصق مكتوب بخط اليد.'}},
    doctor:{file:'eosinophilic-diagnosis-dr-elsheikh-abdelrahim.webp',alt:'Mahmoud with Dr. Elsheikh Abdelrahim, wearing a white coat and stethoscope, during the early eosinophilic gastroenteritis years',title:{en:'With Dr. Elsheikh Abdelrahim',ar:'مع الدكتور الشيخ عبد الرحيم'},caption:{en:'With Dr. Elsheikh Abdelrahim, who was a resident doctor when my eosinophilic gastroenteritis was first diagnosed. He later specialized in cardiology.',ar:'مع الدكتور الشيخ عبد الرحيم، الذي كان طبيبًا مقيمًا عند تشخيص إصابتي بالتهاب المعدة والأمعاء اليوزيني لأول مرة، ثم تخصص لاحقًا في أمراض القلب.'}}
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
    // Provenance is retained in assets/owner-photo-provenance-2026-10-16.json, not repeated in every public caption.
    f.append(link,caption);return f;
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
