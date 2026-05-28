export type AssetType = 'stock' | 'bond';

export interface StockQuote {
  ticker: string;
  name: string;
  sector: string;
  currency: 'RUB';
  price: number;
  prevClose: number;
  dayChangePct: number;
  weekChangePct: number;
  monthChangePct: number;
  yearChangePct: number;
  lotSize: number;
  dividend?: {
    lastPayment?: { date: string; amount: number };
    nextPayment?: { date: string; amount: number };
    yieldPct?: number;
  };
  history: { date: string; price: number }[];
}

export interface BondQuote {
  isin: string;
  ticker: string;
  name: string;
  issuer: string;
  currency: 'RUB';
  faceValue: number;
  pricePct: number; // % от номинала, текущая
  prevPricePct: number;
  couponAmount: number; // в рублях за купон
  couponPeriodDays: number;
  nextCouponDate: string;
  accruedInterest: number; // НКД на 1 бумагу
  maturityDate: string;
  ytmPct?: number;
  flags: {
    hasOffer?: boolean;
    offerDate?: string;
    hasAmortization?: boolean;
    floatingCoupon?: boolean;
    lowLiquidity?: boolean;
    highRisk?: boolean;
  };
  history: { date: string; pricePct: number }[];
}

export interface PortfolioPosition {
  id: string;
  type: AssetType;
  ticker: string; // для облигаций — ticker, ISIN отдельным полем
  isin?: string;
  quantity: number;
  buyPrice: number; // рубли за акцию; для облигаций — % от номинала
  buyDate: string; // ISO
  commission: number; // в рублях, разово
  note?: string;
}

export interface NewsItem {
  id: string;
  tickers: string[];
  title: string;
  source: string;
  publishedAt: string;
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface AISummary {
  short: string;
  positives: string[];
  risks: string[];
  upcoming: string[];
  watchlist: string[];
  conclusion: string;
}

export interface NotificationSettings {
  frequency: 'daily' | 'weekly' | 'important_only';
  channels: { email: boolean; telegram: boolean; push: boolean };
  triggers: {
    priceMovePct: number; // 0 если выключено
    importantNews: boolean;
    couponSoon: boolean;
    dividendSoon: boolean;
    maturitySoon: boolean;
    portfolioDrawdownPct: number; // 0 если выключено
  };
}
