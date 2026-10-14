# Mahmoud K. Al-Ruweidi | Research & Scholarship Website

Live site: **https://malruweidi.github.io/**
Photo & video archive: **https://malruweidi.github.io/archive.html**
Public academic profile: **https://malruweidi.github.io/cv.html**

## What is included

- `index.html`: research portfolio, first-person narrative about curiosity and the origins of things, selected publications, scientific methods, writing, public record, and initiatives
- `stories.html`: illustrated bilingual Stories collection with eleven evidence-linked chapters, including the Ramadan zebrafish/ATVB field memory, chemistry outreach, laboratory setbacks, scientific history, surface engineering and research apparatus. Each visual is captioned by its actual model and evidentiary limitations; `assets/stories-i18n.js` provides the Arabic editorial translations.
- `archive.html`: current editorial archive, five introductory featured photographs, and a restored 30-photo category-filterable gallery loaded by `assets/archive-restoration.js` from the original documented photo index
- `archive/*.jpg`: web-optimized photographs cropped from supplied personal files and archived Google Photos screenshots (interfaces removed)
- `archive/archive-video-2016.mp4`: web-optimized silent copy of the supplied 5.5-second MOV file (displayed in the recovered archive and methods atlas)
- `assets/archive-photo-manifest.json`: the full restored 30-image archive index, with original display dates and source labels from historical revision `426d3d703dee`
- `assets/archive-restoration.js` and `.css`: non-destructive gallery, category filters, image viewer and film, injected by `assets/site-enhancements.js`
- `assets/public-science-home.js` and `.css`: original outreach photographs and source links adjacent to the QUACS history on the homepage
- `engagement.html`: original chapter photographs, source-linked Chemist Café historical posters, an account of Chemistry Festival hosting, and two original zebrafish microscopy films
- `techniques.html`: four original animal-model archival recordings; three zebrafish MP4 videos are hosted by the existing Creative Claw CDN
- `cv.html`: public academic profile omitting private phone number, home address, and referee details
- `assets/*.svg`: original conceptual research illustrations; they are not experimental evidence
- `sitemap.xml`, `robots.txt`, `.nojekyll`: GitHub Pages site configuration

## Source dates, interpretation, and privacy

Many photos came from 2026 screenshots of Google Photos. The displayed date labels are preserved in page captions and recorded as **archive display dates, not independently authenticated exposure timestamps**. The 2014 portrait is labeled with its filename date because original capture EXIF is absent. The photograph of a child using a computer is marked *date unverified* even though its filename includes April 2015. The archival video contains a file creation timestamp of December 25, 2016; the recording date and specimen identity were not independently verified.

The video is deliberately served without audio. Original source photographs and the original MOV are *not* published; only optimized copies appear on the public website. If photographs depict colleagues or other identifiable people, consider permissions before continuing to circulate or promote them.

Conceptual schematics are explicitly distinguished from original experimental research figures. `figures.html` contains research figures attributed to their scientific publications, while `techniques.html` includes microscopy images and experimental figures. Original publisher reproduction permissions, DOI metadata, and figure-specific provenance should be independently checked before external syndication. Conference posters linked from the public-engagement story preserve photographs of The Chemist Café, but standalone crops of those specific images have not been recovered.

## Hosting

Hosted on GitHub Pages using the public `main` branch and the repository root. No paid server or custom domain is necessary; deployment occurs automatically when the repository changes.

## Restoration verification (11 October 2026)

The original 30-photo gallery was recovered from a historical repository revision and reinstated as a separate enhancement, leaving the existing archive layout and five featured photographs intact. The [latest GitHub Pages deployment](https://github.com/malruweidi/malruweidi.github.io/actions/runs/38140679512) succeeded. Both desktop and mobile rendered-page checks found the restored collection. See [the media audit](MEDIA-AUDIT-2026-10-11.md) for confirmed files and the remaining source limitations. In particular, Chemist Café and Chemistry Festival MC-specific photographs must not be assigned to generic images without verified provenance.

## October 2026 editorial and performance audit
The research timeline distinguishes founding of the ACS chapter in 2015, pre-2021 undergraduate research publications, MSc enrollment in 2022, resumption of graduate study in 2025, and expected (not completed) graduation in 2027. Photo captions and scientific contributions retain individual provenance. The homepage's embedded JPEGs have been moved into `assets/home-archive/`, retaining their bytes while reducing the HTML document size for faster initial loading.

## A Reader's Map (14 October 2026)

`reading-map.html` is an added editorial entry point with its own `assets/reading-map.css`. Four carefully sourced paths connect the current scientific research, laboratory methods, existing stories and verified media. The reader's map does **not** replace the CV, full research record, original pictures, video archive, methods, figures, grants, or any previous page. All original navigation targets are retained, and the new route is available from the homepage and Stories navigation.

**Editorial preservation rule:** Changes must never discard existing material for convenience, brevity or aesthetic fashion. Improve legibility, provenance, accessibility, performance and discoverability without flattening or deleting original work. Where evidence is incomplete, label the uncertainty rather than inventing results or erasing the record. The approved Ruwaidix visual identity and original media are preserved. Any future redesign should keep full routes and primary material accessible and provide auditable, reversible changes.


## Search the complete archive (14 October 2026)

The new [Find the Thread](https://malruweidi.github.io/search.html) entry point indexes 42 source-grounded routes into the existing research record, methods, figures, public archives, grant histories, and individual Stories chapters. English and Arabic subject terms, keyboard search (`/` or `Ctrl/⌘ K`), subject filters, no-JavaScript fallback links, and a standalone bilingual interface are provided without an external search service, telemetry, or tracking. The existing [Reader's Map](https://malruweidi.github.io/reading-map.html) remains a complementary, editorial reading experience.

**Preservation:** This work adds one public route and standalone styles/scripts, with unobtrusive navigation entry points. It does not delete, truncate, rewrite, re-compress or relocate the existing scientific papers, media, stories, original images, documents, figures, menus or destinations. Search entries describe existing public pages, and the underlying primary record remains accessible in full.

**Quality check:** Run `node --test tests/discovery-index.test.mjs` and `node --check assets/discovery-search.js` from the repository root.


## Lossless, reversible archival-media optimization (14 October 2026)

The early archive photographs, a published MicroZebraLab figure, and two Chem Squad image assets have been moved from inline base64 strings into eight separately served original-byte files under `assets/archival-inline/`. No photographic pixels, JPEG/WebP compression data, captions, research claims, dates, provenance notices, image order, media routes or access to the record have been altered. This is a **relocation, not removal, cropping or recompression**. The source-byte Git blob SHA-1 for every asset is fixed in `tests/media-preservation.test.mjs` and checked in CI.

The HTML payloads now measure approximately **15 KB** for `archive.html` (previously 473 KB), **15 KB** for `imaging.html` (previously 431 KB), and **36 KB** for `chem-squad.html` (previously 57 KB). Lazy-loaded photographs can be fetched and cached independently instead of being embedded inside the initial document. The original historical content is unchanged, and every archived image remains public at its original location in the page.

Run `node --test tests/media-preservation.test.mjs` to verify the exact preserved binary payloads and original captions.
