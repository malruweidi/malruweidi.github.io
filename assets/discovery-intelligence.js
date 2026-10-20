/* Ruwaidix / lightweight, local evidence discovery.
 * Deterministic keyword and terminology matching. Not an AI answer engine.
 * No remote services, personal data, cookies or analytics. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.RuwaidixDiscovery = api;
})(typeof window === "object" ? window : null, function () {
  "use strict";
  function normalize(value) {
    return String(value || "").normalize("NFKD")
      .replace(/[\u0300-\u036f\u064b-\u065f\u0670\u0640]/g, "")
      .replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه")
      .toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  }
  const groups = [
    ["lung","lungs","pulmonary","airway","alveolar","الرئه","رئه","الرئوي","الرئويه","الرئتين"],
    ["inhaled","inhalable","inhalation","nebulizer","nebuliser","nebulization","nebulisation","aerosol","aerosolization","aerosolisation","استنشاق","الاستنشاق","رذاذ","الرذاذ"],
    ["niosome","niosomes","proniosome","proniosomes","نيوسومات","نيوسوم","برونيوسومات"],
    ["injury","injured","injuries","damage","اصابه","الاصابه","اصابات","تلف"],
    ["cell","cells","cellular","خلايا","الخلويه","خلويه"],
    ["delivery","deliver","delivered","transport","توصيل","نقل"],
    ["drug","drugs","therapeutics","medicine","دواء","ادويه","الدواء","علاج"],
    ["rna","sirna","circrna","circular","رنا","الحمض النووي الريبوزي"],
    ["target","targeting","degradation","degrader","degraders","protac","protacs","brd4","الهدف","استهداف","تحلل"],
    ["methods","method","techniques","protocol","protocols","methodology","التقنيات","المنهجيات","طريقه"],
    ["image","imaging","microscopy","camera","microscope","تصوير","مجهر","المجهر"],
    ["pharmacy","pharmaceutical","pharmaceutics","صيدله","الصيدله"],
    ["history","historical","تاريخ","التاريخ"],
    ["doctorate","doctoral","phd","research agenda","دكتوراه","الدكتوراه"],
  ].map(list => list.flatMap(x=>normalize(x).split(" ")).filter(Boolean));
  const groupMap = new Map();
  for (const group of groups) for (const word of group) {
    groupMap.set(word, group);
  }
  const stopWords = new Set(["i","me","my","we","the","a","an","in","on","to","for","of","about","with","and","or","how","what","where","find","show","can","do","does","is","are","was","were","please","that","which","this","by","from","في","عن","من","على","او","و","هل","كيف","ما","هي","هو","ابحث","اريد"]);
  function terms(query) {
    const words = normalize(String(query || "").slice(0, 200)).split(" ").filter(Boolean);
    const significant = words.filter(w=>!stopWords.has(w));
    return [...new Set(significant.length ? significant : words)];
  }
  function variants(word) {
    return groupMap.get(word) || [word];
  }
  function fieldScore(field, variantsList, original, weight) {
    if (field.includes(original)) return weight;
    return variantsList.some(term=>field.includes(term)) ? Math.max(1, weight - 3) : 0;
  }
  function score(entry, query) {
    const words = terms(query);
    if (!words.length) return 1;
    const title = normalize(entry.title);
    const keywords = normalize(entry.keywords);
    const summary = normalize(entry.summary);
    const category = normalize(entry.category);
    let total = 0;
    for (const word of words) {
      const alternatives = variants(word);
      const matched = Math.max(
        fieldScore(title, alternatives, word, 16),
        fieldScore(keywords, alternatives, word, 10),
        fieldScore(summary, alternatives, word, 5),
        fieldScore(category, alternatives, word, 3)
      );
      if (!matched) return 0;
      total += matched;
    }
    const phrase = normalize(query);
    if (phrase && title.includes(phrase)) total += 18;
    if (/^\/research\/[^/]+\.html$/.test(entry.url)) total += 4;
    return total;
  }
  function search(items, query, category) {
    if (!Array.isArray(items)) return [];
    const filtered = items.filter(entry => (!category || category === "All" || entry.category === category))
      .map(entry => ({entry, score: score(entry, query)}))
      .filter(result => result.score > 0);
    filtered.sort((a,b) => b.score - a.score || a.entry.id - b.entry.id);
    return filtered;
  }
  return Object.freeze({normalize, terms, score, search});
});
