import React, { useState } from 'react';
import { ResolvedNasaPayload } from '../../types';
import { X, ExternalLink, Cpu, Layers, Image as ImageIcon, Database, ChevronLeft, ChevronRight } from 'lucide-react';
import { NasaImageDisplay } from '../common/NasaImageDisplay';
import { HardwareInspectSkeleton } from '../skeleton/HardwareInspectSkeleton';

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

  if (!isOpen) return null;

  if (isLoading && !resolvedData) {
    return <HardwareInspectSkeleton onClose={onClose} />;
  }

  if (!resolvedData) return null;

  const { mission, hardware, images, sourceAttribution } = resolvedData;
  const currentImg = images[activeImageIdx] || images[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xl overflow-y-auto animate-fade-in select-none">
      <div className="relative w-full max-w-4xl crystal-glass p-6 md:p-8 rounded-3xl my-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative overflow-hidden group">

        {/* Iridescent Top Rim */}
        <div className="card-iridescent-rim absolute top-0 left-0 right-0 h-[2px] pointer-events-none" />

        {/* Header Bar */}
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold">
                NASA Scientific Payload
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {hardware.status}
              </span>
              {isLoading && (
                <span className="text-[10px] font-mono text-cyan-300 animate-pulse">
                  Updating Telemetry...
                </span>
              )}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {hardware.name}
            </h2>
            <p className="text-xs text-slate-400">
              Deployed on <strong className="text-slate-200">{mission.name}</strong> ({mission.agency}) • Location: {mission.locationName}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close Hardware Inspection"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grid Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Left Column: Purpose & Specs */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider">
                <Cpu className="w-4 h-4" />
                <span>Primary Scientific Purpose</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed font-normal">
                {hardware.purpose}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <Layers className="w-4 h-4" />
                <span>Scientific Function &amp; Capabilities</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed font-normal">
                {hardware.scientificFunction}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block">
                Onboard Instruments
              </span>
              <div className="flex flex-wrap gap-1.5">
                {hardware.instruments.map((inst, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-white/[0.05] text-slate-300 text-xs border border-white/[0.08]">
                    {inst}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
              <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider block">
                NASA Confirmed Status
              </span>
              <p className="text-slate-300 text-xs">
                {mission.nasaConfirmedStatus}
              </p>
            </div>
          </div>

          {/* Right Column: Real NASA Photography */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold uppercase tracking-wider">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                <span>NASA Scientific Photography</span>
              </div>
              {images.length > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                    className="p-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 cursor-pointer"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono text-slate-400 px-1">
                    {activeImageIdx + 1}/{images.length}
                  </span>
                  <button
                    onClick={() => setActiveImageIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                    className="p-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 cursor-pointer"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {currentImg ? (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#07090e] group aspect-video">
                  <NasaImageDisplay
                    src={currentImg.imageUrl}
                    alt={currentImg.title}
                    title={currentImg.title}
                    nasaId={currentImg.nasaId}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none">
                    <p className="text-xs font-bold text-white line-clamp-1">{currentImg.title}</p>
                    <span className="text-[10px] font-mono text-blue-300">NASA ID: {currentImg.nasaId || 'PIA-NASA'}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed italic line-clamp-2">
                  &ldquo;{currentImg.description}&rdquo;
                </p>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 font-mono text-xs border border-dashed border-white/10 rounded-2xl">
                NASA Imagery Loading...
              </div>
            )}
          </div>

        </div>

        {/* NASA DATA SOURCE PANEL */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
              <Database className="w-4 h-4" />
              <span>NASA Open Data Source &amp; Verification</span>
            </div>
            <a
              href={sourceAttribution.officialMissionPage || 'https://science.nasa.gov'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 underline"
            >
              <span>View Official NASA Mission Source</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] text-slate-400 border-t border-white/[0.06] pt-2">
            <div>
              <span className="block text-slate-500">Agency:</span>
              <span className="text-slate-200 font-medium">{sourceAttribution.agency}</span>
            </div>
            <div>
              <span className="block text-slate-500">Dataset API:</span>
              <span className="text-slate-200 font-medium truncate block">{sourceAttribution.dataset}</span>
            </div>
            <div>
              <span className="block text-slate-500">Retrieved:</span>
              <span className="text-slate-200 font-medium">{new Date(sourceAttribution.retrievedAt).toLocaleTimeString()}</span>
            </div>
            <div>
              <span className="block text-slate-500">Rights:</span>
              <span className="text-emerald-400 font-medium">Public Domain</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HardwareInspectModal;
