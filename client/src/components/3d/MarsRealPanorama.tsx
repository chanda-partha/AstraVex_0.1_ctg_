import React, { useMemo, Suspense } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { CanvasErrorBoundary } from '../common/CanvasErrorBoundary';

interface MarsRealPanoramaProps {
  scale?: number;
  rotationY?: number;
}

/**
 * 🔴 Authentic NASA Perseverance 8K Photometric 360° Panorama of Jezero Crater
 *
 * Uses the genuine 8192x2048 equirectangular imagery captured by Perseverance's
 * Mastcam-Z camera on Mars Sol 4. Rendered as a true celestial skybox sphere
 * with un-inverted horizontal coordinates, depthWrite disabled (preventing
 * rover clipping), and seamless integration with the Martian regolith ground plane.
 */
function MarsPanoramaSphere({ rotationY = 0.4 }: { rotationY?: number }) {
  const texture = useTexture('/models/extracted_pano.jpg');

  useMemo(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      texture.wrapS = THREE.RepeatWrapping;
      texture.repeat.x = 1;
    }
  }, [texture]);

  return (
    // scale={[-1, -1, 1]} flips Y so the Martian ground is at the bottom and sky is at the top
    <mesh
      scale={[-1, -1, 1]}
      position={[0, -2.5, 0]}
      rotation={[0, rotationY, 0]}
      renderOrder={-20}
      raycast={() => null}
    >
      <sphereGeometry args={[140, 64, 32]} />
      <meshBasicMaterial
        map={texture}
        side={THREE.BackSide}
        depthWrite={false}
        depthTest={true}
        toneMapped={true}
      />
    </mesh>
  );
}

export const MarsRealPanorama: React.FC<MarsRealPanoramaProps> = ({
  rotationY = 0.4,
}) => {
  return (
    <group>
      {/* 360° Authentic NASA Mastcam-Z Photometric Panorama of Jezero Crater */}
      <CanvasErrorBoundary is3DChild={true} fallback={null}>
        <Suspense fallback={null}>
          <MarsPanoramaSphere rotationY={rotationY} />
        </Suspense>
      </CanvasErrorBoundary>
    </group>
  );
};

useTexture.preload('/models/extracted_pano.jpg');

export default MarsRealPanorama;
