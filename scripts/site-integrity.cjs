"use strict";
// Ruwaidix static site integrity and research-provenance tests.
const fs=require("fs"),path=require("path"),cp=require("child_process");
const root=path.resolve(__dirname,".."),paths=[],errors=[],warnings=[];
function visit(p){for(const e of fs.readdirSync(p,{withFileTypes:true})){if([".git","node_modules"].includes(e.name))continue;const x=path.join(p,e.name);if(e.isDirectory())visit(x);else if(e.isFile())paths.push(path.relative(root,x).split(path.sep).join("/"));}}
visit(root);
const known=new Set(paths),htmls=paths.filter(x=>x.endsWith(".html")),html=new Map(htmls.map(p=>[p,fs.readFileSync(path.join(root,p),"utf8")]));
const error=(p,m)=>errors.push(p+": "+m);
function attr(t,key){return new RegExp("(?:^|\\s)"+key+"\\s*=\\s*([\"'])(.*?)\\1","i").exec(t)?.[2]??null;}
function resolve(f,u){
 if(!u||/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(u)||u.includes("$"+"{"))return null;
 const part=u.split(/[?#]/)[0];if(!part)return null;
 let p=part.startsWith("/")?part.slice(1):path.posix.join(path.posix.dirname(f),part);
 if(!p||p.endsWith("/"))p+="index.html";return path.posix.normalize(p);
}
let linkCount=0,assetCount=0;
for(const [file,original] of html){
 const s=original.replace(/(<script\b[^>]*>)[\s\S]*?(<\/script>)/gi,"$1$2").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<!--[\s\S]*?-->/g,"");
 const ids=new Set();
 for(const x of s.matchAll(/\bid\s*=\s*(["'])(.*?)\1/g)){if(ids.has(x[2]))error(file,"duplicate ID "+x[2]);ids.add(x[2]);}
 const h1=[...s.matchAll(/<h1\b/gi)].length;if(h1!==1)error(file,"expected one H1; found "+h1);
 if(!/<html\b[^>]*\blang\s*=/.test(s))error(file,"missing document language");
 for(const m of s.matchAll(/<(a|img|script|link|video|source|iframe)\b[^>]*>/gi)){
  const tag=m[0],type=m[1].toLowerCase();
  if(type==="img"&&attr(tag,"alt")===null)error(file,"image missing alt text");
  if(type==="a"&&attr(tag,"target")==="_blank"&&!/\bnoopener\b/.test(attr(tag,"rel")||""))error(file,"target _blank lacks noopener");
  for(const key of ["href","src","poster"]){const u=attr(tag,key),p=resolve(file,u);if(p===null)continue;
   if(!known.has(p))error(file,"missing local resource "+u+" -> "+p);
   else if(key==="href")linkCount++;else assetCount++;
  }
  if(type==="a"){const href=attr(tag,"href")||"";if(href.startsWith("#")&&href!=="#"&&!ids.has(href.slice(1)))warnings.push(file+": unresolved static anchor "+href);}
 }
}
function requireFile(p){if(!known.has(p))error("media","manifest references absent binary "+p);}
const source=JSON.parse(fs.readFileSync(path.join(root,"assets/archive-photo-manifest.json")));for(const x of source.photos||[])if(x.file)requireFile(x.file);
const intake=JSON.parse(fs.readFileSync(path.join(root,"assets/2017-website-photo-intake.json")));for(const x of intake.published||[])if(x.file)requireFile(x.file);
const m=JSON.parse(fs.readFileSync(path.join(root,"assets/research-media-manifest-2026.json")));
for(const x of m.photos||[])requireFile("assets/research-archive-2026/"+x.file);
if(m.video){requireFile("assets/research-archive-2026/"+m.video.file);requireFile("assets/research-archive-2026/"+m.video.poster);}
const stories=html.get("stories.html")||"";
function chapter(id){const a=stories.indexOf('id="'+id+'"');if(a<0){error("stories.html","missing "+id);return "";}const b=stories.indexOf("</section>",a);return stories.slice(a,b<0?stories.length:b+10);}
const v=chapter("living-systems"),r=chapter("ramadan-atvb"),c=chapter("research-apparatus");
if(/chick.embryo|chick-embryo|incubator/i.test(v+r))error("stories.html","chick embryo misattributed to zebrafish/ATVB");
if(!/zebrafish/.test(r)||!r.includes("pubmed.ncbi.nlm.nih.gov/30571172"))error("stories.html","ATVB paper or organism missing");
if(!c.includes("2017-chick-embryo-incubator.webp"))error("stories.html","chick photograph missing from separate apparatus story");
for(const f of paths.filter(x=>x.endsWith(".js"))){const p=cp.spawnSync(process.execPath,["--check",path.join(root,f)],{encoding:"utf8"});if(p.status!==0)error(f,"JavaScript parse error "+String(p.stderr).slice(0,100));}
const pending=JSON.parse(fs.readFileSync(path.join(root,"assets/archival-2019-2020-provenance.json")));const absent=(pending.assets||[]).filter(x=>!known.has(x.path));
if(absent.length)warnings.push(absent.length+" owner-identified 2019-2020 images still lack publishable binaries; cards hidden");
console.log("Audited "+htmls.length+" HTML pages, "+paths.filter(x=>x.endsWith(".js")).length+" scripts, "+linkCount+" links, "+assetCount+" static references.");
for(const w of [...new Set(warnings)])console.warn("WARN "+w);
for(const e of [...new Set(errors)])console.error("FAIL "+e);
if(errors.length)process.exitCode=1;else console.log("PASS static integrity and scientific provenance checks.");
