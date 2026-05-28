import type {
  AISummary,
  BondQuote,
  NewsItem,
  PortfolioPosition,
  StockQuote,
} from './types';

function genHistory(start: number, days = 90, vol = 0.015) {
  const out: { date: string; price: number }[] = [];
  let price = start;
  const today = new Date();
  for (let i = days; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    // pseudo-deterministic walk
    const seed = (i * 9301 + 49297) % 233280;
    const r = (seed / 233280 - 0.5) * 2;
    price = Math.max(price * (1 + r * vol), 0.1);
    out.push({ date: d.toISOString().slice(0, 10), price: Number(price.toFixed(2)) });
  }
  return out;
}

export const STOCKS: Record<string, StockQuote> = {
  SBER: {
    ticker: 'SBER',
    name: 'Сбербанк',
    sector: 'Финансы',
    currency: 'RUB',
    price: 312.4,
    prevClose: 308.1,
    dayChangePct: 1.39,
    weekChangePct: 2.4,
    monthChangePct: 5.8,
    yearChangePct: 18.3,
    lotSize: 10,
    dividend: {
      lastPayment: { date: '2025-07-18', amount: 34.84 },
      nextPayment: { date: '2026-07-15', amount: 36.5 },
      yieldPct: 11.7,
    },
    history: genHistory(295, 90, 0.012),
  },
  GAZP: {
    ticker: 'GAZP',
    name: 'Газпром',
    sector: 'Нефть и газ',
    currency: 'RUB',
    price: 138.6,
    prevClose: 140.2,
    dayChangePct: -1.14,
    weekChangePct: -2.8,
    monthChangePct: -4.2,
    yearChangePct: -8.6,
    lotSize: 10,
    dividend: {
      lastPayment: { date: '2024-07-12', amount: 0 },
      yieldPct: 0,
    },
    history: genHistory(150, 90, 0.018),
  },
  LKOH: {
    ticker: 'LKOH',
    name: 'ЛУКОЙЛ',
    sector: 'Нефть и газ',
    currency: 'RUB',
    price: 7185,
    prevClose: 7090,
    dayChangePct: 1.34,
    weekChangePct: 3.1,
    monthChangePct: 1.2,
    yearChangePct: 11.4,
    lotSize: 1,
    dividend: {
      lastPayment: { date: '2025-12-23', amount: 514 },
      nextPayment: { date: '2026-07-15', amount: 480 },
      yieldPct: 13.8,
    },
    history: genHistory(6800, 90, 0.013),
  },
  YNDX: {
    ticker: 'YNDX',
    name: 'Яндекс',
    sector: 'Технологии',
    currency: 'RUB',
    price: 4280,
    prevClose: 4230,
    dayChangePct: 1.18,
    weekChangePct: 4.6,
    monthChangePct: 8.9,
    yearChangePct: 26.1,
    lotSize: 1,
    dividend: undefined,
    history: genHistory(4000, 90, 0.02),
  },
  ROSN: {
    ticker: 'ROSN',
    name: 'Роснефть',
    sector: 'Нефть и газ',
    currency: 'RUB',
    price: 542.5,
    prevClose: 545.0,
    dayChangePct: -0.46,
    weekChangePct: -1.1,
    monthChangePct: 2.3,
    yearChangePct: 5.7,
    lotSize: 1,
    dividend: {
      nextPayment: { date: '2026-07-10', amount: 36.5 },
      yieldPct: 8.9,
    },
    history: genHistory(530, 90, 0.014),
  },
};

function genBondHistory(startPct: number, days = 90) {
  const out: { date: string; pricePct: number }[] = [];
  let p = startPct;
  const today = new Date();
  for (let i = days; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const seed = (i * 7919 + 17) % 233280;
    const r = (seed / 233280 - 0.5) * 2;
    p = Math.max(p + r * 0.25, 60);
    out.push({ date: d.toISOString().slice(0, 10), pricePct: Number(p.toFixed(2)) });
  }
  return out;
}

