/* Progressive enhancement only: keyboard, mouse and touch all work with the static map. */
(function () {
  "use strict";
  function ready() {
    const section = document.getElementById("three-places");
    if (!section) return;
    const panel = section.querySelector(".geo-panel");
    const buttons = Array.from(section.querySelectorAll(".geo-place[data-place]"));
    const points = Array.from(section.querySelectorAll(".geo-point[data-place]"));
    const allowed = new Set(["egypt", "qatar", "usa"]);
    function activate(place, focusCard) {
      if (!allowed.has(place)) return;
      panel.dataset.selected = place;
      for (const button of buttons) {
        const selected = button.dataset.place === place;
        button.setAttribute("aria-pressed", String(selected));
        if (selected && focusCard) button.focus({preventScroll:true});
      }
      for (const point of points) point.setAttribute("aria-pressed", String(point.dataset.place === place));
    }
    for (const button of buttons) button.addEventListener("click", () => activate(button.dataset.place, false));
    for (const point of points) {
      point.addEventListener("click", () => activate(point.dataset.place, false));
      point.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {event.preventDefault();activate(point.dataset.place,false);}
      });
    }
    activate("qatar", false);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
  else ready();
}());
