/**
 * NASA Mission Explorer - API & Services Layer
 * 
 * Centralized service client with:
 * - In-memory LRU cache with TTL (5 minutes)
 * - Request deduplication (prevents concurrent duplicate fetch calls)
 * - AbortController support for cancelling unmounted/superseded requests
 * - Automatic verified client fallback if backend is offline or rate-limited
 * - Configurable retries with exponential backoff
 */

import {
  DestinationType,
  ResolvedNasaPayload,
  AIStoryPayload,
  AIQuizPayload,
  LiveFleetSummaryPayload,
} from '../types';
import { getClientFallbackPayload } from '../utils/nasaDataFallback';
import { buildClientLiveFleetFallback, computeMissionLiveTelemetry } from '../utils/liveTelemetry';
import { buildClientFallbackQuiz } from '../utils/missionQuizzesFallback';

// In-memory cache entry
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// In-memory cache store (bounded LRU with TTL + short offline fallback circuit breaker)
const cache = new Map<string, CacheEntry<unknown>>();
const inFlightRequests = new Map<
  string,
  {
    promise: Promise<unknown>;
    controller: AbortController;
    subscribers: number;
  }
>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const OFFLINE_FALLBACK_TTL_MS = 15 * 1000; // 15s circuit breaker for transient backend outages
const MAX_CACHE_ENTRIES = 100;

function getCached<T>(key: string, ttlMs: number = CACHE_TTL_MS): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > ttlMs) {
    cache.delete(key);
    return null;
  }
  // Touch recency for LRU eviction
  cache.delete(key);
  cache.set(key, entry);
  return entry.data as T;
}

function setCached<T>(key: string, data: T): void {
  if (cache.has(key)) {
    cache.delete(key);
  }
  cache.set(key, { data, timestamp: Date.now() });
  while (cache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey === undefined) break;
    cache.delete(oldestKey);
  }
}

function raceWithCallerAbort<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  if (signal.aborted) {
    return Promise.reject(new DOMException('The operation was aborted.', 'AbortError'));
  }
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => {
      reject(new DOMException('The operation was aborted.', 'AbortError'));
    };
    signal.addEventListener('abort', onAbort, { once: true });
    promise.then(
      (val) => {
        signal.removeEventListener('abort', onAbort);
        resolve(val);
      },
      (err) => {
        signal.removeEventListener('abort', onAbort);
        reject(err);
      }
    );
  });
}

/**
 * Deduplicated, cached fetch helper with bounded LRU cache and decoupled per-caller AbortSignal
 */
async function fetchWithDeduplication<T>(
  url: string,
  options: RequestInit = {},
  cacheKey?: string
): Promise<T> {
  const key = cacheKey || url;
  const callerSignal = options.signal ?? undefined;

  const cached = getCached<T>(key);
  if (cached) {
    return cached;
  }

  let inFlight = inFlightRequests.get(key);
  if (!inFlight) {
    const sharedController = new AbortController();
    const { signal: _ignoredSignal, ...restOptions } = options;
    const basePromise = (async () => {
      try {
        const response = await fetch(url, {
          ...restOptions,
          signal: sharedController.signal,
        });
        if (!response.ok) {
          throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
        }
        const data: T = await response.json();
        setCached(key, data);
        return data;
      } finally {
        inFlightRequests.delete(key);
      }
    })();

    inFlight = {
      promise: basePromise,
      controller: sharedController,
      subscribers: 0,
    };
    inFlightRequests.set(key, inFlight);
  }

  inFlight.subscribers += 1;
  const entry = inFlight;

  const cleanupSubscriber = () => {
    entry.subscribers = Math.max(0, entry.subscribers - 1);
    if (entry.subscribers === 0 && !entry.controller.signal.aborted) {
      entry.controller.abort();
    }
  };

  if (callerSignal) {
    callerSignal.addEventListener('abort', cleanupSubscriber, { once: true });
  }

  try {
    return await raceWithCallerAbort(entry.promise as Promise<T>, callerSignal);
  } finally {
    if (callerSignal) {
      callerSignal.removeEventListener('abort', cleanupSubscriber);
    }
  }
}

