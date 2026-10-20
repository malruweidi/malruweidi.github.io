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
// Ruwaidix editorial architecture invariants: prevent loss of reader paths and release regressions.
const home=html.get("index.html")||"";
// The approved two-minute introduction screens first; research follows, with its record intact.
const checkpoints=['id="film"','class="rx-evidence-index"','id="rx26-portal"','id="research"','id="publications"','class="rh-home-entry"','class="rx-chapters"','id="story"'];
const positions=checkpoints.map(x=>home.indexOf(x));
if(positions.some((p,i)=>p<0||(i>0&&p<=positions[i-1])))error("index.html","research-first homepage sections are missing or out of order");
for(const [route,sourceFile] of [["/research.html","research.html"],["/publications.html","publications.html"]]){
 if(!known.has(sourceFile)||!home.includes('href="'+route+'"'))error("navigation","canonical hub missing from home "+route);
 const xml=fs.readFileSync(path.join(root,"sitemap.xml"),"utf8");
 if(!xml.includes("https://malruweidi.github.io"+route))error("sitemap.xml","new hub absent "+route);
}
if(!home.includes('class="rx-more"')||!home.includes('href="#research"'))error("index.html","secondary navigation no longer preserves in-page research route");
const academic=html.get("cv.html")||"";
if([...academic.matchAll(/<h2 class="label">/g)].length<8 || !academic.includes('<h2 class="label">Research direction</h2>'))error("cv.html","academic CV requires the research-direction heading and at least eight semantic section headings");
const bibliography=html.get("publications.html")||"";
if([...bibliography.matchAll(/class="pub-card"/g)].length<20)error("publications.html","curated bibliography unexpectedly lost entries");
const supervisor=html.get("molecular-therapeutics.html")||"";
const broadRoutes=["CHEMISTRY / MOLECULAR DESIGN","PHARMACEUTICS / DELIVERY","BIOMATERIALS / SOFT MATTER","CELLULAR BIOLOGY / PHARMACOLOGY","BIOENGINEERING / MEASUREMENT","COMPUTATION / QUANTITATIVE SCIENCE"];
for(const route of broadRoutes)if(!supervisor.includes(route))error("research directions","interdisciplinary evidence-based route missing "+route);
if((supervisor.match(/class="route-card"/g)||[]).length!==6)error("research directions","archival six-field methods record must be preserved");
const researchQuestions = supervisor.match(/<section class="section" id="research-entry-points"[\\s\\S]*?<\\/section>/)?.[0] || "";
if((researchQuestions.match(/class="core-card"/g)||[]).length!==3)error("research identity","expected three evidence-backed questions inside research-entry-points");
if((supervisor.match(/class="evidence-card"/g)||[]).length!==3)error("selected evidence","expected three experimental case studies");
for(const evidence of ["54.7 ± 3.94%","15.1 ± 3.43%","74%","184%","H. C. Yalcin","formal analysis","firsthand account"])if(!supervisor.includes(evidence))error("selected evidence","numerical finding or role attribution missing "+evidence);
for(const doi of ["10.1152/japplphysiol.00574.2020","10.3390/polym13213717","10.1016/j.micron.2020.102876"])if(!supervisor.includes(doi))error("selected evidence","primary publication missing "+doi);
if(!supervisor.includes('<details class="research-deepdive evidence-archive">'))error("selected evidence","longer contribution record is no longer available");
if(!supervisor.includes('<details class="research-deepdive research-future-details">'))error("research agenda","renal and related research materials must remain available in optional reading");

const profilePrimaryLinks=supervisor.match(/<div class="actionlinks">([\s\S]*?)<\/div>/)?.[1]||"";
if([...profilePrimaryLinks.matchAll(/<a\b/g)].length!==4)error("research profile","first screen should retain four focused primary reading paths");
for(const destination of ["#research-entry-points","#selected-experiments","#present-work","#research-programmes"])if(!profilePrimaryLinks.includes('href="'+destination+'"'))error("research profile","primary reading path missing "+destination);
if((supervisor.match(/class="research-deepdive"/g)||[]).length!==3)error("research profile","expected three expandable advanced-literature panels");
if(!supervisor.includes('<details class="research-archive">'))error("research profile","archival disciplinary grid no longer available by disclosure");
const profileIds=new Set([...supervisor.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]));
for(const match of supervisor.matchAll(/href="#([^"]+)"/g))if(!profileIds.has(match[1]))error("research profile","broken in-page anchor #"+match[1]);
for(const anchor of ["#chemical-biology","#rnadelivery"])if(!(html.get("doctoral-concepts.html")||"").includes('id="'+anchor.slice(1)+'"'))error("research profile","missing specific experimental proposal anchor "+anchor);

