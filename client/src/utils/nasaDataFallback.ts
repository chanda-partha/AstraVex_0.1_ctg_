import { DestinationType, HardwareItem, ResolvedNasaPayload } from '../types';
import { computeMissionLiveTelemetry } from './liveTelemetry';

export const CLIENT_FALLBACK_MISSIONS: Record<string, ResolvedNasaPayload> = {
  // MARS MISSIONS
  perseverance: {
    timestamp: new Date().toISOString(),
    destination: 'Mars',
    mission: {
      id: 'perseverance',
      name: 'Mars 2020 Perseverance & Ingenuity',
      destination: 'Mars',
      locationName: 'Jezero Crater River Delta (18.44° N, 77.45° E)',
      coordinates: { lat: 18.44, lon: 77.45 },
      launchDate: '2020-07-30',
      landingDate: '2021-02-18',
      status: 'Operational',
      nasaConfirmedStatus: 'Active Science Operations — Sol 1240+',
      purpose: 'Seek signs of ancient microbial biosignatures, collect rock core samples for Mars Sample Return, and test MOXIE oxygen generation.',
      scientificContribution: 'Demonstrated first powered aerodynamic flight on another planet (Ingenuity 72 flights); converted atmospheric CO2 to breathable O2.',
      agency: 'NASA / JPL-Caltech',
      officialUrl: 'https://mars.nasa.gov/mars2020/',
      hardware: [],
    },
    hardware: {
      id: 'supercam',
      name: 'SuperCam Masthead Laser & Micro-Imager',
      type: 'Laser-Induced Breakdown Spectroscopy & Raman',
      purpose: 'Remote mineralogy, elemental chemistry, and sound recording from up to 7 meters away.',
      scientificFunction: 'Fires infrared laser pulses to vaporize microscopic rock targets, analyzing the glowing plasma flash for biosignatures.',
      status: 'Operational',
      instruments: ['Nd:YAG Laser', 'Raman Spectrometer', 'Visible Infrared Imager', 'Scientific Microphone'],
      model3dType: 'rover-perseverance',
      hotspots: [
        {
          id: 'supercam',
          label: 'SuperCam Mast Laser',
          code: 'SC',
          position: [0.3, 1.9, 0.7],
          cameraOffset: [2.4, 2.4, 2.4],
          cameraLookAt: [0.3, 1.8, 0.7],
          description: 'High-energy pulsed laser firing at rock targets to analyze chemical spectra and record Martian atmospheric audio.'
        },
        {
          id: 'moxie',
          label: 'MOXIE Oxygen Generator',
          code: 'MOX',
          position: [-0.8, 0.8, 0],
          cameraOffset: [-2.8, 1.6, 1.8],
          cameraLookAt: [-0.8, 0.8, 0],
          description: 'Solid oxide electrolysis module producing 12 grams of pure oxygen per hour from Martian atmospheric carbon dioxide.'
        },
        {
          id: 'pixl',
          label: 'PIXL & SHERLOC Robotic Arm',
          code: 'PXL',
          position: [-0.3, 0.6, 1.3],
          cameraOffset: [-2.2, 1.4, 2.8],
          cameraLookAt: [-0.3, 0.6, 1.3],
          description: 'Micro-focus X-ray fluorescence spectrometer identifying fine-scale elemental chemistry and organic molecules.'
        },
        {
          id: 'rimfax',
          label: 'RIMFAX Ground-Penetrating Radar',
          code: 'RMF',
          position: [0, 0.6, -1.2],
          cameraOffset: [1.8, 1.4, -2.8],
          cameraLookAt: [0, 0.6, -1.2],
          description: 'Ground-penetrating radar probing subterranean geologic strata down to 10 meters depth beneath Jezero Crater.'
        },
        {
          id: 'ingenuity',
          label: 'Ingenuity Mars Helicopter Drone',
          code: 'ING',
          position: [2.6, 0.4, 0.8],
          cameraOffset: [4.2, 1.8, 2.4],
          cameraLookAt: [2.6, 0.4, 0.8],
          description: 'Twin counter-rotating 1.2m carbon-fiber rotors rotating at 2,400 RPM for autonomous flight in thin Martian air.'
        }
      ]
    },
    allHardware: [],
    images: [
      {
        title: 'Perseverance Rover at Jezero Delta',
        description: 'Mastcam-Z multispectral panorama of the ancient river delta fan in Jezero Crater.',
        nasaId: 'PIA24836',
        date: '2021-03-05',
        imageUrl: 'https://photojournal.jpl.nasa.gov/jpeg/PIA24836.jpg',
        source: 'NASA/JPL-Caltech',
        sourceUrl: 'https://images.nasa.gov'
      }
    ],
    sourceAttribution: {
      agency: 'NASA / JPL-Caltech',
      dataset: 'NASA PDS (Planetary Data System)',
      retrievedAt: new Date().toISOString(),
      license: 'Public Domain / NASA Guidelines',
      officialMissionPage: 'https://mars.nasa.gov/mars2020/',
      verifiedSources: [
        { name: 'NASA Mars 2020 Mission Page', url: 'https://mars.nasa.gov/mars2020/' },
        { name: 'JPL Perseverance Telemetry', url: 'https://mars.nasa.gov/mars2020/mission/where-is-the-rover/' }
      ]
    }
  },

  curiosity: {
    timestamp: new Date().toISOString(),
    destination: 'Mars',
    mission: {
      id: 'curiosity',
      name: 'Curiosity Mars Science Laboratory (MSL)',
      destination: 'Mars',
      locationName: 'Gale Crater, Mount Sharp (-4.59°, 137.44°)',
      coordinates: { lat: -4.59, lon: 137.44 },
      launchDate: '2011-11-26',
      landingDate: '2012-08-06',
      status: 'Operational',
      nasaConfirmedStatus: 'Active Long-Term Science Traverse — Sol 4300+',
      purpose: 'Assess whether Mars ever had an environment able to support microbial life, exploring stratified sedimentary rock layers.',
      scientificContribution: 'Discovered ancient persistent freshwater lake beds, organic carbon molecules, and cyclic methane bursts in Gale Crater.',
      agency: 'NASA / JPL-Caltech',
      officialUrl: 'https://mars.nasa.gov/msl/',
      hardware: [],
    },
    hardware: {
      id: 'curiosity-chassis',
      name: 'Curiosity Rover Chassis & MMRTG Power Source',
      type: 'Multi-Mission Radioisotope Thermoelectric Generator',
      purpose: 'Nuclear decay heat thermoelectric power producing 110W continuous electrical energy and heating fluid circuits.',
      scientificFunction: 'Powers 10 scientific instruments, 17 cameras, robotic drill, and rover mobility in sub-zero Martian nights.',
      status: 'Operational',
      instruments: ['MMRTG (Plutonium-238)', 'ChemCam', 'SAM Chem Lab', 'Mastcam', 'APXS'],
      model3dType: 'curiosity-chassis',
      hotspots: [
        {
          id: 'curiosity-chassis',
          label: 'MMRTG Nuclear Generator',
          code: 'NUC',
          position: [0, 1.0, 0],
          cameraOffset: [3.6, 2.4, 3.6],
          cameraLookAt: [0, 1.0, 0],
          description: 'Plutonium-238 dioxide decay source generating continuous electricity and warming thermal loops through cold Martian winters.'
        },
        {
          id: 'chemcam',
          label: 'ChemCam Laser Spectrometer',
          code: 'CCAM',
          position: [0.3, 1.9, 0.7],
          cameraOffset: [2.4, 2.4, 2.4],
          cameraLookAt: [0.3, 1.8, 0.7],
          description: 'Fires pulses to identify target rock composition from distance up to 7m.'
        }
      ]
    },
    allHardware: [],
    images: [],
    sourceAttribution: {
      agency: 'NASA / JPL-Caltech',
      dataset: 'NASA Planetary Data System',
      retrievedAt: new Date().toISOString(),
      license: 'Public Domain',
      officialMissionPage: 'https://mars.nasa.gov/msl/',
      verifiedSources: [{ name: 'NASA MSL Archive', url: 'https://mars.nasa.gov/msl/' }]
    }
  },

  insight: {
    timestamp: new Date().toISOString(),
    destination: 'Mars',
    mission: {
      id: 'insight',
      name: 'InSight Mars Geophysical Lander',
      destination: 'Mars',
      locationName: 'Elysium Planitia (4.50°, 135.62°)',
      coordinates: { lat: 4.5, lon: 135.62 },
      launchDate: '2018-05-05',
      landingDate: '2018-11-26',
      status: 'Mission complete',
      nasaConfirmedStatus: 'Mission Complete — 1,319 Marsquakes Detected',
      purpose: 'Investigate the deep interior structure of Mars: crust thickness, mantle convection, and core liquid state.',
      scientificContribution: 'First map of the deep interior of Mars; confirmed liquid metallic core radius of ~1,830 km.',
      agency: 'NASA / CNES / DLR',
      officialUrl: 'https://mars.nasa.gov/insight/',
      hardware: [],
    },
    hardware: {
      id: 'seis',
      name: 'SEIS Ultra-Sensitive Mars Seismometer',
      type: 'Broadband Seismic Sensor Under Wind/Thermal Shield',
      purpose: 'Detect minute tremors, subterranean fractures, and meteorite impacts.',
      scientificFunction: 'Measures ground vibrations at atomic scale across 3 orthogonal seismic pendulum axes.',
      status: 'Mission complete',
      instruments: ['VBB Pendulum', 'Short Period Sensor', 'Wind & Thermal Shield (WTS)'],
      model3dType: 'insight-lander',
      hotspots: []
    },
    allHardware: [],
    images: [],
    sourceAttribution: {
      agency: 'NASA / CNES',
      dataset: 'InSight Seismic Data Archive',
      retrievedAt: new Date().toISOString(),
      license: 'Public Domain',
      officialMissionPage: 'https://mars.nasa.gov/insight/',
      verifiedSources: [{ name: 'NASA InSight Mission', url: 'https://mars.nasa.gov/insight/' }]
    }
  },

  viking: {
    timestamp: new Date().toISOString(),
    destination: 'Mars',
    mission: {
      id: 'viking',
      name: 'Viking 1 Lander',
      destination: 'Mars',
      locationName: 'Chryse Planitia (22.48°, -47.97°)',
      coordinates: { lat: 22.48, lon: -47.97 },
      launchDate: '1975-08-20',
      landingDate: '1976-07-20',
      status: 'Mission complete',
      nasaConfirmedStatus: 'Historic Achievement — First Successful Long-Term Mars Surface Mission',
      purpose: 'Obtain high-resolution surface imagery, characterize atmospheric composition, and search for evidence of Martian biology.',
      scientificContribution: 'First color photographs transmitted from the surface of Mars; characterized atmospheric nitrogen, argon, and diurnal pressures.',
      agency: 'NASA Langley / JPL',
      officialUrl: 'https://www.nasa.gov/viking/',
      hardware: [],
    },
    hardware: {
      id: 'viking-chassis',
      name: 'Viking 1 Lander Chassis & Gas Chromatograph',
      type: 'Autonomous Surface Laboratory',
      purpose: 'Surface biology experiments and meteorology.',
      scientificFunction: 'Trenching scoop, pyrolytic release, labeled release, and gas exchange experiment chamber.',
      status: 'Mission complete',
      instruments: ['GCMS', 'Surface Sampler Arm', 'Meteorology Boom', 'Facsimile Cameras'],
      model3dType: 'viking-lander',
      hotspots: []
    },
    allHardware: [],
    images: [],
    sourceAttribution: {
      agency: 'NASA',
      dataset: 'Viking 1 Mission Archive',
      retrievedAt: new Date().toISOString(),
      license: 'Public Domain',
      officialMissionPage: 'https://www.nasa.gov/viking/',
      verifiedSources: [{ name: 'NASA Viking Archive', url: 'https://www.nasa.gov/viking/' }]
    }
  },

  mro: {
    timestamp: new Date().toISOString(),
    destination: 'Mars',
    mission: {
      id: 'mro',
      name: 'Mars Reconnaissance Orbiter (MRO)',
      destination: 'Mars',
      locationName: 'Sun-Synchronous Polar Mars Orbit (250–316 km)',
      coordinates: { lat: 0, lon: 0 },
      launchDate: '2005-08-12',
      landingDate: '2006-03-10',
      status: 'Operational',
      nasaConfirmedStatus: 'Active Science & DSN Relay Hub',
      purpose: 'Ultra-high-resolution orbital reconnaissance and high-speed data communications relay for surface rovers.',
      scientificContribution: 'Over 400,000 terabits relayed; discovered recurring slope lineae (RSL) and shallow subsurface glaciers.',
      agency: 'NASA JPL',
      officialUrl: 'https://mars.nasa.gov/mro/',
      hardware: [],
    },
    hardware: {
      id: 'hirise',
      name: 'HiRISE 0.5m Optical Reflecting Telescope',
      type: 'High Resolution Imaging Science Experiment',
      purpose: 'Sub-meter orbital imaging of Martian surface features.',
      scientificFunction: 'Resolves objects down to 30 cm per pixel across 6-km swaths from orbital altitude of 300 km.',
      status: 'Operational',
      instruments: ['0.5m Cassegrain Telescope', '14 CCD Detectors', 'Time Delay Integration'],
      model3dType: 'mro-orbiter',
      hotspots: []
    },
    allHardware: [],
    images: [],
    sourceAttribution: {
      agency: 'NASA JPL',
      dataset: 'MRO HiRISE Repository',
      retrievedAt: new Date().toISOString(),
      license: 'Public Domain',
      officialMissionPage: 'https://mars.nasa.gov/mro/',
      verifiedSources: [{ name: 'MRO Mission Page', url: 'https://mars.nasa.gov/mro/' }]
    }
  },

  // MOON MISSIONS
  apollo11: {
    timestamp: new Date().toISOString(),
    destination: 'Moon',
    mission: {
      id: 'apollo11',
      name: 'Apollo 11 Lunar Module (Eagle)',
      destination: 'Moon',
      locationName: 'Mare Tranquillitatis / Tranquility Base (0.67°, 23.47°)',
      coordinates: { lat: 0.67, lon: 23.47 },
      launchDate: '1969-07-16',
      landingDate: '1969-07-20',
      status: 'Mission complete',
      nasaConfirmedStatus: 'Historic Triumph — First Human Moon Landing',
      purpose: 'Perform first human crewed lunar landing, deploy EASEP science experiments, and return pristine lunar rock samples.',
      scientificContribution: 'Returned 21.55 kg of lunar rock and soil; installed Lunar Laser Ranging Retroreflector still operational today.',
      agency: 'NASA',
      officialUrl: 'https://www.nasa.gov/mission_pages/apollo/missions/apollo11.html',
      hardware: [],
    },
    hardware: {
      id: 'eagle-descent-stage',
      name: 'Lunar Module Descent Stage (LM-5 Eagle)',
      type: 'Crewed Lunar Descent & Landing Engine',
      purpose: 'Controlled powered descent from lunar orbit to surface touchdown.',
      scientificFunction: 'Throttleable hypergolic rocket engine (Aerozine-50 and N2O4) producing 4,500 to 45,000 N thrust; served as launch pad for Ascent Stage.',
      status: 'Mission complete',
      instruments: ['DPS Engine', 'Landing Radar', 'EASEP Science Package', 'Laser Retroreflector'],
      model3dType: 'apollo-lunar-module',
      hotspots: [
        {
          id: 'eagle-descent-stage',
          label: 'Descent Propulsion Engine (DPS)',
          code: 'DPS',
          position: [0, 1.2, 0.4],
          cameraOffset: [4.8, 2.4, 4.8],
          cameraLookAt: [0, 1.2, 0.4],
          description: 'Gimbaled throttleable engine (9,870 lbf thrust) executing the historic 12-minute powered descent to Tranquility Base.'
        },
        {
          id: 'apollo-landing-gear',
          label: 'Landing Gear & 68-inch Surface Probes',
          code: 'GEAR',
          position: [-1.3, 0.35, 0],
          cameraOffset: [-3.8, 1.6, 2.2],
          cameraLookAt: [-1.3, 0.35, 0],
          description: 'Cantilever crushable aluminum honeycomb struts with footpads and contact sensing probes triggering the contact light.'
        },
        {
          id: 'lunar-laser-retro',
          label: 'Laser Ranging Retroreflector (LRRR)',
          code: 'LRRR',
          position: [-2.2, 0.4, 1.4],
          cameraOffset: [-3.8, 1.6, 3.0],
          cameraLookAt: [-2.2, 0.4, 1.4],
          description: 'Array of 100 quartz corner-cube prisms bouncing Earth laser pulses to measure Moon distance with millimeter precision.'
        }
      ]
    },
    allHardware: [],
    images: [],
    sourceAttribution: {
      agency: 'NASA History Office',
      dataset: 'Apollo 11 Lunar Surface Journal',
      retrievedAt: new Date().toISOString(),
      license: 'Public Domain',
      officialMissionPage: 'https://www.nasa.gov/mission_pages/apollo/missions/apollo11.html',
      verifiedSources: [{ name: 'NASA Apollo 11 Journal', url: 'https://www.nasa.gov/mission_pages/apollo/apollo-11.html' }]
    }
  },

  apollo15: {
    timestamp: new Date().toISOString(),
    destination: 'Moon',
    mission: {
      id: 'apollo15',
      name: 'Apollo 15 Lunar Roving Vehicle (LRV)',
      destination: 'Moon',
      locationName: 'Hadley-Apennine Canyon (26.13°, 3.63°)',
      coordinates: { lat: 26.13, lon: 3.63 },
      launchDate: '1971-07-26',
      landingDate: '1971-07-30',
      status: 'Mission complete',
      nasaConfirmedStatus: 'Historic — First Wheeled Human Driving on Another World',
      purpose: 'Greatly expand scientific exploration range across Hadley Rille canyon and Apennine mountains using the Lunar Rover.',
      scientificContribution: 'Covered 27.9 km across the lunar regolith; discovered Genesis Rock (anorthosite sample dated to 4.1 billion years old).',
      agency: 'NASA',
      officialUrl: 'https://www.nasa.gov/mission_pages/apollo/missions/apollo15.html',
      hardware: [],
    },
    hardware: {
      id: 'apollo15-lrv',
      name: 'Lunar Roving Vehicle (LRV-001 Moon Buggy)',
      type: 'Manned Electric Lunar Exploration Vehicle',
      purpose: 'Electric 4-wheel drive rover carrying two astronauts and 490 kg of scientific equipment.',
      scientificFunction: 'Four 0.25-hp DC electric wheel motors powered by 36V silver-zinc batteries, with woven zinc-coated steel wire mesh tires.',
      status: 'Mission complete',
      instruments: ['Wire Mesh Wheels', 'High-Gain Dish Antenna', 'RCA Color TV Camera', 'Lunar Surface Drill'],
      model3dType: 'lunar-rover',
      hotspots: [
        {
          id: 'apollo15-lrv',
          label: 'Lunar Buggy Tubular Chassis',
          code: 'LRV',
          position: [0, 0.6, 0],
          cameraOffset: [3.4, 2.0, 3.0],
          cameraLookAt: [0, 0.6, 0],
          description: 'Welded aluminum alloy 2219 frame with fold-flat deployment system carried in the LM quadrant bay.'
        },
        {
          id: 'lrv-antenna',
          label: 'Steerable High-Gain S-Band Dish',
          code: 'ANT',
          position: [0.4, 1.6, 0.6],
          cameraOffset: [2.6, 2.4, 2.6],
          cameraLookAt: [0.4, 1.6, 0.6],
          description: 'Direct communications dish transmitting live color TV and biometric telemetry back to Houston mission control.'
        }
      ]
    },
    allHardware: [],
    images: [],
    sourceAttribution: {
      agency: 'NASA',
      dataset: 'Apollo 15 Preliminary Science Report',
      retrievedAt: new Date().toISOString(),
      license: 'Public Domain',
      officialMissionPage: 'https://www.nasa.gov/mission_pages/apollo/missions/apollo15.html',
      verifiedSources: [{ name: 'NASA Apollo 15 Archive', url: 'https://www.nasa.gov/mission_pages/apollo/missions/apollo15.html' }]
    }
  },

  chandrayaan3: {
    timestamp: new Date().toISOString(),
    destination: 'Moon',
    mission: {
      id: 'chandrayaan3',
      name: 'Chandrayaan-3 Vikram Lander & Pragyan Rover',
      destination: 'Moon',
      locationName: 'Shiv Shakti Point, Lunar South Pole (-69.37°, 32.35°)',
      coordinates: { lat: -69.37, lon: 32.35 },
      launchDate: '2023-07-14',
      landingDate: '2023-08-23',
      status: 'Mission complete',
      nasaConfirmedStatus: 'Historic — First Soft Landing Near the Lunar South Pole',
      purpose: 'Demonstrate soft landing and mobility on lunar polar terrain; measure in-situ thermal properties and elemental composition.',
      scientificContribution: 'Discovered steep thermal gradient in lunar regolith (60°C on surface vs -10°C at 8cm depth); confirmed sulfur signatures with LIBS.',
      agency: 'ISRO (India)',
      officialUrl: 'https://www.isro.gov.in/Chandrayaan3.html',
      hardware: [],
    },
    hardware: {
      id: 'vikram-lander',
      name: 'Vikram Lander Module (Ch-3)',
      type: 'Lunar Polar Soft-Landing Craft',
      purpose: 'High-latitude soft landing with four 800N throttleable liquid engines and hazard detection avionics.',
      scientificFunction: 'Houses scientific payloads: ChaSTE (thermal probe), RAMBHA (Langmuir plasma probe), ILSA (seismometer).',
      status: 'Mission complete',
      instruments: ['ChaSTE Thermal Probe', 'RAMBHA-LP Plasma Probe', 'ILSA Seismometer', 'Laser Retroreflector'],
      model3dType: 'chandrayaan3-vikram',
      hotspots: [
        {
          id: 'vikram-lander',
          label: 'Vikram Quad Propulsion Module',
          code: 'VIK',
          position: [0, 1.4, 0],
          cameraOffset: [4.2, 2.4, 4.2],
          cameraLookAt: [0, 1.4, 0],
          description: 'Four 800N throttleable liquid bipropellant thrusters ensuring controlled landing near crater-rich south pole.'
        },
        {
          id: 'pragyan-rover',
          label: 'Pragyan 6-Wheel Rover & Ramp',
          code: 'PRG',
          position: [0.8, 0.6, 0.6],
          cameraOffset: [2.8, 1.6, 2.4],
          cameraLookAt: [0.8, 0.6, 0.6],
          description: '26 kg solar-powered rover with rocker-bogie suspension and APXS/LIBS instruments analyzing polar soil.'
        }
      ]
    },
    allHardware: [],
    images: [],
    sourceAttribution: {
      agency: 'ISRO',
      dataset: 'ISRO Space Science Data Centre',
      retrievedAt: new Date().toISOString(),
      license: 'ISRO Public Release',
      officialMissionPage: 'https://www.isro.gov.in/Chandrayaan3.html',
      verifiedSources: [{ name: 'ISRO Chandrayaan-3 Portal', url: 'https://www.isro.gov.in/Chandrayaan3.html' }]
    }
  },

  apollo17: {
    timestamp: new Date().toISOString(),
    destination: 'Moon',
    mission: {
      id: 'apollo17',
      name: 'Apollo 17 Taurus-Littrow Station',
      destination: 'Moon',
      locationName: 'Taurus-Littrow Valley (20.19°, 30.77°)',
      coordinates: { lat: 20.19, lon: 30.77 },
      launchDate: '1972-12-07',
      landingDate: '1972-12-11',
      status: 'Mission complete',
      nasaConfirmedStatus: 'Historic — Final Crewed Lunar Surface Mission',
      purpose: 'Advanced geologic and highland/mare interface exploration by trained geologist Dr. Harrison Schmitt.',
      scientificContribution: 'Returned 110.5 kg of lunar samples; discovered volcanic orange pyroclastic soil beads at Shorty Crater.',
      agency: 'NASA',
      officialUrl: 'https://www.nasa.gov/mission_pages/apollo/missions/apollo17.html',
      hardware: [],
    },
    hardware: {
      id: 'orange-soil-sampler',
      name: 'Lunar Extravehicular Mobility Suit & Sampler',
      type: 'A7LB Pressure Suit & Geologic Trenching Core',
      purpose: 'Geologic exploration and deep core drilling on lunar surface.',
      scientificFunction: 'Water-cooled undergarment, primary life support backpack, and rotary percussion core drill.',
      status: 'Mission complete',
      instruments: ['A7LB Pressure Suit', 'Trench Tool', 'Core Sampler', 'Lunar Traverse Gravimeter'],
      model3dType: 'apollo17-station',
      hotspots: [
        {
          id: 'orange-soil-sampler',
          label: 'Shorty Crater Orange Soil & Gnomon',
          code: 'GNOM',
          position: [-0.9, 0.55, 1.25],
          cameraOffset: [-2.6, 1.4, 2.8],
          cameraLookAt: [-0.9, 0.45, 1.25],
          description: 'Volcanic pyroclastic glass beads discovered by Harrison Schmitt on Taurus-Littrow EVA-2.'
        },
        {
          id: 'apollo17-lrv',
          label: 'Apollo 17 Lunar Roving Vehicle (LRV-3)',
          code: 'LRV3',
          position: [1.85, 0.9, -0.5],
          cameraOffset: [4.2, 2.0, 2.2],
          cameraLookAt: [1.85, 0.7, -0.5],
          description: 'Third electric crewed rover covering 35.7 km across Taurus-Littrow Valley.'
        }
      ]
    },
    allHardware: [],
    images: [],
    sourceAttribution: {
      agency: 'NASA',
      dataset: 'Apollo 17 Lunar Surface Journal',
      retrievedAt: new Date().toISOString(),
      license: 'Public Domain',
      officialMissionPage: 'https://www.nasa.gov/mission_pages/apollo/missions/apollo17.html',
      verifiedSources: [{ name: 'Apollo 17 Mission Archive', url: 'https://www.nasa.gov/mission_pages/apollo/missions/apollo17.html' }]
    }
  },

  lro: {
    timestamp: new Date().toISOString(),
    destination: 'Moon',
    mission: {
      id: 'lro',
      name: 'Lunar Reconnaissance Orbiter (LRO)',
      destination: 'Moon',
      locationName: 'Lunar Polar Circular Orbit (50 km altitude)',
      coordinates: { lat: -89.9, lon: 0 },
      launchDate: '2009-06-18',
      landingDate: '2009-06-23',
      status: 'Operational',
      nasaConfirmedStatus: 'Active Lunar Polar Mapping & Artemis Landing Site Scout',
      purpose: 'High-resolution 3D topographic mapping of the Moon, assessing permanent shadow water ice in polar craters.',
      scientificContribution: 'Over 1 petabyte of lunar data; mapped 99.9% of lunar surface at 0.5m resolution; identified Artemis landing zones.',
      agency: 'NASA Goddard Space Flight Center',
      officialUrl: 'https://lunar.gsfc.nasa.gov/',
      hardware: [],
    },
    hardware: {
      id: 'lroc-camera',
      name: 'LROC Narrow Angle Camera & LOLA Laser Altimeter',
      type: 'Sub-Meter Orbital Optical Suite & Laser Ranger',
      purpose: 'Digital terrain elevation modeling and surface reconnaissance.',
      scientificFunction: 'Fires laser pulses at 28 pulses/sec across 5 beams to measure lunar surface height down to 10 cm accuracy.',
      status: 'Operational',
      instruments: ['LROC NAC', 'LOLA Laser Altimeter', 'Diviner Radiometer', 'LAMP UV Spectrometer'],
      model3dType: 'lro-orbiter',
      hotspots: []
    },
    allHardware: [],
    images: [],
    sourceAttribution: {
      agency: 'NASA Goddard',
      dataset: 'PDS Lunar Data Node',
      retrievedAt: new Date().toISOString(),
      license: 'Public Domain',
      officialMissionPage: 'https://lunar.gsfc.nasa.gov/',
      verifiedSources: [{ name: 'NASA LRO Portal', url: 'https://lunar.gsfc.nasa.gov/' }]
    }
  },

  artemis3: {
    timestamp: new Date().toISOString(),
    destination: 'Moon',
    mission: {
      id: 'artemis3',
      name: 'Artemis III Starship Human Landing System & Base Camp',
      destination: 'Moon',
      locationName: 'Shackleton Crater Polar Rim (-89.9°, 0.0°)',
      coordinates: { lat: -89.9, lon: 0.0 },
      launchDate: '2027-06-01',
      landingDate: '2027-06-07',
      status: 'Planned (Artemis 2027)',
      nasaConfirmedStatus: 'NASA Artemis Flagship — Planned Crewed Lunar South Pole Landing',
      purpose: 'Land the first woman and next man at the lunar south pole, establish Artemis Base Camp, and prospect permanently shadowed water ice.',
      scientificContribution: 'Deep cryogenic volatile sampling, long-duration polar surface operations, and foundational infrastructure for permanent lunar presence.',
      agency: 'NASA / SpaceX',
      officialUrl: 'https://www.nasa.gov/artemis-program/',
      hardware: [],
    },
    hardware: {
      id: 'hls-crew-cabin',
      name: 'Starship Human Landing System (HLS)',
      type: 'Crewed Interplanetary Lander & Surface Habitat',
      purpose: 'Transport 4 Artemis astronauts from lunar orbit to the South Pole surface and support up to 30 days of surface EVA missions.',
      scientificFunction: 'Houses pressurized quarters, airlocks, surface cargo crane, Raptor 2 methalox engines, and deep-space comms.',
      status: 'Operational',
      instruments: ['Pressurized Crew Cabin', 'Astronaut Elevator', 'Solar Array Wrap', 'Raptor 2 Engines', 'Base Camp Habitat'],
      model3dType: 'starship-hls',
      hotspots: [
        {
          id: 'hls-crew-cabin',
          label: 'Pressurized Crew Cabin',
          code: 'CABIN',
          position: [0, 5.8, 1.0],
          cameraOffset: [4.2, 6.2, 4.2],
          cameraLookAt: [0, 5.8, 1.0],
          description: 'Upper pressurized volume providing living quarters, life support systems, and navigation cockpit for 4 astronauts.'
        },
        {
          id: 'hls-elevator',
          label: 'Astronaut Surface Elevator',
          code: 'LIFT',
          position: [0, 2.2, 1.3],
          cameraOffset: [2.8, 2.6, 3.2],
          cameraLookAt: [0, 2.2, 1.3],
          description: 'Cable-driven lift platform lowering suited astronauts and scientific gear 30 meters down to the lunar regolith.'
        },
        {
          id: 'hls-solar-wrap',
          label: 'Photovoltaic Solar Wrap',
          code: 'SOLAR',
          position: [-1.2, 3.8, 0],
          cameraOffset: [-3.8, 4.2, 2.2],
          cameraLookAt: [-1.2, 3.8, 0],
          description: 'Circumferential high-efficiency solar array generating 100 kW continuous electrical power in low grazing polar sunlight.'
        },
        {
          id: 'hls-landing-legs',
          label: 'Wide-Stance Landing Gear',
          code: 'LEGS',
          position: [1.5, 0.4, 0],
          cameraOffset: [3.8, 1.2, 2.4],
          cameraLookAt: [1.5, 0.4, 0],
          description: 'Six heavy articulated shock struts with wide footpads engineered to absorb touchdown dynamics on uneven polar slopes.'
        },
        {
          id: 'hls-raptor-engines',
          label: 'Raptor 2 Methalox Engines',
          code: 'RAPTOR',
          position: [0, 0.6, -0.9],
          cameraOffset: [2.8, 1.2, -2.8],
          cameraLookAt: [0, 0.6, -0.9],
          description: 'Full-flow staged combustion engines burning liquid methane and oxygen (CH4/LOX) with deep throttle control.'
        },
        {
          id: 'lunar-habitat',
          label: 'Artemis Base Camp Habitat',
          code: 'HAB',
          position: [0, 1.2, 0],
          cameraOffset: [3.6, 2.2, 3.6],
          cameraLookAt: [0, 1.2, 0],
          description: 'Inflatable surface habitat dome providing long-duration life support and radiation shielding at Shackleton Crater.'
        },
        {
          id: 'hls-astronaut',
          label: 'Axiom AxEMU Polar Suit',
          code: 'EVA',
          position: [2.3, 0.9, 1.8],
          cameraOffset: [4.3, 1.9, 3.4],
          cameraLookAt: [2.3, 0.9, 1.8],
          description: 'Next-generation polar extravehicular spacesuit engineered for Shackleton Crater thermal extremes.'
        },
        {
          id: 'hls-antenna',
          label: 'LunaNet Polar Relay Mast',
          code: 'RELAY',
          position: [-2.6, 1.2, 2.2],
          cameraOffset: [-4.6, 2.2, 3.8],
          cameraLookAt: [-2.6, 1.2, 2.2],
          description: 'High-gain Ka-band and optical relay tower connecting south-polar EVA crews with Lunar Gateway.'
        }
      ]
    },
    allHardware: [],
    images: [],
    sourceAttribution: {
      agency: 'NASA / SpaceX',
      dataset: 'NASA Artemis Accord & HLS Archive',
      retrievedAt: new Date().toISOString(),
      license: 'Public Domain / NASA Guidelines',
      officialMissionPage: 'https://www.nasa.gov/artemis-program/',
      verifiedSources: [{ name: 'NASA Artemis Program', url: 'https://www.nasa.gov/artemis-program/' }]
    }
  },

  ladee: {
    timestamp: new Date().toISOString(),
    destination: 'Moon',
    mission: {
      id: 'ladee',
      name: 'NASA LADEE (Lunar Atmosphere & Dust Environment Explorer)',
      destination: 'Moon',
      locationName: 'Equatorial Lunar Orbit (20–60 km altitude)',
      coordinates: { lat: 10.8, lon: -91.6 },
      launchDate: '2013-09-06',
      landingDate: '2014-04-18',
      status: 'Mission complete',
      nasaConfirmedStatus: 'Groundbreaking Science — Lunar Exospheric Dust & Record 622 Mbps Laser Comm',
      purpose: 'Characterize the tenuous lunar atmosphere and dust environment, demonstrating high-bandwidth optical laser space communications.',
      scientificContribution: 'Confirmed continuous asymmetric exospheric dust clouds lofted by meteoroids; achieved historic 622 Mbps error-free Earth laser downlink.',
      agency: 'NASA Ames Research Center',
      officialUrl: 'https://www.nasa.gov/mission_pages/ladee/main/',
      hardware: [],
    },
    hardware: {
      id: 'ladee-ldex',
      name: 'Lunar Dust Experiment (LDEX) & Laser Comm',
      type: 'Impact Ionization Dust Sensor & Optical Terminal',
      purpose: 'Detect and measure sub-micron charged lunar dust grains in orbit.',
      scientificFunction: 'Impact ionization target resolving individual dust impacts; coupled with LLCD 1550nm infrared optical laser transceiver.',
      status: 'Mission complete',
      instruments: ['LDEX Dust Sensor', 'NMS Neutral Mass Spectrometer', 'UVS Ultraviolet Spectrometer', 'LLCD Laser Terminal'],
      model3dType: 'lunar-ladee',
      hotspots: [
        {
          id: 'ladee-ldex',
          label: 'LDEX Dust Sensor',
          code: 'LDEX',
          position: [0, 0.8, 0.6],
          cameraOffset: [2.2, 1.4, 2.2],
          cameraLookAt: [0, 0.8, 0.6],
          description: 'Impact ionization detector sensing high-altitude dust clouds generated by micrometeorite impacts on the Moon.'
        },
        {
          id: 'ladee-nms',
          label: 'Neutral Mass Spectrometer',
          code: 'NMS',
          position: [-0.6, 0.5, 0],
          cameraOffset: [-2.2, 1.2, 1.8],
          cameraLookAt: [-0.6, 0.5, 0],
          description: 'Quadrupole spectrometer sampling exospheric volatile gases including Helium, Argon-40, and Neon.'
        },
        {
          id: 'ladee-llcd',
          label: 'Laser Comm Terminal (LLCD)',
          code: 'LLCD',
          position: [0.5, 0.9, -0.4],
          cameraOffset: [2.4, 1.6, -1.8],
          cameraLookAt: [0.5, 0.9, -0.4],
          description: 'Pulsed infrared 1550nm laser beam achieving record 622 Mbps broadband data downlink from lunar orbit.'
        }
      ]
    },
    allHardware: [],
    images: [],
    sourceAttribution: {
      agency: 'NASA Ames',
      dataset: 'NASA PDS LADEE Node',
      retrievedAt: new Date().toISOString(),
      license: 'Public Domain',
      officialMissionPage: 'https://www.nasa.gov/mission_pages/ladee/main/',
      verifiedSources: [{ name: 'NASA LADEE Overview', url: 'https://www.nasa.gov/mission_pages/ladee/main/' }]
    }
  },
  change4: {
    timestamp: new Date().toISOString(),
    destination: 'Moon',
    mission: {
      id: 'change4',
      name: "Chang'e 4 & Yutu-2 (Lunar Far Side)",
      destination: 'Moon',
      locationName: 'Von Kármán Crater, South Pole-Aitken Basin',
      coordinates: { lat: -45.457, lon: 177.588 },
      launchDate: '2018-12-07',
      landingDate: '2019-01-03',
      status: 'Operational',
      nasaConfirmedStatus: 'Active Far-Side Lunar Operations since January 2019',
      purpose: "Execute humanity's first soft landing on the Moon's far side and survey subsurface regolith inside the South Pole-Aitken basin.",
      scientificContribution: 'Mapped subsurface regolith down to 40m via Lunar Penetrating Radar and analyzed upper lunar mantle minerals.',
      agency: 'CNSA / NASA NSSDCA Record',
      officialUrl: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2018-103A',
      hardware: [],
    },
    hardware: {
      id: 'yutu2-rover',
      name: "Yutu-2 ('Jade Rabbit 2') Rover & LPR Radar",
      type: 'Far-Side Robotic Rover',
      purpose: 'Map lunar far-side subsurface stratigraphy and mantle mineral composition.',
      scientificFunction: 'Dual-frequency 60 MHz / 500 MHz Lunar Penetrating Radar combined with VNIS optical imaging spectrometer.',
      status: 'Operational',
      instruments: ['LPR Ground-Penetrating Radar', 'VNIS Imaging Spectrometer', 'ASAN Neutral Atom Analyzer'],
      model3dType: 'change4-yutu2',
      hotspots: [
        {
          id: 'yutu2-rover',
          label: 'Yutu-2 Solar Winged Rover',
          code: 'YUTU2',
          position: [0, 0.8, 0.4],
          cameraOffset: [2.6, 1.6, 2.6],
          cameraLookAt: [0, 0.6, 0.2],
          description: 'First robotic rover to explore the far side of the Moon inside South Pole-Aitken basin.'
        },
        {
          id: 'lpr-radar',
          label: 'Lunar Penetrating Radar (LPR)',
          code: 'LPR',
          position: [0, 0.45, -0.6],
          cameraOffset: [2.2, 1.3, -2.2],
          cameraLookAt: [0, 0.45, -0.6],
          description: 'Maps layered ejecta blankets and ancient basalt flows beneath Von Kármán Crater.'
        }
      ]
    },
    allHardware: [],
    images: [],
    sourceAttribution: {
      agency: 'CNSA / NASA NSSDCA',
      dataset: 'NSSDCA Lunar Far Side Archive',
      retrievedAt: new Date().toISOString(),
      license: 'Public Research Record',
      officialMissionPage: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2018-103A',
      verifiedSources: [{ name: 'NASA NSSDCA Record', url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2018-103A' }]
    }
  },
  surveyor3: {
    timestamp: new Date().toISOString(),
    destination: 'Moon',
    mission: {
      id: 'surveyor3',
      name: 'Surveyor 3 Lunar Lander',
      destination: 'Moon',
      locationName: 'Oceanus Procellarum (Visited by Apollo 12)',
      coordinates: { lat: -3.016, lon: -23.418 },
      launchDate: '1967-04-17',
      landingDate: '1967-04-20',
      status: 'Mission Complete',
      nasaConfirmedStatus: 'Historic Precursor Site Inspected by Apollo 12 Crew (Nov 1969)',
      purpose: 'Verify lunar regolith load-bearing strength with robotic soil trenches ahead of crewed Apollo landings.',
      scientificContribution: 'Captured 6,300+ surface frames, excavated four soil trenches, and had its camera returned by Apollo 12 crew.',
      agency: 'NASA / JPL',
      officialUrl: 'https://science.nasa.gov/mission/surveyor-3/',
      hardware: [],
    },
    hardware: {
      id: 'surveyor3-sampler',
      name: 'Soil Mechanics Surface Sampler',
      type: 'Robotic Pantograph Trenching Arm',
      purpose: 'Test lunar regolith bearing strength and cohesion prior to Apollo landings.',
      scientificFunction: 'Extendable scoop arm executing bearing, trenching, and impact mechanics experiments under Earth command.',
      status: 'Mission complete',
      instruments: ['Pantograph Surface Sampler', 'Steerable Vidicon TV Camera', 'Alpha Scattering Sensor'],
      model3dType: 'surveyor3-lander',
      hotspots: [
        {
          id: 'surveyor3-sampler',
          label: 'Soil Mechanics Pantograph Scoop',
          code: 'SMSS',
          position: [0.65, 0.45, 0.95],
          cameraOffset: [2.6, 1.4, 2.6],
          cameraLookAt: [0.65, 0.35, 0.95],
          description: 'Extendable accordion claw arm that excavated four soil trenches ahead of Apollo.'
        }
      ]
    },
    allHardware: [],
    images: [
      {
        title: 'Apollo 12 Astronaut Inspects Surveyor 3 Lander',
        description: 'Astronaut Pete Conrad inspects Surveyor 3 lander with Intrepid Lunar Module in background.',
        nasaId: 'AS12-48-7121',
        date: '1969-11-20',
        imageUrl: 'https://images-assets.nasa.gov/image/AS12-48-7121/AS12-48-7121~medium.jpg',
        source: 'NASA Johnson Space Center',
        sourceUrl: 'https://images.nasa.gov/details-AS12-48-7121',
      }
    ],
    sourceAttribution: {
      agency: 'NASA / JPL',
      dataset: 'NASA NSSDC Surveyor Archive',
      retrievedAt: new Date().toISOString(),
      license: 'Public Domain',
      officialMissionPage: 'https://science.nasa.gov/mission/surveyor-3/',
      verifiedSources: [{ name: 'NASA Surveyor 3', url: 'https://science.nasa.gov/mission/surveyor-3/' }]
    }
  },
  iss: {
    timestamp: new Date().toISOString(),
    destination: 'Orbital',
    mission: {
      id: 'iss',
      name: 'International Space Station (ISS)',
      destination: 'Orbital',
      locationName: 'Low Earth Orbit (~418 km Altitude, 51.64° Inclination)',
      coordinates: { lat: 0, lon: 0 },
      launchDate: '1998-11-20',
      landingDate: '1998-11-20',
      status: 'Operational',
      nasaConfirmedStatus: 'Active permanently crewed orbital laboratory completing 16 sunrises every 24 hours',
      purpose: 'Conduct microgravity biology, physics, Earth observation, and deep-space life-support testing in Low Earth Orbit.',
      scientificContribution: 'Supports continuous human presence in space since November 2000 with over 3,300 scientific investigations.',
      agency: 'NASA / ESA / JAXA / CSA / Roscosmos',
      officialUrl: 'https://www.nasa.gov/international-space-station/',
      hardware: [],
    },
    hardware: {
      id: 'iss-solar',
      name: 'ISS Solar Arrays & Pressurized Lab Modules',
      type: 'Orbital Microgravity Research Complex',
      purpose: 'Generate up to 240 kW of electrical power and house international microgravity research laboratories.',
      scientificFunction: 'Features dual-axis Roll-Out Solar Arrays (iROSA), Destiny/Columbus/Kibo labs, and the 7-window Cupola.',
      status: 'Operational',
      instruments: ['iROSA Solar Arrays', 'Alpha Magnetic Spectrometer (AMS-02)', 'Cupola Observation Dome', 'Canadarm2'],
      model3dType: 'iss-station',
      hotspots: [
        {
          id: 'iss-solar',
          label: 'Roll-Out Solar Arrays',
          code: 'SAW',
          position: [1.8, 0.6, 0],
          cameraOffset: [4.8, 2.4, 2.2],
          cameraLookAt: [1.8, 0.6, 0],
          description: 'High-efficiency orbital solar wings powering life support and science racks across the 109-meter station.'
        }
      ]
    },
    allHardware: [],
    images: [
      {
        title: 'International Space Station Above Earth Limb',
        description: 'Full orbital configuration of the International Space Station photographed by visiting spacecraft crew.',
        nasaId: 'iss066e081414',
        date: '2021-11-08',
        imageUrl: 'https://images-assets.nasa.gov/image/iss066e081414/iss066e081414~medium.jpg',
        source: 'NASA Johnson Space Center',
        sourceUrl: 'https://images.nasa.gov/details-iss066e081414',
      }
    ],
    sourceAttribution: {
      agency: 'NASA / International Partners',
      dataset: 'WhereTheISS & NASA Open APIs',
      retrievedAt: new Date().toISOString(),
      license: 'Public Domain',
      officialMissionPage: 'https://www.nasa.gov/international-space-station/',
      verifiedSources: [{ name: 'NASA ISS Station', url: 'https://www.nasa.gov/international-space-station/' }]
    }
  },
  jwst: {
    timestamp: new Date().toISOString(),
    destination: 'Astrophysics',
    mission: {
      id: 'jwst',
      name: 'James Webb Space Telescope (JWST)',
      destination: 'Astrophysics',
      locationName: 'Sun-Earth L2 Lagrange Point (~1.5M km)',
      coordinates: { lat: 0, lon: 0 },
      launchDate: '2021-12-25',
      landingDate: '2022-01-24',
      status: 'Operational',
      nasaConfirmedStatus: 'Active flagship astrophysics observatory at Sun-Earth L2',
      purpose: 'Peer back to the first galaxies formed after the Big Bang and characterize exoplanet atmospheres in deep infrared light.',
      scientificContribution: 'Detected atmospheric CO2, methane, and water vapor on exoplanets and imaged earliest cosmic dawn galaxies.',
      agency: 'NASA / ESA / CSA / STScI',
      officialUrl: 'https://webb.nasa.gov/',
      hardware: [],
    },
    hardware: {
      id: 'jwst-primary-mirror',
      name: '6.5m Gold Beryllium Primary Mirror & NIRCam',
      type: 'Cryogenic Infrared Space Observatory',
      purpose: 'Collect faint infrared starlight cooled below 50 Kelvin behind a 5-layer Kapton sunshield.',
      scientificFunction: '18 hexagonal gold-coated beryllium mirror segments focusing infrared photons onto NIRCam, NIRSpec, and MIRI.',
      status: 'Operational',
      instruments: ['18-Segment Gold Mirror', 'NIRCam', 'NIRSpec Microshutters', 'MIRI Cryo-Imager', '5-Layer Sunshield'],
      model3dType: 'jwst-telescope',
      hotspots: [
        {
          id: 'jwst-mirror',
          label: 'Gold Beryllium Mirror',
          code: 'PMA',
          position: [0, 1.4, 0.4],
          cameraOffset: [3.2, 2.8, 3.6],
          cameraLookAt: [0, 1.4, 0.4],
          description: '18 hexagonal gold-coated beryllium segments totaling a 6.5-meter infrared light-collecting aperture.'
        }
      ]
    },
    allHardware: [],
    images: [
      {
        title: "Webb's First Deep Field (SMACS 0723)",
        description: 'Deepest and sharpest infrared image of the distant universe to date taken by James Webb Space Telescope.',
        nasaId: 'PIA25371',
        date: '2022-07-11',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA25371/PIA25371~medium.jpg',
        source: 'NASA, ESA, CSA, STScI',
        sourceUrl: 'https://images.nasa.gov/details-PIA25371',
      }
    ],
    sourceAttribution: {
      agency: 'NASA / ESA / CSA / STScI',
      dataset: 'MAST & NASA Webb Mission Archive',
      retrievedAt: new Date().toISOString(),
      license: 'Public Domain',
      officialMissionPage: 'https://webb.nasa.gov/',
      verifiedSources: [{ name: 'NASA Webb Overview', url: 'https://webb.nasa.gov/' }]
    }
  },
  hubble: {
    timestamp: new Date().toISOString(),
    destination: 'Astrophysics',
    mission: {
      id: 'hubble',
      name: 'Hubble Space Telescope (HST)',
      destination: 'Astrophysics',
      locationName: 'Low Earth Orbit (~535 km Altitude)',
      coordinates: { lat: 28.5, lon: -80.6 },
      launchDate: '1990-04-24',
      landingDate: '1990-04-25',
      status: 'Operational',
      nasaConfirmedStatus: 'Active iconic space observatory, 34+ years of deep space discovery',
      purpose: 'Capture ultra-sharp UV, visible, and near-IR astronomical observations above Earth’s blurring atmosphere.',
      scientificContribution: 'Pinned down the cosmic expansion rate (Hubble constant), discovered dark energy, and imaged 1.6M+ deep-sky frames.',
      agency: 'NASA / ESA / STScI',
      officialUrl: 'https://hubblesite.org/',
      hardware: [],
    },
    hardware: {
      id: 'hubble-primary-mirror',
      name: 'Wide Field Camera 3 & 2.4m Primary Mirror',
      type: 'Orbital UV/Optical/NIR Telescope',
      purpose: 'Deliver aberration-free deep-space imagery across ultraviolet, visible, and near-infrared wavelengths.',
      scientificFunction: '2.4-meter Ritchey-Chrétien hyperboloid reflector feeding WFC3, COS, and STIS instruments.',
      status: 'Operational',
      instruments: ['2.4m Primary Mirror', 'Wide Field Camera 3 (WFC3)', 'Cosmic Origins Spectrograph'],
      model3dType: 'hubble-telescope',
      hotspots: []
    },
    allHardware: [],
    images: [
      {
        title: 'Hubble Pillars of Creation (Eagle Nebula)',
        description: 'Iconic Hubble Space Telescope image of star-forming elephant trunks of interstellar gas in Eagle Nebula (M16).',
        nasaId: 'PIA18906',
        date: '2015-01-05',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA18906/PIA18906~medium.jpg',
        source: 'NASA, ESA, and the Hubble Heritage Team (STScI/AURA)',
        sourceUrl: 'https://images.nasa.gov/details-PIA18906',
      }
    ],
    sourceAttribution: {
      agency: 'NASA / ESA / STScI',
      dataset: 'MAST Hubble Archive',
      retrievedAt: new Date().toISOString(),
      license: 'Public Domain',
      officialMissionPage: 'https://hubblesite.org/',
      verifiedSources: [{ name: 'NASA Hubble Mission', url: 'https://science.nasa.gov/mission/hubble/' }]
    }
  },
  voyager: {
    timestamp: new Date().toISOString(),
    destination: 'DeepSpace',
    mission: {
      id: 'voyager',
      name: 'Voyager 1 Interstellar Probe',
      destination: 'DeepSpace',
      locationName: 'Interstellar Medium (~166 AU from Earth)',
      coordinates: { lat: 0, lon: 0 },
      launchDate: '1977-09-05',
      landingDate: '2012-08-25',
      status: 'Operational',
      nasaConfirmedStatus: 'Active interstellar probe beyond the heliopause communicating across 24+ billion km',
      purpose: 'Explore the outer giant planets and investigate the interstellar medium beyond the Sun’s heliosphere.',
      scientificContribution: 'Captured the Pale Blue Dot portrait, discovered active sulfur volcanoes on Io, and crossed the heliopause in 2012.',
      agency: 'NASA JPL',
      officialUrl: 'https://science.nasa.gov/mission/voyager/',
      hardware: [],
    },
    hardware: {
      id: 'voyager-dish',
      name: '3.7m High-Gain Parabolic Dish Antenna',
      type: 'Interstellar Deep Space Antenna',
      purpose: 'Maintain X-band & S-band Deep Space Network communication across 24+ billion km.',
      scientificFunction: '23-watt Cassegrain dish downlinking telemetry across a ~23-hour one-way light delay to Earth.',
      status: 'Operational',
      instruments: ['3.7m Parabolic Dish', 'Three MHW-RTG Units', 'Cosmic Ray Subsystem', 'Plasma Wave Science'],
      model3dType: 'voyager-probe',
      hotspots: [
        {
          id: 'voyager-dish',
          label: '3.7m High-Gain Antenna',
          code: 'HGA',
          position: [0, 1.85, 0],
          cameraOffset: [3.2, 2.6, 2.6],
          cameraLookAt: [0, 1.85, 0],
          description: 'Transmits interstellar plasma data from beyond 166 AU to Earth.'
        }
      ]
    },
    allHardware: [
      {
        id: 'voyager-dish',
        name: '3.7m High-Gain Parabolic Dish Antenna',
        type: 'Interstellar Deep Space Antenna',
        purpose: 'Maintain X-band & S-band Deep Space Network communication across 24+ billion km.',
        scientificFunction: '23-watt Cassegrain dish downlinking telemetry across a ~23-hour one-way light delay to Earth.',
        status: 'Operational',
        instruments: ['3.7m Parabolic Dish', 'Three MHW-RTG Units', 'Cosmic Ray Subsystem'],
        model3dType: 'voyager-probe',
        hotspots: []
      },
      {
        id: 'golden-record',
        name: 'The Voyager Interstellar Golden Record',
        type: 'Interstellar Cultural Time Capsule',
        purpose: 'Carry audio, greetings in 55 languages, music, and encoded Earth imagery beyond the Solar System.',
        scientificFunction: '12-inch gold-plated copper phonograph disc with uranium-238 timing source.',
        status: 'Operational',
        instruments: ['Gold-Plated Copper Phonograph', 'Diamond Playback Stylus', 'Star Pulsar Map'],
        model3dType: 'voyager-probe',
        hotspots: []
      }
    ],
    images: [
      {
        title: 'Pale Blue Dot Revisited (Voyager 1 Portrait from 6 Billion km)',
        description: 'Iconic portrait of Earth suspended in a sunbeam captured by Voyager 1 at the edge of the Solar System.',
        nasaId: 'PIA23645',
        date: '1990-02-14',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA23645/PIA23645~medium.jpg',
        source: 'NASA/JPL-Caltech',
        sourceUrl: 'https://images.nasa.gov/details-PIA23645',
      },
      {
        title: 'Voyager Interstellar Probe Beyond the Heliopause',
        description: 'Voyager spacecraft configuration with 3.7m high-gain parabolic dish and Golden Record.',
        nasaId: 'PIA22566',
        date: '2018-12-10',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA22566/PIA22566~medium.jpg',
        source: 'NASA/JPL-Caltech',
        sourceUrl: 'https://images.nasa.gov/details-PIA22566',
      }
    ],
    sourceAttribution: {
      agency: 'NASA JPL',
      dataset: 'Voyager Interstellar Mission DSN Archive',
      retrievedAt: new Date().toISOString(),
      license: 'Public Domain',
      officialMissionPage: 'https://science.nasa.gov/mission/voyager/',
      verifiedSources: [{ name: 'NASA Voyager Mission', url: 'https://science.nasa.gov/mission/voyager/' }]
    }
  }
};

const CLIENT_SUBSYSTEM_FALLBACKS: Record<string, HardwareItem> = {
  pixl: {
    id: 'pixl',
    name: 'PIXL & SHERLOC Robotic Arm Turret',
    type: 'X-Ray & UV Micro-Spectrometer',
    purpose: 'Map elemental chemistry and organic biosignatures across millimeter-scale Martian rock surfaces.',
    scientificFunction: 'Fires micro-focused X-rays (PIXL) and deep-UV Raman laser pulses (SHERLOC) from the 2.1m rover turret.',
    status: 'Operational',
    instruments: ['PIXL X-Ray Fluorescence', 'SHERLOC Deep-UV Raman', 'WATSON Context Camera'],
    model3dType: 'rover-perseverance',
    hotspots: [],
  },
  rimfax: {
    id: 'rimfax',
    name: 'RIMFAX Ground-Penetrating Radar',
    type: 'Subsurface Radar Imager',
    purpose: 'Probe 10–20 meters below Jezero Crater to map ancient lakebed sediment stratigraphy.',
    scientificFunction: 'Swept-frequency 150–1200 MHz radar profiling buried bedrock, clay layers, and brine signatures.',
    status: 'Operational',
    instruments: ['RIMFAX Rear Dipoles', 'Radar Transceiver Electronics'],
    model3dType: 'rover-perseverance',
    hotspots: [],
  },
  'rotor-system': {
    id: 'rotor-system',
    name: 'Ingenuity Counter-Rotating Carbon Blades',
    type: 'Ultrathin Martian Aerodynamics Rotor',
    purpose: 'Generate aerodynamic lift in Mars 1%-density CO2 atmosphere.',
    scientificFunction: 'Dual 1.2m counter-rotating carbon-fiber rotors spinning up to 2,800 RPM during autonomous sorties.',
    status: 'Retired',
    instruments: ['Carbon-Fiber Airfoil Blades', 'Swashplate Pitch Actuators'],
    model3dType: 'helicopter-ingenuity',
    hotspots: [],
  },
  mastcam: {
    id: 'mastcam',
    name: 'Mastcam Multispectral Stereo Imager',
    type: 'True-Color Planetary Camera Pair',
    purpose: 'Capture high-definition stereo panoramas and telephoto mineral geology around Gale Crater.',
    scientificFunction: 'Paired 34mm wide and 100mm telephoto RGB Bayer cameras mounted on Curiosity mast.',
    status: 'Operational',
    instruments: ['M-34 Wide Camera', 'M-100 Telephoto', 'Radiometric Calibration Target'],
    model3dType: 'rover-curiosity',
    hotspots: [],
  },
  apxs: {
    id: 'apxs',
    name: 'APXS & MAHLI Arm Micro-Imager',
    type: 'Contact Geochemistry Turret',
    purpose: 'Quantify elemental abundances from sodium through bromine and inspect sand grains at 14 um resolution.',
    scientificFunction: 'Alpha Particle X-Ray Spectrometer paired with the focusable MAHLI lens on Curiosity arm.',
    status: 'Operational',
    instruments: ['Curium-244 APXS Sensor', 'MAHLI Macro Lens', 'Dust Removal Tool'],
    model3dType: 'rover-curiosity',
    hotspots: [],
  },
  seis: {
    id: 'seis',
    name: 'SEIS Ultra-Sensitive Mars Seismometer',
    type: 'Planetary Seismology Dome',
    purpose: 'Detect sub-atomic ground vibrations from marsquakes and meteoroid impacts.',
    scientificFunction: 'Six vacuum-sealed pendulum seismometers protected by the aerodynamic Wind and Thermal Shield.',
    status: 'Inactive',
    instruments: ['VBB 3-Axis Pendulums', 'Short-Period MEMS Sensors', 'Wind & Thermal Shield'],
    model3dType: 'insight-lander',
    hotspots: [],
  },
  hp3: {
    id: 'hp3',
    name: 'HP³ Heat Flow & Physical Properties Probe',
    type: 'Subsurface Geothermal Mole',
    purpose: 'Measure internal planetary heat escaping through Martian regolith.',
    scientificFunction: 'Self-hammering mole with platinum resistance temperature sensors and surface radiometer.',
    status: 'Inactive',
    instruments: ['Thermal Science Tether', 'TILT Depth Trackers', 'RAD Surface Radiometer'],
    model3dType: 'insight-lander',
    hotspots: [],
  },
  'solar-arrays': {
    id: 'solar-arrays',
    name: 'Dual 2.15m UltraFlex Solar Arrays',
    type: 'Fold-Out Photovoltaic Generator',
    purpose: 'Deliver Martian surface electrical power for InSight science instruments.',
    scientificFunction: 'Fan-folding triple-junction solar cells generating up to 600-700 Wh per clear sol.',
    status: 'Inactive',
    instruments: ['UltraFlex Decagonal Wings', 'Shunt Limiter Bus'],
    model3dType: 'insight-lander',
    hotspots: [],
  },
  arm: {
    id: 'arm',
    name: 'InSight Robotic Instrument Deployment Arm',
    type: '4-DOF Precision Crane Arm',
    purpose: 'Lift SEIS and HP³ from the lander deck and place them onto Martian soil.',
    scientificFunction: '2.4m articulated arm with grapple mechanism and Instrument Deployment Camera (IDC).',
    status: 'Inactive',
    instruments: ['4-Axis Robotic Boom', 'Mechanical Grapple', 'IDC Context Camera'],
    model3dType: 'insight-lander',
    hotspots: [],
  },
  'viking-rtg': {
    id: 'viking-rtg',
    name: 'Dual SNAP-19 Plutonium RTG Power Units',
    type: 'Radioisotope Thermoelectric Generator',
    purpose: 'Supply continuous 70 W power independent of sunlight and Martian dust storms.',
    scientificFunction: 'Pu-238 decay thermocouple stacks keeping Viking 1 operating for more than 6 years.',
    status: 'Mission complete',
    instruments: ['SNAP-19 Twin Cylinders', 'Thermal Fin Radiators'],
    model3dType: 'viking-lander',
    hotspots: [],
  },
  'viking-sampler': {
    id: 'viking-sampler',
    name: 'Viking Extendable Soil Collector Scoop',
    type: 'Automated Astrobiology Soil Arm',
    purpose: 'Trench Martian regolith and deliver samples into internal life-detection chambers.',
    scientificFunction: '3-meter furlable boom with backhoe scoop feeding Gas Exchange and Labeled Release experiments.',
    status: 'Mission complete',
    instruments: ['Retractable Boom Tube', 'Sieved Collector Head'],
    model3dType: 'viking-lander',
    hotspots: [],
  },
  'mro-dish': {
    id: 'mro-dish',
    name: '3.0-Meter High-Gain Telecommunications Reflector',
    type: 'Deep Space Relay Antenna',
    purpose: 'Backhaul terabits of rover and orbital imagery from Mars to NASA Deep Space Network.',
    scientificFunction: 'Dual X-band (8.4 GHz) & Ka-band (32 GHz) parabolic gimbal dish capable of 4+ Mbps downlink.',
    status: 'Operational',
    instruments: ['3m Honeycombed Dish', '100 W Traveling-Wave Tube Amplifier'],
    model3dType: 'mro-orbiter',
    hotspots: [],
  },
  'lunar-antenna': {
    id: 'lunar-antenna',
    name: 'High-Gain Lunar S-Band / Telemetry Dish',
    type: 'Direct-to-Earth Communications Array',
    purpose: 'Stream live EVA voice, video, and biomedical telemetry back to Houston.',
    scientificFunction: 'Steerable S-band parabolic reflector locked onto Earth Manned Space Flight Network.',
    status: 'Mission complete',
    instruments: ['66 cm Steerable Parabolic Dish', 'S-Band Transponder'],
    model3dType: 'apollo-lunar-module',
    hotspots: [],
  },
  'hls-astronaut': {
    id: 'hls-astronaut',
    name: 'Axiom AxEMU Polar Surface Spacesuit',
    type: 'Artemis Polar Extravehicular Suit',
    purpose: 'Support 8+ hour Shackleton Crater geology EVAs across -200°C polar shadows.',
    scientificFunction: 'Closed-loop cryogenic thermal control with dust-repellent seals and HD helmet lidar/comms.',
    status: 'Operational',
    instruments: ['AxEMU Portable Life Support', 'Dust-Tolerant Rotary Bearings', 'HD Helmet Comms'],
    model3dType: 'starship-hls',
    hotspots: [],
  },
  'hls-antenna': {
    id: 'hls-antenna',
    name: 'Artemis South Pole LunaNet Relay Tower',
    type: 'High-Bandwidth Polar Surface Link',
    purpose: 'Link Shackleton Crater EVAs with Lunar Gateway NRHO relays and Deep Space Network Earth receivers.',
    scientificFunction: 'Optical & Ka-band polar relay mast engineered for grazing solar angles.',
    status: 'Operational',
    instruments: ['Ka-Band Phased Array', 'LunaNet Optical Transceiver'],
    model3dType: 'starship-hls',
    hotspots: [],
  },
  'apollo-astronaut': {
    id: 'apollo-astronaut',
    name: 'Apollo A7L / Axiom Lunar EVA Spacesuit',
    type: 'Extravehicular Mobility Unit',
    purpose: 'Sustain astronauts in hard vacuum across extreme +120 °C to -170 °C surface conditions.',
    scientificFunction: 'Portable Life Support System supplying 3.7 psi 100% O2 and liquid thermal cooling.',
    status: 'Mission complete',
    instruments: ['PLSS Life-Support Backpack', 'Gold Thermal Sun Visor'],
    model3dType: 'apollo-lunar-module',
    hotspots: [],
  },
  'apollo-ascent-stage': {
    id: 'apollo-ascent-stage',
    name: 'Lunar Module Ascent Stage & Cabin',
    type: 'Crewed Lunar Liftoff Vehicle',
    purpose: 'Launch astronauts from the lunar surface back to Command Module orbit rendezvous.',
    scientificFunction: 'Hypergolic Ascent Propulsion System firing 15.6 kN for a zero-failure lunar liftoff.',
    status: 'Mission complete',
    instruments: ['APS Aerozine-50 Engine', 'AGC Apollo Guidance Computer'],
    model3dType: 'apollo-lunar-module',
    hotspots: [],
  },
  'apollo15-drill': {
    id: 'apollo15-drill',
    name: 'Apollo Lunar Surface Drill (ALSD) & Core Rack',
    type: 'Regolith Deep Core Extractor',
    purpose: 'Extract 2.4m layered regolith core tubes preserving ancient solar wind history.',
    scientificFunction: 'Battery-powered rotary percussion core drill operated by Apollo J-mission crews.',
    status: 'Mission complete',
    instruments: ['Rotary-Percussion Drill', 'Titanium Core Stems'],
    model3dType: 'apollo15-lrv',
    hotspots: [],
  },
  'lrv-camera': {
    id: 'lrv-camera',
    name: 'Ground-Controlled Television Assembly (GCTA)',
    type: 'Remote-Commanded Color Camera',
    purpose: 'Allow flight controllers in Houston to pan and zoom live lunar geology traverses.',
    scientificFunction: 'Field-sequential color TV camera mounted on the rover forward chassis.',
    status: 'Mission complete',
    instruments: ['Field-Sequential Color Wheel', 'Remote Pan-Tilt Gimbal'],
    model3dType: 'apollo15-lrv',
    hotspots: [],
  },
  'lrv-astronaut': {
    id: 'lrv-astronaut',
    name: 'Apollo J-Mission Crew in A7LB Mobility Suit',
    type: 'Seated-Traverse Lunar Spacesuit',
    purpose: 'Enable multi-hour driving and deep geological sampling across lunar canyons.',
    scientificFunction: 'Redesigned waist convolute joint allowing astronauts to sit comfortably in the LRV.',
    status: 'Mission complete',
    instruments: ['A7LB Pressure Garment', 'Geology Hammer & Sample Bags'],
    model3dType: 'apollo15-lrv',
    hotspots: [],
  },
  'chaste-probe': {
    id: 'chaste-probe',
    name: 'ChaSTE Subsurface Thermal Penetrator',
    type: 'Polar Regolith Thermal Probe',
    purpose: 'Measure the vertical temperature gradient of south polar soil down to 10 cm depth.',
    scientificFunction: 'Revealed steep thermal insulation: +60 °C at surface dropping to -10 °C just 8 cm deep.',
    status: 'Mission complete',
    instruments: ['10 Precision RTD Thermal Sensors', 'Motorized Deployment Mast'],
    model3dType: 'vikram-lander',
    hotspots: [],
  },
  'rambha-plasma': {
    id: 'rambha-plasma',
    name: 'RAMBHA-LP Langmuir Ionospheric Probe',
    type: 'Near-Surface Plasma Sensor',
    purpose: 'Measure electron and ion density in the tenuous south-polar lunar plasma environment.',
    scientificFunction: 'Spherical Langmuir probe deployed on a 1m boom detecting 5-30M electrons/m3.',
    status: 'Mission complete',
    instruments: ['Gold-Plated Spherical Collector', '1m Folding Boom'],
    model3dType: 'vikram-lander',
    hotspots: [],
  },
  'diviner-radiometer': {
    id: 'diviner-radiometer',
    name: 'Diviner Lunar Radiometer Experiment',
    type: '9-Channel Thermal Infrared Mapper',
    purpose: 'Measure global day/night lunar surface temperatures and locate 25 K water-ice cold traps.',
    scientificFunction: 'Maps emission across 0.3 to 400 um to pinpoint permanently shadowed polar ice stability.',
    status: 'Operational',
    instruments: ['9 Spectral IR Channels', 'Dual Solar Calibration Targets'],
    model3dType: 'lunar-lro',
    hotspots: [],
  },
  'surveyor3-tv': {
    id: 'surveyor3-tv',
    name: 'Surveyor 3 Steerable Vidicon TV Camera',
    type: 'Vacuum-Tested Surface Imager',
    purpose: 'Capture 6,315 Oceanus Procellarum images before retrieval by Apollo 12 astronauts.',
    scientificFunction: 'Returned to Earth in 1969 so scientists could study 31 months of lunar vacuum aging.',
    status: 'Mission complete',
    instruments: ['Rotatable Azimuth Mirror', 'Vidicon Electron Tube'],
    model3dType: 'surveyor3-lander',
    hotspots: [],
  },
  'jwst-sunshield': {
    id: 'jwst-sunshield',
    name: 'JWST 5-Layer Kapton Thermal Sunshield',
    type: 'Passively Cooled Radiative Barrier',
    purpose: 'Attenuate 300 kW of solar heat to cool infrared optics below 50 Kelvin at L2.',
    scientificFunction: 'Five tennis-court-sized aluminum/silicon-coated Kapton membranes.',
    status: 'Operational',
    instruments: ['5 Kapton Membranes', 'Deployable Spreader Booms'],
    model3dType: 'jwst-telescope',
    hotspots: [],
  },
  'jwst-nircam': {
    id: 'jwst-nircam',
    name: 'NIRCam & MIRI Cryogenic Sensor Suite',
    type: 'Near- & Mid-Infrared Cameras',
    purpose: 'Resolve exoplanet spectra and Deep Field galaxies between 0.6 and 28 microns.',
    scientificFunction: 'Helium closed-cycle cryocooler chills MIRI detectors to 6.7 Kelvin.',
    status: 'Operational',
    instruments: ['NIRCam 0.6-5 um Imager', 'MIRI 6.7K Cryo-Spectrometer'],
    model3dType: 'jwst-telescope',
    hotspots: [],
  },
  'hubble-solar-arrays': {
    id: 'hubble-solar-arrays',
    name: 'Hubble GaAs Rigid Solar Array Wings',
    type: 'Orbital Power Generation Bus',
    purpose: 'Supply 2,800 W electrical power to telescope gyroscopes, flight computer, and imagers.',
    scientificFunction: 'Gallium arsenide rigid wings installed during Servicing Mission 3B.',
    status: 'Operational',
    instruments: ['GaAs Photovoltaic Wings', 'NiH2 Battery Array'],
    model3dType: 'hubble-telescope',
    hotspots: [],
  },
  'iss-lab': {
    id: 'iss-lab',
    name: 'Destiny US Microgravity Laboratory Module',
    type: 'Pressurized Orbital Research Lab',
    purpose: 'Host 24 payload racks for zero-G biology, combustion, fluid physics, and materials research.',
    scientificFunction: 'Primary American research laboratory continuously staffed since 2001.',
    status: 'Operational',
    instruments: ['24 International Standard Payload Racks', 'Optical Nadir Window'],
    model3dType: 'iss-station',
    hotspots: [],
  },
  'iss-cupola': {
    id: 'iss-cupola',
    name: 'Cupola 7-Window Earth Observatory Dome',
    type: 'Orbital Viewing & Robotics Station',
    purpose: 'Provide 360-degree panoramic visibility for Canadarm2 grappling and Earth science photography.',
    scientificFunction: 'Seven fused-silica windows housing the Robotic Workstation overlooking Earth horizon.',
    status: 'Operational',
    instruments: ['80 cm Circular Nadir Window', 'Canadarm2 Robotic Console'],
    model3dType: 'iss-station',
    hotspots: [],
  },
  'saturn-s1c': {
    id: 'saturn-s1c',
    name: 'Saturn V S-IC Booster (5x Rocketdyne F-1)',
    type: 'Super-Heavy First Stage',
    purpose: 'Accelerate Apollo spacecraft through dense lower atmosphere to 67 km altitude.',
    scientificFunction: 'Burns RP-1 kerosene and LOX at 15 metric tons per second for 34.5 MN thrust.',
    status: 'Mission complete',
    instruments: ['5 Rocketdyne F-1 Engines', 'LOX & RP-1 Tanks'],
    model3dType: 'rocket-saturn',
    hotspots: [],
  },
  'apollo-csm': {
    id: 'apollo-csm',
    name: 'Apollo Command & Service Module (CSM)',
    type: 'Trans-Lunar Habitat & Return Craft',
    purpose: 'Carry three astronauts to lunar orbit and survive 11 km/s Earth atmospheric re-entry.',
    scientificFunction: 'SPS Service Propulsion Engine plus ablative Avcoat heat shield on the Command Module.',
    status: 'Mission complete',
    instruments: ['AJ10-137 SPS Engine', '3 Hydrogen Fuel Cells', 'Ablative Heat Shield'],
    model3dType: 'rocket-saturn',
    hotspots: [],
  },
};

const CLIENT_MISSION_FALLBACK_IMAGES: Record<string, ResolvedNasaPayload['images']> = {
  apollo11: [
    {
      title: 'Apollo 11 Eagle Descent Stage at Tranquility Base',
      description: 'Buzz Aldrin and Tranquility Base solar wind foil experiment on the lunar surface.',
      nasaId: 'AS11-40-5903',
      date: '1969-07-20',
      imageUrl: 'https://images-assets.nasa.gov/image/AS11-40-5903/AS11-40-5903~medium.jpg',
      source: 'NASA Johnson Space Center',
      sourceUrl: 'https://images.nasa.gov/details-AS11-40-5903',
    },
  ],
  apollo15: [
    {
      title: 'Apollo 15 Lunar Roving Vehicle at Hadley Rille',
      description: 'Astronaut James Irwin beside Lunar Roving Vehicle (LRV-1) and Apennine backdrop.',
      nasaId: 'AS15-88-11866',
      date: '1971-08-01',
      imageUrl: 'https://images-assets.nasa.gov/image/AS15-88-11866/AS15-88-11866~medium.jpg',
      source: 'NASA Johnson Space Center',
      sourceUrl: 'https://images.nasa.gov/details-AS15-88-11866',
    },
  ],
  apollo17: [
    {
      title: 'Apollo 17 LRV Traversing Taurus-Littrow Valley',
      description: 'Eugene Cernan driving LRV-3 across Taurus-Littrow during final Apollo mission.',
      nasaId: 'AS17-147-22527',
      date: '1972-12-12',
      imageUrl: 'https://images-assets.nasa.gov/image/AS17-147-22527/AS17-147-22527~medium.jpg',
      source: 'NASA Johnson Space Center',
      sourceUrl: 'https://images.nasa.gov/details-AS17-147-22527',
    },
  ],
  lro: [
    {
      title: 'LRO Narrow-Angle View of Shackleton Crater',
      description: 'Permanently shadowed south polar rims mapped by NASA Lunar Reconnaissance Orbiter.',
      nasaId: 'PIA13388',
      date: '2010-09-17',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA13388/PIA13388~medium.jpg',
      source: 'NASA/GSFC/ASU',
      sourceUrl: 'https://images.nasa.gov/details-PIA13388',
    },
  ],
  artemis3: [
    {
      title: 'Artemis Orion & Lunar South Pole Horizon',
      description: 'Artemis program optical survey of the sunlit lunar limb near South Pole landing zones.',
      nasaId: 'art001e001483',
      date: '2022-11-28',
      imageUrl: 'https://images-assets.nasa.gov/image/art001e001483/art001e001483~medium.jpg',
      source: 'NASA Artemis',
      sourceUrl: 'https://images.nasa.gov/details-art001e001483',
    },
  ],
  ladee: [
    {
      title: 'NASA LADEE Spacecraft Pre-Flight Thermal Integration',
      description: 'Modular common spacecraft bus fitted with silicon solar array and LLCD optics terminal.',
      nasaId: 'KSC-2013-2954',
      date: '2013-07-12',
      imageUrl: 'https://images-assets.nasa.gov/image/KSC-2013-2954/KSC-2013-2954~medium.jpg',
      source: 'NASA Kennedy Space Center',
      sourceUrl: 'https://images.nasa.gov/details-KSC-2013-2954',
    },
  ],
  change4: [
    {
      title: 'LRO Imaging of Von Kármán Crater Far-Side Site',
      description: 'South Pole-Aitken basin surface topography imaged by NASA LRO.',
      nasaId: 'GSFC_20171208_Archive_e001135',
      date: '2019-02-06',
      imageUrl: 'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001135/GSFC_20171208_Archive_e001135~medium.jpg',
      source: 'NASA/GSFC/ASU',
      sourceUrl: 'https://images.nasa.gov/details-GSFC_20171208_Archive_e001135',
    },
  ],
};

export function getClientFallbackPayload(destination: DestinationType, missionId?: string, hardwareId?: string): ResolvedNasaPayload {
  const defaultMission =
    destination === 'Mars' ? 'perseverance' : destination === 'DeepSpace' ? 'jwst' : 'apollo11';
  const mKey = (missionId || defaultMission).toLowerCase();
  const basePayload =
    CLIENT_FALLBACK_MISSIONS[mKey] ||
    CLIENT_FALLBACK_MISSIONS[defaultMission];

  const allHw = basePayload.allHardware?.length
    ? basePayload.allHardware
    : [basePayload.hardware];

  const nowIso = new Date().toISOString();
  let selectedHardware = basePayload.hardware;
  if (hardwareId) {
    const aliasMap: Record<string, string> = {
      'lrrk-reflector': 'lunar-laser-retro',
      'lrrr-reflector': 'lunar-laser-retro',
    };
    const rawKey = hardwareId.toLowerCase();
    const hKey = aliasMap[rawKey] || rawKey;
    const matched = allHw.find((hw) => hw.id.toLowerCase() === hKey || hw.id.toLowerCase() === rawKey);
    if (matched) {
      selectedHardware = matched;
    } else if (CLIENT_SUBSYSTEM_FALLBACKS[hKey]) {
      selectedHardware = {
        ...CLIENT_SUBSYSTEM_FALLBACKS[hKey],
        model3dType: basePayload.hardware?.model3dType || CLIENT_SUBSYSTEM_FALLBACKS[hKey].model3dType,
      };
    } else {
      // Check hotspot match inside hardware items
      for (const hw of allHw) {
        const spot = hw.hotspots?.find(
          (hs) => hs.id.toLowerCase() === hKey || hs.id.toLowerCase() === rawKey
        );
        if (spot) {
          selectedHardware = {
            ...hw,
            id: spot.id,
            name: spot.label || hw.name,
            scientificFunction: spot.description || hw.scientificFunction,
          };
          break;
        }
      }
    }
  }

  return {
    ...basePayload,
    timestamp: nowIso,
    images: basePayload.images?.length ? basePayload.images : (CLIENT_MISSION_FALLBACK_IMAGES[mKey] || []),
    hardware: selectedHardware,
    allHardware: allHw,
    realTimeTelemetry: computeMissionLiveTelemetry(basePayload.mission),
    sourceAttribution: {
      ...basePayload.sourceAttribution,
      retrievedAt: nowIso,
    },
  };
}
