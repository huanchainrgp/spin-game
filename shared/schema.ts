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
