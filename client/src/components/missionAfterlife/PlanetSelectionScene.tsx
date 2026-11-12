import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { ChevronRight, ArrowLeft, Globe } from 'lucide-react';
import { GLBPlanet } from '../3d/GLBPlanet';
import { soundFx } from '../../utils/soundEffects';
import type { MADestination } from '../../types/missionAfterlife';

interface PlanetSelectionSceneProps {
  onSelectDestination: (dest: MADestination) => void;
  onBackToIntro: () => void;
}

// 🌕 3D MOON
function SelectableMoon({
  position = [-2.2, 0, 0],
  onSelect,
}: {
  position?: [number, number, number];
  onSelect: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.04;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
        soundFx.playClick();
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        e.stopPropagation();
        soundFx.playChirp();
        onSelect();
      }}
    >
      <GLBPlanet
        modelPath="/models/moon.glb"
        targetRadius={1.25}
        fallbackColor="#475569"
        isHovered={hovered}
        rotationSpeed={0}
      />

      {/* Atmospheric / Glow Ring on Hover */}
      {hovered && (
        <mesh scale={[1.08, 1.08, 1.08]}>
          <sphereGeometry args={[1.25, 32, 32]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.15}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* Hover Info Card */}
      {hovered && (
        <Html position={[0, 1.8, 0]} center pointerEvents="none">
          <div className="px-3.5 py-2 rounded-2xl crystal-glass text-xs text-slate-200 shadow-2xl whitespace-nowrap animate-fade-in pointer-events-none select-none border border-cyan-400/50 backdrop-blur-xl">
            <div className="flex items-center gap-2 font-bold text-white font-display">
              <span>🌕</span>
              <span>The Moon (Luna)</span>
            </div>
            <div className="text-[10px] text-cyan-300 font-mono mt-0.5">
              3 Historical Missions Cataloged
            </div>
            <div className="text-[9px] text-slate-400 font-mono">
              Apollo 11 • Apollo 15 • Apollo 17
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// 🔴 3D MARS
function SelectableMars({
  position = [2.2, 0, 0],
  onSelect,
}: {
  position?: [number, number, number];
  onSelect: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.035;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
        soundFx.playClick();
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        e.stopPropagation();
        soundFx.playChirp();
        onSelect();
      }}
    >
      <GLBPlanet
        modelPath="/models/mars.glb"
        targetRadius={1.35}
        fallbackColor="#b91c1c"
        isHovered={hovered}
        rotationSpeed={0}
      />

      {/* Atmospheric Glow on Hover */}
      {hovered && (
        <mesh scale={[1.08, 1.08, 1.08]}>
          <sphereGeometry args={[1.35, 32, 32]} />
          <meshBasicMaterial
            color="#fb923c"
            transparent
            opacity={0.18}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* Hover Info Card */}
      {hovered && (
        <Html position={[0, 1.9, 0]} center pointerEvents="none">
          <div className="px-3.5 py-2 rounded-2xl crystal-glass text-xs text-slate-200 shadow-2xl whitespace-nowrap animate-fade-in pointer-events-none select-none border border-rose-400/50 backdrop-blur-xl">
            <div className="flex items-center gap-2 font-bold text-white font-display">
              <span>🔴</span>
              <span>Mars (The Red Planet)</span>
            </div>
            <div className="text-[10px] text-rose-300 font-mono mt-0.5">
              3 Historical Missions Cataloged
            </div>
            <div className="text-[9px] text-slate-400 font-mono">
              Viking 1 • Spirit • Opportunity
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// 🌟 CELESTIAL LIGHTING
function PlanetSelectLighting() {
  return (
    <>
      <ambientLight intensity={0.4} color="#0a1224" />
      <directionalLight position={[10, 8, 10]} intensity={3.2} color="#ffffff" />
      <directionalLight position={[-10, -4, -6]} intensity={0.8} color="#38bdf8" />
      <pointLight position={[0, 4, 2]} intensity={1.2} color="#93c5fd" distance={15} />
      <Stars radius={120} depth={60} count={7000} factor={3.5} fade speed={0.4} />
    </>
  );
}

export const PlanetSelectionScene: React.FC<PlanetSelectionSceneProps> = ({
  onSelectDestination,
  onBackToIntro,
}) => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#04060b] select-none font-sans">
      {/* ═══ 1. 3D WEBGL CANVAS ═══ */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 7.5], fov: 45 }}>
          <PlanetSelectLighting />
          <SelectableMoon position={[-2.3, 0, 0]} onSelect={() => onSelectDestination('Moon')} />
          <SelectableMars position={[2.3, 0, 0]} onSelect={() => onSelectDestination('Mars')} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            dampingFactor={0.05}
            maxPolarAngle={Math.PI / 1.8}
            minPolarAngle={Math.PI / 2.2}
          />
        </Canvas>
      </div>

      {/* ═══ 2. HUD INTERACTION OVERLAY ═══ */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between p-6 sm:p-10 pt-20 pointer-events-none">
        
        {/* Top Header */}
        <div className="w-full flex items-center justify-between pointer-events-auto">
          <button
            onClick={() => {
              soundFx.playClick();
              onBackToIntro();
            }}
            className="crystal-glass px-4 py-2 rounded-full text-xs font-mono text-slate-300 hover:text-white flex items-center gap-2 cursor-pointer transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>RETURN TO INTRO</span>
          </button>

          <div className="crystal-glass px-4 py-1.5 rounded-full text-xs font-mono text-cyan-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>STAGE B • SELECT PLANETARY GRAVEYARD</span>
          </div>
        </div>

        {/* Center Guidance Capsule */}
        <div className="text-center pointer-events-none space-y-1">
          <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase">
            CHOOSE DESTINATION TO INSPECT
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
            The Graveyards of Space Exploration
          </h2>
        </div>

        {/* Bottom Destination Cards */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-6 pointer-events-auto pb-4">
          
          {/* Card 1: The Moon */}
          <button
            onClick={() => {
              soundFx.playClick();
              onSelectDestination('Moon');
            }}
            className="w-full sm:w-80 crystal-glass p-5 rounded-2xl transition-all duration-300 cursor-pointer group hover:border-cyan-400/50 hover:shadow-glow-cyan text-left relative overflow-hidden"
          >
            <div className="card-iridescent-rim absolute top-0 left-0 right-0 h-[1.5px] pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.1] flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                  🌕
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-200 font-display">
                    The Moon
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    384,400 km • 3 Missions
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs text-slate-300 mt-3 font-sans leading-relaxed">
              Airless, silent, perfectly preserved. The Apollo descent stages and first wheeled rover remain undisturbed.
            </p>
            <div className="text-[10px] font-mono text-cyan-400/80 mt-2 flex items-center gap-1.5">
              <span>Apollo 11</span> • <span>Apollo 15</span> • <span>Apollo 17</span>
            </div>
          </button>

          {/* Card 2: Mars */}
          <button
            onClick={() => {
              soundFx.playClick();
              onSelectDestination('Mars');
            }}
            className="w-full sm:w-80 crystal-glass p-5 rounded-2xl transition-all duration-300 cursor-pointer group hover:border-rose-400/50 hover:shadow-glow-mars text-left relative overflow-hidden"
          >
            <div className="card-iridescent-rim absolute top-0 left-0 right-0 h-[1.5px] pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.1] flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                  🔴
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-rose-200 font-display">
                    Mars
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    225M km • 3 Missions
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-rose-300 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs text-slate-300 mt-3 font-sans leading-relaxed">
              Wind, dust, and deep time. Robotic explorers that pushed far beyond their warranties into silence.
            </p>
            <div className="text-[10px] font-mono text-rose-400/80 mt-2 flex items-center gap-1.5">
              <span>Viking 1</span> • <span>Spirit</span> • <span>Opportunity</span>
            </div>
          </button>

        </div>

      </div>
    </div>
  );
};

