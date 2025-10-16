import { LeaderboardEntry } from '@shared/schema';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Crown, Medal, Trophy } from 'lucide-react';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentPlayerId?: string;
  className?: string;
}

const RANK_ICONS = {
  1: <Crown className="w-5 h-5 text-gold" />,
  2: <Medal className="w-5 h-5 text-gray-400" />,
  3: <Trophy className="w-5 h-5 text-amber-700" />,
};

export function Leaderboard({ entries, currentPlayerId, className = '' }: LeaderboardProps) {
  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        <h3 className="text-lg font-display font-bold uppercase tracking-wide">
          Leaderboard
        </h3>

        <div className="space-y-2">
          {entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No players yet
            </div>
          ) : (
            entries.slice(0, 10).map((entry, index) => {
              const rank = index + 1;
              const isCurrentPlayer = entry.playerId === currentPlayerId;

              return (
                <div
                  key={entry.playerId}
                  className={`flex items-center gap-3 p-3 rounded-md transition-colors ${
                    isCurrentPlayer 
                      ? 'bg-primary/20 border border-primary/40' 
                      : 'bg-card hover-elevate'
                  }`}
                  data-testid={`leaderboard-item-${index}`}
                >
                  <div className="w-8 flex items-center justify-center">
                    {rank <= 3 ? (
                      RANK_ICONS[rank as keyof typeof RANK_ICONS]
                    ) : (
                      <span className="text-lg font-display font-bold text-muted-foreground">
                        {rank}
                      </span>
                    )}
                  </div>

                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
                      {entry.playerName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold truncate ${isCurrentPlayer ? 'text-primary-foreground' : ''}`} data-testid={`leaderboard-name-${index}`}>
                      {entry.playerName}
                      {isCurrentPlayer && ' (You)'}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-gold" data-testid={`leaderboard-winnings-${index}`}>
                      {entry.totalWinnings.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      coins
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
}
