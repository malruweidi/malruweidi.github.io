/* Ruwaidix: progressive navigation improvements, 2026.
   No dependencies. Existing homepage features remain untouched. */
(() => {
  "use strict";
  const onReady = () => {
    const root = document.documentElement;
    // One approved brand asset for headers and browser tabs across all pages.
    // Do not replace the research portrait or illustrative/content images.
    const approvedLogo = "https://cdn.creativeclaw.co/u/8a002dd8/images/f20e9006-e1e3-4976-9c07-fcf36b1c9e43.png";
    const favicons = document.querySelectorAll('head link[rel~="icon"]');
    if (favicons.length) {
      favicons.forEach(link => { link.href = approvedLogo; link.type = "image/png"; });
    } else {
      const icon = document.createElement("link");
      icon.rel = "icon"; icon.type = "image/png"; icon.href = approvedLogo;
      document.head.appendChild(icon);
    }
    document.querySelectorAll('header a.logo > img:first-child, header a.brand > img:first-child, header a.wordmark > img:first-child, header .cv-branding > img:not(.cv-portrait)').forEach(img => {
      if (img.src !== approvedLogo) img.src = approvedLogo;
    });
    const homeNav = document.getElementById("navlinks");

    // Homepage: navigation is an index, not a second CV.
    // Keep every original destination while exposing only the essential routes.
    if (homeNav && root.dataset.rxPage === "home") {
      const header = homeNav.closest(".header");
      const navRow = header?.querySelector(".nav");
      const brandName = header?.querySelector(".brandname");
      const brandLine = header?.querySelector(".brandline");
      if (brandName) brandName.textContent = "Mahmoud Al-Ruweidi";
      if (brandLine) brandLine.textContent = "Research · Drug delivery · Living systems";

      const initialLinks = Array.from(homeNav.querySelectorAll(":scope > a"));
      const byHref = new Map(initialLinks.map(link => [link.getAttribute("href"), link]));
      const used = new Set();
      const take = href => {
        const link = byHref.get(href);
        if (link) used.add(link);
        return link || null;
      };

      if (!homeNav.querySelector(".rx-more")) {
        const primary = ["#research", "techniques.html", "#publications", "#writing", "#story"]
          .map(take).filter(Boolean);
        // Keep the wording familiar to returning visitors and the Arabic dictionary.
        const methods = byHref.get("techniques.html");
        if (methods) methods.textContent = "Methods";
        const details = document.createElement("details");
        details.className = "rx-more";
        const summary = document.createElement("summary");
        summary.textContent = "Explore";
        summary.setAttribute("aria-label", "Explore all research and community sections");
        const panel = document.createElement("div");
        panel.className = "rx-more-panel";
        const groups = [
          { heading:"Research library", hrefs:["computing.html","figures.html","grants.html","archive.html"] },
          { heading:"People & ideas", hrefs:["engagement.html","chem-squad.html","#press","#initiatives"] }
        ];
        for (const group of groups) {
          const column = document.createElement("div");
          column.className = "rx-more-group";
          const title = document.createElement("span");
          title.className = "rx-more-group-label";
          title.textContent = group.heading;
          column.appendChild(title);
          for (const href of group.hrefs) {
            const link = take(href);
            if (link) column.appendChild(link);
          }
          if (group.heading === "People & ideas") {
            const cv = document.createElement("a");
            cv.href = "cv.html";
            cv.textContent = "Academic CV";
            column.appendChild(cv);
          }
          panel.appendChild(column);
        }
        // Future sections must never disappear because of a hard-coded shortlist.
        const remaining = initialLinks.filter(a => !used.has(a) && !a.classList.contains("contactbutton"));
        if (remaining.length) {
          const column = document.createElement("div");
          column.className = "rx-more-group";
          const title = document.createElement("span");
          title.className = "rx-more-group-label";
          title.textContent = "More";
          column.append(title, ...remaining);
          panel.appendChild(column);
        }
        details.append(summary, panel);
        const contact = initialLinks.find(a => a.classList.contains("contactbutton"));
        homeNav.replaceChildren(...primary, details, ...(contact ? [contact] : []));
        details.addEventListener("click", event => {
          if (event.target.closest("a")) details.open = false;
        });
        document.addEventListener("pointerdown", event => {
          if (details.open && !details.contains(event.target)) details.open = false;
        });
      }

      const mobileToggle = header?.querySelector("#menu");
      const closeMobile = () => {
        homeNav.classList.remove("open");
        if (mobileToggle) {
          mobileToggle.setAttribute("aria-expanded", "false");
          mobileToggle.textContent = "Menu +";
        }
      };
      homeNav.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMobile));
      document.addEventListener("pointerdown", event => {
        if (header && homeNav.classList.contains("open") && !header.contains(event.target)) closeMobile();
      });
      document.addEventListener("keydown", event => {
        if (event.key === "Escape" && homeNav.classList.contains("open")) {
          closeMobile();
          mobileToggle?.focus();
        }
      });

      // The bilingual control becomes part of the desktop header instead of
      // floating over the scientific portrait. On small screens it stays fixed.
      const languageSwitch = document.querySelector(".site-lang-switch");
      if (languageSwitch && navRow && window.matchMedia) {
        const desktop = window.matchMedia("(min-width:1101px)");
        const positionLanguage = () => {
          const destination = desktop.matches ? navRow : document.body;
          if (languageSwitch.parentElement !== destination) destination.appendChild(languageSwitch);
        };
        positionLanguage();
        if (desktop.addEventListener) desktop.addEventListener("change", positionLanguage);
        else if (desktop.addListener) desktop.addListener(positionLanguage);
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

/* Restored long-form homepage only: authentic media and a personal introduction.
   No other page receives these assets. */
(function(){
  if(document.documentElement.getAttribute("data-rx-page")!=="home")return;
  var stylesheet=document.createElement("link");
  stylesheet.rel="stylesheet";
  stylesheet.href="/assets/restored-home-media.css?v=20261011a";
  document.head.appendChild(stylesheet);
  var script=document.createElement("script");
  script.src="/assets/restored-home-media.js?v=20261011a";
  document.head.appendChild(script);
})();
