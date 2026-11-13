export type ScreenType = 
  | 'home' 
  | 'destination' 
  | 'launch' 
  | 'landing' 
  | 'exploration' 
  | 'registry';

export type DestinationType = 'Mars' | 'Moon' | 'DeepSpace';

export type TelemetryStatusCategory = 'ACTIVE' | 'PRELAUNCH' | 'HISTORIC';

export type LaunchVehicleId =
  | 'saturn-v'
  | 'sls-block1'
  | 'lvm3-m4'
  | 'long-march-3b'
  | 'atlas-v-541'
  | 'atlas-v-401'
  | 'titan-iiie'
  | 'ariane-5'
  | 'space-shuttle'
  | 'falcon9-soyuz';

export type Stage4Kind = 'surface-edl' | 'orbit-capture' | 'deep-commissioning';

export interface MissionFlightProfile {
  missionId: string;
  theater: DestinationType;
  launchVehicleId: LaunchVehicleId;
  launchVehicleName: string;
  launchSite: string;
  launchInclinationDeg: number;
  maxQSeconds: number;
  launchArchivalVideo: string | null;
  launchArchivalLabel?: string;
  curatedLaunchVideo?: string;
  curatedLaunchVideoLabel?: string;
  stage4Kind: Stage4Kind;
  stage4ArchivalVideo: string | null;
  stage4ArchivalLabel?: string;
  curatedArrivalVideo?: string;
  curatedArrivalVideoLabel?: string;
  isCrewedSurface: boolean;
  nasaVideoQuery: string;
}

export interface EphemerisMetadata {
  julianDate: number;
  j2000Centuries: number;
  solverModel: string;
  eccentricity?: number;
  inclinationDeg?: number;
  semiMajorAxisKm?: number;
}

export interface LiveTelemetryUpdate {
  id: string;
  category: 'TELEMETRY' | 'MANIFEST' | 'SPACE_WEATHER' | 'IMAGING' | 'ORBIT';
  title: string;
  detail: string;
  timestamp: string;
  badge?: string;
}

export interface RealTimeTelemetry {
  missionId: string;
  statusCategory: TelemetryStatusCategory;
  statusLabel: string;
  isActive: boolean;
  missionElapsedText: string;
  marsSol?: number;
  earthDistanceKm: number;
  earthDistanceLabel: string;
  signalDelaySeconds: number;
  signalDelayLabel: string;
  roundTripDelayLabel: string;
  orbitalAltitudeKm?: number;
  orbitalVelocityKmh?: number;
  liveCoords?: {
    lat: number;
    lon: number;
    visibility?: string;
  };
  roverManifest?: {
    status: string;
    maxSol: number;
    maxDate: string;
    totalPhotos: number;
    cameras: string[];
  };
  updates: LiveTelemetryUpdate[];
  feedSource: string;
  isLiveApi: boolean;
  lastSyncedIso: string;
  ephemerisMeta?: EphemerisMetadata;
}

export interface LiveFleetMissionEntry {
  id: string;
  name: string;
  destination: string;
  agency: string;
  locationName: string;
  status: string;
  statusCategory: TelemetryStatusCategory;
  statusLabel: string;
  officialUrl: string;
  realTimeTelemetry: RealTimeTelemetry;
}

export interface LiveFleetSummaryPayload {
  timestamp: string;
  activeCount: number;
  totalMissions: number;
  issLive?: {
    latitude: number;
    longitude: number;
    altitudeKm: number;
    velocityKmh: number;
    visibility: string;
    source: string;
  };
  apod?: {
    title: string;
    date: string;
    explanation: string;
    url: string;
    mediaType: string;
  };
  spaceWeather: {
    id: string;
    messageType: string;
    issueTime: string;
    summary: string;
    url?: string;
  }[];
  apiStatus: {
    id: string;
    name: string;
    status: 'LIVE' | 'CACHED' | 'COMPUTED';
    url: string;
  }[];
  missions: LiveFleetMissionEntry[];
}

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
  destination: DestinationType | string;
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
  destination: DestinationType | string;
  mission: MissionData;
  hardware: HardwareItem;
  allHardware: HardwareItem[];
  images: NasaImage[];
  sourceAttribution: SourceAttribution;
  realTimeTelemetry?: RealTimeTelemetry;
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

export type QuizTopic = 'Engineering' | 'Planetary Science' | 'Flight History' | 'Orbital Physics' | 'Astrophysics';
export type QuizDifficulty = 'Cadet' | 'Specialist' | 'Flight Director';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  healthReward: number;
  healthPenalty: number;
  topic?: QuizTopic;
  difficulty?: QuizDifficulty;
}

export interface AIQuizPayload {
  quizTitle: string;
  destination: string;
  missionId?: string;
  specialtyBadge?: string;
  roundSeed?: number;
  questions: QuizQuestion[];
}

export interface UserState {
  health: number;
  score: number;
  completedQuizzes: string[];
  unlockedMissions: string[];
  discoveredHardware: string[];
}
