import { useState } from 'react';
import { useLocation } from 'wouter';
import { authApi } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AuthPage() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === 'login') {
        await authApi.login(username, password);
      } else {
        await authApi.signup(username, password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm p-6">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-display font-bold">Spin Lucky</h1>
          <p className="text-sm text-muted-foreground mt-1">{mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
          </div>
          {error && <div className="text-sm text-red-500">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Đang xử lý...' : (mode === 'login' ? 'Đăng nhập' : 'Đăng ký')}
          </Button>
        </form>
        <div className="mt-4 text-sm text-center text-muted-foreground">
          {mode === 'login' ? (
            <button className="underline" onClick={() => setMode('signup')} disabled={loading}>
              Chưa có tài khoản? Đăng ký
            </button>
          ) : (
            <button className="underline" onClick={() => setMode('login')} disabled={loading}>
              Đã có tài khoản? Đăng nhập
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}


