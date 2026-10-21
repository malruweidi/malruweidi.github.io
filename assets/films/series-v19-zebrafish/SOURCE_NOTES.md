# Film 11 | A Heartbeat in High-Speed Frames — evidence, reconstruction and rights ledger

**Film:** 11 of 35, `assets/films/series-v19-zebrafish`. **Current stage:** review master; no public-site deployment.

## Grounding in published primary research

Benslimane, F. M.; Zakaria, Z. Z.; Shurbaji, S.; Al-Ruweidi, M. K. A. A. (published as Mahmoud Khatib Ali Abdelrasool); Al-Badr, M. A. H. I.; Al-Absi, E. S. K.; Yalcin, H. C. *Cardiac function and blood flow hemodynamics assessment of zebrafish (Danio rerio) using high-speed video microscopy.* **Micron** **136** (2020), 102876. DOI: https://doi.org/10.1016/j.micron.2020.102876 . PMID 32512409. Primary references: https://pubmed.ncbi.nlm.nih.gov/32512409/ and https://www.sciencedirect.com/science/article/pii/S0968432820301256 .

The 2020 methods report **10-second** high-speed microscope recordings of zebrafish younger than five days post-fertilization, with **representative experiments at three dpf**. MicroZebraLab and ImageJ are tools in the analytical workflow. The authors discuss cardiac and hemodynamic measurement; this is not a randomized treatment, a human diagnostic study or a validation of a new consumer device. The film shows no invented blood-cell speed, measured cardiac output, shear stress, statistical error or measurement values.

## Archival visual provenance and license boundary

- `assets/home-archive/figure-zebrafish-microscopy.jpg`: the figure previously included on the owner's research website with an annotated PCV/DA channel and analysis software screenshots. It is displayed **entirely** and never redrawn as a new trace. This is an existing archival published-paper visual, **not proof of cleared reuse rights for a new downloadable film**. The publisher's figure-reproduction rights need checking before a public merge or distribution.
- `assets/zebrafish-larva-microscopy.webp` and `assets/zebrafish-embryo-microscopy.webp`: previously archived contextual photographs. Neither is automatically identified as a specific specimen from the 2020 published experimental dataset. Both are captioned as archive context, not paper primary imaging.
- The owner's original short zebrafish films embedded on `moving-evidence.html` are **not silently passed off** as this paper's 2020 measurements. Their specimen/video linkage would need independent verification before integration.

## Artistic reconstruction

Six scenes at 14 seconds each: (1) moving schematic heart and blood vessel, (2) context larva plus kinetically evolving temporal filmstrip, (3) unaltered paper methods figure, (4) conceptual continuous versus sampled waveform, (5) changing illustrative vessel cross-section and moving blood cells with a clearly labelled archival embryo, (6) research figure and anatomy-driven motion that lists physiological measurements.

The beating-heart frequency in the graphics is **arbitrary editorial motion**, not measured experimental BPM; the diagram geometry is not a claim about real two-chamber dimensions or vascular flow. Moving waveforms are **not** digitizations of the paper's actual reported traces. No synthetic ultrasonography or micrometric measurement is presented as actual laboratory data.

## Production checks and open release gates

- Preserve existing **84-second original research narration** from `assets/films/series-v7-pilots/zebrafish-hemodynamics.mp4` and its **12-cue WebVTT**.
- Compose via locally deterministic frame=f(time) Canvas2D, Chromium/Playwright, FFmpeg H.264/AAC at 1920×1080/24fps (2,016 frames); an original locally synthesized low-key score with post-loudnorm peak limiting.
- Automatic verification: scientific string and archive checks, six moving/random-access frame tests, output H264/AAC 1080p 24fps and duration, 1 fps **video-only** temporal hashes, original caption count, picture source SHA hashes, true-peak ceiling no louder than −1 dBTP and site-integrity audit.
- Human full-film viewing and listening, scientific visual legibility on mobile, exact archival copyrights, ethical attribution, and reviewer/owner artistic sign-off remain **necessary**. Motion hashes do not certify world-class cinematography.

**Distribution:** PR stays draft. No live website changes, no previous master replacement. Wait for explicit permission before Film 12.
