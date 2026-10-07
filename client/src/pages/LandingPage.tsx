import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { DestinationType } from '../types';
import {
  Compass,
  CheckCircle2,
  Flame,
  Radio,
  Activity,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Wind,
  ShieldAlert,
  Gauge,
  Tv,
  Box,
  Volume2,
  VolumeX,
  FastForward,
  RotateCcw as ReplayIcon,
  MessageSquare
} from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { soundFx } from '../utils/soundEffects';

// ============================================================================
// 1. PHOTOREALISTIC SUPERSONIC THRUSTER PLUME (FOR 3D SIMULATOR MODE)
// ============================================================================
interface ThrusterPlumeProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  length?: number;
  radius?: number;
  colorType?: 'hydrazine' | 'hypergolic';
  intensity?: number;
}

function SupersonicThrusterPlume({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  length = 1.2,
  radius = 0.12,
  colorType = 'hydrazine',
  intensity = 1.0,
}: ThrusterPlumeProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const isHydrazine = colorType === 'hydrazine';
  const sheathColor = isHydrazine ? '#38bdf8' : '#f59e0b';
  const outerColor = isHydrazine ? '#0284c7' : '#ea580c';

  useFrame(() => {
    const jitter = (Math.random() - 0.5) * 0.12;
    if (coreRef.current) {
      coreRef.current.scale.y = 1.0 + jitter;
      coreRef.current.scale.x = 1.0 + (Math.random() - 0.5) * 0.08;
      coreRef.current.scale.z = coreRef.current.scale.x;
    }
    if (lightRef.current) {
      lightRef.current.intensity = (isHydrazine ? 2.5 : 3.0) * intensity * (1.0 + jitter * 0.5);
    }
  });

  return (
    <group position={position} rotation={rotation}>
      <group position={[0, -length / 2, 0]}>
        <mesh ref={coreRef} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[radius * 0.65, length, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.96} />
        </mesh>
        <mesh scale={[1.35, 1.2, 1.35]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[radius, length * 1.15, 16]} />
          <meshBasicMaterial color={sheathColor} transparent opacity={0.7} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh scale={[1.8, 1.35, 1.8]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[radius * 1.5, length * 1.35, 16]} />
          <meshBasicMaterial color={outerColor} transparent opacity={0.3} blending={THREE.AdditiveBlending} />
        </mesh>
        {[0.2, 0.45, 0.72].map((fraction, idx) => (
          <mesh key={`shock-${idx}`} position={[0, -fraction * length + length / 2, 0]}>
            <octahedronGeometry args={[radius * 0.45 * (1 - idx * 0.2), 0]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.9} blending={THREE.AdditiveBlending} />
          </mesh>
        ))}
      </group>
      <pointLight ref={lightRef} position={[0, -0.2, 0]} color={sheathColor} intensity={2.5 * intensity} distance={6} />
    </group>
  );
}

function GroundDustCloud({ isMars = true }: { isMars?: boolean }) {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 45;

  const [geo, velocities] = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const vels: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.2;
      const dist = 0.3 + Math.random() * 0.6;
      positions[i * 3] = Math.cos(angle) * dist;
      positions[i * 3 + 1] = 0.05 + Math.random() * 0.15;
      positions[i * 3 + 2] = Math.sin(angle) * dist;

      const speed = 1.2 + Math.random() * 1.8;
      vels.push({
        x: Math.cos(angle) * speed,
        y: 0.1 + Math.random() * 0.3,
        z: Math.sin(angle) * speed,
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return [geometry, vels];
  }, []);

  useFrame((_, delta) => {
    if (!particlesRef.current) return;
    const pos = particlesRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] += velocities[i].x * delta;
      pos[i * 3 + 1] += velocities[i].y * delta;
      pos[i * 3 + 2] += velocities[i].z * delta;

      const curDist = Math.hypot(pos[i * 3], pos[i * 3 + 2]);
      if (curDist > 3.8 || pos[i * 3 + 1] > 1.2) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 0.2 + Math.random() * 0.3;
        pos[i * 3] = Math.cos(angle) * dist;
        pos[i * 3 + 1] = 0.05 + Math.random() * 0.1;
        pos[i * 3 + 2] = Math.sin(angle) * dist;
      }
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group position={[0, -0.05, 0]}>
      <points ref={particlesRef} geometry={geo}>
        <pointsMaterial size={0.16} color={isMars ? '#d97706' : '#94a3b8'} transparent opacity={0.65} depthWrite={false} />
      </points>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.5, 3.2, 32]} />
        <meshBasicMaterial color={isMars ? '#b45309' : '#64748b'} transparent opacity={0.25} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

