"use strict";
// Source-only research page release check. No dependencies, network, or user data.
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const pages=["molecular-therapeutics.html","doctoral-concepts.html","research-horizon.html","cv.html"];
const failures=[];
const read=(p)=>fs.readFileSync(path.join(root,p),"utf8");
const assert=(ok,label)=>{if(!ok)failures.push(label);};
const ids=(s)=>[...s.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);

for(const p of pages){
 let s;
 try{s=read(p);}catch(err){failures.push("Missing HTML page "+p);continue;}
 const headings=[...s.matchAll(/<h1\b/gi)];
 assert(headings.length===1,p+": expected one H1");
 assert(/<html\b[^>]*lang="en"/i.test(s),p+": document language missing");
 assert(/<\/html>\s*$/i.test(s),p+": incomplete HTML");
 const allIds=ids(s);
 const uniqueIds=new Set(allIds);
 assert(allIds.length===uniqueIds.size,p+": duplicate element IDs");
 for(const match of s.matchAll(/\bhref="([^"]+)"/g)){
  const ref=match[1];
  if(/^(?:https?:|mailto:|tel:|data:|\/\/)/i.test(ref))continue;
  if(/^javascript:/i.test(ref)){failures.push(p+": javascript href");continue;}
  const fragment=ref.indexOf("#")>=0?ref.slice(ref.indexOf("#")+1).split("?")[0]:"";
  let loc=ref.split(/[?#]/)[0];
  if(!loc)loc=p;
  else if(loc==="/")loc="index.html";
  else loc=loc.startsWith("/")?loc.slice(1):path.posix.normalize(path.posix.join(path.posix.dirname(p),loc));
  const target=path.resolve(root,loc);
  if(!target.startsWith(root+path.sep)){failures.push(p+": link escapes repository "+ref);continue;}
  if(!fs.existsSync(target)){failures.push(p+": missing local link "+ref);continue;}
  if(fragment&&/\.html?$/i.test(loc)){
   const dest=read(loc);
   const fragmentId=decodeURIComponent(fragment);
   if(!ids(dest).includes(fragmentId))failures.push(p+": missing anchor "+ref);
  }
 }
}

const profile=read("molecular-therapeutics.html");
const old=read("for-supervisors.html");
assert((profile.match(/class="core-card"/g)||[]).length===3,"Expected three main scientific research questions");
assert((profile.match(/class="evidence-card"/g)||[]).length===3,"Selected experimental evidence cards missing");
assert(profile.includes('id="selected-experiments"'),"Selected evidence section missing");
for(const term of ["54.7 ± 3.94%","15.1 ± 3.43%","74%","184%","H. C. Yalcin","firsthand account"])assert(profile.includes(term),"Study result or attribution missing "+term);
assert(profile.includes('<details class="research-deepdive evidence-archive">'),"Extended contribution record missing");
assert(profile.includes('<details class="research-deepdive research-future-details">'),"Long renal research agenda missing");
assert((profile.match(/<details\b/g)||[]).length===(profile.match(/<\/details>/g)||[]).length,"Unbalanced details elements");

assert((profile.match(/class="route-card"/g)||[]).length===6,"Existing six-field archive has been truncated");
assert(profile.includes('<details class="research-archive">'),"Background research archive lost");
assert((profile.match(/class="research-deepdive"/g)||[]).length===3,"Three deeper reading groups missing");
assert(profile.includes('class="skip-link"')&&profile.includes(".skip-link:focus"),"Keyboard skip link not protected");
assert(old.includes('location.replace("/molecular-therapeutics.html"'),"Legacy route no longer redirects");
assert(!profile.includes("For Prospective Research Supervisors"),"Unwanted supervisor-facing headline remains");
for(const name of ["Katie B. Ryan","Rasha A. Alshaikh","Jing Yong Ye","Moustafa T. Gabr","Ted Lakowski"]){
 assert(profile.includes(name),"Scientific reading entry missing "+name);
}
for(const term of ["10.1016/j.ejps.2025.107386","10.1016/j.apsb.2025.07.004","10.1117/12.2609898"]){
 assert(profile.includes(term),"Primary study reference missing "+term);
}
for(const x of failures)console.error("FAIL "+x);
if(failures.length){console.error(failures.length+" research page QA checks failed");process.exitCode=1;}
else console.log("PASS core research pages, internal links, archives, accessibility and scientific references");
