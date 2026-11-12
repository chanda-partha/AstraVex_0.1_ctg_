import React, { useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { ArrowLeft, Globe, Eye, Sparkles } from "lucide-react";
import type {
  MADestination,
  MAStage,
  MAChapterId,
  MAMissionData,
} from "../types/missionAfterlife";
import {
  getAllAfterlifeMissions,
  getMissionsByDestination,
  getMissionById,
  getDefaultMission,
} from "../services/missionAfterlife/missionDataService";
import { MissionAfterlifeIntro } from "../components/missionAfterlife/MissionAfterlifeIntro";
import { PlanetSelectionScene } from "../components/missionAfterlife/PlanetSelectionScene";
import { MissionSelectionPanel } from "../components/missionAfterlife/MissionSelectionPanel";
import { MissionMarker } from "../components/missionAfterlife/MissionMarker";
import { GLBPlanet } from "../components/3d/GLBPlanet";
import { MissionSurfaceScene } from "../components/missionAfterlife/MissionSurfaceScene";
import { MissionProgressBar } from "../components/missionAfterlife/MissionProgressBar";
import { MissionInformationCard } from "../components/missionAfterlife/MissionInformationCard";
import { MissionChapterController } from "../components/missionAfterlife/MissionChapterController";
import { MissionCompletionScreen } from "../components/missionAfterlife/MissionCompletionScreen";
import { MissionQuizLauncher } from "../components/missionAfterlife/MissionQuizLauncher";
import { soundFx } from "../utils/soundEffects";

interface MissionAfterlifePageProps {
  onReturnToHome?: () => void;
  onModifyHealth?: (delta: number) => void;
  onAddScore?: (points: number) => void;
}

const CHAPTER_KEYS: MAChapterId[] = [
  "identity",
  "purpose",
  "finalChapter",
  "legacy",
];

export const MissionAfterlifePage: React.FC<MissionAfterlifePageProps> = ({
  onReturnToHome,
  onModifyHealth,
  onAddScore,
}) => {
  // ═══ STATE MACHINE ═══
  const [stage, setStage] = useState<MAStage>("intro");
  const [destination, setDestination] = useState<MADestination>("Moon");
  const [selectedMissionId, setSelectedMissionId] =
    useState<string>("apollo11");
  const [chapterIndex, setChapterIndex] = useState<number>(0);
  const [chapterReplayToken, setChapterReplayToken] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Active Mission & Destination Missions
  const destinationMissions = useMemo(() => {
    return getMissionsByDestination(destination);
  }, [destination]);

  const activeMission: MAMissionData = useMemo(() => {
    return getMissionById(selectedMissionId) || destinationMissions[0];
  }, [selectedMissionId, destinationMissions]);

  const currentChapterKey = CHAPTER_KEYS[chapterIndex];
  const activeChapter = activeMission.chapters[currentChapterKey];

  // ═══ HANDLERS ═══

  // Intro -> Planet Selection
  const handleBeginFromIntro = () => {
    setStage("planetSelect");
  };

  // Planet Select -> Mission Select
  const handleSelectDestination = (dest: MADestination) => {
    setDestination(dest);
    const defaultM = getDefaultMission(dest);
    setSelectedMissionId(defaultM.id);
    setStage("missionSelect");
  };

  // Mission Selection -> Surface Transition
  const handleConfirmLaunch = () => {
    soundFx.playThrust(3.0);
    setIsTransitioning(true);
    setStage("transition");
    setChapterIndex(0);
  };

  // Transition settles -> Documentary
  const handleTransitionComplete = () => {
    setIsTransitioning(false);
    setStage("documentary");
    soundFx.playChirp();
  };

  // Chapter Progression
  const handleNextChapter = () => {
    if (chapterIndex < 3) {
      setChapterIndex((prev) => prev + 1);
      soundFx.playChirp();
    } else {
      // Completed all 4 chapters -> Mission Archived screen
      soundFx.playSuccess();
      setStage("completion");
      if (onAddScore) onAddScore(100);
    }
  };

  const handlePrevChapter = () => {
    if (chapterIndex > 0) {
      setChapterIndex((prev) => prev - 1);
    }
  };

  const handleSelectChapter = (chapId: MAChapterId) => {
    const idx = CHAPTER_KEYS.indexOf(chapId);
    if (idx !== -1) {
      setChapterIndex(idx);
    }
  };

  // Completion screen actions
  const handleReplayJourney = () => {
    setChapterIndex(0);
    setIsTransitioning(true);
    setStage("transition");
  };

  const handleReturnToPlanets = () => {
    setStage("planetSelect");
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#03050c] text-slate-100 font-sans select-none">
      {/* ═════════════════════════════════════════════════════════════════
          STAGE A: CINEMATIC INTRODUCTION
          ═════════════════════════════════════════════════════════════════ */}
      {stage === "intro" && (
        <MissionAfterlifeIntro
          onBegin={handleBeginFromIntro}
          onSkip={handleBeginFromIntro}
        />
      )}

      {/* ═════════════════════════════════════════════════════════════════
          STAGE B: 3D PLANETARY SELECTION (Moon vs. Mars)
          ═════════════════════════════════════════════════════════════════ */}
      {stage === "planetSelect" && (
        <PlanetSelectionScene
          onSelectDestination={handleSelectDestination}
          onBackToIntro={() => setStage("intro")}
        />
      )}

      {/* ═════════════════════════════════════════════════════════════════
          STAGE C: MISSION SELECTION WITH 3D PLANET & MARKERS
          ═════════════════════════════════════════════════════════════════ */}
      {stage === "missionSelect" && (
        <div className="relative w-full h-screen overflow-hidden bg-[#04060b]">
          {/* 3D Planet with Surface Markers */}
          <div className="absolute inset-0 z-0">
            <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }}>
              <ambientLight intensity={0.35} color="#0d1829" />
              <directionalLight
                position={[10, 8, 8]}
                intensity={3.5}
                color="#ffffff"
              />
              <directionalLight
                position={[-8, -4, -6]}
                intensity={0.7}
                color="#38bdf8"
              />
              <Stars
                radius={120}
                depth={50}
                count={6000}
                factor={3.5}
                fade
                speed={0.4}
              />

              <group rotation={[0.2, 0, 0]}>
                <GLBPlanet
                  modelPath={
                    destination === "Moon"
                      ? "/models/moon.glb"
                      : "/models/mars.glb"
                  }
                  targetRadius={1.8}
                  fallbackColor={destination === "Moon" ? "#64748b" : "#b91c1c"}
                  rotationSpeed={0.015}
                />

                {/* Interactive 3D Surface Markers */}
                {destinationMissions.map((mission) => {
                  if (!mission.coordinates) return null;
                  return (
                    <MissionMarker
                      key={mission.id}
                      id={mission.id}
                      name={mission.name}
                      lat={mission.coordinates.lat}
                      lon={mission.coordinates.lon}
                      radius={1.8}
                      isSelected={mission.id === selectedMissionId}
                      onSelect={() => setSelectedMissionId(mission.id)}
                      color={destination === "Mars" ? "#f43f5e" : "#38bdf8"}
                    />
                  );
                })}
              </group>

              <OrbitControls
                enableZoom={false}
                enablePan={false}
                dampingFactor={0.05}
                autoRotate={false}
              />
            </Canvas>
          </div>

          {/* HUD Overlay with Mission Selection Panel */}
          <div className="relative z-10 w-full h-full flex flex-col justify-between p-4 sm:p-8 pt-20 pointer-events-none">
            {/* Top Navigation Bar */}
            <div className="w-full flex items-center justify-between pointer-events-auto">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setStage("planetSelect");
                }}
                className="crystal-glass px-4 py-2 rounded-full text-xs font-mono text-slate-300 hover:text-white flex items-center gap-2 cursor-pointer transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>CHOOSE ANOTHER PLANET</span>
              </button>

              <div className="crystal-glass px-4 py-1.5 rounded-full text-xs font-mono text-cyan-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>STAGE C • SELECT MISSION TO EXPLORE</span>
              </div>
            </div>

            {/* Bottom/Right Content Zone */}
            <div className="w-full flex items-end justify-end pointer-events-none pb-2">
              <MissionSelectionPanel
                destination={destination}
                missions={destinationMissions}
                selectedMissionId={selectedMissionId}
                onSelectMission={(mId) => setSelectedMissionId(mId)}
                onConfirmLaunch={handleConfirmLaunch}
                onBackToPlanets={() => setStage("planetSelect")}
              />
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════
          STAGES D, E, F: SURFACE TRANSITION & 4-CHAPTER DOCUMENTARY
          ═════════════════════════════════════════════════════════════════ */}
      {(stage === "transition" || stage === "documentary") && (
        <div className="relative w-full h-screen overflow-hidden bg-[#04060b]">
          {/* 3D Surface Scene with Spacecraft */}
          <MissionSurfaceScene
            mission={activeMission}
            isTransitioning={isTransitioning}
            onTransitionComplete={handleTransitionComplete}
            autoRotate={autoRotate}
          />

          {/* Documentary UI Overlays */}
          <div className="relative z-10 w-full h-full flex flex-col justify-between p-4 sm:p-6 md:p-8 pt-20 pointer-events-none">
            {/* Top Bar: Navigation + Chapter Stepper */}
            <div className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pointer-events-auto">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setStage("missionSelect");
                  }}
                  className="crystal-glass px-3.5 py-2 rounded-xl text-xs font-mono text-slate-300 hover:text-white flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">MISSIONS</span>
                </button>

                <div className="crystal-glass px-3.5 py-2 rounded-xl text-xs font-mono text-cyan-300 flex items-center gap-2 truncate">
                  <span className="font-bold text-white">
                    {activeMission.name}
                  </span>
                  <span className="text-white/20">|</span>
                  <span className="text-slate-400 hidden sm:inline">
                    {activeMission.locationName}
                  </span>
                </div>
              </div>

              {/* Chapter Stepper Bar */}
              <div className="max-w-xl w-full">
                <MissionProgressBar
                  currentChapter={currentChapterKey}
                  chapterIndex={chapterIndex}
                  onSelectChapter={handleSelectChapter}
                />
              </div>
            </div>

            {/* Center / Right Content: Persistent Information Card */}
            <div className="w-full flex items-center justify-end pointer-events-none py-2">
              <MissionInformationCard
                mission={activeMission}
                chapter={activeChapter}
                chapterIndex={chapterIndex}
                replayToken={chapterReplayToken}
              />
            </div>

            {/* Bottom Bar: Chapter Playback Controls */}
            <div className="w-full flex items-center justify-between pointer-events-auto pb-1">
              <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-400 crystal-glass px-3 py-1.5 rounded-xl">
                <span>ORBIT: DRAG TO ROTATE 360° • SCROLL TO ZOOM</span>
              </div>

              <div className="w-full sm:w-auto">
                <MissionChapterController
                  chapterIndex={chapterIndex}
                  isAutoPlay={isAutoPlay}
                  autoRotate={autoRotate}
                  onNextChapter={handleNextChapter}
                  onPrevChapter={handlePrevChapter}
                  onReplayChapter={() => {
                    setChapterReplayToken((prev) => prev + 1);
                  }}
                  onToggleAutoPlay={() => setIsAutoPlay(!isAutoPlay)}
                  onToggleAutoRotate={() => setAutoRotate(!autoRotate)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════
          STAGE G: MISSION COMPLETION / ARCHIVED
          ═════════════════════════════════════════════════════════════════ */}
      {stage === "completion" && (
        <MissionCompletionScreen
          mission={activeMission}
          onReplay={handleReplayJourney}
          onLaunchQuiz={() => setIsQuizOpen(true)}
          onReturnToPlanets={handleReturnToPlanets}
        />
      )}

      {/* ═════════════════════════════════════════════════════════════════
          AI QUIZ LAUNCHER MODAL
          ═════════════════════════════════════════════════════════════════ */}
      {isQuizOpen && (
        <MissionQuizLauncher
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
          mission={activeMission}
          onScoreUpdate={(isCorrect, reward, penalty) => {
            if (isCorrect) {
              if (onModifyHealth) onModifyHealth(reward);
              if (onAddScore) onAddScore(50);
            } else {
              if (onModifyHealth) onModifyHealth(-penalty);
            }
          }}
        />
      )}
    </div>
  );
};

export default MissionAfterlifePage;