function RealPerseverance({ scale = 0.85, position = [0, 0, 0] }: { scale?: number; position?: [number, number, number] }) {
  const { scene } = useGLTF('/models/perseverance.glb', '/draco/');
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    const box = new THREE.Box3().setFromObject(c);
    const center = new THREE.Vector3();
    box.getCenter(center);
    c.position.x = -center.x;
    c.position.z = -center.z;
    c.position.y = -box.min.y;
    return c;
  }, [scene]);

  return (
    <group position={position} scale={[scale, scale, scale]}>
      <primitive object={cloned} />
    </group>
  );
}

function RealApolloLM({ scale = 0.85, position = [0, 0, 0] }: { scale?: number; position?: [number, number, number] }) {
  const { scene } = useGLTF('/models/apollo_lunar_module.glb', '/draco/');
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    const box = new THREE.Box3().setFromObject(c);
    const center = new THREE.Vector3();
    box.getCenter(center);
    c.position.x = -center.x;
    c.position.z = -center.z;
    c.position.y = -box.min.y;
    return c;
  }, [scene]);

  return (
    <group position={position} scale={[scale, scale, scale]}>
      <primitive object={cloned} />
    </group>
  );
}

function SkyCraneDescentPlatform({ firing = true, throttle = 1.0 }: { firing?: boolean; throttle?: number }) {
  const engineNodes: { pos: [number, number, number]; rot: [number, number, number] }[] = [
    { pos: [0.85, 0.05, 0.85], rot: [-0.65, 0, 0.65] },
    { pos: [-0.85, 0.05, 0.85], rot: [-0.65, 0, -0.65] },
    { pos: [0.85, 0.05, -0.85], rot: [0.65, 0, 0.65] },
    { pos: [-0.85, 0.05, -0.85], rot: [0.65, 0, -0.65] },
  ];

  return (
    <group position={[0, 0, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
        <cylinderGeometry args={[1.25, 1.4, 0.28, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.88} roughness={0.25} />
      </mesh>
      {engineNodes.map((engine, idx) => (
        <group key={`cluster-${idx}`} position={engine.pos}>
          <mesh rotation={engine.rot} castShadow>
            <coneGeometry args={[0.14, 0.32, 16, 1, true]} />
            <meshStandardMaterial color="#090d16" metalness={0.95} side={THREE.DoubleSide} />
          </mesh>
          {firing && (
            <group rotation={engine.rot}>
              <SupersonicThrusterPlume
                position={[0, -0.16, 0]}
                length={1.35 * throttle}
                radius={0.11}
                colorType="hydrazine"
                intensity={throttle}
              />
            </group>
          )}
        </group>
      ))}
    </group>
  );
}

function RealisticPlanetarySurface({ isMars }: { isMars: boolean }) {
  const terrainGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(60, 60, 48, 48);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const dist = Math.hypot(x, y);
      const elevation =
        Math.sin(x * 0.12) * Math.cos(y * 0.12) * 0.35 +
        Math.sin(x * 0.3 + 1.2) * 0.15 -
        (dist < 4 ? 0.05 : 0);
      pos.setZ(i, elevation);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group position={[0, -0.02, 0]}>
      <mesh geometry={terrainGeo} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <meshStandardMaterial color={isMars ? '#b45309' : '#475569'} roughness={0.92} metalness={0.08} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <ringGeometry args={[25, 45, 48]} />
        <meshBasicMaterial color={isMars ? '#9a3412' : '#1e293b'} transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

function MoonLandingSequence({ step }: { step: number }) {
  const lmRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!lmRef.current) return;
    if (step === 0) {
      lmRef.current.position.y = 1.0;
      lmRef.current.rotation.z = -0.2;
    } else if (step === 1) {
      lmRef.current.position.y = 0.35;
      lmRef.current.rotation.z = 0;
    } else {
      lmRef.current.position.y = 0;
      lmRef.current.rotation.z = 0;
    }
  });

  return (
    <group ref={lmRef}>
      <Suspense fallback={null}>
        <RealApolloLM scale={0.88} />
      </Suspense>
      {(step === 0 || step === 1) && (
        <group position={[0, 0.45, 0]}>
          <SupersonicThrusterPlume
            position={[0, -0.4, 0]}
            length={step === 1 ? 1.4 : 1.1}
            radius={0.16}
            colorType="hypergolic"
            intensity={step === 1 ? 1.2 : 0.8}
          />
        </group>
      )}
      {step === 1 && <GroundDustCloud isMars={false} />}
    </group>
  );
}

function Mars3DSimulator({ step }: { step: number }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!groupRef.current) return;
    if (step < 2) groupRef.current.position.y = 0.5;
    else if (step === 2) groupRef.current.position.y = 0.2;
    else groupRef.current.position.y = 0;
  });

  return (
    <group ref={groupRef}>
      {step < 3 ? (
        <group position={[0, 0.8, 0]}>
          <SkyCraneDescentPlatform firing={true} throttle={1.1} />
        </group>
      ) : step === 3 ? (
        <group>
          <group position={[0, 1.9, 0]}>
            <SkyCraneDescentPlatform firing={true} throttle={0.9} />
          </group>
          <Suspense fallback={null}>
            <RealPerseverance scale={0.8} position={[0, 0.05, 0]} />
          </Suspense>
          <GroundDustCloud isMars={true} />
        </group>
      ) : (
        <group>
          <Suspense fallback={null}>
            <RealPerseverance scale={0.85} position={[0, 0, 0]} />
          </Suspense>
        </group>
      )}
    </group>
  );
}

