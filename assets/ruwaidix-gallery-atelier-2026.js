/* Ruwaidix / material cabinet and scale viewer.
   Progressive enhancement; all panels and source links remain readable without JavaScript. */
(() => {
  "use strict";
  const displays = document.querySelectorAll('[data-rx-display]');
  for (const display of displays) {
    const tabs = Array.from(display.querySelectorAll('[data-rx-tabs] [role="tab"]'));
    const panels = Array.from(display.querySelectorAll('[data-rx-panel]'));
    if (!tabs.length || tabs.length !== panels.length) continue;

    // Only suppress the no-JS vertical layout once every panel is available.
    if (!tabs.every((tab, i) => tab.getAttribute("aria-controls") === panels[i].id)) continue;
    display.dataset.enhanced = "true";

    const activate = (next, moveFocus = false) => {
      const selected = (next + tabs.length) % tabs.length;
      tabs.forEach((tab, i) => {
        const active = i === selected;
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        panels[i].dataset.active = String(active);
        panels[i].hidden = !active;
      });
      if (moveFocus) tabs[selected].focus();
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(index));
      tab.addEventListener("keydown", event => {
        let next;
        switch (event.key) {
          case "ArrowRight": next = index + 1; break;
          case "ArrowLeft": next = index - 1; break;
          case "ArrowDown": next = index + 1; break;
          case "ArrowUp": next = index - 1; break;
          case "Home": next = 0; break;
          case "End": next = tabs.length - 1; break;
          default: return;
        }
        event.preventDefault();
        // RTL follows the reading order: arrow directions reverse horizontally.
        if (document.documentElement.dir === "rtl") {
          if (event.key === "ArrowRight") next = index - 1;
          if (event.key === "ArrowLeft") next = index + 1;
        }
        activate(next, true);
      });
    });
    activate(0);
  }
})();
