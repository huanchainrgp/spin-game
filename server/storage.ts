import { type User, type InsertUser, type Player, type SpinResult, type LeaderboardEntry, type Asset, type Reward, type InsertReward } from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from 'bcryptjs';

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAssetByUserId(userId: string): Promise<Asset | undefined>;
  setAssetBalance(userId: string, balance: number): Promise<Asset>;
  adjustAssetBalance(userId: string, delta: number): Promise<Asset>;
  // Rewards
  listRewards(): Promise<Reward[]>;
  createReward(input: InsertReward): Promise<Reward>;
  updateReward(id: string, input: Partial<InsertReward>): Promise<Reward | undefined>;
  deleteReward(id: string): Promise<boolean>;
  
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
  private assets: Map<string, Asset>;
  private players: Map<string, Player>;
  private spinHistory: SpinResult[];
  private rewards: Map<string, Reward>;

  constructor() {
    this.users = new Map();
    this.assets = new Map();
    this.players = new Map();
    this.spinHistory = [];
    this.rewards = new Map();
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
    const hashed = await bcrypt.hash(insertUser.password, 10);
    const user: User = { ...insertUser, password: hashed, id };
    this.users.set(id, user);
    // Initialize asset with starting balance
    const asset: Asset = { id: randomUUID(), userId: id, balance: 1000, updatedAt: new Date() };
    this.assets.set(id, asset);
    return user;
  }

  async getAssetByUserId(userId: string): Promise<Asset | undefined> {
    return this.assets.get(userId);
  }

  async setAssetBalance(userId: string, balance: number): Promise<Asset> {
    const existing = this.assets.get(userId);
    const updated: Asset = existing
      ? { ...existing, balance, updatedAt: new Date() }
      : { id: randomUUID(), userId, balance, updatedAt: new Date() };
    this.assets.set(userId, updated);
    return updated;
  }

  async adjustAssetBalance(userId: string, delta: number): Promise<Asset> {
    const existing = this.assets.get(userId);
    const currentBalance = existing?.balance ?? 0;
    return this.setAssetBalance(userId, currentBalance + delta);
  }

  // Rewards CRUD
  async listRewards(): Promise<Reward[]> {
    return Array.from(this.rewards.values());
  }

  async createReward(input: InsertReward): Promise<Reward> {
    const id = randomUUID();
    const reward: Reward = {
      id,
      name: input.name,
      type: input.type,
      value: input.value ?? 0,
      weight: input.weight ?? 1,
      color: input.color ?? '#FFD700',
      icon: input.icon ?? 'trophy',
      active: 1,
    } as Reward;
    this.rewards.set(id, reward);
    return reward;
  }

  async updateReward(id: string, input: Partial<InsertReward>): Promise<Reward | undefined> {
    const existing = this.rewards.get(id);
    if (!existing) return undefined;
    const updated: Reward = { ...existing, ...input } as Reward;
    this.rewards.set(id, updated);
    return updated;
  }

  async deleteReward(id: string): Promise<boolean> {
    return this.rewards.delete(id);
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
