/* Ruwaidix: original vector Golden Snitch Easter egg, isolated in Shadow DOM. */
(function install(window,document){
  "use strict";
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
.rx-snitch-flight{position:absolute;top:0;left:0;width:76px;height:54px;border:0;padding:0;background:transparent;cursor:pointer;pointer-events:auto;animation:rx-flight 24s infinite linear;will-change:transform;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.rx-snitch-flight:focus-visible{animation-play-state:paused;outline:2px solid #b88a35;outline-offset:2px;border-radius:50%}
svg{display:block;width:100%;height:100%;overflow:visible;filter:drop-shadow(0 2px 3px #55330055)}
.wing{transform-box:view-box;animation:rx-wing .12s ease-in-out infinite alternate}
.left{transform-origin:49px 34px}.right{transform-origin:71px 34px;animation-delay:-.035s}
@keyframes rx-wing{from{transform:rotate(-15deg) scaleY(.6)}to{transform:rotate(15deg) scaleY(1)}}
@keyframes rx-flight{
0%{transform:translate3d(10px,18vh,0) rotate(-8deg);opacity:0}
3%{opacity:.96}
12%{transform:translate3d(calc(100vw - 88px),24vh,0) rotate(14deg)}
20%{transform:translate3d(62vw,47vh,0) rotate(-20deg)}
27%{transform:translate3d(calc(100vw - 88px),65vh,0) rotate(15deg)}
40%{transform:translate3d(12vw,74vh,0) rotate(-13deg)}
50%{transform:translate3d(10px,33vh,0) rotate(-10deg)}
60%{transform:translate3d(38vw,21vh,0) rotate(12deg)}
72%{transform:translate3d(calc(100vw - 88px),40vh,0) rotate(9deg)}
81%{transform:translate3d(calc(100vw - 88px),72vh,0) rotate(-9deg);opacity:.96}
87%,100%{transform:translate3d(calc(100vw - 88px),72vh,0);opacity:0;visibility:hidden}
}
@media(max-width:600px){.rx-snitch-flight{width:64px;height:48px;animation-duration:30s}}
@media(prefers-reduced-motion:reduce),print{:host{display:none!important}}
</style><button type="button" class="rx-snitch-flight"><svg viewBox="0 0 120 80" aria-hidden="true" focusable="false"><defs>
<radialGradient id="body" cx=".32" cy=".25" r=".77"><stop stop-color="#fff5c6"/><stop offset=".24" stop-color="#eec56b"/><stop offset=".58" stop-color="#bd8127"/><stop offset=".84" stop-color="#8d5717"/><stop offset="1" stop-color="#f3cb75"/></radialGradient>
<linearGradient id="feather" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#fff7dc"/><stop offset=".48" stop-color="#d9c292"/><stop offset="1" stop-color="#98703b"/></linearGradient>
</defs><g class="wing left"><path d="M51 36C35 18 16 12 3 10Q9 27 29 36L12 29Q22 42 43 44L25 43Q37 50 52 43Z" fill="url(#feather)" stroke="#aa803a" stroke-width=".85"/><path d="M49 39Q28 24 8 14M43 41L20 32M47 44L30 43" fill="none" stroke="#a17a43" stroke-width=".85"/></g>
<g class="wing right"><path d="M69 36C85 18 104 12 117 10Q111 27 91 36L108 29Q98 42 77 44L95 43Q83 50 68 43Z" fill="url(#feather)" stroke="#aa803a" stroke-width=".85"/><path d="M71 39Q92 24 112 14M77 41L100 32M73 44L90 43" fill="none" stroke="#a17a43" stroke-width=".85"/></g>
<circle cx="60" cy="40" r="15.5" fill="url(#body)" stroke="#90601d" stroke-width="1.2"/>
<path d="M51 28Q65 33 70 50M47 37Q59 39 65 54M59 25Q68 30 74 39M46 44Q54 46 57 55" stroke="#794a15" stroke-width="1" fill="none" opacity=".85"/>
<path d="M52 29Q66 34 71 49M48 36Q60 38 66 53M60 25Q70 30 75 39" stroke="#ffe4a0" stroke-width=".8" fill="none"/>
<ellipse cx="54" cy="33" rx="3.2" ry="2" fill="#fff7d7" opacity=".85" transform="rotate(-30 54 33)"/></svg></button>`;
    const button=shadow.querySelector("button");
    function localize(){const ar=document.documentElement.lang.toLowerCase().startsWith("ar");const label=ar?"أمسك بالسنيتش الذهبية لإيقافها":"Catch the Golden Snitch";button.setAttribute("aria-label",label);button.setAttribute("title",label)}
    localize();
    button.addEventListener("click",()=>{try{window.sessionStorage.setItem(key,"1")}catch{}remove()});
    button.addEventListener("keydown",e=>{if(e.key==="Escape"){e.preventDefault();button.click()}});
    document.body.appendChild(host);
    if(window.MutationObserver){observer=new window.MutationObserver(localize);observer.observe(document.documentElement,{attributes:true,attributeFilter:["lang"]})}
  }
  function sync(){if(motion.matches)remove();else mount()}
  motion.addEventListener?.("change",sync);
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",sync,{once:true});else sync();
})(window,document);
