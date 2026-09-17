import express from 'express';
import cors from 'cors';
import path from 'path';
import { promises as fs } from 'fs';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const VIEWS_FILE = path.join(process.cwd(), 'views-store.json');

// In-memory views cache for instant sub-millisecond response & consistency
let inMemoryViews: Record<string, Record<string, number>> | null = null;

// Keep track of connected SSE clients per project
const clients: Record<string, express.Response[]> = {};

// Helper to load views database from disk once or return cache
async function getOrLoadViews(): Promise<Record<string, Record<string, number>>> {
  if (inMemoryViews !== null) {
    return inMemoryViews;
  }
  try {
    const data = await fs.readFile(VIEWS_FILE, 'utf-8');
    inMemoryViews = JSON.parse(data);
  } catch (e) {
    inMemoryViews = {};
  }
  return inMemoryViews || {};
}

// Background debounced save to disk
let saveTimeout: NodeJS.Timeout | null = null;
function scheduleDiskSave() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    try {
      if (inMemoryViews) {
        await fs.writeFile(VIEWS_FILE, JSON.stringify(inMemoryViews, null, 2), 'utf-8');
      }
    } catch (e) {
      console.error('[Views Store] Error writing views-store.json:', e);
    }
  }, 300);
}

async function startServer() {
  const app = express();

  // Enable CORS so standalone exported catalogs can interact with this API from other origins
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
  }));

  app.use(express.json());

  // API Route: Sync/merge base product view counts for a project
  app.post('/api/views/sync/:projectId', async (req, res) => {
    try {
      const { projectId } = req.params;
      const clientViews = req.body?.views || {};
      const views = await getOrLoadViews();

      if (!views[projectId]) {
        views[projectId] = {};
      }

      let hasChanges = false;
      for (const [prodId, count] of Object.entries(clientViews)) {
        if (typeof count === 'number' && count > 0) {
          const current = views[projectId][prodId] || 0;
          if (count > current) {
            views[projectId][prodId] = count;
            hasChanges = true;
          }
        }
      }

      if (hasChanges) {
        scheduleDiskSave();
        // Broadcast update to all connected SSE clients
        if (clients[projectId] && clients[projectId].length > 0) {
          const dataStr = JSON.stringify(views[projectId]);
          clients[projectId].forEach(clientRes => {
            try {
              clientRes.write(`data: ${dataStr}\n\n`);
            } catch (err) {}
          });
        }
      }

      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.json(views[projectId] || {});
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Internal Server Error' });
    }
  });

  // API Route: Get all view counts for a specific project
  app.get('/api/views/:projectId', async (req, res) => {
    try {
      const { projectId } = req.params;
      const views = await getOrLoadViews();
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.json(views[projectId] || {});
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API Route: SSE Stream for real-time views updates
  app.get('/api/views/stream/:projectId', (req, res) => {
    const { projectId } = req.params;

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'X-Accel-Buffering': 'no'
    });

    // Send initial views immediately
    getOrLoadViews().then(views => {
      const projectViews = views[projectId] || {};
      res.write(`data: ${JSON.stringify(projectViews)}\n\n`);
    }).catch(err => {
      console.error('Error sending initial views stream:', err);
    });

    if (!clients[projectId]) {
      clients[projectId] = [];
    }
    clients[projectId].push(res);

    // Keepalive ping to prevent connection timeout
    const keepAlive = setInterval(() => {
      try {
        res.write(': keepalive\n\n');
      } catch (e) {}
    }, 10000);

    req.on('close', () => {
      clearInterval(keepAlive);
      if (clients[projectId]) {
        clients[projectId] = clients[projectId].filter(c => c !== res);
      }
    });
  });

  // API Route: Increment view count for a specific product in a project
  app.post('/api/views/:projectId/:productId', async (req, res) => {
    try {
      const { projectId, productId } = req.params;
      const baseViews = typeof req.body?.baseViews === 'number' ? req.body.baseViews : 0;
      const views = await getOrLoadViews();
      
      if (!views[projectId]) {
        views[projectId] = {};
      }
      
      const currentStored = views[projectId][productId] || 0;
      const effectiveBase = Math.max(currentStored, baseViews);
      views[projectId][productId] = effectiveBase + 1;
      
      const projectViews = views[projectId];
      
      // Schedule background disk persist
      scheduleDiskSave();

      // Immediately broadcast update to all connected SSE clients for this project
      if (clients[projectId] && clients[projectId].length > 0) {
        const dataStr = JSON.stringify(projectViews);
        clients[projectId].forEach(clientRes => {
          try {
            clientRes.write(`data: ${dataStr}\n\n`);
          } catch (err) {
            console.error('SSE broadcast error:', err);
          }
        });
      }

      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.json(projectViews);
    } catch (e: any) {
      console.error('Error in views increment POST:', e);
      res.status(500).json({ error: e.message || 'Internal Server Error' });
    }
  });

  // API Route: Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
  });

  // Vite server integration or static production serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
