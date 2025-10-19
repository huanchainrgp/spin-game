import { Coins } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface BalanceDisplayProps {
  balance: number;
  totalWinnings: number;
  className?: string;
}

export function BalanceDisplay({ balance, totalWinnings, className = '' }: BalanceDisplayProps) {
  return (
    <Card className={`p-4 md:p-6 ${className} glass`}> 
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            <Coins className="w-4 h-4" />
            Balance
          </div>
          <div 
            className="text-4xl md:text-5xl font-display font-bold text-gold animate-pulse-gold"
            data-testid="text-balance"
          >
            {balance.toLocaleString()}
          </div>
        </div>

        <div className="pt-3 md:pt-4 border-t border-border">
          <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Total Winnings
          </div>
          <div 
            className="text-xl md:text-2xl font-display font-semibold text-primary"
            data-testid="text-total-winnings"
          >
            {totalWinnings.toLocaleString()}
          </div>
        </div>
      </div>
    </Card>
  );
}
