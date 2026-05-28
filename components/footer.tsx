import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t mt-16">
      <div className="container py-8 grid gap-6 md:grid-cols-4 text-sm">
        <div>
          <div className="font-semibold mb-2">РусИнвест Трекер</div>
          <p className="text-muted-foreground">
            Аналитика портфеля и инструменты для инвестора российского фондового рынка.
          </p>
        </div>
        <div>
          <div className="font-medium mb-2">Продукт</div>
          <ul className="space-y-1 text-muted-foreground">
            <li><Link href="/dashboard" className="hover:text-foreground">Дашборд</Link></li>
            <li><Link href="/calculators/stock" className="hover:text-foreground">Калькулятор акций</Link></li>
            <li><Link href="/calculators/bond" className="hover:text-foreground">Калькулятор облигаций</Link></li>
            <li><Link href="/notifications" className="hover:text-foreground">Уведомления</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-medium mb-2">Компания</div>
          <ul className="space-y-1 text-muted-foreground">
            <li><Link href="/pricing" className="hover:text-foreground">Тарифы</Link></li>
            <li><Link href="/" className="hover:text-foreground">О проекте</Link></li>
          </ul>
        </div>
        <div className="text-xs text-muted-foreground">
          Сервис носит информационный характер. Материалы не являются индивидуальной
          инвестиционной рекомендацией. Все расчёты примерные.
        </div>
      </div>
      <div className="border-t">
        <div className="container py-4 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2">
          <div>© {new Date().getFullYear()} РусИнвест Трекер. MVP.</div>
          <div>Данные — демонстрационные.</div>
        </div>
      </div>
    </footer>
  );
}
