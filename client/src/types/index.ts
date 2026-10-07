export type ScreenType = 
  | 'home' 
  | 'destination' 
  | 'launch' 
  | 'landing' 
  | 'exploration' 
  | 'registry';

export type DestinationType = 'Mars' | 'Moon';

export interface SubAssemblyItem {
  id: string;
  name: string;
  offset: [number, number, number];
  description: string;
  spec?: string;
}

export interface HardwareItem {
  id: string;
  name: string;
  type: string;
  purpose: string;
  scientificFunction: string;
  status: 'Operational' | 'Partially operational' | 'Inactive' | 'Mission complete' | 'Lost communication' | 'Retired' | 'Still traveling';
  instruments: string[];
  model3dType: string;
  subAssemblies?: SubAssemblyItem[];
  hotspots?: {
    id: string;
    label: string;
    code: string;
    position: [number, number, number];
    cameraOffset: [number, number, number];
    cameraLookAt: [number, number, number];
    description: string;
  }[];
}

export interface TraverseWaypoint {
  lat: number;
  lon: number;
  label: string;
  evaNumber?: number;
  sampleId?: string;
  description?: string;
}

export interface MissionMilestone {
  id: string;
  relTime?: number;
  title: string;
  tag: string;
  speed?: string;
  altitude?: string;
  desc: string;
}

export interface MissionData {
  id: string;
  name: string;
  destination: DestinationType;
  locationName: string;
  coordinates: { lat: number; lon: number };
  launchDate: string;
  landingDate: string;
  status: string;
  nasaConfirmedStatus: string;
  purpose: string;
  scientificContribution: string;
  agency: string;
  officialUrl: string;
  hardware: HardwareItem[];
  traverseRoute?: TraverseWaypoint[];
  milestones?: MissionMilestone[];
  specs?: {
    heightMeters?: number;
    massKg?: number;
    crew?: number;
    powerSource?: string;
    propellant?: string;
  };
}

export interface NasaImage {
  title: string;
  description: string;
  nasaId: string;
  date: string;
  imageUrl: string;
  source: string;
  sourceUrl: string;
}

export interface SourceAttribution {
  agency: string;
  dataset: string;
  retrievedAt: string;
  license: string;
  officialMissionPage: string;
  verifiedSources: { name: string; url: string }[];
}

export interface ResolvedNasaPayload {
  timestamp: string;
  destination: DestinationType;
  mission: MissionData;
  hardware: HardwareItem;
  allHardware: HardwareItem[];
  images: NasaImage[];
  sourceAttribution: SourceAttribution;
}

export interface StoryParagraph {
  heading: string;
  content: string;
}

export interface AIStoryPayload {
  title: string;
  subtitle: string;
  targetAgeGroup: string;
  paragraphs: StoryParagraph[];
  funFacts: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  healthReward: number;
  healthPenalty: number;
}

export interface AIQuizPayload {
  quizTitle: string;
  destination: string;
  questions: QuizQuestion[];
}

export interface UserState {
  health: number;
  score: number;
  completedQuizzes: string[];
  unlockedMissions: string[];
  discoveredHardware: string[];
}
