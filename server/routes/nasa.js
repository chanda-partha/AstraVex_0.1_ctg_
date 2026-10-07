import express from 'express';
import { resolveNasaData } from '../services/nasaDataResolver.js';
import { NASA_API_REGISTRY, VERIFIED_NASA_MISSIONS } from '../services/nasaRegistry.js';

const router = express.Router();

// Get NASA Source Registry
router.get('/registry', (req, res) => {
  res.json({
    status: "success",
    count: NASA_API_REGISTRY.length,
    registry: NASA_API_REGISTRY
  });
});

// Resolve full mission data, hardware specs, images, and source attribution
router.get('/resolve', async (req, res) => {
  try {
    const { destination, mission, hardware } = req.query;
    const resolvedData = await resolveNasaData(destination, mission, hardware);
    res.json(resolvedData);
  } catch (error) {
    console.error("Error resolving NASA data:", error);
    res.status(500).json({ error: "Failed to resolve NASA data", details: error.message });
  }
});

// Get all verified missions available
router.get('/missions', (req, res) => {
  const { destination } = req.query;
  let missions = VERIFIED_NASA_MISSIONS;
  if (destination) {
    missions = missions.filter(m => m.destination.toLowerCase() === destination.toLowerCase());
  }
  res.json({ status: "success", count: missions.length, missions });
});

export default router;