const CLIENT_MISSION_IMAGE_QUERIES: Record<string, string> = {
  perseverance: 'Perseverance rover Jezero Crater',
  curiosity: 'Curiosity rover Gale Crater Mount Sharp',
  insight: 'InSight Mars lander',
  viking: 'Viking 1 Mars lander',
  mro: 'Mars Reconnaissance Orbiter HiRISE Mars',
  apollo11: 'Apollo 11 lunar surface',
  apollo15: 'Apollo 15 Hadley Rille',
  apollo17: 'Apollo 17 Taurus Littrow',
  artemis3: 'Artemis lunar surface',
  chandrayaan3: 'Chandrayaan Moon',
  change4: 'far side of the Moon',
  surveyor3: 'Surveyor 3 Moon',
  lro: 'Lunar Reconnaissance Orbiter',
  ladee: 'LADEE lunar',
  jwst: 'James Webb Space Telescope nebula',
  hubble: 'Hubble Space Telescope nebula galaxy',
  iss: 'International Space Station Earth orbit',
  voyager: 'Voyager spacecraft Jupiter Saturn interstellar',
};

const OFF_TOPIC_IMAGE_RE =
  /(^|\b)(portrait|headshot|logo|patch|emblem|award|ceremony|auditorium|press\s*conference|fact\s*sheet)(\b|$)/i;

function normalizeSafeHttps(url: unknown): string | null {
  if (typeof url !== 'string' || !url.trim()) return null;
  const trimmed = url.trim().replace(/^http:\/\//i, 'https://');
  if (!trimmed.startsWith('https://')) return null;
  try {
    return encodeURI(decodeURI(trimmed));
  } catch {
    return encodeURI(trimmed);
  }
}

async function fetchPublicJson<T>(url: string, signal?: AbortSignal, timeoutMs = 4500): Promise<T | null> {
  const timeoutCtrl = new AbortController();
  const timer = setTimeout(() => timeoutCtrl.abort(), timeoutMs);
  const onParentAbort = () => timeoutCtrl.abort();
  signal?.addEventListener('abort', onParentAbort, { once: true });
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: timeoutCtrl.signal,
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (err: unknown) {
    if (signal?.aborted) throw err;
    return null;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onParentAbort);
  }
}

interface MarsRssImageItem {
  imageid?: string;
  sol?: number;
  title?: string;
  caption?: string;
  credit?: string;
  date_taken_utc?: string;
  date_received?: string;
  link?: string;
  camera?: { instrument?: string };
  image_files?: { medium?: string; large?: string; small?: string };
}

interface MarsRssResponse {
  images?: MarsRssImageItem[];
  total_images?: number;
  total_results?: number;
}

interface NasaImageSearchResponse {
  collection?: {
    items?: Array<{
      data?: Array<{
        nasa_id?: string;
        title?: string;
        description?: string;
        date_created?: string;
        center?: string;
      }>;
      links?: Array<{ href?: string }>;
    }>;
  };
}

interface IssLiveResponse {
  latitude?: number;
  longitude?: number;
  altitude?: number;
  velocity?: number;
  visibility?: string;
}

