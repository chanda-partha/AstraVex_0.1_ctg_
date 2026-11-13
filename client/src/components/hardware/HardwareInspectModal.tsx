import React, { useEffect, useState } from 'react';
import { ResolvedNasaPayload } from '../../types';
import { ExternalLink, Cpu, Layers, Image as ImageIcon, Database, ChevronLeft, ChevronRight } from 'lucide-react';
import { NasaImageDisplay } from '../common/NasaImageDisplay';
import { HardwareInspectSkeleton } from '../skeleton/HardwareInspectSkeleton';
import { ModalShell, Badge, Stat, IconButton } from '../ui';
import { useTourSpotlight } from '../../guide/tourEngine';

interface HardwareInspectModalProps {
  isOpen: boolean;
  onClose: () => void;
  resolvedData: ResolvedNasaPayload | null;
  isLoading?: boolean;
}

export const HardwareInspectModal: React.FC<HardwareInspectModalProps> = ({
  isOpen,
  onClose,
  resolvedData,
  isLoading = false,
}) => {
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const modalSpotlight = useTourSpotlight('modal-hardware');

  useEffect(() => {
    setActiveImageIdx(0);
  }, [resolvedData?.mission?.id, resolvedData?.hardware?.id, isOpen]);

  if (!isOpen) return null;

  if (isLoading && !resolvedData) {
    return <HardwareInspectSkeleton onClose={onClose} />;
  }

  if (!resolvedData) return null;

  const { mission, hardware, images, sourceAttribution } = resolvedData;
  const safeImgIdx = images.length > 0 ? Math.min(activeImageIdx, images.length - 1) : 0;
  const currentImg = images[safeImgIdx] || images[0];

  return (
    <ModalShell
      id="hardware-inspect-modal"
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      eyebrow="Hardware specifications"
      title={hardware.name}
      subtitle={`Deployed on ${mission.name} (${mission.agency}) · ${mission.locationName}`}
      statusBadge={{ label: hardware.status, tone: 'success' }}
    >
      <div className={`space-y-5 rounded-2xl p-2 -m-2 ${modalSpotlight.className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left Column: Purpose & Specs */}
          <div className="space-y-3">
            <div className="p-4 rounded-xl hud-well space-y-1.5">
              <div className="flex items-center gap-2 text-slate-200 text-xs font-semibold uppercase tracking-wider font-mono">
                <Cpu className="w-4 h-4 text-slate-400" />
                <span>Primary scientific purpose</span>
              </div>
              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
                {hardware.purpose}
              </p>
            </div>

            <div className="p-4 rounded-xl hud-well space-y-1.5">
              <div className="flex items-center gap-2 text-slate-200 text-xs font-semibold uppercase tracking-wider font-mono">
                <Layers className="w-4 h-4 text-slate-400" />
                <span>Scientific function &amp; capabilities</span>
              </div>
              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
                {hardware.scientificFunction}
              </p>
            </div>

            <div className="p-4 rounded-xl hud-well space-y-2.5">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider block font-mono">
                Onboard instruments
              </span>
              <div className="flex flex-wrap gap-1.5">
                {hardware.instruments.map((inst, idx) => (
                  <Badge key={idx} tone="neutral">
                    {inst}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl hud-well space-y-1">
              <span className="hud-eyebrow block">NASA confirmed status</span>
              <p className="text-slate-200 text-xs sm:text-sm">
                {mission.nasaConfirmedStatus}
              </p>
            </div>
          </div>

          {/* Right Column: Real NASA Photography */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-200 font-semibold uppercase tracking-wider font-mono">
                <ImageIcon className="w-4 h-4 text-slate-400" />
                <span>NASA scientific photography</span>
              </div>
              {images.length > 1 && (
                <div className="flex items-center gap-1.5">
                  <IconButton
                    size="sm"
                    label="Previous image"
                    onClick={() =>
                      setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1))
                    }
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </IconButton>
                  <span className="text-xs font-mono text-slate-300 px-1">
                    {safeImgIdx + 1}/{images.length}
                  </span>
                  <IconButton
                    size="sm"
                    label="Next image"
                    onClick={() =>
                      setActiveImageIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0))
                    }
                  >
                    <ChevronRight className="w-4 h-4" />
                  </IconButton>
                </div>
              )}
            </div>

            {currentImg ? (
              <div className="space-y-2.5">
                <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 group aspect-video">
                  <NasaImageDisplay
                    src={currentImg.imageUrl}
                    alt={currentImg.title}
                    title={currentImg.title}
                    nasaId={currentImg.nasaId}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none">
                    <p className="text-xs font-semibold text-white line-clamp-1">
                      {currentImg.title}
                    </p>
                    <span className="text-xs font-mono text-slate-300">
                      NASA ID: {currentImg.nasaId || 'PIA-NASA'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  &ldquo;{currentImg.description}&rdquo;
                </p>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 font-mono text-xs border border-dashed border-slate-800 rounded-xl">
                NASA imagery loading...
              </div>
            )}
          </div>
        </div>

        {/* NASA DATA SOURCE PANEL */}
        <div className="p-4 rounded-xl hud-well space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 font-mono uppercase tracking-wider">
              <Database className="w-4 h-4 text-slate-400" />
              <span>NASA open data source &amp; verification</span>
            </div>
            <a
              href={sourceAttribution.officialMissionPage || 'https://science.nasa.gov'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-mono text-slate-300 hover:text-white underline"
            >
              <span>Official NASA mission source</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Stat label="Agency" value={sourceAttribution.agency} />
            <Stat label="Dataset API" value={sourceAttribution.dataset} />
            <Stat
              label="Retrieved"
              value={new Date(sourceAttribution.retrievedAt).toLocaleTimeString()}
            />
            <Stat label="Rights" value="Public Domain" />
          </div>
        </div>
      </div>
    </ModalShell>
  );
};

export default HardwareInspectModal;
