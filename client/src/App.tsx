import React, { useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react';
import {
  DestinationType,
  ScreenType,
  ResolvedNasaPayload,
  AIStoryPayload,
  AIQuizPayload,
  LiveFleetSummaryPayload,
} from './types';
import { Navbar } from './components/navigation/Navbar';
import { SpaceHomePage } from './pages/SpaceHomePage';
import { DestinationPage } from './pages/DestinationPage';
import { soundFx } from './utils/soundEffects';
import { prefetchTheaterModels, prefetchIdleSurfaceEssentials } from './utils/assetPreloader';
import { getClientFallbackPayload } from './utils/nasaDataFallback';
import { buildClientLiveFleetFallback } from './utils/liveTelemetry';
import {
  getTheaterForMission,
  getDefaultMissionForTheater,
  getDefaultHardwareForMission,
} from './utils/missionCatalog';
import {
  fetchNasaPayload,
  fetchAIStory,
  fetchAIQuiz,
  fetchLiveFleetTelemetry,
} from './services/api';
import { ScreenSkeleton } from './components/skeleton/ScreenSkeleton';
import { StoryModalSkeleton } from './components/skeleton/StoryModalSkeleton';
import { QuizModalSkeleton } from './components/skeleton/QuizModalSkeleton';
import { HardwareInspectSkeleton } from './components/skeleton/HardwareInspectSkeleton';
import { DataRegistrySkeleton } from './components/skeleton/DataRegistrySkeleton';
import { tourEngine } from './guide/tourEngine';
import { VoiceGuideDock } from './guide/VoiceGuideDock';
import { LiveTelemetryDrawer } from './components/data/LiveTelemetryDrawer';
import { SpacePreloader } from './components/common/SpacePreloader';

// Code-split heavy secondary routes & modals for instant initial bundle delivery
const EarthLaunchPage = lazy(() => import('./pages/EarthLaunchPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
// Exploration pulls in Rover3DModel (~95 KB) + surface environments; split it off the boot bundle.
const ExplorationPage = lazy(() => import('./pages/ExplorationPage'));
const HardwareInspectModal = lazy(() => import('./components/hardware/HardwareInspectModal'));
const AIStoryModal = lazy(() => import('./components/ai/AIStoryModal'));
const AIChatbotDrawer = lazy(() => import('./components/ai/AIChatbotDrawer'));
const AIQuizModal = lazy(() => import('./components/quiz/AIQuizModal'));
const NasaDataRegistryModal = lazy(() => import('./components/data/NasaDataRegistryModal'));
const ScienceSimulatorsModal = lazy(() => import('./components/simulators/ScienceSimulatorsModal'));

const SCREEN_ORDER: ScreenType[] = ['home', 'destination', 'launch', 'landing', 'exploration'];

export const App: React.FC = () => {
  // Initial critical-asset preloader gate (mounts WebGL behind curtain once warm, starts voice on reveal)
  const [isBootAssetsReady, setIsBootAssetsReady] = useState<boolean>(false);
  const [isBootDismissed, setIsBootDismissed] = useState<boolean>(false);

  // Navigation & Screen Journey State (Full 4-stage journey: destination -> launch -> landing -> exploration)
  const [screen, setScreen] = useState<ScreenType>('home');
  const [maxReachedScreen, setMaxReachedScreen] = useState<ScreenType>('home');
  const [destination, setDestination] = useState<DestinationType>('Mars');

  // Active Mission & Hardware State
  const [activeMissionId, setActiveMissionId] = useState<string>('perseverance');
  const [activeHardwareId, setActiveHardwareId] = useState<string>('supercam');

  // Gamification Suit O2 & Science XP State
  const [health, setHealth] = useState<number>(100);
  const [score, setScore] = useState<number>(150);
  const completedLabExperimentsRef = useRef<Set<string>>(new Set());

  // Resolved API Data States
  const [resolvedData, setResolvedData] = useState<ResolvedNasaPayload | null>(() =>
    getClientFallbackPayload('Mars', 'perseverance', 'supercam')
  );
  const [isLoadingNasaData, setIsLoadingNasaData] = useState<boolean>(false);

  // Live Fleet Telemetry State (60s polling + manual sync for Live NASA Side Panel)
  const [liveFleetData, setLiveFleetData] = useState<LiveFleetSummaryPayload | null>(() =>
    buildClientLiveFleetFallback()
  );
  const [isLiveSyncing, setIsLiveSyncing] = useState<boolean>(false);
  const [lastLiveSyncMs, setLastLiveSyncMs] = useState<number | null>(null);
  const [isLiveDrawerOpen, setIsLiveDrawerOpen] = useState<boolean>(false);

  // Story & Quiz states with loading/error lifecycle
  const [storyData, setStoryData] = useState<AIStoryPayload | null>(null);
  const [isLoadingStory, setIsLoadingStory] = useState<boolean>(false);
  const [storyError, setStoryError] = useState<string | null>(null);

  const [quizData, setQuizData] = useState<AIQuizPayload | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState<boolean>(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [quizRoundSeed, setQuizRoundSeed] = useState<number>(0);

  // Clear cached mission story & quiz whenever theater or mission changes
  useEffect(() => {
    setStoryData(null);
    setStoryError(null);
    setQuizData(null);
    setQuizError(null);
    setQuizRoundSeed(0);
  }, [destination, activeMissionId]);

  // Modal & Drawer Overlay States
  const [isHardwareModalOpen, setIsHardwareModalOpen] = useState<boolean>(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState<boolean>(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState<boolean>(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState<boolean>(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | null>(null);
  const [isRegistryOpen, setIsRegistryOpen] = useState<boolean>(false);
  const [isSimulatorsOpen, setIsSimulatorsOpen] = useState<boolean>(false);

  const navigateToScreen = useCallback((nextScreen: ScreenType) => {
    if (nextScreen !== 'exploration') {
      setIsLiveDrawerOpen(false);
    }
    setScreen(nextScreen);
    setMaxReachedScreen((prevMax) => {
      const prevIdx = SCREEN_ORDER.indexOf(prevMax);
      const nextIdx = SCREEN_ORDER.indexOf(nextScreen);
      return nextIdx > prevIdx ? nextScreen : prevMax;
    });
  }, []);

  // Warm the Exploration chunk + theater hardware GLBs while the visitor watches launch/landing
  // (or browses destinations) so the 3D surface opens instantly without a boot-time download storm.
  useEffect(() => {
    if (screen === 'destination' || screen === 'launch' || screen === 'landing') {
      void import('./pages/ExplorationPage');
      prefetchTheaterModels(destination);
    }
  }, [screen, destination]);

  // Once Home boot settles, silently pre-warm primary Mars/Moon surface assets & route bundles during idle time
  useEffect(() => {
    if (!isBootAssetsReady) return;
    const t = window.setTimeout(() => {
      void import('./pages/DestinationPage');
      void import('./pages/EarthLaunchPage');
      void import('./pages/LandingPage');
      void import('./pages/ExplorationPage');
      prefetchIdleSurfaceEssentials();
    }, 650);
    return () => clearTimeout(t);
  }, [isBootAssetsReady]);

  // Sync live telemetry bundle from backend / fallback
  const syncLiveFleet = useCallback(async (forceRefresh = false, signal?: AbortSignal) => {
    setIsLiveSyncing(true);
    try {
      const bundle = await fetchLiveFleetTelemetry(forceRefresh, signal);
      setLiveFleetData(bundle);
      setLastLiveSyncMs(Date.now());
    } catch (_) {
      // fetchLiveFleetTelemetry already returns graceful Keplerian math fallback
    } finally {
      setIsLiveSyncing(false);
    }
  }, []);

  useEffect(() => {
    const initialController = new AbortController();
    let pollController: AbortController | null = null;
    syncLiveFleet(false, initialController.signal);

    const pollId = setInterval(() => {
      pollController?.abort();
      pollController = new AbortController();
      syncLiveFleet(false, pollController.signal);
    }, 60_000);

    return () => {
      initialController.abort();
      pollController?.abort();
      clearInterval(pollId);
    };
  }, [syncLiveFleet]);

  // Synchronize Guided Tour Narration with active screen, destination & mission
  const prevScreenRef = useRef<ScreenType | null>(null);
  const prevMissionRef = useRef<string>(activeMissionId);
  const activeMissionIdRef = useRef<string>(activeMissionId);
  activeMissionIdRef.current = activeMissionId;

  useEffect(() => {
    if (!isBootDismissed) return;
    const prevScreen = prevScreenRef.current;
    prevScreenRef.current = screen;

    if (screen === 'home') {
      tourEngine.playTrack('welcome_home');
    } else if (screen === 'destination' || screen === 'launch' || screen === 'landing') {
      tourEngine.playScreenStage(screen, destination);
    } else if (screen === 'exploration') {
      if (destination === 'DeepSpace') {
        tourEngine.stopAudioOnly();
        prevMissionRef.current = activeMissionIdRef.current;
      } else if (prevScreen !== 'exploration') {
        const startedTour = tourEngine.playTrack('surface_telemetry', { oncePerSession: true });
        if (!startedTour) {
          tourEngine.playMissionBriefing(activeMissionIdRef.current, { force: false });
        }
        prevMissionRef.current = activeMissionIdRef.current;
      }
    }
  }, [screen, destination, isBootDismissed]);

  useEffect(() => {
    if (screen === 'exploration' && prevMissionRef.current !== activeMissionId) {
      prevMissionRef.current = activeMissionId;
      tourEngine.playMissionBriefing(activeMissionId, { force: false });
    } else {
      prevMissionRef.current = activeMissionId;
    }
  }, [screen, activeMissionId]);

  useEffect(() => {
    if (isHardwareModalOpen) {
      tourEngine.playTrack('hardware_specs', { oncePerSession: true });
    } else {
      tourEngine.stopTrackIfPlaying('hardware_specs');
    }
  }, [isHardwareModalOpen]);

  useEffect(() => {
    if (isStoryModalOpen) {
      tourEngine.playTrack('story_and_lab', { oncePerSession: true });
    } else if (!isSimulatorsOpen) {
      tourEngine.stopTrackIfPlaying('story_and_lab');
    }
  }, [isStoryModalOpen, isSimulatorsOpen]);

  useEffect(() => {
    if (isSimulatorsOpen) {
      tourEngine.playTrack('story_and_lab', { oncePerSession: true });
    } else if (!isStoryModalOpen) {
      tourEngine.stopTrackIfPlaying('story_and_lab');
    }
  }, [isSimulatorsOpen, isStoryModalOpen]);

  useEffect(() => {
    if (isQuizModalOpen) {
      tourEngine.playTrack('mission_quiz', { oncePerSession: true });
    } else {
      tourEngine.stopTrackIfPlaying('mission_quiz');
    }
  }, [isQuizModalOpen]);

  useEffect(() => {
    if (isLiveDrawerOpen) {
      tourEngine.playTrack('live_mission_data', { oncePerSession: true });
    } else {
      tourEngine.stopTrackIfPlaying('live_mission_data');
    }
  }, [isLiveDrawerOpen]);

  useEffect(() => {
    if (isAiChatOpen) {
      tourEngine.playTrack('gemini_ai_assistant', { oncePerSession: true });
    } else {
      tourEngine.stopTrackIfPlaying('gemini_ai_assistant');
    }
  }, [isAiChatOpen]);

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
        if (!controller.signal.aborted) {
          setResolvedData(payload);
        }
      } catch (err: unknown) {
        if ((err as Error).name !== 'AbortError') {
          console.warn('[NASA App] Payload resolution error:', err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingNasaData(false);
        }
      }
    }

    loadData();
    return () => controller.abort();
  }, [destination, activeMissionId, activeHardwareId]);

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

  const handleOpenQuiz = async (roundSeedOverride?: unknown) => {
    const nextSeed = typeof roundSeedOverride === 'number' ? roundSeedOverride : quizRoundSeed;
    const forceFresh = typeof roundSeedOverride === 'number' && roundSeedOverride > 0;
    if (typeof roundSeedOverride === 'number') {
      setQuizRoundSeed(nextSeed);
    }

    setIsQuizModalOpen(true);
    setIsLoadingQuiz(true);
    setQuizError(null);
    try {
      const quiz = await fetchAIQuiz(
        destination,
        activeMissionId,
        activeHardwareId,
        undefined,
        { roundSeed: nextSeed, forceFresh }
      );
      setQuizData(quiz);
    } catch (err: unknown) {
      console.warn('[NASA App] Quiz fetch error:', err);
      setQuizError((err as Error).message || 'Failed to generate flight evaluation quiz.');
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  const handleModifyHealth = (delta: number) => {
    setHealth((prev) => Math.max(0, Math.min(100, prev + delta)));
  };

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

  const handleEarnLabXp = (experimentId: string) => {
    if (!experimentId || completedLabExperimentsRef.current.has(experimentId)) return;
    completedLabExperimentsRef.current.add(experimentId);
    soundFx.playSuccess();
    setScore((prev) => prev + 25);
  };

  const handleSelectDestination = (
    selected: DestinationType,
    missionId?: string,
    directTo3D: boolean = false
  ) => {
    const targetMission = missionId || getDefaultMissionForTheater(selected);
    const resolvedTheater = missionId ? getTheaterForMission(targetMission, selected) : selected;
    const targetHardware = getDefaultHardwareForMission(targetMission, resolvedTheater);
    setDestination(resolvedTheater);
    setActiveMissionId(targetMission);
    setActiveHardwareId(targetHardware);
    setResolvedData(getClientFallbackPayload(resolvedTheater, targetMission, targetHardware));

    if (directTo3D) {
      setMaxReachedScreen('exploration');
      navigateToScreen('exploration');
    } else {
      navigateToScreen('launch');
    }
  };

  const handleInspectFleetMissionIn3D = (missionId: string, missionDest: string) => {
    const fallbackDest: DestinationType =
      missionDest === 'Mars' ? 'Mars' : missionDest === 'Moon' ? 'Moon' : 'DeepSpace';
    const resolvedDest = getTheaterForMission(missionId, fallbackDest);
    const targetHardware = getDefaultHardwareForMission(missionId, resolvedDest);
    setDestination(resolvedDest);
    setActiveMissionId(missionId);
    setActiveHardwareId(targetHardware);
    setResolvedData(getClientFallbackPayload(resolvedDest, missionId, targetHardware));
    navigateToScreen('exploration');
  };

  const handleAskAstra = (prompt: string) => {
    setAiInitialPrompt(prompt);
    setIsAiChatOpen(true);
  };

  return (
    <div
      data-destination={destination}
      className="min-h-screen bg-space-950 text-slate-100 font-sans relative overflow-x-hidden"
    >
      {/* Global Navigation Bar */}
      <Navbar
        currentScreen={screen}
        maxReachedScreen={maxReachedScreen}
        selectedDestination={destination}
        activeMissionId={activeMissionId}
        activeMissionName={resolvedData?.mission?.name}
        isAiChatOpen={isAiChatOpen}
        onNavigate={navigateToScreen}
        onToggleAiChat={() => setIsAiChatOpen((prev) => !prev)}
        onOpenRegistry={() => setIsRegistryOpen(true)}
        onOpenSimulators={() => setIsSimulatorsOpen(true)}
      />

      {/* Mission-Scoped Real-Time NASA Telemetry Drawer */}
      <LiveTelemetryDrawer
        isOpen={isLiveDrawerOpen}
        onClose={() => setIsLiveDrawerOpen(false)}
        fleetData={liveFleetData}
        isSyncing={isLiveSyncing}
        lastSyncMs={lastLiveSyncMs}
        onSyncNow={() => syncLiveFleet(true)}
        resolvedData={resolvedData}
        onSelectMissionIn3D={handleInspectFleetMissionIn3D}
        onAskAstra={handleAskAstra}
      />

      {/* 1. HOME SCREEN (mounts as soon as critical GLB/Draco assets warm in cache) */}
      {screen === 'home' && isBootAssetsReady && (
        <SpaceHomePage
          liveFleetData={liveFleetData}
          onExplore={(dest) => {
            if (dest) {
              const defaultMission = getDefaultMissionForTheater(dest);
              const defaultHw = getDefaultHardwareForMission(defaultMission, dest);
              setDestination(dest);
              setActiveMissionId(defaultMission);
              setActiveHardwareId(defaultHw);
              setResolvedData(getClientFallbackPayload(dest, defaultMission, defaultHw));
              setMaxReachedScreen('destination');
            }
            navigateToScreen('destination');
          }}
        />
      )}

      {/* 2. DESTINATION & LANDING SITE SELECTOR */}
      {screen === 'destination' && (
        <DestinationPage
          defaultDestination={destination}
          onCatalogChange={(newDest) => {
            const defaultMission = getDefaultMissionForTheater(newDest);
            const defaultHw = getDefaultHardwareForMission(defaultMission, newDest);
            setDestination(newDest);
            setActiveMissionId(defaultMission);
            setActiveHardwareId(defaultHw);
            setResolvedData(getClientFallbackPayload(newDest, defaultMission, defaultHw));
            setMaxReachedScreen('destination');
          }}
          onSelectDestination={(dest, missionId, directTo3D = false) =>
            handleSelectDestination(dest, missionId, directTo3D)
          }
        />
      )}

      {/* 3. EARTH LAUNCH & INTERPLANETARY TRANSIT */}
      {screen === 'launch' && (
        <Suspense fallback={<ScreenSkeleton label="Initializing launch trajectory..." />}>
          <EarthLaunchPage
            destination={destination}
            activeMissionId={activeMissionId}
            missionName={resolvedData?.mission?.name}
            onLaunchComplete={() => navigateToScreen('landing')}
            onExplore3D={() => navigateToScreen('exploration')}
          />
        </Suspense>
      )}

      {/* 4. PLANETARY LANDING / DEPLOYMENT SEQUENCE */}
      {screen === 'landing' && (
        <Suspense
          fallback={
            <ScreenSkeleton
              label={
                destination === 'DeepSpace'
                  ? 'Preparing orbital deployment and commissioning...'
                  : 'Preparing entry, descent, and landing sequence...'
              }
            />
          }
        >
          <LandingPage
            destination={destination}
            activeMissionId={activeMissionId}
            missionName={resolvedData?.mission?.name}
            onExploreTerrain={() => navigateToScreen('exploration')}
          />
        </Suspense>
      )}

      {/* 5. 3D SURFACE & HARDWARE EXPLORATION */}
      {screen === 'exploration' && (
        <Suspense fallback={<ScreenSkeleton label="Deploying 3D surface operations..." />}>
        <ExplorationPage
          destination={destination}
          resolvedData={resolvedData}
          liveFleetData={liveFleetData}
          isLoadingData={isLoadingNasaData}
          health={health}
          score={score}
          isLiveDataOpen={isLiveDrawerOpen}
          onOpenLiveData={() => setIsLiveDrawerOpen(true)}
          onSelectMission={(mId) => {
            const resolvedDest = getTheaterForMission(mId, destination);
            handleSelectDestination(resolvedDest, mId, true);
          }}
          onSelectHardware={(hId) => setActiveHardwareId(hId)}
          onOpenHardwareInspect={() => setIsHardwareModalOpen(true)}
          onOpenStory={handleOpenStory}
          onOpenSimulators={() => setIsSimulatorsOpen(true)}
          onOpenQuiz={() => handleOpenQuiz()}
          onSwitchTheater={() => navigateToScreen('destination')}
        />
        </Suspense>
      )}

      {/* Subtle non-blocking crossfade veil between mission stages (pure CSS, pointer-events-none) */}
      {isBootDismissed && (
        <div key={`curtain-${screen}`} aria-hidden="true" className="stage-curtain" />
      )}

      {/* LAZY LOADED MODALS & DRAWERS */}
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
        <Suspense fallback={<HardwareInspectSkeleton onClose={() => setIsSimulatorsOpen(false)} />}>
          <ScienceSimulatorsModal
            isOpen={isSimulatorsOpen}
            onClose={() => setIsSimulatorsOpen(false)}
            destination={destination}
            activeMissionId={activeMissionId}
            onEarnLabXp={handleEarnLabXp}
            onAskAstra={handleAskAstra}
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
            onAskAstra={handleAskAstra}
            resolvedData={resolvedData}
          />
        </Suspense>
      )}

      {isAiChatOpen && (
        <Suspense fallback={<DataRegistrySkeleton onClose={() => setIsAiChatOpen(false)} />}>
          <AIChatbotDrawer
            isOpen={isAiChatOpen}
            onClose={() => setIsAiChatOpen(false)}
            resolvedData={resolvedData}
            initialPrompt={aiInitialPrompt}
            onClearInitialPrompt={() => setAiInitialPrompt(null)}
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
            onRetry={() => handleOpenQuiz(quizRoundSeed)}
            onNewRound={() => handleOpenQuiz(quizRoundSeed + 1)}
            onAskAstra={handleAskAstra}
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
            liveFleetData={liveFleetData}
            lastSyncMs={lastLiveSyncMs}
            isLoading={isLoadingNasaData}
          />
        </Suspense>
      )}

      {/* Contextual Voice Narration Mini-Player (Only renders while voice narration is active) */}
      <VoiceGuideDock />

      {/* Cinematic film-grain + lens vignette (static, GPU-cheap, pointer-events-none) */}
      <div aria-hidden="true" className="app-film-grain" />

      {/* Initial Critical-Asset Preloader Overlay */}
      {!isBootDismissed && (
        <SpacePreloader
          onAssetsReady={() => setIsBootAssetsReady(true)}
          onReady={() => {
            setIsBootAssetsReady(true);
            setIsBootDismissed(true);
          }}
        />
      )}
    </div>
  );
};

export default App;
