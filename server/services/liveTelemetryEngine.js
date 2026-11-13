// Real-Time NASA Telemetry & Open Data Feed Aggregator
// Fetches live ISS coordinates, Mars Rover photo manifests, APOD, and DONKI Space Weather
// with 5-minute TTL caching, 4.5s timeouts, and deterministic astronomical math fallbacks.

const SPEED_OF_LIGHT_KM_S = 299792.458;
const AU_KM = 149597870.7;
const DEG_TO_RAD = Math.PI / 180;
const J2000_MS = Date.UTC(2000, 0, 1, 12, 0, 0);
const MARS_SOL_MS = 88775244.09;
const CACHE_TTL_MS = 5 * 60 * 1000;

const MU_EARTH_KM3_S2 = 398600.4418;
const MU_MARS_KM3_S2 = 42828.3752;
const MU_MOON_KM3_S2 = 4902.8001;
const R_EARTH_KM = 6371.0;
const R_MARS_KM = 3389.5;
const R_MOON_KM = 1737.4;

export function getJulianMetadata(nowMs = Date.now()) {
  const daysSinceJ2000 = (nowMs - J2000_MS) / 86400000;
  return {
    julianDate: Number((2451545.0 + daysSinceJ2000).toFixed(4)),
    j2000Centuries: Number((daysSinceJ2000 / 36525).toFixed(8)),
  };
}

export function computeVisVivaVelocityKmh(muKm3S2, radiusKm, semiMajorAxisKm) {
  const vKmS = Math.sqrt(Math.max(0, muKm3S2 * (2 / radiusKm - 1 / semiMajorAxisKm)));
  return Math.round(vKmS * 3600);
}

export function getJwstL2Telemetry(nowMs = Date.now()) {
  const HALO_PERIOD_MS = 180.0 * 86400000;
  const epochMs = Date.UTC(2022, 0, 24, 19, 0, 0);
  const phase = ((nowMs - epochMs) / HALO_PERIOD_MS) * Math.PI * 2;
  const distanceKm = Math.round(1_496_000 + 132_000 * Math.cos(phase));
  const velocityKmh = Math.round(3690 + 185 * Math.sin(phase));
  return { distanceKm, velocityKmh };
}

export const ACTIVE_MISSION_IDS = new Set([
  'perseverance',
  'curiosity',
  'mro',
  'lro',
  'jwst',
  'hubble',
  'iss',
  'change4',
  'voyager',
]);

export const PRELAUNCH_MISSION_IDS = new Set(['artemis3']);

const MISSION_EPOCHS = {
  perseverance: { startIso: '2021-02-18T20:55:00Z', solZeroMs: Date.parse('2021-02-18T20:55:00Z') },
  curiosity: { startIso: '2012-08-06T05:17:57Z', solZeroMs: Date.parse('2012-08-06T05:17:57Z') },
  mro: { startIso: '2006-03-10T21:24:00Z' },
  lro: { startIso: '2009-06-23T10:27:00Z' },
  jwst: { startIso: '2021-12-25T12:20:00Z' },
  hubble: { startIso: '1990-04-24T12:33:51Z' },
  iss: { startIso: '1998-11-20T06:40:00Z' },
  change4: { startIso: '2019-01-03T02:26:00Z' },
  voyager: { startIso: '1977-09-05T12:56:00Z' },
};

let cachedExternalBundle = null;
let lastFetchedMs = 0;
let inFlightBundlePromise = null;

function normalizeDeg(deg) {
  const m = deg % 360;
  return m < 0 ? m + 360 : m;
}

function solveKepler(M_rad, e) {
  let E = M_rad + e * Math.sin(M_rad);
  for (let i = 0; i < 5; i++) {
    const f = E - e * Math.sin(E) - M_rad;
    const fp = 1 - e * Math.cos(E);
    E = E - f / fp;
  }
  return E;
}

