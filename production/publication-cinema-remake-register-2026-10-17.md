# Publication Cinema — evidence-led remake register (17 October 2026)

## Release gate
No live MP4 replacement until the film has: (1) publication-specific figure provenance; (2) claim-by-claim script check against the source; (3) animation shot list; (4) licensed or original imagery; (5) pronunciation-reviewed narration; (6) playable H.264/AAC MP4 and captions; (7) mobile/desktop playback check. Preserve original assets and previous edits.

## Confirmed problems in publication-cinema.html
- `film-ace2-covid-drugs`, `film-ace2-forms`, and `film-niosomes` all use `/assets/evidence-pulmonary.webp`. This is generic cross-study reuse, not verified evidence imagery.
- `film-pla-grafting` and `film-pla-scaffolds` share `/assets/home-archive/figure-pla-surface.jpg`. Verify provenance and distinguish studies.
- `film-gi-autoimmunity-1` and `film-gi-autoimmunity-2` use `/assets/home-archive/university-lab-coat.jpg` instead of topic-specific explanatory visuals.
- `film-making-medicines-keep` uses `/assets/films/art/medieval-pharmacy.svg`; this is illustrative, not a historical primary-source image. Label it accordingly.
- Several image alt texts contain the literal template phrase “illustration or original research-context photograph”; replace after source verification.
- `film-making-medicines-keep` currently links to `/#history` rather than a directly verifiable article page.

## Film 01 — Making Medicines Keep
Source: *Making Medicines Keep: Syrups, Substitution, and Pharmaceutical Reliability in Ayyubid-Mamluk Cairo*. Acceptance communicated 15 October 2026; do not label published until publication verified.

Narrative question: How could a compound medicine remain usable when ingredient identity, supply, preparation and storage conditions varied?

Sequence:
1. **A formula must survive the pharmacy** — animated Cairo map and manuscript-inspired typographic composition. Modern reconstruction, clearly labeled; do not depict a particular surviving pharmacy as documented.
2. **The text as evidence** — manuscript folio only if archive identifier, license and passage are checked; otherwise render original Arabic transcription with exact source attribution.
3. **Syrup as a pharmaceutical system** — physically plausible dissolution/concentration schematic; distinguish historically attested procedure from modern mechanistic interpretation. Avoid invented concentrations, temperatures and shelf lives.
4. **Substitution is a constrained decision** — branching ingredient network with attested substitutions only, drawn from the article; do not invent equivalence.
5. **Reliability without modern assays** — compare documented preparation instructions with modern concepts of identity, stability and reproducibility, explicitly avoiding anachronistic claims of validated shelf life.
6. **What the sources cannot establish** — final scene distinguishes textual prescriptions from empirical stability measurements.

Image sourcing priority: article's cited manuscripts/editions; institutional digital collections with stable shelfmarks; original commissioned vector reconstructions. No generic “medieval apothecary” stock passed off as archival evidence.

Animation stack: Blender (material/space), Manim (reaction/decision diagrams), Inkscape/SVG (Arabic calligraphy and archival layers), FFmpeg (assembly and mastering). Motion must explain the argument, not decorate it.

## Next films
- Airway reopening: use original flow-chamber geometry and cited epithelial injury data; distinguish air–liquid interface motion from cell injury endpoints.
- Zebrafish cilia: only paper-matched microscopy; avoid unrelated zebrafish footage masquerading as experimental evidence.
- Dexamethasone niosomes: distinguish proposed formulation behavior from experimentally measured size, entrapment and aerosol deposition; do not fabricate numbers.
- ACE2: use separate membrane-bound/soluble molecular schematics and clinical cohort evidence, never reuse unrelated pulmonary images.

## Production inventory still required
Locate actual video URLs, existing MP4 masters, scripts, source figures, captions, and earlier replacement candidates before rendering or deployment. This document is a production specification, not a claim that films have been remade.
