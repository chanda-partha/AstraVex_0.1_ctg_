import React from 'react';
import { ChevronRight, Calendar, MapPin, Radio, Shield, ArrowRight } from 'lucide-react';
import type { MADestination, MAMissionData } from '../../types/missionAfterlife';
import { soundFx } from '../../utils/soundEffects';

interface MissionSelectionPanelProps {
  destination: MADestination;
  missions: MAMissionData[];
  selectedMissionId: string;
  onSelectMission: (missionId: string) => void;
  onConfirmLaunch: () => void;
  onBackToPlanets: () => void;
}

export const MissionSelectionPanel: React.FC<MissionSelectionPanelProps> = ({
  destination,
  missions,
  selectedMissionId,
  onSelectMission,
  onConfirmLaunch,
  onBackToPlanets,
}) => {
  const activeMission = missions.find((m) => m.id === selectedMissionId) || missions[0];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Still on surface':
        return 'bg-cyan-500/15 border-cyan-400/40 text-cyan-300';
      case 'Mission complete':
        return 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300';
      case 'Lost communication':
        return 'bg-amber-500/15 border-amber-400/40 text-amber-300';
      default:
        return 'bg-slate-500/15 border-slate-400/40 text-slate-300';
    }
  };

  return (
    <div className="w-full max-w-md flex flex-col gap-4 pointer-events-auto">
      {/* ═══ 1. MISSION LIST CARDS ═══ */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
            {destination.toUpperCase()} EXPEDITIONS ARCHIVE
          </span>
          <span className="text-[10px] font-mono text-cyan-400">
            {missions.length} HISTORICAL MISSIONS
          </span>
        </div>

        <div className="space-y-2">
          {missions.map((mission) => {
            const isSelected = mission.id === selectedMissionId;
            return (
              <button
                key={mission.id}
                onClick={() => {
                  soundFx.playClick();
                  onSelectMission(mission.id);
                }}
                className={`w-full crystal-glass p-3.5 rounded-2xl transition-all duration-200 text-left cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? destination === 'Mars'
                      ? 'border-rose-400/60 shadow-[0_0_20px_rgba(244,63,94,0.25)] bg-rose-950/30'
                      : 'border-cyan-400/60 shadow-[0_0_20px_rgba(56,189,248,0.25)] bg-cyan-950/30'
                    : 'hover:border-white/20'
                }`}
              >
                {isSelected && (
                  <div className="card-iridescent-rim absolute top-0 left-0 right-0 h-[1.5px] pointer-events-none" />
                )}

                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-display text-sm group-hover:text-cyan-200 transition-colors">
                        {mission.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        ({mission.agency})
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {mission.landingDate || mission.launchDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {mission.locationName}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full border whitespace-nowrap ${getStatusBadge(
                      mission.hardwareStatus
                    )}`}
                  >
                    {mission.hardwareStatus}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ 2. SELECTED MISSION BRIEFING DOSSIER ═══ */}
      {activeMission && (
        <div className="crystal-glass p-4 rounded-2xl space-y-3 relative overflow-hidden animate-fade-in border-white/10">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
            <div>
              <span className="text-[9px] font-mono uppercase tracking-wider text-cyan-400">
                ACTIVE TARGET SPECIFICATION
              </span>
              <h4 className="text-sm font-bold text-white font-display">
                {activeMission.spacecraftName}
              </h4>
            </div>
            {activeMission.coordinates && (
              <div className="text-[10px] font-mono text-slate-400 text-right">
                <div>
                  {Math.abs(activeMission.coordinates.lat).toFixed(2)}°
                  {activeMission.coordinates.lat >= 0 ? 'N' : 'S'},{' '}
                  {activeMission.coordinates.lon.toFixed(2)}°E
                </div>
                <div className="text-[8px] text-slate-500">VERIFIED COORDINATES</div>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            {activeMission.missionPurpose}
          </p>

          <div className="p-2.5 rounded-xl bg-white/[0.025] border border-white/[0.06] text-[11px] font-mono text-slate-300 leading-snug">
            <span className="text-amber-400 font-semibold">STATUS: </span>
            {activeMission.hardwareStatusDetail}
          </div>

          {activeMission.modelDisclaimer && (
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono text-amber-200/90 leading-tight">
              ⚠️ {activeMission.modelDisclaimer}
            </div>
          )}

          {/* Action Launch Button */}
          <div className="pt-1 flex items-center gap-2">
            <button
              onClick={() => {
                soundFx.playSuccess();
                onConfirmLaunch();
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all ${
                destination === 'Mars'
                  ? 'premium-btn-mars shadow-glow-mars'
                  : 'premium-btn-primary shadow-glow-cyan'
              }`}
            >
              <span>TRAVEL TO SPACECRAFT</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

