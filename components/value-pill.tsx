import { cn, formatPct } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

export function ChangePill({ value, className }: { value: number | null | undefined; className?: string }) {
  if (value == null || Number.isNaN(value)) {
    return <span className="text-muted-foreground text-xs">—</span>;
  }
  const up = value >= 0;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium tabular',
        up ? 'bg-up-soft' : 'bg-down-soft',
        className
      )}
    >
      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {formatPct(value, { sign: true })}
    </span>
  );
}
