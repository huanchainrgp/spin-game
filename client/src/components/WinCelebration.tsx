import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WinCelebrationProps {
  winAmount: number;
  onComplete: () => void;
}

export function WinCelebration({ winAmount, onComplete }: WinCelebrationProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number }>>([]);

  useEffect(() => {
    const items = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.3,
    }));
    setConfetti(items);

    const timer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 pointer-events-none"
        data-testid="win-celebration"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: 'spring', damping: 15 }}
          className="text-center"
        >
          <div className="text-8xl font-display font-bold text-gold drop-shadow-[0_0_40px_rgba(251,191,36,1)]">
            BIG WIN!
          </div>
          <div className="text-6xl font-display font-bold text-gold mt-4 drop-shadow-[0_0_30px_rgba(251,191,36,0.8)]">
            +{winAmount}
          </div>
        </motion.div>

        {confetti.map((item) => (
          <div
            key={item.id}
            className="absolute top-0 w-3 h-3 bg-gold rounded-full animate-confetti"
            style={{
              left: `${item.left}%`,
              animationDelay: `${item.delay}s`,
            }}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
