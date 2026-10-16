/* Ruwaidix / 2017 owner-supplied archival evidence. Additive, no existing DOM removed.
   Photograph labels are provenance-aware; photo-library display dates are not EXIF. */
(() => {
  'use strict';
  const base = '/assets/2017-owner-archive/';
  const descriptions = {
    committee: {
      file: 'acs-executive-committee-certificate-2017.webp',
      alt: ['Framed certificate identifying Mahmoud Khatib AbdelRasool as a 2016–17 QUACS executive committee member', 'شهادة تقدير باسم محمود خطيب عبدالرسول لعضويته في اللجنة التنفيذية لفرع الجمعية الكيميائية الأمريكية بجامعة قطر'],
      title: ['The executive committee, on record', 'عضوية اللجنة التنفيذية موثقة'],
      caption: ['The Department of Chemistry and Earth Sciences commended my contribution as an executive committee member to the Qatar University ACS student chapter, 2016–17. Photo-library display: Qatar University, 22 May 2017.', 'شهادة تقدير من قسم الكيمياء وعلوم الأرض عن المساهمة بصفتي عضوًا في اللجنة التنفيذية لفرع الجمعية الكيميائية الأمريكية بجامعة قطر للعام ٢٠١٦–٢٠١٧. تاريخ عرض مكتبة الصور: ٢٢ مايو ٢٠١٧.'],
      source: ['Original certificate, photographed by the archive owner. Screenshot: IMG_7985.jpeg.', 'شهادة أصلية من تصوير صاحب الأرشيف. المصدر: IMG_7985.jpeg.']
    },
    service: {
      file: 'acs-student-chapter-service-award-2017.webp',
      alt: ['Transparent Qatar University College of Arts and Sciences ACS service award held in a hand', 'درع تقدير لخدمة فرع الجمعية الكيميائية الأمريكية بجامعة قطر'],
      title: ['A service award, May 2017', 'تكريم على خدمة الفصل الطلابي، مايو ٢٠١٧'],
      caption: ['The Chemistry and Earth Sciences department recognized my initiatives and commitment to the success of the Qatar University ACS student chapter. The award is dated May 2017.', 'كرّم قسم الكيمياء وعلوم الأرض المبادرات والالتزام اللذين ساعدا في إنجاح الفصل الطلابي للجمعية الكيميائية الأمريكية بجامعة قطر. الدرع مؤرخ في مايو ٢٠١٧.'],
      source: ['Original award photographed by the archive owner. Source: IMG_7986.png.', 'درع أصلي من تصوير صاحب الأرشيف. المصدر: IMG_7986.png.']
    },
    microscope: {
      file: 'jeol-jcm6000-qatar-university-2017.webp',
      alt: ['JEOL JCM-6000 scanning electron microscope at Qatar University with instrument label visible', 'مجهر إلكتروني ماسح JEOL JCM-6000 في جامعة قطر'],
      title: ['The SEM in July', 'المجهر الإلكتروني في يوليو'],
      caption: ['A JEOL JCM-6000 scanning electron microscope in a Qatar University facility. Photo-library display: 18 July 2017, 13:16. I photographed the instrument during a visit to the facility.', 'مجهر إلكتروني ماسح من طراز JEOL JCM-6000 في إحدى مرافق جامعة قطر. تاريخ عرض مكتبة الصور: ١٨ يوليو ٢٠١٧، الساعة ١٣:١٦. التقطت الصورة للجهاز خلال وجودي في المرفق.'],
      source: ['Owner-supplied photo-library screenshot: IMG_7988.jpeg.', 'صورة من مكتبة الصور الشخصية: IMG_7988.jpeg.']
    },
    group: {
      file: 'qatar-university-acs-delegation-2017.webp',
      alt: ['Five members of a university group at an airport holding the Qatar flag and Qatar University flag', 'خمسة أشخاص في مطار يحملون علم دولة قطر وعلم جامعة قطر'],
      title: ['The university delegation', 'وفد الجامعة'],
      caption: ['Our university travel group together at the airport with the Qatar and Qatar University flags.', 'صورة تجمع وفد الجامعة في المطار مع علم دولة قطر وعلم جامعة قطر.'],
      source: ['Owner-supplied photograph: IMG_7989.png.', 'صورة مقدمة من صاحب الأرشيف: IMG_7989.png.']
    },
    dulles: {
      file: 'dulles-acs-travel-2017.webp',
      alt: ['Airport selfie of chemistry travelers seated with luggage', 'صورة جماعية لرفاق رحلة علمية في المطار مع حقائب سفر'],
      title: ['At Dulles, 18 August', 'في مطار دالاس، ١٨ أغسطس'],
      caption: ['An airport selfie among fellow travelers. The photo-library display identifies Washington Dulles International Airport, 18 August 2017, 21:45.', 'صورة ذاتية جماعية مع رفاق السفر. تسجل مكتبة الصور مطار واشنطن دالاس الدولي في ١٨ أغسطس ٢٠١٧، الساعة ٢١:٤٥.'],
      source: ['Owner-supplied photo-library screenshot: IMG_7990.jpeg.', 'صورة من مكتبة الصور الشخصية: IMG_7990.jpeg.']
    },
    mars: {
      file: 'acs-journey-to-mars-poster-2017.webp',
      alt: ['Journey to Mars illustrated event flyer with astronaut and American Chemical Society and NASA-associated marks', 'منشور فعالية «رحلة إلى المريخ» بصورة رائد فضاء وشعارات مرتبطة بالجمعية الكيميائية الأمريكية وناسا'],
      title: ['An invitation to Mars, on paper', 'دعوة ورقية إلى المريخ'],
      caption: ['A Washington photograph of a “Journey to Mars” flyer advertising 22–23 August 2017 programming around the ACS National Meeting. The flyer documents the advertised event, not attendance at the session.', 'صورة في واشنطن لإعلان «رحلة إلى المريخ» عن فعاليات يومي ٢٢–٢٣ أغسطس ٢٠١٧ بالتزامن مع اجتماع الجمعية الكيميائية الأمريكية. يثبت الإعلان وجود الفعالية المعلنة، وليس حضور الجلسة.'],
      source: ['Photo-library display: Washington, 19 August 2017, 16:59. Screenshot: IMG_7991.jpeg.', 'تاريخ عرض مكتبة الصور: واشنطن، ١٩ أغسطس ٢٠١٧، الساعة ١٦:٥٩. المصدر: IMG_7991.jpeg.']
    }
  };
  function txt(en, ar, tag='span', cls='') {
    const x = document.createElement(tag);
    if (cls) x.className = cls;
    x.dataset.rx17En = en;
    x.dataset.rx17Ar = ar;
    x.textContent = document.documentElement.lang.startsWith('ar') ? ar : en;
    return x;
  }
  function element(tag, cls='') { const n = document.createElement(tag); if (cls) n.className=cls; return n; }
  function picture(key) {
    const rec = descriptions[key];
    const figure = element('figure','rx17-figure');
    const a = element('a','rx17-photo-link');
    a.href = base+rec.file; a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', rec.title[0]);
    const img = element('img');
    img.src = a.href; img.loading='lazy'; img.decoding='async';
    img.alt = document.documentElement.lang.startsWith('ar') ? rec.alt[1] : rec.alt[0];
    img.dataset.rx17AltEn = rec.alt[0]; img.dataset.rx17AltAr = rec.alt[1];
    a.appendChild(img);
    const caption = element('figcaption');
    caption.append(txt(rec.title[0],rec.title[1],'strong'),txt(rec.caption[0],rec.caption[1],'span','rx17-caption'));
    figure.append(a,caption);
    return figure;
  }
  function cards(keys) {
    const grid=element('div','rx17-grid');
    for (const key of keys) grid.append(picture(key));
    return grid;
  }
  function section(id,kicker,title,paragraph) {
    const s=element('section','rx17-block');s.id=id;
    s.setAttribute('aria-labelledby',id+'-title');
    const intro=element('div','rx17-intro');
    intro.append(txt(kicker[0],kicker[1],'p','rx17-kicker'));
    const h=txt(title[0],title[1],'h2','rx17-heading');h.id=id+'-title';intro.append(h);
    intro.append(txt(paragraph[0],paragraph[1],'p','rx17-lead'));
    s.append(intro);return s;
  }
  function more(href,en,ar){const a=txt(en,ar,'a','rx17-continue');a.href=href;return a;}
  function archive() {
    const anchor=document.querySelector('.photo-section')||document.getElementById('rxRecoveredGallery');if(!anchor)return;
    const s=section('rx17-2017-evidence',
      ['FROM THE PERSONAL ARCHIVE · 2017','من الأرشيف الشخصي · ٢٠١٧'],
      ['Six pieces of a scientific life, 2017','ست وثائق من حياة علمية، ٢٠١٧'],
      ['A microscope photographed on campus. Two original departmental recognitions of our chemistry chapter. A university group at an airport, an evening at Dulles and an illustrated invitation to Mars found in Washington. These objects record the infrastructure and people around science, much of which never appears in a publication list.',
       'مجهر صوّرته في الجامعة، وتكريمان أصليان من القسم عن عمل فصل الكيمياء الطلابي، ومجموعة من الجامعة في المطار، وليلة في دالاس، وإعلان مصوّر عن رحلة إلى المريخ في واشنطن. تحفظ هذه الوثائق الأماكن والأشخاص المحيطين بالعمل العلمي، وهي أمور لا تظهر عادة في قوائم المنشورات.']);
    s.append(cards(['committee','service','microscope','group','dulles','mars']));
    /* Photo-library source notes remain in descriptions[].source and the archival provenance records. */
    anchor.insertAdjacentElement('afterend',s);
  }
  function engagement(){
    const anchor=document.getElementById('acs-2019')||document.getElementById('chemistry-festival');if(!anchor)return;
    const s=section('rx17-acs-chapter-2017',
      ['QATAR UNIVERSITY / ACS STUDENT CHAPTER','جامعة قطر / الفصل الطلابي للجمعية الكيميائية الأمريكية'],
      ['The chapter was built by people. There are documents for that.','بنى الناس الفصل الطلابي، وتبقى الوثائق شاهدًا'],
      ['By May 2017, my work with the Qatar University ACS student chapter had left a material record: a departmental certificate naming me to the 2016–17 executive committee and a service award recognizing initiatives that helped the chapter succeed. That summer, the archive follows the chemistry community to Washington. The airport photographs and a NASA-themed ACS flyer are fragments of the journey, rather than substitutes for the scientific program.',
       'بحلول مايو ٢٠١٧ ترك عملي مع الفصل الطلابي للجمعية الكيميائية الأمريكية في جامعة قطر وثائق ملموسة: شهادة من القسم تثبت عضويتي في اللجنة التنفيذية لعام ٢٠١٦–٢٠١٧ ودرعًا يكرّم المبادرات التي أسهمت في نجاح الفصل. وفي صيف السنة نفسها ينتقل الأرشيف مع مجتمع الكيمياء إلى واشنطن، حيث تحفظ صور المطار وإعلان فعالية ذات طابع فضائي بعض تفاصيل الرحلة.']);
    s.append(cards(['committee','service','group','dulles','mars']));
    s.append(more('/archive.html#rx17-2017-evidence','View all six original-source records →','عرض السجلات الستة في الأرشيف ←'));
    anchor.insertAdjacentElement('beforebegin',s);
  }
  function stories(){
    const apparatus=document.getElementById('research-apparatus');
    if(apparatus){
      const s=section('rx17-jcm6000-story',
        ['AN INSTRUMENT / 18 JULY 2017','جهاز علمي / ١٨ يوليو ٢٠١٧'],
        ['A scanning electron microscope, before the image','مجهر إلكتروني قبل الصورة'],
        ['In July 2017, I photographed a JEOL JCM-6000 scanning electron microscope at Qatar University. The photograph has none of the drama of a finished micrograph. It shows the instrument itself, part of the physical world behind the images that eventually circulate in papers and presentations.',
         'في يوليو ٢٠١٧ صوّرت مجهر JEOL JCM-6000 الإلكتروني الماسح في جامعة قطر. لا تحمل هذه الصورة الإبهار الذي تحمله صورة مجهرية منشورة، بل تعرض الجهاز نفسه، أحد الأشياء المادية التي تقف خلف الصور التي تصل لاحقًا إلى الأوراق العلمية والعروض.']);
      s.append(cards(['microscope']));
      apparatus.insertAdjacentElement('afterend',s);
    }
    const community=document.getElementById('community-before-lab');
    if(community){
      const s=section('rx17-acs-community-memory',
        ['THE STUDENT CHAPTER / MAY–AUGUST 2017','الفصل الطلابي / مايو–أغسطس ٢٠١٧'],
        ['A chapter travelled farther than its paperwork','رحلة فصل طلابي تتجاوز شهاداته'],
        ['The two recognitions from May 2017 are useful because they put dates and responsibilities to an experience I remember through people. By August there were suitcases, university flags and a chemistry trip to Washington. A student chapter is not just its certificates; it is also the work and friendships required to make the trip happen.',
         'تساعدني وثيقتا التكريم من مايو ٢٠١٧ على وضع تاريخ ومسؤوليات واضحة لتجربة أتذكرها أولًا من خلال الأشخاص. وفي أغسطس ظهرت الحقائب وأعلام الجامعة ورحلة الكيمياء إلى واشنطن. لم تكن الشهادات الفصل الطلابي كله؛ فقد سبقتها جهود وعلاقات أتاحت لهذه الرحلة أن تحدث.']);
      s.append(cards(['service','group']));
      s.append(more('/engagement.html#rx17-acs-chapter-2017','Read the chapter’s documentary record →','اقرأ السجل الوثائقي للفصل ←'));
      community.insertAdjacentElement('afterend',s);
    }
  }
  function home(){
    const anchor=document.getElementById('initiatives');if(!anchor)return;
    const s=section('rx17-home-chapter',
      ['FROM THE 2017 ARCHIVE','من أرشيف ٢٠١٧'],
      ['The chapter, the laboratory, the journey','الفصل الطلابي والمختبر والرحلة'],
      ['Two documents from May 2017 preserve my work in the chemistry chapter; a summer photograph records a Qatar University delegation travelling together. The expanded archive holds six primary-source images, including the JEOL scanning electron microscope and the Washington trip.',
       'توثّق شهادتان من مايو ٢٠١٧ عملي في الفصل الطلابي للكيمياء، وتحتفظ صورة صيفية بذكرى سفر وفد من جامعة قطر. يضم الأرشيف الموسع ست صور أصلية المصدر، منها المجهر الإلكتروني ورحلة واشنطن.']);
    s.classList.add('rx17-home');s.append(cards(['service','group']));
    s.append(more('/archive.html#rx17-2017-evidence','Enter the 2017 photographic archive →','اذهب إلى الأرشيف المصور لعام ٢٠١٧ ←'));
    anchor.insertAdjacentElement('afterend',s);
  }
  function translate(){
    const ar=document.documentElement.lang.toLowerCase().startsWith('ar');
    document.querySelectorAll('[data-rx17-en]').forEach(el=>{el.textContent=ar?el.dataset.rx17Ar:el.dataset.rx17En});
    document.querySelectorAll('[data-rx17-alt-en]').forEach(el=>{el.alt=ar?el.dataset.rx17AltAr:el.dataset.rx17AltEn});
  }
  function init(){
    if(document.getElementById('rx17-2017-evidence')||document.getElementById('rx17-home-chapter')||document.getElementById('rx17-acs-chapter-2017')||document.getElementById('rx17-jcm6000-story'))return;
    const path=window.location.pathname.toLowerCase();
    if(path.endsWith('/archive.html'))archive();
    else if(path.endsWith('/engagement.html'))engagement();
    else if(path.endsWith('/stories.html'))stories();
    else if(path==='/'||path.endsWith('/index.html'))home();
    translate();
    new MutationObserver(translate).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();