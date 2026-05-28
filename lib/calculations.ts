import { BONDS, STOCKS, findBond, findStock } from './mock-data';
import type { BondQuote, PortfolioPosition, StockQuote } from './types';

export interface PositionMetrics {
  position: PortfolioPosition;
  currentPrice: number | null; // в рублях за 1 бумагу (для облигаций — текущая цена * номинал / 100)
  invested: number; // включая комиссию
  marketValue: number | null;
  pnl: number | null;
  pnlPct: number | null;
  dayChangePct: number | null;
  weekChangePct: number | null;
  meta: { stock?: StockQuote; bond?: BondQuote };
}

export function computePositionMetrics(p: PortfolioPosition): PositionMetrics {
  if (p.type === 'stock') {
    const s = findStock(p.ticker);
    if (!s) {
      return {
        position: p,
        currentPrice: null,
        invested: p.buyPrice * p.quantity + p.commission,
        marketValue: null,
        pnl: null,
        pnlPct: null,
        dayChangePct: null,
        weekChangePct: null,
        meta: {},
      };
    }
    const invested = p.buyPrice * p.quantity + p.commission;
    const marketValue = s.price * p.quantity;
    const pnl = marketValue - invested;
    const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
    return {
      position: p,
      currentPrice: s.price,
      invested,
      marketValue,
      pnl,
      pnlPct,
      dayChangePct: s.dayChangePct,
      weekChangePct: s.weekChangePct,
      meta: { stock: s },
    };
  }
  const b = findBond(p.isin ?? p.ticker);
  if (!b) {
    return {
      position: p,
      currentPrice: null,
      invested: (p.buyPrice / 100) * 1000 * p.quantity + p.commission,
      marketValue: null,
      pnl: null,
      pnlPct: null,
      dayChangePct: null,
      weekChangePct: null,
      meta: {},
    };
  }
  const investedClean = (p.buyPrice / 100) * b.faceValue * p.quantity + p.commission;
  const currentPerUnit = (b.pricePct / 100) * b.faceValue + b.accruedInterest;
  const marketValue = currentPerUnit * p.quantity;
  const pnl = marketValue - investedClean;
  const pnlPct = investedClean > 0 ? (pnl / investedClean) * 100 : 0;
  const dayChangePct = ((b.pricePct - b.prevPricePct) / b.prevPricePct) * 100;
  // Грубая оценка недельного движения по истории
  const histLen = b.history.length;
  const weekChangePct =
    histLen >= 8
      ? ((b.history[histLen - 1].pricePct - b.history[histLen - 8].pricePct) /
          b.history[histLen - 8].pricePct) *
        100
      : 0;
  return {
    position: p,
    currentPrice: currentPerUnit,
    invested: investedClean,
    marketValue,
    pnl,
    pnlPct,
    dayChangePct,
    weekChangePct,
    meta: { bond: b },
  };
}

export interface PortfolioSummary {
  totalInvested: number;
  totalValue: number;
  pnl: number;
  pnlPct: number;
  dayPnl: number;
  dayPnlPct: number;
  weekPnl: number;
  weekPnlPct: number;
  positions: PositionMetrics[];
  allocation: { name: string; value: number; pct: number; type: 'stock' | 'bond' }[];
  upcomingPayments: UpcomingPayment[];
  riskWarnings: { ticker: string; message: string; level: 'low' | 'medium' | 'high' }[];
}

export interface UpcomingPayment {
  ticker: string;
  name: string;
  type: 'coupon' | 'dividend' | 'maturity';
  date: string;
  amount: number; // суммарно по позиции
  perUnit: number;
}

