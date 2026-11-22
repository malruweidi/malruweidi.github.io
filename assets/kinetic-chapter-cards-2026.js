/* Nine contextual kinetic signatures for the homepage's existing chapter cards.
 * These preserve cards as links, never animate in the background, and never
 * convert scientific schematics into purported measured observations. */
(function () {
  "use strict";
  if (typeof document === "undefined" || document.documentElement.dataset.rxPage !== "home") return;
  const choices = {
    "/research.html": "zebrafish",
    "/publications.html": "citations",
    "/films.html": "frames",
    "/stories.html": "focus",
    "/illness-and-evidence.html": "alveolus",
    "/writing.html": "syrup",
    "/chem-squad.html": "imine",
    "/leadership.html": "milestones",
    "/major-revisions.html": "manuscript"
  };
  function init() {
    const engine = globalThis.RuwaidixAtlasDraw;
    const root = document.querySelector(".rx26-portal-grid");
    if (!engine || !root || root.dataset.rxKineticCards === "true") return;
    root.dataset.rxKineticCards = "true";
    const motionPreference = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const cards = Array.from(root.querySelectorAll("a.rx26-portal-card"));
    const instances = [];
    let current = null;
    const render = entry => {
      const p = Math.max(0, Math.min(1, entry.value));
      const pattern = "rx-card-grid-" + entry.index;
      const figure = engine.draw(entry.id, p)
        .replaceAll('id="rx-grid"', 'id="' + pattern + '"')
        .replaceAll("url(#rx-grid)", "url(#" + pattern + ")");
      entry.canvas.innerHTML = figure;
      entry.canvas.firstElementChild?.setAttribute("aria-hidden", "true");
    };
    const stop = entry => {
      if (entry?.frame != null) {
        cancelAnimationFrame(entry.frame);
        entry.frame = null;
      }
      if (current === entry) current = null;
      entry?.card.classList.remove("rx-card-is-moving");
    };
    const start = entry => {
      if (!entry || motionPreference?.matches || current === entry || document.hidden) return;
      if (current) stop(current);
      current = entry;
      entry.card.classList.add("rx-card-is-moving");
      entry.startedAt = performance.now() - entry.value * 1100;
      const tick = now => {
        if (current !== entry || motionPreference?.matches || document.hidden) { stop(entry); return; }
        entry.value = (Math.sin((now - entry.startedAt) / 1000 * Math.PI) + 1) / 2;
        render(entry);
        entry.frame = requestAnimationFrame(tick);
      };
      entry.frame = requestAnimationFrame(tick);
    };
    cards.forEach((card,index) => {
      let path;
      try { path = new URL(card.href, location.href).pathname; }
      catch { return; }
      const id = choices[path];
      if (!id) return;
      const top = card.querySelector(".rx26-card-top");
      if (!top) return;
      const canvas = document.createElement("span");
      canvas.className = "rx-card-kinetic";
      canvas.setAttribute("aria-hidden","true");
      const entry = { card, canvas, id, index, value:.3, frame:null, startedAt:0 };
      const tag = document.createElement("span");
      tag.className = "rx-card-kinetic-label";
      tag.textContent = "✦";
      tag.setAttribute("aria-hidden", "true");
      canvas.appendChild(tag);
      top.appendChild(canvas);
      // Render into an inner slot so the static icon label isn't lost.
      const art=document.createElement("span");
      art.className="rx-card-kinetic-art";
      canvas.prepend(art);
      entry.canvas=art;
      render(entry);
      card.addEventListener("pointerenter", event => { if(event.pointerType !== "touch") start(entry); });
      card.addEventListener("pointerleave", () => stop(entry));
      card.addEventListener("focusin", () => start(entry));
      card.addEventListener("focusout", event => {if(!card.contains(event.relatedTarget)) stop(entry);});
      instances.push(entry);
    });
    document.addEventListener("visibilitychange", () => {
      if(document.hidden && current)stop(current);
    });
    motionPreference?.addEventListener?.("change", () => {
      if(motionPreference.matches && current)stop(current);
    });
    if("IntersectionObserver" in window) {
      const observer=new IntersectionObserver(entries => {
        if(entries[0] && !entries[0].isIntersecting && current)stop(current);
      }, {threshold:0});
      observer.observe(root);
    }
    root.dataset.rxKineticCount = String(instances.length);
  }
  if (document.readyState==="loading") document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();