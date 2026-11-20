(() => {
  "use strict";

  const sheet = document.querySelector(".home-contact-sheet");
  const film = document.getElementById("rx-feature-film");
  if (!sheet || !film || !film.canPlayType("video/mp4")) return;

  const links = [...sheet.querySelectorAll("[data-film-time]")];
  const starts = links.map(link => Number(link.dataset.filmTime));
  const frames = sheet.querySelector("ol");
  let pending = null;
  let current = -1;

  function sync() {
    const position = pending ?? film.currentTime;
    if (film.duration > 0) frames.style.setProperty("--screening-progress", String(Math.min(position / film.duration, 1)));
    const chapter = starts.findLastIndex(start => start <= position);
    if (chapter === current) return;

    links[current]?.removeAttribute("aria-current");
    links[chapter]?.setAttribute("aria-current", "true");
    current = chapter;
  }

  function seek() {
    if (pending === null || film.readyState < 1) return;
    const time = pending;
    pending = null;
    film.currentTime = time;
    sync();
  }

  links.forEach((link, i) => {
    link.addEventListener("click", event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || film.error) return;
      event.preventDefault();
      pending = starts[i];
      seek();
      sync();
      if (film.getBoundingClientRect().bottom < 120) film.scrollIntoView({ block: "center", behavior: "instant" });
    });
  });

  film.addEventListener("loadedmetadata", seek);
  film.addEventListener("timeupdate", sync);
  film.addEventListener("seeking", sync);
  sync();
})();
