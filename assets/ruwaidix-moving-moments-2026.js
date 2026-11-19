/* Ruwaidix moving moments, 2026-11-19.
   No external libraries, telemetry, audio or additional media downloads.
   Original content remains visible when scripting is unavailable. */
(() => {
 "use strict";
 const root=document.querySelector('[data-rx-moments]');
 if(!root)return;
 const panels=Array.from(root.querySelectorAll('[data-rx-moment-panel]'));
 const tabs=Array.from(root.querySelectorAll('.rx-moments-scenes [role="tab"]'));
 const play=root.querySelector('[data-rx-moments-play]');
 const prev=root.querySelector('[data-rx-moments-prev]');
 const next=root.querySelector('[data-rx-moments-next]');
 if(!play||!prev||!next||panels.length!==4||tabs.length!==panels.length) return;
 if(!tabs.every((tab,i)=>tab.getAttribute("aria-controls")===panels[i].id))return;
 let active=0;
 let timer=null;
 const DURATION=6500;
 function translatedLabel(source){
   const dict=window.RuwaidixArabicDictionary||{};
   return document.documentElement.lang==="ar" && dict[source] ? dict[source] : source;
 }
 const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
 const choose=(index,focus=false)=>{
   active=(index+panels.length)%panels.length;
   panels.forEach((panel,i)=>{
     const chosen=active===i;
     panel.hidden=!chosen;
     panel.dataset.current=String(chosen);
   });
   tabs.forEach((tab,i)=>{
     const chosen=active===i;
     tab.setAttribute("aria-selected",String(chosen));
     tab.tabIndex=chosen?0:-1;
   });
   if(focus) tabs[active].focus();
 };
 const stop=()=>{
   if(timer!==null)window.clearTimeout(timer);
   timer=null;
   root.dataset.playing="false";
   const source=active===panels.length-1?"Replay sequence":"Play the sequence";
   play.textContent=translatedLabel(source);
   play.setAttribute("aria-label",play.textContent);
 };
 const schedule=()=>{
   root.dataset.playing="false";
   const progress=root.querySelector('.rx-moments-progress i');
   if(progress)void progress.offsetWidth;
   root.dataset.playing="true";
   play.textContent=translatedLabel("Pause sequence");
   play.setAttribute("aria-label",play.textContent);
   timer=window.setTimeout(()=>{
     timer=null;
     if(active===panels.length-1){stop();return;}
     choose(active+1);
     schedule();
   },DURATION);
 };
 const start=()=>{
   if(timer!==null){stop();return;}
   if(active===panels.length-1)choose(0);
   schedule();
 };
 tabs.forEach((tab,i)=>{
   tab.addEventListener("click",()=>{stop();choose(i);});
   tab.addEventListener("keydown",event=>{
     let target;
     if(event.key==="Home")target=0;
     else if(event.key==="End")target=tabs.length-1;
     else if(event.key==="ArrowRight"||event.key==="ArrowDown")target=i+(document.documentElement.dir==="rtl"&&event.key==="ArrowRight"?-1:1);
     else if(event.key==="ArrowLeft"||event.key==="ArrowUp")target=i+(document.documentElement.dir==="rtl"&&event.key==="ArrowLeft"?1:-1);
     else if(event.key==="Escape"){stop();return;}
     else return;
     event.preventDefault();
     stop();
     choose(target,true);
   });
 });
 prev.addEventListener("click",()=>{stop();choose(active-1)});
 next.addEventListener("click",()=>{stop();choose(active+1)});
 play.addEventListener("click",start);
 document.addEventListener("ruwaidix:languagechange",()=>{
   const source=timer!==null?"Pause sequence":active===panels.length-1?"Replay sequence":"Play the sequence";
   play.textContent=translatedLabel(source);
   play.setAttribute("aria-label",play.textContent);
 });
 document.addEventListener("visibilitychange",()=>{if(document.hidden)stop()});
 reducedMotion.addEventListener?.("change",()=>{if(reducedMotion.matches)stop()});
 root.dataset.enhanced="true";
 root.dataset.playing="false";
 choose(0);
})();
