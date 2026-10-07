import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { CyberHotspotPin } from './Rover3DModel';
import { ContactShadowPlane } from './ContactShadowPlane';

interface StarshipHLS3DProps {
  onSelectHotspot?: (hotspotId: string) => void;
  activeHotspotId?: string;
  showHotspots?: boolean;
}

// 🚀 OFFICIAL NASA ARTEMIS III STARSHIP HLS (HUMAN LANDING SYSTEM)
// Photorealistic 3D Model with PBR Stainless Steel, Raptor Engines, Crew Elevator, and Lunar Base Habitat
export const StarshipHLS3D: React.FC<StarshipHLS3DProps> = ({
  onSelectHotspot,
  activeHotspotId,
  showHotspots = true,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const thrusterGlowRef = useRef<THREE.PointLight>(null);

  // Load official NASA animated Apollo astronaut inspecting Starship
  const { scene: astronautScene } = useGLTF('/models/tripo_astronaut_2_stylized_and_animated.glb');
  // Load official NASA Lunar Base Station
  const { scene: baseStationScene } = useGLTF('/models/lunar_base_station.glb');
  // Load official NASA Lunar Habitat Dome
  const { scene: habitatScene } = useGLTF('/models/lunar_habitat.glb');

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

        {/* Main Stainless Steel 304L Fuselage Barrel (Lower & Mid Tanks) */}
        <mesh position={[0, 3.2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.15, 1.15, 4.4, 48]} />
          <meshStandardMaterial
            color="#e2e8f0"
            metalness={0.92}
            roughness={0.16}
            envMapIntensity={1.8}
          />
        </mesh>

        {/* Mid-Section Solar Photovoltaic Array Wrap Band (Artemis Gold/Obsidian Solar Cell Grid) */}
        <mesh position={[0, 3.8, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.16, 1.16, 1.2, 48]} />
          <meshStandardMaterial
            color="#0f172a"
            metalness={0.85}
            roughness={0.35}
            emissive="#1e3a8a"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Forward Aerodynamic Conical Fairing / Crew Cabin Dome */}
        <mesh position={[0, 6.3, 0]} castShadow receiveShadow>
          <coneGeometry args={[1.15, 2.4, 48]} />
          <meshStandardMaterial
            color="#f8fafc"
            metalness={0.88}
            roughness={0.18}
          />
        </mesh>

        {/* Nosecone Tip Radar & DSN Deep Space Comm Array */}
        <mesh position={[0, 7.6, 0]}>
          <sphereGeometry args={[0.18, 24, 24]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.9} roughness={0.2} emissive="#0284c7" emissiveIntensity={0.6} />
        </mesh>

        {/* Forward Crew Observation Windows (360 Lunar Panorama Cupola Band) */}
        <group position={[0, 5.4, 0]}>
          {[0, 60, 120, 180, 240, 300].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <mesh key={`window-${i}`} position={[Math.sin(rad) * 1.12, 0, Math.cos(rad) * 1.12]} rotation={[0, rad, 0]}>
                <boxGeometry args={[0.22, 0.28, 0.08]} />
                <meshStandardMaterial color="#0284c7" emissive="#38bdf8" emissiveIntensity={0.8} metalness={0.2} roughness={0.1} />
              </mesh>
            );
          })}
        </group>

        {/* Forward Aerodynamic Flaps / Canard Heat Shields (Folded in Lunar Landing Configuration) */}
        <mesh position={[-1.25, 6.0, 0]} rotation={[0, 0, 0.25]} castShadow>
          <boxGeometry args={[0.35, 1.2, 0.08]} />
          <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[1.25, 6.0, 0]} rotation={[0, 0, -0.25]} castShadow>
          <boxGeometry args={[0.35, 1.2, 0.08]} />
          <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.4} />
        </mesh>

        {/* High-Altitude Methalox Landing Thruster Cluster Ring (Prevents Lunar Regolith Blast Scour) */}
        <group position={[0, 4.6, 0]}>
          <mesh>
            <torusGeometry args={[1.18, 0.06, 16, 48]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
          </mesh>
          {[45, 135, 225, 315].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <group key={`thruster-${i}`} position={[Math.sin(rad) * 1.16, 0, Math.cos(rad) * 1.16]} rotation={[0, rad, -0.3]}>
                <mesh>
                  <coneGeometry args={[0.1, 0.24, 16]} />
                  <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.3} />
                </mesh>
              </group>
            );
          })}
        </group>

        {/* Crew Surface Access Elevator Cable Rails & External Airlock Cradle */}
        <group position={[0, 3.2, 1.18]}>
          {/* Vertical Elevator Guide Tracks */}
          <mesh position={[-0.2, 0, 0]}>
            <boxGeometry args={[0.04, 4.2, 0.04]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0.2, 0, 0]}>
            <boxGeometry args={[0.04, 4.2, 0.04]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Elevator Lift Basket / Airlock Platform */}
          <mesh position={[0, -1.6, 0.12]} castShadow receiveShadow>
            <boxGeometry args={[0.65, 0.85, 0.45]} />
            <meshStandardMaterial color="#f1f5f9" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>

        {/* ═══ 2. ARTICULATED HEAVY LUNAR TOUCHDOWN LEGS (6-STRUT ARRAY) ═══ */}
        <group position={[0, 0.9, 0]}>
          {[0, 60, 120, 180, 240, 300].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const legDist = 1.65;
            return (
              <group key={`leg-${i}`} rotation={[0, rad, 0]}>
                {/* Diagonal Upper Shock Strut */}
                <mesh position={[0.8, -0.3, 0]} rotation={[0, 0, -0.6]} castShadow>
                  <cylinderGeometry args={[0.055, 0.055, 1.4, 16]} />
                  <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.25} />
                </mesh>
                {/* Lower Extension Piston */}
                <mesh position={[1.2, -0.6, 0]} rotation={[0, 0, -0.3]} castShadow>
                  <cylinderGeometry args={[0.045, 0.045, 0.9, 16]} />
                  <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.15} />
                </mesh>
                {/* Wide Honeycomb Crushable Footpad Resting on Regolith */}
                <mesh position={[legDist, -0.88, 0]} receiveShadow>
                  <cylinderGeometry args={[0.22, 0.26, 0.08, 16]} />
                  <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.4} />
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
      {/* Artemis Astronaut on Lunar Surface */}
      <group position={[2.6, 0, 1.8]} rotation={[0, -1.8, 0]}>
        <primitive object={astronautScene.clone(true)} scale={0.0095} />
        <ContactShadowPlane radius={0.8} isMars={false} />
        {showHotspots && (
          <CyberHotspotPin
            id="apollo-astronaut"
            activeId={activeHotspotId}
            label="Artemis Moonwalker (Axiom Lunar Spacesuit)"
            code="AxEMU"
            color="cyan"
            position={[0, 1.8, 0]}
            onClick={handleHotspot}
          />
        )}
      </group>

      {/* NASA Artemis Base Camp Inflatable Habitat Dome (In Distance) */}
      <group position={[-4.5, 0, -2.5]} rotation={[0, 0.6, 0]}>
        <primitive object={habitatScene.clone(true)} scale={0.008} />
        <ContactShadowPlane radius={1.8} isMars={false} />
        {showHotspots && (
          <CyberHotspotPin
            id="lunar-habitat"
            activeId={activeHotspotId}
            label="Artemis Base Camp Inflatable Habitat Dome"
            code="HAB"
            color="amber"
            position={[0, 1.2, 0]}
            onClick={handleHotspot}
          />
        )}
      </group>

      {/* Lunar High-Gain Power & Telemetry Tower */}
      <group position={[-2.8, 0, 2.4]} rotation={[0, -0.4, 0]}>
        <primitive object={baseStationScene.clone(true)} scale={0.022} />
        <ContactShadowPlane radius={0.9} isMars={false} />
        {showHotspots && (
          <CyberHotspotPin
            id="lunar-antenna"
            activeId={activeHotspotId}
            label="Artemis High-Gain Solar & Telemetry Tower"
            code="DSN"
            color="blue"
            position={[0, 1.4, 0]}
            onClick={handleHotspot}
          />
        )}
      </group>

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
