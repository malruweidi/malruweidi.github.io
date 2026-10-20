/* Ruwaidix recommendations artwork · additive enhancement · 2026-10-20
   Exact edition ISBNs and identified screen posters. Essay art is intentionally typographic,
   not a fabricated book jacket or an unattributed article image. */
(() => {
  "use strict";
  const bookArt = {
    "lessons-in-chemistry": ["9780385547345", "Lessons in Chemistry"],
    "you-are-not-so-smart": ["9781592407361", "You Are Not So Smart"],
    "deep-work": ["9781455586660", "Deep Work"],
    "flow-the-psychology-of-optimal-experience": ["9780061339202", "Flow: The Psychology of Optimal Experience"],
    "hayy-ibn-yaqzan": ["9780226303109", "Hayy ibn Yaqzan"]
  };
  const screenArt = {
    "lessons-in-chemistry": ["https://tech.caltech.edu/img/2024/jan16/lessons_in_chemistry.jpg", "The California Tech"],
    "chernobyl": ["https://assets.microsites.anuvu-services.net/microsites/BAW/BAS/poster-image/desktop/BAS_Chernobyl_S01.webp", "Anuvu"],
    "ikiru": ["https://commons.wikimedia.org/wiki/Special:FilePath/Ikiru_poster.jpg", "Wikimedia Commons"],
    "12-angry-men": ["https://image.tmdb.org/t/p/w500/czuCAmut5A69oTb5DqdYqNX8TXt.jpg", "TMDB / Criterion"],
    "arrival": ["https://www.impawards.com/2016/posters/arrival_ver12_xxlg.jpg", "IMP Awards"],
    "hidden-figures": ["https://www.originalfilmart.com/cdn/shop/products/Hidden_Figures_2017_bus_original_film_art_1200x.jpg?v=1579320666", "Original Film Art"],
    "oppenheimer": ["https://image.tmdb.org/t/p/w500/mgjKNDzFINGvNFtHSqzfUZ4pk6Y.jpg", "TMDB"],
    "contagion": ["https://cdn.shopify.com/s/files/1/1416/8662/products/Contagion_2011_original_film_art_1200x.jpg?v=1562540654", "Original Film Art"]
  };
  const path = window.location.pathname;
  const kind = path.includes("recommended-books") ? "book" :
    path.includes("recommended-screen") ? "screen" : "essay";
  const decode = (html) => {
    const el = document.createElement("textarea");
    el.innerHTML = html;
    return el.value;
  };
  function addText(parent, tag, cls, value) {
    const node = document.createElement(tag);
    node.className = cls;
    node.textContent = value;
    parent.appendChild(node);
    return node;
  }
  function artwork(type, title, id, byline) {
    const figure = document.createElement("figure");
    figure.className = "rr-art rr-art-" + type;
    const frame = addText(figure, "div", "rr-art-frame", "");
    const fallback = addText(frame, "div", "rr-art-fallback", "");
    addText(fallback, "span", "rr-art-fallback-type", type === "essay" ? "ESSAY / READING" : type === "book" ? "BOOK / COVER" : "ON SCREEN / POSTER");
    addText(fallback, "strong", "rr-art-fallback-title", title);
    if (type === "essay") addText(fallback, "small", "rr-art-fallback-byline", byline);
    let src, credit;
    if (type === "book" && bookArt[id]) {
      src = "https://covers.openlibrary.org/b/isbn/" + bookArt[id][0] + "-L.jpg?default=false";
      credit = "Cover · Open Library";
    } else if (type === "screen" && screenArt[id]) {
      src = screenArt[id][0];
      credit = "Poster · " + screenArt[id][1];
    } else if (type === "essay") {
      credit = "Editorial index art";
    }
    if (src) {
      const img = document.createElement("img");
      img.className = "rr-art-image";
      img.alt = (type === "book" ? "Cover of " : "Poster for ") + title;
      img.src = src;
      img.width = 320;
      img.height = 480;
      img.loading = "lazy";
      img.decoding = "async";
      img.referrerPolicy = "no-referrer";
      img.addEventListener("error", () => { img.remove(); figure.classList.add("rr-art--missing"); }, {once:true});
      frame.appendChild(img);
    }
    if (credit) addText(figure, "figcaption", "rr-art-credit", credit);
    return figure;
  }
  document.querySelectorAll(".rr-entry").forEach((entry) => {
    const body = Array.from(entry.children).find((el) => el.tagName === "DIV");
    if (!body || entry.querySelector(".rr-art")) return;
    const title = decode((body.querySelector("h3")?.textContent || "").trim());
    const byline = decode((body.querySelector(".rr-meta")?.textContent || "").trim());
    const art = artwork(kind, title, entry.id, byline);
    entry.classList.add("rr-has-art");
    body.classList.add("rr-copy");
    entry.insertBefore(art, body);
  });
  if (path.endsWith("recommendations.html") || path === "/recommendations" || path === "/") {
    const links = document.querySelectorAll(".rr-index-grid .rr-feature");
    links.forEach((link, index) => {
      if (link.querySelector(".rr-feature-art")) return;
      const row = addText(document.createElement("div"), "span", "rr-feature-art-label", index === 0 ? "THE BOOKS" : index === 1 ? "THE ESSAYS" : "ON SCREEN");
      const preview = document.createElement("div");
      preview.className = "rr-feature-art";
      preview.appendChild(row);
      if (index === 1) {
        addText(preview, "strong", "rr-feature-art-essay", "Cargo Cult Science");
        addText(preview, "small", "rr-feature-art-foot", "Richard P. Feynman · 1974");
      } else {
        const imgs = index === 0 ?
          ["https://covers.openlibrary.org/b/isbn/9780385547345-M.jpg?default=false", "https://covers.openlibrary.org/b/isbn/9781455586660-M.jpg?default=false"] :
          [screenArt["lessons-in-chemistry"][0], screenArt["ikiru"][0]];
        imgs.forEach((src) => {
          const pic = document.createElement("img");
          pic.src = src; pic.alt = ""; pic.loading = "lazy"; pic.decoding = "async"; pic.referrerPolicy = "no-referrer";
          pic.addEventListener("error", () => { pic.remove(); }, {once:true});
          preview.appendChild(pic);
        });
      }
      const first = link.firstElementChild;
      if (first) first.insertAdjacentElement("afterend", preview);
    });
  }
})();
