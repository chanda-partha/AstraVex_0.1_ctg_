import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { getSpaceHardwareTextures } from '../../utils/spaceHardwarePBR';
import { ContactShadowPlane } from './ContactShadowPlane';

// ============================================================================
// GEOMETRIC STRUT CONNECTOR (ZERO FLOATING STICKS / EXACT NODE-TO-NODE JOINTS)
// ============================================================================
function Strut({
  from,
  to,
  radius = 0.024,
  color = '#cbd5e1',
  metalness = 0.82,
  roughness = 0.28,
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
    const midpoint = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
    const q = new THREE.Quaternion();
    if (length > 0.0001) {
      q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    }
    return {
      mid: [midpoint.x, midpoint.y, midpoint.z] as [number, number, number],
      quat: q,
      len: Math.max(0.001, length),
    };
  }, [from[0], from[1], from[2], to[0], to[1], to[2]]);

  return (
    <mesh position={mid} quaternion={quat} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, len, 12]} />
      <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
    </mesh>
  );
}

function JointLug({
  at,
  radius = 0.042,
  color = '#94a3b8',
}: {
  at: [number, number, number];
  radius?: number;
  color?: string;
}) {
  return (
    <mesh position={at} castShadow>
      <sphereGeometry args={[radius, 12, 12]} />
      <meshStandardMaterial color={color} metalness={0.85} roughness={0.25} />
    </mesh>
  );
}

// Shared LatheGeometry builder for authentic curved parabolic dishes
function useParabolicDishGeo(radius: number, depth: number, segments = 32) {
  const geo = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      const r = t * radius;
      const y = t * t * depth;
      pts.push(new THREE.Vector2(r, y));
    }
    return new THREE.LatheGeometry(pts, segments);
  }, [radius, depth, segments]);

  useEffect(() => {
    return () => geo.dispose();
  }, [geo]);

  return geo;
}

