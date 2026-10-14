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