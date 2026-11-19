/* Ruwaidix field notes / progressive enhancement. Scientific labels remain cautious:
   image exploration is not calibrated microscopy; membrane diagram is illustrative. */
(() => {
  "use strict";
  const root = document.querySelector(".rx-observation");
  if (!root) return;

  const stage = root.querySelector(".rx-observation-stage");
  const image = stage?.querySelector("img");
  const lens = stage?.querySelector(".rx-observation-lens");
  const output = root.querySelector(".rx-observation-toolbar output");
  const membrane = root.querySelector(".rx-vesicle-apparatus");
  const toggle = root.querySelector(".rx-vesicle-toggle");
  if (!stage || !image || !lens || !output || !membrane || !toggle) return;

  const clamp = (n, low, high) => Math.min(high, Math.max(low, n));
  let x = .54, y = .47, magnification = 2;
  const ar = () => document.documentElement.lang === "ar";
  const translatedLabel = source =>
    ar() ? (window.RuwaidixArabicDictionary?.[source] || source) : source;
  function renderText() {
    output.textContent = magnification.toFixed(1) +
      (ar() ? "× تكبير توضيحي" : "× illustration zoom");
    const open = toggle.getAttribute("aria-pressed") === "true";
    toggle.textContent = translatedLabel(open ? "Close the cutaway" : "Open the cutaway");
  }

  function renderLens() {
    renderText();
    const bounds = stage.getBoundingClientRect();
    if (!bounds.width || !bounds.height || !image.naturalWidth || !image.naturalHeight) return;
    const scale = Math.max(bounds.width / image.naturalWidth, bounds.height / image.naturalHeight);
    const drawnWidth = image.naturalWidth * scale;
    const drawnHeight = image.naturalHeight * scale;
    const cropX = (drawnWidth - bounds.width) / 2;
    const cropY = (drawnHeight - bounds.height) / 2;
    const lensSize = lens.getBoundingClientRect().width;
    lens.style.left = (x * 100) + "%";
    lens.style.top = (y * 100) + "%";
    lens.style.backgroundSize = (drawnWidth * magnification) + "px " + (drawnHeight * magnification) + "px";
    lens.style.backgroundPosition =
      (lensSize / 2 - (x * bounds.width + cropX) * magnification) + "px " +
      (lensSize / 2 - (y * bounds.height + cropY) * magnification) + "px";

  }

  function pointAt(clientX, clientY) {
    const b = stage.getBoundingClientRect();
    if (!b.width || !b.height) return;
    x = clamp((clientX - b.left) / b.width, .15, .85);
    y = clamp((clientY - b.top) / b.height, .17, .83);
    renderLens();
  }

  stage.addEventListener("pointermove", event => {
    if (event.pointerType === "touch" && event.buttons) return;
    pointAt(event.clientX, event.clientY);
  });
  stage.addEventListener("pointerdown", event => pointAt(event.clientX, event.clientY));
  stage.addEventListener("keydown", event => {
    const directions = {
      ArrowLeft: [-.055, 0],
      ArrowRight: [.055, 0],
      ArrowUp: [0, -.055],
      ArrowDown: [0, .055]
    };
    if (!directions[event.key]) return;
    event.preventDefault();
    x = clamp(x + directions[event.key][0], .15, .85);
    y = clamp(y + directions[event.key][1], .17, .83);
    renderLens();
  });

  root.querySelectorAll("[data-rx-lens-zoom]").forEach(button => {
    button.addEventListener("click", () => {
      const delta = button.dataset.rxLensZoom === "in" ? .5 : -.5;
      magnification = clamp(magnification + delta, 1.5, 3.5);
      renderLens();
    });
  });
  toggle.addEventListener("click", () => {
    const opened = toggle.getAttribute("aria-pressed") !== "true";
    toggle.setAttribute("aria-pressed", String(opened));
    membrane.dataset.open = String(opened);
    renderText();
  });
  if (image.complete && image.naturalWidth) renderLens();
  else image.addEventListener("load", renderLens, { once: true });
  window.addEventListener("resize", renderLens, { passive: true });
  document.addEventListener("ruwaidix:languagechange", renderText);
  renderText();
  root.dataset.ready = "true";
})();
