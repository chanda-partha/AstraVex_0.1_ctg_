import React, { useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { CyberHotspotPin } from './Rover3DModel';
import { ContactShadowPlane } from './ContactShadowPlane';
import { DetailedLunarCommsTower } from './DetailedSpacecraftModels';
import { getSpaceHardwareTextures } from '../../utils/spaceHardwarePBR';

interface StarshipHLS3DProps {
  onSelectHotspot?: (hotspotId: string) => void;
  activeHotspotId?: string;
  showHotspots?: boolean;
  landingMode?: boolean;
}

const HLS_UP = new THREE.Vector3(0, 1, 0);

function HLSStrut({
  from,
  to,
  radius = 0.04,
  color = '#94a3b8',
  metalness = 0.86,
  roughness = 0.24,
}: {
  from: [number, number, number];
  to: [number, number, number];
  radius?: number;
  color?: string;
  metalness?: number;
  roughness?: number;
}) {
  const { mid, quat, len } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = new THREE.Vector3().subVectors(b, a);
    const length = dir.length();
    const m: [number, number, number] = [
      (a.x + b.x) * 0.5,
      (a.y + b.y) * 0.5,
      (a.z + b.z) * 0.5,
    ];
    const q = new THREE.Quaternion();
    if (length > 0.0001) {
      q.setFromUnitVectors(HLS_UP, dir.normalize());
    }
    return { mid: m, quat: q, len: Math.max(0.001, length) };
  }, [from[0], from[1], from[2], to[0], to[1], to[2]]);

  return (
    <mesh position={mid} quaternion={quat} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, len, 12]} />
      <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
    </mesh>
  );
}

