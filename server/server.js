import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import nasaRoutes from './routes/nasa.js';
import aiRoutes from './routes/ai.js';
import { VERIFIED_NASA_MISSIONS } from './services/nasaRegistry.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const startedAtMs = Date.now();
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const configuredOrigins = (process.env.CORS_ALLOWED_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (configuredOrigins.includes(origin)) return true;
  if (!IS_PRODUCTION && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
    return true;
  }
  return false;
}

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Origin not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600,
  })
);
app.use(express.json({ limit: '64kb' }));

// Security response headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Health & Engineering Diagnostics endpoint
app.get('/api/health', (req, res) => {
  const memMb = Math.round(process.memoryUsage().rss / (1024 * 1024));
  const hasGeminiKey = Boolean((process.env.GEMINI_API_KEY || '').trim().length > 15);
  const nasaKey = (process.env.NASA_API_KEY || 'DEMO_KEY').trim();
  res.json({
    status: "ok",
    app: "AstraVex NASA Mission Explorer API",
    timestamp: new Date().toISOString(),
    uptimeSec: Math.floor((Date.now() - startedAtMs) / 1000),
    memoryRssMb: memMb,
    datasetCount: VERIFIED_NASA_MISSIONS.length,
    nasaKeyMode: nasaKey === 'DEMO_KEY' ? 'DEMO_KEY' : 'CONFIGURED',
    hasGeminiKey,
    nasaApis: "Online",
    aiEngine: hasGeminiKey ? "Gemini Live + Deterministic Fallback" : "Deterministic Grounded Engine",
  });
});

// API Routes
app.use('/api/nasa', nasaRoutes);
app.use('/api/ai', aiRoutes);

// Unified Production Mode: Serve client production bundle if present
const clientDistPath = path.resolve(__dirname, '../client/dist');
const productionStaticPath = path.resolve(__dirname, '../production');

const staticDir = fs.existsSync(clientDistPath)
  ? clientDistPath
  : fs.existsSync(productionStaticPath)
    ? productionStaticPath
    : null;

if (staticDir) {
  app.use(express.static(staticDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(staticDir, 'index.html'));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: "Payload too large" });
  }
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: "Malformed JSON payload" });
  }
  console.error("Unhandled Server Error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    ...(!IS_PRODUCTION ? { message: err.message } : {}),
  });
});

if (process.env.ASTRAVEX_TEST_NO_LISTEN !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 AstraVex NASA Mission Explorer Server running on port ${PORT}`);
    console.log(`📡 API Endpoints: http://localhost:${PORT}/api/nasa/resolve | http://localhost:${PORT}/api/ai/story`);
    if (staticDir) {
      console.log(`📦 Serving Production Frontend from: ${staticDir}`);
    }
  });
}

export default app;
