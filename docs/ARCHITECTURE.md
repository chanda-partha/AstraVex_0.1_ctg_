# NASA Mission Explorer — System Architecture

**Official Educational Platform for NASA Space Apps Challenge 2026**  
**Team Astravex**

---

## 1. Architectural Philosophy

NASA Mission Explorer is structured around clean separation of concerns, defensive resilience, and 60 FPS WebGL rendering performance:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        USER PRESENTATION LAYER                         │
│  React 18 + Three.js / @react-three/fiber + Tailwind CSS + Lucide      │
├────────────────────────────────────────────────────────────────────────┤
│ • Pages / Screens (SpaceHome, Destination, EarthLaunch, Landing, World)│
│ • Reusable Components (3D Models, HUD Overlays, Modals, Simulators)    │
│ • Custom Skeletons (Zero-CLS Layout Placeholders, Reduced-Motion Safe) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                       SERVICES & RESILIENCE LAYER                      │
├────────────────────────────────────────────────────────────────────────┤
│ • In-Memory LRU Cache with 5-minute TTL                                │
│ • Request Deduplication (prevents redundant in-flight network queries) │
│ • AbortController Integration (cancels superseded/unmounted requests) │
│ • Client-Side Fallback Engine (guaranteed operation without server)    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST
┌───────────────────────────────────▼────────────────────────────────────┐
│                       EXPRESS RUNTIME BACKEND                          │
├────────────────────────────────────────────────────────────────────────┤
│ • /api/health           Health check, uptime, and engine status        │
│ • /api/nasa/resolve     NASA Open Data registry & Mars photos proxy    │
│ • /api/ai/story         Gemini AI educational dossier generator        │
│ • /api/ai/quiz          Interactive mission scenario evaluator         │
│ • /api/ai/chat          Context-aware planetary flight assistant       │
│ • Unified Mode          Serves production SPA bundle + SPA 404 fallback│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory & File Organization

The project follows strict modular separation:

```text
nasa_challange2026/
├── client/                     # Frontend Application
│   ├── public/                 # Static Assets Served at Root
│   │   ├── draco/              # Draco 3D Geometry Decompressor
│   │   ├── models/             # Verified 3D GLB Models (24 items)
│   │   ├── sounds/             # Procedural & Recorded Audio (7 items)
│   │   ├── videos/             # Historical Mission Video Archives (4 items)
│   │   └── astravex_logo.png   # Team & Mission Control Crest
│   ├── src/                    # Source Code
│   │   ├── components/         # Reusable UI Components
│   │   │   ├── 3d/             # 3D Canvas Elements (GLBPlanet, Rover3DModel, etc.)
│   │   │   ├── ai/             # AI Story Modal & Flight Director Chatbot
│   │   │   ├── common/         # Image Display with Skeleton & Badging
│   │   │   ├── data/           # NASA Open Data Registry Modal
│   │   │   ├── hardware/       # Hardware Inspector Modal
│   │   │   ├── navigation/     # Global HUD Navbar & Telemetry Bar
│   │   │   ├── quiz/           # Flight Specialist Quiz Modal
│   │   │   ├── simulators/     # Science Simulators Modal (Laser, LRRR, Thermal)
│   │   │   └── skeleton/       # Bespoke Skeleton Loading Screens
│   │   ├── pages/              # Primary Journey Screens / Routes
│   │   │   ├── SpaceHomePage.tsx
│   │   │   ├── DestinationPage.tsx
│   │   │   ├── EarthLaunchPage.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   └── ExplorationPage.tsx
│   │   ├── services/           # API Client, Caching & Deduplication (api.ts)
│   │   ├── types/              # Comprehensive TypeScript Interfaces
│   │   ├── utils/              # Sound Engine, Textures & Client Fallbacks
│   │   ├── App.tsx             # Root Application State & Lazy Route Loading
│   │   ├── index.css           # Design Tokens, Glassmorphism, Accessibility
│   │   └── main.tsx            # React 18 Root Hydration
│   ├── package.json            # Client Dependencies & Scripts
│   ├── tsconfig.json           # TypeScript Compiler Options
│   └── vite.config.ts          # Rollup Code Splitting & Manual Chunks
├── server/                     # Express Backend Runtime
│   ├── routes/                 # API Routes (nasa.js, ai.js)
│   ├── services/               # Registry, Resolver & Gemini Services
│   ├── server.js               # Unified Server Entry with SPA Fallback
│   └── package.json            # Server Dependencies & Scripts
├── tests/                      # Automated Test Suite
│   └── verify_nasa_fallbacks.test.js
├── scripts/                    # Development Asset Utility Scripts
│   └── generate_sounds.js      # Procedural Audio Synthesizer
├── docs/                       # Architecture, API & Deployment Documentation
│   ├── ARCHITECTURE.md
│   ├── API_REFERENCE.md
│   └── DEPLOYMENT_GUIDE.md
├── production/                 # Standalone Upload-Ready Hosting Package
│   ├── index.html              # Minified HTML Entry
│   ├── assets/                 # Code-Split JS & CSS Chunks
│   ├── draco/                  # Draco Decoders
│   ├── models/                 # Clean 3D Models
│   ├── sounds/                 # Telemetry Audio
│   ├── videos/                 # Mission Videos
│   ├── _redirects              # Netlify / Cloudflare SPA Fallback
│   ├── vercel.json             # Vercel SPA Routing Configuration
│   ├── nginx.conf              # Nginx Production Configuration
│   └── 404.html                # GitHub Pages / S3 SPA Fallback
├── package.json                # Root Monorepo Orchestration Scripts
└── README.md                   # Project Overview & Quickstart
```

---

## 3. Loading Lifecycle & Skeleton Architecture

Every asynchronous screen and modal implements a complete 8-stage lifecycle:

1. **Initial Loading**: Displays layout-accurate skeletons matching exact dimensions (e.g. `StoryModalSkeleton`, `QuizModalSkeleton`, `HardwareInspectSkeleton`).
2. **Loaded**: Transitions smoothly with CSS crossfade to real data.
3. **Empty**: Provides clear explanations when queries yield no items.
4. **Error**: User-friendly diagnostic messages avoiding raw stack traces.
5. **Retry**: One-click telemetry reconnection button.
6. **Partial Loading**: Independent background sync (e.g., telemetry pulse while keeping 3D world interactive).
7. **Refreshing**: Non-blocking indicator badge.
8. **Disabled Actions**: Feedback on buttons to prevent double-submission.

### Layout Shift (CLS) Prevention
- Images use reserved aspect ratio containers (`aspect-video`, `aspect-square`).
- Modals define fixed max-width and min-height bounds.
- 3D canvasses initialize with `<ScreenSkeleton />` to eliminate content jumps.
