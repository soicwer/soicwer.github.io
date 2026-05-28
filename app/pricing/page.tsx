import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Disclaimer } from '@/components/disclaimer';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    id: 'free',
    name: 'Бесплатный',
    price: '0 ₽',
    period: 'навсегда',
    description: 'Базовый учёт портфеля для знакомства с сервисом.',
    features: [
      'До 5 активов в портфеле',
      'Базовый калькулятор акций и облигаций',
      '3 AI-разбора в месяц',
      'Уведомления раз в неделю',
    ],
    cta: 'Начать бесплатно',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '299 ₽',
    period: 'в месяц',
    description: 'Активный инвестор: больше активов, аналитика и уведомления.',
    features: [
      'До 50 активов',
      'Ежедневные уведомления',
      'Календарь купонов и дивидендов',
      '50 AI-разборов в месяц',
      'Расширенная аналитика',
      'Сравнение бумаг',
    ],
    cta: 'Выбрать Premium',
    highlighted: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '799 ₽',
    period: 'в месяц',
    description: 'Несколько портфелей, риск-скоринг и подбор облигаций.',
    features: [
      'Несколько портфелей',
      'Безлимитные расчёты',
      'Расширенный AI-анализ',
      'Риск-скоринг',
      'Экспорт в CSV / Excel',
      'Уведомления о важных событиях',
      'Подбор облигаций под срок и цель',
    ],
    cta: 'Выбрать Pro',
  },
];

export default function PricingPage() {
  return (
    <div className="container py-10 md:py-14">
      <div className="max-w-2xl">
        <Badge variant="ai" className="mb-3">
          <Sparkles className="h-3.5 w-3.5 mr-1" /> Тарифы
        </Badge>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Простые и понятные планы</h1>
        <p className="mt-3 text-muted-foreground">
          Начните бесплатно. Подключайте Premium или Pro, когда понадобится больше активов, расчётов и
          уведомлений. Цены примерные и могут изменяться.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {PLANS.map((p) => (
          <Card
            key={p.id}
            className={cn(
              'relative',
              p.highlighted && 'border-[hsl(var(--ai)/0.5)] shadow-lg shadow-[hsl(var(--ai)/0.1)]'
            )}
          >
            {p.highlighted && (
              <div className="absolute -top-3 left-6">
                <Badge variant="ai">Рекомендуем</Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-xl">{p.name}</CardTitle>
              <CardDescription>{p.description}</CardDescription>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-semibold tabular">{p.price}</span>
                <span className="text-sm text-muted-foreground">/{p.period}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/dashboard" className="block">
                <Button
                  variant={p.highlighted ? 'ai' : p.id === 'free' ? 'outline' : 'default'}
                  className="w-full"
                >
                  {p.cta}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10">
        <Disclaimer text="Сервис не оказывает услуг по индивидуальному инвестиционному консультированию. Тарифы и цены — примерные, для демонстрации." />
      </div>
    </div>
  );
}
