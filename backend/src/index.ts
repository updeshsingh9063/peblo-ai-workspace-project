// src/index.ts — Peblo AI Notes Workspace — Express.js Backend Server
// MongoDB via Prisma | JWT Auth | Groq AI | REST API

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth';
import notesRoutes from './routes/notes';
import sharedRoutes from './routes/shared';
import insightsRoutes from './routes/insights';
import tagsRoutes from './routes/tags';

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Request logging (dev only) ──────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ─── Routes ──────────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.send('<h1>Peblo AI Notes API</h1><p>The backend is running perfectly. Use <code>/api/health</code> for diagnostic status.</p>');
});

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      service: 'Peblo AI Notes Workspace API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/shared', sharedRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/tags', tagsRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
    code: 'ROUTE_NOT_FOUND',
  });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║   Peblo AI Notes — Backend API Server        ║
║   Running on http://localhost:${PORT}           ║
║   Environment: ${process.env.NODE_ENV || 'development'}               ║
╚══════════════════════════════════════════════╝
  `);
});

export default app;
