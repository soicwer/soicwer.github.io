# РусИнвест Трекер · MVP

Веб-приложение / PWA для учёта инвестиционного портфеля на российском фондовом рынке: акции и облигации, расчёт доходности, ближайшие купоны и дивиденды, новости и осторожный AI-разбор по бумаге.

> Материал носит информационный характер и не является индивидуальной инвестиционной рекомендацией. Все расчёты примерные.

## Стек

- **Frontend:** Next.js 14 (App Router, `output: 'export'`) + TypeScript + Tailwind CSS
- **UI:** инлайн shadcn-style компоненты (`components/ui/*`), lucide-react, recharts
- **Хранение:** localStorage (`lib/portfolio-store.ts`) — без бэкенда в MVP
- **Темы:** light/dark через `next-themes` + CSS-переменные
- **PWA:** манифест `public/manifest.webmanifest`

## Структура

```
app/
  page.tsx                  главная (лендинг)
  dashboard/page.tsx        дашборд портфеля
  assets/add/page.tsx       ручное добавление актива
  stocks/page.tsx           карточка акции  (?ticker=SBER)
  bonds/page.tsx            карточка облигации (?id=ISIN)
  calculators/stock/page.tsx
  calculators/bond/page.tsx
  notifications/page.tsx
  pricing/page.tsx
components/
  ui/*                      Card, Button, Input, Tabs, Switch …
  charts/*                  PriceArea, AllocationPie, CashflowBars
  ai-summary.tsx            блок AI-разбора с дисклеймером
  header.tsx / footer.tsx
  theme-provider.tsx / theme-toggle.tsx
  disclaimer.tsx
lib/
  types.ts                  доменные типы
  mock-data.ts              демо-каталог: акции, облигации, новости, AI-сводки
  calculations.ts           агрегация портфеля, калькуляторы акций и облигаций
  portfolio-store.ts        хук портфеля и уведомлений (localStorage)
  utils.ts                  formatRub, formatPct, formatDate, cn
public/
  manifest.webmanifest
```

## Запуск

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm build          # статическая сборка в out/
```

Сборка статическая (`output: 'export'`), готова к деплою на GitHub Pages / Cloudflare Pages / S3.

## Принципы AI-блока

AI-разбор формирует **аналитическую сводку**, а не рекомендацию:

- кратко (2–3 предложения),
- позитивные факторы (список),
- риски (список),
- ближайшие события,
- что инвестору проверить самостоятельно,
- осторожный вывод,
- обязательный дисклеймер.

В коде формат описан типом `AISummary` (`lib/types.ts`) и компонентом `AISummaryCard`. Подключение реального AI API сводится к замене `AI_SUMMARIES` / `BOND_AI` из `mock-data.ts` на функцию, возвращающую `AISummary`.

## Точки интеграции реальных API

| Источник           | Что подменять                                       | Куда подключать                  |
|--------------------|-----------------------------------------------------|----------------------------------|
| MOEX ISS           | `STOCKS`, `BONDS` (котировки, история, лоты, НКД)   | `lib/mock-data.ts` → API-фасад   |
| Новостные API      | `NEWS`                                              | `lib/mock-data.ts`               |
| AI API (LLM)       | `AI_SUMMARIES`, `BOND_AI`                            | `lib/mock-data.ts`               |
| Брокеры (импорт)   | `usePortfolio().add(...)`                           | `lib/portfolio-store.ts`         |
| Уведомления        | `NotificationSettings` (email / telegram / push)    | `app/notifications/page.tsx`     |

## Ограничения MVP

- Демо-данные локальные, реальный MOEX ISS не подключён.
- AI-разборы предзаписаны.
- Реальные каналы уведомлений (Telegram / email / push) не подключены — только интерфейс настроек.
- Расчёты по облигациям упрощённые: без налогов, без точной реинвестиционной логики.

## Безопасность формулировок

В коде и интерфейсе **не используются**: «покупай», «продавай», «гарантированная доходность», «эта бумага точно вырастет». Везде, где это уместно, добавлены пометки «примерно», «аналитическая сводка», «не является индивидуальной инвестиционной рекомендацией». Если данных нет — UI показывает «данные недоступны», а не выдумывает значение.
