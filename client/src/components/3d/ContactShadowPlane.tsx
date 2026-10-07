import React, { useMemo } from 'react';
import * as THREE from 'three';

interface ContactShadowPlaneProps {
  opacity?: number;
  radius?: number;
  isMars?: boolean;
}

/**
 * 🌑 Realistic Ground Contact Shadow Plane
 * Provides crisp visual ground separation and soft ambient contact shadows under
 * rover wheels and lunar module landing pads, eliminating any visual floating sensation.
 */
export const ContactShadowPlane: React.FC<ContactShadowPlaneProps> = ({
  opacity = 0.65,
  radius = 3.6,
  isMars = false,
}) => {
  // Generate a soft procedural radial ambient occlusion falloff texture
  const shadowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
    grad.addColorStop(0.35, 'rgba(0, 0, 0, 0.65)');
    grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.25)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }, []);

  return (
    <group position={[0, 0.003, 0]}>
      {/* 1. Real Three.js Directional Shadow Receiver Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[radius * 4, radius * 4]} />
        <shadowMaterial opacity={opacity * 0.75} />
      </mesh>

      {/* 2. Soft Ambient Occlusion Contact Gradient Decal */}
      {shadowTexture && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
          <planeGeometry args={[radius * 2, radius * 2]} />
          <meshBasicMaterial
            map={shadowTexture}
            transparent
            opacity={opacity}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* 3. Subtle Soil / Regolith Tint Disk - tightly confined beneath wheels */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0005, 0]}>
        <ringGeometry args={[0.1, radius * 1.1, 32]} />
        <meshBasicMaterial
          color={isMars ? '#291811' : '#141824'}
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};
