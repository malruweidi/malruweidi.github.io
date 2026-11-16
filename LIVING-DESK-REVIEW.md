# Ruwaidix — Living Research Desk release

## Production homepage redesign — 17 November 2026

The redesigned **index.html** presents a concise, bilingual, original photographic research desk. All existing scientific, historical, and documentary pages are retained. The prior homepage is preserved as an unaltered snapshot at **home-legacy-2026.html**, linked in the complete collection section and footer.

### What is new
- Six expressive, source-grounded doorways to laboratory methods, fieldnotes, historical writing, documentary films, personal archives, and research horizons
- Three accessible visitor profiles, linking supervisors, fellow researchers, and curious readers to relevant primary pages
- Three explicit *editorial* intellectual threads, not new claims of scientific results
- Four research threads with clear research-stage/status labels
- English/Arabic switching, mobile navigation, keyboard-invoked local search, source-linked photography, and reduced-motion support
- Dedicated directory linking all nine previously prominent chapters plus the old complete homepage
- Canonical, Open Graph, and Twitter card metadata; no tracking or paid API
- A new regression test for the redesigned homepage; existing old-home tests now inspect the preserved archive

### Preserved
- Original media, scientific figures, clinical/personal narratives, bylines, author contributions and historic source references
- Every existing internal page and its deep links
- Existing English/Arabic archival translation scripts on older pages
- The approved Ruwaidix palette and typography

### Verification
- New homepage release contract passes in GitHub Actions.
- Repository site-integrity script passed on the PR with original source pages preserved.
- Chrome workflow captured screenshots at 375 and 1440px and checked overall reflow at 320/375/768/1024/1440px; 0 page errors or blocking layout issues in first PR run.
- Publication film test was updated to match the site's already released 06:26 film, *Anatomy of a Question*, without changing source media.

Browser automation provides evidence about tested interactions and source responses, **not** a full manual screen-reader certification, exhaustive media-rights review, or proof of publication-science accuracy.