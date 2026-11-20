(() => {
  "use strict";

  const folio = document.querySelector("#what-i-kept");
  if (!folio) return;
  const route = folio.querySelector(".story-folio-index");
  const stops = [...route.querySelectorAll("a")].map(link => ({
    link,
    leaf: document.getElementById(link.hash.slice(1))
  }));
  if (!stops.length || stops.some(stop => !stop.leaf)) return;

  let active;
  let scheduled = false;
  function markCurrentStop() {
    scheduled = false;
    const readingLine = window.innerHeight * .43;
    const bounds = folio.getBoundingClientRect();
    const current = bounds.top <= readingLine && bounds.bottom > readingLine
      ? stops.find(({ leaf }) => {
        const { top, bottom } = leaf.getBoundingClientRect();
        return top <= readingLine && bottom > readingLine;
      })
      : undefined;
    if (current === active) return;

    active?.link.removeAttribute("aria-current");
    current?.link.setAttribute("aria-current", "location");
    active = current;
  }

  function queueMark() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(markCurrentStop);
  }

  const masthead = document.querySelector(".rx-universal");
  if (masthead && "ResizeObserver" in window) {
    new ResizeObserver(([entry]) => {
      const height = entry.target.getBoundingClientRect().height;
      folio.style.setProperty("--folio-header-height", `${height}px`);
      queueMark();
    }).observe(masthead);
  }

  window.addEventListener("scroll", queueMark, { passive: true });
  window.addEventListener("resize", queueMark);
  folio.addEventListener("toggle", queueMark, true);
  document.addEventListener("ruwaidix:languagechange", queueMark);
  queueMark();
})();
