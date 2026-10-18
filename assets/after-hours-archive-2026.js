/* Ruwaidix | 16 October 2026 archive intake.
   Owner-supplied photographs and short films. No synthetic reconstruction.
   Non-destructive: mounts only on archival/people/methods pages.
   Dates in social-story overlays are not treated as verified recording dates. */
(() => {
  'use strict';
  const allowed = ['archive','stories','chem-squad','techniques'];
  const root = document.documentElement;
  const page = root.dataset.rxPage || (location.pathname.split('/').pop() || '').replace('.html','');
  if (!allowed.includes(page)) return;
  const base = '/assets/owner-archive-2026-10-16-hours/';
  const caption = (en, ar) => ({en, ar});
  const records = [
    {id:'waters',kind:'photo',file:'waters-acquity-instrument.webp',original:'original-D0B13525-4966-4EC3-A97C-15B5BA48FB39.jpeg',label:caption('Waters ACQUITY / sample manager','Waters ACQUITY / وحدة إدارة العينات'),alt:'Waters ACQUITY UPLC laboratory instrument with the lower front assembly exposed. No chromatographic results are visible.'},
    {id:'friends',kind:'photo',file:'friends-group-al-rub.webp',original:'original-87B786B1-727B-4899-97D8-F7B42C1EBB9D.jpeg',label:caption('الربع · The group','الربع'),alt:'Large informal indoor photograph of friends standing and sitting together, with the original Arabic story caption “الربع”.'},
    {id:'table',kind:'photo',file:'table-room-laptops.webp',original:'original-36D6C62B-0CD8-44E8-8935-FF9A512ADF72.jpeg',label:caption('Around the table','حول الطاولة'),alt:'Black-and-white photograph of several people around a table with open laptops, telephones and notebooks.'},
    {id:'0411',kind:'photo',file:'exterior-at-0411.webp',original:'original-D79519FF-149C-46D9-89F0-CBEF25B65FCE.jpeg',label:caption('04:11','٠٤:١١'),alt:'Dark exterior photograph showing a building, trees and a 04:11 clock overlay.'},
    {id:'cold',kind:'video',file:'cold-vapour-laboratory.mp4',poster:'cold-vapour-laboratory-poster.webp',label:caption('Cold vapour / laboratory','بخار بارد / المختبر'),alt:'Brief footage showing a white vapour plume around a laboratory vessel and cryogenic-looking apparatus.'},
    {id:'board',kind:'video',file:'midnight-organic-board.mp4',poster:'midnight-organic-board-poster.webp',label:caption('Organic chemistry / chalkboard','الكيمياء العضوية / السبورة'),alt:'Short phone video of people speaking and gesturing beside a classroom chalkboard; the overlay reads Midnight organic thoughts.'},
    {id:'0321',kind:'video',file:'room-0321.mp4',poster:'room-0321-poster.webp',label:caption('03:21 / in the room','٠٣:٢١ / في الغرفة'),alt:'Informal short room video showing several people; the recording itself has a 03:21 time overlay.'},
    {id:'conversation',kind:'video',file:'informal-conversation.mp4',poster:'informal-conversation-poster.webp',label:caption('A conversation','حديث'),alt:'Informal indoor phone video of a person in a striped shirt speaking with others nearby.'},
    {id:'football',kind:'video',file:'football-jersey-moment.mp4',poster:'football-jersey-moment-poster.webp',label:caption('A football-shirt moment','لقطة بقميص كرة القدم'),alt:'Brief informal video of a person in an AC Milan football shirt, with an object held up near him like a microphone.'},
    {id:'screen',kind:'video',file:'desk-screen-break.mp4',poster:'desk-screen-break-poster.webp',label:caption('A break at the screen','استراحة أمام الشاشة'),alt:'Short phone video of a person at a desk watching a humorous video on a desktop screen.'}
  ];
  const map = Object.fromEntries(records.map(x => [x.id, x]));
  const sets = {
    archive: ['waters','friends','table','0411','cold','board','0321','conversation','football','screen'],
    stories: ['0411','table','board'],
    'chem-squad': ['friends','table','0321','board','conversation'],
    techniques: ['waters','cold']
  };
  const headings = {
    archive: [caption('FROM THE PERSONAL ARCHIVE','من الأرشيف الشخصي'),caption('Not in the papers','ما لا يظهر في الأبحاث'),caption('Four photographs and six brief recordings. The visible clock overlays are kept as photographed.','أربع صور وستة مقاطع قصيرة. تظل الأوقات الظاهرة ضمن اللقطات كما وردت في الأصل.')],
    stories: [caption('IN BETWEEN CHAPTERS','بين الفصول'),caption('04:11','٠٤:١١'),caption('','')],
    'chem-squad': [caption('THE PEOPLE AROUND THE CHEMISTRY','الناس حول الكيمياء'),caption('Outside the experiments','خارج التجارب'),caption('','')],
    techniques: [caption('INSTRUMENT ARCHIVE','أرشيف الأجهزة'),caption('The apparatus','الأجهزة'),caption('','')]
  };
  function trans(el,obj){
    el.dataset.rxHoursEn=obj.en;
    el.dataset.rxHoursAr=obj.ar;
    el.textContent=root.lang==='ar'?obj.ar:obj.en;
    return el;
  }
  function el(tag,cls){const node=document.createElement(tag);if(cls)node.className=cls;return node;}
  function figure(item){
    const fig=el('figure','rxHours-card '+(item.kind==='video'?'rxHours-film':'rxHours-still'));
    const frame=el('div','rxHours-frame');
    if(item.kind==='photo'){
      const link=el('a','rxHours-zoom');link.href=base+item.original;link.target='_blank';link.rel='noopener noreferrer';
      link.setAttribute('aria-label','Open the original photograph: '+item.label.en);
      const img=el('img');img.src=base+item.file;img.alt=item.alt;img.loading='lazy';img.decoding='async';img.width=650;img.height=870;
      link.append(img);frame.append(link);
    }else{
      const video=el('video');video.src=base+item.file;video.poster=base+item.poster;
      video.preload='none';video.controls=true;video.playsInline=true;
      video.setAttribute('aria-label',item.alt);video.setAttribute('controlsList','noremoteplayback');
      frame.append(video);
    }
    const cap=el('figcaption','rxHours-caption');
    const label=el('span','rxHours-label');trans(label,item.label);
    cap.append(label);
    fig.append(frame,cap);
    return fig;
  }
  function mount(){
    if(document.getElementById('rx-hours-'+page))return;
    const main=document.querySelector('main');if(!main)return;
    const sec=el('section','rxHours-section rxHours-'+page);sec.id='rx-hours-'+page;
    sec.setAttribute('aria-labelledby','rx-hours-title-'+page);
    const wrap=el('div','rxHours-wrap');const header=el('div','rxHours-head');
    const eyebrow=el('p','rxHours-eyebrow');trans(eyebrow,headings[page][0]);
    const title=el('h2','rxHours-title');title.id='rx-hours-title-'+page;trans(title,headings[page][1]);
    header.append(eyebrow,title);
    if(headings[page][2].en){const dek=el('p','rxHours-dek');trans(dek,headings[page][2]);header.append(dek);}
    const grid=el('div','rxHours-grid');for(const id of sets[page])grid.append(figure(map[id]));
    wrap.append(header,grid);
    if(page!=='archive'){
      const more=el('a','rxHours-more');more.href='/archive.html#rx-hours-archive';
      trans(more,caption('Explore the complete contact sheet ↗','شاهد جميع اللقطات ↗'));wrap.append(more);
    }else{
      /* Recording provenance is kept in assets/after-hours-provenance-2026-10-16.json. */
    }
    sec.append(wrap);
    if(page==='stories'){
      const before=main.querySelector('.stories-afterword');if(before)main.insertBefore(sec,before);else main.append(sec);
    }else if(page==='chem-squad'){
      const before=main.querySelector('section.section.note');if(before)main.insertBefore(sec,before);else main.append(sec);
    }else main.append(sec);
    const update=()=>{sec.querySelectorAll('[data-rx-hours-en]').forEach(x=>{x.textContent=root.lang==='ar'?x.dataset.rxHoursAr:x.dataset.rxHoursEn;});};
    const mo=new MutationObserver(update);mo.observe(root,{attributes:true,attributeFilter:['lang']});update();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