// ============================================================================
// 1. SURVEYOR 3 LUNAR LANDER (NASA 1967 — MUSEUM-ACCURATE TRUSS & SMSS)
// ============================================================================
export const DetailedSurveyor3Lander: React.FC<{ showShadow?: boolean }> = ({
  showShadow = true,
}) => {
  const tex = useMemo(() => getSpaceHardwareTextures(), []);
  const normalVec = useMemo(() => new THREE.Vector2(0.85, 0.85), []);

  // Exact structural node coordinates (bottom footpads rest flush at y = 0)
  const legAngles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
  const lowerPts: [number, number, number][] = legAngles.map((a) => [
    Math.cos(a) * 0.72,
    0.58,
    Math.sin(a) * 0.72,
  ]);
  const upperPts: [number, number, number][] = legAngles.map((a) => [
    Math.cos(a) * 0.42,
    1.18,
    Math.sin(a) * 0.42,
  ]);
  const padPts: [number, number, number][] = legAngles.map((a) => [
    Math.cos(a) * 1.48,
    0.09,
    Math.sin(a) * 1.48,
  ]);
  const kneePts: [number, number, number][] = legAngles.map((a) => [
    Math.cos(a) * 1.18,
    0.36,
    Math.sin(a) * 1.18,
  ]);

  const mastTop: [number, number, number] = [0, 2.75, 0];
  const mastBase: [number, number, number] = [0, 0.62, 0];

  return (
    <group position={[0, 0, 0]}>
      {/* ═══ 1. TETRAHEDRAL TUBULAR ALUMINUM SPACEFRAME CHASSIS ═══ */}
      {lowerPts.map((p, i) => {
        const nextL = lowerPts[(i + 1) % 3];
        const nextU = upperPts[(i + 1) % 3];
        const u = upperPts[i];
        return (
          <React.Fragment key={`surv-truss-${i}`}>
            {/* Lower Triangle Ring */}
            <Strut from={p} to={nextL} radius={0.028} color="#e2e8f0" />
            {/* Upper Apex Triangle */}
            <Strut from={u} to={nextU} radius={0.025} color="#e2e8f0" />
            {/* Vertical Corner Uprights */}
            <Strut from={p} to={u} radius={0.026} color="#cbd5e1" />
            {/* Diagonal Shear Bracing */}
            <Strut from={p} to={nextU} radius={0.018} color="#94a3b8" />
            {/* Central Mast Tripod Braces */}
            <Strut from={u} to={[0, 1.82, 0]} radius={0.02} color="#cbd5e1" />
            <Strut from={p} to={mastBase} radius={0.022} color="#94a3b8" />
            <JointLug at={p} radius={0.046} color="#cbd5e1" />
            <JointLug at={u} radius={0.04} color="#cbd5e1" />
          </React.Fragment>
        );
      })}

      {/* ═══ 2. THREE ARTICULATED LANDING LEGS, SHOCK ABSORBERS & FOOT PADS ═══ */}
      {legAngles.map((ang, i) => {
        const pU = upperPts[i];
        const pad = padPts[i];
        const knee = kneePts[i];
        // A-frame twin hinge roots on lower perimeter ring
        const rootLeft: [number, number, number] = [
          Math.cos(ang - 0.32) * 0.66,
          0.60,
          Math.sin(ang - 0.32) * 0.66,
        ];
        const rootRight: [number, number, number] = [
          Math.cos(ang + 0.32) * 0.66,
          0.60,
          Math.sin(ang + 0.32) * 0.66,
        ];

        return (
          <group key={`surv-leg-full-${i}`}>
            {/* Twin Lower A-Frame Struts to Knee Hinge */}
            <Strut from={rootLeft} to={knee} radius={0.024} color="#e2e8f0" />
            <Strut from={rootRight} to={knee} radius={0.024} color="#e2e8f0" />
            {/* Diagonal Hydraulic Oleo Shock Absorber Strut from Upper Apex to Footpad Ball-Joint */}
            <Strut from={pU} to={knee} radius={0.022} color="#64748b" metalness={0.88} />
            <Strut from={knee} to={pad} radius={0.032} color="#f1f5f9" metalness={0.85} />
            {/* Crushable Honeycomb Aluminum Impact Block under Chassis Hinge */}
            <mesh position={[Math.cos(ang) * 0.85, 0.38, Math.sin(ang) * 0.85]} rotation={[0, -ang, 0.3]} castShadow>
              <boxGeometry args={[0.16, 0.14, 0.18]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.4} />
            </mesh>
            {/* Hinged Ball-Joint Coupling */}
            <JointLug at={knee} radius={0.045} color="#475569" />
            <JointLug at={pad} radius={0.048} color="#94a3b8" />
            {/* Crushable Aluminum Footpad (Bottom Strictly at y = 0.0) */}
            <mesh position={[pad[0], 0.045, pad[2]]} castShadow receiveShadow>
              <cylinderGeometry args={[0.20, 0.27, 0.09, 24]} />
              <meshStandardMaterial
                map={tex.silverFoilMap}
                normalMap={tex.silverFoilNormal}
                color="#e2e8f0"
                metalness={0.68}
                roughness={0.35}
              />
            </mesh>
            {/* Dark Anodized Crush Skirt Ring at Ground Contact */}
            <mesh position={[pad[0], 0.015, pad[2]]} receiveShadow>
              <cylinderGeometry args={[0.275, 0.285, 0.03, 24]} />
              <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.65} />
            </mesh>
          </group>
        );
      })}

      {/* ═══ 3. PROPULSION CORE: TITANIUM HELIUM/PROPELLANT SPHERES & 3 VERNIER NOZZLES ═══ */}
      {/* Central Retro Attachment Collar Ring */}
      <mesh position={[0, 0.62, 0]} castShadow>
        <cylinderGeometry args={[0.38, 0.42, 0.16, 24]} />
        <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.32} />
      </mesh>
      {/* Spherical Gold-Wrapped Fuel & Helium Pressurant Tanks + Feed Lines */}
      {[0.4, 2.5, 4.6].map((ang, i) => {
        const tx = Math.cos(ang) * 0.24;
        const tz = Math.sin(ang) * 0.24;
        return (
          <React.Fragment key={`surv-tank-${i}`}>
            <mesh position={[tx, 0.82, tz]} castShadow>
              <sphereGeometry args={[0.17, 20, 20]} />
              <meshStandardMaterial
                map={tex.goldFoilMap}
                normalMap={tex.goldFoilNormal}
                normalScale={normalVec}
                metalness={0.65}
                roughness={0.28}
              />
            </mesh>
            <Strut from={[tx, 0.70, tz]} to={[lowerPts[i][0] * 0.86, 0.56, lowerPts[i][2] * 0.86]} radius={0.012} color="#e2e8f0" />
          </React.Fragment>
        );
      })}
      {/* 3 Throttleable Vernier Engine Bells + Gimbal Collars at Chassis Corners */}
      {lowerPts.map((p, i) => (
        <group key={`surv-vernier-${i}`} position={[p[0] * 0.92, 0.45, p[2] * 0.92]}>
          <mesh position={[0, 0.11, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.055, 0.06, 14]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.86} roughness={0.28} />
          </mesh>
          <mesh castShadow>
            <coneGeometry args={[0.105, 0.22, 20, 1, true]} />
            <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.32} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
      {/* Canopus Star Tracker & Sun Sensor Optical Baffle Cone */}
      <group position={[-0.12, 1.05, -0.18]} rotation={[0.25, 0.4, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.065, 0.048, 0.14, 14]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.45} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.072, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.01, 14]} />
          <meshStandardMaterial color="#0ea5e9" emissive="#0284c7" emissiveIntensity={0.35} />
        </mesh>
      </group>

      {/* ═══ 4. ELECTRONICS COMPARTMENTS A & B (CRINKLED ALUMINIZED MYLAR BLANKETS) ═══ */}
      {/* Compartment A */}
      <group position={[-0.42, 0.86, 0.26]} rotation={[0, -0.52, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.42, 0.44, 0.32]} />
          <meshStandardMaterial
            map={tex.silverFoilMap}
            normalMap={tex.silverFoilNormal}
            normalScale={normalVec}
            metalness={0.76}
            roughness={0.28}
          />
        </mesh>
        {/* Thermal White Louver Top Radiator Lid */}
        <mesh position={[0, 0.23, 0]} castShadow>
          <boxGeometry args={[0.44, 0.04, 0.34]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.55} metalness={0.15} />
        </mesh>
      </group>

      {/* Compartment B */}
      <group position={[0.16, 0.86, -0.48]} rotation={[0, 0.38, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.40, 0.40, 0.30]} />
          <meshStandardMaterial
            map={tex.silverFoilMap}
            normalMap={tex.silverFoilNormal}
            normalScale={normalVec}
            metalness={0.76}
            roughness={0.28}
          />
        </mesh>
        <mesh position={[0, 0.21, 0]} castShadow>
          <boxGeometry args={[0.42, 0.04, 0.32]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} metalness={0.15} />
        </mesh>
      </group>

      {/* ═══ 5. FOLDING OMNIDIRECTIONAL CONICAL WHIP ANTENNAS ═══ */}
      <Strut from={upperPts[1]} to={[-0.95, 1.62, -0.52]} radius={0.015} color="#e2e8f0" />
      <mesh position={[-0.98, 1.68, -0.54]} rotation={[0.3, 0, 0.5]} castShadow>
        <coneGeometry args={[0.08, 0.16, 12, 1, true]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.85} roughness={0.25} side={THREE.DoubleSide} />
      </mesh>
      <Strut from={upperPts[2]} to={[-0.45, 1.68, 0.92]} radius={0.015} color="#e2e8f0" />
      <mesh position={[-0.47, 1.74, 0.95]} rotation={[-0.35, 0, 0.3]} castShadow>
        <coneGeometry args={[0.08, 0.16, 12, 1, true]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.85} roughness={0.25} side={THREE.DoubleSide} />
      </mesh>

      {/* ═══ 6. VERTICAL VIDICON MIRROR-SWEEP TV CAMERA TURRET ═══ */}
      <group position={[0.26, 1.38, 0.22]}>
        {/* Mounting Bracket to Frame Apex */}
        <Strut from={[0, -0.22, 0]} to={[0.12, -0.22, -0.15]} radius={0.018} color="#94a3b8" />
        {/* White Thermal Camera Barrel */}
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.095, 0.105, 0.48, 20]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.45} metalness={0.25} />
        </mesh>
        {/* Top Azimuth Drive Turret & Tilted Mirror Periscope Hood */}
        <mesh position={[0, 0.30, 0.02]} rotation={[0.42, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.10, 0.10, 0.20, 20]} />
          <meshStandardMaterial color="#1e293b" metalness={0.82} roughness={0.28} />
        </mesh>
        {/* Sapphire Coated Optical Mirror Lens Window */}
        <mesh position={[0.03, 0.32, 0.09]} rotation={[0.42, 0.3, 0]}>
          <cylinderGeometry args={[0.068, 0.068, 0.03, 20]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.45} metalness={0.3} roughness={0.08} />
        </mesh>
      </group>

      {/* ═══ 7. CENTRAL MAST + PLANAR SLOTTED ANTENNA + 792-CELL SOLAR ARRAY WING ═══ */}
      <Strut from={mastBase} to={mastTop} radius={0.038} color="#e2e8f0" metalness={0.88} />
      {/* Mast Gold Thermal Collar Sleeves & Telemetry Conduit */}
      {[1.55, 2.05].map((my, idx) => (
        <mesh key={`surv-collar-${idx}`} position={[0, my, 0]} castShadow>
          <cylinderGeometry args={[0.052, 0.052, 0.16, 16]} />
          <meshStandardMaterial
            map={tex.goldFoilMap}
            normalMap={tex.goldFoilNormal}
            metalness={0.65}
            roughness={0.28}
          />
        </mesh>
      ))}
      {/* Elevation Gimbal Yoke & Brace Arms */}
      <JointLug at={[0, 2.38, 0]} radius={0.062} color="#64748b" />
      <JointLug at={[0, 2.75, 0]} radius={0.055} color="#64748b" />
      <Strut from={[0, 2.24, 0]} to={[0.12, 2.40, 0.06]} radius={0.016} color="#94a3b8" />
      <Strut from={[0, 2.66, 0]} to={[-0.14, 2.82, -0.04]} radius={0.016} color="#94a3b8" />

      {/* Slotted Waveguide Planar High-Gain Antenna Array */}
      <group position={[0.12, 2.40, 0.06]} rotation={[0.48, -0.35, -0.18]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.92, 0.045, 0.92]} />
          <meshStandardMaterial
            map={tex.antennaMeshMap}
            bumpMap={tex.antennaMeshBump}
            bumpScale={0.015}
            metalness={0.48}
            roughness={0.34}
          />
        </mesh>
        {/* Coaxial Feed Horn & Waveguide Tip */}
        <mesh position={[0, 0.08, 0]} castShadow>
          <cylinderGeometry args={[0.018, 0.028, 0.14, 14]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.86} roughness={0.22} />
        </mesh>
        {/* Structural Aluminum Perimeter Frame & Rear Ribs */}
        <mesh position={[0, -0.03, 0]} castShadow>
          <boxGeometry args={[0.96, 0.025, 0.06]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.82} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.03, 0]} castShadow>
          <boxGeometry args={[0.06, 0.025, 0.96]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.82} roughness={0.3} />
        </mesh>
      </group>

      {/* Photovoltaic 792-Cell Solar Array Panel */}
      <group position={[-0.14, 2.82, -0.04]} rotation={[0.38, -0.25, 0.28]}>
        {/* Aluminum Honeycomb Backing Frame & Cross Ribs */}
        <mesh position={[0, -0.02, 0]} castShadow>
          <boxGeometry args={[0.84, 0.028, 1.12]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.82} roughness={0.28} />
        </mesh>
        <mesh position={[0, -0.04, 0]} castShadow>
          <boxGeometry args={[0.78, 0.02, 0.05]} />
          <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.3} />
        </mesh>
        {/* Deep Silicon Solar Cells Face */}
        <mesh position={[0, 0.005, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.78, 0.022, 1.06]} />
          <meshStandardMaterial
            map={tex.solarMap}
            bumpMap={tex.solarBump}
            bumpScale={0.012}
            metalness={0.36}
            roughness={0.18}
          />
        </mesh>
      </group>

      {/* ═══ 8. ARTICULATED PANTOGRAPH SOIL MECHANICS SURFACE SAMPLER (SMSS) ═══ */}
      <group>
        {/* Shoulder Azimuth Motor Housing Mounted at Front Right */}
        <mesh position={[0.42, 0.66, 0.42]} castShadow>
          <boxGeometry args={[0.16, 0.14, 0.16]} />
          <meshStandardMaterial color="#475569" metalness={0.82} roughness={0.32} />
        </mesh>
        {/* Extending Scissor Pantograph X-Lattice Links (Zero Gap Joints) */}
        <Strut from={[0.44, 0.66, 0.44]} to={[0.72, 0.52, 0.66]} radius={0.014} color="#cbd5e1" />
        <Strut from={[0.44, 0.56, 0.44]} to={[0.72, 0.36, 0.66]} radius={0.014} color="#94a3b8" />
        <Strut from={[0.44, 0.66, 0.44]} to={[0.72, 0.36, 0.66]} radius={0.011} color="#e2e8f0" />
        <Strut from={[0.44, 0.56, 0.44]} to={[0.72, 0.52, 0.66]} radius={0.011} color="#e2e8f0" />
        <JointLug at={[0.72, 0.52, 0.66]} radius={0.022} color="#64748b" />
        <JointLug at={[0.72, 0.36, 0.66]} radius={0.022} color="#64748b" />

        <Strut from={[0.72, 0.52, 0.66]} to={[1.04, 0.24, 0.96]} radius={0.014} color="#cbd5e1" />
        <Strut from={[0.72, 0.36, 0.66]} to={[1.04, 0.16, 0.96]} radius={0.014} color="#94a3b8" />
        <Strut from={[0.72, 0.52, 0.66]} to={[1.04, 0.16, 0.96]} radius={0.011} color="#e2e8f0" />
        <Strut from={[0.72, 0.36, 0.66]} to={[1.04, 0.24, 0.96]} radius={0.011} color="#e2e8f0" />

        {/* Hinged Regolith Scoop Bucket & Trenching Blade */}
        <group position={[1.08, 0.14, 1.00]} rotation={[0.25, -0.78, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.13, 0.11, 0.22]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.86} roughness={0.28} />
          </mesh>
          <mesh position={[0, -0.04, 0.11]} rotation={[0.4, 0, 0]} castShadow>
            <boxGeometry args={[0.14, 0.02, 0.08]} />
            <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.3} />
          </mesh>
        </group>

        {/* Dug Regolith Sample Trench Mound on Lunar Surface */}
        <mesh position={[1.20, 0.02, 1.12]} rotation={[0, -0.78, 0]} scale={[1.1, 0.35, 1.6]} receiveShadow>
          <dodecahedronGeometry args={[0.18, 1]} />
          <meshStandardMaterial color="#4b4e54" roughness={0.96} metalness={0.02} />
        </mesh>
      </group>

      {showShadow && <ContactShadowPlane radius={2.2} isMars={false} />}
    </group>
  );
};

