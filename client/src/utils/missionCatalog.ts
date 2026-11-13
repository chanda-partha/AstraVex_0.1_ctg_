import { DestinationType, MissionFlightProfile } from '../types';

export interface TheaterMissionSummary {
  id: string;
  label: string;
  site: string;
  theater: DestinationType;
  defaultHardwareId: string;
}

export const DEFAULT_MISSION_BY_THEATER: Record<DestinationType, string> = {
  Mars: 'perseverance',
  Moon: 'apollo11',
  DeepSpace: 'jwst',
};

export const HARDWARE_BY_MISSION: Record<string, string> = {
  // Mars theater
  perseverance: 'supercam',
  curiosity: 'curiosity-chassis',
  insight: 'insight-seis',
  viking: 'viking-chassis',
  mro: 'hirise',

  // Lunar theater
  artemis3: 'starship-hls',
  apollo11: 'eagle-descent-stage',
  apollo15: 'apollo15-lrv',
  chandrayaan3: 'vikram-lander',
  ladee: 'ladee-ldex',
  apollo17: 'orange-soil-sampler',
  change4: 'yutu2-rover',
  surveyor3: 'surveyor3-sampler',
  lro: 'lroc-camera',

  // Deep Space & Orbital theater
  jwst: 'jwst-primary-mirror',
  hubble: 'hubble-primary-mirror',
  iss: 'iss-solar',
  voyager: 'voyager-dish',
};

export const THEATER_MISSIONS: Record<DestinationType, TheaterMissionSummary[]> = {
  Mars: [
    {
      id: 'perseverance',
      label: 'Perseverance & Ingenuity',
      site: 'Jezero Crater Delta',
      theater: 'Mars',
      defaultHardwareId: 'supercam',
    },
    {
      id: 'curiosity',
      label: 'Curiosity Rover (MSL)',
      site: 'Gale Crater Mount Sharp',
      theater: 'Mars',
      defaultHardwareId: 'curiosity-chassis',
    },
    {
      id: 'insight',
      label: 'InSight Mars Lander',
      site: 'Elysium Planitia',
      theater: 'Mars',
      defaultHardwareId: 'insight-seis',
    },
    {
      id: 'viking',
      label: 'Viking 1 Lander',
      site: 'Chryse Planitia',
      theater: 'Mars',
      defaultHardwareId: 'viking-chassis',
    },
    {
      id: 'mro',
      label: 'Mars Reconnaissance Orbiter',
      site: 'Martian Polar Orbit',
      theater: 'Mars',
      defaultHardwareId: 'hirise',
    },
  ],
  Moon: [
    {
      id: 'artemis3',
      label: 'Artemis III Starship HLS',
      site: 'Shackleton Crater',
      theater: 'Moon',
      defaultHardwareId: 'starship-hls',
    },
    {
      id: 'apollo11',
      label: 'Apollo 11 Lunar Module',
      site: 'Tranquility Base',
      theater: 'Moon',
      defaultHardwareId: 'eagle-descent-stage',
    },
    {
      id: 'apollo15',
      label: 'Apollo 15 Lunar Rover',
      site: 'Hadley-Apennine Canyon',
      theater: 'Moon',
      defaultHardwareId: 'apollo15-lrv',
    },
    {
      id: 'chandrayaan3',
      label: 'Chandrayaan-3 Vikram & Pragyan',
      site: 'Shiv Shakti Point',
      theater: 'Moon',
      defaultHardwareId: 'vikram-lander',
    },
    {
      id: 'apollo17',
      label: 'Apollo 17 Taurus-Littrow',
      site: 'Taurus-Littrow Valley',
      theater: 'Moon',
      defaultHardwareId: 'orange-soil-sampler',
    },
    {
      id: 'change4',
      label: "Chang'e 4 & Yutu-2",
      site: 'Von Kármán Crater',
      theater: 'Moon',
      defaultHardwareId: 'yutu2-rover',
    },
    {
      id: 'surveyor3',
      label: 'Surveyor 3 & Apollo 12',
      site: 'Ocean of Storms',
      theater: 'Moon',
      defaultHardwareId: 'surveyor3-sampler',
    },
    {
      id: 'lro',
      label: 'Lunar Reconnaissance Orbiter',
      site: 'Polar Mapping Orbit',
      theater: 'Moon',
      defaultHardwareId: 'lroc-camera',
    },
    {
      id: 'ladee',
      label: 'NASA LADEE Orbiter',
      site: 'Equatorial Lunar Orbit',
      theater: 'Moon',
      defaultHardwareId: 'ladee-ldex',
    },
  ],
  DeepSpace: [
    {
      id: 'jwst',
      label: 'James Webb Space Telescope',
      site: 'Sun-Earth L2 Halo Orbit',
      theater: 'DeepSpace',
      defaultHardwareId: 'jwst-primary-mirror',
    },
    {
      id: 'hubble',
      label: 'Hubble Space Telescope',
      site: 'Low Earth Orbit (535 km)',
      theater: 'DeepSpace',
      defaultHardwareId: 'hubble-primary-mirror',
    },
    {
      id: 'iss',
      label: 'International Space Station',
      site: 'Low Earth Orbit (408 km)',
      theater: 'DeepSpace',
      defaultHardwareId: 'iss-solar',
    },
    {
      id: 'voyager',
      label: 'Voyager 1 Interstellar Probe',
      site: 'Interstellar Medium (165+ AU)',
      theater: 'DeepSpace',
      defaultHardwareId: 'voyager-dish',
    },
  ],
};

