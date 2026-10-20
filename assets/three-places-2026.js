/* Progressive enhancement only: keyboard, mouse and touch all work with the static map. */
(function () {
  "use strict";
  function ready() {
    const section = document.getElementById("three-places");
    if (!section) return;
    const panel = section.querySelector(".geo-panel");
    const buttons = Array.from(section.querySelectorAll(".geo-place[data-place]"));
    const points = Array.from(section.querySelectorAll(".geo-point[data-place]"));
    const allowed = new Set(["egypt", "qatar", "usa"]);
    function activate(place, focusCard) {
      if (!allowed.has(place)) return;
      panel.dataset.selected = place;
      for (const button of buttons) {
        const selected = button.dataset.place === place;
        button.setAttribute("aria-pressed", String(selected));
        if (selected && focusCard) button.focus({preventScroll:true});
      }
      for (const point of points) point.setAttribute("aria-pressed", String(point.dataset.place === place));
    }
    for (const button of buttons) button.addEventListener("click", () => activate(button.dataset.place, false));
    for (const point of points) {
      point.addEventListener("click", () => activate(point.dataset.place, false));
      point.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {event.preventDefault();activate(point.dataset.place,false);}
      });
    }
    const mapText = {
      egypt: {
        en:["EGYPT","Roots","Egypt: family roots and heritage"],
        ar:["مصر","الجذور","مصر: الجذور العائلية والموروث الثقافي"]
      },
      qatar: {
        en:["QATAR","Formation","Qatar: upbringing and scientific formation"],
        ar:["قطر","التكوين","قطر: النشأة والتكوين العلمي"]
      },
      usa: {
        en:["UNITED STATES","Scientific connections","United States: scientific networks and future research possibilities"],
        ar:["الولايات المتحدة","الروابط العلمية","الولايات المتحدة: شبكات علمية وآفاق بحثية مستقبلية"]
      }
    };
    const title = section.querySelector("#geo-map-title");
    const description = section.querySelector("#geo-map-description");
    const decorativeLabels = section.querySelectorAll(".geo-map > text");
    function syncMapLanguage() {
      const language = document.documentElement.lang === "ar" ? "ar" : "en";
      for (const point of points) {
        const content = mapText[point.dataset.place][language];
        const labels = point.querySelectorAll("text");
        labels[0].textContent = content[0];
        labels[1].textContent = content[1];
        point.setAttribute("aria-label", content[2]);
      }
      if (title) title.textContent = language === "ar" ? "مصر وقطر والولايات المتحدة: ثلاثة أبعاد جغرافية للسيرة" : "Egypt, Qatar, and the United States — three geographical anchors";
      if (description) description.textContent = language === "ar" ?
        "خريطة عالم مبسطة: مصر موطن الجذور، وقطر مكان النشأة والتكوين العلمي، والولايات المتحدة مكان الروابط العلمية والفرص البحثية المستقبلية. تمثل الخطوط روابط فكرية لا رحلات سفر أو تعيينات مؤسسية." :
        "A simplified equirectangular world map. Egypt marks family roots; Qatar marks growing up, education and scientific formation; the United States marks scientific networks and future research possibilities. Lines represent connections and ideas, not measured travel routes or institutional appointments. Select a country marker to highlight its story.";
      if (decorativeLabels.length >= 2) {
        decorativeLabels[0].textContent = language === "ar" ? "الأطلسي / المتوسط / الخليج" : "ATLANTIC / MEDITERRANEAN / GULF";
        decorativeLabels[1].textContent = language === "ar" ? "روابط فكرية وليست مسار رحلة" : "NOT TO SCALE AS A JOURNEY";
      }
    }
    new MutationObserver(syncMapLanguage).observe(document.documentElement, {attributes:true,attributeFilter:["lang"]});
    syncMapLanguage();
    activate("qatar", false);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
  else ready();
}());
