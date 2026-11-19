/* Conceptual membrane cross-section for the inhalation project, drawn in the
   browser so both sides of the membrane remain legible at any display size. */
(() => {
  "use strict";
  const anchor = document.querySelector("#delivery .rs-description, #research-question > p:last-child");
  if (!anchor) return;
  const study = document.createElement("section");
  study.className = "vesicle-study";
  study.dataset.i18nIgnore = "";
  study.setAttribute("aria-labelledby", "vesicle-title");
  const ns = "http://www.w3.org/2000/svg";
  function shape(tag, attrs) {
    const node = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([name, value]) => node.setAttribute(name, value));
    return node;
  }
  const plate = shape("svg", {viewBox:"0 0 240 196", "aria-hidden":"true", focusable:"false"});
  const g = shape("g", {transform:"translate(120 98)"});
  const core = shape("circle", {r:51, class:"vesicle-core"});
  g.append(core);
  const membrane = shape("g", {class:"vesicle-membrane"});
  for (const radius of [54,73]) {
    const count = radius === 54 ? 42 : 56;
    for (let i = 0; i < count; i++) {
      const unit = shape("g", {transform:"rotate(" + (360 * i / count) + ")"});
      const tip = radius === 54 ? 64 : 63;
      unit.append(shape("path", {d:"M0 "+radius+" Q-2 "+((radius+tip)/2)+" 0 "+tip, fill:"none", stroke:"currentColor", "stroke-width":"1.8"}));
      unit.append(shape("circle", {cy:radius, r:2.7, fill:"currentColor"}));
      membrane.append(unit);
    }
  }
  g.append(membrane);
  plate.append(g);
  const copy = document.createElement("div");
  const title = document.createElement("h3");
  title.id = "vesicle-title";
  const tabs = document.createElement("div");
  tabs.className = "vesicle-keys";
  tabs.setAttribute("role","group");
  tabs.setAttribute("aria-labelledby",title.id);
  const caption = document.createElement("p");
  caption.id = "vesicle-caption";
  caption.setAttribute("aria-live","polite");
  const choices = [
    {id:"membrane", label:["Membrane","الغشاء"], note:["Surfactant molecules form a bilayer around the aqueous interior. Cholesterol is part of the formulation.","تُشكّل جزيئات المادة الخافضة للتوتر السطحي غشاءً ثنائي الطبقة يحيط بحيّز مائي. ويدخل الكوليسترول في تركيب المستحضر."]},
    {id:"core", label:["Aqueous core","الحيّز المائي"], note:["The inner compartment contains water. The drawing shows the carrier’s structure without assigning a location to dexamethasone.","يحتوي الحيّز الداخلي على الماء. يوضّح الرسم بنية الحويصلة دون تحديد موضع الديكساميثازون فيها."]}
  ];
  let selected = 0;
  const buttons = choices.map((choice, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-controls",caption.id);
    button.addEventListener("click", () => {selected=index; render();});
    tabs.append(button);
    return button;
  });
  function render() {
    const lang = document.documentElement.lang.startsWith("ar") ? 1 : 0;
    title.textContent = ["Inside a niosome","داخل الحويصلة النيوسومية"][lang];
    study.dataset.layer = choices[selected].id;
    buttons.forEach((button,i) => {
      button.textContent = choices[i].label[lang];
      button.setAttribute("aria-pressed",String(i === selected));
    });
    caption.textContent = choices[selected].note[lang];
    legend.textContent = ["Schematic · not to scale","رسم توضيحي · غير مرسوم بمقياس"][lang];
  }
  const visual = document.createElement("div");
  visual.className = "vesicle-plate";
  const legend = document.createElement("small");
  visual.append(plate,legend);
  copy.append(title,tabs,caption);
  study.append(visual,copy);
  anchor.after(study);
  render();
  new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
})();
