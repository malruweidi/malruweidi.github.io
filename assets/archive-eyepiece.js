/* The instrument is the author's Cairo microscope. The two photographs come
   from the biological methods archive and retain their original captions. */
(() => {
  const grid = document.querySelector(".rx-editorial-hero .rx-hero-grid");
  if (!grid || typeof HTMLDialogElement !== "function") return;

  const specimens = [
    {
      src: "/assets/zebrafish-embryo-microscopy.webp",
      title: ["Embryo", "الجنين"],
      description: [
        "Bright-field image of a zebrafish embryo within its chorion. The original record gives no verified developmental stage or magnification.",
        "صورة بالمجهر ذي المجال المضيء لجنين سمكة الزرد داخل غشائه. لم تُوثّق في السجل الأصلي مرحلة النمو أو قوة التكبير."
      ]
    },
    {
      src: "/assets/zebrafish-larva-microscopy.webp",
      title: ["Hatched larva", "يرقة بعد الفقس"],
      description: [
        "Bright-field image of a hatched zebrafish larva. The archive records this specimen without assigning a treatment or phenotype.",
        "صورة بالمجهر ذي المجال المضيء ليرقة سمكة الزرد بعد الفقس. يوثّق الأرشيف العيّنة دون أن ينسب إليها معالجة تجريبية أو نمطًا ظاهريًا."
      ]
    }
  ];
  const create = (tag, cls) => Object.assign(document.createElement(tag), {className: cls});
  const button = cls => Object.assign(create("button", cls), {type: "button"});
  const words = [];
  const label = (element, en, ar) => { words.push({element, labels: [en, ar]}); return element; };
  const language = () => document.documentElement.lang.startsWith("ar") ? 1 : 0;

  const trigger = button("rx-scope-object");
  trigger.dataset.i18nIgnore = "";
  trigger.setAttribute("aria-haspopup", "dialog");
  const shadow = create("span", "rx-scope-shadow");
  shadow.setAttribute("aria-hidden", "true");
  shadow.append(create("span", "rx-scope-silhouette"));
  trigger.append(shadow, label(create("span", "rx-scope-tag"), "Look through the lens", "انظر من العدسة"));
  grid.append(trigger);

  const dialog = create("dialog", "rx-optics");
  dialog.dataset.i18nIgnore = "";
  dialog.setAttribute("aria-labelledby", "rx-optics-title");
  const shell = create("div", "rx-optics-shell");
  const bar = create("div", "rx-optics-bar");
  const title = label(create("h2", "rx-optics-title"), "At the eyepiece", "عند العدسة العينية");
  title.id = "rx-optics-title";
  const close = label(button("rx-optics-close"), "Close", "إغلاق");
  bar.append(title, close);
  const lens = create("div", "rx-optics-lens");
  const image = create("img", "rx-optics-image");
  image.alt = "";
  lens.append(image);
  const notes = create("div", "rx-optics-notes");
  const tabs = create("div", "rx-optics-tabs");
  tabs.setAttribute("role", "group");
  const caption = create("p", "rx-optics-caption");
  caption.setAttribute("aria-live", "polite");
  const zoomLabel = label(create("label", "rx-optics-zoom-label"), "Digital zoom", "التكبير الرقمي");
  const zoom = create("input", "rx-optics-zoom");
  Object.assign(zoom, {type: "range", id: "rx-optics-zoom", min: "1", max: "2", step: ".05", value: "1"});
  zoomLabel.htmlFor = zoom.id;
  const zoomValue = create("output", "rx-optics-value");
  zoomValue.setAttribute("for", zoom.id);
  const controls = create("div", "rx-optics-controls");
  controls.append(zoomLabel, zoomValue, zoom);
  const links = create("div", "rx-optics-links");
  const story = label(create("a", ""), "The microscope I brought from Cairo", "المجهر الذي أحضرته من القاهرة");
  story.href = "/stories/cairo-microscope.html";
  const methods = label(create("a", ""), "See the original specimen photographs", "شاهد الصور الأصلية للعيّنتين");
  methods.href = "/techniques.html#biological";
  links.append(story, methods);
  notes.append(tabs, caption, controls, links);
  shell.append(bar, lens, notes);
  dialog.append(shell);
  document.body.append(dialog);

  let selected = 0;
  const choices = specimens.map((entry, i) => {
    const choice = label(button("rx-optics-choice"), ...entry.title);
    choice.addEventListener("click", () => {
      selected = i;
      zoom.value = "1";
      render();
    });
    tabs.append(choice);
    return choice;
  });
  function magnify() {
    image.style.scale = zoom.value;
    const locale = language() ? "ar" : "en";
    const factor = Number(zoom.value).toLocaleString(locale, {maximumFractionDigits: 2});
    zoomValue.textContent = factor + "×";
    zoom.setAttribute("aria-valuetext", factor + "×");
  }
  function render() {
    const lang = language();
    words.forEach(({element, labels}) => { element.textContent = labels[lang]; });
    tabs.setAttribute("aria-label", lang ? "اختيار العيّنة" : "Choose a specimen");
    choices.forEach((choice, i) => choice.setAttribute("aria-pressed", String(selected === i)));
    if (dialog.open && image.getAttribute("src") !== specimens[selected].src) image.src = specimens[selected].src;
    caption.textContent = specimens[selected].description[lang];
    magnify();
  }
  trigger.addEventListener("click", () => {
    dialog.showModal();
    render();
    close.focus();
  });
  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => trigger.focus({preventScroll: true}));
  zoom.addEventListener("input", magnify);
  render();
  new MutationObserver(render).observe(document.documentElement, {attributes: true, attributeFilter: ["lang"]});
})();
