# Taste-Skill editorial refinement · 18 October 2026

## Design read

Scientific-documentary website, editorial research journal and personal evidence archive for potential principal investigators, researchers, collaborators, students and general readers. This is a **preservation-first redesign**, not a rebrand.

The active visual language predates this pass: Newsreader + DM Sans + DM Mono, green-black/pine, subdued terracotta, archival white paper, actual research and personal photography, and the approved Ruwaidix identity. These are retained deliberately.

### Taste-Skill configuration

- `DESIGN_VARIANCE = 6`: editorial asymmetry where it clarifies discovery, not arbitrary disorder.
- `MOTION_INTENSITY = 3`: only native hover/focus states; never parallax, autoplay or scroll hijacking.
- `VISUAL_DENSITY = 4`: information-rich enough for an academic audience, without an endless homepage.
- Aesthetic: **scientific documentary / scholarly editorial**; deliberately neither generic SaaS nor an Awwwards spectacle.
- Existing framework: **static HTML, CSS and progressive JavaScript**. No migration to React/Tailwind or new runtime dependencies.

## Pre-change findings

- The homepage already had an authentic split-screen portrait, an embedded two-minute introductory film, nine public chapter cards and an expandable full historical record.
- The nine cards used an even four-column arrangement with several competing pastel backgrounds. This visually flattened the hierarchy and left the final row incomplete on large desktops.
- Very large display type within the narrow hero column increased headline wrapping. Small-window views were served by existing media queries, but the hierarchy was not optimized for them.
- Layered CSS in the site is extensive. A replacement of the original stylesheet would be risky, especially to Arabic, archival captions and the scientific evidence.
- Existing nav links include dedicated pages for research, publications, films, stories, history, the book, Chem Squad and leadership. They must remain discoverable.

## Implemented in this pass

1. `assets/taste-editorial-2026-10-18.css`: small, explicit homepage-scoped enhancement loaded after the existing CSS.
2. A more carefully measured hero: revised typography scale and copy measure, deliberate image framing, preserved portrait, copy and all academic/story links.
3. Research-first twelve-column editorial index **on wide screens only**, retaining all **nine** original links in the same order. On tablet it becomes two columns, with the last card full-width. On narrow phones the same nine cards become compact one-column reading rows.
4. First (research) chapter becomes a dark-pine featured editorial opening, while all other chapters retain subdued paper/mist surfaces and readable text.
5. Quiet navigation underlines, clear keyboard focus, and a modest featured-film frame without introducing motion, synthetic imagery or new assets.
6. Existing `<details>` disclosure still opens the complete historical homepage record. Deep links, hashes, translations and old pages are unchanged.

## Locked boundaries

- **No deletions or rewrites** of publication claims, experimental contributions, full historical pages, figures, old images, film editions or transcripts.
- **No new media dependencies** and no guessing about photo provenance.
- Do not expose production scripts, authoring notes or review manifests in the public website.
- Do not add a downloadable CV.
- Keep the nine-card compact homepage; Chem Squad and leadership remain distinct chapters.
- Preserve accessibility affordances, English/Arabic readability and `prefers-reduced-motion`.

## Verification and rollback

Static checks cover presence of the new CSS link, preserved hero/video/disclosure, nine destinations, scoped selectors and responsive breakpoints. Other repository checks should run in CI. **Static checks alone do not establish visual, accessibility or cross-browser compliance**; verify actual deployed layouts at 320, 375, 768, 1024 and 1440 px, and audit RTL presentation separately.

Reversal is one HTML link removal: delete the `assets/taste-editorial-2026-10-18.css` stylesheet reference from `index.html`, or revert the two relevant commits. Prior CSS and all content remain present.
