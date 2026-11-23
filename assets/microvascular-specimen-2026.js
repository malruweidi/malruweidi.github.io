/* RUWAIDIX / evidence-card microvascular hemodynamics, 2026-11-23.
   SVG path coordinates are measured in the SVG's viewBox, never CSS pixels.
   Visible, oval nucleated erythrocytes travel inside a clipped vessel lumen.
   Hover/focus accelerates flow. Animation is conceptual, not measured data. */
(() => {
  "use strict";
  if(document.documentElement.dataset.rxPage!=="home")return;
  // The specimen now belongs to the image-exploration evidence card.
  // Preserve the existing SVG, red-cell animation, keyboard access, and research link.
  const vessel=document.querySelector(".rx-observation-copy > .rx-microvessel");
  if(!vessel)return;
  const english=vessel.querySelector(".rx-microvessel-label [lang=en]");
  const arabic=vessel.querySelector(".rx-microvessel-label [lang=ar]");
  if(english)english.textContent="Hemodynamics ↗";
  if(arabic)arabic.textContent="ديناميكا الدم ↗";
  vessel.dataset.version="observation-20261123-a";
  vessel.title="Illustrative microvascular blood flow. Hover to accelerate red blood cells; click for the research film.";

  const svg=vessel.querySelector("svg");
  if(svg){
    const clipPath=svg.querySelector("#rx-microvessel-lumen path");
    if(clipPath&&clipPath.getAttribute("fill")==="none"){
      clipPath.setAttribute("d","M 11 54 C 72 21 149 65 247 16 A 18 18 0 0 1 247 52 C 149 101 72 57 11 90 A 18 18 0 0 1 11 54 Z");
      clipPath.setAttribute("fill","#fff");
      clipPath.removeAttribute("stroke");
      clipPath.removeAttribute("stroke-width");
      clipPath.removeAttribute("stroke-linecap");
    }
    if(!svg.querySelector("#rx-microvessel-track")){
      const track= document.createElementNS("http://www.w3.org/2000/svg","path");
      track.setAttribute("id","rx-microvessel-track");
      track.setAttribute("d","M -22 74 C 62 41 145 84 284 28");
      const defs=svg.querySelector("defs");
      defs?.appendChild(track);
    }
    const fractions=[.13,.255,.38,.505,.63,.755,.88,.96];
    svg.querySelectorAll(".rx-erythrocyte").forEach((cell,i)=>{
      if(!cell.dataset.phase)cell.dataset.phase=String(fractions[i%fractions.length]);
      // Old CSS motion paths use incompatible CSS coordinates and can
      // visually remove the SVG-path transforms; shut them off per cell.
      cell.style?.setProperty("offset-path","none","important");
      cell.style?.setProperty("animation","none","important");
    });
  }
  const track=svg?.querySelector("#rx-microvessel-track");
  const cells=Array.from(svg?.querySelectorAll(".rx-erythrocyte")||[]);
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
  const frameRequest=window.requestAnimationFrame.bind(window);
  const frameCancel=window.cancelAnimationFrame.bind(window);
  if(!track||!cells.length||typeof track.getPointAtLength!=="function")return;

  const trackLength=track.getTotalLength();
  if(!Number.isFinite(trackLength)||trackLength<=0)return;
  const starts=cells.map(el=>Number(el.dataset.phase)||0);
  let currentPhase=0,lastTimestamp=0,frameId=0;
  let inView=true,accelerated=false;

  function locate(){
    cells.forEach((cell,i)=>{
      const fraction=(starts[i]+currentPhase)%1;
      const distance=fraction*trackLength;
      const here=track.getPointAtLength(distance);
      const before=track.getPointAtLength(Math.max(0,distance-1.8));
      const after=track.getPointAtLength(Math.min(trackLength,distance+1.8));
      const angle=Math.atan2(after.y-before.y,after.x-before.x)*180/Math.PI;
      cell.setAttribute("transform","translate("+here.x.toFixed(2)+" "+here.y.toFixed(2)+") rotate("+angle.toFixed(2)+")");
    });
  }
  function shouldRun(){return !document.hidden && inView && !reduced.matches;}
  function stop(){
    if(frameId)frameCancel(frameId);
    frameId=0;lastTimestamp=0;
  }
  function tick(timestamp){
    frameId=0;
    if(!shouldRun())return;
    if(lastTimestamp){
      const elapsed=Math.min(timestamp-lastTimestamp,55);
      const factor=accelerated?2.4:1;
      currentPhase=(currentPhase+elapsed*factor/7900)%1;
      locate();
    }
    lastTimestamp=timestamp;
    frameId=frameRequest(tick);
  }
  function sync(){
    if(shouldRun()){
      if(!frameId){lastTimestamp=0;frameId=frameRequest(tick);}
    }else stop();
  }
  function setFast(value){
    accelerated=value;
    vessel.dataset.accelerated=String(value);
  }
  vessel.addEventListener("pointerenter",()=>setFast(true));
  vessel.addEventListener("pointerleave",()=>setFast(false));
  vessel.addEventListener("focus",()=>setFast(true));
  vessel.addEventListener("blur",()=>setFast(false));
  // A tap still follows the linked original research film; no click hijacking.
  vessel.addEventListener("pointerdown",()=>setFast(true),{passive:true});
  vessel.addEventListener("pointerup",()=>{if(!vessel.matches(":hover"))setFast(false);},{passive:true});

  function updateAccessibleLabel(){
    const arabic=document.documentElement.lang.toLowerCase().startsWith("ar");
    vessel.setAttribute("aria-label",arabic
      ?"كريات دم حمراء تتحرك داخل وعاء دموي دقيق. حرّك المؤشر لتسريع الحركة، أو افتح فيلم البحث في ديناميكا الدم."
      :"Red blood cells moving inside a microvessel. Hover or focus to speed up the flow; activate to open the hemodynamics research film.");
  }
  updateAccessibleLabel();
  if(typeof MutationObserver!=="undefined"){
    new MutationObserver(updateAccessibleLabel).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
  }
  if("IntersectionObserver" in window){
    const observer=new IntersectionObserver(entries=>{
      inView=entries[0].isIntersecting;sync();
    },{rootMargin:"90px",threshold:0.01});
    observer.observe(vessel);
  }
  document.addEventListener("visibilitychange",sync);
  reduced.addEventListener?.("change",sync);
  window.addEventListener("pagehide",stop);
  window.addEventListener("pageshow",sync);
  locate();
  sync();
})();