export function computePortfolio(positions: PortfolioPosition[]): PortfolioSummary {
  const metrics = positions.map(computePositionMetrics);
  let totalInvested = 0;
  let totalValue = 0;
  let dayPnl = 0;
  let weekPnl = 0;

  metrics.forEach((m) => {
    totalInvested += m.invested;
    if (m.marketValue != null) totalValue += m.marketValue;
    if (m.dayChangePct != null && m.marketValue != null) {
      dayPnl += (m.dayChangePct / 100) * m.marketValue;
    }
    if (m.weekChangePct != null && m.marketValue != null) {
      weekPnl += (m.weekChangePct / 100) * m.marketValue;
    }
  });

  const pnl = totalValue - totalInvested;
  const pnlPct = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;
  const dayPnlPct = totalValue > 0 ? (dayPnl / totalValue) * 100 : 0;
  const weekPnlPct = totalValue > 0 ? (weekPnl / totalValue) * 100 : 0;

  const allocation = metrics
    .filter((m) => m.marketValue != null)
    .map((m) => ({
      name: m.meta.stock?.ticker ?? m.meta.bond?.ticker ?? m.position.ticker,
      value: m.marketValue!,
      pct: totalValue > 0 ? (m.marketValue! / totalValue) * 100 : 0,
      type: m.position.type,
    }))
    .sort((a, b) => b.value - a.value);

  const upcomingPayments: UpcomingPayment[] = [];
  metrics.forEach((m) => {
    if (m.meta.stock?.dividend?.nextPayment) {
      const d = m.meta.stock.dividend.nextPayment;
      upcomingPayments.push({
        ticker: m.meta.stock.ticker,
        name: m.meta.stock.name,
        type: 'dividend',
        date: d.date,
        amount: d.amount * m.position.quantity,
        perUnit: d.amount,
      });
    }
    if (m.meta.bond) {
      upcomingPayments.push({
        ticker: m.meta.bond.ticker,
        name: m.meta.bond.name,
        type: 'coupon',
        date: m.meta.bond.nextCouponDate,
        amount: m.meta.bond.couponAmount * m.position.quantity,
        perUnit: m.meta.bond.couponAmount,
      });
      const maturity = new Date(m.meta.bond.maturityDate);
      const days = (maturity.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      if (days > 0 && days < 365) {
        upcomingPayments.push({
          ticker: m.meta.bond.ticker,
          name: m.meta.bond.name,
          type: 'maturity',
          date: m.meta.bond.maturityDate,
          amount: m.meta.bond.faceValue * m.position.quantity,
          perUnit: m.meta.bond.faceValue,
        });
      }
    }
  });
  upcomingPayments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const riskWarnings: PortfolioSummary['riskWarnings'] = [];
  metrics.forEach((m) => {
    const b = m.meta.bond;
    if (b) {
      if (b.flags.highRisk)
        riskWarnings.push({
          ticker: b.ticker,
          message: 'Высокий кредитный риск эмитента — следите за финансовым состоянием.',
          level: 'high',
        });
      if (b.flags.lowLiquidity)
        riskWarnings.push({
          ticker: b.ticker,
          message: 'Низкая ликвидность — возможны сложности с продажей.',
          level: 'medium',
        });
      if (b.flags.hasOffer)
        riskWarnings.push({
          ticker: b.ticker,
          message: `Запланирована оферта (${new Date(b.flags.offerDate!).toLocaleDateString('ru-RU')}) — проверьте условия.`,
          level: 'medium',
        });
      if (b.flags.floatingCoupon)
        riskWarnings.push({
          ticker: b.ticker,
          message: 'Плавающий купон — размер выплаты может меняться.',
          level: 'low',
        });
    }
  });

  if (pnlPct < -10) {
    riskWarnings.push({
      ticker: 'Портфель',
      message: `Просадка портфеля ${pnlPct.toFixed(1)}% — стоит пересмотреть структуру.`,
      level: 'high',
    });
  }

  return {
    totalInvested,
    totalValue,
    pnl,
    pnlPct,
    dayPnl,
    dayPnlPct,
    weekPnl,
    weekPnlPct,
    positions: metrics,
    allocation,
    upcomingPayments,
    riskWarnings,
  };
}

// === Калькуляторы ===

export interface StockCalcInput {
  ticker: string;
  quantity?: number; // лотов
  amountRub?: number;
  buyPrice?: number;
  commissionPct: number;
  includeDividends: boolean;
}

export interface StockCalcResult {
  price: number;
  lotSize: number;
  lots: number;
  shares: number;
  cost: number;
  commission: number;
  total: number;
  expectedDividend: number;
  dividendYieldPct: number | null;
  scenarios: { label: string; pct: number; value: number; pnl: number }[];
  note: string[];
}

export function calcStock(input: StockCalcInput): StockCalcResult | null {
  const s = findStock(input.ticker);
  if (!s) return null;
  const price = input.buyPrice ?? s.price;
  const lotSize = s.lotSize;
  let lots = 0;
  if (input.quantity != null && input.quantity > 0) {
    lots = Math.floor(input.quantity);
  } else if (input.amountRub != null && input.amountRub > 0) {
    lots = Math.floor(input.amountRub / (price * lotSize));
  }
  const shares = lots * lotSize;
  const cost = shares * price;
  const commission = cost * (input.commissionPct / 100);
  const total = cost + commission;
  const divPerShare = s.dividend?.nextPayment?.amount ?? 0;
  const expectedDividend = input.includeDividends ? divPerShare * shares : 0;
  const dividendYieldPct = s.dividend?.yieldPct ?? null;
  const scenarios = [-10, -5, 0, 5, 10].map((pct) => {
    const newPrice = price * (1 + pct / 100);
    const value = newPrice * shares;
    const pnl = value - total + (input.includeDividends ? expectedDividend : 0);
    return { label: `${pct > 0 ? '+' : ''}${pct}%`, pct, value, pnl };
  });
  const note: string[] = ['Расчёты примерные.'];
  if (lots === 0) note.push('Введённой суммы или количества недостаточно для покупки лота.');
  if (!s.dividend) note.push('По бумаге нет данных о дивидендах.');
  return {
    price,
    lotSize,
    lots,
    shares,
    cost,
    commission,
    total,
    expectedDividend,
    dividendYieldPct,
    scenarios,
    note,
  };
}

export interface BondCalcInput {
  idOrIsin: string;
  quantity?: number;
  amountRub?: number;
  buyPricePct?: number;
  buyDate: string;
  exitDate?: string; // или undefined => до погашения
  commissionPct: number;
}

export interface BondCalcResult {
  faceValue: number;
  buyPricePct: number;
  pricePerUnit: number; // чистая цена
  accruedInterest: number;
  totalAccrued: number;
  quantity: number;
  cleanCost: number;
  dirtyCost: number;
  commission: number;
  totalCost: number;
  couponAmount: number;
  couponPeriodDays: number;
  nextCouponDate: string;
  maturityDate: string;
  exitDate: string;
  cashflow: { date: string; type: 'coupon' | 'maturity'; amount: number }[];
  totalCoupons: number;
  totalReturn: number;
  yieldAnnualPct: number | null;
  warnings: { level: 'low' | 'medium' | 'high'; message: string }[];
  note: string[];
}

export function calcBond(input: BondCalcInput): BondCalcResult | null {
  const b = findBond(input.idOrIsin);
  if (!b) return null;
  const buyPricePct = input.buyPricePct ?? b.pricePct;
  const pricePerUnit = (buyPricePct / 100) * b.faceValue;
  const accruedInterest = b.accruedInterest;
  let quantity = 0;
  if (input.quantity != null && input.quantity > 0) {
    quantity = Math.floor(input.quantity);
  } else if (input.amountRub != null && input.amountRub > 0) {
    quantity = Math.floor(input.amountRub / (pricePerUnit + accruedInterest));
  }
  const totalAccrued = accruedInterest * quantity;
  const cleanCost = pricePerUnit * quantity;
  const dirtyCost = cleanCost + totalAccrued;
  const commission = dirtyCost * (input.commissionPct / 100);
  const totalCost = dirtyCost + commission;

  const exitDate = input.exitDate ?? b.maturityDate;
  const startNext = new Date(b.nextCouponDate);
  const end = new Date(exitDate);
  const cashflow: BondCalcResult['cashflow'] = [];
  const cursor = new Date(startNext);
  while (cursor <= end) {
    cashflow.push({
      date: cursor.toISOString().slice(0, 10),
      type: 'coupon',
      amount: b.couponAmount * quantity,
    });
    cursor.setDate(cursor.getDate() + b.couponPeriodDays);
  }
  const isMaturity = !input.exitDate || input.exitDate === b.maturityDate;
  if (isMaturity) {
    cashflow.push({
      date: b.maturityDate,
      type: 'maturity',
      amount: b.faceValue * quantity,
    });
  }
  const totalCoupons = cashflow
    .filter((c) => c.type === 'coupon')
    .reduce((acc, c) => acc + c.amount, 0);
  // При досрочной продаже учитываем продажу по чистой цене текущего рынка
  const exitValue = isMaturity
    ? b.faceValue * quantity
    : (b.pricePct / 100) * b.faceValue * quantity + b.accruedInterest * quantity;
  const totalReturn = exitValue + totalCoupons - totalCost;
  const years =
    Math.max(
      0.01,
      (new Date(exitDate).getTime() - new Date(input.buyDate).getTime()) /
        (1000 * 60 * 60 * 24 * 365)
    );
  const yieldAnnualPct = totalCost > 0 ? (totalReturn / totalCost / years) * 100 : null;

  const warnings: BondCalcResult['warnings'] = [];
  if (b.flags.hasOffer)
    warnings.push({
      level: 'medium',
      message: `Запланирована оферта${b.flags.offerDate ? ` ${new Date(b.flags.offerDate).toLocaleDateString('ru-RU')}` : ''} — условия могут измениться.`,
    });
  if (b.flags.hasAmortization)
    warnings.push({ level: 'low', message: 'Предусмотрена амортизация номинала.' });
  if (b.flags.floatingCoupon)
    warnings.push({ level: 'low', message: 'Купон плавающий — размер выплат может меняться.' });
  if (b.flags.lowLiquidity)
    warnings.push({ level: 'medium', message: 'Низкая ликвидность — возможны сложности с продажей.' });
  if (b.flags.highRisk)
    warnings.push({ level: 'high', message: 'Высокий кредитный риск эмитента.' });

  const note = ['Расчёты примерные.', 'Доходность указана упрощённо без учёта налогов и реинвестирования.'];

  return {
    faceValue: b.faceValue,
    buyPricePct,
    pricePerUnit,
    accruedInterest,
    totalAccrued,
    quantity,
    cleanCost,
    dirtyCost,
    commission,
    totalCost,
    couponAmount: b.couponAmount,
    couponPeriodDays: b.couponPeriodDays,
    nextCouponDate: b.nextCouponDate,
    maturityDate: b.maturityDate,
    exitDate,
    cashflow,
    totalCoupons,
    totalReturn,
    yieldAnnualPct,
    warnings,
    note,
  };
}

// Group cashflow by month for chart
export function cashflowByMonth(cashflow: { date: string; amount: number }[]) {
  const map = new Map<string, number>();
  cashflow.forEach((c) => {
    const key = c.date.slice(0, 7); // YYYY-MM
    map.set(key, (map.get(key) ?? 0) + c.amount);
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({ month, amount }));
}
