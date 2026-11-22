/* Scene atelier 03 — pulmonary epithelia and respiratory interfaces. */
(function(root){
"use strict";
const A=root.RuwaidixAtlasV2;if(!A)throw Error("Visual foundation missing");
A.register("airways",v=>{
 const {t,ref,circ:c,path:p,line:ln,text:T,ell:e,each}=v;
 const trace="M309 111 L309 158 Q299 171 283 186 M309 158 Q331 175 350 190 M283 186 Q255 208 226 238 M283 186 Q278 229 290 261 M350 190 Q382 212 419 237 M350 190 Q343 235 366 264";
 const rounded={"stroke-linecap":"round","stroke-linejoin":"round"};
 return p(trace,"none","#a5676e",26,{...rounded,filter:ref("shadow")})+
  p(trace,"none","#e3a18e",21,rounded)+
  p(trace,"none","#354a5b",11,rounded)+
  each(3,i=>c(228+i*94,242+15*Math.sin(i*2),25,ref("tissue"),{stroke:"#f8d4bb","stroke-width":"1.4",opacity:".75"}))+
  c(309,116+126*t,7.6,ref("orb"),{stroke:"#fff2e0","stroke-width":"1"})+
  T(91,164,"PROXIMAL",11,"#e5d3c6",{"letter-spacing":"1"})+
  ln(161,160,282,161,"#d1b4a8",1.2,{opacity:".6"});
});
A.register("alveolus",v=>{
 const {t,ref,circ:c,path:p,line:ln,text:T,each}=v,pi=Math.PI;
 return p("M313 112 L315 160 Q282 162 264 180","none","#c98183",24,{"stroke-linecap":"round"})+
  each(5,i=>{let a=i*2*pi/5+.25,x=310+Math.cos(a)*(55+23*t),y=216+Math.sin(a)*(38+18*t);
    return c(x,y,33+18*t,ref("tissue"),{stroke:"#ffe2c8","stroke-width":"2.3",filter:i===0?ref("shadow"):undefined})+
      c(x-8,y-10,15+8*t,"#fff0d4",{opacity:".32"});})+
  each(17,i=>{let a=i*2*pi/17,rr=103+22*t;return c(306+rr*Math.cos(a),214+rr*.59*Math.sin(a),2.5,"#9bc7c7",{opacity:".45"});})+
  ln(431,201,393+20*t,201,"#f4d3c1",1.3)+T(437,197,"EXPANSION",11,"#f8d7c2",{"letter-spacing":"1"});
});
A.register("surfactant",v=>{
 const {t,ref,circ:c,line:ln,path:p,text:T,each}=v;
 const yy=210-8*t;
 const wave="M45 "+yy+" Q164 "+(yy-19)+" 306 "+(yy+3)+" T594 "+(yy-5);
 return p(wave+" L595 310 L45 310 Z",ref("vesicle"),"none",1,{opacity:".5"})+
  p(wave,"none","#f3c9b7",2.5)+
  each(5+Math.round(20*t),i=>{let x=60+i*24,y=yy-7*Math.sin((x-52)/93);
    return c(x,y-6,5.6,"#f3d9bc")+ln(x,y,x-4,y+23,"#a8ded5",2)+ln(x,y,x+4,y+22,"#a8ded5",2);})+
  T(75,137,"AIR PHASE",12,"#efe4d8",{"letter-spacing":"1.1"})+
  T(75,284,"LIQUID PHASE",12,"#b4e0df",{"letter-spacing":"1.1"})+
  ln(417,169,385,194,"#eac5af",1.4)+T(422,163,"SURFACE FILM",10,"#e4ddcf");
});
A.register("barrier",v=>{
 const {t,ref,path:p,ell:e,circ:c,line:ln,text:T,each}=v;
 const gap=2+22*t;
 return each(7,i=>{const x=99+i*59+(i>2?gap:0);
   return p("M"+x+" 181 Q"+(x+27)+" 160 "+(x+48)+" 186 L"+(x+49)+" 275 Q"+(x+25)+" 300 "+x+" 272 Z",
      ref("tissue"),"#f5d4c0",1.2)+e(x+25,231,11,15,"#805b71",{opacity:".7"});})+
  each(6,i=>c(226+(i%3)*23,123+Math.floor(i/3)*30+46*t,4.3,"#c9e7db",{opacity:".88"}))+
  ln(91,303,561,303,"#f0c8b5",1.4,{opacity:".7"})+
  ln(427,160,285+gap,186,"#e3baae",1.2)+
  T(433,154,"JUNCTION",11,"#f1d5c5",{"letter-spacing":"1"});
});
A.register("meniscus",v=>{
 const {t,ref,path:p,rect:b,line:ln,circ:c,text:T,each}=v;
 const x=110+382*t;
 return each(10,i=>{let xx=60+i*54;return p("M"+xx+" 233 Q"+(xx+27)+" 215 "+(xx+51)+" 234 L"+(xx+51)+" 295 Q"+(xx+27)+" 315 "+xx+" 294 Z",
      ref("tissue"),"#f8d5bc",1.1);})+
  b(59,298,532,12,6,"#5a4355")+
  p("M58 112 L"+(x-36)+" 112 Q"+(x+26)+" 165 "+x+" 233 L58 233Z",
   "#79b7cb","none",0,{opacity:".25"})+
  p("M"+(x-36)+" 109 Q"+(x+25)+" 166 "+x+" 231","none","#f1c7ac",6,{"stroke-linecap":"round"})+
  p("M"+(x-39)+" 108 Q"+(x+29)+" 167 "+(x+3)+" 229","none","#ffece2",1.6,{opacity:".7"})+
  ln(x+29,160,x+73,144,"#eac3b4",1.5)+
  T(x+75,145,"INTERFACE",10,"#f1ded1");
});
})(typeof globalThis!=="undefined"?globalThis:window);