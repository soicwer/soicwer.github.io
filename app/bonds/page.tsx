'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo } from 'react';
import { ArrowLeft, AlertTriangle, Newspaper, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChangePill } from '@/components/value-pill';
import { AISummaryCard } from '@/components/ai-summary';
import { Disclaimer } from '@/components/disclaimer';
import { PriceArea } from '@/components/charts/price-area';
import { CashflowBars } from '@/components/charts/cashflow-bars';
import { BOND_AI, BONDS, NEWS, findBond } from '@/lib/mock-data';
import { usePortfolio } from '@/lib/portfolio-store';
import { cashflowByMonth, calcBond } from '@/lib/calculations';
import { formatDate, formatPct, formatRub, daysUntil } from '@/lib/utils';

function BondDetail() {
  const params = useSearchParams();
  const idParam = params?.get('id') ?? '';
  const bond = idParam ? findBond(idParam) : undefined;
  const { positions } = usePortfolio();
  const myPositions = useMemo(
    () =>
      positions.filter(
        (p) =>
          p.type === 'bond' &&
          (p.isin === idParam || p.ticker === idParam || p.ticker === bond?.ticker)
      ),
    [positions, idParam, bond]
  );

  if (!idParam) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-semibold mb-4">Карточка облигации</h1>
        <p className="text-muted-foreground">Выберите выпуск из демо-каталога:</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(BONDS).map(([k, b]) => (
            <Link key={k} href={`/bonds/?id=${encodeURIComponent(b.isin)}`}>
              <Button variant="outline" size="sm">
                {b.ticker} · {b.issuer}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (!bond) {
    return (
      <div className="container py-10">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
          ← К дашборду
        </Link>
        <h1 className="text-2xl font-semibold mt-3">Данные недоступны</h1>
        <p className="text-muted-foreground mt-1">
          По выпуску {idParam} в демо-каталоге нет данных.
        </p>
      </div>
    );
  }

  const bondKey = Object.keys(BONDS).find(
    (k) => BONDS[k].isin === bond.isin || BONDS[k].ticker === bond.ticker
  )!;
  const aiSummary = BOND_AI[bondKey];

  const totalQty = myPositions.reduce((acc, p) => acc + p.quantity, 0);
  const totalInvested = myPositions.reduce(
    (acc, p) => acc + (p.buyPrice / 100) * bond.faceValue * p.quantity + p.commission,
    0
  );
  const currentPerUnit = (bond.pricePct / 100) * bond.faceValue + bond.accruedInterest;
  const marketValue = currentPerUnit * totalQty;
  const pnl = totalQty > 0 ? marketValue - totalInvested : null;
  const pnlPct = pnl != null && totalInvested > 0 ? (pnl / totalInvested) * 100 : null;
  const dayChangePct = ((bond.pricePct - bond.prevPricePct) / bond.prevPricePct) * 100;

  // Expected cashflow if quantity present
  const cashflowCalc =
    totalQty > 0
      ? calcBond({
          idOrIsin: bond.isin,
          quantity: totalQty,
          buyPricePct: bond.pricePct,
          buyDate: new Date().toISOString().slice(0, 10),
          commissionPct: 0,
        })
      : calcBond({
          idOrIsin: bond.isin,
          quantity: 1,
          buyPricePct: bond.pricePct,
          buyDate: new Date().toISOString().slice(0, 10),
          commissionPct: 0,
        });
  const cashflowMonths = cashflowByMonth(cashflowCalc?.cashflow ?? []);
  const news = NEWS.filter((n) => n.tickers.includes(bond.ticker));
  const series = bond.history.map((h) => ({ date: h.date.slice(5), value: h.pricePct }));
  const flags = bond.flags;
  const flagPills: { label: string; variant: 'warning' | 'danger' | 'secondary' }[] = [];
  if (flags.hasOffer) flagPills.push({ label: 'Оферта', variant: 'warning' });
  if (flags.hasAmortization) flagPills.push({ label: 'Амортизация', variant: 'secondary' });
  if (flags.floatingCoupon) flagPills.push({ label: 'Плавающий купон', variant: 'warning' });
  if (flags.lowLiquidity) flagPills.push({ label: 'Низкая ликвидность', variant: 'warning' });
  if (flags.highRisk) flagPills.push({ label: 'Высокий риск', variant: 'danger' });

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center">
            <ArrowLeft className="h-4 w-4 mr-1" /> К дашборду
          </Link>
          <h1 className="text-3xl font-semibold mt-3 flex items-center gap-3 flex-wrap">
            {bond.ticker}
            <Badge variant="outline">Облигация</Badge>
            {flagPills.map((f) => (
              <Badge key={f.label} variant={f.variant}>{f.label}</Badge>
            ))}
          </h1>
          <p className="text-muted-foreground">
            {bond.name} · {bond.issuer} · ISIN {bond.isin}
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-semibold tabular">{bond.pricePct.toFixed(2)}%</div>
          <div className="text-xs text-muted-foreground">от номинала {formatRub(bond.faceValue)}</div>
          <ChangePill value={dayChangePct} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Цена, % от номинала
            </CardTitle>
            <CardDescription>За последние ~90 дней (демо-данные).</CardDescription>
          </CardHeader>
          <CardContent>
            <PriceArea data={series} positive={dayChangePct >= 0} unit="%" height={260} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Моя позиция</CardTitle>
          </CardHeader>
          <CardContent>
            {totalQty === 0 ? (
              <div className="text-sm text-muted-foreground">
                Нет позиций. <Link className="underline" href="/assets/add">Добавить</Link>
              </div>
            ) : (
              <ul className="space-y-2 text-sm">
                <Row label="Количество" value={`${totalQty} шт.`} />
                <Row
                  label="Цена покупки (ср.)"
                  value={`${(totalInvested / Math.max(1, totalQty) / (bond.faceValue / 100)).toFixed(2)}%`}
                />
                <Row label="Стоимость позиции (грязная)" value={formatRub(marketValue)} />
                <Row
                  label="Прибыль / убыток"
                  value={
                    pnl != null
                      ? `${formatRub(pnl, { sign: true })} · ${formatPct(pnlPct, { sign: true })}`
                      : '—'
                  }
                  toneValue={pnl}
                />
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="НКД" value={`${formatRub(bond.accruedInterest)} / шт.`} />
        <Stat label="Ближайший купон" value={formatDate(bond.nextCouponDate)} hint={`через ${daysUntil(bond.nextCouponDate)} дн.`} />
        <Stat label="Размер купона" value={`${formatRub(bond.couponAmount)} / шт.`} hint={`раз в ${bond.couponPeriodDays} дн.`} />
        <Stat
          label="Доходность к погашению"
          value={bond.ytmPct != null ? formatPct(bond.ytmPct) : 'данные недоступны'}
          hint={bond.ytmPct != null ? 'примерно' : undefined}
        />
        <Stat label="Дата погашения" value={formatDate(bond.maturityDate)} hint={`через ${daysUntil(bond.maturityDate)} дн.`} />
        <Stat label="Номинал" value={formatRub(bond.faceValue)} />
        {flags.hasOffer && (
          <Stat label="Оферта" value={formatDate(flags.offerDate)} hint="запланирована" />
        )}
        {cashflowCalc && totalQty > 0 && (
          <Stat label="Сумма купонов до погашения" value={formatRub(cashflowCalc.totalCoupons)} hint="примерно" />
        )}
      </div>

      {(flags.hasOffer || flags.hasAmortization || flags.floatingCoupon || flags.lowLiquidity || flags.highRisk) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Предупреждения по выпуску
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 md:grid-cols-2 text-sm">
              {flags.hasOffer && (
                <li className="rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2">
                  Запланирована оферта{flags.offerDate ? ` ${formatDate(flags.offerDate)}` : ''} — стоит проверить условия.
                </li>
              )}
              {flags.hasAmortization && (
                <li className="rounded-md border px-3 py-2">
                  Предусмотрена амортизация номинала — выплаты частями.
                </li>
              )}
              {flags.floatingCoupon && (
                <li className="rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2">
                  Купон плавающий — размер выплат может меняться.
                </li>
              )}
              {flags.lowLiquidity && (
                <li className="rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2">
                  Низкая ликвидность — продажа может занять время и сопровождаться дисконтом.
                </li>
              )}
              {flags.highRisk && (
                <li className="rounded-md border border-rose-500/30 bg-rose-500/5 px-3 py-2">
                  Эмитент относится к категории повышенного кредитного риска.
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}

      {cashflowCalc && cashflowMonths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Примерный денежный поток</CardTitle>
            <CardDescription>
              {totalQty > 0 ? `По вашей позиции (${totalQty} шт.)` : 'На 1 бумагу'} · до{' '}
              {formatDate(cashflowCalc.maturityDate)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CashflowBars data={cashflowMonths} />
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="ai">
        <TabsList>
          <TabsTrigger value="ai">AI-разбор</TabsTrigger>
          <TabsTrigger value="news">Новости</TabsTrigger>
        </TabsList>
        <TabsContent value="ai">
          {aiSummary ? (
            <AISummaryCard summary={aiSummary} />
          ) : (
            <p className="text-sm text-muted-foreground">AI-разбор для выпуска ещё не подготовлен.</p>
          )}
        </TabsContent>
        <TabsContent value="news">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="h-4 w-4" /> Последние новости
              </CardTitle>
            </CardHeader>
            <CardContent>
              {news.length === 0 ? (
                <p className="text-sm text-muted-foreground">Свежих новостей в демо нет.</p>
              ) : (
                <ul className="space-y-3">
                  {news.map((n) => (
                    <li key={n.id} className="border-b last:border-b-0 pb-3 last:pb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={
                            n.sentiment === 'positive'
                              ? 'success'
                              : n.sentiment === 'negative'
                                ? 'danger'
                                : 'secondary'
                          }
                        >
                          {n.sentiment === 'positive'
                            ? 'позитив'
                            : n.sentiment === 'negative'
                              ? 'негатив'
                              : 'нейтрально'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {n.source} · {formatDate(n.publishedAt)}
                        </span>
                      </div>
                      <div className="font-medium">{n.title}</div>
                      <p className="text-sm text-muted-foreground mt-1">{n.summary}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Disclaimer />
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-lg font-semibold mt-1 tabular">{value}</div>
        {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
      </CardContent>
    </Card>
  );
}

function Row({ label, value, toneValue }: { label: string; value: string; toneValue?: number | null }) {
  const tone = toneValue == null ? undefined : toneValue >= 0 ? 'text-up' : 'text-down';
  return (
    <li className="flex items-center justify-between border-b last:border-b-0 py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium tabular ${tone ?? ''}`}>{value}</span>
    </li>
  );
}

export default function BondPage() {
  return (
    <Suspense fallback={<div className="container py-10 text-muted-foreground">Загрузка…</div>}>
      <BondDetail />
    </Suspense>
  );
}
