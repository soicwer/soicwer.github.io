import Link from 'next/link';
import {
  Wallet,
  BarChart3,
  CalendarClock,
  Newspaper,
  Bell,
  Sparkles,
  Calculator,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Disclaimer } from '@/components/disclaimer';

const FEATURES = [
  {
    icon: <Wallet className="h-5 w-5" />,
    title: 'Следит за портфелем',
    text: 'Общая стоимость, вложенная сумма, прибыль/убыток в рублях и процентах, динамика дня и недели.',
  },
  {
    icon: <CalendarClock className="h-5 w-5" />,
    title: 'Купоны и дивиденды',
    text: 'Календарь ближайших выплат, размер купона, ожидаемые поступления по портфелю.',
  },
  {
    icon: <Newspaper className="h-5 w-5" />,
    title: 'Простой язык',
    text: 'AI объясняет, что произошло с бумагой и какие факторы повлияли — без сложной финансовой лексики.',
  },
  {
    icon: <Bell className="h-5 w-5" />,
    title: 'Важные события',
    text: 'Оферты, погашения, дивидендные отсечки, заметные новости — не пропустите ключевое.',
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: 'Доходность',
    text: 'Считает доходность по акциям и облигациям, показывает структуру портфеля и риски.',
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: 'Без советов «покупай/продавай»',
    text: 'Аналитическая сводка, ближайшие события и риски — итог формулируется осторожно.',
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="grad-hero">
        <div className="container py-16 md:py-24">
          <Badge variant="ai" className="mb-4">
            <Sparkles className="h-3.5 w-3.5 mr-1" /> AI-разбор · Российский рынок
          </Badge>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight max-w-3xl">
            Следите за портфелем акций и облигаций без боли.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl">
            Добавьте свои бумаги вручную и получайте понятную сводку: стоимость портфеля,
            прибыль, ближайшие купоны и дивиденды, новости и аккуратный AI-разбор ситуации.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/assets/add">
              <Button size="xl">
                Добавить портфель <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/calculators/bond">
              <Button size="xl" variant="secondary">
                <Calculator className="h-4 w-4" /> Посчитать облигацию
              </Button>
            </Link>
            <Link href="/calculators/stock">
              <Button size="xl" variant="outline">
                <Calculator className="h-4 w-4" /> Посчитать акцию
              </Button>
            </Link>
          </div>

          <div className="mt-10">
            <Disclaimer
              text="Сервис носит информационный характер. Материалы не являются индивидуальной инвестиционной рекомендацией. Все расчёты примерные."
              className="max-w-3xl"
            />
          </div>
        </div>
      </section>

      <section className="container py-12 md:py-16">
        <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold">Что внутри</h2>
            <p className="text-muted-foreground mt-1">
              Возможности MVP-версии. Архитектура готова к подключению MOEX ISS, новостных и AI API.
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="ghost">
              К дашборду <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary">
                    {f.icon}
                  </span>
                  <CardTitle className="text-base">{f.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{f.text}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container py-10">
        <Card className="overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="p-8 md:p-10">
              <Badge variant="ai" className="mb-3">
                <Sparkles className="h-3.5 w-3.5 mr-1" /> AI-разбор
              </Badge>
              <h3 className="text-2xl font-semibold mb-3">Не «покупай — продавай», а понятное объяснение</h3>
              <p className="text-muted-foreground">
                AI собирает картину: что произошло с бумагой, какие новости повлияли, какие факторы стоит
                держать в голове и что проверить самостоятельно. Без обещаний доходности.
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>· Кратко — 2–3 предложения по сути</li>
                <li>· Позитивные факторы и риски — отдельно</li>
                <li>· Ближайшие события и чек-лист для проверки</li>
                <li>· Осторожный вывод и обязательный дисклеймер</li>
              </ul>
            </div>
            <div className="bg-muted/30 p-8 md:p-10 border-t md:border-t-0 md:border-l">
              <div className="bg-ai-soft rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium text-sm">
                    <Sparkles className="h-4 w-4 text-[hsl(var(--ai))]" /> AI-разбор · пример
                  </div>
                  <Badge variant="ai">сводка</Badge>
                </div>
                <p className="text-sm">
                  Бумага торгуется выше уровней начала года; недавняя отчётность была воспринята
                  рынком положительно.
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-md border bg-background/60 p-3">
                    <div className="font-medium mb-1">+ Факторы</div>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>· Стабильные дивиденды</li>
                      <li>· Рост прибыли</li>
                    </ul>
                  </div>
                  <div className="rounded-md border bg-background/60 p-3">
                    <div className="font-medium mb-1">− Риски</div>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>· Регуляторика</li>
                      <li>· Волатильность</li>
                    </ul>
                  </div>
                </div>
                <Disclaimer compact />
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="container py-12 md:py-16">
        <Card>
          <CardContent className="p-8 md:p-12 grid md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2">
              <h3 className="text-2xl md:text-3xl font-semibold">Готовы попробовать?</h3>
              <p className="mt-2 text-muted-foreground">
                Добавьте акции и облигации вручную или откройте демо-портфель. Без регистрации —
                данные хранятся в браузере.
              </p>
            </div>
            <div className="flex md:justify-end gap-3 flex-wrap">
              <Link href="/dashboard">
                <Button size="lg">Открыть демо</Button>
              </Link>
              <Link href="/assets/add">
                <Button size="lg" variant="outline">Добавить актив</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
