import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ExternalLink,
  Image as ImageIcon,
  Clock,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type {
  MAMissionData,
  MAChapterContent,
} from "../../types/missionAfterlife";
import { soundFx } from "../../utils/soundEffects";

interface MissionInformationCardProps {
  mission: MAMissionData;
  chapter: MAChapterContent;
  chapterIndex: number;
  replayToken?: number;
}

export const MissionInformationCard: React.FC<MissionInformationCardProps> = ({
  mission,
  chapter,
  chapterIndex,
  replayToken = 0,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isTimelineExpanded, setIsTimelineExpanded] = useState<boolean>(true);
  // Progressive paragraph reveal
  const [visibleParagraphCount, setVisibleParagraphCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    setVisibleParagraphCount(0);

    const revealParagraph = (index: number) => {
      if (cancelled || index >= chapter.paragraphs.length) return;

      setVisibleParagraphCount(index + 1);

      // Give the reader enough time to read each paragraph.
      const readingTime = Math.min(
        8000,
        Math.max(3500, chapter.paragraphs[index].length * 35),
      );

      timer = window.setTimeout(() => {
        revealParagraph(index + 1);
      }, readingTime);
    };

    timer = window.setTimeout(() => {
      revealParagraph(0);
    }, 500);

    return () => {
      cancelled = true;

      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
    };
  }, [chapter, replayToken]);

  return (
    <div className="w-full max-w-lg crystal-glass p-5 sm:p-6 rounded-3xl space-y-4 max-h-[75vh] sm:max-h-[82vh] overflow-y-auto pointer-events-auto border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative group">
      {/* Top Iridescent Rim */}
      <div className="card-iridescent-rim absolute top-0 left-0 right-0 h-[1.5px] pointer-events-none" />

      {/* ═══ 1. CHAPTER HEADER ═══ */}
      <div className="space-y-1 border-b border-white/[0.08] pb-3">
        <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-cyan-400 uppercase">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>
              CHAPTER 0{chapterIndex + 1} • {mission.name.toUpperCase()}
            </span>
          </div>
          <span className="text-slate-400">{mission.destination}</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-white font-orbitron tracking-wide">
          {chapter.heading}
        </h2>

        <div className="text-xs font-mono text-slate-300">
          {chapter.title} —{" "}
          <span className="text-slate-400">{mission.spacecraftName}</span>
        </div>
      </div>

      {/* ═══ 2. PROGRESSIVE PARAGRAPHS ═══ */}
      <div className="space-y-3 text-xs sm:text-sm text-slate-200 font-sans leading-relaxed content-selectable">
        {chapter.paragraphs.slice(0, visibleParagraphCount).map((p, idx) => (
          <motion.p
            key={`p-${idx}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
            }}
            className="text-slate-300"
          >
            {p}
          </motion.p>
        ))}
      </div>

      {/* ═══ 3. HISTORICAL TIMELINE (if present in this chapter) ═══ */}
      {chapter.timeline && chapter.timeline.length > 0 && (
        <div className="pt-2 border-t border-white/[0.06] space-y-2">
          <button
            onClick={() => {
              soundFx.playClick();
              setIsTimelineExpanded(!isTimelineExpanded);
            }}
            className="w-full flex items-center justify-between text-xs font-mono text-cyan-300 hover:text-white transition-colors cursor-pointer py-1"
          >
            <div className="flex items-center gap-1.5 font-bold">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>MISSION TIMELINE LOG</span>
            </div>
            {isTimelineExpanded ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {isTimelineExpanded && (
            <div className="space-y-2 pl-2 border-l border-cyan-400/30 text-xs font-mono animate-fade-in">
              {chapter.timeline.map((evt, idx) => (
                <div key={idx} className="relative pl-3 space-y-0.5">
                  <div className="absolute -left-[13px] top-1.5 w-2 h-2 rounded-full bg-cyan-400 border border-slate-900" />
                  <div className="text-[10px] text-cyan-300 font-semibold">
                    {evt.date}
                  </div>
                  <div className="text-slate-300 leading-snug">{evt.event}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ 4. NASA PHOTOGRAPHS GALLERY ═══ */}
      {mission.images && mission.images.length > 0 && (
        <div className="pt-2 border-t border-white/[0.06] space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>NASA ARCHIVAL PHOTOGRAPHS</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {mission.images.map((img, idx) => (
              <div
                key={idx}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedImage(selectedImage === img.url ? null : img.url);
                }}
                className="group/img relative rounded-xl overflow-hidden border border-white/10 hover:border-cyan-400/50 cursor-pointer bg-black/40 aspect-video transition-all"
              >
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                  <span className="text-[9px] font-mono text-slate-200 truncate">
                    {img.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ 5. EXPANDED IMAGE MODAL / POPUP ═══ */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md cursor-pointer animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-2xl max-h-[85vh] bg-[#070b18] p-3 rounded-2xl border border-white/20 shadow-2xl space-y-2"
          >
            <img
              src={selectedImage}
              alt="NASA Archive Detail"
              className="max-h-[65vh] w-auto mx-auto rounded-lg object-contain"
            />
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
              <span>NASA ARCHIVE HIGH-RESOLUTION RECORD</span>
              <button
                onClick={() => setSelectedImage(null)}
                className="px-3 py-1 rounded-lg bg-white/10 text-white hover:bg-white/20 cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ 6. VERIFIED SOURCE FOOTER ═══ */}
      <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-slate-500">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>NASA VERIFIED HISTORICAL RECORD</span>
        </div>

        {mission.verifiedSources && mission.verifiedSources.length > 0 && (
          <a
            href={mission.verifiedSources[0].url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-200 flex items-center gap-1"
          >
            <span>SOURCE ARCHIVE</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
};

export default MissionInformationCard;
