import React, { useState, useEffect, Suspense, lazy } from 'react';
import { DestinationType, ScreenType, ResolvedNasaPayload, AIStoryPayload, AIQuizPayload } from './types';
import { Navbar } from './components/navigation/Navbar';
import { SpaceHomePage } from './pages/SpaceHomePage';
import { DestinationPage } from './pages/DestinationPage';
import { ExplorationPage } from './pages/ExplorationPage';
import { soundFx } from './utils/soundEffects';
import { getClientFallbackPayload } from './utils/nasaDataFallback';
import { fetchNasaPayload, fetchAIStory, fetchAIQuiz } from './services/api';
import { ScreenSkeleton } from './components/skeleton/ScreenSkeleton';
import { StoryModalSkeleton } from './components/skeleton/StoryModalSkeleton';
import { QuizModalSkeleton } from './components/skeleton/QuizModalSkeleton';
import { HardwareInspectSkeleton } from './components/skeleton/HardwareInspectSkeleton';
import { DataRegistrySkeleton } from './components/skeleton/DataRegistrySkeleton';

// Code-split heavy secondary routes & modals for instant initial bundle delivery
const EarthLaunchPage = lazy(() => import('./pages/EarthLaunchPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const HardwareInspectModal = lazy(() => import('./components/hardware/HardwareInspectModal'));
const AIStoryModal = lazy(() => import('./components/ai/AIStoryModal'));
const AIChatbotDrawer = lazy(() => import('./components/ai/AIChatbotDrawer'));
const AIQuizModal = lazy(() => import('./components/quiz/AIQuizModal'));
const NasaDataRegistryModal = lazy(() => import('./components/data/NasaDataRegistryModal'));
const ScienceSimulatorsModal = lazy(() => import('./components/simulators/ScienceSimulatorsModal'));

export const App: React.FC = () => {
  // Navigation & Screen Journey State (Strict 5-step order: home -> destination -> launch -> landing -> exploration)
  const [screen, setScreen] = useState<ScreenType>('home');
  const [destination, setDestination] = useState<DestinationType>('Mars');
  
  // Active Mission & Hardware State
  const [activeMissionId, setActiveMissionId] = useState<string>('perseverance');
  const [activeHardwareId, setActiveHardwareId] = useState<string>('supercam');

  // Gamification Health & Score State
  const [health, setHealth] = useState<number>(100);
  const [score, setScore] = useState<number>(150);

  // Resolved API Data States
  const [resolvedData, setResolvedData] = useState<ResolvedNasaPayload | null>(() => 
    getClientFallbackPayload('Mars', 'perseverance', 'supercam')
  );
  const [isLoadingNasaData, setIsLoadingNasaData] = useState<boolean>(false);

  // Story & Quiz states with loading/error lifecycle
  const [storyData, setStoryData] = useState<AIStoryPayload | null>(null);
  const [isLoadingStory, setIsLoadingStory] = useState<boolean>(false);
  const [storyError, setStoryError] = useState<string | null>(null);

  const [quizData, setQuizData] = useState<AIQuizPayload | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState<boolean>(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  // Modal Overlay States
  const [isHardwareModalOpen, setIsHardwareModalOpen] = useState<boolean>(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState<boolean>(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState<boolean>(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState<boolean>(false);
  const [isRegistryOpen, setIsRegistryOpen] = useState<boolean>(false);
  const [isSimulatorsOpen, setIsSimulatorsOpen] = useState<boolean>(false);

  // Fetch / Resolve NASA Data with in-memory caching and AbortController
  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      setIsLoadingNasaData(true);
      try {
        const payload = await fetchNasaPayload(
          destination,
          activeMissionId,
          activeHardwareId,
          controller.signal
        );
        setResolvedData(payload);
      } catch (err: unknown) {
        if ((err as Error).name !== 'AbortError') {
          console.warn('[NASA App] Payload resolution error:', err);
        }
      } finally {
        setIsLoadingNasaData(false);
      }
    }

    loadData();
    return () => controller.abort();
  }, [destination, activeMissionId, activeHardwareId]);

  // Fetch AI Story with loading skeleton & error handling
  const handleOpenStory = async () => {
    setIsStoryModalOpen(true);
    setIsLoadingStory(true);
    setStoryError(null);
    try {
      const story = await fetchAIStory(destination, activeMissionId, activeHardwareId);
      setStoryData(story);
    } catch (err: unknown) {
      console.warn('[NASA App] Story fetch error:', err);
      setStoryError((err as Error).message || 'Failed to generate mission story dossier.');
    } finally {
      setIsLoadingStory(false);
    }
  };

  // Fetch AI Quiz with loading skeleton & error handling
  const handleOpenQuiz = async () => {
    setIsQuizModalOpen(true);
    setIsLoadingQuiz(true);
    setQuizError(null);
    try {
      const quiz = await fetchAIQuiz(destination, activeMissionId, activeHardwareId);
      setQuizData(quiz);
    } catch (err: unknown) {
      console.warn('[NASA App] Quiz fetch error:', err);
      setQuizError((err as Error).message || 'Failed to generate flight evaluation quiz.');
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  // Gamification Health modifier (clamped between 0 and 100)
  const handleModifyHealth = (delta: number) => {
    setHealth((prev) => Math.max(0, Math.min(100, prev + delta)));
  };

  // Quiz answer handler
  const handleAnswerQuestion = (isCorrect: boolean, reward: number, penalty: number) => {
    if (isCorrect) {
      soundFx.playSuccess();
      handleModifyHealth(reward);
      setScore((prev) => prev + 50);
    } else {
      soundFx.playWarning();
      handleModifyHealth(-penalty);
    }
  };

  // Switch destination cleanly between Moon and Mars (routes to destination selector if in mission)
  const handleSwitchDestination = (newDest: DestinationType) => {
    setDestination(newDest);
    if (newDest === 'Mars') {
      setActiveMissionId('perseverance');
      setActiveHardwareId('supercam');
    } else {
      setActiveMissionId('apollo11');
      setActiveHardwareId('eagle-descent-stage');
    }
    if (screen === 'exploration' || screen === 'launch' || screen === 'landing') {
      setScreen('destination');
    }
  };

  // Journey handlers - direct 3D exploration or video journey
  const handleSelectDestination = (
    selected: DestinationType,
    missionId?: string,
    directTo3D: boolean = true
  ) => {
    setDestination(selected);
    if (missionId) {
      setActiveMissionId(missionId);
      if (missionId === 'artemis3') setActiveHardwareId('hls-crew-cabin');
      else if (missionId === 'ladee') setActiveHardwareId('ladee-ldex');
      else if (missionId === 'apollo11') setActiveHardwareId('eagle-descent-stage');
      else if (missionId === 'apollo15') setActiveHardwareId('apollo15-lrv');
      else if (missionId === 'apollo17') setActiveHardwareId('orange-soil-sampler');
      else if (missionId === 'chandrayaan3') setActiveHardwareId('vikram-lander');
      else if (missionId === 'lro') setActiveHardwareId('lroc-camera');
      else if (missionId === 'perseverance') setActiveHardwareId('supercam');
      else if (missionId === 'curiosity') setActiveHardwareId('curiosity-chassis');
      else if (missionId === 'insight') setActiveHardwareId('seis');
      else if (missionId === 'viking') setActiveHardwareId('viking-chassis');
      else if (missionId === 'mro') setActiveHardwareId('hirise');
      else if (missionId === 'jwst') setActiveHardwareId('jwst-mirror');
      else if (missionId === 'iss') setActiveHardwareId('iss-solar');
    } else if (selected === 'Mars') {
      setActiveMissionId('perseverance');
      setActiveHardwareId('supercam');
    } else {
      setActiveMissionId('apollo11');
      setActiveHardwareId('eagle-descent-stage');
    }

    if (directTo3D) {
      setScreen('exploration');
    } else {
      setScreen('launch');
    }
  };

  return (
    <div className="min-h-screen bg-space-900 text-slate-100 font-sans relative overflow-x-hidden">
      
      {/* Global Navigation Bar */}
      <Navbar
        currentScreen={screen}
        selectedDestination={destination}
        health={health}
        score={score}
        onNavigate={(targetScreen) => {
          setScreen(targetScreen);
        }}
        onSwitchDestination={handleSwitchDestination}
        onToggleAiChat={() => setIsAiChatOpen(!isAiChatOpen)}
        onOpenRegistry={() => setIsRegistryOpen(true)}
        onOpenSimulators={() => setIsSimulatorsOpen(true)}
      />

      {/* RENDER SCREENS BASED ON JOURNEY FLOW */}

      {/* 1. OVERVIEW PAGE */}
      {screen === 'home' && (
        <SpaceHomePage
          onExplore={(dest) => {
            if (dest) {
              setDestination(dest);
            }
            setScreen('destination');
          }}
          onWatchLandingVideo={() => {
            setScreen('landing');
          }}
        />
      )}

      {/* 2. DESTINATION SELECTOR */}
      {screen === 'destination' && (
        <DestinationPage
          defaultDestination={destination}
          onSelectDestination={(dest, missionId, directTo3D = false) => handleSelectDestination(dest, missionId, directTo3D)}
        />
      )}

      {/* 3. EARTH LAUNCH & INTERPLANETARY TRANSIT (LAZY LOADED WITH SKELETON) */}
      {screen === 'launch' && (
        <Suspense fallback={<ScreenSkeleton label="INITIALIZING LAUNCH TRAJECTORY..." />}>
          <EarthLaunchPage
            destination={destination}
            health={health}
            onModifyHealth={handleModifyHealth}
            onLaunchComplete={() => setScreen('landing')}
            onExplore3D={() => setScreen('exploration')}
          />
        </Suspense>
      )}

      {/* 4. PLANETARY LANDING SEQUENCE (LAZY LOADED WITH SKELETON) */}
      {screen === 'landing' && (
        <Suspense fallback={<ScreenSkeleton label="PREPARING ENTRY, DESCENT & LANDING SEQUENCE..." />}>
          <LandingPage
            destination={destination}
            onExploreTerrain={() => setScreen('exploration')}
          />
        </Suspense>
      )}

      {/* 5. 3D TERRAIN & NASA HARDWARE EXPLORATION WORLD */}
      {screen === 'exploration' && (
        <ExplorationPage
          destination={destination}
          resolvedData={resolvedData}
          onSelectMission={(mId) => {
            handleSelectDestination(destination, mId, true);
          }}
          onSelectHardware={(hId) => setActiveHardwareId(hId)}
          onOpenHardwareInspect={() => setIsHardwareModalOpen(true)}
          onOpenStory={handleOpenStory}
          onOpenQuiz={handleOpenQuiz}
          onOpenLandingVideo={() => {
            setScreen('landing');
          }}
          onReturnToDestinations={() => setScreen('destination')}
        />
      )}

      {/* LAZY LOADED MODALS & DRAWERS WITH SKELETON FALLBACKS */}

      {isHardwareModalOpen && (
        <Suspense fallback={<HardwareInspectSkeleton onClose={() => setIsHardwareModalOpen(false)} />}>
          <HardwareInspectModal
            isOpen={isHardwareModalOpen}
            onClose={() => setIsHardwareModalOpen(false)}
            resolvedData={resolvedData}
            isLoading={isLoadingNasaData}
          />
        </Suspense>
      )}

      {isSimulatorsOpen && (
        <Suspense fallback={null}>
          <ScienceSimulatorsModal
            isOpen={isSimulatorsOpen}
            onClose={() => setIsSimulatorsOpen(false)}
            activeMissionId={activeMissionId}
          />
        </Suspense>
      )}

      {isStoryModalOpen && (
        <Suspense fallback={<StoryModalSkeleton onClose={() => setIsStoryModalOpen(false)} />}>
          <AIStoryModal
            isOpen={isStoryModalOpen}
            onClose={() => setIsStoryModalOpen(false)}
            storyData={storyData}
            isLoading={isLoadingStory}
            error={storyError}
            onRetry={handleOpenStory}
            resolvedData={resolvedData}
          />
        </Suspense>
      )}

      {isAiChatOpen && (
        <Suspense fallback={null}>
          <AIChatbotDrawer
            isOpen={isAiChatOpen}
            onClose={() => setIsAiChatOpen(false)}
            resolvedData={resolvedData}
          />
        </Suspense>
      )}

      {isQuizModalOpen && (
        <Suspense fallback={<QuizModalSkeleton onClose={() => setIsQuizModalOpen(false)} />}>
          <AIQuizModal
            isOpen={isQuizModalOpen}
            onClose={() => setIsQuizModalOpen(false)}
            quizData={quizData}
            isLoading={isLoadingQuiz}
            error={quizError}
            onRetry={handleOpenQuiz}
            onAnswerQuestion={handleAnswerQuestion}
          />
        </Suspense>
      )}

      {isRegistryOpen && (
        <Suspense fallback={<DataRegistrySkeleton onClose={() => setIsRegistryOpen(false)} />}>
          <NasaDataRegistryModal
            isOpen={isRegistryOpen}
            onClose={() => setIsRegistryOpen(false)}
            resolvedData={resolvedData}
            isLoading={isLoadingNasaData}
          />
        </Suspense>
      )}

    </div>
  );
};

export default App;
