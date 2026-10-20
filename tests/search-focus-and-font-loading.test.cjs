'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

function setupSearch(){
  const elements=new Map();
  let document;
  class Element {
    constructor(tag='div'){
      this.tagName=tag.toUpperCase();
      this.children=[];this.dataset={};this.attributes={};this.listeners={};
      this.hidden=false;this.value='';this.textContent='';this.className='';
      this.isContentEditable=false;
    }
    append(...nodes){for(const node of nodes){if(node.tagName==='#FRAGMENT')this.children.push(...node.children);else this.children.push(node)}}
    replaceChildren(...nodes){this.children=[];this.append(...nodes)}
    setAttribute(name,value){this.attributes[name]=String(value)}
    getAttribute(name){return this.attributes[name]??null}
    addEventListener(type,callback){(this.listeners[type]??=[]).push(callback)}
    click(){this.focus();for(const listener of this.listeners.click||[])listener({target:this})}
    focus(){document.activeElement=this}
    select(){}
    matches(){return false}
  }
  const ids=['rx-search-input','rx-search-results','rx-search-count','rx-search-filters',
    'rx-search-empty','rx-search-fallback','rx-search-reset','rx-search-more','rx-search-language'];
  for(const id of ids)elements.set(id,new Element(id==='rx-search-input'?'input':'div'));
  document={
    documentElement:{lang:'en',dir:'ltr'},
    activeElement:null,
    getElementById:id=>elements.get(id)||null,
    querySelectorAll:()=>[],
    createElement:tag=>new Element(tag),
    createDocumentFragment:()=>new Element('#fragment'),
    createTextNode:value=>Object.assign(new Element('#text'),{textContent:String(value)}),
    addEventListener:()=>{}
  };
  const items=Array.from({length:20},(_,i)=>({
    id:i+1,title:'Entry '+(i+1),summary:'Public scholarly research entry',
    category:i%2===0?'Research':'Recommended reading',url:'/research.html',
    keywords:'research أفلام'
  }));
  const context={
    document,
    window:{RuwaidixDiscovery:{search:(entries,_query,category)=>entries
      .filter(e=>category==='All'||category===e.category).map(entry=>({entry,score:1}))}},
    location:{href:'https://malruweidi.github.io/search.html',search:''},
    history:{replaceState(){}},
    localStorage:{getItem(){return null},setItem(){}},
    fetch:async()=>({ok:true,json:async()=>({items})}),
    HTMLElement:Element,
    URL,URLSearchParams,
  };
  vm.runInNewContext(read('assets/discovery-search.js'),context,{filename:'assets/discovery-search.js'});
  return {elements,document};
}
async function ready(){
  const ui=setupSearch();
  await new Promise(resolve=>setImmediate(resolve));
  return ui;
}
test('category filtering retains the actual focused button node for keyboard navigation',async()=>{
  const {elements,document}=await ready();
  const filters=elements.get('rx-search-filters');
  assert.ok(filters.children.length>=3,'Initial categories rendered');
  const research=filters.children.find(e=>e.textContent==='Research');
  assert.ok(research,'Research category exists');
  research.click();
  assert.ok(filters.children.includes(research),'Focused category must not be removed and replaced');
  assert.equal(document.activeElement,research,'Keyboard focus stays with the selected filter');
  assert.equal(research.getAttribute('aria-pressed'),'true','Selected state is announced');
});
test('Arabic search includes the published reading-and-viewing category',async()=>{
  const {elements}=await ready();
  const lang=elements.get('rx-search-language');
  lang.click();
  const filters=elements.get('rx-search-filters');
  const category=filters.children.find(e=>e.textContent==='ترشيحات للقراءة والمشاهدة');
  assert.ok(category,'Existing category requires Arabic UI text');
});
test('homepage discovers its preconnected fonts directly, not through a CSS import',()=>{
  const home=read('index.html');
  assert.doesNotMatch(home,/<style>\s*@import\s+url\(['"]https:\/\/fonts\.googleapis\.com/i);
  assert.match(home,/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com\/css2\?/);
  assert.match(home,/<link rel="preconnect" href="https:\/\/cdn\.creativeclaw\.co" crossorigin>/);
  assert.match(home,/<img src="https:\/\/cdn\.creativeclaw\.co\/[^"]+"[^>]+fetchpriority="high"/);
});
