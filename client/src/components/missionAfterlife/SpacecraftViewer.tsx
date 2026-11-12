import React, { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ContactShadowPlane } from '../3d/ContactShadowPlane';

interface SpacecraftViewerProps {
  missionId: string;
  hardwareModelPath?: string;
  isMars?: boolean;
  autoRotate?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. GENERIC GLB SPACECRAFT LOADER (for Apollo LM, LRV, Viking 1)
// ═══════════════════════════════════════════════════════════════════════════
function LoadedGLBSpacecraft({
  modelPath,
  targetRadius = 2.2,
  isMars = false,
  autoRotate = false,
}: {
  modelPath: string;
  targetRadius?: number;
  isMars?: boolean;
  autoRotate?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(modelPath, '/draco/');

  const normalizedScene = useMemo(() => {
    const cloned = scene.clone(true);

    // Compute exact bounding box across valid meshes
    const box = new THREE.Box3();
    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        box.expandByObject(child);
      }
    });

    const wrapper = new THREE.Group();
    if (!box.isEmpty()) {
      const center = new THREE.Vector3();
      box.getCenter(center);

      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);

      const scaleFactor = targetRadius / (maxDim || 1);
      cloned.scale.set(scaleFactor, scaleFactor, scaleFactor);

      // Align so the lowest point rests exactly on the surface (y = 0)
      cloned.position.set(
        -center.x * scaleFactor,
        -box.min.y * scaleFactor,
        -center.z * scaleFactor
      );
    }
    wrapper.add(cloned);

