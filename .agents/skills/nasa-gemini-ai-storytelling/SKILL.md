---
name: nasa-gemini-ai-storytelling
description: >-
  Use this skill when adding or upgrading NASA missions, scientific hardware datasets,
  live NASA API integrations, client-side fallbacks, or Google Gemini AI storytelling,
  quiz generation, chatbot, and ELON flight director features in AstraVex.
---

# NASA Open Data & Gemini AI Storytelling Skill

This skill covers AstraVex's backend data/AI engine (`server/`) and frontend resilience/caching layer (`client/src/services/api.ts`, `client/src/utils/nasaDataFallback.ts`).

## 1. Architecture & Multi-Tier Resilience

AstraVex guarantees 100% uptime even when offline or when external API keys are rate-limited:

1. **Client Service Layer (`client/src/services/api.ts`)**:
   - Uses an in-memory LRU cache (5-minute TTL), in-flight request deduplication, and `AbortController` signal propagation.
   - Automatically falls back to `getClientFallbackPayload()` (`client/src/utils/nasaDataFallback.ts`) if the Express backend is unreachable.
2. **NASA Data Resolver (`server/services/nasaDataResolver.js` & `nasaRegistry.js`)**:
   - Queries official NASA Image & Video Library (`https://images-api.nasa.gov/search`) and appends verified direct NASA CDN imagery (`https://images-assets.nasa.gov/image/...`) so mission photography never breaks.
   - Returns complete `sourceAttribution` metadata (agency, dataset, timestamp, license, official mission URL).
3. **Gemini AI & ELON Engine (`server/services/aiService.js`)**:
   - Accepts `GEMINI_API_KEY` from `.env` or per-request `apiKey` from the UI settings drawer.
   - Multi-model fallback chain: tries `@google/generative-ai` SDK (`gemini-2.0-flash`, `gemini-1.5-flash`, `gemini-1.5-pro`), then direct REST (`generativelanguage.googleapis.com/v1beta`), and finally deterministic NASA-grounded fallbacks (`resolveMultiFieldKnowledge`, `generateStory`, `generateQuiz`, `answerElon`).

## 2. Adding a New NASA Mission or Hardware Instrument

When adding a new mission or scientific instrument:
1. **Backend Registry**: Add the mission/hardware object to `VERIFIED_NASA_MISSIONS` in `server/services/nasaRegistry.js` with verified launch/landing dates, coordinates, agency, status, purpose, `scientificContribution`, and `officialUrl`.
2. **Curated NASA Images**: Add verified `images-assets.nasa.gov` image items in `getCuratedNasaImages()` inside `server/services/nasaDataResolver.js`.
3. **Client Fallback Parity**: Mirror the mission/hardware entry in `client/src/utils/nasaDataFallback.ts` so offline/serverless mode stays in sync.
4. **3D Subsystem Telemetry**: Add the instrument's technical telemetry record to `NASA_SUBSYSTEM_DATABASE` in `client/src/components/3d/Rover3DModel.tsx`.

## 3. Upgrading ELON or Gemini Prompts

- Keep ELON responses (`answerElon` in `server/services/aiService.js`) concise (2–4 spoken-friendly sentences), addressing the visitor by `safeName` (`Commander <name>`), and strictly grounded in real NASA science.
- Preserve all 5 onboarding stages tested by `tests/verify_elon_cinematic.test.js`: `'welcome'`, `'ask_name'`, `'greeting'`, `'space_intro'`, and `'mission_brief'`.

## 4. Verification Steps

1. Run `node tests/verify_nasa_fallbacks.test.js` (42/42 checks).
2. Run `node tests/verify_elon_cinematic.test.js` (18/18 checks).
3. Run `npm --prefix client run build` (0 errors).

