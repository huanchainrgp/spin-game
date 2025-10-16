import { SlotSymbol, SYMBOL_WEIGHTS, PAYOUTS } from '@shared/schema';

export function getRandomSymbol(): SlotSymbol {
  const totalWeight = Object.values(SYMBOL_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const [symbol, weight] of Object.entries(SYMBOL_WEIGHTS)) {
    random -= weight;
    if (random <= 0) {
      return symbol as SlotSymbol;
    }
  }
  
  return 'cherry';
}

export function spinReels(): [SlotSymbol, SlotSymbol, SlotSymbol] {
  return [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
}

export function calculateWinAmount(reels: [SlotSymbol, SlotSymbol, SlotSymbol], betAmount: number): number {
  const [r1, r2, r3] = reels;
  
  if (r1 === r2 && r2 === r3) {
    const key = `${r1}-${r1}-${r1}`;
    return (PAYOUTS[key] || 0) * betAmount;
  }
  
  if (r1 === r2) {
    const key = `${r1}-${r1}`;
    return (PAYOUTS[key] || 0) * betAmount;
  }
  
  if (r1 === 'cherry') {
    return (PAYOUTS['cherry'] || 0) * betAmount;
  }
  
  return 0;
}
