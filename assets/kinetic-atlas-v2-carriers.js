/* Scene atelier 02 — inhalable therapeutic carriers. */
(function(root){
"use strict";
const A=root.RuwaidixAtlasV2;if(!A)throw Error("Load visual core before the scene ateliers");
const pi=Math.PI,angle=(i,n)=>i*2*pi/n;
A.register("bilayer",v=>{
 const {t,ref,circ:c,line:ln,text:T,each}=v;
 const radius=66+40*t,inner=radius-26;
 return c(306,204,radius+7,ref("vesicle"),{opacity:".72",filter:ref("shadow")})+
  c(306,204,inner,"#163c4e",{stroke:"#bee8d7","stroke-width":"1.4"})+
  each(32,i=>{let a=angle(i,32),r=radius;
    return ln(306+(r-23)*Math.cos(a),204+(r-23)*Math.sin(a),
      306+(r-6)*Math.cos(a),204+(r-6)*Math.sin(a),"#9ed9c9",2.2,{opacity:".85"})+
      c(306+r*Math.cos(a),204+r*Math.sin(a),5.4,ref("orb"));})+
  each(12,i=>{let a=i*2.399,r=14+(i%5)*10;return c(306+r*Math.cos(a),204+r*Math.sin(a),3.7,"#e6bb99",{opacity:".56"});})+
  ln(413,162,477,140,"#c6e9d8",1.4)+c(413,162,3.5,"#c6e9d8")+
  T(485,142,"BILAYER",11,"#e5e7d6",{"letter-spacing":"1"})+
  ln(389,255,475,278,"#e1c8a8",1.3)+T(479,281,"CORE",11,"#eddbc9",{"letter-spacing":"1"});
});
A.register("size",v=>{
 const {t,ref,circ:c,line:ln,path:p,text:T,each,series}=v;
 const distribution=.09+.22*t;
 return each(25,i=>{const a=i*2.399,spread=20+(i%6)*21;
   return c(217+spread*Math.cos(a),210+spread*Math.sin(a),
     5+(i%5)*2+(i%4)*t*5,ref("vesicle"),{stroke:"#e7f5ea","stroke-opacity":".45","stroke-width":".7"});})+
   ln(361,289,568,289,"#d0e8dc",1.6)+ln(361,289,361,120,"#d0e8dc",1.6)+
   each(5,i=>ln(366,151+i*30,562,151+i*30,"#96babc",.7,{opacity:".16"}))+
   p(series(u=>286-136*Math.exp(-.5*((u-.49)/distribution)**2),70,366,563),
      "none","#badfd3",4,{"stroke-linecap":"round"})+
   T(384,117,"SIZE DISTRIBUTION",10,"#e2e9e0",{"letter-spacing":"1"})+
   T(425,312,t>.55?"BROAD":"NARROW",10,"#e9caa0",{"letter-spacing":"1.8"});
});
A.register("charge",v=>{
 const {t,ref,circ:c,ell:e,line:ln,path:p,text:T,each}=v;
 const dist=75+63*t;
 const sphere=(x,y)=>c(x,y,34,ref("vesicle"),{stroke:"#bcf0df","stroke-width":"1.8",filter:ref("shadow")})+
  T(x,y+9,"+",29,"#f8f4e2",{"text-anchor":"middle","font-weight":"500"});
 return sphere(315-dist,218)+sphere(315,161)+sphere(315+dist,218)+
   each(4,i=>{let a=i*pi/3-.6;return p(
      "M"+(246+20*i)+" "+(271+i%2*10)+" Q"+(275+17*i)+" 300 "+(308+15*i)+" "+(274-i%3*10),
      "none","#88cabe",1.1,{opacity:".27"});})+
   ln(244,154,205-23*t,139,"#e9cda4",2.3)+
   p("M"+(219-23*t)+" "+(132)+" L"+(203-23*t)+" 139 L"+(218-23*t)+" 149",
     "none","#e9cda4",2)+
   ln(397,154,434+26*t,139,"#e9cda4",2.3)+
   T(220,301,"LIKE CHARGES / REPULSION",11,"#e1e5dc",{"letter-spacing":".7"});
});
A.register("cargo",v=>{
 const {t,ref,circ:c,line:ln,text:T,each}=v;
 const count=3+Math.round(23*t);
 return c(264,205,108,ref("vesicle"),{stroke:"#d7f4e6","stroke-width":"1.2",filter:ref("shadow")})+
  c(264,205,96,"#204455",{stroke:"#dbf6ec","stroke-width":"1.6"})+
  each(32,i=>{let a=angle(i,32);return c(264+102*Math.cos(a),205+102*Math.sin(a),4.2,ref("orb"));})+
  each(count,i=>{const a=i*2.399,r=15+(i%5)*14;return c(264+r*Math.cos(a),205+r*Math.sin(a),4.1,"#eed3af",{opacity:".83"});})+
  ln(369,167,461,143,"#b5dcd4",1.5)+T(467,146,"MEMBRANE",10,"#e9e6d6",{"letter-spacing":"1"})+
  ln(368,250,463,276,"#f0d2a7",1.5)+T(469,279,"CARGO",11,"#f0d2a7",{"letter-spacing":"1.2"});
});
A.register("nebulizer",v=>{
 const {t,ref,circ:c,ell:e,rect:b,path:p,line:ln,text:T,each}=v;
 const count=5+Math.round(t*38);
 return e(168,294,115,13,"#000",{opacity:".24",filter:ref("soft")})+
  p("M72 174 Q77 145 112 145 L195 145 L223 172 L223 247 Q214 275 186 277 L110 277 Q76 269 72 244Z",
    ref("metal"),"#e6f1e8",1.7,{filter:ref("shadow")})+
  b(87,166,114,12,6,"#34566a")+
  b(101,189,92,49,8,"#21445b")+
  ln(221,207,267,207,"#e0e9db",17,{"stroke-linecap":"round"})+
  ln(220,207,267,207,"#f3d3a8",7,{"stroke-linecap":"round"})+
  each(count,i=>{let u=(i+1)/(count+2),x=274+289*u,y=208+Math.sin(i*2.8)*(13+118*t)*u;
    return c(x,y,2.4+(i%5)*1.4,i%2?"#9eddd1":"#efd0a0",{opacity:.25+.56*(1-u)});})+
  p("M275 191 Q445 "+(166-76*t)+" 572 165","none","#c4e2db",1,{opacity:".23"})+
  p("M274 226 Q457 "+(245+81*t)+" 581 248","none","#e6d1af",1,{opacity:".23"})+
  T(103,256,"NEBULIZER",10,"#e5e9df",{"letter-spacing":"1"});
});
})(typeof globalThis!=="undefined"?globalThis:window);