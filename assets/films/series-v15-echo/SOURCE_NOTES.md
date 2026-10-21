# Film 07 — Temporal Echocardiography: research evidence and design ledger

**Production:** `assets/films/series-v15-echo` / draft review PR #73 / film 07 of 35.

## Verified paper and figures

Rahman, T.; Al-Ruweidi, M. K. A. A.; Sumon, M. S. I.; Kamal, R. Y.; Chowdhury, M. E. H.; Yalcin, H. C. “Deep Learning Technique for Congenital Heart Disease Detection Using Stacking-Based CNN-LSTM Models From Fetal Echocardiogram: A Pilot Study.” *IEEE Access* **2023**, 11, 110375–110390. DOI: https://doi.org/10.1109/ACCESS.2023.3316719. Indexed open-access license: CC BY 4.0.

The manuscript describes 13 cardiac-defect subjects and 9 controls. The published **subject-wise** stacking CNN–LSTM classification reported 91.0% accuracy, contrasted with CNN–LSTM alternatives. The film displays **the paper's published summary number only**; it does not reconstruct a confusion matrix, ROC curve, full network, original fetal scan, ultrasound data, calibrated ECG signal or newly produced patient-level result. The original paper, not this illustration, is the authority for the performance comparisons.

A 22-subject pilot is not evidence of calibration, external validation, safety, generalizable prevalence-specific predictive value, regulatory clearance or stand-alone prenatal clinical diagnosis. The film explicitly frames it as an exploratory research result.

## Photographic and graphical provenance

- `assets/research-archive-2026/echocardiography-spectral-doppler-workstation.webp`: context photograph only. It must not be represented as an identifiable source fetal echocardiogram, an image extracted from the training set, or evidence of a model prediction.
- Every moving ultrasound-sector frame is custom numerical vector art labelled **SCHEMATIC — NOT PATIENT ULTRASOUND**, including a deliberately geometric pulsing chamber outline and illustrative scanning line. No invented patient or measured anatomy.
- Temporal frame icons, CNN features, LSTM memory states, stacking arrows and module activations are model **explanatory graphics**, not exact architecture, coefficients, extracted embeddings or original paper figures.
- Pilot results section: only **13 CHD subjects, 9 controls and 91% subject-wise model accuracy** are displayed; those figures come from the paper. Patient icons carry no identifying data.
- A visual “clinician remains” motif indicates interpretive and validation needs, not deployed clinical software or demonstrated individual benefit.

## Film production and release conditions

- Six script-timed 84-second chapters, 2,016 individual Full-HD frames, 24 fps, seekable frame=f(time) Canvas2D render using local Chromium/Playwright and FFmpeg.
- Native old audio narration and original aligned VTT captions retained; self-synthesized low-volume score, no paid templates or royalty-demanding stock footage.
- Verify H.264/AAC, duration, captions, independent video-only temporal change, EBU R128 loudness and SHA-256.
- Automatic technical tests cannot certify aesthetic excellence, medical interpretive accuracy, or perceived narration sound. Full human screening, substantive scholarly review and portrait/image-source rights review required before public release.
- No live website routes, masters or historical assets are to be overwritten. Wait for explicit next-film instruction before starting Film 08.
