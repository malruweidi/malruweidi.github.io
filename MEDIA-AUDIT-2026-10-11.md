# Website media inventory — 11 October 2026

This is an inventory of **repository files**, not proof that each image appears on the live website or represents the intended subject. No existing assets were deleted or replaced.

Repository currently contains **42 raster/video assets** (including 32 in `archive/`). SVG conceptual diagrams are excluded from this count.

## Asset files

- `archive/archive-7861.jpg` (76582 bytes)
- `archive/archive-7863.jpg` (90240 bytes)
- `archive/archive-7864.jpg` (64198 bytes)
- `archive/archive-7865.jpg` (23089 bytes)
- `archive/archive-7866.jpg` (56120 bytes)
- `archive/archive-7867.jpg` (37484 bytes)
- `archive/archive-7868.jpg` (43050 bytes)
- `archive/archive-7869.jpg` (62305 bytes)
- `archive/archive-7870.jpg` (61324 bytes)
- `archive/archive-7871.jpg` (44889 bytes)
- `archive/archive-7872.jpg` (74860 bytes)
- `archive/archive-7873.jpg` (45471 bytes)
- `archive/archive-7874.jpg` (47351 bytes)
- `archive/archive-7876.jpg` (51165 bytes)
- `archive/archive-7877.jpg` (79425 bytes)
- `archive/archive-7878.jpg` (51403 bytes)
- `archive/archive-7879.jpg` (54270 bytes)
- `archive/archive-7880.jpg` (79547 bytes)
- `archive/archive-7881.jpg` (78029 bytes)
- `archive/archive-7882.jpg` (22963 bytes)
- `archive/archive-7883.jpg` (32917 bytes)
- `archive/archive-7884.jpg` (48718 bytes)
- `archive/archive-7885.jpg` (55554 bytes)
- `archive/archive-7886.jpg` (64741 bytes)
- `archive/archive-7887.jpg` (81870 bytes)
- `archive/archive-7888.jpg` (95932 bytes)
- `archive/archive-7889.jpg` (63429 bytes)
- `archive/archive-7890.jpg` (53950 bytes)
- `archive/archive-video-2016.mp4` (127558 bytes)
- `archive/archive-video-poster.jpg` (33798 bytes)
- `archive/childhood-computer.jpg` (61756 bytes)
- `archive/portrait-2014.jpg` (36563 bytes)
- `assets/althakhira-youth-center-linkedin.webp` (3114 bytes)
- `assets/evidence-biomaterials.webp` (106080 bytes)
- `assets/evidence-pulmonary.webp` (79240 bytes)
- `assets/evidence-zebrafish.webp` (131066 bytes)
- `assets/history-0.webp` (33288 bytes)
- `assets/history-1.webp` (42418 bytes)
- `assets/history-2.webp` (61844 bytes)
- `assets/ruwaidix-approved.webp` (3662 bytes)
- `assets/zebrafish-embryo-microscopy.webp` (1306 bytes)
- `assets/zebrafish-larva-microscopy.webp` (2050 bytes)

## Restoration completed and verified on 11 October 2026

**Published deployment:** GitHub Pages workflow run [38140679512](https://github.com/malruweidi/malruweidi.github.io/actions/runs/38140679512) completed successfully.

- [x] Recovered **all 30 photo records**, complete with their inherited categories, dates and source notes, from historic commit `426d3d703dee`. They are now indexed at `assets/archive-photo-manifest.json`.
- [x] Reintroduced the **30-image filterable gallery** on `/archive.html` with large-image viewing and a mobile-responsive layout, without removing the five previously featured images. Two of the featured personal photographs also occur in the complete archival set; intentional reuse in the introductory selection should not be mistaken for two new source photographs.
- [x] Restored the **original short archival film** below the collection, with clear caution about its unidentified specimen and recording date.
- [x] Featured three original archived outreach images alongside QUACS on the homepage and on `/engagement.html`. Existing research, illness, historical writing, publication and scientific-computing content was not removed.
- [x] Connected The Chemist Café activities to **two primary-source conference posters**: 2017 ACS chapter poster Figure 2 and 2018 ACS chapter poster Figure 20. Their images are visible in the original poster records; standalone cropped source photographs are **not** claimed as recovered.
- [x] Embedded **two original zebrafish microscopy recordings** on `/engagement.html`. `/techniques.html` already contains three zebrafish recordings plus the avian preparation film.
- [x] Confirmed via live rendered-page inspection that the restored photo section appears in both mobile and desktop versions, and the homepage displays the new archival-photo section.
- [x] Confirmed every image filename referenced by the restored 30-photo manifest exists in the GitHub repository, and the current archive deployment succeeds.

### Live site and internal link QA

- **30 of 30 archival photo titles** were found in the live JavaScript-rendered archive after deployment, on desktop and mobile.
- **Three of three homepage outreach image captions** were present in the rendered homepage.
- A static local-asset reference audit across **17 HTML pages** found no missing referenced repository asset paths. Two occurrences of a dynamic JavaScript template expression are not literal broken links.
- The methods atlas presents four animal-model videos, while the Engagement page embeds two existing, researcher-provided zebrafish video streams.
- These checks verify page content and local paths; network/CDN reliability, permissions, and identification of unnamed photographs remain separate concerns.

## Remaining source limitations

- [ ] The **standalone original Chemist Café event photographs** have not yet been recovered from the 2017 and 2018 posters. The posters and figure numbers are linked; do not substitute unrelated café photographs.
- [ ] The original photographs documenting **MC hosting at the Chemistry Festival** have not yet been identified with reliable event metadata. Festival participation is mentioned in biography text based on the researcher's account, but unrelated science-event photographs are not mislabeled.
- [ ] Three AVI zebrafish recordings were found among earlier Library files; the Library did not authorize copying their raw bytes. The website currently uses already-hosted MP4 recordings.
- [ ] Source figure reproduction rights and laboratory specimen details need case-by-case review, particularly prior to external syndication.
- [ ] Full interactive image-opening and mobile visual QA across diverse devices remains advisable. Successful build and rendered-page extraction do not guarantee every user's image/network performance.

**Editorial rule:** Never infer a particular festival, café or named person from an anonymous archival filename. Date labels reflect the photo viewer metadata, not independently verified capture dates.