if(!supervisor.includes('<details class="research-archive">'))error("research identity","six-field background archive should be collapsible and preserved");
for(const heading of ["What can molecular structure control?","What changes between preparation and exposure?","How do we know what changed in living systems?"])if(!supervisor.includes(heading))error("research identity","missing scientific question "+heading);
if(!supervisor.includes("fundamental research")&&!supervisor.includes("fundamental chemistry"))error("research directions","fundamental research openness missing");
if(!supervisor.includes("not prerequisites for joining a laboratory"))error("research directions","pathway non-exclusivity note missing");
if(!supervisor.includes("no doctoral laboratory needs to work on all three"))error("research directions","focused doctoral fit must not require all three questions in one laboratory");
if((html.get("doctoral-concepts.html")||"").includes("One doctoral question, one main experimental system."))error("doctoral concepts","concept examples still framed as exclusive scope");
const legacyFaculty=html.get("for-supervisors.html")||"";
if(!legacyFaculty.includes("location.replace")||!legacyFaculty.includes("/molecular-therapeutics.html"))error("legacy redirect","old faculty link must redirect to molecular therapeutics without losing its original HTML source");
if(!supervisor.includes("clip:rect(0,0,0,0)")||!supervisor.includes(".skip-link:focus"))error("molecular-therapeutics.html","skip link must be visually hidden until keyboard focus");
for(const term of ["CD28–CD80/CD86","TREM2–TYROBP/DAP12–SYK","SMAD1/5/9","circular RNA","siRNA","Ted Lakowski","Moustafa T. Gabr","Katie B. Ryan","Rasha A. Alshaikh","Jing Yong Ye","S1PR3-directed RNA silencing"])if(!supervisor.includes(term))error("molecular-therapeutics.html","research focus missing "+term);
if(!supervisor.includes("From molecular design")||!supervisor.includes("PROTACs")||!supervisor.includes("Ted Lakowski")||!supervisor.includes("Moustafa T. Gabr")||!supervisor.includes("circular RNA")||!supervisor.includes("siRNA")||!supervisor.includes("click chemistry")||!supervisor.includes("microfluidic")||!supervisor.includes("aptamer"))error("molecular-therapeutics.html","research identity missing core future interests");
if(!(html.get("doctoral-concepts.html")||"").includes("Katie Ryan")||!(html.get("doctoral-concepts.html")||"").includes("Jing Yong Ye")||!(html.get("doctoral-concepts.html")||"").includes("Rasha Alshaikh"))error("doctoral-concepts.html","independent RNA hypothesis must distinguish aerosol, aptamer-biosensing and S1P literature from new work");
if(!home.includes('href="/molecular-therapeutics.html"')||!academic.includes('href="/molecular-therapeutics.html"'))error("research navigation","research-directions link missing from homepage or public academic profile");
if(!fs.readFileSync(path.join(root,"sitemap.xml"),"utf8").includes("https://malruweidi.github.io/molecular-therapeutics.html"))error("sitemap.xml","research-directions canonical route missing");
if(!([...bibliography.matchAll(/class="pub-contribution"/g)].length===20))error("publications.html","not every publication has a contribution note");
for(const id of ["work-13","work-14"]){
 const card=bibliography.match(new RegExp('<article class="pub-card"[^>]*id="'+id+'"'+'[\\s\\S]*?<\\/article>'));
 if(!card||!card[0].includes("Experimental")||!card[0].includes("did not perform the paper's data analysis")||!card[0].includes("did not write the manuscript"))error("publications.html","experimental-only/no-analysis/no-writing exception missing "+id);
}
for(const [id,terms] of Object.entries({
 "work-8":["Yalcin","original manuscript drafting"],
 "work-12":["high-speed camera","wrote","protocol"],
 "work-6":["machine-learning research workflow","model evaluation","manuscript writing"],
 "work-7":["grant-acquisition","analysing","interpreting"],
 "work-18":["conceptual interpretation","wrote relevant manuscript sections"],
 "work-17":["second author"]
})){
 const card=bibliography.match(new RegExp('<article class="pub-card"[^>]*id="'+id+'"'+'[\\s\\S]*?<\\/article>'));
 if(!card||terms.some(t=>!card[0].toLowerCase().includes(t.toLowerCase())))error("publications.html","contribution detail missing "+id);
}

