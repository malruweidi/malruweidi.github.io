/* Ruwaidix bilingual interface: dependency-free and compatible with GitHub Pages. */
(function () {
  "use strict";
  var STORAGE_KEY = "ruwaidix-language";
  var dictionary = window.RuwaidixArabicDictionary || {};
  var textCache = new WeakMap();
  var attributeCache = new WeakMap();
  var locale = "en";
  var originalsTitle = document.title;
  var titles = {
    "/": "محمود خطيب علي عبدالرسول الرويدي | البحث العلمي والكتابة",
    "/index.html": "محمود خطيب علي عبدالرسول الرويدي | البحث العلمي والكتابة",
    "/archive.html": "الأرشيف العلمي والشخصي | محمود الرويدي",
    "/stories.html": "حكايات من وراء التجارب | محمود الرويدي",
    "/chem-squad.html": "فريق الكيمياء | سبعة كيميائيين وحوار علمي متواصل",
    "/leadership.html": "القيادة والإدارة | محمود الرويدي",
    "/computing.html": "الذكاء الاصطناعي والحوسبة العلمية | محمود الرويدي",
    "/cv.html": "السيرة الأكاديمية | محمود الرويدي",
    "/figures.html": "الأشكال والبيانات البحثية | محمود الرويدي",
    "/grants.html": "المنح والمشروعات البحثية | محمود الرويدي",
    "/imaging.html": "التصوير العلمي والتحليل الكمي | محمود الرويدي",
    "/techniques.html": "أطلس التقنيات البحثية | محمود الرويدي"
  };
  function normalized(s) { return String(s).replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim(); }
  function readStoredLanguage() {
    try {
      var requested = new URLSearchParams(location.search).get("lang");
      if (requested === "ar" || requested === "en") return requested;
      var stored = localStorage.getItem(STORAGE_KEY);
      return stored === "ar" ? "ar" : "en";
    } catch (err) { return "en"; }
  }
  var translationIndex = Object.create(null);
  Object.keys(dictionary).forEach(function (key) {
    translationIndex[normalized(key)] = dictionary[key];
  });
  function lookup(value) {
    var key = normalized(value);
    return Object.prototype.hasOwnProperty.call(translationIndex, key) ? translationIndex[key] : null;
  }
  function translateText(node) {
    var holder = node.parentElement;
    if (!holder || holder.closest("script,style,noscript,code,pre,kbd,samp,svg,textarea,[contenteditable],[translate='no'],[data-i18n-ignore],.site-lang-switch")) return;
    // Preserve intentionally Arabic fragments, but never treat the document root as an already-translated subtree.
    if (locale === "ar" && holder.closest("[lang='ar']:not(html)")) return;
    var current = node.nodeValue;
    var record = textCache.get(node);
    if (!record || (current !== record.rendered && current !== record.original)) {
      record = {original: current, rendered: current};
      textCache.set(node, record);
    }
    var translated = locale === "ar" ? lookup(record.original) : null;
    var target = record.original;
    if (translated !== null) {
      var leading = (record.original.match(/^\s*/) || [""])[0];
      var trailing = (record.original.match(/\s*$/) || [""])[0];
      target = leading + translated + trailing;
    }
    if (current !== target) {
      record.rendered = target;
      node.nodeValue = target;
    }
  }
  function localizeAttributes(element) {
    var attrs = ["aria-label", "placeholder", "title"];
    var cache = attributeCache.get(element);
    if (!cache) { cache = {}; attributeCache.set(element, cache); }
    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];
      if (!element.hasAttribute(attr)) continue;
      var current = element.getAttribute(attr);
      var record = cache[attr];
      if (!record || (current !== record.rendered && current !== record.original)) record = cache[attr] = {original: current, rendered: current};
      var translation = locale === "ar" ? lookup(record.original) : null;
      var target = translation === null ? record.original : translation;
      if (current !== target) {
        record.rendered = target;
        element.setAttribute(attr, target);
      }
    }
  }
  function localizeNode(node) {
    if (node.nodeType === 3) {
      translateText(node);
    } else if (node.nodeType === 1) {
      if (node.matches("script,style,noscript,svg,[data-i18n-ignore]")) return;
      localizeAttributes(node);
      var walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
      var textNode;
      while ((textNode = walker.nextNode())) translateText(textNode);
      var elements = node.querySelectorAll("[aria-label],[placeholder],[title]");
      for (var i = 0; i < elements.length; i++) localizeAttributes(elements[i]);
    }
  }
  function updateButtons() {
    var buttons = document.querySelectorAll(".site-lang-switch button[data-language]");
    for (var i = 0; i < buttons.length; i++) {
      var active = buttons[i].getAttribute("data-language") === locale;
      buttons[i].setAttribute("aria-pressed", String(active));
      buttons[i].classList.toggle("active", active);
    }
  }
  function setLanguage(next, updateUrl) {
    locale = next === "ar" ? "ar" : "en";
    document.documentElement.setAttribute("lang", locale);
    document.documentElement.setAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    document.title = locale === "ar" ? (titles[location.pathname] || originalsTitle) : originalsTitle;
    try { localStorage.setItem(STORAGE_KEY, locale); } catch (err) {}
    if (updateUrl) {
      try {
        var url = new URL(location.href);
        url.searchParams.set("lang", locale);
        history.replaceState(history.state, "", url.pathname + url.search + url.hash);
      } catch (err) {}
    }
    localizeNode(document.body);
    updateButtons();
  }
  function addControls() {
    if (document.querySelector(".site-lang-switch")) return;
    var controls = document.createElement("div");
    controls.className = "site-lang-switch";
    controls.setAttribute("role", "group");
    controls.setAttribute("aria-label", "Language / اللغة");
    controls.setAttribute("data-i18n-ignore", "");
    var options = [{value:"en", text:"EN", label:"Read in English"}, {value:"ar", text:"العربية", label:"اقرأ بالعربية"}];
    options.forEach(function (option) {
      var button = document.createElement("button");
      button.type = "button";
      button.textContent = option.text;
      button.setAttribute("lang", option.value);
      button.setAttribute("dir", option.value === "ar" ? "rtl" : "ltr");
      button.setAttribute("aria-label", option.label);
      button.setAttribute("data-language", option.value);
      button.addEventListener("click", function () { setLanguage(option.value, true); });
      controls.appendChild(button);
    });
    document.body.appendChild(controls);
    updateButtons();
  }
  var styles = document.createElement("style");
  styles.textContent = "@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap');"+
    ".site-lang-switch{position:fixed;bottom:18px;inset-inline-end:18px;z-index:10000;display:flex;gap:3px;padding:4px;background:rgba(248,246,239,.97);border:1px solid rgba(30,62,62,.25);border-radius:999px;box-shadow:0 4px 18px rgba(0,0,0,.16);direction:ltr;backdrop-filter:blur(12px)}"+
    ".site-lang-switch button{display:inline-flex;align-items:center;justify-content:center;min-height:38px;min-width:46px;padding:7px 13px;color:#204044;border:0;border-radius:999px;background:transparent;cursor:pointer;font:600 13px/1.4 'Noto Sans Arabic',Arial,sans-serif;white-space:nowrap}"+
    ".site-lang-switch button:hover{background:#e5e8df}.site-lang-switch button.active{background:#19383c;color:#fff}"+
    ".site-lang-switch button:focus-visible{outline:3px solid #c06c4b;outline-offset:2px}"+
    "html[lang='ar'] body{font-family:'Noto Sans Arabic',Tahoma,Arial,sans-serif!important}"+
    "html[lang='ar'] h1,html[lang='ar'] h2,html[lang='ar'] h3,html[lang='ar'] h4,html[lang='ar'] .display,html[lang='ar'] .lead,html[lang='ar'] .intro{font-family:'Noto Sans Arabic',Tahoma,Arial,sans-serif!important;letter-spacing:normal!important;line-height:1.5}"+
    "html[lang='ar'] .eyebrow,html[lang='ar'] .mono,html[lang='ar'] .smallcaps{letter-spacing:normal!important}"+
    "html[lang='ar'] .site-lang-switch{direction:ltr}html[lang='ar'] input:not([type='number']),html[lang='ar'] textarea{text-align:right}"+
    "html[lang='ar'] pre,html[lang='ar'] code,html[lang='ar'] .doi,html[lang='ar'] .pubitem a[href^='https://doi.org']{direction:ltr;unicode-bidi:isolate}"+
    "@media(max-width:600px){.site-lang-switch{bottom:12px;inset-inline-end:12px}.site-lang-switch button{min-height:42px}}"+
    "@media print{.site-lang-switch{display:none!important}}";
  document.head.appendChild(styles);
  function initialize() {
    addControls();
    setLanguage(readStoredLanguage(), false);
    var observer = new MutationObserver(function (changes) {
      changes.forEach(function (change) {
        if (change.type === "characterData") localizeNode(change.target);
        if (change.type === "childList") change.addedNodes.forEach(localizeNode);
        if (change.type === "attributes") localizeAttributes(change.target);
      });
    });
    observer.observe(document.body, {childList:true, characterData:true, attributes:true, attributeFilter:["aria-label","placeholder","title"], subtree:true});
    window.addEventListener("popstate", function () { setLanguage(readStoredLanguage(), false); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize);
  else initialize();
})();