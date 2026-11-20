/* Ruwaidix kinetic atlas — 21 November 2026.
   Twenty-two original illustrated interactions: four on the homepage,
   eighteen on separate subject-specific pages. All visuals are schematic,
   never representations of measured experimental results. Zero dependencies. */
(() => {
  "use strict";

  const homeScenes = [
    {key: "h-projector", art:"projector", selector:"#rx-film-title", material:"navy", 
     title:["Through the projector","عبر عدسة العرض"], detail:["A film becomes a sequence of observations. Activate the aperture to change the light.","يتحوّل الفيلم إلى تسلسل من المشاهدات. اضغط على العدسة لتغيير الضوء."],
     href:"/films.html", link:["Explore the research films","استكشف الأفلام البحثية"]},
    {key: "h-flowcell", art:"flowcell", selector:"#rx-observation-title", material:"graph",
     title:["The flow chamber","حجرة تدفّق السوائل"], detail:["An illustrative air–liquid interface and a cell layer. No flow rate or injury measurement is depicted.","رسم لسطح التماس بين الهواء والسائل وطبقة خلوية، دون تصوير قياسات فعلية للتدفّق أو الإصابة."],
     href:"/research/pulmonary-epithelial-injury.html",link:["Read the lung injury study","اقرأ دراسة إصابة خلايا الرئة"]},
    {key: "h-negative", art:"negative", selector:"#journey-title", material:"photo",
     title:["A fragment of the archive","لقطة من الأرشيف"], detail:["The shifting frame suggests how photographs preserve only part of a larger experience.","يشير الإطار المتحرّك إلى أن الصور تحتفظ بجزء فقط من تجربة أوسع."],
     href:"/stories.html#what-i-kept",link:["Open the personal archive","افتح الأرشيف الشخصي"]},
    {key: "h-nib", art:"nib", selector:"#writing .section-title", material:"paper",
     title:["Writing in the margins","الكتابة على الهوامش"], detail:["The ink line moves between a claim, its evidence, and a question worth keeping.","يمتد خط الحبر بين الادعاء ودليله والسؤال الذي يستحق البقاء."],
     href:"/writing.html",link:["Read the essays","اقرأ المقالات"]}
  ];

  const pageScenes = [
    {key: "p-curcumin", page:"research.html", art:"curcumin", selector:"#molecular-chemistry h2", material:"graph",
     title:["A molecule under examination","جزيء قيد الفحص"], detail:["The response of a colour probe is not by itself proof of selectivity.","لا تكفي استجابة المسبار اللوني وحدها لإثبات الانتقائية."],
     href:"/grants/urep23.html",link:["See the chemistry project","اطّلع على مشروع الكيمياء"]},
    {key: "p-bibliography", page:"publications.html", art:"bibliography", selector:".pub-hero h1", material:"paper",
     title:["The paper trail","سجلّ الأوراق العلمية"], detail:["Turn the conceptual folio to distinguish the paper, the experiment and the contribution.","اقلب الورقة التوضيحية للتمييز بين المنشور والتجربة والمساهمة."],
     href:"/methods-evidence.html",link:["Follow the methods","تتبّع المنهجيات"]},
    {key: "p-reel", page:"films.html", art:"reel", selector:"#released-title", material:"navy",
     title:["A research film in motion","شريط بحثي متحرّك"], detail:["The moving reel is a drawing, not original footage from an experiment.","البكرة المتحرّكة رسم توضيحي وليست تسجيلًا أصليًا لتجربة."],
     href:"/moving-evidence.html",link:["Watch the original recordings","شاهد التسجيلات الأصلية"]},
    {key: "p-microscope", page:"stories.html", art:"microscope", selector:"#personal-microscope h2", material:"photo",
     title:["The microscope on the desk","المجهر فوق المكتب"], detail:["A personal instrument is part of the story of learning, not a substitute for a research microscope.","الأداة الشخصية جزء من قصة التعلّم، وليست بديلًا عن المجهر البحثي."],
     href:"/stories/cairo-microscope.html",link:["Follow the microscope's story","اقرأ حكاية المجهر"]},
    {key: "p-letterpress", page:"writing.html", art:"letterpress", selector:"#essays h2", material:"margin",
     title:["A sentence in revision","جملة قيد المراجعة"], detail:["Move the editorial marks across a line, then return to the published words.","حرّك علامات التحرير فوق السطر، ثم عد إلى النصوص المنشورة."],
     href:"/writing.html#essay-the-life-between-diagnoses",link:["Read a published essay","اقرأ مقالة منشورة"]},
    {key: "p-drawer", page:"archive.html", art:"drawer", selector:"#archive-objects-title", material:"photo",
     title:["Open the specimen drawer","افتح درج المقتنيات"], detail:["Objects retain a provenance that must accompany their interpretation.","تحتفظ الأشياء بتاريخ ومصدر ينبغي أن يصاحبا تفسيرها."],
     href:"/stories/cairo-microscope.html",link:["Read an object's history","اقرأ تاريخ إحدى المقتنيات"]},
    {key: "p-shear", page:"methods-evidence.html", art:"shear", selector:"#physiology h2", material:"graph",
     title:["An air–liquid interface","سطح تماس الهواء والسائل"], detail:["Animated streamlines illustrate the experimental geometry; they are not measured velocities.","توضح خطوط الجريان المتحرّكة هندسة التجربة ولا تمثّل سرعات مقاسة."],
     href:"/research/pulmonary-epithelial-injury.html",link:["Examine the experimental model","افحص النموذج التجريبي"]},
    {key: "p-vesicle", page:"molecular-therapeutics.html", art:"vesicle", selector:"#present-work h2", material:"navy",
     title:["Across the carrier membrane","عبر غشاء الناقل الدوائي"], detail:["The layers represent a conceptual carrier, not a validated particle size or drug-release profile.","تمثل الطبقات ناقلًا دوائيًا تصوريًا، لا حجم جسيمات مثبتًا أو منحنى تحرّر دواء."],
     href:"/research/inhalable-vesicles.html",link:["Explore inhalable carriers","استكشف النواقل المستنشقة"]},
    {key: "p-neural", page:"computing.html", art:"neural", selector:"#evidence h2", material:"graph",
     title:["From pixels to predictions","من البكسلات إلى التنبؤات"], detail:["A network illustration cannot establish clinical accuracy without validation.","لا يثبت رسم الشبكة دقةً سريريةً دون التحقق من صحة النموذج."],
     href:"/research.html#computation",link:["Read the computational record","اقرأ السجل الحاسوبي"]},
    {key: "p-echo", page:"imaging.html", art:"echo", selector:".hero h1", material:"navy",
     title:["Inside an imaging window","داخل نافذة التصوير"], detail:["The sweep is a visual metaphor for imaging, not a real echocardiographic trace.","المسح استعارة بصرية للتصوير، وليس تخطيط صدى قلب حقيقيًا."],
     href:"/research/high-speed-zebrafish-imaging.html",link:["Inspect original imaging","افحص التصوير الأصلي"]},
    {key: "p-governance", page:"training.html", art:"governance", selector:"#governance h2", material:"paper",
     title:["Training is a documented record","التدريب سجلّ موثّق"], detail:["The rotating seal represents scrutiny, not a new certificate or qualification.","يرمز الختم المتحرّك إلى المراجعة، ولا يمثّل شهادة أو مؤهلًا جديدًا."],
     href:"/methods-evidence.html",link:["See methods in practice","اطّلع على تطبيق المنهجيات"]},
    {key: "p-grants", page:"grants.html", art:"grants", selector:".hero h1", material:"graph",
     title:["Four paths through research","أربعة مسارات بحثية"], detail:["Each line signifies a documented project; the lengths are illustrative, not comparable budgets.","يمثل كل خط مشروعًا موثقًا، وأطوال الخطوط توضيحية وليست مقارنة للتمويل."],
     href:"/grants/urep23.html",link:["Open a project record","افتح سجلّ مشروع"]},
    {key: "p-network", page:"leadership.html", art:"network", selector:"#acs h2", material:"paper",
     title:["A chapter built by people","فصل علمي يصنعه الناس"], detail:["The network is a metaphor for collaboration, not a quantitative social analysis.","الشبكة استعارة للتعاون، وليست تحليلًا كميًا للعلاقات."],
     href:"/chem-squad.html",link:["Visit a continuing science circle","تعرّف إلى المجموعة العلمية"]},
    {key: "p-beaker", page:"engagement.html", art:"beaker", selector:"#chemistry-festival h2", material:"photo",
     title:["Chemistry leaves the bench","الكيمياء خارج المختبر"], detail:["A playful demonstration vessel recalls conversations at public chemistry events.","تعيد قارورة العرض التوضيحية إلى الذاكرة حوارات فعاليات الكيمياء العامة."],
     href:"/stories.html#community",link:["Follow the community story","اقرأ حكاية المجتمع العلمي"]},
    {key: "p-frontier", page:"research-horizon.html", art:"frontier", selector:"#questions h2", material:"navy",
     title:["From exposure to response","من التعرّض إلى الاستجابة"], detail:["The animated barriers are hypotheses for future investigation, not observed therapeutic outcomes.","الحواجز المتحركة تمثّل فرضيات للبحث المستقبلي لا نتائج علاجية ملحوظة."],
     href:"/molecular-therapeutics.html#research-agenda",link:["Explore the research agenda","استكشف الأجندة البحثية"]},
    {key: "p-book", page:"recommended-books.html", art:"book", selector:".rr-hero h1", material:"paper",
     title:["Pages in conversation","صفحات تتحاور"], detail:["An opening book changes its reading angle without changing the works themselves.","يتغيّر منظور الكتاب المفتوح دون أن تتغيّر الأعمال التي يضمها."],
     href:"/recommended-essays.html",link:["Continue with essays","واصل القراءة مع المقالات"]},
    {key: "p-heptagon", page:"chem-squad.html", art:"heptagon", selector:"#hero-title", material:"graph",
     title:["A circle that kept meeting","مجموعة واصلت اللقاء"], detail:["Seven points recall an enduring scientific discussion; they are not a network metric.","تذكّر النقاط السبع بحوار علمي مستمر، ولا تمثل مقياسًا للشبكات."],
     href:"/leadership.html#acs",link:["Read the organizational story","اقرأ حكاية العمل التنظيمي"]},
    {key: "p-margins", page:"major-revisions.html", art:"margins", selector:"#book-title", material:"margin",
     title:["The unfinished manuscript","المخطوط الذي لم يكتمل"], detail:["Move the marginal notes. The book remains a work in progress.","حرّك ملاحظات الهوامش؛ فالكتاب لا يزال قيد الكتابة."],
     href:"/writing.html",link:["Read the existing writing","اقرأ الكتابات المنشورة"]}
  ];

  const ink="#d7c29e", pale="#c3d9ed", blue="#86aedd";
  const stroke = (d,w=3,klass="")=>'<path class="'+klass+'" d="'+d+'" fill="none" stroke="'+pale+'" stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round"/>';
  const light = (d,w=2,klass="")=>'<path class="'+klass+'" d="'+d+'" fill="none" stroke="'+ink+'" stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round"/>';
  const circle = (x,y,r,c=pale,klass="")=>'<circle class="'+klass+'" cx="'+x+'" cy="'+y+'" r="'+r+'" fill="none" stroke="'+c+'" stroke-width="2.4"/>';
  const dot = (x,y,r=4,c=ink,klass="rx-z-particle")=>'<circle class="'+klass+'" cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+c+'"/>';
  const rect = (x,y,w,h,c=pale,klass="")=>'<rect class="'+klass+'" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="3" fill="none" stroke="'+c+'" stroke-width="2.5"/>';
  const wheel = (cx,cy,r)=>'<g class="rx-z-wheel">'+circle(cx,cy,r,ink)+circle(cx,cy,4,ink)+
    Array.from({length:6},(_,i)=>{const a=i*Math.PI/3;return light('M'+(cx+9*Math.cos(a)).toFixed(1)+' '+(cy+9*Math.sin(a)).toFixed(1)+' L'+(cx+(r-6)*Math.cos(a)).toFixed(1)+' '+(cy+(r-6)*Math.sin(a)).toFixed(1),1.6)}).join("")+'</g>';
  const grid = '<path d="M12 35H168M12 70H168M12 105H168M45 10V130M90 10V130M135 10V130" stroke="'+blue+'" stroke-width=".65" opacity=".24"/>';

  const drawings = {
    projector: wheel(54,57,30)+wheel(126,57,18)+rect(31,91,118,20,ink)+
      light("M85 88l30 0 25-28M26 113h127")+stroke("M150 93l18-14",-0.0,"rx-z-drift")+
      '<path class="rx-z-rays" d="M155 45L177 17M157 59L178 59M152 73L173 96" stroke="'+ink+'" stroke-width="2" opacity=".8"/>',
    flowcell: grid+rect(20,35,140,62,pale)+stroke("M21 50h138M21 65h138M21 80h138",1.5,"rx-z-stream")+
      '<path d="M22 100h136" stroke="'+ink+'" stroke-width="5"/>'+
      Array.from({length:7},(_,i)=>dot(33+i*18,91,5,ink,"rx-z-cell")).join("")+light("M20 25h140",2),
    negative: '<g class="rx-z-pages">'+rect(22,22,120,82,ink)+rect(30,28,108,70,pale)+
      '<path d="M40 91l28-30 16 17 23-35 20 48" fill="none" stroke="'+pale+'" stroke-width="3"/>'+
      dot(63,47,8,ink,"rx-z-glow")+'</g>'+Array.from({length:6},(_,i)=>rect(24+i*20,10,11,8,pale)).join("")+
      '<path d="M17 114h145" stroke="'+ink+'" stroke-width="2"/>',
    nib: light("M38 117l22-20 65-72 16 16-72 65-31 11z",3,"rx-z-drift")+
      stroke("M73 93l53-53M49 110l16-6",2)+dot(41,120,4,ink,"rx-z-glow")+
      '<path class="rx-z-ink" d="M25 127Q89 119 153 125" stroke="'+blue+'" stroke-width="2" fill="none" stroke-linecap="round"/>',
    curcumin: '<g class="rx-z-wheel">'+light("M22 66l18-11 19 11v22l-19 11-18-11ZM91 66l19-11 19 11v22l-19 11-19-11Z",2.3)+
      light("M59 76h32M40 55v-15M111 55v-15")+dot(40,40,5)+dot(111,40,5)+'</g>'+
      stroke("M18 115h144",1.8)+stroke("M24 112q18-44 42-2t45-18t44 15",2,"rx-z-scanline"),
    bibliography: '<g class="rx-z-pages">'+rect(49,17,93,105,ink)+rect(38,24,93,101,pale)+
      light("M53 48h60M53 61h58M53 75h47M53 88h60M53 102h31",2.5)+'</g>'+
      '<path d="M117 25v28l10-8 8 8V25" fill="'+blue+'" opacity=".7"/>',
    reel: wheel(60,64,37)+wheel(120,64,28)+rect(19,110,139,12,ink)+
      '<path class="rx-z-stream" d="M94 47q6-10 11 0M96 81q9 14 14 0" stroke="'+pale+'" stroke-width="2" fill="none"/>',
    microscope: light("M82 23l29 21-16 23-28-19zM106 52q28 25 14 47M47 116h95M75 104l-17-25",4)+
      stroke("M50 68h65M40 90h85",4)+rect(63,109,62,8,ink)+circle(48,91,12,ink,"rx-z-wheel")+
      '<path class="rx-z-glow" d="M90 73L96 100" stroke="'+blue+'" stroke-width="3"/>',
    letterpress: rect(18,20,144,96,ink)+stroke("M33 46h117M33 63h95M33 80h108",3)+
      '<path class="rx-z-ink" d="M33 90h78" stroke="'+ink+'" stroke-width="3"/>'+
      '<path class="rx-z-drift" d="M122 37l9-13 9 13 8 3-8 4-9 13-9-13-8-4z" fill="none" stroke="'+blue+'" stroke-width="2"/>',
    drawer: rect(20,15,140,111,ink)+rect(27,39,126,31,pale)+rect(27,77,126,31,pale)+
      '<g class="rx-z-pages">'+rect(74,83,35,17,ink)+rect(69,46,42,17,ink)+'</g>'+
      light("M83 119h18",2),
    shear: grid+stroke("M16 47h148M16 99h148",5)+
      Array.from({length:7},(_,i)=>dot(28+i*20,92,5,ink,"rx-z-cell")).join("")+
      '<path class="rx-z-stream" d="M21 55h134M21 66h134M21 77h134" stroke="'+pale+'" stroke-width="2" stroke-dasharray="10 10"/>',
    vesicle: '<g class="rx-z-wheel">'+circle(90,69,49,ink)+circle(90,69,35,pale)+
      Array.from({length:16},(_,i)=>{const a=i*Math.PI/8;return dot((90+42*Math.cos(a)).toFixed(1),(69+42*Math.sin(a)).toFixed(1),4,i%2?blue:ink,"rx-z-membrane")}).join("")+
      [dot(79,69,5,pale),dot(101,63,5,ink),dot(96,82,4,pale)]+'</g>',
    neural: grid+stroke("M28 28L91 25L151 32M28 69L91 25L151 74M28 111L91 117L151 74M91 25L91 117M28 69L91 117L151 112M28 111L91 25",1.6)+
      [28,69,111].map(y=>dot(28,y,5,ink)).join("")+
      [25,117].map(y=>dot(91,y,6,blue)).join("")+
      [32,74,112].map(y=>dot(151,y,5,ink,"rx-z-glow")).join(""),
    echo: '<path d="M90 12A60 60 0 0 1 150 78L90 128L30 78A60 60 0 0 1 90 12Z" fill="none" stroke="'+ink+'" stroke-width="2.5"/>'+
      '<path class="rx-z-scanline" d="M90 70L141 31" stroke="'+blue+'" stroke-width="6" stroke-linecap="round"/>'+
      stroke("M45 84h15l10-19 11 35 12-24 9 8h35",2.5)+circle(90,72,26,pale,"rx-z-pulse"),
    governance: '<g class="rx-z-wheel">'+circle(90,68,51,ink)+circle(90,68,38,pale)+
      '<path d="M65 66l17 16 35-38" fill="none" stroke="'+blue+'" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></g>'+
      light("M48 117L35 135M132 117l13 18",2),
    grants: [30,65,100,135].map((x,i)=>light("M"+x+" 115V"+(38+i*6)+"M"+(x-8)+" "+(46+i*6)+"l8-10 8 10",2.3,"rx-z-stream")).join("")+
      light("M15 125h151",2)+[30,65,100,135].map((x,i)=>dot(x,38+i*6,6,blue,"rx-z-glow")).join(""),
    network: stroke("M30 93L60 32L118 38L151 90L110 112L58 108L30 93M60 32L110 112M118 38L58 108M30 93L118 38",2)+
      [[30,93],[60,32],[118,38],[151,90],[110,112],[58,108]].map(([x,y])=>dot(x,y,7,ink,"rx-z-glow")).join(""),
    beaker: light("M59 21h64M71 22v34L44 115q-3 13 12 13h72q15 0 8-15l-26-57V22",3)+
      '<path class="rx-z-stream" d="M58 99q20 9 35 1t31-2v18H57z" fill="'+blue+'" opacity=".4"/>'+
      [[70,92,5],[91,79,4],[110,89,6],[84,55,3]].map(([x,y,r])=>dot(x,y,r,ink,"rx-z-particle")).join(""),
    frontier: [53,76,99].map(x=>light("M"+x+" 25V117",5,"rx-z-barrier")).join("")+
      '<path class="rx-z-stream" d="M17 70h143" stroke="'+blue+'" stroke-width="2" stroke-dasharray="5 8"/>'+
      dot(28,70,7,ink,"rx-z-particle")+dot(152,70,7,pale,"rx-z-glow")+circle(90,70,58,ink),
    book: '<g class="rx-z-pages">'+light("M90 37q-32-21-68-6v85q39-11 68 11q30-22 68-11V31q-34-15-68 6z",3)+
      light("M90 37v90M34 55q19-7 39 1M34 72q19-7 39 1M108 55q19-8 36-2M108 72q19-8 36-2",2)+
      '<path d="M146 35v33l-9-9-9 9V34" fill="'+blue+'" opacity=".6"/></g>',
    heptagon: '<path d="M90 14L136 35L151 82L117 121L63 121L29 82L44 35Z" fill="none" stroke="'+ink+'" stroke-width="3"/>'+
      stroke("M90 14L90 70L136 35M90 70L151 82M90 70L117 121M90 70L63 121M90 70L29 82M90 70L44 35",1.8)+
      [[90,14],[136,35],[151,82],[117,121],[63,121],[29,82],[44,35]].map(([x,y])=>dot(x,y,6,blue,"rx-z-glow")).join("")+dot(90,70,7,ink,"rx-z-pulse"),
    margins: '<g class="rx-z-pages">'+rect(34,16,112,114,pale)+
      stroke("M49 41h61M49 58h75M49 75h52M49 92h72",2)+
      '<path class="rx-z-ink" d="M110 29l31 19M120 21l-8 31M52 98q31 13 64 0" stroke="'+ink+'" stroke-width="2" fill="none"/>'+
      '<path d="M127 106l11 9 14-20" fill="none" stroke="'+blue+'" stroke-width="3"/></g>'
  };

  const pageFile = location.pathname.split("/").pop() || "index.html";
  const scenes = pageFile==="index.html" ? homeScenes : pageScenes.filter(s=>s.page===pageFile);
  if(!scenes.length) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const bilingual = (en, ar) => '<span data-rx-z-en lang="en">'+en+'</span><span data-rx-z-ar lang="ar" dir="rtl">'+ar+'</span>';
  const idleLabel = bilingual("Schematic illustration · activate to inspect","رسم توضيحي · اضغط لاستكشاف التفاصيل");
  const visible = [];

  function mount(config){
    const anchor = document.querySelector(config.selector);
    if(!anchor || document.getElementById("rx-z-"+config.key))return;
    const figure=document.createElement("figure");
    figure.id="rx-z-"+config.key;
    figure.className="rx-z-scene";
    figure.dataset.art=config.art;
    figure.dataset.material=config.material;
    figure.dataset.active="false";
    figure.dataset.rxZVisible="true";
    const h="rx-z-title-"+config.key;
    figure.innerHTML =
      '<button class="rx-z-object" type="button" aria-pressed="false" aria-labelledby="'+h+'">'+
        '<span class="rx-z-glass" aria-hidden="true"><svg viewBox="0 0 180 142" role="presentation" focusable="false">'+drawings[config.art]+'</svg></span>'+
        '<span class="rx-z-mini" aria-hidden="true">+</span>'+
      '</button>'+
      '<figcaption class="rx-z-caption">'+
        '<span class="rx-z-type">'+idleLabel+'</span>'+
        '<strong id="'+h+'">'+bilingual(...config.title)+'</strong>'+
        '<p class="rx-z-explanation">'+bilingual(...config.detail)+'</p>'+
        '<a class="rx-z-route" href="'+config.href+'">'+bilingual(...config.link)+' <span aria-hidden="true">↗</span></a>'+
      '</figcaption>';
    anchor.insertAdjacentElement("afterend",figure);
    const button=figure.querySelector("button");
    function setActive(value){
      figure.dataset.active=value?"true":"false";
      button.setAttribute("aria-pressed",value?"true":"false");
    }
    button.addEventListener("click",()=>setActive(figure.dataset.active!=="true"));
    button.addEventListener("keydown",e=>{
      if(e.key==="Escape" && figure.dataset.active==="true"){setActive(false);e.preventDefault();}
    });
    button.addEventListener("pointermove",e=>{
      if(reduced.matches || e.pointerType==="touch")return;
      const r=button.getBoundingClientRect();
      if(!r.width || !r.height)return;
      const x=Math.max(-1,Math.min(1,(e.clientX-r.left-r.width/2)/(r.width/2)));
      const y=Math.max(-1,Math.min(1,(e.clientY-r.top-r.height/2)/(r.height/2)));
      button.style.setProperty("--rx-z-x",(x*6).toFixed(2)+"deg");
      button.style.setProperty("--rx-z-y",(y*-5).toFixed(2)+"deg");
    },{passive:true});
    const reset=()=>{
      button.style.removeProperty("--rx-z-x");
      button.style.removeProperty("--rx-z-y");
    };
    button.addEventListener("pointerleave",reset);
    button.addEventListener("blur",reset);
    visible.push(figure);
  }

  scenes.forEach(mount);
  if(!visible.length)return;
  if("IntersectionObserver" in window) {
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{entry.target.dataset.rxZVisible=entry.isIntersecting?"true":"false";});
    },{rootMargin:"90px"});
    visible.forEach(figure=>observer.observe(figure));
  }
  document.addEventListener("visibilitychange",()=>{
    document.documentElement.dataset.rxZHidden=document.hidden?"true":"false";
  });
})();