"use strict";
(() => {
  const player = document.getElementById("airway-evidence-player");
  if (!player) return;
  document.querySelectorAll("button[data-airway-seek]").forEach(button => {
    button.addEventListener("click", () => {
      const second = Number(button.dataset.airwaySeek);
      if (!Number.isFinite(second) || second < 0 || second >= 180) return;
      const go = () => {
        try { player.currentTime = second; } catch (_) {}
        const attempt = player.play();
        if (attempt && typeof attempt.catch === "function") attempt.catch(() => {});
        player.scrollIntoView({behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",block:"center"});
        player.focus({preventScroll:true});
      };
      if (player.readyState === 0) {
        player.addEventListener("loadedmetadata", go, {once:true});
        player.load();
      } else go();
    });
  });
})();
