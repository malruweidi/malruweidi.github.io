/* Ruwaidix: original vector Golden Snitch Easter egg, isolated in Shadow DOM. */
(function install(window,document){
  "use strict";
  if (!["/","/index.html"].includes(window.location.pathname)) return;
  const id="rx-golden-snitch",key="rx-snitch-caught";
  const motion=window.matchMedia("(prefers-reduced-motion: reduce)");
  let observer;
  function caught(){try{return window.sessionStorage.getItem(key)==="1"}catch{return false}}
  function remove(){document.getElementById(id)?.remove();observer?.disconnect();observer=undefined}
  function mount(){
    if(motion.matches||caught()||document.getElementById(id)||!document.body)return;
    const host=document.createElement("div");
    host.id=id;
    const shadow=host.attachShadow({mode:"open"});
    shadow.innerHTML=`<style>
:host{position:fixed;inset:0;z-index:40;pointer-events:none;overflow:hidden;contain:layout style paint}
.rx-snitch-flight{position:absolute;top:0;left:0;width:100px;height:68px;border:0;padding:0;background:transparent;cursor:pointer;pointer-events:auto;animation:rx-flight 24s 4s infinite ease-in-out backwards;will-change:transform;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.rx-snitch-flight:hover,.rx-snitch-flight:focus-visible{animation-play-state:paused}.rx-snitch-flight:focus-visible{outline:2px solid #b88a35;outline-offset:2px;border-radius:50%}
.rx-snitch-flight[data-caught="true"]{animation-play-state:paused;pointer-events:none}.rx-snitch-flight[data-caught="true"] svg{animation:rx-capture .55s ease-in forwards}.rx-snitch-flight[data-caught="true"] .wing{animation:none}.rx-snitch-status{position:absolute;bottom:24px;left:50%;transform:translateX(-50%);max-width:90vw;width:max-content;color:#fff;background:#263b55;font:600 13px/1.5 system-ui,sans-serif;border-radius:999px;box-shadow:0 3px 16px #0002;pointer-events:none}.rx-snitch-status:not(:empty){padding:10px 18px;border:1px solid #d7b96e}@keyframes rx-capture{0%{transform:scale(1);opacity:1}40%{filter:drop-shadow(0 0 12px #ffe4a0);transform:scale(1.2)}100%{transform:scale(.1) rotate(180deg);opacity:0}}
svg{display:block;width:100%;height:100%;overflow:visible;filter:drop-shadow(0 2px 3px #55330055)}
.wing{transform-box:view-box;animation:rx-wing .12s ease-in-out infinite alternate}
.left{transform-origin:49px 34px}.right{transform-origin:71px 34px;animation-delay:-.035s}
@keyframes rx-wing{from{transform:rotate(-15deg) scaleY(.6)}to{transform:rotate(15deg) scaleY(1)}}
@keyframes rx-flight{
0%{transform:translate3d(10px,18vh,0) rotate(-8deg);opacity:0;visibility:hidden}
3%{opacity:.96;visibility:visible}
12%{transform:translate3d(calc(100vw - 112px),24vh,0) rotate(14deg)}
20%{transform:translate3d(62vw,47vh,0) rotate(-20deg)}
27%{transform:translate3d(calc(100vw - 112px),65vh,0) rotate(15deg)}
40%{transform:translate3d(12vw,74vh,0) rotate(-13deg)}
50%{transform:translate3d(10px,33vh,0) rotate(-10deg)}
60%{transform:translate3d(38vw,21vh,0) rotate(12deg)}
72%{transform:translate3d(calc(100vw - 112px),40vh,0) rotate(9deg)}
81%{transform:translate3d(calc(100vw - 112px),72vh,0) rotate(-9deg);opacity:.96}
87%,100%{transform:translate3d(calc(100vw - 112px),72vh,0);opacity:0;visibility:hidden}
}
@media(max-width:600px){.rx-snitch-flight{width:80px;height:56px;animation-duration:30s}}
@media(prefers-reduced-motion:reduce),print{:host{display:none!important}}
</style><button type="button" class="rx-snitch-flight"><svg viewBox="0 0 120 80" aria-hidden="true" focusable="false"><defs>
<radialGradient id="body" cx=".32" cy=".25" r=".77"><stop stop-color="#fff5c6"/><stop offset=".24" stop-color="#eec56b"/><stop offset=".58" stop-color="#bd8127"/><stop offset=".84" stop-color="#8d5717"/><stop offset="1" stop-color="#f3cb75"/></radialGradient>
<linearGradient id="feather" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#f9fafb"/><stop offset=".3" stop-color="#bfc4c8"/><stop offset=".52" stop-color="#f0f1f0"/><stop offset="1" stop-color="#656c73"/></linearGradient>
</defs><g class="wing left"><path d="M51 36C35 18 16 12 3 10Q9 27 29 36L12 29Q22 42 43 44L25 43Q37 50 52 43Z" fill="url(#feather)" stroke="#555c61" stroke-width=".85"/><path d="M49 39Q28 24 8 14M43 41L20 32M47 44L30 43M18 16Q17 24 27 34M26 20Q25 29 34 39M34 25Q32 33 42 43M42 30Q39 38 48 45" fill="none" stroke="#63696e" stroke-width=".85"/></g>
<g class="wing right"><path d="M69 36C85 18 104 12 117 10Q111 27 91 36L108 29Q98 42 77 44L95 43Q83 50 68 43Z" fill="url(#feather)" stroke="#555c61" stroke-width=".85"/><path d="M71 39Q92 24 112 14M77 41L100 32M73 44L90 43M102 16Q103 24 93 34M94 20Q95 29 86 39M86 25Q88 33 78 43M78 30Q81 38 72 45" fill="none" stroke="#63696e" stroke-width=".85"/></g>
<circle cx="60" cy="40" r="15.5" fill="url(#body)" stroke="#90601d" stroke-width="1.2"/>
<path d="M51 28Q65 33 70 50M47 37Q59 39 65 54M59 25Q68 30 74 39M46 44Q54 46 57 55" stroke="#794a15" stroke-width="1" fill="none" opacity=".85"/>
<path d="M52 29Q66 34 71 49M48 36Q60 38 66 53M60 25Q70 30 75 39" stroke="#ffe4a0" stroke-width=".8" fill="none"/>
<ellipse cx="54" cy="33" rx="3.2" ry="2" fill="#fff7d7" opacity=".85" transform="rotate(-30 54 33)"/></svg></button><div class="rx-snitch-status" role="status" aria-live="polite"></div>`;
    const button=shadow.querySelector("button");
    function localize(){const ar=document.documentElement.lang.toLowerCase().startsWith("ar");const label=ar?"أمسك بالسنيتش الذهبية لإيقافها":"Catch the Golden Snitch";button.setAttribute("aria-label",label);button.setAttribute("title",label)}
    localize();
    const status=shadow.querySelector(".rx-snitch-status");
    button.addEventListener("click",()=>{if(button.disabled)return;try{window.sessionStorage.setItem(key,"1")}catch{}button.disabled=true;button.dataset.caught="true";status.textContent=document.documentElement.lang.toLowerCase().startsWith("ar")?"أمسكت بالسنيتش الذهبية!":"You caught the Golden Snitch!";window.setTimeout(()=>{if(document.getElementById(id)===host)remove()},1800)});
    button.addEventListener("keydown",e=>{if(e.key==="Escape"){e.preventDefault();button.click()}});
    document.body.appendChild(host);
    if(window.MutationObserver){observer=new window.MutationObserver(localize);observer.observe(document.documentElement,{attributes:true,attributeFilter:["lang"]})}
  }
  function sync(){if(motion.matches)remove();else mount()}
  motion.addEventListener?.("change",sync);
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",sync,{once:true});else sync();
})(window,document);
