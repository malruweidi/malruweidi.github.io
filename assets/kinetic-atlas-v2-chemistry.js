/* Scene atelier 01 — chemical sensing and analytical chemistry. */
(function(root){
"use strict";
const a=root.RuwaidixAtlasV2;
if(!a)throw Error("Kinetic Atlas visual core must load first");
const pi=Math.PI;
a.register("indicator",v=>{
 const {t,ref,id,addDef,path:p,circ:c,ell:e,rect:b,line:ln,text:T,each,accent,sub}=v;
 const hue=Math.round(42-34*t),tone="hsl("+hue+" 79% 73%)";
 addDef('<linearGradient id="'+id("solution")+'" x1="0%" y1="0%" x2="0%" y2="100%">'+
  '<stop offset="0%" stop-color="'+tone+'"/><stop offset="100%" stop-color="hsl('+hue+' 62% 52%)"/></linearGradient>');
 addDef('<clipPath id="'+id("flaskClip")+'">'+p("M168 128 L306 128 L296 275 Q239 315 180 275 Z","#fff")+'</clipPath>');
 let art=e(240,298,99,12,"#000",{opacity:".28",filter:ref("soft")})+
   p("M168 128 L306 128 L296 275 Q239 315 180 275 Z",ref("glass"),"#e7f6f1",2.7,{filter:ref("shadow")})+
   v.g(b(160,189,162,129,0,ref("solution"))+
    e(240,191,79,7,tone,{opacity:".88"})+
    each(9,i=>c(192+(i%3)*26,224+Math.floor(i/3)*21,1.9,"#fff6de",{opacity:".5"})),
    {"clip-path":ref("flaskClip")})+
   e(237,128,70,9,"#244455",{stroke:"#e3eeed","stroke-width":"2.5"})+
   p("M179 139 L190 271","none","#fff",2.8,{opacity:".39"})+
   p("M294 139 L286 270","none","#fff",2,{opacity:".3"})+
   p("M194 282 Q242 303 282 280","none","#f7e8d5",2,{opacity:".55"})+
   ln(336,209,409,209,"#f4d4a8",2)+p("M398 200 L411 209 L398 218","none","#f4d4a8",2)+
   c(505,202,67,"#183348",{stroke:"#ecd8b9","stroke-width":"1.1",filter:ref("shadow")})+
   c(505,202,53,tone,{stroke:"#ffefdb","stroke-width":"1.4"})+
   e(486,182,19,8,"#fff4e3",{opacity:".22",transform:"rotate(-28 486 182)"})+
   T(469,292,t>.52?"SHIFTED":"INITIAL",10,"#eedec6",{"letter-spacing":"2"});
 return art;
});
a.register("fluorescence",v=>{
 const {t,ref,circ:c,ell:e,rect:b,path:p,line:ln,text:T,each}=v;
 const amount=4+Math.round(17*t);
 return ln(48,201,238,201,"#65c7e7",13,{opacity:".21",filter:ref("soft")})+
  ln(48,201,240,201,"#8edcf2",4)+p("M229 192 L242 201 L229 210","none","#8edcf2",2)+
  b(249,115,116,175,10,ref("glass"),{stroke:"#d0faf6","stroke-width":"2",filter:ref("shadow")})+
  b(265,173,83,96,5,"#548b86",{opacity:".47"})+
  b(262,127,7,148,3,"#fff",{opacity:".24"})+
  ln(270,170,346,170,"#f4f9e7",1,{opacity:".6"})+
  c(304,210,22,ref("orb"))+
  each(amount,i=>{const ang=i*2.399,r=70+(i%5)*21;return c(304+Math.cos(ang)*r,210+Math.sin(ang)*r,2.5+(i%3),ref("orb"),{opacity:.32+.6*t});})+
  each(8,i=>{let ang=i*pi/4,rr=35+85*t;return ln(304+29*Math.cos(ang),210+29*Math.sin(ang),304+rr*Math.cos(ang),210+rr*Math.sin(ang),"#bbf0d9",1.2,{opacity:.15+.67*t});})+
  b(436,132,119,64,10,"#1f4053",{stroke:"#8097a2","stroke-opacity":".5"})+
  T(448,153,"EMISSION",10,"#c5dad4",{"letter-spacing":"1.2"})+
  T(448,180,Math.round(t*100)+" %",25,"#f5ecd6",{"font-weight":"500"});
});
a.register("imine",v=>{
 const {t,ref,path:p,circ:c,line:ln,text:T,each,g}=v;
 const left=187+66*t,right=458-66*t;
 const hex=x=>each(6,i=>{const aa=(i/6)*2*pi-pi/6,bb=((i+1)/6)*2*pi-pi/6;return ln(x+30*Math.cos(aa),191+30*Math.sin(aa),x+30*Math.cos(bb),191+30*Math.sin(bb),"#eee0cb",2.2);});
 return hex(left)+hex(right)+
  ln(left+30,191,left+69,191,"#eebd9d",2.5)+
  T(left+72,198,"O",20,"#f0b7a2",{"font-weight":"600"})+
  ln(right-30,191,right-64,191,"#b5e7d8",2.5)+
  T(right-107,198,"H₂N",19,"#b5e7d8",{"font-weight":"600"})+
  ln(left+57,221,right-68,221,t>.5?"#f4d5b0":"#668495",t>.5?3:1.5,{"stroke-dasharray":t>.5?"0":"5 6"})+
  ln(left+57,229,right-68,229,"#e8d8c5",1.3,{opacity:t})+
  c(106,143,22,ref("orb"),{opacity:".26"})+
  c(536,275,33,ref("orb"),{opacity:".22"})+
  T(250,291,t>.5?"C  =  N":"C  =  O   +   NH₂",16,"#d2e4d8",{"letter-spacing":"1.1"});
});
a.register("tlc",v=>{
 const {t,ref,rect:b,ell:e,line:ln,circ:c,text:T,each}=v;
 const rise=182*t;
 return e(290,302,105,11,"#000",{opacity:".29",filter:ref("soft")})+
  b(188,107,208,201,9,ref("vellum"),{stroke:"#f8e9c9","stroke-width":"2",filter:ref("shadow")})+
  b(204,120,175,174,3,"#f2e6d2")+
  ln(221,273,362,273,"#857c73",1.3)+
  b(205,273-rise,172,rise,0,"#88bcd0",{opacity:".16"})+
  ln(204,273-rise,378,273-rise,"#649aab",2,{"stroke-dasharray":"7 6"})+
  each(3,i=>e(241+57*i,269-rise*(.34+i*.23),7+i*2.4,6+i*2.2,["#b88c8d","#e2b07c","#7fa9a0"][i],{opacity:".86"}))+
  T(218,291,"BASELINE",8,"#806c62",{"letter-spacing":"1.2"})+
  ln(448,284,448,136,"#c5dacf",1.8)+
  v.path("M440 147 L448 135 L456 147","none","#c5dacf",1.8)+
  T(463,208,"SOLVENT",11,"#e6e5d8",{"letter-spacing":"1.2"})+
  T(463,224,"FRONT",11,"#e6e5d8",{"letter-spacing":"1.2"});
});
a.register("peaks",v=>{
 const {t,path:p,line:ln,text:T,each,series}=v;
 const left=.40-.17*t,right=.48+.24*t;
 const gauss=(m,s,height)=>series(u=>298-height*Math.exp(-.5*((u-m)/s)**2),84,76,553);
 return each(6,i=>ln(76,128+i*30,554,128+i*30,"#7b9aab",.8,{opacity:".25"}))+
  each(8,i=>ln(76+i*68,128,76+i*68,299,"#7b9aab",.8,{opacity:".2"}))+
  ln(75,302,558,302,"#cddbd7",1.6)+ln(75,301,75,115,"#cddbd7",1.6)+
  p(gauss(left,.090,153),"none","#f0c18d",3.5,{"stroke-linecap":"round"})+
  p(gauss(right,.096,130),"none","#a2dfd2",3.5,{"stroke-linecap":"round"})+
  T(93,115,"RELATIVE SIGNAL",10,"#d4dfdb",{"letter-spacing":"1.3"})+
  T(447,317,"RETENTION",10,"#c6d5d7",{"letter-spacing":"1.1"})+
  ln(406,118,422,118,"#f0c18d",3)+T(431,121,"A",10)+
  ln(475,118,491,118,"#a2dfd2",3)+T(498,121,"B",10);
});
})(typeof globalThis!=="undefined"?globalThis:window);