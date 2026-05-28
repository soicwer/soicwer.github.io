import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRub(value: number | null | undefined, opts: { sign?: boolean } = {}) {
  if (value == null || Number.isNaN(value)) return 'данные недоступны';
  const formatted = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(Math.abs(value));
  if (opts.sign) return `${value >= 0 ? '+' : '−'}${formatted}`;
  return value < 0 ? `−${formatted}` : formatted;
}

export function formatPct(value: number | null | undefined, opts: { sign?: boolean } = {}) {
  if (value == null || Number.isNaN(value)) return '—';
  const v = value.toFixed(2);
  const num = Number(v);
  if (opts.sign) return `${num >= 0 ? '+' : ''}${v}%`;
  return `${v}%`;
}

export function formatNumber(value: number | null | undefined, digits = 2) {
  if (value == null || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

export function formatDate(d: string | Date | null | undefined) {
  if (!d) return 'данные недоступны';
  const date = typeof d === 'string' ? new Date(d) : d;
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function daysUntil(date: string | Date) {
  const target = typeof date === 'string' ? new Date(date) : date;
  const diff = target.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
