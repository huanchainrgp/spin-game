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
          className="grid grid-cols-3 gap-6 p-6 md:p-8 rounded-xl relative"
          style={{
            background: 'linear-gradient(180deg, #09210e 0%, #112919 100%)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.55), inset 0 8px 30px rgba(0,0,0,0.6)',
            borderRadius: '14px',
            padding: '28px'
          }}
        >
          {displayReels.map((middleSymbol, index) => (
            <div key={index} className="flex flex-col gap-4 items-center">
              {/* Top symbol */}
                <div className="relative">
                  <div
                    className="flex items-center justify-center rounded-md overflow-hidden"
                    style={{
                      width: 112,
                      height: 112,
                      padding: 8,
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))',
                      boxShadow: '0 8px 18px rgba(0,0,0,0.5), inset 0 2px 8px rgba(255,255,255,0.02)'
                    }}
                  >
                    <div
                      style={{
                        border: '6px solid #f5c400',
                        borderRadius: 8,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'white'
                      }}
                    >
                      <div className={`transition-all duration-200 ${animatingReels[index] ? 'animate-spin-reel blur-sm' : 'hover:scale-105'}`}>
                        <img
                          src={SYMBOL_IMAGES[topSymbols[index]]}
                          alt={topSymbols[index]}
                          className="w-16 h-16 md:w-20 md:h-20 object-contain transition-transform"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              {/* Middle symbol */}
              <div className="relative">
                <div
                  className="flex items-center justify-center rounded-md overflow-hidden"
                  style={{
                    width: 112,
                    height: 112,
                    padding: 8,
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))',
                    boxShadow: '0 8px 18px rgba(0,0,0,0.5), inset 0 2px 8px rgba(255,255,255,0.02)'
                  }}
                >
                  <div
                    style={{
                      border: '6px solid #f5c400',
                      borderRadius: 8,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'white'
                    }}
                  >
                    <div className={`transition-all duration-200 ${animatingReels[index] ? 'animate-spin-reel blur-sm' : 'hover:scale-105'}`}>
                      <img
                        src={SYMBOL_IMAGES[middleSymbol]}
                        alt={middleSymbol}
                        className="w-16 h-16 md:w-20 md:h-20 object-contain transition-transform"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom placeholder (empty framed slot) */}
              <div className="relative">
                <div
                  className="flex items-center justify-center rounded-md overflow-hidden"
                  style={{
                    width: 112,
                    height: 112,
                    padding: 8,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.02), rgba(255,255,255,0.01))',
                    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.2)'
                  }}
                >
                  <div style={{ border: '6px dashed rgba(245,196,0,0.24)', borderRadius: 8, width: '100%', height: '100%' }} />
                </div>
              </div>
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
        className="relative group min-h-16 px-12 text-2xl font-display tracking-wider transition-transform active:scale-95"
        style={{
          background: 'linear-gradient(180deg, #ffd54a, #f5c400)',
          color: '#222',
          borderRadius: 8,
          boxShadow: '0 18px 40px rgba(245,196,0,0.35), inset 0 2px 0 rgba(255,255,255,0.25)',
          border: '2px solid rgba(0,0,0,0.08)'
        }}
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
