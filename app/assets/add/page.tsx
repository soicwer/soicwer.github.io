'use client';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Disclaimer } from '@/components/disclaimer';
import { BONDS, STOCKS } from '@/lib/mock-data';
import { usePortfolio } from '@/lib/portfolio-store';
import type { AssetType } from '@/lib/types';
import Link from 'next/link';

export default function AddAssetPage() {
  const router = useRouter();
  const { add } = usePortfolio();

  const [type, setType] = useState<AssetType>('stock');
  const [ticker, setTicker] = useState('');
  const [isin, setIsin] = useState('');
  const [quantity, setQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [buyDate, setBuyDate] = useState(new Date().toISOString().slice(0, 10));
  const [commission, setCommission] = useState('0');
  const [note, setNote] = useState('');

  const tickerSuggestions =
    type === 'stock' ? Object.keys(STOCKS) : Object.values(BONDS).map((b) => b.ticker);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const q = Number(quantity);
    const p = Number(buyPrice);
    if (!ticker || !q || !p) return;
    add({
      type,
      ticker: ticker.trim(),
      isin: type === 'bond' ? isin.trim() || undefined : undefined,
      quantity: q,
      buyPrice: p,
      buyDate,
      commission: Number(commission) || 0,
      note: note.trim() || undefined,
    });
    router.push('/dashboard');
  }

  return (
    <div className="container py-10 max-w-3xl">
      <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> К дашборду
      </Link>
      <Badge variant="ai" className="mb-2">Ручное добавление актива</Badge>
      <h1 className="text-3xl font-semibold">Добавить акцию или облигацию</h1>
      <p className="text-muted-foreground mt-1">
        В MVP цены подставляются из демо-каталога. Архитектура готова к подключению MOEX ISS.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Параметры покупки</CardTitle>
          <CardDescription>
            Все поля относятся к одной сделке. Если бумага куплена несколько раз — добавьте позиции отдельно.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5 md:grid-cols-2" onSubmit={onSubmit}>
            <div className="space-y-2 md:col-span-2">
              <Label>Тип актива</Label>
              <div className="inline-flex rounded-md border p-1 bg-muted text-sm">
                {(
                  [
                    { id: 'stock', label: 'Акция' },
                    { id: 'bond', label: 'Облигация' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setType(opt.id)}
                    className={`px-4 py-1.5 rounded-sm transition-colors ${
                      type === opt.id ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticker">Тикер или название</Label>
              <Input
                id="ticker"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                list="ticker-suggest"
                placeholder={type === 'stock' ? 'SBER' : 'ОФЗ-26238'}
                required
              />
              <datalist id="ticker-suggest">
                {tickerSuggestions.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
              <p className="text-xs text-muted-foreground">
                Доступные в демо: {tickerSuggestions.join(', ')}
              </p>
            </div>

            {type === 'bond' && (
              <div className="space-y-2">
                <Label htmlFor="isin">ISIN (опционально)</Label>
                <Input id="isin" value={isin} onChange={(e) => setIsin(e.target.value)} placeholder="RU000A0..." />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="qty">Количество, шт.</Label>
              <Input
                id="qty"
                type="number"
                min={1}
                step={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">
                {type === 'stock' ? 'Цена покупки, ₽' : 'Цена покупки, % от номинала'}
              </Label>
              <Input
                id="price"
                type="number"
                min={0}
                step={0.01}
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Дата покупки</Label>
              <Input id="date" type="date" value={buyDate} onChange={(e) => setBuyDate(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commission">Комиссия брокера, ₽</Label>
              <Input
                id="commission"
                type="number"
                min={0}
                step={0.01}
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="note">Комментарий</Label>
              <Textarea
                id="note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Например: «долгосрочно», «защитная часть»"
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-between gap-3 pt-2">
              <Disclaimer compact className="flex-1" />
              <Button type="submit">
                <Save className="h-4 w-4" /> Сохранить
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
