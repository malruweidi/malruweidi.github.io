/* Ruwaidix: owner-identified school archive, supplied 17 October 2026.
   Both media assets live in the repository. Additive placement; no existing content removed. */
(() => {
  'use strict';
  const root = document.documentElement;
  const page = root.dataset.rxPage;
  if (page !== 'stories' && page !== 'archive') return;
  const base = '/assets/owner-archive-2026-10-17/';
  const records = [
    {
      filename: 'grade10-chemistry-festival-aref-elahmad.webp',
      width: 720, height: 531,
      title: ['The first chemistry teacher', 'أستاذي الأول في الكيمياء'],
      alt: [
        'Mahmoud with his first chemistry teacher, Mr. Aref Elahmad, holding a participation certificate after a Grade 10 chemistry festival',
        'محمود مع أستاذه الأول في الكيمياء عارف الأحمد حاملاً شهادة مشاركة في مهرجان كيمياء الصف العاشر'
      ],
      caption: [
        'With Mr. Aref Elahmad, my first chemistry teacher, after I presented my research at the Grade 10 chemistry festival at Doha Independent School. I am holding the certificate from that event.',
        'مع الأستاذ عارف الأحمد، أول معلم للكيمياء درسني، بعد مشاركتي ببحث في مهرجان الكيمياء للصف العاشر بمدرسة الدوحة المستقلة. أحمل في الصورة شهادة تلك المشاركة.'
      ]
    },
    {
      filename: 'high-school-graduation-jameel-al-shamarri.webp',
      width: 482, height: 640,
      title: ['Graduation at sixteen', 'التخرج في السادسة عشرة'],
      alt: [
        'Mahmoud in graduation dress next to Mr. Jameel Al-Shamarri at his high-school graduation, aged sixteen',
        'محمود بزي التخرج مع الأستاذ جميل الشمري في حفل تخرجه من الثانوية وعمره ستة عشر عاماً'
      ],
      caption: [
        'At my high-school graduation, aged sixteen, with Mr. Jameel Al-Shamarri.',
        'في حفل تخرجي من المدرسة الثانوية، وعمري ستة عشر عاماً، مع الأستاذ جميل الشمري.'
      ]
    }
  ];
  const words = {
    kicker: ['SCHOOL ARCHIVE / BEFORE UNIVERSITY', 'أرشيف المدرسة / قبل الجامعة'],
    heading: ['Before the university laboratories', 'قبل مختبرات الجامعة'],
    intro: [
      'In Grade 10, I brought research to the chemistry festival at Doha Independent School. One photograph is with Mr. Aref Elahmad, my first chemistry teacher, after that event. The other is from my high-school graduation at sixteen, beside Mr. Jameel Al-Shamarri. I kept both photographs, and I remember both teachers.',
      'في الصف العاشر شاركت ببحث في مهرجان الكيمياء بمدرسة الدوحة المستقلة. تجمعني الصورة الأولى بأستاذي الأول في الكيمياء، عارف الأحمد، بعد تلك المشاركة. والصورة الثانية من حفل تخرجي في الثانوية وعمري ستة عشر عاماً، مع الأستاذ جميل الشمري. احتفظت بالصورتين، ولم أنسَ هذين المعلمين.'
    ],
    storyLink: ['Read these photographs in Stories ↗', 'شاهد الصورتين في قسم القصص ↗']
  };
  const make = (tag, cls) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
  };
  const bilingual = (tag, cls, pair) => {
    const n = make(tag, cls);
    n.dataset.rx26SchoolEn = pair[0];
    n.dataset.rx26SchoolAr = pair[1];
    return n;
  };
  const section = make('section', 'rx26-school-archive');
  section.id = page === 'stories' ? 'school-chemistry-and-graduation' : 'school-chemistry-archive';
  section.setAttribute('aria-labelledby', section.id + '-title');
  const inner = make('div', 'rx26-school-inner');
  const header = make('header', 'rx26-school-heading');
  header.append(
    bilingual('p', 'rx26-school-kicker', words.kicker),
    bilingual('h2', 'rx26-school-title', words.heading),
    bilingual('p', 'rx26-school-intro', words.intro)
  );
  header.querySelector('h2').id = section.id + '-title';
  const grid = make('div', 'rx26-school-grid');
  records.forEach((r, index) => {
    const figure = make('figure', 'rx26-school-figure');
    const link = make('a', 'rx26-school-image');
    link.href = base + r.filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    const img = make('img');
    img.src = base + r.filename;
    img.width = r.width;
    img.height = r.height;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.dataset.rx26SchoolAltEn = r.alt[0];
    img.dataset.rx26SchoolAltAr = r.alt[1];
    link.append(img);
    const text = make('figcaption', 'rx26-school-caption');
    text.append(bilingual('strong', 'rx26-school-photo-title', r.title), bilingual('p', '', r.caption));
    figure.append(link, text);
    figure.dataset.rx26SchoolEntry = String(index + 1);
    grid.append(figure);
  });
  inner.append(header, grid);
  if (page === 'archive') {
    const a = bilingual('a', 'rx26-school-read-more', words.storyLink);
    a.href = '/stories.html#school-chemistry-and-graduation';
    inner.append(a);
  }
  section.append(inner);
  const target = document.getElementById(page === 'stories' ? 'anatomy' : 'rxRecoveredGallery');
  if (!target || document.getElementById(section.id)) return;
  target.insertAdjacentElement(page === 'stories' ? 'afterend' : 'beforebegin', section);
  if (page === 'stories') {
    const nav = document.querySelector('.stories-contents-inner');
    const first = nav && nav.querySelector('a[href="#anatomy"]');
    if (first && !nav.querySelector('a[href="#school-chemistry-and-graduation"]')) {
      const a = bilingual('a', '', ['01A / School chemistry & graduation', '٠١أ / الكيمياء والتخرج']);
      a.href = '#' + section.id;
      first.insertAdjacentElement('afterend', a);
    }
  }
  const update = () => {
    const ar = root.lang.toLowerCase().startsWith('ar');
    section.querySelectorAll('[data-rx26-school-en]').forEach(el => {
      el.textContent = ar ? el.dataset.rx26SchoolAr : el.dataset.rx26SchoolEn;
    });
    document.querySelectorAll('.stories-contents-inner [data-rx26-school-en]').forEach(el => {
      el.textContent = ar ? el.dataset.rx26SchoolAr : el.dataset.rx26SchoolEn;
    });
    section.querySelectorAll('img[data-rx26-school-alt-en]').forEach(el => {
      el.alt = ar ? el.dataset.rx26SchoolAltAr : el.dataset.rx26SchoolAltEn;
    });
  };
  new MutationObserver(update).observe(root, {attributes: true, attributeFilter: ['lang']});
  update();
})();