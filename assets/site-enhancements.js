/* Ruwaidix: progressive navigation improvements, 2026.
   No dependencies. Existing homepage features remain untouched. */
(() => {
  "use strict";
  const onReady = () => {
    const root = document.documentElement;
    const homeNav = document.getElementById("navlinks");
    // Surface verified outreach and scientific judging evidence in the public navigation.
    if (homeNav && !homeNav.querySelector('a[href="engagement.html"]')) {
      const l = document.createElement("a");
      l.href = "engagement.html";
      l.textContent = "Science & Society";
      const contact = homeNav.querySelector(".contactbutton");
      homeNav.insertBefore(l, contact || null);
    }
    if (homeNav && root.dataset.rxPage === "home" && !homeNav.querySelector(".rx-more")) {
      const extras = [
        "archive.html","computing.html","figures.html","grants.html","engagement.html",
        "#press","#initiatives"
      ];
      const links = Array.from(homeNav.querySelectorAll(":scope > a"));
      const moved = links.filter(a => extras.includes(a.getAttribute("href")));
      if (moved.length) {
        const details = document.createElement("details");
        details.className = "rx-more";
        const summary = document.createElement("summary");
        summary.textContent = "Explore more";
        summary.setAttribute("aria-label", "Explore additional pages");
        const panel = document.createElement("div");
        panel.className = "rx-more-panel";
        moved.forEach(link => panel.appendChild(link));
        details.append(summary, panel);
        const contact = homeNav.querySelector(".contactbutton");
        homeNav.insertBefore(details, contact || null);
        document.addEventListener("pointerdown", event => {
          if (details.open && !details.contains(event.target)) details.open = false;
        });
        details.addEventListener("click", event => {
          if (event.target.closest("a")) details.open = false;
        });
      }
    }

    if (root.dataset.rxPage !== "home" && root.dataset.rxPage !== "cv") {
      const header = document.querySelector("header");
      const navigation = header?.querySelector("nav.links, nav.menu, nav:not(.navlinks)");
      const wrap = header?.querySelector(".wrap");
      if (header && navigation && wrap) {
        header.classList.add("rx-has-menu");
        navigation.classList.add("rx-submenu");
        if (!navigation.id) navigation.id = "rx-page-navigation";
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "rx-submenu-toggle";
        toggle.textContent = "Sections +";
        toggle.setAttribute("aria-controls", navigation.id);
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open site navigation");
        wrap.insertBefore(toggle, navigation);
        const close = () => {
          navigation.classList.remove("rx-open");
          toggle.setAttribute("aria-expanded", "false");
          toggle.setAttribute("aria-label", "Open site navigation");
          toggle.textContent = "Sections +";
        };
        toggle.addEventListener("click", () => {
          const open = navigation.classList.toggle("rx-open");
          toggle.setAttribute("aria-expanded", String(open));
          toggle.setAttribute("aria-label", open ? "Close site navigation" : "Open site navigation");
          toggle.textContent = open ? "Close ×" : "Sections +";
        });
        navigation.querySelectorAll("a").forEach(a => a.addEventListener("click", close));
        document.addEventListener("pointerdown", event => {
          if (!header.contains(event.target)) close();
        });
      }
    }

    document.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;
      document.querySelectorAll(".rx-more[open]").forEach(el => { el.open = false; });
      const nav = document.querySelector(".rx-submenu.rx-open");
      if (nav) {
        nav.classList.remove("rx-open");
        const toggle = document.querySelector(".rx-submenu-toggle");
        if (toggle) { toggle.textContent = "Sections +"; toggle.setAttribute("aria-expanded","false"); toggle.focus(); }
      }
    });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", onReady);
  else onReady();
})();
