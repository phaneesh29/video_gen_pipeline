# Vidling Technical Explainer Video Pipeline — Developer & User Guide

Welcome to the **Vidling Video Generation Pipeline**, an automated system that turns technical topics, Computer Science concepts, and System Design architectures into Excalidraw-style animated explainer videos.

The pipeline combines **Mistral Codestral** (structured storyboard generation), **Mistral Voxtral** (expressive neural text-to-speech), **Remotion + RoughJS** (hand-drawn whiteboard animation), and **FFmpeg** (fast bumper stitching and broadcast audio mastering).

---

## Table of Contents
1. [Pipeline Architecture](#1-pipeline-architecture)
2. [Prerequisites & Installation](#2-prerequisites--installation)
3. [Configuration & Environment Variables](#3-configuration--environment-variables)
4. [CLI Usage & Commands](#4-cli-usage--commands)
5. [The 4-Stage Execution Flow](#5-the-4-stage-execution-flow)
6. [Expressive Shapes & Visual System](#6-expressive-shapes--visual-system)
7. [Visual Diversity Archetypes](#7-visual-diversity-archetypes)
8. [Branding & Bumper Screens](#8-branding--bumper-screens)
9. [Project File Structure](#9-project-file-structure)
10. [Troubleshooting & Best Practices](#10-troubleshooting--best-practices)

---

## 1. Pipeline Architecture

```
[ Problem Input / Topic ] (e.g. problem.txt or inline prompt)
           │
           ▼
┌────────────────────────────────────────────────────────┐
│ Stage 1: Storyboard Generation (Codestral-Latest)     │
│ - Strict Zod JSON Schema                               │
│ - 7 to 8 scenes with TTS-friendly narration            │
│ - Visual layout: shapes, arrays, tables, or code lines │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Stage 2: Audio Synthesis (Voxtral-Mini-TTS-2603)      │
│ - Expressive speech generation (Paul voice)            │
│ - Dynamic expressions: confident, excited, cheerful    │
│ - Exact duration extraction & 30 FPS frame sync        │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Stage 3: Canvas Rendering (Remotion + RoughJS)         │
│ - Webpack bundling via @remotion/bundler               │
│ - Headless Chromium render via @remotion/renderer      │
│ - Hand-drawn sketchy shapes, nodes & arrows            │
│ - Ambient dark grid, glow spotlight, and soundwave bar │
│ - Persistent top-left Vidling logo watermark           │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Stage 4: FFmpeg Master Audio & Bumper Stitching        │
│ - Dynamic loudness normalization (loudnorm + dynaudnorm)│
│ - Looped Start Bumper (0.8s) with stereo silence pad   │
│ - Looped End Subscribe Bumper (3.0s) with silence pad  │
│ - Concatenation in ~1.5s without re-rendering Chromium │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
[ Final Video in ./output/ ] (e.g. topic_vertical.mp4)
```

---

## 2. Prerequisites & Installation

### Requirements
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **FFmpeg**: Bundled automatically via `@ffmpeg-installer/ffmpeg` (no external installation required)
- **Mistral AI API Key**: Required for Codestral (LLM) and Voxtral (TTS)

### Installation
Clone or navigate to the project directory and install dependencies:
```bash
cd D:\local_llm\video_gen_pipeline
npm install
```

---

## 3. Configuration & Environment Variables

Create a `.env` file in the project root (see `.env.example`):

```ini
# Mistral AI API Key (Required)
MISTRAL_API_KEY=your_actual_mistral_api_key_here

# LLM & Voice Models
MISTRAL_MODEL=codestral-latest
VOXTRAL_MODEL=voxtral-mini-tts-2603

# Video Configuration
VIDEO_FPS=30
VIDEO_WIDTH=1920
VIDEO_HEIGHT=1080
OUTPUT_DIR=./output
```

All environment variables are strictly validated at startup using Zod in `src/config.js`.

---

## 4. CLI Usage & Commands

The pipeline entrypoint is `src/cli.js`.

### 1. Render from `problem.txt` in 9:16 Vertical (Shorts / Reels)
```bash
node src/cli.js problem.txt --vertical
# or short flag:
node src/cli.js problem.txt -v
```

### 2. Render from `problem.txt` in 16:9 Landscape (YouTube)
```bash
node src/cli.js problem.txt
```

### 3. Render from an Inline Prompt String
```bash
node src/cli.js "How WebSockets Work" -v
node src/cli.js "How Consistent Hashing Works in Distributed Databases" -v
```

### 4. Default Fallback
Running without arguments defaults to reading `problem.txt`:
```bash
node src/cli.js
```

---

## 5. The 4-Stage Execution Flow

### Stage 1: Storyboard Generation (`src/llmEngine.js`, `src/instructions.js`)
- Sends the problem input with `DSA_SYSTEM_PROMPT` to Mistral Codestral using `client.chat.parse`.
- Uses `temperature: 0.25` to maintain high visual consistency while avoiding repetitive 2-box diagrams.
- Maps acronyms with letter spacing for TTS clarity (`"S F U"`, `"C D N"`, `"4 K"`, `"A V 1"`, `"H T T P"`).
- Automatically syncs code lines and active line numbers when coding solutions are rendered.

### Stage 2: Audio Synthesis (`src/audioPipeline.js`, `src/ttsEngine.js`)
- Iterates through all scenes and calls `generateSpeech()` with Voxtral TTS.
- Voice expression mapping (`confident`, `excited`, `cheerful`, `happy`, `neutral`, `frustrated`).
- Parses audio duration using `music-metadata`, adds a 12-frame hold buffer, and converts seconds to exact video frames at 30 FPS (`durationInFrames`).

### Stage 2.5: Image & Tech Logo Resolution (`src/imageFetcher.js`)
- Scans all diagram nodes across all scenes in parallel.
- **Official Tech Brands (`isTech: true`)**: Direct vector SVGs from **Simple Icons CDN** (`https://cdn.simpleicons.org/{slug}`) in official brand colors (Redis, Apache Kafka, PostgreSQL, Docker, AWS, Netflix, etc.).
- **Physical Devices & Objects (`isTech: false`)**: Web images and transparent clipart from **DuckDuckGo Image Search** using `imagePrompt` via high-speed Bing CDN.
- Caches assets in `./temp/image_cache/` (<3ms retrieval) and converts to Base64 data URIs for instantaneous, zero-latency Remotion rendering.
- Seamless fallback to Lucide icons (`DynamicIcon.jsx`) if remote image is unavailable.

### Stage 3: Canvas Rendering (`src/videoRenderer.js`, `src/video/`)
- Bundles `src/video/index.jsx` into a temporary Webpack build.
- Embeds the base64 `assets/logo.png` directly into props.
- Chromium renders each frame to H.264 video.
- Slices each scene neatly into Remotion `<Series.Sequence>`.

### Stage 4: FFmpeg Audio Muxing & Bumper Stitching (`src/ffmpegHelper.js`)
- Concatenates scene audio files and runs two-stage normalization:
  - `dynaudnorm`: smooths volume spikes across scenes.
  - `loudnorm`: standardizes broadcast loudness to `-11 LUFS` (YouTube / Shorts standard).
- **Zero-Chromium Bumper Stitching**:
  - `introSec = 0.8s`: loops `start_9_16.png` with stereo silence.
  - `mainVideo`: Remotion content video + normalized master audio.
  - `outroSec = 3.0s`: loops `end_9_16.png` with stereo silence.
  - Combined in ~1.5s using FFmpeg `filter_complex concat`.

---

## 6. Expressive Shapes & Visual System

Instead of rendering plain rectangle boxes everywhere, nodes support dedicated parametric architecture shapes:

| Shape | Visual Geometry | Best Used For |
| :--- | :--- | :--- |
| **`rectangle`** | Clean rounded card (RoughJS rect) | Clients, User Apps, API Gateways, Standard Servers |
| **`cylinder`** | 3D storage can (elliptical lid + bottom arc) | Databases, Redis, Cassandra, Blob Storage, Memory |
| **`cloud`** | Bubbly organic cloud perimeter | Global CDNs, Edge Servers, Internet, External APIs |
| **`diamond`** | 4-vertex angled rhombus | Conditionals, Decision Gates, DRM Checks, Auth Verifiers |
| **`hexagon`** | 6-sided geometric service card | Background Workers, Transcoding Fleets, ML Inference |
| **`funnel`** | Inverted tapered trapezoid | Candidate Generation, Search Retrieval, Filtering |
| **`container`** | Dashed enclosure box with tag pill | Grouping multiple workers (e.g. `[ NETFLIX ENCODING CLUSTER ]`) |

### How to use in `problem.txt`:
Codestral assigns shapes automatically based on component role, or you can guide it directly:
```text
Core Architecture Components:
- Client App: 4K Smart TVs (rectangle)
- DRM Gate: License verification (diamond)
- Transcoding Fleet: Parallel AV1/HEVC workers (hexagon) inside a cluster container
- State Store: Cassandra user database (cylinder)
- Open Connect: Edge caching servers (cloud) inside local ISPs
```

---

## 7. Visual Diversity Archetypes

The pipeline enforces strict visual diversity across scenes:

### Archetype 1: Array of Chunks / Slices (`elements`)
When explaining chunking, packets, or sequential data structures:
- Uses `elements` with 4 to 6 items.
- Highlights active chunk with glowing orange border and animated `▲ Uploading` pointer.
- Leaves `nodes` and `edges` empty.

### Archetype 2: 1-to-Many Worker Fan-Out (`nodes` + `edges`)
When explaining parallel microservices or worker fleets:
- Source node fans out to 3 distinct worker nodes.
- Uses `hexagon` or `cylinder` shapes.
- Surrounds them with a `containerLabel` enclosure.

### Archetype 3: Comparison & Metrics Table (`entries`)
When comparing trade-offs, algorithms, or codec performance:
- Uses `entries` with 3 to 4 key-value cards.
- Full 860px wide horizontal banners with prominent bold metrics.

### Archetype 4: Multi-Tier Architecture Pipeline
When explaining end-to-end data flow:
- 3 to 4 connected nodes with Lucide icons.
- Auto-calculated boundary offsets (`getBoundaryOffset`) ensure arrows dock exactly at the perimeter of diamonds, cylinders, and clouds.
- Bidirectional highway separation (170px+ apart) and staggered labels prevent edge collisions.

### Archetype 5: On-Demand Floating Code Snippets (`codeSnippet`)
When explaining API routes, SQL queries, Redis commands, or configurations:
- Leaves canvas 100% full-screen for architecture diagrams without permanent split-screen clutter.
- A floating macOS-style code card (`FloatingCodeSnippet.jsx`) springs into view for that specific scene only.
- Features window controls (🔴 🟡 🟢), language pill badge (`SQL`, `TYPESCRIPT`, `BASH`, `DOCKER`), line numbers, neon glowing borders, and syntax highlighting.
- Gracefully slides away when the scene ends!

---

## 8. Branding & Bumper Screens

All brand identity files live in the `./assets/` directory:

| Asset | Dimensions | Role | How It's Rendered |
| :--- | :--- | :--- | :--- |
| `assets/logo.png` | 512×512 (Square) | Persistent watermark badge | Overlaid at top-left inside Remotion |
| `assets/start_9_16.png` | 1080×1920 (Vertical) | Intro title card | Stitched in FFmpeg (0.8s) |
| `assets/start_16_9.png` | 1920×1080 (Landscape)| Intro title card | Stitched in FFmpeg (0.8s) |
| `assets/end_9_16.png` | 1080×1920 (Vertical) | Outro / Subscribe CTA | Stitched in FFmpeg (3.0s) |
| `assets/end_16_9.png` | 1920×1080 (Landscape)| Outro / Subscribe CTA | Stitched in FFmpeg (3.0s) |

### Why Bumper Screens are Stitched in FFmpeg:
Rendering 0.8s intro (24 frames) + 3.0s outro (90 frames) of static images in Remotion forces Chromium to snapshot 114 redundant frames. Stitching them via FFmpeg reduces video render time by **30% to 40%**.

---

## 9. Project File Structure

```
video_gen_pipeline/
├── assets/                       # High-resolution brand assets
│   ├── logo.png                  # Glowing orange "V" monogram watermark
│   ├── start_9_16.png            # 9:16 Intro screen (Vidling)
│   ├── start_16_9.png            # 16:9 Intro screen (Vidling)
│   ├── end_9_16.png              # 9:16 Outro subscribe card
│   └── end_16_9.png              # 16:9 Outro subscribe card
├── output/                       # Destination folder for rendered MP4 files
├── src/
│   ├── audioPipeline.js          # Voxtral TTS orchestrator & duration calculator
│   ├── cli.js                    # CLI runner (Commander)
│   ├── client.js                 # Mistral client initialization
│   ├── config.js                 # Zod environment variable parser
│   ├── ffmpegHelper.js           # FFmpeg master audio, loudness norm & bumper stitcher
│   ├── imageFetcher.js           # Parallel logo (Simple Icons) & web image (DDG) resolver
│   ├── instructions.js           # Codestral system prompt & visual archetype directives
│   ├── llmEngine.js              # Codestral chat completion & storyboard parser
│   ├── schema.js                 # Zod schemas for storyboards, shapes, nodes, & edges
│   ├── ttsEngine.js              # Mistral Voxtral speech generation
│   ├── videoRenderer.js          # Remotion bundler & Chromium media renderer
│   └── video/                    # Remotion React components
│       ├── AmbientBackground.jsx # Animated spotlight, whiteboard grid & dust particles
│       ├── CodeEditor.jsx        # Syntax-highlighted code editor with line marker
│       ├── DynamicIcon.jsx       # Lucide icon resolver with keyword fallbacks
│       ├── ExplainerVideo.jsx    # Main composition container with logo watermark
│       ├── FloatingCodeSnippet.jsx # Sleek floating terminal overlay card with syntax tokenizer
│       ├── fonts.js              # Google Fonts (Plus Jakarta Sans, Outfit, JetBrains Mono)
│       ├── index.jsx             # Remotion root entrypoint
│       ├── Root.jsx              # Remotion Root composition declaration
│       ├── RoughShapes.jsx       # RoughJS generators: cylinder, diamond, hex, cloud, container
│       ├── Subtitles.jsx         # Bottom subtitle banner with animated soundwave bars
│       └── WhiteboardCanvas.jsx  # Graph layout engine, collision router & card views
├── .env                          # Local environment variables
├── .env.example                  # Template environment variables
├── README.md                     # Pipeline documentation & architectural reference
├── package.json                  # Dependencies & scripts
└── problem.txt                   # Input file for the current video topic
```

---

## 10. Troubleshooting & Best Practices

### Visual Sizing & Legibility
- **Rule:** *"Don't make fonts small, make shapes big."*
- Card nodes maintain a minimum width of **420px** and height of **160px–220px** in 9:16 vertical mode.
- Labels are styled with `whiteSpace: "nowrap"` so text never awkwardly wraps into multiple lines.

### TTS Acronyms
- Always format technical acronyms with single spaces between letters:
  - Write `"C D N"` instead of `"CDN"`.
  - Write `"D R M"` instead of `"DRM"`.
  - Write `"A V 1"` instead of `"AV1"`.
  - Write `"4 K"` instead of `"4K"`.
  - This forces Voxtral to pronounce each letter clearly rather than guessing words.

### Duration & Shorts Constraint
- YouTube Shorts and Instagram Reels strictly enforce a maximum duration of **60 seconds**.
- Keep `problem.txt` scenes between **7 to 8 scenes**, with **1 to 2 spoken sentences (14–22 words)** per scene.
- With 0.8s intro and 3.0s outro, a 55s narration content comfortably yields a **58.8s** final video.

### Cleaning Temporary Files
The pipeline automatically disposes of `./temp` after every successful render. If a run is manually aborted, you can safely remove `./temp` at any time:
```powershell
Remove-Item -Recurse -Force ./temp
```
