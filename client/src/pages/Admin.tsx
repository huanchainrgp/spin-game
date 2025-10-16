import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { authApi } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminPage() {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const me = await authApi.me();
        if (me.user.username !== 'admin') {
          navigate('/');
          return;
        }
        const res = await fetch('/api/admin/overview', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load overview');
        const json = await res.json();
        if (mounted) setData(json);
      } catch (e: any) {
        setError(e.message || 'Failed to load');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Loading...</div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>
    );
  }

  const metrics = data?.metrics || {};
  const players = data?.players || [];
  const spins = data?.recentSpins || [];
  const [rewards, setRewards] = useState<any[]>([]);
  const [newReward, setNewReward] = useState({ name: '', type: 'coin', value: 0, weight: 1, color: '#FFD700', icon: 'trophy' });

  useEffect(() => {
    fetch('/api/admin/rewards', { credentials: 'include' })
      .then(r => r.json())
      .then(setRewards)
      .catch(() => {});
  }, []);

  const createReward = async () => {
    const res = await fetch('/api/admin/rewards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(newReward),
    });
    if (res.ok) {
      const created = await res.json();
      setRewards(prev => [created, ...prev]);
      setNewReward({ name: '', type: 'coin', value: 0, weight: 1, color: '#FFD700', icon: 'trophy' });
    }
  };

  const removeReward = async (id: string) => {
    const res = await fetch(`/api/admin/rewards/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) setRewards(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-display font-bold">Admin Dashboard</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Players</div>
            <div className="text-3xl font-bold">{metrics.totalPlayers ?? 0}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Recent Spins</div>
            <div className="text-3xl font-bold">{metrics.totalSpins ?? 0}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Winnings</div>
            <div className="text-3xl font-bold">{metrics.totalWinnings ?? 0}</div>
          </Card>
        </div>

        {/* Rewards Management */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-3">Rewards</h2>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-3">
            <div>
              <Label>Name</Label>
              <Input value={newReward.name} onChange={(e) => setNewReward({ ...newReward, name: e.target.value })} />
            </div>
            <div>
              <Label>Type</Label>
              <Input value={newReward.type} onChange={(e) => setNewReward({ ...newReward, type: e.target.value })} />
            </div>
            <div>
              <Label>Value</Label>
              <Input type="number" value={newReward.value} onChange={(e) => setNewReward({ ...newReward, value: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Weight</Label>
              <Input type="number" value={newReward.weight} onChange={(e) => setNewReward({ ...newReward, weight: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Color</Label>
              <Input value={newReward.color} onChange={(e) => setNewReward({ ...newReward, color: e.target.value })} />
            </div>
            <div>
              <Label>Icon</Label>
              <Input value={newReward.icon} onChange={(e) => setNewReward({ ...newReward, icon: e.target.value })} />
            </div>
          </div>
          <Button onClick={createReward}>Add Reward</Button>

          <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto">
            {rewards.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-md bg-card hover-elevate">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: r.color }} />
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-sm text-muted-foreground">{r.type} | val {r.value} | w {r.weight}</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => removeReward(r.id)}>Delete</Button>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-3">Players</h2>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {players.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-md bg-card hover-elevate">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm text-muted-foreground">Balance: {p.balance} | Winnings: {p.totalWinnings}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-3">Recent Spins</h2>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {spins.map((s: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-md bg-card hover-elevate">
                  <div className="font-semibold">{s.playerName}</div>
                  <div className="text-sm text-muted-foreground">Bet: {s.betAmount} | Win: {s.winAmount}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}


