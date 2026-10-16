# Mahmoud K. Al-Ruweidi | Research & Scholarship Website

Live site: **https://malruweidi.github.io/**
Photo & video archive: **https://malruweidi.github.io/archive.html**
Scientific film index: **https://malruweidi.github.io/moving-evidence.html**
Public academic profile: **https://malruweidi.github.io/cv.html**
Editorial voice and source-placement requirements: **[Ruwaidix editorial standard](EDITORIAL-STANDARD.md)**.

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

## Findability and share-preview integrity (14 October 2026)

Twelve additional publicly accessible editorial, research, grants, CV and Stories pages now carry self-canonical URLs and consistent Open Graph/Twitter metadata, adding only fields that were previously absent. Titles and descriptions are derived from the already published page metadata; existing images and source text are not replaced. The current approved research portrait is the fallback share image where no image was configured. `tests/metadata-integrity.test.mjs` enforces these fields alongside preservation of the original research sections. Oversized primary research pages not addressable through the connected text interface were deliberately left untouched rather than rewritten from incomplete content.

## Scientific deep reading (15 October 2026)

Four self-contained Stories pages reproduce original chapter text, original photographs and evidence notes verbatim: `stories/cairo-microscope.html`, `stories/failed-zebrafish-histology.html`, `stories/unfortunate-copolymer-trials.html`, and `stories/ramadan-microscope.html`. Their original chapter routes in `stories.html` remain unchanged. Three research dossiers add question, methods, documented contribution, publication/status and original-evidence boundaries: `research/pulmonary-epithelial-injury.html`, `research/zebrafish-vascular-cilia.html`, and `research/inhalable-vesicles.html`. The MSc investigation remains explicitly unfinished. The pages share `assets/deep-reading-2026.css` and `assets/deep-reading-i18n-2026.js`; existing Arabic Stories translations are reused. Search, sitemap, research cards and Stories/archive/Reader's Map routes link to the new material. Run `node --test tests/deep-reading.test.mjs` and `node scripts/site-integrity.cjs`; live visual QA remains a separate step.

## Substack publications: authoritative public list (15 October 2026)

The live Substack archive at https://malruweidi.substack.com/archive was checked on 15 October 2026. The five articles listed in `assets/current-substack.json` all returned HTTP 200 from their canonical live URLs. The earlier Substack slugs used in the previous site writing card were returning HTTP 404; they are no longer shown as currently published posts. The homepage, `full-record.html`, `writing.html`, Reader's Map, search and sitemap should be updated together when the author publishes or withdraws an essay. The independent Drug Discovery Online columns are a separate publication collection and must remain intact.

`tests/substack-publications.test.mjs` guards the public index against stale Substack links and verifies that the homepage, writing hub and full historical record all match the maintained manifest. This is a dated verification snapshot, not a claim that Substack articles can never change. When adding new posts, verify the public archive and each URL before updating `assets/current-substack.json` and the corresponding static site entries.

## Current Substack feed verification and reading paths (15 October 2026)

The current five-entry Substack archive is cross-checked with the publisher's public RSS feed, `https://malruweidi.substack.com/feed`. The writing hub links readers directly to this feed. `scripts/substack-feed-verify.cjs` is **read-only** and compares the live feed with `assets/current-substack.json`, reporting newly listed, missing, or retitled posts; it never edits content or republishes withdrawn work. Run it manually with `node scripts/substack-feed-verify.cjs --live`, or trigger the on-demand GitHub Actions workflow **Verify live Substack publications** (`workflow_dispatch`). Network errors cause the optional check to fail instead of incorrectly announcing deleted posts. The normal deployment suite uses deterministic tests and has no network dependency. Once the RSS reaches 20 entries, a missing older item is not treated as proof of withdrawal, because RSS feeds can be windowed.

A new contextual-reading section on `writing.html` links the illness essay to a separate patient-evidence page, pairs the two language-and-AI essays, and links scientific-credit readers to the historical and archival material. It explicitly distinguishes editorial connections from primary evidence and preserves every original research and publication record.

## Owner-supplied 2017 microscopy and ACS chapter material (16 October 2026)

Six cropped, web-optimized archival photographs were added without removing or replacing any earlier material. They document a JEOL JCM-6000 scanning electron microscope at Qatar University, two original ACS student-chapter awards/certificates dated May 2017, an airport delegation photograph with Qatar University flags, a Washington Dulles airport group photo and an ACS-related “Journey to Mars” event flyer from Washington. The illustrated flyer is not treated as evidence of attendance at the advertised session. The group photo location and precise exposure date are intentionally left unverified.

`assets/archival-2017-additions.js` and `.css` display the images in the existing archive, engagement, Stories and homepage routes. The six publicly served crops live under `assets/2017-owner-archive/`. `assets/archival-2017-provenance.json` preserves original source-upload filenames, screenshot display labels, crop boundaries and SHA-256 hashes of both full screenshots and published copies. The original phone-gallery screenshots remain in the owner-supplied conversation archive and are not published in full, reducing accidental disclosure of unrelated photo thumbnails.
