# Optional animation and transcript tools

Remotion is the production engine. The following remain **optional separate toolchains**. Do not bundle third-party repositories or install them automatically.

## Manim

Source: https://github.com/ManimCommunity/manim

Install in a dedicated Python environment, after installing the Manim system dependencies specified in the official documentation.

\`\`\`bash
python -m venv .venv-manim
source .venv-manim/bin/activate  # On Windows: .venv-manim\Scripts\activate
python -m pip install manim
manim --version
\`\`\`

Export a scene as a transparent video or PNG sequence and import it into Remotion.

## Motion Canvas

Source: https://github.com/motion-canvas/motion-canvas

Create a **separate** TypeScript project. It is not a Remotion plugin.

\`\`\`bash
npm init @motion-canvas@latest
\`\`\`

Animate diagrams in Motion Canvas, export video/frames and incorporate those assets into a Remotion edit.

## WhisperX

Source: https://github.com/m-bain/whisperX

Install in a **different** virtual environment. Note that models, CUDA, PyTorch and audio dependencies can be large.

\`\`\`bash
python -m venv .venv-whisperx
source .venv-whisperx/bin/activate  # Windows: .venv-whisperx\Scripts\activate
python -m pip install whisperx
whisperx --help
\`\`\`

Validate generated transcripts and timing manually, particularly technical terms, biomedical nomenclature and names. For GPU acceleration, follow the upstream hardware-specific instructions.

## FFmpeg

Source: https://github.com/FFmpeg/FFmpeg

Install from the official project or an OS package manager. Example inspection:

\`\`\`bash
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate -of json out/molecular-transport.mp4
\`\`\`

## Agent skills

Source: https://github.com/remotion-dev/skills

The official Remotion CLI installs agent instructions in your local workspace.

\`\`\`bash
npx remotion skills add
\`\`\`

**Security and licensing:** Review scripts, permissions, upstream licenses, and supply-chain implications before running tools against sensitive research data. Do not commit model caches, confidential footage or audio.