// ============================================================================
// 2. MAIN LANDING SCENE (MOON & MARS COMPLETELY SEPARATED)
// ============================================================================
interface LandingSceneProps {
  destination: DestinationType;
  onExploreTerrain: () => void;
}

export const LandingScene: React.FC<LandingSceneProps> = ({
  destination,
  onExploreTerrain,
}) => {
  const isMars = destination === 'Mars';
  const videoRef = useRef<HTMLVideoElement>(null);

  // Exact video boundaries per destination
  const videoStart = isMars ? 25.0 : 0.0;
  const videoEnd = isMars ? 175.0 : 120.4;
  const videoDuration = videoEnd - videoStart;
  const videoSrc = isMars ? '/videos/mars_edl_landing.mp4' : '/videos/apollo11_landing.mp4';

  const [viewMode, setViewMode] = useState<'video' | '3d'>('video');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [relativeTime, setRelativeTime] = useState<number>(0);
  const [simStep, setSimStep] = useState<number>(0);
  const [hoveredChapter, setHoveredChapter] = useState<string | null>(null);

  // Key NASA EDL Milestones mapped relative to trimmed video (Mars)
  const marsMilestones = useMemo(
    () => [
      {
        id: 'entry',
        relTime: 0,
        title: 'Atmospheric Entry & Hypersonic Shock Front',
        tag: 'HYPERSONIC ENTRY',
        speed: 'Mach 20 • 20,000 km/h',
        alt: '125 km to 11 km',
        desc: 'PICA-X heat shield glows at 1,300°C as capsule plunges into the thin Martian atmosphere, shedding 90% of kinetic energy.',
        transcript: 'JPL EDL: "Vehicle reporting hypersonic atmospheric entry. Guidance is active."',
      },
      {
        id: 'parachute',
        relTime: 29,
        title: 'Supersonic Parachute Inflation',
        tag: 'SUPERSONIC CHUTE',
        speed: 'Mach 1.7 • 1,510 km/h',
        alt: '11.2 km',
        desc: 'World\'s largest supersonic parachute (21.5m diameter) inflates in 0.4 seconds to decelerate the descent capsule.',
        transcript: 'JPL EDL: "Parachute deploy confirmed! Decelerating through Mach 1.5."',
      },
      {
        id: 'radar',
        relTime: 53,
        title: 'Heat Shield Jettison & Terrain Radar Lock',
        tag: 'TERRAIN RADAR LOCK',
        speed: 'Mach 0.8 • 560 km/h',
        alt: '8.2 km',
        desc: 'Heat shield falls away; visual cameras and Terrain-Relative Navigation radar scan Jezero Crater for hazard-free touchdown.',
        transcript: 'JPL EDL: "Heat shield separation confirmed. Radar has locked onto Jezero Crater terrain."',
      },
      {
        id: 'sky_crane',
        relTime: 83,
        title: 'Powered Descent & Hydrazine Thrusters Fire',
        tag: 'HYDRAZINE THRUSTERS',
        speed: '300 km/h to 32 km/h',
        alt: '2.1 km to 20 m',
        desc: 'Descent stage separates. 8 Aerojet Rocketdyne MR-80B hydrazine retro-rockets ignite with supersonic cyan-blue exhaust.',
        transcript: 'JPL EDL: "Descent stage separation! 8 hydrazine retro-rockets firing nominally."',
      },
      {
        id: 'lowering',
        relTime: 111,
        title: 'Sky Crane Rover Lowering Maneuver',
        tag: 'SKY CRANE LOWERING',
        speed: '0.75 m/s Hover',
        alt: '20 m to Surface',
        desc: 'Sky crane hovers stably at 20m, lowering the Perseverance rover on 7.6-meter braided nylon bridles and data umbilical.',
        transcript: 'JPL EDL: "Sky crane maneuver initiated. Rover is being lowered on bridles."',
      },
      {
        id: 'touchdown',
        relTime: 135,
        title: 'Touchdown Confirmed at Jezero Crater!',
        tag: 'TOUCHDOWN CONFIRMED',
        speed: '0.0 m/s • WHEELS ON MARS',
        alt: 'Surface Contact • 0 m',
        desc: 'Wheels on Mars! Bridles severed instantaneously. Sky Crane throttles up and flies away. JPL confirms safe landing!',
        transcript: 'Swati Mohan (JPL): "Touchdown confirmed! Perseverance is safely on the surface of Mars!"',
      },
    ],
    []
  );

  // Key NASA Apollo 11 Lunar Landing Milestones (Moon)
  const moonMilestones = useMemo(
    () => [
      {
        id: 'pdi',
        relTime: 0,
        title: 'Powered Descent Initiation (PDI)',
        tag: 'PDI IGNITION',
        speed: '1,680 m/s • Mach 5',
        alt: '15,200 m (50,000 ft)',
        desc: 'Descent engine ignites at 10% throttle, throttling up to 94%. Eagle begins retrograde burn to brake orbital velocity.',
        transcript: 'Aldrin: "Ignition. Ten percent... Throttle up, ninety-four percent."',
      },
      {
        id: 'pitch_over',
        relTime: 28,
        title: 'Pitch-Over Maneuver & 1202 Guidance Alarm',
        tag: 'PITCH-OVER & GUIDANCE',
        speed: '450 m/s',
        alt: '2,280 m (7,500 ft)',
        desc: 'Eagle pitches forward 70° giving Armstrong first visual view of terrain. Computer signals 1202 alarm; Steve Bales calls GO.',
        transcript: 'Armstrong: "Program alarm... 1202." Duke (Capcom): "Roger, we copy you on that alarm. We\'re GO!"',
      },
      {
        id: 'manual_avoidance',
        relTime: 58,
        title: 'Manual Redesignation (P66 Semi-Auto)',
        tag: 'MANUAL BOULDER AVOIDANCE',
        speed: '25 m/s • 90 km/h',
        alt: '150 m (500 ft)',
        desc: 'Landing zone is strewn with car-sized boulders inside West Crater! Armstrong takes manual control to steer past boulder field.',
        transcript: 'Aldrin: "Down two and a half... 200 feet, down four and a half... 160 feet, forward velocity."',
      },
      {
        id: 'fuel_low',
        relTime: 85,
        title: 'Fuel Critical Callout: 60 Seconds Remaining!',
        tag: '60 SECONDS FUEL',
        speed: '2.2 m/s Descent',
        alt: '30 m (100 ft)',
        desc: 'Charlie Duke calls: "60 seconds!" Propellant low-level sensor triggers. Dust begins blowing horizontally across lunar plain.',
        transcript: 'Duke (Capcom): "60 seconds." Aldrin: "Down two and a half. Kicking up some dust. Faint shadow."',
      },
      {
        id: 'contact_light',
        relTime: 108,
        title: 'Contact Light & Touchdown at Tranquility Base!',
        tag: 'TOUCHDOWN CONFIRMED',
        speed: '0.0 m/s • ENGINE STOP',
        alt: 'Surface Contact • 0 m',
        desc: 'Contact light! Engine stop. "Houston, Tranquility Base here. The Eagle has landed." Duke: "Roger Tranquility, we copy you on the ground."',
        transcript: 'Aldrin: "Contact light!" Armstrong: "Houston, Tranquility Base here. The Eagle has landed."',
      },
    ],
    []
  );

  const milestones = isMars ? marsMilestones : moonMilestones;

  // Active milestone based on relative trimmed time
  const activeMilestone = useMemo(() => {
    let current = milestones[0];
    for (const m of milestones) {
      if (relativeTime >= m.relTime - 1.5) {
        current = m;
      }
    }
    return current;
  }, [milestones, relativeTime]);

  // Video time management with strict trimming
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.currentTime < videoStart) {
      video.currentTime = videoStart;
    }

    const handleTimeUpdate = () => {
      if (video.currentTime < videoStart) {
        video.currentTime = videoStart;
      }

      if (video.currentTime >= videoEnd) {
        video.currentTime = videoEnd;
        video.pause();
        setIsPlaying(false);
        setRelativeTime(videoDuration);
        soundFx.playSuccess();
        return;
      }

      const rel = Math.max(0, Math.min(videoDuration, video.currentTime - videoStart));
      setRelativeTime(rel);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [viewMode, videoStart, videoEnd, videoDuration]);

  // Frame-by-frame scrub controller
  const handleScrub = (newRelTime: number) => {
    const clampedRel = Math.max(0, Math.min(videoDuration, newRelTime));
    setRelativeTime(clampedRel);
    if (videoRef.current) {
      videoRef.current.currentTime = videoStart + clampedRel;
    }
  };

  // Jump to specific milestone
  const handleJumpToMilestone = (relTime: number) => {
    soundFx.playClick();
    soundFx.playChirp();
    handleScrub(relTime);
  };

  // Play / Pause toggle
  const togglePlay = () => {
    soundFx.playClick();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        if (videoRef.current.currentTime >= videoEnd) {
          videoRef.current.currentTime = videoStart;
        }
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  // Set specific playback speed
  const handleSetSpeed = (speed: number) => {
    soundFx.playClick();
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Skip relative ±5 seconds
  const handleSkipOffset = (deltaSeconds: number) => {
    soundFx.playClick();
    if (videoRef.current) {
      const target = Math.max(videoStart, Math.min(videoEnd, videoRef.current.currentTime + deltaSeconds));
      videoRef.current.currentTime = target;
      setRelativeTime(target - videoStart);
    }
  };

  const isTouchdown = isMars ? relativeTime >= 134 : relativeTime >= 106;

  // Format MM:SS for relative mission timer
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full h-screen bg-[#04060b] flex flex-col justify-between p-4 md:p-6 pt-20 overflow-hidden select-none">

      {/* ------------------------------------------------------------- */}
      {/* 1. CINEMATIC 16:9 VIEWPORT (CLEAN, BORDERLESS, WIDE)          */}
      {/* ------------------------------------------------------------- */}
      <div className="absolute inset-0 z-0 bg-[#04060a] flex items-center justify-center overflow-hidden">
        {viewMode === 'video' ? (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Real NASA Landing Video (Mars EDL or Moon Apollo 11) */}
            <video
              ref={videoRef}
              src={videoSrc}
              autoPlay
              playsInline
              muted={isMuted}
              className="w-full h-full object-cover md:object-contain select-none"
            />

            {/* Subtle Ultra-Premium Cinema Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-[#07090e]/60 pointer-events-none" />

            {/* Clean Floating Mission Identity */}
            <div className="absolute top-24 left-6 md:left-10 flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[11px] font-mono tracking-widest text-slate-300 pointer-events-none">
              <span className={`w-2 h-2 rounded-full ${isMars ? 'bg-red-400' : 'bg-cyan-400'} animate-pulse`} />
              <span>
                {isMars ? 'NASA JPL EDL TELEMETRY • JEZERO CRATER' : 'NASA APOLLO 11 TELEMETRY • TRANQUILITY BASE'}
              </span>
            </div>

            {/* Audio Unmute Callout Overlay (If muted) */}
            {isMuted && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  setIsMuted(false);
                  if (videoRef.current) {
                    videoRef.current.muted = false;
                  }
                }}
                className="absolute top-24 right-6 md:right-10 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-600/90 hover:bg-blue-500 text-white text-xs font-mono font-bold shadow-glow-cyan animate-pulse cursor-pointer pointer-events-auto transition-all"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>UNMUTE AUDIO</span>
              </button>
            )}

            {/* Live Radio Transcript Dialogue Callout */}
            {activeMilestone.transcript && (
              <div className="absolute bottom-48 sm:bottom-44 left-1/2 -translate-x-1/2 max-w-xl w-[90%] px-4 py-2.5 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/15 text-center text-xs md:text-sm font-mono text-cyan-200 shadow-2xl pointer-events-none animate-fade-in content-selectable">
                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                  <MessageSquare className="w-3 h-3 text-cyan-400" />
                  <span>MISSION RADIO TRANSCRIPT</span>
                </div>
                <p className="italic font-medium text-white drop-shadow content-selectable">
                  "{activeMilestone.transcript}"
                </p>
              </div>
            )}
          </div>
        ) : (
          <Canvas camera={{ position: [0, 1.4, 4.6], fov: 46 }} shadows>
            <ambientLight intensity={isMars ? 0.5 : 0.35} />
            <directionalLight position={[8, 14, 6]} intensity={2.6} color={isMars ? '#ffe4d6' : '#ffffff'} castShadow />
            <pointLight position={[-6, 4, -4]} intensity={0.4} color={isMars ? '#f97316' : '#94a3b8'} />
            <Stars radius={100} depth={50} count={6000} factor={3.5} fade />
            <RealisticPlanetarySurface isMars={isMars} />

            {isMars ? <Mars3DSimulator step={simStep} /> : <MoonLandingSequence step={simStep} />}
            <OrbitControls enablePan={false} minDistance={2.4} maxDistance={8.5} maxPolarAngle={Math.PI / 2.05} />
          </Canvas>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. TOP FLIGHT DIRECTOR HEADER (MINIMALIST & SLEEK)             */}
      {/* ------------------------------------------------------------- */}
      <div className="relative z-10 max-w-6xl mx-auto w-full flex items-center justify-between pointer-events-auto screen-enter">
        <div className="flex items-center gap-3">
          {/* Active Flight Phase Pill */}
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.05] backdrop-blur-xl border border-white/10 text-xs font-mono text-slate-300 shadow-lg">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-white font-bold font-mono tracking-wider">{activeMilestone.tag}</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-mono text-[11px]">T+ {formatTime(relativeTime)}</span>
          </div>

          {/* Mode Switcher: Video vs 3D */}
          <div className="hidden sm:flex items-center p-1 rounded-full bg-white/[0.04] backdrop-blur-xl border border-white/10">
            <button
              onClick={() => {
                soundFx.playClick();
                setViewMode('video');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'video'
                  ? 'bg-blue-600 text-white font-semibold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>{isMars ? 'JPL Broadcast' : 'NASA Broadcast'}</span>
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setViewMode('3d');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === '3d'
                  ? 'bg-blue-600 text-white font-semibold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Simulator</span>
            </button>
          </div>
        </div>

        {/* Skip to Surface Exploration Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            soundFx.playSuccess();
            onExploreTerrain();
          }}
          className="px-4 py-2 rounded-full bg-blue-600/20 hover:bg-blue-600/35 border border-blue-500/40 hover:border-blue-400 text-blue-300 hover:text-white font-mono text-xs flex items-center gap-2 transition-all shadow-lg cursor-pointer"
        >
          <span>Enter 3D World</span>
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. PREMIUM FLOATING VIDEO CONTROL & TELEMETRY HUD              */}
      {/* ------------------------------------------------------------- */}
      <div className="relative z-10 max-w-4xl mx-auto w-full space-y-3 pb-6 pointer-events-auto screen-enter">
        {viewMode === 'video' && (
          <div className="p-4 rounded-3xl bg-black/75 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-3.5 animate-fade-in content-selectable">
            {/* Top Row: Milestone Info & Live Telemetry Metrics */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-semibold block">
                  Current Descent Milestone
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight font-display mt-0.5">
                  {activeMilestone.title}
                </h3>
              </div>

              {/* Live Telemetry Badges */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-300 font-mono text-xs flex items-center gap-1.5">
                  <Wind className="w-3 h-3 text-blue-400" />
                  <span>{activeMilestone.speed}</span>
                </div>
                <div className="px-3 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300 font-mono text-xs flex items-center gap-1.5">
                  <Gauge className="w-3 h-3 text-emerald-400" />
                  <span>{activeMilestone.alt}</span>
                </div>
              </div>
            </div>

            {/* High-Precision Interactive Scrubber with Embedded Chapter Pips */}
            <div className="space-y-1.5">
              <div className="relative w-full flex items-center h-5">
                {/* Background Track */}
                <div className="absolute inset-x-0 h-1.5 bg-white/15 rounded-full overflow-hidden">
                  {/* Progress Fill */}
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500 rounded-full transition-all duration-75"
                    style={{ width: `${(relativeTime / videoDuration) * 100}%` }}
                  />
                </div>

                {/* Chapter Diamond Pips on Track */}
                {milestones.map((m) => {
                  const pct = (m.relTime / videoDuration) * 100;
                  const isPassed = relativeTime >= m.relTime;
                  return (
                    <button
                      key={m.id}
                      onClick={() => handleJumpToMilestone(m.relTime)}
                      onMouseEnter={() => setHoveredChapter(m.tag)}
                      onMouseLeave={() => setHoveredChapter(null)}
                      style={{ left: `${pct}%` }}
                      className={`absolute -translate-x-1/2 w-3 h-3 rounded-full transition-all flex items-center justify-center cursor-pointer group ${
                        isPassed
                          ? 'bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]'
                          : 'bg-white/40 hover:bg-white'
                      }`}
                      title={`${m.tag} (${formatTime(m.relTime)})`}
                    >
                      <span className="w-1 h-1 rounded-full bg-white" />
                    </button>
                  );
                })}

                {/* Range Input for Drag & Scrub */}
                <input
                  type="range"
                  min={0}
                  max={videoDuration}
                  step={0.1}
                  value={relativeTime}
                  onChange={(e) => handleScrub(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {/* Time Indicators */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="text-cyan-300 font-semibold">{formatTime(relativeTime)}</span>
                <span className="text-[10px] text-slate-500">
                  {hoveredChapter ? `JUMP TO: ${hoveredChapter}` : 'DRAG TO SCRUB • CLICK PIPS FOR CHAPTERS'}
                </span>
                <span>{formatTime(videoDuration)}</span>
              </div>
            </div>

            {/* Bottom Controls Bar: Playback, Speed Selector, Volume */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                {/* Play / Pause Button */}
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-2xl bg-white/[0.08] hover:bg-blue-600 text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>

                {/* Replay 5s */}
                <button
                  onClick={() => handleSkipOffset(-5)}
                  className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-all text-xs cursor-pointer"
                  title="Rewind 5s"
                >
                  <ReplayIcon className="w-3.5 h-3.5" />
                </button>

                {/* Forward 5s */}
                <button
                  onClick={() => handleSkipOffset(5)}
                  className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-all text-xs cursor-pointer"
                  title="Forward 5s"
                >
                  <FastForward className="w-3.5 h-3.5" />
                </button>

                {/* Audio Mute/Unmute */}
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setIsMuted(!isMuted);
                    if (videoRef.current) {
                      videoRef.current.muted = !isMuted;
                    }
                  }}
                  className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-all cursor-pointer"
                  title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              </div>

              {/* Dedicated Speed Selector Pills & Direct 3D Surface Button */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                  <span className="text-[10px] font-mono text-slate-500 px-1.5 hidden sm:inline">SPEED:</span>
                  {[1.0, 1.25, 1.5, 2.0].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSetSpeed(s)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                        playbackSpeed === s
                          ? 'bg-blue-600 text-white font-bold shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    soundFx.playSuccess();
                    onExploreTerrain();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs font-display flex items-center gap-1.5 shadow-glow-cyan cursor-pointer transition-all"
                  title="Proceed Directly to 3D Surface Exploration"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">3D SURFACE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3D Mode Controls Card (When in 3D Mode) */}
        {viewMode === '3d' && (
          <div className="p-5 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-3 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                3D Interactive Telemetry Simulator
              </span>
              <span className="text-xs font-mono text-blue-400">
                Phase {simStep + 1} of 5
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-300 pt-1">
              <span>DRAG CANVAS 360° TO INSPECT HARDWARE</span>
              <div className="flex items-center gap-2">
                <button
                  disabled={simStep === 0}
                  onClick={() => setSimStep(Math.max(0, simStep - 1))}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 disabled:opacity-30 text-slate-300 cursor-pointer"
                >
                  Previous
                </button>
                <button
                  disabled={simStep === 4}
                  onClick={() => setSimStep(Math.min(4, simStep + 1))}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 disabled:opacity-30 text-blue-300 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Touchdown Confirmed Action Button (Appears at Touchdown) */}
        {isTouchdown && (
          <button
            onClick={() => {
              soundFx.playClick();
              soundFx.playSuccess();
              onExploreTerrain();
            }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-sm font-display flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.5)] animate-fade-in cursor-pointer border border-emerald-400/40"
          >
            <Compass className="w-5 h-5 text-emerald-300" />
            <span>
              {isMars
                ? 'TOUCHDOWN CONFIRMED • ENTER MARS 3D PANORAMIC STUDIO'
                : 'THE EAGLE HAS LANDED • ENTER LUNAR 3D SURFACE STUDIO'}
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

// Preload GLB assets
useGLTF.preload('/models/perseverance.glb', '/draco/');
useGLTF.preload('/models/apollo_lunar_module.glb', '/draco/');
useGLTF.preload('/models/earth.glb', '/draco/');

export { LandingScene as LandingPage };
export default LandingScene;

