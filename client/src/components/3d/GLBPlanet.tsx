import React, { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export interface GLBPlanetProps {
  modelPath: string;
  targetRadius: number;
  rotationSpeed?: number;
  isHovered?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

// Global cached Earth texture
let cachedEarthTexture: THREE.Texture | null = null;
function getEarthTexture(): THREE.Texture {
  if (!cachedEarthTexture) {
    const loader = new THREE.TextureLoader();
    cachedEarthTexture = loader.load('/models/earth_texture.jpg');
    cachedEarthTexture.colorSpace = THREE.SRGBColorSpace;
  }
  return cachedEarthTexture;
}

// Inner component that loads and normalizes GLTF models
function GLBModelInner({
  modelPath,
  targetRadius,
  rotationSpeed = 0.06,
  isHovered = false,
  castShadow = false,
  receiveShadow = false,
}: GLBPlanetProps) {
  const groupRef = useRef<THREE.Group>(null);
  // useGLTF with local Draco decoder
  const { scene } = useGLTF(modelPath, '/draco/');
  const isEarth = modelPath.toLowerCase().includes('earth');
  const isMars = modelPath.toLowerCase().includes('mars');

  // Auto-center and normalize scale to exact targetRadius using mesh dimensions
  const cloned = useMemo(() => {
    const c = scene.clone(true);

    // Remove any cameras, lights, or helper objects that could distort bounding boxes
    const nonMeshObjects: THREE.Object3D[] = [];
    c.traverse((node) => {
      if (node.type.includes('Camera') || node.type.includes('Light') || node.name === 'Camera') {
        nonMeshObjects.push(node);
      }
    });
    nonMeshObjects.forEach((obj) => obj.parent && obj.parent.remove(obj));

    // Compute bounding box strictly across valid meshes
    const box = new THREE.Box3();
    let hasMesh = false;
    c.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        box.expandByObject(node);
        hasMesh = true;
      }
    });

    const wrapper = new THREE.Group();
    if (hasMesh && !box.isEmpty()) {
      // Align center exactly to origin (0, 0, 0)
      const center = new THREE.Vector3();
      box.getCenter(center);
      c.position.set(-center.x, -center.y, -center.z);

      // Compute actual maximum radius along primary axes
      const size = new THREE.Vector3();
      box.getSize(size);
      const actualRadius = Math.max(size.x, size.y, size.z) / 2;

      if (actualRadius > 0) {
        const scaleFactor = targetRadius / actualRadius;
        wrapper.scale.set(scaleFactor, scaleFactor, scaleFactor);
      }
    }
    wrapper.add(c);

    // Traverse and configure materials and shadows
    c.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        mesh.castShadow = castShadow;
        mesh.receiveShadow = receiveShadow;

        if (isEarth) {
          // Unconditionally bind high-res 4K NASA Blue Marble texture
          const earthTex = getEarthTexture();
          mesh.material = new THREE.MeshStandardMaterial({
            map: earthTex,
            roughness: 0.55,
            metalness: 0.08,
            color: new THREE.Color('#ffffff'),
            side: THREE.FrontSide,
          });
        } else if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => {
            m.side = THREE.DoubleSide;
            m.depthWrite = true;

            if (m instanceof THREE.MeshStandardMaterial && m.map) {
              m.map.colorSpace = THREE.SRGBColorSpace;
              m.map.needsUpdate = true;
            }
            m.needsUpdate = true;
          });
        }
      }
    });

    return wrapper;
  }, [scene, targetRadius, modelPath, isEarth, castShadow, receiveShadow]);

  // Smooth 60fps axial rotation animation
  useFrame((_, delta) => {
    if (groupRef.current && rotationSpeed !== 0) {
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={cloned} />
    </group>
  );
}

// Fallback procedural sphere while GLB asset streams in
function PlanetFallback({
  targetRadius,
  color,
  rotationSpeed = 0.05,
}: {
  targetRadius: number;
  color: string;
  rotationSpeed?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current && rotationSpeed !== 0) ref.current.rotation.y += delta * rotationSpeed;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[targetRadius, 48, 48]} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  );
}

export function GLBPlanet({
  modelPath,
  targetRadius,
  rotationSpeed = 0.06,
  fallbackColor = '#475569',
  isHovered = false,
  castShadow = false,
  receiveShadow = false,
}: GLBPlanetProps & { fallbackColor?: string }) {
  return (
    <Suspense
      fallback={
        <PlanetFallback
          targetRadius={targetRadius}
          color={fallbackColor}
          rotationSpeed={rotationSpeed}
        />
      }
    >
      <GLBModelInner
        modelPath={modelPath}
        targetRadius={targetRadius}
        rotationSpeed={rotationSpeed}
        isHovered={isHovered}
        castShadow={castShadow}
        receiveShadow={receiveShadow}
      />
    </Suspense>
  );
}

// Preload the GLB assets with draco
useGLTF.preload('/models/earth.glb', '/draco/');
useGLTF.preload('/models/mars.glb', '/draco/');
useGLTF.preload('/models/moon.glb', '/draco/');
