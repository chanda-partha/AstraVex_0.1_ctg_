import React, { useRef, useState, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { soundFx } from '../../utils/soundEffects';

interface SpaceStationISS3DProps {
  earthCenter?: [number, number, number];
  orbitRadius?: number;
  orbitInclination?: number;
  onSelect?: () => void;
}

// 🛰️ REAL NASA ISS 3D INNER MODEL WITH PBR AEROSPACE MATERIALS & ZERO TRANSFORMATION OFFSET
function ISSModelInner({ onHover, isHovered }: { onHover: (hovered: boolean) => void; isHovered: boolean }) {
  const { scene } = useGLTF('/models/iss.glb', '/draco/');

  const clonedStation = useMemo(() => {
    const c = scene.clone(true);

    // Remove any cameras, lights, or helper objects that could distort bounds
    const toRemove: THREE.Object3D[] = [];
    c.traverse((node) => {
      if (node.type.includes('Camera') || node.type.includes('Light') || node.name === 'Camera') {
        toRemove.push(node);
      }
    });
    toRemove.forEach((obj) => obj.parent && obj.parent.remove(obj));

    // Traverse and assign authentic NASA International Space Station PBR materials
    c.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        mesh.castShadow = false;
        mesh.receiveShadow = false;

        const matName = (
          (Array.isArray(mesh.material) ? mesh.material[0]?.name : mesh.material?.name) || ''
        ).toLowerCase();

        // Authentic ISS Subsystems Classification:
        // 1. Solar Array Wings (SAW): Photovoltaic solar cell blue with specular sheen
        // 2. Soyuz / Progress Spacecraft: Dark thermal protection blankets
        // 3. Integrated Truss Structure (ITS): Structural aerospace aluminum-lithium
        // 4. Pressurized Modules (Destiny, Columbus, Kibo, Zvezda): Clean thermal white/silver
        const isSolar = matName.includes('blinn') && !matName.includes('soyuz') && !matName.includes('bended');
        const isSoyuz = matName.includes('soyuz');
        const isTruss = matName.includes('truss') || matName.includes('bended');

        const originalMats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        const newMaterials = originalMats.map(() => {
          let col = '#e2e8f0'; // Clean aerospace white module hull
          let metalness = 0.45;
          let roughness = 0.35;
          let emissive = new THREE.Color('#000000');
          let emissiveIntensity = 0.0;

          if (isSolar) {
            col = '#1e40af'; // NASA Deep Photovoltaic Solar Blue
            metalness = 0.85;
            roughness = 0.18;
            emissive = new THREE.Color('#1d4ed8');
            emissiveIntensity = 0.22;
          } else if (isSoyuz) {
            col = '#64748b'; // Soyuz orbital module slate thermal blanket
            metalness = 0.3;
            roughness = 0.55;
          } else if (isTruss) {
            col = '#94a3b8'; // Aluminum-lithium structural truss
            metalness = 0.78;
            roughness = 0.25;
          }

          return new THREE.MeshStandardMaterial({
            color: new THREE.Color(col),
            metalness,
            roughness,
            emissive,
            emissiveIntensity,
            side: THREE.DoubleSide, // Crucial: preserves thin solar array quads and truss struts
            depthWrite: true,
          });
        });

        mesh.material = Array.isArray(mesh.material) ? newMaterials : newMaterials[0];
      }
    });

    // Compute exact bounding box of the station
    const box = new THREE.Box3().setFromObject(c);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    // Offset c directly to origin (0, 0, 0)
    c.position.set(-center.x, -center.y, -center.z);

    // Wrapper group provides uniform normalization scale without shifting origin
    const wrapper = new THREE.Group();
    wrapper.add(c);

    // Target wingspan in orbital units (0.09 units provides natural, realistic Low Earth Orbit scale)
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSpan = 0.09;
    const s = targetSpan / (maxDim > 0 ? maxDim : 1);
    wrapper.scale.set(s, s, s);

    return wrapper;
  }, [scene]);

  return (
    <group>
      <primitive object={clonedStation} />
      {/* Invisible comfort hit-testing sphere for easy interaction */}
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          onHover(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  );
}

