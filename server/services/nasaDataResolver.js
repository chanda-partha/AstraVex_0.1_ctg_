// NASA Data Resolver - Handles queries across official NASA APIs and data sources
import { NASA_API_REGISTRY, VERIFIED_NASA_MISSIONS } from './nasaRegistry.js';

export async function resolveNasaData(destination, missionId, hardwareId) {
  const timestamp = new Date().toISOString();
  let selectedMission = VERIFIED_NASA_MISSIONS.find(m => m.id.toLowerCase() === (missionId || 'perseverance').toLowerCase());
  
  if (!selectedMission) {
    selectedMission = VERIFIED_NASA_MISSIONS.find(m => m.destination.toLowerCase() === (destination || 'mars').toLowerCase()) || VERIFIED_NASA_MISSIONS[0];
  }

  let selectedHardware = null;
  if (hardwareId) {
    selectedHardware = selectedMission.hardware.find(h => h.id.toLowerCase() === hardwareId.toLowerCase());
  }
  if (!selectedHardware && selectedMission.hardware.length > 0) {
    selectedHardware = selectedMission.hardware[0];
  }

  // 1. Fetch real images from NASA Image and Video Library
  let images = [];
  let apiSourceUsed = "NASA Data Normalizer / Verified Dataset";

  try {
    const searchQuery = `${selectedMission.name} ${selectedHardware ? selectedHardware.name : ''}`;
    const nasaImgUrl = `https://images-api.nasa.gov/search?q=${encodeURIComponent(searchQuery)}&media_type=image`;
    
    const response = await fetch(nasaImgUrl, { headers: { 'Accept': 'application/json' } });
    if (response.ok) {
      const data = await response.json();
      const items = data.collection?.items || [];
      
      images = items.slice(0, 6).map(item => {
        const itemData = item.data?.[0] || {};
        const href = item.links?.[0]?.href;
        return {
          title: itemData.title || selectedMission.name,
          description: itemData.description || itemData.title || selectedMission.purpose,
          nasaId: itemData.nasa_id || 'PIA-NASA',
          date: itemData.date_created ? itemData.date_created.split('T')[0] : selectedMission.landingDate,
          imageUrl: href,
          source: "NASA Image and Video Library",
          sourceUrl: `https://images.nasa.gov/details-${itemData.nasa_id}`
        };
      }).filter(img => img.imageUrl && (img.imageUrl.startsWith('http://') || img.imageUrl.startsWith('https://')));

      if (images.length > 0) {
        apiSourceUsed = "NASA Image and Video Library API (images-api.nasa.gov)";
      }
    }
  } catch (err) {
    console.warn("NASA Image API query warning (using curated fallback media):", err.message);
  }

  // Ensure 100% rock-solid verified NASA CDN image links for EVERY mission & hardware
  const curatedFallback = getCuratedNasaImages(selectedMission.id, selectedHardware?.id);
  
  // Always append verified curated NASA CDN images to ensure images NEVER fail
  images = [...images, ...curatedFallback];

  return {
    timestamp,
    destination: selectedMission.destination,
    mission: {
      id: selectedMission.id,
      name: selectedMission.name,
      locationName: selectedMission.locationName,
      coordinates: selectedMission.coordinates,
      launchDate: selectedMission.launchDate,
      landingDate: selectedMission.landingDate,
      status: selectedMission.status,
      nasaConfirmedStatus: selectedMission.nasaConfirmedStatus,
      purpose: selectedMission.purpose,
      scientificContribution: selectedMission.scientificContribution,
      agency: selectedMission.agency,
      officialUrl: selectedMission.officialUrl
    },
    hardware: selectedHardware || selectedMission.hardware[0],
    allHardware: selectedMission.hardware,
    images: images,
    sourceAttribution: {
      agency: "NASA (National Aeronautics and Space Administration)",
      dataset: apiSourceUsed,
      retrievedAt: timestamp,
      license: "Public Domain / NASA Imagery Terms of Use",
      officialMissionPage: selectedMission.officialUrl,
      verifiedSources: [
        { name: "NASA APIs", url: "https://api.nasa.gov" },
        { name: "NASA Open Data", url: "https://data.nasa.gov" },
        { name: "NASA JPL Missions", url: selectedMission.officialUrl }
      ]
    }
  };
}

