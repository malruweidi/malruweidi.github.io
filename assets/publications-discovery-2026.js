/* Extend the established bibliography filter without changing its categories
   or the published author-contribution statements. */
(() => {
  "use strict";
  const input = document.getElementById("publication-query");
  const count = document.getElementById("publication-count");
  const empty = document.getElementById("publication-empty");
  const reset = document.getElementById("publication-reset");
  const all = document.querySelector('[data-pub-category="All"]');
  const buttons = [...document.querySelectorAll("[data-pub-category]")];
  const cards = [...document.querySelectorAll(".pub-card")];
  if (!input || !count || !empty || !reset || !all || !cards.length) return;

  // These terms locate the relevant *paper*. They are not a claim that every
  // method in a collaborative paper was personally performed by the author.
  const methodsIndex = {
    "work-8": "parallel plate flow chamber epithelial injury calcein ethidium imagej atomic force microscopy",
    "work-9": "pla cold plasma grafting ftir xps contact angle film adhesion surface chemistry",
    "work-6": "fetal echocardiography cnn lstm machine learning ultrasound image processing",
    "work-11": "parallel plate flow chamber bubble propagation epithelial injury stress wave",
    "work-7": "ace2 angiotensin hypertension clinical biomarker covid-19",
    "work-10": "pla antimicrobial scaffold electrospinning plasma surface grafting",
    "work-12": "zebrafish heart blood flow high speed video microscopy microzebralab",
    "work-13": "curcumin cyanide uv visible fluorescence colorimetric optical probe",
    "work-14": "endothelial cilia zebrafish vascular development fluorescence imaging"
  };

  for (const card of cards) {
    card.dataset.search = [card.dataset.search, card.textContent, methodsIndex[card.id] || ""]
      .join(" ").toLocaleLowerCase();
  }

  const updateEmpty = () => {
    empty.hidden = cards.some(card => !card.hidden);
  };
  input.addEventListener("input", updateEmpty);
  buttons.forEach(button => button.addEventListener("click", updateEmpty));
  reset.addEventListener("click", () => {
    input.value = "";
    all.click();
    input.focus();
  });
  updateEmpty();
})();
