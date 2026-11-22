/* Thirty source-aware interactive microstudies; all numbers are illustrative settings. */
(function (root) {
"use strict";
const groups=[
["chem","Chemistry","الكيمياء"],
["carrier","Drug delivery","توصيل الدواء"],
["lung","Lung mechanics","ميكانيكا الرئة"],
["life","Living systems","الأنظمة الحية"],
["measure","Microscopy & measurement","المجهر والقياس"],
["history","History & human record","التاريخ والسجل الإنساني"]
];
/* id, group, English title, Arabic title, English description, Arabic description,
   English control, Arabic control, source page */
const items=[
["indicator","chem","The changing probe","المجس المتغير","A conceptual change in an optical probe's color; not an experimental cyanide assay.","تغير توضيحي في لون مجس بصري؛ ليس اختبارًا تجريبيًا للسيانيد.","Chemical environment","المحيط الكيميائي","/research.html"],
["fluorescence","chem","Excitation and emission","الإثارة والانبعاث","A drawn sample emits more light as the illustrative excitation changes; no measured intensity is shown.","تزداد إضاءة عينة مرسومة مع تغير الإثارة الافتراضية؛ لا تُعرض شدة مقاسة.","Excitation","الإثارة","/research.html"],
["imine","chem","An imine bond","رابطة الإيمين","Two simplified fragments approach and form a schematic linkage, not a reaction-kinetic prediction.","يقترب جزآن جزيئيان مبسطان لتظهر رابطة تخطيطية، دون محاكاة حركية التفاعل.","Bond formation","تكوّن الرابطة","/research.html"],
["tlc","chem","The solvent front","جبهة المذيب","Move a front through a sketched chromatography plate; no experimental retention factors are implied.","حرّك جبهة المذيب على صفيحة كروماتوغرافية مرسومة؛ لا تمثل عوامل احتجاز تجريبية.","Front position","موضع الجبهة","/techniques.html"],
["peaks","chem","Resolving two peaks","فصل قمتين","Separate two ideal peaks to explore chromatography resolution without inventing an HPLC trace.","افصل قمتين مثاليتين لاستكشاف دقة الفصل دون اختلاق منحنى HPLC.","Peak spacing","تباعد القمتين","/techniques.html"],
["bilayer","carrier","Building a bilayer","بناء الطبقة الثنائية","Watch amphiphiles align around a conceptual vesicle; this is not a microscopy image.","راقب انتظام جزيئات مزدوجة الألفة حول حويصلة مفترضة؛ ليست صورة مجهرية.","Assembly","التجمّع","/research/inhalable-vesicles.html"],
["size","carrier","A size distribution","توزيع الأحجام","Vary an imagined spread of carrier sizes. This illustration is not an experimental DLS result.","غيّر تشتت أحجام نواقل افتراضية؛ الرسم ليس نتيجة DLS تجريبية.","Dispersity","التشتت","/research/inhalable-vesicles.html"],
["charge","carrier","Colloidal repulsion","التنافر الغروي","Separate like-charged particles. Real colloidal stability must be assessed experimentally.","باعد جسيمات متشابهة الشحنة؛ الثبات الغروي الحقيقي يتطلب قياسًا تجريبيًا.","Repulsion","التنافر","/research/inhalable-vesicles.html"],
["cargo","carrier","Cargo inside a carrier","الحمولة داخل الناقل","Alter the number of depicted molecules inside a carrier, without assigning encapsulation efficiency.","غيّر عدد الجزيئات المرسومة داخل ناقل دون إسناد كفاءة احتواء.","Cargo amount","مقدار الحمولة","/research/inhalable-vesicles.html"],
["nebulizer","carrier","The aerosol plume","سحابة الرذاذ","A stylized spray disperses from a nozzle; no particle-size or deposition measurement is claimed.","يتشتت رذاذ مرسوم من فوهة؛ لا تُدّعى قياسات لأحجام الجسيمات أو الترسب.","Plume extent","امتداد الرذاذ","/research/inhalable-vesicles.html"],
["airways","lung","Branching airways","الشعب الهوائية","Follow a marker through a branching airway; the drawing does not predict lung deposition.","تتبّع علامة عبر مجرى هوائي متفرّع؛ لا يتنبأ الرسم بالترسب الرئوي.","Transit","العبور","/research.html"],
["alveolus","lung","Alveolar expansion","تمدد الحويصلات","Expand drawn alveoli to explore deformation; these are not measured physiological strain values.","وسّع حويصلات مرسومة لتصور التشوه؛ ليست قيم شد فسيولوجية مقاسة.","Expansion","التمدد","/research.html"],
["surfactant","lung","The air–liquid interface","الحد الفاصل بين الهواء والسائل","Place schematic surfactant molecules at an interface without calculating surface tension.","ضع جزيئات خافض التوتر السطحي عند حد فاصل دون حساب التوتر السطحي.","Coverage","التغطية","/research.html"],
["barrier","lung","The epithelial boundary","الحاجز الظهاري","Open a hypothetical junction between cells; real epithelial permeability is not computed.","افتح وصلة افتراضية بين خلايا؛ لا تُحسب النفاذية الظهارية الفعلية.","Junction opening","انفتاح الوصلة","/research.html"],
["meniscus","lung","A moving meniscus","سطح سائل متحرك","Move a liquid interface along the epithelial layer, recalling airway-reopening experiments.","حرّك سطح سائل على طبقة ظهارية في إشارة إلى تجارب إعادة فتح المجرى الهوائي.","Interface position","موضع السطح","/research.html"],
["zebrafish","life","A fish in motion","سمكة تتحرك","Guide an illustrated zebrafish across the field; this is not captured animal behavior.","وجّه سمكة زرد مرسومة عبر مجال الرؤية؛ ليست حركة حيوان مسجلة.","Position","الموضع","/research/high-speed-zebrafish-imaging.html"],
["blood","life","Vascular circulation","الدوران الوعائي","Move drawn erythrocytes along a vessel; no numerical flow velocity is inferred.","حرّك كريات دم مرسومة داخل وعاء؛ لا تُستنتج سرعة جريان رقمية.","Transit","العبور","/research/high-speed-zebrafish-imaging.html"],
["heartbeat","life","An idealized pulse","نبضة مثالية","Scrub across a schematic pulsatile signal, not a recorded electrocardiogram.","انتقل على إشارة نبضية تخطيطية وليست تخطيط قلب مسجلًا.","Time","الزمن","/techniques.html"],
["cilia","life","Cilia orientation","اتجاه الأهداب","Tilt drawn endothelial cilia relative to a flow arrow; this does not establish flow dependence.","أمل أهدابًا بطانية مرسومة بالنسبة إلى سهم الجريان؛ الرسم لا يثبت الاعتماد على الجريان.","Tilt","الميل","/research.html"],
["frames","life","Sampling a moving animal","تصوير كائن متحرك","Change how many schematic video frames sample motion; frame count alone is not accuracy.","غيّر عدد الإطارات المرسومة التي تسجل حركة؛ العدد وحده لا يحدد الدقة.","Frame density","كثافة الإطارات","/research/high-speed-zebrafish-imaging.html"],
["focus","measure","A focal plane","المستوى البؤري","Move past a simulated sharp focal plane; these drawn objects are not microscopy data.","تحرك عبر مستوى بؤري واضح افتراضي؛ الأجسام رسومات وليست بيانات مجهرية.","Focus adjustment","ضبط التركيز","/techniques.html"],
["iris","measure","A microscope diaphragm","حجاب المجهر","Open the illustrated aperture to alter the visible beam; not a calibrated optical model.","افتح الفتحة المرسومة لتغيير حزمة الضوء؛ ليست محاكاة بصرية معايرة.","Aperture","الفتحة","/techniques.html"],
["roi","measure","A region of interest","منطقة اهتمام","Resize a region of interest around drawn cells to understand quantitative image selection.","غيّر مساحة منطقة اهتمام حول خلايا مرسومة لفهم اختيار القياس التصويري.","Selection size","حجم الاختيار","/research/high-speed-zebrafish-imaging.html"],
["tracking","measure","A particle trajectory","مسار جسيم","Reveal a hypothetical movement trace through time; no real trajectory is presented.","أظهر مسار حركة افتراضي عبر الزمن؛ لا يُعرض مسار تجريبي فعلي.","Track length","طول المسار","/research/high-speed-zebrafish-imaging.html"],
["calibration","measure","Scatter and a standard line","التشتت وخط المعايرة","Introduce synthetic noise around a reference line. The generated dots are not laboratory measurements.","أضف ضوضاء اصطناعية حول خط مرجعي؛ النقاط المولّدة ليست قياسات مخبرية.","Scatter","التشتت","/techniques.html"],
["manuscript","history","Opening a folio","فتح ورقة مخطوط","Turn a stylized manuscript leaf. It does not reproduce an actual historical document.","اقلب ورقة مخطوط مرسومة؛ لا تمثل وثيقة تاريخية أصلية.","Page turn","تقليب الورقة","/writing.html"],
["syrup","history","A syrup drop","قطرة شراب","Change the form of a stylized syrup drop; no historical recipe or measured viscosity is asserted.","غيّر هيئة قطرة شراب مرسومة دون ادعاء وصفة تاريخية أو لزوجة مقاسة.","Consistency","القوام","/writing.html"],
["light","history","Light and storage","الضوء والتخزين","Dim a conceptual bottle's surroundings; stability is a question to test, not an outcome shown here.","خفّض الإضاءة حول زجاجة تخطيطية؛ الثبات سؤال يجب اختباره وليس نتيجة معروضة.","Light exposure","التعرض للضوء","/writing.html"],
["citations","history","Following a source","تتبّع مصدر","Reveal a hypothetical chain from claim to evidence. The nodes are not invented citations.","أظهر سلسلة افتراضية من الادعاء إلى الدليل؛ العقد ليست إحالات مختلقة.","Source trail","سلسلة المصادر","/publications.html"],
["milestones","history","Three dated moments","ثلاث محطات مؤرخة","Move between the 2009 school chemistry exhibition, the 2015 sensing project, and current 2026 formulation research.","تنقّل بين معرض الكيمياء المدرسي عام ٢٠٠٩ ومشروع الاستشعار عام ٢٠١٥ وبحث الصيغ الدوائية عام ٢٠٢٦.","Year in focus","السنة المختارة","/stories.html"]
];
root.RuwaidixAtlasData={groups,items};
})(typeof globalThis!=="undefined"?globalThis:window);