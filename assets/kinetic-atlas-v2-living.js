/* Scene atelier 04 — vascular, developmental and cellular movement. */
(function(root){
"use strict";
const A=root.RuwaidixAtlasV2;if(!A)throw Error("Visual foundation missing");
A.register("zebrafish",v=>{
 const {t,ref,path:p,circ:c,ell:e,line:ln,text:T,each,g,xy}=v;
 const px=177+268*t,py=202+11*Math.sin(t*5),tail=12*Math.sin(t*8);
 const body=p("M-72 0 Q-34 -38 25 -27 Q68 -18 94 0 Q65 26 19 31 Q-37 32 -72 0Z",
    ref("vesicle"),"#c1efdd",2.2)+
   p("M-72 0 L"+(-130-tail)+" -42 Q-103 0 "+(-130+tail)+" 43 Z",
     ref("fluid"),"#9fd4d3",1.6)+
   p("M-12 -30 L18 -64 L39 -26Z",ref("vesicle"),"#bce5db",1.3)+
   p("M0 27 L13 50 L35 26Z",ref("vesicle"),"#a6ddd1",1.2)+
   each(6,i=>p("M"+(-48+i*21)+" -18 Q"+(-27+i*16)+" 0 "+(-51+i*20)+" 15",
       "none","#2d6480",2,{opacity:".55"}))+
   e(13,4,51,15,"#e9f6d6",{opacity:".19"})+
   c(64,-8,5,"#173c45",{stroke:"#f5f3df","stroke-width":"2"})+
   p("M53 -14 Q41 1 54 15","none","#547886",1.3);
 return e(px,299,132,11,"#000",{opacity:".20",filter:ref("soft")})+
   g(body,{transform:"translate("+px+" "+py+")",filter:ref("shadow")})+
   each(9,i=>c(71+i*56,129+18*Math.sin(i*2),2.2,"#b5d5d7",{opacity:".26"}))+
   p("M53 285 Q310 251 588 285","none","#bad4cb",1,{opacity:".3","stroke-dasharray":"5 10"});
});
A.register("blood",v=>{
 const {t,ref,path:p,ell:e,text:T,each,g}=v;
 const vessel="M39 222 Q162 87 302 186 T604 174";
 return p(vessel,"none","#a16f73",85,{"stroke-linecap":"round",filter:ref("shadow")})+
   p(vessel,"none","#ecb09e",74,{"stroke-linecap":"round"})+
   p(vessel,"none","#6d4159",63,{"stroke-linecap":"round"})+
   p(vessel,"none","#40344d",54,{"stroke-linecap":"round"})+
   each(10,i=>{let u=(i/10+.78*t)%1,x=60+524*u,y=186+36*Math.sin(u*8.3);
     return g(e(x,y,14,8,"#d77c7b",{stroke:"#ffb8ad","stroke-width":"1.4"})+
       e(x-1,y,6,3,"#984b65",{opacity:".75"}),
       {transform:"rotate("+(18*Math.cos(u*7))+" "+x+" "+y+")"});})+
   T(100,126,"FLOW THROUGH A VESSEL",10,"#ecd3c7",{"letter-spacing":"1.2"});
});
A.register("heartbeat",v=>{
 const {t,ref,path:p,line:ln,circ:c,text:T,each}=v;
 const curve="M56 210 L161 210 L183 190 L209 235 L232 137 L256 261 L282 211 L580 211";
 return each(6,i=>ln(57,127+i*30,580,127+i*30,"#87a7b6",.8,{opacity:".2"}))+
   each(10,i=>ln(57+i*57,125,57+i*57,303,"#87a7b6",.8,{opacity:".19"}))+
   p(curve,"none","#9cddd0",3.4,{"stroke-linecap":"round","stroke-linejoin":"round"})+
   ln(60+514*t,125,60+514*t,304,"#efcb97",1.6,{"stroke-dasharray":"5 6"})+
   c(60+514*t,211,6.5,ref("orb"),{stroke:"#fff5dd","stroke-width":"1.1"})+
   T(77,148,"TIME SERIES",10,"#d7dfd5",{"letter-spacing":"1"})+
   T(462,288,"SCHEMATIC",10,"#d6d9d0",{"letter-spacing":"1"});
});
A.register("cilia",v=>{
 const {t,ref,circ:c,rect:b,line:ln,path:p,text:T,each}=v;
 return p("M52 268 Q299 257 588 268 L585 312 L53 312Z",ref("tissue"),"#efd0c0",1.1)+
   each(18,i=>{let x=72+i*28;
     return p("M"+x+" 264 Q"+(x+8+35*t)+" 207 "+(x+46*t)+" 155",
       "none","#9cdac9",4,{"stroke-linecap":"round"})+
       c(x,275,6.6,"#936d7c",{opacity:".8"});})+
   ln(167,122,484,122,"#f0cda2",3)+
   p("M472 112 L486 122 L472 132","none","#f0cda2",2)+
   T(268,108,"FLOW",10,"#f6e9cf",{"letter-spacing":"1.8"});
});
A.register("frames",v=>{
 const {t,ref,circ:c,ell:e,rect:b,line:ln,points:poly,text:T,each}=v;
 const n=7,active=Math.min(n-1,Math.floor(t*n));
 return b(47,133,547,165,12,"#102b3f",{stroke:"#87a8b1","stroke-width":"1.3",filter:ref("shadow")})+
  each(n,i=>{let x=62+i*75,yy=206+12*Math.sin(i*.75),bright=i===active;
    return b(x,154,67,123,5,bright?"#396578":"#213f57",{stroke:bright?"#e5ca9e":"#608594","stroke-width":bright?2.4:.8})+
      e(x+33+i*1.5,yy,17,8,bright?"#bae5cf":"#79afb0")+
      poly((x+16)+","+yy+" "+(x+2)+","+(yy-13)+" "+(x+2)+","+(yy+13),"#9fdaca")+
      c(x+48,yy-2,2,"#173b48")+
      b(x+7,139,12,4,1,bright?"#f2d5a6":"#718b94");})+
  T(209,117,"TEMPORAL SAMPLES",11,"#e8e5d5",{"letter-spacing":"1.3"});
});
})(typeof globalThis!=="undefined"?globalThis:window);