/* Owner-identified portraits and lab/community photographs; additive placement only. */
(() => {
  "use strict";
  const base = "/assets/chem-squad-owner-archive-2026-10-12/";
  const records = [
    {
      file: "qu-chemistry-department-ramadan-iftar.webp", featured: true,
      label: ["COMMUNITY / QATAR UNIVERSITY", "المجتمع العلمي / جامعة قطر"],
      title: ["Chemistry around the iftar table", "أهل الكيمياء حول مائدة الإفطار"],
      caption: ["A Ramadan iftar attended by Chemistry Department students and alumni from different years at Qatar University. The group is not individually identified in this photograph.", "لقاء إفطار رمضاني جمع طلاب قسم الكيمياء بجامعة قطر وخريجيه من دفعات مختلفة، دون تحديد أسماء جميع المشاركين في الصورة."],
      alt: ["Group photograph of Chemistry Department students and alumni gathered at a Ramadan iftar.", "صورة جماعية لطلاب قسم الكيمياء وخريجيه في إفطار رمضاني."]
    },
    {
      file: "khaled-jama-nitrogen-laboratory.webp", featured: true,
      label: ["LABORATORY / A COLLEAGUE AT WORK", "المختبر / زميل أثناء العمل"],
      title: ["Khaled, beside the nitrogen cylinder", "خالد بجوار أسطوانة النيتروجين"],
      caption: ["Khaled Jama Mohamoud photographed next to a nitrogen cylinder at a laboratory bench. The image is part of our laboratory archive; it does not identify the experiment taking place.", "خالد جامع محمود بجوار أسطوانة نيتروجين في المختبر. الصورة جزء من أرشيفنا المخبري، ولا يمكن الجزم بنوع التجربة من الصورة وحدها."],
      alt: ["Khaled Jama Mohamoud standing next to laboratory apparatus and a green nitrogen cylinder.", "خالد جامع محمود بجوار أجهزة مختبرية وأسطوانة نيتروجين خضراء."]
    },
    {
      file: "nassr-formal-white-dress.webp",
      label: ["COLLEAGUES", "زملاء"],
      title: ["With Mohamed G. Nassr", "مع محمد ج. نصر"],
      caption: ["Mohamed G. Nassr and I in white formal attire, in a photograph from the chemistry circle's personal archive.", "محمد ج. نصر وأنا بالزي الأبيض في صورة من الأرشيف الشخصي لمجموعة الكيمياء."],
      alt: ["Mahmoud Al-Ruweidi with Mohamed G. Nassr wearing white formal clothing.", "محمود الرويدي مع محمد ج. نصر بالزي الأبيض."]
    },
    {
      file: "elgendy-formal-portrait.webp",
      label: ["COLLEAGUES", "زملاء"],
      title: ["With Ahmed Elgendy", "مع أحمد الجندي"],
      caption: ["Ahmed Elgendy and I at a formal gathering. The photograph records our friendship outside an experiment.", "أحمد الجندي وأنا في مناسبة رسمية، خارج سياق التجارب المخبرية."],
      alt: ["Mahmoud Al-Ruweidi and Ahmed Elgendy in suits.", "محمود الرويدي وأحمد الجندي يرتديان بدلتين."]
    },
    {
      file: "elgendy-abdelrahman-three-person-selfie.webp",
      label: ["THREE COLLEAGUES", "ثلاثة زملاء"],
      title: ["Elgendy, Abdelrahman and me", "الجندي وعبدالرحمن وأنا"],
      caption: ["Ahmed Elgendy, Abdelrahman Adel Mahmoud and I at a formal gathering.", "أحمد الجندي وعبدالرحمن عادل محمود وأنا في مناسبة رسمية."],
      alt: ["Three colleagues, Mahmoud Al-Ruweidi, Ahmed Elgendy and Abdelrahman Adel Mahmoud, photographed together.", "محمود الرويدي وأحمد الجندي وعبدالرحمن عادل محمود في صورة جماعية."]
    },
    {
      file: "abdelrahman-casual-selfie.webp",
      label: ["OUTSIDE THE LAB", "خارج المختبر"],
      title: ["An ordinary afternoon with Abdelrahman", "وقت عادي مع عبدالرحمن"],
      caption: ["An informal photograph with Abdelrahman Adel Mahmoud. The date has not been established from the surviving image.", "صورة غير رسمية مع عبدالرحمن عادل محمود، دون تاريخ تصوير موثق."],
      alt: ["Mahmoud Al-Ruweidi and Abdelrahman Adel Mahmoud sitting together in an informal setting.", "محمود الرويدي وعبدالرحمن عادل محمود في جلسة غير رسمية."]
    },
    {
      file: "rakan-gathering.webp",
      label: ["FRIENDS", "أصدقاء"],
      title: ["With Rakan Al-Zu’Bi", "مع راكان الزعبي"],
      caption: ["Rakan Al-Zu’Bi and I at an informal gathering. The photograph belongs to the group's social history rather than a research record.", "راكان الزعبي وأنا في لقاء غير رسمي، وهي صورة من الذاكرة الاجتماعية للمجموعة لا من سجل النتائج البحثية."],
      alt: ["Mahmoud Al-Ruweidi with Rakan Al-Zu’Bi sitting together at a gathering.", "محمود الرويدي مع راكان الزعبي في لقاء."]
    },
    {
      file: "elgendy-abdelrahman-university-room.webp",
      label: ["UNIVERSITY YEARS", "سنوات الجامعة"],
      title: ["A room, three chemists", "غرفة جامعية وثلاثة كيميائيين"],
      caption: ["Ahmed Elgendy, Abdelrahman Adel Mahmoud and I in a university room. A record of our shared years rather than a posed laboratory photograph.", "أحمد الجندي وعبدالرحمن عادل محمود وأنا في إحدى غرف الجامعة، في صورة توثق سنواتنا المشتركة."],
      alt: ["Mahmoud Al-Ruweidi, Ahmed Elgendy and Abdelrahman Adel Mahmoud together in a university room.", "محمود الرويدي وأحمد الجندي وعبدالرحمن عادل محمود في غرفة جامعية."]
    }
  ];
  const locale = () => (document.documentElement.lang || "en").toLowerCase().startsWith("ar") ? 1 : 0;
  const ready = () => {
    const target = document.getElementById("weekly");
    if (!target || document.getElementById("csrx-photo-history")) return;
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "/assets/chem-squad-owner-archive-2026.css?v=20261016";
    document.head.append(css);
    const section = document.createElement("section");
    section.className = "section dark csrx-section";
    section.id = "csrx-photo-history";
    section.setAttribute("aria-labelledby", "csrx-heading");
    const shell = document.createElement("div");
    shell.className = "wrap csrx-shell";
    const kicker = document.createElement("p");
    kicker.className = "csrx-kicker";
    const heading = document.createElement("h2");
    heading.className = "csrx-heading";
    heading.id = "csrx-heading";
    const intro = document.createElement("p");
    intro.className = "csrx-intro";
    const grid = document.createElement("div");
    grid.className = "csrx-grid";
    const local = [];
    const add = (el, en, ar) => { local.push([el, en, ar]); return el; };
    add(kicker, "CHEM SQUAD / PHOTOGRAPHS FROM THE ARCHIVE", "فريق الكيمياء / صور من الأرشيف");
    add(heading, "Outside the notebook.", "خارج صفحات دفتر المختبر.");
    add(intro,
      "The chemistry continued in university rooms, over Ramadan iftar, at conferences and in everyday meetings. These photographs were identified from my personal archive. They belong here with the people who appear in them, without claiming that an ordinary gathering produced a research result.",
      "استمرت صداقات الكيمياء في قاعات الجامعة وعلى مائدة إفطار رمضان وفي اللقاءات اليومية. هذه الصور عرّفتها من أرشيفي الشخصي، ومكانها هنا مع الأشخاص الذين يظهرون فيها، دون أن تتحول المناسبة العادية إلى ادعاء بحثي.");
    for (const item of records) {
      const figure = document.createElement("figure");
      figure.className = "csrx-card" + (item.featured ? " csrx-feature" : "");
      const a = document.createElement("a");
      a.href = base + item.file;
      a.setAttribute("aria-label", "Open archived photograph: " + item.title[0]);
      const img = document.createElement("img");
      img.className = "csrx-media";
      img.src = base + item.file;
      img.loading = "lazy";
      img.decoding = "async";
      img.width = 800;
      img.height = item.file.includes("iftar") ? 410 : 900;
      add(img, item.alt[0], item.alt[1]);
      a.append(img);
      const caption = document.createElement("figcaption");
      caption.className = "csrx-caption";
      const label = document.createElement("span");
      label.className = "csrx-label";
      const title = document.createElement("strong");
      const text = document.createElement("p");
      add(label, item.label[0], item.label[1]);
      add(title, item.title[0], item.title[1]);
      add(text, item.caption[0], item.caption[1]);
      caption.append(label, title, text);
      figure.append(a, caption);
      grid.append(figure);
    }
    const source = document.createElement("p");
    source.className = "csrx-source";
    const link = document.createElement("a");
    link.href = "/moving-evidence.html#chem-squad-film";
    add(link, "Watch Khaled explain a chemistry reaction ↗", "شاهد خالد وهو يشرح تفاعلاً كيميائياً ↗");
    const sourceIntro = document.createElement("span");
    add(sourceIntro,
      "Identities and contexts provided by the archive owner. Capture dates are not asserted.  ",
      "تحديد الأسماء والسياقات من صاحب الأرشيف؛ تواريخ التصوير غير مؤكدة.  ");
    source.append(sourceIntro, link);
    shell.append(kicker, heading, intro, grid, source);
    section.append(shell);
    target.before(section);
    const update = () => {
      const ar = locale();
      section.dir = ar ? "rtl" : "ltr";
      for (const [node,en,arabic] of local) {
        if (node.tagName === "IMG") node.alt = ar ? arabic : en;
        else node.textContent = ar ? arabic : en;
      }
    };
    update();
    new MutationObserver(update).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",ready,{once:true});
  else ready();
})();
