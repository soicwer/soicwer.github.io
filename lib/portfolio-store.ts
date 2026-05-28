'use client';
import { useEffect, useState, useCallback } from 'react';
import { DEFAULT_PORTFOLIO } from './mock-data';
import type { NotificationSettings, PortfolioPosition } from './types';

const PORTFOLIO_KEY = 'rit:portfolio:v1';
const NOTIF_KEY = 'rit:notifications:v1';

export const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  frequency: 'important_only',
  channels: { email: true, telegram: false, push: false },
  triggers: {
    priceMovePct: 5,
    importantNews: true,
    couponSoon: true,
    dividendSoon: true,
    maturitySoon: true,
    portfolioDrawdownPct: 7,
  },
};

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function usePortfolio() {
  const [positions, setPositions] = useState<PortfolioPosition[]>(DEFAULT_PORTFOLIO);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = safeRead<PortfolioPosition[] | null>(PORTFOLIO_KEY, null);
    if (stored && Array.isArray(stored)) setPositions(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) safeWrite(PORTFOLIO_KEY, positions);
  }, [positions, hydrated]);

  const add = useCallback((p: Omit<PortfolioPosition, 'id'>) => {
    setPositions((prev) => [...prev, { ...p, id: `p-${Date.now()}` }]);
  }, []);

  const remove = useCallback((id: string) => {
    setPositions((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const reset = useCallback(() => {
    setPositions(DEFAULT_PORTFOLIO);
  }, []);

  const clear = useCallback(() => {
    setPositions([]);
  }, []);

  return { positions, add, remove, reset, clear, hydrated };
}

export function useNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATIONS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = safeRead<NotificationSettings | null>(NOTIF_KEY, null);
    if (stored) setSettings(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) safeWrite(NOTIF_KEY, settings);
  }, [settings, hydrated]);

  return { settings, setSettings, hydrated };
}
