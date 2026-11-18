/* Pair each reading page with two specific works from the archive. */
(() => {
"use strict";
const exhibits = {
  "bubble": [
    "films/what-a-bubble-can-do.html",
    "assets/films/what-a-bubble-can-do-poster.webp",
    "Research film",
    "فيلم بحثي",
    "What a Bubble Can Do",
    "ما الذي يمكن أن تفعله فقاعة؟",
    "Follow the air–liquid interface across a layer of lung cells.",
    "تتبّع حركة السطح الفاصل بين الهواء والسائل فوق طبقة من خلايا الرئة."
  ],
  "lung": [
    "research/pulmonary-epithelial-injury.html",
    "assets/home-archive/figure-pulmonary-flow-chamber.jpg",
    "Experimental record",
    "سجلّ التجربة",
    "Inside the flow chamber",
    "داخل حجرة التدفّق",
    "How the experiment measured injury to epithelial cells as an airway reopened.",
    "كيف قاست التجربة إصابة الخلايا الظهارية عند إعادة فتح مجرى هوائي."
  ],
  "micro": [
    "stories/cairo-microscope.html",
    "assets/oct12-owner-photos/microscopy-vacation-morning-2017.webp",
    "Personal history",
    "حكاية شخصية",
    "A microscope of my own",
    "مجهر خاص بي",
    "From Qasr El Einy in Cairo to a desk in Qatar.",
    "من قصر العيني في القاهرة إلى مكتب في قطر."
  ],
  "microfilm": [
    "films/cairo-microscope.html",
    "assets/films/series-v6/cairo-microscope.webp",
    "Short documentary",
    "فيلم وثائقي قصير",
    "The microscope I brought from Cairo",
    "المجهر الذي أحضرته من القاهرة",
    "Watch the story of the instrument that travelled home with me.",
    "شاهد حكاية المجهر الذي رافقني في رحلة العودة."
  ],
  "hist": [
    "stories/failed-zebrafish-histology.html",
    "assets/2026-10-13-new-photos/zebrafish-paraffin-microtomy-failure.webp",
    "Laboratory account",
    "من دفتر المختبر",
    "Two materials. No section.",
    "مادتان لم تصبحا قالبًا واحدًا.",
    "What happened when agarose and paraffin separated during sectioning.",
    "ماذا حدث حين انفصل الأغاروز عن البارافين أثناء التقطيع؟"
  ],
  "histfilm": [
    "films/two-materials-no-section.html",
    "assets/films/two-materials-no-section-poster.webp",
    "Short documentary",
    "فيلم وثائقي قصير",
    "The section that came apart",
    "المقطع الذي تفكّك",
    "Follow the failed attempt to prepare a zebrafish specimen for histology.",
    "تتبّع محاولة تحضير عيّنة من سمك الزرد للفحص النسيجي."
  ],
  "ring": [
    "stories/the-ring-that-never-closed.html",
    "archive/archive-7884.jpg",
    "Chemistry notebook",
    "من دفتر الكيمياء",
    "The ring that never closed",
    "الحلقة التي لم تُغلق",
    "A planned synthesis took another course. The project report had to follow the products.",
    "سلك التفاعل مسارًا آخر، فكان على تقرير المشروع أن يتتبّع النواتج الفعلية."
  ],
  "grant": [
    "grants/urep23.html",
    "assets/films/series-v6/heterocycle-cancer.webp",
    "Grant record",
    "سجلّ المنحة",
    "The imidazopyridine project",
    "مشروع الإيميدازوبيريدين",
    "Read the original research aims alongside the route the chemistry took.",
    "اقرأ الأهداف الأصلية للمشروع إلى جانب المسار الذي سلكه التفاعل."
  ],
  "history": [
    "films/making-medicines-keep.html",
    "assets/films/source-manuscripts/wellcome-ms-arabic-1002/canvas-013.jpg",
    "Historical documentary",
    "فيلم في تاريخ الصيدلة",
    "Making Medicines Keep",
    "من تاريخ حفظ الأدوية",
    "Syrups and the choice of substitutes in Ayyubid and Mamluk Cairo.",
    "الأشربة واختيار الأبدال في القاهرة الأيوبية والمملوكية."
  ],
  "historypaper": [
    "research.html#historical-research",
    "assets/films/source-manuscripts/wellcome-ms-arabic-1002/canvas-013.jpg",
    "History of pharmacy",
    "تاريخ الصيدلة",
    "Medicines in medieval Cairo",
    "الأدوية في قاهرة العصور الوسطى",
    "Read the research behind the documentary.",
    "اقرأ البحث الذي استند إليه الفيلم."
  ],
  "niosome": [
    "research/inhalable-vesicles.html",
    "assets/niosomes-concept.svg",
    "Ongoing research",
    "بحث جارٍ",
    "What must a formulation survive?",
    "ما الذي ينبغي أن تتحمّله التركيبة؟",
    "The questions behind inhalable dexamethasone vesicles and nebulization.",
    "الأسئلة التي تطرحها حويصلات الديكساميثازون المستنشقة وعملية الإرذاذ."
  ],
  "aerosol": [
    "publication-cinema.html#film-niosomes",
    "assets/films/series-v28-niosomes/niosomes.webp",
    "Formulation film",
    "فيلم عن الصياغة الدوائية",
    "Will the medicine survive the nebulizer?",
    "هل يصمد الدواء أمام الإرذاذ؟",
    "Watch the formulation question develop on screen.",
    "شاهد كيف تتبلور مسألة صياغة الدواء في الفيلم."
  ],
  "vessel": [
    "research/zebrafish-vascular-cilia.html",
    "assets/home-archive/figure-zebrafish-microscopy.jpg",
    "Experimental record",
    "سجلّ التجربة",
    "Inside developing vessels",
    "داخل الأوعية النامية",
    "The cerebral vasculature, endothelial cilia, and what imaging could establish.",
    "أوعية الدماغ وأهداب الخلايا البطانية وما أمكن استنتاجه من التصوير."
  ],
  "camera": [
    "research/high-speed-zebrafish-imaging.html",
    "assets/archival-inline/microzebralab-published-figure.jpg",
    "Imaging methods",
    "طرائق التصوير",
    "Recording a beating zebrafish heart",
    "تصوير قلب سمكة الزرد أثناء النبض",
    "Follow the camera setup and acquisition workflow.",
    "تعرّف إلى إعداد الكاميرا وخطوات التقاط الصور."
  ],
  "pla": [
    "research/plasma-modified-pla.html",
    "assets/home-archive/figure-pla-surface.jpg",
    "Materials research",
    "بحث في المواد",
    "The surface changes the experiment",
    "أثر السطح في التجربة",
    "Read the experiments on plasma treatment and PLA interfaces.",
    "اقرأ عن تجارب المعالجة بالبلازما والسطوح البينية لعديد حمض اللاكتيك."
  ],
  "micelle": [
    "publication-cinema.html#film-micelles-pahs",
    "assets/films/series-v6/micelles-pahs.webp",
    "Project film",
    "فيلم عن المشروع",
    "Micelles and hydrocarbons",
    "المذيلات والهيدروكربونات",
    "Revisit the colloid chemistry behind the remediation project.",
    "تتبّع كيمياء الغرويات وراء مشروع إزالة الملوّثات."
  ],
  "echo": [
    "publication-cinema.html#film-echo-cnn-lstm",
    "assets/films/series-v29-echo/echo-cnn-lstm.webp",
    "Computational research",
    "بحث حاسوبي",
    "Reading fetal echocardiograms",
    "قراءة صور قلب الجنين",
    "The research film on deep learning and fetal cardiac imaging.",
    "فيلم البحث في التعلّم العميق وتصوير قلب الجنين."
  ],
  "book": [
    "major-revisions.html",
    "assets/major-revisions-cover.svg",
    "Book in progress",
    "كتاب قيد التأليف",
    "Major Revisions",
    "Major Revisions",
    "A third-culture kid finding his place in academia.",
    "حكاية شاب نشأ بين ثقافات عدّة ويبحث عن مكانه في الوسط الأكاديمي."
  ],
  "team": [
    "films/the-laboratory-we-carried-with-us.html",
    "assets/films/the-laboratory-we-carried-with-us-poster.webp",
    "Short documentary",
    "فيلم وثائقي قصير",
    "The Laboratory We Carried With Us",
    "المختبر الذي حملناه معنا",
    "Seven chemists kept meeting after their course ended.",
    "واصل سبعة كيميائيين لقاءاتهم بعد انتهاء المقرّر."
  ],
  "chem": [
    "chem-squad.html",
    "assets/chem-squad-october-2026.jpg",
    "Scientific community",
    "مجتمع علمي",
    "Meet Chem Squad",
    "تعرّف إلى فريق الكيمياء",
    "The group that grew from an organic chemistry bench in 2016.",
    "المجموعة التي بدأت عند منضدة الكيمياء العضوية عام ٢٠١٦."
  ],
  "workbench": [
    "scientific-fieldnotes-2026.html",
    "assets/owner-archive-2026-10-17/neutral-tio2-trial-1-capacitance.webp",
    "Laboratory notebook",
    "دفتر المختبر",
    "Humidity and an electrical measurement",
    "الرطوبة والقياس الكهربائي",
    "Read the notes alongside the capacitance and resistance plots.",
    "اقرأ الملاحظات إلى جانب منحنيات السعة والمقاومة."
  ],
  "patient": [
    "illness-and-evidence.html",
    "assets/films/series-v6/essay-life-between-diagnoses.webp",
    "Personal essay",
    "مقالة شخصية",
    "The life between diagnoses",
    "الحياة بين التشخيصات",
    "The years of illness seen from the patient’s side.",
    "سنوات المرض كما عاشها المريض."
  ],
  "sensing": [
    "research.html#molecular-chemistry",
    "assets/films/series-v26-curcumin/curcumin-cyanide.webp",
    "Chemical sensing",
    "الاستشعار الكيميائي",
    "The curcumin question",
    "سؤال الكركمين",
    "What could an optical response tell us about cyanide?",
    "ماذا كان يمكن أن يخبرنا به التغيّر الضوئي عن السيانيد؟"
  ]
};
const routes = {
  "archive": "micro hist",
  "behind-the-record": "ring micro",
  "chem-squad": "team ring",
  "computing": "echo camera",
  "cv": "lung grant",
  "doctoral-concepts": "niosome pla",
  "engagement": "team chem",
  "evidence-viewer": "lung vessel",
  "figures": "pla camera",
  "film": "micro ring",
  "films": "hist lung",
  "for-supervisors": "lung niosome",
  "full-record": "sensing micro",
  "grants": "grant micelle",
  "illness-and-evidence": "book history",
  "imaging": "camera vessel",
  "leadership": "team chem",
  "major-revisions": "micro patient",
  "methods-evidence": "hist workbench",
  "molecular-therapeutics": "niosome lung",
  "moving-evidence": "camera lung",
  "publication-cinema": "lung hist",
  "publications": "history lung",
  "reading-map": "sensing ring",
  "recommendations": "book history",
  "recommended-books": "book history",
  "recommended-essays": "patient book",
  "recommended-screen": "history bubble",
  "research-horizon": "aerosol lung",
  "research": "bubble sensing",
  "scientific-fieldnotes-2026": "pla ring",
  "search": "micro lung",
  "stories": "micro hist",
  "techniques": "camera hist",
  "training": "workbench camera",
  "writing": "history book",
  "stories/cairo-microscope": "microfilm camera",
  "stories/failed-zebrafish-histology": "histfilm vessel",
  "stories/ramadan-microscope": "micro camera",
  "stories/the-ring-that-never-closed": "grant sensing",
  "stories/unfortunate-copolymer-trials": "micelle pla",
  "research/high-speed-zebrafish-imaging": "vessel micro",
  "research/inhalable-vesicles": "aerosol lung",
  "research/plasma-modified-pla": "workbench niosome",
  "research/pulmonary-epithelial-injury": "bubble niosome",
  "research/zebrafish-vascular-cilia": "camera hist",
  "films/airway-reopening-evidence": "lung bubble",
  "films/cairo-microscope": "micro camera",
  "films/index": "lung hist",
  "films/making-medicines-keep": "historypaper book",
  "films/the-laboratory-we-carried-with-us": "chem ring",
  "films/the-ring-that-never-closed": "ring grant",
  "films/two-materials-no-section": "hist vessel",
  "films/what-a-bubble-can-do": "lung niosome",
  "grants/urep19": "micelle pla",
  "grants/urep21": "lung bubble",
  "grants/urep22": "pla workbench",
  "grants/urep23": "ring sensing"
};
const pagePath = location.pathname.endsWith("/") ? location.pathname + "index.html" : location.pathname;
const key = pagePath.replace(/^\/+|\.html$/g, "");
const pair = routes[key];
const main = document.querySelector("main");
if (!main || !pair) return;
const isFilm = key.startsWith("films/") || ["film","films","publication-cinema","moving-evidence"].includes(key);
const isStory = key.startsWith("stories/") || ["stories","writing","major-revisions","illness-and-evidence","archive","behind-the-record","chem-squad","leadership","engagement"].includes(key);
const isShelf = key.startsWith("recommend");
const family = isFilm ? "cinema" : isStory ? "narrative" : isShelf ? "shelf" : "notebook";
document.documentElement.dataset.readingEdition = family;
const exhibitKeys = pair.split(" ");
const introSelectors = {
  "research": ".rs-hero > .rs-wrap",
  "publications": ".pub-hero > .pub-wrap",
  "grants": "main > .hero > .wrap",
  "methods-evidence": "main > .hero > .wrap",
  "doctoral-concepts": "main > .hero > .wrap",
  "for-supervisors": "main > .hero > .wrap"
};
const hero = introSelectors[key] ? document.querySelector(introSelectors[key]) : null;
const language = () => document.documentElement.lang.startsWith("ar") ? 1 : 0;
const create = (tag, cls) => Object.assign(document.createElement(tag), {className: cls});
const feature = create("section", "rx-reading-spread");
const title = create("h2", "rx-reading-title");
title.id = "rx-reading-title";
feature.setAttribute("aria-labelledby", title.id);
const cards = create("div", "rx-reading-pair");
const items = exhibitKeys.map(id => {
  const [path, source] = exhibits[id];
  const link = create("a","rx-reading-item");
  link.href = "/" + path;
  const mat = create("span", "rx-reading-mat");
  const image = create("img", "rx-reading-image");
  image.src = "/" + source;
  image.alt = "";
  image.loading = "lazy";
  image.decoding = "async";
  mat.append(image);
  const copy = create("span","rx-reading-copy");
  const type = create("small","rx-reading-kind");
  const name = create("strong","rx-reading-name");
  const caption = create("span","rx-reading-caption");
  copy.append(type, name, caption);
  link.append(mat, copy);
  cards.append(link);
  return {id,type,name,caption};
});
feature.append(title,cards);
if (hero) {
  hero.classList.add("rx-illustrated-intro");
  hero.append(feature);
} else {
  main.append(feature);
}
const headings = {
  cinema: ["Behind the frame","وراء اللقطة"],
  narrative: ["Where the story goes next","إلى أين تمضي الحكاية؟"],
  shelf: ["From my own shelves","من مكتبتي وأعمالي"],
  notebook: ["From the research archive","من أرشيف البحث"]
};
function localize() {
  const lang = language();
  title.textContent = headings[family][lang];
  items.forEach(({id,type,name,caption}) => {
    const record = exhibits[id];
    type.textContent = record[2 + lang];
    name.textContent = record[4 + lang];
    caption.textContent = record[6 + lang];
  });
}
localize();
new MutationObserver(localize).observe(document.documentElement, {attributes:true,attributeFilter:["lang"]});
})();
