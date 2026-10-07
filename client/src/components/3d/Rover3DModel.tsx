import React, { useRef, useMemo, Suspense, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { soundFx } from '../../utils/soundEffects';
import { ContactShadowPlane } from './ContactShadowPlane';
import { CanvasErrorBoundary } from '../common/CanvasErrorBoundary';
import { StarshipHLS3D } from './StarshipHLS3D';

interface Rover3DModelProps {
  modelType: string;
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
};

// 🎯 ULTRA-MINIMAL, AESTHETIC CYBERNETIC HUD HOTSPOT PIN (12px micro-reticle)
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
  const [hovered, setHovered] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);
  const isActive = activeId === id;

  // Reset dismissed state whenever active hotspot changes
  React.useEffect(() => {
    setDismissed(false);
  }, [activeId]);

  const isCardVisible = (hovered || isActive) && !dismissed;

  // Exact authentic NASA subsystem telemetry record
  const dbData = NASA_SUBSYSTEM_DATABASE[id];
  const displayTitle = dbData?.name || label;
  const displayCode = dbData?.code || code;
  const category = dbData?.category || 'NASA Subsystem';
  const status = dbData?.status || 'ACTIVE';

  const colorStyles = {
    cyan: {
      dot: 'bg-cyan-400',
      border: 'border-cyan-400/60',
      text: 'text-cyan-300',
      glowShadow: 'shadow-[0_0_10px_rgba(56,189,248,0.8)]',
      glowBg: 'bg-cyan-500/15',
      badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-400/30',
      line: 'bg-cyan-400/70',
    },
    amber: {
      dot: 'bg-amber-400',
      border: 'border-amber-400/60',
      text: 'text-amber-300',
      glowShadow: 'shadow-[0_0_10px_rgba(251,191,36,0.8)]',
      glowBg: 'bg-amber-500/15',
      badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-400/30',
      line: 'bg-amber-400/70',
    },
    emerald: {
      dot: 'bg-emerald-400',
      border: 'border-emerald-400/60',
      text: 'text-emerald-300',
      glowShadow: 'shadow-[0_0_10px_rgba(52,211,153,0.8)]',
      glowBg: 'bg-emerald-500/15',
      badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-400/30',
      line: 'bg-emerald-400/70',
    },
    purple: {
      dot: 'bg-purple-400',
      border: 'border-purple-400/60',
      text: 'text-purple-300',
      glowShadow: 'shadow-[0_0_10px_rgba(192,132,252,0.8)]',
      glowBg: 'bg-purple-500/15',
      badgeBg: 'bg-purple-500/10 text-purple-300 border-purple-400/30',
      line: 'bg-purple-400/70',
    },
    blue: {
      dot: 'bg-blue-400',
      border: 'border-blue-400/60',
      text: 'text-blue-300',
      glowShadow: 'shadow-[0_0_10px_rgba(96,165,250,0.8)]',
      glowBg: 'bg-blue-500/15',
      badgeBg: 'bg-blue-500/10 text-blue-300 border-blue-400/30',
      line: 'bg-blue-400/70',
    },
  }[color];

  return (
    <Html position={position} center distanceFactor={8} zIndexRange={[120, 0]}>
      <div
        className="relative group select-none pointer-events-auto cursor-pointer flex items-center justify-center"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          setDismissed(false);
          onClick(id, e);
        }}
        title={displayTitle}
      >
        {/* 1. ULTRA-MINIMAL RETICLE PIN (12px footprint) */}
        <div className="relative flex items-center justify-center w-3.5 h-3.5">
          {/* Subtle Breathing Outer Hairline Halo */}
          <span
            className={`absolute w-3.5 h-3.5 rounded-full border border-white/30 transition-all duration-300 ${
              isActive
                ? 'scale-125 border-cyan-400 bg-cyan-400/20 shadow-[0_0_12px_rgba(56,189,248,0.8)]'
                : 'animate-micro-pulse opacity-75'
            }`}
          />

          {/* Micro Reticle Pip Ring */}
          <div
            className={`w-3 h-3 rounded-full border flex items-center justify-center backdrop-blur-md transition-all duration-300 ${
              isActive || hovered
                ? `scale-125 ${colorStyles.border} ${colorStyles.glowBg} ${colorStyles.glowShadow} bg-black/50`
                : 'border-white/40 bg-black/35 hover:scale-115'
            }`}
          >
            {/* Center Core LED */}
            <div
              className={`w-1.5 h-1.5 rounded-full transition-transform duration-200 ${colorStyles.dot} ${
                isActive || hovered ? colorStyles.glowShadow : 'opacity-80'
              }`}
            />
          </div>

          {/* Micro Hairline Crosshair Ticks on Hover/Active */}
          {(hovered || isActive) && (
            <>
              <span className={`absolute -top-1 w-[1px] h-1 ${colorStyles.line}`} />
              <span className={`absolute -bottom-1 w-[1px] h-1 ${colorStyles.line}`} />
              <span className={`absolute -left-1 h-[1px] w-1 ${colorStyles.line}`} />
              <span className={`absolute -right-1 h-[1px] w-1 ${colorStyles.line}`} />
            </>
          )}
        </div>

        {/* 2. ADVANCED HOLOGRAPHIC TELEMETRY HUD CALLOUT (Seamless Hover Bridge & Real Transparent Glass) */}
        <div
          className={`absolute left-1/2 bottom-full pb-3 -translate-x-1/2 w-64 sm:w-72 z-50 transition-all duration-200 ease-out ${
            isCardVisible
              ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
              : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onClick(id, e);
          }}
        >
          {/* Fine Laser Connecting Stalk */}
          <div className={`absolute top-full left-1/2 -translate-x-1/2 w-[1px] h-3 ${colorStyles.line}`} />

          {/* REAL TRANSPARENT AEROSPACE GLASS CARD */}
          <div className="crystal-glass rounded-2xl p-3 space-y-2 text-left font-sans relative overflow-hidden transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-cyan-400/60">
            
            {/* Iridescent Top Rim Edge Highlight */}
            <div className="card-iridescent-rim absolute top-0 left-0 right-0 h-[2px] pointer-events-none" />

            {/* Header: Code Pill, Category, Live Status & Dismiss Button */}
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5">
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${colorStyles.badgeBg}`}>
                  {displayCode}
                </span>
                <span className="text-[9px] font-mono text-slate-300 truncate max-w-[105px]">
                  {category}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      status === 'ACTIVE'
                        ? 'bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                        : status === 'NOMINAL'
                        ? 'bg-cyan-400 animate-pulse shadow-[0_0_6px_rgba(56,189,248,0.8)]'
                        : 'bg-amber-400'
                    }`}
                  />
                  <span className="text-[8px] font-mono text-slate-300 font-bold tracking-wider">
                    {status}
                  </span>
                </div>

                {/* Dismiss Button when active */}
                {isActive && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDismissed(true);
                    }}
                    className="w-4 h-4 rounded-full bg-white/[0.08] hover:bg-white/[0.2] flex items-center justify-center text-slate-300 hover:text-white text-[9px] transition-colors"
                    title="Dismiss HUD Card"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Subsystem Name */}
            <div className="text-xs font-bold text-white font-display leading-tight line-clamp-2">
              {displayTitle}
            </div>

            {/* Exact NASA Telemetry Metrics Strip */}
            {dbData && (
              <div className="flex flex-wrap gap-1 pt-0.5 text-[9px] font-mono">
                {dbData.wavelength && (
                  <span className="px-1.5 py-0.5 rounded-md bg-white/[0.04] text-cyan-300 border border-white/[0.08]">
                    λ: {dbData.wavelength}
                  </span>
                )}
                {dbData.power && (
                  <span className="px-1.5 py-0.5 rounded-md bg-white/[0.04] text-amber-300 border border-white/[0.08]">
                    ⚡ {dbData.power}
                  </span>
                )}
                {dbData.mass && (
                  <span className="px-1.5 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/[0.08]">
                    ⚖️ {dbData.mass}
                  </span>
                )}
                {dbData.dimensions && !dbData.mass && (
                  <span className="px-1.5 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/[0.08]">
                    📏 {dbData.dimensions}
                  </span>
                )}
              </div>
            )}

            {/* Scientific Objective */}
            {dbData?.scientificFunction && (
              <p className="text-[10px] text-slate-300 leading-snug line-clamp-2 border-t border-white/[0.08] pt-1.5 font-normal">
                {dbData.scientificFunction}
              </p>
            )}

            {/* Interactive Focus Action Hint */}
            <div className="flex items-center justify-between text-[9px] font-mono pt-1 text-slate-400">
              <span className={isActive ? 'text-emerald-400 font-bold' : colorStyles.text}>
                {isActive ? '● FOCUS LOCKED' : '▶ CLICK TO LOCK CAMERA'}
              </span>
              {dbData?.primaryTarget && (
                <span className="text-slate-400 truncate max-w-[120px]">
                  {dbData.primaryTarget}
                </span>
              )}
            </div>

          </div>
        </div>
      </div>
    </Html>
  );
};

// Sleek fallback while heavy 3D GLB assets stream in
function HardwareFallback({ label }: { label: string }) {
  return (
    <group position={[0, 0.5, 0]}>
      <mesh castShadow>
        <boxGeometry args={[1.8, 0.8, 2.2]} />
        <meshStandardMaterial color="#334155" wireframe opacity={0.6} transparent />
      </mesh>
      <Html position={[0, 1.2, 0]} center distanceFactor={8}>
        <div className="px-3 py-1.5 rounded-xl nasa-card text-xs text-cyan-400 font-mono animate-pulse">
          Loading NASA 3D: {label}...
        </div>
      </Html>
    </group>
  );
}

// 🚀 REAL OFFICIAL NASA 3D HARDWARE GLB LOADER WITH EXPLODED VIEW SUPPORT
function NASAHardwareGLBInner({
  modelPath,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  explodedFactor = 0,
}: {
  modelPath: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  explodedFactor?: number;
}) {
  const { scene } = useGLTF(modelPath, '/draco/');
  const rootGroupRef = useRef<THREE.Group>(null);

  const { cloned, upperMeshes, lowerMeshes, initialPositions } = useMemo(() => {
    const c = scene.clone(true);

    const toRemove: THREE.Object3D[] = [];
    c.traverse((node) => {
      const name = (node.name || '').toLowerCase();
      if (
        node.type.includes('Camera') ||
        node.type.includes('Light') ||
        name.includes('camera') ||
        name.includes('hemi') ||
        name.includes('sun') ||
        name.includes('sky') ||
        name.includes('plane003') ||
        name.includes('untitled.002') ||
        name.includes('untitled.004') ||
        name.includes('unseen')
      ) {
        toRemove.push(node);
      }
    });
    toRemove.forEach((obj) => obj.parent && obj.parent.remove(obj));

    const upper: THREE.Object3D[] = [];
    const lower: THREE.Object3D[] = [];

    // Traverse and configure materials and shadow casting
    c.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => {
            m.side = THREE.FrontSide;
            m.depthWrite = true;
            m.needsUpdate = true;
          });
        }
      }
    });

    // Auto-align model so its lowest point rests precisely at y = 0
    const box = new THREE.Box3().setFromObject(c);
    if (!box.isEmpty() && isFinite(box.min.y)) {
      const center = new THREE.Vector3();
      box.getCenter(center);
      c.position.x = -center.x;
      c.position.z = -center.z;
      c.position.y = -box.min.y;
    }

    const midY = (box.max.y - box.min.y) * 0.45;
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

    return { cloned: c, upperMeshes: upper, lowerMeshes: lower, initialPositions: initPos };
  }, [scene, modelPath]);

  // Apply real-time 3D exploded separation with deterministic reset
  useFrame(() => {
    if (upperMeshes.length > 0) {
      const liftY = explodedFactor * 1.8;
      upperMeshes.forEach((mesh) => {
        const init = initialPositions.get(mesh);
        if (init) mesh.position.y = init.y + liftY;
      });
    }
    if (lowerMeshes.length > 0) {
      const padShift = explodedFactor * 0.35;
      lowerMeshes.forEach((mesh) => {
        const init = initialPositions.get(mesh);
        if (init && init.x !== 0) {
          mesh.position.x = init.x + Math.sign(init.x) * padShift;
        }
      });
    }
  });

  return (
    <group ref={rootGroupRef} position={position} rotation={rotation} scale={[scale, scale, scale]}>
      <primitive object={cloned} />
    </group>
  );
}

function NASAHardwareGLB(props: {
  modelPath: string;
  scale?: number;
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

// 👨‍🚀 AUTHENTIC ANIMATED APOLLO ASTRONAUT COMPONENT (Tripo 3D Animated)
function AnimatedAstronautInner({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 0.0095,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('/models/tripo_astronaut_2_stylized_and_animated.glb');

  // Deep clone skinned mesh & skeleton hierarchy
  const clonedScene = useMemo(() => {
    const cloned = cloneSkeleton(scene);
    cloned.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => {
            m.depthWrite = true;
            m.needsUpdate = true;
          });
        }
      }
    });
    return cloned;
  }, [scene]);

  const { actions, names } = useAnimations(animations, groupRef);

  useEffect(() => {
    if (names.length > 0 && actions[names[0]]) {
      const action = actions[names[0]];
      action.reset().fadeIn(0.4).play();
      return () => {
        action.fadeOut(0.2);
      };
    }
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

  // Smooth idle rotation for 360 exhibition
  useFrame((_, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.05;
    }
    if (upperRotorRef.current) {
      upperRotorRef.current.rotation.y += delta * 12;
    }
  });

  const handleHotspot = (id: string, e?: any) => {
    if (e && e.stopPropagation) e.stopPropagation();
    soundFx.playClick();
    soundFx.playChirp();
    if (onSelectHotspot) onSelectHotspot(id);
  };

  // Precise hardware vehicle categorization - strictly authentic models only
  const isJWST = modelType.includes('jwst') || modelType.includes('webb');
  const isISS = modelType.includes('iss') || modelType.includes('space-station');
  const isMRO = modelType.includes('mro') || modelType.includes('orbiter-mars');
  const isVoyager = modelType.includes('voyager');
  const isLRO = modelType.includes('lro') || modelType === 'lroc-camera';
  const isLADEE = modelType.includes('ladee');
  const isSaturnRocket = modelType === 'rocket-saturn' || modelType.includes('saturn');

  // MARS HARDWARE
  const isCuriosity = isMars && (modelType.includes('curiosity') || modelType === 'chemcam' || modelType.includes('msl'));
  const isInSight = isMars && (modelType.includes('insight') || modelType.includes('seis'));
  const isViking = isMars && (modelType.includes('viking') || modelType.includes('lander-mars'));
  const isHelicopter = isMars && modelType === 'helicopter-ingenuity';
  const isPerseverance = isMars && !isCuriosity && !isInSight && !isViking && !isHelicopter && !isMRO;

  // LUNAR HARDWARE (Starship HLS, Apollo 11, Apollo 15 LRV, Chandrayaan-3 Vikram, Apollo 17, LRO, LADEE, Lunar Habitat)
  const isStarshipHLS = isMoon && (
    modelType.includes('starship') ||
    modelType.includes('artemis') ||
    modelType.includes('hls')
  );

  const isLunarHabitat = isMoon && (
    modelType.includes('habitat') ||
    modelType.includes('base-camp')
  );

  const isLunarRover = isMoon && !isStarshipHLS && !isLunarHabitat && (
    modelType.includes('lunar-rover') ||
    modelType.includes('apollo15') ||
    modelType.includes('lrv') ||
    modelType.includes('buggy') ||
    modelType.includes('drill')
  );

  const isChandrayaan3 = isMoon && !isStarshipHLS && (
    modelType.includes('chandrayaan') ||
    modelType.includes('vikram') ||
    modelType.includes('pragyan') ||
    modelType.includes('isro')
  );

  const isApollo17 = isMoon && !isStarshipHLS && (
    modelType.includes('apollo17') ||
    modelType.includes('orange-soil') ||
    modelType.includes('station-taurus')
  );

  const isLunarModule = (isMoon && !isLunarRover && !isChandrayaan3 && !isApollo17 && !isLRO && !isLADEE && !isStarshipHLS && !isLunarHabitat) ||
    (!isMars && !isJWST && !isISS && !isVoyager && !isSaturnRocket && !isLRO && !isLADEE && !isLunarRover && !isChandrayaan3 && !isApollo17 && !isStarshipHLS && !isLunarHabitat);

  return (
    <group ref={groupRef} key={modelType} position={[0, 0, 0]}>

      {/* ======================================================== */}
      {/* 1. REAL NASA MARS 2020 PERSEVERANCE ROVER + INGENUITY    */}
      {/* ======================================================== */}
      {isPerseverance && (
        <group key="perseverance-group" position={[0, 0, 0]}>
          <Suspense fallback={<HardwareFallback label="Perseverance Rover" />}>
            <NASAHardwareGLB
              modelPath="/models/perseverance.glb"
              scale={0.9}
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
                scale={0.75}
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
                position={[0, 0.7, 0]}
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
                position={[0.3, 1.9 + explodedFactor * 1.2, 0.7]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="moxie"
                activeId={activeHotspotId}
                label="MOXIE Oxygen Generator"
                code="MOX"
                color="amber"
                position={[-0.8, 0.8, 0]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="pixl"
                activeId={activeHotspotId}
                label="PIXL & SHERLOC Arm Turret"
                code="PXL"
                color="emerald"
                position={[-0.3, 0.6, 1.3]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="rimfax"
                activeId={activeHotspotId}
                label="RIMFAX Subsurface Radar"
                code="RMF"
                color="purple"
                position={[0, 0.6, -1.2]}
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
              scale={1.05}
              position={[0, 0, 0]}
              rotation={[0, 0, 0]}
              explodedFactor={explodedFactor}
            />
          </Suspense>

          <ContactShadowPlane radius={1.8} isMars={true} />

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
                position={[0.3, 1.9 + explodedFactor * 1.2, 0.7]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="mastcam"
                activeId={activeHotspotId}
                label="Mastcam Multispectral Stereo Imaging Head"
                code="MCAM"
                color="blue"
                position={[0.1, 1.85 + explodedFactor * 1.2, 0.6]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="apxs"
                activeId={activeHotspotId}
                label="APXS & MAHLI Arm Micro-Imager"
                code="APXS"
                color="emerald"
                position={[-0.3, 0.6, 1.3]}
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
              scale={0.18}
              position={[0, 0, 0]}
              explodedFactor={explodedFactor}
            />
          </Suspense>

          <ContactShadowPlane radius={1.6} isMars={true} />

          {showHotspots && (
            <>
              <CyberHotspotPin
                id="seis"
                activeId={activeHotspotId}
                label="SEIS Ultra-Sensitive Mars Seismometer"
                code="SEIS"
                color="cyan"
                position={[1.1, 0.15, 0.7]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="hp3"
                activeId={activeHotspotId}
                label="HP³ Heat Flow & Physical Properties Probe"
                code="HP3"
                color="amber"
                position={[0.7, 0.15, -0.9]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="solar-arrays"
                activeId={activeHotspotId}
                label="UltraFlex Circular Solar Arrays"
                code="SOLAR"
                color="emerald"
                position={[-1.5, 0.65, 0]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="arm"
                activeId={activeHotspotId}
                label="Instrument Deployment Robotic Arm (IDA)"
                code="ARM"
                color="purple"
                position={[0.2, 0.75, 0.8]}
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
              scale={0.24}
              position={[0, 0, 0]}
              explodedFactor={explodedFactor}
            />
          </Suspense>

          <ContactShadowPlane radius={1.5} isMars={true} />

          {showHotspots && (
            <>
              <CyberHotspotPin
                id="viking-rtg"
                activeId={activeHotspotId}
                label="SNAP-19 RTG Nuclear Power Unit"
                code="RTG"
                color="amber"
                position={[0, 0.8, -0.6]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="viking-sampler"
                activeId={activeHotspotId}
                label="Surface Soil Collector Arm"
                code="ARM"
                color="cyan"
                position={[0.6, 0.4, 0.8]}
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
        <group position={[0, 0.6, 0]}>
          <Suspense fallback={<HardwareFallback label="James Webb Space Telescope" />}>
            <NASAHardwareGLB
              modelPath="/models/jwst.glb"
              scale={0.42}
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
                position={[0, 1.4, 0.4]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="jwst-sunshield"
                activeId={activeHotspotId}
                label="5-Layer Kapton Sunshield (Tennis-Court Size)"
                code="SHLD"
                color="purple"
                position={[0, 0.2, 0]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="jwst-nircam"
                activeId={activeHotspotId}
                label="NIRCam & MIRI Cryogenic Science Package"
                code="ISIM"
                color="cyan"
                position={[0, 1.2, -0.6]}
                onClick={handleHotspot}
              />
            </>
          )}
        </group>
      )}

      {/* ======================================================== */}
      {/* 7. OFFICIAL NASA INTERNATIONAL SPACE STATION (ISS)       */}
      {/* ======================================================== */}
      {isISS && (
        <group position={[0, 0.8, 0]}>
          <Suspense fallback={<HardwareFallback label="International Space Station" />}>
            <NASAHardwareGLB
              modelPath="/models/iss.glb"
              scale={0.12}
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
                position={[1.8, 0.6, 0]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="iss-lab"
                activeId={activeHotspotId}
                label="Destiny Laboratory & Columbus Science Module"
                code="LAB"
                color="cyan"
                position={[0, 0.4, 0.3]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="iss-cupola"
                activeId={activeHotspotId}
                label="Cupola Earth-Observation 7-Window Dome"
                code="CUP"
                color="blue"
                position={[0, 0.1, -0.4]}
                onClick={handleHotspot}
              />
            </>
          )}
        </group>
      )}

      {/* ======================================================== */}
      {/* 8. MARS RECONNAISSANCE ORBITER (MRO)                     */}
      {/* ======================================================== */}
      {isMRO && (
        <group position={[0, 0.8, 0]}>
          <Suspense fallback={<HardwareFallback label="Mars Reconnaissance Orbiter" />}>
            <NASAHardwareGLB
              modelPath="/models/mro.glb"
              scale={0.65}
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
                position={[0, 0.5, 0.6]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="mro-dish"
                activeId={activeHotspotId}
                label="3.0m High-Gain Telecommunications Dish"
                code="HGA"
                color="amber"
                position={[0.6, 0.9, -0.4]}
                onClick={handleHotspot}
              />
            </>
          )}
        </group>
      )}

      {/* ======================================================== */}
      {/* 9. VOYAGER INTERSTELLAR PROBE                            */}
      {/* ======================================================== */}
      {isVoyager && (
        <group position={[0, 0.8, 0]}>
          <Suspense fallback={<HardwareFallback label="Voyager Interstellar Probe" />}>
            <NASAHardwareGLB
              modelPath="/models/voyager.glb"
              scale={0.7}
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
                position={[0, 0.9, 0]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="golden-record"
                activeId={activeHotspotId}
                label="The Golden Record Interstellar Time Capsule"
                code="GOLD"
                color="amber"
                position={[-0.4, 0.4, 0.2]}
                onClick={handleHotspot}
              />
            </>
          )}
        </group>
      )}

      {/* ======================================================== */}
      {/* 10. REAL APOLLO 15 LUNAR ROVING VEHICLE (LRV) 3D MODEL    */}
      {/* ======================================================== */}
      {isLunarRover && (
        <group position={[0, 0, 0]}>
          <Suspense fallback={<HardwareFallback label="Apollo Lunar Roving Vehicle (LRV)" />}>
            <NASAHardwareGLB
              modelPath="/models/mondfahrzeug_lunar_rover.glb"
              scale={1.05}
              position={[0, 0, 0]}
              rotation={[0, 0, 0]}
              explodedFactor={explodedFactor}
            />
          </Suspense>

          <ContactShadowPlane radius={2.2} isMars={false} />

          {/* Authentic NASA Apollo Astronaut Inspecting Rover */}
          <group position={[1.8, 0, 1.2]} rotation={[0, -0.8, 0]}>
            <Suspense fallback={null}>
              <AnimatedAstronaut
                position={[0, 0, 0]}
                rotation={[0, -1.8, 0]}
                scale={0.0095}
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
                position={[0.4, 1.6, 0.6]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="lrv-camera"
                activeId={activeHotspotId}
                label="RCA Ground-Controlled TV Assembly"
                code="GCTA"
                color="blue"
                position={[-0.4, 1.2, 0.7]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="apollo15-drill"
                activeId={activeHotspotId}
                label="Apollo Lunar Surface Drill & Core Rack"
                code="ALSD"
                color="emerald"
                position={[-0.6, 0.6, -0.8]}
                onClick={handleHotspot}
              />
            </>
          )}
        </group>
      )}

      {/* ======================================================== */}
      {/* 11. REAL ISRO CHANDRAYAAN-3 VIKRAM LANDER 3D MODEL        */}
      {/* ======================================================== */}
      {isChandrayaan3 && (
        <group position={[0, 0, 0]}>
          <Suspense fallback={<HardwareFallback label="ISRO Chandrayaan-3 Vikram Lander" />}>
            <NASAHardwareGLB
              modelPath="/models/isro_chandrayyan-3_mission_lander_module_vikram.glb"
              scale={1.1}
              position={[0, 0, 0]}
              rotation={[0, 0, 0]}
              explodedFactor={explodedFactor}
            />
          </Suspense>

          <ContactShadowPlane radius={2.8} isMars={false} />

          {showHotspots && (
            <>
              <CyberHotspotPin
                id="vikram-lander"
                activeId={activeHotspotId}
                label="Vikram Lander Polar Descent Module"
                code="VIKRAM"
                color="cyan"
                position={[0, 1.4, 0]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="pragyan-rover"
                activeId={activeHotspotId}
                label="Pragyan 6-Wheel Surface Rover Deployer"
                code="PRGYN"
                color="amber"
                position={[0.8, 0.6, 0.6]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="chaste-probe"
                activeId={activeHotspotId}
                label="ChaSTE Thermal Probe (80mm Penetrator)"
                code="ChaSTE"
                color="emerald"
                position={[-0.7, 0.4, 0.5]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="rambha-plasma"
                activeId={activeHotspotId}
                label="RAMBHA-LP Langmuir Plasma Probe"
                code="RAMBHA"
                color="purple"
                position={[0.5, 1.2, -0.6]}
                onClick={handleHotspot}
              />
            </>
          )}
        </group>
      )}

      {/* ======================================================== */}
      {/* 12. APOLLO 17 TAURUS-LITTROW SURFACE STATION & ASTRONAUT  */}
      {/* ======================================================== */}
      {isApollo17 && (
        <group position={[0, 0, 0]}>
          {/* Apollo 17 Geologist Astronaut Harrison Schmitt */}
          <group position={[-1.4, 0, 0.6]} rotation={[0, 0.4, 0]}>
            <Suspense fallback={<HardwareFallback label="Apollo 17 Astronaut & Station" />}>
              <AnimatedAstronaut
                position={[0, 0, 0]}
                rotation={[0, 1.2, 0]}
                scale={0.0095}
              />
            </Suspense>
            <ContactShadowPlane radius={0.8} isMars={false} />
          </group>

          {/* Apollo 17 Lunar Roving Vehicle (LRV-3 'Challenger Rover') */}
          <group position={[1.4, 0, 0]} rotation={[0, -0.5, 0]}>
            <Suspense fallback={<HardwareFallback label="Apollo 17 Lunar Rover" />}>
              <NASAHardwareGLB
                modelPath="/models/mondfahrzeug_lunar_rover.glb"
                scale={0.95}
                position={[0, 0, 0]}
                explodedFactor={explodedFactor}
              />
            </Suspense>
            <ContactShadowPlane radius={2.0} isMars={false} />
          </group>

          {/* ALSEP High Gain Telemetry Base Station */}
          <group position={[0.2, 0, -1.8]} rotation={[0, -0.2, 0]}>
            <Suspense fallback={null}>
              <NASAHardwareGLB
                modelPath="/models/lunar_base_station.glb"
                scale={0.035}
                position={[0, 0, 0]}
              />
            </Suspense>
            <ContactShadowPlane radius={1.1} isMars={false} />
          </group>

          {/* Laser Ranging Retroreflector Palette */}
          <group position={[-2.2, 0, 1.2]} rotation={[0, 0.5, 0]}>
            <Suspense fallback={null}>
              <NASAHardwareGLB
                modelPath="/models/lunar_laser_comm.glb"
                scale={0.016}
                position={[0, 0, 0]}
              />
            </Suspense>
            <ContactShadowPlane radius={0.9} isMars={false} />
          </group>

          {showHotspots && (
            <>
              <CyberHotspotPin
                id="orange-soil-sampler"
                activeId={activeHotspotId}
                label="Shorty Crater Orange Soil Trenching Gnomon"
                code="GNOM"
                color="amber"
                position={[-0.8, 0.5, 0.8]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="apollo-astronaut"
                activeId={activeHotspotId}
                label="Harrison Schmitt (Apollo 17 Geologist)"
                code="EVA3"
                color="cyan"
                position={[0, 1.8, 0]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="lunar-antenna"
                activeId={activeHotspotId}
                label="ALSEP Central Telemetry Array"
                code="ALSEP"
                color="blue"
                position={[2.4, 1.4, -1.0]}
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
              scale={0.95}
              position={[0, 0, 0]}
              explodedFactor={explodedFactor}
            />
          </Suspense>

          <ContactShadowPlane radius={3.6} isMars={false} />

          {/* Authentic NASA Apollo Astronaut on Lunar Surface */}
          <group position={[2.2, 0, 1.2]} rotation={[0, -0.6, 0]}>
            <Suspense fallback={null}>
              <AnimatedAstronaut
                position={[0, 0, 0]}
                rotation={[0, -2.4, 0]}
                scale={0.0095}
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

          {/* Authentic NASA Apollo Lunar Laser Retroreflector (LLRR) Payload */}
          <group position={[-2.2, 0, 1.4]} rotation={[0, 0.4, 0]}>
            <Suspense fallback={null}>
              <NASAHardwareGLB
                modelPath="/models/lunar_laser_comm.glb"
                scale={0.014}
                position={[0, 0, 0]}
              />
            </Suspense>
            <ContactShadowPlane radius={1.0} isMars={false} />

            {showHotspots && (
              <CyberHotspotPin
                id="lunar-laser-retro"
                activeId={activeHotspotId}
                label="Laser Ranging Retroreflector (LRRR)"
                code="LRRR"
                color="amber"
                position={[0, 0.9, 0]}
                onClick={handleHotspot}
              />
            )}
          </group>

          {/* Authentic NASA Lunar Base Telemetry Antenna Station */}
          <group position={[2.6, 0, -1.2]} rotation={[0, -0.2, 0]}>
            <Suspense fallback={null}>
              <NASAHardwareGLB
                modelPath="/models/lunar_base_station.glb"
                scale={0.024}
                position={[0, 0, 0]}
              />
            </Suspense>
            <ContactShadowPlane radius={0.9} isMars={false} />

            {showHotspots && (
              <CyberHotspotPin
                id="lunar-antenna"
                activeId={activeHotspotId}
                label="High-Gain S-Band Telemetry Antenna"
                code="ANT"
                color="blue"
                position={[0, 1.4, 0]}
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
                position={[0, 2.5 + explodedFactor * 1.8, 0]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="eagle-descent-stage"
                activeId={activeHotspotId}
                label="Gold Mylar Descent Stage"
                code="MYL"
                color="amber"
                position={[0, 1.0, 1.3]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="apollo-landing-gear"
                activeId={activeHotspotId}
                label="Landing Strut & Footpad"
                code="LGR"
                color="emerald"
                position={[-1.3, 0.35, 0]}
                onClick={handleHotspot}
              />
            </>
          )}
        </group>
      )}

      {/* ======================================================== */}
      {/* 14. LUNAR RECONNAISSANCE ORBITER (LRO)                   */}
      {/* ======================================================== */}
      {isLRO && (
        <group position={[0, 1.2, 0]}>
          <Suspense fallback={<HardwareFallback label="Lunar Reconnaissance Orbiter" />}>
            <NASAHardwareGLB
              modelPath="/models/lunar_orbiter_lro.glb"
              scale={0.16}
              position={[0, 0, 0]}
            />
          </Suspense>

          {showHotspots && (
            <CyberHotspotPin
              id="lroc-camera"
              activeId={activeHotspotId}
              label="LROC Narrow Angle Camera Array"
              code="LROC"
              color="cyan"
              position={[0, 1.6, 0]}
              onClick={handleHotspot}
            />
          )}
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
              scale={0.18}
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
                position={[0, 3.8 + explodedFactor * 2.0, 0]}
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
              scale={1.4}
              position={[0, 0, 0]}
            />
          </Suspense>

          <ContactShadowPlane radius={1.6} isMars={true} />

          {showHotspots && (
            <CyberHotspotPin
              id="rotor-system"
              activeId={activeHotspotId}
              label="Dual Counter-Rotating Rotors (2400 RPM)"
              code="RTR"
              color="cyan"
              position={[0, 1.4, 0]}
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
      {/* 18. NASA LADEE LUNAR DUST & ATMOSPHERE EXPLORER          */}
      {/* ======================================================== */}
      {isLADEE && (
        <group position={[0, 1.2, 0]}>
          <Suspense fallback={<HardwareFallback label="NASA LADEE Lunar Orbiter" />}>
            <NASAHardwareGLB
              modelPath="/models/lunar_ladee.glb"
              scale={0.42}
              position={[0, 0, 0]}
            />
          </Suspense>
          <ContactShadowPlane radius={1.4} isMars={false} />

          {showHotspots && (
            <>
              <CyberHotspotPin
                id="ladee-ldex"
                activeId={activeHotspotId}
                label="LDEX Lunar Dust Experiment Sensor"
                code="LDEX"
                color="cyan"
                position={[0, 0.8, 0.6]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="ladee-nms"
                activeId={activeHotspotId}
                label="Neutral Mass Spectrometer (NMS)"
                code="NMS"
                color="amber"
                position={[-0.6, 0.5, 0]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="ladee-llcd"
                activeId={activeHotspotId}
                label="Lunar Laser Comm Demonstration (LLCD 622 Mbps)"
                code="LLCD"
                color="emerald"
                position={[0.5, 0.9, -0.4]}
                onClick={handleHotspot}
              />
            </>
          )}
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
                scale={0.015}
                position={[0, 0, 0]}
              />
            </Suspense>
            <ContactShadowPlane radius={3.2} isMars={false} />
          </group>

          {/* Lunar Base Communications & Solar Mast */}
          <group position={[3.2, 0, -1.5]} rotation={[0, -0.4, 0]}>
            <Suspense fallback={null}>
              <NASAHardwareGLB
                modelPath="/models/lunar_base_station.glb"
                scale={0.035}
                position={[0, 0, 0]}
              />
            </Suspense>
            <ContactShadowPlane radius={1.2} isMars={false} />
          </group>

          {/* Lunar Rover Vehicle (LRV) Parked at Airlock */}
          <group position={[-2.8, 0, 1.8]} rotation={[0, 0.8, 0]}>
            <Suspense fallback={null}>
              <NASAHardwareGLB
                modelPath="/models/mondfahrzeug_lunar_rover.glb"
                scale={0.75}
                position={[0, 0, 0]}
              />
            </Suspense>
            <ContactShadowPlane radius={1.8} isMars={false} />
          </group>

          {/* Artemis Moonwalker Astronaut Inspecting Habitat Exterior */}
          <group position={[1.4, 0, 1.6]} rotation={[0, -1.6, 0]}>
            <Suspense fallback={null}>
              <AnimatedAstronaut
                position={[0, 0, 0]}
                rotation={[0, 0, 0]}
                scale={0.0095}
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
                position={[3.2, 1.5, -1.5]}
                onClick={handleHotspot}
              />
              <CyberHotspotPin
                id="apollo15-lrv"
                activeId={activeHotspotId}
                label="Artemis Lunar Terrain Vehicle (LTV)"
                code="LTV"
                color="amber"
                position={[-2.8, 0.8, 1.8]}
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

// Preload hardware models with Draco
useGLTF.preload('/models/perseverance.glb', '/draco/');
useGLTF.preload('/models/curiosity.glb');
useGLTF.preload('/models/apollo_lunar_module.glb', '/draco/');
useGLTF.preload('/models/tripo_astronaut_2_stylized_and_animated.glb');
useGLTF.preload('/models/mondfahrzeug_lunar_rover.glb', '/draco/');
useGLTF.preload('/models/isro_chandrayyan-3_mission_lander_module_vikram.glb', '/draco/');
useGLTF.preload('/models/viking_lander.glb', '/draco/');
useGLTF.preload('/models/lunar_laser_comm.glb', '/draco/');
useGLTF.preload('/models/lunar_base_station.glb', '/draco/');
useGLTF.preload('/models/lunar_habitat.glb', '/draco/');
useGLTF.preload('/models/lunar_ladee.glb', '/draco/');
useGLTF.preload('/models/lunar_orbiter_lro.glb', '/draco/');
useGLTF.preload('/models/rocket_saturn_v.glb', '/draco/');
useGLTF.preload('/models/ingenuity.glb', '/draco/');
useGLTF.preload('/models/insight.glb', '/draco/');
useGLTF.preload('/models/jwst.glb', '/draco/');
useGLTF.preload('/models/iss.glb', '/draco/');
useGLTF.preload('/models/mro.glb', '/draco/');
useGLTF.preload('/models/voyager.glb', '/draco/');
