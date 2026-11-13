import React, { Suspense, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GLBPlanet } from './GLBPlanet';
import { CanvasErrorBoundary } from '../common/CanvasErrorBoundary';

interface OrbitalPlanetBackdropProps {
  body: 'Moon' | 'Mars' | 'Earth';
}

const PLANET_RADIUS = 66.0;

/**
 * 🛰️ Realistic Co-Moving Orbital Chase-Cam Planetary Backdrop
 * Places a massive 66m-radius Moon/Mars/Earth deep beneath the orbital craft so its
 * sweeping curved horizon glides continuously underneath the nadir instruments along
 * an inclined orbital flight vector — simulating real-time 6,000–27,500 km/h orbital tracking.
 */
export const OrbitalPlanetBackdrop: React.FC<OrbitalPlanetBackdropProps> = ({ body }) => {
  const orbiterTrackRef = useRef<THREE.Group>(null);
  const deltaQuat = useMemo(() => new THREE.Quaternion(), []);
  // Inclined orbital velocity ground-track axis: streams surface diagonally forward/across below craft
  const trackAxis = useMemo(() => new THREE.Vector3(0.76, 0.14, -0.63).normalize(), []);

  const modelPath =
    body === 'Mars'
      ? '/models/mars.glb'
      : body === 'Earth'
      ? '/models/earth.glb'
      : '/models/moon.glb';

  const bounceColor =
    body === 'Mars' ? '#fdba74' : body === 'Earth' ? '#60a5fa' : '#e2e8f0';

  const angularSpeed =
    body === 'Earth' ? 0.032 : body === 'Moon' ? 0.026 : 0.022;

  // Continuous orbital ground-track motion with zero heap allocations inside useFrame
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    if (orbiterTrackRef.current) {
      deltaQuat.setFromAxisAngle(trackAxis, dt * angularSpeed);
      orbiterTrackRef.current.quaternion.premultiply(deltaQuat);
    }
  });

  return (
    <group raycast={() => null}>
      {/* Massive curved world far below craft: visible across lower 35% of screen on initial load & streams continuously */}
      <group position={[-6.0, -76.0, -16.0]}>
        <group ref={orbiterTrackRef} rotation={[0.25, -0.55, 0.12]}>
          <CanvasErrorBoundary is3DChild={true} fallback={null}>
            <Suspense fallback={null}>
              <GLBPlanet
                modelPath={modelPath}
                targetRadius={PLANET_RADIUS}
                rotationSpeed={0}
                receiveShadow={false}
                castShadow={false}
              />
            </Suspense>
          </CanvasErrorBoundary>
        </group>
      </group>

      {/* Upward planetary albedo bounce illuminating nadir optical decks & antennas */}
      <pointLight
        position={[0, -5.5, 1.5]}
        color={bounceColor}
        intensity={body === 'Mars' ? 1.05 : body === 'Earth' ? 1.45 : 1.05}
        distance={22}
      />
    </group>
  );
};