// ============================================================================
// 2. CHANG'E 4 & YUTU-2 FAR-SIDE ROVER (CNSA 2019 — HIGH-DETAIL GOLD KAPTON)
// ============================================================================
export const DetailedYutu2Rover: React.FC<{ showShadow?: boolean }> = ({
  showShadow = true,
}) => {
  const tex = useMemo(() => getSpaceHardwareTextures(), []);
  const normalVec = useMemo(() => new THREE.Vector2(0.9, 0.9), []);
  const dishGeo = useParabolicDishGeo(0.28, 0.11, 28);

  const wheelPositionsZ = [-0.54, 0.02, 0.56];
  const grouserAngles = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (i * Math.PI * 2) / 12);

  return (
    <group position={[0, 0, 0]}>
      {/* ═══ 1. MAIN BUS IN CRINKLED GOLD KAPTON MLI + WHITE RADIATOR TOP DECK ═══ */}
      <group position={[0, 0.62, 0]}>
        {/* Primary Gold Thermal Blanket Chassis */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.96, 0.40, 1.32]} />
          <meshStandardMaterial
            map={tex.goldFoilMap}
            normalMap={tex.goldFoilNormal}
            normalScale={normalVec}
            metalness={0.56}
            roughness={0.32}
            emissive="#78350f"
            emissiveIntensity={0.14}
          />
        </mesh>
        {/* Brushed Titanium Edge Structural Frame Rails */}
        <mesh position={[0, 0.21, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.00, 0.045, 1.36]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.42} metalness={0.35} />
        </mesh>
        {/* Upper Thermal Radiator Fin louvers */}
        {[-0.36, -0.18, 0, 0.18, 0.36].map((rz, idx) => (
          <mesh key={`yutu-rad-${idx}`} position={[0, 0.24, rz]} castShadow>
            <boxGeometry args={[0.68, 0.025, 0.09]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.75} roughness={0.3} />
          </mesh>
        ))}

        {/* Front Recessed Black Hazard Avoidance Stereo Camera (HazCam) Bar */}
        <group position={[0, -0.02, 0.67]}>
          <mesh castShadow>
            <boxGeometry args={[0.54, 0.13, 0.04]} />
            <meshStandardMaterial color="#0f172a" metalness={0.65} roughness={0.3} />
          </mesh>
          {[-0.17, 0.17].map((hx, idx) => (
            <mesh key={`hazcam-${idx}`} position={[hx, 0, 0.022]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.036, 0.036, 0.02, 16]} />
              <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.35} roughness={0.1} metalness={0.4} />
            </mesh>
          ))}
        </group>

        {/* Gold Foil Side Instrument Panel & CNSA Badge */}
        <mesh position={[0.49, 0.02, 0]} castShadow>
          <boxGeometry args={[0.02, 0.24, 0.65]} />
          <meshStandardMaterial
            map={tex.silverFoilMap}
            normalMap={tex.silverFoilNormal}
            metalness={0.72}
            roughness={0.28}
          />
        </mesh>
      </group>

      {/* ═══ 2. ARTICULATED 6-WHEEL ROCKER-BOGIE TITANIUM SUSPENSION ═══ */}
      {[-1, 1].map((side) => {
        const trackX = side * 0.64;
        const bodyAttach: [number, number, number] = [side * 0.48, 0.62, 0.05];
        const frontHub: [number, number, number] = [trackX, 0.21, 0.56];
        const midHub: [number, number, number] = [trackX, 0.21, 0.02];
        const rearHub: [number, number, number] = [trackX, 0.21, -0.54];
        const bogiePivot: [number, number, number] = [side * 0.56, 0.44, 0.28];
        const rearKnee: [number, number, number] = [side * 0.56, 0.45, -0.26];

        return (
          <group key={`yutu-susp-${side}`}>
            {/* Main RockerPivot Hub */}
            <JointLug at={bodyAttach} radius={0.055} color="#cbd5e1" />
            <JointLug at={bogiePivot} radius={0.042} color="#94a3b8" />
            <JointLug at={rearKnee} radius={0.042} color="#94a3b8" />

            {/* Forward Bogie Links */}
            <Strut from={bodyAttach} to={bogiePivot} radius={0.024} color="#e2e8f0" />
            <Strut from={bogiePivot} to={frontHub} radius={0.022} color="#cbd5e1" />
            <Strut from={bogiePivot} to={midHub} radius={0.022} color="#cbd5e1" />
            {/* Rear Rocker Arm */}
            <Strut from={bodyAttach} to={rearKnee} radius={0.024} color="#e2e8f0" />
            <Strut from={rearKnee} to={rearHub} radius={0.022} color="#cbd5e1" />

            {/* 3 Detailed Wire-Mesh Grouser Wheels on This Side (Flush on y = 0.0) */}
            {wheelPositionsZ.map((wz, wIdx) => (
              <group key={`yutu-wheel-${side}-${wIdx}`} position={[trackX, 0.21, wz]}>
                {/* Outer Wire-Mesh Rim */}
                <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
                  <cylinderGeometry args={[0.20, 0.20, 0.16, 24]} />
                  <meshStandardMaterial color="#475569" metalness={0.78} roughness={0.38} />
                </mesh>
                {/* Brushed Aluminum Inner Wheel Hub & Drive Cap */}
                <mesh position={[side * 0.04, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                  <cylinderGeometry args={[0.11, 0.13, 0.11, 18]} />
                  <meshStandardMaterial color="#e2e8f0" metalness={0.85} roughness={0.25} />
                </mesh>
                <mesh position={[side * 0.095, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.045, 0.06, 0.03, 14]} />
                  <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.28} />
                </mesh>
                {/* Radial Spoke Ribs on Wheel Face */}
                {[0, Math.PI / 3, (2 * Math.PI) / 3].map((sRot, sIdx) => (
                  <mesh key={`yutu-spoke-${sIdx}`} position={[side * 0.083, 0, 0]} rotation={[sRot, 0, 0]}>
                    <boxGeometry args={[0.012, 0.36, 0.022]} />
                    <meshStandardMaterial color="#cbd5e1" metalness={0.86} roughness={0.26} />
                  </mesh>
                ))}
                {/* Radial Grouser Traction Cleats */}
                {grouserAngles.map((ga, gIdx) => (
                  <mesh
                    key={`cleat-${gIdx}`}
                    position={[0, Math.sin(ga) * 0.202, Math.cos(ga) * 0.202]}
                    rotation={[-ga, 0, 0]}
                    castShadow
                  >
                    <boxGeometry args={[0.155, 0.015, 0.018]} />
                    <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.35} />
                  </mesh>
                ))}
              </group>
            ))}
          </group>
        );
      })}

      {/* ═══ 3. TWIN FOLDING GAAS PHOTOVOLTAIC SOLAR WINGS + LOCK STRUTS ═══ */}
      {[-1, 1].map((side) => (
        <React.Fragment key={`yutu-wing-${side}`}>
          <group
            position={[side * 0.50, 0.78, 0]}
            rotation={[0, 0, -side * 0.18]}
          >
            {/* Silver Wing Hinge Bracket */}
            <mesh position={[side * 0.02, 0, 0]} castShadow>
              <boxGeometry args={[0.08, 0.05, 0.96]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.85} roughness={0.28} />
            </mesh>
            {/* Aluminum Backing Tray */}
            <mesh position={[side * 0.48, -0.01, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.88, 0.026, 1.08]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Deep Silicon Solar Wafer Mosaic Face */}
            <mesh position={[side * 0.48, 0.014, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.84, 0.018, 1.02]} />
              <meshStandardMaterial
                map={tex.solarMap}
                bumpMap={tex.solarBump}
                bumpScale={0.014}
                metalness={0.38}
                roughness={0.18}
              />
            </mesh>
          </group>
          {/* Twin Wing Deployment Lock Struts Linking Chassis to Backing Tray */}
          <Strut from={[side * 0.46, 0.62, -0.28]} to={[side * 0.86, 0.70, -0.28]} radius={0.012} color="#94a3b8" />
          <Strut from={[side * 0.46, 0.62, 0.28]} to={[side * 0.86, 0.70, 0.28]} radius={0.012} color="#94a3b8" />
        </React.Fragment>
      ))}

      {/* ═══ 4. DUAL-EYE PANCAM / NAVCAM STEREO MAST HEAD ═══ */}
      <group position={[0.04, 0.84, 0.44]}>
        {/* Vertical Tubular Mast + Gold Harness Wrap */}
        <mesh position={[0, 0.28, 0]} castShadow>
          <cylinderGeometry args={[0.036, 0.042, 0.56, 16]} />
          <meshStandardMaterial color="#f1f5f9" metalness={0.75} roughness={0.28} />
        </mesh>
        {/* Pan-Tilt Azimuth Yoke */}
        <mesh position={[0, 0.56, 0]} castShadow>
          <boxGeometry args={[0.14, 0.08, 0.12]} />
          <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.3} />
        </mesh>
        {/* Panoramic Stereo Camera Optical Box */}
        <group position={[0, 0.65, 0.02]}>
          <mesh castShadow>
            <boxGeometry args={[0.44, 0.14, 0.18]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.45} roughness={0.35} />
          </mesh>
          {/* Gold Top Thermal Sun Visor */}
          <mesh position={[0, 0.08, 0.02]} castShadow>
            <boxGeometry args={[0.46, 0.025, 0.22]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.75} roughness={0.28} />
          </mesh>
          {/* 4 Recessed Navigation & Panoramic Lenses */}
          {[-0.16, -0.06, 0.06, 0.16].map((cx, i) => (
            <group key={`yutu-cam-${i}`} position={[cx, 0, 0.10]}>
              <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[i === 0 || i === 3 ? 0.042 : 0.028, i === 0 || i === 3 ? 0.042 : 0.028, 0.035, 16]} />
                <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
              </mesh>
              <mesh position={[0, 0, 0.018]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[i === 0 || i === 3 ? 0.03 : 0.02, i === 0 || i === 3 ? 0.03 : 0.02, 0.01, 16]} />
                <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.45} metalness={0.3} roughness={0.1} />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* ═══ 5. QUEQIAO L2 RELAY HIGH-GAIN PARABOLIC DISH + FEED TRIPOD ═══ */}
      <group position={[-0.24, 0.92, -0.36]}>
        <Strut from={[0, -0.08, 0]} to={[0, 0.16, 0]} radius={0.024} color="#cbd5e1" />
        <group position={[0, 0.16, 0]} rotation={[0.52, -0.35, 0]}>
          <mesh geometry={dishGeo} castShadow receiveShadow>
            <meshStandardMaterial
              map={tex.antennaMeshMap}
              bumpMap={tex.antennaMeshBump}
              color="#f8fafc"
              metalness={0.45}
              roughness={0.35}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Feed Horn Tripod */}
          <Strut from={[0.18, 0.04, 0]} to={[0, 0.24, 0]} radius={0.008} color="#94a3b8" />
          <Strut from={[-0.12, 0.04, 0.15]} to={[0, 0.24, 0]} radius={0.008} color="#94a3b8" />
          <Strut from={[-0.12, 0.04, -0.15]} to={[0, 0.24, 0]} radius={0.008} color="#94a3b8" />
          <mesh position={[0, 0.24, 0]} castShadow>
            <cylinderGeometry args={[0.026, 0.036, 0.06, 12]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.82} roughness={0.28} />
          </mesh>
        </group>
      </group>

      {/* ═══ 6. REAR LPR (LUNAR PENETRATING RADAR) TWIN DIPOLE WHIPS & ROBOTIC ARM ═══ */}
      {[-0.22, 0.22].map((lx, idx) => (
        <Strut
          key={`yutu-lpr-${idx}`}
          from={[lx, 0.48, -0.60]}
          to={[lx, 0.34, -0.96]}
          radius={0.011}
          color="#cbd5e1"
        />
      ))}
      {showShadow && <ContactShadowPlane radius={1.65} isMars={false} />}
    </group>
  );
};

