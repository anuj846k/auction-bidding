import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { AuthUser } from '@/types/user';
import {
  getMe,
  signIn as apiSignIn,
  signOut as apiSignOut,
  signUp as apiSignUp,
} from '@/services/api';
import { socket } from '@/services/socket';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signIn: (payload: { email: string; password: string }) => Promise<void>;
  signUp: (payload: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const res = await getMe();
      setUser(res.user);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        await refresh();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = async (payload: { email: string; password: string }) => {
    const res = await apiSignIn(payload);
    setUser(res.user);
  };

  const signUp = async (payload: {
    name: string;
    email: string;
    password: string;
  }) => {
    const res = await apiSignUp(payload);
    setUser(res.user);
  };

  const signOut = async () => {
    // Important: existing socket connection remains "authenticated" server-side
    // until disconnected (server stored socket.userId at handshake time).
    socket.disconnect();
    await apiSignOut();
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, refresh, signIn, signUp, signOut }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
