import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { setApiToken } from './api';
import { createSessionStorage } from './session-storage';
import type { Session } from './types';

interface SessionContextValue { session: Session | null; ready: boolean; login: (value: Session) => Promise<void>; logout: () => Promise<void> }
const SessionContext = createContext<SessionContextValue | null>(null);
const KEY = 'lugati-session';
const storage = createSessionStorage(Platform.OS, SecureStore, () => globalThis.sessionStorage);
export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let mounted = true;
    storage.getItem(KEY).then((raw) => {
      if (!mounted || !raw) return;
      const value: Session = JSON.parse(raw);
      if (value.token && value.user?.id && ['teacher', 'student'].includes(value.user.role)) {
        setApiToken(value.token); setSession(value);
      }
    }).catch(() => {}).finally(() => { if (mounted) setReady(true); });
    return () => { mounted = false; };
  }, []);
  const login = async (value: Session) => {
    await storage.setItem(KEY, JSON.stringify(value));
    setApiToken(value.token); setSession(value);
  };
  const logout = async () => {
    await storage.removeItem(KEY);
    setApiToken(null); setSession(null);
  };
  return <SessionContext.Provider value={{ session, ready, login, logout }}>{children}</SessionContext.Provider>;
}
export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error('SessionProvider is missing');
  return value;
}
