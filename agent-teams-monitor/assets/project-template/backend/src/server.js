import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import routes from './routes.js';
import { FileWatcher } from './file-watcher.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json());

// REST API routes
app.use('/api', routes);

// Serve frontend static build in production
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

// SSE endpoint for clients that prefer Server-Sent Events
const sseClients = new Set();

app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  res.write('data: {"type":"connected"}\n\n');
  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

function broadcastSSE(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    client.write(payload);
  }
}

// SPA fallback: serve index.html for non-API routes (production)
app.get('{*path}', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Not found');
    }
  });
});

// Create HTTP server
const server = http.createServer(app);

// WebSocket server for real-time updates
const wss = new WebSocketServer({ server, path: '/ws' });

// Track per-client channel subscriptions
const clientSubscriptions = new WeakMap();

wss.on('connection', (ws) => {
  // By default subscribe to everything (empty set = all channels)
  clientSubscriptions.set(ws, new Set());

  ws.send(JSON.stringify({ type: 'connected', timestamp: Date.now() }));

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());

      if (msg.type === 'subscribe' && Array.isArray(msg.channels)) {
        const subs = clientSubscriptions.get(ws);
        for (const ch of msg.channels) {
          subs.add(ch);
        }
        ws.send(JSON.stringify({ type: 'subscribed', channels: [...subs] }));

        // Auto-watch debug sessions when subscribing to debug channels
        for (const ch of msg.channels) {
          if (ch.startsWith('debug:')) {
            const sessionId = ch.slice('debug:'.length);
            if (sessionId) watcher.watchDebugSession(sessionId);
          }
        }
      }

      if (msg.type === 'unsubscribe' && Array.isArray(msg.channels)) {
        const subs = clientSubscriptions.get(ws);
        for (const ch of msg.channels) {
          subs.delete(ch);
        }
        ws.send(JSON.stringify({ type: 'unsubscribed', channels: msg.channels }));
      }

      // Legacy support for direct debug session watching
      if (msg.type === 'watch_debug' && msg.sessionId) {
        watcher.watchDebugSession(msg.sessionId);
        const subs = clientSubscriptions.get(ws);
        subs.add(`debug:${msg.sessionId}`);
        ws.send(JSON.stringify({ type: 'watching_debug', sessionId: msg.sessionId }));
      }

      if (msg.type === 'unwatch_debug' && msg.sessionId) {
        watcher.unwatchDebugSession(msg.sessionId);
        const subs = clientSubscriptions.get(ws);
        subs.delete(`debug:${msg.sessionId}`);
      }
    } catch {
      // Ignore malformed messages
    }
  });

  ws.on('error', () => {
    // Ignore client errors
  });

  ws.on('close', () => {
    clientSubscriptions.delete(ws);
  });
});

/**
 * Send a WS message to clients that are subscribed to the relevant channel.
 * Clients with empty subscription set receive everything (broadcast mode).
 */
function broadcastWS(type, data, channels) {
  const message = JSON.stringify({ type, data, timestamp: Date.now() });
  for (const client of wss.clients) {
    if (client.readyState !== 1) continue;

    const subs = clientSubscriptions.get(client);
    // Empty subscriptions = receive all, otherwise check channel match
    if (!subs || subs.size === 0 || channels.some((ch) => subs.has(ch))) {
      client.send(message);
    }
  }
}

function broadcast(eventType, data, channels) {
  broadcastWS(eventType, data, channels);
  broadcastSSE(eventType, data);
}

// File watcher for real-time updates
const watcher = new FileWatcher();

watcher.on('team:config', (payload) => {
  const channels = [`team:${payload.teamName}`];
  broadcast('team:config', payload, channels);
  broadcast('team:updated', payload, channels);
});

watcher.on('team:inbox', (payload) => {
  const channels = [`team:${payload.teamName}`, `messages:${payload.teamName}`];
  broadcast('team:inbox', payload, channels);
  broadcast('message:new', payload, channels);
});

watcher.on('task:update', (payload) => {
  const channels = [`team:${payload.teamName}`, `tasks:${payload.teamName}`];
  broadcast('task:update', payload, channels);
  broadcast('task:updated', payload, channels);
});

watcher.on('debug:update', (payload) => {
  const channels = [`debug:${payload.sessionId}`];
  broadcast('debug:update', payload, channels);
  for (const line of payload.lines) {
    broadcast('debug:line', { sessionId: payload.sessionId, line }, channels);
  }
});

watcher.on('error', (payload) => {
  console.error('[FileWatcher]', payload.message, payload.error);
});

// Start everything
watcher.start();

server.listen(PORT, () => {
  console.log(`Agent Log Monitor backend running on http://localhost:${PORT}`);
  console.log(`  REST API:   http://localhost:${PORT}/api`);
  console.log(`  WebSocket:  ws://localhost:${PORT}/ws`);
  console.log(`  SSE:        http://localhost:${PORT}/api/events`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  watcher.stop();
  wss.close();
  server.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  watcher.stop();
  wss.close();
  server.close();
  process.exit(0);
});
