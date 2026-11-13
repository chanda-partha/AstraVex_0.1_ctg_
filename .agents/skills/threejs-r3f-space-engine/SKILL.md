---
name: threejs-r3f-space-engine
description: >-
  Use this skill whenever creating, debugging, optimizing, or upgrading Three.js and
  React Three Fiber (@react-three/fiber / @react-three/drei) 3D space scenes, planets,
  terrains, shaders, lighting, cameras, starfields, or WebGL performance in AstraVex.
---

# Three.js & React Three Fiber Space Engine Skill

This skill provides the architectural patterns and step-by-step procedures for working on AstraVex's 3D WebGL scenes (`client/src/components/3d/` and `client/src/pages/`).

## 1. Key 3D Scene Files in AstraVex

- `client/src/components/3d/SpaceHomeScene.tsx`: Orbital home scene (Earth, Moon, Mars, ISS, starfields, camera rig).
- `client/src/components/3d/DestinationScene.tsx`: Interactive 3D planetary globe selector for Moon & Mars.
- `client/src/components/3d/EarthLaunchScene.tsx`: Launch pad, Saturn V / rocket ascent, plume particles, solar flare events.
- `client/src/components/3d/LandingScene.tsx`: Atmospheric entry, parachute deployment, retro-rockets, touchdown sequence.
- `client/src/components/3d/RealisticTerrain.tsx`, `LunarRealEnvironment.tsx`, `MarsRealPanorama.tsx`: Planetary surface environments and equirectangular 360° panoramas (`/models/extracted_pano.jpg`).
- `client/src/components/3d/ContactShadowPlane.tsx`: Ground contact shadow receiver under 3D hardware.
- `client/src/components/common/CanvasErrorBoundary.tsx`: WebGL fault-tolerance boundary.

## 2. Render-Loop (`useFrame`) Engineering Rules

1. **Mutate Refs, Never React State**:
   ```tsx
   const groupRef = useRef<THREE.Group>(null);
   useFrame((_, delta) => {
     if (!groupRef.current) return;
     const dt = Math.min(delta, 0.1); // Clamp delta to prevent tab-switch jumps
     groupRef.current.rotation.y += dt * rotationSpeed;
   });
   ```
2. **Pre-allocate Math Objects Outside `useFrame`**:
   ```tsx
   const tempVec = useMemo(() => new THREE.Vector3(), []);
   const targetQuat = useMemo(() => new THREE.Quaternion(), []);
   useFrame((state, delta) => {
     if (!meshRef.current) return;
     tempVec.set(Math.sin(state.clock.elapsedTime), 0, Math.cos(state.clock.elapsedTime));
     meshRef.current.position.lerp(tempVec, Math.min(1, delta * 4));
   });
   ```
3. **Instancing for High-Count Objects (Starfields, Dust, Crater Rocks)**:
   - Use `<Instances>` / `<Instance>` from `@react-three/drei` or `THREE.InstancedMesh` whenever rendering >50 repeated geometries (asteroids, boulders, dust particles, star clusters) to keep draw calls low.

## 3. Lighting, Shadows & Tone Mapping

- Configure `<Canvas>` with `shadows` and `dpr={[1, 2]}`:
  ```tsx
  <Canvas
    shadows
    dpr={[1, 2]}
    gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}
    camera={{ position: [0, 2.5, 6], fov: 45, near: 0.1, far: 2000 }}
  >
  ```
- Combine directional sunlight (`castShadow`, `shadow-mapSize={[1024, 1024]}`, `shadow-bias={-0.0005}`), hemisphere/ambient fill light appropriate to the planetary body (warm iron-oxide fill `#d97706` on Mars; crisp high-contrast `#94a3b8` fill on the airless Moon), and `<ContactShadowPlane />`.

## 4. Camera Controls & Smooth Transitions

- When using `<OrbitControls makeDefault />`, constrain polar angles (`maxPolarAngle={Math.PI / 2 - 0.03}`) on planetary terrain scenes so the camera cannot clip underground.
- Enable damping (`enableDamping dampingFactor={0.06}`) for cinematic weight.
- When focusing on a selected 3D hardware hotspot, smoothly lerp `controls.target` and `camera.position` inside `useFrame` rather than snapping instantaneously, and allow user pointer input to cancel/override the auto-focus transition.

## 5. Verification Steps

After modifying any 3D scene component:
1. Run `npm --prefix client run build` to verify TypeScript types (`@types/three`, `@react-three/fiber`) and Rollup chunking (`vendor-three`).
2. Run `node tests/verify_nasa_fallbacks.test.js` to confirm all required 3D assets and modules remain intact.