const cinema=html.get("publication-cinema.html")||"";
if(!cinema.includes("const selectedEdition=verifiedResearchEdition ||")||!cinema.includes("releasedV6=new Map(")||!cinema.includes("verifiedFilmMasters[x.id]"))error("publication-cinema.html","source-verified editions must take precedence, then V6 release manifest, with intact originals");
try{
 const releases=JSON.parse(fs.readFileSync(path.join(root,"assets/films/series-v6/releases.json"),"utf8"));
 if(releases.schema!=="ruwaidix-film-releases-v1"||!Array.isArray(releases.films)||releases.count!==releases.films.length)error("film releases","V6 index schema or count mismatch");
 const seen=new Set();
 for(const film of releases.films||[]){
  if(!/^[a-z0-9-]+$/.test(film.id||"")||seen.has(film.id))error("film releases","invalid or repeated release id "+film.id);
  seen.add(film.id);
  if(!Number.isFinite(Number(film.duration_seconds))||Number(film.duration_seconds)<=0)error("film releases","invalid film duration "+film.id);
  for(const ext of ["mp4","vtt","json","webp"])requireFile("assets/films/series-v6/"+film.id+"."+ext);
 }
}catch(err){error("film releases","could not validate release manifest: "+err.message);}
// Faculty-facing technical dossier and cinema release safeguards.
for(const page of ["doctoral-concepts.html","research/high-speed-zebrafish-imaging.html","research/plasma-modified-pla.html"]){
 if(!known.has(page))error("research routes","missing published page "+page);
 if(!fs.readFileSync(path.join(root,"sitemap.xml"),"utf8").includes("https://malruweidi.github.io/"+page))error("sitemap.xml","new research route missing "+page);
}
for(const [file,marker] of [
 ["research/high-speed-zebrafish-imaging.html","high-speed camera/acquisition system"],
 ["research/plasma-modified-pla.html","formal CRediT"],
 ["research/pulmonary-epithelial-injury.html","CASE STUDY / WHAT THE EXPERIMENT ACTUALLY CONTROLLED"],
 ["doctoral-concepts.html","Working hypothesis."]
])if(!(html.get(file)||"").includes(marker))error(file,"source-led experimental/research content missing "+marker);
if((html.get("research/pulmonary-epithelial-injury.html")||"").includes("complete transcript"))error("research dossier","production-facing transcript promoted on public film link");
if(!(html.get("research.html")||"").includes("/research/high-speed-zebrafish-imaging.html")||!(html.get("research.html")||"").includes("/research/plasma-modified-pla.html"))error("research.html","dossier discovery links missing");
const polymer=bibliography.match(/<article class="pub-card"[^>]*id="work-9"[^]*?<\/article>/);
if(!polymer||!polymer[0].includes("CRediT")||!polymer[0].includes("investigation")&&!polymer[0].includes("Experimentation"))error("publications.html","formal and personal polymer credits not differentiated");
try{
 const v7=JSON.parse(fs.readFileSync(path.join(root,"assets/films/series-v7-pilots/releases.json"),"utf8"));
 if(v7.schema!=="ruwaidix-cinema-v7-registered-releases-v1"||v7.count!==v7.films.length)error("cinema","V7 release count/schema mismatch");
 const seen=new Set();
 for(const film of v7.films||[]){
  if(seen.has(film.id))error("cinema","V7 duplicate release "+film.id);
  seen.add(film.id);
  if(film.edition!=="series-v7-pilots"||film.distinct_chapters!==6||Number(film.duration_seconds)!==84)error("cinema","V7 inconsistent duration or scene register "+film.id);
  for(const key of ["video","captions","poster"]){const ref=film[key];if(!ref||!known.has((String(ref).startsWith("/")?String(ref).slice(1):String(ref))))error("cinema","V7 missing "+key+" for "+film.id);}
 }
}catch(err){error("cinema","V7 verification failed "+err.message);}
for(const id of ["pla-scaffolds","microfluidic-virus","making-medicines-keep","pla-grafting","flow-chamber-method"]){
 if(!cinema.includes('"'+id+'":{edition:"series-v8-primary"'))error("cinema","primary verified film not selected "+id);
 for(const ext of ["mp4","vtt","webp"])requireFile("assets/films/series-v8-primary/"+id+"."+ext);
 const vtt=fs.readFileSync(path.join(root,"assets/films/series-v8-primary/"+id+".vtt"),"utf8");
 if(!vtt.startsWith("WEBVTT")||/date not verified|production note|shot list|review checklist|manifests? for the editor/i.test(vtt))error("cinema","subtitle release contamination "+id);
}
const discovery=JSON.parse(fs.readFileSync(path.join(root,"assets/discovery-index.json"),"utf8"));
for(const route of ["/research.html","/publications.html","/doctoral-concepts.html","/research/high-speed-zebrafish-imaging.html","/research/plasma-modified-pla.html"])if(!(discovery.items||[]).some(x=>x.url===route))error("discovery","new hub missing from discovery index: "+route);
if(!(discovery.items||[]).some(x=>x.url==="/molecular-therapeutics.html"))error("discovery","faculty page absent from search index");
console.log("Audited "+htmls.length+" HTML pages, "+paths.filter(x=>x.endsWith(".js")).length+" scripts, "+linkCount+" links, "+assetCount+" static references.");
for(const w of [...new Set(warnings)])console.warn("WARN "+w);
for(const e of [...new Set(errors)])console.error("FAIL "+e);
if(errors.length)process.exitCode=1;else console.log("PASS static integrity and scientific provenance checks.");