// ============================================================================
// 3. DETAILED ISRO PRAGYAN ROVER & ALUMINUM ROLLOUT RAMP (CHANDRAYAAN-3)
// ============================================================================
export const DetailedPragyanRover: React.FC<{
  position?: [number, number, number];
  rotation?: [number, number, number];
  showShadow?: boolean;
}> = ({
  position = [2.05, 0, 1.45],
  rotation = [0, 0.52, 0],
  showShadow = true,
}) => {
  const tex = useMemo(() => getSpaceHardwareTextures(), []);
  const normalVec = useMemo(() => new THREE.Vector2(0.85, 0.85), []);

  const wheelRimR = 0.092;
  const cleatCount = 10;

  return (
    <group position={position} rotation={rotation}>
      {/* Gold Kapton Thermal Warm Electronics Box (WEB) Chassis */}
      <mesh position={[0, 0.295, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.44, 0.185, 0.56]} />
        <meshStandardMaterial
          map={tex.goldFoilMap}
          normalMap={tex.goldFoilNormal}
          normalScale={normalVec}
          metalness={0.62}
          roughness={0.28}
          emissive="#78350f"
          emissiveIntensity={0.12}
        />
      </mesh>
      {/* Brushed Aluminum Structural Deck Frame & Lower Belly Skid Plate */}
      <mesh position={[0, 0.392, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.455, 0.018, 0.575]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.78} roughness={0.26} />
      </mesh>
      <mesh position={[0, 0.198, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.018, 0.52]} />
        <meshStandardMaterial color="#334155" metalness={0.75} roughness={0.4} />
      </mesh>
      {/* Top Optical Solar Reflector (OSR) Thermal Radiator & ISRO Insignia Trim */}
      <mesh position={[0.04, 0.405, -0.02]} receiveShadow>
        <boxGeometry args={[0.31, 0.008, 0.42]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.18} roughness={0.22} />
      </mesh>
      {[-0.14, -0.04, 0.06, 0.16].map((rz, idx) => (
        <mesh key={`prag-louvre-${idx}`} position={[0.04, 0.411, rz]}>
          <boxGeometry args={[0.26, 0.005, 0.022]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.82} roughness={0.3} />
        </mesh>
      ))}
      {/* Front & Aft Gold-Anodized Corner Bumpers & Telemetry Junction Boxes */}
      {[-1, 1].map((ez) => (
        <mesh key={`prag-bumper-${ez}`} position={[0, 0.29, ez * 0.286]} castShadow>
          <boxGeometry args={[0.36, 0.06, 0.02]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.82} roughness={0.28} />
        </mesh>
      ))}

      {/* Hinged 50W Deployable Solar Array Panel + Bezel + Dual Hydraulic Struts */}
      <group position={[-0.215, 0.405, 0]} rotation={[0, 0, 0.46]}>
        {/* Anodized Aluminum Solar Panel Frame */}
        <mesh position={[0, 0.19, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.024, 0.46, 0.54]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.84} roughness={0.26} />
        </mesh>
        {/* Active Photovoltaic Cell Face */}
        <mesh position={[0.014, 0.19, 0]} castShadow>
          <boxGeometry args={[0.008, 0.43, 0.50]} />
          <meshStandardMaterial
            map={tex.solarMap}
            bumpMap={tex.solarBump}
            bumpScale={0.012}
            metalness={0.35}
            roughness={0.16}
          />
        </mesh>
      </group>
      {/* Dual Linear Deployment Struts bracing Solar Panel to Deck */}
      <Strut from={[-0.12, 0.405, -0.17]} to={[-0.29, 0.57, -0.17]} radius={0.007} color="#e2e8f0" />
      <Strut from={[-0.12, 0.405, 0.17]} to={[-0.29, 0.57, 0.17]} radius={0.007} color="#e2e8f0" />

      {/* Front Dual Stereo NavCam Stanchion, Optics & Lens Hoods */}
      <mesh position={[0.16, 0.425, 0.20]} castShadow>
        <boxGeometry args={[0.055, 0.055, 0.06]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.82} roughness={0.28} />
      </mesh>
      <mesh position={[0.175, 0.475, 0.20]} castShadow>
        <boxGeometry args={[0.095, 0.065, 0.20]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.42} roughness={0.28} />
      </mesh>
      {[-0.055, 0.055].map((nz, idx) => (
        <group key={`prag-lens-${idx}`} position={[0.226, 0.476, 0.20 + nz]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.026, 0.028, 0.022, 16]} />
            <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
          </mesh>
          <mesh position={[0.011, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.018, 0.018, 0.006, 16]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.48} metalness={0.2} roughness={0.12} />
          </mesh>
        </group>
      ))}
      {/* Sun Sensor Optical Dome on NavCam Deck */}
      <mesh position={[0.165, 0.516, 0.20]} castShadow>
        <cylinderGeometry args={[0.016, 0.02, 0.016, 14]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.88} roughness={0.2} />
      </mesh>

      {/* Ventral LIBS Laser Spectrometer Aperture & Shroud */}
      <group position={[0.08, 0.17, 0.17]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.036, 0.028, 0.048, 16]} />
          <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.026, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 0.008, 12]} />
          <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.4} metalness={0.3} roughness={0.15} />
        </mesh>
      </group>

      {/* Deployed Aft-Side APXS Alpha Particle X-Ray Spectrometer Arm */}
      <JointLug at={[0.02, 0.24, -0.27]} radius={0.02} color="#e2e8f0" />
      <Strut from={[0.02, 0.24, -0.27]} to={[0.02, 0.12, -0.36]} radius={0.008} color="#cbd5e1" />
      <mesh position={[0.02, 0.095, -0.37]} rotation={[0.45, 0, 0]} castShadow>
        <cylinderGeometry args={[0.032, 0.026, 0.055, 16]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.82} roughness={0.24} />
      </mesh>

      {/* Rear Ka-Band Telemetry Omni Whip Antenna & Gold Coaxial Pedestal */}
      <group position={[-0.13, 0.405, -0.22]}>
        <mesh position={[0, 0.022, 0]} castShadow>
          <cylinderGeometry args={[0.022, 0.028, 0.044, 14]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.86} roughness={0.22} />
        </mesh>
        <mesh position={[0, 0.19, 0]} castShadow>
          <cylinderGeometry args={[0.004, 0.007, 0.31, 10]} />
          <meshStandardMaterial color="#f1f5f9" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <sphereGeometry args={[0.012, 10, 10]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.85} roughness={0.2} />
        </mesh>
      </group>

      {/* Roof Differential Cross-Bar Pivot Linking Left & Right Rockers */}
      <Strut from={[-0.23, 0.398, 0.02]} to={[0.23, 0.398, 0.02]} radius={0.009} color="#cbd5e1" />
      <JointLug at={[0, 0.405, 0.02]} radius={0.022} color="#f59e0b" />
      {[-1, 1].map((side) => (
        <React.Fragment key={`prag-diff-${side}`}>
          <JointLug at={[side * 0.23, 0.398, 0.02]} radius={0.015} color="#94a3b8" />
          <Strut from={[side * 0.23, 0.398, 0.02]} to={[side * 0.235, 0.295, 0.02]} radius={0.008} color="#94a3b8" />
        </React.Fragment>
      ))}

      {/* Articulated Rocker-Bogie Suspension + 6 Grouser-Cleated Lunar Wheels (Flush y = 0) */}
      {[-1, 1].map((side) => (
        <React.Fragment key={`prag-side-${side}`}>
          {/* Main Side Shoulder Clevis Pivot */}
          <JointLug at={[side * 0.235, 0.295, 0.02]} radius={0.022} color="#e2e8f0" />
          {/* Primary Rocker: Forward to Front Steering Damper Knuckle + Aft to Bogie Pivot */}
          <Strut from={[side * 0.235, 0.295, 0.02]} to={[side * 0.29, 0.175, 0.24]} radius={0.011} color="#e2e8f0" />
          <Strut from={[side * 0.235, 0.295, 0.02]} to={[side * 0.26, 0.215, -0.11]} radius={0.011} color="#e2e8f0" />
          {/* Front Fork Vertical Steering Tube */}
          <JointLug at={[side * 0.29, 0.175, 0.24]} radius={0.017} color="#fbbf24" />
          <Strut from={[side * 0.29, 0.175, 0.24]} to={[side * 0.29, wheelRimR, 0.24]} radius={0.01} color="#cbd5e1" />
          {/* Bogie Pivot + Twin Legs to Middle & Rear Wheel Knuckles */}
          <JointLug at={[side * 0.26, 0.215, -0.11]} radius={0.019} color="#fbbf24" />
          <Strut from={[side * 0.26, 0.215, -0.11]} to={[side * 0.29, wheelRimR, 0]} radius={0.01} color="#cbd5e1" />
          <Strut from={[side * 0.26, 0.215, -0.11]} to={[side * 0.29, wheelRimR, -0.24]} radius={0.01} color="#cbd5e1" />

          {[0.24, 0, -0.24].map((wz, wIdx) => (
            <group key={`prag-wh-${side}-${wIdx}`} position={[side * 0.295, wheelRimR, wz]}>
              {/* Dark Titanium Machined Rim Cylinder */}
              <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
                <cylinderGeometry args={[wheelRimR, wheelRimR, 0.062, 24]} />
                <meshStandardMaterial color="#334155" metalness={0.84} roughness={0.34} />
              </mesh>
              {/* Gold Anodized Center Hub Drive Cap */}
              <mesh position={[side * 0.033, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.036, 0.036, 0.01, 14]} />
                <meshStandardMaterial color="#f59e0b" metalness={0.88} roughness={0.22} />
              </mesh>
              {/* Radial Spoke Webbing on Outer Wheel Face */}
              {[0, Math.PI / 2].map((sRot, sIdx) => (
                <mesh key={`prag-spoke-${sIdx}`} position={[side * 0.032, 0, 0]} rotation={[sRot, 0, 0]}>
                  <boxGeometry args={[0.006, wheelRimR * 1.82, 0.014]} />
                  <meshStandardMaterial color="#94a3b8" metalness={0.86} roughness={0.25} />
                </mesh>
              ))}
              {/* Circumferential Traction Grouser Cleats (Flush on Wheel Radius) */}
              {Array.from({ length: cleatCount }).map((_, cIdx) => {
                const theta = (cIdx / cleatCount) * Math.PI * 2;
                return (
                  <mesh
                    key={`prag-cleat-${cIdx}`}
                    position={[0, Math.cos(theta) * wheelRimR, Math.sin(theta) * wheelRimR]}
                    rotation={[-theta, 0, 0]}
                    castShadow
                  >
                    <boxGeometry args={[0.064, 0.008, 0.01]} />
                    <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.3} />
                  </mesh>
                );
              })}
            </group>
          ))}
        </React.Fragment>
      ))}
      {showShadow && <ContactShadowPlane radius={0.78} isMars={false} />}
    </group>
  );
};

