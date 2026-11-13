import express from 'express';
import {
  resolveNasaData,
  resolveLiveFleetTelemetry,
  resolveMissionVideos,
} from '../services/nasaDataResolver.js';
import { NASA_API_REGISTRY, VERIFIED_NASA_MISSIONS } from '../services/nasaRegistry.js';

const router = express.Router();

// Lightweight per-IP sliding-window rate limiter for NASA data endpoints (120 req / min)
const nasaRateBuckets = new Map();
function nasaRateLimiter(req, res, next) {
  const ip = req.ip || req.socket?.remoteAddress || 'local';
  const now = Date.now();
  const windowMs = 60_000;
  const maxReqs = 120;
  const bucket = nasaRateBuckets.get(ip) || [];
  const fresh = bucket.filter((ts) => now - ts < windowMs);
  if (fresh.length >= maxReqs) {
    return res.status(429).json({
      error: 'Too many NASA API requests. Please wait a moment before retrying.',
    });
  }
  fresh.push(now);
  nasaRateBuckets.set(ip, fresh);
  if (nasaRateBuckets.size > 500) {
    for (const [k, v] of nasaRateBuckets.entries()) {
      if (v.every((ts) => now - ts >= windowMs)) nasaRateBuckets.delete(k);
    }
  }
  next();
}

router.use(nasaRateLimiter);

function sanitizeQueryToken(val, maxLen = 40) {
  if (typeof val !== 'string') return undefined;
  const cleaned = val.trim().slice(0, maxLen).replace(/[^a-zA-Z0-9_-]/g, '');
  return cleaned || undefined;
}

// Get NASA Source Registry
router.get('/registry', (req, res) => {
  res.json({
    status: "success",
    count: NASA_API_REGISTRY.length,
    registry: NASA_API_REGISTRY
  });
});

// Archival Mission Video Lookup (NASA Image & Video Library)
router.get('/videos', async (req, res) => {
  try {
    const missionId = sanitizeQueryToken(req.query.mission, 32) || 'perseverance';
    const payload = await resolveMissionVideos(missionId);
    res.json(payload);
  } catch (error) {
    console.error("Error fetching NASA archive videos:", error);
    res.json({ status: 'offline', missionId: req.query.mission || 'unknown', videos: [] });
  }
});

// Real-Time Active Fleet Telemetry Summary (ISS live orbit, Mars Rover manifests, APOD, DONKI + Ephemeris)
router.get('/live', async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === 'true' || req.query.refresh === '1';
    const liveSummary = await resolveLiveFleetTelemetry(forceRefresh);
    res.json(liveSummary);
  } catch (error) {
    console.error("Error resolving live fleet telemetry:", error);
    res.status(500).json({
      error: "Failed to resolve live fleet telemetry",
      ...(process.env.NODE_ENV !== 'production' ? { details: error.message } : {}),
    });
  }
});

// Resolve full mission data, hardware specs, images, real-time telemetry, and source attribution
router.get('/resolve', async (req, res) => {
  try {
    const destination = sanitizeQueryToken(req.query.destination, 20);
    const mission = sanitizeQueryToken(req.query.mission, 32);
    const hardware = sanitizeQueryToken(req.query.hardware, 40);
    const resolvedData = await resolveNasaData(destination, mission, hardware);
    res.json(resolvedData);
  } catch (error) {
    console.error("Error resolving NASA data:", error);
    res.status(500).json({
      error: "Failed to resolve NASA data",
      ...(process.env.NODE_ENV !== 'production' ? { details: error.message } : {}),
    });
  }
});

// Get all verified missions available
router.get('/missions', (req, res) => {
  const destination = sanitizeQueryToken(req.query.destination, 20);
  let missions = VERIFIED_NASA_MISSIONS;
  if (destination) {
    const target = destination.toLowerCase();
    missions = missions.filter((m) => {
      const dest = m.destination.toLowerCase();
      if (target === 'deepspace') {
        return dest === 'deepspace' || dest === 'astrophysics' || dest === 'orbital';
      }
      return dest === target;
    });
  }
  res.json({ status: "success", count: missions.length, missions });
});

export default router;
