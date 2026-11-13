import React, { useMemo, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls, Line, useGLTF, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { LaunchVehicleId } from '../../types';
import { OrbitalPlanetBackdrop } from './OrbitalPlanetBackdrop';
import { CanvasErrorBoundary } from '../common/CanvasErrorBoundary';
import { CanvasLoadingOverlay } from '../common/CanvasLoadingOverlay';
import { AdaptivePerformance } from './AdaptivePerformance';

interface LaunchVehicle3DSimulatorProps {
  vehicleId: LaunchVehicleId;
  phaseIndex: number; // 0: Ignition, 1: Liftoff, 2: Max-Q/Fairing, 3: Staging, 4: Injection
  accentHex?: string;
}

function EnginePlume({
  position = [0, 0, 0],
  scale = 1,
  variant = 'kerolox',
}: {
  position?: [number, number, number];
  scale?: number;
  variant?: 'kerolox' | 'hydrolox' | 'solid' | 'hypergolic';
}) {
  const coneRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const colors = useMemo(() => {
    if (variant === 'hydrolox') return { inner: '#e0f2fe', outer: '#38bdf8', light: '#38bdf8' };
    if (variant === 'hypergolic') return { inner: '#fed7aa', outer: '#ec4899', light: '#f472b6' };
    if (variant === 'solid') return { inner: '#fffbeb', outer: '#f97316', light: '#fb923c' };
    return { inner: '#fef08a', outer: '#f59e0b', light: '#f59e0b' };
  }, [variant]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const jitter = 1 + Math.sin(t * 48) * 0.06 + Math.cos(t * 31) * 0.04;
    if (coneRef.current) {
      coneRef.current.scale.set(1 + (jitter - 1) * 0.6, jitter, 1 + (jitter - 1) * 0.6);
    }
    if (lightRef.current) {
      lightRef.current.intensity = 2.4 * scale * jitter;
    }
  });

  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh ref={coneRef} position={[0, -0.75, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.16, 1.5, 16]} />
        <meshBasicMaterial color={colors.inner} transparent opacity={0.94} />
      </mesh>
      <mesh position={[0, -0.95, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.28, 1.9, 16]} />
        <meshBasicMaterial
          color={colors.outer}
          transparent
          opacity={0.48}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <pointLight ref={lightRef} position={[0, -0.4, 0]} color={colors.light} intensity={2.4} distance={8} />
    </group>
  );
}

function SaturnVGLBModel({ phaseIndex }: { phaseIndex: number }) {
  const { scene } = useGLTF('/models/rocket_saturn_v.glb', '/draco/');
  const coreRef = useRef<THREE.Group>(null);

  const normalized = useMemo(() => {
    const c = scene.clone(true);
    const removeList: THREE.Object3D[] = [];
    c.traverse((n) => {
      if (n.type.includes('Camera') || n.type.includes('Light')) {
        removeList.push(n);
      }
    });
    removeList.forEach((n) => n.parent?.remove(n));

    const box = new THREE.Box3().setFromObject(c);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);
    c.position.set(-center.x, -center.y, -center.z);

    const wrapper = new THREE.Group();
    wrapper.add(c);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    wrapper.scale.setScalar(3.6 / maxDim);
    return wrapper;
  }, [scene]);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.1);
    if (coreRef.current) {
      const targetRotY = phaseIndex * 0.35;
      coreRef.current.rotation.y = THREE.MathUtils.lerp(coreRef.current.rotation.y, targetRotY, dt * 2.5);
    }
  });

  return (
    <group ref={coreRef}>
      <primitive object={normalized} />
      <EnginePlume
        position={[0, -1.78, 0]}
        scale={phaseIndex >= 3 ? 0.72 : 1.05}
        variant={phaseIndex >= 3 ? 'hydrolox' : 'kerolox'}
      />
    </group>
  );
}

