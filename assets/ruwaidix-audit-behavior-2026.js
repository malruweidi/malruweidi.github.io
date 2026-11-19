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
  window.addEventListener("hashchange", mayReveal);
  mayReveal();
})();
