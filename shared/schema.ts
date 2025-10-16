import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Assets table to store user balances
export const assets = pgTable("assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  balance: integer("balance").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow().notNull(),
});

export const insertAssetSchema = createInsertSchema(assets).pick({
  userId: true,
  balance: true,
});

export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type Asset = typeof assets.$inferSelect;

// Rewards model (admin-managed)
export const rewards = pgTable("rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // e.g., coin, gem, item
  value: integer("value").notNull().default(0),
  weight: integer("weight").notNull().default(1),
  color: varchar("color", { length: 32 }).notNull().default('#FFD700'),
  icon: varchar("icon", { length: 128 }).notNull().default('trophy'),
  active: integer("active").notNull().default(1),
});

export const insertRewardSchema = createInsertSchema(rewards).pick({
  name: true,
  type: true,
  value: true,
  weight: true,
  color: true,
  icon: true,
});

export type InsertReward = z.infer<typeof insertRewardSchema>;
export type Reward = typeof rewards.$inferSelect;

// Admin-only runtime models (kept in memory for now)
export interface SpinConfig {
  id: string;
  maxDailySpins: number;
  cooldownSeconds: number;
  provablyFairEnabled: boolean;
}

export interface EventItem {
  id: string;
  name: string;
  type: string; // e.g., seasonal, campaign
  startDate: number; // epoch ms
  endDate: number; // epoch ms
  rewardMultiplier: number;
  active: boolean;
}

export interface TransactionLog {
  id: string;
  userId?: string;
  source: string; // spin | bonus | admin | system
  amount: number; // coins delta (+/-)
  createdAt: number;
  metadata?: Record<string, any>;
}

export interface Role {
  id: string;
  name: 'super_admin' | 'game_manager' | 'analyst' | 'support' | 'developer';
  permissions: string[]; // simple string permissions for now
}

// Slot machine game types
export type SlotSymbol = 'cherry' | 'diamond' | 'bell' | 'seven' | 'bar';

export interface Player {
  id: string;
  name: string;
  balance: number;
  totalWinnings: number;
  avatar: string;
}

export interface SpinResult {
  playerId: string;
  playerName: string;
  reels: [SlotSymbol, SlotSymbol, SlotSymbol];
  betAmount: number;
  winAmount: number;
  timestamp: number;
}

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  totalWinnings: number;
  avatar: string;
}

export interface GameState {
  players: Map<string, Player>;
  recentSpins: SpinResult[];
  leaderboard: LeaderboardEntry[];
}

// WebSocket message types
export interface WSMessage {
  type: 'join' | 'spin' | 'update_leaderboard' | 'player_spin' | 'player_joined' | 'player_left' | 'game_state';
  data?: any;
}

export interface JoinMessage {
  type: 'join';
  data: {
    playerName: string;
  };
}

export interface SpinMessage {
  type: 'spin';
  data: {
    betAmount: number;
  };
}

export interface PlayerSpinMessage {
  type: 'player_spin';
  data: SpinResult;
}

export interface UpdateLeaderboardMessage {
  type: 'update_leaderboard';
  data: LeaderboardEntry[];
}

export interface GameStateMessage {
  type: 'game_state';
  data: {
    player: Player;
    leaderboard: LeaderboardEntry[];
    recentSpins: SpinResult[];
    playerCount: number;
  };
}

// Payout table (multipliers)
export const PAYOUTS: Record<string, number> = {
  'seven-seven-seven': 100,
  'diamond-diamond-diamond': 50,
  'bell-bell-bell': 25,
  'bar-bar-bar': 10,
  'cherry-cherry-cherry': 5,
  'seven-seven': 10,
  'diamond-diamond': 5,
  'bell-bell': 3,
  'bar-bar': 2,
  'cherry-cherry': 2,
  'cherry': 1,
};

// Symbol weights for random selection (higher = more common)
export const SYMBOL_WEIGHTS: Record<SlotSymbol, number> = {
  cherry: 40,
  bar: 30,
  bell: 15,
  diamond: 10,
  seven: 5,
};
