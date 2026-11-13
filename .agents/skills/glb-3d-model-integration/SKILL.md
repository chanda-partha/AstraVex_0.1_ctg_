---
name: glb-3d-model-integration
description: >-
  Use this skill when adding, replacing, normalizing, animating, or wiring 3D GLB/GLTF
  models (rovers, landers, satellites, astronauts, rockets, planets) and interactive 3D
  hardware hotspots in AstraVex.
---

# 3D GLB/GLTF Model Integration Skill

This skill defines the standard pipeline for integrating `.glb` models into AstraVex (`client/public/models/`, `GLBPlanet.tsx`, `Rover3DModel.tsx`, `SpaceStationISS3D.tsx`, `StarshipHLS3D.tsx`).

## 1. Available 3D Models in `client/public/models/`

- **Planets & Panoramas**: `earth.glb`, `earth_texture.jpg`, `mars.glb`, `moon.glb`, `perseverance_rover_mars_panorama.glb`, `extracted_pano.jpg`
- **Mars Hardware**: `perseverance.glb`, `curiosity.glb`, `ingenuity.glb`, `insight.glb`, `viking_lander.glb`, `mro.glb`
- **Lunar Hardware**: `apollo_lunar_module.glb`, `isro_chandrayyan-3_mission_lander_module_vikram.glb`, `mondfahrzeug_lunar_rover.glb`, `lunar_orbiter_lro.glb`, `lunar_ladee.glb`, `lunar_laser_comm.glb`, `lunar_base_station.glb`, `lunar_habitat.glb`, `rocket_saturn_v.glb`, `tripo_astronaut_2_stylized_and_animated.glb`
- **Deep Space & Orbital**: `jwst.glb`, `hubble.glb`, `iss.glb`, `voyager.glb`

## 2. Step-by-Step Model Normalization Pattern

Raw `.glb` files exported from Blender/Sketchfab/NASA 3D Resources have inconsistent scales, off-center pivots, and stray cameras/lights. Always normalize them inside `useMemo`:

```tsx
const { scene, animations } = useGLTF(modelPath, '/draco/');

const normalizedGroup = useMemo(() => {
  // Use SkeletonUtils.clone(scene) if the model has SkinnedMesh / skeletal animations!
  const cloned = isSkinned ? cloneSkeleton(scene) : scene.clone(true);

  // 1. Strip embedded Cameras and Lights that corrupt Box3 calculations
  const toRemove: THREE.Object3D[] = [];
  cloned.traverse((node) => {
    if (node.type.includes('Camera') || node.type.includes('Light') || node.name === 'Camera') {
      toRemove.push(node);
    }
  });
  toRemove.forEach((n) => n.parent?.remove(n));

  // 2. Compute Box3 across meshes and center at (0, 0, 0) with grounded Y-base if surface hardware
  const box = new THREE.Box3();
  cloned.traverse((node) => {
    if ((node as THREE.Mesh).isMesh) {
      box.expandByObject(node);
      const mesh = node as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => {
        if (m instanceof THREE.MeshStandardMaterial && m.map) {
          m.map.colorSpace = THREE.SRGBColorSpace;
          m.map.needsUpdate = true;
        }
      });
    }
  });

  const wrapper = new THREE.Group();
  if (!box.isEmpty()) {
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);
    // Center X/Z and place bottom of bounding box on Y = 0 for surface rovers/landers
    cloned.position.set(-center.x, -box.min.y, -center.z);
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      const scale = targetSize / maxDim;
      wrapper.scale.setScalar(scale);
    }
  }
  wrapper.add(cloned);
  return wrapper;
}, [scene, targetSize, isSkinned]);
```

## 3. Adding Interactive 3D Hardware Hotspots & Exploded Views

1. **Subsystem Telemetry Registration**:
   - Add the instrument's metadata (`name`, `code`, `category`, `wavelength`, `power`, `mass`, `dimensions`, `scientificFunction`, `status`, `primaryTarget`) to `NASA_SUBSYSTEM_DATABASE` in `client/src/components/3d/Rover3DModel.tsx`.
2. **3D Pin & `<Html>` Callout**:
   - Anchor hotspots in 3D space relative to the normalized model group.
   - Support `explodedFactor` (`0` assembled to `1` exploded) by offsetting sub-meshes or hotspot coordinates outward along their radial normal vector (`basePos.clone().addScaledVector(normalDir, explodedFactor * distance)`).
   - Call `soundFx.playClick()` and `onSelectHotspot?.(hotspotId)` on click, using `e.stopPropagation()` on 3D mesh clicks so orbit controls or background handlers do not misfire.
3. **Sync With Backend & Client Fallbacks**:
   - Ensure the `hardware.id` matches entries in `server/services/nasaRegistry.js`, `server/services/nasaDataResolver.js` (`getCuratedNasaImages`), and `client/src/utils/nasaDataFallback.ts`.

## 4. Verification Steps

1. If adding a new `.glb` file to `client/public/models/`, also copy it to `production/models/` if updating the standalone production folder, and add it to `requiredModels` in `tests/verify_nasa_fallbacks.test.js`.
2. Run `node tests/verify_nasa_fallbacks.test.js` and `npm --prefix client run build`.

