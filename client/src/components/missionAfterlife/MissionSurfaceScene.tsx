import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { LunarRealEnvironment } from '../3d/LunarRealEnvironment';
import { MarsAfterlifeEnvironment } from './MarsAfterlifeEnvironment';
import { SpacecraftViewer } from './SpacecraftViewer';
import { MissionCameraController } from './MissionCameraController';
import { CanvasErrorBoundary } from '../common/CanvasErrorBoundary';
import type { MAMissionData } from '../../types/missionAfterlife';

interface MissionSurfaceSceneProps {
  mission: MAMissionData;
  isTransitioning: boolean;
  onTransitionComplete?: () => void;
  autoRotate?: boolean;
}

function SurfaceLighting({ isMars }: { isMars: boolean }) {
  if (isMars) {
    return (
      <>
        <ambientLight intensity={0.4} color="#331c17" />
        <directionalLight position={[12, 10, 8]} intensity={3.4} color="#fff6eb" castShadow />
        <directionalLight position={[-8, 4, -6]} intensity={0.8} color="#f97316" />
        <pointLight position={[0, 6, 0]} intensity={1.0} color="#fed7aa" distance={14} />
      </>
    );
  }

  // Lunar harsh vacuum lighting
  return (
    <>
      <ambientLight intensity={0.25} color="#0d1424" />
      <directionalLight position={[14, 12, 10]} intensity={4.2} color="#ffffff" castShadow />
      <directionalLight position={[-10, 4, -8]} intensity={0.7} color="#38bdf8" />
      <pointLight position={[0, 7, 0]} intensity={1.2} color="#e0f2fe" distance={15} />
      <Stars radius={100} depth={50} count={6000} factor={4} fade speed={0.3} />
    </>
  );
}

export const MissionSurfaceScene: React.FC<MissionSurfaceSceneProps> = ({
  mission,
  isTransitioning,
  onTransitionComplete,
  autoRotate = false,
}) => {
  const isMars = mission.destination === 'Mars';

  return (
    <div className="absolute inset-0 z-0">
      <CanvasErrorBoundary>
        <Canvas
          shadows
          camera={{ position: [0, 24, 32], fov: 45 }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
        >
          <SurfaceLighting isMars={isMars} />

          {/* 1. Surface Environments */}
          {isMars ? <MarsAfterlifeEnvironment /> : <LunarRealEnvironment />}

          {/* 2. Spacecraft Exhibition with Ground Shadows */}
          <SpacecraftViewer
            missionId={mission.id}
            hardwareModelPath={mission.hardwareModelPath}
            isMars={isMars}
            autoRotate={autoRotate}
          />

          {/* 3. Smooth Camera Rig */}
          <MissionCameraController
            isTransitioning={isTransitioning}
            onTransitionComplete={onTransitionComplete}
            autoRotate={autoRotate}
          />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
};

export default MissionSurfaceScene;