    // Material enhancement: enable shadows and high-fidelity PBR
    wrapper.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => {
            m.side = THREE.DoubleSide;
            if (m instanceof THREE.MeshStandardMaterial && m.map) {
              m.map.colorSpace = THREE.SRGBColorSpace;
              m.map.needsUpdate = true;
            }
          });
        }
      }
    });

    return wrapper;
  }, [scene, targetRadius]);

  useFrame((_, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={normalizedScene} />
      <ContactShadowPlane opacity={0.7} radius={targetRadius * 1.4} isMars={isMars} />
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. DETAILED MER-CLASS ROVER PROCEDURAL MODEL (For Spirit & Opportunity)
// Built accurately according to NASA MER specifications:
// - Triangular solar panel deck
// - Pancam mast assembly (PMA)
// - Rocker-bogie 6-wheel suspension
// - Alpha Particle X-ray Spectrometer / Instrument Deployment Device (IDD) arm
// - High-gain antenna dish
// ═══════════════════════════════════════════════════════════════════════════
function ProceduralMERRover({
  name,
  autoRotate = false,
}: {
  name: string;
  autoRotate?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Central Chassis Warm Gold-Foil / Aluminum Body */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.35, 1.3]} />
        <meshStandardMaterial
          color="#d4af37"
          roughness={0.35}
          metalness={0.8}
        />
      </mesh>

      {/* Solar Panel Triangular Deck (Blue/Black crystalline silicon cells) */}
      <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.04, 1.6]} />
        <meshStandardMaterial
          color="#1e3a5f"
          roughness={0.25}
          metalness={0.9}
        />
      </mesh>

      {/* Solar Panel Wing Extensions (Left and Right) */}
      <mesh position={[-1.0, 0.64, 0]} rotation={[0, 0, 0.05]} castShadow>
        <boxGeometry args={[0.5, 0.03, 1.2]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.25} metalness={0.9} />
      </mesh>
      <mesh position={[1.0, 0.64, 0]} rotation={[0, 0, -0.05]} castShadow>
        <boxGeometry args={[0.5, 0.03, 1.2]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.25} metalness={0.9} />
      </mesh>

      {/* Pancam Mast Assembly (PMA) */}
      <group position={[0.3, 0.65, 0.45]}>
        {/* Vertical Mast Pole */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.035, 1.0, 16]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.4} metalness={0.7} />
        </mesh>
        {/* Pancam Stereo Camera Bar */}
        <mesh position={[0, 1.02, 0]} castShadow>
          <boxGeometry args={[0.26, 0.08, 0.09]} />
          <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.6} />
        </mesh>
        {/* Twin Camera Lenses */}
        <mesh position={[-0.09, 1.02, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.04, 16]} />
          <meshStandardMaterial color="#0284c7" roughness={0.1} metalness={0.9} />
        </mesh>
        <mesh position={[0.09, 1.02, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.04, 16]} />
          <meshStandardMaterial color="#0284c7" roughness={0.1} metalness={0.9} />
        </mesh>
      </group>

      {/* High-Gain Steerable Antenna Dish */}
      <group position={[-0.35, 0.75, -0.4]}>
        <mesh rotation={[0.4, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.02, 24]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.5} />
        </mesh>
      </group>

      {/* Low-Gain Omni Antenna Mast */}
      <mesh position={[-0.45, 0.95, 0.4]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.6, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} />
      </mesh>

      {/* Robotic Arm (Instrument Deployment Device - IDD) */}
      <group position={[0, 0.42, 0.7]}>
        <mesh position={[0, -0.05, 0.15]} rotation={[0.5, 0, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.35, 12]} />
          <meshStandardMaterial color="#64748b" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Sensor Turret Head */}
        <mesh position={[0, -0.22, 0.28]} castShadow>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.7} />
        </mesh>
      </group>

      {/* Rocker-Bogie 6-Wheel Mobility System */}
      {/* Left 3 wheels */}
      {[-0.65, 0, 0.65].map((zPos, idx) => (
        <group key={`wheel-left-${idx}`} position={[-0.72, 0.18, zPos]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
            <cylinderGeometry args={[0.18, 0.18, 0.12, 24]} />
            <meshStandardMaterial
              color="#1e293b"
              roughness={0.85}
              metalness={0.3}
            />
          </mesh>
          {/* Wheel hub cap */}
          <mesh position={[-0.065, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.07, 0.07, 0.02, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Right 3 wheels */}
      {[-0.65, 0, 0.65].map((zPos, idx) => (
        <group key={`wheel-right-${idx}`} position={[0.72, 0.18, zPos]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
            <cylinderGeometry args={[0.18, 0.18, 0.12, 24]} />
            <meshStandardMaterial
              color="#1e293b"
              roughness={0.85}
              metalness={0.3}
            />
          </mesh>
          <mesh position={[0.065, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.07, 0.07, 0.02, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Suspension Struts */}
      <mesh position={[-0.62, 0.32, 0]} rotation={[0, 0, 0.4]} castShadow>
        <boxGeometry args={[0.04, 0.28, 1.2]} />
        <meshStandardMaterial color="#475569" metalness={0.7} />
      </mesh>
      <mesh position={[0.62, 0.32, 0]} rotation={[0, 0, -0.4]} castShadow>
        <boxGeometry args={[0.04, 0.28, 1.2]} />
        <meshStandardMaterial color="#475569" metalness={0.7} />
      </mesh>

      {/* Soft Ground Contact Shadow */}
      <ContactShadowPlane opacity={0.75} radius={2.2} isMars={true} />
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. MAIN SPACECRAFT VIEWER ROUTER
// ═══════════════════════════════════════════════════════════════════════════
export const SpacecraftViewer: React.FC<SpacecraftViewerProps> = ({
  missionId,
  hardwareModelPath,
  isMars = false,
  autoRotate = false,
}) => {
  // Check if mission is Spirit or Opportunity (use procedural MER model)
  if (missionId === 'spirit' || missionId === 'opportunity') {
    return (
      <ProceduralMERRover
        name={missionId === 'spirit' ? 'Spirit (MER-A)' : 'Opportunity (MER-B)'}
        autoRotate={autoRotate}
      />
    );
  }

  // If a valid GLB path is defined, load it
  if (hardwareModelPath) {
    const targetRadius =
      missionId === 'apollo15' ? 2.5 : missionId === 'viking1' ? 2.0 : 2.4;

    return (
      <Suspense fallback={null}>
        <LoadedGLBSpacecraft
          modelPath={hardwareModelPath}
          targetRadius={targetRadius}
          isMars={isMars}
          autoRotate={autoRotate}
        />
      </Suspense>
    );
  }

  // Fallback if none defined
  return null;
};

export default SpacecraftViewer;

