'use client';
import Link from 'next/link';
import { useMemo } from 'react';
import {
  AlertTriangle,
  CalendarClock,
  ChevronRight,
  Plus,
  RefreshCcw,
  Trash2,
  Wallet,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChangePill } from '@/components/value-pill';
import { Disclaimer } from '@/components/disclaimer';
import { AllocationPie } from '@/components/charts/allocation-pie';
import { computePortfolio } from '@/lib/calculations';
import { usePortfolio } from '@/lib/portfolio-store';
import { cn, formatDate, formatPct, formatRub, daysUntil } from '@/lib/utils';

export default function DashboardPage() {
  const { positions, remove, reset, hydrated } = usePortfolio();
  const summary = useMemo(() => computePortfolio(positions), [positions]);

  if (!hydrated) {
    return (
      <div className="container py-10">
        <div className="h-8 w-40 bg-muted rounded animate-pulse mb-4" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const empty = positions.length === 0;

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="ai" className="mb-2">
            <Wallet className="h-3.5 w-3.5 mr-1" /> Дашборд
          </Badge>
          <h1 className="text-3xl font-semibold">Мой портфель</h1>
          <p className="text-muted-foreground mt-1">
            Демо-данные хранятся в браузере. Архитектура готова под подключение MOEX ISS, новостных и
            AI API.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/assets/add">
            <Button>
              <Plus className="h-4 w-4" /> Добавить актив
            </Button>
          </Link>
          <Button variant="outline" onClick={() => reset()}>
            <RefreshCcw className="h-4 w-4" /> Демо
          </Button>
        </div>
      </div>

      {empty ? (
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium">Портфель пуст</h3>
            <p className="text-muted-foreground mt-1">
              Добавьте первую бумагу или восстановите демо-портфель.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Link href="/assets/add">
                <Button>
                  <Plus className="h-4 w-4" /> Добавить
                </Button>
              </Link>
              <Button variant="outline" onClick={reset}>
                Восстановить демо
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              label="Стоимость портфеля"
              value={formatRub(summary.totalValue)}
              hint={`Вложено: ${formatRub(summary.totalInvested)}`}
            />
            <StatCard
              label="Прибыль / убыток"
              value={formatRub(summary.pnl, { sign: true })}
              hint={formatPct(summary.pnlPct, { sign: true })}
              tone={summary.pnl >= 0 ? 'up' : 'down'}
            />
            <StatCard
              label="Изменение за день"
              value={formatRub(summary.dayPnl, { sign: true })}
              hint={formatPct(summary.dayPnlPct, { sign: true })}
              tone={summary.dayPnl >= 0 ? 'up' : 'down'}
            />
            <StatCard
              label="Изменение за неделю"
              value={formatRub(summary.weekPnl, { sign: true })}
              hint={formatPct(summary.weekPnlPct, { sign: true })}
              tone={summary.weekPnl >= 0 ? 'up' : 'down'}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Структура портфеля</CardTitle>
                <CardDescription>Доля каждой бумаги по текущей рыночной стоимости.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 items-center">
                  <AllocationPie data={summary.allocation} />
                  <ul className="space-y-1.5">
                    {summary.allocation.map((a) => (
                      <li
                        key={a.name}
                        className="flex items-center justify-between text-sm border-b last:border-b-0 py-1"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'h-2.5 w-2.5 rounded-full',
                              a.type === 'stock' ? 'bg-violet-500' : 'bg-emerald-500'
                            )}
                          />
                          <span className="font-medium">{a.name}</span>
                          <Badge variant="outline" className="ml-1 text-[10px]">
                            {a.type === 'stock' ? 'Акция' : 'Облигация'}
                          </Badge>
                        </div>
                        <div className="text-right tabular">
                          <div>{formatRub(a.value)}</div>
                          <div className="text-xs text-muted-foreground">{a.pct.toFixed(1)}%</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4" /> Ближайшие выплаты
                  </CardTitle>
                </div>
                <CardDescription>Купоны и дивиденды в порядке даты.</CardDescription>
              </CardHeader>
              <CardContent>
                {summary.upcomingPayments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Данные недоступны</p>
                ) : (
                  <ul className="space-y-2">
                    {summary.upcomingPayments.slice(0, 6).map((p, i) => {
                      const d = daysUntil(p.date);
                      return (
                        <li key={i} className="flex items-center justify-between gap-2 text-sm">
                          <div className="min-w-0">
                            <div className="font-medium truncate">{p.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {p.type === 'coupon'
                                ? 'Купон'
                                : p.type === 'dividend'
                                  ? 'Дивиденд'
                                  : 'Погашение'}{' '}
                              · {formatDate(p.date)}
                              {d >= 0 ? ` · через ${d} дн.` : ''}
                            </div>
                          </div>
                          <div className="text-right tabular text-sm">
                            <div className="font-medium">{formatRub(p.amount)}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatRub(p.perUnit)} / шт.
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {summary.riskWarnings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" /> Предупреждения
                </CardTitle>
                <CardDescription>На что обратить внимание в текущем портфеле.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-2 md:grid-cols-2">
                  {summary.riskWarnings.map((w, i) => (
                    <li
                      key={i}
                      className={cn(
                        'rounded-md border px-3 py-2 text-sm flex items-start gap-2',
                        w.level === 'high'
                          ? 'border-rose-500/30 bg-rose-500/5'
                          : w.level === 'medium'
                            ? 'border-amber-500/30 bg-amber-500/5'
                            : 'border-border'
                      )}
                    >
                      <Badge
                        variant={
                          w.level === 'high' ? 'danger' : w.level === 'medium' ? 'warning' : 'secondary'
                        }
                        className="shrink-0"
                      >
                        {w.ticker}
                      </Badge>
                      <span>{w.message}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Список бумаг</CardTitle>
              <CardDescription>Текущие позиции и их состояние.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b">
                      <th className="py-2 pr-3 font-medium">Бумага</th>
                      <th className="py-2 px-3 font-medium text-right">Кол-во</th>
                      <th className="py-2 px-3 font-medium text-right">Ср. цена</th>
                      <th className="py-2 px-3 font-medium text-right">Тек. цена</th>
                      <th className="py-2 px-3 font-medium text-right">Стоимость</th>
                      <th className="py-2 px-3 font-medium text-right">P&L</th>
                      <th className="py-2 px-3 font-medium text-right">День</th>
                      <th className="py-2 pl-3 font-medium text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.positions.map((m) => {
                      const isStock = m.position.type === 'stock';
                      const href = isStock
                        ? `/stocks/?ticker=${encodeURIComponent(m.position.ticker)}`
                        : `/bonds/?id=${encodeURIComponent(m.position.isin ?? m.position.ticker)}`;
                      return (
                        <tr key={m.position.id} className="border-b last:border-b-0 hover:bg-accent/30">
                          <td className="py-3 pr-3">
                            <Link href={href} className="group flex items-center gap-2">
                              <div>
                                <div className="font-medium group-hover:underline">
                                  {m.meta.stock?.ticker ?? m.meta.bond?.ticker ?? m.position.ticker}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {m.meta.stock?.name ?? m.meta.bond?.name ?? '—'}
                                </div>
                              </div>
                              <Badge variant="outline" className="ml-1">
                                {isStock ? 'Акция' : 'Облигация'}
                              </Badge>
                            </Link>
                          </td>
                          <td className="py-3 px-3 text-right tabular">{m.position.quantity}</td>
                          <td className="py-3 px-3 text-right tabular">
                            {isStock
                              ? formatRub(m.position.buyPrice)
                              : `${m.position.buyPrice.toFixed(2)}%`}
                          </td>
                          <td className="py-3 px-3 text-right tabular">
                            {m.currentPrice != null
                              ? isStock
                                ? formatRub(m.currentPrice)
                                : `${m.meta.bond?.pricePct.toFixed(2)}%`
                              : '—'}
                          </td>
                          <td className="py-3 px-3 text-right tabular">
                            {m.marketValue != null ? formatRub(m.marketValue) : '—'}
                          </td>
                          <td className="py-3 px-3 text-right tabular">
                            {m.pnl != null ? (
                              <>
                                <div className={m.pnl >= 0 ? 'text-up' : 'text-down'}>
                                  {formatRub(m.pnl, { sign: true })}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {formatPct(m.pnlPct, { sign: true })}
                                </div>
                              </>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <ChangePill value={m.dayChangePct} />
                          </td>
                          <td className="py-3 pl-3 text-right">
                            <div className="inline-flex items-center gap-1">
                              <Link href={href}>
                                <Button variant="ghost" size="icon" aria-label="Открыть">
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Удалить"
                                onClick={() => remove(m.position.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Disclaimer />
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'up' | 'down';
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div
          className={cn(
            'text-2xl font-semibold mt-1 tabular',
            tone === 'up' && 'text-up',
            tone === 'down' && 'text-down'
          )}
        >
          {value}
        </div>
        {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
      </CardContent>
    </Card>
  );
}
