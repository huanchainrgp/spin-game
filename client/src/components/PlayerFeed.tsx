import { SpinResult } from '@shared/schema';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, TrendingDown } from 'lucide-react';

interface PlayerFeedProps {
  recentSpins: SpinResult[];
  className?: string;
}

export function PlayerFeed({ recentSpins, className = '' }: PlayerFeedProps) {
  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        <h3 className="text-lg font-display font-bold uppercase tracking-wide">
          Live Feed
        </h3>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {recentSpins.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent spins yet
            </div>
          ) : (
            recentSpins.map((spin, index) => (
              <div
                key={`${spin.playerId}-${spin.timestamp}-${index}`}
                className={`flex items-center gap-3 p-3 rounded-md animate-slide-up transition-colors ${
                  spin.winAmount > 0 
                    ? 'bg-gold/10 border border-gold/20' 
                    : 'bg-card hover-elevate'
                }`}
                data-testid={`feed-item-${index}`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
                    {spin.playerName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate" data-testid={`feed-player-${index}`}>
                    {spin.playerName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Bet: {spin.betAmount}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {spin.winAmount > 0 ? (
                    <>
                      <Trophy className="w-4 h-4 text-gold" />
                      <span className="text-sm font-bold text-gold" data-testid={`feed-win-${index}`}>
                        +{spin.winAmount}
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Loss
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
