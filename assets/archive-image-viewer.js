
/* A reading lightbox for captioned, otherwise non-interactive archive figures. */
(() => {
  if (typeof HTMLDialogElement !== "function") return;
  const main = document.querySelector("main");
  if (!main) return;
  const figures = [...main.querySelectorAll("figure")].filter(figure =>
    figure.querySelector(":scope > figcaption") && figure.querySelectorAll("img").length === 1 &&
    !figure.closest("a,button,dialog") && !figure.querySelector("a,button,video,audio,iframe,input")
  );
  if (!figures.length) return;
  const element = (tag,cls) => Object.assign(document.createElement(tag),{className:cls});
  const makeButton = cls => Object.assign(element("button",cls),{type:"button"});
  const language = () => document.documentElement.lang.startsWith("ar");
  const word = (en,ar) => language() ? ar : en;
  const dialog = element("dialog","rx-photo-dialog");
  const toolbar = element("div","rx-photo-tools");
  const previous = makeButton("rx-photo-prev");
  const next = makeButton("rx-photo-next");
  const zoom = makeButton("rx-photo-zoom");
  const close = makeButton("rx-photo-close");
  const counter = element("span","rx-photo-counter");
  counter.setAttribute("role","status");
  const stage = element("div","rx-photo-stage");
  const display = element("img","rx-photo-full");
  const caption = element("p","rx-photo-caption");
  toolbar.append(previous,counter,next,zoom,close);
  stage.append(display);
  dialog.append(toolbar,stage,caption);
  document.body.append(dialog);
  let current, visible = [];
  const entries = figures.map(figure => {
    const original = figure.querySelector("img");
    const label = figure.querySelector("figcaption");
    const button = makeButton("rx-photo-trigger");
    button.setAttribute("aria-haspopup","dialog");
    figure.append(button);
    const entry = {figure,original,label,button};
    button.addEventListener("click",() => {
      visible = entries.filter(item => item.figure.getClientRects().length && getComputedStyle(item.figure).visibility !== "hidden");
      current = entry;
      draw();
      dialog.showModal();
      close.focus();
    });
    return entry;
  });
  function localize() {
    dialog.setAttribute("aria-label",word("Image viewer","عارض الصور"));
    close.textContent = word("Close","إغلاق");
    previous.textContent = word("Previous","السابق");
    next.textContent = word("Next","التالي");
    entries.forEach(item => {
      item.button.textContent = word("Enlarge image","تكبير الصورة");
      item.button.setAttribute("aria-label",item.button.textContent+" · "+(item.original.alt || item.label.innerText));
    });
    if (dialog.open) draw();
  }
  function scale(on) {
    stage.classList.toggle("rx-photo-actual",on);
    zoom.setAttribute("aria-pressed",String(on));
    zoom.textContent = word("Actual size","الحجم الأصلي");
    stage.scrollTop = stage.scrollLeft = 0;
  }
  function draw() {
    const i = visible.indexOf(current);
    display.src = current.original.currentSrc || current.original.src;
    display.alt = current.original.alt;
    caption.textContent = current.label.innerText.trim() || display.alt;
    const nf = new Intl.NumberFormat(language() ? "ar" : "en");
    counter.textContent = nf.format(i+1)+" / "+nf.format(visible.length);
    previous.disabled = i <= 0;
    next.disabled = i === visible.length-1;
    scale(false);
  }
  function step(offset) {
    const entry = visible[visible.indexOf(current)+offset];
    if (entry) { current=entry; draw(); }
  }
  previous.addEventListener("click",() => step(-1));
  next.addEventListener("click",() => step(1));
  zoom.addEventListener("click",() => scale(!stage.classList.contains("rx-photo-actual")));
  close.addEventListener("click",() => dialog.close());
  dialog.addEventListener("click",event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("keydown",event => {
    if (stage.classList.contains("rx-photo-actual")) return;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      step((event.key === "ArrowRight" ? 1 : -1) * (language() ? -1 : 1));
    }
  });
  localize();
  new MutationObserver(localize).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
})();
