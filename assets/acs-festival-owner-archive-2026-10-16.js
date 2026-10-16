/* Documentary additions supplied 16 October 2026.
   Each photograph and the two archival screenshots has a distinct home.
   Missing media is suppressed rather than shown as a broken image; written
   evidence stays visible while image assets await repository publication. */
(()=>{'use strict';
  const ROOT='/assets/2026-10-16-festival-and-acs/';
  const ar=document.documentElement.lang.toLowerCase().startsWith('ar');
  const phrase=(en,arabic)=>ar?arabic:en;
  const CSS=`
  .rx26-document{margin:30px 0 24px;padding:22px 0;border-top:1px solid currentColor;border-bottom:1px solid currentColor;max-width:980px}
  .rx26-eyebrow{font:600 10px/1.6 system-ui,sans-serif;letter-spacing:.13em;text-transform:uppercase;opacity:.68}
  .rx26-document h3{font-family:Georgia,"Times New Roman",serif;font-size:clamp(22px,2.8vw,30px);font-weight:400;line-height:1.18;margin:12px 0}
  .rx26-document p{line-height:1.7;max-width:76ch}
  .rx26-figures{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr));gap:15px;margin:18px 0}
  .rx26-figures figure{border:1px solid color-mix(in srgb,currentColor 24%,transparent);background:color-mix(in srgb,currentColor 4%,transparent);padding:10px;margin:0;min-width:0}
  .rx26-figures a{display:block;overflow:hidden;min-width:0}
  .rx26-figures img{width:100%;height:auto;max-height:620px;object-fit:contain;display:block;background:color-mix(in srgb,currentColor 8%,transparent)}
  .rx26-figures figcaption{font:400 12px/1.55 system-ui,sans-serif;opacity:.78;padding:11px 2px 3px}
  .rx26-source{font:400 11px/1.6 system-ui,sans-serif;opacity:.75}
  .rx26-media-pending{display:flex;flex-direction:column;justify-content:center;align-items:center;gap:9px;min-height:190px;padding:22px 20px;border:1px dashed color-mix(in srgb,currentColor 38%,transparent);background:color-mix(in srgb,currentColor 3%,transparent);text-align:center;color:inherit}
  .rx26-media-pending strong{font:500 clamp(19px,2vw,24px)/1.22 Georgia,"Times New Roman",serif}
  .rx26-media-pending span{font:400 13px/1.65 system-ui,sans-serif;max-width:46ch}
  .rx26-document .rx26-link{display:inline-block;text-decoration:underline;text-underline-offset:3px;margin-top:8px}
  @media(max-width:660px){.rx26-document{padding:15px 0}.rx26-figures{grid-template-columns:1fr}}
  `;
  function el(tag,cls,content){const e=document.createElement(tag);if(cls)e.className=cls;if(content!==undefined)e.textContent=content;return e}
  function photo(file,alt,caption){
    const figure=el('figure');const a=el('a');
    a.href=ROOT+file;a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label',alt);
    const img=el('img');img.src=a.href;img.alt=alt;img.loading='lazy';img.decoding='async';
    // The source file has not yet been published: retain the archival slot,
    // accurate caption, and source pointer rather than deleting the record.
    figure.dataset.expectedAsset=ROOT+file;
    img.addEventListener('error',()=>{
      const pending=el('div','rx26-media-pending');
      pending.setAttribute('role','note');
      pending.append(
        el('strong',null,phrase('Original image pending','الصورة الأصلية قيد الإضافة')),
        el('span',null,phrase(
          'The original image file is not yet available on this website. Its caption and archival source are preserved below.',
          'ملف الصورة الأصلية غير متاح بعد على الموقع. حُفظ التعليق والمصدر الأرشيفي أدناه.'
        ))
      );
      a.replaceWith(pending);
    },{once:true});
    a.append(img);figure.append(a,el('figcaption',null,caption));return figure;
  }
  function shell(id,kicker,title,prose){const s=el('section','rx26-document');s.id=id;s.setAttribute('aria-label',title);
    s.append(el('div','rx26-eyebrow',kicker),el('h3',null,title),el('p',null,prose));return s}
  function festival(){const section=shell('rx26-festival-portrait',
    phrase('PERSONAL PHOTOGRAPH / CHEMISTRY FESTIVAL','صورة شخصية / مهرجان الكيمياء'),
    phrase('A photograph from the festival.','صورة من مهرجان الكيمياء.'),
    phrase('Three participants photographed together in front of the Qatar University Chemistry Festival backdrop. The printed photograph was supplied from my personal archive. The exact edition and capture date have not been independently established.','صورة تجمع ثلاثة مشاركين أمام خلفية مهرجان الكيمياء بجامعة قطر. الصورة الورقية من الأرشيف الشخصي، ولم يُتحقق بصورة مستقلة من دورة المهرجان أو تاريخ التقاطها.'));
    const media=el('div','rx26-figures');media.append(photo('qatar-university-chemistry-festival-colleagues.webp',
      phrase('Three people standing together in front of a Qatar University Chemistry Festival backdrop','ثلاثة أشخاص أمام خلفية مهرجان الكيمياء بجامعة قطر'),
      phrase('Chemistry Festival · original printed photograph photographed by the archive owner · date unverified','مهرجان الكيمياء · صورة ورقية من الأرشيف الشخصي · التاريخ غير موثق')));
    section.append(media,el('p','rx26-source',phrase('Source: owner-supplied photograph IMG_2068.jpeg, 16 October 2026. Individual identities are not inferred from the image.','المصدر: الصورة IMG_2068.jpeg المقدمة بتاريخ ١٦ أكتوبر ٢٠٢٦. لا تُستنتج هوية الأشخاص من الصورة.')));
    return section;
  }
  function acs(compact=false){const section=shell(compact?'rx26-acs-2019-history':'rx26-acs-2019-evidence',
    phrase('PRIMARY SOURCE / 22 MAY 2019','وثيقة أصلية / ٢٢ مايو ٢٠١٩'),
    phrase('A history-of-chemistry abstract accepted by ACS.','قبول ملخص في تاريخ الكيمياء لدى الجمعية الكيميائية الأمريكية.'),
    phrase('On 22 May 2019, the American Chemical Society confirmed acceptance of our abstract, “Role of early Arabs and Muslims in the foundation of chemistry science,” for the technical program of its Fall 2019 National Meeting & Exposition in San Diego (25–29 August). It was assigned to the Division of the History of Chemistry [HIST], in the Sci-Mix poster session, under control ID 3211078. The notice names Abdelrahman Adel Mahmoud, Adam Khattabi, Rakan Alzu’bi and Mahmoud Abdelrasoul. It documents acceptance, rather than proving attendance or that the poster was ultimately presented.',
      'أكدت الجمعية الكيميائية الأمريكية في ٢٢ مايو ٢٠١٩ قبول ملخص «Role of early Arabs and Muslims in the foundation of chemistry science» ضمن البرنامج العلمي لمؤتمرها في سان دييغو من ٢٥ إلى ٢٩ أغسطس ٢٠١٩، تحت قسم تاريخ الكيمياء [HIST] وجلسة الملصقات Sci-Mix، بالرقم 3211078. شمل خطاب القبول عبدالرحمن عادل محمود وآدم الخطابي وراكان الزعبي ومحمود عبدالرسول. وتوثق الرسالة القبول، لا الحضور أو تقديم الملصق فعليًا.'));
    const fig=el('div','rx26-figures');
    if(!compact){
      fig.append(
        photo('acs-fall-2019-acceptance-notice-first-view.png',phrase('22 May 2019 ACS official acceptance email showing abstract title and control ID','رسالة قبول الجمعية الكيميائية الأمريكية في ٢٢ مايو ٢٠١٩'),
          phrase('Official acceptance notice · date, recipients, abstract title and control ID.','إشعار القبول الرسمي · التاريخ والأسماء والعنوان ورقم الملخص.')),
        photo('acs-fall-2019-scimix-acceptance-details.png',phrase('Continuation of the ACS 2019 acceptance email describing Division of the History of Chemistry and Sci-Mix','تكملة رسالة القبول التي توضح قسم تاريخ الكيمياء وجلسة Sci-Mix'),
          phrase('Notice continued · HIST division, Sci-Mix selection and registration requirement.','تكملة الإشعار · قسم تاريخ الكيمياء وجلسة Sci-Mix ومتطلبات التسجيل.'))
      );
      section.append(fig,el('p','rx26-source',phrase('Sources: archival email screenshots IMG_2066.png and IMG_2067.png, supplied 16 October 2026. Screenshots record the email rather than a conference attendance certificate.','المصادر: لقطتا البريد الإلكتروني IMG_2066.png وIMG_2067.png المقدمتان في ١٦ أكتوبر ٢٠٢٦. ليستا شهادة حضور المؤتمر.')));
    } else {
      const a=el('a','rx26-link',phrase('Read the original ACS acceptance record and images ↗','اطّلع على سجل القبول والصور الأصلية ↗'));a.href='/engagement.html#rx26-acs-2019-evidence';section.append(a);
    }
    return section;
  }
  function start(){
    if(document.getElementById('rx26-supplement-loaded'))return;
    const m=el('span');m.id='rx26-supplement-loaded';m.hidden=true;document.body.append(m);
    const style=el('style');style.textContent=CSS;document.head.append(style);
    const page=document.documentElement.dataset.rxPage||'';
    if(page==='engagement'){
      const fest=document.querySelector('#festival article')||document.querySelector('#chemistry-festival article');
      if(fest)fest.append(festival());
      const acsTarget=document.querySelector('#acs-2019 article');if(acsTarget)acsTarget.append(acs(false));
    } else if(page==='stories'){
      const community=document.querySelector('#community .stories-chapter-text');
      if(community)community.append(festival());
      const history=document.querySelector('#historical-chemistry .stories-chapter-text');
      if(history)history.append(acs(true));
    } else if(page==='archive'){
      const main=document.querySelector('main');if(main){
        const e=el('div');e.className='wrap';e.id='rx26-archive-festival-acs';e.append(festival(),acs(false));main.append(e);
      }
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();