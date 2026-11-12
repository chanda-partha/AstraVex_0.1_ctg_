/**
 * MISSION AFTERLIFE — TypeScript Type Definitions
 * All interfaces for the Mission Afterlife section.
 * These are independent of existing application types.
 */

import type { AIQuizPayload } from './index';

// Re-export for convenience within MA files
export type { AIQuizPayload };

// ─────────────────────────────────────────────────────────────────
// Core Mission Afterlife Stage State Machine
// ─────────────────────────────────────────────────────────────────

export type MAStage =
  | 'intro'              // Cinematic introduction
  | 'planetSelect'       // 3D planet selection (Moon / Mars)
  | 'missionSelect'      // Mission selection panel
  | 'transition'         // Cinematic camera transition to surface
  | 'documentary'        // 4-chapter educational documentary
  | 'completion';        // Mission archived / completion screen

export type MADestination = 'Moon' | 'Mars';

export type MAChapterId = 'identity' | 'purpose' | 'finalChapter' | 'legacy';

// ─────────────────────────────────────────────────────────────────
// Documentary Content
// ─────────────────────────────────────────────────────────────────

export interface MAChapterContent {
  id: MAChapterId;
  heading: string;         // The chapter question heading, e.g. "WHO AM I?"
  title: string;           // Display title
  paragraphs: string[];    // Progressive reveal paragraphs
  timeline?: MATimelineEvent[];
  cameraHint?: 'orbit' | 'closeup' | 'wide' | 'side';  // Suggested camera behavior
}

export interface MATimelineEvent {
  date: string;
  event: string;
  significance?: 'critical' | 'major' | 'minor';
}

export interface MAMissionImage {
  nasaId: string;         // NASA image library ID or descriptive ID
  title: string;
  description: string;
  url: string;            // Direct image URL (NASA public domain)
  credit: string;         // Image attribution
}

export interface MAVerifiedSource {
  name: string;
  url: string;
  accessed?: string;
}

// ─────────────────────────────────────────────────────────────────
// Hardware Status — factually accurate per mission
// ─────────────────────────────────────────────────────────────────

export type MAHardwareStatus =
  | 'Still on surface'       // Physically present, non-operational
  | 'Mission complete'       // Completed mission objectives, now inactive
  | 'Lost communication'     // Last contact known, presumed inoperative
  | 'Operational'            // Currently active
  | 'Deliberately terminated' // e.g. LADEE impacted Moon intentionally
  | 'Unknown location';

// ─────────────────────────────────────────────────────────────────
// Core Mission Data Object
// ─────────────────────────────────────────────────────────────────

export interface MAMissionData {
  id: string;
  name: string;              // Full mission name, e.g. "Apollo 11"
  destination: MADestination;
  agency: string;
  launchDate: string;        // ISO 8601 date string
  landingDate?: string;      // Landing / touchdown date
  missionEndDate?: string;   // Last communication / mission end

  locationName: string;      // Named landing site, e.g. "Tranquility Base"
  coordinates?: {
    lat: number;             // Verified geographic latitude
    lon: number;             // Verified geographic longitude
    source: string;          // Data source citation
  };

  spacecraftName: string;    // Primary hardware name, e.g. "Eagle Descent Stage"
  hardwareModelPath?: string; // GLB path under /models/ — undefined if no suitable model
  modelDisclaimer?: string;  // If model is illustrative, describe what it actually is

  missionPurpose: string;    // Short summary of mission objectives
  hardwareStatus: MAHardwareStatus;
  hardwareStatusDetail: string; // Sentence explaining current status

  // Legacy text for the final card
  finalMessage: string;

  // Four documentary chapters
  chapters: {
    identity: MAChapterContent;
    purpose: MAChapterContent;
    finalChapter: MAChapterContent;
    legacy: MAChapterContent;
  };

  // NASA photographs
  images: MAMissionImage[];

  // Verified factual sources
  verifiedSources: MAVerifiedSource[];
}

// ─────────────────────────────────────────────────────────────────
// Application State
// ─────────────────────────────────────────────────────────────────

export interface MAState {
  stage: MAStage;
  selectedDestination: MADestination | null;
  selectedMissionId: string | null;
  currentChapter: MAChapterId;
  chapterIndex: number;        // 0-3
  isAutoPlay: boolean;
  isQuizOpen: boolean;
}

// ─────────────────────────────────────────────────────────────────
// Quiz Context — passed to quiz service
// ─────────────────────────────────────────────────────────────────

export interface MAQuizContext {
  missionId: string;
  missionName: string;
  destination: MADestination;
  spacecraftName: string;
  chapterSummaries: {
    identity: string;
    purpose: string;
    finalChapter: string;
    legacy: string;
  };
}

