"use strict";
(() => {
 const video=document.getElementById("ring-chemistry-player");
 if (!video) return;
 document.querySelectorAll("[data-ring-seek]").forEach(button=>{
  button.addEventListener("click",()=>{
   const seconds=Number(button.dataset.ringSeek);
   if(!Number.isFinite(seconds)||seconds<0||seconds>=180)return;
   const action=()=>{
    try{video.currentTime=seconds}catch(_){}
    const p=video.play();
    if(p && typeof p.catch==="function")p.catch(()=>{});
    const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    video.scrollIntoView({behavior:reduce?"instant":"smooth",block:"center"});
    video.focus({preventScroll:true});
   };
   if(video.readyState===0){video.addEventListener("loadedmetadata",action,{once:true});video.load();}
   else action();
  });
 });
})();
