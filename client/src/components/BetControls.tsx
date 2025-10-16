import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

interface BetControlsProps {
  betAmount: number;
  onBetChange: (amount: number) => void;
  minBet: number;
  maxBet: number;
  disabled?: boolean;
}

const QUICK_BETS = [1, 5, 10, 25, 50, 100];

export function BetControls({ betAmount, onBetChange, minBet, maxBet, disabled }: BetControlsProps) {
  const increment = () => {
    if (betAmount < maxBet) {
      onBetChange(Math.min(betAmount + 1, maxBet));
    }
  };

  const decrement = () => {
    if (betAmount > minBet) {
      onBetChange(Math.max(betAmount - 1, minBet));
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Bet Amount
        </label>
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="outline"
            onClick={decrement}
            disabled={disabled || betAmount <= minBet}
            className="h-12 w-12 border-2"
            data-testid="button-decrease-bet"
          >
            <Minus className="w-5 h-5" />
          </Button>
          
          <div 
            className="flex-1 h-16 flex items-center justify-center rounded-md border-2 border-gold bg-card"
            data-testid="text-bet-amount"
          >
            <span className="text-4xl font-display font-bold text-gold">
              {betAmount}
            </span>
          </div>
          
          <Button
            size="icon"
            variant="outline"
            onClick={increment}
            disabled={disabled || betAmount >= maxBet}
            className="h-12 w-12 border-2"
            data-testid="button-increase-bet"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Quick Bets
        </label>
        <div className="grid grid-cols-3 gap-2">
          {QUICK_BETS.map((amount) => (
            <Button
              key={amount}
              variant={betAmount === amount ? 'default' : 'outline'}
              size="sm"
              onClick={() => onBetChange(amount)}
              disabled={disabled || amount > maxBet}
              className="font-semibold"
              data-testid={`button-quick-bet-${amount}`}
            >
              {amount}
            </Button>
          ))}
        </div>
      </div>

      <Button
        variant="secondary"
        className="w-full font-semibold"
        onClick={() => onBetChange(maxBet)}
        disabled={disabled || betAmount === maxBet}
        data-testid="button-max-bet"
      >
        MAX BET ({maxBet})
      </Button>
    </div>
  );
}
