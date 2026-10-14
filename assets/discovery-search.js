/* Ruwaidix discovery: additive on-site index of publicly published pages.
 * No analytics, cookies, external search service or modification of source material. */
(() => {
  "use strict";
  const input = document.getElementById("rx-search-input");
  const output = document.getElementById("rx-search-results");
  const count = document.getElementById("rx-search-count");
  const filters = document.getElementById("rx-search-filters");
  const empty = document.getElementById("rx-search-empty");
  const fallback = document.getElementById("rx-search-fallback");
  const reset = document.getElementById("rx-search-reset");
  const more = document.getElementById("rx-search-more");
  const langButton = document.getElementById("rx-search-language");
  if (!input || !output || !count || !filters) return;

  let items = [], active = "All", shown = 18, sequence = [];
  let language = "en";
  const labels = {
    en: {
      all: "All subjects", results: n => n + (n === 1 ? " entry" : " entries") + " in the archive",
      none: "No indexed entries matched. Try another term, or browse the complete research record.",
      more: "Show more entries", reset: "Clear search", search: "Search the Ruwaidix record",
      filters: "Browse by subject", language: "العربية", read: "Open entry"
    },
    ar: {
      all: "جميع المجالات", results: n => n + " نتيجة في الفهرس",
      none: "لم نجد نتائج مطابقة. جرّب كلمة أخرى أو تصفّح السجل العلمي الكامل.",
      more: "عرض المزيد", reset: "مسح البحث", search: "ابحث في أرشيف رويدكس",
      filters: "تصفّح حسب المجال", language: "English", read: "افتح الصفحة"
    }
  };
  const categoryArabic = {
    "Orientation": "ابدأ هنا",
    "Research": "البحوث",
    "Methods & evidence": "المنهجيات والأدلة",
    "Stories": "الحكايات",
    "Archive & people": "الأرشيف والأشخاص",
    "Writing & society": "الكتابة والمجتمع"
  };
  const normalize = value => String(value || "").normalize("NFKD")
    .replace(/[\u0300-\u036f\u064b-\u065f\u0670\u0640]/g, "")
    .replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه")
    .toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  const safeNumber = n => Number.isFinite(n) ? n : 0;
  const phraseScore = (entry, query) => {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    if (!words.length) return 1;
    const title = normalize(entry.title), summary = normalize(entry.summary);
    const tags = normalize(entry.keywords), category = normalize(entry.category);
    const haystack = [title, summary, tags, category].join(" ");
    if (!words.every(w => haystack.includes(w))) return 0;
    let score = words.reduce((sum, word) => sum + (title.includes(word) ? 9 : 0)
      + (tags.includes(word) ? 5 : 0) + (category.includes(word) ? 2 : 0)
      + (summary.includes(word) ? 1 : 0), 0);
    if (title.includes(normalize(query))) score += 13;
    return safeNumber(score) || 1;
  };
  function text(value) { return document.createTextNode(value); }
  function refreshStaticLanguage() {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-en][data-ar]").forEach(element => {
      element.textContent = element.dataset[language];
    });
    input.placeholder = labels[language].search;
    input.setAttribute("aria-label", labels[language].search);
    reset.setAttribute("aria-label", labels[language].reset);
    more.textContent = labels[language].more;
    langButton.textContent = labels[language].language;
    filters.setAttribute("aria-label", labels[language].filters);
  }
  function setLanguage(next, save) {
    language = next === "ar" ? "ar" : "en";
    refreshStaticLanguage();
    if (save) { try { localStorage.setItem("ruwaidix-language", language); } catch (_) {} }
    drawFilters();
    draw();
  }
  function makeEntry(entry) {
    const li = document.createElement("li");
    li.className = "rx-result";
    const link = document.createElement("a");
    link.href = entry.url;
    link.className = "rx-result-link";
    link.setAttribute("aria-label", entry.title + " · " + labels[language].read);
    const meta = document.createElement("span");
    meta.className = "rx-result-category";
    meta.append(text(language === "ar" ? categoryArabic[entry.category] || entry.category : entry.category));
    const title = document.createElement("strong");
    title.className = "rx-result-title";
    title.append(text(entry.title));
    const summary = document.createElement("span");
    summary.className = "rx-result-summary";
    summary.append(text(entry.summary));
    const arrow = document.createElement("span");
    arrow.className = "rx-result-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.append(text("↗"));
    link.append(meta, title, summary, arrow);
    li.append(link);
    return li;
  }
  function drawFilters() {
    if (!items.length) return;
    const categories = ["All", ...new Set(items.map(x => x.category))];
    const fragment = document.createDocumentFragment();
    categories.forEach(category => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "rx-filter" + (active === category ? " is-active" : "");
      button.setAttribute("aria-pressed", String(active === category));
      button.textContent = category === "All" ? labels[language].all :
        language === "ar" ? categoryArabic[category] || category : category;
      button.addEventListener("click", () => {
        active = category; shown = 18; drawFilters(); draw();
      });
      fragment.append(button);
    });
    filters.replaceChildren(fragment);
  }
  function draw() {
    const query = input.value.trim();
    sequence = items.filter(x => active === "All" || x.category === active)
      .map(x => ({entry: x, weight: phraseScore(x, query)}))
      .filter(x => x.weight > 0)
      .sort((a, b) => b.weight - a.weight || a.entry.id - b.entry.id);
    const fragment = document.createDocumentFragment();
    sequence.slice(0, shown).forEach(({entry}) => fragment.append(makeEntry(entry)));
    output.replaceChildren(fragment);
    count.textContent = labels[language].results(sequence.length);
    empty.hidden = sequence.length > 0;
    if (!empty.hidden) empty.textContent = labels[language].none;
    more.hidden = sequence.length <= shown;
    reset.hidden = !query;
  }
  function syncUrl() {
    const url = new URL(location.href);
    const query = input.value.trim();
    if (query) url.searchParams.set("q", query);
    else url.searchParams.delete("q");
    history.replaceState(null, "", url.pathname + url.search + url.hash);
  }
  input.addEventListener("input", () => { shown = 18; draw(); syncUrl(); });
  reset.addEventListener("click", () => {
    input.value = ""; shown = 18; draw(); syncUrl(); input.focus();
  });
  more.addEventListener("click", () => { shown += 18; draw(); });
  langButton.addEventListener("click", () => setLanguage(language === "en" ? "ar" : "en", true));
  document.addEventListener("keydown", event => {
    const typing = event.target instanceof HTMLElement &&
      (event.target.matches("input, textarea, select") || event.target.isContentEditable);
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault(); input.focus(); input.select();
    } else if (event.key === "/" && !typing && !event.altKey && !event.ctrlKey && !event.metaKey) {
      event.preventDefault(); input.focus();
    } else if (event.key === "Escape" && document.activeElement === input && input.value) {
      input.value = ""; shown = 18; draw(); syncUrl();
    }
  });
  let initialLang = new URLSearchParams(location.search).get("lang");
  if (initialLang !== "ar" && initialLang !== "en") {
    try { initialLang = localStorage.getItem("ruwaidix-language"); } catch (_) {}
  }
  language = initialLang === "ar" ? "ar" : "en";
  refreshStaticLanguage();
  const urlQuery = new URLSearchParams(location.search).get("q") || "";
  input.value = urlQuery.slice(0, 200);
  fetch("/assets/discovery-index.json", {cache: "no-cache"})
    .then(response => { if (!response.ok) throw new Error("Index unavailable"); return response.json(); })
    .then(data => {
      if (!Array.isArray(data.items) || data.items.length < 18) throw new Error("Index incomplete");
      items = data.items.filter(x => typeof x.title === "string" &&
        typeof x.url === "string" && /^\/(?!\/)/.test(x.url) &&
        typeof x.category === "string" && typeof x.summary === "string");
      if (fallback) fallback.hidden = true;
      drawFilters(); draw();
      if (urlQuery || new URLSearchParams(location.search).has("focus")) input.focus();
    })
    .catch(() => {
      count.textContent = language === "ar" ?
        "الفهرس التفاعلي غير متاح الآن، والروابط الأساسية أدناه متاحة." :
        "The interactive index is temporarily unavailable; the primary links below still work.";
      if (fallback) fallback.hidden = false;
      if (empty) empty.hidden = true;
      more.hidden = true;
    });
})();