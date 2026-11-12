/**
 * MISSION AFTERLIFE — Mars Missions Data
 * Viking 1, Spirit, Opportunity
 *
 * All factual data sourced from:
 * - NASA NSSDCA: https://nssdc.gsfc.nasa.gov/
 * - NASA JPL Mission Pages: https://mars.nasa.gov/
 * - NASA MER Mission Archives
 * - Viking Mission Science Results (NASA SP-425)
 */

import type { MAMissionData } from '../../types/missionAfterlife';

export const MARS_AFTERLIFE_MISSIONS: MAMissionData[] = [
  // ═══════════════════════════════════════════════════════════════
  // VIKING 1 — Mars Lander
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'viking1',
    name: 'Viking 1',
    destination: 'Mars',
    agency: 'NASA',
    launchDate: '1975-08-20',
    landingDate: '1976-07-20',
    missionEndDate: '1982-11-13',

    locationName: 'Chryse Planitia',
    coordinates: {
      lat: 22.4797,
      lon: 312.0538,
      source: 'NASA NSSDCA: https://nssdc.gsfc.nasa.gov/planetary/mars/vikingland.html'
    },

    spacecraftName: 'Viking 1 Lander',
    hardwareModelPath: '/models/viking_lander.glb',

    missionPurpose:
      'First successful Mars landing. Search for signs of biological activity, characterize surface and atmospheric chemistry, and photograph the Martian surface in high resolution.',
    hardwareStatus: 'Still on surface',
    hardwareStatusDetail:
      'The Viking 1 lander remains at Chryse Planitia where it ceased operations on November 13, 1982, after a faulty software update severed communication. It has been photographed from orbit by Mars Global Surveyor and Mars Reconnaissance Orbiter.',

    finalMessage:
      'Viking 1 operated for 2,245 Martian sols — over six Earth years. Its last transmission was received on November 13, 1982. It sits in Chryse Planitia still, waiting in the red dust.',

    chapters: {
      identity: {
        id: 'identity',
        heading: 'WHO AM I?',
        title: 'The Pioneer',
        paragraphs: [
          'I am Viking 1 — the first spacecraft to successfully land on Mars and operate on its surface. I am one of the most sophisticated robotic explorers ever built in the twentieth century.',
          'I launched from Cape Canaveral on August 20, 1975, aboard a Titan IIIE-Centaur rocket. After a 304-day journey covering 718 million kilometres, I entered Mars orbit in June 1976.',
          'On July 20, 1976 — the seventh anniversary of Apollo 11\'s landing on the Moon — my aeroshell plunged into the Martian atmosphere at 4.5 km/s. A parachute slowed my descent; then retrorockets fired to bring me gently to the surface of Chryse Planitia.',
          'I weighed 572 kg on the Martian surface. I was powered by two Radioisotope Thermoelectric Generators (RTGs) using plutonium-238 — the same power source used by Voyager 1 and New Horizons.',
          'The first photograph I sent back — just 25 seconds after landing — was of my own footpad, confirming I had landed safely. It was the first photograph ever taken from the Martian surface.'
        ],
        timeline: [
          { date: '1975-08-20', event: 'Launch from Cape Canaveral on Titan IIIE-Centaur', significance: 'critical' },
          { date: '1976-06-19', event: 'Mars orbit insertion', significance: 'major' },
          { date: '1976-07-20', event: 'Touchdown at Chryse Planitia — first successful Mars landing', significance: 'critical' },
          { date: '1976-07-20', event: 'First photograph from the Martian surface transmitted to Earth', significance: 'critical' },
          { date: '1976-07 to 09', event: 'Three biology experiments conducted — results remain scientifically debated', significance: 'major' },
          { date: '1982-11-13', event: 'Last contact — faulty antenna software update severs communication', significance: 'critical' },
        ],
        cameraHint: 'wide',
      },

      purpose: {
        id: 'purpose',
        heading: 'WHY WAS I SENT HERE?',
        title: 'The Search for Life',
        paragraphs: [
          'Viking 1 carried one of the most ambitious scientific payloads ever sent to another planet — including the first experiments specifically designed to detect life on Mars.',
          'The biology package contained three experiments: the Pyrolytic Release (PR) experiment searched for organic synthesis in Martian soil; the Labeled Release (LR) experiment tested whether microbes would consume a nutrient solution; and the Gas Exchange (GEX) experiment looked for metabolic gas production.',
          'When nutrients were added to the Martian soil in the LR experiment, it produced a burst of radioactively labeled CO2 — a result that looked, initially, like a positive sign of life. The scientific community was electrified.',
          'However, the Gas Chromatograph-Mass Spectrometer (GCMS) found no organic molecules in the Martian soil. The consensus interpretation became that the LR results were caused by highly reactive chemical oxidants — possibly hydrogen peroxide or perchlorate — in the Martian soil rather than biological processes.',
          'The debate over the Viking biology results was never entirely settled. Dr. Gilbert Levin, one of the LR experiment designers, maintained until his death in 2021 that the results were consistent with biological activity. This remains one of the most fascinating unresolved questions in planetary science.'
        ],
        cameraHint: 'closeup',
      },

      finalChapter: {
        id: 'finalChapter',
        heading: 'WHAT HAPPENED TO ME?',
        title: 'Silence in Chryse Planitia',
        paragraphs: [
          'Viking 1 operated far beyond its designed 90-day mission. For 2,245 Martian sols — over six Earth years — it monitored Martian weather, photographed seasonal changes, measured atmospheric chemistry, and studied the soil.',
          'On November 13, 1982, a software upload intended to extend the life of the lander\'s antenna-pointing mechanism instead corrupted the system, causing the antenna to tilt away from Earth. The final signal was received at 10:00 PM UTC.',
          'Engineers at NASA\'s Jet Propulsion Laboratory attempted to re-establish contact for months. All efforts failed. On May 21, 1983, NASA officially ended the Viking 1 mission.',
          'The lander has been renamed the Thomas A. Mutch Memorial Station, in honor of the team leader who coordinated the Viking imaging science team and later died in a mountaineering accident.',
          'Mars Global Surveyor and Mars Reconnaissance Orbiter have photographed the Viking 1 lander from orbit, confirming it remains in Chryse Planitia. Its RTG power sources would have decayed long ago; its instruments are silent. But the structure — metal, glass, circuit boards — still sits in the rust-coloured dust of the Martian plain.'
        ],
        timeline: [
          { date: '1982-11-13', event: 'Last contact received — faulty antenna software command severs link', significance: 'critical' },
          { date: '1982-11 to 1983-05', event: 'JPL engineers attempt to re-establish contact — all fail', significance: 'major' },
          { date: '1983-05-21', event: 'NASA officially ends Viking 1 mission', significance: 'critical' },
          { date: '1982', event: 'Renamed Thomas A. Mutch Memorial Station', significance: 'minor' },
          { date: '2006', event: 'Mars Reconnaissance Orbiter identifies lander location from orbit', significance: 'major' },
        ],
        cameraHint: 'orbit',
      },

      legacy: {
        id: 'legacy',
        heading: 'WHAT DID HUMANITY GAIN?',
        title: 'The Legacy',
        paragraphs: [
          'Viking 1 — along with its twin Viking 2, which landed in Utopia Planitia — transformed our understanding of Mars from a distant red point of light into a world: cold, dusty, ancient, and deeply complex.',
          'The mission\'s meteorological instruments recorded Martian weather over six years, documenting dust storm seasons, pressure cycles, and temperature variations. This dataset remains foundational for Martian atmospheric science.',
          'Viking\'s soil chemistry experiments detected perchlorates — chemical compounds later confirmed by Mars Phoenix, Curiosity, and Perseverance. Perchlorates are both toxic to life and potentially useful as an oxygen source for future human missions.',
          'The Viking mission demonstrated that robotic spacecraft could successfully enter the Martian atmosphere, survive landing, and operate productively for years. Every subsequent Mars lander mission — Pathfinder, Phoenix, InSight, Curiosity, Perseverance — built on Viking\'s engineering lessons.',
          'Viking 1 sent back over 4,500 photographs — the first comprehensive photographic survey of the Martian landscape. Those images showed ancient river valleys, towering volcanoes, and vast canyon systems that told the story of a planet that was once very different from what we find today.'
        ],
        cameraHint: 'wide',
      }
    },

    images: [
      {
        nasaId: 'PIA00393',
        title: 'First Photograph from the Martian Surface',
        description: 'The first image ever taken from the surface of Mars, showing the Viking 1 footpad and surrounding terrain in Chryse Planitia',
        url: 'https://photojournal.jpl.nasa.gov/jpeg/PIA00393.jpg',
        credit: 'NASA / JPL — Viking 1 Mission (1976)'
      },
      {
        nasaId: 'PIA00569',
        title: 'Viking 1 Landing Site — Chryse Planitia Panorama',
        description: 'Panoramic view of Chryse Planitia taken by Viking 1',
        url: 'https://photojournal.jpl.nasa.gov/jpeg/PIA00569.jpg',
        credit: 'NASA / JPL — Viking 1 Mission (1976)'
      }
    ],

    verifiedSources: [
      { name: 'NASA NSSDCA: Viking 1 Lander', url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1975-075C' },
      { name: 'NASA JPL: Viking Mission to Mars', url: 'https://www.jpl.nasa.gov/missions/viking-1' },
      { name: 'NASA Viking Mission Science Results (SP-425)', url: 'https://history.nasa.gov/SP-425/sp425.htm' }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // SPIRIT — MER-A
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'spirit',
    name: 'Spirit',
    destination: 'Mars',
    agency: 'NASA',
    launchDate: '2003-06-10',
    landingDate: '2004-01-04',
    missionEndDate: '2010-03-22',

    locationName: 'Gusev Crater',
    coordinates: {
      lat: -14.5684,
      lon: 175.4729,
      source: 'NASA JPL MER Mission: https://mars.nasa.gov/mer/mission/status/'
    },

    spacecraftName: 'Spirit — MER-A Rover',
    hardwareModelPath: undefined,
    modelDisclaimer:
      'No high-quality Spirit/MER-class GLB model is included in this application. Spirit was a Mars Exploration Rover (MER) — similar in design to Opportunity but distinct from MSL-class rovers like Curiosity. This scene uses an illustrative geometric representation.',

    missionPurpose:
      'Explore Gusev Crater as a potential ancient lake bed, characterize surface geology, and search for evidence that Mars once had liquid water on its surface.',
    hardwareStatus: 'Lost communication',
    hardwareStatusDetail:
      'Spirit\'s last communication was received on March 22, 2010. The rover became trapped in soft soil in 2009 and lost its ability to position solar panels for winter. NASA ended active communication attempts on May 25, 2011.',

    finalMessage:
      'Spirit traveled 7.73 kilometres across Gusev Crater before its wheels sank into soft soil near Home Plate. It sent its last signal on March 22, 2010, and was never heard from again.',

    chapters: {
      identity: {
        id: 'identity',
        heading: 'WHO AM I?',
        title: 'Spirit — Rover A',
        paragraphs: [
          'I am Spirit — Mars Exploration Rover A (MER-A). I am one of two twin rovers sent to Mars in 2003, together with my identical sister Opportunity, to search for evidence of past water on Mars.',
          'I launched on June 10, 2003, from Cape Canaveral. After a seven-month journey of 487 million kilometres, I entered the Martian atmosphere on January 4, 2004, surrounded by airbags that cushioned my landing.',
          'I landed in Gusev Crater — a 166-kilometre-wide impact crater that scientists believed may once have been a lake, fed by water from the ancient Ma\'adim Vallis river channel.',
          'I weighed 185 kg and was powered by solar panels generating up to 140 watts — enough to drive, operate instruments, and transmit data back to Earth through the Deep Space Network.',
          'My original mission was 90 Martian sols. I ultimately operated for 2,208 sols — nearly 25 times longer than planned.'
        ],
        timeline: [
          { date: '2003-06-10', event: 'Launch from Cape Canaveral on Delta II rocket', significance: 'critical' },
          { date: '2004-01-04', event: 'Landing in Gusev Crater — MER airbag system', significance: 'critical' },
          { date: '2004-03-05', event: 'Right front wheel fails — Spirit continues on five wheels', significance: 'major' },
          { date: '2006-05 to 2007-11', event: 'Extended exploration of Columbia Hills — volcanic basalt discoveries', significance: 'major' },
          { date: '2009-05', event: 'Spirit becomes trapped in soft soil at Troy — unable to free itself', significance: 'critical' },
          { date: '2010-03-22', event: 'Last contact received from Spirit', significance: 'critical' },
          { date: '2011-05-25', event: 'NASA ends active listening attempts — mission declared complete', significance: 'critical' },
        ],
        cameraHint: 'wide',
      },

      purpose: {
        id: 'purpose',
        heading: 'WHY WAS I SENT HERE?',
        title: 'Follow the Water',
        paragraphs: [
          'The Mars Exploration Rover mission was built around a single guiding principle: "Follow the water." Scientists believed that if Mars ever had liquid water, it was the most likely place where life could have developed.',
          'Gusev Crater was selected because orbital imagery suggested it was once a lake. If water had pooled there, it might have deposited sedimentary minerals — geochemical signatures that could survive for billions of years.',
          'Spirit carried six primary instruments: the Panoramic Camera (Pancam), the Miniature Thermal Emission Spectrometer (Mini-TES), the Mössbauer Spectrometer, the Alpha Particle X-ray Spectrometer (APXS), the Microscopic Imager, and the Rock Abrasion Tool (RAT) for grinding rock surfaces.',
          'Surprisingly, early analysis of Gusev\'s floor revealed volcanic basalt — not the lake sediments scientists had hoped for. The water signal was absent at the landing site. Spirit pivoted to exploring the nearby Columbia Hills.',
          'In the Columbia Hills, Spirit found something extraordinary: rocks with mineral signatures consistent with ancient hydrothermal water activity — silica deposits and minerals that required liquid water to form. Gusev Crater had seen water, just not at the floor where Spirit landed.'
        ],
        cameraHint: 'closeup',
      },

      finalChapter: {
        id: 'finalChapter',
        heading: 'WHAT HAPPENED TO ME?',
        title: 'Trapped at Troy',
        paragraphs: [
          'In May 2009, Spirit\'s wheels broke through a thin crust of soil near a location called "Troy" and sank into the soft, fine-grained material beneath — a siliceous soil deposit of the kind that Spirit\'s own instruments had identified as scientifically significant.',
          'For eight months, the JPL engineering team attempted to extract Spirit using simulated terrariums of Martian soil on Earth, trying every combination of wheel movements. None worked. By January 2010, NASA accepted that Spirit would not move again.',
          'Spirit was reconfigured as a stationary science platform — the first time a Mars rover had deliberately accepted immobility as a scientific strategy. Its instruments continued to monitor atmospheric conditions, soil chemistry, and seasonal changes.',
          'In the Martian winter of 2010, Spirit\'s solar panels could not capture enough sunlight to power the internal heaters. Communications became intermittent. On March 22, 2010, Spirit sent its last transmission.',
          'NASA attempted to contact Spirit more than 1,300 times over the following year. No signal was ever received again. On May 25, 2011, NASA ended the mission and said goodbye to Spirit — a rover that had lived twenty-five times longer than promised, and found evidence of water on a world that many had given up on.'
        ],
        timeline: [
          { date: '2009-05', event: 'Spirit becomes trapped in soft siliceous soil at Troy', significance: 'critical' },
          { date: '2010-01', event: 'NASA accepts Spirit cannot be freed; reconfigured as stationary platform', significance: 'major' },
          { date: '2010-03-22', event: 'Last signal received from Spirit', significance: 'critical' },
          { date: '2011-05-25', event: 'NASA officially ends Spirit mission after 1,300+ failed contact attempts', significance: 'critical' },
        ],
        cameraHint: 'orbit',
      },

      legacy: {
        id: 'legacy',
        heading: 'WHAT DID HUMANITY GAIN?',
        title: 'The Legacy',
        paragraphs: [
          'Spirit traveled 7.73 kilometres across the surface of Mars, returning over 124,000 raw images and conducting thousands of soil and rock measurements that fundamentally changed our understanding of Martian geology.',
          'The discovery of siliceous soils near Home Plate — deposited by hydrothermal water activity — provided strong evidence that Gusev Crater had once been touched by liquid water. Similar environments on Earth are known to support microbial life.',
          'Spirit\'s wheels, damaged in 2006, unexpectedly became a scientific instrument: they dragged across the soil, exposing subsurface material that would otherwise have remained buried. The bright, almost white silica soil exposed this way was one of the mission\'s greatest discoveries.',
          'The engineering lessons from Spirit — including its survival strategies in dust storms, its battery management techniques, and its navigation algorithms — directly influenced the design of the Mars Science Laboratory and the Perseverance rover.',
          'Spirit\'s story has inspired a generation that watched a small robotic explorer refuse to give up, long after its warranty had expired, in a place that had never been visited before.'
        ],
        cameraHint: 'wide',
      }
    },

    images: [
      {
        nasaId: 'PIA05117',
        title: 'Spirit\'s First Full-Color Panorama from Gusev Crater',
        description: 'Full-resolution colour panorama taken by Spirit after landing in Gusev Crater',
        url: 'https://photojournal.jpl.nasa.gov/jpeg/PIA05117.jpg',
        credit: 'NASA / JPL / Cornell — Spirit MER-A (2004)'
      },
      {
        nasaId: 'PIA10214',
        title: 'Spirit\'s View from Home Plate',
        description: 'Spirit\'s panoramic view from the Home Plate region of the Columbia Hills',
        url: 'https://photojournal.jpl.nasa.gov/jpeg/PIA10214.jpg',
        credit: 'NASA / JPL — Spirit MER-A (2007)'
      }
    ],

    verifiedSources: [
      { name: 'NASA NSSDCA: Spirit', url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2003-027A' },
      { name: 'NASA Mars Exploration Rover Mission', url: 'https://mars.nasa.gov/mer/' },
      { name: 'JPL: Spirit Mission Status Archives', url: 'https://mars.nasa.gov/mer/mission/status/' }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // OPPORTUNITY — MER-B
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'opportunity',
    name: 'Opportunity',
    destination: 'Mars',
    agency: 'NASA',
    launchDate: '2003-07-07',
    landingDate: '2004-01-25',
    missionEndDate: '2018-06-10',

    locationName: 'Meridiani Planum — Perseverance Valley, Endeavour Crater',
    coordinates: {
      lat: -1.9462,
      lon: 354.4734,
      source: 'NASA JPL MER Mission final position: https://mars.nasa.gov/mer/mission/status/'
    },

    spacecraftName: 'Opportunity — MER-B Rover',
    hardwareModelPath: undefined,
    modelDisclaimer:
      'No high-quality Opportunity/MER-class GLB model is included in this application. Opportunity was a Mars Exploration Rover (MER) — an identical design to Spirit. This scene uses an illustrative geometric representation.',

    missionPurpose:
      'Explore Meridiani Planum to characterize the mineralogy and geology of the surface. Meridiani was selected due to orbital detection of grey hematite — a mineral that on Earth forms in liquid water.',
    hardwareStatus: 'Lost communication',
    hardwareStatusDetail:
      'A global Martian dust storm in June 2018 blocked sunlight from reaching Opportunity\'s solar panels. Its last communication was received on June 10, 2018. After over 1,000 recovery attempts, NASA declared the mission complete on February 13, 2019.',

    finalMessage:
      'Opportunity\'s last message, translated from its final telemetry, was interpreted as: "My battery is low and it\'s getting dark." It has never been heard from again.',

    chapters: {
      identity: {
        id: 'identity',
        heading: 'WHO AM I?',
        title: 'Opportunity — Rover B',
        paragraphs: [
          'I am Opportunity — Mars Exploration Rover B (MER-B). My twin Spirit and I were launched weeks apart in the summer of 2003, identical in design, bound for different hemispheres of Mars.',
          'I launched on July 7, 2003, and landed on January 25, 2004, bouncing to a stop inside a small crater — now called Eagle Crater — at Meridiani Planum.',
          'Meridiani Planum had been selected because Mars Global Surveyor\'s thermal emission spectrometer detected grey hematite from orbit — a mineral that forms in liquid water on Earth. It was a compelling sign that this region had once been wet.',
          'From the moment my airbags deflated and I sent my first images, the mission exceeded every expectation. The walls of Eagle Crater exposed layered bedrock — sedimentary rock, which absolutely required liquid water to form. We had arrived in the right place.',
          'I was designed for 90 days. I operated for 5,352 Martian sols — almost 15 Earth years — before the sky went dark.'
        ],
        timeline: [
          { date: '2003-07-07', event: 'Launch from Cape Canaveral on Delta II rocket', significance: 'critical' },
          { date: '2004-01-25', event: 'Landing inside Eagle Crater, Meridiani Planum', significance: 'critical' },
          { date: '2004-03', event: 'Discovery of hematite "blueberries" — concretions requiring standing water to form', significance: 'major' },
          { date: '2008-09', event: 'Arrival at Victoria Crater — 2-year traverse to rim', significance: 'major' },
          { date: '2011-08', event: 'Arrival at Endeavour Crater after 33 km drive', significance: 'major' },
          { date: '2018-06-10', event: 'Last contact — global dust storm blocks all sunlight', significance: 'critical' },
          { date: '2019-02-13', event: 'NASA officially declares Opportunity mission complete', significance: 'critical' },
        ],
        cameraHint: 'wide',
      },

      purpose: {
        id: 'purpose',
        heading: 'WHY WAS I SENT HERE?',
        title: 'Water on Mars',
        paragraphs: [
          'Opportunity\'s mission was built on a question that had haunted planetary scientists for decades: did Mars once have liquid water, and if so, could life have arisen there?',
          'Within weeks of landing, Opportunity answered the first part of that question definitively. The layered sedimentary rock exposed in Eagle Crater had been deposited in salty, shallow water — an acidic brine environment somewhat resembling parts of Earth\'s ocean floors.',
          'Hematite "blueberries" — spherical iron-rich concretions found everywhere in the Meridiani soil — could only have formed by precipitation from iron-rich water moving through porous rock. Mars had been wet.',
          'As Opportunity drove further, it uncovered the history of that water: it had been salty and acidic, fluctuating in depth, leaving minerals and chemical signatures in the rock layers. The environment would have been challenging but not impossible for certain hardy microorganisms.',
          'By the time Opportunity reached the ancient Endeavour Crater — 33 kilometres from its landing site — it was examining some of the oldest rocks accessible on the Martian surface: material from the pre-Noachian era, over 4 billion years old, potentially preserving evidence of an early Mars that was warmer, wetter, and potentially habitable.'
        ],
        cameraHint: 'closeup',
      },

      finalChapter: {
        id: 'finalChapter',
        heading: 'WHAT HAPPENED TO ME?',
        title: 'The Dust Storm',
        paragraphs: [
          'In June 2018, a planetary-scale dust storm — one of the most severe in recorded Martian history — engulfed virtually the entire planet. Its optical depth exceeded 10 — meaning less than one percent of sunlight penetrated to the surface.',
          'Opportunity, powered entirely by solar energy, fell silent. On June 10, 2018, it sent its last telemetry. The final data showed battery charge at critically low levels and atmospheric opacity climbing off the charts.',
          'The last signal was interpreted by one NASA team member as: "My battery is low and it\'s getting dark." — a translation of Opportunity\'s final engineering parameters into words that captured something true about what was happening on that distant plain.',
          'Engineers at JPL attempted to contact Opportunity over 1,000 times in the months that followed. They hoped that Martian winds might clear dust from the solar panels, as they had during previous recovery events. But this time, the skies did not clear enough, or the dust had settled on the panels permanently.',
          'On February 13, 2019, NASA\'s Jet Propulsion Laboratory sent a final transmission to Opportunity — playing the song "I\'ll Be Seeing You" — and officially ended the mission. Opportunity rests in Perseverance Valley on the inner slope of Endeavour Crater, 45 kilometres from where it first touched down.'
        ],
        timeline: [
          { date: '2018-06', event: 'Global Martian dust storm reaches unprecedented optical depth', significance: 'major' },
          { date: '2018-06-10', event: 'Last communication received from Opportunity', significance: 'critical' },
          { date: '2018-06 to 2019-02', event: 'Over 1,000 recovery attempts made by JPL — all unsuccessful', significance: 'major' },
          { date: '2019-02-13', event: 'NASA officially declares Opportunity mission complete', significance: 'critical' },
        ],
        cameraHint: 'orbit',
      },

      legacy: {
        id: 'legacy',
        heading: 'WHAT DID HUMANITY GAIN?',
        title: 'The Legacy',
        paragraphs: [
          'Opportunity drove 45.16 kilometres across the Martian surface — a planetary surface distance record for any robotic vehicle outside Earth, surpassing the Soviet Lunokhod 2 rover\'s lunar record.',
          'Opportunity returned over 217,000 raw images and conducted more than 100,000 Miniature Thermal Emission Spectrometer observations. Its data established definitively that Meridiani Planum was once soaked in liquid water.',
          'The discovery of hematite concretions — the "Martian blueberries" — transformed our understanding of aqueous mineralogy on Mars. These structures, identical in formation process to their Earth counterparts, proved that mineral-precipitating liquid water had flowed through Meridiani\'s subsurface.',
          'At Endeavour Crater, Opportunity found phyllosilicates — clay minerals that form in neutral-pH water, far less acidic than the acidic brine of Meridiani. This showed that Mars had multiple water environments with different chemical compositions — broadening the range of conditions under which Martian life might have been possible.',
          'Opportunity\'s operational endurance — fifteen years of active science from a rover designed for three months — inspired a philosophy at NASA and JPL: build to survive, then keep pushing. That philosophy shaped every subsequent planetary rover mission.'
        ],
        cameraHint: 'wide',
      }
    },

    images: [
      {
        nasaId: 'PIA05296',
        title: 'Opportunity\'s Hematite Blueberries',
        description: 'Microscopic Imager view of hematite concretions — "blueberries" — in the Martian soil at Meridiani Planum',
        url: 'https://photojournal.jpl.nasa.gov/jpeg/PIA05296.jpg',
        credit: 'NASA / JPL / Cornell — Opportunity MER-B (2004)'
      },
      {
        nasaId: 'PIA19818',
        title: 'Opportunity Self-Portrait at Marathon Valley',
        description: 'Opportunity\'s self-portrait mosaic taken at Marathon Valley on the rim of Endeavour Crater',
        url: 'https://photojournal.jpl.nasa.gov/jpeg/PIA19818.jpg',
        credit: 'NASA / JPL-Caltech / Cornell / Arizona State University — Opportunity MER-B (2015)'
      }
    ],

    verifiedSources: [
      { name: 'NASA NSSDCA: Opportunity', url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2003-032A' },
      { name: 'NASA Mars Exploration Rover Mission', url: 'https://mars.nasa.gov/mer/' },
      { name: 'NASA JPL: Opportunity End of Mission', url: 'https://www.jpl.nasa.gov/news/nasas-opportunity-rover-mission-on-mars-comes-to-end' }
    ]
  }
];

