# AstraVex (NASA Mission Explorer) — Agentic Engineering Guidelines

These workspace rules govern all code changes, 3D scene upgrades, model integrations, UI/HUD enhancements, and backend/AI modifications in **AstraVex**.

---

## 1. Core Architecture & 5-Stage Mission Flow

- **Strict Journey State Machine (`ScreenType` in `client/src/App.tsx`)**:
  `home` (`SpaceHomePage`) → `destination` (`DestinationPage`) → `launch` (`EarthLaunchPage`) → `landing` (`LandingPage`) → `exploration` (`ExplorationPage`).
- **Dual Destination Support (`DestinationType`)**:
  Every feature must support both `'Mars'` (default mission: `perseverance`, hardware: `supercam`) and `'Moon'` (default mission: `apollo11`, hardware: `eagle-descent-stage`), plus orbital/deep-space hardware where applicable.
- **Stateless & Privacy-Safe Architecture (Enforced by Automated Tests)**:
  Never add user authentication (`firebase/auth`), account creation (`createUserWithEmailAndPassword`), or `password` fields anywhere in `client/src/App.tsx` or child components (`tests/verify_elon_cinematic.test.js` asserts this). Visitor names in `ElonAssistant` are strictly ephemeral session state.

---

## 2. Three.js & React Three Fiber (`@react-three/fiber` / `@react-three/drei`) Rules

1. **Zero React State Updates Inside `useFrame`**:
   - Never call `useState` setters inside `useFrame`. Calling `setState` at 60–120 Hz triggers React reconciliation every frame and causes severe frame drops.
   - Always mutate Three.js object refs imperatively (`groupRef.current.rotation.y += delta * speed`).
2. **Frame-Rate Independence (`delta`)**:
   - Multiply all per-frame translations, rotations, and lerps by `delta` (clamped if needed, e.g. `Math.min(delta, 0.1)`) so animations run at identical speeds on 60 Hz, 120 Hz, and 144 Hz displays.
3. **Zero Heap Allocations Inside `useFrame`**:
   - Never instantiate `new THREE.Vector3()`, `new THREE.Color()`, `new THREE.Quaternion()`, or `new THREE.Matrix4()` inside `useFrame`. Allocate scratch vectors once in `useMemo` or module scope and reuse them.
4. **Canvas Resilience & DPR Clamping**:
   - Always wrap `<Canvas>` views in `<CanvasErrorBoundary>` (`client/src/components/common/CanvasErrorBoundary.tsx`) and `<Suspense>`.
   - Clamp device pixel ratio (`dpr={[1, 2]}`) and use `THREE.ACESFilmicToneMapping` where appropriate to prevent GPU overload on high-DPI displays.
5. **GPU Memory & Disposal**:
   - Reuse textures and materials at module scope or via `useMemo` (see `cachedEarthTexture` in `GLBPlanet.tsx`).
   - When creating imperative geometries, materials, or render targets, dispose of them in a `useEffect` cleanup return function.

---

## 3. 3D GLB/GLTF Model Integration Rules

1. **Local Draco Decoder**:
   - Always load `.glb` assets from `/models/<filename>.glb` using `useGLTF(modelPath, '/draco/')` so offline/local Draco WASM decoding (`client/public/draco/`) is used.
2. **Scene Cloning (`scene.clone` vs `SkeletonUtils.clone`)**:
   - For static rigid-body models (planets, rovers, satellites), clone inside `useMemo`: `const cloned = useMemo(() => scene.clone(true), [scene])`.
   - For rigged/skinned or animated models (e.g., `tripo_astronaut_2_stylized_and_animated.glb`), always clone using `clone as cloneSkeleton` from `three/examples/jsm/utils/SkeletonUtils.js` and bind animations with `useAnimations(animations, groupRef)`.
3. **Bounding-Box Normalization & Origin Centering**:
   - Strip embedded `Camera` and `Light` nodes from cloned GLTF scenes before computing `new THREE.Box3().expandByObject(...)`.
   - Center the model at `(0, 0, 0)` (`c.position.set(-center.x, -center.y, -center.z)`) and normalize scale (`targetRadius / actualRadius`) so swapped models fit identically in the camera frustum.
4. **PBR Materials & Color Space**:
   - Ensure diffuse/albedo maps on `THREE.MeshStandardMaterial` use `THREE.SRGBColorSpace` and `needsUpdate = true`.
   - Configure `castShadow` and `receiveShadow` via `.traverse()` and pair surface models with `<ContactShadowPlane />`.
5. **Interactive 3D Hotspots**:
   - Use `@react-three/drei` `<Html>` for 3D-anchored subsystem markers in `Rover3DModel.tsx`.
   - Register new scientific instruments in `NASA_SUBSYSTEM_DATABASE` (`Rover3DModel.tsx`), `server/services/nasaRegistry.js`, and `client/src/utils/nasaDataFallback.ts`.

---

## 4. Sci-Fi Space HUD & UI/UX Rules

1. **WebGL + DOM Layering Discipline**:
   - Keep the 3D `<Canvas>` container at `z-0`.
   - Keep full-screen HUD layout wrappers `pointer-events-none` so orbit/pan/zoom and 3D hotspot raycasting pass through to the `<Canvas>`.
   - Apply `pointer-events-auto` strictly to interactive HUD cards, buttons, modals, and drawers.
2. **Glassmorphic Tactical Aesthetics**:
   - Use high-contrast dark glass panels (`bg-slate-950/75 backdrop-blur-md border border-cyan-500/30` or mission-specific amber/red accents), tactical monospace readouts for telemetry (`font-mono`), and clean sans-serif typography for educational narratives.
3. **Draggable HUD Panels (`ElonAssistant`)**:
   - Preserve pointer capture (`setPointerCapture` / `releasePointerCapture`), viewport boundary clamping (`12px` margin from `window.innerWidth` / `window.innerHeight`), and interactive-element drag exclusions (`target.closest('button, input, textarea, a, select')`).
4. **8-Stage Loading Lifecycle & Zero-CLS Skeletons**:
   - Every lazy-loaded route or modal must render its matching skeleton (`ScreenSkeleton`, `StoryModalSkeleton`, `QuizModalSkeleton`, `HardwareInspectSkeleton`, `DataRegistrySkeleton`) during loading and provide graceful fallback states.
5. **Audio & Accessibility**:
   - Coordinate UI sound effects (`soundFx` in `client/src/utils/soundEffects.ts`), background music (`audioManager` in `client/src/audio/AudioManager.ts`), and Web Speech synthesis (`elonVoice` in `client/src/elon/ElonVoice.ts`) so voice narration automatically ducks or respects mute controls.
   - Maintain keyboard accessibility and respect `prefers-reduced-motion`.

---

## 5. Mandatory Verification Before Completing Any Task

Before finishing any code change or upgrade, run all three checks from `F:\astravex`:

1. `node tests/verify_nasa_fallbacks.test.js` (must pass 42/42 checks)
2. `node tests/verify_elon_cinematic.test.js` (must pass 18/18 checks)
3. `npm --prefix client run build` (`tsc && vite build` must succeed with 0 errors)

