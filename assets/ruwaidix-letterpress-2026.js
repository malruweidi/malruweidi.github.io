/* RUWAIDIX Letterpress / progressive tabs for an original typographic reading index.
   The complete text and links remain accessible without JavaScript. */
(() => {
  "use strict";
  const root=document.querySelector('[data-rx-letterpress]');
  if(!root) return;
  const tabs=[...root.querySelectorAll('[role="tab"][aria-controls]')];
  const panels=[...root.querySelectorAll('[data-rx-press-panel]')];
  if(tabs.length!==4||panels.length!==4||
      !tabs.every((tab,i)=>tab.getAttribute('aria-controls')===panels[i].id))return;
  const choose=(index,focus=false)=>{
    const next=(index+tabs.length)%tabs.length;
    tabs.forEach((tab,i)=>{
      const active=i===next;
      tab.setAttribute('aria-selected',String(active));
      tab.tabIndex=active?0:-1;
      panels[i].dataset.active=String(active);
      panels[i].hidden=!active;
    });
    if(focus)tabs[next].focus();
  };
  tabs.forEach((tab,i)=>{
    tab.addEventListener("click",()=>choose(i));
    tab.addEventListener("keydown",event=>{
      let index;
      if(event.key==="Home")index=0;
      else if(event.key==="End")index=tabs.length-1;
      else if(event.key==="ArrowRight")index=i+(document.documentElement.dir==="rtl"?-1:1);
      else if(event.key==="ArrowLeft")index=i+(document.documentElement.dir==="rtl"?1:-1);
      else if(event.key==="ArrowDown")index=i+1;
      else if(event.key==="ArrowUp")index=i-1;
      else return;
      event.preventDefault();
      choose(index,true);
    });
  });
  root.dataset.enhanced="true";
  choose(0);
})();
