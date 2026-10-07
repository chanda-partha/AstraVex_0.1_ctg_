import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import nasaRoutes from './routes/nasa.js';
import aiRoutes from './routes/ai.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: "ok",
    app: "NASA Mission Explorer Backend API",
    timestamp: new Date().toISOString(),
    nasaApis: "Online",
    aiEngine: "Ready"
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
  // SPA Client-Side Fallback: Serve index.html for all non-API routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(staticDir, 'index.html'));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  res.status(500).json({ error: "Internal Server Error", message: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 NASA Mission Explorer Server running on port ${PORT}`);
  console.log(`📡 API Endpoints: http://localhost:${PORT}/api/nasa/resolve | http://localhost:${PORT}/api/ai/story`);
  if (staticDir) {
    console.log(`📦 Serving Production Frontend from: ${staticDir}`);
  }
});

export default app;
