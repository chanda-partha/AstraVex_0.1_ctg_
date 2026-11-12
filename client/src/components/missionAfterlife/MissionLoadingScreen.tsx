import React from 'react';
import { Sparkles } from 'lucide-react';

interface MissionLoadingScreenProps {
  label?: string;
  sublabel?: string;
}

export const MissionLoadingScreen: React.FC<MissionLoadingScreenProps> = ({
  label = 'ACQUIRING SPACECRAFT TELEMETRY...',
  sublabel = 'Loading verified NASA 3D hardware & planetary surface coordinates',
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03050c]/90 backdrop-blur-2xl select-none">
      <div className="relative w-full max-w-sm crystal-glass p-6 rounded-3xl text-center space-y-4 shadow-2xl border-white/10">
        <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/50 animate-spin-slow" />
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center shadow-glow-cyan">
            <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
          </div>
        </div>

        <div className="space-y-1">
          <h4 className="text-xs font-mono font-bold tracking-widest text-cyan-300 uppercase">
            {label}
          </h4>
          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
            {sublabel}
          </p>
        </div>

        <div className="w-32 mx-auto bg-white/[0.08] h-1 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full w-2/3 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default MissionLoadingScreen;