function ModularRocketStack({
  vehicleId,
  phaseIndex,
}: {
  vehicleId: LaunchVehicleId;
  phaseIndex: number;
}) {
  const fairingLeftRef = useRef<THREE.Group>(null);
  const fairingRightRef = useRef<THREE.Group>(null);
  const boostersRef = useRef<THREE.Group>(null);
  const boosterLeftRef = useRef<THREE.Group>(null);
  const boosterRightRef = useRef<THREE.Group>(null);
  const firstStageRef = useRef<THREE.Group>(null);

  const spec = useMemo(() => {
    switch (vehicleId) {
      case 'sls-block1':
        return {
          coreColor: '#c2410c',
          upperColor: '#f1f5f9',
          boosterColor: '#f8fafc',
          hasSideBoosters: true,
          boosterRadius: 0.17,
          boosterHeight: 2.3,
          plume: 'solid' as const,
        };
      case 'lvm3-m4':
        return {
          coreColor: '#e2e8f0',
          upperColor: '#f8fafc',
          boosterColor: '#cbd5e1',
          hasSideBoosters: true,
          boosterRadius: 0.16,
          boosterHeight: 2.1,
          plume: 'solid' as const,
        };
      case 'ariane-5':
        return {
          coreColor: '#f1f5f9',
          upperColor: '#f8fafc',
          boosterColor: '#e2e8f0',
          hasSideBoosters: true,
          boosterRadius: 0.16,
          boosterHeight: 2.15,
          plume: 'solid' as const,
        };
      case 'space-shuttle':
        return {
          coreColor: '#c2410c',
          upperColor: '#f8fafc',
          boosterColor: '#f1f5f9',
          hasSideBoosters: true,
          boosterRadius: 0.15,
          boosterHeight: 2.2,
          plume: 'solid' as const,
        };
      case 'titan-iiie':
        return {
          coreColor: '#cbd5e1',
          upperColor: '#e2e8f0',
          boosterColor: '#f8fafc',
          hasSideBoosters: true,
          boosterRadius: 0.15,
          boosterHeight: 2.0,
          plume: 'hypergolic' as const,
        };
      case 'long-march-3b':
        return {
          coreColor: '#f8fafc',
          upperColor: '#e2e8f0',
          boosterColor: '#f1f5f9',
          hasSideBoosters: true,
          boosterRadius: 0.13,
          boosterHeight: 1.75,
          plume: 'hypergolic' as const,
        };
      case 'falcon9-soyuz':
        return {
          coreColor: '#f8fafc',
          upperColor: '#e2e8f0',
          boosterColor: '#94a3b8',
          hasSideBoosters: false,
          boosterRadius: 0.14,
          boosterHeight: 1.8,
          plume: 'kerolox' as const,
        };
      case 'atlas-v-541':
      case 'atlas-v-401':
      default:
        return {
          coreColor: '#b45309',
          upperColor: '#e2e8f0',
          boosterColor: '#f8fafc',
          hasSideBoosters: vehicleId === 'atlas-v-541',
          boosterRadius: 0.11,
          boosterHeight: 1.65,
          plume: 'kerolox' as const,
        };
    }
  }, [vehicleId]);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.1);
    const isFairingSep = phaseIndex >= 2;
    const isStageSep = phaseIndex >= 3;
    const isOrbitalBurn = phaseIndex >= 4;

    const fairingSplit = isOrbitalBurn ? 2.6 : isFairingSep ? 0.95 : 0;
    const fairingDrop = isOrbitalBurn ? -3.4 : isFairingSep ? -0.9 : 0;
    const boosterDrop = isOrbitalBurn ? -9.5 : isStageSep ? -2.4 : 0;
    const stageDrop = isOrbitalBurn ? -8.2 : isStageSep ? -1.6 : 0;

    if (fairingLeftRef.current) {
      fairingLeftRef.current.visible = fairingLeftRef.current.position.y > -2.8 || !isOrbitalBurn;
      fairingLeftRef.current.position.x = THREE.MathUtils.lerp(fairingLeftRef.current.position.x, -fairingSplit, dt * 3);
      fairingLeftRef.current.position.y = THREE.MathUtils.lerp(fairingLeftRef.current.position.y, fairingDrop, dt * 3);
      fairingLeftRef.current.rotation.z = THREE.MathUtils.lerp(fairingLeftRef.current.rotation.z, isFairingSep ? 0.45 : 0, dt * 3);
    }
    if (fairingRightRef.current) {
      fairingRightRef.current.visible = fairingRightRef.current.position.y > -2.8 || !isOrbitalBurn;
      fairingRightRef.current.position.x = THREE.MathUtils.lerp(fairingRightRef.current.position.x, fairingSplit, dt * 3);
      fairingRightRef.current.position.y = THREE.MathUtils.lerp(fairingRightRef.current.position.y, fairingDrop, dt * 3);
      fairingRightRef.current.rotation.z = THREE.MathUtils.lerp(fairingRightRef.current.rotation.z, isFairingSep ? -0.45 : 0, dt * 3);
    }
    if (boostersRef.current) {
      boostersRef.current.position.y = THREE.MathUtils.lerp(boostersRef.current.position.y, boosterDrop, dt * 2.2);
      boostersRef.current.rotation.x = THREE.MathUtils.lerp(boostersRef.current.rotation.x, isOrbitalBurn ? -0.55 : isStageSep ? -0.18 : 0, dt * 2.0);
      [boosterLeftRef.current, boosterRightRef.current].forEach((bRef, idx) => {
        if (!bRef) return;
        const dir = idx === 0 ? -1 : 1;
        bRef.position.x = THREE.MathUtils.lerp(bRef.position.x, isOrbitalBurn ? dir * 2.2 : isStageSep ? dir * 0.65 : 0, dt * 2.4);
        bRef.rotation.z = THREE.MathUtils.lerp(bRef.rotation.z, isStageSep ? -dir * 0.38 : 0, dt * 2.2);
      });
      boostersRef.current.visible = !(isOrbitalBurn && boostersRef.current.position.y < -6.5);
    }
    if (firstStageRef.current) {
      firstStageRef.current.position.y = THREE.MathUtils.lerp(firstStageRef.current.position.y, stageDrop, dt * 2.1);
      firstStageRef.current.position.x = THREE.MathUtils.lerp(firstStageRef.current.position.x, isOrbitalBurn ? -2.2 : isStageSep ? -0.35 : 0, dt * 2.0);
      firstStageRef.current.rotation.z = THREE.MathUtils.lerp(firstStageRef.current.rotation.z, isOrbitalBurn ? 0.42 : isStageSep ? 0.14 : 0, dt * 2.0);
      firstStageRef.current.visible = !(isOrbitalBurn && firstStageRef.current.position.y < -6.0);
    }
  });

  const isShuttle = vehicleId === 'space-shuttle';

  return (
    <group>
      {/* Upper Stage & Spacecraft Payload (always stays in flight!) */}
      <group position={[0, 0.85, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.21, 0.22, 0.95, 24]} />
          <meshStandardMaterial color={spec.upperColor} metalness={0.55} roughness={0.32} />
        </mesh>
        {/* Spacecraft / Observatory Core visible after Fairing Sep */}
        <mesh position={[0, 0.65, 0]}>
          <octahedronGeometry args={[0.17, 1]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.85} roughness={0.22} />
        </mesh>

        {/* Vacuum Upper Stage Plume when staging/injection */}
        {phaseIndex >= 3 && (
          <EnginePlume position={[0, -0.52, 0]} scale={0.78} variant="hydrolox" />
        )}

        {/* Payload Fairing Clamshells (Split on Max-Q/Fairing milestone) */}
        <group position={[0, 0.72, 0]}>
          <group ref={fairingLeftRef}>
            <mesh position={[-0.08, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.23, 0.95, 16, 1, false, Math.PI * 0.5, Math.PI]} />
              <meshStandardMaterial color="#f8fafc" metalness={0.25} roughness={0.4} side={THREE.DoubleSide} />
            </mesh>
          </group>
        </group>
        <group position={[0, 0.72, 0]}>
          <group ref={fairingRightRef}>
            <mesh position={[0.08, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.23, 0.95, 16, 1, false, -Math.PI * 0.5, Math.PI]} />
              <meshStandardMaterial color="#f8fafc" metalness={0.25} roughness={0.4} side={THREE.DoubleSide} />
            </mesh>
          </group>
        </group>
      </group>

      {/* First Stage / Core Tank */}
      <group ref={firstStageRef}>
        <mesh position={[0, -0.45, 0]} castShadow>
          <cylinderGeometry args={[0.24, 0.25, 1.85, 24]} />
          <meshStandardMaterial color={spec.coreColor} metalness={0.45} roughness={0.42} />
        </mesh>

        {isShuttle && (
          <group position={[0, -0.15, 0.34]}>
            {/* Orbiter Fuselage + Delta Wings */}
            <mesh castShadow>
              <cylinderGeometry args={[0.13, 0.14, 1.35, 16]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.45} />
            </mesh>
            <mesh position={[0, -0.25, -0.02]}>
              <boxGeometry args={[1.15, 0.58, 0.05]} />
              <meshStandardMaterial color="#1e293b" roughness={0.65} />
            </mesh>
            <mesh position={[0, -0.4, 0.22]}>
              <boxGeometry args={[0.04, 0.42, 0.32]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.45} />
            </mesh>
          </group>
        )}

        {/* Nozzle Cluster */}
        <mesh position={[0, -1.46, 0]}>
          <coneGeometry args={[0.16, 0.24, 16, 1, true]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.25} side={THREE.DoubleSide} />
        </mesh>
        {phaseIndex < 3 && (
          <EnginePlume position={[0, -1.52, 0]} scale={0.95} variant={spec.plume} />
        )}
      </group>

      {/* Twin Side Strap-On Boosters */}
      {spec.hasSideBoosters && (
        <group ref={boostersRef}>
          {[-0.39, 0.39].map((xOffset, idx) => (
            <group key={`srb-${idx}`} position={[xOffset, -0.55, 0]}>
              <group ref={idx === 0 ? boosterLeftRef : boosterRightRef}>
                <mesh castShadow>
                  <cylinderGeometry args={[spec.boosterRadius, spec.boosterRadius, spec.boosterHeight, 20]} />
                  <meshStandardMaterial color={spec.boosterColor} metalness={0.35} roughness={0.45} />
                </mesh>
                <mesh position={[0, spec.boosterHeight / 2 + 0.16, 0]}>
                  <coneGeometry args={[spec.boosterRadius, 0.34, 20]} />
                  <meshStandardMaterial color={spec.boosterColor} roughness={0.45} />
                </mesh>
                {phaseIndex < 3 && (
                  <EnginePlume position={[0, -spec.boosterHeight / 2 - 0.1, 0]} scale={0.62} variant={spec.plume} />
                )}
              </group>
            </group>
          ))}
        </group>
      )}
    </group>
  );
}

