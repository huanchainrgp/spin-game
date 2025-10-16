import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { spinReels, calculateWinAmount } from "./game-logic";

export async function registerRoutes(app: Express): Promise<Server> {
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
