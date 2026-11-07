# Al-Ruweidi AI Video Studio

A separate, code-driven motion design workspace for scientific explainers and polished educational videos. This folder does **not** replace or modify the personal website.

## Main engine

- [Remotion](https://github.com/remotion-dev/remotion): React video compositions, timeline animation and MP4 output.
- [Official Remotion Agent Skills](https://github.com/remotion-dev/skills): AI-assisted design, captions, studio, rendering and composition practices.
- [FFmpeg](https://ffmpeg.org/): final encoding and audio/video finishing.

The first example, **MolecularTransport**, is a 15-second 1920×1080, 30-fps scientific motion graphic. It uses no stock footage, external fonts, or API keys. It has no audio.

## Quick start

From the \`video-studio\` folder:

\`\`\`bash
npm install
npx remotion skills add
npm run dev
\`\`\`

Run \`npm run render\` to export \`out/molecular-transport.mp4\`, or \`npm run still\` to export a PNG preview. Run \`npm run typecheck\` before rendering.

**Important:** A GitHub commit makes the source code available; it does not install these tools on ChatGPT's servers or on your PC. Install and render in Node.js 22+ on your computer or with a configured GitHub Actions runner.

## Optional specialized tools

These are separate software projects, not dependencies installed by \`npm install\`.

| Tool | Repository | Purpose |
| --- | --- | --- |
| Manim | https://github.com/ManimCommunity/manim | Math, biomedical mechanisms and precise technical sequences |
| Motion Canvas | https://github.com/motion-canvas/motion-canvas | TypeScript-driven diagrams, timelines, scientific animations |
| WhisperX | https://github.com/m-bain/whisperX | Transcription and aligned captions |
| FFmpeg | https://github.com/FFmpeg/FFmpeg | Cutting, muxing, audio, encoding |

To use Manim or WhisperX, install each in its own **Python virtual environment**. They have heavyweight dependencies and should not be mixed indiscriminately. For Motion Canvas, create a separate project using \`npm init @motion-canvas@latest\`. Use those tools to export assets into Remotion, then assemble and render there. See [OPTIONAL_TOOLS.md](OPTIONAL_TOOLS.md).

## Art direction

Read [AGENTS.md](AGENTS.md) before generating or editing video. Every iteration should render a still, check the typography and composition, inspect transition frames, and then render the complete MP4. Avoid unreviewed template effects and slideshow-style layouts.

## Output and hosting

Keep generated MP4 files in \`video-studio/out/\` locally, not in the website repository. The included Action can export an MP4 as a GitHub Actions artifact when activated. Do not commit confidential footage or credentials. Check each upstream project's license before commercial use.