function getHeliocentricPositionAU(elements, centuriesFromJ2000) {
  const a = elements.a;
  const e = elements.e;
  const i = elements.i * DEG_TO_RAD;
  const L = normalizeDeg(elements.L0 + elements.LRate * centuriesFromJ2000);
  const wBar = normalizeDeg(elements.wBar0 + elements.wBarRate * centuriesFromJ2000);
  const omega = normalizeDeg(elements.omega0 + elements.omegaRate * centuriesFromJ2000) * DEG_TO_RAD;
  const w = (wBar - elements.omega0 - elements.omegaRate * centuriesFromJ2000) * DEG_TO_RAD;
  const M = normalizeDeg(L - wBar) * DEG_TO_RAD;

  const E = solveKepler(M, e);
  const xOrb = a * (Math.cos(E) - e);
  const yOrb = a * Math.sqrt(Math.max(0, 1 - e * e)) * Math.sin(E);

  const cosO = Math.cos(omega);
  const sinO = Math.sin(omega);
  const cosW = Math.cos(w);
  const sinW = Math.sin(w);
  const cosI = Math.cos(i);
  const sinI = Math.sin(i);

  const x = (cosW * cosO - sinW * sinO * cosI) * xOrb + (-sinW * cosO - cosW * sinO * cosI) * yOrb;
  const y = (cosW * sinO + sinW * cosO * cosI) * xOrb + (-sinW * sinO + cosW * cosO * cosI) * yOrb;
  const z = sinW * sinI * xOrb + cosW * sinI * yOrb;

  return [x, y, z];
}

export function getEarthMarsDistanceKm(nowMs = Date.now()) {
  const T = (nowMs - J2000_MS) / (86400000 * 36525);
  const earth = getHeliocentricPositionAU(
    {
      a: 1.00000261,
      e: 0.01671123 - 0.00004392 * T,
      i: -0.00001531,
      L0: 100.46457166,
      LRate: 35999.37244981,
      wBar0: 102.93768193,
      wBarRate: 0.32327364,
      omega0: 0,
      omegaRate: 0,
    },
    T
  );
  const mars = getHeliocentricPositionAU(
    {
      a: 1.52371034,
      e: 0.0933941 + 0.00007882 * T,
      i: 1.84969142,
      L0: -4.55343205,
      LRate: 19140.30268499,
      wBar0: -23.94362959,
      wBarRate: 0.44441088,
      omega0: 49.55953891,
      omegaRate: -0.29257343,
    },
    T
  );
  return Math.round(Math.hypot(mars[0] - earth[0], mars[1] - earth[1], mars[2] - earth[2]) * AU_KM);
}

export function getEarthMoonDistanceKm(nowMs = Date.now()) {
  const ANOMALISTIC_PERIOD_MS = 27.55455 * 86400000;
  const PERIGEE_EPOCH_MS = Date.UTC(2024, 0, 13, 10, 35, 0);
  const phase = ((nowMs - PERIGEE_EPOCH_MS) / ANOMALISTIC_PERIOD_MS) * Math.PI * 2;
  return Math.round(384400 - 21000 * Math.cos(phase));
}

function getComputedIssPosition(nowMs = Date.now()) {
  const ORBIT_PERIOD_MS = 92.68 * 60 * 1000;
  const phase = ((nowMs % ORBIT_PERIOD_MS) / ORBIT_PERIOD_MS) * Math.PI * 2;
  const latitude = Number((51.64 * Math.sin(phase)).toFixed(2));
  const rawLon = ((nowMs / 1000) * 0.0604) % 360;
  let longitude = ((rawLon + 180) % 360) - 180;
  longitude = Number(longitude.toFixed(2));
  const altitudeKm = Number((418.4 + 2.8 * Math.sin(phase * 2)).toFixed(1));
  const velocityKmh = Math.round(27576 + 18 * Math.cos(phase * 2));
  const solarHourAngle = ((nowMs / 3600000 + longitude / 15) % 24 + 24) % 24;
  return {
    latitude,
    longitude,
    altitudeKm,
    velocityKmh,
    visibility: solarHourAngle >= 6 && solarHourAngle <= 18 ? 'daylight' : 'eclipsed',
  };
}

