import React, { useRef, useState } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { soundFx } from '../../utils/soundEffects';

interface MissionMarkerProps {
  id: string;
  name: string;
  lat: number;
  lon: number;
  radius: number;
  isSelected: boolean;
  onSelect: () => void;
  color?: string;
}

// Convert spherical latitude & longitude (degrees) into 3D Cartesian coordinates
export function latLonToVector3(lat: number, lon: number, radius: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return [x, y, z];
}

export const MissionMarker: React.FC<MissionMarkerProps> = ({
  id,
  name,
  lat,
  lon,
  radius,
  isSelected,
  onSelect,
  color = '#38bdf8',
}) => {
  const [hovered, setHovered] = useState(false);
  const pulseRef = useRef<THREE.Mesh>(null);

  const position = React.useMemo(() => {
    return latLonToVector3(lat, lon, radius * 1.015);
  }, [lat, lon, radius]);

  useFrame(({ clock }) => {
    if (pulseRef.current) {
      const scale = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.25;
      pulseRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={position}>
      {/* 1. Core Beacon Mesh */}
      <mesh
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
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color={isSelected ? '#ffffff' : color} />
      </mesh>

      {/* 2. Pulsing Glow Aura */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.075, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isSelected ? 0.6 : 0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 3. Interactive HTML Label */}
      {(hovered || isSelected) && (
        <Html position={[0, 0.12, 0]} center pointerEvents="none">
          <div
            className={`px-2.5 py-1 rounded-xl crystal-glass text-[10px] font-mono shadow-xl whitespace-nowrap transition-all border backdrop-blur-md ${
              isSelected
                ? 'border-cyan-400 text-cyan-200 bg-cyan-950/80 shadow-[0_0_12px_rgba(56,189,248,0.5)]'
                : 'border-white/20 text-slate-200 bg-black/70'
            }`}
          >
            <div className="font-bold font-display">{name}</div>
            <div className="text-[8px] text-slate-400">
              {Math.abs(lat).toFixed(1)}°{lat >= 0 ? 'N' : 'S'}, {lon.toFixed(1)}°E
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

