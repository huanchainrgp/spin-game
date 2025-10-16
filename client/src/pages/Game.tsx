import { useState, useEffect, useCallback, useRef } from 'react';
import { SlotMachine } from '@/components/SlotMachine';
import { BetControls } from '@/components/BetControls';
import { BalanceDisplay } from '@/components/BalanceDisplay';
import { PlayerFeed } from '@/components/PlayerFeed';
import { Leaderboard } from '@/components/Leaderboard';
import { GameStatus } from '@/components/GameStatus';
import { WinCelebration } from '@/components/WinCelebration';
import { Player, SpinResult, LeaderboardEntry, SlotSymbol } from '@shared/schema';
import logoImg from '@assets/image_1760606710903.png';

const MIN_BET = 1;
const MAX_BET = 100;
const STARTING_BALANCE = 1000;

export default function Game() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [betAmount, setBetAmount] = useState(10);
  const [reels, setReels] = useState<[SlotSymbol, SlotSymbol, SlotSymbol]>(['cherry', 'cherry', 'cherry']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWinAmount, setLastWinAmount] = useState<number | undefined>(undefined);
  const [showBigWin, setShowBigWin] = useState(false);
  const [recentSpins, setRecentSpins] = useState<SpinResult[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playerCount, setPlayerCount] = useState(1);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const playerIdRef = useRef<string | null>(null);

  useEffect(() => {
    const playerName = prompt('Enter your name:') || `Player${Math.floor(Math.random() * 10000)}`;
    
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      setIsConnected(true);
      ws.send(JSON.stringify({
        type: 'join',
        data: { playerName }
      }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'game_state':
          playerIdRef.current = message.data.player.id;
          setPlayer(message.data.player);
          setLeaderboard(message.data.leaderboard);
          setRecentSpins(message.data.recentSpins);
          setPlayerCount(message.data.playerCount);
          break;
          
        case 'spin_result':
          if (message.data.player.id === playerIdRef.current) {
            setReels(message.data.reels);
            setPlayer(message.data.player);
            setLastWinAmount(message.data.winAmount);
            
            if (message.data.winAmount >= message.data.betAmount * 10) {
              setShowBigWin(true);
            }
            
            setTimeout(() => {
              setIsSpinning(false);
              setLastWinAmount(undefined);
            }, 1200);
          }
          break;
          
        case 'player_spin':
          setRecentSpins(prev => [message.data, ...prev].slice(0, 20));
          if (message.data.playerId !== playerIdRef.current) {
            setReels(message.data.reels);
          }
          break;
          
        case 'update_leaderboard':
          setLeaderboard(message.data);
          break;
          
        case 'player_count':
          setPlayerCount(message.data.count);
          break;
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = () => {
      setIsConnected(false);
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, []);

  const handleSpin = useCallback(() => {
    if (!player || !wsRef.current || isSpinning || player.balance < betAmount) {
      return;
    }

    setIsSpinning(true);
    wsRef.current.send(JSON.stringify({
      type: 'spin',
      data: { betAmount }
    }));
  }, [player, betAmount, isSpinning]);

  if (!player) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-2xl font-display text-foreground">Connecting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {showBigWin && lastWinAmount && (
        <WinCelebration 
          winAmount={lastWinAmount} 
          onComplete={() => setShowBigWin(false)} 
        />
      )}

      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logoImg} alt="Spin Lucky" className="w-16 h-16 rounded-lg" />
              <h1 className="text-4xl font-decorative font-bold text-gold drop-shadow-[0_2px_10px_rgba(251,191,36,0.3)]">
                SPIN LUCKY
              </h1>
            </div>
            <GameStatus playerCount={playerCount} isConnected={isConnected} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <BalanceDisplay 
              balance={player.balance} 
              totalWinnings={player.totalWinnings}
            />
            <BetControls
              betAmount={betAmount}
              onBetChange={setBetAmount}
              minBet={MIN_BET}
              maxBet={Math.min(MAX_BET, player.balance)}
              disabled={isSpinning}
            />
          </div>

          <div className="lg:col-span-6 flex items-center justify-center py-8">
            <SlotMachine
              reels={reels}
              isSpinning={isSpinning}
              onSpin={handleSpin}
              disabled={!isConnected || player.balance < betAmount}
              winAmount={lastWinAmount}
            />
          </div>

          <div className="lg:col-span-3 space-y-6">
            <PlayerFeed recentSpins={recentSpins} />
            <Leaderboard entries={leaderboard} currentPlayerId={player.id} />
          </div>
        </div>
      </main>
    </div>
  );
}
