/* Ruwaidix homepage audit: preserve deep links to the optional photographic essay.
   Native <details> remains usable without JavaScript, and existing URLs keep working. */
(() => {
  "use strict";
  const disclosure = document.getElementById("more-scientific-scenes");
  if (!disclosure) return;
  const mayReveal = () => {
    const id = decodeURIComponent(location.hash.replace(/^#/, ""));
    if (!id) return;
    const target = document.getElementById(id);
    if (target && (target === disclosure || disclosure.contains(target))) {
      disclosure.open = true;
      // Open before applying the original fragment target; avoid shifting the
      // rest of the page if the user was simply browsing another section.
      if (target !== disclosure && typeof target.scrollIntoView === "function") {
        requestAnimationFrame(() => target.scrollIntoView({block:"start"}));
      }
    }
  };
  document.addEventListener("click", event => {
    const anchor = event.target.closest?.('a[href^="#"]');
    if (!anchor) return;
    const id = decodeURIComponent(anchor.getAttribute("href").slice(1));
    const target = id ? document.getElementById(id) : null;
    if (target && disclosure.contains(target)) disclosure.open = true;
  });
  // The original navigation exposes the mobile menu but did not dismiss it
  // on Escape, outside taps or a switch back to desktop. Keep its native
  // click handling; only add the missing dismissal paths here.
  const menu = document.getElementById("menu");
  const nav = document.getElementById("navlinks");
  const header = document.querySelector("header.header");
  const closeNavigation = () => {
    if (!menu || !nav || !nav.classList.contains("open")) return false;
    nav.classList.remove("open");
    menu.setAttribute("aria-expanded", "false");
    const dict = window.RuwaidixArabicDictionary || {};
    menu.textContent = document.documentElement.lang === "ar" && dict["Menu +"]
      ? dict["Menu +"] : "Menu +";
    return true;
  };
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    const openMore = document.querySelector(".header .rx-more[open]");
    if (openMore) openMore.open = false;
    if (closeNavigation() && menu) menu.focus();
  });
  document.addEventListener("pointerdown", event => {
    if (header && !header.contains(event.target)) closeNavigation();
  }, {passive:true});
  const desktop = window.matchMedia("(min-width:1101px)");
  const closeOnResize = () => {if (desktop.matches) closeNavigation();};
  if (desktop.addEventListener) desktop.addEventListener("change", closeOnResize);
  else if (desktop.addListener) desktop.addListener(closeOnResize);
  document.addEventListener("ruwaidix:languagechange", () => {
    if (!menu || !nav || nav.classList.contains("open")) return;
    const dict = window.RuwaidixArabicDictionary || {};
    menu.textContent = document.documentElement.lang === "ar" && dict["Menu +"]
      ? dict["Menu +"] : "Menu +";
  });
  window.addEventListener("hashchange", mayReveal);
  mayReveal();
})();
