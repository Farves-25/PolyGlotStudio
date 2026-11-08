# 🌍 PolyGlotStudio — Advanced Multi-Language Acquisition Operating System

> An enterprise-grade, human-crafted language learning and linguistic analysis platform built with modern **Angular (Standalone Architecture, Signals, Web APIs)** and **Tailwind CSS**. Designed as a senior frontend engineer portfolio showcase demonstrating real-time audio visualization, algorithmic speech verification, spaced repetition scheduling, and cloud database integration.

---

## 📸 Key Capabilities & Architectural Highlights

### 1. 🎙️ Real-Time Acoustic Studio & Speech Verifier
- **Live Canvas Audio Visualizers**: Features dual visualization modes rendered on HTML5 2D Canvas with sub-pixel HiDPI scaling:
  - *Time-Domain Oscilloscope Waveform*: Smooth interpolated stroke showing microphone dynamics.
  - *48-Band FFT Spectrum Analyzer*: Real-time frequency bars with dynamic peak decay and volume metrics.
- **Levenshtein Accuracy Engine**: Computes normalized string distance between recognized transcriptions (via Web Speech API) and phonological targets, providing word-by-word diff alignment (Match vs Mismatch).
- **Native vs User Recording Playback**: Uses the browser's `MediaRecorder` API to capture and replay user speech alongside native text-to-speech audio for side-by-side pronunciation analysis.

### 2. 🧠 SuperMemo SM-2 Spaced Repetition Engine
- Implements the mathematical SuperMemo SM-2 algorithm:
  $$\text{easeFactor}' = \text{easeFactor} + (0.1 - (5 - \text{rating}) \times (0.08 + (5 - \text{rating}) \times 0.02))$$
  $$\text{interval} = \begin{cases} 1 & \text{reps} = 0 \\ 6 & \text{reps} = 1 \\ \text{interval} \times \text{easeFactor} & \text{reps} > 1 \end{cases}$$
- 3D perspective flip cards with hardware acceleration (`transform-style: preserve-3d`).
- Automatic synchronization with Supabase Postgres table `user_srs_progress` with instant fallback to encrypted local browser cache.

### 3. 🧩 Interactive Syntax Dissector & Grammar Sandbox
- Constituent part-of-speech color highlighting (Subjects, Predicates, Particles, Modifiers).
- Scramble-puzzle sentence assembly drill with procedural audio feedback.
- Dynamic verb conjugation generator across tenses (Present, Past/Preterite, Future) highlighting stems vs inflections.
- Syntactic case matrix visualizer for Nominative, Accusative, Dative, and Genitive roles.

### 4. 🔬 Acoustic Phonetics & Minimal Pairs Lab
- International Phonetic Alphabet (IPA) interactive soundboard with native accents.
- Minimal pair acoustic discrimination challenges (e.g. Spanish flap *pero* vs trill *perro*, German *Kirsche* vs *Kirche*, Japanese *ojisan* vs *ojiisan*, Arabic *qalb* vs *kalb*).

### 5. 🎭 AI Contextual Roleplay Arena
- Scenario simulator with native conversational AI personas.
- Real-time cultural tips, grammar suggestions, and speech synthesis.
- Built-in bidirectional support for Right-to-Left (RTL) scripts such as Arabic (`dir="rtl"`) alongside LTR languages.

### 6. 🎨 Human-Crafted Dual Theme (Light & Dark)
- Designed intentionally without AI clichés (no oversaturated neon borders or generic emoji cards).
- Built on a refined neutral zinc/slate palette inspired by Linear, Raycast, and Apple:
  - **Light Mode**: Crisp white surfaces (`#ffffff`), soft slate borders (`#e2e8f0`), deep slate typography (`#0f172a`).
  - **Dark Mode**: Obsidian surfaces (`#11131a`), subtle dividers (`#27272a`), crisp zinc typography (`#f8fafc`).
- Seamless toggle in top navigation and keyboard shortcut via the **Command Palette (`Ctrl + K`)**.

---

## 🛠️ Tech Stack & Engineering Standards

- **Framework**: Angular 19+ (Standalone Components, Signals, Reactive Inputs & Outputs, Zoneless-compatible patterns)
- **Styling**: Tailwind CSS v4, CSS Variables, PostCSS
- **State & Signals**: Angular Signals (`signal`, `computed`, `effect`) for reactive state management
- **Audio & Media**: Web Audio API (`AudioContext`, `AnalyserNode`), Web Speech Recognition, Web Speech Synthesis, `MediaRecorder`
- **Backend / Cloud**: Supabase (PostgreSQL, Row-Level Security, Realtime) with offline failover
- **Testing**: Vitest for high-speed algorithmic and unit verification
- **Keyboard Access**: Global command spotlight (`Ctrl + K` / `Cmd + K`)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm 9+

### Installation & Development
```bash
# Clone repository
git clone https://github.com/your-username/polyglotstudio.git
cd polyglotstudio

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm start
```
Navigate to `http://localhost:4200/` in your browser.

### Production Build
```bash
npm run build
```
Compiled production assets will be generated in `dist/PolyGlotStudio`.

### Running Tests
```bash
npx vitest run
```

---

## 🗄️ Supabase Cloud Database Integration

PolyGlotStudio can connect directly to any Supabase project or operate offline in standalone demo mode:

1. Open **Settings** or click the **Supabase** status pill in the top header.
2. Enter your **Supabase Project URL** and **Anon Key** (or reuse existing project credentials like `RetroSync`).
3. Click **"Copy Complete SQL Schema"** and run it in the Supabase SQL Editor to provision:
   - `languages`: Seeded metadata for Spanish, German, Japanese, Arabic, French, and Tamil.
   - `lessons`: CEFR-graded unit milestones (A1 through C1).
   - `exercises`: Multi-modal learning tasks.
   - `user_srs_progress`: Spaced repetition intervals and ease factors with Row-Level Security (RLS).
   - `roleplay_sessions`: Turn-by-turn conversational histories.

---

## 📐 Architecture Directory

```
src/
├── app/
│   ├── app.ts                  # Root application shell with responsive layout
│   ├── app.routes.ts           # 8 production route configurations
│   ├── core/
│   │   ├── components/         # Header, Sidebar, Command Palette (Ctrl+K)
│   │   ├── models/             # Language, Lesson, Exercise, SRS models
│   │   └── services/           # SpeechAnalyzer, TextToSpeech, SRSEngine,
│   │                           # LanguageService, AudioSfx, SupabaseService, ThemeService
│   ├── features/
│   │   ├── dashboard/          # Mastery radar, 84-day heatmap, quick tiles
│   │   ├── curriculum/         # Duolingo-style interactive skill tree
│   │   ├── lesson-studio/      # Voice Match, Syntax Dissector, SRS Card, AI Roleplay
│   │   ├── vocabulary/         # Vocabulary Vault, POS filters, deck exporter
│   │   ├── phonetics/          # Minimal pairs lab & IPA sound matrix
│   │   ├── grammar/            # Verb conjugation engine & case matrix
│   │   ├── roleplay/           # Contextual dialogue scenario hub
│   │   ├── leaderboard/        # Diamond League rankings & promotion zones
│   │   └── settings/           # Studio preferences, Supabase config, SFX
│   └── shared/
│       └── directives/         # RtlDirectionDirective for Arabic/complex scripts
```

---

## 📄 License
MIT © Farves — Built as a flagship portfolio showcase.
