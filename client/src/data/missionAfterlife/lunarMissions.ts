/**
 * MISSION AFTERLIFE — Lunar Missions Data
 * Apollo 11, Apollo 15, Apollo 17
 *
 * All factual data sourced from:
 * - NASA NSSDCA: https://nssdc.gsfc.nasa.gov/
 * - NASA Apollo Mission Archives: https://www.nasa.gov/specials/apollo50th/
 * - NASA Johnson Space Center Historical Records
 * - Smithsonian National Air and Space Museum mission documentation
 */

import type { MAMissionData } from '../../types/missionAfterlife';

export const LUNAR_AFTERLIFE_MISSIONS: MAMissionData[] = [
  // ═══════════════════════════════════════════════════════════════
  // APOLLO 11 — Eagle Descent Stage
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'apollo11',
    name: 'Apollo 11',
    destination: 'Moon',
    agency: 'NASA',
    launchDate: '1969-07-16',
    landingDate: '1969-07-20',
    missionEndDate: '1969-07-21',

    locationName: 'Tranquility Base',
    coordinates: {
      lat: 0.6741,
      lon: 23.4730,
      source: 'NASA NSSDCA: https://nssdc.gsfc.nasa.gov/planetary/lunar/apolloland.html'
    },

    spacecraftName: 'Eagle — Descent Stage',
    hardwareModelPath: '/models/apollo_lunar_module.glb',
    modelDisclaimer: undefined,

    missionPurpose:
      'First crewed lunar landing. Demonstrate the capability to land humans on the Moon and return them safely to Earth.',
    hardwareStatus: 'Still on surface',
    hardwareStatusDetail:
      'The Eagle descent stage remains at Tranquility Base where it was left on July 21, 1969. It has been confirmed still present by NASA Lunar Reconnaissance Orbiter (LRO) photography in 2009 and 2011.',

    finalMessage:
      'The Eagle touched down. Humanity took its first steps beyond Earth. Tranquility Base stands silent — a permanent monument to what we can achieve.',

    chapters: {
      identity: {
        id: 'identity',
        heading: 'WHO AM I?',
        title: 'The Eagle',
        paragraphs: [
          'I am the Eagle — the descent stage of a Lunar Module built by Grumman Aircraft Engineering Corporation for NASA\'s Apollo 11 mission.',
          'I launched from Kennedy Space Center on July 16, 1969, atop the Saturn V rocket AS-506, carrying astronauts Neil Armstrong, Buzz Aldrin, and Michael Collins toward the Moon.',
          'On July 20, 1969, at 20:17 UTC, I touched down at a site in Mare Tranquillitatis — the Sea of Tranquility — later named Tranquility Base by my crew.',
          'I weighed approximately 10,334 kg fully fueled at landing. My descent engine, built by TRW Inc., fired for 756 seconds to lower us gently to the lunar surface.',
          'The crew boarded me four hours after landing to begin preparations. At 02:56 UTC on July 21, Neil Armstrong became the first human to set foot on another world.'
        ],
        timeline: [
          { date: '1969-07-16', event: 'Launch from Kennedy Space Center — Saturn V AS-506', significance: 'critical' },
          { date: '1969-07-20', event: 'Lunar orbit insertion', significance: 'major' },
          { date: '1969-07-20 20:17 UTC', event: 'Touchdown at Tranquility Base', significance: 'critical' },
          { date: '1969-07-21 02:56 UTC', event: 'Neil Armstrong steps onto the lunar surface', significance: 'critical' },
          { date: '1969-07-21', event: 'Ascent stage lifts off — descent stage left behind permanently', significance: 'critical' },
        ],
        cameraHint: 'wide',
      },

      purpose: {
        id: 'purpose',
        heading: 'WHY WAS I SENT HERE?',
        title: 'The Mission',
        paragraphs: [
          'Apollo 11 was the fulfillment of President John F. Kennedy\'s 1961 challenge: "I believe that this nation should commit itself to achieving the goal, before this decade is out, of landing a man on the Moon and returning him safely to the Earth."',
          'The scientific objectives included collecting lunar soil and rock samples, deploying surface experiments, and photographing the lunar surface and environment.',
          'Armstrong and Aldrin deployed the Early Apollo Scientific Experiments Package (EASEP), which included a Passive Seismic Experiment to detect moonquakes, and a Laser Ranging Retroreflector — still used today.',
          'The crew collected 21.55 kilograms of lunar material — primarily basaltic rock from Mare Tranquillitatis, 3.5 billion years old — which transformed our understanding of the Moon\'s geologic history.',
          'Apollo 11 also carried the Lunar Flag Assembly, plaques reading "Here men from the planet Earth first set foot upon the Moon, July 1969 A.D. We came in peace for all mankind," and a silicon disk containing messages from 73 world leaders.'
        ],
        cameraHint: 'closeup',
      },

      finalChapter: {
        id: 'finalChapter',
        heading: 'WHAT HAPPENED TO ME?',
        title: 'The Final Chapter',
        paragraphs: [
          'On July 21, 1969, at 17:54 UTC, the Eagle\'s ascent stage fired its engine and lifted Armstrong and Aldrin from the lunar surface to rendezvous with Michael Collins in the Command Module Columbia.',
          'The descent stage — my lower half, with its landing legs, fuel tanks, descent engine, and equipment storage — was left behind permanently. It has rested at Tranquility Base ever since.',
          'In 2009, NASA\'s Lunar Reconnaissance Orbiter photographed Tranquility Base from orbit. The images confirmed that the descent stage, the flag, the scientific instruments, and the astronauts\' discarded equipment remain exactly where they were left.',
          'On the Moon, there is no wind, no rain, no erosion. The only threat is micrometeorite impacts and cosmic radiation degrading materials over geological time. The hardware is expected to survive for millions of years, though the American flag likely bleached white within years due to unfiltered solar ultraviolet radiation.',
          'Tranquility Base is now considered a historic site. NASA\'s Recommendations to Space-Faring Entities: How to Protect and Preserve the Historic and Scientific Value of U.S. Government Lunar Artifacts designates it a heritage site.'
        ],
        timeline: [
          { date: '1969-07-21 17:54 UTC', event: 'Ascent stage engine fires — crew departs lunar surface', significance: 'critical' },
          { date: '1969-07-21', event: 'Descent stage left at Tranquility Base — permanent lunar monument', significance: 'critical' },
          { date: '2009', event: 'LRO photographs Tranquility Base — hardware confirmed present', significance: 'major' },
          { date: '2011', event: 'LRO captures higher-resolution images showing descent stage and equipment', significance: 'major' },
        ],
        cameraHint: 'orbit',
      },

      legacy: {
        id: 'legacy',
        heading: 'WHAT DID HUMANITY GAIN?',
        title: 'The Legacy',
        paragraphs: [
          'Apollo 11 changed what it means to be human. For the first time, we looked up at the Moon and knew that people had walked there.',
          'The 21.55 kg of lunar samples collected have been studied by researchers for over 50 years. They confirmed the Giant Impact Hypothesis — that the Moon formed from debris ejected when a Mars-sized body struck the early Earth approximately 4.5 billion years ago.',
          'The Passive Seismic Experiment detected moonquakes for years. The Laser Ranging Retroreflector remains active today, used by observatories worldwide to measure the Moon\'s recession from Earth — currently 3.8 cm per year.',
          'Apollo 11 triggered a generation of scientists, engineers, and explorers. The technologies developed for the mission contributed to advances in computing, materials science, telecommunications, and medicine.',
          'As Carl Sagan observed: "Every one of us is, in the cosmic perspective, precious. If a human disagrees with you, let him live. In a hundred billion galaxies, you will not find another." Apollo 11 gave us a perspective on our place in the universe that we had never before possessed.'
        ],
        cameraHint: 'wide',
      }
    },

    images: [
      {
        nasaId: 'AS11-40-5931',
        title: 'Buzz Aldrin on the Lunar Surface',
        description: 'Astronaut Buzz Aldrin photographed by Neil Armstrong at Tranquility Base',
        url: 'https://images-assets.nasa.gov/image/AS11-40-5931/AS11-40-5931~large.jpg',
        credit: 'NASA / Neil A. Armstrong — Apollo 11 Mission (1969)'
      },
      {
        nasaId: 'AS11-44-6667',
        title: 'Earth Rising Over the Moon',
        description: 'Earthrise photographed from lunar orbit during Apollo 11',
        url: 'https://images-assets.nasa.gov/image/AS11-44-6667/AS11-44-6667~large.jpg',
        credit: 'NASA — Apollo 11 Mission (1969)'
      },
      {
        nasaId: 'Eagle-descent-LRO',
        title: 'Tranquility Base from Lunar Reconnaissance Orbiter',
        description: 'LRO photograph of Tranquility Base showing the Eagle descent stage and astronaut footpath trails (2011)',
        url: 'https://www.nasa.gov/sites/default/files/images/397503main_lroc_apollo11_lrv_tif_full.jpg',
        credit: 'NASA / Goddard / Arizona State University — LRO (2011)'
      }
    ],

    verifiedSources: [
      { name: 'NASA NSSDCA: Apollo 11', url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C' },
      { name: 'NASA Apollo 11 Mission Summary', url: 'https://www.nasa.gov/mission_pages/apollo/missions/apollo11.html' },
      { name: 'LRO Images of Apollo Landing Sites', url: 'https://www.nasa.gov/mission_pages/LRO/news/apollo-sites.html' },
      { name: 'JSC: Apollo 11 Sample Information', url: 'https://curator.jsc.nasa.gov/lunar/catalogs/Apollo11.pdf' }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // APOLLO 15 — Falcon LM Descent Stage + Lunar Roving Vehicle
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'apollo15',
    name: 'Apollo 15',
    destination: 'Moon',
    agency: 'NASA',
    launchDate: '1971-07-26',
    landingDate: '1971-07-30',
    missionEndDate: '1971-08-02',

    locationName: 'Hadley-Apennine',
    coordinates: {
      lat: 26.1322,
      lon: 3.6339,
      source: 'NASA NSSDCA: https://nssdc.gsfc.nasa.gov/planetary/lunar/apolloland.html'
    },

    spacecraftName: 'Falcon Descent Stage & Lunar Roving Vehicle-1',
    hardwareModelPath: '/models/mondfahrzeug_lunar_rover.glb',

    missionPurpose:
      'Conduct extended scientific exploration of the Hadley-Apennine region. First use of the Lunar Roving Vehicle. Collect deep-core drill samples and conduct systematic geological traverse.',
    hardwareStatus: 'Still on surface',
    hardwareStatusDetail:
      'Both the Falcon descent stage and Lunar Roving Vehicle-1 (LRV-1) remain at the Hadley-Apennine landing site. The LRV was parked 91.5 metres east of the Falcon descent stage. NASA LRO confirmed both are present.',

    finalMessage:
      'The first Moon Buggy still sits where it was parked on August 2, 1971. Its television camera — which broadcast the ascent stage liftoff — is still pointed at the lunar sky.',

    chapters: {
      identity: {
        id: 'identity',
        heading: 'WHO AM I?',
        title: 'The Falcon & Rover-1',
        paragraphs: [
          'I am Falcon — the descent stage of a J-class Lunar Module, and alongside me stands LRV-1, the first wheeled vehicle ever driven on another world.',
          'Apollo 15 launched on July 26, 1971. The crew — Commander David Scott, Command Module Pilot Alfred Worden, and Lunar Module Pilot James Irwin — arrived at the Moon in the most ambitious Apollo mission yet designed.',
          'We landed on July 30, 1971, at the foot of the Apennine Mountains, near Hadley Rille — a 1.5-kilometre-wide, 300-metre-deep sinuous lava channel carved billions of years ago.',
          'The Lunar Roving Vehicle weighed 210 kg and could carry 490 kg of crew and equipment. Its four electric motors gave it a top speed of 13 km/h across the lunar terrain.',
          'Over three EVAs, the crew traversed 27.9 kilometres of the Hadley-Apennine region — exploring terrain no human had visited, and collecting material that would transform planetary science.'
        ],
        timeline: [
          { date: '1971-07-26', event: 'Launch — Saturn V AS-510', significance: 'critical' },
          { date: '1971-07-30', event: 'Touchdown at Hadley-Apennine at 22:16 UTC', significance: 'critical' },
          { date: '1971-07-31', event: 'EVA-1: First deployment of Lunar Roving Vehicle-1', significance: 'critical' },
          { date: '1971-08-01', event: 'EVA-2: Traverse to Hadley Rille; discovery of "Genesis Rock"', significance: 'major' },
          { date: '1971-08-02', event: 'EVA-3: Final geological sampling; LRV parked for broadcast', significance: 'major' },
          { date: '1971-08-02 17:11 UTC', event: 'Ascent stage lifts off; LRV camera broadcasts the event', significance: 'critical' },
        ],
        cameraHint: 'wide',
      },

      purpose: {
        id: 'purpose',
        heading: 'WHY WAS I SENT HERE?',
        title: 'Science at the Mountain',
        paragraphs: [
          'Apollo 15 was designed by NASA as the first "J-mission" — optimized for extended lunar surface operations and advanced scientific return over three days rather than a single brief visit.',
          'The landing site near Hadley Rille was selected because the rille\'s walls exposed billions of years of lunar stratigraphy — geological layers that told the story of the Moon\'s volcanic history.',
          'The crew deployed the Apollo Lunar Surface Experiments Package (ALSEP) — a suite of long-term scientific instruments including seismometers, atmospheric detectors, and a heat-flow probe drilled 2.4 metres into the regolith.',
          'On the second EVA, geologist-trained David Scott and James Irwin found what they called the "Genesis Rock" — a piece of anorthosite approximately 4.1 billion years old, nearly as old as the Moon itself, from the original lunar crust.',
          'The crew returned 77 kg of lunar samples — the largest collection from any single Apollo mission at the time — along with the first deep drill cores ever extracted from another planetary body.'
        ],
        cameraHint: 'closeup',
      },

      finalChapter: {
        id: 'finalChapter',
        heading: 'WHAT HAPPENED TO ME?',
        title: 'The Final Chapter',
        paragraphs: [
          'On August 2, 1971, after 18 hours and 34 minutes on the lunar surface across three EVAs, David Scott parked LRV-1 approximately 91.5 metres east of the Falcon descent stage.',
          'Scott aligned the LRV\'s television camera toward the descent stage, then walked away. When the ascent stage engine fired at 17:11 UTC, the camera tracked the liftoff — broadcasting humanity\'s first live departure from another world.',
          'The Falcon descent stage and LRV-1 have remained in the Hadley-Apennine Valley ever since. NASA\'s Lunar Reconnaissance Orbiter confirmed both in 2011.',
          'The LRV\'s batteries were long ago exhausted. Its television camera, communication antenna, and sampling tools remain exactly as Scott left them — pointed at the lunar sky, ready for a broadcast that will never come again.',
          'The site is considered among the most scientifically significant human-made locations on the Moon, chosen for NASA preservation guidelines established in 2011.'
        ],
        timeline: [
          { date: '1971-08-02 17:11 UTC', event: 'Ascent stage liftoff broadcast live by LRV camera', significance: 'critical' },
          { date: '1971-08-02', event: 'Falcon descent stage and LRV-1 left at Hadley-Apennine permanently', significance: 'critical' },
          { date: '2011', event: 'LRO confirms both descent stage and LRV-1 remain at landing site', significance: 'major' },
        ],
        cameraHint: 'orbit',
      },

      legacy: {
        id: 'legacy',
        heading: 'WHAT DID HUMANITY GAIN?',
        title: 'The Legacy',
        paragraphs: [
          'Apollo 15 fundamentally changed our understanding of the Moon\'s formation and geological history. The 77 kg of returned samples contain some of the oldest rocks ever studied.',
          'The Genesis Rock — sample 15415 — at 4.1 billion years old provided direct evidence that the Moon originally had a magma ocean covering its entire surface. As it cooled, lighter minerals floated to the top, forming the anorthositic highlands.',
          'The heat-flow measurements made by the ALSEP provided the first direct data about the Moon\'s interior thermal state — data that would not be duplicated until the InSight mission measured Mars\'s heat flow decades later.',
          'LRV-1 proved that wheeled vehicles could operate productively in low gravity on an alien world — a concept that would directly inspire the design of Mars rovers Sojourner, Spirit, Opportunity, Curiosity, and Perseverance.',
          'David Scott\'s famous "Hammer and Feather" demonstration — proving Galileo\'s hypothesis that all objects fall at the same rate in a vacuum — was watched by millions on live television and remains one of the most elegant experiments in the history of physics.'
        ],
        cameraHint: 'wide',
      }
    },

    images: [
      {
        nasaId: 'AS15-85-11471',
        title: 'Irwin and LRV at Hadley Delta',
        description: 'James Irwin with the Lunar Roving Vehicle at the Hadley-Apennine site, with Mount Hadley Delta in the background',
        url: 'https://images-assets.nasa.gov/image/AS15-85-11471/AS15-85-11471~large.jpg',
        credit: 'NASA / David R. Scott — Apollo 15 Mission (1971)'
      },
      {
        nasaId: 'AS15-82-11057',
        title: 'Hadley Rille from the Rim',
        description: 'View along Hadley Rille from the edge of the sinuous lava channel',
        url: 'https://images-assets.nasa.gov/image/AS15-82-11057/AS15-82-11057~large.jpg',
        credit: 'NASA — Apollo 15 Mission (1971)'
      }
    ],

    verifiedSources: [
      { name: 'NASA NSSDCA: Apollo 15', url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-063C' },
      { name: 'NASA Apollo 15 Mission Summary', url: 'https://www.nasa.gov/mission_pages/apollo/missions/apollo15.html' },
      { name: 'JSC: Apollo 15 Sample Catalog', url: 'https://curator.jsc.nasa.gov/lunar/catalogs/Apollo15.pdf' }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // APOLLO 17 — Challenger Descent Stage + LRV-3
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'apollo17',
    name: 'Apollo 17',
    destination: 'Moon',
    agency: 'NASA',
    launchDate: '1972-12-07',
    landingDate: '1972-12-11',
    missionEndDate: '1972-12-14',

    locationName: 'Taurus-Littrow Valley',
    coordinates: {
      lat: 20.1908,
      lon: 30.7717,
      source: 'NASA NSSDCA: https://nssdc.gsfc.nasa.gov/planetary/lunar/apolloland.html'
    },

    spacecraftName: 'Challenger — Descent Stage',
    hardwareModelPath: '/models/apollo_lunar_module.glb',

    missionPurpose:
      'Final crewed lunar landing of the Apollo program. Conduct the most extensive geological survey of any Apollo mission in the Taurus-Littrow valley, targeting ancient highland material and young volcanic features.',
    hardwareStatus: 'Still on surface',
    hardwareStatusDetail:
      'The Challenger descent stage remains at Taurus-Littrow. It has been photographed by NASA\'s Lunar Reconnaissance Orbiter, confirming the hardware, instruments, and LRV-3 are all present at the site.',

    finalMessage:
      'On December 14, 1972, Gene Cernan took humanity\'s last steps on the Moon. No human has returned since. The Challenger descent stage waits — the last monument of a golden age of exploration.',

    chapters: {
      identity: {
        id: 'identity',
        heading: 'WHO AM I?',
        title: 'Challenger — The Last One',
        paragraphs: [
          'I am Challenger — the descent stage of Apollo 17\'s Lunar Module, the final spacecraft to land humans on the Moon in the twentieth century.',
          'Apollo 17 launched on December 7, 1972 — the first and only nighttime launch of the entire Apollo program. The Saturn V lit the Florida night with 7.5 million pounds of thrust, visible from 800 kilometres away.',
          'Commander Eugene Cernan, Command Module Pilot Ronald Evans, and Lunar Module Pilot Harrison Schmitt — the only professional geologist to visit the Moon — arrived at the Taurus-Littrow valley on December 11, 1972.',
          'The valley was selected because it lies at the intersection of ancient highland material and young, dark mare basalt flows. It was potentially the most scientifically diverse landing site ever chosen for Apollo.',
          'I carried the crew for 75 hours on the lunar surface — the longest stay of any Apollo mission. Harrison Schmitt became only the twelfth person in history to walk on the Moon.'
        ],
        timeline: [
          { date: '1972-12-07', event: 'Nighttime launch — first night launch of Saturn V', significance: 'major' },
          { date: '1972-12-11', event: 'Touchdown at Taurus-Littrow at 02:54 UTC', significance: 'critical' },
          { date: '1972-12-11 to 14', event: 'Three EVAs; 22h 4m of lunar surface time; discovery of orange soil', significance: 'major' },
          { date: '1972-12-14', event: 'Gene Cernan\'s final words on the Moon; ascent stage liftoff at 22:54 UTC', significance: 'critical' },
        ],
        cameraHint: 'wide',
      },

      purpose: {
        id: 'purpose',
        heading: 'WHY WAS I SENT HERE?',
        title: 'The Geologist\'s Dream',
        paragraphs: [
          'Apollo 17 was the culmination of NASA\'s scientific lunar exploration program — a mission explicitly designed to maximize geological return by including the first (and so far only) professional field geologist on a lunar landing.',
          'Harrison Schmitt\'s geological training transformed what the mission accomplished. Where earlier crews would have passed unnoticed, Schmitt identified and sampled material that told the story of billions of years of lunar geological history.',
          'The crew deployed the most comprehensive ALSEP ever sent to the Moon, including seismometers, atmospheric sensors, gravitational gradient instruments, and the Surface Electrical Properties experiment — which tested whether the Moon\'s subsurface could conduct electricity.',
          'On December 11, 1972, during EVA-2, Schmitt discovered bright orange soil near Shorty Crater — later identified as ancient volcanic glass beads, approximately 3.64 billion years old, evidence of a pyroclastic eruption.',
          'The crew returned 110.5 kg of lunar samples — the largest collection of any Apollo mission — including the orange volcanic glass that remains scientifically significant today as a window into the Moon\'s volcanic interior.'
        ],
        cameraHint: 'closeup',
      },

      finalChapter: {
        id: 'finalChapter',
        heading: 'WHAT HAPPENED TO ME?',
        title: 'The Last Goodbye',
        paragraphs: [
          'On December 14, 1972, Gene Cernan prepared to leave the Moon. Before climbing the ladder into the ascent stage, he paused and said: "As I take man\'s last step from the surface, back home for some time to come...I\'d like to just list what we leave behind us..."',
          '"...the challenge of tomorrow." He became the last human to stand on the Moon — a distinction that, as of 2026, he still holds.',
          'At 22:54 UTC on December 14, 1972, the Challenger ascent stage engine fired, and the last humans departed the lunar surface. The descent stage — still carrying equipment, tools, and the American flag — was left behind.',
          'The Challenger descent stage remains at Taurus-Littrow. NASA\'s Lunar Reconnaissance Orbiter has confirmed it in multiple imaging campaigns. The orange soil Schmitt discovered is still there, preserved in the airless vacuum, unchanged from the moment it was last touched.',
          'Gene Cernan died on January 16, 2017, never having returned to the Moon. His footprints — undisturbed by wind or rain — remain exactly as he left them, preserved in the lunar regolith for millions of years.'
        ],
        timeline: [
          { date: '1972-12-14', event: 'Cernan\'s final steps on the lunar surface — last human on the Moon', significance: 'critical' },
          { date: '1972-12-14 22:54 UTC', event: 'Challenger ascent stage liftoff — end of the Apollo era', significance: 'critical' },
          { date: '2011', event: 'LRO confirms Challenger descent stage and LRV-3 remain at Taurus-Littrow', significance: 'major' },
          { date: '2017-01-16', event: 'Gene Cernan dies — the last man to walk on the Moon', significance: 'major' },
        ],
        cameraHint: 'orbit',
      },

      legacy: {
        id: 'legacy',
        heading: 'WHAT DID HUMANITY GAIN?',
        title: 'The Legacy',
        paragraphs: [
          'Apollo 17 returned 110.5 kg of samples representing the most scientifically diverse lunar collection ever assembled. These samples are still being actively studied by researchers worldwide.',
          'The orange volcanic glass discovered by Harrison Schmitt revealed that the Moon had explosive volcanic activity much earlier than previously believed. Recent analysis of these beads confirmed they contain water molecules — evidence of a water-rich volcanic interior.',
          'The seismic network established by all Apollo missions, combined with the data from Apollo 17\'s ALSEP, allowed scientists to map the Moon\'s interior structure — confirming a small iron core, mantle, and crust.',
          'Gene Cernan and Harrison Schmitt\'s EVA record of 22 hours 4 minutes of surface time and 35.7 kilometres traversed on the LRV stood as the Apollo program\'s pinnacle achievement.',
          'Apollo 17 ended the first era of human lunar exploration. Its data continues to shape Artemis mission planning, selecting landing sites, designing hardware, and preparing for the return of humans to the Moon decades after the last departure.'
        ],
        cameraHint: 'wide',
      }
    },

    images: [
      {
        nasaId: 'AS17-134-20471',
        title: 'Harrison Schmitt at the Orange Soil Site',
        description: 'Apollo 17 geologist-astronaut Harrison Schmitt sampling the orange soil deposit near Shorty Crater',
        url: 'https://images-assets.nasa.gov/image/AS17-134-20471/AS17-134-20471~large.jpg',
        credit: 'NASA / Gene Cernan — Apollo 17 Mission (1972)'
      },
      {
        nasaId: 'AS17-148-22727',
        title: 'The Blue Marble',
        description: 'Full-disk photograph of Earth taken by the Apollo 17 crew — one of the most reproduced photographs in history',
        url: 'https://images-assets.nasa.gov/image/AS17-148-22727/AS17-148-22727~large.jpg',
        credit: 'NASA — Apollo 17 Mission (1972)'
      }
    ],

    verifiedSources: [
      { name: 'NASA NSSDCA: Apollo 17', url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1972-096C' },
      { name: 'NASA Apollo 17 Mission Summary', url: 'https://www.nasa.gov/mission_pages/apollo/missions/apollo17.html' },
      { name: 'JSC: Apollo 17 Sample Catalog', url: 'https://curator.jsc.nasa.gov/lunar/catalogs/Apollo17.pdf' }
    ]
  }
];

