import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {join,resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {runInNewContext} from "node:vm";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const read=path=>readFileSync(join(root,path),"utf8");
const v2Modules=["assets/kinetic-atlas-v2-core.js","assets/kinetic-atlas-v2-chemistry.js","assets/kinetic-atlas-v2-carriers.js","assets/kinetic-atlas-v2-lung.js","assets/kinetic-atlas-v2-living.js","assets/kinetic-atlas-v2-measurement.js","assets/kinetic-atlas-v2-history.js"];

class Element {
  constructor(tag="div",doc=null){
    this.tag=tag;this.doc=doc;this.dataset={};this.children=[];
    this.events={};this.attrs={};this.className="";this.textContent="";
    this.value="37";this.firstElementChild=null;
    this.classList={
      add:val=>{this.className+=" "+val;},
      remove:val=>{this.className=this.className.replace(val,"");}
    };
  }
  set innerHTML(value){
    this.html=value;
    if(value.includes('id="rx-atlas-heading"')){
      for(const match of value.matchAll(/<([a-z]+)[^>]*\bid="([^"]+)"/g)){
        this.doc.nodes[match[2]]=new Element(match[1],this.doc);
      }
    }
    if(value.trimStart().startsWith("<svg")){
      this.firstElementChild=new Element("svg",this.doc);
    }
  }
  get innerHTML(){return this.html||"";}
  setAttribute(key,value){this.attrs[key]=value;}
  getAttribute(key){return this.attrs[key];}
  addEventListener(name,callback){(this.events[name]??=[]).push(callback);}
  fire(name,details={}){
    for(const callback of this.events[name]||[])
      callback({target:this,...details});
  }
  append(...nodes){this.children.push(...nodes);}
  appendChild(node){this.children.push(node);}
  prepend(node){this.children.unshift(node);}
  replaceChildren(...nodes){this.children=[...nodes];}
  contains(node){return node===this||this.children.includes(node);}
  querySelector(selector){
    if(selector.startsWith("#"))return this.doc?.nodes[selector.slice(1)]||null;
    if(selector==="svg")return this.firstElementChild;
    return this.top||null;
  }
  querySelectorAll(selector){
    if(selector==="button[data-id]")
      return this.children.filter(node=>node.tag==="button"&&node.dataset.id);
    return this.children.filter(node=>node.tag==="button");
  }
  insertAdjacentElement(){}
}
function atlasFixture(href,reduce=false){
  const document={
    documentElement:{dataset:{rxPage:"home"},lang:"en"},nodes:{},
    readyState:"complete",hidden:false,events:{},
    createElement(tag){return new Element(tag,this);},
    getElementById(id){return this.nodes[id]||null;},
    querySelector(selector){return selector==="#research-workbench"?this.nodes["research-workbench"]:null;},
    addEventListener(event,fn){(this.events[event]??=[]).push(fn);}
  };
  document.nodes["rx-kinetic-atlas"]=new Element("section",document);
  document.nodes["research-workbench"]=new Element("section",document);
  const location={href};let copied="";
  const window={
    location,matchMedia:()=>({matches:reduce,addEventListener(){}}),
    history:{state:null,replaceState(_state,_title,url){location.href=url;}},
    setInterval(){return 1;},clearInterval(){}
  };
  const navigator={clipboard:{writeText:async value=>{copied=value;}}};
  const context={document,window,navigator,URL};context.globalThis=context;
  for(const file of ["assets/kinetic-atlas-data-2026.js",...v2Modules,"assets/kinetic-atlas-ui-2026.js"]){
    runInNewContext(read(file),context,{filename:file});
  }
  return {document,window,getCopied:()=>copied,el:id=>document.nodes[id]};
}
test("the atlas mounts and an incoming share URL opens its exact scene",()=>{
  const a=atlasFixture("https://malruweidi.github.io/?atlas=focus#rx-kinetic-atlas");
  assert.equal(a.document.nodes["rx-kinetic-atlas"].dataset.rxAtlasReady,"true");
  assert.equal(a.el("rx-atlas-title").textContent,"A focal plane");
  assert.equal(a.el("rx-atlas-list").children.length,30);
  assert.match(a.el("rx-atlas-canvas").innerHTML,/^<svg /);
});
test("guided tour, next scene, range, copy link, empty search and language remain operable",async()=>{
  const a=atlasFixture("https://malruweidi.github.io/#rx-kinetic-atlas");
  a.el("rx-atlas-guided").fire("click");
  assert.equal(a.el("rx-atlas-title").textContent,"The changing probe");
  assert.match(a.window.location.href,/atlas=indicator/);
  a.el("rx-atlas-next").fire("click");
  assert.equal(a.el("rx-atlas-title").textContent,"Excitation and emission");
  a.el("rx-atlas-range").value="80";
  a.el("rx-atlas-range").fire("input");
  assert.match(a.el("rx-atlas-output").textContent,/80/);
  a.el("rx-atlas-copy-link").fire("click");
  await Promise.resolve();await Promise.resolve();
  assert.match(a.getCopied(),/atlas=fluorescence/);
  a.el("rx-atlas-search").value="not-a-real-scene";
  a.el("rx-atlas-search").fire("input");
  assert.equal(a.el("rx-atlas-list").children.length,1);
  assert.match(a.el("rx-atlas-list").children[0].textContent,/No matching/);
});
test("chapter navigation preserves the nine archival photographs rather than injecting kinetic overlays",()=>{
 const home=read("index.html");
 const archive=read("assets/archive-scenes.js");
 assert.doesNotMatch(home,/kinetic-chapter-cards-2026\\.(?:js|css)/);
 assert.match(archive,/className = "rx-cover-art"/);
 assert.match(archive,/a\\.querySelector\\("\\.rx26-card-top"\\)\\.after\\(frame\\)/);
 assert.equal(home.match(/class="rx26-portal-card"/g)?.length,9);
});
