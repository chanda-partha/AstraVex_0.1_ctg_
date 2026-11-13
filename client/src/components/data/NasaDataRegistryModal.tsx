import React from 'react';
import { LiveFleetSummaryPayload, ResolvedNasaPayload } from '../../types';
import { ExternalLink, Server, Compass } from 'lucide-react';
import { DataRegistrySkeleton } from '../skeleton/DataRegistrySkeleton';
import { ModalShell, Badge, Stat } from '../ui';

interface NasaDataRegistryModalProps {
  isOpen: boolean;
  onClose: () => void;
  resolvedData: ResolvedNasaPayload | null;
  liveFleetData?: LiveFleetSummaryPayload | null;
  lastSyncMs?: number | null;
  isLoading?: boolean;
}

function getStatusPresentation(rawStatus?: 'LIVE' | 'CACHED' | 'COMPUTED'): {
  label: string;
  tone: 'success' | 'accent' | 'warning';
} {
  if (rawStatus === 'LIVE') return { label: 'Live API', tone: 'success' };
  if (rawStatus === 'CACHED') return { label: 'Cached TTL', tone: 'accent' };
  return { label: 'Computed fallback', tone: 'warning' };
}

export const NasaDataRegistryModal: React.FC<NasaDataRegistryModalProps> = ({
  isOpen,
  onClose,
  resolvedData,
  liveFleetData,
  lastSyncMs,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  if (isLoading && !resolvedData) {
    return <DataRegistrySkeleton onClose={onClose} />;
  }

  const liveMap = new Map(
    (liveFleetData?.apiStatus || []).map((entry) => [entry.id, entry.status])
  );
  const anyLive = (liveFleetData?.apiStatus || []).some((e) => e.status === 'LIVE');
  const anyCached = (liveFleetData?.apiStatus || []).some((e) => e.status === 'CACHED');

  const headerStatus = anyLive
    ? { label: 'Live NASA telemetry', tone: 'success' as const }
    : anyCached
      ? { label: 'Cached telemetry', tone: 'accent' as const }
      : { label: 'Local ephemeris mode', tone: 'warning' as const };

  const syncLabel = lastSyncMs
    ? new Date(lastSyncMs).toISOString().slice(11, 19) + ' UTC'
    : 'Client Ephemeris';

  const registrySources = [
    {
      name: 'NASA Image & Video Library',
      type: 'REST API',
      url: 'https://images-api.nasa.gov',
      docUrl: 'https://api.nasa.gov/#images-and-video-library',
      statusBadge: resolvedData?.sourceAttribution?.dataset?.includes('images-api')
        ? { label: 'Live archive', tone: 'success' as const }
        : { label: 'CDN / Fallback ready', tone: 'accent' as const },
      dataTypes: ['Archival video manifests', 'Rover & telescope imagery', 'PIA metadata'],
    },
    {
      name: 'NASA Mars Rover Photos & Manifests',
      type: 'REST API',
      url: 'https://api.nasa.gov/mars-photos/api/v1',
      docUrl: 'https://api.nasa.gov/#mars-rover-photos',
      statusBadge: getStatusPresentation(liveMap.get('mars-rover-photos')),
      dataTypes: ['Perseverance & Curiosity Sol counts', 'Downlink photo totals'],
    },
    {
      name: 'Where The ISS At? Live Orbit Feed',
      type: 'REST Telemetry',
      url: 'https://api.wheretheiss.at/v1/satellites/25544',
      docUrl: 'https://wheretheiss.at/w/developer',
      statusBadge: getStatusPresentation(liveMap.get('iss-live')),
      dataTypes: ['Real-time ISS lat/lon', 'Altitude & orbital velocity'],
    },
    {
      name: 'NASA DONKI Space Weather & APOD',
      type: 'REST API',
      url: 'https://api.nasa.gov/DONKI & /planetary/apod',
      docUrl: 'https://api.nasa.gov/#donki',
      statusBadge: getStatusPresentation(
        liveMap.get('nasa-donki') === 'LIVE' || liveMap.get('nasa-apod') === 'LIVE'
          ? 'LIVE'
          : liveMap.get('nasa-donki') || liveMap.get('nasa-apod')
      ),
      dataTypes: ['Solar CME alerts', 'Daily Astronomy Picture'],
    },
  ];

  const ephem = resolvedData?.realTimeTelemetry?.ephemerisMeta;

  return (
    <ModalShell
      id="nasa-data-registry-modal"
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      eyebrow={`Data provenance · Last sync ${syncLabel}`}
      title="NASA open data & ephemeris registry"
      subtitle="Live upstream API health, deterministic Keplerian fallback diagnostics, and official mission citations"
      statusBadge={headerStatus}
    >
      <div className="space-y-5">
        {/* Active Context Resolution */}
        {resolvedData && (
          <div className="p-4 rounded-xl hud-well space-y-3">
            <span className="hud-eyebrow block">Active payload &amp; solver diagnostics</span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <Stat label="Active mission" value={resolvedData.mission.name} />
              <Stat label="Active hardware" value={resolvedData.hardware.name} />
              <Stat label="Retrieved photos" value={`${resolvedData.images.length} NASA assets`} />
              <Stat label="Feed source" value={resolvedData.realTimeTelemetry?.feedSource || resolvedData.sourceAttribution.dataset} />
            </div>

            {ephem && (
              <div className="pt-2.5 border-t border-white/[0.08] flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs font-mono text-slate-300">
                <span className="inline-flex items-center gap-1.5 text-slate-200 font-semibold">
                  <Compass className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                  <span>{ephem.solverModel}</span>
                </span>
                <span>JD {ephem.julianDate.toFixed(4)}</span>
                <span>T = {ephem.j2000Centuries.toFixed(6)} cy</span>
                {ephem.eccentricity !== undefined && <span>e = {ephem.eccentricity}</span>}
                {ephem.inclinationDeg !== undefined && <span>i = {ephem.inclinationDeg}°</span>}
              </div>
            )}
          </div>
        )}

        {/* Registry Sources List */}
        <div className="space-y-3">
          <h3 className="hud-eyebrow">Upstream endpoints &amp; real-time status</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {registrySources.map((src, i) => (
              <div
                key={i}
                className="p-4 rounded-xl hud-well space-y-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Server className="w-4 h-4 text-slate-400 shrink-0" />
                    <h4 className="text-xs sm:text-sm font-semibold text-white truncate">{src.name}</h4>
                  </div>
                  <Badge tone={src.statusBadge.tone}>{src.statusBadge.label}</Badge>
                </div>

                <p className="text-xs font-mono text-slate-400 break-all">
                  Endpoint: <span className="text-slate-200">{src.url}</span>
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {src.dataTypes.map((dt, idx) => (
                    <Badge key={idx} tone="neutral">
                      {dt}
                    </Badge>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex justify-end">
                  <a
                    href={src.docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-mono text-slate-300 hover:text-white underline"
                  >
                    <span>API documentation</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ModalShell>
  );
};

export default NasaDataRegistryModal;
