import React from 'react';
import { ResolvedNasaPayload } from '../../types';
import { X, ExternalLink, Server } from 'lucide-react';
import { DataRegistrySkeleton } from '../skeleton/DataRegistrySkeleton';

interface NasaDataRegistryModalProps {
  isOpen: boolean;
  onClose: () => void;
  resolvedData: ResolvedNasaPayload | null;
  isLoading?: boolean;
}

export const NasaDataRegistryModal: React.FC<NasaDataRegistryModalProps> = ({
  isOpen,
  onClose,
  resolvedData,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  if (isLoading && !resolvedData) {
    return <DataRegistrySkeleton onClose={onClose} />;
  }

  const registrySources = [
    {
      name: "NASA Image and Video Library",
      type: "REST API",
      url: "https://images-api.nasa.gov",
      docUrl: "https://api.nasa.gov/#images-and-video-library",
      status: "Verified Active",
      dataTypes: ["Mars Rover Photography", "Lunar Landing Archive", "High-Res Metadata"],
      requiresKey: false
    },
    {
      name: "NASA Mars Rover Photos API",
      type: "REST API",
      url: "https://api.nasa.gov/mars-photos/api/v1",
      docUrl: "https://api.nasa.gov/#mars-rover-photos",
      status: "Verified Active",
      dataTypes: ["Sol Camera Imagery", "Perseverance/Curiosity Sol Records"],
      requiresKey: true
    },
    {
      name: "NASA Open Data Portal",
      type: "Open Data Portal",
      url: "https://data.nasa.gov",
      docUrl: "https://data.nasa.gov/developer",
      status: "Verified Active",
      dataTypes: ["Hardware Specifications", "Scientific Instrument Catalogs"],
      requiresKey: false
    },
    {
      name: "NASA Astronomy Picture of the Day (APOD)",
      type: "REST API",
      url: "https://api.nasa.gov/planetary/apod",
      docUrl: "https://api.nasa.gov/#apod",
      status: "Verified Active",
      dataTypes: ["Space Astronomy Imagery", "NASA Editorial Descriptions"],
      requiresKey: true
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-fade-in select-none">
      <div className="relative w-full max-w-4xl nasa-card-elevated p-6 md:p-8 rounded-3xl my-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10 bg-[#070b18]/95">
        
        {/* Header Bar */}
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold">
                NASA Open Data Integration
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Live NASA Endpoints
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              API Data Sources &amp; Verification
            </h2>
            <p className="text-xs text-slate-400">
              Official NASA datasets queried and normalized for this scientific exploration tool.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close Registry"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ACTIVE RESOLVED CONTEXT STATS */}
        {resolvedData && (
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
            <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider block">
              Active Context &amp; Payload Resolution
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-slate-400 text-[10px] block">Active Mission</span>
                <span className="text-white font-medium">{resolvedData.mission.name}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-slate-400 text-[10px] block">Active Hardware</span>
                <span className="text-white font-medium">{resolvedData.hardware.name}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-slate-400 text-[10px] block">Retrieved Images</span>
                <span className="text-emerald-400 font-medium">{resolvedData.images.length} NASA Photos</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-slate-400 text-[10px] block">Dataset Resolver</span>
                <span className="text-blue-300 font-medium truncate block">{resolvedData.sourceAttribution.dataset}</span>
              </div>
            </div>
          </div>
        )}

        {/* REGISTRY SOURCES LIST */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Registered NASA API Endpoints
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {registrySources.map((src, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2.5 hover:border-blue-500/30 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-blue-400" />
                    <h4 className="text-xs font-bold text-white">{src.name}</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                    {src.status}
                  </span>
                </div>

                <p className="text-[11px] font-mono text-slate-400 break-all">
                  Endpoint: <span className="text-blue-300">{src.url}</span>
                </p>

                <div className="flex flex-wrap gap-1">
                  {src.dataTypes.map((dt, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-white/[0.05] text-slate-300 text-[10px]">
                      • {dt}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-white/[0.06] flex justify-end">
                  <a
                    href={src.docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 underline"
                  >
                    <span>API Documentation</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default NasaDataRegistryModal;
