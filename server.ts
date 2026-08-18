import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import authRouter from './server/routes/authRoutes';
import tripRouter from './server/routes/tripRoutes';
import placeRouter from './server/routes/placeRoutes';
import aiChatRouter from './server/routes/aiChatRoutes';
import analyticsRouter from './server/routes/analyticsRoutes';
import adminRouter from './server/routes/adminRoutes';
import communityRouter from './server/routes/communityRoutes';
import fileRouter from './server/routes/fileRoutes';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // JSON and urlencoded body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // API Health Check (used by Cloud Run and load balancers)
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'AI Trip Planner API',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API routes
  app.use('/api/auth', authRouter);
  app.use('/api/community', communityRouter);
  app.use('/api', fileRouter);
  app.use('/api', adminRouter);
  app.use('/api', tripRouter);
  app.use('/api', placeRouter);
  app.use('/api', aiChatRouter);
  app.use('/api', analyticsRouter);

  // Vite middleware for development & Static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Trip Planner server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
