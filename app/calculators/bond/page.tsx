'use client';
import { useMemo, useState } from 'react';
import { Calculator, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Disclaimer } from '@/components/disclaimer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CashflowBars } from '@/components/charts/cashflow-bars';
import { BONDS } from '@/lib/mock-data';
import { calcBond, cashflowByMonth } from '@/lib/calculations';
import { formatDate, formatNumber, formatPct, formatRub } from '@/lib/utils';

export default function BondCalculatorPage() {
  const [id, setId] = useState('SU26238RMFS4');
  const [mode, setMode] = useState<'qty' | 'amount'>('qty');
  const [quantity, setQuantity] = useState('20');
  const [amount, setAmount] = useState('25000');
  const [buyPricePct, setBuyPricePct] = useState('');
  const [buyDate, setBuyDate] = useState(new Date().toISOString().slice(0, 10));
  const [exitMode, setExitMode] = useState<'maturity' | 'date'>('maturity');
  const [exitDate, setExitDate] = useState('2030-01-01');
  const [commissionPct, setCommissionPct] = useState('0.05');

  const result = useMemo(
    () =>
      calcBond({
        idOrIsin: id,
        quantity: mode === 'qty' ? Number(quantity) || 0 : undefined,
        amountRub: mode === 'amount' ? Number(amount) || 0 : undefined,
        buyPricePct: buyPricePct ? Number(buyPricePct) : undefined,
        buyDate,
        exitDate: exitMode === 'date' ? exitDate : undefined,
        commissionPct: Number(commissionPct) || 0,
      }),
    [id, mode, quantity, amount, buyPricePct, buyDate, exitMode, exitDate, commissionPct]
  );

  const cashflowMonths = useMemo(
    () => cashflowByMonth(result?.cashflow ?? []),
    [result]
  );

  return (
    <div className="container py-10 max-w-6xl">
      <Badge variant="ai" className="mb-2">
        <Calculator className="h-3.5 w-3.5 mr-1" /> Калькулятор облигаций
      </Badge>
      <h1 className="text-3xl font-semibold">Стоимость, купоны и денежный поток</h1>
      <p className="text-muted-foreground mt-1">
        Учитываем НКД, комиссию и считаем примерную доходность. Все цифры — приблизительные.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Параметры</CardTitle>
            <CardDescription>Расчёт пересчитывается автоматически.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="id">ISIN или тикер</Label>
              <Input
                id="id"
                value={id}
                onChange={(e) => setId(e.target.value)}
                list="bond-list"
              />
              <datalist id="bond-list">
                {Object.values(BONDS).map((b) => (
                  <option key={b.isin} value={b.isin}>{b.ticker}</option>
                ))}
              </datalist>
              <p className="text-xs text-muted-foreground">
                Демо: {Object.values(BONDS).map((b) => `${b.ticker} (${b.isin})`).join(', ')}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Что вводим</Label>
              <div className="inline-flex rounded-md border p-1 bg-muted text-sm">
                {(
                  [
                    { id: 'qty', label: 'Кол-во, шт.' },
                    { id: 'amount', label: 'Сумма, ₽' },
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

            {mode === 'qty' ? (
              <div className="space-y-2">
                <Label htmlFor="qty">Количество, шт.</Label>
                <Input id="qty" type="number" min={0} step={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="amount">Сумма, ₽</Label>
                <Input id="amount" type="number" min={0} step={1000} value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="ppct">Цена покупки, % от номинала</Label>
              <Input
                id="ppct"
                type="number"
                min={0}
                step={0.01}
                value={buyPricePct}
                onChange={(e) => setBuyPricePct(e.target.value)}
                placeholder={result ? result.buyPricePct.toFixed(2) : ''}
              />
              <p className="text-xs text-muted-foreground">
                Если не указано — берём текущую цену из демо.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="buydate">Дата покупки</Label>
              <Input id="buydate" type="date" value={buyDate} onChange={(e) => setBuyDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Горизонт</Label>
              <div className="inline-flex rounded-md border p-1 bg-muted text-sm">
                {(
                  [
                    { id: 'maturity', label: 'До погашения' },
                    { id: 'date', label: 'Указать дату' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setExitMode(opt.id)}
                    className={`px-3 py-1.5 rounded-sm transition-colors ${
                      exitMode === opt.id ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {exitMode === 'date' && (
                <Input type="date" value={exitDate} onChange={(e) => setExitDate(e.target.value)} />
              )}
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
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Результат</CardTitle>
              <CardDescription>
                {result
                  ? `${formatNumber(result.quantity, 0)} шт. · номинал ${formatRub(result.faceValue)} · ${result.buyPricePct.toFixed(2)}%`
                  : '—'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {!result ? (
                <p className="text-sm text-muted-foreground">
                  По введённому идентификатору нет данных в демо.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <Row label="Стоимость (чистая)" value={formatRub(result.cleanCost)} />
                    <Row label="НКД" value={formatRub(result.totalAccrued)} />
                    <Row label="Комиссия" value={formatRub(result.commission)} />
                    <Row label="Итого к оплате" value={formatRub(result.totalCost)} highlight />
                    <Row label="Купон" value={`${formatRub(result.couponAmount)} / шт.`} hint={`раз в ${result.couponPeriodDays} дн.`} />
                    <Row label="Ближайший купон" value={formatDate(result.nextCouponDate)} />
                    <Row label="Дата погашения" value={formatDate(result.maturityDate)} />
                    <Row label="Сумма купонов" value={formatRub(result.totalCoupons)} hint="до выбранного горизонта" />
                    <Row
                      label="Примерная доходность"
                      value={result.yieldAnnualPct != null ? formatPct(result.yieldAnnualPct, { sign: true }) : '—'}
                      hint="годовых, упрощённо"
                    />
                  </div>

                  {result.warnings.length > 0 && (
                    <div className="rounded-md border p-3 space-y-2">
                      <div className="text-sm font-medium flex items-center gap-2">
                        <Info className="h-4 w-4 text-amber-500" /> Предупреждения
                      </div>
                      <ul className="space-y-1 text-sm">
                        {result.warnings.map((w, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Badge
                              variant={
                                w.level === 'high' ? 'danger' : w.level === 'medium' ? 'warning' : 'secondary'
                              }
                              className="shrink-0 mt-0.5"
                            >
                              {w.level === 'high' ? 'высокий' : w.level === 'medium' ? 'средний' : 'низкий'}
                            </Badge>
                            <span>{w.message}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <ul className="text-xs text-muted-foreground space-y-1">
                    {result.note.map((n, i) => (
                      <li key={i}>· {n}</li>
                    ))}
                  </ul>
                </>
              )}
            </CardContent>
          </Card>

          {result && cashflowMonths.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Денежный поток по месяцам</CardTitle>
                <CardDescription>Купоны и погашение — суммарно по позиции.</CardDescription>
              </CardHeader>
              <CardContent>
                <CashflowBars data={cashflowMonths} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Disclaimer />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  hint,
  highlight,
}: {
  label: string;
  value: string;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-md border px-3 py-2 ${highlight ? 'bg-secondary' : ''}`}
    >
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium tabular">{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>}
    </div>
  );
}
