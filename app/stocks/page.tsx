'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo } from 'react';
import { ArrowLeft, Newspaper, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChangePill } from '@/components/value-pill';
import { AISummaryCard } from '@/components/ai-summary';
import { Disclaimer } from '@/components/disclaimer';
import { PriceArea } from '@/components/charts/price-area';
import { AI_SUMMARIES, NEWS, STOCKS, findStock } from '@/lib/mock-data';
import { usePortfolio } from '@/lib/portfolio-store';
import { formatDate, formatNumber, formatPct, formatRub } from '@/lib/utils';

function StockDetail() {
  const params = useSearchParams();
  const tickerParam = (params?.get('ticker') ?? '').toUpperCase();
  const stock = tickerParam ? findStock(tickerParam) : undefined;
  const { positions } = usePortfolio();
  const myPositions = useMemo(
    () => positions.filter((p) => p.type === 'stock' && p.ticker.toUpperCase() === tickerParam),
    [positions, tickerParam]
  );

  if (!tickerParam) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-semibold mb-4">Карточка акции</h1>
        <p className="text-muted-foreground">Выберите бумагу из демо-каталога:</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.values(STOCKS).map((s) => (
            <Link key={s.ticker} href={`/stocks/?ticker=${s.ticker}`}>
              <Button variant="outline" size="sm">
                {s.ticker} · {s.name}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="container py-10">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
          ← К дашборду
        </Link>
        <h1 className="text-2xl font-semibold mt-3">Данные недоступны</h1>
        <p className="text-muted-foreground mt-1">
          По тикеру {tickerParam} в демо-каталоге нет данных. Подключение MOEX ISS добавим в
          следующих версиях.
        </p>
      </div>
    );
  }

  const totalQty = myPositions.reduce((acc, p) => acc + p.quantity, 0);
  const totalInvested = myPositions.reduce(
    (acc, p) => acc + p.buyPrice * p.quantity + p.commission,
    0
  );
  const avgBuy = totalQty > 0 ? totalInvested / totalQty : null;
  const marketValue = stock.price * totalQty;
  const pnl = avgBuy != null ? marketValue - totalInvested : null;
  const pnlPct = pnl != null && totalInvested > 0 ? (pnl / totalInvested) * 100 : null;
  const summary = AI_SUMMARIES[stock.ticker];
  const news = NEWS.filter((n) => n.tickers.includes(stock.ticker));

  const series = stock.history.map((h) => ({ date: h.date.slice(5), value: h.price }));

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center">
            <ArrowLeft className="h-4 w-4 mr-1" /> К дашборду
          </Link>
          <h1 className="text-3xl font-semibold mt-3 flex items-center gap-3">
            {stock.ticker}
            <Badge variant="outline">Акция</Badge>
            <Badge variant="secondary">{stock.sector}</Badge>
          </h1>
          <p className="text-muted-foreground">{stock.name}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-semibold tabular">{formatRub(stock.price)}</div>
          <ChangePill value={stock.dayChangePct} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Динамика цены
            </CardTitle>
            <CardDescription>За последние ~90 дней (демо-данные).</CardDescription>
          </CardHeader>
          <CardContent>
            <PriceArea data={series} positive={stock.weekChangePct >= 0} height={260} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Моя позиция</CardTitle>
            <CardDescription>На основе ваших добавленных бумаг.</CardDescription>
          </CardHeader>
          <CardContent>
            {totalQty === 0 ? (
              <div className="text-sm text-muted-foreground">
                Нет позиций. <Link className="underline" href="/assets/add">Добавить</Link>
              </div>
            ) : (
              <ul className="space-y-2 text-sm">
                <Row label="Количество" value={`${totalQty} шт.`} />
                <Row label="Средняя цена покупки" value={formatRub(avgBuy)} />
                <Row label="Стоимость позиции" value={formatRub(marketValue)} />
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
        <Stat label="Тек. цена" value={formatRub(stock.price)} />
        <Stat label="Изменение за неделю" value={formatPct(stock.weekChangePct, { sign: true })} tone={stock.weekChangePct >= 0 ? 'up' : 'down'} />
        <Stat label="Изменение за месяц" value={formatPct(stock.monthChangePct, { sign: true })} tone={stock.monthChangePct >= 0 ? 'up' : 'down'} />
        <Stat label="Изменение за год" value={formatPct(stock.yearChangePct, { sign: true })} tone={stock.yearChangePct >= 0 ? 'up' : 'down'} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Дивиденды</CardTitle>
        </CardHeader>
        <CardContent>
          {stock.dividend ? (
            <div className="grid gap-4 md:grid-cols-4">
              <Stat
                label="Дивидендная доходность"
                value={stock.dividend.yieldPct != null ? formatPct(stock.dividend.yieldPct) : '—'}
              />
              <Stat
                label="Последняя выплата"
                value={
                  stock.dividend.lastPayment
                    ? `${formatRub(stock.dividend.lastPayment.amount)} · ${formatDate(stock.dividend.lastPayment.date)}`
                    : 'данные недоступны'
                }
              />
              <Stat
                label="Ближайшая выплата"
                value={
                  stock.dividend.nextPayment
                    ? `${formatRub(stock.dividend.nextPayment.amount)} · ${formatDate(stock.dividend.nextPayment.date)}`
                    : 'данные недоступны'
                }
              />
              <Stat label="Размер лота" value={`${formatNumber(stock.lotSize, 0)} шт.`} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              По бумаге нет дивидендной истории в демо-данных.
            </p>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="ai">
        <TabsList>
          <TabsTrigger value="ai">AI-разбор</TabsTrigger>
          <TabsTrigger value="news">Новости</TabsTrigger>
        </TabsList>
        <TabsContent value="ai">
          {summary ? (
            <AISummaryCard summary={summary} />
          ) : (
            <p className="text-sm text-muted-foreground">AI-разбор для бумаги ещё не подготовлен.</p>
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

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'up' | 'down' }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div
          className={`text-lg font-semibold mt-1 tabular ${
            tone === 'up' ? 'text-up' : tone === 'down' ? 'text-down' : ''
          }`}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value, toneValue }: { label: string; value: string; toneValue?: number | null }) {
  const tone =
    toneValue == null ? undefined : toneValue >= 0 ? 'text-up' : 'text-down';
  return (
    <li className="flex items-center justify-between border-b last:border-b-0 py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium tabular ${tone ?? ''}`}>{value}</span>
    </li>
  );
}

export default function StockPage() {
  return (
    <Suspense fallback={<div className="container py-10 text-muted-foreground">Загрузка…</div>}>
      <StockDetail />
    </Suspense>
  );
}
