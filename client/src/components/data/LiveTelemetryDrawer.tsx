import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Maximize2,
  MessageSquare,
  RefreshCw,
  Satellite,
  X,
} from 'lucide-react';
import {
  LiveFleetSummaryPayload,
  ResolvedNasaPayload,
} from '../../types';
import {
  getMissionScientificDataset,
  MissionScientificDataset,
} from '../../utils/liveTelemetry';
import { soundFx } from '../../utils/soundEffects';
import { DrawerShell, SegmentedControl, Badge, Button } from '../ui';
import { useTourSpotlight } from '../../guide/tourEngine';

interface LiveTelemetryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  fleetData: LiveFleetSummaryPayload | null;
  isSyncing: boolean;
  lastSyncMs: number | null;
  onSyncNow: () => void;
  resolvedData: ResolvedNasaPayload | null;
  onSelectMissionIn3D?: (missionId: string, destination: string) => void;
  onAskAstra?: (prompt: string) => void;
}

type MissionSectionTab = 'environment' | 'systems' | 'science';

interface NormalizedMissionPhoto {
  id: string;
  title: string;
  camera: string;
  dateLabel: string;
  imageUrl: string;
  caption: string;
  agency: string;
  sourceUrl?: string;
}

function formatUtcClock(ms: number): string {
  return `${new Date(ms).toISOString().slice(11, 19)} UTC`;
}

function extractCompactPowerValue(raw: string): string {
  const match = raw.match(/[\d,.]+\s*(?:W|kW)/i);
  if (match) return match[0];
  return raw.split('(')[0].trim();
}

function extractBatteryPercentage(raw: string): number | null {
  const match = raw.match(/(\d{1,3})\s*%/);
  if (!match) return null;
  const val = Number(match[1]);
  return Number.isFinite(val) ? Math.max(0, Math.min(100, val)) : null;
}

function extractCompactClockValue(
  dataset: MissionScientificDataset,
  resolvedData: ResolvedNasaPayload | null,
  liveTelemetry?: ResolvedNasaPayload['realTimeTelemetry'] | null
): string {
  const marsSol = liveTelemetry?.marsSol ?? resolvedData?.realTimeTelemetry?.marsSol;
  if (marsSol !== undefined) {
    return `Sol ${marsSol.toLocaleString()}`;
  }
  if (liveTelemetry?.missionElapsedText) {
    return liveTelemetry.missionElapsedText;
  }
  const clock = dataset.spacecraftTelemetry.clockLabel;
  if (clock.includes('·')) {
    return clock.split('·')[0].trim();
  }
  return resolvedData?.realTimeTelemetry?.missionElapsedText || clock;
}

function SpecRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5 border-b border-white/[0.06] last:border-b-0">
      <dt className="text-xs text-slate-400 shrink-0">{label}</dt>
      <dd
        className={`text-xs font-mono text-right break-words min-w-0 ${
          highlight ? 'text-[var(--accent-text)] font-semibold' : 'text-slate-100'
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function UtcMissionSubtitle({ siteName, isOpen }: { siteName: string; isOpen: boolean }) {
  const [tickNow, setTickNow] = useState<number>(() => Date.now());
  useEffect(() => {
    if (!isOpen) return;
    setTickNow(Date.now());
    const id = setInterval(() => setTickNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isOpen]);
  return <>{formatUtcClock(tickNow)} · {siteName}</>;
}

function SyncCountdownButton({
  isOpen,
  isSyncing,
  lastSyncMs,
  onSyncNow,
}: {
  isOpen: boolean;
  isSyncing: boolean;
  lastSyncMs: number | null;
  onSyncNow: () => void;
}) {
  const [tickNow, setTickNow] = useState<number>(() => Date.now());
  useEffect(() => {
    if (!isOpen) return;
    setTickNow(Date.now());
    const id = setInterval(() => setTickNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isOpen]);
  const nextAutoSyncInSec = lastSyncMs
    ? Math.max(0, 60 - Math.floor((tickNow - lastSyncMs) / 1000))
    : 60;
  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={isSyncing}
      onClick={() => {
        soundFx.playClick();
        onSyncNow();
      }}
      icon={<RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />}
    >
      {isSyncing ? 'Syncing' : `Sync (${nextAutoSyncInSec}s)`}
    </Button>
  );
}

export const LiveTelemetryDrawer: React.FC<LiveTelemetryDrawerProps> = ({
  isOpen,
  onClose,
  fleetData,
  isSyncing,
  lastSyncMs,
  onSyncNow,
  resolvedData,
  onAskAstra,
}) => {
  const [activeTab, setActiveTab] = useState<MissionSectionTab>('environment');
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const [failedUrls, setFailedUrls] = useState<Record<string, boolean>>({});
  const [expandedApod, setExpandedApod] = useState(false);
  const [apodFailed, setApodFailed] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const photosSpotlight = useTourSpotlight('live-data-photos');
  const weatherSpotlight = useTourSpotlight('live-data-weather');
  const radiationSpotlight = useTourSpotlight('live-data-radiation');
  const orbitalSpotlight = useTourSpotlight('live-data-orbital');
  const geminiSpotlight = useTourSpotlight('live-data-gemini');

  const activeMissionId = resolvedData?.mission?.id || 'perseverance';

  // Reset photo selection & tab when entering a different mission
  useEffect(() => {
    setActivePhotoIndex(0);
    setFailedUrls({});
    setApodFailed(false);
    setIsLightboxOpen(false);
  }, [activeMissionId, isOpen]);

  // Capture Escape key when full-resolution photo lightbox is open so parent DrawerShell stays open
  useEffect(() => {
    if (!isLightboxOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setIsLightboxOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [isLightboxOpen]);

  const scienceDataset: MissionScientificDataset = useMemo(
    () => getMissionScientificDataset(activeMissionId, lastSyncMs || Date.now()),
    [activeMissionId, lastSyncMs, isOpen]
  );

  const matchedResolved = useMemo(
    () =>
      resolvedData?.mission?.id?.toLowerCase() === activeMissionId.toLowerCase()
        ? resolvedData
        : null,
    [resolvedData, activeMissionId]
  );

  const fleetMissionEntry = useMemo(
    () =>
      fleetData?.missions?.find(
        (m) => m.id.toLowerCase() === activeMissionId.toLowerCase()
      ) || null,
    [fleetData?.missions, activeMissionId]
  );

  const liveMissionTelemetry = useMemo(() => {
    const a = matchedResolved?.realTimeTelemetry;
    const b = fleetMissionEntry?.realTimeTelemetry;
    const primary = a || b;
    if (!primary) return null;
    const secondary = primary === a ? b : a;
    return {
      ...secondary,
      ...primary,
      roverManifest: primary.roverManifest || secondary?.roverManifest,
      liveCoords: primary.liveCoords || secondary?.liveCoords,
      updates: primary.updates?.length ? primary.updates : secondary?.updates || [],
      isLiveApi: Boolean(a?.isLiveApi || b?.isLiveApi),
      feedSource: a?.isLiveApi ? a.feedSource : b?.feedSource || primary.feedSource,
    };
  }, [matchedResolved?.realTimeTelemetry, fleetMissionEntry]);

  // Prioritize live NASA API & mission-specific resolved captures BEFORE static dataset photos (deduplicated)
  const missionPhotos = useMemo<NormalizedMissionPhoto[]>(() => {
    const seen = new Set<string>();
    const list: NormalizedMissionPhoto[] = [];

    for (const img of matchedResolved?.images || []) {
      if (!img.imageUrl || seen.has(img.imageUrl) || failedUrls[img.imageUrl]) continue;
      seen.add(img.imageUrl);
      list.push({
        id: img.nasaId || img.imageUrl,
        title: img.title,
        camera: img.source || 'NASA Live API',
        dateLabel: img.date || 'Live NASA Archive',
        imageUrl: img.imageUrl,
        caption: img.description,
        agency: img.source || scienceDataset.agency,
        sourceUrl: img.sourceUrl,
      });
    }

    for (const ph of scienceDataset.latestPhotos) {
      if (!ph.imageUrl || seen.has(ph.imageUrl) || failedUrls[ph.imageUrl]) continue;
      seen.add(ph.imageUrl);
      list.push({
        id: ph.id,
        title: ph.title,
        camera: ph.camera,
        dateLabel: ph.solOrDate,
        imageUrl: ph.imageUrl,
        caption: ph.caption,
        agency: ph.agency,
      });
    }

    return list.slice(0, 8);
  }, [scienceDataset, matchedResolved?.images, failedUrls]);

  const safeIndex =
    missionPhotos.length > 0 ? Math.min(activePhotoIndex, missionPhotos.length - 1) : 0;
  const activePhoto = missionPhotos[safeIndex];

  const syncedEarthDistanceLabel =
    liveMissionTelemetry?.earthDistanceLabel || scienceDataset.orbital.earthDistanceLabel;
  const syncedOneWayDelay =
    liveMissionTelemetry?.signalDelayLabel || scienceDataset.orbital.oneWayLightDelay;
  const syncedRoundTripDelay =
    liveMissionTelemetry?.roundTripDelayLabel || scienceDataset.orbital.roundTripLightDelay;
  const syncedOrbitalVelocityLabel = liveMissionTelemetry?.orbitalVelocityKmh
    ? `${(liveMissionTelemetry.orbitalVelocityKmh / 3600).toFixed(2)} km/s (${liveMissionTelemetry.orbitalVelocityKmh.toLocaleString('en-US')} km/h)`
    : scienceDataset.orbital.orbitalVelocityKmS;

  const iss =
    fleetData?.issLive ||
    (liveMissionTelemetry?.liveCoords
      ? {
          latitude: liveMissionTelemetry.liveCoords.lat,
          longitude: liveMissionTelemetry.liveCoords.lon,
          altitudeKm: liveMissionTelemetry.orbitalAltitudeKm || 418,
          velocityKmh: liveMissionTelemetry.orbitalVelocityKmh || 27580,
          visibility: liveMissionTelemetry.liveCoords.visibility || 'daylight',
          source: liveMissionTelemetry.feedSource || 'Orbital Ephemeris',
          isLive: Boolean(liveMissionTelemetry.isLiveApi),
        }
      : undefined);
  const apod = fleetData?.apod;
  const alerts = fleetData?.spaceWeather || [];
  const apiStatusList = fleetData?.apiStatus || [];

  const batteryPct = extractBatteryPercentage(
    scienceDataset.spacecraftTelemetry.batteryChargePct
  );
  const compactClock = extractCompactClockValue(
    scienceDataset,
    matchedResolved,
    liveMissionTelemetry
  );
  const compactPower = extractCompactPowerValue(
    scienceDataset.spacecraftTelemetry.powerOutputW
  );

  const buildTelemetryPrompt = (question: string) =>
    `[LIVE MISSION DATA CONTEXT FOR ${scienceDataset.missionName} (${scienceDataset.agency})]\n` +
    `- Location: ${scienceDataset.siteName} (${scienceDataset.coordinatesLabel})\n` +
    `- Weather & Atmosphere: Pressure ${scienceDataset.weather.pressureLabel}, Wind ${scienceDataset.weather.windSpeedLabel}, Dust ${scienceDataset.weather.dustOpticalDepth}, Gas Mix ${scienceDataset.weather.composition}\n` +
    `- Surface Temperature: High ${scienceDataset.thermal.daytimeHigh}, Low ${scienceDataset.thermal.nighttimeLow}, Subsurface ${scienceDataset.thermal.subsurfaceTemp}\n` +
    `- Radiation & Seismic: Dose ${scienceDataset.radiationSeismic.cosmicRayDose}, Quakes ${scienceDataset.radiationSeismic.catalogedQuakes}, Finding: ${scienceDataset.radiationSeismic.crustalFinding}\n` +
    `- Orbital & Telemetry: Distance ${syncedEarthDistanceLabel}, Signal Delay ${syncedOneWayDelay}, Clock ${compactClock}, Power ${scienceDataset.spacecraftTelemetry.powerOutputW}\n` +
    `Question: ${question}`;

  const handleOpenAstra = (question: string) => {
    soundFx.playClick();
    onClose();
    onAskAstra?.(buildTelemetryPrompt(question));
  };

  const handlePrevPhoto = () => {
    if (missionPhotos.length < 2) return;
    soundFx.playClick();
    setActivePhotoIndex((i) => (i - 1 + missionPhotos.length) % missionPhotos.length);
  };

  const handleNextPhoto = () => {
    if (missionPhotos.length < 2) return;
    soundFx.playClick();
    setActivePhotoIndex((i) => (i + 1) % missionPhotos.length);
  };

  const shortMissionTitle = scienceDataset.missionName.split('(')[0].trim();

  return (
    <DrawerShell
      id="live-nasa-drawer"
      isOpen={isOpen}
      onClose={onClose}
      width="lg"
      flushBody
      eyebrow={`${scienceDataset.agency} · ${scienceDataset.coordinatesLabel}`}
      title={scienceDataset.missionName}
      subtitle={<UtcMissionSubtitle siteName={scienceDataset.siteName} isOpen={isOpen} />}
      headerActions={
        <SyncCountdownButton
          isOpen={isOpen}
          isSyncing={isSyncing}
          lastSyncMs={lastSyncMs}
          onSyncNow={onSyncNow}
        />
      }
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="truncate">
              {scienceDataset.spacecraftTelemetry.activeDsnStation}
            </span>
          </div>

          {onAskAstra && (
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                handleOpenAstra(
                  `Summarize the latest imagery, environment, and live orbital telemetry for ${scienceDataset.missionName}.`
                )
              }
              icon={<MessageSquare className="w-3.5 h-3.5" />}
              className={geminiSpotlight.className}
            >
              Ask Astra · Gemini AI ({shortMissionTitle})
            </Button>
          )}
        </div>
      }
    >
      {/* ═══════════════════════════════════════════════════════════════════════
          1. TOP PRIORITY: FULL-BLEED MISSION IMAGERY STAGE
         ═══════════════════════════════════════════════════════════════════════ */}
      {activePhoto ? (
        <section
          aria-label="Latest mission photography"
          className={`m-2 rounded-xl bg-[#05070C] ${photosSpotlight.className}`}
        >
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#05070C] border-b border-white/[0.08]">
            <img
              key={activePhoto.imageUrl}
              src={activePhoto.imageUrl}
              alt={activePhoto.title}
              onError={() =>
                setFailedUrls((prev) => ({ ...prev, [activePhoto.imageUrl]: true }))
              }
              className="w-full h-full object-cover block"
            />

            {/* Bottom-only legible gradient scrim */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#07090F] via-[#07090F]/55 to-transparent pointer-events-none"
            />

            {/* Top bar: Camera tag & Frame controls */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
              <span className="px-2.5 py-1 rounded-md bg-[#07090F]/75 backdrop-blur-md border border-white/[0.12] text-[11px] font-mono text-slate-200 truncate max-w-[65%]">
                {activePhoto.camera}
              </span>

              <div className="flex items-center gap-1.5">
                {missionPhotos.length > 1 && (
                  <div className="flex items-center rounded-md bg-[#07090F]/75 backdrop-blur-md border border-white/[0.12] overflow-hidden">
                    <button
                      type="button"
                      onClick={handlePrevPhoto}
                      aria-label="Previous capture"
                      className="p-1.5 text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2 text-[11px] font-mono tabular-nums text-slate-300">
                      {safeIndex + 1}/{missionPhotos.length}
                    </span>
                    <button
                      type="button"
                      onClick={handleNextPhoto}
                      aria-label="Next capture"
                      className="p-1.5 text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setIsLightboxOpen(true);
                  }}
                  aria-label="Inspect full-resolution image"
                  title="Inspect full resolution"
                  className="p-1.5 rounded-md bg-[#07090F]/75 backdrop-blur-md border border-white/[0.12] text-slate-200 hover:text-white hover:bg-white/[0.10] transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bottom overlay: Sol/date stamp + Title */}
            <div className="absolute inset-x-4 bottom-3.5 space-y-1">
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-[var(--accent-text)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{activePhoto.dateLabel}</span>
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-white font-display leading-snug">
                {activePhoto.title}
              </h3>
            </div>
          </div>

          {/* Caption + Horizontal Thumbnail Filmstrip */}
          <div className="px-5 py-3.5 space-y-3 border-b border-white/[0.08] bg-[#090D16]">
            <div className="flex items-start justify-between gap-4">
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                {activePhoto.caption}
              </p>
              {activePhoto.sourceUrl ? (
                <a
                  href={activePhoto.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white transition-colors"
                >
                  <span>Source</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="shrink-0 text-[11px] font-mono text-slate-400">
                  {activePhoto.agency}
                </span>
              )}
            </div>

            {missionPhotos.length > 1 && (
              <div
                className="flex items-center gap-2 overflow-x-auto pb-0.5"
                role="listbox"
                aria-label="Mission image gallery"
              >
                {missionPhotos.map((ph, idx) => {
                  const isSelected = idx === safeIndex;
                  return (
                    <button
                      key={ph.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        soundFx.playClick();
                        setActivePhotoIndex(idx);
                      }}
                      title={ph.title}
                      className={`relative shrink-0 w-20 aspect-[16/10] rounded-md overflow-hidden border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)] opacity-100'
                          : 'border-white/[0.10] opacity-55 hover:opacity-90'
                      }`}
                    >
                      <img
                        src={ph.imageUrl}
                        alt={ph.title}
                        loading="lazy"
                        className="w-full h-full object-cover block"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      ) : (
        <section
          aria-label="Mission image fallback"
          className={`px-5 py-4 border-b border-white/[0.08] bg-[#05070C] ${photosSpotlight.className}`}
        >
          <div className="rounded-xl border border-dashed border-white/[0.12] bg-slate-900/50 px-4 py-5 text-center space-y-1.5">
            <div className="text-xs font-mono text-slate-300">
              Archive imagery unavailable or offline for {shortMissionTitle}
            </div>
            <p className="text-[11px] text-slate-400">
              All external imagery links exhausted or unreachable. Scientific telemetry channels remain live below.
            </p>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          2. ARCHITECTURAL 4-METRIC LIVE TELEMETRY STRIP
         ═══════════════════════════════════════════════════════════════════════ */}
      <section
        aria-label="Live mission telemetry summary"
        className="grid grid-cols-2 sm:grid-cols-4 border-b border-white/[0.08] divide-y sm:divide-y-0 sm:divide-x divide-white/[0.08] bg-slate-950/55"
      >
        <div className="px-4 py-3">
          <span className="block text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Mission clock
          </span>
          <span className="block text-sm font-mono font-semibold text-slate-50 tabular-nums mt-0.5 truncate">
            {compactClock}
          </span>
        </div>

        <div className={`px-4 py-3 ${orbitalSpotlight.className}`}>
          <span className="block text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Earth range
          </span>
          <span className="block text-sm font-mono font-semibold text-slate-50 tabular-nums mt-0.5 truncate">
            {syncedEarthDistanceLabel}
          </span>
        </div>

        <div className={`px-4 py-3 ${orbitalSpotlight.className}`}>
          <span className="block text-[11px] font-mono uppercase tracking-wider text-slate-400">
            1-way signal
          </span>
          <span className="block text-sm font-mono font-semibold text-slate-50 tabular-nums mt-0.5 truncate">
            {syncedOneWayDelay}
          </span>
        </div>

        <div className="px-4 py-3">
          <span className="block text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Power output
          </span>
          <span className="block text-sm font-mono font-semibold text-[var(--accent-text)] tabular-nums mt-0.5 truncate">
            {compactPower}
          </span>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          3. MISSION-SPECIFIC SPEC & SCIENCE TABS
         ═══════════════════════════════════════════════════════════════════════ */}
      <div className="px-5 py-4 space-y-5">
        <SegmentedControl<MissionSectionTab>
          ariaLabel="Mission live data sections"
          fullWidth
          value={activeTab}
          onChange={setActiveTab}
          options={[
            { value: 'environment', label: 'Environment' },
            { value: 'systems', label: 'Orbit & systems' },
            {
              value: 'science',
              label: 'Science & APOD',
              count: scienceDataset.observations.length,
            },
          ]}
        />

        {/* TAB A: ENVIRONMENT (Atmosphere, Thermal Span, Radiation & Seismic) */}
        {activeTab === 'environment' && (
          <div className="space-y-6 animate-fade-in">
            {/* Atmosphere & Weather */}
            <section className={`space-y-2 rounded-xl p-1 -m-1 ${weatherSpotlight.className}`}>
              <div className="flex items-baseline justify-between gap-2 pb-1.5 border-b border-white/[0.10]">
                <h4 className="hud-eyebrow">Atmosphere &amp; weather</h4>
                <span className="text-[11px] font-mono text-slate-400 truncate">
                  {scienceDataset.weather.instrument}
                </span>
              </div>
              <dl>
                <SpecRow label="Pressure" value={scienceDataset.weather.pressureLabel} highlight />
                <SpecRow label="Wind" value={scienceDataset.weather.windSpeedLabel} />
                <SpecRow label="Circulation" value={scienceDataset.weather.windDirection} />
                <SpecRow label="Dust opacity" value={scienceDataset.weather.dustOpticalDepth} />
                <SpecRow label="Solar / UV" value={scienceDataset.weather.uvIndexOrIrradiance} />
                <SpecRow label="Composition" value={scienceDataset.weather.composition} />
              </dl>
            </section>

            {/* Thermal Profile */}
            <section className="space-y-3">
              <div className="flex items-baseline justify-between gap-2 pb-1.5 border-b border-white/[0.10]">
                <h4 className="hud-eyebrow">Thermal profile</h4>
                <span className="text-[11px] font-mono text-slate-400 truncate">
                  {scienceDataset.thermal.instrument}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 py-1">
                <div>
                  <span className="block text-[11px] font-mono text-slate-400 uppercase">
                    Nighttime low
                  </span>
                  <span className="block text-sm font-mono font-semibold text-sky-300 mt-0.5">
                    {scienceDataset.thermal.nighttimeLow}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[11px] font-mono text-slate-400 uppercase">
                    Daytime high
                  </span>
                  <span className="block text-sm font-mono font-semibold text-amber-300 mt-0.5">
                    {scienceDataset.thermal.daytimeHigh}
                  </span>
                </div>
              </div>

              {/* Minimal thermal span gradient track */}
              <div
                aria-hidden="true"
                className="h-1.5 w-full rounded-full bg-gradient-to-r from-sky-400/75 via-slate-400/35 to-amber-400/85"
              />

              <dl>
                <SpecRow label="Subsurface" value={scienceDataset.thermal.subsurfaceTemp} />
                <SpecRow label="Thermal inertia" value={scienceDataset.thermal.thermalInertia} />
              </dl>

              <p className="text-xs text-slate-300 leading-relaxed">
                {scienceDataset.thermal.environmentNote}
              </p>
            </section>

            {/* Radiation & Seismic */}
            <section className={`space-y-2 rounded-xl p-1 -m-1 ${radiationSpotlight.className}`}>
              <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/[0.10]">
                <h4 className="hud-eyebrow">Radiation &amp; interior</h4>
                <Badge tone="warning">{scienceDataset.radiationSeismic.cosmicRayDose}</Badge>
              </div>
              <dl>
                <SpecRow
                  label="Dosimetry"
                  value={scienceDataset.radiationSeismic.radiationInstrument}
                />
                <SpecRow
                  label="Solar particle state"
                  value={scienceDataset.radiationSeismic.solarParticleState}
                />
                <SpecRow
                  label="Seismic network"
                  value={scienceDataset.radiationSeismic.seismicInstrument}
                />
                <SpecRow
                  label="Catalog"
                  value={scienceDataset.radiationSeismic.catalogedQuakes}
                />
                <SpecRow
                  label="Peak event"
                  value={scienceDataset.radiationSeismic.peakMagnitude}
                />
              </dl>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                {scienceDataset.radiationSeismic.crustalFinding}
              </p>
            </section>
          </div>
        )}

        {/* TAB B: ORBIT & SYSTEMS (Ephemeris, Power/DSN, ISS Live & Space Weather) */}
        {activeTab === 'systems' && (
          <div className="space-y-6 animate-fade-in">
            {/* Spacecraft Systems */}
            <section className="space-y-2.5">
              <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/[0.10]">
                <h4 className="hud-eyebrow">Spacecraft systems</h4>
                <Badge tone="success" dot>
                  {scienceDataset.spacecraftTelemetry.healthStatus}
                </Badge>
              </div>

              {batteryPct !== null && (
                <div className="py-1.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Energy storage bus</span>
                    <span className="text-slate-100 font-semibold tabular-nums">
                      {batteryPct}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800/90 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-400/90 transition-all duration-300"
                      style={{ width: `${batteryPct}%` }}
                    />
                  </div>
                </div>
              )}

              <dl>
                <SpecRow
                  label="Power source"
                  value={scienceDataset.spacecraftTelemetry.powerSource}
                />
                <SpecRow
                  label="Output"
                  value={scienceDataset.spacecraftTelemetry.powerOutputW}
                  highlight
                />
                <SpecRow
                  label="Storage"
                  value={scienceDataset.spacecraftTelemetry.batteryChargePct}
                />
                <SpecRow
                  label="Traverse / data"
                  value={scienceDataset.spacecraftTelemetry.odometryOrOrbits}
                />
                <SpecRow
                  label="Comm link"
                  value={scienceDataset.spacecraftTelemetry.commBandAndRate}
                />
                <SpecRow
                  label="Ground station"
                  value={scienceDataset.spacecraftTelemetry.activeDsnStation}
                />
              </dl>
            </section>

            {/* Orbital Ephemeris */}
            <section className={`space-y-2 rounded-xl p-1 -m-1 ${orbitalSpotlight.className}`}>
              <div className="flex items-baseline justify-between gap-2 pb-1.5 border-b border-white/[0.10]">
                <h4 className="hud-eyebrow">Orbital ephemeris</h4>
                <span className="text-[11px] font-mono text-slate-400">
                  {liveMissionTelemetry?.feedSource || 'J2000 Elements'}
                </span>
              </div>
              <dl>
                <SpecRow
                  label="Earth distance"
                  value={syncedEarthDistanceLabel}
                  highlight
                />
                <SpecRow
                  label="Round-trip delay"
                  value={syncedRoundTripDelay}
                />
                <SpecRow
                  label="Solar range"
                  value={scienceDataset.orbital.heliocentricDistanceAU}
                />
                <SpecRow
                  label="Orbital velocity"
                  value={syncedOrbitalVelocityLabel}
                />
                <SpecRow
                  label="Orbit / elevation"
                  value={scienceDataset.orbital.altitudeOrInclination}
                />
                <SpecRow label="Period" value={scienceDataset.orbital.orbitalPeriodLabel} />
              </dl>
            </section>

            {/* Mission-Specific Live Manifest & Telemetry Updates */}
            {(liveMissionTelemetry?.roverManifest || (liveMissionTelemetry?.updates && liveMissionTelemetry.updates.length > 0)) && (
              <section className="space-y-2.5">
                <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/[0.10]">
                  <h4 className="hud-eyebrow">
                    Live mission feed · {shortMissionTitle}
                  </h4>
                  <Badge tone={liveMissionTelemetry.isLiveApi ? 'success' : 'neutral'} dot>
                    {liveMissionTelemetry.isLiveApi ? 'NASA API SYNCED' : 'EPHEMERIS LIVE'}
                  </Badge>
                </div>

                {liveMissionTelemetry.roverManifest && (
                  <dl>
                    <SpecRow
                      label="Latest photo downlink"
                      value={`Sol ${liveMissionTelemetry.roverManifest.maxSol.toLocaleString()} (${liveMissionTelemetry.roverManifest.maxDate || 'Recent'})`}
                      highlight
                    />
                    <SpecRow
                      label="Total logged frames"
                      value={liveMissionTelemetry.roverManifest.totalPhotos.toLocaleString('en-US')}
                    />
                    {liveMissionTelemetry.roverManifest.cameras.length > 0 && (
                      <SpecRow
                        label="Active camera stream"
                        value={liveMissionTelemetry.roverManifest.cameras.join(', ')}
                      />
                    )}
                  </dl>
                )}

                {liveMissionTelemetry.updates && liveMissionTelemetry.updates.length > 0 && (
                  <div className="divide-y divide-white/[0.06]">
                    {liveMissionTelemetry.updates.slice(0, 3).map((upd) => (
                      <div key={upd.id} className="py-2 space-y-0.5">
                        <div className="flex items-center justify-between gap-2 text-xs font-mono">
                          <span className="text-slate-100 font-semibold truncate">{upd.title}</span>
                          {upd.badge && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
                              {upd.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{upd.detail}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ISS Live Track (only when inspecting ISS) */}
            {activeMissionId === 'iss' && iss && (
              <section className="space-y-2">
                <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/[0.10]">
                  <h4 className="hud-eyebrow flex items-center gap-1.5">
                    <Satellite className="w-3.5 h-3.5" />
                    <span>Live sub-satellite pass</span>
                  </h4>
                  <Badge tone="success" dot>
                    {iss.visibility}
                  </Badge>
                </div>
                <dl>
                  <SpecRow
                    label="Coordinates"
                    value={`${iss.latitude.toFixed(2)}°, ${iss.longitude.toFixed(2)}°`}
                    highlight
                  />
                  <SpecRow label="Altitude" value={`${Math.round(iss.altitudeKm)} km`} />
                  <SpecRow
                    label="Ground velocity"
                    value={`${Math.round(iss.velocityKmh).toLocaleString()} km/h`}
                  />
                </dl>
              </section>
            )}

            {/* Space Weather & Live Endpoints */}
            {alerts.length > 0 && (
              <section className="space-y-2.5">
                <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/[0.10]">
                  <h4 className="hud-eyebrow">Solar &amp; space weather (DONKI)</h4>
                  <span className="text-[11px] font-mono text-slate-400">
                    {alerts.length} active
                  </span>
                </div>
                <div className="divide-y divide-white/[0.06]">
                  {alerts.slice(0, 3).map((alert) => (
                    <div key={alert.id} className="py-2.5 space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-amber-300 font-semibold">{alert.messageType}</span>
                        <span className="text-slate-400">
                          {alert.issueTime
                            ? new Date(alert.issueTime).toLocaleDateString()
                            : 'Active'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{alert.summary}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {apiStatusList.length > 0 && (
              <section className="space-y-2">
                <div className="pb-1.5 border-b border-white/[0.10]">
                  <h4 className="hud-eyebrow">Telemetry feed status</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {apiStatusList.map((item) => {
                    const isLive = item.status === 'LIVE' || item.status === 'CACHED';
                    return (
                      <a
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/70 hover:bg-slate-800/80 border border-white/[0.08] text-xs font-mono transition-colors"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isLive ? 'bg-emerald-400' : 'bg-slate-400'
                          }`}
                        />
                        <span className="text-slate-200">{item.name}</span>
                      </a>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}

        {/* TAB C: SCIENCE BULLETINS & APOD */}
        {activeTab === 'science' && (
          <div className="space-y-6 animate-fade-in">
            <section className="space-y-1">
              <div className="flex items-baseline justify-between gap-2 pb-1.5 border-b border-white/[0.10]">
                <h4 className="hud-eyebrow">Published scientific observations</h4>
                <span className="text-[11px] font-mono text-slate-400">
                  {scienceDataset.agency}
                </span>
              </div>

              <div className="divide-y divide-white/[0.07]">
                {scienceDataset.observations.map((obs) => (
                  <article key={obs.id} className="py-3.5 space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                      <span className="text-[var(--accent-text)] font-semibold">
                        {obs.instrument} · {obs.agency}
                      </span>
                      <span className="text-slate-400 shrink-0">{obs.date}</span>
                    </div>
                    <h5 className="text-sm font-semibold text-slate-50 font-display">
                      {obs.title}
                    </h5>
                    <p className="text-xs text-slate-300 leading-relaxed">{obs.summary}</p>
                    <a
                      href={obs.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-white transition-colors pt-0.5"
                    >
                      <span>Official {obs.agency} publication</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </article>
                ))}
              </div>
            </section>

            {apod && (
              <section className="space-y-3 pt-2 border-t border-white/[0.10]">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="hud-eyebrow">NASA Astronomy Picture of the Day</h4>
                  <span className="text-[11px] font-mono text-slate-400">{apod.date}</span>
                </div>

                {apod.mediaType === 'image' && apod.url && !apodFailed ? (
                  <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-[#05070C]">
                    <img
                      src={apod.url}
                      alt={apod.title}
                      loading="lazy"
                      onError={() => setApodFailed(true)}
                      className="w-full aspect-[16/9] object-cover block"
                    />
                  </div>
                ) : apodFailed ? (
                  <div className="rounded-xl border border-white/[0.08] bg-slate-900/50 px-4 py-3 text-xs font-mono text-slate-400">
                    NASA APOD image preview unreachable offline — read mission narrative below.
                  </div>
                ) : null}

                <div className="space-y-1.5">
                  <h5 className="text-sm font-semibold text-white font-display">{apod.title}</h5>
                  <p
                    className={`text-xs text-slate-300 leading-relaxed ${
                      expandedApod ? '' : 'line-clamp-3'
                    }`}
                  >
                    {apod.explanation}
                  </p>
                  <button
                    type="button"
                    onClick={() => setExpandedApod((v) => !v)}
                    className="text-xs font-mono text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    {expandedApod ? 'Show less' : 'Read full NASA explanation'}
                  </button>
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          4. FULL-RESOLUTION PHOTO LIGHTBOX OVERLAY (inside DrawerShell top-layer)
         ═══════════════════════════════════════════════════════════════════════ */}
      {isLightboxOpen && activePhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.title}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              soundFx.playClick();
              setIsLightboxOpen(false);
            }
          }}
          className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none"
        >
          <div className="w-full max-w-[920px] max-h-[90dvh] flex flex-col rounded-2xl hud-modal overflow-hidden shadow-2xl">
            <div className="px-5 py-3.5 border-b border-white/[0.08] flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] font-mono text-[var(--accent-text)] uppercase tracking-wider truncate">
                  {activePhoto.camera} · {activePhoto.dateLabel}
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-white font-display truncate">
                  {activePhoto.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setIsLightboxOpen(false);
                }}
                aria-label="Close full-resolution view"
                className="w-8 h-8 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-white/[0.08] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#05070C] flex items-center justify-center p-3">
              <img
                src={activePhoto.imageUrl}
                alt={activePhoto.title}
                className="max-h-[65dvh] w-auto max-w-full object-contain rounded-lg block"
              />
            </div>

            <div className="px-5 py-3.5 border-t border-white/[0.08] bg-[#090D16] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-slate-300 leading-relaxed">{activePhoto.caption}</p>
              <span className="text-[11px] font-mono text-slate-400 shrink-0">
                {activePhoto.agency}
              </span>
            </div>
          </div>
        </div>
      )}
    </DrawerShell>
  );
};

export default LiveTelemetryDrawer;