export const THEATER_META: Record<
  DestinationType,
  {
    title: string;
    shortLabel: string;
    stepThreeLabel: string;
    subtitle: string;
    distanceLabel: string;
  }
> = {
  Moon: {
    title: 'The Moon',
    shortLabel: 'Moon',
    stepThreeLabel: 'Landing',
    subtitle: 'Lunar landings, polar landers & mapping orbiters',
    distanceLabel: '384,400 km',
  },
  Mars: {
    title: 'Mars',
    shortLabel: 'Mars',
    stepThreeLabel: 'Landing',
    subtitle: 'Red Planet rovers, geophysical landers & orbiters',
    distanceLabel: '225M km',
  },
  DeepSpace: {
    title: 'Deep Space & Orbital',
    shortLabel: 'Deep Space',
    stepThreeLabel: 'Deploy',
    subtitle: 'Space observatories, orbital labs & interstellar probes',
    distanceLabel: '408 km – 24B+ km',
  },
};

const MISSION_TO_THEATER = new Map<string, DestinationType>();
(Object.keys(THEATER_MISSIONS) as DestinationType[]).forEach((theater) => {
  THEATER_MISSIONS[theater].forEach((m) => {
    MISSION_TO_THEATER.set(m.id.toLowerCase(), theater);
  });
});

export function getTheaterForMission(
  missionId?: string,
  fallback: DestinationType = 'Mars'
): DestinationType {
  if (!missionId) return fallback;
  return MISSION_TO_THEATER.get(missionId.toLowerCase()) || fallback;
}

export function getMissionsForTheater(destination: DestinationType): TheaterMissionSummary[] {
  return THEATER_MISSIONS[destination] || THEATER_MISSIONS.Mars;
}

export function getDefaultMissionForTheater(destination: DestinationType): string {
  return DEFAULT_MISSION_BY_THEATER[destination] || 'perseverance';
}

export function getDefaultHardwareForMission(
  missionId: string,
  destination: DestinationType = 'Mars'
): string {
  const key = missionId.toLowerCase();
  if (HARDWARE_BY_MISSION[key]) return HARDWARE_BY_MISSION[key];
  const fallbackMission = getDefaultMissionForTheater(destination);
  return HARDWARE_BY_MISSION[fallbackMission] || 'supercam';
}

export function isMissionInTheater(missionId: string, destination: DestinationType): boolean {
  return getTheaterForMission(missionId) === destination;
}

