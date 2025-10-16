import { Users, Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GameStatusProps {
  playerCount: number;
  isConnected: boolean;
  className?: string;
}

export function GameStatus({ playerCount, isConnected, className = '' }: GameStatusProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <Badge 
        variant={isConnected ? 'default' : 'destructive'} 
        className="px-3 py-1 text-sm font-semibold"
        data-testid="badge-connection-status"
      >
        {isConnected ? (
          <>
            <Wifi className="w-4 h-4 mr-2" />
            Connected
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 mr-2" />
            Disconnected
          </>
        )}
      </Badge>

      <Badge 
        variant="secondary" 
        className="px-3 py-1 text-sm font-semibold"
        data-testid="badge-player-count"
      >
        <Users className="w-4 h-4 mr-2" />
        {playerCount} Players Online
      </Badge>
    </div>
  );
}
