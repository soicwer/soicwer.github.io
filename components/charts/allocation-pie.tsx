'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatRub } from '@/lib/utils';

const STOCK_COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6'];
const BOND_COLORS = ['#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b'];

export function AllocationPie({
  data,
}: {
  data: { name: string; value: number; pct: number; type: 'stock' | 'bond' }[];
}) {
  if (!data.length) {
    return <div className="text-sm text-muted-foreground">Данные недоступны</div>;
  }
  let si = 0;
  let bi = 0;
  const colored = data.map((d) => ({
    ...d,
    fill:
      d.type === 'stock'
        ? STOCK_COLORS[si++ % STOCK_COLORS.length]
        : BOND_COLORS[bi++ % BOND_COLORS.length],
  }));

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={colored}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={2}
            stroke="hsl(var(--background))"
          >
            {colored.map((d, i) => (
              <Cell key={i} fill={d.fill} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value: number, _name, item: any) => [
              `${formatRub(value)} (${item.payload.pct.toFixed(1)}%)`,
              item.payload.name,
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
