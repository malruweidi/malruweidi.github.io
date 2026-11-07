# AI video direction: Al-Ruweidi Motion Lab

Always treat the output as a professional designed film, not an automated slide deck.

## Production standard
- Build compositions in Remotion. Run `npx remotion skills add` and consult the installed official Remotion skills before generating new scenes.
- Work from a storyboard and clear timing. Each shot must have one visual focal point.
- Typography: deliberate hierarchy, consistent tracking, readable sizes. No arbitrary drop shadows or bouncing text.
- Motion: prefer subtle spring movement, masked reveals, continuous paths, expressive easing. Avoid decorative effects without narrative purpose.
- Scientific precision: visual mechanisms must correspond to defensible physical or biological processes. Label speculative diagrams as conceptual.
- Avoid copyrighted logos, footage, music, or proprietary images without licensed rights.
- Build first with compositional placeholders, then replace with genuine visual assets when appropriate.
- Render stills at the opening, every major scene, each scene transition, and the closing frame. Review text overflow, collisions, timing, and contrast.
- Inspect the MP4 after rendering; correct issues in code rather than accepting the first render.
- Preserve all source files and keep exports out of Git.
- Never run arbitrary third-party agent scripts, hooks, or installers without reviewing their code.

## Camera, visuals and sound
- Deliverable default: 1920×1080, 30 fps, H.264 MP4, CRF 18; alternative vertical format as needed.
- Short explanatory film: 12–45 seconds. Keep cuts meaningful and visually coherent.
- Prefer custom diagrams / scientific illustrations over generic stock photography.
- Audio narration, music, and captions are separate optional layers; do not pretend they are present when no audio was provided.
- Check scientific terminology and causal relationships before publishing.

## Tool routing
1. Remotion + Agent Skills: production composition and export.
2. Motion Canvas: if dense timeline-based schematics or precise animated diagrams are needed; export and composite.
3. Manim: mathematical/quantitative visuals; export and composite.
4. WhisperX: speech transcription and timestamp alignment; requires audio and separate Python setup.
5. FFmpeg: finishing, muxing, normalization, and quality checks.

## Acceptance
Before delivering a video, verify (a) file exists, (b) correct frame dimensions, fps and duration, (c) no missing text or assets, (d) transitions inspected, and (e) audio claims match the output. If runtime rendering is unavailable, say the source is ready but unrendered.
