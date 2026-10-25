/* Progressive editorial hierarchy for the existing homepage chapter directory.
   All original routes and cards remain visible without JavaScript. */
(() => {
  "use strict";
  function organizeChapters() {
    const portal = document.querySelector("#rx26-portal");
    const featured = portal?.querySelector(".rx26-portal-grid");
    if (!featured || portal.querySelector(".rx26-portal-more")) return;
    const cards = Array.from(featured.children).filter(node => node.classList.contains("rx26-portal-card"));
    if (cards.length !== 9) return;

    // The first four are the visitor's central routes: research, publication,
    // film, and story. The rest remain one explicitly labeled click away.
    const more = document.createElement("details");
    more.className = "rx26-portal-more";
    const summary = document.createElement("summary");
    summary.textContent = "More from the archive";
    const explanation = document.createElement("p");
    explanation.className = "rx26-portal-more-intro";
    explanation.textContent = "Five additional chapters, including patient experience, community, leadership and a book in progress.";
    const additional = document.createElement("div");
    additional.className = "rx26-portal-grid rx26-portal-grid-more";
    cards.slice(4).forEach(card => additional.appendChild(card));
    more.append(summary, explanation, additional);
    featured.insertAdjacentElement("afterend", more);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", organizeChapters, {once:true});
  else organizeChapters();
})();