// 🚀 OFFICIAL NASA ARTEMIS III STARSHIP HLS (HUMAN LANDING SYSTEM)
// Photorealistic 3D Model with PBR Stainless Steel, Raptor Engines, Crew Elevator, and Lunar Base Habitat
export const StarshipHLS3D: React.FC<StarshipHLS3DProps> = ({
  onSelectHotspot,
  activeHotspotId,
  showHotspots = true,
  landingMode = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const astronautGroupRef = useRef<THREE.Group>(null);
  const thrusterGlowRef = useRef<THREE.PointLight>(null);
  const hardwareTex = useMemo(() => getSpaceHardwareTextures(), []);

  // Load official NASA animated astronaut inspecting Starship
  const { scene: astronautScene, animations: astronautAnimations } = useGLTF(
    '/models/tripo_astronaut_2_stylized_and_animated.glb',
    '/draco/'
  );
  const { actions, names } = useAnimations(astronautAnimations, astronautGroupRef);
  useEffect(() => {
    const action = names.length > 0 ? actions[names[0]] : null;
    if (!action) return;
    action.reset().fadeIn(0.4).play();
    return () => {
      action.fadeOut(0.2);
    };
  }, [actions, names]);
  // Load official NASA Lunar Habitat Dome
  const { scene: habitatScene } = useGLTF('/models/lunar_habitat.glb', '/draco/');

  const { clonedAstronaut, astronautMats } = useMemo(() => {
    const c = cloneSkeleton(astronautScene);
    const mats: THREE.Material[] = [];
    c.traverse((n) => {
      if ((n as THREE.Mesh).isMesh) {
        const mesh = n as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const srcMats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        const nextMats = srcMats.map((rawMat) => {
          if (!rawMat) return rawMat;
          const m = rawMat.clone() as THREE.MeshStandardMaterial;
          mats.push(m);
          if (m.map) {
            m.map.colorSpace = THREE.SRGBColorSpace;
            m.map.needsUpdate = true;
          }
          if (m.emissiveMap) {
            m.emissiveMap.colorSpace = THREE.SRGBColorSpace;
            m.emissiveMap.needsUpdate = true;
          }
          if ('envMapIntensity' in m) {
            m.envMapIntensity = Math.max(m.envMapIntensity || 1.0, 1.45);
          }
          m.needsUpdate = true;
          return m;
        });
        mesh.material = Array.isArray(mesh.material) ? nextMats : nextMats[0];
      }
    });
    return { clonedAstronaut: c, astronautMats: mats };
  }, [astronautScene]);

  const { clonedHabitat, habitatMats } = useMemo(() => {
    const c = habitatScene.clone(true);
    const mats: THREE.Material[] = [];
    c.traverse((n) => {
      if ((n as THREE.Mesh).isMesh) {
        const mesh = n as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const srcMats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        const nextMats = srcMats.map((rawMat) => {
          if (!rawMat) return rawMat;
          const m = rawMat.clone() as THREE.MeshStandardMaterial;
          mats.push(m);
          if (m.map) {
            m.map.colorSpace = THREE.SRGBColorSpace;
            m.map.needsUpdate = true;
          }
          if (m.emissiveMap) {
            m.emissiveMap.colorSpace = THREE.SRGBColorSpace;
            m.emissiveMap.needsUpdate = true;
          }
          // Recalibrate crushed m:1, r:1 Blender defaults on composite lunar habitat domes
          if ('metalness' in m && 'roughness' in m) {
            if (m.metalness > 0.88 && m.roughness > 0.88) {
              m.metalness = 0.24;
              m.roughness = 0.56;
            }
            m.envMapIntensity = Math.max(m.envMapIntensity || 1.0, 1.65);
          }
          m.needsUpdate = true;
          return m;
        });
        mesh.material = Array.isArray(mesh.material) ? nextMats : nextMats[0];
      }
    });
    const wrapper = new THREE.Group();
    const box = new THREE.Box3().setFromObject(c);
    if (!box.isEmpty()) {
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      box.getCenter(center);
      box.getSize(size);
      c.position.set(-center.x, -box.min.y, -center.z);
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      wrapper.scale.setScalar(2.75 / maxDim);
    }
    wrapper.add(c);
    return { clonedHabitat: wrapper, habitatMats: mats };
  }, [habitatScene]);

  useEffect(() => {
    return () => {
      astronautMats.forEach((m) => m.dispose());
      habitatMats.forEach((m) => m.dispose());
    };
  }, [astronautMats, habitatMats]);

  // Pulsing cryogenic methalox thruster illumination
  useFrame(({ clock }) => {
    if (thrusterGlowRef.current) {
      thrusterGlowRef.current.intensity = 1.4 + Math.sin(clock.getElapsedTime() * 4) * 0.4;
    }
  });

  const handleHotspot = (id: string, e?: any) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (onSelectHotspot) onSelectHotspot(id);
  };

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      
      {/* ═══ 1. STARSHIP HLS PRIMARY AIRFRAME (50M CLASS SPACECRAFT SCALED FOR 3D WORLD) ═══ */}
      <group position={[0, 0, 0]}>

        {/* Main White Thermal-Coated Stainless Steel 304L Fuselage Barrel (y: 1.0 .. 5.4) */}
        <mesh position={[0, 3.2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.15, 1.15, 4.4, 48]} />
          <meshStandardMaterial
            color="#e2e8f0"
            metalness={0.86}
            roughness={0.22}
            envMapIntensity={1.65}
          />
        </mesh>

        {/* Circumferential 304L Steel Ring-Weld Seam Stiffeners */}
        {[1.35, 2.05, 2.75, 4.55, 5.38].map((ry, idx) => (
          <mesh key={`hls-seam-${idx}`} position={[0, ry, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[1.156, 0.015, 8, 48]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.22} />
          </mesh>
        ))}

        {/* Dorsal External Cryogenic LOX/CH4 Transfer Raceway Spine */}
        <mesh position={[0, 3.1, -1.17]} castShadow receiveShadow>
          <boxGeometry args={[0.14, 4.1, 0.08]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.28} />
        </mesh>

        {/* Mid-Section Solar Photovoltaic Array Wrap Band (Artemis GaAs Solar Cell Grid) */}
        <mesh position={[0, 3.72, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.164, 1.164, 1.12, 48]} />
          <meshStandardMaterial
            map={hardwareTex.solarMap}
            bumpMap={hardwareTex.solarBump}
            bumpScale={0.015}
            metalness={0.4}
            roughness={0.2}
          />
        </mesh>

        {/* Forward Aerodynamic Conical Fairing / Nosecone (Base Flush at y = 5.4 .. 7.8) */}
        <mesh position={[0, 6.6, 0]} castShadow receiveShadow>
          <coneGeometry args={[1.15, 2.4, 48]} />
          <meshStandardMaterial
            color="#f8fafc"
            metalness={0.82}
            roughness={0.2}
            envMapIntensity={1.55}
          />
        </mesh>

        {/* Nosecone Tip Star Tracker Cap & DSN Deep Space Ka-Band Dome */}
        <mesh position={[0, 7.82, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.14, 0.12, 18]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.88} roughness={0.22} />
        </mesh>
        <mesh position={[0, 7.94, 0]}>
          <sphereGeometry args={[0.14, 24, 24]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.85} roughness={0.18} emissive="#0284c7" emissiveIntensity={0.65} />
        </mesh>

        {/* Forward 8-Window Recessed Crew Lunar Observation Cupola Band (y = 5.04) */}
        <group position={[0, 5.04, 0]}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <group key={`window-${i}`} position={[Math.sin(rad) * 1.135, 0, Math.cos(rad) * 1.135]} rotation={[0, rad, 0]}>
                {/* Titanium Window Bezel Frame */}
                <mesh castShadow>
                  <boxGeometry args={[0.25, 0.30, 0.05]} />
                  <meshStandardMaterial color="#1e293b" metalness={0.86} roughness={0.28} />
                </mesh>
                {/* Illuminated Triple-Pane Observation Glazing */}
                <mesh position={[0, 0, 0.022]}>
                  <boxGeometry args={[0.18, 0.22, 0.018]} />
                  <meshStandardMaterial color="#0284c7" emissive="#38bdf8" emissiveIntensity={0.85} metalness={0.2} roughness={0.08} />
                </mesh>
              </group>
            );
          })}
        </group>

        {/* 4 Cold-Gas Nitrogen / Methalox Upper RCS Attitude Control Thruster Blisters */}
        {[45, 135, 225, 315].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <group key={`rcs-pod-${i}`} position={[Math.sin(rad) * 1.15, 5.34, Math.cos(rad) * 1.15]} rotation={[0, rad, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.14, 0.22, 0.10]} />
                <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.3} />
              </mesh>
            </group>
          );
        })}

        {/* Forward Aerodynamic Flaps / Heat Shield Vanes (Locked Stowed for Lunar Ops) */}
        <mesh position={[-1.24, 5.95, 0]} rotation={[0, 0, 0.24]} castShadow>
          <boxGeometry args={[0.32, 1.15, 0.075]} />
          <meshStandardMaterial color="#1e293b" metalness={0.62} roughness={0.42} />
        </mesh>
        <mesh position={[1.24, 5.95, 0]} rotation={[0, 0, -0.24]} castShadow>
          <boxGeometry args={[0.32, 1.15, 0.075]} />
          <meshStandardMaterial color="#1e293b" metalness={0.62} roughness={0.42} />
        </mesh>

        {/* High-Altitude 8-Thruster Methalox Hover-Landing Ring & Gold Thermal Collar (y = 4.38) */}
        <group position={[0, 4.38, 0]}>
          <mesh>
            <cylinderGeometry args={[1.175, 1.175, 0.14, 48]} />
            <meshStandardMaterial
              map={hardwareTex.goldFoilMap}
              normalMap={hardwareTex.goldFoilNormal}
              metalness={0.65}
              roughness={0.28}
            />
          </mesh>
          <mesh>
            <torusGeometry args={[1.19, 0.052, 14, 48]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.22} />
          </mesh>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <group key={`thruster-${i}`} position={[Math.sin(rad) * 1.19, -0.02, Math.cos(rad) * 1.19]} rotation={[0, rad, 0]}>
                <mesh rotation={[0.36, 0, 0]} castShadow>
                  <coneGeometry args={[0.088, 0.22, 16, 1, true]} />
                  <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.28} side={THREE.DoubleSide} />
                </mesh>
              </group>
            );
          })}
        </group>

        {/* EVA Airlock Door + Twin Winch Hoist Rails + Caged Crew Surface Elevator */}
        <group position={[0, 0, 1.16]}>
          {/* Recessed Pressurized EVA Airlock Hatch (y = 4.65) */}
          <mesh position={[0, 4.65, 0]} castShadow>
            <boxGeometry args={[0.58, 0.82, 0.06]} />
            <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.28} />
          </mesh>
          <mesh position={[0, 4.72, 0.036]}>
            <cylinderGeometry args={[0.11, 0.11, 0.02, 18]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.7} />
          </mesh>
          {/* Overhead Winch Boom Gantry */}
          <mesh position={[0, 5.10, 0.12]} castShadow>
            <boxGeometry args={[0.62, 0.08, 0.34]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.86} roughness={0.26} />
          </mesh>
          {/* Vertical Guide Rails & Dual Hoist Cables */}
          {[-0.24, 0.24].map((gx, idx) => (
            <React.Fragment key={`hls-rail-${idx}`}>
              <mesh position={[gx, 2.95, 0.04]} castShadow>
                <boxGeometry args={[0.04, 4.35, 0.04]} />
                <meshStandardMaterial color="#64748b" metalness={0.84} roughness={0.28} />
              </mesh>
              <mesh position={[gx * 0.72, 3.15, 0.16]}>
                <cylinderGeometry args={[0.008, 0.008, 3.8, 8]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
              </mesh>
            </React.Fragment>
          ))}
          {/* Lower Elevator Lift Platform Basket + Safety Handrail Cage */}
          <group position={[0, 1.35, 0.18]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.68, 0.08, 0.48]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.82} roughness={0.28} />
            </mesh>
            <mesh position={[0, 0.56, 0]} castShadow>
              <boxGeometry args={[0.70, 0.06, 0.50]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.82} roughness={0.26} />
            </mesh>
            {[-0.31, 0.31].map((rx) =>
              [-0.21, 0.21].map((rz) => (
                <mesh key={`cage-post-${rx}-${rz}`} position={[rx, 0.28, rz]} castShadow>
                  <cylinderGeometry args={[0.015, 0.015, 0.56, 8]} />
                  <meshStandardMaterial color="#f59e0b" metalness={0.75} roughness={0.3} />
                </mesh>
              ))
            )}
          </group>
        </group>

        {/* ═══ 2. ARTICULATED DUAL-DAMPER HEAVY LUNAR TOUCHDOWN LEGS (6-STRUT ARRAY) ═══ */}
        <group position={[0, 0.9, 0]}>
          {[0, 60, 120, 180, 240, 300].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const upperAttach: [number, number, number] = [1.14, 0.58, 0];
            const lowerAttachL: [number, number, number] = [1.14, -0.32, -0.16];
            const lowerAttachR: [number, number, number] = [1.14, -0.32, 0.16];
            const midKnee: [number, number, number] = [1.50, -0.24, 0];
            const footGimbal: [number, number, number] = [1.78, -0.84, 0];
            return (
              <group key={`leg-${i}`} rotation={[0, rad, 0]}>
                {/* Hull Clevis Hinges */}
                <mesh position={upperAttach} castShadow>
                  <sphereGeometry args={[0.075, 12, 12]} />
                  <meshStandardMaterial color="#94a3b8" metalness={0.86} roughness={0.26} />
                </mesh>
                <mesh position={[1.14, -0.32, 0]} castShadow>
                  <cylinderGeometry args={[0.045, 0.045, 0.36, 12]} />
                  <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.28} />
                </mesh>
                {/* Telescoping Upper Primary Compression Strut & Knee Joint */}
                <HLSStrut from={upperAttach} to={midKnee} radius={0.054} color="#64748b" />
                <mesh position={midKnee} castShadow>
                  <sphereGeometry args={[0.068, 12, 12]} />
                  <meshStandardMaterial color="#f59e0b" metalness={0.84} roughness={0.24} />
                </mesh>
                {/* Lower Shock Piston + Twin A-Frame Deploy Braces */}
                <HLSStrut from={midKnee} to={footGimbal} radius={0.042} color="#e2e8f0" metalness={0.9} roughness={0.18} />
                <HLSStrut from={lowerAttachL} to={footGimbal} radius={0.028} color="#94a3b8" />
                <HLSStrut from={lowerAttachR} to={footGimbal} radius={0.028} color="#94a3b8" />
                {/* Wide Self-Leveling Titanium Crushable Footpad Dish (Flush on y = 0) */}
                <mesh position={[footGimbal[0], -0.86, 0]} receiveShadow castShadow>
                  <cylinderGeometry args={[0.24, 0.29, 0.08, 18]} />
                  <meshStandardMaterial color="#334155" metalness={0.82} roughness={0.38} />
                </mesh>
              </group>
            );
          })}
        </group>

        {/* ═══ 3. BASE RAPTOR 2 VACUUM & SEA-LEVEL ROCKET ENGINE CLUSTER ═══ */}
        <group position={[0, 0.45, 0]}>
          {/* Main Engine Skirt */}
          <mesh castShadow>
            <cylinderGeometry args={[1.05, 1.15, 0.7, 48]} />
            <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.3} />
          </mesh>

          {/* 3 Raptor Vacuum (RVac) Oversized Regeneratively-Cooled Engine Bells */}
          {[0, 120, 240].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <mesh key={`rvac-${i}`} position={[Math.sin(rad) * 0.48, -0.25, Math.cos(rad) * 0.48]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.26, 0.55, 24]} />
                <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.25} />
              </mesh>
            );
          })}

          {/* 3 Central Gimbaled Sea-Level Raptor Engines */}
          {[60, 180, 300].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <mesh key={`rcen-${i}`} position={[Math.sin(rad) * 0.22, -0.15, Math.cos(rad) * 0.22]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.15, 0.38, 20]} />
                <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.3} />
              </mesh>
            );
          })}

          {/* Glowing Engine Bay Ambient Scatter */}
          <pointLight ref={thrusterGlowRef} position={[0, -0.4, 0]} color="#38bdf8" intensity={1.8} distance={3.5} />
        </group>

      </group>

      {/* ═══ 4. GROUND CONTACT SHADOW ═══ */}
      <ContactShadowPlane radius={3.8} isMars={false} />

      {/* ═══ 5. ACCOMPANYING ARTEMIS ASTRONAUT & LUNAR BASE CAMP ENVIRONMENT ═══ */}
      {!landingMode && (
        <>
          {/* Artemis Astronaut on Lunar Surface */}
          <group ref={astronautGroupRef} position={[2.35, 0, 1.55]} rotation={[0, -0.55, 0]}>
            <primitive object={clonedAstronaut} scale={0.68} />
            <ContactShadowPlane radius={0.8} isMars={false} />
            {showHotspots && (
              <CyberHotspotPin
                id="hls-astronaut"
                activeId={activeHotspotId}
                label="Artemis Moonwalker (Axiom Lunar Spacesuit)"
                code="AxEMU"
                color="cyan"
                position={[0, 1.75, 0]}
                onClick={handleHotspot}
              />
            )}
          </group>

          {/* NASA Artemis Base Camp Inflatable Habitat Dome (Grounded on Level Pad) */}
          <group position={[-3.45, 0, -0.85]} rotation={[0, 0.55, 0]}>
            <primitive object={clonedHabitat} />
            <ContactShadowPlane radius={1.9} isMars={false} />
            {showHotspots && (
              <CyberHotspotPin
                id="lunar-habitat"
                activeId={activeHotspotId}
                label="Artemis Base Camp Inflatable Habitat Dome"
                code="HAB"
                color="amber"
                position={[0, 1.55, 0]}
                onClick={handleHotspot}
              />
            )}
          </group>

          {/* Lunar High-Gain Deep Space Comms & Solar Tower */}
          <group position={[-2.6, 0, 2.2]} rotation={[0, -0.4, 0]}>
            <DetailedLunarCommsTower position={[0, 0, 0]} rotation={[0, 0, 0]} />
            {showHotspots && (
              <CyberHotspotPin
                id="hls-antenna"
                activeId={activeHotspotId}
                label="Artemis High-Gain Solar & Telemetry Tower"
                code="DSN"
                color="blue"
                position={[0, 2.2, 0]}
                onClick={handleHotspot}
              />
            )}
          </group>
        </>
      )}

      {/* ═══ 6. STARSHIP HLS SUBSYSTEM CYBER HOTSPOT PINS ═══ */}
      {showHotspots && (
        <>
          {/* Hotspot 1: Pressurized Crew Compartment */}
          <CyberHotspotPin
            id="hls-crew-cabin"
            activeId={activeHotspotId}
            label="Starship HLS Pressurized Crew Cabin"
            code="CABIN"
            color="cyan"
            position={[0, 5.8, 1.0]}
            onClick={handleHotspot}
          />

          {/* Hotspot 2: Surface Elevator System */}
          <CyberHotspotPin
            id="hls-elevator"
            activeId={activeHotspotId}
            label="Astronaut Surface Access Elevator Platform"
            code="LIFT"
            color="amber"
            position={[0, 2.2, 1.3]}
            onClick={handleHotspot}
          />

          {/* Hotspot 3: Solar Array Wrap & Power Generation */}
          <CyberHotspotPin
            id="hls-solar-wrap"
            activeId={activeHotspotId}
            label="Avionics & Photovoltaic Solar Array Wrap"
            code="SOLAR"
            color="purple"
            position={[-1.2, 3.8, 0]}
            onClick={handleHotspot}
          />

          {/* Hotspot 4: Lunar Landing Gear & Shock Footpads */}
          <CyberHotspotPin
            id="hls-landing-legs"
            activeId={activeHotspotId}
            label="Heavy Wide-Stance Lunar Landing Gear"
            code="LEGS"
            color="emerald"
            position={[1.5, 0.4, 0]}
            onClick={handleHotspot}
          />

          {/* Hotspot 5: Raptor Vacuum Rocket Engines */}
          <CyberHotspotPin
            id="hls-raptor-engines"
            activeId={activeHotspotId}
            label="Raptor 2 Methane-Oxygen Deep Throttling Engines"
            code="RAPTOR"
            color="blue"
            position={[0, 0.6, -0.9]}
            onClick={handleHotspot}
          />
        </>
      )}

    </group>
  );
};

export default StarshipHLS3D;
