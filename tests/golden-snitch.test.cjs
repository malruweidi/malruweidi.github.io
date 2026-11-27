const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=()=>fs.readFileSync(path.join(root,'assets/golden-snitch.js'),'utf8');
function harness({reduced=false,caught=false}={}){
 const nodes=new Map(),events={},mediaEvents={},store=new Map(caught?[['rx-snitch-caught','1']]:[]);
 const button={hidden:false,style:{},setAttribute(k,v){this[k]=v},addEventListener(k,v){events[k]=v}};
 const shadow={innerHTML:'',querySelector(){return button}};
 const host={style:{},attachShadow(){return shadow},remove(){nodes.delete(this.id)}};
 const document={readyState:'complete',documentElement:{lang:'en'},getElementById:id=>nodes.get(id),createElement:()=>host,body:{appendChild(n){nodes.set(n.id,n)}},addEventListener(){}};
 const media={matches:reduced,addEventListener(k,v){mediaEvents[k]=v}};
 const window={matchMedia:()=>media,sessionStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)},MutationObserver:class{observe(){}}};
 vm.runInNewContext(source(),{window,document});
 return {nodes,events,mediaEvents,media,store,button,shadow,document,window};
}
test('snitch mounts once and is catchable',()=>{const h=harness();assert.equal(h.nodes.size,1);assert.match(h.shadow.innerHTML,/rx-snitch-flight/);assert.equal(h.button['aria-label'],'Catch the Golden Snitch');vm.runInNewContext(source(),{window:h.window,document:h.document});assert.equal(h.nodes.size,1);h.events.click();assert.equal(h.nodes.size,0);assert.equal(h.store.get('rx-snitch-caught'),'1')});
test('reduced motion and previously caught state suppress the animation',()=>{assert.equal(harness({reduced:true}).nodes.size,0);assert.equal(harness({caught:true}).nodes.size,0)});
test('enabling reduced motion removes a running snitch',()=>{const h=harness();h.media.matches=true;h.mediaEvents.change();assert.equal(h.nodes.size,0)});
test('shared site script loads the isolated asset',()=>{assert.match(fs.readFileSync(path.join(root,'assets/i18n.js'),'utf8'),/\/assets\/golden-snitch\.js/)});
