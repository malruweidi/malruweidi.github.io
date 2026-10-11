/* A quiet first-person bridge on the original homepage.
   Additive only. Existing research, archive, media, and patient-resource sections remain intact. */
(function () {
  "use strict";
  function initialize() {
    if (document.documentElement.getAttribute("data-rx-page") !== "home") return;
    if (document.getElementById("rx-illness-bridge")) return;
    const heroCopy = document.querySelector(".hero-copy");
    const originalSubtitle = heroCopy && heroCopy.querySelector(".subtitle");
    const languageTargets = [];
    function bilingual(element, english, arabic) {
      element.setAttribute("data-i18n-ignore", "");
      languageTargets.push({element:element, en:english, ar:arabic});
      return element;
    }
    function node(tag, cls, english, arabic) {
      const element = document.createElement(tag);
      if (cls) element.className = cls;
      return bilingual(element, english, arabic);
    }
    if (originalSubtitle && !document.getElementById("rx-illness-hero-link")) {
      const line = document.createElement("p");
      line.className = "rx-illness-hero-link";
      line.id = "rx-illness-hero-link";
      line.setAttribute("data-i18n-ignore", "");
      const link = node("a", "", "My experience with eosinophilic disease ↗", "تجربتي مع المرض اليوزيني ↗");
      link.href = "illness-and-evidence.html";
      line.appendChild(link);
      originalSubtitle.insertAdjacentElement("afterend", line);
    }
    const section = document.createElement("section");
    section.className = "rx-illness-bridge";
    section.id = "rx-illness-bridge";
    section.setAttribute("aria-labelledby", "rx-illness-heading");
    section.setAttribute("data-i18n-ignore", "");
    const wrap = document.createElement("div");
    wrap.className = "rx-illness-wrap";
    const left = document.createElement("div");
    left.className = "rx-illness-margin";
    left.appendChild(node("span", "rx-illness-overline", "A SECOND EDUCATION / LIVING WITH DISEASE", "تعليم آخر / الحياة مع المرض"));
    left.appendChild(node("p", "rx-illness-aside", "Scientific curiosity came first. Illness made the problem of evidence harder to ignore.", "سبق الفضولُ العلمي المرضَ؛ وجعل المرضُ سؤالَ الدليل أصعب على التجاهل."));
    const right = document.createElement("div");
    right.className = "rx-illness-prose";
    const heading = node("h2", "", "When the evidence does not fit neatly.", "عندما لا تتطابق الأدلة بسهولة.");
    heading.id = "rx-illness-heading";
    right.appendChild(heading);
    right.appendChild(node("p", "", "Alongside my early fascination with anatomy and chemistry, I spent years living with recurrent eosinophilic gastrointestinal illness. Its history includes severe symptoms, changing clinical descriptions, and investigations that did not always tell the same story. A biopsy samples a particular place and moment. A blood count records another aspect of the body. Neither should be asked to explain more than it has measured.", "بالتوازي مع اهتمامي المبكر بالتشريح والكيمياء، عشت سنوات مع مرض يوزيني متكرر يصيب الجهاز الهضمي. وشملت التجربة أعراضاً شديدة وتوصيفات طبية متغيرة وفحوصاً لم تقدم دائماً الصورة نفسها. فالخزعة تصف موضعاً ولحظة محددين، وصورة الدم تقيس جانباً آخر من الجسد. لا ينبغي أن نطلب من أي قياس تفسير ما لم يقسه."));
    right.appendChild(node("p", "", "The illness interrupted parts of my education and limited where I could study. It did not create my interest in science, nor did it make the intervening years academically easy. I continued learning in laboratories, from molecular sensors and materials to zebrafish, mechanically injured lung cells, and inhaled therapeutic systems. Those fields were not chosen to tell an inspiring story after the fact. Each left me with a question that the previous methods could not settle.", "عطّل المرض أجزاء من دراستي وحدّ من الأماكن التي كان بوسعي أن أدرس فيها. لكنه لم يصنع اهتمامي بالعلم، ولم يجعل تلك السنوات سهلة أكاديمياً. واصلت التعلم في المختبرات، من المجسات الجزيئية وأبحاث المواد إلى أسماك الزرد وخلايا الرئة المصابة ميكانيكياً وأنظمة العلاج المستنشق. لم أختر هذه المجالات لأصنع منها حكاية ملهمة بأثر رجعي؛ بل ترك لي كل مجال سؤالاً عجزت طرائق المجال السابق عن حسمه."));
    // The user's 2017 archival image makes the educational interruption concrete without spectacle.
    const examFigure = document.createElement("figure");
    examFigure.className = "rx-exam-photo";
    const examLink = document.createElement("a");
    examLink.href = "/archive/archive-7885.jpg";
    examLink.setAttribute("aria-label", "Open the original photograph from June 2017");
    const examImg = document.createElement("img");
    examImg.src = "/archive/archive-7885.jpg";
    examImg.loading = "lazy";
    examImg.decoding = "async";
    examImg.alt = "A photograph of the author sleeping in a waiting area between examinations in 2017";
    examLink.appendChild(examImg);
    const examCaption = document.createElement("figcaption");
    examCaption.appendChild(node("strong", "", "Between examinations, June 2017.", "بين الامتحانات، يونيو ٢٠١٧."));
    examCaption.appendChild(node("span", "", "I was living with eosinophilic gastrointestinal illness at the time. The photograph is neither a diagnosis nor a claim to exceptional endurance. It records an ordinary moment in an education repeatedly interrupted by illness.", "كنت آنذاك أعيش مع مرض يوزيني يصيب الجهاز الهضمي. لا تمثل الصورة تشخيصاً، ولا ادعاءً بالبطولة؛ إنها لحظة عادية من دراسة انقطعت مراراً بسبب المرض."));
    examFigure.append(examLink,examCaption);
    right.appendChild(examFigure);
    const quote = document.createElement("blockquote");
    quote.className = "rx-illness-quote";
    quote.appendChild(node("p", "", "A measurement may be correct and still be incomplete.", "قد يكون القياس صحيحاً، لكنه يظل ناقصاً."));
    right.appendChild(quote);
    const actions = document.createElement("div");
    actions.className = "rx-illness-actions";
    const full = node("a", "rx-illness-primary", "Read the personal account ↗", "اقرأ الحكاية الشخصية ↗");
    full.href = "illness-and-evidence.html";
    const research = node("a", "rx-illness-secondary", "Explore the experiments ↗", "تصفح التجارب ↗");
    research.href = "techniques.html";
    actions.append(full, research);
    right.appendChild(actions);
    wrap.append(left, right);
    section.appendChild(wrap);
    const patientHeading = document.getElementById("patient-heading");
    const patientSection = patientHeading && patientHeading.closest("section");
    const existingPatient = patientSection || document.querySelector("section.patient, #patient, #patient-story, #patient-journey");
    const existingStory = document.querySelector("section#story, #story");
    const existingResearch = document.querySelector("section#research, #research");
    const destination = existingPatient || existingStory || existingResearch || document.querySelector("main > section:last-of-type");
    if (destination && destination.parentNode) destination.parentNode.insertBefore(section, destination);
    else document.querySelector("main")?.appendChild(section);
    function updateLanguage() {
      const ar = document.documentElement.lang === "ar";
      languageTargets.forEach(function (item) {
        const translated = ar ? item.ar : item.en;
        if (item.element.textContent !== translated) item.element.textContent = translated;
        if (item.element.tagName === "A") item.element.setAttribute("aria-label", translated);
      });
    }
    updateLanguage();
    new MutationObserver(updateLanguage).observe(document.documentElement, {attributes:true, attributeFilter:["lang"]});
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize);
  else initialize();
})();