export const BONDS: Record<string, BondQuote> = {
  OFZ26238: {
    isin: 'SU26238RMFS4',
    ticker: 'ОФЗ-26238',
    name: 'ОФЗ 26238',
    issuer: 'Минфин РФ',
    currency: 'RUB',
    faceValue: 1000,
    pricePct: 84.2,
    prevPricePct: 83.95,
    couponAmount: 35.4,
    couponPeriodDays: 182,
    nextCouponDate: '2026-08-10',
    accruedInterest: 8.7,
    maturityDate: '2041-05-15',
    ytmPct: 13.9,
    flags: { hasOffer: false, hasAmortization: false, floatingCoupon: false },
    history: genBondHistory(84, 90),
  },
  RU000A107738: {
    isin: 'RU000A107738',
    ticker: 'РЖД-001P-30R',
    name: 'РЖД 001P-30R',
    issuer: 'ОАО РЖД',
    currency: 'RUB',
    faceValue: 1000,
    pricePct: 98.6,
    prevPricePct: 98.4,
    couponAmount: 30.2,
    couponPeriodDays: 91,
    nextCouponDate: '2026-06-22',
    accruedInterest: 12.4,
    maturityDate: '2030-03-22',
    ytmPct: 14.5,
    flags: { hasOffer: true, offerDate: '2027-03-22', hasAmortization: false },
    history: genBondHistory(98, 90),
  },
  RU000A105SX7: {
    isin: 'RU000A105SX7',
    ticker: 'Сегежа-002P-05R',
    name: 'Сегежа 002P-05R',
    issuer: 'ПАО Сегежа Групп',
    currency: 'RUB',
    faceValue: 1000,
    pricePct: 72.1,
    prevPricePct: 73.0,
    couponAmount: 26.4,
    couponPeriodDays: 91,
    nextCouponDate: '2026-07-05',
    accruedInterest: 4.1,
    maturityDate: '2028-02-05',
    ytmPct: 28.6,
    flags: {
      hasOffer: true,
      offerDate: '2026-09-05',
      floatingCoupon: false,
      lowLiquidity: true,
      highRisk: true,
    },
    history: genBondHistory(75, 90),
  },
};

export const DEFAULT_PORTFOLIO: PortfolioPosition[] = [
  {
    id: 'p1',
    type: 'stock',
    ticker: 'SBER',
    quantity: 100,
    buyPrice: 270.0,
    buyDate: '2025-02-12',
    commission: 120,
    note: 'Долгосрочно',
  },
  {
    id: 'p2',
    type: 'stock',
    ticker: 'LKOH',
    quantity: 5,
    buyPrice: 6900,
    buyDate: '2025-03-04',
    commission: 90,
  },
  {
    id: 'p3',
    type: 'stock',
    ticker: 'YNDX',
    quantity: 8,
    buyPrice: 3850,
    buyDate: '2025-09-21',
    commission: 80,
  },
  {
    id: 'p4',
    type: 'bond',
    ticker: 'ОФЗ-26238',
    isin: 'SU26238RMFS4',
    quantity: 20,
    buyPrice: 82.5,
    buyDate: '2025-06-18',
    commission: 60,
    note: 'Защитная часть',
  },
  {
    id: 'p5',
    type: 'bond',
    ticker: 'РЖД-001P-30R',
    isin: 'RU000A107738',
    quantity: 15,
    buyPrice: 99.2,
    buyDate: '2025-11-10',
    commission: 45,
  },
];