export const MISSION_FLIGHT_PROFILES: Record<string, MissionFlightProfile> = {
  // Mars Theater
  perseverance: {
    missionId: 'perseverance',
    theater: 'Mars',
    launchVehicleId: 'atlas-v-541',
    launchVehicleName: 'Atlas V 541',
    launchSite: 'Cape Canaveral SLC-41',
    launchInclinationDeg: 28.5,
    maxQSeconds: 32,
    launchArchivalVideo: '/videos/mars_launch_journey.mp4',
    launchArchivalLabel: 'Mars 2020 Atlas V 541 Launch',
    stage4Kind: 'surface-edl',
    stage4ArchivalVideo: '/videos/mars_edl_landing.mp4',
    stage4ArchivalLabel: 'Mars 2020 Jezero Sky Crane EDL',
    isCrewedSurface: false,
    nasaVideoQuery: 'Perseverance Mars 2020 launch landing JPL',
  },
  curiosity: {
    missionId: 'curiosity',
    theater: 'Mars',
    launchVehicleId: 'atlas-v-541',
    launchVehicleName: 'Atlas V 541 (MSL)',
    launchSite: 'Cape Canaveral SLC-41',
    launchInclinationDeg: 28.5,
    maxQSeconds: 34,
    launchArchivalVideo: null,
    curatedLaunchVideo: '/videos/curiosity_launch.mp4',
    curatedLaunchVideoLabel: 'MSL Atlas V 541 & Centaur Cruise Separation (NASA)',
    stage4Kind: 'surface-edl',
    stage4ArchivalVideo: null,
    curatedArrivalVideo: '/videos/curiosity_landing.mp4',
    curatedArrivalVideoLabel: 'Curiosity MARDI Heatshield Drop & Gale Crater Descent (NASA/JPL)',
    isCrewedSurface: false,
    nasaVideoQuery: 'Curiosity Mars Science Laboratory MSL Gale Crater',
  },
  insight: {
    missionId: 'insight',
    theater: 'Mars',
    launchVehicleId: 'atlas-v-401',
    launchVehicleName: 'Atlas V 401',
    launchSite: 'Vandenberg SLC-3E',
    launchInclinationDeg: 63.4,
    maxQSeconds: 30,
    launchArchivalVideo: null,
    curatedLaunchVideo: '/videos/insight_launch.mp4',
    curatedLaunchVideoLabel: 'Vandenberg Atlas V 401 Ignition & Liftoff (NASA)',
    stage4Kind: 'surface-edl',
    stage4ArchivalVideo: null,
    curatedArrivalVideo: '/videos/insight_landing.mp4',
    curatedArrivalVideoLabel: 'InSight Lander SEIS & Subsurface Heat Probe Deployment (DLR/NASA)',
    isCrewedSurface: false,
    nasaVideoQuery: 'InSight Mars lander launch landing JPL',
  },
  viking: {
    missionId: 'viking',
    theater: 'Mars',
    launchVehicleId: 'titan-iiie',
    launchVehicleName: 'Titan IIIE-Centaur',
    launchSite: 'Cape Canaveral LC-41',
    launchInclinationDeg: 28.5,
    maxQSeconds: 36,
    launchArchivalVideo: null,
    curatedLaunchVideo: '/videos/viking_launch.mp4',
    curatedLaunchVideoLabel: 'Upper Stage Separation Over Earth Limb (NASA Archival)',
    stage4Kind: 'surface-edl',
    stage4ArchivalVideo: null,
    curatedArrivalVideo: '/videos/viking_landing.mp4',
    curatedArrivalVideoLabel: 'Viking 1 Orbiter Separation & Parachute Descent (NASA/JPL 1976)',
    isCrewedSurface: false,
    nasaVideoQuery: 'Viking 1 Mars lander NASA 1976',
  },
  mro: {
    missionId: 'mro',
    theater: 'Mars',
    launchVehicleId: 'atlas-v-401',
    launchVehicleName: 'Atlas V 401',
    launchSite: 'Cape Canaveral SLC-41',
    launchInclinationDeg: 28.5,
    maxQSeconds: 30,
    launchArchivalVideo: null,
    curatedLaunchVideo: '/videos/mro_launch.mp4',
    curatedLaunchVideoLabel: 'MRO Atlas V 401 Pad Ignition & Liftoff (NASA KSC)',
    stage4Kind: 'orbit-capture',
    stage4ArchivalVideo: null,
    curatedArrivalVideo: '/videos/mro_orbit.mp4',
    curatedArrivalVideoLabel: 'Mars Reconnaissance Orbiter & Mars Polar Fleet (NASA/JPL)',
    isCrewedSurface: false,
    nasaVideoQuery: 'Mars Reconnaissance Orbiter aerobraking HiRISE',
  },

  // Lunar Theater
  artemis3: {
    missionId: 'artemis3',
    theater: 'Moon',
    launchVehicleId: 'sls-block1',
    launchVehicleName: 'Space Launch System (SLS Block 1)',
    launchSite: 'Kennedy Space Center LC-39B',
    launchInclinationDeg: 28.6,
    maxQSeconds: 62,
    launchArchivalVideo: null,
    curatedLaunchVideo: '/videos/artemis_launch.mp4',
    curatedLaunchVideoLabel: 'NASA SLS Heavy-Lift Liftoff from KSC Pad 39B',
    stage4Kind: 'surface-edl',
    stage4ArchivalVideo: null,
    curatedArrivalVideo: '/videos/artemis_lunar.mp4',
    curatedArrivalVideoLabel: 'Artemis Orion Lunar Orbit Earthset & Distant Look-Back (NASA)',
    isCrewedSurface: true,
    nasaVideoQuery: 'Artemis SLS Orion Starship HLS Moon',
  },
  apollo11: {
    missionId: 'apollo11',
    theater: 'Moon',
    launchVehicleId: 'saturn-v',
    launchVehicleName: 'Saturn V (SA-506)',
    launchSite: 'Kennedy Space Center LC-39A',
    launchInclinationDeg: 32.5,
    maxQSeconds: 68,
    launchArchivalVideo: '/videos/moon_launch_journey.mp4',
    launchArchivalLabel: 'Apollo 11 Saturn V (SA-506) Liftoff & S-IC Staging Film',
    stage4Kind: 'surface-edl',
    stage4ArchivalVideo: '/videos/apollo11_landing.mp4',
    stage4ArchivalLabel: 'Apollo 11 Eagle Tranquility Base Film',
    isCrewedSurface: true,
    nasaVideoQuery: 'Apollo 11 Saturn V Eagle landing NASA',
  },
  apollo15: {
    missionId: 'apollo15',
    theater: 'Moon',
    launchVehicleId: 'saturn-v',
    launchVehicleName: 'Saturn V (SA-510)',
    launchSite: 'Kennedy Space Center LC-39A',
    launchInclinationDeg: 29.6,
    maxQSeconds: 68,
    launchArchivalVideo: '/videos/apollo15_launch.mp4',
    launchArchivalLabel: 'Apollo 15 Saturn V (SA-510) Pad 39A Liftoff',
    stage4Kind: 'surface-edl',
    stage4ArchivalVideo: null,
    curatedArrivalVideo: '/videos/apollo15_landing.mp4',
    curatedArrivalVideoLabel: 'Apollo 15 Falcon Lunar Module Hadley-Apennine Descent Film',
    isCrewedSurface: true,
    nasaVideoQuery: 'Apollo 15 Hadley Rille Lunar Roving Vehicle',
  },
  apollo17: {
    missionId: 'apollo17',
    theater: 'Moon',
    launchVehicleId: 'saturn-v',
    launchVehicleName: 'Saturn V (SA-512)',
    launchSite: 'Kennedy Space Center LC-39A',
    launchInclinationDeg: 28.5,
    maxQSeconds: 68,
    launchArchivalVideo: '/videos/apollo17_launch.mp4',
    launchArchivalLabel: 'Saturn V High-Speed F-1 Engine Ignition & Tower Clearance',
    stage4Kind: 'surface-edl',
    stage4ArchivalVideo: null,
    curatedArrivalVideo: '/videos/apollo17_landing.mp4',
    curatedArrivalVideoLabel: 'Taurus-Littrow Lee-Lincoln Scarp Flyover & LM Ascent (NASA)',
    isCrewedSurface: true,
    nasaVideoQuery: 'Apollo 17 Taurus Littrow Saturn V night launch',
  },
  chandrayaan3: {
    missionId: 'chandrayaan3',
    theater: 'Moon',
    launchVehicleId: 'lvm3-m4',
    launchVehicleName: 'ISRO LVM3-M4',
    launchSite: 'Satish Dhawan Space Centre SLP',
    launchInclinationDeg: 21.5,
    maxQSeconds: 54,
    launchArchivalVideo: null,
    curatedLaunchVideo: '/videos/chandrayaan3_launch.mp4',
    curatedLaunchVideoLabel: 'Chandrayaan-3 LVM3-M4 Onboard Strap-On Separation Footage (ISRO)',
    stage4Kind: 'surface-edl',
    stage4ArchivalVideo: null,
    curatedArrivalVideo: '/videos/chandrayaan3_landing.mp4',
    curatedArrivalVideoLabel: 'Vikram Lander South Pole Descent & Pragyan Rover Ramp Rollout (ISRO)',
    isCrewedSurface: false,
    nasaVideoQuery: 'Chandrayaan 3 Moon South Pole LRO',
  },
  change4: {
    missionId: 'change4',
    theater: 'Moon',
    launchVehicleId: 'long-march-3b',
    launchVehicleName: 'Long March 3B (CZ-3B)',
    launchSite: 'Xichang Satellite Launch Center',
    launchInclinationDeg: 28.5,
    maxQSeconds: 52,
    launchArchivalVideo: null,
    curatedLaunchVideo: '/videos/change4_launch.mp4',
    curatedLaunchVideoLabel: "Chang'e 4 Long March 3B Night Liftoff from Xichang",
    stage4Kind: 'surface-edl',
    stage4ArchivalVideo: null,
    curatedArrivalVideo: '/videos/change4_landing.mp4',
    curatedArrivalVideoLabel: 'Lunar Far Side & South Pole–Aitken Basin Flyover (NASA SVS)',
    isCrewedSurface: false,
    nasaVideoQuery: 'Von Karman crater LRO far side Moon',
  },
  surveyor3: {
    missionId: 'surveyor3',
    theater: 'Moon',
    launchVehicleId: 'atlas-v-401',
    launchVehicleName: 'Atlas-Centaur (AC-12)',
    launchSite: 'Cape Kennedy LC-36B',
    launchInclinationDeg: 28.5,
    maxQSeconds: 48,
    launchArchivalVideo: null,
    curatedLaunchVideo: '/videos/surveyor3_launch.mp4',
    curatedLaunchVideoLabel: 'Apollo-Era 70mm Pad Liftoff Archive (NASA KSC)',
    stage4Kind: 'surface-edl',
    stage4ArchivalVideo: null,
    curatedArrivalVideo: '/videos/surveyor3_landing.mp4',
    curatedArrivalVideoLabel: 'Apollo 12 Astronauts Inspecting Surveyor 3 on Ocean of Storms (NASA)',
    isCrewedSurface: false,
    nasaVideoQuery: 'Surveyor 3 Apollo 12 Moon lander',
  },
  lro: {
    missionId: 'lro',
    theater: 'Moon',
    launchVehicleId: 'atlas-v-401',
    launchVehicleName: 'Atlas V 401 (with LCROSS)',
    launchSite: 'Cape Canaveral SLC-41',
    launchInclinationDeg: 28.5,
    maxQSeconds: 32,
    launchArchivalVideo: null,
    curatedLaunchVideo: '/videos/lro_launch.mp4',
    curatedLaunchVideoLabel: 'LRO/LCROSS Atlas V 401 Liftoff from Pad 41 (NASA KSC)',
    stage4Kind: 'orbit-capture',
    stage4ArchivalVideo: null,
    curatedArrivalVideo: '/videos/lro_orbit.mp4',
    curatedArrivalVideoLabel: 'LRO Centaur Translunar Separation Over Earth Limb (NASA/ULA)',
    isCrewedSurface: false,
    nasaVideoQuery: 'Lunar Reconnaissance Orbiter LRO Moon orbit',
  },
  ladee: {
    missionId: 'ladee',
    theater: 'Moon',
    launchVehicleId: 'atlas-v-401',
    launchVehicleName: 'Minotaur V',
    launchSite: 'Wallops Flight Facility Pad 0B',
    launchInclinationDeg: 37.8,
    maxQSeconds: 38,
    launchArchivalVideo: null,
    curatedLaunchVideo: '/videos/ladee_launch.mp4',
    curatedLaunchVideoLabel: 'LADEE Minotaur V Night Liftoff from Wallops Pad 0B (NASA)',
    stage4Kind: 'orbit-capture',
    stage4ArchivalVideo: null,
    curatedArrivalVideo: '/videos/ladee_orbit.mp4',
    curatedArrivalVideoLabel: 'LADEE Lunar Exosphere & Optical Comms Science Orbit (NASA)',
    isCrewedSurface: false,
    nasaVideoQuery: 'LADEE lunar atmosphere dust explorer NASA',
  },

  // Deep Space & Orbital Theater
  jwst: {
    missionId: 'jwst',
    theater: 'DeepSpace',
    launchVehicleId: 'ariane-5',
    launchVehicleName: 'Ariane 5 ECA (VA256)',
    launchSite: 'Guiana Space Centre ELA-3',
    launchInclinationDeg: 5.2,
    maxQSeconds: 45,
    launchArchivalVideo: null,
    curatedLaunchVideo: '/videos/jwst_launch.mp4',
    curatedLaunchVideoLabel: 'JWST Ariane 5 VA256 Ignition & Kourou Liftoff (NASA/ESA)',
    stage4Kind: 'deep-commissioning',
    stage4ArchivalVideo: null,
    curatedArrivalVideo: '/videos/jwst_deploy.mp4',
    curatedArrivalVideoLabel: 'JWST Primary & Secondary Mirror Light-Path Deployment (NASA)',
    isCrewedSurface: false,
    nasaVideoQuery: 'James Webb Space Telescope Ariane 5 launch deployment',
  },
  hubble: {
    missionId: 'hubble',
    theater: 'DeepSpace',
    launchVehicleId: 'space-shuttle',
    launchVehicleName: 'Space Shuttle Discovery (STS-31)',
    launchSite: 'Kennedy Space Center LC-39B',
    launchInclinationDeg: 28.5,
    maxQSeconds: 50,
    launchArchivalVideo: null,
    curatedLaunchVideo: '/videos/hubble_launch.mp4',
    curatedLaunchVideoLabel: 'Space Shuttle RS-25 Ignition, Liftoff & External Tank Ascent (NASA)',
    stage4Kind: 'deep-commissioning',
    stage4ArchivalVideo: null,
    curatedArrivalVideo: '/videos/hubble_deploy.mp4',
    curatedArrivalVideoLabel: 'Hubble Space Telescope Canadarm Orbital Deployment (NASA)',
    isCrewedSurface: false,
    nasaVideoQuery: 'Hubble Space Telescope Discovery STS-31 deployment',
  },
  iss: {
    missionId: 'iss',
    theater: 'DeepSpace',
    launchVehicleId: 'falcon9-soyuz',
    launchVehicleName: 'Falcon 9 / Soyuz & Proton-K',
    launchSite: 'KSC LC-39A / Baikonur',
    launchInclinationDeg: 51.6,
    maxQSeconds: 55,
    launchArchivalVideo: null,
    curatedLaunchVideo: '/videos/iss_launch.mp4',
    curatedLaunchVideoLabel: 'SpaceX Falcon 9 Orbital Booster Liftoff & Ascent (Cape Canaveral)',
    stage4Kind: 'deep-commissioning',
    stage4ArchivalVideo: null,
    curatedArrivalVideo: '/videos/iss_orbit.mp4',
    curatedArrivalVideoLabel: 'International Space Station Solar Arrays Over Earth Limb (NASA UHD)',
    isCrewedSurface: true,
    nasaVideoQuery: 'International Space Station Falcon 9 docking orbit',
  },
  voyager: {
    missionId: 'voyager',
    theater: 'DeepSpace',
    launchVehicleId: 'titan-iiie',
    launchVehicleName: 'Titan IIIE-Centaur D-1T',
    launchSite: 'Cape Canaveral LC-41',
    launchInclinationDeg: 28.5,
    maxQSeconds: 36,
    launchArchivalVideo: null,
    curatedLaunchVideo: '/videos/voyager_launch.mp4',
    curatedLaunchVideoLabel: 'Voyager 1 Titan IIIE-Centaur Liftoff & Grand Tour Trajectory (NASA)',
    stage4Kind: 'deep-commissioning',
    stage4ArchivalVideo: null,
    curatedArrivalVideo: '/videos/voyager_transit.mp4',
    curatedArrivalVideoLabel: 'Outer Planets & Heliopause Interstellar Boundary (NASA GSFC)',
    isCrewedSurface: false,
    nasaVideoQuery: 'Voyager 1 Titan IIIE Centaur interstellar NASA',
  },
};

export function getMissionFlightProfile(missionId?: string): MissionFlightProfile {
  const id = (missionId || 'perseverance').toLowerCase();
  return MISSION_FLIGHT_PROFILES[id] || MISSION_FLIGHT_PROFILES.perseverance;
}

export function isOrbiterMission(missionId?: string): boolean {
  return getMissionFlightProfile(missionId).stage4Kind === 'orbit-capture';
}

export function isCrewedSurfaceMission(missionId?: string): boolean {
  return getMissionFlightProfile(missionId).isCrewedSurface;
}


