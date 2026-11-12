import React, { useMemo } from 'react';
import * as THREE from 'three';

// 🪨 SCATTERED MARTIAN BASALT ROCKS
function MarsRocks() {
  const rockPositions = useMemo(
    () => [
      { pos: [3.2, 0.18, -2.1] as [number, number, number], scale: [0.45, 0.28, 0.4] as [number, number, number], rot: [0.3, 0.6, 0.1] as [number, number, number] },
      { pos: [-3.8, 0.22, 2.4] as [number, number, number], scale: [0.55, 0.35, 0.5] as [number, number, number], rot: [0.2, -0.4, 0.3] as [number, number, number] },
      { pos: [4.8, 0.3, 3.8] as [number, number, number], scale: [0.65, 0.4, 0.55] as [number, number, number], rot: [-0.3, 0.9, -0.2] as [number, number, number] },
      { pos: [-4.5, 0.2, -3.8] as [number, number, number], scale: [0.48, 0.3, 0.42] as [number, number, number], rot: [0.1, -0.7, 0.5] as [number, number, number] },
      { pos: [1.6, 0.14, 4.5] as [number, number, number], scale: [0.35, 0.22, 0.3] as [number, number, number], rot: [0.4, 0.3, -0.1] as [number, number, number] },
      { pos: [-5.8, 0.35, -1.5] as [number, number, number], scale: [0.75, 0.45, 0.65] as [number, number, number], rot: [-0.2, 1.2, 0.4] as [number, number, number] },
      { pos: [6.5, 0.4, -4.8] as [number, number, number], scale: [0.82, 0.5, 0.75] as [number, number, number], rot: [0.3, -0.8, -0.3] as [number, number, number] },
      { pos: [-2.4, 0.16, 4.2] as [number, number, number], scale: [0.38, 0.24, 0.35] as [number, number, number], rot: [-0.4, 0.5, 0.2] as [number, number, number] },
    ],
    []
  );

  return (
    <group>
      {rockPositions.map((rock, idx) => (
        <mesh
          key={`mars-rock-${idx}`}
          position={rock.pos}
          scale={rock.scale}
          rotation={rock.rot}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#8c3a27"
            roughness={0.92}
            metalness={0.08}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}

// 🔴 MARTIAN REGOLITH TERRAIN WITH UNDULATIONS & IMPACT DEPRESSIONS
function MarsTerrain() {
  const terrainGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(90, 90, 72, 72);
    const pos = geo.attributes.position;

    // Subtle Martian desert undulations with windblown dunes
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const distFromCenter = Math.hypot(x, y);

      let z =
        Math.sin(x * 0.08) * Math.cos(y * 0.08) * 0.6 +
        Math.sin(x * 0.18 + 0.9) * 0.2 +
        Math.cos(y * 0.15 - 0.5) * 0.18;

      // Flat landing/exhibition clearing around origin
      if (distFromCenter < 5.5) {
        z *= distFromCenter / 5.5;
      }

      pos.setZ(i, z);
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group position={[0, -0.02, 0]}>
      <mesh
        geometry={terrainGeo}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <meshStandardMaterial
          color="#9e432a"
          roughness={0.94}
          metalness={0.04}
        />
      </mesh>

      {/* Far Mars Horizon Extension Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]}>
        <ringGeometry args={[42, 95, 64]} />
        <meshBasicMaterial color="#4a1c12" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ☀️ MARTIAN SUN & BUTTERFLY SKY GRADIENT
function MarsSkyAndSun() {
  return (
    <group>
      {/* Distant Sun in Martian dust sky */}
      <group position={[32, 38, 25]}>
        <mesh>
          <sphereGeometry args={[2.0, 32, 32]} />
          <meshBasicMaterial color="#fff4e0" />
        </mesh>
        {/* Soft atmospheric halo */}
        <mesh scale={[1.5, 1.5, 1.5]}>
          <sphereGeometry args={[2.0, 32, 32]} />
          <meshBasicMaterial
            color="#fb923c"
            transparent
            opacity={0.3}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* Martian Atmospheric Fog Dome */}
      <fog attach="fog" args={['#240d08', 25, 75]} />
    </group>
  );
}

export const MarsAfterlifeEnvironment: React.FC = () => {
  return (
    <group>
      <MarsTerrain />
      <MarsRocks />
      <MarsSkyAndSun />
    </group>
  );
};

export default MarsAfterlifeEnvironment;

