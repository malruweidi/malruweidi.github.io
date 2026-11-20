(() => {
  "use strict";

  const hero = document.querySelector(".rx-hero-grid");
  const reel = document.querySelector(".rx-moments-film");
  if (!hero || !reel || !("IntersectionObserver" in window)) return;

  const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
  const stages = [hero, reel];
  const visible = new Set();
  let frame = null;

  function paint() {
    frame = null;
    const viewport = window.innerHeight;

    for (const stage of visible) {
      const { top, height } = stage.getBoundingClientRect();
      const progress = Math.max(-1, Math.min(1, (viewport - height - 2 * top) / (viewport + height)));
      const range = stage === hero ? 30 : 52;
      stage.style.setProperty("--archive-depth", `${(progress * range).toFixed(2)}px`);
      stage.style.setProperty("--archive-print-depth", `${(progress * -range / 4).toFixed(2)}px`);
      if (stage === hero) stage.style.setProperty("--archive-turn", `${(progress * 26).toFixed(2)}deg`);
    }
  }

  function queuePaint() {
    if (frame === null && visible.size > 0) frame = requestAnimationFrame(paint);
  }

  const observer = new IntersectionObserver(entries => {
    if (!motion.matches) return;
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    queuePaint();
  });

  function syncMotionPreference() {
    if (motion.matches) {
      stages.forEach(stage => observer.observe(stage));
      window.addEventListener("scroll", queuePaint, { passive: true });
      window.addEventListener("resize", queuePaint);
    } else {
      observer.disconnect();
      visible.clear();
      window.removeEventListener("scroll", queuePaint);
      window.removeEventListener("resize", queuePaint);
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;

      for (const stage of stages) {
        stage.style.removeProperty("--archive-depth");
        stage.style.removeProperty("--archive-print-depth");
        stage.style.removeProperty("--archive-turn");
      }
    }
  }

  motion.addEventListener("change", syncMotionPreference);
  syncMotionPreference();

  new ResizeObserver(queuePaint).observe(reel);
})();