// ============================================================================
// 4. APOLLO 17 TAURUS-LITTROW ALSEP CENTRAL STATION & SNAP-27 RTG GENERATOR
// ============================================================================
export const DetailedApolloALSEP: React.FC<{
  position?: [number, number, number];
  rotation?: [number, number, number];
  showShadow?: boolean;
}> = ({
  position = [-0.45, 0, -0.95],
  rotation = [0, 0.25, 0],
  showShadow = true,
}) => {
  const tex = useMemo(() => getSpaceHardwareTextures(), []);
  const normalVec = useMemo(() => new THREE.Vector2(0.8, 0.8), []);

  return (
    <group position={position} rotation={rotation}>
      {/* Central ALSEP Command/Telemetry Electronics Sunshield Box */}
      <group position={[0, 0.22, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.56, 0.36, 0.56]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.48} metalness={0.22} />
        </mesh>
        {/* Top Machined Equipment Bezel & Carry Socket Collar */}
        <mesh position={[0, 0.19, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.16, 0.04, 18]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.82} roughness={0.28} />
        </mesh>
        {/* 4 Corner Stabilizing Feet Grounded to y = 0 */}
        {[-1, 1].map((cx) =>
          [-1, 1].map((cz) => (
            <React.Fragment key={`alsep-foot-${cx}-${cz}`}>
              <Strut from={[cx * 0.24, -0.14, cz * 0.24]} to={[cx * 0.29, -0.21, cz * 0.29]} radius={0.014} color="#cbd5e1" />
              <mesh position={[cx * 0.29, -0.21, cz * 0.29]} receiveShadow>
                <cylinderGeometry args={[0.048, 0.056, 0.018, 12]} />
                <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.3} />
              </mesh>
            </React.Fragment>
          ))
        )}
        {/* Side Folded Gold Kapton Thermal Curtains */}
        <mesh position={[0, -0.02, 0]} castShadow>
          <boxGeometry args={[0.58, 0.22, 0.58]} />
          <meshStandardMaterial
            map={tex.goldFoilMap}
            normalMap={tex.goldFoilNormal}
            normalScale={normalVec}
            metalness={0.62}
            roughness={0.3}
          />
        </mesh>
        {/* Helical S-Band Earth-Aimed Telemetry Mast, Gold Helix & Feed Cone */}
        <Strut from={[0, 0.18, 0]} to={[0, 1.38, 0]} radius={0.022} color="#e2e8f0" />
        <mesh position={[0, 1.24, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.05, 0.34, 16, 1, true]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.25} side={THREE.DoubleSide} />
        </mesh>
        {[1.14, 1.22, 1.30].map((hy, idx) => (
          <mesh key={`alsep-helix-${idx}`} position={[0, hy, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.072, 0.008, 8, 20]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.88} roughness={0.2} />
          </mesh>
        ))}
        <mesh position={[0, 1.44, 0]} rotation={[0.25, 0, 0]} castShadow>
          <torusGeometry args={[0.16, 0.015, 10, 24]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.85} roughness={0.25} />
        </mesh>
      </group>

      {/* Flat Gold Kapton Telemetry Ribbon Cable Snaking Across Regolith to SNAP-27 RTG */}
      <mesh position={[0.45, 0.012, -0.22]} rotation={[0, -0.45, 0]} receiveShadow>
        <boxGeometry args={[0.92, 0.012, 0.07]} />
        <meshStandardMaterial color="#d97706" metalness={0.75} roughness={0.35} />
      </mesh>

      {/* SNAP-27 Radioisotope Thermoelectric Generator (Pu-238 8-Fin Beryllium Cask) */}
      <group position={[0.88, 0, -0.42]}>
        {/* Lower Cradle Frame & Tripod Pads Resting Flush on Surface */}
        <mesh position={[0, 0.04, 0]} receiveShadow>
          <cylinderGeometry args={[0.22, 0.26, 0.06, 16]} />
          <meshStandardMaterial color="#475569" metalness={0.82} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.32, 0]} castShadow>
          <cylinderGeometry args={[0.095, 0.095, 0.52, 20]} />
          <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.32} />
        </mesh>
        {/* Gold Lower Thermal Collar & Upper Astronaut Carry-Tool Bail */}
        <mesh position={[0, 0.11, 0]} castShadow>
          <cylinderGeometry args={[0.115, 0.115, 0.06, 18]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.85} roughness={0.24} />
        </mesh>
        <mesh position={[0, 0.59, 0]} castShadow>
          <torusGeometry args={[0.068, 0.011, 8, 18, Math.PI]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.88} roughness={0.22} />
        </mesh>
        {/* 8 Radial Magnesium-Thorium Cooling Fins */}
        {[0, 1, 2, 3].map((fIdx) => (
          <mesh key={`rtg-fin-${fIdx}`} position={[0, 0.32, 0]} rotation={[0, (fIdx * Math.PI) / 4, 0]} castShadow>
            <boxGeometry args={[0.38, 0.44, 0.018]} />
            <meshStandardMaterial color="#334155" metalness={0.82} roughness={0.36} />
          </mesh>
        ))}
      </group>

      {/* Secondary Ribbon Cable to LEAM / Heat Flow Probe */}
      <mesh position={[-0.42, 0.012, 0.24]} rotation={[0, 0.52, 0]} receiveShadow>
        <boxGeometry args={[0.78, 0.012, 0.06]} />
        <meshStandardMaterial color="#d97706" metalness={0.75} roughness={0.35} />
      </mesh>
      <group position={[-0.78, 0, 0.44]}>
        <mesh position={[0, 0.125, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.28, 0.22, 0.28]} />
          <meshStandardMaterial
            map={tex.silverFoilMap}
            normalMap={tex.silverFoilNormal}
            metalness={0.75}
            roughness={0.28}
          />
        </mesh>
        {/* LEAM Aperture Dust Sensor Hood & Gold Mirror Baffle */}
        <mesh position={[0.04, 0.25, 0]} rotation={[0, 0, -0.35]} castShadow>
          <boxGeometry args={[0.16, 0.024, 0.18]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.82} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.015, 0]} receiveShadow>
          <boxGeometry args={[0.32, 0.03, 0.32]} />
          <meshStandardMaterial color="#64748b" metalness={0.82} roughness={0.32} />
        </mesh>
      </group>

      {showShadow && <ContactShadowPlane radius={1.45} isMars={false} />}
    </group>
  );
};

