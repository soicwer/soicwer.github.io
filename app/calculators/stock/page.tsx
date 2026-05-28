'use client';
import { useMemo, useState } from 'react';
import { Calculator, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Disclaimer } from '@/components/disclaimer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { STOCKS } from '@/lib/mock-data';
import { calcStock } from '@/lib/calculations';
import { formatNumber, formatPct, formatRub } from '@/lib/utils';

export default function StockCalculatorPage() {
  const [ticker, setTicker] = useState('SBER');
  const [mode, setMode] = useState<'qty' | 'amount'>('amount');
  const [quantity, setQuantity] = useState('10');
  const [amount, setAmount] = useState('50000');
  const [buyPrice, setBuyPrice] = useState('');
  const [commissionPct, setCommissionPct] = useState('0.05');
  const [includeDividends, setIncludeDividends] = useState(true);

  const result = useMemo(
    () =>
      calcStock({
        ticker,
        quantity: mode === 'qty' ? Number(quantity) || 0 : undefined,
        amountRub: mode === 'amount' ? Number(amount) || 0 : undefined,
        buyPrice: buyPrice ? Number(buyPrice) : undefined,
        commissionPct: Number(commissionPct) || 0,
        includeDividends,
      }),
    [ticker, mode, quantity, amount, buyPrice, commissionPct, includeDividends]
  );

  return (
    <div className="container py-10 max-w-5xl">
      <Badge variant="ai" className="mb-2">
        <Calculator className="h-3.5 w-3.5 mr-1" /> Калькулятор акций
      </Badge>
      <h1 className="text-3xl font-semibold">Сколько стоит купить и что получится</h1>
      <p className="text-muted-foreground mt-1">
        Подсчитайте число лотов, комиссию, дивидендный доход и сценарии изменения цены. Расчёты примерные.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Параметры</CardTitle>
            <CardDescription>Заполните поля — расчёт обновится автоматически.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ticker">Тикер</Label>
              <Input
                id="ticker"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                list="stock-tickers"
                placeholder="SBER"
              />
              <datalist id="stock-tickers">
                {Object.keys(STOCKS).map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
              <p className="text-xs text-muted-foreground">
                Доступно в демо: {Object.keys(STOCKS).join(', ')}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Что вводим</Label>
              <div className="inline-flex rounded-md border p-1 bg-muted text-sm">
                {(
                  [
                    { id: 'amount', label: 'Сумма, ₽' },
                    { id: 'qty', label: 'Кол-во, лотов' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMode(opt.id)}
                    className={`px-3 py-1.5 rounded-sm transition-colors ${
                      mode === opt.id ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {mode === 'amount' ? (
              <div className="space-y-2">
                <Label htmlFor="amount">Сумма, ₽</Label>
                <Input
                  id="amount"
                  type="number"
                  min={0}
                  step={1000}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="qty">Количество, лотов</Label>
                <Input
                  id="qty"
                  type="number"
                  min={0}
                  step={1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="price">Цена покупки, ₽ (опционально)</Label>
              <Input
                id="price"
                type="number"
                min={0}
                step={0.01}
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                placeholder={result ? result.price.toString() : ''}
              />
              <p className="text-xs text-muted-foreground">
                Если не указано — берём текущую цену из демо-каталога.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="commission">Комиссия брокера, %</Label>
              <Input
                id="commission"
                type="number"
                min={0}
                step={0.01}
                value={commissionPct}
                onChange={(e) => setCommissionPct(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <div>
                <div className="text-sm font-medium">Учитывать дивиденды</div>
                <div className="text-xs text-muted-foreground">
                  По данным ближайшей выплаты, если есть.
                </div>
              </div>
              <Switch checked={includeDividends} onCheckedChange={setIncludeDividends} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Результат</CardTitle>
            <CardDescription>
              {result ? `${ticker} · ${formatRub(result.price)} / шт. · лот ${result.lotSize}` : '—'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!result ? (
              <p className="text-sm text-muted-foreground">
                По введённому тикеру нет данных. Доступны: {Object.keys(STOCKS).join(', ')}.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Row label="Лотов" value={`${formatNumber(result.lots, 0)}`} />
                  <Row label="Бумаг" value={`${formatNumber(result.shares, 0)}`} />
                  <Row label="Стоимость" value={formatRub(result.cost)} />
                  <Row label="Комиссия" value={formatRub(result.commission)} />
                  <Row label="Итого к оплате" value={formatRub(result.total)} highlight />
                  <Row
                    label="Див. доходность"
                    value={result.dividendYieldPct != null ? formatPct(result.dividendYieldPct) : '—'}
                  />
                  {includeDividends && (
                    <Row
                      label="Ожидаемые дивиденды"
                      value={result.expectedDividend > 0 ? formatRub(result.expectedDividend) : '—'}
                    />
                  )}
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Сценарии изменения цены</div>
                  <div className="grid grid-cols-5 gap-2 text-center text-xs">
                    {result.scenarios.map((s) => {
                      const up = s.pnl >= 0;
                      return (
                        <div
                          key={s.label}
                          className={`rounded-md border p-2 ${
                            up ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-rose-500/5 border-rose-500/30'
                          }`}
                        >
                          <div className="font-medium">{s.label}</div>
                          <div className="tabular mt-1">{formatRub(s.value)}</div>
                          <div className={`tabular ${up ? 'text-up' : 'text-down'}`}>
                            {formatRub(s.pnl, { sign: true })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <ul className="text-xs text-muted-foreground space-y-1">
                  {result.note.map((n, i) => (
                    <li key={i}>· {n}</li>
                  ))}
                </ul>

                <div className="rounded-md bg-ai-soft p-3 text-sm flex gap-3 items-start">
                  <Sparkles className="h-4 w-4 text-[hsl(var(--ai))] mt-0.5 shrink-0" />
                  <div>
                    Сценарии описывают, что произошло бы при изменении цены, и не являются прогнозом. Перед сделкой
                    проверьте актуальные котировки и учтите налоги.
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Disclaimer />
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between rounded-md px-3 py-2 border ${
        highlight ? 'bg-secondary' : ''
      }`}
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular">{value}</span>
    </div>
  );
}
