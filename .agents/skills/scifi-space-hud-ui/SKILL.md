---
name: scifi-space-hud-ui
description: >-
  Use this skill when designing, building, or upgrading AstraVex's Sci-Fi Mission
  Control HUD overlays, glassmorphic modals, telemetry bars, draggable floating panels
  (ElonAssistant), skeleton loaders, audio/TTS controls, or responsive Tailwind + Framer
  Motion UI components.
---

# Sci-Fi Space HUD & Interactive UI Skill

This skill governs all frontend UI/UX overlays, navigation, modals, skeletons, and audio/voice controls layered over AstraVex's 3D WebGL canvas.

## 1. Key UI & HUD Files in AstraVex

- **Global Navigation & Telemetry**: `client/src/components/navigation/Navbar.tsx`
- **ELON AI Flight Director HUD**: `client/src/elon/ElonAssistant.tsx`, `ElonAssistant.css`, `ElonVoice.ts`, `ElonConversation.ts`
- **Mission Modals & Drawers**:
  - `client/src/components/hardware/HardwareInspectModal.tsx`
  - `client/src/components/ai/AIStoryModal.tsx`
  - `client/src/components/ai/AIChatbotDrawer.tsx`
  - `client/src/components/quiz/AIQuizModal.tsx`
  - `client/src/components/data/NasaDataRegistryModal.tsx`
  - `client/src/components/simulators/ScienceSimulatorsModal.tsx`
- **Zero-CLS Skeletons**: `client/src/components/skeleton/` (`ScreenSkeleton`, `StoryModalSkeleton`, `QuizModalSkeleton`, `HardwareInspectSkeleton`, `DataRegistrySkeleton`)
- **Design Tokens & Styles**: `client/src/index.css`, `client/tailwind.config.js`

## 2. WebGL + DOM Pointer-Event Architecture

Never block 3D `<Canvas>` orbit/zoom or hotspot raycasting with invisible full-screen `div` containers:
- `<Canvas>` wrapper: `fixed inset-0 z-0`
- Full-screen HUD layout container: `relative z-10 pointer-events-none`
- Interactive HUD panels, buttons, drawers, and modals: explicitly add `pointer-events-auto`

## 3. Sci-Fi HUD Design System ("Glass & Telemetry")

1. **Panel Surfaces**:
   - Primary HUD container: `bg-slate-950/80 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] rounded-2xl`
   - Mars accent theme: warm amber/orange (`border-orange-500/40 text-orange-300 bg-orange-950/30`)
   - Moon accent theme: lunar cyan/silver (`border-cyan-400/40 text-cyan-200 bg-slate-900/60`)
   - Critical alerts (Solar Flare / Low HP): `border-red-500/50 bg-red-950/40 text-red-300`
2. **Typography Hierarchy**:
   - Numeric telemetry, coordinates, Sol/mission timers, and subsystem codes: `font-mono uppercase tracking-widest text-xs`
   - Educational stories, mission descriptions, and quiz questions: clean readable sans-serif (`text-slate-100 leading-relaxed`) with high WCAG contrast against dark backdrops.
3. **Draggable Floating Panels (`ElonAssistant.tsx`)**:
   - Always guard pointer-down handlers with `if (target.closest('button, input, textarea, a, select')) return;` so child controls remain clickable.
   - Clamp `nextX` and `nextY` within `[12, window.innerWidth - rect.width - 12]` and `[12, window.innerHeight - rect.height - 12]` so panels can never be dragged off-screen.

## 4. Audio, Voice & Accessibility Integration

- Trigger subtle UI feedback via `soundFx` (`playClick()`, `playChime()`, `playSuccess()`, `playWarning()`).
- Coordinate `audioManager` (`client/src/audio/AudioManager.ts` — `astravex_cinematic_music.wav`) with `elonVoice` (`window.speechSynthesis`) so spoken narration remains clear.
- Always provide visible Play/Pause/Stop/Mute controls for both background music and TTS voice narration.
- Respect `prefers-reduced-motion` and ensure all modal dialogs support `Escape` to close and clear focus states.

## 5. Verification Steps

1. Run `node tests/verify_elon_cinematic.test.js` (18/18 checks) and `node tests/verify_nasa_fallbacks.test.js` (42/42 checks).
2. Run `npm --prefix client run build` to verify zero TypeScript or CSS build errors.

