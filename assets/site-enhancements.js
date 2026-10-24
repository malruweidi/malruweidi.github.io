/* Ruwaidix: progressive navigation improvements, 2026.
   No dependencies. Existing homepage features remain untouched. */
(() => {
  "use strict";
  const onReady = () => {
    const root = document.documentElement;
    // One approved brand asset for headers and browser tabs across all pages.
    // Do not replace the research portrait or illustrative/content images.
    const approvedLogo = "/assets/ruwaidix-approved.webp";
    const approvedFavicon = "/assets/ruwaidix-tab-2026.svg";
    const favicons = document.querySelectorAll('head link[rel~="icon"]');
    if (favicons.length) {
      favicons.forEach(link => { link.href = approvedFavicon; link.type = "image/svg+xml"; });
    } else {
      const icon = document.createElement("link");
      icon.rel = "icon"; icon.type = "image/svg+xml"; icon.href = approvedFavicon;
      document.head.appendChild(icon);
    }
    document.querySelectorAll('header a.logo > img:first-child, header a.brand > img:first-child, header a.wordmark > img:first-child, header .cv-branding > img:not(.cv-portrait)').forEach(img => {
      if (img.getAttribute("src") !== approvedLogo) img.setAttribute("src", approvedLogo);
    });
    // Retain the owner's approved homepage photograph. Its original host is
    // external; if it fails, show the already published owner-supplied local
    // portrait rather than a broken image. Normal loads are never changed.
    const homePortrait = root.dataset.rxPage === "home" ?
      document.querySelector(".rx-portrait-mat > img") : null;
    if (homePortrait && homePortrait.getAttribute("src") ===
      "https://cdn.creativeclaw.co/u/8a002dd8/images/5e4b3ffb-a810-4d3c-99c9-cc38782d7b4d.jpg") {
      const fallbackPortrait = "/assets/2026-10-13-new-photos/research-portrait-calligraphy.webp";
      const restorePortrait = () => {
        homePortrait.removeEventListener("error", restorePortrait);
        homePortrait.setAttribute("alt", "Mahmoud wearing a white coat in front of Arabic calligraphy, from a separate occasion");
        homePortrait.setAttribute("width", "710");
        homePortrait.setAttribute("height", "960");
        homePortrait.setAttribute("src", fallbackPortrait);
      };
      homePortrait.addEventListener("error", restorePortrait, {once:true});
      if (homePortrait.complete && homePortrait.naturalWidth === 0) restorePortrait();
    }
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
            // Keep the first-person story discoverable without removing existing routes.
            const personal = document.createElement("a");
            personal.href = "illness-and-evidence.html";
            personal.setAttribute("data-i18n-ignore", "");
            const translatePersonal = () => {
              personal.textContent = document.documentElement.lang === "ar" ? "المرض والدليل" : "Illness & evidence";
            };
            translatePersonal();
            new MutationObserver(translatePersonal).observe(document.documentElement, {attributes:true, attributeFilter:["lang"]});
            column.appendChild(personal);
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
  stylesheet.href="/assets/restored-home-media.css?v=20261011c";
  document.head.appendChild(stylesheet);
  var script=document.createElement("script");
  script.src="/assets/restored-home-media.js?v=20261011c";
  document.head.appendChild(script);
})();

/* Load a self-contained, additive research-and-illness narrative. */
(function(){
  if(document.documentElement.getAttribute("data-rx-page")!=="home")return;
  var css=document.createElement("link");
  css.rel="stylesheet";
  css.href="/assets/illness-evidence-home.css?v=20261011-personal-photos";
  document.head.appendChild(css);
  var script=document.createElement("script");
  script.src="/assets/illness-evidence-home.js?v=20261011-personal-photos";
  script.defer=true;
  document.head.appendChild(script);
})();

/* Editorial repair: preserve all existing research and personal material.
   Later separate assets allow safe rollback without replacing the large homepage. */
(function(){
 if(document.documentElement.getAttribute("data-rx-page")!=="home")return;
 var sheet=document.createElement("link");sheet.rel="stylesheet";sheet.href="/assets/editorial-audit-2026.css?v=20261011-personal-photos";document.head.appendChild(sheet);
 var script=document.createElement("script");script.src="/assets/editorial-audit-2026.js?v=20261011-personal-photos";script.defer=true;document.head.appendChild(script);
})();

/* Recover the original photo archive without replacing or modifying the oversized archive.html. */
(function(){
  if(document.documentElement.getAttribute("data-rx-page")!=="archive")return;
  if(document.querySelector('script[data-rx-archive-restoration]'))return;
  var stylesheet=document.createElement("link");
  stylesheet.rel="stylesheet";
  stylesheet.href="/assets/archive-restoration.css?v=20261011-restored";
  document.head.appendChild(stylesheet);
  var script=document.createElement("script");
  script.src="/assets/archive-restoration.js?v=20261011-restored";
  script.defer=true;
  script.dataset.rxArchiveRestoration="true";
  document.head.appendChild(script);
})();

/* Show original chapter archive photographs where the main story introduces QUACS. */
(function(){
  if(document.documentElement.dataset.rxPage!=="home")return;
  var css=document.createElement("link");css.rel="stylesheet";css.href="/assets/public-science-home.css?v=20261011";document.head.appendChild(css);
  var js=document.createElement("script");js.src="/assets/public-science-home.js?v=20261011";js.defer=true;document.head.appendChild(js);
})();

/* Original university-laboratory photographs in methods, not stock pictures. */
(function(){
 if(document.documentElement.getAttribute("data-rx-page")!=="techniques")return;
 var css=document.createElement("link");css.rel="stylesheet";css.href="/assets/original-lab-photos.css?v=20261011b";document.head.appendChild(css);
 var js=document.createElement("script");js.src="/assets/original-lab-photos.js?v=20261011-personal-photos";js.defer=true;document.head.appendChild(js);
})();


/* Firsthand photographic moments supplied on 11 October 2026.
   Show on existing relevant chapters without changing or deleting original material. */
(function(){
  if(!["home","archive","techniques","engagement"].includes(document.documentElement.dataset.rxPage))return;
  var css=document.createElement("link");
  css.rel="stylesheet";
  css.href="/assets/firsthand-photo-stories-2026.css?v=20261011-a";
  document.head.appendChild(css);
  var script=document.createElement("script");
  script.src="/assets/firsthand-photo-stories-2026.js?v=20261011-b";
  script.defer=true;
  document.head.appendChild(script);
})();

/* Final website QA: one late-loading stylesheet and a narrowly scoped copy cleanup. */
(function(){
  const sheet=document.createElement("link");
  sheet.rel="stylesheet";
  sheet.href="/assets/final-polish-2026.css?v=20261011-qafinal1";
  document.head.appendChild(sheet);
  const script=document.createElement("script");
  script.src="/assets/editorial-integrity-2026.js?v=20261011-qafinal1";
  script.defer=true;
  document.head.appendChild(script);
})();

/* Show the verified, owner-described Chemistry Festival photograph near the QUACS homepage history. */
(()=>{if(document.documentElement.dataset.rxPage!=="home")return;const load=()=>{if(document.querySelector('script[src*="archive-moments-2026-10-12.js"]'))return;const s=document.createElement("script");s.src="/assets/archive-moments-2026-10-12.js?v=20261012b";s.defer=true;document.head.append(s);};if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",load,{once:true});else load();})();

/* Owner-supplied 2017 photo archive: all uploaded images included. */
(()=>{if(document.querySelector('script[src*="2017-photo-completion.js"]'))return;const s=document.createElement("script");s.src="/assets/2017-photo-completion.js?v=20261012-complete";s.defer=true;document.head.appendChild(s);})();


/* October 2026 laboratory, microscopy, embryo and Doppler image archive.
   Media-load marker prevents broken photographs while files are staged. */
(()=>{if(!["archive","techniques"].includes(document.documentElement.dataset.rxPage))return;
 if(document.querySelector('script[src*="/assets/research-media-2026.js"]'))return;
 const css=document.createElement("link");css.rel="stylesheet";css.href="/assets/research-media-2026.css?v=20261012";document.head.append(css);
 const js=document.createElement("script");js.src="/assets/research-media-2026.js?v=20261012";js.defer=true;document.head.append(js);
})();


/* Additive cross-site discovery; existing navigation and editorial pages remain unchanged. */
(() => {
  if (document.querySelector('script[src*="/assets/discovery-global.js"]')) return;
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = "/assets/discovery-global.css?v=20261016-nav-craft";
  document.head.appendChild(css);
  const script = document.createElement("script");
  script.src = "/assets/discovery-global.js?v=20261016-nav-craft";
  script.defer = true;
  document.head.appendChild(script);
})();

/* Public 2017 owner-supplied research/ACS archive: additive, de-duplicated across loaders. */
(() => {
  if (document.querySelector('script[data-rx17-archive]')) return;
  const css=document.createElement('link');
  css.rel='stylesheet';
  css.href='/assets/archival-2017-additions.css?v=20261016';
  document.head.appendChild(css);
  const script=document.createElement('script');
  script.src='/assets/archival-2017-additions.js?v=20261016';
  script.defer=true;
  script.setAttribute('data-rx17-archive','');
  document.head.appendChild(script);
})();