// ============================================================================
// 5. SHORTY CRATER ORANGE VOLCANIC PYROCLASTIC SOIL & APOLLO TRIPOD GNOMON
// ============================================================================
export const DetailedShortyCraterSoil: React.FC<{ position?: [number, number, number] }> = ({
  position = [-1.05, 0, 1.35],
}) => {
  const tex = useMemo(() => getSpaceHardwareTextures(), []);

  return (
    <group position={position}>
      {/* Layered Pyroclastic Orange-Vermilion Trench & Ejecta Rim */}
      <mesh position={[0, 0.04, 0]} scale={[1.35, 0.24, 1.1]} receiveShadow castShadow>
        <sphereGeometry args={[0.45, 24, 16]} />
        <meshStandardMaterial color="#c2410c" roughness={0.95} metalness={0.02} />
      </mesh>
      <mesh position={[0.18, 0.055, -0.1]} scale={[0.92, 0.22, 0.85]} receiveShadow castShadow>
        <sphereGeometry args={[0.32, 20, 14]} />
        <meshStandardMaterial color="#ea580c" roughness={0.92} metalness={0.02} />
      </mesh>
      {/* Dark Titanium-Ilmenite Glassy Bead Seam */}
      <mesh position={[-0.14, 0.05, 0.14]} scale={[0.85, 0.18, 0.72]} receiveShadow>
        <sphereGeometry args={[0.26, 16, 12]} />
        <meshStandardMaterial color="#451a03" roughness={0.96} metalness={0.04} />
      </mesh>

      {/* Authentic Apollo Photogrammetric Geologic Gnomon Tripod */}
      <group position={[0.26, 0, 0.24]} rotation={[0, 0.45, 0]}>
        <Strut from={[-0.14, 0, 0.10]} to={[0, 0.42, 0]} radius={0.01} color="#e2e8f0" />
        <Strut from={[0.14, 0, 0.10]} to={[0, 0.42, 0]} radius={0.01} color="#e2e8f0" />
        <Strut from={[0, 0, -0.15]} to={[0, 0.42, 0]} radius={0.01} color="#e2e8f0" />
        {/* Weighted Gimballed Vertical Plumb Rod */}
        <Strut from={[0, 0.12, 0]} to={[0, 0.54, 0]} radius={0.012} color="#f8fafc" />
        {/* Munsell Color & Grayscale Calibration Reference Chart */}
        <mesh position={[0, 0.46, 0.03]} rotation={[0.15, 0, 0]} castShadow>
          <boxGeometry args={[0.24, 0.12, 0.016]} />
          <meshStandardMaterial map={tex.colorGnomonMap} roughness={0.45} metalness={0.08} />
        </mesh>
      </group>
    </group>
  );
};

