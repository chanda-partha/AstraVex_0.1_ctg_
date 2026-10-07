import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// 🌍 DISTANT EARTH FLOATING IN THE AIRLESS BLACK LUNAR SKY
function DistantEarthInLunarSky() {
  const earthRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/models/earth.glb', '/draco/');

  const clonedEarth = useMemo(() => {
    const c = scene.clone(true);
    const box = new THREE.Box3().setFromObject(c);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      const scale = 2.4 / maxDim;
      c.scale.set(scale, scale, scale);
    }
    return c;
  }, [scene]);

  useFrame((_, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.04;
    }
  });

  return (
    <group position={[18, 16, -26]}>
      {/* Real HD Earth Globe */}
      <group ref={earthRef} rotation={[0.4, 0, 0.2]}>
        <primitive object={clonedEarth} />
      </group>

      {/* Atmospheric Rayleigh scattering glow aura */}
      <mesh scale={[1.35, 1.35, 1.35]}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.16}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <pointLight color="#38bdf8" intensity={1.8} distance={8} />
    </group>
  );
}

// 🪨 SCATTERED LUNAR BASALT BOULDERS
function LunarRocks() {
  const rockPositions: { pos: [number, number, number]; scale: [number, number, number]; rot: [number, number, number] }[] = useMemo(() => [
    { pos: [3.8, 0.15, -2.4], scale: [0.35, 0.22, 0.32], rot: [0.2, 0.5, 0.1] },
    { pos: [-4.2, 0.2, 1.8], scale: [0.45, 0.28, 0.4], rot: [0.4, -0.3, 0.2] },
    { pos: [5.2, 0.25, 4.1], scale: [0.55, 0.32, 0.48], rot: [-0.3, 0.8, -0.2] },
    { pos: [-3.4, 0.18, -4.5], scale: [0.4, 0.24, 0.38], rot: [0.1, -0.6, 0.4] },
    { pos: [1.8, 0.12, 5.2], scale: [0.28, 0.18, 0.25], rot: [0.5, 0.2, -0.1] },
    { pos: [-6.1, 0.3, -1.2], scale: [0.65, 0.38, 0.55], rot: [-0.2, 1.1, 0.3] },
    { pos: [7.2, 0.35, -5.5], scale: [0.72, 0.42, 0.68], rot: [0.3, -0.9, -0.2] },
    { pos: [-2.1, 0.14, 4.8], scale: [0.32, 0.2, 0.3], rot: [-0.4, 0.4, 0.1] },
  ], []);

  return (
    <group>
      {rockPositions.map((rock, idx) => (
        <mesh
          key={`lunar-rock-${idx}`}
          position={rock.pos}
          scale={rock.scale}
          rotation={rock.rot}
          castShadow
          receiveShadow
          raycast={() => null}
        >
          <dodecahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#474b52"
            roughness={0.96}
            metalness={0.06}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}

// 🌕 CRATERED LUNAR REGOLITH SURFACE TERRAIN (90M X 90M)
function LunarCrateredTerrain() {
  const terrainGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(90, 90, 72, 72);
    const pos = geo.attributes.position;

    // Define 4 distinct impact craters across the terrain
    const craters = [
      { x: -14, y: 16, r: 10, depth: 1.6 },
      { x: 18, y: -12, r: 14, depth: 2.2 },
      { x: -18, y: -15, r: 12, depth: 1.8 },
      { x: 22, y: 18, r: 16, depth: 2.5 },
    ];

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const distFromCenter = Math.hypot(x, y);

      // Rolling undulating lunar mare topography
      let z =
        Math.sin(x * 0.06) * Math.cos(y * 0.06) * 0.7 +
        Math.sin(x * 0.14 + 1.2) * 0.25 +
        Math.cos(y * 0.12 - 0.8) * 0.2;

      // Flatten landing pad zone (radius 6m)
      if (distFromCenter < 6) {
        z *= distFromCenter / 6;
      }

      // Carve crater rims and bowls
      for (const c of craters) {
        const d = Math.hypot(x - c.x, y - c.y);
        if (d < c.r * 1.5) {
          const normD = d / c.r;
          if (normD < 1.0) {
            // Crater depression bowl
            const bowl = Math.cos((normD * Math.PI) / 2) * c.depth;
            z -= bowl;
          } else {
            // Elevated ejecta rim ridge
            const rimDist = normD - 1.0;
            const rim = Math.sin(rimDist * Math.PI * 2) * (c.depth * 0.25) * (1 - rimDist / 0.5);
            if (rim > 0) z += rim;
          }
        }
      }

      pos.setZ(i, z);
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group position={[0, -0.02, 0]}>
      {/* Main High-Detail Cratered Regolith Mesh */}
      <mesh
        geometry={terrainGeo}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        raycast={() => null}
      >
        <meshStandardMaterial
          color="#3c4048"
          roughness={0.96}
          metalness={0.04}
        />
      </mesh>

      {/* Far Lunar Horizon Extension Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]} raycast={() => null}>
        <ringGeometry args={[42, 95, 64]} />
        <meshBasicMaterial color="#1a1c22" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ☀️ UNBLURRED SOLAR DISK IN VACUUM
function VacuumSunMarker() {
  return (
    <group position={[36, 42, 28]}>
      {/* Glaring solar disc */}
      <mesh>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Razor-sharp corona glare */}
      <mesh scale={[1.4, 1.4, 1.4]}>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshBasicMaterial
          color="#fef08a"
          transparent
          opacity={0.35}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// 🌕 COMPLETE DISTINCT LUNAR SURFACE ENVIRONMENT
export const LunarRealEnvironment: React.FC = () => {
  return (
    <group>
      {/* 1. Airless cratered regolith terrain */}
      <LunarCrateredTerrain />

      {/* 2. Real scattered basalt rocks */}
      <LunarRocks />

      {/* 3. Earth hanging in the black sky */}
      <DistantEarthInLunarSky />

      {/* 4. Vacuum blazing Sun */}
      <VacuumSunMarker />
    </group>
  );
};

export default LunarRealEnvironment;
