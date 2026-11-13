import express from 'express';
import { generateStory, answerChat, generateQuiz, answerElon } from '../services/aiService.js';
import { resolveNasaData } from '../services/nasaDataResolver.js';

const router = express.Router();

// Lightweight per-IP sliding-window rate limiter for AI endpoints (40 req / min)
const rateBuckets = new Map();
function aiRateLimiter(req, res, next) {
  const ip = req.ip || req.socket?.remoteAddress || 'local';
  const now = Date.now();
  const windowMs = 60_000;
  const maxReqs = 40;
  const bucket = rateBuckets.get(ip) || [];
  const fresh = bucket.filter((ts) => now - ts < windowMs);
  if (fresh.length >= maxReqs) {
    return res.status(429).json({
      error: 'Too many AI requests. Please wait a moment before sending another query.',
    });
  }
  fresh.push(now);
  rateBuckets.set(ip, fresh);
  if (rateBuckets.size > 500) {
    for (const [k, v] of rateBuckets.entries()) {
      if (v.every((ts) => now - ts >= windowMs)) rateBuckets.delete(k);
    }
  }
  next();
}

router.use(aiRateLimiter);

function cleanToken(val, fallback) {
  if (typeof val !== 'string') return fallback;
  const clean = val.trim().slice(0, 40).replace(/[^a-zA-Z0-9_-]/g, '');
  return clean || fallback;
}

function sanitizeContextData(rawContext) {
  if (!rawContext || typeof rawContext !== 'object') return null;
  const missionRaw = rawContext.mission && typeof rawContext.mission === 'object' ? rawContext.mission : null;
  const hardwareRaw = rawContext.hardware && typeof rawContext.hardware === 'object' ? rawContext.hardware : null;
  return {
    destination: cleanToken(rawContext.destination, undefined),
    mission: missionRaw ? { id: cleanToken(missionRaw.id, undefined) } : undefined,
    hardware: hardwareRaw ? { id: cleanToken(hardwareRaw.id, undefined) } : undefined,
  };
}

// Generate educational AI story grounded in NASA data
router.post('/story', async (req, res) => {
  try {
    const body = req.body || {};
    const destination = cleanToken(body.destination, 'Mars');
    const mission = cleanToken(body.mission, undefined);
    const hardware = cleanToken(body.hardware, undefined);
    const nasaData = await resolveNasaData(destination, mission, hardware);
    const story = await generateStory(nasaData);
    res.json({ status: "success", story, sourceAttribution: nasaData.sourceAttribution });
  } catch (error) {
    console.error("AI Story generation error:", error);
    res.status(500).json({
      error: "Failed to generate AI story",
      ...(process.env.NODE_ENV !== 'production' ? { details: error.message } : {}),
    });
  }
});

// Context-aware AI Chatbot response
router.post('/chat', async (req, res) => {
  try {
    const { message, contextData, apiKey } = req.body || {};
    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }
    const cleanMsg = message.trim().slice(0, 1200);
    const safeKey = typeof apiKey === 'string' ? apiKey.trim().slice(0, 128) : undefined;
    const response = await answerChat(cleanMsg, sanitizeContextData(contextData), safeKey);
    res.json({
      status: "success",
      reply: response.answer,
      source: response.source,
      ...(response.geminiErrorStatus ? { geminiErrorStatus: response.geminiErrorStatus } : {}),
    });
  } catch (error) {
    console.error("AI Chat error:", error);
    res.status(500).json({
      error: "Failed to get AI chat response",
      ...(process.env.NODE_ENV !== 'production' ? { details: error.message } : {}),
    });
  }
});

// Generate AI Science Quiz grounded in NASA data
router.post('/quiz', async (req, res) => {
  try {
    const body = req.body || {};
    const destination = cleanToken(body.destination, 'Mars');
    const mission = cleanToken(body.mission, undefined);
    const hardware = cleanToken(body.hardware, undefined);
    const rawSeed = Number(body.roundSeed);
    const roundSeed = Number.isFinite(rawSeed) ? Math.max(0, Math.min(10000, Math.floor(rawSeed))) : 0;
    const forceFresh = Boolean(body.forceFresh);

    const nasaData = await resolveNasaData(destination, mission, hardware);
    const quiz = await generateQuiz(nasaData, { roundSeed, forceFresh });
    res.json({ status: "success", quiz });
  } catch (error) {
    console.error("AI Quiz generation error:", error);
    res.status(500).json({
      error: "Failed to generate AI quiz",
      ...(process.env.NODE_ENV !== 'production' ? { details: error.message } : {}),
    });
  }
});

// ELON / Astra - AI Space Mission Guide Conversational Endpoint
router.post('/elon', async (req, res) => {
  try {
    const { message, visitorName, stage, contextData, apiKey } = req.body || {};
    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }
    const cleanMsg = message.trim().slice(0, 1200);
    const cleanName = typeof visitorName === 'string' ? visitorName.trim().slice(0, 48) : undefined;
    const cleanStage = typeof stage === 'string' ? stage.trim().slice(0, 32) : undefined;
    const safeKey = typeof apiKey === 'string' ? apiKey.trim().slice(0, 128) : undefined;
    const response = await answerElon(cleanMsg, cleanName, cleanStage, sanitizeContextData(contextData), safeKey);
    res.json({ status: "success", reply: response.reply, source: response.source });
  } catch (error) {
    console.error("ELON AI Error:", error);
    res.status(500).json({
      error: "Failed to query ELON AI",
      ...(process.env.NODE_ENV !== 'production' ? { details: error.message } : {}),
    });
  }
});

export default router;