function AscentFlightRig({
  vehicleId,
  phaseIndex,
  accentHex,
}: {
  vehicleId: LaunchVehicleId;
  phaseIndex: number;
  accentHex: string;
}) {
  const craftRef = useRef<THREE.Group>(null);

  const trajectoryPoints = useMemo<[number, number, number][]>(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 32; i++) {
      const t = i / 32;
      pts.push([t * 6.5 - 1.2, Math.sin(t * Math.PI * 0.48) * 1.45 - 0.85, -t * 2.5]);
    }
    return pts;
  }, []);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.1);
    if (!craftRef.current) return;
    // Pitch-over gravity turn progresses smoothly with flight milestones
    const targetPitch =
      phaseIndex === 0 ? 0.0 : phaseIndex === 1 ? -0.28 : phaseIndex === 2 ? -0.68 : phaseIndex === 3 ? -1.08 : -1.32;
    const targetY = phaseIndex === 0 ? -0.2 : phaseIndex === 1 ? 0.25 : 0.45;
    craftRef.current.rotation.z = THREE.MathUtils.lerp(craftRef.current.rotation.z, targetPitch, dt * 2.2);
    craftRef.current.position.y = THREE.MathUtils.lerp(craftRef.current.position.y, targetY, dt * 2.2);
  });

  return (
    <>
      <Environment resolution={128} frames={1} environmentIntensity={0.9}>
        <Lightformer
          form="rect"
          intensity={3.0}
          color="#fff7ed"
          position={[8, 12, 8]}
          scale={[14, 10, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={1.8}
          color="#7dd3fc"
          position={[-9, 4, -8]}
          scale={[14, 10, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="circle"
          intensity={1.1}
          color="#fb923c"
          position={[0, -9, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={18}
        />
      </Environment>
      <ambientLight intensity={0.46} />
      <hemisphereLight args={['#bae6fd', '#1e293b', 0.85]} />
      <directionalLight position={[10, 14, 8]} intensity={3.3} color="#fff7ed" castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-9, 4, -8]} intensity={1.45} color="#38bdf8" />
      <directionalLight position={[0, -6, 6]} intensity={0.75} color="#fb923c" />
      <Stars radius={120} depth={55} count={4500} factor={4.0} fade />

      <OrbitalPlanetBackdrop body="Earth" />

      {/* Projected orbital insertion / TLI / TMI transfer vector arc */}
      {phaseIndex >= 2 && (
        <Line
          points={trajectoryPoints}
          color={accentHex}
          transparent
          opacity={0.45}
          lineWidth={1.5}
          dashed
          dashSize={0.2}
          gapSize={0.14}
        />
      )}

      <group ref={craftRef} position={[-0.35, 0.15, 0]}>
        <Suspense fallback={null}>
          {vehicleId === 'saturn-v' ? (
            <SaturnVGLBModel phaseIndex={phaseIndex} />
          ) : (
            <ModularRocketStack vehicleId={vehicleId} phaseIndex={phaseIndex} />
          )}
        </Suspense>
      </group>

      <OrbitControls enablePan={false} minDistance={3.2} maxDistance={10.5} />
    </>
  );
}

export const LaunchVehicle3DSimulator: React.FC<LaunchVehicle3DSimulatorProps> = React.memo(({
  vehicleId,
  phaseIndex,
  accentHex = '#38bdf8',
}) => {
  return (
    <div className="relative w-full h-full">
      <CanvasErrorBoundary>
        <Canvas
          camera={{ position: [1.6, 1.35, 5.4], fov: 46 }}
          dpr={[1, 1.75]}
          gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping }}
          shadows
        >
          <AdaptivePerformance />
          <AscentFlightRig
            vehicleId={vehicleId}
            phaseIndex={phaseIndex}
            accentHex={accentHex}
          />
        </Canvas>
      </CanvasErrorBoundary>
      <CanvasLoadingOverlay compact title="Streaming launch vehicle 3D" />
    </div>
  );
});

useGLTF.preload('/models/rocket_saturn_v.glb', '/draco/');

