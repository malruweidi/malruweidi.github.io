/* Ruwaidix Kinetic Atlas V2 — visual foundation, 2026.
 * A self-contained vector instrument renderer: no network, canvas, telemetry,
 * or experimental values. Individual scene modules register their artwork.
 */
(function(root){
"use strict";
const scenes=Object.create(null);
const sceneIds=[
 "indicator","fluorescence","imine","tlc","peaks",
 "bilayer","size","charge","cargo","nebulizer",
 "airways","alveolus","surfactant","barrier","meniscus",
 "zebrafish","blood","heartbeat","cilia","frames",
 "focus","iris","roi","tracking","calibration",
 "manuscript","syrup","light","citations","milestones"
];
const colors=[
 ["#f0c78b","#f2a89a"],["#a4dfd8","#80bccf"],["#eeb2ad","#e5b2a3"],
 ["#a3d8c1","#89c5db"],["#b4d2e7","#eac69b"],["#e8caa0","#ccafaa"]
];
const groupNames=["CHEMICAL SCIENCE","THERAPEUTIC CARRIERS","LUNG & INTERFACES","LIVING SYSTEMS","OPTICAL METHODS","MATERIAL HISTORY"];
const arabicGroups=["الكيمياء","النواقل العلاجية","الرئة والأسطح الفاصلة","الأنظمة الحية","وسائل الرصد","تاريخ المواد"];
const N=x=>Number.isFinite(Number(x))?Math.round(Number(x)*10)/10:0;
const C=x=>Math.max(0,Math.min(1,Number(x)||0));
const each=(n,fn)=>Array.from({length:n},(_,i)=>fn(i)).join("");
const escape=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
const attrs=obj=>Object.entries(obj||{}).filter(([k,v])=>v!==undefined&&v!==null).map(([k,v])=>k+'="'+escape(v)+'"').join(" ");
const tag=(name,obj,body)=>'<'+name+' '+attrs(obj)+(body===undefined?"/>":">"+body+"</"+name+">");
const circ=(x,y,r,fill,more)=>tag("circle",{cx:N(x),cy:N(y),r:N(r),fill,...more});
const ell=(x,y,rx,ry,fill,more)=>tag("ellipse",{cx:N(x),cy:N(y),rx:N(rx),ry:N(ry),fill,...more});
const rect=(x,y,w,h,r,fill,more)=>tag("rect",{x:N(x),y:N(y),width:N(w),height:N(h),rx:r,fill,...more});
const line=(x,y,X,Y,color,w=2,more)=>tag("line",{x1:N(x),y1:N(y),x2:N(X),y2:N(Y),stroke:color,"stroke-width":w,...more});
const path=(d,fill="none",stroke="none",w=1,more)=>tag("path",{d,fill,stroke,"stroke-width":w,...more});
const text=(x,y,val,size=12,color="#f7eedd",more)=>tag("text",{x:N(x),y:N(y),fill:color,"font-family":'Inter, "DM Sans", system-ui, Arial, sans-serif',"font-size":size,...more},escape(val));
const g=(body,more)=>tag("g",more||{},body);
const points=(coords,fill,more)=>tag("polygon",{points:coords,fill,...more});
const xy=(x,y,body)=>g(body,{transform:"translate("+N(x)+" "+N(y)+")"});
const series=(fn,n=64,x1=60,x2=580)=>each(n+1,i=>(i?" L":"M")+N(x1+(x2-x1)*i/n)+","+N(fn(i/n)));
function register(id,fn){
 if(!sceneIds.includes(id))throw Error("Unknown Kinetic Atlas subject: "+id);
 if(typeof fn!=="function")throw Error("Scene must be a function: "+id);
 scenes[id]=fn;
}
function draw(id,position,opts){
 if(!scenes[id])throw Error("Kinetic Atlas scene is not registered: "+id);
 const t=C(position);
 const options=opts&&typeof opts==="object"?opts:{};
 const ns=String(options.namespace||"atlas-main").replace(/[^a-zA-Z0-9_-]/g,"").slice(0,55)||"atlas-main";
 const key="rxv2-"+ns+"-"+id+"-";
 const idOf=name=>key+name;
 const ref=name=>"url(#"+idOf(name)+")";
 const index=sceneIds.indexOf(id);
 const groupIndex=Math.floor(index/5);
 const [accent,sub]=colors[groupIndex];
 const ar=options.locale==="ar";
 const meta=root.RuwaidixAtlasData?.items?.find(e=>e[0]===id);
 const title=meta?(ar?meta[3]:meta[2]):id;
 const r=N;
 const definition=[];
 const addDef=value=>definition.push(value);
 const ctx={
  t,ar,r,accent,sub,index,ref,id:idOf,addDef,each,g,circ,ell,rect,line,path,text,points,xy,series,C
 };
 const illustration=scenes[id](ctx);
 const gradients=[
  tag("linearGradient",{id:idOf("bg"),x1:"0%",y1:"0%",x2:"100%",y2:"100%"},
    '<stop offset="0%" stop-color="#10273b"/><stop offset="52%" stop-color="#142f45"/><stop offset="100%" stop-color="#0b1d30"/>'),
  tag("radialGradient",{id:idOf("ambient"),cx:"78%",cy:"14%",r:"87%"},
    '<stop offset="0%" stop-color="'+accent+'" stop-opacity=".22"/><stop offset="44%" stop-color="'+sub+'" stop-opacity=".06"/><stop offset="100%" stop-color="#142e42" stop-opacity="0"/>'),
  tag("linearGradient",{id:idOf("glass"),x1:"0%",y1:"0%",x2:"100%",y2:"0%"},
    '<stop offset="0%" stop-color="#ffffff" stop-opacity=".44"/><stop offset="10%" stop-color="#d9f2f6" stop-opacity=".08"/><stop offset="68%" stop-color="#a0d3e7" stop-opacity=".04"/><stop offset="91%" stop-color="#ffffff" stop-opacity=".24"/><stop offset="100%" stop-color="#f6ffff" stop-opacity=".48"/>'),
  tag("linearGradient",{id:idOf("fluid"),x1:"0%",y1:"0%",x2:"0%",y2:"100%"},
    '<stop offset="0%" stop-color="'+accent+'"/><stop offset="70%" stop-color="'+sub+'"/><stop offset="100%" stop-color="#735f65"/>'),
  tag("linearGradient",{id:idOf("metal"),x1:"0%",y1:"0%",x2:"100%",y2:"100%"},
    '<stop offset="0%" stop-color="#e4e8df"/><stop offset="25%" stop-color="#7895a5"/><stop offset="61%" stop-color="#d8e4de"/><stop offset="100%" stop-color="#567284"/>'),
  tag("radialGradient",{id:idOf("orb"),cx:"28%",cy:"23%",r:"85%"},
    '<stop offset="0%" stop-color="#fff9e7"/><stop offset="22%" stop-color="'+accent+'"/><stop offset="67%" stop-color="'+sub+'"/><stop offset="100%" stop-color="#34556b"/>'),
  tag("radialGradient",{id:idOf("vesicle"),cx:"30%",cy:"23%",r:"84%"},
    '<stop offset="0%" stop-color="#def6e5"/><stop offset="23%" stop-color="'+sub+'"/><stop offset="78%" stop-color="#41798c"/><stop offset="100%" stop-color="#173e58"/>'),
  tag("linearGradient",{id:idOf("vellum"),x1:"0%",y1:"0%",x2:"100%",y2:"100%"},
    '<stop offset="0%" stop-color="#fff4e1"/><stop offset="55%" stop-color="#e5cda6"/><stop offset="100%" stop-color="#ac8f6a"/>'),
  tag("linearGradient",{id:idOf("tissue"),x1:"0%",y1:"0%",x2:"100%",y2:"100%"},
    '<stop offset="0%" stop-color="#fac6b1"/><stop offset="100%" stop-color="#a76877"/>'),
  tag("filter",{id:idOf("shadow"),x:"-50%",y:"-70%",width:"200%",height:"240%"},
    '<feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#000a14" flood-opacity=".47"/>'),
  tag("filter",{id:idOf("soft"),x:"-55%",y:"-55%",width:"210%",height:"210%"},
    '<feGaussianBlur stdDeviation="5"/>')
 ];
 const backdrop=rect(0,0,640,380,0,ref("bg"))+
  rect(0,0,640,380,0,ref("ambient"))+
  path("M-35 288 Q134 281 317 399 L0 399Z",accent,"none",1,{opacity:".038"})+
  path("M440 -20 Q570 110 684 82 L684 0Z",sub,"none",1,{opacity:".05"})+
  rect(14,13,612,353,17,"none",{stroke:"#e7e2d1","stroke-opacity":".34","stroke-width":".9"})+
  line(45,61,73,61,accent,2.4)+
  text(ar?585:86,65,ar?arabicGroups[groupIndex]:groupNames[groupIndex],11,"#e9dbc8",
    ar?{"text-anchor":"end"}:{"letter-spacing":"2"})+
  text(ar?582:45,91,title,ar?15:15,"#fff1e1",ar?{"text-anchor":"end","font-weight":"600"}:{"font-weight":"600"})+
  text(583,66,String(index+1).padStart(2,"0")+" / 30",10,"#d5d1c8",{"letter-spacing":"1.2","text-anchor":"end"})+
  line(43,326,598,326,"#ddcbab",1,{opacity:".25"})+
  text(45,348,"RUWAIDIX",10,"#ebdfce",{"letter-spacing":"2"})+
  text(148,348,"/  KINETIC ATLAS",9,"#c9c1b4",{"letter-spacing":"1.3"})+
  text(589,348,ar?"تصوّر علمي":"CONCEPT / INTERACTIVE",9,accent,ar?{"text-anchor":"end"}:{"letter-spacing":"1","text-anchor":"end"});
 return tag("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 640 380",role:"img",focusable:"false",
  "aria-label":(ar?"رسم توضيحي: ":"Conceptual illustration: ")+title},
  tag("defs",{},gradients.join("")+definition.join(""))+backdrop+illustration);
}
root.RuwaidixAtlasV2={register,draw,sceneIds};
root.RuwaidixAtlasDraw={draw,sceneIds,version:"2.0"};
})(typeof globalThis!=="undefined"?globalThis:window);