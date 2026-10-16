/* Language-aware keyboard skip links. Non-destructive: existing link targets and styles remain intact. */
(function () {
  "use strict";
  var selectors = "a.rx-skip-link, a.rx-skip";
  var labels = {
    "Skip to content": "تجاوز إلى المحتوى",
    "Skip to main content": "تجاوز إلى المحتوى الرئيسي"
  };

  function updateSkipLinks() {
    var arabic = document.documentElement.lang.toLowerCase().indexOf("ar") === 0;
    document.querySelectorAll(selectors).forEach(function (link) {
      var english = link.getAttribute("data-rx-skip-original");
      if (!english) {
        var original = link.textContent.trim();
        if (!Object.prototype.hasOwnProperty.call(labels, original)) return;
        english = original;
        link.setAttribute("data-rx-skip-original", english);
      }
      var target = arabic ? labels[english] : english;
      if (!target) return;
      if (link.textContent.trim() !== target) link.textContent = target;
      link.lang = arabic ? "ar" : "en";
      link.dir = arabic ? "rtl" : "ltr";
    });
  }

  var observer = new MutationObserver(updateSkipLinks);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["lang"]
  });
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateSkipLinks, { once: true });
  } else {
    updateSkipLinks();
  }
  window.addEventListener("load", updateSkipLinks, { once: true });
})();
