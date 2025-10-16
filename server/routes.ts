import type { Express } from "express";
import { insertUserSchema, insertRewardSchema } from "@shared/schema";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { spinReels, calculateWinAmount } from "./game-logic";

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple admin guard: username === 'admin'
  function requireAdmin(req: any, res: any, next: any) {
    const userId = req.session?.userId as string | undefined;
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });
    storage.getUser(userId).then((user) => {
      if (!user || user.username !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
      }
      next();
    }).catch(() => res.status(500).json({ message: 'Auth check failed' }));
  }

  // Admin overview
  app.get('/api/admin/overview', requireAdmin, async (_req, res) => {
    try {
      const players = storage.getAllPlayers();
      const recentSpins = storage.getRecentSpins(20);
      const totalPlayers = players.length;
      const totalSpins = recentSpins.length; // recent count; if global needed, track separately
      const totalWinnings = players.reduce((sum, p) => sum + p.totalWinnings, 0);
      return res.json({
        metrics: {
          totalPlayers,
          totalSpins,
          totalWinnings,
        },
        players,
        recentSpins,
      });
    } catch (e) {
      return res.status(500).json({ message: 'Failed to load admin overview' });
    }
  });

  // Admin Rewards CRUD
  app.get('/api/admin/rewards', requireAdmin, async (_req, res) => {
    const rewards = await storage.listRewards();
    return res.json(rewards);
  });

  app.post('/api/admin/rewards', requireAdmin, async (req, res) => {
    const parse = insertRewardSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ message: 'Invalid payload' });
    const created = await storage.createReward(parse.data);
    return res.json(created);
  });

  app.put('/api/admin/rewards/:id', requireAdmin, async (req, res) => {
    const id = req.params.id;
    const updated = await storage.updateReward(id, req.body || {});
    if (!updated) return res.status(404).json({ message: 'Not found' });
    return res.json(updated);
  });

  app.delete('/api/admin/rewards/:id', requireAdmin, async (req, res) => {
    const id = req.params.id;
    const ok = await storage.deleteReward(id);
    return res.json({ ok });
  });

  // Auth endpoints
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const parse = insertUserSchema.safeParse(req.body);
      if (!parse.success) {
        return res.status(400).json({ message: 'Invalid payload' });
      }

      const { username, password } = parse.data;
      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(409).json({ message: 'Username already exists' });
      }

      const user = await storage.createUser({ username, password });
      const asset = await storage.getAssetByUserId(user.id);
      (req as any).session.userId = user.id;
      return res.json({ user: { id: user.id, username: user.username }, balance: asset?.balance ?? 0 });
    } catch (err) {
      return res.status(500).json({ message: 'Signup failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body || {};
      if (!username || !password) {
        return res.status(400).json({ message: 'Missing username or password' });
      }
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      (req as any).session.userId = user.id;
      const asset = await storage.getAssetByUserId(user.id);
      return res.json({ user: { id: user.id, username: user.username }, balance: asset?.balance ?? 0 });
    } catch (err) {
      return res.status(500).json({ message: 'Login failed' });
    }
  });

  app.get('/api/auth/me', async (req, res) => {
    try {
      const userId = (req as any).session?.userId as string | undefined;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      const asset = await storage.getAssetByUserId(user.id);
      return res.json({ user: { id: user.id, username: user.username }, balance: asset?.balance ?? 0 });
    } catch (err) {
      return res.status(500).json({ message: 'Failed to load session' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    try {
      const sess = (req as any).session;
      if (sess) {
        sess.destroy(() => {});
      }
      return res.json({ ok: true });
    } catch {
      return res.json({ ok: true });
    }
  });

  const httpServer = createServer(app);
  
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Map<WebSocket, string>();

  function broadcast(message: any, exclude?: WebSocket) {
    const messageStr = JSON.stringify(message);
    clients.forEach((playerId, client) => {
      if (client !== exclude && client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  function sendToClient(client: WebSocket, message: any) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  wss.on('connection', (ws) => {
    let playerId: string | null = null;

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case 'join': {
            const player = storage.createPlayer(message.data.playerName);
            playerId = player.id;
            clients.set(ws, playerId);

            sendToClient(ws, {
              type: 'game_state',
              data: {
                player,
                leaderboard: storage.getLeaderboard(),
                recentSpins: storage.getRecentSpins(20),
                playerCount: clients.size,
              },
            });

            broadcast({
              type: 'player_count',
              data: { count: clients.size },
            }, ws);
            break;
          }

          case 'spin': {
            if (!playerId) return;

            const player = storage.getPlayer(playerId);
            if (!player) return;

            const betAmount = message.data.betAmount;
            if (betAmount > player.balance || betAmount < 1) return;

            const reels = spinReels();
            const winAmount = calculateWinAmount(reels, betAmount);

            player.balance -= betAmount;
            player.balance += winAmount;
            
            if (winAmount > 0) {
              player.totalWinnings += winAmount;
            }

            storage.updatePlayer(player);

            const spinResult = {
              playerId: player.id,
              playerName: player.name,
              reels,
              betAmount,
              winAmount,
              timestamp: Date.now(),
            };

            storage.addSpinResult(spinResult);

            sendToClient(ws, {
              type: 'spin_result',
              data: {
                reels,
                winAmount,
                player,
                betAmount,
              },
            });

            broadcast({
              type: 'player_spin',
              data: spinResult,
            }, ws);

            const leaderboard = storage.getLeaderboard();
            broadcast({
              type: 'update_leaderboard',
              data: leaderboard,
            });

            sendToClient(ws, {
              type: 'update_leaderboard',
              data: leaderboard,
            });
            break;
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (playerId) {
        storage.removePlayer(playerId);
        clients.delete(ws);
        
        broadcast({
          type: 'player_count',
          data: { count: clients.size },
        });

        const leaderboard = storage.getLeaderboard();
        broadcast({
          type: 'update_leaderboard',
          data: leaderboard,
        });
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return httpServer;
}
