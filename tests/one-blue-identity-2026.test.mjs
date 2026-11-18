import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync,readdirSync} from "node:fs";
import {resolve,join,dirname} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>readFileSync(join(root,p),"utf8");
const link='<link rel="stylesheet" href="/assets/ruwaidix-one-blue-2026.css?v=20261118-blue1">';
const homeLink='<link rel="stylesheet" href="/assets/ruwaidix-one-blue-2026.css?v=20261118-blue2">';
const omitted=new Set(["home-legacy-2026.html","living-desk-preview.html","cinema-quality-preview.html","cinema-research-preview.html","preview-rx23.html"]);
function htmlFiles(dir=""){
  return readdirSync(join(root,dir),{withFileTypes:true}).flatMap(e=>{
    const name=dir?dir+"/"+e.name:e.name;
    if(e.isDirectory()){return ([".github","node_modules"].includes(e.name)||name.startsWith("assets/")&&name!=="assets/films"&&!name.startsWith("assets/films/"))?[]:htmlFiles(name);}
    return e.isFile()&&name.endsWith(".html")&&!omitted.has(name)?[name]:[];
  });
}
const contrast=(a,b)=>{
  const l=h=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];};
  const x=l(a),y=l(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
};
test("all public HTML pages use the same versioned blue identity",()=>{
  const files=htmlFiles();
  assert.ok(files.length>=70,"expected main site, films, archived research, and long-form records");
  for(const file of files){const content=read(file);assert.equal(content.split(file==="index.html"?homeLink:link).length,2,"missing or duplicate blue stylesheet: "+file);}
  for(const file of omitted)assert.doesNotMatch(read(file),/ruwaidix-one-blue-2026/,"preservation backups and previews remain independent: "+file);
});
test("the blue palette is the explicit primary identity and passes AA contrast for text",()=>{
 const css=read("assets/ruwaidix-one-blue-2026.css");
 for(const color of ["#192d4b","#263f66","#345b8e","#eaf0f8","#d7e3f1","#fbfcfe"]){assert.ok(css.includes(color),color);}
 assert.ok(contrast("#345b8e","#fbfcfe")>=4.5);
 assert.ok(contrast("#4c6282","#eaf0f8")>=4.5);
 assert.ok(contrast("#fbfcfe","#263f66")>=4.5);
});
test("Egypt–Qatar–US map is entirely blue by CSS, preserving original SVG geometry",()=>{
 const css=read("assets/ruwaidix-one-blue-2026.css");
 for(const key of ["#geo-water stop:first-child","#geo-water stop:last-child",".geo-land",".geo-arc--us-egypt",".geo-arc--us-qatar",".geo-arc--egypt-qatar",".geo-ring",".geo-dot",".geo-map-footer",".geo-places"]){
   assert.ok(css.includes(key),"map color layer missing: "+key);
 }
 const old=read("home-legacy-2026.html"),now=read("index.html");
 assert.equal(now.replace(homeLink,"").replace('<link rel="stylesheet" href="/assets/atlas-of-questions-2026.css?v=20261118"><script src="/assets/atlas-of-questions-2026.js?v=20261118" defer></script>',""),old.split('<span class="rx26-card-arrow" aria-hidden="true">↗</span>').join(""),"geographical paths, text and video must not change, except removing decorative arrow spans");
});
