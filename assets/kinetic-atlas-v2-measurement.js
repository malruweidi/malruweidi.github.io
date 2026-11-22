/* Scene atelier 05 — microscopes, selections and data measurement. */
(function(root){
"use strict";
const A=root.RuwaidixAtlasV2;if(!A)throw Error("Visual foundation missing");
A.register("focus",v=>{
 const {t,ref,id,addDef,path:p,rect:b,ell:e,circ:c,line:ln,text:T,each,g}=v;
 const blur=Math.round(Math.abs(t-.51)*70)/10;
 addDef('<filter id="'+id("focusBlur")+'" x="-40%" y="-50%" width="180%" height="200%"><feGaussianBlur stdDeviation="'+blur+'"/></filter>');
 return e(303,290,133,11,"#000",{opacity:".26",filter:ref("soft")})+
   b(191,257,259,19,8,ref("metal"),{stroke:"#c7e1df","stroke-width":"1.2"})+
   b(202,275,18,26,3,"#7394a3")+
   p("M306 112 L362 112 L347 179 L318 179 Z",ref("metal"),"#dceee5",1.5,{filter:ref("shadow")})+
   b(283,105,100,16,5,"#7190a3")+
   b(316,176,34,25,5,"#c6dcd9")+
   ln(332,201,332,227,"#f5d4a6",1.8,{"stroke-dasharray":"3 6"})+
   g(each(13,i=>{let aa=i*2.399,r=18+i*7;return c(328+r*Math.cos(aa),235+r*.26*Math.sin(aa),4+(i%3)*2,ref("orb"),{opacity:".8"});}),
     {filter:ref("focusBlur")})+
   c(442,146,34,"#305267",{stroke:"#c4e1df","stroke-width":"4"})+
   c(442,146,16,"#1c3b4f",{stroke:"#eacb9d","stroke-width":"2"})+
   T(483,153,"FOCUS",10,"#eae6d7",{"letter-spacing":"1.2"});
});
A.register("iris",v=>{
 const {t,ref,circ:c,path:p,text:T,each}=v,pi=Math.PI;
 const open=17+68*t;
 return c(306,208,116,"#324e64",{stroke:"#cbd9d6","stroke-width":"6",filter:ref("shadow")})+
   c(306,208,100,"#0a2034",{stroke:"#718c9a","stroke-width":"1.6"})+
   each(9,i=>{let aa=i*2*pi/9,ab=(i+1)*2*pi/9,r=107;
      return p("M306 208 L"+(306+r*Math.cos(aa))+" "+(208+r*Math.sin(aa))+
        " Q"+(306+70*Math.cos(aa+.54))+" "+(208+70*Math.sin(aa+.54))+
        " "+(306+r*Math.cos(ab))+" "+(208+r*Math.sin(ab))+" Z",
        ref("metal"),"#6b8796",1.1,{opacity:".78"});})+
   c(306,208,open,"#f0d5a3",{opacity:".85",filter:ref("shadow")})+
   c(306,208,open*.56,"#fff5dc",{opacity:".27"})+
   T(438,215,"APERTURE",11,"#e9ddc9",{"letter-spacing":"1.1"});
});
A.register("roi",v=>{
 const {t,ref,rect:b,circ:c,text:T,each}=v;
 const w=57+161*t,h=47+92*t,x=325-w/2,y=204-h/2;
 return b(122,106,393,199,14,"#22435a",{stroke:"#87b4b8","stroke-width":"1.5",filter:ref("shadow")})+
  each(15,i=>{let a=i*2.399,r=20+i*8;
      return c(325+r*Math.cos(a),208+r*.70*Math.sin(a),11+(i%3)*3,ref("vesicle"),
        {opacity:".9",stroke:"#c4e5d6","stroke-width":".7"});})+
  b(x,y,w,h,3,"#ead0a2",{stroke:"#f2cb88","stroke-width":"2.5","stroke-dasharray":"8 6","fill-opacity":".06"})+
  each(4,i=>c(x+(i%2)*w,y+Math.floor(i/2)*h,4.2,"#f0ce9a",{stroke:"#fff3dd","stroke-width":"1.1"}))+
  T(145,128,"CELL FIELD",10,"#d4e4dc",{"letter-spacing":"1"})+
  T(464,288,"ROI",11,"#f2d0a1",{"letter-spacing":"1.5"});
});
A.register("tracking",v=>{
 const {t,ref,path:p,circ:c,line:ln,text:T,each}=v;
 const n=2+Math.round(16*t);
 const xx=i=>82+(i/17)*475,yy=i=>250-100*Math.sin(i/17*2.7)+12*Math.sin(i/17*8);
 return each(32,i=>{let x=81+(i*151%491),y=111+(i*53%184);return c(x,y,1.8,"#b5e0df",{opacity:".18"});})+
  p(each(18,i=>(i?" L":"M")+xx(i)+","+yy(i)),"none","#9ab7bb",1.1,{"stroke-dasharray":"4 8",opacity:".4"})+
  each(n,i=>(i?ln(xx(i-1),yy(i-1),xx(i),yy(i),"#efcb92",2.7):"")+
    c(xx(i),yy(i),i===n-1?7:3.5,i===n-1?"#f1d2a0":"#b4e4d7",{stroke:"#fff3e0","stroke-width":"1"}))+
  T(80,116,"FRAME-TO-FRAME TRAJECTORY",10,"#e8e5d8",{"letter-spacing":"1.1"});
});
A.register("calibration",v=>{
 const {t,ref,path:p,circ:c,line:ln,text:T,each}=v;
 return each(6,i=>ln(76,126+i*30,572,126+i*30,"#8ba5b5",.8,{opacity:".22"}))+
  each(10,i=>ln(76+i*54,121,76+i*54,305,"#8ba5b5",.8,{opacity:".21"}))+
  ln(77,303,578,303,"#cadbd7",1.4)+ln(77,303,77,118,"#cadbd7",1.4)+
  ln(95,282,551,128,"#a4dfd4",3)+
  each(10,i=>{const x=113+i*45,y=276-i*14.3+((i%2)?1:-1)*(2+36*t)*(.4+(i%3)*.2);
     return c(x,y,5.5,ref("orb"),{stroke:"#fff3e5","stroke-width":"1.1"});})+
  T(93,112,"SYNTHETIC CALIBRATION",10,"#e8e4d8",{"letter-spacing":"1.1"})+
  T(481,318,"INPUT",9,"#d5e2df",{"letter-spacing":"1.4"});
});
})(typeof globalThis!=="undefined"?globalThis:window);