// Sleek holographic wireframe station fallback during network stream
function ISSFallback() {
  return (
    <group scale={0.2}>
      {/* Central Module Cylinder */}
      <mesh>
        <cylinderGeometry args={[0.03, 0.03, 0.2, 16]} />
        <meshBasicMaterial color="#38bdf8" wireframe />
      </mesh>
      {/* Solar Array Wings */}
      <mesh position={[0.15, 0, 0]}>
        <boxGeometry args={[0.18, 0.005, 0.12]} />
        <meshBasicMaterial color="#38bdf8" wireframe />
      </mesh>
      <mesh position={[-0.15, 0, 0]}>
        <boxGeometry args={[0.18, 0.005, 0.12]} />
        <meshBasicMaterial color="#38bdf8" wireframe />
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 🛰️ REAL NASA ISS IN LOW EARTH ORBIT (LEO) - MATHEMATICALLY SYNCHRONIZED
// ═══════════════════════════════════════════════════════════════════════════
export const SpaceStationISS3D: React.FC<SpaceStationISS3DProps> = ({
  earthCenter = [-2.5, 0.1, 0],
  orbitRadius = 2.42, // Clear altitude above Earth
  orbitInclination = 0.90, // 51.6 degrees real-world ISS inclination in radians
  onSelect,
}) => {
  const orbitGroupRef = useRef<THREE.Group>(null);
  const beaconLightRef = useRef<THREE.PointLight>(null);
  const [hovered, setHovered] = useState(false);
  const [pinnedOpen, setPinnedOpen] = useState(false);

  // Dynamic continuous real-time orbit initialization (never starts at the same angle on reload)
  const initialOrbitAngle = useMemo(() => ((Date.now() / 1000 * 0.05) % (Math.PI * 2)), []);

  // Synchronized smooth 60fps orbital trajectory animation (calibrated to stately cinematic LEO speed)
  useFrame((state) => {
    const t = initialOrbitAngle + state.clock.getElapsedTime() * 0.05;
    const x = orbitRadius * Math.cos(t);
    const z = orbitRadius * Math.sin(t);

    if (orbitGroupRef.current) {
      orbitGroupRef.current.position.set(x, 0, z);
      // Tangential velocity orientation: solar arrays align along flight vector
      orbitGroupRef.current.rotation.y = -t + Math.PI / 2;
      orbitGroupRef.current.rotation.x = Math.sin(t * 1.5) * 0.05;
    }

    if (beaconLightRef.current) {
      // Periodic navigation strobe pulse (1.2 Hz)
      const pulse = Math.sin(state.clock.getElapsedTime() * 7.5);
      beaconLightRef.current.intensity = pulse > 0.4 ? 1.4 : 0.2;
    }
  });

  return (
    <group position={earthCenter}>
      {/* 51.6° Inclined Orbital Plane around Earth's center */}
      <group rotation={[orbitInclination, 0.15, 0]}>
        {/* Orbiting Space Station Vessel */}
        <group ref={orbitGroupRef} onClick={onSelect}>
          <Suspense fallback={<ISSFallback />}>
            <ISSModelInner onHover={setHovered} isHovered={hovered} />
          </Suspense>

          {/* Exterior Navigation Telemetry Beacon */}
          <pointLight
            ref={beaconLightRef}
            color="#38bdf8"
            intensity={1.2}
            distance={0.8}
          />

          {/* Subtle Ambient Fill for Unlit Space Shadow side */}
          <pointLight
            color="#ffffff"
            intensity={0.25}
            distance={0.6}
          />

          {/* Micro HUD Telemetry Badge Floating with Station - Only visible on Hover or Click */}
          {(hovered || pinnedOpen) && (
            <Html position={[0, 0.14, 0]} pointerEvents="none" center distanceFactor={9}>
              <div
                className="px-2 py-0.5 rounded-full border border-cyan-400/50 bg-black/85 text-cyan-200 pointer-events-none select-none whitespace-nowrap shadow-xl flex items-center gap-1.5 backdrop-blur-xl animate-fade-in text-[9px]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_rgba(56,189,248,0.9)]" />
                <span className="font-mono font-bold tracking-wider">
                  ISS • 408 km LEO
                </span>
              </div>
            </Html>
          )}
        </group>
      </group>
    </group>
  );
};

// Preload the official NASA ISS asset
useGLTF.preload('/models/iss.glb', '/draco/');

export default SpaceStationISS3D;
