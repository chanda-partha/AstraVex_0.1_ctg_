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
  },
  {
    id: "nasa-donki",
    name: "NASA DONKI Space Weather Database",
    type: "REST API",
    baseUrl: "https://api.nasa.gov/DONKI",
    requiresKey: true,
    documentationUrl: "https://api.nasa.gov/#donki",
    supportedDestinations: ["Earth Orbit", "Moon", "Mars", "Deep Space"],
    supportedDataTypes: ["Solar Flares", "CME Alerts", "Geomagnetic Storms"],
    enabled: true
  },
  {
    id: "iss-live-orbit",
    name: "Where The ISS At? Live Orbital Telemetry",
    type: "REST API",
    baseUrl: "https://api.wheretheiss.at/v1/satellites/25544",
    requiresKey: false,
    documentationUrl: "https://wheretheiss.at/w/developer",
    supportedDestinations: ["Earth Orbit"],
    supportedDataTypes: ["Real-Time Latitude/Longitude", "Altitude", "Orbital Velocity"],
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
    coordinates: { lat: 18.44, lon: 77.45 },
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
        model3dType: "rover-perseverance"
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
        model3dType: "rover-perseverance"
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
        model3dType: "rover-curiosity"
      },
      {
        id: "chemcam",
        name: "ChemCam Laser & Camera",
        type: "Remote Sensing Spectrometer",
        purpose: "Analyze chemical composition of rocks from a distance.",
        scientificFunction: "Uses laser-induced breakdown spectroscopy to vaporize thin layers of rock up to 7m away.",
        status: "Operational",
        instruments: ["Laser Pulse Emitter", "Telescopic Optics", "Spectrometer System"],
        model3dType: "rover-curiosity"
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
        model3dType: "insight-lander"
      },
      {
        id: "insight-hp3",
        name: "HP3 Heat Flow Probe ('The Mole')",
        type: "Geothermal Probe",
        purpose: "Measure heat flow escaping from Mars' internal mantle.",
        scientificFunction: "Self-hammering mechanical mole designed to burrow up to 5 meters underground.",
        status: "Inactive",
        instruments: ["Tethered Temperature Sensors", "Self-Hammering Motor"],
        model3dType: "insight-lander"
      }
    ]
  },
  {
    id: "viking",
    name: "Viking 1 Lander",
    destination: "Mars",
    locationName: "Chryse Planitia (22.48°, -47.97°)",
    coordinates: { lat: 22.48, lon: -47.97 },
    launchDate: "1975-08-20",
    landingDate: "1976-07-20",
    status: "Mission Complete",
    nasaConfirmedStatus: "Historic milestone: First successful long-term Mars surface mission (1976–1982)",
    purpose: "Transmit the first surface panoramas of Mars, measure meteorology, and conduct astrobiology soil experiments.",
    scientificContribution: "Captured the first clear photographs from Mars surface and mapped daily pressure, wind, and temperature cycles for 6 years.",
    agency: "NASA Langley / JPL",
    officialUrl: "https://science.nasa.gov/mission/viking-1/",
    hardware: [
      {
        id: "viking-chassis",
        name: "Viking 1 Lander & Biology Lab",
        type: "Historic Mars Surface Lander",
        purpose: "Perform automated soil sampling and meteorology measurements on Chryse Planitia.",
        scientificFunction: "Powered by dual SNAP-19 RTG nuclear generators, equipped with stereo facsimile cameras and a surface sampler arm.",
        status: "Mission complete",
        instruments: ["SNAP-19 RTG", "Surface Sampler Arm", "Gas Chromatograph Mass Spectrometer", "Meteorology Boom"],
        model3dType: "viking-lander"
      }
    ]
  },
  {
    id: "mro",
    name: "Mars Reconnaissance Orbiter (MRO)",
    destination: "Mars",
    locationName: "Sun-Synchronous Polar Mars Orbit (250–316 km)",
    coordinates: { lat: 0, lon: 0 },
    launchDate: "2005-08-12",
    landingDate: "2006-03-10",
    status: "Operational",
    nasaConfirmedStatus: "Active orbital reconnaissance and primary Deep Space Network data relay for surface rovers",
    purpose: "Map Mars in sub-meter resolution with HiRISE, study subsurface ice and minerals, and relay data from Perseverance and Curiosity.",
    scientificContribution: "Relayed hundreds of terabits of science data from Mars surface rovers and imaged landing sites and active dust storms.",
    agency: "NASA / JPL-Caltech",
    officialUrl: "https://mars.nasa.gov/mro/",
    hardware: [
      {
        id: "hirise",
        name: "HiRISE 0.5m Optical Reflecting Telescope",
        type: "High-Resolution Orbital Camera",
        purpose: "Capture crystal-clear 30 cm/pixel orbital photography of Martian craters, rovers, and landing hazards.",
        scientificFunction: "Uses a 0.5-meter Cassegrain reflecting telescope and 14 CCD detectors to image Mars from ~300 km altitude.",
        status: "Operational",
        instruments: ["0.5m Reflecting Telescope", "CRISM Spectrometer", "SHARAD Subsurface Radar", "3m High-Gain Dish"],
        model3dType: "mro-orbiter"
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
        id: "lunar-laser-retro",
        name: "Laser Ranging Retroreflector (LRRR)",
        type: "Passive Optical Array",
        purpose: "Measure Earth-Moon distance precisely using laser beams bounced from Earth.",
        scientificFunction: "Contains 100 quartz corner-cube prisms that reflect laser light back to terrestrial observatories.",
        status: "Operational",
        instruments: ["Fused Silica Corner Cube Prisms", "Aluminum Support Palette"],
        model3dType: "lunar-module"
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
        model3dType: "lunar-rover"
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
        model3dType: "apollo17-station"
      },
      {
        id: "orange-soil-sampler",
        name: "Trenching Sampler & Shorty Crater Probe",
        type: "Geological Sampling Kit",
        purpose: "Collect pyroclastic orange glass beads from Shorty Crater rim.",
        scientificFunction: "Sampling scoop and trenching rake that unearthed titanium-rich volcanic beads formed 3.6 billion years ago.",
        status: "Inactive",
        instruments: ["Geological Trenching Rake", "Core Sample Vacuum Tubes"],
        model3dType: "apollo17-station"
      }
    ]
  },
  {
    id: "artemis3",
    name: "Artemis III & SpaceX Starship HLS",
    destination: "Moon",
    locationName: "Shackleton Crater Rim (Lunar South Pole)",
    coordinates: { lat: -89.9, lon: 0.0 },
    launchDate: "2027-06-01",
    landingDate: "2027-06-07",
    status: "Planned (Artemis 2027)",
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
        status: "Prelaunch (Artemis III — Scheduled 2027)",
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
        model3dType: "starship-hls"
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
        model3dType: "chandrayaan3-vikram"
      },
      {
        id: "pragyan-rover",
        name: "Pragyan Rover",
        type: "Lunar Robotic Rover",
        purpose: "Explore surface composition across 100 meters using Laser Breakdown Spectroscope.",
        scientificFunction: "Equipped with APXS and LIBS to verify chemical elements in lunar regolith.",
        status: "Mission Complete",
        instruments: ["LIBS Laser Spectroscope", "APXS Alpha Particle Spectrometer", "Rocker-Bogie 6-Wheel Drive"],
        model3dType: "chandrayaan3-vikram"
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
        model3dType: "change4-yutu2"
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
        model3dType: "lro-orbiter"
      },
      {
        id: "diviner-radiometer",
        name: "Diviner Lunar Radiometer Experiment",
        type: "Thermal Infrared Radiometer",
        purpose: "Measure surface temperatures across lunar day and night down to -248°C (25 Kelvin).",
        scientificFunction: "Identified coldest shadowed areas in the Solar System inside polar craters.",
        status: "Operational",
        instruments: ["9-Channel Thermal Radiometer", "Solar Reflectance Sensor"],
        model3dType: "lro-orbiter"
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
        model3dType: "surveyor3-lander"
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
        model3dType: "jwst-telescope"
      },
      {
        id: "jwst-miri",
        name: "MIRI (Mid-Infrared Instrument) & NIRCam",
        type: "Infrared Spectrometer Array",
        purpose: "Imager and spectrometer operating at mid-infrared wavelengths.",
        scientificFunction: "Equipped with a helium loop cryocooler cooling MIRI down to 6 Kelvin to image redshifted early galaxies.",
        status: "Operational",
        instruments: ["Helium Closed-Cycle Cryocooler", "Arsenic-Doped Silicon Detectors"],
        model3dType: "jwst-telescope"
      }
    ]
  },
  {
    id: "hubble",
    name: "Hubble Space Telescope (HST)",
    destination: "Astrophysics",
    locationName: "Low Earth Orbit (~535 km Altitude, 28.47° Inclination)",
    coordinates: { lat: 0, lon: 0 },
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
        model3dType: "hubble-telescope"
      }
    ]
  },
  {
    id: "iss",
    name: "International Space Station (ISS)",
    destination: "Orbital",
    locationName: "Low Earth Orbit (~418 km Altitude, 51.64° Inclination)",
    coordinates: { lat: 0, lon: 0 },
    launchDate: "1998-11-20",
    landingDate: "1998-11-20",
    status: "Operational",
    nasaConfirmedStatus: "Active permanently crewed orbital laboratory completing 16 sunrises every 24 hours",
    purpose: "Conduct microgravity biology, physics, Earth observation, and deep-space life-support testing in Low Earth Orbit.",
    scientificContribution: "Supports continuous human presence in space since November 2000 with over 3,300 scientific investigations.",
    agency: "NASA / ESA / JAXA / CSA / Roscosmos",
    officialUrl: "https://www.nasa.gov/international-space-station/",
    hardware: [
      {
        id: "iss-solar",
        name: "ISS Main Truss Solar Arrays & Pressurized Modules",
        type: "Orbital Research Station",
        purpose: "Generate up to 240 kW of electrical power and house international microgravity research laboratories.",
        scientificFunction: "Features 109m integrated truss, Destiny/Columbus/Kibo labs, Cupola Earth observatory, and Canadarm2.",
        status: "Operational",
        instruments: ["Solar Array Wings", "Cupola Observatory", "Destiny US Lab", "Canadarm2 Robotics"],
        model3dType: "iss-station"
      }
    ]
  },
  {
    id: "voyager",
    name: "Voyager 1 Interstellar Probe",
    destination: "DeepSpace",
    locationName: "Interstellar Medium (~166 AU from Earth)",
    coordinates: { lat: 0, lon: 0 },
    launchDate: "1977-09-05",
    landingDate: "2012-08-25",
    status: "Operational",
    nasaConfirmedStatus: "Active interstellar spacecraft beyond the heliopause transmitting plasma-wave and cosmic-ray data",
    purpose: "Conducted the Grand Tour of Jupiter and Saturn before crossing the heliopause into interstellar space.",
    scientificContribution: "Captured the Pale Blue Dot portrait, discovered active volcanism on Io, and became humanity's first probe in interstellar space.",
    agency: "NASA JPL",
    officialUrl: "https://science.nasa.gov/mission/voyager/",
    hardware: [
      {
        id: "voyager-dish",
        name: "3.7m High-Gain Parabolic Dish Antenna",
        type: "Interstellar Deep Space Antenna",
        purpose: "Maintain X-band & S-band Deep Space Network communication across 24+ billion km.",
        scientificFunction: "23-watt Cassegrain dish downlinking telemetry across a ~23-hour one-way light delay to Earth.",
        status: "Operational",
        instruments: ["3.7m Parabolic Dish", "Three MHW-RTG Plutonium Units", "Cosmic Ray Subsystem", "Plasma Wave Science"],
        model3dType: "voyager-probe"
      },
      {
        id: "golden-record",
        name: "The Voyager Interstellar Golden Record",
        type: "Interstellar Cultural Time Capsule",
        purpose: "Carry audio, greetings in 55 languages, music, and encoded imagery of Earth beyond the Solar System.",
        scientificFunction: "12-inch gold-plated copper phonograph disc with uranium-238 electroplated timing source.",
        status: "Operational",
        instruments: ["Gold-Plated Copper Phonograph", "Diamond Playback Stylus", "Star Pulsar Locator Map"],
        model3dType: "voyager-probe"
      }
    ]
  }
];

