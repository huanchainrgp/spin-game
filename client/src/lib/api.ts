export interface AuthUser {
  id: string;
  username: string;
}

export interface MeResponse {
  user: AuthUser;
  balance: number;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const msg = await res.json().catch(() => ({}));
    throw new Error(msg.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const authApi = {
  async signup(username: string, password: string): Promise<MeResponse> {
    return request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
  async login(username: string, password: string): Promise<MeResponse> {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
  async me(): Promise<MeResponse> {
    return request('/api/auth/me');
  },
  async logout(): Promise<{ ok: boolean }> {
    return request('/api/auth/logout', { method: 'POST' });
  },
};


