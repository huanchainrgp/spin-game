import { type User, type InsertUser, type Player, type SpinResult, type LeaderboardEntry } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getPlayer(id: string): Player | undefined;
  createPlayer(name: string): Player;
  updatePlayer(player: Player): void;
  getAllPlayers(): Player[];
  removePlayer(id: string): void;
  
  addSpinResult(spin: SpinResult): void;
  getRecentSpins(limit: number): SpinResult[];
  
  getLeaderboard(): LeaderboardEntry[];
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private players: Map<string, Player>;
  private spinHistory: SpinResult[];

  constructor() {
    this.users = new Map();
    this.players = new Map();
    this.spinHistory = [];
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  getPlayer(id: string): Player | undefined {
    return this.players.get(id);
  }

  createPlayer(name: string): Player {
    const id = randomUUID();
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
    const player: Player = {
      id,
      name,
      balance: 1000,
      totalWinnings: 0,
      avatar: colors[Math.floor(Math.random() * colors.length)],
    };
    this.players.set(id, player);
    return player;
  }

  updatePlayer(player: Player): void {
    this.players.set(player.id, player);
  }

  getAllPlayers(): Player[] {
    return Array.from(this.players.values());
  }

  removePlayer(id: string): void {
    this.players.delete(id);
  }

  addSpinResult(spin: SpinResult): void {
    this.spinHistory.unshift(spin);
    if (this.spinHistory.length > 100) {
      this.spinHistory = this.spinHistory.slice(0, 100);
    }
  }

  getRecentSpins(limit: number = 20): SpinResult[] {
    return this.spinHistory.slice(0, limit);
  }

  getLeaderboard(): LeaderboardEntry[] {
    const players = this.getAllPlayers();
    return players
      .map(p => ({
        playerId: p.id,
        playerName: p.name,
        totalWinnings: p.totalWinnings,
        avatar: p.avatar,
      }))
      .sort((a, b) => b.totalWinnings - a.totalWinnings);
  }
}

export const storage = new MemStorage();
