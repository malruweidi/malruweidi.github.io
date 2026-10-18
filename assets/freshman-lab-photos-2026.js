/* Archive-owner identifications 13 Oct 2026. Photographs render only after verified media files exist. */
(()=>{
  "use strict";
  const photos=[
    {src:"/assets/archival-2026-10-13/early-chemistry-flask-2014.webp",title:"First-year chemistry laboratory",alt:"Mahmoud in a white laboratory coat holding up a flask containing a dark liquid in a university chemistry laboratory",caption:"Mahmoud in the chemistry laboratory, freshman year, circa 2014. Sample contents not documented."},
    {src:"/assets/archival-2026-10-13/freshman-chemistry-testtube-2014.webp",title:"At the chemistry bench",alt:"Black-and-white laboratory photograph of Mahmoud in a white laboratory coat holding a glass test tube",caption:"Mahmoud with a test tube during his early undergraduate chemistry training, circa 2014. Early undergraduate chemistry laboratory."},
    {src:"/assets/archival-2026-10-13/abdelgalil-chemistry-lab-tablet.webp",title:"Abdelgalil in the laboratory",alt:"Abdelgalil Khalaf Ahmed seated at a chemistry laboratory bench wearing a white coat and gloves and holding a tablet",caption:"Abdelgalil Khalaf Ahmed in the chemistry laboratory. Date, sample and procedure not established."}
  ];
  function imageExists(src){return new Promise(resolve=>{const image=new Image();image.onload=()=>resolve(true);image.onerror=()=>resolve(false);image.src=src;});}
  function figure(photo){const f=document.createElement("figure");const a=document.createElement("a");a.href=photo.src;a.target="_blank";a.rel="noopener noreferrer";a.setAttribute("aria-label",photo.title+" (full image)");const img=document.createElement("img");img.src=photo.src;img.alt=photo.alt;img.loading="lazy";img.decoding="async";a.append(img);const cap=document.createElement("figcaption");cap.textContent=photo.caption;f.append(a,cap);return f;}
  function styles(){
    if(document.getElementById("rxFreshmanLabPhotoStyles"))return;
    const sheet=document.createElement("style");sheet.id="rxFreshmanLabPhotoStyles";
    sheet.textContent=".rx-freshman-archive{background:#ecf0e8;border-top:1px solid #c9d5cb;padding:72px 24px}.rx-freshman-archive-inner{max-width:1130px;margin:0 auto}.rx-freshman-archive h2{font:400 clamp(33px,4.5vw,52px)/1.13 Newsreader,Georgia,serif;color:#1d393c;margin:12px 0 14px}.rx-freshman-archive p{color:#4e6765;line-height:1.8;max-width:72ch}.rx-freshman-gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:18px;margin-top:28px}.rx-freshman-gallery figure{margin:0;padding:9px;background:#fffdf8;border:1px solid #c7d3ca}.rx-freshman-gallery img{width:100%;height:260px;object-fit:contain;background:#e1e8e2;display:block}.rx-freshman-gallery figcaption{font:13px/1.65 'DM Sans',Arial,sans-serif;color:#526a68;padding:12px 8px}.rx-freshman-stories{margin-top:26px!important}.rx-freshman-stories figure img{object-fit:contain}.rx-freshman-stories figcaption{font-size:13px;line-height:1.6}@media(max-width:620px){.rx-freshman-archive{padding:48px 18px}.rx-freshman-gallery{grid-template-columns:1fr 1fr;gap:12px}.rx-freshman-gallery img{height:190px}.rx-freshman-stories{grid-template-columns:repeat(2,minmax(0,1fr))!important}}@media(max-width:440px){.rx-freshman-gallery{grid-template-columns:1fr}.rx-freshman-gallery img{height:260px}}";
    document.head.append(sheet);
  }
  async function apply(){
    const page=document.documentElement.dataset.rxPage;
    if(!["stories","archive","chem-squad"].includes(page))return;
    const ready=await Promise.all(photos.map(p=>imageExists(p.src)));
    if(!ready.some(Boolean))return;
    styles();
    if(page==="stories"&&ready[0]&&ready[1]&&!document.getElementById("rxFreshmanChemistryStory")){
      const anchor=document.querySelector("#molecular-models .stories-media-duo");
      if(anchor){
        const group=document.createElement("div");group.id="rxFreshmanChemistryStory";group.className="stories-media-duo rx-freshman-stories";
        group.append(figure(photos[0]),figure(photos[1]));anchor.insertAdjacentElement("afterend",group);
      }
    }
    if(page==="archive"&&!document.getElementById("rxFreshmanChemistryArchive")){
      const anchor=document.querySelector(".photo-section");
      if(anchor){
        const section=document.createElement("section");section.id="rxFreshmanChemistryArchive";section.className="rx-freshman-archive";section.setAttribute("aria-labelledby","rxFreshmanChemistryTitle");
        const inner=document.createElement("div");inner.className="rx-freshman-archive-inner";
        const kicker=document.createElement("span");kicker.className="mini";kicker.textContent="FROM THE PERSONAL ARCHIVE / UNIVERSITY LABORATORIES";
        const title=document.createElement("h2");title.id="rxFreshmanChemistryTitle";title.textContent="The chemistry bench, before the research papers.";
        const intro=document.createElement("p");intro.textContent=document.documentElement.lang==='ar'?"صورتان لي في مختبر الكيمياء خلال السنة الجامعية الأولى، إلى جانب صورة مستقلة لعبدالجليل خلف أحمد في المختبر.":"Two photographs of me at the chemistry bench in my freshman year, alongside a separate laboratory portrait of Abdelgalil Khalaf Ahmed.";
        const group=document.createElement("div");group.className="rx-freshman-gallery";
        photos.forEach((p,i)=>{if(ready[i])group.append(figure(p));});
        inner.append(kicker,title,intro,group);section.append(inner);anchor.insertAdjacentElement("afterend",section);
      }
    }
    if(page==="chem-squad"&&ready[2]){
      const member=Array.from(document.querySelectorAll("#people .person")).find(el=>/Abdelgalil Khalaf/i.test(el.textContent));
      if(member&&!member.querySelector(".archive-photo")){
        const pic=document.createElement("img");pic.className="archive-photo";pic.src=photos[2].src;pic.alt=photos[2].alt;pic.loading="lazy";pic.decoding="async";
        const detail=member.querySelector(":scope > div");if(detail)detail.classList.add("archive-person-info");
        member.classList.add("archive-person");member.insertBefore(pic,member.firstChild);
        const citation=document.createElement("span");citation.className="sr-only";citation.textContent=photos[2].caption;member.append(citation);
      }
    }
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",apply,{once:true});else apply();
})();