// NASA API & Data Source Registry - NASA Mission Explorer
// Official NASA Open Data Sources & Mission Metadata

export const NASA_API_REGISTRY = [
  {
    id: "nasa-image-library",
    name: "NASA Image and Video Library",
    type: "REST API",
    baseUrl: "https://images-api.nasa.gov",
    requiresKey: false,
    documentationUrl: "https://api.nasa.gov/#images-and-video-library",
    supportedDestinations: ["Moon", "Mars", "Deep Space"],
    supportedDataTypes: ["Images", "Metadata", "Captions"],
    enabled: true
  },
  {
    id: "mars-rover-photos",
    name: "NASA Mars Rover Photos API",
    type: "REST API",
    baseUrl: "https://api.nasa.gov/mars-photos/api/v1",
    requiresKey: true,
    documentationUrl: "https://api.nasa.gov/#mars-rover-photos",
    supportedDestinations: ["Mars"],
    supportedDataTypes: ["Rover Images", "Camera Specs", "Sol Data"],
    enabled: true
  },
  {
    id: "nasa-apod",
    name: "NASA Astronomy Picture of the Day (APOD)",
    type: "REST API",
    baseUrl: "https://api.nasa.gov/planetary/apod",
    requiresKey: true,
    documentationUrl: "https://api.nasa.gov/#apod",
    supportedDestinations: ["Moon", "Mars", "Deep Space"],
    supportedDataTypes: ["Astronomy Imagery", "Scientific Explanations"],
    enabled: true
  },
  {
    id: "nasa-open-data",
    name: "NASA Data Portal (data.nasa.gov)",
    type: "Open Data Portal",
    baseUrl: "https://data.nasa.gov",
    requiresKey: false,
    documentationUrl: "https://data.nasa.gov/developer",
    supportedDestinations: ["Moon", "Mars", "Deep Space"],
    supportedDataTypes: ["Hardware Catalogs", "Instrument Specifications"],
    enabled: true
  }
];