export const SUBSYSTEM_REGISTRY = {
  pixl: {
    id: "pixl",
    name: "PIXL & SHERLOC Robotic Arm Turret",
    type: "X-Ray & UV Micro-Spectrometer",
    purpose: "Map elemental chemistry and organic biosignatures across millimeter-scale Martian rock surfaces.",
    scientificFunction: "Fires micro-focused X-rays (PIXL) and deep-UV Raman laser pulses (SHERLOC) from the 2.1m rover turret.",
    status: "Operational",
    instruments: ["PIXL X-Ray Fluorescence", "SHERLOC Deep-UV Raman", "WATSON Context Camera"],
    model3dType: "rover-perseverance"
  },
  rimfax: {
    id: "rimfax",
    name: "RIMFAX Ground-Penetrating Radar",
    type: "Subsurface Radar Imager",
    purpose: "Probe 10–20 meters below Jezero Crater to map ancient lakebed sediment stratigraphy.",
    scientificFunction: "Swept-frequency 150–1200 MHz radar profiling buried bedrock, clay layers, and brine signatures.",
    status: "Operational",
    instruments: ["RIMFAX Rear Dipoles", "Radar Transceiver Electronics"],
    model3dType: "rover-perseverance"
  },
  "rotor-system": {
    id: "rotor-system",
    name: "Ingenuity Counter-Rotating Carbon Blades",
    type: "Ultrathin Martian Aerodynamics Rotor",
    purpose: "Generate aerodynamic lift in Mars' 1%-density CO2 atmosphere.",
    scientificFunction: "Dual 1.2m counter-rotating carbon-fiber rotors spinning up to 2,800 RPM during autonomous sorties.",
    status: "Retired",
    instruments: ["Carbon-Fiber Airfoil Blades", "Swashplate Pitch Actuators"],
    model3dType: "helicopter-ingenuity"
  },
  mastcam: {
    id: "mastcam",
    name: "Mastcam Multispectral Stereo Imager",
    type: "True-Color Planetary Camera Pair",
    purpose: "Capture high-definition stereo panoramas and telephoto mineral geology around Gale Crater.",
    scientificFunction: "Paired 34mm wide and 100mm telephoto RGB Bayer cameras mounted on Curiosity's remote sensing mast.",
    status: "Operational",
    instruments: ["M-34 Wide Camera", "M-100 Telephoto", "Radiometric Calibration Target"],
    model3dType: "rover-curiosity"
  },
  apxs: {
    id: "apxs",
    name: "APXS & MAHLI Arm Micro-Imager",
    type: "Contact Geochemistry Turret",
    purpose: "Quantify elemental abundances from sodium through bromine and inspect sand grains at 14 µm resolution.",
    scientificFunction: "Alpha Particle X-Ray Spectrometer paired with the focusable MAHLI lens on Curiosity's arm.",
    status: "Operational",
    instruments: ["Curium-244 APXS Sensor", "MAHLI Macro Lens", "Dust Removal Tool"],
    model3dType: "rover-curiosity"
  },
  seis: {
    id: "seis",
    name: "SEIS Ultra-Sensitive Mars Seismometer",
    type: "Planetary Seismology Dome",
    purpose: "Detect sub-atomic ground vibrations from marsquakes and meteoroid impacts.",
    scientificFunction: "Six vacuum-sealed pendulum seismometers protected by the aerodynamic Wind and Thermal Shield.",
    status: "Inactive",
    instruments: ["VBB 3-Axis Pendulums", "Short-Period MEMS Sensors", "Wind & Thermal Shield"],
    model3dType: "insight-lander"
  },
  hp3: {
    id: "hp3",
    name: "HP³ Heat Flow & Physical Properties Probe",
    type: "Subsurface Geothermal Mole",
    purpose: "Measure internal planetary heat escaping through Martian regolith.",
    scientificFunction: "Self-hammering mole with platinum resistance temperature sensors and surface radiometer.",
    status: "Inactive",
    instruments: ["Thermal Science Tether", "TILT Depth Trackers", "RAD Surface Radiometer"],
    model3dType: "insight-lander"
  },
  "solar-arrays": {
    id: "solar-arrays",
    name: "Dual 2.15m UltraFlex Solar Arrays",
    type: "Fold-Out Photovoltaic Generator",
    purpose: "Deliver Martian surface electrical power for InSight science instruments.",
    scientificFunction: "Fan-folding triple-junction solar cells generating up to 600–700 Wh per clear sol.",
    status: "Inactive",
    instruments: ["UltraFlex Decagonal Wings", "Shunt Limiter Bus"],
    model3dType: "insight-lander"
  },
  arm: {
    id: "arm",
    name: "InSight Robotic Instrument Deployment Arm",
    type: "4-DOF Precision Crane Arm",
    purpose: "Lift SEIS and HP³ from the lander deck and place them onto Martian soil.",
    scientificFunction: "2.4m articulated arm with grapple mechanism and Instrument Deployment Camera (IDC).",
    status: "Inactive",
    instruments: ["4-Axis Robotic Boom", "Mechanical Grapple", "IDC Context Camera"],
    model3dType: "insight-lander"
  },
  "viking-rtg": {
    id: "viking-rtg",
    name: "Dual SNAP-19 Plutonium RTG Power Units",
    type: "Radioisotope Thermoelectric Generator",
    purpose: "Supply continuous 70 W power independent of sunlight and Martian dust storms.",
    scientificFunction: "Pu-238 decay thermocouple stacks keeping Viking 1 operating for more than 6 years.",
    status: "Mission Complete",
    instruments: ["SNAP-19 Twin Cylinders", "Thermal Fin Radiators"],
    model3dType: "viking-lander"
  },
  "viking-sampler": {
    id: "viking-sampler",
    name: "Viking Extendable Soil Collector Scoop",
    type: "Automated Astrobiology Soil Arm",
    purpose: "Trench Martian regolith and deliver samples into internal life-detection chambers.",
    scientificFunction: "3-meter furlable boom with backhoe scoop feeding Gas Exchange and Labeled Release experiments.",
    status: "Mission Complete",
    instruments: ["Retractable Boom Tube", "Sieved Collector Head"],
    model3dType: "viking-lander"
  },
  "mro-dish": {
    id: "mro-dish",
    name: "3.0-Meter High-Gain Telecommunications Reflector",
    type: "Deep Space Relay Antenna",
    purpose: "Backhaul terabits of rover and orbital imagery from Mars to NASA Deep Space Network.",
    scientificFunction: "Dual X-band (8.4 GHz) & Ka-band (32 GHz) parabolic gimbal dish capable of 4+ Mbps downlink.",
    status: "Operational",
    instruments: ["3m Honeycombed Dish", "100 W Traveling-Wave Tube Amplifier"],
    model3dType: "mro-orbiter"
  },
  "hls-crew-cabin": {
    id: "hls-crew-cabin",
    name: "Starship HLS Pressurized Crew Cabin",
    type: "Artemis Lunar Habitat",
    purpose: "House 4 Artemis astronauts at the lunar south pole for week-long surface expeditions.",
    scientificFunction: "Upper deck quarters, life-support loop, dual airlocks, and flight avionics.",
    status: "Prelaunch",
    instruments: ["Dual EVA Airlocks", "ECLSS Life Support", "Lunar Navigation Suite"],
    model3dType: "starship-hls"
  },
  "hls-elevator": {
    id: "hls-elevator",
    name: "Astronaut Surface Access Elevator Platform",
    type: "Dual-Winch Lunar Lift",
    purpose: "Lower suited astronauts and rovers 30 meters down from airlock to Shackleton Crater regolith.",
    scientificFunction: "Redundant cable-hoist elevator cage built into the mid-body cargo bay.",
    status: "Prelaunch",
    instruments: ["Electric Winch Assembly", "Regolith Dust Lock Curtain"],
    model3dType: "starship-hls"
  },
  "hls-solar-wrap": {
    id: "hls-solar-wrap",
    name: "360° Photovoltaic Solar Array Wrap",
    type: "Polar Illumination Power Array",
    purpose: "Harvest low-angle grazing sunlight continuously at the lunar south pole.",
    scientificFunction: "Conformal solar band circling the upper Starship fuselage for omnidirectional power.",
    status: "Prelaunch",
    instruments: ["Triple-Junction Solar Ring", "High-Capacity Li-Ion Bus"],
    model3dType: "starship-hls"
  },
  "hls-landing-legs": {
    id: "hls-landing-legs",
    name: "Wide-Stance Articulated Lunar Landing Gear",
    type: "Slope-Adaptive Touchdown Struts",
    purpose: "Stabilize the 100-ton lander on rocky polar slopes near Shackleton Crater.",
    scientificFunction: "Six self-leveling crushable honeycomb legs distributing ground pressure across regolith.",
    status: "Prelaunch",
    instruments: ["6 Articulated Outrigger Legs", "Terrain Contact Sensors"],
    model3dType: "starship-hls"
  },
  "hls-raptor-engines": {
    id: "hls-raptor-engines",
    name: "Raptor 2 Methalox & Mid-Body Landing Thrusters",
    type: "Deep-Throttling Cryogenic Propulsion",
    purpose: "Execute lunar orbit insertion and precision low-plume final touchdown.",
    scientificFunction: "Ring of mid-body landing thrusters minimizes regolith ejecta during final descent.",
    status: "Prelaunch",
    instruments: ["Raptor Vacuum Bells", "Mid-Body Terminal Thrusters"],
    model3dType: "starship-hls"
  },
  "lunar-habitat": {
    id: "lunar-habitat",
    name: "Artemis Base Camp Inflatable Habitat Dome",
    type: "Polar Surface Outpost",
    purpose: "Provide long-duration pressurized laboratory space alongside Starship HLS.",
    scientificFunction: "Multi-layer Vectran micrometeoroid & radiation-shielded expedition shelter.",
    status: "Prelaunch",
    instruments: ["Regolith Shielding Shell", "ISRU Water Recycling Loop"],
    model3dType: "starship-hls"
  },
  "hls-astronaut": {
    id: "hls-astronaut",
    name: "Axiom AxEMU Polar Surface Spacesuit",
    type: "Artemis Polar Extravehicular Suit",
    purpose: "Support 8+ hour Shackleton Crater geology EVAs across -200°C polar shadows.",
    scientificFunction: "Closed-loop cryogenic thermal control with dust-repellent seals and HD helmet lidar/comms.",
    status: "Prelaunch",
    instruments: ["AxEMU Portable Life Support", "Dust-Tolerant Rotary Bearings", "HD Helmet Comms"],
    model3dType: "starship-hls"
  },
  "hls-antenna": {
    id: "hls-antenna",
    name: "Artemis South Pole LunaNet Relay Tower",
    type: "High-Bandwidth Polar Surface Link",
    purpose: "Link Shackleton Crater EVAs with Lunar Gateway NRHO relays and Deep Space Network Earth receivers.",
    scientificFunction: "Optical & Ka-band polar relay mast engineered for grazing solar angles.",
    status: "Prelaunch",
    instruments: ["Ka-Band Phased Array", "LunaNet Optical Transceiver"],
    model3dType: "starship-hls"
  },
  "lunar-antenna": {
    id: "lunar-antenna",
    name: "High-Gain Lunar S-Band / Telemetry Dish",
    type: "Direct-to-Earth Communications Array",
    purpose: "Stream live EVA voice, video, and biomedical telemetry back to Houston.",
    scientificFunction: "Steerable S-band parabolic reflector locked onto Earth's Manned Space Flight Network.",
    status: "Mission Complete",
    instruments: ["66 cm Steerable Parabolic Dish", "S-Band Transponder"],
    model3dType: "apollo-lunar-module"
  },
  "apollo-astronaut": {
    id: "apollo-astronaut",
    name: "Apollo A7L / Axiom Lunar EVA Spacesuit",
    type: "Extravehicular Mobility Unit",
    purpose: "Sustain astronauts in hard vacuum across extreme +120 °C to -170 °C surface conditions.",
    scientificFunction: "Portable Life Support System supplying 3.7 psi 100% O2 and liquid thermal cooling.",
    status: "Mission Complete",
    instruments: ["PLSS Life-Support Backpack", "Gold Thermal Sun Visor"],
    model3dType: "apollo-lunar-module"
  },
  "apollo-ascent-stage": {
    id: "apollo-ascent-stage",
    name: "Lunar Module Ascent Stage & Cabin",
    type: "Crewed Lunar Liftoff Vehicle",
    purpose: "Launch astronauts from the lunar surface back to Command Module orbit rendezvous.",
    scientificFunction: "Hypergolic Ascent Propulsion System firing 15.6 kN for a zero-failure lunar liftoff.",
    status: "Mission Complete",
    instruments: ["APS Aerozine-50 Engine", "AGC Apollo Guidance Computer"],
    model3dType: "apollo-lunar-module"
  },
  "apollo-landing-gear": {
    id: "apollo-landing-gear",
    name: "Crushable Honeycomb Lunar Landing Struts",
    type: "Touchdown Attenuation Gear",
    purpose: "Absorb touchdown kinetic energy and trigger the cockpit 'CONTACT LIGHT' probe.",
    scientificFunction: "Four aluminum honeycomb struts topped with 5-foot surface feeler probes.",
    status: "Mission Complete",
    instruments: ["Surface Contact Probes", "Folded Egress Ladder"],
    model3dType: "apollo-lunar-module"
  },
  "lunar-laser-retro": {
    id: "lunar-laser-retro",
    name: "Apollo 11 Laser Ranging Retroreflector (LRRR)",
    type: "Passive Optical Geodesy Array",
    purpose: "Bounce Earth observatory laser pulses back for millimeter-accurate Earth-Moon ranging.",
    scientificFunction: "100 fused-silica corner cubes still actively returning laser photons after 55+ years.",
    status: "Operational",
    instruments: ["100 Corner-Cube Quartz Prisms", "Thermal Leveling Base"],
    model3dType: "apollo-lunar-module"
  },
  "lrv-antenna": {
    id: "lrv-antenna",
    name: "Lunar Roving Vehicle High-Gain S-Band Dish",
    type: "Direct-to-Earth Broadcast Antenna",
    purpose: "Transmit live color television and voice directly from Apollo traverses to Goldstone DSN.",
    scientificFunction: "Umbrella-mesh parabolic reflector manually aimed toward Earth at each geology stop.",
    status: "Mission Complete",
    instruments: ["Umbrella-Mesh Parabolic Dish", "Low-Gain Helical Antenna"],
    model3dType: "apollo15-lrv"
  },
  "lrv-camera": {
    id: "lrv-camera",
    name: "Ground-Controlled Television Assembly (GCTA)",
    type: "Remote-Commanded Color Camera",
    purpose: "Allow flight controllers in Houston to pan and zoom live lunar geology traverses.",
    scientificFunction: "Field-sequential color TV camera mounted on the rover's forward chassis.",
    status: "Mission Complete",
    instruments: ["Field-Sequential Color Wheel", "Remote Pan-Tilt Gimbal"],
    model3dType: "apollo15-lrv"
  },
  "lrv-astronaut": {
    id: "lrv-astronaut",
    name: "Apollo J-Mission Crew in A7LB Mobility Suit",
    type: "Seated-Traverse Lunar Spacesuit",
    purpose: "Enable multi-hour driving and deep geological sampling across lunar canyons.",
    scientificFunction: "Redesigned waist convolute joint allowing astronauts to sit comfortably in the LRV.",
    status: "Mission Complete",
    instruments: ["A7LB Pressure Garment", "Geology Hammer & Sample Bags"],
    model3dType: "apollo15-lrv"
  },
  "chaste-probe": {
    id: "chaste-probe",
    name: "ChaSTE Subsurface Thermal Penetrator",
    type: "Polar Regolith Thermal Probe",
    purpose: "Measure the vertical temperature gradient of south polar soil down to 10 cm depth.",
    scientificFunction: "Revealed steep thermal insulation: +60 °C at surface dropping to -10 °C just 8 cm deep.",
    status: "Mission Complete",
    instruments: ["10 Precision RTD Thermal Sensors", "Motorized Deployment Mast"],
    model3dType: "vikram-lander"
  },
  "rambha-plasma": {
    id: "rambha-plasma",
    name: "RAMBHA-LP Langmuir Ionospheric Probe",
    type: "Near-Surface Plasma Sensor",
    purpose: "Measure electron and ion density in the tenuous south-polar lunar plasma environment.",
    scientificFunction: "Spherical Langmuir probe deployed on a 1m boom detecting 5–30M electrons/m³.",
    status: "Mission Complete",
    instruments: ["Gold-Plated Spherical Collector", "1m Folding Boom"],
    model3dType: "vikram-lander"
  },
  "lpr-radar": {
    id: "lpr-radar",
    name: "Yutu-2 Lunar Penetrating Radar (LPR)",
    type: "Dual-Frequency Subsurface Radar",
    purpose: "Image buried basalt lava layers and impact ejecta 40+ meters beneath the lunar far side.",
    scientificFunction: "Operates at 60 MHz (deep structure) and 500 MHz (shallow regolith stratigraphy).",
    status: "Operational",
    instruments: ["60 MHz Twin Whip Antennas", "500 MHz High-Res Array"],
    model3dType: "change4-rover"
  },
  "surveyor3-tv": {
    id: "surveyor3-tv",
    name: "Surveyor 3 Steerable Vidicon TV Camera",
    type: "Vacuum-Tested Surface Imager",
    purpose: "Capture 6,315 Oceanus Procellarum images before retrieval by Apollo 12 astronauts.",
    scientificFunction: "Returned to Earth in 1969 so scientists could study 31 months of lunar vacuum aging.",
    status: "Mission Complete",
    instruments: ["Rotatable Azimuth Mirror", "Vidicon Electron Tube"],
    model3dType: "surveyor3-lander"
  },
  "ladee-nms": {
    id: "ladee-nms",
    name: "Neutral Mass Spectrometer (NMS)",
    type: "Exospheric Gas Analyzer",
    purpose: "Sample tenuous helium, neon, and radiogenic argon-40 in the lunar exosphere.",
    scientificFunction: "Quadrupole mass spectrometer operated in low-altitude equatorial lunar orbit.",
    status: "Mission Complete",
    instruments: ["Quadrupole Mass Filter", "Electron Ionization Source"],
    model3dType: "lunar-ladee"
  },
  "ladee-llcd": {
    id: "ladee-llcd",
    name: "Lunar Laser Communication Demonstration (LLCD)",
    type: "Optical Deep-Space Downlink Terminal",
    purpose: "Prove high-speed infrared laser data transmission from Moon to Earth.",
    scientificFunction: "Achieved record 622 Mbps duplex laser link over 384,000 km using 1550 nm optics.",
    status: "Mission Complete",
    instruments: ["4-Inch Optical Gimbal Telescope", "Laser Modem Electronics"],
    model3dType: "lunar-ladee"
  },
  "jwst-mirror": {
    id: "jwst-mirror",
    name: "JWST 18-Hexagon Gold Beryllium Mirror",
    type: "Cryogenic Infrared Primary Aperture",
    purpose: "Collect faint infrared photons from 13.5 billion light-years across cosmic history.",
    scientificFunction: "6.5m segmented beryllium mirror coated with 100nm of infrared-reflective pure gold.",
    status: "Operational",
    instruments: ["18 Actuator-Controlled Mirror Segments", "Tripod Secondary Reflector"],
    model3dType: "jwst-telescope"
  },
  "jwst-nircam": {
    id: "jwst-nircam",
    name: "NIRCam & MIRI Cryogenic Sensor Suite",
    type: "Near- & Mid-Infrared Cameras",
    purpose: "Resolve exoplanet spectra and Deep Field galaxies between 0.6 and 28 microns.",
    scientificFunction: "Helium closed-cycle cryocooler chills MIRI detectors to 6.7 Kelvin.",
    status: "Operational",
    instruments: ["NIRCam 0.6–5 µm Imager", "MIRI 6.7K Cryo-Spectrometer"],
    model3dType: "jwst-telescope"
  },
  "iss-lab": {
    id: "iss-lab",
    name: "Destiny US Microgravity Laboratory Module",
    type: "Pressurized Orbital Research Lab",
    purpose: "Host 24 payload racks for zero-G biology, combustion, fluid physics, and materials research.",
    scientificFunction: "Primary American research laboratory continuously staffed since 2001.",
    status: "Operational",
    instruments: ["24 International Standard Payload Racks", "Optical Nadir Window"],
    model3dType: "iss-station"
  },
  "iss-cupola": {
    id: "iss-cupola",
    name: "Cupola 7-Window Earth Observatory Dome",
    type: "Orbital Viewing & Robotics Station",
    purpose: "Provide 360° panoramic visibility for Canadarm2 grappling and Earth science photography.",
    scientificFunction: "Seven fused-silica windows housing the Robotic Workstation overlooking Earth's horizon.",
    status: "Operational",
    instruments: ["80 cm Circular Nadir Window", "Canadarm2 Robotic Console"],
    model3dType: "iss-station"
  },
  "saturn-s1c": {
    id: "saturn-s1c",
    name: "Saturn V S-IC Booster (5x Rocketdyne F-1)",
    type: "Super-Heavy First Stage",
    purpose: "Accelerate Apollo spacecraft through dense lower atmosphere to 67 km altitude.",
    scientificFunction: "Burns RP-1 kerosene and LOX at 15 metric tons per second for 34.5 MN thrust.",
    status: "Mission Complete",
    instruments: ["5 Rocketdyne F-1 Engines", "LOX & RP-1 Tanks"],
    model3dType: "rocket-saturn"
  },
  "apollo-csm": {
    id: "apollo-csm",
    name: "Apollo Command & Service Module (CSM)",
    type: "Trans-Lunar Habitat & Return Craft",
    purpose: "Carry three astronauts to lunar orbit and survive 11 km/s Earth atmospheric re-entry.",
    scientificFunction: "SPS Service Propulsion Engine plus ablative Avcoat heat shield on the Command Module.",
    status: "Mission Complete",
    instruments: ["AJ10-137 SPS Engine", "3 Hydrogen Fuel Cells", "Ablative Heat Shield"],
    model3dType: "rocket-saturn"
  }
};