// ============================================================================
// 6. APOLLO 11 ERECTABLE S-BAND UMBRELLA ANTENNA & 100-PRISM LRRR EASEL
// ============================================================================
export const DetailedSBandAntenna: React.FC<{ position?: [number, number, number]; rotation?: [number, number, number] }> = ({
  position = [2.5, 0, -1.2],
  rotation = [0, -0.45, 0],
}) => {
  const tex = useMemo(() => getSpaceHardwareTextures(), []);
  const dishGeo = useParabolicDishGeo(0.58, 0.20, 32);

  return (
    <group position={position} rotation={rotation}>
      {/* Tripod Tubular Legs Flush at y = 0 */}
      <Strut from={[-0.45, 0, 0.32]} to={[0, 0.72, 0]} radius={0.022} color="#e2e8f0" />
      <Strut from={[0.45, 0, 0.32]} to={[0, 0.72, 0]} radius={0.022} color="#e2e8f0" />
      <Strut from={[0, 0, -0.52]} to={[0, 0.72, 0]} radius={0.022} color="#e2e8f0" />
      <JointLug at={[0, 0.72, 0]} radius={0.06} color="#94a3b8" />
      <Strut from={[0, 0.72, 0]} to={[0, 1.02, 0]} radius={0.028} color="#cbd5e1" />

      {/* Aimed Parabolic Gold-Mesh Reflector Dish */}
      <group position={[0, 1.05, 0]} rotation={[-0.65, 0, 0]}>
        <mesh geometry={dishGeo} castShadow receiveShadow>
          <meshStandardMaterial
            map={tex.antennaMeshMap}
            bumpMap={tex.antennaMeshBump}
            color="#e2e8f0"
            metalness={0.62}
            roughness={0.34}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Central Feed Boom & Conical Dipole */}
        <Strut from={[0, 0, 0]} to={[0, 0.44, 0]} radius={0.015} color="#cbd5e1" />
        <mesh position={[0, 0.46, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.06, 0.09, 14]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.85} roughness={0.28} />
        </mesh>
      </group>
      <ContactShadowPlane radius={0.95} isMars={false} />
    </group>
  );
};

