/* A keyboard-operated contact sheet built from the four existing archive cards. */
(() => {
  const grid = document.querySelector(".rx-chapter-grid");
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll(":scope > .rx-chapter-card"));
  const scenes = [
    {
      en: ["The anatomy room", "In the textbook, the boundaries between organs were tidy. At the anatomy table in 2011, I could see how little space there was between them.", "Read the fox anatomy account"],
      ar: ["قاعة التشريح", "بدت الحدود بين الأعضاء واضحة في الكتاب. وعلى طاولة التشريح عام ٢٠١١ رأيت بعيني كم كانت المسافة بينها ضئيلة.", "اقرأ حكاية تشريح الثعلب"],
      path: "/stories.html#anatomy"
    },
    {
      en: ["The chemistry bench", "We set out to make a ring. When the reaction took a different course, the question became what we had actually made.", "Read The Ring That Never Closed"],
      ar: ["منضدة الكيمياء", "أردنا تحضير مركّب حلقي. وحين سلك التفاعل مسارًا آخر، صار السؤال أيَّ مركّب حضّرنا بالفعل.", "اقرأ حكاية الحلقة التي لم تُغلق"],
      path: "/stories/the-ring-that-never-closed.html"
    },
    {
      en: ["Under the microscope", "In a living zebrafish, the heart keeps beating while the camera records. Capturing that movement meant choosing how fast to acquire the images.", "Explore the high-speed imaging setup"],
      ar: ["تحت المجهر", "يستمر قلب سمكة الزرد الحية في النبض أثناء التصوير. ولتتبُّع حركته كان علينا اختيار السرعة المناسبة لالتقاط الصور.", "تعرّف إلى إعداد التصوير عالي السرعة"],
      path: "/research/high-speed-zebrafish-imaging.html"
    },
    {
      en: ["An airway reopens", "As an air bubble moved through the flow chamber, the cells beneath it experienced a mechanical insult. We could then measure how many survived.", "See how the injury was measured"],
      ar: ["حين ينفتح المجرى الهوائي", "مرّت فقاعة هواء في حجرة التدفّق، فتعرّضت الخلايا تحتها لإجهاد ميكانيكي. وبعد مرورها استطعنا قياس عدد الخلايا التي بقيت حيّة.", "اطّلع على كيفية قياس الإصابة"],
      path: "/research/pulmonary-epithelial-injury.html"
    }
  ];
  if (cards.length !== scenes.length || cards.some(card => !card.querySelector(".rx-chapter-image img"))) return;
  const tabs = document.createElement("div");
  tabs.className = "rx-scene-tabs";
  tabs.setAttribute("role", "tablist");
  tabs.setAttribute("aria-labelledby", "rx-chapter-heading");
  const make = (tag, cls) => Object.assign(document.createElement(tag), {className: cls});
  let active = 0;
  const entries = cards.map((card, index) => {
    const photo = card.querySelector(".rx-chapter-image");
    const image = photo.querySelector("img");
    const tab = make("button", "rx-scene-tab");
    tab.type = "button";
    tab.id = "scene-tab-" + (index + 1);
    tab.setAttribute("role", "tab");
    const thumb = make("img", "rx-scene-thumb");
    thumb.src = image.getAttribute("src");
    thumb.loading = "lazy";
    thumb.alt = "";
    const label = make("span", "rx-scene-tab-label");
    tab.append(thumb, label);
    tabs.append(tab);

    const panel = make("div", "rx-scene-page");
    panel.id = "scene-page-" + (index + 1);
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", tab.id);
    tab.setAttribute("aria-controls", panel.id);
    const copy = make("div", "rx-scene-copy");
    const note = make("p", "rx-scene-note");
    const link = make("a", "rx-scene-link");
    link.href = scenes[index].path;
    copy.append(card, note, link);
    panel.append(photo, copy);
    grid.append(panel);
    tab.addEventListener("click", () => select(index));
    tab.addEventListener("keydown", event => {
      let target;
      const direction = document.documentElement.dir === "rtl" ? -1 : 1;
      if (event.key === "ArrowRight") target = active + direction;
      else if (event.key === "ArrowLeft") target = active - direction;
      else if (event.key === "Home") target = 0;
      else if (event.key === "End") target = entries.length - 1;
      else return;
      event.preventDefault();
      select((target + entries.length) % entries.length);
      entries[active].tab.focus();
    });
    return {tab, panel, label, note, link};
  });
  function select(index) {
    active = index;
    entries.forEach(({tab, panel}, i) => {
      const current = i === index;
      tab.setAttribute("aria-selected", String(current));
      tab.tabIndex = current ? 0 : -1;
      panel.hidden = !current;
    });
  }
  function localize() {
    const lang = document.documentElement.lang.startsWith("ar") ? "ar" : "en";
    entries.forEach(({label, note, link}, i) => {
      [label.textContent, note.textContent, link.textContent] = scenes[i][lang];
    });
  }
  grid.classList.add("rx-scene-stage");
  grid.before(tabs);
  localize();
  select(0);
  new MutationObserver(localize).observe(document.documentElement, {attributes: true, attributeFilter: ["lang"]});
})();
