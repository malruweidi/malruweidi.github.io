/* Thirty hand-authored, reproducible SVG interactions. No numerical output is experimental data. */
(function(root){
"use strict";
const ink="#d9edf8", blue="#7ec5e6",gold="#f3c986",mint="#a6e1cb",coral="#e79f8e",deep="#162f49",dim="#5c829c";
const R=n=>Math.round(n*10)/10, A=(n,fn)=>Array.from({length:n},(_,i)=>fn(i)).join("");
const circle=(x,y,r,f,extra="")=>'<circle cx="'+R(x)+'" cy="'+R(y)+'" r="'+R(r)+'" fill="'+f+'" '+extra+'/>';
const rect=(x,y,w,h,f,extra="")=>'<rect x="'+R(x)+'" y="'+R(y)+'" width="'+R(w)+'" height="'+R(h)+'" fill="'+f+'" '+extra+'/>';
const ln=(x,y,X,Y,c=blue,w=3,extra="")=>'<line x1="'+R(x)+'" y1="'+R(y)+'" x2="'+R(X)+'" y2="'+R(Y)+'" stroke="'+c+'" stroke-width="'+w+'" '+extra+'/>';
const path=(d,c=blue,w=3,f="none",extra="")=>'<path d="'+d+'" stroke="'+c+'" stroke-width="'+w+'" fill="'+f+'" '+extra+'/>';
const text=(x,y,t,size=13,c=ink)=>'<text x="'+R(x)+'" y="'+R(y)+'" fill="'+c+'" font-family="monospace" font-size="'+size+'">'+t+'</text>';
const wave=(fn,N=80)=>A(N+1,i=>(i?" L":"M")+R(40+i/N*560)+","+R(fn(i/N)));
const base=rect(0,0,640,380,deep)+rect(0,0,640,380,'url(#rx-grid)')+ln(25,25,90,25,dim,1)+ln(25,25,25,90,dim,1)+ln(550,353,615,353,dim,1)+ln(615,288,615,353,dim,1);
function draw(id,number){
 const t=Math.max(0,Math.min(1,Number(number)||0));
 let s="",x,y,n;
 switch(id){
 case "indicator":
   s=path("M160 84 L266 84 L250 284 Q214 325 176 284 Z",ink,4,"#254967")+
     path("M160 179 Q212 "+R(172+t*29)+" 266 179 L248 281 Q214 312 177 281 Z","none",0,t>.55?coral:gold)+
     A(6,i=>circle(187+(i%3)*20,214+Math.floor(i/3)*29,5,t>.55?coral:gold))+
     ln(302,188,418,188,gold,4)+path("M402 175 L419 188 L402 201",gold,3)+circle(502,187,49,t>.55?coral:gold)+text(452,269,t>.55?"CHANGED":"INITIAL");
   break;
 case "fluorescence":
   s=ln(55,184,275,184,gold,7)+path("M261 171 L280 184 L261 197",gold,3)+circle(324,184,57,"#234d6a",'stroke="'+blue+'" stroke-width="3"')+
     A(Math.round(5+20*t),i=>{let a=i*2.399, rr=78+i%5*23;return circle(324+Math.cos(a)*rr,184+Math.sin(a)*rr,4+3*t,mint,'opacity="'+R(.35+.65*t)+'" class="rx-atlas-glint"');})+text(295,189,"SAMPLE",12);
   break;
 case "imine":
   x=183+70*t;y=462-72*t;
   s=circle(x,183,48,"#254f65",'stroke="'+mint+'" stroke-width="3"')+
     circle(y,183,48,"#254f65",'stroke="'+gold+'" stroke-width="3"')+
     text(x-25,190,"C=O",20)+text(y-26,190,"NH₂",20,gold);
   if(t>.55)s+=ln(x+47,181,y-49,181,ink,4)+ln(x+47,192,y-49,192,ink,2);
   s+=text(216,309,t>.55?"C = N   /   linkage":"Two molecular fragments",17);
   break;
 case "tlc":
   y=314-210*t;
   s=rect(200,44,238,284,"#e9e3d5",'rx="5" stroke="'+gold+'" stroke-width="4"')+
     ln(221,304,418,304,dim,2)+rect(202,y,234,316-y,blue,'opacity=".2"')+
     ln(202,y,436,y,blue,3,'stroke-dasharray="7 5"')+
     A(3,i=>circle(253+68*i,295-t*(51+33*i),8+i*2,[coral,gold,mint][i]))+
     text(445,70,"FRONT",13);
   break;
 case "peaks":
   s=ln(44,309,598,309,dim,3)+ln(44,309,44,45,dim,3)+
     path(wave(u=>309-210*Math.exp(-Math.pow((u-(.40-.18*t))/.088,2))),gold,4)+
     path(wave(u=>309-178*Math.exp(-Math.pow((u-(.47+.24*t))/.105,2))),mint,4)+
     text(70,68,"SIGNAL",13)+text(446,337,"RETENTION →",12);
   break;
 case "bilayer":
   s=circle(320,181,109,"#24485f",'stroke="'+dim+'" stroke-width="4"')+
     A(26,i=>{let a=i*Math.PI*2/26,rr=54+62*t;return ln(320+(rr-15)*Math.cos(a),181+(rr-15)*Math.sin(a),320+(rr+8)*Math.cos(a),181+(rr+8)*Math.sin(a),mint,3)+circle(320+rr*Math.cos(a),181+rr*Math.sin(a),6,gold);})+
     text(264,343,"VESICLE",15);
   break;
 case "size":
   s=A(24,i=>{let a=i*2.399,rr=30+(i%6)*24;return circle(320+Math.cos(a)*rr,180+Math.sin(a)*rr,6+(i%4)*3+(i%5)*t*5,i%2?mint:blue,'opacity=".85"');})+text(194,345,t<.5?"NARROWER POPULATION":"WIDER POPULATION",13);
   break;
 case "charge":
   s=A(3,i=>{let cx=320+(i-1)*(75+69*t),cy=i===1?142:232;return circle(cx,cy,35,"#28526a",'stroke="'+gold+'" stroke-width="4"')+
     text(cx-9,cy+10,"+",32,gold)+ln(cx,cy+47,cx+(i-1)*(25+36*t),cy+65,mint,3);})+
     text(229,342,"LIKE CHARGES",14);
   break;
 case "cargo":
   s=circle(320,177,122,"#28465b",'stroke="'+gold+'" stroke-width="8"')+
     circle(320,177,111,"none",'stroke="'+mint+'" stroke-width="2"')+
     A(2+Math.round(20*t),i=>{let a=i*2.399,rr=25+(i%5)*17;return circle(320+rr*Math.cos(a),177+rr*Math.sin(a),6,coral);})+
     text(256,342,"DRUG CARGO",14);
   break;
 case "nebulizer":
   s=rect(58,145,121,75,"#355a75",'rx="9"')+rect(172,165,67,32,gold,'rx="6"')+
     A(4+Math.round(30*t),i=>{let u=(i+1)/(8+Math.round(30*t)),xx=244+335*u, yy=183+Math.sin(i*2.63)*u*(25+130*t);return circle(xx,yy,3+(i%5)*2,i%2?blue:mint,'class="rx-atlas-glint"');})+
     text(79,263,"NOZZLE",14);
   break;
 case "airways":
   s=path("M112 47 L193 124 L267 184 L425 184 M267 184 L372 268 L538 304 M193 124 L182 264 L103 319",blue,28)+
     path("M112 47 L193 124 L267 184 L425 184 M267 184 L372 268 L538 304 M193 124 L182 264 L103 319",deep,18);
   x=112+320*t;y=t<.5?47+274*t:184+(t-.5)*170;
   s+=circle(x,y,11,gold,'class="rx-atlas-glint"')+text(429,73,"AIRWAY",13);
   break;
 case "alveolus":
   s=A(3,i=>{let cx=[153,323,494][i],cy=i===1?165:211,r=57+33*t;return circle(cx,cy,r,"#294c63",'stroke="'+mint+'" stroke-width="5"')+
     circle(cx,cy,r*.73,"none",'stroke="'+blue+'" stroke-width="2" stroke-dasharray="5 8"');})+
     text(210,345,"EXPANSION / RECOIL",13);
   break;
 case "surfactant":
   s=rect(35,205,569,132,"#356080") +ln(35,203,605,203,blue,4)+
     A(4+Math.round(22*t),i=>{let xx=51+i*23;return circle(xx,195,7,gold)+ln(xx,202,xx,231,mint,3);})+
     text(56,83,"AIR",18)+text(60,310,"LIQUID",18);
   break;
 case "barrier":
   s=A(7,i=>{let xx=56+i*74+(i>2?43*t:0);return rect(xx,183,64,109,"#35607e",'stroke="'+mint+'" stroke-width="2" rx="13"')+
     circle(xx+32,239,11,blue);})+
     A(6,i=>circle(287+(i%2)*16,70+i*19+43*t*i/5,5,gold))+
     text(185,344,"EPITHELIAL LAYER",14);
   break;
 case "meniscus":
   x=95+446*t;
   s=rect(45,232,545,74,"#346887")+A(11,i=>rect(50+i*47,248,38,47,i%2?"#5485a0":"#47809b",'rx="10"'))+
     rect(46,44,x-46,188,blue,'opacity=".18"')+
     path("M"+R(x)+" 44 Q"+R(x-34)+" 139 "+R(x)+" 231",gold,8)+
     ln(x,48,x,229,mint,2,'stroke-dasharray="4 9"')+
     text(65,345,"AIR–LIQUID INTERFACE",13);
   break;
 case "zebrafish":
   x=138+335*t;y=177+20*Math.sin(t*5);
   s=path("M"+R(x-57)+" "+R(y)+" Q"+R(x+8)+" "+R(y-61)+" "+R(x+84)+" "+R(y)+" Q"+R(x+8)+" "+R(y+61)+" "+R(x-57)+" "+R(y)+" Z",blue,3,"#457f9e")+
     path("M"+R(x-54)+" "+R(y)+" L"+R(x-127-11*Math.sin(t*12))+" "+R(y-68)+" L"+R(x-121+11*Math.sin(t*12))+" "+R(y+67)+" Z",mint,3,"#3d748e")+
     circle(x+52,y-8,5,deep)+A(5,i=>circle(x-44+i*17,y+Math.sin(i*3)*8,3,mint))+
     path("M30 322 Q240 275 409 326 T606 310",dim,2,"none",'stroke-dasharray="5 9"');
   break;
 case "blood":
   s=path("M30 211 Q170 73 298 183 T607 165",blue,58)+path("M30 211 Q170 73 298 183 T607 165",deep,44)+
     A(8,i=>{let u=(t*.81+i/8)%1,xx=45+u*545,yy=171+35*Math.sin(u*7);return '<ellipse cx="'+R(xx)+'" cy="'+R(yy)+'" rx="14" ry="8" fill="'+coral+'" transform="rotate(-22 '+R(xx)+' '+R(yy)+')"/>';});
   break;
 case "heartbeat":
   s=ln(39,283,609,283,dim,3)+path("M42 190 L157 190 L187 167 L210 221 L241 71 L265 241 L298 190 L608 190",mint,5)+
     ln(42+565*t,56,42+565*t,313,gold,3,'stroke-dasharray="6 6"')+circle(42+565*t,190,7,gold);
   break;
 case "cilia":
   s=rect(48,273,542,40,"#396b83")+A(15,i=>{let xx=60+i*37;return path("M"+xx+" 269 Q"+R(xx+18+28*t)+" 219 "+R(xx+36*t)+" 164",mint,5);})+
     ln(154,100,488,100,gold,4)+path("M475 89 L490 100 L475 111",gold,3)+text(275,72,"FLOW →",14);
   break;
 case "frames":
   n=3+Math.round(7*t);
   s=A(n,i=>{let dx=545/n,xx=45+i*dx, cy=179+15*Math.sin(i*2);return rect(xx,115,dx-7,152,"#315b79",'stroke="'+blue+'" stroke-width="2" rx="5"')+
     '<ellipse cx="'+R(xx+dx*.45)+'" cy="'+R(cy)+'" rx="14" ry="7" fill="'+mint+'"/>';})+
     text(190,325,n+" FRAMES SHOWN",15);
   break;
 case "focus":
   s=rect(122,39,394,282,"#30546b",'rx="13" stroke="'+mint+'" stroke-width="4"')+
     '<g filter="url(#rx-atlas-focus)">'+A(14,i=>{let a=i*2.399,rr=25+i*9;return circle(320+rr*Math.cos(a),179+rr*Math.sin(a),12+(i%4)*3,gold,'opacity=".78"');})+'</g>'+
     '<defs><filter id="rx-atlas-focus" x="-25%" y="-25%" width="150%" height="150%"><feGaussianBlur stdDeviation="'+R(Math.abs(t-.52)*9)+'"/></filter></defs>'+
     text(241,349,"FOCUS ADJUSTMENT",13);
   break;
 case "iris":
   s=circle(320,182,136,deep,'stroke="'+dim+'" stroke-width="15"')+
     A(10,i=>{let a=i*Math.PI*2/10;return ln(320,182,320+136*Math.cos(a),182+136*Math.sin(a),dim,2);})+
     circle(320,182,22+95*t,gold,'opacity="'+R(.26+.5*t)+'"')+
     circle(320,182,12+48*t,mint,'opacity=".28"')+
     text(262,342,"APERTURE",14);
   break;
 case "roi":
   s=A(14,i=>{let a=i*2.399,rr=20+i*9;return circle(320+rr*Math.cos(a),181+rr*Math.sin(a),10+(i%3)*4,blue,'opacity=".82"');})+
     rect(319-(45+163*t)/2,181-(45+163*t)/2,45+163*t,45+163*t,"none",'stroke="'+gold+'" stroke-width="4" stroke-dasharray="8 6"')+
     text(242,350,"REGION OF INTEREST",13);
   break;
 case "tracking":
   n=2+Math.round(t*17);
   s=path("M70 253 Q179 90 280 193 T556 124",dim,2,"none",'stroke-dasharray="7 8"')+
     A(n,i=>{let u=i/(n-1),xx=70+485*u,yy=248-107*Math.sin(u*2.55)+17*Math.sin(u*8);return (i?ln(70+485*((i-1)/(n-1)),248-107*Math.sin(((i-1)/(n-1))*2.55)+17*Math.sin(((i-1)/(n-1))*8),xx,yy,gold,2):"")+circle(xx,yy,i===n-1?8:4,mint);})+
     text(213,339,"TIME / TRACKING",13);
   break;
 case "calibration":
   s=ln(62,310,584,310,dim,3)+ln(62,310,62,49,dim,3)+path("M81 281 L558 82",mint,3)+
     A(9,i=>{let xx=108+51*i,yy=266-22*i+((i%2)?1:-1)*(3+48*t)*(.38+(i%3)*.21);return circle(xx,yy,6,gold);})+
     text(78,66,"SYNTHETIC POINTS",13);
   break;
 case "manuscript":
   s=rect(110,58,420,268,"#eee0c3",'rx="6" stroke="'+gold+'" stroke-width="5"')+
     ln(320,58,320,325,"#a38b68",3)+
     A(7,i=>ln(137,103+i*29,277,103+i*29,"#a18c73",3)+ln(357,103+i*29,493,103+i*29,"#a18c73",3))+
     path("M320 66 Q"+R(472+65*t)+" 101 "+R(529-198*t)+" 86 L"+R(529-198*t)+" 301 Q"+R(445+65*t)+" 281 320 317 Z",gold,3,"#dfc99d",'opacity=".9"')+
     text(221,352,"A FOLIO / DRAWN",13);
   break;
 case "syrup":
   s=rect(171,65,300,241,"#31536c",'rx="14" stroke="'+gold+'" stroke-width="4"')+
     rect(190,209,261,75,"#9e7657",'opacity=".7" rx="7"')+
     path("M320 346 Q"+R(292-10*t)+" "+R(321-76*t)+" 320 "+R(253-42*t)+" Q"+R(348+10*t)+" "+R(321-76*t)+" 320 346 Z",gold,3,coral)+
     text(231,44,"SYRUP / FLOW",14);
   break;
 case "light":
   s=rect(247,109,149,203,"#396380",'rx="17" stroke="'+gold+'" stroke-width="4"')+
     rect(279,65,86,43,"#ba8666",'rx="7"')+
     rect(264,185,115,66,"#e7cca1",'rx="5"')+
     A(7,i=>ln(72,59+38*i,216,53+31*i,gold,2,'opacity="'+R(.08+.84*t)+'"'))+
     circle(90,83,35,gold,'opacity="'+R(.07+.73*t)+'"')+text(282,226,"Rx",26,deep);
   break;
 case "citations":
   n=1+Math.round(4*t);
   s=A(5,i=>{let xx=80+i*118,yy=179+(i%2?40:-40);return(i>0&&i<n?ln(80+(i-1)*118,179+((i-1)%2?40:-40),xx,yy,gold,3):"")+
     circle(xx,yy,27,i<n?mint:deep,'stroke="'+blue+'" stroke-width="4"')+text(xx-6,yy+6,String(i+1),17,i<n?deep:ink);})+
     text(170,345,"CLAIM → SOURCE → CONTEXT",13);
   break;
 case "milestones":
   s=ln(105,191,548,191,dim,5)+A(3,i=>{let xx=[112,323,539][i], active=t*2>=i-.08;return circle(xx,191,17,active?gold:deep,'stroke="'+mint+'" stroke-width="3"')+
     text(xx-23,149,["2009","2015","2026"][i],17)+text(xx-31,242,["SCHOOL","SENSING","DELIVERY"][i],11,active?mint:dim);})+
     circle(112+427*t,191,7,coral);
   break;
 default:throw Error("Unknown scene "+id);
 }
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 380" role="img" focusable="false" aria-label="Conceptual, not measured: '+id+'">'+
 '<defs><pattern id="rx-grid" width="25" height="25" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#96bfdb" opacity=".14"/></pattern></defs>'+
 base+s+'</svg>';
}
root.RuwaidixAtlasDraw={draw};
})(typeof globalThis!=="undefined"?globalThis:window);