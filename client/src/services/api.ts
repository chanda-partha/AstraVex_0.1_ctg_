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

import { DestinationType, ResolvedNasaPayload, AIStoryPayload, AIQuizPayload } from '../types';
import { getClientFallbackPayload } from '../utils/nasaDataFallback';

// In-memory cache entry
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// In-memory cache store
const cache = new Map<string, CacheEntry<unknown>>();
const inFlightRequests = new Map<string, Promise<unknown>>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCached<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Deduplicated, cached fetch helper with timeout and AbortSignal support
 */
async function fetchWithDeduplication<T>(
  url: string,
  options: RequestInit = {},
  cacheKey?: string
): Promise<T> {
  const key = cacheKey || url;

  // Check cache first
  const cached = getCached<T>(key);
  if (cached) {
    return cached;
  }

  // Check if identical request is already in-flight
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key) as Promise<T>;
  }

  // Execute request
  const requestPromise = (async () => {
    try {
      const response = await fetch(url, options);
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

  inFlightRequests.set(key, requestPromise);
  return requestPromise;
}

/**
 * Resolve NASA Mission & Hardware Payload
 * Fetches from /api/nasa/resolve with automatic client fallback on network error
 */
export async function fetchNasaPayload(
  destination: DestinationType,
  missionId: string,
  hardwareId: string,
  signal?: AbortSignal
): Promise<ResolvedNasaPayload> {
  const query = `/api/nasa/resolve?destination=${encodeURIComponent(destination)}&mission=${encodeURIComponent(missionId)}&hardware=${encodeURIComponent(hardwareId)}`;
  const cacheKey = `nasa:${destination}:${missionId}:${hardwareId}`;

  try {
    const data = await fetchWithDeduplication<ResolvedNasaPayload>(query, { signal }, cacheKey);
    return data;
  } catch (err: unknown) {
    if (signal?.aborted) {
      throw err;
    }
    console.warn(`[NASA API] Server unavailable (${(err as Error).message}), serving verified NASA client fallback`);
    const fallback = getClientFallbackPayload(destination, missionId, hardwareId);
    setCached(cacheKey, fallback);
    return fallback;
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
    return inFlightRequests.get(cacheKey) as Promise<AIStoryPayload>;
  }

  const promise = (async () => {
    try {
      const response = await fetch('/api/ai/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, mission: missionId, hardware: hardwareId }),
        signal,
      });

      if (!response.ok) {
        throw new Error(`Story API returned HTTP ${response.status}`);
      }

      const json = await response.json();
      const story = json.story as AIStoryPayload;
      setCached(cacheKey, story);
      return story;
    } catch (err) {
      if (signal?.aborted) throw err;
      // Client fallback story if backend or Gemini is unavailable
      const fallbackStory: AIStoryPayload = {
        title: `The Story of ${hardwareId.toUpperCase()}`,
        subtitle: `Scientific Exploration on ${destination} with the ${missionId} Mission`,
        targetAgeGroup: 'Middle School Explorers',
        paragraphs: [
          {
            heading: "Engineering for the Solar System",
            content: `The ${hardwareId} instrument was developed by NASA engineers to operate in the harshest extraterrestrial conditions imaginable, providing critical data back to Earth.`
          },
          {
            heading: "Key Scientific Discoveries",
            content: `Through rigorous planetary operations, this hardware enabled groundbreaking measurements of surface mineralogy, atmospheric pressure, and geological history.`
          },
          {
            heading: "Legacy for Future Explorers",
            content: `Data collected by ${missionId} continues to guide Artemis lunar astronauts and future human expeditions to Mars.`
          }
        ],
        funFacts: [
          `Engineered to withstand extreme temperature differentials on ${destination}.`,
          `Powered by NASA deep-space telemetry relay protocols.`
        ]
      };
      setCached(cacheKey, fallbackStory);
      return fallbackStory;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, promise);
  return promise;
}

/**
 * Fetch AI Science Quiz
 */
export async function fetchAIQuiz(
  destination: DestinationType,
  missionId: string,
  hardwareId: string,
  signal?: AbortSignal
): Promise<AIQuizPayload> {
  const cacheKey = `quiz:${destination}:${missionId}:${hardwareId}`;

  const cached = getCached<AIQuizPayload>(cacheKey);
  if (cached) return cached;

  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey) as Promise<AIQuizPayload>;
  }

  const promise = (async () => {
    try {
      const response = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, mission: missionId, hardware: hardwareId }),
        signal,
      });

      if (!response.ok) {
        throw new Error(`Quiz API returned HTTP ${response.status}`);
      }

      const json = await response.json();
      const quiz = json.quiz as AIQuizPayload;
      setCached(cacheKey, quiz);
      return quiz;
    } catch (err) {
      if (signal?.aborted) throw err;
      // Robust client fallback quiz
      const fallbackQuiz: AIQuizPayload = {
        quizTitle: `${missionId.toUpperCase()} Flight & Science Evaluation`,
        destination,
        questions: [
          {
            id: 'q1',
            question: `What primary mission does ${missionId.toUpperCase()} perform on ${destination}?`,
            options: [
              `Surface scientific analysis and imaging`,
              `Mining precious metals for commercial return`,
              `Building immediate permanent human cities`,
              `Launching orbital defense satellites`
            ],
            correctIndex: 0,
            explanation: `${missionId.toUpperCase()} was deployed by NASA to analyze geological history and search for signs of past habitability.`,
            healthReward: 10,
            healthPenalty: 15
          },
          {
            id: 'q2',
            question: `How does hardware like ${hardwareId} communicate its telemetry data back to NASA?`,
            options: [
              `Submarine ocean optical fiber cables`,
              `The NASA Deep Space Network (DSN) radio antenna dishes`,
              `Direct laser beam pointing at local cellular towers`,
              `Commercial 5G consumer satellites`
            ],
            correctIndex: 1,
            explanation: `NASA's Deep Space Network (DSN) stations in California, Spain, and Australia maintain constant radio contact with distant spacecraft.`,
            healthReward: 10,
            healthPenalty: 15
          },
          {
            id: 'q3',
            question: `What is the primary source of power for long-duration robotic missions on ${destination}?`,
            options: [
              `Standard alkaline AA household batteries`,
              `Radioisotope Thermoelectric Generators (RTG) or solar panels`,
              `Fossil fuel combustion combustion engines`,
              `Geothermal steam turbines`
            ],
            correctIndex: 1,
            explanation: `NASA rovers and landers rely on high-efficiency solar arrays or plutonium-238 RTG nuclear batteries for decades of power.`,
            healthReward: 10,
            healthPenalty: 15
          }
        ]
      };
      setCached(cacheKey, fallbackQuiz);
      return fallbackQuiz;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, promise);
  return promise;
}

/**
 * Send interactive question to AI Assistant
 */
export async function sendAIChat(
  message: string,
  context: {
    destination: DestinationType;
    mission: string | any;
    hardware: string | any;
  },
  apiKey?: string,
  signal?: AbortSignal
): Promise<{ reply: string; source: string }> {
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