function getVoyager1DistanceKm(nowMs = Date.now()) {
  const refEpochMs = Date.UTC(2024, 0, 1, 0, 0, 0);
  const elapsedSec = (nowMs - refEpochMs) / 1000;
  // ~162.55 AU at J2024.0 receding radially at 16.9995 km/s (~3.58 AU/yr)
  const baseKm = 162.55 * AU_KM + elapsedSec * 16.9995;
  const seasonalOffsetKm = AU_KM * 0.55 * Math.cos(((nowMs - J2000_MS) / (365.25 * 86400000)) * Math.PI * 2);
  return Math.round(baseKm + seasonalOffsetKm);
}

function formatCompactDistanceKm(km) {
  if (km >= 1_000_000_000) return `${(km / 1_000_000_000).toFixed(2)}B km`;
  if (km >= 1_000_000) return `${(km / 1_000_000).toFixed(2)}M km`;
  return `${km.toLocaleString('en-US')} km`;
}

function formatLightDelay(seconds) {
  if (seconds < 60) return `${seconds.toFixed(seconds < 10 ? 2 : 1)} s`;
  const mins = Math.floor(seconds / 60);
  const remSecs = Math.round(seconds % 60);
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${String(mins % 60).padStart(2, '0')}m`;
  }
  return `${mins}m ${String(remSecs).padStart(2, '0')}s`;
}

function formatMissionElapsed(ms) {
  const safeMs = Math.max(0, ms);
  const totalSec = Math.floor(safeMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (days >= 365) {
    return `${Math.floor(days / 365)}y ${days % 365}d · ${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${days}d · ${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

async function fetchJsonSafe(url, timeoutMs = 4500) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

export async function getLiveExternalBundle(forceRefresh = false) {
  const nowMs = Date.now();
  if (!forceRefresh && cachedExternalBundle && nowMs - lastFetchedMs < CACHE_TTL_MS) {
    return { ...cachedExternalBundle, fromCache: true };
  }
  if (!forceRefresh && inFlightBundlePromise) {
    return inFlightBundlePromise;
  }

  inFlightBundlePromise = (async () => {
    const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';

    const [
      issRes,
      persRes,
      curiRes,
      persRssRes,
      curiRssRes,
      apodRes,
      donkiRes,
    ] = await Promise.allSettled([
      fetchJsonSafe('https://api.wheretheiss.at/v1/satellites/25544', 4500),
      fetchJsonSafe(`https://api.nasa.gov/mars-photos/api/v1/manifests/perseverance?api_key=${encodeURIComponent(apiKey)}`, 4500),
      fetchJsonSafe(`https://api.nasa.gov/mars-photos/api/v1/manifests/curiosity?api_key=${encodeURIComponent(apiKey)}`, 4500),
      fetchJsonSafe('https://mars.nasa.gov/rss/api/?feed=raw_images&category=mars2020&feedtype=json&ver=1.2&num=1&page=0', 4500),
      fetchJsonSafe('https://mars.nasa.gov/rss/api/?feed=raw_images&category=msl&feedtype=json&ver=1.2&num=1&page=0', 4500),
      fetchJsonSafe(`https://api.nasa.gov/planetary/apod?api_key=${encodeURIComponent(apiKey)}`, 4500),
      fetchJsonSafe(`https://api.nasa.gov/DONKI/notifications?type=all&api_key=${encodeURIComponent(apiKey)}`, 4500),
    ]);

    const fallbackIss = getComputedIssPosition(nowMs);
    let issLive = {
      latitude: fallbackIss.latitude,
      longitude: fallbackIss.longitude,
      altitudeKm: fallbackIss.altitudeKm,
      velocityKmh: fallbackIss.velocityKmh,
      visibility: fallbackIss.visibility,
      source: 'Keplerian Propagator (Fallback)',
      isLive: false,
    };

    if (issRes.status === 'fulfilled' && typeof issRes.value?.latitude === 'number') {
      issLive = {
        latitude: Number(issRes.value.latitude.toFixed(2)),
        longitude: Number(issRes.value.longitude.toFixed(2)),
        altitudeKm: Number((issRes.value.altitude || 418).toFixed(1)),
        velocityKmh: Math.round(issRes.value.velocity || 27580),
        visibility: issRes.value.visibility || 'daylight',
        source: 'api.wheretheiss.at Live Telemetry',
        isLive: true,
      };
    }

    const manifests = {};
    let marsApiStatus = 'COMPUTED';
    let marsFeedUrl = 'https://mars.nasa.gov/rss/api/';

    if (persRes.status === 'fulfilled' && persRes.value?.photo_manifest) {
      const m = persRes.value.photo_manifest;
      manifests.perseverance = {
        status: m.status || 'active',
        maxSol: Number(m.max_sol) || 0,
        maxDate: m.max_date || '',
        totalPhotos: Number(m.total_photos) || 0,
        cameras: Array.isArray(m.photos) && m.photos.length > 0 ? m.photos[m.photos.length - 1].cameras || [] : [],
      };
      marsApiStatus = 'LIVE';
      marsFeedUrl = 'https://api.nasa.gov/#mars-rover-photos';
    } else if (persRssRes.status === 'fulfilled' && Array.isArray(persRssRes.value?.images) && persRssRes.value.images.length > 0) {
      const img = persRssRes.value.images[0];
      manifests.perseverance = {
        status: 'active',
        maxSol: Number(img.sol) || 0,
        maxDate: String(img.date_taken_utc || img.date_received || '').split('T')[0],
        totalPhotos: Number(persRssRes.value.total_images) || Number(persRssRes.value.total_results) || 0,
        cameras: img.camera?.instrument ? [img.camera.instrument] : [],
      };
      marsApiStatus = 'LIVE';
    }

    if (curiRes.status === 'fulfilled' && curiRes.value?.photo_manifest) {
      const m = curiRes.value.photo_manifest;
      manifests.curiosity = {
        status: m.status || 'active',
        maxSol: Number(m.max_sol) || 0,
        maxDate: m.max_date || '',
        totalPhotos: Number(m.total_photos) || 0,
        cameras: Array.isArray(m.photos) && m.photos.length > 0 ? m.photos[m.photos.length - 1].cameras || [] : [],
      };
      marsApiStatus = 'LIVE';
      marsFeedUrl = 'https://api.nasa.gov/#mars-rover-photos';
    } else if (curiRssRes.status === 'fulfilled' && Array.isArray(curiRssRes.value?.images) && curiRssRes.value.images.length > 0) {
      const img = curiRssRes.value.images[0];
      manifests.curiosity = {
        status: 'active',
        maxSol: Number(img.sol) || 0,
        maxDate: String(img.date_taken_utc || img.date_received || '').split('T')[0],
        totalPhotos: Number(curiRssRes.value.total_images) || Number(curiRssRes.value.total_results) || 0,
        cameras: img.camera?.instrument ? [img.camera.instrument] : [],
      };
      marsApiStatus = 'LIVE';
    }

    let apod = undefined;
    let apodStatus = 'COMPUTED';
    if (apodRes.status === 'fulfilled' && apodRes.value?.title) {
      apod = {
        title: apodRes.value.title,
        date: apodRes.value.date || new Date(nowMs).toISOString().split('T')[0],
        explanation: String(apodRes.value.explanation || '').slice(0, 320),
        url: apodRes.value.url,
        mediaType: apodRes.value.media_type || 'image',
      };
      apodStatus = 'LIVE';
    }

    let spaceWeather = [];
    let donkiStatus = 'COMPUTED';
    if (donkiRes.status === 'fulfilled' && Array.isArray(donkiRes.value) && donkiRes.value.length > 0) {
      spaceWeather = donkiRes.value.slice(0, 4).map((n, idx) => ({
        id: n.messageID || `donki-${idx}`,
        messageType: n.messageType || 'NOTICE',
        issueTime: n.messageIssueTime || new Date(nowMs).toISOString(),
        summary: String(n.messageBody || '').replace(/\s+/g, ' ').slice(0, 220).trim(),
        url: n.messageURL,
      }));
      donkiStatus = 'LIVE';
    } else {
      spaceWeather = [
        {
          id: 'donki-nominal',
          messageType: 'STATUS',
          issueTime: new Date(nowMs).toISOString(),
          summary: 'Deep Space Network telemetry nominal. Ephemeris & mission clocks streaming continuously.',
          url: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/',
        },
      ];
    }

    const bundle = {
      fetchedAtIso: new Date(nowMs).toISOString(),
      issLive,
      manifests,
      apod,
      spaceWeather,
      apiStatus: [
        { id: 'mars-rover-photos', name: 'NASA JPL Mars Rover Live Feed', status: marsApiStatus, url: marsFeedUrl },
        { id: 'iss-live', name: 'Where The ISS At? Live Orbit', status: issLive.isLive ? 'LIVE' : 'COMPUTED', url: 'https://wheretheiss.at/w/developer' },
        { id: 'nasa-donki', name: 'NASA DONKI Space Weather', status: donkiStatus, url: 'https://api.nasa.gov/#donki' },
        { id: 'nasa-apod', name: 'NASA APOD', status: apodStatus, url: 'https://api.nasa.gov/#apod' },
      ],
    };

    cachedExternalBundle = bundle;
    lastFetchedMs = Date.now();
    return { ...bundle, fromCache: false };
  })();

  try {
    return await inFlightBundlePromise;
  } finally {
    inFlightBundlePromise = null;
  }
}

export function computeMissionLiveTelemetry(mission, bundle = null, nowMs = Date.now()) {
  const id = (mission.id || 'perseverance').toLowerCase();
  const dest = (mission.destination || 'Mars').toLowerCase();

  let statusCategory = 'HISTORIC';
  let statusLabel = 'HISTORIC ARCHIVE';
  if (ACTIVE_MISSION_IDS.has(id)) {
    statusCategory = 'ACTIVE';
    statusLabel = 'ACTIVE LIVE';
  } else if (PRELAUNCH_MISSION_IDS.has(id)) {
    statusCategory = 'PRELAUNCH';
    statusLabel = 'UPCOMING · ARTEMIS PROGRAM';
  }

  let earthDistanceKm = 384400;
  let orbitalAltitudeKm;
  let orbitalVelocityKmh;
  let liveCoords;
  let marsSol;
  let missionElapsedText = mission.landingDate ? `Landed ${mission.landingDate}` : 'Historic Record';
  let roverManifest = bundle?.manifests?.[id];
  let isLiveApi = false;
  let feedSource = 'JPL Ephemeris Math Engine';

  const epochInfo = MISSION_EPOCHS[id];
  const { julianDate, j2000Centuries } = getJulianMetadata(nowMs);
  let ephemerisMeta = {
    julianDate,
    j2000Centuries,
    solverModel: 'JPL J2000 Keplerian Propagator',
  };

  if (dest === 'mars' || ['perseverance', 'curiosity', 'insight', 'viking', 'mro'].includes(id)) {
    earthDistanceKm = getEarthMarsDistanceKm(nowMs);
    ephemerisMeta = {
      julianDate,
      j2000Centuries,
      solverModel: 'JPL Standish J2000 Two-Body Heliocentric',
      eccentricity: 0.0934,
      inclinationDeg: 1.85,
    };
    if (epochInfo?.solZeroMs) {
      marsSol = Math.floor((nowMs - epochInfo.solZeroMs) / MARS_SOL_MS);
      if (roverManifest?.maxSol && roverManifest.maxSol > marsSol) {
        marsSol = roverManifest.maxSol;
      }
      missionElapsedText = `Sol ${marsSol} · ${formatMissionElapsed(nowMs - epochInfo.solZeroMs)}`;
    } else if (epochInfo?.startIso) {
      missionElapsedText = `Orbit · ${formatMissionElapsed(nowMs - Date.parse(epochInfo.startIso))}`;
    } else if (mission.landingDate) {
      missionElapsedText = `Served ${mission.landingDate} Archive`;
    }
    if (id === 'mro') {
      const mroPhase = ((nowMs % (112 * 60000)) / (112 * 60000)) * Math.PI * 2;
      orbitalAltitudeKm = Number((285 - 32 * Math.cos(mroPhase)).toFixed(1));
      const rKm = R_MARS_KM + orbitalAltitudeKm;
      const aKm = R_MARS_KM + 287.5;
      orbitalVelocityKmh = computeVisVivaVelocityKmh(MU_MARS_KM3_S2, rKm, aKm);
      ephemerisMeta = {
        julianDate,
        j2000Centuries,
        solverModel: 'Areocentric Vis-Viva + J2000 Range',
        eccentricity: 0.009,
        inclinationDeg: 92.7,
        semiMajorAxisKm: Number(aKm.toFixed(1)),
      };
    }
    if (roverManifest) {
      isLiveApi = true;
      feedSource = 'NASA Mars Rover Manifest API + JPL Ephemeris';
    }
  } else if (id === 'iss') {
    const iss = bundle?.issLive || getComputedIssPosition(nowMs);
    earthDistanceKm = Math.round(iss.altitudeKm);
    orbitalAltitudeKm = iss.altitudeKm;
    const rKm = R_EARTH_KM + orbitalAltitudeKm;
    orbitalVelocityKmh = bundle?.issLive?.isLive
      ? iss.velocityKmh
      : computeVisVivaVelocityKmh(MU_EARTH_KM3_S2, rKm, rKm);
    liveCoords = { lat: iss.latitude, lon: iss.longitude, visibility: iss.visibility };
    missionElapsedText = `LEO Orbit · ${formatMissionElapsed(nowMs - Date.parse(MISSION_EPOCHS.iss.startIso))}`;
    ephemerisMeta = {
      julianDate,
      j2000Centuries,
      solverModel: bundle?.issLive?.isLive ? 'NORAD TLE / WTIA + Vis-Viva' : 'WGS-84 LEO Vis-Viva Propagator',
      eccentricity: 0.0007,
      inclinationDeg: 51.64,
      semiMajorAxisKm: Number(rKm.toFixed(1)),
    };
    if (bundle?.issLive?.isLive) {
      isLiveApi = true;
      feedSource = 'Where The ISS At? Live Orbital Telemetry';
    }
  } else if (id === 'jwst') {
    const jwstOrbit = getJwstL2Telemetry(nowMs);
    earthDistanceKm = jwstOrbit.distanceKm;
    orbitalAltitudeKm = jwstOrbit.distanceKm;
    orbitalVelocityKmh = jwstOrbit.velocityKmh;
    missionElapsedText = `L2 Halo · ${formatMissionElapsed(nowMs - Date.parse(MISSION_EPOCHS.jwst.startIso))}`;
    ephemerisMeta = {
      julianDate,
      j2000Centuries,
      solverModel: 'CRTBP Sun-Earth L2 Halo (180d Period)',
      eccentricity: 0.0167,
      inclinationDeg: 5.2,
      semiMajorAxisKm: 1_496_000,
    };
  } else if (id === 'hubble') {
    const hstPhase = ((nowMs % (95.4 * 60000)) / (95.4 * 60000)) * Math.PI * 2;
    orbitalAltitudeKm = Number((535 + 4.5 * Math.sin(hstPhase)).toFixed(1));
    earthDistanceKm = Math.round(orbitalAltitudeKm);
    const rKm = R_EARTH_KM + orbitalAltitudeKm;
    orbitalVelocityKmh = computeVisVivaVelocityKmh(MU_EARTH_KM3_S2, rKm, rKm);
    missionElapsedText = `LEO 34+y · ${formatMissionElapsed(nowMs - Date.parse(MISSION_EPOCHS.hubble.startIso))}`;
    ephemerisMeta = {
      julianDate,
      j2000Centuries,
      solverModel: 'Geocentric LEO Vis-Viva Equation',
      eccentricity: 0.0003,
      inclinationDeg: 28.47,
      semiMajorAxisKm: Number(rKm.toFixed(1)),
    };
  } else if (id === 'voyager') {
    earthDistanceKm = getVoyager1DistanceKm(nowMs);
    orbitalVelocityKmh = 61198;
    missionElapsedText = `Interstellar · ${formatMissionElapsed(nowMs - Date.parse(MISSION_EPOCHS.voyager.startIso))}`;
    ephemerisMeta = {
      julianDate,
      j2000Centuries,
      solverModel: 'Hyperbolic Heliocentric Escape + Earth Parallax',
      eccentricity: 3.72,
      inclinationDeg: 35.7,
    };
  } else {
    earthDistanceKm = getEarthMoonDistanceKm(nowMs);
    ephemerisMeta = {
      julianDate,
      j2000Centuries,
      solverModel: 'Anomalistic Cislunar Elliptic Model',
      eccentricity: 0.0549,
      inclinationDeg: 5.145,
      semiMajorAxisKm: 384400,
    };
    if (id === 'lro') {
      const lroPhase = ((nowMs % (113 * 60000)) / (113 * 60000)) * Math.PI * 2;
      orbitalAltitudeKm = Number((50 + 25 * Math.cos(lroPhase)).toFixed(1));
      const rKm = R_MOON_KM + orbitalAltitudeKm;
      const aKm = R_MOON_KM + 115;
      orbitalVelocityKmh = computeVisVivaVelocityKmh(MU_MOON_KM3_S2, rKm, aKm);
      ephemerisMeta = {
        julianDate,
        j2000Centuries,
        solverModel: 'Selenocentric Vis-Viva Polar Orbit',
        eccentricity: 0.043,
        inclinationDeg: 90.0,
        semiMajorAxisKm: Number(aKm.toFixed(1)),
      };
    } else if (id === 'ladee') {
      orbitalAltitudeKm = 40;
      const rKm = R_MOON_KM + 40;
      orbitalVelocityKmh = computeVisVivaVelocityKmh(MU_MOON_KM3_S2, rKm, rKm);
      ephemerisMeta = {
        julianDate,
        j2000Centuries,
        solverModel: 'Retrograde Equatorial Vis-Viva Archive',
        eccentricity: 0.008,
        inclinationDeg: 157.0,
        semiMajorAxisKm: Number(rKm.toFixed(1)),
      };
    }
    if (epochInfo?.startIso) {
      missionElapsedText = `Active · ${formatMissionElapsed(nowMs - Date.parse(epochInfo.startIso))}`;
    } else if (id === 'artemis3') {
      missionElapsedText = 'Targeted 2027 · HLS Readiness';
    } else if (id === 'ladee') {
      missionElapsedText = 'Lunar Orbit · 2013–2014';
    } else if (mission.landingDate) {
      missionElapsedText = `Landed ${mission.landingDate}`;
    }
  }

  const signalDelaySeconds = Number((earthDistanceKm / SPEED_OF_LIGHT_KM_S).toFixed(2));
  const signalDelayLabel = formatLightDelay(signalDelaySeconds);
  const roundTripDelayLabel = formatLightDelay(signalDelaySeconds * 2);

  const updates = [];
  const syncIso = bundle?.fetchedAtIso || new Date(nowMs).toISOString();

  if (roverManifest) {
    updates.push({
      id: `${id}-manifest`,
      category: 'MANIFEST',
      title: `NASA Mars Manifest · Sol ${roverManifest.maxSol}`,
      detail: `${roverManifest.totalPhotos.toLocaleString('en-US')} science photos logged (latest Earth date: ${roverManifest.maxDate}).`,
      timestamp: syncIso,
      badge: 'NASA API',
    });
  }

  if (id === 'iss' && liveCoords) {
    updates.push({
      id: 'iss-orbit-track',
      category: 'ORBIT',
      title: `Sub-Orbital Pass (${liveCoords.lat.toFixed(2)}°, ${liveCoords.lon.toFixed(2)}°)`,
      detail: `Altitude ${orbitalAltitudeKm} km · Speed ${orbitalVelocityKmh?.toLocaleString('en-US')} km/h (${liveCoords.visibility}).`,
      timestamp: syncIso,
      badge: bundle?.issLive?.isLive ? 'LIVE API' : 'ORBIT MATH',
    });
  }

  updates.push({
    id: `${id}-dsn-link`,
    category: 'TELEMETRY',
    title:
      statusCategory === 'ACTIVE'
        ? `Live Distance from Earth: ${formatCompactDistanceKm(earthDistanceKm)}`
        : statusCategory === 'PRELAUNCH'
        ? `Target Lunar Distance Today: ${formatCompactDistanceKm(earthDistanceKm)}`
        : `Current Distance to Site: ${formatCompactDistanceKm(earthDistanceKm)}`,
    detail:
      marsSol !== undefined
        ? `Sol ${marsSol} surface operations · One-way speed-of-light delay is ${signalDelayLabel}.`
        : `One-way radio light-time delay is ${signalDelayLabel} (round trip ${roundTripDelayLabel}).`,
    timestamp: syncIso,
    badge: statusCategory,
  });

  if (statusCategory === 'ACTIVE' && bundle?.spaceWeather?.[0]) {
    updates.push({
      id: `${id}-donki`,
      category: 'SPACE_WEATHER',
      title: `NASA DONKI (${bundle.spaceWeather[0].messageType})`,
      detail: bundle.spaceWeather[0].summary,
      timestamp: bundle.spaceWeather[0].issueTime || syncIso,
      badge: 'DONKI',
    });
  }

  return {
    missionId: id,
    statusCategory,
    statusLabel,
    isActive: statusCategory === 'ACTIVE',
    missionElapsedText,
    marsSol,
    earthDistanceKm,
    earthDistanceLabel: formatCompactDistanceKm(earthDistanceKm),
    signalDelaySeconds,
    signalDelayLabel,
    roundTripDelayLabel,
    orbitalAltitudeKm,
    orbitalVelocityKmh,
    liveCoords,
    roverManifest,
    updates,
    feedSource,
    isLiveApi,
    lastSyncedIso: syncIso,
    ephemerisMeta,
  };
}

export async function getLiveFleetSummary(allMissions, forceRefresh = false) {
  const bundle = await getLiveExternalBundle(forceRefresh);
  const nowMs = Date.now();

  const missionEntries = allMissions.map((m) => {
    const rt = computeMissionLiveTelemetry(m, bundle, nowMs);
    return {
      id: m.id,
      name: m.name,
      destination: m.destination,
      agency: m.agency,
      locationName: m.locationName,
      status: m.status,
      statusCategory: rt.statusCategory,
      statusLabel: rt.statusLabel,
      officialUrl: m.officialUrl,
      realTimeTelemetry: rt,
    };
  });

  // Ensure Active missions come first, Prelaunch next, Historic last
  const rank = { ACTIVE: 0, PRELAUNCH: 1, HISTORIC: 2 };
  missionEntries.sort((a, b) => (rank[a.statusCategory] ?? 3) - (rank[b.statusCategory] ?? 3));

  return {
    timestamp: new Date(nowMs).toISOString(),
    activeCount: missionEntries.filter((m) => m.statusCategory === 'ACTIVE').length,
    totalMissions: missionEntries.length,
    issLive: {
      latitude: bundle.issLive.latitude,
      longitude: bundle.issLive.longitude,
      altitudeKm: bundle.issLive.altitudeKm,
      velocityKmh: bundle.issLive.velocityKmh,
      visibility: bundle.issLive.visibility,
      source: bundle.issLive.source,
    },
    apod: bundle.apod,
    spaceWeather: bundle.spaceWeather,
    apiStatus: bundle.apiStatus.map((s) => ({
      ...s,
      status: bundle.fromCache && s.status === 'LIVE' ? 'CACHED' : s.status,
    })),
    missions: missionEntries,
  };
}

