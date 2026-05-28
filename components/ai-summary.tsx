import { Sparkles, ShieldAlert, ThumbsUp, CalendarDays, ClipboardList } from 'lucide-react';
import type { AISummary } from '@/lib/types';
import { Disclaimer } from '@/components/disclaimer';
import { Badge } from '@/components/ui/badge';

export function AISummaryCard({ summary, title = 'AI-разбор' }: { summary: AISummary; title?: string }) {
  return (
    <section className="bg-ai-soft rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-[hsl(var(--ai))] text-[hsl(var(--ai-foreground))]">
            <Sparkles className="h-4 w-4" />
          </span>
          <h3 className="font-semibold text-base">{title}</h3>
        </div>
        <Badge variant="ai">Аналитическая сводка</Badge>
      </div>

      <p className="text-sm leading-relaxed">{summary.short}</p>

      <div className="grid gap-4 md:grid-cols-2">
        <Block icon={<ThumbsUp className="h-4 w-4" />} title="Позитивные факторы" items={summary.positives} tone="up" />
        <Block icon={<ShieldAlert className="h-4 w-4" />} title="Возможные риски" items={summary.risks} tone="down" />
        <Block icon={<CalendarDays className="h-4 w-4" />} title="Ближайшие события" items={summary.upcoming} />
        <Block icon={<ClipboardList className="h-4 w-4" />} title="Что стоит проверить" items={summary.watchlist} />
      </div>

      <div className="rounded-md bg-background/60 p-3 text-sm border">
        <span className="font-medium">Вывод. </span>
        {summary.conclusion}
      </div>

      <Disclaimer compact />
    </section>
  );
}

function Block({
  icon,
  title,
  items,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  tone?: 'up' | 'down';
}) {
  if (!items.length) return null;
  return (
    <div className="rounded-md bg-background/60 border p-3">
      <div className="flex items-center gap-2 mb-2 text-sm font-medium">
        <span
          className={
            tone === 'up'
              ? 'text-emerald-600 dark:text-emerald-400'
              : tone === 'down'
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-muted-foreground'
          }
        >
          {icon}
        </span>
        {title}
      </div>
      <ul className="space-y-1 text-sm">
        {items.map((i, idx) => (
          <li key={idx} className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-muted-foreground/60 shrink-0" />
            <span className="text-foreground/90">{i}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
