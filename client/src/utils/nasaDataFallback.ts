import { DestinationType, HardwareItem, MissionData, ResolvedNasaPayload } from '../types';

export const CLIENT_FALLBACK_MISSIONS: Record<string, ResolvedNasaPayload> = {
  // MARS MISSIONS
  perseverance: {
    timestamp: new Date().toISOString(),
    destination: 'Mars',
    mission: {
      id: 'perseverance',
      name: 'Mars 2020 Perseverance & Ingenuity',
      destination: 'Mars',
      locationName: 'Jezero Crater River Delta (-18.44°, 77.45°)',
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
      model3dType: 'insight-seis',
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
      model3dType: 'apollo17-astronaut',
      hotspots: []
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
      launchDate: '2026-09-01',
      landingDate: '2026-09-12',
      status: 'Operational',
      nasaConfirmedStatus: 'NASA Artemis Flagship — First Crewed Lunar South Pole Landing',
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
  }
};

export function getClientFallbackPayload(destination: DestinationType, missionId?: string, hardwareId?: string): ResolvedNasaPayload {
  const mKey = (missionId || (destination === 'Mars' ? 'perseverance' : 'apollo11')).toLowerCase();
  const payload = CLIENT_FALLBACK_MISSIONS[mKey] || CLIENT_FALLBACK_MISSIONS[destination === 'Mars' ? 'perseverance' : 'apollo11'];
  return payload;
}