export const NEWS: NewsItem[] = [
  {
    id: 'n1',
    tickers: ['SBER'],
    title: 'Сбербанк опубликовал результаты за квартал',
    source: 'Интерфакс',
    publishedAt: '2026-05-22',
    summary:
      'Банк отчитался о росте чистой прибыли. Менеджмент подтвердил намерения по дивидендной политике.',
    sentiment: 'positive',
  },
  {
    id: 'n2',
    tickers: ['GAZP'],
    title: 'Совет директоров рассмотрит вопрос о дивидендах',
    source: 'Ведомости',
    publishedAt: '2026-05-20',
    summary:
      'Аналитики разделились во мнениях по поводу возможной выплаты. Решение ожидается до конца квартала.',
    sentiment: 'neutral',
  },
  {
    id: 'n3',
    tickers: ['LKOH'],
    title: 'Цены на нефть пошли вверх на новостях из ОПЕК+',
    source: 'RBC',
    publishedAt: '2026-05-19',
    summary: 'Котировки нефтегазового сектора отреагировали ростом, в т.ч. ЛУКОЙЛ.',
    sentiment: 'positive',
  },
  {
    id: 'n4',
    tickers: ['YNDX'],
    title: 'Яндекс представил обновление AI-продуктов',
    source: 'Коммерсантъ',
    publishedAt: '2026-05-15',
    summary:
      'Анонсированы новые продукты на базе LLM, обещают расширение монетизации в среднесрочной перспективе.',
    sentiment: 'positive',
  },
  {
    id: 'n5',
    tickers: ['Сегежа-002P-05R'],
    title: 'Сегежа: давление на финансовые показатели сохраняется',
    source: 'Финам',
    publishedAt: '2026-05-10',
    summary:
      'Эмитент продолжает обсуждение реструктуризации долговой нагрузки. Рейтинговые агентства указывают на повышенные риски.',
    sentiment: 'negative',
  },
  {
    id: 'n6',
    tickers: ['ОФЗ-26238'],
    title: 'ЦБ сохранил ключевую ставку на текущем уровне',
    source: 'Банк России',
    publishedAt: '2026-04-26',
    summary:
      'Регулятор отметил, что готов вернуться к снижению ставки при устойчивом замедлении инфляции.',
    sentiment: 'positive',
  },
];

export const AI_SUMMARIES: Record<string, AISummary> = {
  SBER: {
    short:
      'Бумага торгуется выше уровней начала года, недавняя отчётность была воспринята рынком положительно.',
    positives: [
      'Высокая дивидендная доходность относительно сектора',
      'Стабильный рост чистой прибыли по последним кварталам',
      'Прозрачная дивидендная политика',
    ],
    risks: [
      'Чувствительность к денежно-кредитной политике ЦБ',
      'Регуляторные риски для банковского сектора',
      'Геополитический фон может повышать волатильность',
    ],
    upcoming: ['Заседание ЦБ', 'Утверждение дивидендов годовым собранием'],
    watchlist: ['Динамика ключевой ставки', 'Качество кредитного портфеля'],
    conclusion:
      'Аналитическая сводка указывает на нейтрально-позитивный фон. Возможные риски стоит проверить самостоятельно перед принятием решения.',
  },
  GAZP: {
    short:
      'Бумага находится под давлением: котировки ниже уровней начала года, дивидендная история нестабильна.',
    positives: ['Низкая мультипликаторная оценка относительно исторических уровней'],
    risks: [
      'Снижение свободного денежного потока',
      'Высокая капиталоёмкость и инвестпрограмма',
      'Неопределённость по дивидендной политике',
    ],
    upcoming: ['Решение совета директоров по дивидендам'],
    watchlist: ['Цены на газ', 'Капитальные затраты', 'Решения по дивидендам'],
    conclusion:
      'Текущая ситуация требует осторожности. Перед действиями стоит проверить актуальные финансовые показатели.',
  },
  LKOH: {
    short: 'Сильная динамика последних недель на фоне роста цен на нефть и дивидендных ожиданий.',
    positives: ['Высокая дивидендная доходность', 'Прозрачная политика распределения прибыли'],
    risks: ['Зависимость от цен на нефть', 'Регуляторные риски в нефтегазовом секторе'],
    upcoming: ['Очередная выплата дивидендов', 'Публикация отчётности'],
    watchlist: ['Цены на нефть', 'Налоговая нагрузка на отрасль'],
    conclusion:
      'Тон сводки умеренно позитивный, но решение по бумаге зависит от индивидуального риск-профиля.',
  },
  YNDX: {
    short:
      'Бумага показала уверенный рост на фоне новостей о развитии AI-продуктов и улучшении монетизации.',
    positives: [
      'Лидерство в сегментах поиска и e-commerce',
      'Активное развитие AI-продуктов',
      'Рост выручки опережает средний по сектору',
    ],
    risks: [
      'Отсутствие дивидендов',
      'Чувствительность к корпоративным реорганизациям',
      'Высокая волатильность',
    ],
    upcoming: ['Публикация квартального отчёта', 'Конференция инвесторов'],
    watchlist: ['Рекламная выручка', 'Развитие облачного направления'],
    conclusion:
      'Сводка нейтрально-позитивная, но стоит учитывать волатильность и индивидуальные цели.',
  },
  ROSN: {
    short: 'Бумага торгуется в боковом диапазоне; ожидаются ближайшие дивиденды.',
    positives: ['Дивидендные ожидания', 'Крупный масштаб бизнеса'],
    risks: ['Зависимость от мировых цен на нефть', 'Налоговые изменения'],
    upcoming: ['Утверждение дивидендов', 'Финансовая отчётность'],
    watchlist: ['Цены на нефть', 'Объёмы добычи'],
    conclusion: 'Умеренно нейтральный фон. Проверьте свежие источники перед принятием решений.',
  },
};

