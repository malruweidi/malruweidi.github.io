# Editorial and accessibility pass — 11 October 2026

## What was inspected
Source inspection of the 13 root HTML pages, the shared design and navigation stylesheets, the bilingual interface, and the existing media restoration record. This was a source-level review; the live URL could not be loaded through the available web renderer. **This is not a claim of cross-device visual certification.**

## Implemented decisions
- Keep DM Sans for body, Newsreader for editorial headings, DM Mono for small scientific metadata, and preserve Noto typography for Arabic.
- Add a final, explicitly scoped readability stylesheet to resolve old/new CSS collisions. Pair dark documentary backgrounds with light text and retain deliberately light archival photo cards on those dark sections.
- Raise small paragraph, research-grid, caption, qualification, and metadata text where the earlier styles reached 10–11px; keep compact all-caps labels only where nonessential.
- Improve menu legibility, responsive layout, keyboard focus, long-link wrapping and readability on small screens.
- Reference the approved local Ruwaidix brand image rather than fragile older image-CDN logo copies.
- Preserve images, figures, analytical claims, research citations, archived photographs, zebrafish and chick-embryo material, movies and current navigation destinations.
- Rework the homepage introductory biography toward a first-person scientific voice, avoiding promotional self-description.
- Use explicit color pairs with WCAG 2.2 AA text-contrast targets (4.5:1 for ordinary text; 3:1 for large text), but do not claim full AA compliance without computed-style, image-overlay, state and mobile testing.

## Integrity checks and limitations
- Source scan found one <h1> per root page, except the intentionally bilingual, dual-language illness essay; page scripts may insert extra headings dynamically.
- Internal link scan found no reliably confirmed missing static local image files. Dynamic template variables and the site's root path are not broken links.
- Previously reported media restoration inventory remains the source of truth for asset provenance.
- Embedded external-CDN photographs may fail independently of the design stylesheet and require a later asset-migration audit.
- Live render, contrast and layout tests at 320, 375, 768, 1024 and 1440px and for the Arabic translation remain recommended before declaring a complete visual QA pass.
- Future revisions should consolidate the multiple historical page CSS layers rather than adding yet more broad generic overrides. Maintain final text/background pairs and avoid 'one method, three steps' advertising copy.
