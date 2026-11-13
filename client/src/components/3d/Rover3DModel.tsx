import React, {
  useRef,
  useMemo,
  Suspense,
  useEffect,
  useState,
  useContext,
  useLayoutEffect,
} from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { ChevronLeft, ChevronRight, Info, X } from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';
import { ContactShadowPlane } from './ContactShadowPlane';
import { CanvasErrorBoundary } from '../common/CanvasErrorBoundary';
import { StarshipHLS3D } from './StarshipHLS3D';
import {
  polishUntexturedHardwareMaterial,
  upgradeISSStationHierarchy,
} from '../../utils/spaceHardwarePBR';
import {
  DetailedSurveyor3Lander,
  DetailedYutu2Rover,
  DetailedPragyanRover,
  DetailedApolloALSEP,
  DetailedShortyCraterSoil,
  DetailedSBandAntenna,
  DetailedApolloLRRR,
  DetailedLunarCommsTower,
} from './DetailedSpacecraftModels';

interface Rover3DModelProps {
  modelType: string;
  missionId?: string;
  onSelectHotspot?: (hotspotId: string) => void;
  activeHotspotId?: string;
  isMars?: boolean;
  isMoon?: boolean;
  showHotspots?: boolean;
  explodedFactor?: number; // 0 (assembled) to 1 (fully exploded)
  autoRotate?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🛰️ OFFICIAL NASA SUBSYSTEM & SCIENTIFIC INSTRUMENT TELEMETRY DATABASE
// Verified parameters: wavelength, power, mass, operational function, status
// ═══════════════════════════════════════════════════════════════════════════
export interface SubsystemTelemetryRecord {
  name: string;
  code: string;
  category: string;
  wavelength?: string;
  power?: string;
  mass?: string;
  dimensions?: string;
  scientificFunction: string;
  status: 'ACTIVE' | 'NOMINAL' | 'ARCHIVED' | 'STANDBY';
  primaryTarget: string;
}

export const NASA_SUBSYSTEM_DATABASE: Record<string, SubsystemTelemetryRecord> = {
  supercam: {
    name: 'SuperCam Laser Spectrometer & Remote Micro-Imager',
    code: 'SC-LIBS',
    category: 'Optical Remote Sensing',
    wavelength: '1064 nm Nd:YAG Laser / 532 nm Raman',
    power: '35 W peak',
    mass: '10.6 kg',
    scientificFunction: 'Fires 1,000+ pulses/burst to vaporize rock targets up to 7m; analyzes plasma spectra for organic biosignatures.',
    status: 'ACTIVE',
    primaryTarget: 'Jezero Delta Astrobiology',
  },
  moxie: {
    name: 'Mars Oxygen ISRU Experiment (MOXIE)',
    code: 'MOXIE',
    category: 'In-Situ Resource Utilization',
    power: '300 W peak (Solid Oxide Electrolyzer)',
    mass: '17.1 kg',
    dimensions: '23.9 × 23.9 × 30.9 cm',
    scientificFunction: 'Electrochemically splits atmospheric CO₂ at 800°C into breathable O₂ and carbon monoxide at 12 g/hour.',
    status: 'ACTIVE',
    primaryTarget: 'Human Life Support Precursor',
  },
  pixl: {
    name: 'Planetary Instrument for X-ray Lithochemistry (PIXL)',
    code: 'PIXL-XRF',
    category: 'Micro-Focus X-Ray Spectrometer',
    wavelength: '28 keV micro-focus X-ray beam',
    power: '25 W',
    mass: '4.3 kg sensor head',
    scientificFunction: 'Produces sub-millimeter elemental abundance maps of rock targets to detect fossilized microbial textures.',
    status: 'ACTIVE',
    primaryTarget: 'Sedimentary Biosignature Mapping',
  },
  rimfax: {
    name: 'Radar Imager for Mars Subsurface Experiment',
    code: 'RIMFAX-GPR',
    category: 'Ground Penetrating Radar',
    wavelength: '150 – 1200 MHz ultra-wideband',
    power: '10 W RF',
    mass: '3.0 kg',
    scientificFunction: 'Transmits ground-penetrating radar pulses probing stratigraphic cross-sections down to 10m depth.',
    status: 'ACTIVE',
    primaryTarget: 'Subsurface Delta Stratigraphy',
  },
  ingenuity: {
    name: 'Ingenuity Mars Helicopter & Rotor Assembly',
    code: 'ING-SCOUT',
    category: 'Atmospheric Autonomous Rotorcraft',
    power: '350 W coaxial twin counter-rotors',
    mass: '1.8 kg',
    dimensions: '1.2 m rotor span',
    scientificFunction: 'Logged 72 powered flights in 1% Earth-density air; autonomous scout mapping rover traverses across boulder fields.',
    status: 'ARCHIVED',
    primaryTarget: 'Extraterrestrial Aerial Scouting',
  },
  'curiosity-chassis': {
    name: 'Curiosity MSL Core Chassis & MMRTG Power System',
    code: 'MSL-BUS',
    category: 'Nuclear Autonomous Platform',
    power: '110 W electrical (Pu-238 MMRTG)',
    mass: '899 kg total vehicle',
    dimensions: '3.0 m × 2.7 m × 2.2 m',
    scientificFunction: 'Continuous nuclear thermo-electric power and central computing architecture traversing Mt. Sharp since 2012.',
    status: 'ACTIVE',
    primaryTarget: 'Gale Crater Habitability Investigation',
  },
  chemcam: {
    name: 'ChemCam Laser-Induced Breakdown Spectrometer',
    code: 'CHEMCAM',
    category: 'LIBS / Micro-Imager',
    wavelength: '1067 nm Nd:KGW Laser',
    power: '30 W',
    mass: '10.5 kg mast unit',
    scientificFunction: 'Fired over 1,000,000 laser shots at Gale Crater rocks; analyzed elemental atomic emissions via 3 spectrometers.',
    status: 'ACTIVE',
    primaryTarget: 'Regolith Geochemical Characterization',
  },
  mastcam: {
    name: 'Mastcam Multispectral Stereo Imaging Array',
    code: 'MASTCAM',
    category: 'Stereoscopic Multispectral Imager',
    wavelength: '400 – 1000 nm (12 narrowband filters)',
    power: '13 W',
    mass: '9.6 kg',
    scientificFunction: 'Acquires calibrated 1600×1200 true-color stereoscopic panoramas and 720p HD terrain survey video.',
    status: 'ACTIVE',
    primaryTarget: 'Landscape Topography & Geology',
  },
  apxs: {
    name: 'Alpha Particle X-Ray Spectrometer (APXS)',
    code: 'APXS-CM',
    category: 'Radioisotope Contact Assay',
    power: '1.5 W',
    mass: '1.7 kg sensor head',
    scientificFunction: 'Curium-244 alpha emission and X-ray fluorescence resolving elements from Sodium to Bromine in contact samples.',
    status: 'ACTIVE',
    primaryTarget: 'Rock Surface Elemental Assays',
  },
  seis: {
    name: 'Seismic Experiment for Interior Structure (SEIS)',
    code: 'SEIS-VBB',
    category: 'Very Broad Band (VBB) Seismometer',
    wavelength: '0.01 – 50 Hz broadband frequency',
    power: '5.5 W',
    mass: '8.5 kg',
    scientificFunction: 'Monitored 1,300+ marsquakes, resolved Martian crust thickness (24–72 km) and liquid molten metallic core radius (1,830 km).',
    status: 'ARCHIVED',
    primaryTarget: 'Martian Interior Deep Structure',
  },
  hp3: {
    name: 'Heat Flow & Physical Properties Package (HP³)',
    code: 'HP3-MOLE',
    category: 'Subsurface Thermal Mole Penetrator',
    power: '2 W pulse',
    mass: '3.1 kg instrument',
    scientificFunction: 'Self-hammering thermal penetrator designed to quantify planetary heat escape rate and interior thermal history.',
    status: 'ARCHIVED',
    primaryTarget: 'Core Thermal Budget Quantitation',
  },
  'solar-arrays': {
    name: 'UltraFlex Circular Solar Array Wings',
    code: 'SOLAR-UF',
    category: 'Photovoltaic Array',
    power: '600 – 700 W BOL output',
    dimensions: '2.15 m diameter circular wings',
    scientificFunction: 'Ultra-lightweight accordion deployment mechanism utilizing triple-junction InGaP/InGaAs/Ge solar cells.',
    status: 'ARCHIVED',
    primaryTarget: 'Elysium Planitia Solar Harvesting',
  },
  arm: {
    name: 'Instrument Deployment Robotic Arm (IDA)',
    code: 'IDA-ARM',
    category: 'Robotic Manipulator Assembly',
    power: '45 W peak motion',
    dimensions: '1.9 m articulated reach (4 DOF)',
    scientificFunction: 'Precision surface grappling mechanism deploying seismometer and wind-thermal shield directly onto regolith.',
    status: 'ARCHIVED',
    primaryTarget: 'Autonomous Instrument Deployment',
  },
  'viking-rtg': {
    name: 'SNAP-19 Radioisotope Thermoelectric Generator',
    code: 'SNAP-19',
    category: 'Nuclear RTG Power',
    power: '70 W continuous (Dual Pu-238 units)',
    mass: '30.4 kg combined',
    scientificFunction: 'Thermoelectric lead-telluride conversion powering Viking 1 lander through 6 continuous years on Martian plains.',
    status: 'ARCHIVED',
    primaryTarget: 'Chryse Planitia Continuous Power',
  },
  'viking-sampler': {
    name: 'Surface Regolith Sampler Collector & Trenching Boom',
    code: 'SAMPLER',
    category: 'Soil Acquisition Mechanism',
    dimensions: '3.0 m extendable boom',
    scientificFunction: 'Scooped Martian soil into Gas Chromatograph-Mass Spectrometer (GCMS) and biological metabolism test chambers.',
    status: 'ARCHIVED',
    primaryTarget: 'First In-Situ Organic Search (1976)',
  },
  'jwst-mirror': {
    name: 'JWST 6.5m Primary Mirror (18 Beryllium Segments)',
    code: 'PMA-18',
    category: 'Optical Telescope Assembly',
    wavelength: '0.6 – 28 μm diffraction-limited',
    mass: '705 kg mirror assembly',
    dimensions: '6.5 m aperture (25 m² area)',
    scientificFunction: '18 gold-coated beryllium segments with cryogenic nano-actuators resolving early cosmic redshift galaxies at z > 13.',
    status: 'ACTIVE',
    primaryTarget: 'Deep Universe Cosmic Dawn',
  },
  'jwst-sunshield': {
    name: '5-Layer Deployable Kapton Polyimide Sunshield',
    code: 'SUNSHIELD',
    category: 'Cryogenic Passive Thermal Shield',
    dimensions: '21.2 m × 14.2 m (Tennis Court)',
    scientificFunction: 'Attenuates 300,000 W solar radiation down to milliwatts, maintaining cold side at 37 Kelvin passively.',
    status: 'ACTIVE',
    primaryTarget: 'Cryogenic Protection at L2 Point',
  },
  'jwst-nircam': {
    name: 'Near-Infrared Camera & Spectrograph (NIRCam)',
    code: 'NIRCAM',
    category: 'Primary Science Imager',
    wavelength: '0.6 – 5.0 μm infrared',
    power: '100 W cryogenic electronics',
    mass: '73 kg',
    scientificFunction: 'Equipped with coronagraphs to block parent star glare, imaging exoplanet atmospheres and stellar nursery disks.',
    status: 'ACTIVE',
    primaryTarget: 'Exoplanet Atmospheric Spectroscopy',
  },
  'iss-solar': {
    name: 'Integrated Truss Solar Array Wings (SAW)',
    code: 'SAW-ISS',
    category: 'Station Main Power Subsystem',
    power: '120 kW total capacity',
    dimensions: '8 wings (35m length × 12m width)',
    scientificFunction: 'Dual-axis beta gimbal tracking continuously charges 24 lithium-ion batteries across 16 daily orbital sunsets.',
    status: 'NOMINAL',
    primaryTarget: 'LEO Orbit Station Infrastructure',
  },
  'iss-lab': {
    name: 'Destiny US Laboratory & Microgravity Facility',
    code: 'DESTINY',
    category: 'Pressurized Science Module',
    mass: '14,520 kg',
    dimensions: '8.5 m length × 4.3 m diameter',
    scientificFunction: 'Houses 24 standard payload racks supporting biological, fluid dynamic, crystal growth, and protein experiments.',
    status: 'NOMINAL',
    primaryTarget: 'Crewed Microgravity Science',
  },
  'iss-cupola': {
    name: 'Cupola Earth-Observation & Robotics Control Dome',
    code: 'CUPOLA',
    category: 'Observation & Robotics Cockpit',
    dimensions: '2.95 m diameter × 1.5 m height',
    scientificFunction: '7 fused silica windows providing 360° visual monitoring of visiting spacecraft rendezvous and Canadarm2 operations.',
    status: 'NOMINAL',
    primaryTarget: 'Earth Telemetry & Robotics Control',
  },
  hirise: {
    name: 'HiRISE High Resolution Imaging Science Experiment',
    code: 'HiRISE',
    category: 'Orbital Reconnaissance Telescope',
    wavelength: 'Visible & NIR bands (0.3 m/px)',
    dimensions: '0.5 m Cassegrain mirror',
    scientificFunction: 'Images Martian surface with 30cm/pixel clarity; mapped landing zones for Curiosity, Perseverance, and InSight.',
    status: 'ACTIVE',
    primaryTarget: 'High-Resolution Geomorphology',
  },
  'mro-dish': {
    name: '3.0-Meter High-Gain Telecommunications Reflector',
    code: 'MRO-HGA',
    category: 'Deep Space Telecommunications',
    wavelength: 'X-band (8.4 GHz) & Ka-band (32 GHz)',
    power: '100 W RF amplifier',
    dimensions: '3.0 m diameter parabolic reflector',
    scientificFunction: 'Primary high-bandwidth data relay backhauling petabytes of rover scientific telemetry back to NASA Deep Space Network.',
    status: 'ACTIVE',
    primaryTarget: 'Interplanetary Telemetry Relay',
  },
  'voyager-dish': {
    name: '3.7-Meter High-Gain Parabolic Reflector Dish',
    code: 'VGR-HGA',
    category: 'Interstellar Deep Space Antenna',
    wavelength: '8.4 GHz (X-band) / 2.3 GHz (S-band)',
    power: '23 W traveling wave tube transmitter',
    dimensions: '3.7 m diameter Cassegrain antenna',
    scientificFunction: 'Transmits interstellar science data from over 24 billion kilometers away across a 22+ hour light delay.',
    status: 'ACTIVE',
    primaryTarget: 'Interstellar Medium at 160+ AU',
  },
  'golden-record': {
    name: 'The Voyager Interstellar Golden Record',
    code: 'GOLD-REC',
    category: 'Interstellar Time Capsule',
    dimensions: '12-inch gold-plated copper phonograph',
    mass: '1.2 kg',
    scientificFunction: 'Contains 115 images, sounds of Earth, greetings in 55 languages, and 90 minutes of music for cosmic civilizations.',
    status: 'NOMINAL',
    primaryTarget: 'Message to Cosmic Civilizations',
  },
  'apollo15-lrv': {
    name: 'Apollo 15 Lunar Roving Vehicle (LRV-1)',
    code: 'LRV-1',
    category: 'Manned Lunar Surface Mobility',
    dimensions: '3.1 m length × 2.06 m width',
    mass: '210 kg (Earth) / 35 kg (Moon)',
    scientificFunction: 'Enabled astronauts to traverse 27.8 km across Hadley Rille and collect 77 kg of pristine lunar samples.',
    status: 'ARCHIVED',
    primaryTarget: 'Hadley-Apennine Exploration Range',
  },
  'lrv-antenna': {
    name: 'Lunar Roving Vehicle High-Gain S-Band Antenna',
    code: 'HGA-LRV',
    category: 'Direct-to-Earth Telecommunications',
    wavelength: '2.287 GHz S-band downlink',
    power: '20 W RF transmitter',
    scientificFunction: 'Manually aimed steerable dish providing real-time color television and telemetry directly from rover to Goldstone DSN.',
    status: 'ARCHIVED',
    primaryTarget: 'Live Lunar Telecast to Houston',
  },
  'lrv-camera': {
    name: 'Ground-Controlled Television Assembly (GCTA)',
    code: 'GCTA-TV',
    category: 'Remotely-Operated Color TV',
    power: '15 W',
    scientificFunction: 'Color camera tele-operated from Houston mission control; famously panned up to capture Apollo 15 and 17 LM liftoffs.',
    status: 'ARCHIVED',
    primaryTarget: 'Remote Teleoperated Lunar Broadcast',
  },
  'apollo15-drill': {
    name: 'Apollo Lunar Surface Drill (ALSD) & Core Rack',
    code: 'ALSD-CORE',
    category: 'Regolith Deep Core Extractor',
    power: 'Rotary-percussion motor assembly',
    dimensions: '3.0 m maximum core depth',
    scientificFunction: 'Drilled 2.4m beneath the lunar surface, extracting layered regolith columns revealing billions of years of solar wind.',
    status: 'ARCHIVED',
    primaryTarget: 'Stratified Regolith Solar History',
  },
  'lrv-astronaut': {
    name: 'Apollo 15 Crew in A7LB Lunar Spacesuit',
    code: 'A7LB-EMU',
    category: 'Extravehicular Mobility Unit (EMU)',
    mass: '96 kg spacesuit assembly',
    scientificFunction: 'First suit redesign featuring a flexible waist convolute and repositioned neck ring enabling seated rover driving.',
    status: 'ARCHIVED',
    primaryTarget: 'Hadley Rille Geological Traverse',
  },
  'vikram-lander': {
    name: 'ISRO Chandrayaan-3 Vikram Polar Descent Lander',
    code: 'VIKRAM',
    category: 'Lunar Polar Soft Lander',
    mass: '1,752 kg at launch',
    power: '738 W solar arrays',
    scientificFunction: 'Executed automated precision hazard detection soft touchdown at 69.37° S near the lunar south pole.',
    status: 'ARCHIVED',
    primaryTarget: 'Lunar South Polar Region (69.37° S)',
  },
  'pragyan-rover': {
    name: 'Pragyan 6-Wheel Autonomous Polar Rover',
    code: 'PRAGYAN',
    category: 'Surface Exploration Rover',
    mass: '26 kg',
    power: '50 W solar array (Rocker-Bogie)',
    scientificFunction: 'Traversed south polar regolith with LIBS and APXS payloads, confirming surface presence of Sulfur, Iron, and Titanium.',
    status: 'ARCHIVED',
    primaryTarget: 'In-Situ Polar Mineral Spectroscopy',
  },
  'chaste-probe': {
    name: 'Chandra’s Surface Thermophysical Experiment',
    code: 'ChaSTE',
    category: 'Subsurface Thermal Penetrator',
    dimensions: '10 cm depth probe (10 temperature sensors)',
    scientificFunction: 'Measured historic first in-situ vertical thermal gradient of polar regolith: +60°C at surface dropping to -10°C at 8cm.',
    status: 'ARCHIVED',
    primaryTarget: 'Polar Regolith Thermal Conductivity',
  },
  'rambha-plasma': {
    name: 'RAMBHA-LP Langmuir Plasma Density Probe',
    code: 'RAMBHA',
    category: 'Near-Surface Ionospheric Sensor',
    scientificFunction: 'Quantified near-surface lunar plasma sheath density (~5–30 million electrons/m³) in response to solar UV irradiation.',
    status: 'ARCHIVED',
    primaryTarget: 'Lunar Day Surface Ionosphere',
  },
  'orange-soil-sampler': {
    name: 'Shorty Crater Orange Soil Gnomon & Core Tube',
    code: 'GNOMON',
    category: 'Geological Field Sample Tool',
    scientificFunction: 'Used by Harrison Schmitt to document and collect titanium-rich pyroclastic volcanic glass droplets erupted 3.6B years ago.',
    status: 'ARCHIVED',
    primaryTarget: 'Pyroclastic Volcanic Vent Sample',
  },
  'apollo-astronaut': {
    name: 'Apollo 11 Astronaut in A7L Lunar Spacesuit',
    code: 'A7L-EMU',
    category: 'Extravehicular Mobility Unit (EMU)',
    mass: '91 kg (Earth) / 15.2 kg (Moon)',
    power: '4-hour primary life support battery',
    scientificFunction: 'Integrated liquid cooling garment, 3.7 psi 100% O₂ atmosphere, and 21 layers of micrometeoroid insulation.',
    status: 'ARCHIVED',
    primaryTarget: 'Historic Tranquility Base First EVA',
  },
  'apollo-ascent-stage': {
    name: 'Lunar Module Ascent Stage & Pressurized Cabin',
    code: 'LM-ASC',
    category: 'Crewed Ascent Propulsion & Habitat',
    mass: '4,700 kg gross at liftoff',
    power: 'Hypergolic APS Engine (15.6 kN thrust)',
    scientificFunction: 'Carried Neil Armstrong & Buzz Aldrin off the lunar surface with zero-failure restart to rendezvous with CSM Columbia.',
    status: 'ARCHIVED',
    primaryTarget: 'Lunar Liftoff & CSM Rendezvous',
  },
  'eagle-descent-stage': {
    name: 'Lunar Module Descent Stage & DPS Engine',
    code: 'LM-DSC',
    category: 'Descent Propulsion & Base Pad',
    dimensions: '4.2 m diameter across flats',
    power: 'Throttleable DPS Rocket (4,390 to 45,040 N)',
    scientificFunction: 'Executed 12-minute powered descent with throttleable bipropellant engine, functioning as launch base for ascent stage.',
    status: 'ARCHIVED',
    primaryTarget: 'Mare Tranquillitatis Soft Landing',
  },
  'apollo-landing-gear': {
    name: 'Crushable Honeycomb Aluminum Landing Strut',
    code: 'LM-GEAR',
    category: 'Touchdown Shock Attenuation',
    dimensions: '9.4 m span across diagonal pads',
    mass: 'Aluminum honeycomb crush cartridge',
    scientificFunction: 'Dissipated vertical landing shock up to 3 m/s; contact probes triggered blue "LUNAR CONTACT" cockpit indicator light.',
    status: 'ARCHIVED',
    primaryTarget: 'Tranquility Base Shock Absorption',
  },
  'lunar-laser-retro': {
    name: 'Laser Ranging Retroreflector (LRRR)',
    code: 'LRRR',
    category: 'Passive Optical Corner-Cube Array',
    mass: '22 kg',
    dimensions: '100 fused-silica corner cubes',
    scientificFunction: 'Still active after 55+ years; bounces observatory lasers to measure Earth-Moon distance within millimeter precision.',
    status: 'ACTIVE',
    primaryTarget: 'Millimeter Lunar Orbital Dynamics',
  },
  'lunar-antenna': {
    name: 'Lunar Module Steerable S-Band Dish Antenna',
    code: 'LM-S-BAND',
    category: 'Deep Space Telecommunications',
    wavelength: '2.287 GHz S-band',
    dimensions: '66 cm parabolic steerable dish',
    scientificFunction: 'Continuous microwave link transmitting live biomedical telemetry, voice, and slow-scan television directly to Earth.',
    status: 'ARCHIVED',
    primaryTarget: 'Manned Space Flight Network (MSFN)',
  },
  'lroc-camera': {
    name: 'LROC Narrow Angle Cameras (NAC)',
    code: 'LROC-NAC',
    category: 'High-Resolution Orbital Mapping',
    wavelength: 'Visible band (0.5 m/pixel resolution)',
    dimensions: 'Pair of 700mm focal length Ritchey-Chrétien telescopes',
    scientificFunction: 'Orbital mapping that resolved Apollo descent stages, rover tire tracks, and polar permanently shadowed ice craters.',
    status: 'ACTIVE',
    primaryTarget: 'Sub-Meter Lunar Cartography',
  },
  'diviner-radiometer': {
    name: 'Diviner Lunar Radiometer Experiment',
    code: 'DLRE-IR',
    category: 'Thermal Infrared Radiometry',
    wavelength: '0.3 – 400 μm (9 spectral channels)',
    power: '18 W',
    mass: '14 kg',
    scientificFunction: 'Identified 25 Kelvin (-248°C) cold traps inside polar craters capable of preserving lunar water ice for billions of years.',
    status: 'ACTIVE',
    primaryTarget: 'Polar Cold Trap Mapping',
  },
  'apollo17-lrv': {
    name: 'Apollo 17 Lunar Roving Vehicle (LRV-3 Challenger)',
    code: 'LRV-3',
    category: 'Manned Lunar Electric Rover',
    dimensions: '3.1 m length × 2.06 m width',
    mass: '210 kg (Earth) / 35 kg (Moon)',
    scientificFunction: 'Longest single crewed traverse on the Moon (35.7 km) across Taurus-Littrow valley with traverse gravimeter.',
    status: 'ARCHIVED',
    primaryTarget: 'Taurus-Littrow Geological Traverse',
  },
  'yutu2-rover': {
    name: "Yutu-2 ('Jade Rabbit 2') Far-Side Rover",
    code: 'YUTU-2',
    category: 'Autonomous Robotic Rover',
    mass: '135 kg (6-Wheel Rocker-Bogie)',
    power: 'Dual GaAs Solar Array Wings + RHU',
    scientificFunction: 'Longest-operating lunar rover in history, exploring Von Kármán crater on the lunar far side since January 2019.',
    status: 'ACTIVE',
    primaryTarget: 'South Pole-Aitken Far Side Mantle',
  },
  'lpr-radar': {
    name: 'Lunar Penetrating Radar (LPR)',
    code: 'LPR-GPR',
    category: 'Dual-Frequency Ground Radar',
    wavelength: '60 MHz & 500 MHz dual antenna',
    scientificFunction: 'Mapped stratified subsurface regolith and ancient basalt lava flows down to 40+ meters beneath Von Kármán crater.',
    status: 'ACTIVE',
    primaryTarget: 'Far-Side Subsurface Stratigraphy',
  },
  'surveyor3-sampler': {
    name: 'Surface Sampler Pantograph Trenching Arm',
    code: 'SMSS-3',
    category: 'Robotic Soil Mechanics Scoop',
    dimensions: '1.5 m extendable scissor arm',
    scientificFunction: 'Excavated four soil trenches at Oceanus Procellarum in 1967, proving lunar soil could safely support heavy Apollo landers.',
    status: 'ARCHIVED',
    primaryTarget: 'Regolith Bearing Strength',
  },
  'surveyor3-tv': {
    name: 'Surveyor 3 Steerable Mirror Vidicon Camera',
    code: 'TV-VID',
    category: 'Optical Surface Imager',
    mass: '3.0 kg (Returned to Earth by Apollo 12)',
    scientificFunction: 'Captured 6,315 images; later retrieved by Pete Conrad & Alan Bean to study long-term lunar vacuum exposure.',
    status: 'ARCHIVED',
    primaryTarget: 'Lunar Vacuum Materials Aging',
  },
  'hubble-primary-mirror': {
    name: 'Hubble 2.4m Ritchey-Chrétien Primary Mirror',
    code: 'HST-24',
    category: 'UV / Optical / NIR Reflector',
    wavelength: '115 nm – 2.5 μm',
    dimensions: '2.4 m diameter ultra-low-expansion glass',
    scientificFunction: 'Polished to 10-nanometer smoothness to capture Hubble Deep Field galaxies and resolve Cepheid variables.',
    status: 'ACTIVE',
    primaryTarget: 'Cosmic Expansion & Deep Universe',
  },
  'hubble-solar-arrays': {
    name: 'Hubble GaAs Rigid Solar Array Wings',
    code: 'HST-SAW',
    category: 'Orbital Power Bus',
    power: '2,800 W Gallium Arsenide array',
    scientificFunction: 'High-efficiency rigid wings installed on Servicing Mission 3B powering telescope gyroscopes and spectrographs.',
    status: 'ACTIVE',
    primaryTarget: 'Low Earth Orbit Power Generation',
  },
  'saturn-s1c': {
    name: 'Saturn V S-IC Booster Stage (5x Rocketdyne F-1)',
    code: 'S-IC',
    category: 'Heavy-Lift First Stage',
    power: '34.5 MN (7.75 million lbf) liftoff thrust',
    mass: '2,280,000 kg fully fueled',
    scientificFunction: 'Consumed 15 tons of RP-1 kerosene and LOX per second to propel the 3,000-ton vehicle to 67 km altitude in 168 seconds.',
    status: 'ARCHIVED',
    primaryTarget: 'Trans-Orbital Injection Booster',
  },
  'apollo-csm': {
    name: 'Apollo Command & Service Module (CSM Columbia)',
    code: 'CSM-107',
    category: 'Trans-Lunar Spacecraft & Heat Shield',
    mass: '28,800 kg combined',
    power: 'SPS Engine (91 kN thrust) + 3 Fuel Cells',
    scientificFunction: 'Maintained lunar orbital science operations and protected returning astronauts through 11 km/s atmospheric re-entry.',
    status: 'ARCHIVED',
    primaryTarget: 'Trans-Lunar Cruise & Atmospheric Re-entry',
  },
  'hls-crew-cabin': {
    name: 'Starship HLS Pressurized Crew Compartment',
    code: 'HLS-CABIN',
    category: 'Artemis Crew Habitat',
    dimensions: '9 m diameter × 10 m height (200 m³ volume)',
    power: '40 kW continuous solar bus',
    scientificFunction: 'Houses 4 Artemis astronauts for up to 30 days of surface operations at the lunar south pole.',
    status: 'ACTIVE',
    primaryTarget: 'Artemis Polar Human Mission',
  },
  'hls-elevator': {
    name: 'Astronaut Surface Access Elevator System',
    code: 'HLS-LIFT',
    category: 'Surface Egress & Cargo Hoist',
    dimensions: '30 m vertical guide cable run',
    power: 'Redundant dual DC winch motors',
    scientificFunction: 'Transports suited astronauts, lunar rovers, and scientific drilling gear from crew airlock down to regolith.',
    status: 'ACTIVE',
    primaryTarget: 'Surface EVA Deployment',
  },
  'hls-solar-wrap': {
    name: 'Avionics & Photovoltaic Solar Array Wrap',
    code: 'HLS-SOLAR',
    category: 'Primary Power Generation',
    power: '100 kW high-efficiency triple-junction cells',
    dimensions: '360° circumferential body wrap',
    scientificFunction: 'Continuous power generation designed for low-angle grazing solar illumination at lunar south pole.',
    status: 'ACTIVE',
    primaryTarget: 'Polar Low-Sun Power Harvesting',
  },
  'hls-landing-legs': {
    name: 'Heavy Wide-Stance Lunar Landing Gear',
    code: 'HLS-GEAR',
    category: 'Touchdown Dynamic Attenuation',
    dimensions: '6 articulated wide-stance struts (15m span)',
    mass: 'Crushable aluminum honeycomb cartridges',
    scientificFunction: 'Stabilizes the 100-ton vehicle on up to 15° lunar slopes, craters, and uneven regolith.',
    status: 'ACTIVE',
    primaryTarget: 'Polar South Slope Touchdown',
  },
  'hls-raptor-engines': {
    name: 'Raptor 2 Deep-Throttling Methalox Rocket Engines',
    code: 'RAPTOR-2',
    category: 'Staged-Combustion Cryogenic Propulsion',
    power: '230 tons-force (2,255 kN) thrust each',
    dimensions: '3 RVac + 3 Sea-Level engines',
    scientificFunction: 'Burns liquid methane & liquid oxygen (CH₄/LOX) with continuous deep throttling down to 40% for soft polar landing.',
    status: 'ACTIVE',
    primaryTarget: 'Lunar Descent & Trans-Earth Ascent',
  },
  'lunar-habitat': {
    name: 'Artemis Base Camp Inflatable Habitat Dome',
    code: 'CAMP-HAB',
    category: 'Surface Expeditionary Habitat',
    dimensions: '12 m diameter inflatable dome',
    mass: '6,200 kg launch mass',
    scientificFunction: 'Multi-year pressurized base with regolith radiation shielding, life support, and biological laboratory.',
    status: 'ACTIVE',
    primaryTarget: 'Long-Duration Lunar Base Camp',
  },
  'ladee-ldex': {
    name: 'Lunar Dust Experiment (LDEX)',
    code: 'LDEX',
    category: 'Impact Ionization Dust Detector',
    mass: '3.6 kg',
    power: '6 W',
    scientificFunction: 'Detected high-altitude clouds of sub-micron lunar dust lofted by interplanetary meteoroid bombardment.',
    status: 'ARCHIVED',
    primaryTarget: 'Exospheric Lunar Dust Shell',
  },
  'ladee-nms': {
    name: 'Neutral Mass Spectrometer (NMS)',
    code: 'NMS',
    category: 'Exospheric Gas Quadrupole Spectrometer',
    mass: '11.3 kg',
    power: '32 W',
    scientificFunction: 'Sampled tenuous lunar exosphere species including Helium, Argon-40, and atomic Potassium.',
    status: 'ARCHIVED',
    primaryTarget: 'Lunar Exosphere Gas Density',
  },
  'ladee-llcd': {
    name: 'Lunar Laser Communication Demonstration (LLCD)',
    code: 'LLCD',
    category: 'Pulsed Infrared Optical Laser Comm',
    wavelength: '1550 nm infrared laser',
    power: '0.5 W optical transmitter',
    scientificFunction: 'Historic breakthrough downlinking 622 Mbps duplex error-free data from lunar orbit to Earth.',
    status: 'ARCHIVED',
    primaryTarget: 'Pulsed Laser Optical Communications',
  },
  'rotor-system': {
    name: 'Coaxial Carbon-Fiber Rotor System (2,537 RPM)',
    code: 'ROTOR',
    category: 'Extraterrestrial Powered Flight',
    power: '350 W dual brushless motor stage',
    mass: '1.8 kg total helicopter',
    dimensions: '1.2 m blade span',
    scientificFunction: 'Counter-rotating 1.2m carbon-fiber blades spinning up to 2,537 RPM to generate lift in 1% Mars atmosphere.',
    status: 'ARCHIVED',
    primaryTarget: 'Thin CO₂ Aerodynamic Lift',
  },
  'hls-astronaut': {
    name: 'Axiom Exploration Extravehicular Mobility Unit (AxEMU)',
    code: 'AxEMU',
    category: 'Lunar South Pole Surface Suit',
    power: '78 Wh Li-Ion PLSS battery',
    mass: '55 kg lunar weight (~1/6 g)',
    scientificFunction: 'Next-gen articulated lunar pressure suit with regenerative CO₂ scrubbing and PSR thermal boots.',
    status: 'ACTIVE',
    primaryTarget: 'Shackleton Crater EVA Mobility',
  },
  'hls-antenna': {
    name: 'LunaNet Ka-Band Polar Surface Relay Tower',
    code: 'DSN-Ka',
    category: 'Deep Space Surface Telemetry',
    wavelength: '32 GHz Ka-band & S-band relay',
    power: '180 W solar/battery mast',
    dimensions: '18 m deployable carbon boom',
    scientificFunction: 'High-rate lunar south pole relay bridging HLS crew telemetry, HD science streams, and PNT timing to Earth.',
    status: 'ACTIVE',
    primaryTarget: 'Lunar South Pole Comms Relay',
  },
};

export interface MissionHotspotRef {
  id: string;
  code: string;
  label: string;
}

const MISSION_PIN_REGISTRY: Record<string, string[]> = {
  perseverance: ['supercam', 'moxie', 'pixl', 'rimfax', 'ingenuity'],
  ingenuity: ['rotor-system'],
  curiosity: ['curiosity-chassis', 'chemcam', 'mastcam', 'apxs'],
  insight: ['seis', 'hp3', 'solar-arrays', 'arm'],
  viking: ['viking-rtg', 'viking-sampler'],
  mro: ['hirise', 'mro-dish'],
  apollo11: [
    'eagle-descent-stage',
    'apollo-ascent-stage',
    'apollo-landing-gear',
    'lunar-laser-retro',
    'lunar-antenna',
    'apollo-astronaut',
  ],
  apollo15: ['apollo15-lrv', 'lrv-antenna', 'lrv-camera', 'apollo15-drill', 'lrv-astronaut'],
  apollo17: ['orange-soil-sampler', 'apollo17-lrv', 'apollo-astronaut', 'lunar-antenna'],
  chandrayaan3: ['vikram-lander', 'pragyan-rover', 'chaste-probe', 'rambha-plasma'],
  change4: ['yutu2-rover', 'lpr-radar'],
  surveyor3: ['surveyor3-sampler', 'surveyor3-tv'],
  lro: ['lroc-camera', 'diviner-radiometer'],
  ladee: ['ladee-ldex', 'ladee-nms', 'ladee-llcd'],
  artemis3: [
    'hls-crew-cabin',
    'hls-elevator',
    'hls-solar-wrap',
    'hls-landing-legs',
    'hls-raptor-engines',
    'lunar-habitat',
    'hls-astronaut',
    'hls-antenna',
  ],
  saturn5: ['saturn-s1c', 'apollo-csm'],
  jwst: ['jwst-mirror', 'jwst-sunshield', 'jwst-nircam'],
  hubble: ['hubble-primary-mirror', 'hubble-solar-arrays'],
  iss: ['iss-solar', 'iss-lab', 'iss-cupola'],
  voyager: ['voyager-dish', 'golden-record'],
  habitat: ['lunar-habitat', 'lunar-antenna', 'apollo15-lrv', 'apollo-astronaut'],
};

/**
 * Returns the exact ordered subsystem pins rendered in 3D for the current spacecraft,
 * so HUD navigation steppers stay synchronized with the WebGL pins.
 */
export function getMissionPinSequence(missionId?: string, modelType?: string): MissionHotspotRef[] {
  const mKey = (missionId || '').toLowerCase();
  const mt = (modelType || '').toLowerCase();

  let key = mKey;
  if (!MISSION_PIN_REGISTRY[key]) {
    if (mt.includes('curiosity') || mt === 'chemcam' || mt.includes('msl')) key = 'curiosity';
    else if (mt.includes('insight') || mt === 'seis') key = 'insight';
    else if (mt.includes('viking')) key = 'viking';
    else if (mt.includes('mro') || mt === 'hirise') key = 'mro';
    else if (mt === 'helicopter-ingenuity') key = 'ingenuity';
    else if (mt.includes('perseverance') || mt === 'supercam') key = 'perseverance';
    else if (mt.includes('starship') || mt.includes('hls') || mt.includes('artemis')) key = 'artemis3';
    else if (mt.includes('chandrayaan') || mt.includes('vikram')) key = 'chandrayaan3';
    else if (mt.includes('apollo17')) key = 'apollo17';
    else if (mt.includes('apollo15') || mt.includes('lrv')) key = 'apollo15';
    else if (mt.includes('change4') || mt.includes('yutu')) key = 'change4';
    else if (mt.includes('surveyor')) key = 'surveyor3';
    else if (mt.includes('lro') || mt === 'lroc-camera') key = 'lro';
    else if (mt.includes('ladee')) key = 'ladee';
    else if (mt.includes('saturn')) key = 'saturn5';
    else if (mt.includes('habitat')) key = 'habitat';
    else if (mt.includes('jwst')) key = 'jwst';
    else if (mt.includes('hubble')) key = 'hubble';
    else if (mt.includes('iss')) key = 'iss';
    else if (mt.includes('voyager')) key = 'voyager';
    else key = 'apollo11';
  }

  return (MISSION_PIN_REGISTRY[key] || []).map((id) => {
    const rec = NASA_SUBSYSTEM_DATABASE[id];
    return {
      id,
      code: rec?.code || id.toUpperCase().slice(0, 6),
      label: rec?.name || id,
    };
  });
}

// Lightweight external hover store so hovering pins never triggers parent Canvas/Camera re-renders
let _hoveredPinId: string | null = null;
let _hoverSuppressUntil = 0;
const _hoverListeners = new Set<() => void>();

function emitPinHover() {
  _hoverListeners.forEach((cb) => cb());
}

export function setHoveredPin(
  id: string | null,
  expectedId?: string,
  hasActivePin = false
) {
  if (id === null) {
    if (expectedId && _hoveredPinId !== expectedId) return;
    if (_hoveredPinId !== null) {
      _hoveredPinId = null;
      emitPinHover();
    }
    return;
  }
  if (hasActivePin || performance.now() < _hoverSuppressUntil) return;
  if (_hoveredPinId !== id) {
    _hoveredPinId = id;
    emitPinHover();
  }
}

export function clearHoveredPin(suppressMs = 0) {
  if (suppressMs > 0) {
    _hoverSuppressUntil = performance.now() + suppressMs;
  }
  if (_hoveredPinId !== null) {
    _hoveredPinId = null;
    emitPinHover();
  }
}

function useIsPinHovered(id: string): boolean {
  return React.useSyncExternalStore(
    (cb) => {
      _hoverListeners.add(cb);
      return () => {
        _hoverListeners.delete(cb);
      };
    },
    () => _hoveredPinId === id,
    () => false
  );
}

const PIN_Z_IDLE: [number, number] = [20, 0];
const PIN_Z_HOVER: [number, number] = [60, 30];
const PIN_Z_ACTIVE: [number, number] = [120, 80];

// Shared HUD action context injected around craft scenes so active 3D pins offer dismiss, specs, and stepping actions
export interface PinHudContextValue {
  onDismiss?: () => void;
  onInspectSpecs?: () => void;
  onCycle?: (dir: -1 | 1) => void;
  activeIndex?: number;
  totalPins?: number;
}

export const PinHudContext = React.createContext<PinHudContextValue | null>(null);

// Crisp Screen-Space Reticle Pin (stable zero-jump layout, semi-transparent glass pills, matching .hud-card panels)
export interface CyberHotspotPinProps {
  id: string;
  activeId?: string;
  label: string;
  code: string;
  color?: 'cyan' | 'amber' | 'emerald' | 'purple' | 'blue';
  position: [number, number, number];
  onClick: (id: string, e?: any) => void;
}

export const CyberHotspotPin: React.FC<CyberHotspotPinProps> = ({
  id,
  activeId,
  label,
  code,
  color = 'cyan',
  position,
  onClick,
}) => {
  const hovered = useIsPinHovered(id);
  const hudCtx = useContext(PinHudContext);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [cardPlacement, setCardPlacement] = useState<{ openBelow: boolean; shiftX: number }>({
    openBelow: false,
    shiftX: 0,
  });

  const hasAnyActive = Boolean(activeId);
  const isActive = activeId === id;
  const showHoverChip = hovered && !hasAnyActive;

  const dbData = NASA_SUBSYSTEM_DATABASE[id];
  const displayTitle = dbData?.name || label;
  const displayCode = dbData?.code || code;

  const colorStyles = {
    cyan: {
      dot: 'bg-cyan-400',
      text: 'text-cyan-200',
    },
    amber: {
      dot: 'bg-amber-400',
      text: 'text-amber-200',
    },
    emerald: {
      dot: 'bg-emerald-400',
      text: 'text-emerald-200',
    },
    purple: {
      dot: 'bg-purple-400',
      text: 'text-purple-200',
    },
    blue: {
      dot: 'bg-blue-400',
      text: 'text-blue-200',
    },
  }[color];

  useLayoutEffect(() => {
    if (!isActive && !showHoverChip) return;
    const measure = () => {
      const el = anchorRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cardHalfW = isActive ? 152 : 136;
      const minPad = 16;
      const centerX = rect.left + rect.width / 2;
      let shiftX = 0;
      if (centerX - cardHalfW < minPad) {
        shiftX = minPad - (centerX - cardHalfW);
      } else if (centerX + cardHalfW > window.innerWidth - minPad) {
        shiftX = window.innerWidth - minPad - (centerX + cardHalfW);
      }
      const neededAbove = isActive ? 275 : 74;
      const openBelow = rect.top < neededAbove && window.innerHeight - rect.bottom - 96 > rect.top;
      setCardPlacement((prev) =>
        prev.openBelow === openBelow && Math.abs(prev.shiftX - shiftX) < 2
          ? prev
          : { openBelow, shiftX: Math.round(shiftX) }
      );
    };

    measure();
    const settleTimer = isActive ? window.setTimeout(measure, 360) : undefined;
    window.addEventListener('resize', measure);
    return () => {
      if (settleTimer !== undefined) clearTimeout(settleTimer);
      window.removeEventListener('resize', measure);
    };
  }, [isActive, showHoverChip]);

  const compactMetrics: string[] = [];
  if (dbData?.wavelength) compactMetrics.push(`λ: ${dbData.wavelength}`);
  if (dbData?.power) compactMetrics.push(dbData.power);
  if (dbData?.mass) compactMetrics.push(dbData.mass);
  if (dbData?.dimensions && compactMetrics.length < 3) compactMetrics.push(dbData.dimensions);

  return (
    <Html
      position={position}
      center
      zIndexRange={isActive ? PIN_Z_ACTIVE : showHoverChip ? PIN_Z_HOVER : PIN_Z_IDLE}
    >
      <div
        ref={anchorRef}
        className="relative inline-flex items-center justify-center select-none pointer-events-none w-max whitespace-nowrap"
      >
        {/* Minimal Single-Line Translucent Glass Hover Pill (strictly out-of-flow absolute, never overlaps active cards) */}
        {showHoverChip && (
          <div
            style={{ transform: `translateX(calc(-50% + ${cardPlacement.shiftX}px))` }}
            className={`pointer-events-none absolute left-1/2 ${
              cardPlacement.openBelow ? 'top-full mt-2' : 'bottom-full mb-2'
            } rounded-full px-3 py-1 whitespace-nowrap z-30 bg-[#090E1A]/80 backdrop-blur-md border border-white/20 shadow-[0_8px_24px_rgba(0,0,0,0.55)]`}
          >
            <div className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${colorStyles.dot}`} />
              <span className="text-[11px] font-medium text-slate-100 max-w-[250px] truncate">
                {displayTitle}
              </span>
            </div>
          </div>
        )}

        {/* Active Telemetry Card (.hud-card kept strictly inside non-absolute wrapper so CSS position never conflicts) */}
        {isActive && (
          <div
            style={{ transform: `translateX(calc(-50% + ${cardPlacement.shiftX}px))` }}
            onPointerDown={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            className={`pointer-events-auto absolute left-1/2 ${
              cardPlacement.openBelow ? 'top-full mt-1.5' : 'bottom-full mb-1.5'
            } flex flex-col items-center z-50`}
          >
            {cardPlacement.openBelow && (
              <span className="w-px h-2.5 bg-white/30" aria-hidden="true" />
            )}
            <div className="w-[276px] sm:w-[292px] whitespace-normal rounded-2xl hud-card hud-card-featured text-left animate-fade-in">
              {/* Compact Header */}
              <div className="px-3.5 pt-3 pb-2 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="px-2 py-0.5 rounded-md hud-badge text-[10px] font-mono font-semibold tracking-[0.12em] flex-shrink-0">
                      {displayCode}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-300/90 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-beacon flex-shrink-0" />
                      <span className="truncate uppercase tracking-[0.08em]">
                        {dbData?.status || 'ACTIVE'}
                      </span>
                    </span>
                  </div>
                  <button
                    type="button"
                    aria-label="Release subsystem focus"
                    title="Release focus (Esc)"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearHoveredPin(500);
                      if (hudCtx?.onDismiss) hudCtx.onDismiss();
                      else onClick(id, e);
                    }}
                    className="w-6 h-6 rounded-full hud-well hover:border-[var(--accent-border)] flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="hud-deck-rule" aria-hidden="true" />
              </div>

              {/* Instrument Title, Target & Concise Telemetry Chips */}
              <div className="px-3.5 pb-2.5 space-y-2">
                <div>
                  <h3 className="font-orbitron text-xs font-bold uppercase tracking-[0.04em] text-white leading-snug">
                    {displayTitle}
                  </h3>
                  {dbData?.primaryTarget && (
                    <span className="block mt-1 text-[10px] font-mono uppercase tracking-[0.1em] text-[var(--accent-text)] leading-snug">
                      TARGET // {dbData.primaryTarget}
                    </span>
                  )}
                </div>

                {compactMetrics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {compactMetrics.slice(0, 3).map((metric) => (
                      <span
                        key={metric}
                        className="px-2 py-0.5 rounded-md hud-well text-[10px] font-mono text-slate-200"
                      >
                        {metric}
                      </span>
                    ))}
                  </div>
                )}

                {dbData?.scientificFunction && (
                  <p className="text-[11.5px] text-slate-300 leading-relaxed line-clamp-3">
                    {dbData.scientificFunction}
                  </p>
                )}
              </div>

              {/* Action Footer */}
              <div className="px-3 py-2 bg-white/[0.025] border-t border-white/[0.08] flex items-center justify-between gap-2">
                {hudCtx?.onCycle && (hudCtx.totalPins ?? 0) > 1 ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearHoveredPin(500);
                        hudCtx.onCycle?.(-1);
                      }}
                      aria-label="Previous pin"
                      className="p-1 rounded-lg bg-slate-900/75 border border-white/[0.08] hover:border-white/25 text-slate-200 hover:text-white transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10.5px] font-mono text-slate-300 px-1.5 tabular-nums">
                      {(hudCtx.activeIndex ?? 0) + 1}/{hudCtx.totalPins}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearHoveredPin(500);
                        hudCtx.onCycle?.(1);
                      }}
                      aria-label="Next pin"
                      className="p-1 rounded-lg bg-slate-900/75 border border-white/[0.08] hover:border-white/25 text-slate-200 hover:text-white transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Telemetry locked
                  </span>
                )}

                {hudCtx?.onInspectSpecs && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      hudCtx.onInspectSpecs?.();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[var(--accent-surface)] border border-[var(--accent-border)] text-[11px] font-medium text-white hover:brightness-115 transition-all inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Info className="w-3 h-3" />
                    <span>Full Specs</span>
                  </button>
                )}
              </div>
            </div>
            {!cardPlacement.openBelow && (
              <span className="w-px h-2.5 bg-white/30" aria-hidden="true" />
            )}
          </div>
        )}

        {/* Semi-Transparent Frosted Pin Pill (stationary geometry, zero transform/scale jumping) */}
        <button
          type="button"
          aria-label={`Inspect ${displayTitle}`}
          aria-pressed={isActive}
          onPointerEnter={(e) => {
            if (e.pointerType === 'touch') return;
            setHoveredPin(id, undefined, hasAnyActive);
          }}
          onPointerLeave={() => setHoveredPin(null, id)}
          onClick={(e) => {
            e.stopPropagation();
            clearHoveredPin(500);
            onClick(id, e);
          }}
          style={
            isActive
              ? {
                  borderColor: 'var(--accent-border)',
                  boxShadow: '0 0 14px var(--accent-glow), 0 6px 18px rgba(0, 0, 0, 0.55)',
                }
              : undefined
          }
          className={`pointer-events-auto relative h-[24px] px-2.5 rounded-full inline-flex items-center gap-1.5 whitespace-nowrap border backdrop-blur-md transition-[background-color,border-color,opacity] duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            isActive
              ? 'bg-[#090E1A]/80 opacity-100 shadow-lg'
              : hovered
                ? 'bg-[#090E1A]/75 border-white/40 opacity-100 shadow-md'
                : hasAnyActive
                  ? 'bg-[#090E1A]/45 border-white/15 opacity-50 hover:bg-[#090E1A]/75 hover:opacity-100'
                  : 'bg-[#090E1A]/55 border-white/20 hover:bg-[#090E1A]/75 hover:border-white/35 opacity-95 shadow-sm'
          }`}
        >
          <span className="relative flex h-2 w-2 items-center justify-center flex-shrink-0">
            {isActive && (
              <span
                className={`absolute inline-flex h-3 w-3 rounded-full ${colorStyles.dot} opacity-45 animate-ping`}
              />
            )}
            <span className={`relative inline-flex h-2 w-2 rounded-full ${colorStyles.dot}`} />
          </span>
          <span
            className={`text-[10px] font-mono font-semibold tracking-[0.06em] leading-none whitespace-nowrap ${
              isActive || hovered ? 'text-white' : colorStyles.text
            }`}
          >
            {displayCode}
          </span>
        </button>
      </div>
    </Html>
  );
};

// Sleek wireframe placeholder while heavy 3D GLB assets stream in
function HardwareFallback({ label }: { label: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.1);
    if (meshRef.current) {
      meshRef.current.rotation.y += dt * 0.7;
    }
  });
  return (
    <group position={[0, 1.0, 0]}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.9, 1]} />
        <meshBasicMaterial color="#38bdf8" wireframe opacity={0.38} transparent />
      </mesh>
      <Html position={[0, 1.3, 0]} center zIndexRange={[20, 0]}>
        <div className="px-3 py-1.5 rounded-xl hud-card border-cyan-400/35 text-xs text-slate-100 font-mono whitespace-nowrap flex items-center gap-2 shadow-xl">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Streaming 3D: {label}...</span>
        </div>
      </Html>
    </group>
  );
}

// 🚀 REAL OFFICIAL NASA 3D HARDWARE GLB LOADER WITH BOUNDING-BOX NORMALIZATION & EXPLODED VIEW
function NASAHardwareGLBInner({
  modelPath,
  scale = 1,
  targetSize,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  explodedFactor = 0,
}: {
  modelPath: string;
  scale?: number;
  targetSize?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  explodedFactor?: number;
}) {
  const { scene } = useGLTF(modelPath, '/draco/');
  const rootGroupRef = useRef<THREE.Group>(null);

  const { cloned, upperMeshes, lowerMeshes, initialPositions, effectiveScale, clonedMaterials } = useMemo(() => {
    const c = scene.clone(true);

    const toRemove: THREE.Object3D[] = [];
    const lowerModelPath = modelPath.toLowerCase();
    const forceThinDoubleSide =
      lowerModelPath.includes('jwst') ||
      lowerModelPath.includes('hubble') ||
      lowerModelPath.includes('voyager') ||
      lowerModelPath.includes('lro') ||
      lowerModelPath.includes('ladee') ||
      lowerModelPath.includes('ingenuity') ||
      lowerModelPath.includes('iss');

    c.traverse((node) => {
      const name = (node.name || '').toLowerCase();
      const isMesh = (node as THREE.Mesh).isMesh;
      const isLightOrCam = node.type.includes('Camera') || node.type.includes('Light');
      const isEmptyEnvNode =
        !isMesh &&
        (name === 'camera' || name === 'sun' || name === 'sky' || name.startsWith('hemi'));
      const isJunkPlane =
        name.includes('plane003') ||
        name.includes('untitled.002') ||
        name.includes('untitled.004') ||
        name.includes('unseen') ||
        name.endsWith('_arrow') ||
        name.includes('arc_arrow');

      let hasHelperMat = false;
      if (isMesh) {
        const meshMat = (node as THREE.Mesh).material;
        const mats: THREE.Material[] = Array.isArray(meshMat) ? meshMat : [meshMat];
        hasHelperMat = mats.some((m) => {
          const mName = (m?.name || '').toLowerCase();
          return mName.includes('arc_arrow');
        });
      }

      if (isLightOrCam || isEmptyEnvNode || isJunkPlane || hasHelperMat) {
        toRemove.push(node);
      }
    });
    toRemove.forEach((obj) => obj.parent && obj.parent.remove(obj));

    const upper: THREE.Object3D[] = [];
    const lower: THREE.Object3D[] = [];
    const matsToDispose: THREE.Material[] = [];

    // Traverse and configure materials, sRGB albedo color space, vertex normals, PBR polish, and shadows
    if (lowerModelPath.includes('iss')) {
      upgradeISSStationHierarchy(c, matsToDispose);
    } else {
      c.traverse((node) => {
        if ((node as THREE.Mesh).isMesh) {
          const mesh = node as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          // Synthesize vertex normals when GLB geometry omits NORMAL attribute (e.g. insight.glb)
          if (mesh.geometry && !mesh.geometry.attributes.normal) {
            mesh.geometry.computeVertexNormals();
          }

          if (mesh.material) {
            const origMats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            const upgraded = origMats.map((orig) => {
              const m = orig.clone();
              const mName = (m.name || '').toLowerCase();

              // Preserve original DoubleSide OR enforce DoubleSide on thin foil/solar observatories
              m.side =
                forceThinDoubleSide || orig.side === THREE.DoubleSide
                  ? THREE.DoubleSide
                  : THREE.FrontSide;

              // Optical/transparent lens & helper glass handling (avoid depth buffer punching holes)
              if (mName === 'transparent' || mName.includes('glass_trans') || mName === 'glass_2') {
                m.transparent = true;
                m.opacity = mName === 'transparent' ? 0.14 : 0.34;
                m.depthWrite = false;
              } else {
                m.depthWrite = !(m.transparent && m.opacity < 0.96);
              }

              if ((m as THREE.MeshStandardMaterial).map) {
                const std = m as THREE.MeshStandardMaterial;
                std.map!.colorSpace = THREE.SRGBColorSpace;
                std.map!.needsUpdate = true;

                if (std.metalnessMap) {
                  std.roughness = Math.min(std.roughness, 0.84);
                  std.envMapIntensity = lowerModelPath.includes('jwst') ? 1.35 : 1.18;
                } else if (std.metalness >= 0.92 && std.roughness >= 0.85) {
                  if (lowerModelPath.includes('jwst') || lowerModelPath.includes('voyager')) {
                    std.metalness = 0.48;
                    std.roughness = 0.34;
                  } else {
                    std.metalness = 0.26;
                    std.roughness = 0.44;
                  }
                }
              } else {
                polishUntexturedHardwareMaterial(m);
              }
              m.needsUpdate = true;
              matsToDispose.push(m);
              return m;
            });
            mesh.material = Array.isArray(mesh.material) ? upgraded : upgraded[0];
          }
        }
      });
    }

    // Compute accurate bounding box across remaining geometry, center X/Z, and ground min.y at 0
    const box = new THREE.Box3().setFromObject(c);
    let computedScale = scale;
    if (!box.isEmpty() && isFinite(box.min.y)) {
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      box.getCenter(center);
      box.getSize(size);
      c.position.x = -center.x;
      c.position.z = -center.z;
      c.position.y = -box.min.y;

      const maxDim = Math.max(size.x, size.y, size.z);
      if (targetSize && targetSize > 0 && maxDim > 0 && isFinite(maxDim)) {
        computedScale = targetSize / maxDim;
      }
    }

    const midY = !box.isEmpty() ? (box.max.y - box.min.y) * 0.45 : 0.5;
    const initPos = new Map<THREE.Object3D, { x: number; y: number; z: number }>();

    // Classify sub-meshes for exploded separation
    c.traverse((node) => {
      if (node !== c && (node as THREE.Mesh).isMesh) {
        initPos.set(node, { x: node.position.x, y: node.position.y, z: node.position.z });
        const meshBox = new THREE.Box3().setFromObject(node);
        const name = (node.name || '').toLowerCase();
        if (
          meshBox.min.y > midY ||
          name.includes('ascent') ||
          name.includes('cabin') ||
          name.includes('mast') ||
          name.includes('supercam') ||
          name.includes('chemcam') ||
          name.includes('antenna') ||
          name.includes('head')
        ) {
          upper.push(node);
        } else {
          lower.push(node);
        }
      }
    });

    return {
      cloned: c,
      upperMeshes: upper,
      lowerMeshes: lower,
      initialPositions: initPos,
      effectiveScale: computedScale,
      clonedMaterials: matsToDispose,
    };
  }, [scene, modelPath, scale, targetSize]);

  useEffect(() => {
    return () => {
      clonedMaterials.forEach((m) => m.dispose());
    };
  }, [clonedMaterials]);

  // Apply real-time 3D exploded separation only when explodedFactor or mesh refs change
  useEffect(() => {
    const invScale = 1 / Math.max(effectiveScale, 0.01);
    const factor = explodedFactor ?? 0;
    if (upperMeshes.length > 0) {
      const liftY = factor * 1.6 * invScale;
      upperMeshes.forEach((mesh) => {
        const init = initialPositions.get(mesh);
        if (init) mesh.position.y = init.y + liftY;
      });
    }
    if (lowerMeshes.length > 0) {
      const padShift = factor * 0.32 * invScale;
      lowerMeshes.forEach((mesh) => {
        const init = initialPositions.get(mesh);
        if (init && init.x !== 0) {
          mesh.position.x = init.x + Math.sign(init.x) * padShift;
        }
      });
    }
  }, [explodedFactor, effectiveScale, upperMeshes, lowerMeshes, initialPositions]);

  return (
    <group
      ref={rootGroupRef}
      position={position}
      rotation={rotation}
      scale={[effectiveScale, effectiveScale, effectiveScale]}
    >
      <primitive object={cloned} />
    </group>
  );
}

function NASAHardwareGLB(props: {
  modelPath: string;
  scale?: number;
  targetSize?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  explodedFactor?: number;
}) {
  const modelName = props.modelPath.split('/').pop() || 'NASA Hardware';
  return (
    <CanvasErrorBoundary is3DChild={true} fallback={<HardwareFallback label={modelName} />}>
      <NASAHardwareGLBInner key={props.modelPath} {...props} />
    </CanvasErrorBoundary>
  );
}

// Gentle frame-rate-independent zero-G flight stabilization for orbital probes and satellites
function OrbitalFloatGroup({
  baseY = 1.0,
  amplitude = 0.06,
  children,
}: {
  baseY?: number;
  amplitude?: number;
  children: React.ReactNode;
}) {
  const floatRef = useRef<THREE.Group>(null);
  const phaseRef = useRef(0);

  useFrame((_, delta) => {
    phaseRef.current += Math.min(delta, 0.1) * 0.75;
    if (floatRef.current) {
      floatRef.current.position.y = baseY + Math.sin(phaseRef.current) * amplitude;
      floatRef.current.position.z = Math.cos(phaseRef.current * 0.42) * 0.035;
      floatRef.current.rotation.z = Math.sin(phaseRef.current * 0.55) * 0.028;
      floatRef.current.rotation.x = Math.cos(phaseRef.current * 0.45) * 0.022;
      floatRef.current.rotation.y = Math.sin(phaseRef.current * 0.25) * 0.045;
    }
  });

  return (
    <group ref={floatRef} position={[0, baseY, 0]}>
      {children}
    </group>
  );
}

// 👨‍🚀 AUTHENTIC ANIMATED APOLLO ASTRONAUT COMPONENT (Tripo 3D Animated)
function AnimatedAstronautInner({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 0.68,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('/models/tripo_astronaut_2_stylized_and_animated.glb', '/draco/');

  // Deep clone skinned mesh & skeleton hierarchy + clone materials cleanly
  const { clonedScene, clonedMaterials } = useMemo(() => {
    const cloned = cloneSkeleton(scene);
    const toRemove: THREE.Object3D[] = [];
    const matsToDispose: THREE.Material[] = [];

    cloned.traverse((node) => {
      if (node.type.includes('Camera') || node.type.includes('Light')) {
        toRemove.push(node);
      }
    });
    toRemove.forEach((obj) => obj.parent?.remove(obj));

    cloned.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mesh.material) {
          const origMats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          const nextMats = origMats.map((orig) => {
            const m = orig.clone();
            m.depthWrite = true;
            if ((m as THREE.MeshStandardMaterial).map) {
              (m as THREE.MeshStandardMaterial).map!.colorSpace = THREE.SRGBColorSpace;
              (m as THREE.MeshStandardMaterial).map!.needsUpdate = true;
            }
            m.needsUpdate = true;
            matsToDispose.push(m);
            return m;
          });
          mesh.material = Array.isArray(mesh.material) ? nextMats : nextMats[0];
        }
      }
    });
    return { clonedScene: cloned, clonedMaterials: matsToDispose };
  }, [scene]);

  useEffect(() => {
    return () => {
      clonedMaterials.forEach((m) => m.dispose());
    };
  }, [clonedMaterials]);

  const { actions, names } = useAnimations(animations, groupRef);

  useEffect(() => {
    const action = names.length > 0 ? actions[names[0]] : null;
    if (!action) return;
    action.reset().fadeIn(0.4).play();
    return () => {
      action.fadeOut(0.2);
    };
  }, [actions, names]);

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={[scale, scale, scale]}>
      <primitive object={clonedScene} />
    </group>
  );
}

function AnimatedAstronaut(props: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  return (
    <CanvasErrorBoundary is3DChild={true} fallback={null}>
      <AnimatedAstronautInner {...props} />
    </CanvasErrorBoundary>
  );
}

export const Rover3DModel: React.FC<Rover3DModelProps> = ({
  modelType,
  missionId,
  onSelectHotspot,
  activeHotspotId,
  isMars = true,
  isMoon = false,
  showHotspots = true,
  explodedFactor = 0,
  autoRotate = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const upperRotorRef = useRef<THREE.Group>(null);
  const mKey = (missionId || '').toLowerCase();

  // Smooth idle rotation for 360 exhibition
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += dt * 0.05;
    }
    if (upperRotorRef.current) {
      upperRotorRef.current.rotation.y += dt * 12;
    }
  });

  const handleHotspot = (id: string, e?: any) => {
    if (e && e.stopPropagation) e.stopPropagation();
    soundFx.playClick();
    soundFx.playChirp();
    if (onSelectHotspot) onSelectHotspot(id);
  };

  // Authoritative hardware & mission categorization — ensures distinct authentic craft per mission
  const isJWST = modelType.includes('jwst') || modelType.includes('webb') || mKey === 'jwst';
  const isHubble = modelType.includes('hubble') || mKey === 'hubble';
  const isISS = modelType.includes('iss') || modelType.includes('space-station') || mKey === 'iss';
  const isMRO = modelType.includes('mro') || modelType.includes('orbiter-mars') || mKey === 'mro';
  const isVoyager = modelType.includes('voyager') || mKey === 'voyager';
  const isLRO = modelType.includes('lro') || modelType === 'lroc-camera' || mKey === 'lro';
  const isLADEE = modelType.includes('ladee') || mKey === 'ladee';
  const isSaturnRocket = modelType === 'rocket-saturn' || modelType.includes('saturn');

  // MARS HARDWARE
  const isCuriosity = isMars && !isMRO && (
    modelType.includes('curiosity') || modelType === 'chemcam' || modelType.includes('msl') || mKey === 'curiosity'
  );
  const isInSight = isMars && !isMRO && (
    modelType.includes('insight') || modelType.includes('seis') || modelType.includes('hp3') || mKey === 'insight'
  );
  const isViking = isMars && !isMRO && (
    modelType.includes('viking') || modelType.includes('lander-mars') || mKey === 'viking'
  );
  const isHelicopter = isMars && !isMRO && modelType === 'helicopter-ingenuity' && mKey !== 'perseverance';
  const isPerseverance =
    isMars && !isCuriosity && !isInSight && !isViking && !isHelicopter && !isMRO && !isJWST && !isHubble && !isISS && !isVoyager && !isSaturnRocket;

  // LUNAR HARDWARE
  const isStarshipHLS = isMoon && (
    modelType.includes('starship') ||
    modelType.includes('artemis') ||
    modelType.includes('hls') ||
    mKey === 'artemis3'
  );

  const isLunarHabitat = isMoon && !isStarshipHLS && (
    modelType.includes('habitat') ||
    modelType.includes('base-camp')
  );

  const isChandrayaan3 = isMoon && !isStarshipHLS && !isLRO && !isLADEE && (
    modelType.includes('chandrayaan') ||
    modelType.includes('vikram') ||
    modelType.includes('pragyan') ||
    modelType.includes('isro') ||
    mKey === 'chandrayaan3'
  );

  const isApollo17 = isMoon && !isStarshipHLS && !isLRO && !isLADEE && (
    modelType.includes('apollo17') ||
    modelType.includes('orange-soil') ||
    modelType.includes('station-taurus') ||
    mKey === 'apollo17'
  );

  const isChange4 = isMoon && !isStarshipHLS && !isLRO && !isLADEE && (
    modelType.includes('change4') ||
    modelType.includes('yutu') ||
    mKey === 'change4'
  );

  const isSurveyor3 = isMoon && !isStarshipHLS && !isLRO && !isLADEE && (
    modelType.includes('surveyor') ||
    mKey === 'surveyor3'
  );

  const isLunarRover = isMoon && !isStarshipHLS && !isLunarHabitat && !isApollo17 && !isChandrayaan3 && !isChange4 && !isSurveyor3 && !isLRO && !isLADEE && (
    modelType.includes('lunar-rover') ||
    modelType.includes('apollo15') ||
    modelType.includes('lrv') ||
    modelType.includes('buggy') ||
    mKey === 'apollo15'
  );

  const isLunarModule =
    (isMoon && !isLunarRover && !isChandrayaan3 && !isApollo17 && !isChange4 && !isSurveyor3 && !isLRO && !isLADEE && !isStarshipHLS && !isLunarHabitat) ||
    (!isMars && !isJWST && !isHubble && !isISS && !isVoyager && !isSaturnRocket && !isLRO && !isLADEE && !isLunarRover && !isChandrayaan3 && !isApollo17 && !isChange4 && !isSurveyor3 && !isStarshipHLS && !isLunarHabitat);

  return (
    <group ref={groupRef} key={mKey || modelType} position={[0, 0, 0]}>

      {/* ======================================================== */}
      {/* 1. REAL NASA MARS 2020 PERSEVERANCE ROVER + INGENUITY    */}
      {/* ======================================================== */}
      {isPerseverance && (
        <group key="perseverance-group" position={[0, 0, 0]}>
          <Suspense fallback={<HardwareFallback label="Perseverance Rover" />}>
            <NASAHardwareGLB
              modelPath="/models/perseverance.glb"
              targetSize={3.0}
              position={[0, 0, 0]}
              rotation={[0, 0, 0]}
              explodedFactor={explodedFactor}
            />
          </Suspense>

          <ContactShadowPlane radius={3.2} isMars={true} />

          {/* Ingenuity Scout Helicopter Parked Nearby */}
          <group position={[2.6, 0, 0.8]} rotation={[0, -0.4, 0]}>
            <Suspense fallback={null}>
              <NASAHardwareGLB
                modelPath="/models/ingenuity.glb"
                targetSize={0.95}
                position={[0, 0, 0]}
              />
            </Suspense>
            {showHotspots && (
              <CyberHotspotPin
                id="ingenuity"
                activeId={activeHotspotId}
                label="Ingenuity Scout Drone"
                code="ING"
                color="blue"
                position={[0, 0.65, 0]}
                onClick={handleHotspot}
              />
            )}
          </group>

          {showHotspots && (
            <>
              <CyberHotspotPin
                id="supercam"
                activeId={activeHotspotId}
                label="SuperCam Masthead Laser"
                code="SC"
                color="cyan"
                position={[0.25, 1.7 + explodedFactor * 1.2, 0.65]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="moxie"
                activeId={activeHotspotId}
                label="MOXIE Oxygen Generator"
                code="MOX"
                color="amber"
                position={[-0.75, 0.75, 0]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="pixl"
                activeId={activeHotspotId}
                label="PIXL & SHERLOC Arm Turret"
                code="PXL"
                color="emerald"
                position={[-0.25, 0.55, 1.25]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="rimfax"
                activeId={activeHotspotId}
                label="RIMFAX Subsurface Radar"
                code="RMF"
                color="purple"
                position={[0, 0.55, -1.15]}
                onClick={handleHotspot}
              />
            </>
          )}
        </group>
      )}

      {/* ======================================================== */}
      {/* 2. REAL NASA MARS CURIOSITY ROVER (MSL)                  */}
      {/* ======================================================== */}
      {isCuriosity && (
        <group position={[0, 0, 0]}>
          <Suspense fallback={<HardwareFallback label="Curiosity Rover (MSL)" />}>
            <NASAHardwareGLB
              modelPath="/models/curiosity.glb"
              targetSize={3.1}
              position={[0, 0, 0]}
              rotation={[0, 0, 0]}
              explodedFactor={explodedFactor}
            />
          </Suspense>

          <ContactShadowPlane radius={2.2} isMars={true} />

          {showHotspots && (
            <>
              <CyberHotspotPin
                id="curiosity-chassis"
                activeId={activeHotspotId}
                label="Curiosity Rover Chassis & MMRTG"
                code="MSL"
                color="cyan"
                position={[0, 1.0, 0]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="chemcam"
                activeId={activeHotspotId}
                label="ChemCam Laser Induced Breakdown Spectrometer"
                code="CCAM"
                color="amber"
                position={[0.28, 1.95 + explodedFactor * 1.2, 0.65]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="mastcam"
                activeId={activeHotspotId}
                label="Mastcam Multispectral Stereo Imaging Head"
                code="MCAM"
                color="blue"
                position={[-0.08, 1.88 + explodedFactor * 1.2, 0.6]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="apxs"
                activeId={activeHotspotId}
                label="APXS & MAHLI Arm Micro-Imager"
                code="APXS"
                color="emerald"
                position={[-0.28, 0.6, 1.25]}
                onClick={handleHotspot}
              />
            </>
          )}
        </group>
      )}

      {/* ======================================================== */}
      {/* 3. OFFICIAL NASA INSIGHT MARS LANDER                     */}
      {/* ======================================================== */}
      {isInSight && (
        <group position={[0, 0, 0]}>
          <Suspense fallback={<HardwareFallback label="InSight Mars Lander" />}>
            <NASAHardwareGLB
              modelPath="/models/insight.glb"
              targetSize={3.4}
              position={[0, 0, 0]}
              explodedFactor={explodedFactor}
            />
          </Suspense>

          <ContactShadowPlane radius={2.1} isMars={true} />

          {showHotspots && (
            <>
              <CyberHotspotPin
                id="seis"
                activeId={activeHotspotId}
                label="SEIS Ultra-Sensitive Mars Seismometer"
                code="SEIS"
                color="cyan"
                position={[1.05, 0.25, 0.7]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="hp3"
                activeId={activeHotspotId}
                label="HP³ Heat Flow & Physical Properties Probe"
                code="HP3"
                color="amber"
                position={[0.7, 0.22, -0.9]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="solar-arrays"
                activeId={activeHotspotId}
                label="UltraFlex Circular Solar Arrays"
                code="SOLAR"
                color="emerald"
                position={[-1.35, 0.72, 0]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="arm"
                activeId={activeHotspotId}
                label="Instrument Deployment Robotic Arm (IDA)"
                code="ARM"
                color="purple"
                position={[0.2, 0.85, 0.75]}
                onClick={handleHotspot}
              />
            </>
          )}
        </group>
      )}

      {/* ======================================================== */}
      {/* 4. OFFICIAL NASA VIKING MARS LANDER                      */}
      {/* ======================================================== */}
      {isViking && (
        <group position={[0, 0, 0]}>
          <Suspense fallback={<HardwareFallback label="Viking Mars Lander" />}>
            <NASAHardwareGLB
              modelPath="/models/viking_lander.glb"
              targetSize={3.5}
              position={[0, 0, 0]}
              explodedFactor={explodedFactor}
            />
          </Suspense>

          <ContactShadowPlane radius={2.2} isMars={true} />

          {showHotspots && (
            <>
              <CyberHotspotPin
                id="viking-rtg"
                activeId={activeHotspotId}
                label="SNAP-19 RTG Nuclear Power Unit"
                code="RTG"
                color="amber"
                position={[0, 0.85, -0.6]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="viking-sampler"
                activeId={activeHotspotId}
                label="Surface Soil Collector Arm"
                code="ARM"
                color="cyan"
                position={[0.6, 0.45, 0.8]}
                onClick={handleHotspot}
              />
            </>
          )}
        </group>
      )}

      {/* ======================================================== */}
      {/* 6. OFFICIAL NASA JAMES WEBB SPACE TELESCOPE (JWST)       */}
      {/* ======================================================== */}
      {isJWST && (
        <group position={[0, 0, 0]}>
          <OrbitalFloatGroup baseY={0.8} amplitude={0.07}>
            <Suspense fallback={<HardwareFallback label="James Webb Space Telescope" />}>
              <NASAHardwareGLB
                modelPath="/models/jwst.glb"
                targetSize={5.2}
                position={[0, 0, 0]}
                explodedFactor={explodedFactor}
              />
            </Suspense>

            {showHotspots && (
              <>
                <CyberHotspotPin
                  id="jwst-mirror"
                  activeId={activeHotspotId}
                  label="Primary Mirror (18 Gold-Coated Beryllium Segments)"
                  code="PMA"
                  color="amber"
                  position={[0, 1.45, 0.35]}
                  onClick={handleHotspot}
                />
                <CyberHotspotPin
                  id="jwst-sunshield"
                  activeId={activeHotspotId}
                  label="5-Layer Kapton Sunshield (Tennis-Court Size)"
                  code="SHLD"
                  color="purple"
                  position={[0, 0.35, 0]}
                  onClick={handleHotspot}
                />
                <CyberHotspotPin
                  id="jwst-nircam"
                  activeId={activeHotspotId}
                  label="NIRCam & MIRI Cryogenic Science Package"
                  code="ISIM"
                  color="cyan"
                  position={[0, 1.25, -0.55]}
                  onClick={handleHotspot}
                />
              </>
            )}
          </OrbitalFloatGroup>
        </group>
      )}

      {/* ======================================================== */}
      {/* 6B. HUBBLE SPACE TELESCOPE (HST)                         */}
      {/* ======================================================== */}
      {isHubble && (
        <group position={[0, 0, 0]}>
          <OrbitalFloatGroup baseY={0.9} amplitude={0.07}>
            <Suspense fallback={<HardwareFallback label="Hubble Space Telescope" />}>
              <NASAHardwareGLB
                modelPath="/models/hubble.glb"
                targetSize={4.2}
                position={[0, 0, 0]}
              />
            </Suspense>

            {showHotspots && (
              <>
                <CyberHotspotPin
                  id="hubble-primary-mirror"
                  activeId={activeHotspotId}
                  label="Hubble 2.4m Ritchey-Chrétien Optics"
                  code="HST"
                  color="cyan"
                  position={[0, 2.25, 0.75]}
                  onClick={handleHotspot}
                />
                <CyberHotspotPin
                  id="hubble-solar-arrays"
                  activeId={activeHotspotId}
                  label="GaAs Rigid Solar Array Wings"
                  code="SAW"
                  color="amber"
                  position={[1.45, 2.0, 0]}
                  onClick={handleHotspot}
                />
              </>
            )}
          </OrbitalFloatGroup>
        </group>
      )}

      {/* ======================================================== */}
      {/* 7. OFFICIAL NASA INTERNATIONAL SPACE STATION (ISS)       */}
      {/* ======================================================== */}
      {isISS && (
        <group position={[0, 0, 0]}>
          <OrbitalFloatGroup baseY={0.8} amplitude={0.05}>
            <Suspense fallback={<HardwareFallback label="International Space Station" />}>
              <NASAHardwareGLB
                modelPath="/models/iss.glb"
                targetSize={5.4}
                position={[0, 0, 0]}
                explodedFactor={explodedFactor}
              />
            </Suspense>

            {showHotspots && (
              <>
                <CyberHotspotPin
                  id="iss-solar"
                  activeId={activeHotspotId}
                  label="Integrated Truss Solar Array Wings (SAW)"
                  code="SAW"
                  color="amber"
                  position={[0.7, 3.6, 1.75]}
                  onClick={handleHotspot}
                />
                <CyberHotspotPin
                  id="iss-lab"
                  activeId={activeHotspotId}
                  label="Destiny Laboratory & Columbus Science Module"
                  code="LAB"
                  color="cyan"
                  position={[0, 2.75, 0.45]}
                  onClick={handleHotspot}
                />
                <CyberHotspotPin
                  id="iss-cupola"
                  activeId={activeHotspotId}
                  label="Cupola Earth-Observation 7-Window Dome"
                  code="CUP"
                  color="blue"
                  position={[0, 1.95, -0.45]}
                  onClick={handleHotspot}
                />
              </>
            )}
          </OrbitalFloatGroup>
        </group>
      )}

      {/* ======================================================== */}
      {/* 8. MARS RECONNAISSANCE ORBITER (MRO — ORBITAL VACUUM)    */}
      {/* ======================================================== */}
      {isMRO && (
        <group position={[0, 0, 0]}>
          <OrbitalFloatGroup baseY={0.45} amplitude={0.07}>
            <Suspense fallback={<HardwareFallback label="Mars Reconnaissance Orbiter" />}>
              <NASAHardwareGLB
                modelPath="/models/mro.glb"
                targetSize={3.8}
                position={[0, 0, 0]}
              />
            </Suspense>

            {showHotspots && (
              <>
                <CyberHotspotPin
                  id="hirise"
                  activeId={activeHotspotId}
                  label="HiRISE High Resolution Imaging Telescope"
                  code="HRI"
                  color="cyan"
                  position={[0, 1.0, 0.55]}
                  onClick={handleHotspot}
                />
                <CyberHotspotPin
                  id="mro-dish"
                  activeId={activeHotspotId}
                  label="3.0m High-Gain Telecommunications Dish"
                  code="HGA"
                  color="amber"
                  position={[0.3, 2.0, -0.35]}
                  onClick={handleHotspot}
                />
              </>
            )}
          </OrbitalFloatGroup>
        </group>
      )}

      {/* ======================================================== */}
      {/* 9. VOYAGER INTERSTELLAR PROBE                            */}
      {/* ======================================================== */}
      {isVoyager && (
        <group position={[0, 0, 0]}>
          <OrbitalFloatGroup baseY={0.85} amplitude={0.06}>
            <Suspense fallback={<HardwareFallback label="Voyager Interstellar Probe" />}>
              <NASAHardwareGLB
                modelPath="/models/voyager.glb"
                targetSize={3.4}
                position={[0, 0, 0]}
              />
            </Suspense>

            {showHotspots && (
              <>
                <CyberHotspotPin
                  id="voyager-dish"
                  activeId={activeHotspotId}
                  label="3.7m High-Gain Parabolic Reflector"
                  code="HGA"
                  color="cyan"
                  position={[0, 1.0, 0]}
                  onClick={handleHotspot}
                />
                <CyberHotspotPin
                  id="golden-record"
                  activeId={activeHotspotId}
                  label="The Golden Record Interstellar Time Capsule"
                  code="GOLD"
                  color="amber"
                  position={[-0.4, 0.55, 0.25]}
                  onClick={handleHotspot}
                />
              </>
            )}
          </OrbitalFloatGroup>
        </group>
      )}

      {/* ======================================================== */}
      {/* 10. REAL APOLLO 15 LUNAR ROVING VEHICLE (LRV-1)          */}
      {/* ======================================================== */}
      {isLunarRover && (
        <group position={[0, 0, 0]}>
          <Suspense fallback={<HardwareFallback label="Apollo Lunar Roving Vehicle (LRV)" />}>
            <NASAHardwareGLB
              modelPath="/models/mondfahrzeug_lunar_rover.glb"
              targetSize={3.1}
              position={[0, 0, 0]}
              rotation={[0, 0, 0]}
              explodedFactor={explodedFactor}
            />
          </Suspense>

          <ContactShadowPlane radius={2.2} isMars={false} />

          {/* Authentic NASA Apollo Astronaut Inspecting Rover */}
          <group position={[1.9, 0, 1.1]} rotation={[0, -0.8, 0]}>
            <Suspense fallback={null}>
              <AnimatedAstronaut
                position={[0, 0, 0]}
                rotation={[0, -1.8, 0]}
                scale={0.68}
              />
            </Suspense>
            <ContactShadowPlane radius={0.8} isMars={false} />

            {showHotspots && (
              <CyberHotspotPin
                id="lrv-astronaut"
                activeId={activeHotspotId}
                label="Dave Scott / Jim Irwin (Apollo 15 Crew)"
                code="A7LB"
                color="cyan"
                position={[0, 1.7, 0]}
                onClick={handleHotspot}
              />
            )}
          </group>

          {showHotspots && (
            <>
              <CyberHotspotPin
                id="apollo15-lrv"
                activeId={activeHotspotId}
                label="Lunar Roving Vehicle (LRV-1 'Moon Buggy')"
                code="LRV"
                color="cyan"
                position={[0, 0.9, 0]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="lrv-antenna"
                activeId={activeHotspotId}
                label="High-Gain S-Band Parabolic Antenna"
                code="HGA"
                color="amber"
                position={[0.4, 1.55, 0.55]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="lrv-camera"
                activeId={activeHotspotId}
                label="RCA Ground-Controlled TV Assembly"
                code="GCTA"
                color="blue"
                position={[-0.4, 1.15, 0.65]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="apollo15-drill"
                activeId={activeHotspotId}
                label="Apollo Lunar Surface Drill & Core Rack"
                code="ALSD"
                color="emerald"
                position={[-0.6, 0.6, -0.75]}
                onClick={handleHotspot}
              />
            </>
          )}
        </group>
      )}

      {/* ======================================================== */}
      {/* 11. REAL ISRO CHANDRAYAAN-3 VIKRAM LANDER + PRAGYAN ROVER */}
      {/* ======================================================== */}
      {isChandrayaan3 && (
        <group position={[0, 0, 0]}>
          <Suspense fallback={<HardwareFallback label="ISRO Chandrayaan-3 Vikram Lander" />}>
            <NASAHardwareGLB
              modelPath="/models/isro_chandrayyan-3_mission_lander_module_vikram.glb"
              targetSize={3.2}
              position={[0, 0, 0]}
              rotation={[0, 0, 0]}
              explodedFactor={explodedFactor}
            />
          </Suspense>

          <ContactShadowPlane radius={2.6} isMars={false} />

          {/* Deployed Aluminum Rollout Ramp + Detailed Gold-Foil 6-Wheel Pragyan Rover */}
          <mesh position={[1.45, 0.14, 1.18]} rotation={[0, -0.62, -0.24]} castShadow receiveShadow>
            <boxGeometry args={[1.15, 0.03, 0.42]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.82} roughness={0.28} />
          </mesh>

          <DetailedPragyanRover position={[2.45, 0, 2.05]} rotation={[0, 0.52, 0]} />

          {showHotspots && (
            <>
              <CyberHotspotPin
                id="vikram-lander"
                activeId={activeHotspotId}
                label="Vikram Lander Polar Descent Module"
                code="VIKRAM"
                color="cyan"
                position={[0, 2.25, 0]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="pragyan-rover"
                activeId={activeHotspotId}
                label="Pragyan 6-Wheel Surface Rover"
                code="PRGYN"
                color="amber"
                position={[2.45, 0.72, 2.05]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="chaste-probe"
                activeId={activeHotspotId}
                label="ChaSTE Thermal Probe (80mm Penetrator)"
                code="ChaSTE"
                color="emerald"
                position={[-1.05, 0.52, 0.65]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="rambha-plasma"
                activeId={activeHotspotId}
                label="RAMBHA-LP Langmuir Plasma Probe"
                code="RAMBHA"
                color="purple"
                position={[0.65, 1.55, -0.65]}
                onClick={handleHotspot}
              />
            </>
          )}
        </group>
      )}

      {/* ======================================================== */}
      {/* 12. APOLLO 17 TAURUS-LITTROW GEOLOGIC STATION & LRV-3     */}
      {/* ======================================================== */}
      {isApollo17 && (
        <group position={[0, 0, 0]}>
          {/* Centerpiece: Shorty Crater Volcanic Orange Pyroclastic Soil & Photogrammetric Gnomon */}
          <DetailedShortyCraterSoil position={[-1.05, 0, 1.35]} />

          {/* Geologist Astronaut Harrison Schmitt Sampling Shorty Crater */}
          <group position={[-1.72, 0, 0.35]} rotation={[0, 0.85, 0]}>
            <Suspense fallback={<HardwareFallback label="Apollo 17 Harrison Schmitt" />}>
              <AnimatedAstronaut
                position={[0, 0, 0]}
                rotation={[0, 0.4, 0]}
                scale={0.68}
              />
            </Suspense>
            <ContactShadowPlane radius={0.85} isMars={false} />
          </group>

          {/* Detailed Apollo 17 ALSEP Central Station & SNAP-27 RTG Nuclear Power Array */}
          <DetailedApolloALSEP position={[-0.45, 0, -0.95]} rotation={[0, 0.25, 0]} />

          {/* Apollo 17 Challenger Lunar Roving Vehicle (LRV-3) Parked on Level Pad */}
          <group position={[1.55, 0, -0.15]} rotation={[0, -0.65, 0]}>
            <Suspense fallback={null}>
              <NASAHardwareGLB
                modelPath="/models/mondfahrzeug_lunar_rover.glb"
                targetSize={2.9}
                position={[0, 0, 0]}
                explodedFactor={explodedFactor}
              />
            </Suspense>
            <ContactShadowPlane radius={1.9} isMars={false} />
          </group>

          {showHotspots && (
            <>
              <CyberHotspotPin
                id="orange-soil-sampler"
                activeId={activeHotspotId}
                label="Shorty Crater Orange Volcanic Soil & Gnomon"
                code="GNOM"
                color="amber"
                position={[-1.05, 0.62, 1.35]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="apollo17-lrv"
                activeId={activeHotspotId}
                label="Apollo 17 Challenger Rover (LRV-3)"
                code="LRV3"
                color="emerald"
                position={[1.55, 1.05, -0.15]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="apollo-astronaut"
                activeId={activeHotspotId}
                label="Dr. Harrison Schmitt (Lunar Geologist)"
                code="EVA3"
                color="cyan"
                position={[-1.72, 1.75, 0.35]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="lunar-antenna"
                activeId={activeHotspotId}
                label="ALSEP Central Science Station & SNAP-27 RTG"
                code="ALSEP"
                color="blue"
                position={[-0.45, 1.55, -0.95]}
                onClick={handleHotspot}
              />
            </>
          )}
        </group>
      )}

      {/* ======================================================== */}
      {/* 12B. CHANG'E 4 & YUTU-2 FAR-SIDE ROBOTIC ROVER           */}
      {/* ======================================================== */}
      {isChange4 && (
        <group position={[0, 0, 0]}>
          <DetailedYutu2Rover />

          {showHotspots && (
            <>
              <CyberHotspotPin
                id="yutu2-rover"
                activeId={activeHotspotId}
                label="Yutu-2 PanCam Stereo Mast & Kapton Bus"
                code="YUTU2"
                color="amber"
                position={[0.04, 1.62, 0.46]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="lpr-radar"
                activeId={activeHotspotId}
                label="Lunar Penetrating Radar & Queqiao Relay Dish"
                code="LPR"
                color="cyan"
                position={[-0.12, 0.55, -0.78]}
                onClick={handleHotspot}
              />
            </>
          )}
        </group>
      )}

      {/* ======================================================== */}
      {/* 12C. SURVEYOR 3 TRIPOD LANDER & PANTOGRAPH SOIL SAMPLER  */}
      {/* ======================================================== */}
      {isSurveyor3 && (
        <group position={[0, 0, 0]}>
          <DetailedSurveyor3Lander />

          {showHotspots && (
            <>
              <CyberHotspotPin
                id="surveyor3-sampler"
                activeId={activeHotspotId}
                label="Pantograph Soil Mechanics Surface Sampler (SMSS)"
                code="SMSS"
                color="amber"
                position={[1.08, 0.42, 1.00]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="surveyor3-tv"
                activeId={activeHotspotId}
                label="Vidicon Steerable Mirror TV Camera"
                code="TV"
                color="cyan"
                position={[0.26, 1.72, 0.22]}
                onClick={handleHotspot}
              />
            </>
          )}
        </group>
      )}

      {/* ======================================================== */}
      {/* 13. REAL NASA APOLLO 11 LUNAR MODULE & ASTRONAUT         */}
      {/* ======================================================== */}
      {isLunarModule && (
        <group position={[0, 0, 0]}>
          <Suspense fallback={<HardwareFallback label="Apollo Lunar Module" />}>
            <NASAHardwareGLB
              modelPath="/models/apollo_lunar_module.glb"
              targetSize={4.6}
              position={[0, 0, 0]}
              explodedFactor={explodedFactor}
            />
          </Suspense>

          <ContactShadowPlane radius={3.2} isMars={false} />

          {/* Authentic NASA Apollo Astronaut on Lunar Surface */}
          <group position={[2.2, 0, 1.2]} rotation={[0, -0.6, 0]}>
            <Suspense fallback={null}>
              <AnimatedAstronaut
                position={[0, 0, 0]}
                rotation={[0, -2.4, 0]}
                scale={0.68}
              />
            </Suspense>
            <ContactShadowPlane radius={0.8} isMars={false} />

            {showHotspots && (
              <CyberHotspotPin
                id="apollo-astronaut"
                activeId={activeHotspotId}
                label="Apollo 11 Astronaut (A7L Spacesuit)"
                code="EVA"
                color="cyan"
                position={[0, 1.8, 0]}
                onClick={handleHotspot}
              />
            )}
          </group>

          {/* Detailed 100-Prism Laser Ranging Retroreflector (LRRR) */}
          <group position={[-2.2, 0, 1.4]} rotation={[0, 0.4, 0]}>
            <DetailedApolloLRRR position={[0, 0, 0]} rotation={[0, 0, 0]} />
            {showHotspots && (
              <CyberHotspotPin
                id="lunar-laser-retro"
                activeId={activeHotspotId}
                label="Laser Ranging Retroreflector (LRRR)"
                code="LRRR"
                color="amber"
                position={[0, 0.65, 0]}
                onClick={handleHotspot}
              />
            )}
          </group>

          {/* Detailed Apollo Erectable Umbrella High-Gain S-Band Antenna */}
          <group position={[2.5, 0, -1.2]} rotation={[0, -0.35, 0]}>
            <DetailedSBandAntenna position={[0, 0, 0]} rotation={[0, 0, 0]} />
            {showHotspots && (
              <CyberHotspotPin
                id="lunar-antenna"
                activeId={activeHotspotId}
                label="High-Gain S-Band Umbrella Telemetry Antenna"
                code="ANT"
                color="blue"
                position={[0, 1.45, 0]}
                onClick={handleHotspot}
              />
            )}
          </group>

          {showHotspots && (
            <>
              <CyberHotspotPin
                id="apollo-ascent-stage"
                activeId={activeHotspotId}
                label="Ascent Stage Crew Cabin"
                code="ASC"
                color="blue"
                position={[0, 2.35 + explodedFactor * 1.6, 0]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="eagle-descent-stage"
                activeId={activeHotspotId}
                label="Gold Mylar Descent Stage"
                code="MYL"
                color="amber"
                position={[0, 0.95, 1.2]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="apollo-landing-gear"
                activeId={activeHotspotId}
                label="Landing Strut & Footpad"
                code="LGR"
                color="emerald"
                position={[-1.4, 0.35, 0]}
                onClick={handleHotspot}
              />
            </>
          )}
        </group>
      )}

      {/* ======================================================== */}
      {/* 14. LUNAR RECONNAISSANCE ORBITER (LRO — ORBITAL VACUUM)  */}
      {/* ======================================================== */}
      {isLRO && (
        <group position={[0, 0, 0]}>
          <OrbitalFloatGroup baseY={0.45} amplitude={0.07}>
            <Suspense fallback={<HardwareFallback label="Lunar Reconnaissance Orbiter" />}>
              <NASAHardwareGLB
                modelPath="/models/lunar_orbiter_lro.glb"
                targetSize={3.6}
                position={[0, 0, 0]}
              />
            </Suspense>

            {showHotspots && (
              <>
                <CyberHotspotPin
                  id="lroc-camera"
                  activeId={activeHotspotId}
                  label="LROC Narrow Angle Camera Array"
                  code="LROC"
                  color="cyan"
                  position={[0, 1.45, 0.55]}
                  onClick={handleHotspot}
                />
                <CyberHotspotPin
                  id="diviner-radiometer"
                  activeId={activeHotspotId}
                  label="Diviner 9-Channel Thermal Radiometer"
                  code="DLRE"
                  color="amber"
                  position={[-0.75, 1.65, -0.25]}
                  onClick={handleHotspot}
                />
              </>
            )}
          </OrbitalFloatGroup>
        </group>
      )}

      {/* ======================================================== */}
      {/* 15. SATURN V LAUNCH VEHICLE                              */}
      {/* ======================================================== */}
      {isSaturnRocket && (
        <group position={[0, 0, 0]}>
          <Suspense fallback={<HardwareFallback label="Saturn V Launch Vehicle" />}>
            <NASAHardwareGLB
              modelPath="/models/rocket_saturn_v.glb"
              targetSize={5.0}
              position={[0, 0, 0]}
              explodedFactor={explodedFactor}
            />
          </Suspense>

          <ContactShadowPlane radius={2.5} isMars={false} />

          {showHotspots && (
            <>
              <CyberHotspotPin
                id="saturn-s1c"
                activeId={activeHotspotId}
                label="S-IC First Stage (5 F-1 Rocket Engines)"
                code="S1C"
                color="amber"
                position={[0, 1.2, 0]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="apollo-csm"
                activeId={activeHotspotId}
                label="Apollo Command / Service Module & Launch Escape Tower"
                code="CSM"
                color="blue"
                position={[0, 4.1 + explodedFactor * 2.0, 0]}
                onClick={handleHotspot}
              />
            </>
          )}
        </group>
      )}

      {/* ======================================================== */}
      {/* 16. INGENUITY HELICOPTER STANDALONE                      */}
      {/* ======================================================== */}
      {isHelicopter && (
        <group position={[0, 0, 0]}>
          <Suspense fallback={<HardwareFallback label="Ingenuity Helicopter" />}>
            <NASAHardwareGLB
              modelPath="/models/ingenuity.glb"
              targetSize={2.0}
              position={[0, 0, 0]}
            />
          </Suspense>

          <ContactShadowPlane radius={1.4} isMars={true} />

          {showHotspots && (
            <CyberHotspotPin
              id="rotor-system"
              activeId={activeHotspotId}
              label="Dual Counter-Rotating Rotors (2400 RPM)"
              code="RTR"
              color="cyan"
              position={[0, 1.15, 0]}
              onClick={handleHotspot}
            />
          )}
        </group>
      )}

      {/* ======================================================== */}
      {/* 17. OFFICIAL NASA ARTEMIS III STARSHIP HLS & BASE CAMP   */}
      {/* ======================================================== */}
      {isStarshipHLS && (
        <StarshipHLS3D
          onSelectHotspot={handleHotspot}
          activeHotspotId={activeHotspotId}
          showHotspots={showHotspots}
        />
      )}

      {/* ======================================================== */}
      {/* 18. NASA LADEE LUNAR DUST & ATMOSPHERE EXPLORER (ORBITAL)*/}
      {/* ======================================================== */}
      {isLADEE && (
        <group position={[0, 0, 0]}>
          <OrbitalFloatGroup baseY={0.45} amplitude={0.06}>
            <Suspense fallback={<HardwareFallback label="NASA LADEE Lunar Orbiter" />}>
              <NASAHardwareGLB
                modelPath="/models/lunar_ladee.glb"
                targetSize={2.6}
                position={[0, 0, 0]}
              />
            </Suspense>

            {showHotspots && (
              <>
                <CyberHotspotPin
                  id="ladee-ldex"
                  activeId={activeHotspotId}
                  label="LDEX Lunar Dust Experiment Sensor"
                  code="LDEX"
                  color="cyan"
                  position={[0, 1.35, 0.72]}
                  onClick={handleHotspot}
                />
                <CyberHotspotPin
                  id="ladee-nms"
                  activeId={activeHotspotId}
                  label="Neutral Mass Spectrometer (NMS)"
                  code="NMS"
                  color="amber"
                  position={[-0.72, 1.15, 0]}
                  onClick={handleHotspot}
                />
                <CyberHotspotPin
                  id="ladee-llcd"
                  activeId={activeHotspotId}
                  label="Lunar Laser Comm Demonstration (LLCD 622 Mbps)"
                  code="LLCD"
                  color="emerald"
                  position={[0.68, 1.85, -0.35]}
                  onClick={handleHotspot}
                />
              </>
            )}
          </OrbitalFloatGroup>
        </group>
      )}

      {/* ======================================================== */}
      {/* 19. ARTEMIS BASE CAMP LUNAR HABITAT & SURFACE COMPLEX    */}
      {/* ======================================================== */}
      {isLunarHabitat && (
        <group position={[0, 0, 0]}>
          {/* Main Inflatable Multi-Year Habitat Dome */}
          <group position={[0, 0, 0]}>
            <Suspense fallback={<HardwareFallback label="Artemis Base Camp Habitat" />}>
              <NASAHardwareGLB
                modelPath="/models/lunar_habitat.glb"
                targetSize={3.8}
                position={[0, 0, 0]}
              />
            </Suspense>
            <ContactShadowPlane radius={2.8} isMars={false} />
          </group>

          {/* Lunar Base Communications & Vertical Solar Wing Tower */}
          <DetailedLunarCommsTower position={[3.0, 0, -1.4]} rotation={[0, -0.4, 0]} />

          {/* Lunar Rover Vehicle (LRV) Parked at Airlock */}
          <group position={[-2.6, 0, 1.6]} rotation={[0, 0.8, 0]}>
            <Suspense fallback={null}>
              <NASAHardwareGLB
                modelPath="/models/mondfahrzeug_lunar_rover.glb"
                targetSize={2.7}
                position={[0, 0, 0]}
              />
            </Suspense>
            <ContactShadowPlane radius={1.6} isMars={false} />
          </group>

          {/* Artemis Moonwalker Astronaut Inspecting Habitat Exterior */}
          <group position={[1.4, 0, 1.6]} rotation={[0, -1.6, 0]}>
            <Suspense fallback={null}>
              <AnimatedAstronaut
                position={[0, 0, 0]}
                rotation={[0, 0, 0]}
                scale={0.68}
              />
            </Suspense>
            <ContactShadowPlane radius={0.8} isMars={false} />
          </group>

          {showHotspots && (
            <>
              <CyberHotspotPin
                id="lunar-habitat"
                activeId={activeHotspotId}
                label="Artemis Base Camp Inflatable Habitat Dome"
                code="HAB"
                color="cyan"
                position={[0, 1.6, 0]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="lunar-antenna"
                activeId={activeHotspotId}
                label="Deep Space Network High-Gain Telemetry Station"
                code="DSN"
                color="blue"
                position={[3.0, 2.15, -1.4]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="apollo15-lrv"
                activeId={activeHotspotId}
                label="Artemis Lunar Terrain Vehicle (LTV)"
                code="LTV"
                color="amber"
                position={[-2.6, 0.85, 1.6]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="apollo-astronaut"
                activeId={activeHotspotId}
                label="Artemis Expedition Crew (Axiom Spacesuit)"
                code="AxEMU"
                color="emerald"
                position={[1.4, 1.8, 1.6]}
                onClick={handleHotspot}
              />
            </>
          )}
        </group>
      )}

    </group>
  );
};

// NOTE: Hardware GLBs are no longer preloaded at module-import time (that fired ~18
// downloads + Draco decodes during boot). They are now prefetched per theater during
// idle time by `prefetchTheaterModels()` in utils/assetPreloader.ts.