export const BOND_AI: Record<string, AISummary> = {
  OFZ26238: {
    short:
      'Длинный выпуск ОФЗ: высокая чувствительность к движению ключевой ставки. Сценарий смягчения ДКП может поддержать цены.',
    positives: ['Эмитент — Минфин РФ', 'Высокая ликвидность', 'Доходность к погашению выше депозитов'],
    risks: ['Чувствительность к ставке', 'Длинный срок до погашения увеличивает дюрацию'],
    upcoming: ['Заседание ЦБ', 'Очередной купон'],
    watchlist: ['Решения по ключевой ставке', 'Инфляция'],
    conclusion: 'Инструмент несёт процентный риск. Учитывайте горизонт инвестирования.',
  },
  RU000A107738: {
    short:
      'Корпоративный выпуск с офертой. До оферты стоит планировать сценарии: удержание, предъявление, продажа.',
    positives: ['Эмитент с высоким кредитным рейтингом', 'Регулярные купоны'],
    risks: ['Оферта может изменить условия', 'Кредитный риск эмитента'],
    upcoming: ['Купонная выплата', 'Оферта'],
    watchlist: ['Объявление новой ставки купона перед офертой'],
    conclusion: 'Перед офертой проверьте условия и доходность к оферте.',
  },
  RU000A105SX7: {
    short: 'Высокодоходный выпуск с повышенным кредитным риском. Подходит не всем инвесторам.',
    positives: ['Высокая текущая доходность'],
    risks: [
      'Низкая ликвидность',
      'Повышенный кредитный риск эмитента',
      'Возможна реструктуризация условий',
    ],
    upcoming: ['Купон', 'Оферта'],
    watchlist: ['Финансовое состояние эмитента', 'Решения по реструктуризации'],
    conclusion:
      'Инструмент относится к категории повышенного риска. Возможны существенные просадки и сложности с продажей.',
  },
};

// Lookup helper
export function findStock(ticker: string) {
  return STOCKS[ticker.toUpperCase()];
}
export function findBond(idOrIsin: string) {
  const key = Object.keys(BONDS).find(
    (k) => k === idOrIsin || BONDS[k].isin === idOrIsin || BONDS[k].ticker === idOrIsin
  );
  return key ? BONDS[key] : undefined;
}
export function newsFor(tickers: string[]) {
  return NEWS.filter((n) => n.tickers.some((t) => tickers.includes(t)));
}
