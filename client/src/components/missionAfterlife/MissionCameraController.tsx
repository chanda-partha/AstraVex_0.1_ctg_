import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface MissionCameraControllerProps {
  isTransitioning: boolean;
  onTransitionComplete?: () => void;
  autoRotate?: boolean;
}

export const MissionCameraController: React.FC<MissionCameraControllerProps> = ({
  isTransitioning,
  onTransitionComplete,
  autoRotate = false,
}) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  // Target landing exhibition pose
  const targetPos = useRef(new THREE.Vector3(4.8, 2.2, 4.8));
  const targetLook = useRef(new THREE.Vector3(0, 0.8, 0));

  // High altitude entry point when transition begins
  const transitionStartPos = useRef(new THREE.Vector3(0, 24, 32));
  const hasFinished = useRef(false);

  useEffect(() => {
    if (isTransitioning) {
      camera.position.copy(transitionStartPos.current);
      camera.lookAt(targetLook.current);
      hasFinished.current = false;
      if (controlsRef.current) {
        controlsRef.current.target.copy(targetLook.current);
      }
    }
  }, [isTransitioning, camera]);

  useFrame((_, delta) => {
    if (isTransitioning && !hasFinished.current) {
      // Smooth lerp downward towards target exhibition spot
      const speed = 2.2;
      camera.position.lerp(targetPos.current, delta * speed);

      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetLook.current, delta * speed);
        controlsRef.current.update();
      }

      // Check if settled
      if (camera.position.distanceTo(targetPos.current) < 0.15) {
        camera.position.copy(targetPos.current);
        hasFinished.current = true;
        if (onTransitionComplete) {
          onTransitionComplete();
        }
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={true}
      minDistance={2.2}
      maxDistance={9.5}
      enablePan={false}
      autoRotate={autoRotate && !isTransitioning}
      autoRotateSpeed={0.5}
      dampingFactor={0.05}
      maxPolarAngle={Math.PI / 2 - 0.05} // Never plunge beneath ground plane!
      minPolarAngle={Math.PI / 6}
    />
  );
};

export default MissionCameraController;

