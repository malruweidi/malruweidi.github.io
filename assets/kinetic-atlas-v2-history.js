/* Scene atelier 06 — paper, pharmacy, material memory and documented history. */
(function(root){
"use strict";
const A=root.RuwaidixAtlasV2;if(!A)throw Error("Visual foundation missing");
A.register("manuscript",v=>{
 const {t,ref,path:p,ell:e,rect:b,line:ln,circ:c,text:T,each}=v;
 const fold=69*t;
 return e(315,309,176,13,"#000",{filter:ref("soft"),opacity:".27"})+
   p("M147 117 Q230 98 312 120 L312 302 Q234 285 147 306Z",
     ref("vellum"),"#f5e5c9",1.5,{filter:ref("shadow")})+
   p("M312 119 Q393 98 483 115 L483 305 Q395 283 312 302Z",
     ref("vellum"),"#f5e5c9",1.5)+
   b(168,132,128,161,5,"none",{stroke:"#968366","stroke-opacity":".6","stroke-width":"1"})+
   b(333,131,130,163,5,"none",{stroke:"#968366","stroke-opacity":".6","stroke-width":"1"})+
   each(7,i=>ln(181,152+i*19,282,152+i*19,"#967f65",1.7,{opacity:".75"})+
     ln(347,151+i*19,447,151+i*19,"#967f65",1.7,{opacity:".7"}))+
   p("M312 119 Q"+(366+fold)+" 143 "+(482-fold)+" 127 L"+(482-fold)+" 302 Q"+(368+fold)+" 292 312 303Z",
     ref("vellum"),"#e9d2a9",1,{opacity:".87"})+
   each(4,i=>c(182+i*23,142,2.2,"#b39073",{opacity:".5"}));
});
A.register("syrup",v=>{
 const {t,ref,rect:b,ell:e,path:p,line:ln,text:T}=v;
 const stretch=25+62*t;
 return e(292,305,133,11,"#000",{opacity:".3",filter:ref("soft")})+
   b(184,129,210,174,24,ref("glass"),{stroke:"#f2ecd9","stroke-width":"2.2",filter:ref("shadow")})+
   b(226,102,126,39,6,ref("metal"),{stroke:"#eee4cc","stroke-width":"1.1"})+
   b(243,91,94,13,4,"#b58f72")+
   b(204,216,170,72,10,ref("fluid"),{opacity:".82"})+
   b(230,158,124,44,6,ref("vellum"),{opacity:".96"})+
   T(258,186,"SYRUP",13,"#79634e",{"letter-spacing":"2"})+
   p("M393 188 L435 188 L435 222","none","#d5c9b2",6,{"stroke-linecap":"round"})+
   p("M435 227 Q"+(412-10*t)+" "+(242+stretch)+" 435 "+(253+stretch)+" Q"+(456+11*t)+" "+(242+stretch)+" 435 227 Z",
     ref("fluid"),"#f3dfae",1.3);
});
A.register("light",v=>{
 const {t,ref,rect:b,ell:e,path:p,line:ln,circ:c,text:T,each}=v;
 return e(319,299,122,11,"#000",{opacity:".3",filter:ref("soft")})+
   b(261,132,128,169,18,ref("glass"),{stroke:"#e6f3e5","stroke-width":"2",filter:ref("shadow")})+
   b(283,100,83,33,7,ref("metal"))+
   b(277,180,98,68,6,ref("vellum"))+
   T(296,218,"Rx",26,"#867159",{"font-weight":"600"})+
   each(7,i=>ln(49,96+i*23,216,111+i*21,"#e8cba0",1.6,{opacity:.07+.66*t}))+
   c(91,107,39,"#f1d5a4",{opacity:.08+.66*t,filter:ref("soft")})+
   c(91,107,26,"#f1d5a4",{opacity:.10+.49*t})+
   p("M208 110 L246 164 L247 281","none","#f1d4ac",2,{opacity:.14+.61*t})+
   T(462,221,"LIGHT",11,"#f1dfc6",{"letter-spacing":"1.2"});
});
A.register("citations",v=>{
 const {t,ref,rect:b,line:ln,text:T,each}=v;
 const nodes=[[137,183],[271,148],[405,211],[509,155],[554,263]],count=1+Math.round(4*t);
 return each(5,i=>{if(i>=count)return"";let [x,y]=nodes[i],edge="";
    if(i>0){let [px,py]=nodes[i-1];edge=ln(px+23,py,x-20,y,"#e9c99d",1.8,{"stroke-dasharray":"5 5"});}
    return edge+b(x-34,y-47,78,92,7,ref("vellum"),{stroke:"#f7ead6","stroke-width":"1.1",filter:ref("shadow")})+
      each(4,j=>ln(x-21,y-26+j*13,x+25,y-26+j*13,"#997f65",2,{opacity:".62"}))+
      b(x-22,y+28,44,4,2,i===0?"#bb9188":"#8faeab")+
      T(x+3,y+63,String(i+1).padStart(2,"0"),9,"#edd8bf",{"text-anchor":"middle"});})+
   T(72,114,"FOLLOW THE SOURCE",10,"#e9d8c5",{"letter-spacing":"1.3"});
});
A.register("milestones",v=>{
 const {t,ref,rect:b,line:ln,circ:c,text:T,each}=v;
 const years=["2009","2015","2026"],roles=["SCHOOL","SENSING","DELIVERY"],position=2*t;
 return ln(112,263,541,263,"#b8b7a8",2,{opacity:".56"})+
   each(3,i=>{let x=125+i*204,active=position>=i-.08;
     return b(x-56,122,121,124,11,active?"#36576c":"#203b4f",
           {stroke:active?"#f0cb9c":"#718e98","stroke-width":active?2:1,filter:i===Math.round(position)?ref("shadow"):undefined})+
       T(x-40,163,years[i],28,active?"#f2d2a7":"#b5c0bb",{"font-weight":"600"})+
       T(x-40,194,roles[i],10,active?"#f3dfca":"#9fb6b9",{"letter-spacing":"1.5"})+
       ln(x,245,x,263,"#edcfaa",1.7)+c(x,263,active?6:4,active?"#f2d4ab":"#7299a5");})+
   c(125+408*t,263,5.5,"#fff4d8",{stroke:"#efc79f","stroke-width":"1.7"});
});
})(typeof globalThis!=="undefined"?globalThis:window);