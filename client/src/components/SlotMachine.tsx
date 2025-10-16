import { useState, useEffect } from 'react';
import { SlotSymbol } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import cherryImg from '@assets/generated_images/Cherry_slot_symbol_33c2dc22.png';
import diamondImg from '@assets/generated_images/Diamond_slot_symbol_ba16f21a.png';
import bellImg from '@assets/generated_images/Bell_slot_symbol_a8652b49.png';
import sevenImg from '@assets/generated_images/Seven_slot_symbol_d0b993fb.png';
import barImg from '@assets/generated_images/BAR_slot_symbol_31606bdd.png';

const SYMBOL_IMAGES: Record<SlotSymbol, string> = {
  cherry: cherryImg,
  diamond: diamondImg,
  bell: bellImg,
  seven: sevenImg,
  bar: barImg,
};

interface SlotMachineProps {
  reels: [SlotSymbol, SlotSymbol, SlotSymbol];
  isSpinning: boolean;
  onSpin: () => void;
  disabled: boolean;
  winAmount?: number;
}

export function SlotMachine({ reels, isSpinning, onSpin, disabled, winAmount }: SlotMachineProps) {
  const [displayReels, setDisplayReels] = useState(reels);
  const [animatingReels, setAnimatingReels] = useState<boolean[]>([false, false, false]);
  const [topSymbols, setTopSymbols] = useState<[SlotSymbol, SlotSymbol, SlotSymbol]>(['bar', 'cherry', 'bell']);
  const [bottomSymbols, setBottomSymbols] = useState<[SlotSymbol, SlotSymbol, SlotSymbol]>(['diamond', 'seven', 'bar']);

  function getRandomSymbol(): SlotSymbol {
    const keys = Object.keys(SYMBOL_IMAGES) as SlotSymbol[];
    return keys[Math.floor(Math.random() * keys.length)];
  }

  useEffect(() => {
    if (isSpinning) {
      setAnimatingReels([true, true, true]);
      // refresh filler symbols for top/bottom rows to create visual variety
      setTopSymbols([getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]);
      setBottomSymbols([getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]);
      
      const stopTimes = [600, 800, 1000];
      stopTimes.forEach((time, index) => {
        setTimeout(() => {
          setAnimatingReels(prev => {
            const next = [...prev];
            next[index] = false;
            return next;
          });
        }, time);
      });

      setTimeout(() => {
        setDisplayReels(reels);
      }, 1100);
    } else {
      setDisplayReels(reels);
    }
  }, [isSpinning, reels]);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative">
        <div 
          className="grid grid-cols-3 gap-4 p-8 rounded-lg relative"
          style={{
            background: 'linear-gradient(135deg, hsl(140 30% 10%) 0%, hsl(140 35% 15%) 100%)',
            boxShadow: 'inset 0 2px 20px rgba(0,0,0,0.5), 0 10px 40px rgba(0,0,0,0.3)',
          }}
        >
          {displayReels.map((middleSymbol, index) => (
            <div key={index} className="flex flex-col gap-4">
              {[topSymbols[index], middleSymbol, bottomSymbols[index]].map((symbol, rowIdx) => (
                <div
                  key={rowIdx}
                  className="relative w-32 h-32 flex items-center justify-center rounded-md overflow-hidden"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.2) 100%)',
                    border: '3px solid hsl(45 95% 55%)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4), inset 0 2px 10px rgba(255,215,0,0.2)',
                  }}
                >
                  <div className={`transition-all duration-200 ${animatingReels[index] ? 'animate-spin-reel blur-sm' : ''}`}>
                    <img 
                      src={SYMBOL_IMAGES[symbol]} 
                      alt={symbol} 
                      className="w-24 h-24 object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {winAmount !== undefined && winAmount > 0 && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="text-6xl font-display font-bold text-gold animate-pulse-gold drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]">
              +{winAmount}
            </div>
          </div>
        )}
      </div>

      <Button
        size="lg"
        onClick={onSpin}
        disabled={disabled || isSpinning}
        className="relative group min-h-16 px-12 text-2xl font-display tracking-wider bg-gold hover:bg-gold text-gold-foreground border-2 border-gold-border shadow-[0_0_30px_rgba(251,191,36,0.4)] transition-all hover:shadow-[0_0_50px_rgba(251,191,36,0.6)] active:scale-95"
        data-testid="button-spin"
      >
        <span className="flex items-center gap-3">
          SPIN
          <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </span>
      </Button>
    </div>
  );
}
