import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Disclaimer({
  text = 'Материал носит информационный характер и не является индивидуальной инвестиционной рекомендацией.',
  className,
  compact = false,
}: {
  text?: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-md border border-dashed bg-muted/40 text-muted-foreground',
        compact ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm',
        className
      )}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <p className="leading-snug">{text}</p>
    </div>
  );
}
