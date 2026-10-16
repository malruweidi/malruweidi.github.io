/* Ruwaidix site-wide discovery link.
 * Progressive enhancement only: adds one route, preserves existing menus and links. */
(() => {
  "use strict";
  function addDiscovery() {
    if (document.documentElement.dataset.rxPage === "discovery") return;
    if (document.getElementById("rx-global-search-link")) return;
    const nav = document.querySelector(".rx-universal .rx-primary") ||
      document.querySelector("#navlinks") ||
      document.querySelector(".map-header nav") ||
      document.querySelector("header nav");
    if (!nav) return;
    const link = document.createElement("a");
    link.id = "rx-global-search-link";
    link.className = "rx-discovery-link";
    link.href = "/search.html";
    link.setAttribute("data-i18n-ignore", "");
    link.setAttribute("aria-keyshortcuts", "Control+K Meta+K");
    const localize = () => {
      const isArabic = document.documentElement.lang === "ar";
      link.textContent = isArabic ? "ابحث" : "Find";
      link.setAttribute("aria-label", isArabic ?
        "ابحث في موقع رويدكس" : "Search all Ruwaidix research, stories and archives");
      link.title = isArabic ? "ابحث في الأرشيف" : "Search the archive (Ctrl / ⌘ K)";
    };
    localize();
    new MutationObserver(localize).observe(document.documentElement, {
      attributes:true,attributeFilter:["lang"]
    });
    const contact = nav.querySelector(":scope > .contactbutton");
    if (contact) nav.insertBefore(link, contact);
    else nav.appendChild(link);
  }
  document.addEventListener("keydown", event => {
    const typing = event.target instanceof HTMLElement &&
      (event.target.matches("input, textarea, select") || event.target.isContentEditable);
    const hotkey = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
    const slash = event.key === "/" && !typing && !event.altKey &&
      !event.ctrlKey && !event.metaKey;
    if (!hotkey && !slash) return;
    event.preventDefault();
    location.assign("/search.html?focus=1");
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", addDiscovery);
  else addDiscovery();
})();


/* Reading continuity for the long-form archive, progressively enhanced.
   Visual-only progress uses no hidden content, scroll lock or external library. */
(() => {
  "use strict";
  function setUpReadingContinuity() {
    if (!document.querySelector("main") || document.querySelector(".rx-reading-progress")) return;
    const progress = document.createElement("div");
    progress.className = "rx-reading-progress";
    progress.setAttribute("aria-hidden", "true");
    document.body.appendChild(progress);
    let pending = false;
    function update() {
      pending = false;
      const doc = document.documentElement;
      const distance = Math.max(0, doc.scrollHeight - window.innerHeight);
      const ratio = distance ? Math.max(0, Math.min(1, window.scrollY / distance)) : 0;
      progress.style.transform = "scaleX(" + ratio.toFixed(4) + ")";
    }
    function requestUpdate() {
      if (pending) return;
      pending = true;
      window.requestAnimationFrame(update);
    }
    window.addEventListener("scroll", requestUpdate, {passive:true});
    window.addEventListener("resize", requestUpdate, {passive:true});
    window.addEventListener("load", requestUpdate, {once:true});
    requestUpdate();

    if (document.documentElement.dataset.rxPage !== "home" ||
        !("IntersectionObserver" in window)) return;
    const links = Array.from(document.querySelectorAll(".navlinks a[href^='#']"))
      .filter(a => a.hash.length > 1 && document.getElementById(decodeURIComponent(a.hash.slice(1))));
    if (!links.length) return;
    const byId = new Map(links.map(a => [decodeURIComponent(a.hash.slice(1)), a]));
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const a of links) a.removeAttribute("aria-current");
        byId.get(entry.target.id)?.setAttribute("aria-current", "location");
      }
    }, {rootMargin:"-24% 0px -62% 0px",threshold:0});
    byId.forEach((_a,id) => observer.observe(document.getElementById(id)));
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setUpReadingContinuity, {once:true});
  } else setUpReadingContinuity();
})();


/* Keep language selection inside navigation, rather than covering archival prose.
   Home uses the existing mobile menu; other unified pages use Explore > Language.
   This relocates existing controls; it does not remove either language. */
(() => {
  "use strict";
  let mobileQuery;
  function placeControls() {
    const switcher = document.querySelector(".site-lang-switch");
    if (!switcher) return;
    const page = document.documentElement.dataset.rxPage;
    if (page === "home") {
      const mobile = window.matchMedia && window.matchMedia("(max-width:1100px)").matches;
      const destination = mobile ?
        document.querySelector("#navlinks") :
        document.querySelector(".header .nav");
      if (!destination) return;
      if (switcher.parentElement !== destination) destination.appendChild(switcher);
      switcher.classList.toggle("rx-lang-inside-mobile-nav", !!mobile);
      return;
    }
    const languageGroup = document.querySelector(".rx-universal .rx-langs");
    if (!languageGroup) return;
    if (switcher.parentElement !== languageGroup) languageGroup.appendChild(switcher);
    languageGroup.classList.add("rx-langs-integrated");
  }
  function ready() {
    placeControls();
    if (document.documentElement.dataset.rxPage !== "home" || !window.matchMedia) return;
    mobileQuery = window.matchMedia("(max-width:1100px)");
    if (mobileQuery.addEventListener) mobileQuery.addEventListener("change", placeControls);
    else if (mobileQuery.addListener) mobileQuery.addListener(placeControls);
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", ready, {once:true});
  else ready();
})();