async function enrichPayloadWithKeylessNasaApis(
  destination: DestinationType,
  missionId: string,
  hardwareId: string,
  signal?: AbortSignal
): Promise<ResolvedNasaPayload> {
  const mKey = missionId.toLowerCase();
  const base = getClientFallbackPayload(destination, missionId, hardwareId);
  const publicCacheKey = `nasa:public:${destination}:${mKey}`;
  const cachedPublic = getCached<ResolvedNasaPayload>(publicCacheKey);
  if (cachedPublic) {
    return {
      ...base,
      images: cachedPublic.images.length > 0 ? cachedPublic.images : base.images,
      realTimeTelemetry: computeMissionLiveTelemetry(
        base.mission,
        Date.now(),
        cachedPublic.realTimeTelemetry
      ),
      sourceAttribution: cachedPublic.sourceAttribution,
    };
  }

  const marsCat = mKey === 'perseverance' ? 'mars2020' : mKey === 'curiosity' ? 'msl' : null;
  const searchQuery = CLIENT_MISSION_IMAGE_QUERIES[mKey] || `${base.mission.name} ${base.destination}`;

  const [marsRss, libJson, issLive] = await Promise.all([
    marsCat
      ? fetchPublicJson<MarsRssResponse>(
          `https://mars.nasa.gov/rss/api/?feed=raw_images&category=${marsCat}&feedtype=json&ver=1.2&num=5&page=0`,
          signal
        )
      : Promise.resolve(null),
    fetchPublicJson<NasaImageSearchResponse>(
      `https://images-api.nasa.gov/search?q=${encodeURIComponent(searchQuery)}&media_type=image`,
      signal
    ),
    mKey === 'iss'
      ? fetchPublicJson<IssLiveResponse>('https://api.wheretheiss.at/v1/satellites/25544', signal)
      : Promise.resolve(null),
  ]);

  const rawImages: ResolvedNasaPayload['images'] = (marsRss?.images || [])
    .map((item) => {
      const href = normalizeSafeHttps(
        item.image_files?.medium || item.image_files?.large || item.image_files?.small
      );
      if (!href) return null;
      const cam = item.camera?.instrument || 'Mars Raw Camera';
      const solLabel = item.sol !== undefined ? `Sol ${item.sol}` : 'Mars Surface';
      const earthDate = item.date_taken_utc ? String(item.date_taken_utc).split('T')[0] : '';
      return {
        title: item.title || `${base.mission.name} ${solLabel}: ${cam}`,
        description:
          (item.caption && String(item.caption).replace(/\s+/g, ' ').trim()) ||
          `Raw camera downlink (${cam}) from Mars surface (${solLabel}).`,
        nasaId: item.imageid || `${marsCat}-${item.sol || 'raw'}`,
        date: earthDate ? `${solLabel} (${earthDate})` : solLabel,
        imageUrl: href,
        source: `${cam} · ${item.credit || 'NASA/JPL-Caltech'}`,
        sourceUrl:
          normalizeSafeHttps(item.link) ||
          (marsCat === 'mars2020'
            ? 'https://mars.nasa.gov/mars2020/multimedia/raw-images/'
            : 'https://mars.nasa.gov/msl/multimedia/raw-images/'),
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  const libImages: ResolvedNasaPayload['images'] = (libJson?.collection?.items || [])
    .map((item) => {
      const meta = item.data?.[0];
      const titleText = String(meta?.title || base.mission.name);
      if (OFF_TOPIC_IMAGE_RE.test(titleText)) return null;
      const href = normalizeSafeHttps(item.links?.[0]?.href);
      if (!href) return null;
      return {
        title: titleText,
        description: meta?.description || titleText || base.mission.purpose,
        nasaId: meta?.nasa_id || 'PIA-NASA',
        date: meta?.date_created ? meta.date_created.split('T')[0] : base.mission.landingDate,
        imageUrl: href,
        source: meta?.center ? `NASA Image Library (${meta.center})` : 'NASA Image and Video Library',
        sourceUrl: meta?.nasa_id
          ? `https://images.nasa.gov/details-${meta.nasa_id}`
          : 'https://images.nasa.gov/',
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .slice(0, 6);

  const mergedImages: ResolvedNasaPayload['images'] = [];
  const seen = new Set<string>();
  for (const img of [...rawImages, ...libImages, ...base.images]) {
    if (!img?.imageUrl) continue;
    const urlKey = img.imageUrl.toLowerCase();
    const idKey = img.nasaId ? img.nasaId.toLowerCase() : '';
    if (seen.has(urlKey) || (idKey && seen.has(idKey))) continue;
    seen.add(urlKey);
    if (idKey) seen.add(idKey);
    mergedImages.push(img);
  }

  let liveOverrides: Partial<NonNullable<ResolvedNasaPayload['realTimeTelemetry']>> | undefined;
  if (marsRss?.images?.[0]) {
    const first = marsRss.images[0];
    liveOverrides = {
      roverManifest: {
        status: 'active',
        maxSol: Number(first.sol) || 0,
        maxDate: String(first.date_taken_utc || first.date_received || '').split('T')[0],
        totalPhotos: Number(marsRss.total_images) || Number(marsRss.total_results) || 0,
        cameras: first.camera?.instrument ? [first.camera.instrument] : [],
      },
      isLiveApi: true,
      feedSource: 'NASA JPL Mars Raw Feed + Public Image API',
    };
  } else if (mKey === 'iss' && typeof issLive?.latitude === 'number' && typeof issLive?.longitude === 'number') {
    liveOverrides = {
      liveCoords: {
        lat: Number(issLive.latitude.toFixed(2)),
        lon: Number(issLive.longitude.toFixed(2)),
        visibility: issLive.visibility || 'daylight',
      },
      orbitalAltitudeKm: Number((issLive.altitude || 418).toFixed(1)),
      orbitalVelocityKmh: Math.round(issLive.velocity || 27580),
      isLiveApi: true,
      feedSource: 'Where The ISS At? Public Live API',
    };
  } else if (libImages.length > 0) {
    liveOverrides = {
      isLiveApi: true,
      feedSource: 'NASA Image & Video Library Public API + JPL Ephemeris',
    };
  }

  const realTimeTelemetry = computeMissionLiveTelemetry(
    base.mission,
    Date.now(),
    liveOverrides
  );

  const enriched: ResolvedNasaPayload = {
    ...base,
    images: mergedImages,
    realTimeTelemetry,
    sourceAttribution: {
      ...base.sourceAttribution,
      dataset:
        rawImages.length > 0
          ? 'NASA Mars Raw Images + Image Library Public API'
          : libImages.length > 0
            ? 'NASA Image & Video Library Public API (images-api.nasa.gov)'
            : base.sourceAttribution.dataset,
      retrievedAt: new Date().toISOString(),
    },
  };

  if (rawImages.length > 0 || libImages.length > 0 || liveOverrides) {
    setCached(publicCacheKey, enriched);
  }
  return enriched;
}

/**
 * Resolve NASA Mission & Hardware Payload
 * Fetches from /api/nasa/resolve with direct public keyless NASA API enrichment fallback
 */
export async function fetchNasaPayload(
  destination: DestinationType,
  missionId: string,
  hardwareId: string,
  signal?: AbortSignal
): Promise<ResolvedNasaPayload> {
  const query = `/api/nasa/resolve?destination=${encodeURIComponent(destination)}&mission=${encodeURIComponent(missionId)}&hardware=${encodeURIComponent(hardwareId)}`;
  const cacheKey = `nasa:${destination}:${missionId}:${hardwareId}`;
  const offlineBreakerKey = `nasa:offline:${destination}:${missionId}:${hardwareId}`;

  const breakerHit = getCached<ResolvedNasaPayload>(offlineBreakerKey, OFFLINE_FALLBACK_TTL_MS);
  if (breakerHit) {
    return enrichPayloadWithKeylessNasaApis(destination, missionId, hardwareId, signal);
  }

  try {
    const data = await fetchWithDeduplication<ResolvedNasaPayload>(query, { signal }, cacheKey);
    const enriched: ResolvedNasaPayload =
      !data.realTimeTelemetry && data.mission
        ? { ...data, realTimeTelemetry: computeMissionLiveTelemetry(data.mission) }
        : data;
    return enriched;
  } catch (err: unknown) {
    if (signal?.aborted || (err as Error)?.name === 'AbortError') {
      throw err;
    }
    console.warn(`[NASA API] Backend proxy unavailable (${(err as Error).message}), querying public keyless NASA APIs directly`);
    const fallback = await enrichPayloadWithKeylessNasaApis(destination, missionId, hardwareId, signal);
    setCached(offlineBreakerKey, fallback);
    return fallback;
  }
}

export interface NasaArchiveVideo {
  nasaId: string;
  title: string;
  description: string;
  date: string;
  videoUrl: string;
  previewThumb?: string;
  sourceUrl: string;
}

/**
 * Query NASA Image & Video Library for verified mission archival footage
 */
export async function fetchMissionVideos(
  missionId: string,
  signal?: AbortSignal
): Promise<NasaArchiveVideo[]> {
  const key = `nasa:videos:${missionId.toLowerCase()}`;
  const cached = getCached<NasaArchiveVideo[]>(key);
  if (cached) return cached;

  try {
    const res = await fetch(
      `/api/nasa/videos?mission=${encodeURIComponent(missionId)}`,
      { signal }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const videos: NasaArchiveVideo[] = Array.isArray(data.videos) ? data.videos : [];
    setCached(key, videos);
    return videos;
  } catch (_) {
    return [];
  }
}

/**
 * Fetch live fleet summary or gracefully degrade to public keyless NASA/ISS APIs + orbital math
 */
export async function fetchLiveFleetTelemetry(
  forceRefresh: boolean = false,
  signal?: AbortSignal
): Promise<LiveFleetSummaryPayload> {
  const cacheKey = 'nasa:live:fleet';
  if (!forceRefresh) {
    const cachedLive = getCached<LiveFleetSummaryPayload>(cacheKey, 60_000);
    if (cachedLive) return cachedLive;
  } else {
    cache.delete(cacheKey);
  }

  const url = forceRefresh ? '/api/nasa/live?refresh=true' : '/api/nasa/live';
  try {
    const response = await fetch(url, { signal });
    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}`);
    }
    const data: LiveFleetSummaryPayload = await response.json();
    setCached(cacheKey, data);
    return data;
  } catch (err: unknown) {
    if (signal?.aborted || (err as Error)?.name === 'AbortError') {
      throw err;
    }
    console.warn(`[NASA Live API] Backend offline (${(err as Error).message}), syncing public keyless ISS/Mars telemetry`);
    const baseFleet = buildClientLiveFleetFallback();
    const [issRes, persRes, curiRes] = await Promise.all([
      fetchPublicJson<IssLiveResponse>('https://api.wheretheiss.at/v1/satellites/25544', signal),
      fetchPublicJson<MarsRssResponse>('https://mars.nasa.gov/rss/api/?feed=raw_images&category=mars2020&feedtype=json&ver=1.2&num=1&page=0', signal),
      fetchPublicJson<MarsRssResponse>('https://mars.nasa.gov/rss/api/?feed=raw_images&category=msl&feedtype=json&ver=1.2&num=1&page=0', signal),
    ]);

    if (typeof issRes?.latitude === 'number' && typeof issRes?.longitude === 'number') {
      const liveIss = {
        latitude: Number(issRes.latitude.toFixed(2)),
        longitude: Number(issRes.longitude.toFixed(2)),
        altitudeKm: Number((issRes.altitude || 418).toFixed(1)),
        velocityKmh: Math.round(issRes.velocity || 27580),
        visibility: issRes.visibility || 'daylight',
        source: 'api.wheretheiss.at Live Telemetry',
      };
      baseFleet.issLive = liveIss;
      const issMission = baseFleet.missions.find((m) => m.id === 'iss');
      if (issMission) {
        issMission.realTimeTelemetry = computeMissionLiveTelemetry(issMission, Date.now(), {
          liveCoords: {
            lat: liveIss.latitude,
            lon: liveIss.longitude,
            visibility: liveIss.visibility,
          },
          orbitalAltitudeKm: liveIss.altitudeKm,
          orbitalVelocityKmh: liveIss.velocityKmh,
          isLiveApi: true,
          feedSource: 'Where The ISS At? Public Live API',
        });
      }
      baseFleet.apiStatus = baseFleet.apiStatus.map((s) =>
        s.id === 'iss-live' ? { ...s, status: 'LIVE' } : s
      );
    }

    const patchMarsManifest = (id: string, rss: MarsRssResponse | null) => {
      const first = rss?.images?.[0];
      const missionEntry = baseFleet.missions.find((m) => m.id === id);
      if (!first || !missionEntry) return false;
      missionEntry.realTimeTelemetry = computeMissionLiveTelemetry(missionEntry, Date.now(), {
        roverManifest: {
          status: 'active',
          maxSol: Number(first.sol) || 0,
          maxDate: String(first.date_taken_utc || first.date_received || '').split('T')[0],
          totalPhotos: Number(rss?.total_images) || Number(rss?.total_results) || 0,
          cameras: first.camera?.instrument ? [first.camera.instrument] : [],
        },
        isLiveApi: true,
        feedSource: 'NASA JPL Mars Raw Feed + Ephemeris',
      });
      return true;
    };

    const persLive = patchMarsManifest('perseverance', persRes);
    const curiLive = patchMarsManifest('curiosity', curiRes);
    if (persLive || curiLive) {
      baseFleet.apiStatus = baseFleet.apiStatus.map((s) =>
        s.id === 'mars-rover-photos'
          ? { ...s, status: 'LIVE', url: 'https://mars.nasa.gov/rss/api/' }
          : s
      );
    }

    setCached(cacheKey, baseFleet);
    return baseFleet;
  }
}

/**
 * Fetch AI Educational Story Dossier
 */
export async function fetchAIStory(
  destination: DestinationType,
  missionId: string,
  hardwareId: string,
  signal?: AbortSignal
): Promise<AIStoryPayload> {
  const cacheKey = `story:${destination}:${missionId}:${hardwareId}`;

  // Check cache
  const cached = getCached<AIStoryPayload>(cacheKey);
  if (cached) return cached;

  if (inFlightRequests.has(cacheKey)) {
    return raceWithCallerAbort(
      inFlightRequests.get(cacheKey)!.promise as Promise<AIStoryPayload>,
      signal
    );
  }

  const sharedController = new AbortController();
  const promise = (async () => {
    try {
      const response = await fetch('/api/ai/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, mission: missionId, hardware: hardwareId }),
        signal: sharedController.signal,
      });

      if (!response.ok) {
        throw new Error(`Story API returned HTTP ${response.status}`);
      }

      const json = await response.json();
      const story = json.story as AIStoryPayload;
      setCached(cacheKey, story);
      return story;
    } catch (err) {
      if (signal?.aborted || (err as Error)?.name === 'AbortError') throw err;
      // Client fallback story if backend or Gemini is unavailable (ephemeral, do not cache for 5 min)
      const fallbackStory: AIStoryPayload = {
        title: `The Story of ${hardwareId.toUpperCase()}`,
        subtitle: `${missionId.toUpperCase()} · ${destination === 'DeepSpace' ? 'Deep Space & Orbital Theater' : destination} Exploration`,
        targetAgeGroup: 'Space Explorers & Mission Specialists',
        paragraphs: [
          {
            heading: "1. Precision Spacecraft Engineering",
            content: `The ${hardwareId} subsystem was engineered to perform reliably in the extreme thermal, vacuum, and radiation environment of ${destination === 'Moon' ? 'the lunar surface and cislunar space' : destination === 'Mars' ? 'Mars (~225 million km away)' : 'orbital and interstellar deep space'}.`
          },
          {
            heading: "2. Key Scientific Discoveries",
            content: `Through dedicated mission operations, ${missionId} returned verified telemetry, spectral measurements, and structural insight that shaped modern planetary and astrophysics models.`
          },
          {
            heading: "3. Legacy for Future Explorers",
            content: `Verified observations from ${missionId} directly guide next-generation NASA, Artemis, and deep-space missions.`
          }
        ],
        funFacts: [
          `Engineered specifically for the ${destination === 'DeepSpace' ? 'Deep Space & Orbital' : destination} environment.`,
          `Communicates via NASA Deep Space Network (DSN) & Tracking telemetry links.`
        ]
      };
      return fallbackStory;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  const entry = { promise, controller: sharedController, subscribers: 1 };
  const cleanupSubscriber = () => {
    entry.subscribers = Math.max(0, entry.subscribers - 1);
    if (entry.subscribers === 0 && !entry.controller.signal.aborted) {
      entry.controller.abort();
    }
  };
  if (signal) {
    signal.addEventListener('abort', cleanupSubscriber, { once: true });
  }
  inFlightRequests.set(cacheKey, entry);
  try {
    return await raceWithCallerAbort(promise, signal);
  } finally {
    if (signal) {
      signal.removeEventListener('abort', cleanupSubscriber);
    }
  }
}

/**
 * Fetch AI Science Quiz
 */
export async function fetchAIQuiz(
  destination: DestinationType,
  missionId: string,
  hardwareId: string,
  signal?: AbortSignal,
  options?: { forceFresh?: boolean; roundSeed?: number }
): Promise<AIQuizPayload> {
  const roundSeed = options?.roundSeed ?? 1;
  const cacheKey = `quiz:${destination}:${missionId}:${hardwareId}:${roundSeed}`;

  if (!options?.forceFresh) {
    const cached = getCached<AIQuizPayload>(cacheKey);
    if (cached) return cached;
  }

  if (inFlightRequests.has(cacheKey)) {
    return raceWithCallerAbort(
      inFlightRequests.get(cacheKey)!.promise as Promise<AIQuizPayload>,
      signal
    );
  }

  const promise = (async () => {
    try {
      const response = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          mission: missionId,
          hardware: hardwareId,
          roundSeed,
          forceFresh: Boolean(options?.forceFresh),
        }),
      });

      if (!response.ok) {
        throw new Error(`Quiz API returned HTTP ${response.status}`);
      }

      const json = await response.json();
      const quiz = json.quiz as AIQuizPayload;
      setCached(cacheKey, quiz);
      return quiz;
    } catch (err) {
      if (signal?.aborted || (err as Error)?.name === 'AbortError') throw err;
      return buildClientFallbackQuiz(destination, missionId, hardwareId, roundSeed);
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  const controller = new AbortController();
  inFlightRequests.set(cacheKey, { promise, controller, subscribers: 1 });
  return raceWithCallerAbort(promise, signal);
}

/**
 * Send interactive question to AI Assistant
 */
export async function sendAIChat(
  message: string,
  context: {
    destination: DestinationType | string;
    mission: string | any;
    hardware: string | any;
  },
  apiKey?: string,
  signal?: AbortSignal
): Promise<{ reply: string; source: string; geminiErrorStatus?: number }> {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      apiKey: apiKey?.trim() || undefined,
      contextData: {
        destination: context.destination,
        mission: context.mission,
        hardware: context.hardware,
      }
    }),
    signal
  });

  if (!response.ok) {
    throw new Error(`Chat API error HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Send request to ELON AI Mission Guide
 */
export async function sendElonChat(
  message: string,
  visitorName: string = "Explorer",
  stage: string = "general",
  context?: {
    destination?: DestinationType;
    mission?: string | any;
    hardware?: string | any;
  },
  apiKey?: string,
  signal?: AbortSignal
): Promise<{ reply: string; source: string }> {
  try {
    const response = await fetch('/api/ai/elon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        visitorName,
        stage,
        contextData: context,
        apiKey: apiKey?.trim() || undefined,
      }),
      signal
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    if (signal?.aborted) throw err;
  }

  // Resilient Client-Side Fallback if backend is unreachable
  if (stage === 'welcome') {
    return {
      reply: "Greetings, explorer. I am ELON, your artificial intelligence mission guide. Welcome to ASTRAVEX. Beyond the boundaries of Earth lies an endless universe filled with mysteries waiting to be discovered. Your journey beyond Earth begins here.",
      source: "ELON Offline Core"
    };
  }
  if (stage === 'ask_name') {
    return {
      reply: "Before we begin our journey, may I know your name?",
      source: "ELON Offline Core"
    };
  }
  if (stage === 'greeting') {
    return {
      reply: `Hello, ${visitorName}! Welcome aboard. It's wonderful to have you here. How are you today? I hope you're doing great. The universe is full of extraordinary mysteries waiting to be discovered. From the ancient craters of our Moon to the vast landscapes of Mars, there is so much waiting for us to explore. Are you ready for an extraordinary journey?`,
      source: "ELON Offline Core"
    };
  }
  if (stage === 'space_intro') {
    return {
      reply: `Space exploration represents humanity's greatest quest. ASTRAVEX connects you directly with verified NASA telemetry from rovers on Mars, Apollo landing sites on the Moon, and instruments orbiting in deep space. Here, you don't just read history—you experience the actual hardware exploring alien worlds.`,
      source: "ELON Offline Core"
    };
  }
  if (stage === 'mission_brief') {
    return {
      reply: `Commander ${visitorName}, your mission briefing is ready. Where shall we travel today? Would you like to explore the Moon, discover the mysteries of Mars, or explore the Solar System?`,
      source: "ELON Offline Core"
    };
  }

  return {
    reply: `Commander ${visitorName}, standing by. All spacecraft telemetry and navigation systems are primed for your destination of choice.`,
    source: "ELON Offline Core"
  };
}

/**
 * Clear client cache (for refresh / dev operations)
 */
export function clearApiCache(): void {
  cache.clear();
  inFlightRequests.clear();
}
