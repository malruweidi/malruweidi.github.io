# Ruwaidix editorial standard

## Voice

Write as a scientist and participant describing what happened. Use specific experiences, instruments, people, experiments and results instead of a running explanation of the site's editorial decisions. An ordinary friendship photo needs a factual caption, not a moral about what a chemist's archive ought to contain.

Use natural, cohesive paragraphs. Avoid generic AI-like antitheses, defensive self-notes, miniature manifestos, repetitive rhetorical disclaimers, forced three-part cadences, melodramatic one-line paragraphs and conclusions that tell visitors what to feel. Do not write in a museum-curator voice or refer to the author as "the archive owner" in first-person narratives. Use concise captions for incidental photographs.

## Attribution and evidence

Never invent people, research roles, findings, institutions, chronology, dates or conclusions. Preserve detailed, critical explanations where an experimental outcome, mechanistic hypothesis, medicine, historical source or patient observation needs them. Precision is stronger than repeated caveats.

Keep exposure-date uncertainty, original file names, photo-library post dates, photo identification and editorial processing in the preserved provenance JSON files and editorial ledger. Put optional source documentation in accessible disclosures instead of beneath each everyday photograph. Keep direct publication links at the relevant research mention.

When an image depicts uncertain chemistry, do not guess its compound. When a material experiment failed, say what actually separated or could not be measured. For ongoing research, distinguish completed measurements from proposed studies. Document contributions to collaborative work carefully.

## Bilingual and preservation

English and Arabic must each read like natural prose while retaining equivalent facts. Revise dictionary keys/translations whenever a caption or page text changes.

Never sacrifice existing media, research, figures, story chapters, historical documents, captions' factual content, provenance, sources or navigation paths merely for aesthetic refinement. Maintain previous revisions in Git.

Stories collection chapters and their corresponding standalone pages (`stories/*.html`) must have **identical full chapter content**; update both together to pass the deep-reading consistency test. Verify JS syntax, accessible media and language controls. Never claim Pages deployment succeeded until a workflow shows success.

## Editing test

Ask whether a researcher who was there could say these sentences aloud naturally. If the text merely tells readers why an image is not a journal article, rewrite it. If it describes a scientific limitation that genuinely affects a claim, retain it at that precise claim and cite the relevant evidence.

## Reader-facing publication boundary

Do not put agent instructions, editorial checklists, source-inventory file names, staging notes, release-version comparisons, build metadata, unresolved upload statuses, synthetic-image prompts, provenance-worksheet fields, or declarations that content was not deleted into public HTML, visible captions or video frames. These are repository-maintenance materials and belong in project documentation and version control. The public website should show the scientific or personal story and direct bibliographic references, not the production process.

For photographs with no reliably established date, describe the place, object or event without inventing a year or displaying a `date unverified` flag. Use a date in prose only when its status is materially important to the historical claim, and explain it naturally. Do not replace factual uncertainty with fabricated certainty. Caption text injected by JS is part of the public website, and the equivalent Arabic must be corrected in the same change.

On films, display the current playable edition, its running time, a concise research context and primary paper links. Keep previous cuts, scene manifests, transcripts, technical provenance and other editorial editions in the repository unless specifically needed as reader-facing scholarly evidence. The site must never turn a source archive into a wall of self-referential production disclaimers.