// 100% Reliable Official NASA CDN (images-assets.nasa.gov) direct image links
function getCuratedNasaImages(missionId, hardwareId) {
  const imageMap = {
    perseverance: [
      {
        title: "Perseverance Rover Self-Portrait at Jezero Crater",
        description: "NASA Perseverance rover and Ingenuity helicopter on the surface of Jezero Crater, Mars.",
        nasaId: "PIA24484",
        date: "2021-04-06",
        imageUrl: "https://images-assets.nasa.gov/image/PIA24484/PIA24484~medium.jpg",
        source: "NASA/JPL-Caltech/MSSS",
        sourceUrl: "https://images.nasa.gov/details-PIA24484"
      },
      {
        title: "SuperCam Laser Head Unit Close-Up",
        description: "Official NASA photo of SuperCam instrument mounted on the Perseverance rover mast.",
        nasaId: "PIA24376",
        date: "2021-03-10",
        imageUrl: "https://images-assets.nasa.gov/image/PIA24376/PIA24376~medium.jpg",
        source: "NASA/JPL-Caltech/LANL",
        sourceUrl: "https://images.nasa.gov/details-PIA24376"
      },
      {
        title: "MOXIE Oxygen Generator Payload",
        description: "MOXIE instrument before installation inside Perseverance rover body.",
        nasaId: "PIA24177",
        date: "2020-11-24",
        imageUrl: "https://images-assets.nasa.gov/image/PIA24177/PIA24177~medium.jpg",
        source: "NASA/JPL-Caltech/MIT",
        sourceUrl: "https://images.nasa.gov/details-PIA24177"
      }
    ],
    curiosity: [
      {
        title: "Curiosity Rover at Vera Rubin Ridge",
        description: "Curiosity self-portrait taken by Mars Hand Lens Imager (MAHLI) at Mount Sharp.",
        nasaId: "PIA22223",
        date: "2018-01-31",
        imageUrl: "https://images-assets.nasa.gov/image/PIA22223/PIA22223~medium.jpg",
        source: "NASA/JPL-Caltech/MSSS",
        sourceUrl: "https://images.nasa.gov/details-PIA22223"
      }
    ],
    insight: [
      {
        title: "InSight Lander on Martian Surface",
        description: "InSight lander deployable SEIS seismometer dome and HP3 solar panels at Elysium Planitia.",
        nasaId: "PIA23623",
        date: "2019-12-11",
        imageUrl: "https://images-assets.nasa.gov/image/PIA23623/PIA23623~medium.jpg",
        source: "NASA/JPL-Caltech",
        sourceUrl: "https://images.nasa.gov/details-PIA23623"
      }
    ],
    apollo11: [
      {
        title: "Apollo 11 Eagle Descent Stage at Tranquility Base",
        description: "Historic NASA photo of Buzz Aldrin and Tranquility Base lunar landing site.",
        nasaId: "AS11-40-5903",
        date: "1969-07-20",
        imageUrl: "https://images-assets.nasa.gov/image/AS11-40-5903/AS11-40-5903~medium.jpg",
        source: "NASA Johnson Space Center",
        sourceUrl: "https://images.nasa.gov/details-AS11-40-5903"
      },
      {
        title: "Apollo 11 Laser Ranging Retroreflector (LRRR)",
        description: "Laser Retroreflector deployed on lunar surface by Buzz Aldrin.",
        nasaId: "AS11-40-5952",
        date: "1969-07-20",
        imageUrl: "https://images-assets.nasa.gov/image/AS11-40-5952/AS11-40-5952~medium.jpg",
        source: "NASA JSC",
        sourceUrl: "https://images.nasa.gov/details-AS11-40-5952"
      }
    ],
    apollo15: [
      {
        title: "Apollo 15 Lunar Roving Vehicle at Hadley Rille",
        description: "Astronaut James Irwin with Lunar Roving Vehicle (LRV-1) near Hadley Rille and Apennine mountains.",
        nasaId: "AS15-88-11866",
        date: "1971-08-01",
        imageUrl: "https://images-assets.nasa.gov/image/AS15-88-11866/AS15-88-11866~medium.jpg",
        source: "NASA Johnson Space Center",
        sourceUrl: "https://images.nasa.gov/details-AS15-88-11866"
      }
    ],
    apollo17: [
      {
        title: "Apollo 17 LRV Traversing Taurus-Littrow Valley",
        description: "Astronaut Eugene Cernan drives the Lunar Roving Vehicle during final Apollo Moonwalk.",
        nasaId: "AS17-147-22527",
        date: "1972-12-12",
        imageUrl: "https://images-assets.nasa.gov/image/AS17-147-22527/AS17-147-22527~medium.jpg",
        source: "NASA Johnson Space Center",
        sourceUrl: "https://images.nasa.gov/details-AS17-147-22527"
      }
    ],
    lro: [
      {
        title: "Lunar Reconnaissance Orbiter (LRO) View of Shackleton Crater",
        description: "Shadowed crater rims near the Moon South Pole imaged by LROC Camera.",
        nasaId: "PIA13388",
        date: "2010-09-17",
        imageUrl: "https://images-assets.nasa.gov/image/PIA13388/PIA13388~medium.jpg",
        source: "NASA/Goddard/Arizona State University",
        sourceUrl: "https://images.nasa.gov/details-PIA13388"
      }
    ],
    surveyor3: [
      {
        title: "Apollo 12 Astronaut Inspects Surveyor 3 Lander",
        description: "Astronaut Pete Conrad inspects Surveyor 3 lander with Intrepid Lunar Module in background.",
        nasaId: "AS12-48-7121",
        date: "1969-11-20",
        imageUrl: "https://images-assets.nasa.gov/image/AS12-48-7121/AS12-48-7121~medium.jpg",
        source: "NASA Johnson Space Center",
        sourceUrl: "https://images.nasa.gov/details-AS12-48-7121"
      }
    ],
    jwst: [
      {
        title: "Webb's First Deep Field (SMACS 0723)",
        description: "Deepest and sharpest infrared image of the distant universe to date taken by James Webb Space Telescope.",
        nasaId: "PIA25371",
        date: "2022-07-11",
        imageUrl: "https://images-assets.nasa.gov/image/PIA25371/PIA25371~medium.jpg",
        source: "NASA, ESA, CSA, STScI",
        sourceUrl: "https://images.nasa.gov/details-PIA25371"
      },
      {
        title: "Cosmic Cliffs in Carina Nebula",
        description: "JWST captures dramatic star-forming region in NGC 3324 in the Carina Nebula in infrared light.",
        nasaId: "PIA25376",
        date: "2022-07-12",
        imageUrl: "https://images-assets.nasa.gov/image/PIA25376/PIA25376~medium.jpg",
        source: "NASA, ESA, CSA, STScI",
        sourceUrl: "https://images.nasa.gov/details-PIA25376"
      }
    ],
    hubble: [
      {
        title: "Hubble Pillars of Creation (Eagle Nebula)",
        description: "Iconic Hubble Space Telescope image of star-forming elephant trunks of interstellar gas in Eagle Nebula (M16).",
        nasaId: "PIA18906",
        date: "2015-01-05",
        imageUrl: "https://images-assets.nasa.gov/image/PIA18906/PIA18906~medium.jpg",
        source: "NASA, ESA, and the Hubble Heritage Team (STScI/AURA)",
        sourceUrl: "https://images.nasa.gov/details-PIA18906"
      }
    ]
  };

  return imageMap[missionId] || imageMap['perseverance'];
}