export const VERIFIED_NASA_MISSIONS = [
  // MARS MISSIONS
  {
    id: "perseverance",
    name: "Perseverance Rover (Mars 2020)",
    destination: "Mars",
    locationName: "Jezero Crater Delta",
    coordinates: { lat: 18.38, lon: 77.58 },
    launchDate: "2020-07-30",
    landingDate: "2021-02-18",
    status: "Operational",
    nasaConfirmedStatus: "Active mission ongoing at Jezero Crater river delta",
    purpose: "Search for signs of ancient microbial life and collect rock and regolith samples for future return to Earth.",
    scientificContribution: "Discovered organic carbon compounds in Jezero Crater floor and collected core samples of ancient river delta sediment rocks.",
    agency: "NASA / JPL-Caltech",
    officialUrl: "https://mars.nasa.gov/mars2020/",
    hardware: [
      {
        id: "perseverance-chassis",
        name: "Perseverance Rover Body & RTG Power Plant",
        type: "Rover Vehicle",
        purpose: "Mobile scientific platform powered by Multi-Mission Radioisotope Thermoelectric Generator (MMRTG).",
        scientificFunction: "Provides mobility, nuclear power, radiation shielding, and central computing across Martian terrain.",
        status: "Operational",
        instruments: ["MMRTG Nuclear Generator", "AutoNav Autonomous Navigation System", "Robotic Arm Assembly"],
        model3dType: "rover-perseverance"
      },
      {
        id: "supercam",
        name: "SuperCam Laser Spectrometer",
        type: "Scientific Sensor",
        purpose: "Examines rock and soil with a laser and spectrometers to seek organic compounds and biosignatures.",
        scientificFunction: "Fires a laser beam at targets up to 7 meters away to analyze chemical elemental composition.",
        status: "Operational",
        instruments: ["Raman Spectrometer", "Time-Resolved Fluorescence", "Visible/Infrared Spectrometer", "Microphone"],
        model3dType: "sensor-mast"
      },
      {
        id: "moxie",
        name: "MOXIE Oxygen Generator",
        type: "In-Situ Resource Experiment",
        purpose: "Demonstrate producing oxygen from Martian atmospheric carbon dioxide (CO2).",
        scientificFunction: "Extracted 122 grams of oxygen from CO2 molecules via solid oxide electrolysis at 800°C.",
        status: "Mission Complete",
        instruments: ["Solid Oxide Electrolysis Stack", "CO2 Compressor", "Thermal Insulation"],
        model3dType: "box-module"
      },
      {
        id: "ingenuity",
        name: "Ingenuity Mars Helicopter",
        type: "Aerial Scout Drone",
        purpose: "Demonstrate powered, controlled flight in the thin atmosphere of Mars.",
        scientificFunction: "Completed 72 powered flights covering 17 km, serving as aerial scout for Perseverance.",
        status: "Retired",
        instruments: ["Dual Counter-Rotating Blades", "Solar Panel Array", "Color Navigation Camera"],
        model3dType: "helicopter-ingenuity"
      },
      {
        id: "mastcam-z",
        name: "Mastcam-Z Stereoscopic Camera",
        type: "Imaging Payload",
        purpose: "Takes high-resolution 3D color images and panoramic videos of the Martian surface and sky.",
        scientificFunction: "Provides 3D spatial mapping and multispectral imaging to select target rocks for drilling.",
        status: "Operational",
        instruments: ["Dual Zoom Lenses", "Solar Filter Assembly", "Color Sensor Grid"],
        model3dType: "camera-head"
      }
    ]
  },
  {
    id: "curiosity",
    name: "Curiosity Rover (Mars Science Laboratory)",
    destination: "Mars",
    locationName: "Gale Crater & Mount Sharp",
    coordinates: { lat: -4.58, lon: 137.44 },
    launchDate: "2011-11-26",
    landingDate: "2012-08-06",
    status: "Operational",
    nasaConfirmedStatus: "Active exploration of Mount Sharp sulphate-bearing unit",
    purpose: "Assess whether Mars ever had an environment capable of supporting microbial life forms.",
    scientificContribution: "Proved ancient Mars had liquid surface water streams, lake deposits, key organic molecules, and habitable conditions.",
    agency: "NASA / JPL-Caltech",
    officialUrl: "https://mars.nasa.gov/msl/",
    hardware: [
      {
        id: "curiosity-chassis",
        name: "Curiosity Rover Chassis",
        type: "Rover Vehicle",
        purpose: "Six-wheel rocker-bogie heavy exploration rover.",
        scientificFunction: "Carries 10 scientific instruments over rugged slopes of Mount Sharp.",
        status: "Operational",
        instruments: ["Rocker-Bogie Suspension", "MMRTG Power Source", "Touchdown Sky Crane Attachment Points"],
        model3dType: "rover-curiosity"
      },
      {
        id: "sam-lab",
        name: "SAM (Sample Analysis at Mars)",
        type: "Analytical Chemistry Laboratory",
        purpose: "Analyze organic compounds and gases in soil and rock samples.",
        scientificFunction: "Contains a mass spectrometer, gas chromatograph, and tunable laser spectrometer.",
        status: "Operational",
        instruments: ["Quadrupole Mass Spectrometer", "Gas Chromatograph", "Tunable Laser Spectrometer"],
        model3dType: "lab-core"
      },
      {
        id: "chemcam",
        name: "ChemCam Laser & Camera",
        type: "Remote Sensing Spectrometer",
        purpose: "Analyze chemical composition of rocks from a distance.",
        scientificFunction: "Uses laser-induced breakdown spectroscopy to vaporize thin layers of rock up to 7m away.",
        status: "Operational",
        instruments: ["Laser Pulse Emitter", "Telescopic Optics", "Spectrometer System"],
        model3dType: "laser-head"
      }
    ]
  },
  {
    id: "insight",
    name: "InSight Mars Lander",
    destination: "Mars",
    locationName: "Elysium Planitia",
    coordinates: { lat: 4.50, lon: 135.62 },
    launchDate: "2018-05-05",
    landingDate: "2018-11-26",
    status: "Mission Complete",
    nasaConfirmedStatus: "Power loss due to solar array dust buildup (Final contact Dec 2022)",
    purpose: "Investigate the deep interior structure of Mars using seismology and heat flow measuring probes.",
    scientificContribution: "Detected over 1,300 marsquakes, measured Martian crust thickness, and confirmed liquid outer core.",
    agency: "NASA / JPL-Caltech / CNES / DLR",
    officialUrl: "https://mars.nasa.gov/insight/",
    hardware: [
      {
        id: "insight-seis",
        name: "SEIS Seismometer",
        type: "Geophysical Instrument",
        purpose: "Measure seismic waves caused by marsquakes and meteorite impacts.",
        scientificFunction: "Ultra-sensitive dome-shielded seismic sensors measuring ground movements at sub-atomic scale.",
        status: "Inactive",
        instruments: ["Very Broad Band Sensors", "Wind and Thermal Shield", "Leveling System"],
        model3dType: "dome-seismometer"
      },
      {
        id: "insight-hp3",
        name: "HP3 Heat Flow Probe ('The Mole')",
        type: "Geothermal Probe",
        purpose: "Measure heat flow escaping from Mars' internal mantle.",
        scientificFunction: "Self-hammering mechanical mole designed to burrow up to 5 meters underground.",
        status: "Inactive",
        instruments: ["Tethered Temperature Sensors", "Self-Hammering Motor"],
        model3dType: "drill-probe"
      }
    ]
  },

  // MULTIPLE RICH LUNAR MISSIONS (THE MOON)
  {
    id: "apollo11",
    name: "Apollo 11 Eagle (Tranquility Base)",
    destination: "Moon",
    locationName: "Mare Tranquillitatis (Sea of Tranquility)",
    coordinates: { lat: 0.67, lon: 23.47 },
    launchDate: "1969-07-16",
    landingDate: "1969-07-20",
    status: "Mission Complete",
    nasaConfirmedStatus: "Historic lunar descent stage and lunar surface experiment package rest permanently at Tranquility Base.",
    purpose: "First human landing on the Moon and initial lunar surface sample return.",
    scientificContribution: "Returned 21.5 kg of lunar regolith, demonstrating basaltic lava flows and solar wind element entrapment.",
    agency: "NASA Johnson Space Center",
    officialUrl: "https://www.nasa.gov/mission_pages/apollo/apollo11.html",
    specs: {
      heightMeters: 7.04,
      massKg: 15103,
      crew: 2,
      powerSource: "Silver-Zinc Chemical Batteries (28V)",
      propellant: "Aerozine 50 & N2O4 Hypergolic"
    },
    traverseRoute: [
      { lat: 0.6740, lon: 23.4730, label: "LM Eagle Touchdown Point", evaNumber: 1, description: "Descent engine shutdown. Tranquility Base established." },
      { lat: 0.6741, lon: 23.4728, label: "MESA TV Camera Deploy", evaNumber: 1, description: "Neil Armstrong steps onto lunar surface at 02:56 UTC." },
      { lat: 0.6743, lon: 23.4735, label: "EASEP & LRRR Deployment Site", evaNumber: 1, sampleId: "Sample 10003", description: "Installed Laser Ranging Retroreflector 14m south of LM." },
      { lat: 0.6748, lon: 23.4742, label: "Little West Crater Excursion", evaNumber: 1, sampleId: "Sample 10046", description: "Armstrong ran 60m east to photograph blocky crater rim." }
    ],
    milestones: [
      { id: "pdi", title: "Powered Descent Initiation (PDI)", tag: "PDI BURN", speed: "1,695 m/s", altitude: "15,000 m", desc: "Descent engine ignites at 10% throttle, orienting Eagle windows down." },
      { id: "high_gate", title: "High Gate Pitch-Over", tag: "HIGH GATE", speed: "150 m/s", altitude: "2,300 m", desc: "Spacecraft rotates upright; Armstrong spots boulder-strewn West Crater." },
      { id: "low_gate", title: "Low Gate Manual Redesignation", tag: "MANUAL TAKEOVER", speed: "15 m/s", altitude: "150 m", desc: "Armstrong assumes semi-automatic control to fly past boulder field." },
      { id: "touchdown", title: "Tranquility Base Touchdown", tag: "THE EAGLE HAS LANDED", speed: "0.5 m/s", altitude: "Surface Contact", desc: "Contact light on. 'Houston, Tranquility Base here. The Eagle has landed!'" }
    ],
    hardware: [
      {
        id: "eagle-descent-stage",
        name: "Eagle Lunar Module Descent Stage",
        type: "Lunar Lander Base",
        purpose: "Served as launch platform for Ascent Stage and houses lunar equipment.",
        scientificFunction: "Anchored descent engine, landing pads, and surface experiment storage bays.",
        status: "Inactive",
        instruments: ["Rocket Descent Engine", "Lunar Surface Landing Sensors", "EASEP Equipment Storage"],
        model3dType: "lunar-module",
        subAssemblies: [
          { id: "ascent-cabin", name: "Ascent Stage Crew Cabin", offset: [0, 1.8, 0], description: "Pressurized compartment for Armstrong and Aldrin.", spec: "Mass: 4,700 kg" },
          { id: "descent-mylar", name: "Mylar Gold Insulated Octagon", offset: [0, 0, 0], description: "Throttleable rocket engine and modular payload quads.", spec: "Thrust: 45.04 kN" },
          { id: "landing-gear", name: "4-Leg Deployable Landing Gear", offset: [0, -0.3, 0], description: "Aluminum honeycomb crushable shock struts with 37-inch footpads.", spec: "Span: 9.4 meters" }
        ]
      },
      {
        id: "lrrk-reflector",
        name: "Laser Ranging Retroreflector (LRRR)",
        type: "Passive Optical Array",
        purpose: "Measure Earth-Moon distance precisely using laser beams bounced from Earth.",
        scientificFunction: "Contains 100 quartz corner-cube prisms that reflect laser light back to terrestrial observatories.",
        status: "Operational",
        instruments: ["Fused Silica Corner Cube Prisms", "Aluminum Support Palette"],
        model3dType: "prism-panel"
      }
    ]
  },
  {
    id: "apollo15",
    name: "Apollo 15 Falcon & Lunar Roving Vehicle",
    destination: "Moon",
    locationName: "Hadley-Apennine Region",
    coordinates: { lat: 26.13, lon: 3.63 },
    launchDate: "1971-07-26",
    landingDate: "1971-07-30",
    status: "Mission Complete",
    nasaConfirmedStatus: "Lunar Roving Vehicle (LRV-1) rests at Hadley Rille site.",
    purpose: "First J-series long-duration lunar exploration with the Lunar Roving Vehicle (LRV).",
    scientificContribution: "Traversed 27.9 km across Hadley Rille and recovered the famous 'Genesis Rock' (4.1 billion-year-old anorthosite).",
    agency: "NASA Johnson Space Center / Boeing",
    officialUrl: "https://www.nasa.gov/mission_pages/apollo/apollo15.html",
    specs: {
      heightMeters: 7.3,
      massKg: 16430,
      crew: 2,
      powerSource: "LRV Dual 36V Silver-Zinc Batteries",
      propellant: "Hypergolic Aerozine 50"
    },
    traverseRoute: [
      { lat: 26.132, lon: 3.633, label: "Falcon LM Landing Site", evaNumber: 1, description: "Landed near Hadley Rille canyon." },
      { lat: 26.115, lon: 3.655, label: "Station 2: Mount Hadley Delta", evaNumber: 2, sampleId: "Sample 15415 (Genesis Rock)", description: "Discovered 4.1-billion-year-old white anorthosite crust sample." },
      { lat: 26.155, lon: 3.595, label: "Station 9: Hadley Rille Rim", evaNumber: 3, sampleId: "Sample 15555", description: "Sampled 300m deep meandering canyon and layered basalt cliffs." }
    ],
    hardware: [
      {
        id: "apollo15-lrv",
        name: "Lunar Roving Vehicle (LRV-1 'Moon Buggy')",
        type: "Lunar Electric Rover",
        purpose: "Transport two astronauts and 100+ kg of scientific equipment across lunar terrain.",
        scientificFunction: "Electric four-wheel drive vehicle with mesh wire tires, high-gain directional antenna, and TV camera.",
        status: "Inactive",
        instruments: ["Electric Wheel Drive Motors", "Wire Mesh Tires", "Lunar Communications Relay Unit", "Color TV Camera"],
        model3dType: "lunar-rover"
      },
      {
        id: "apollo15-drill",
        name: "Apollo Lunar Surface Drill (ALSD)",
        type: "Drilling Tool",
        purpose: "Obtain deep core samples up to 3 meters below the lunar surface.",
        scientificFunction: "Rotary percussive battery drill used to measure subsurface heat flow gradient.",
        status: "Inactive",
        instruments: ["Rotary Percussive Motor", "Tungsten Carbide Bit", "Fiberglass Core Tubes"],
        model3dType: "drill-probe"
      }
    ]
  },
  {
    id: "apollo17",
    name: "Apollo 17 Challenger & Taurus-Littrow Station",
    destination: "Moon",
    locationName: "Taurus-Littrow Valley",
    coordinates: { lat: 20.19, lon: 30.77 },
    launchDate: "1972-12-07",
    landingDate: "1972-12-11",
    status: "Mission Complete",
    nasaConfirmedStatus: "Final Apollo surface exploration site; Challenger descent stage remains on moon.",
    purpose: "Geological exploration by geologist astronaut Harrison Schmitt and Gene Cernan.",
    scientificContribution: "Discovered orange volcanic glass soil at Shorty Crater, proving ancient explosive lunar volcanism.",
    agency: "NASA Johnson Space Center",
    officialUrl: "https://www.nasa.gov/mission_pages/apollo/apollo17.html",
    specs: {
      heightMeters: 7.3,
      massKg: 16450,
      crew: 2,
      powerSource: "Silver-Zinc Battery Banks",
      propellant: "Hypergolic Aerozine 50"
    },
    traverseRoute: [
      { lat: 20.190, lon: 30.771, label: "Challenger LM Touchdown", evaNumber: 1, description: "Landed between North and South Massifs." },
      { lat: 20.180, lon: 30.700, label: "Station 4: Shorty Crater Rim", evaNumber: 2, sampleId: "Sample 74220 (Orange Soil)", description: "Harrison Schmitt discovered orange pyroclastic volcanic beads." },
      { lat: 20.215, lon: 30.750, label: "Station 6: Split Boulder", evaNumber: 3, sampleId: "Sample 76015", description: "Sampled gigantic fractured impact breccia block on North Massif." }
    ],
    hardware: [
      {
        id: "apollo17-lrv",
        name: "Apollo 17 Lunar Roving Vehicle (LRV-3)",
        type: "Lunar Electric Rover",
        purpose: "Final Apollo lunar rover traverse covering 35.7 km across Taurus-Littrow valley.",
        scientificFunction: "Equipped with traverse gravimeter and surface electrical properties transmitter.",
        status: "Inactive",
        instruments: ["Traverse Gravimeter", "Surface Electrical Transmitter", "High Gain Parabolic Antenna"],
        model3dType: "lunar-rover"
      },
      {
        id: "orange-soil-sampler",
        name: "Trenching Sampler & Shorty Crater Probe",
        type: "Geological Sampling Kit",
        purpose: "Collect pyroclastic orange glass beads from Shorty Crater rim.",
        scientificFunction: "Sampling scoop and trenching rake that unearthed titanium-rich volcanic beads formed 3.6 billion years ago.",
        status: "Inactive",
        instruments: ["Geological Trenching Rake", "Core Sample Vacuum Tubes"],
        model3dType: "box-module"
      }
    ]
  },
  {
    id: "artemis3",
    name: "Artemis III & SpaceX Starship HLS",
    destination: "Moon",
    locationName: "Shackleton Crater Rim (Lunar South Pole)",
    coordinates: { lat: -89.9, lon: 0.0 },
    launchDate: "2026-09-01",
    landingDate: "2026-09-07",
    status: "Still traveling",
    nasaConfirmedStatus: "NASA flagship mission to land the first woman and first person of color on the Moon.",
    purpose: "Establish human presence at the lunar south pole and prospect for water ice in permanently shadowed craters.",
    scientificContribution: "Extract polar volatiles, analyze ancient South Pole-Aitken basin ejecta, and validate cryogenic in-situ propellant production.",
    agency: "NASA / SpaceX / Axiom Space",
    officialUrl: "https://www.nasa.gov/artemis-program/",
    specs: {
      heightMeters: 50.0,
      massKg: 1200000,
      crew: 4,
      powerSource: "Top-Mounted Solar Array Skirt & Fuel Cells",
      propellant: "Liquid Methane (CH4) & Liquid Oxygen (LOX)"
    },
    traverseRoute: [
      { lat: -89.88, lon: 0.02, label: "Starship HLS Landing Pad", evaNumber: 1, description: "Pinpoint landing on illuminated ridge adjacent to Shackleton Crater." },
      { lat: -89.90, lon: 0.05, label: "Connecting Ridge Science Site", evaNumber: 1, sampleId: "Artemis Polar Core 01", description: "Axiom xEMU spacesuit surface exploration under grazing solar illumination." },
      { lat: -89.95, lon: 0.00, label: "Permanently Shadowed Ice Pit", evaNumber: 2, sampleId: "Cryogenic Volatiles Cache", description: "Sampling water ice and clathrates at 25 Kelvin (-248°C)." }
    ],
    milestones: [
      { id: "sls_launch", title: "SLS Block 1B Liftoff", tag: "TRANSLUNAR INJECTION", speed: "11.1 km/s", altitude: "Earth Escape", desc: "Orion crew spacecraft launches toward lunar orbit." },
      { id: "nrho_dock", title: "NRHO Gateway / Starship Docking", tag: "ORBITAL DOCKING", speed: "1.2 km/s", altitude: "Lunar Polar Orbit", desc: "Crew transfers into SpaceX Starship Human Landing System." },
      { id: "powered_descent", title: "Starship Raptor Powered Descent", tag: "RAPTOR PULSE", speed: "15 m/s", altitude: "500 m", desc: "Forward thruster pods ignite to minimize dust regolith plume." },
      { id: "polar_touchdown", title: "South Pole Touchdown Confirmed", tag: "SHACKLETON BASE", speed: "0.0 m/s", altitude: "Surface Contact", desc: "Humanity returns to the Moon to stay!" }
    ],
    hardware: [
      {
        id: "starship-hls",
        name: "SpaceX Starship Human Landing System (HLS)",
        type: "Next-Gen Lunar Lander",
        purpose: "Transport 4 astronauts and 100+ tons of cargo from lunar orbit to the South Pole surface.",
        scientificFunction: "50-meter skyscraper reusable lander powered by Raptor vacuum engines with elevator airlock.",
        status: "Still traveling",
        instruments: ["Raptor Methane Engines", "Forward Landing Thrusters", "External Cargo Elevator", "Regolith Slag Shield"],
        model3dType: "starship-hls"
      },
      {
        id: "axiom-suit",
        name: "Axiom AxEMU Lunar Spacesuit",
        type: "Extravehicular Mobility Unit",
        purpose: "Support astronauts for 8+ hour moonwalks in extreme polar temperatures (-200°C to +120°C).",
        scientificFunction: "Equipped with HD helmet cameras, cryogenic joint bearings, and integrated life support backpacks.",
        status: "Operational",
        instruments: ["Cryogenic Thermal Micrometeoroid Garment", "HD Biometric Heads-Up Display"],
        model3dType: "sensor-mast"
      }
    ]
  },
  {
    id: "ladee",
    name: "NASA LADEE Lunar Atmosphere & Dust Explorer",
    destination: "Moon",
    locationName: "Equatorial Lunar Orbit (20–60 km altitude)",
    coordinates: { lat: 10.8, lon: -91.6 },
    launchDate: "2013-09-06",
    landingDate: "2014-04-18",
    status: "Mission Complete",
    nasaConfirmedStatus: "Groundbreaking Lunar Science & Record 622 Mbps Laser Comm",
    purpose: "Characterize tenuous lunar atmosphere and dust environment, demonstrating high-bandwidth optical laser communications.",
    scientificContribution: "Confirmed continuous asymmetric exospheric dust clouds lofted by meteoroids; achieved historic 622 Mbps error-free Earth laser downlink.",
    agency: "NASA Ames Research Center",
    officialUrl: "https://www.nasa.gov/mission_pages/ladee/main/",
    specs: {
      heightMeters: 2.37,
      massKg: 383,
      crew: 0,
      powerSource: "Body-Mounted 295W Silicon Solar Panels",
      propellant: "Bipropellant NTO/N2H4"
    },
    hardware: [
      {
        id: "ladee-ldex",
        name: "Lunar Dust Experiment (LDEX)",
        type: "Impact Ionization Dust Sensor",
        purpose: "Detect sub-micron dust grains lofted into lunar orbit.",
        scientificFunction: "Impact ionization target resolving individual dust particle masses and density.",
        status: "Mission Complete",
        instruments: ["LDEX Impact Target", "NMS Mass Spectrometer", "LLCD Laser Terminal"],
        model3dType: "lunar-ladee"
      }
    ]
  },
  {
    id: "chandrayaan3",
    name: "Chandrayaan-3 Vikram & Pragyan",
    destination: "Moon",
    locationName: "Shiv Shakti Point (Lunar South Pole)",
    coordinates: { lat: -69.37, lon: 32.35 },
    launchDate: "2023-07-14",
    landingDate: "2023-08-23",
    status: "Mission Complete",
    nasaConfirmedStatus: "ISRO historic mission: First nation to achieve a soft landing near the lunar south pole.",
    purpose: "Demonstrate end-to-end safe soft-landing and in-situ roving near the lunar south pole.",
    scientificContribution: "ChaSTE probe discovered extreme temperature gradients in regolith; LIBS laser confirmed Sulphur and metals in polar soil.",
    agency: "ISRO (Indian Space Research Organisation)",
    officialUrl: "https://www.isro.gov.in/Chandrayaan3.html",
    specs: {
      heightMeters: 2.5,
      massKg: 1752,
      crew: 0,
      powerSource: "Vikram 738W & Pragyan 50W Solar Panels",
      propellant: "Bi-propellant MMH & MON-3"
    },
    traverseRoute: [
      { lat: -69.367, lon: 32.348, label: "Vikram Touchdown (Shiv Shakti Point)", evaNumber: 1, description: "Historic soft landing on lunar south pole highland." },
      { lat: -69.368, lon: 32.349, label: "Pragyan Rover Ramp Rollout", evaNumber: 1, description: "26 kg solar-powered rover drives down deployable ramp." },
      { lat: -69.370, lon: 32.353, label: "ChaSTE Thermal Depth Measurement", evaNumber: 1, sampleId: "ISRO Regolith Profile", description: "Measured +50°C surface down to -10°C at 8cm depth." }
    ],
    hardware: [
      {
        id: "vikram-lander",
        name: "Vikram Lander",
        type: "Robotic Polar Lander",
        purpose: "Safe touchdown platform with hazard detection cameras and scientific payload bays.",
        scientificFunction: "Housed ChaSTE thermal probe, RAMBHA plasma sensor, and ILSA seismometer.",
        status: "Mission Complete",
        instruments: ["ChaSTE Thermal Probe", "ILSA Lunar Seismometer", "RAMBHA Langmuir Probe"],
        model3dType: "lunar-module"
      },
      {
        id: "pragyan-rover",
        name: "Pragyan Rover",
        type: "Lunar Robotic Rover",
        purpose: "Explore surface composition across 100 meters using Laser Breakdown Spectroscope.",
        scientificFunction: "Equipped with APXS and LIBS to verify chemical elements in lunar regolith.",
        status: "Mission Complete",
        instruments: ["LIBS Laser Spectroscope", "APXS Alpha Particle Spectrometer", "Rocker-Bogie 6-Wheel Drive"],
        model3dType: "lunar-rover"
      }
    ]
  },
  {
    id: "change4",
    name: "Chang'e 4 & Yutu-2 (Lunar Far Side)",
    destination: "Moon",
    locationName: "Von Kármán Crater (Far Side)",
    coordinates: { lat: -45.45, lon: 177.59 },
    launchDate: "2018-12-07",
    landingDate: "2019-01-03",
    status: "Operational",
    nasaConfirmedStatus: "First landing in human history on the Far Side of the Moon.",
    purpose: "Explore the ancient South Pole-Aitken basin and conduct low-frequency radio astronomy free from Earth interference.",
    scientificContribution: "Mapped upper 300 meters of far-side regolith using ground-penetrating radar; demonstrated biosphere seed germination.",
    agency: "CNSA (China National Space Administration)",
    officialUrl: "https://www.cnsa.gov.cn/",
    specs: {
      heightMeters: 2.8,
      massKg: 1200,
      crew: 0,
      powerSource: "Solar Arrays & Radioisotope Heating Unit",
      propellant: "Hydrazine Propulsion"
    },
    hardware: [
      {
        id: "yutu2-rover",
        name: "Yutu-2 ('Jade Rabbit 2') Rover",
        type: "Far-Side Robotic Rover",
        purpose: "Longest-operating lunar rover in history, exploring Von Kármán crater.",
        scientificFunction: "Equipped with Lunar Penetrating Radar (LPR) and VNIS infrared spectrometer.",
        status: "Operational",
        instruments: ["Lunar Penetrating Radar (LPR)", "Visible and Near-Infrared Spectrometer"],
        model3dType: "lunar-rover"
      }
    ]
  },
  {
    id: "lro",
    name: "Lunar Reconnaissance Orbiter (LRO)",
    destination: "Moon",
    locationName: "Lunar Polar Orbit & Shackleton Crater",
    coordinates: { lat: -89.9, lon: 0.0 },
    launchDate: "2009-06-18",
    landingDate: "2009-06-23",
    status: "Operational",
    nasaConfirmedStatus: "Active mapping of lunar polar ice reserves & Artemis landing zones",
    purpose: "Map the lunar surface in sub-meter resolution and search for polar water ice deposits.",
    scientificContribution: "Created 3D topographic map of Moon with 3 billion height measurements; confirmed water ice inside shadowed craters.",
    agency: "NASA Goddard Space Flight Center",
    officialUrl: "https://www.nasa.gov/mission_pages/LRO/main/index.html",
    hardware: [
      {
        id: "lroc-camera",
        name: "LROC (Lunar Reconnaissance Orbiter Camera)",
        type: "High Resolution Camera Array",
        purpose: "Capture sub-meter resolution images of lunar landers, craters, and boulders.",
        scientificFunction: "Narrow Angle Camera (NAC) pair resolving features as small as 50 cm per pixel.",
        status: "Operational",
        instruments: ["Dual Narrow Angle Cameras", "Wide Angle Multispectral Camera"],
        model3dType: "camera-head"
      },
      {
        id: "diviner-radiometer",
        name: "Diviner Lunar Radiometer Experiment",
        type: "Thermal Infrared Radiometer",
        purpose: "Measure surface temperatures across lunar day and night down to -248°C (25 Kelvin).",
        scientificFunction: "Identified coldest shadowed areas in the Solar System inside polar craters.",
        status: "Operational",
        instruments: ["9-Channel Thermal Radiometer", "Solar Reflectance Sensor"],
        model3dType: "sensor-mast"
      }
    ]
  },
  {
    id: "surveyor3",
    name: "Surveyor 3 Lunar Lander",
    destination: "Moon",
    locationName: "Oceanus Procellarum (Ocean of Storms)",
    coordinates: { lat: -3.01, lon: -23.42 },
    launchDate: "1967-04-17",
    landingDate: "1967-04-20",
    status: "Mission Complete",
    nasaConfirmedStatus: "Lander inspected on the Moon by Apollo 12 astronauts in Nov 1969.",
    purpose: "Perform soft lunar landing and soil mechanics testing ahead of Apollo.",
    scientificContribution: "Dug first mechanized trenches into lunar soil; camera returned to Earth by Apollo 12 crew for micro-meteoroid impact analysis.",
    agency: "NASA JPL",
    officialUrl: "https://www.jpl.nasa.gov/missions/surveyor-3",
    hardware: [
      {
        id: "surveyor3-sampler",
        name: "Surface Sampler Soil Arm",
        type: "Robotic Trenching Arm",
        purpose: "Dig trenches in lunar regolith to measure soil bearing strength.",
        scientificFunction: "Pantograph mechanism scoop driven by electric motors.",
        status: "Inactive",
        instruments: ["Motorized Pantograph Arm", "Soil Scoop Container"],
        model3dType: "drill-probe"
      }
    ]
  },
  {
    id: "jwst",
    name: "James Webb Space Telescope (JWST)",
    destination: "Astrophysics",
    locationName: "Sun-Earth L2 Lagrange Point (1.5 Million km)",
    coordinates: { lat: 0, lon: 0 },
    launchDate: "2021-12-25",
    landingDate: "2022-01-24",
    status: "Operational",
    nasaConfirmedStatus: "Active flagship astrophysics observatory at L2 Lagrange point",
    purpose: "Uncover the first galaxies formed after the Big Bang, analyze exoplanet atmospheres, and map star-forming nebulae in deep space.",
    scientificContribution: "Captured the deepest infrared images of the early universe, detected atmospheric water & CO2 on WASP-39b, and mapped star birth in Carina Nebula.",
    agency: "NASA / ESA / CSA / STScI",
    officialUrl: "https://webb.nasa.gov/",
    hardware: [
      {
        id: "jwst-primary-mirror",
        name: "JWST 18-Hexagon Gold Beryllium Mirror Matrix",
        type: "Astrophysics Optical Telescope",
        purpose: "Collect faint infrared light from 13.5 billion light-years across the observable universe.",
        scientificFunction: "6.5-meter primary mirror array composed of 18 hexagonal beryllium segments coated in 100nm of pure gold.",
        status: "Operational",
        instruments: ["18 Gold-Coated Hexagonal Mirror Segments", "Aft Optics System", "Secondary Mirror Spider"],
        model3dType: "jwst-telescope"
      },
      {
        id: "jwst-sunshield",
        name: "JWST 5-Layer Tennis-Court Kapton Sunshield",
        type: "Thermal Radiative Shield",
        purpose: "Block solar radiation and keep scientific instruments cooled to -233°C (40 Kelvin).",
        scientificFunction: "Five ultra-thin Kapton layers coated with aluminum and silicon protecting optics from Earth and Sun heat.",
        status: "Operational",
        instruments: ["5-Layer Kapton Membrane", "Deployable Booms & Spreader Bars"],
        model3dType: "jwst-sunshield"
      },
      {
        id: "jwst-miri",
        name: "MIRI (Mid-Infrared Instrument) & NIRCam",
        type: "Infrared Spectrometer Array",
        purpose: "Imager and spectrometer operating at mid-infrared wavelengths.",
        scientificFunction: "Equipped with a helium loop cryocooler cooling MIRI down to 6 Kelvin to image redshifted early galaxies.",
        status: "Operational",
        instruments: ["Helium Closed-Cycle Cryocooler", "Arsenic-Doped Silicon Detectors"],
        model3dType: "sensor-mast"
      }
    ]
  },
  {
    id: "hubble",
    name: "Hubble Space Telescope (HST)",
    destination: "Astrophysics",
    locationName: "Low Earth Orbit (540 km Altitude)",
    coordinates: { lat: 28.5, lon: -80.6 },
    launchDate: "1990-04-24",
    landingDate: "1990-04-25",
    status: "Operational",
    nasaConfirmedStatus: "Active iconic space observatory, 34+ years of deep space discovery",
    purpose: "Provide ultra-sharp visible, ultraviolet, and near-infrared images of distant deep space targets without atmospheric distortion.",
    scientificContribution: "Precisely measured the expansion rate of the universe (Hubble Constant), discovered dark energy, and imaged Pillars of Creation.",
    agency: "NASA / ESA / STScI",
    officialUrl: "https://hubblesite.org/",
    hardware: [
      {
        id: "hubble-primary-mirror",
        name: "Hubble 2.4-Meter Ritchey-Chrétien Primary Mirror",
        type: "Optical Astrophysics Telescope",
        purpose: "Focus visible and ultraviolet light from distant galaxies onto scientific instruments.",
        scientificFunction: "Ultra-precise 2.4m glass mirror polished to within 10 nanometers accuracy.",
        status: "Operational",
        instruments: ["2.4m Primary Mirror", "Secondary Mirror Assembly", "Aperture Door Mechanism"],
        model3dType: "hubble-telescope"
      },
      {
        id: "hubble-solar-arrays",
        name: "GaAs Rigid Solar Array Wings",
        type: "Orbital Electrical Power",
        purpose: "Generate 2,800 Watts of electrical power for instruments and gyroscopes.",
        scientificFunction: "Gallium arsenide solar cell panels installed during Servicing Mission 3B.",
        status: "Operational",
        instruments: ["Dual Solar Array Wings", "Nickel-Hydrogen Battery Bank"],
        model3dType: "hubble-solar-arrays"
      }
    ]
  }
];