export function resolveHardwareForMission(mission, hardwareId) {
  if (!mission) return null;
  const fallback = mission.hardware?.[0] || null;
  if (!hardwareId) return fallback;

  const key = hardwareId.toLowerCase();
  const aliasMap = {
    "jwst-primary-mirror": "jwst-mirror",
    "jwst-miri": "jwst-nircam",
    "insight-seis": "seis",
    "insight-hp3": "hp3",
    "mastcam-z": "supercam",
    "lrrk-reflector": "lunar-laser-retro",
    "lrrr-reflector": "lunar-laser-retro",
  };
  const canonicalKey = aliasMap[key] || key;

  const direct = (mission.hardware || []).find((h) => h.id.toLowerCase() === key);
  if (direct) return direct;

  if (SUBSYSTEM_REGISTRY[key]) {
    return {
      ...SUBSYSTEM_REGISTRY[key],
      model3dType: fallback?.model3dType || SUBSYSTEM_REGISTRY[key].model3dType,
    };
  }

  if (canonicalKey !== key) {
    const foundAlias = (mission.hardware || []).find(
      (h) => h.id.toLowerCase() === canonicalKey
    );
    if (foundAlias) return foundAlias;
    if (SUBSYSTEM_REGISTRY[canonicalKey]) {
      return {
        ...SUBSYSTEM_REGISTRY[canonicalKey],
        model3dType: fallback?.model3dType || SUBSYSTEM_REGISTRY[canonicalKey].model3dType,
      };
    }
  }

  return fallback;
}
