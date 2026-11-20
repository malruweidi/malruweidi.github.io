(() => {
  "use strict";

  const desk = document.querySelector(".airway-desk");
  if (!desk) return;
  const canvas = desk.querySelector("canvas");
  const context = canvas.getContext("2d");
  if (!context) return;

  const windowFrame = canvas.parentElement;
  const fallback = desk.querySelector(".airway-desk-fallback");
  const slider = desk.querySelector('input[type="range"]');
  const play = desk.querySelector(".airway-desk-play");
  const stops = [...desk.querySelectorAll(".airway-desk-stops button")];
  const notes = [...desk.querySelectorAll(".airway-desk-notes article")];
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const travelTime = 7200;
  const tipStart = .10;
  const tipTravel = .80;
  let scanFrame = null;
  let size = { width: 0, height: 0 };
  let position = Number(slider.value);
  let selected = -1;
  let gesture = null;

  function chamberInset(width) {
    return Math.max(12, width * .052);
  }

  function draw() {
    const { width, height } = size;
    if (!width || !height) return;
    const inset = chamberInset(width);
    const left = inset;
    const right = width - inset;
    const span = right - left;
    const ceiling = height * .27;
    const floor = height * .75;
    const channel = floor - ceiling;
    const bubbleTop = ceiling + 4;
    const cellHeight = Math.min(16, channel * .13);
    const bubbleBottom = floor - cellHeight - 4;
    const middle = (bubbleTop + bubbleBottom) / 2;
    const tip = left + span * (tipStart + tipTravel * position / 100);
    const shoulder = tip - Math.min(span * .09, channel * .53);
    const patch = left + span * .5;
    const patchWidth = Math.max(12, span * .031);
    const passing = Math.abs(tip - patch) < span * .118;

    context.clearRect(0, 0, width, height);

    context.strokeStyle = "#85a6c21a";
    context.lineWidth = 1;
    context.beginPath();
    const mesh = width < 450 ? 20 : 26;
    for (let x = mesh; x < width; x += mesh) {
      context.moveTo(x, 0);
      context.lineTo(x, height);
    }
    for (let y = mesh; y < height; y += mesh) {
      context.moveTo(0, y);
      context.lineTo(width, y);
    }
    context.stroke();

    const liquid = context.createLinearGradient(0, ceiling, 0, floor);
    liquid.addColorStop(0, "#345579");
    liquid.addColorStop(.60, "#4b78a1");
    liquid.addColorStop(1, "#254664");
    context.fillStyle = liquid;
    context.fillRect(left, ceiling, span, channel);

    context.fillStyle = "#d1e5f33a";
    context.beginPath();
    for (let row = 0; row < 6; row++) {
      for (let x = left + 8 + row % 2 * 5; x < right - 6; x += 12) {
        const y = ceiling + 10 + row * (channel - 24) / 6;
        context.rect(x, y, 1.4, 1.4);
      }
    }
    context.fill();

    context.save();
    context.beginPath();
    context.rect(left, ceiling, span, channel);
    context.clip();
    const air = context.createLinearGradient(0, bubbleTop, 0, bubbleBottom);
    air.addColorStop(0, "#102641");
    air.addColorStop(.53, "#244361");
    air.addColorStop(1, "#132945");
    context.fillStyle = air;
    context.beginPath();
    context.moveTo(left - 12, bubbleTop);
    context.lineTo(shoulder, bubbleTop);
    context.bezierCurveTo(tip, bubbleTop, tip, middle - 15, tip, middle);
    context.bezierCurveTo(tip, middle + 15, tip, bubbleBottom, shoulder, bubbleBottom);
    context.lineTo(left - 12, bubbleBottom);
    context.closePath();
    context.fill();
    context.strokeStyle = "#ebd3ab";
    context.lineWidth = 1.7;
    context.stroke();
    const wash = context.createLinearGradient(left, 0, tip, 0);
    wash.addColorStop(0, "#b0cee000");
    wash.addColorStop(1, "#b0cee060");
    context.strokeStyle = wash;
    context.lineWidth = 1;
    for (const offset of [-15, 0, 15]) {
      context.beginPath();
      context.moveTo(left + 1, middle + offset);
      context.lineTo(Math.max(left + 2, tip - 18), middle + offset * .55);
      context.stroke();
    }
    context.restore();

    context.fillStyle = "#7b96b3";
    context.fillRect(left - 2, ceiling - 5, span + 4, 4);
    context.fillRect(left - 2, floor, span + 4, 4);
    context.fillStyle = "#d0ddec";
    context.fillRect(left - 2, ceiling, span + 4, 1);
    context.fillRect(left - 2, floor + 4, span + 4, 1);

    const count = width < 430 ? 26 : 41;
    const pitch = span / count;
    for (let index = 0; index < count; index++) {
      const x = left + pitch * (index + .5);
      const y = floor - cellHeight * .38;
      const marked = Math.abs(x - patch) <= patchWidth;
      context.fillStyle = marked ? "#ead0a1" : "#a3bfde";
      context.beginPath();
      context.ellipse(x, y, pitch * .465, cellHeight * (.32 + .025 * (index % 3)), 0, 0, 2 * Math.PI);
      context.fill();
      context.fillStyle = marked ? "#755b47" : "#405d7e";
      context.beginPath();
      context.ellipse(x, y, Math.max(1.1, pitch * .14), cellHeight * .115, 0, 0, 2 * Math.PI);
      context.fill();
    }

    context.strokeStyle = passing ? "#fff0cb" : "#e2bf86";
    context.lineWidth = passing ? 2 : 1;
    const markerY = floor + Math.max(12, height * .073);
    context.beginPath();
    context.moveTo(patch - patchWidth, floor + 8);
    context.lineTo(patch - patchWidth, markerY);
    context.lineTo(patch + patchWidth, markerY);
    context.lineTo(patch + patchWidth, floor + 8);
    context.moveTo(patch, markerY);
    context.lineTo(patch, markerY + height * .075);
    context.stroke();

    context.fillStyle = "#ffe8bb";
    context.beginPath();
    context.arc(tip, middle, 3, 0, 2 * Math.PI);
    context.fill();
  }

  function resize() {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
    size = { width, height };
    draw();
  }

  function updateText() {
    const language = document.documentElement.lang === "ar" ? "ar" : "en";
    slider.setAttribute("aria-valuetext", stops[selected].querySelector(".ad-" + language).textContent);
    play.querySelector(".ad-en").textContent = scanFrame === null ? "Play the pass" : "Pause";
    play.querySelector(".ad-ar").textContent = scanFrame === null ? "شغّل العرض" : "أوقف مؤقتًا";
  }

  function show(value) {
    position = value;
    slider.value = Math.round(value);
    const zone = value < 36 ? 0 : value < 64 ? 1 : 2;
    if (zone !== selected) {
      selected = zone;
      stops.forEach((stop, index) => stop.setAttribute("aria-pressed", String(index === zone)));
      notes.forEach((note, index) => { note.hidden = index !== zone; });
      updateText();
    }
    draw();
  }

  function stop() {
    if (scanFrame !== null) window.cancelAnimationFrame(scanFrame);
    scanFrame = null;
    updateText();
  }

  play.addEventListener("click", () => {
    if (scanFrame !== null || motion.matches) {
      stop();
      return;
    }
    const from = position >= 99 ? 0 : position;
    const started = performance.now();
    function advance(now) {
      const value = Math.min(100, from + (now - started) * 100 / travelTime);
      show(value);
      if (value === 100) stop();
      else scanFrame = requestAnimationFrame(advance);
    }
    scanFrame = requestAnimationFrame(advance);
    updateText();
  });

  function scrubAt(event) {
    const rect = canvas.getBoundingClientRect();
    const inset = chamberInset(rect.width);
    const channelX = (event.clientX - rect.left - inset) / (rect.width - 2 * inset);
    const value = (channelX - tipStart) / tipTravel * 100;
    if (scanFrame !== null) stop();
    show(Math.max(0, Math.min(100, Math.round(value))));
  }

  canvas.addEventListener("pointerdown", event => {
    if (!event.isPrimary || event.button !== 0) return;
    gesture = { id: event.pointerId, start: event.clientX, dragging: event.pointerType === "mouse" };
    canvas.setPointerCapture?.(event.pointerId);
    if (gesture.dragging) scrubAt(event);
  });
  canvas.addEventListener("pointermove", event => {
    if (gesture?.id !== event.pointerId) return;
    if (Math.abs(event.clientX - gesture.start) >= 8) gesture.dragging = true;
    if (gesture.dragging) scrubAt(event);
  });
  canvas.addEventListener("pointerup", event => {
    if (gesture?.id !== event.pointerId) return;
    scrubAt(event);
    gesture = null;
  });
  canvas.addEventListener("lostpointercapture", event => {
    if (gesture?.id === event.pointerId) gesture = null;
  });

  slider.addEventListener("input", () => {
    const value = Number(slider.value);
    stop();
    show(value);
  });
  stops.forEach(button => button.addEventListener("click", () => {
    stop();
    show(Number(button.dataset.position));
  }));
  motion.addEventListener?.("change", () => { if (motion.matches) stop(); });
  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); });
  document.addEventListener("ruwaidix:languagechange", updateText);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting && scanFrame !== null) stop();
    }).observe(windowFrame);
  }

  fallback.hidden = true;
  canvas.hidden = false;
  desk.querySelector(".airway-desk-controls").hidden = false;
  show(position);
  resize();
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(windowFrame);
  else window.addEventListener("resize", resize);
})();