export const DetailedApolloLRRR: React.FC<{ position?: [number, number, number]; rotation?: [number, number, number] }> = ({
  position = [-2.2, 0, 1.4],
  rotation = [0, 0.4, 0],
}) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Grounded Base Cradle */}
      <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.68, 0.05, 0.56]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.38} />
      </mesh>
      {/* Aiming Hinged Easel */}
      <Strut from={[-0.28, 0.05, -0.20]} to={[-0.28, 0.42, 0.05]} radius={0.016} color="#e2e8f0" />
      <Strut from={[0.28, 0.05, -0.20]} to={[0.28, 0.42, 0.05]} radius={0.016} color="#e2e8f0" />
      {/* 100 Quartz Corner-Cube Reflector Array Pallet Aimed at Earth */}
      <group position={[0, 0.30, 0.04]} rotation={[-0.65, 0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.56, 0.06, 0.48]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Shimmering Optical Quartz Prism Cavity Matrix */}
        <mesh position={[0, 0.035, 0]}>
          <boxGeometry args={[0.48, 0.015, 0.40]} />
          <meshStandardMaterial
            color="#bae6fd"
            emissive="#0284c7"
            emissiveIntensity={0.25}
            metalness={0.92}
            roughness={0.08}
          />
        </mesh>
      </group>
      <ContactShadowPlane radius={0.75} isMars={false} />
    </group>
  );
};

// ============================================================================
// 7. ARTEMIS BASE CAMP DSN OPTICAL/KA-BAND COMMUNICATIONS & SOLAR TOWER
// ============================================================================
export const DetailedLunarCommsTower: React.FC<{ position?: [number, number, number]; rotation?: [number, number, number] }> = ({
  position = [-2.8, 0, 2.4],
  rotation = [0, -0.4, 0],
}) => {
  const tex = useMemo(() => getSpaceHardwareTextures(), []);
  const dishGeo = useParabolicDishGeo(0.55, 0.18, 32);

  return (
    <group position={position} rotation={rotation}>
      {/* Hexagonal Anchored Thermal Plinth */}
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.52, 0.16, 6]} />
        <meshStandardMaterial color="#334155" metalness={0.78} roughness={0.38} />
      </mesh>
      {/* Lattice Comms Mast */}
      <Strut from={[-0.22, 0.16, 0.12]} to={[0, 1.55, 0]} radius={0.022} color="#cbd5e1" />
      <Strut from={[0.22, 0.16, 0.12]} to={[0, 1.55, 0]} radius={0.022} color="#cbd5e1" />
      <Strut from={[0, 0.16, -0.24]} to={[0, 1.55, 0]} radius={0.022} color="#cbd5e1" />
      <Strut from={[0, 0.16, 0]} to={[0, 2.05, 0]} radius={0.034} color="#f1f5f9" />

      {/* Dual Vertical Sun-Tracking Solar Wings */}
      {[-1, 1].map((side) => (
        <mesh key={`art-wing-${side}`} position={[side * 0.48, 1.32, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.72, 0.92, 0.025]} />
          <meshStandardMaterial map={tex.solarMap} bumpMap={tex.solarBump} metalness={0.38} roughness={0.18} />
        </mesh>
      ))}

      {/* Earth-Aimed Deep Space Optical/Ka-Band Gimbal Dish */}
      <group position={[0, 2.08, 0]} rotation={[-0.58, 0, 0]}>
        <mesh geometry={dishGeo} castShadow>
          <meshStandardMaterial map={tex.antennaMeshMap} metalness={0.55} roughness={0.32} side={THREE.DoubleSide} />
        </mesh>
        <Strut from={[0, 0, 0]} to={[0, 0.38, 0]} radius={0.015} color="#94a3b8" />
        <mesh position={[0, 0.40, 0]}>
          <sphereGeometry args={[0.045, 14, 14]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.7} />
        </mesh>
      </group>
      <ContactShadowPlane radius={0.9} isMars={false} />
    </group>
  );
};

