# Stories extension and non-destructive audit — 13 October 2026

## Owner-approved design contract
The current October 2026 site appearance is approved; retain it. This update adds a long-form Stories page, not a redesign. The original home story, portfolio sections, research pages, archives, scientific figures, underlying photographs and routes were not deleted, repurposed or replaced.

## Changes implemented
- Created `stories.html` with four authored, evidence-linked chapters: 2011 school anatomy, chemistry chapter and public engagement, zebrafish/pulmonary experimental work, and ongoing inhalable drug-carrier research.
- Created `assets/stories.css` in the existing Newsreader / DM Sans / DM Mono and dark-pine / warm-paper visual system. No changes to the existing global colors, hero components or photographic gallery behavior.
- Created `assets/stories-i18n.js` with 65 Arabic editorial translations and reused the existing language controller. Text rendering switches with the site's language preference.
- Added one contextual Stories link in the established homepage anatomy narrative. Updated the shared secondary-page navigation, Arabic page title, sitemap, and README.

## Checks completed
- Verified the GitHub main-branch `stories.html` has exactly one H1, four anchored chapters, no duplicate IDs, no missing in-page anchor targets and no missing static local image, CSS or script paths.
- Parsed the 65-entry Arabic translation dictionary as a valid object and confirmed the page's substantial narrative paragraphs all have translations.
- Audited all 18 HTML files (including nested grant reports) for static local file references, internal anchors, duplicate IDs, missing image alt attributes and external links opened without `rel`. No issues of these tested types were detected.
- Checked links to the previous homepage story, the 2015–2019 engagement chapter, methods and research figures.
- GitHub Pages deployment run [38406228413](https://github.com/malruweidi/malruweidi.github.io/actions/runs/38406228413) completed successfully for the updated main-branch commit.

## Explicit limitations
- The direct published site could not be rendered through the available web reader. **Do not claim mobile visual QA, cross-browser acceptance or WCAG conformance** from static checks or a successful deployment alone. Browser passes remain useful at 320, 375, 768, 1024 and 1440 px in English and Arabic.
- The 2011 anatomy photograph uses the same externally hosted image as the approved homepage; its delivery and permanence have not been independently verified. Consider a provenance-preserving, permission-aware local copy if the original binary becomes available.
- Dates in photo captions may come from archival display labels rather than camera EXIF. The fifth-festival year has not been independently authenticated.
- The pulmonary research figure is presented as a figure pointing to scientific context, not a substitute for the underlying study. The thesis image is clearly labeled conceptual, not experimental evidence.
- Third-party embeds, externally hosted footage, rights to reproduce published figures and the accuracy of every external publication claim were **not** certified by the static link scan.
- Later owner-provided photographs may require a separate intake and identification pass before publication; absence from the Stories page does not imply that such uploads were reviewed.

## Future audit and editorial care
Prioritize: (1) real device and browser visual review, especially Arabic RTL navigation and images; (2) external media availability and local asset ownership; (3) cross-check of individual scientific figures against DOI/manuscript/source captions; (4) optional evidence-based story additions only when a sufficiently identified photographic or research source exists.

## Ramadan/ATVB editorial addition — 13 October 2026
- New dedicated first-person chapter `#ramadan-atvb`, placed immediately after the living-systems research narrative. Covers breaking the Ramadan fast at Qatar University, returning to experiments and missing Taraweeh prayers, and guests waiting at the owner's house while the final experimental day was still underway.
- Scientific anchor: Eisa-Beygi et al., 2018, *Arteriosclerosis, Thrombosis, and Vascular Biology*, DOI `10.1161/ATVBAHA.118.311231`. Distinguishes the study's published findings from the owner's unverified diary-level recollection and does not claim any one night's experiment yielded the paper's central discovery.
- Uses previously archived zebrafish microscopy figure with explicit contextual caption. The owner-identified Ramadan microscopy photograph (`IMG_4241.jpeg`) remains pending source image availability and is NOT misrepresented as uploaded.
- Reordered chapter numbering and anchor links to keep all eleven stories readable; added a direct link from the existing living-systems narrative, full corresponding Arabic prose, and preserved original design and other research archive routes.
