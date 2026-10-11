# Mahmoud K. Al-Ruweidi | Research & Scholarship Website

Live site: **https://malruweidi.github.io/**
Photo & video archive: **https://malruweidi.github.io/archive.html**
Public academic profile: **https://malruweidi.github.io/cv.html**

## What is included

- `index.html`: research portfolio, first-person narrative about curiosity and the origins of things, selected publications, scientific methods, writing, public record, and initiatives
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
