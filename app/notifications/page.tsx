'use client';
import { Bell, Mail, MessageSquare, Smartphone, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Disclaimer } from '@/components/disclaimer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useNotifications } from '@/lib/portfolio-store';
import { useState } from 'react';

export default function NotificationsPage() {
  const { settings, setSettings, hydrated } = useNotifications();
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function save() {
    setSettings({ ...settings });
    setSavedAt(new Date().toLocaleTimeString('ru-RU'));
  }

  return (
    <div className="container py-10 max-w-4xl">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <Badge className="mb-2" variant="ai"><Bell className="h-3.5 w-3.5 mr-1" /> Уведомления</Badge>
          <h1 className="text-3xl font-semibold">Настройки уведомлений</h1>
          <p className="text-muted-foreground mt-1">
            В MVP реальные уведомления ещё не подключены — настраивайте поведение, и оно будет
            применено, как только появятся каналы доставки.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Частота</CardTitle>
            <CardDescription>Как часто вам удобно получать сводки.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-3">
              {(
                [
                  { id: 'daily', label: 'Ежедневно' },
                  { id: 'weekly', label: 'Раз в неделю' },
                  { id: 'important_only', label: 'Только важное' },
                ] as const
              ).map((opt) => {
                const active = settings.frequency === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSettings({ ...settings, frequency: opt.id })}
                    className={`rounded-lg border px-4 py-3 text-sm text-left transition-colors ${
                      active
                        ? 'border-[hsl(var(--ai))] bg-[hsl(var(--ai)/0.08)]'
                        : 'hover:bg-accent'
                    }`}
                  >
                    <div className="font-medium">{opt.label}</div>
                    <div className="text-muted-foreground text-xs mt-1">
                      {opt.id === 'daily' && 'Доступно на Premium и выше'}
                      {opt.id === 'weekly' && 'Доступно на любом тарифе'}
                      {opt.id === 'important_only' && 'Рекомендуем для большинства'}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Каналы доставки</CardTitle>
            <CardDescription>
              Подключение реальных каналов будет добавлено в следующих версиях.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ChannelRow
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              hint="Сводки и предупреждения на почту"
              checked={settings.channels.email}
              onChange={(v) =>
                setSettings({ ...settings, channels: { ...settings.channels, email: v } })
              }
            />
            <ChannelRow
              icon={<MessageSquare className="h-4 w-4" />}
              label="Telegram"
              hint="Уведомления через будущего Telegram-бота"
              checked={settings.channels.telegram}
              onChange={(v) =>
                setSettings({ ...settings, channels: { ...settings.channels, telegram: v } })
              }
            />
            <ChannelRow
              icon={<Smartphone className="h-4 w-4" />}
              label="Push (PWA)"
              hint="Push-уведомления в браузере / на устройство"
              checked={settings.channels.push}
              onChange={(v) =>
                setSettings({ ...settings, channels: { ...settings.channels, push: v } })
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Триггеры</CardTitle>
            <CardDescription>
              Когда отправлять уведомление. Поставьте 0, чтобы выключить порог.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="movepct">Если цена бумаги изменилась за день более чем на, %</Label>
                <Input
                  id="movepct"
                  type="number"
                  min={0}
                  step={0.5}
                  value={settings.triggers.priceMovePct}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      triggers: { ...settings.triggers, priceMovePct: Number(e.target.value) || 0 },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="drawdown">Если портфель просел более чем на, %</Label>
                <Input
                  id="drawdown"
                  type="number"
                  min={0}
                  step={0.5}
                  value={settings.triggers.portfolioDrawdownPct}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      triggers: {
                        ...settings.triggers,
                        portfolioDrawdownPct: Number(e.target.value) || 0,
                      },
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-3">
              <ToggleRow
                label="Важная новость по бумаге"
                checked={settings.triggers.importantNews}
                onChange={(v) =>
                  setSettings({ ...settings, triggers: { ...settings.triggers, importantNews: v } })
                }
              />
              <ToggleRow
                label="Скоро купон по облигации"
                checked={settings.triggers.couponSoon}
                onChange={(v) =>
                  setSettings({ ...settings, triggers: { ...settings.triggers, couponSoon: v } })
                }
              />
              <ToggleRow
                label="Скоро дивиденд по акции"
                checked={settings.triggers.dividendSoon}
                onChange={(v) =>
                  setSettings({ ...settings, triggers: { ...settings.triggers, dividendSoon: v } })
                }
              />
              <ToggleRow
                label="Приближается погашение облигации"
                checked={settings.triggers.maturitySoon}
                onChange={(v) =>
                  setSettings({ ...settings, triggers: { ...settings.triggers, maturitySoon: v } })
                }
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between gap-4">
          <Disclaimer compact className="flex-1" />
          <Button onClick={save} disabled={!hydrated}>
            <Save className="h-4 w-4" /> Сохранить
          </Button>
        </div>
        {savedAt && (
          <div className="text-sm text-emerald-600 dark:text-emerald-400">
            Настройки сохранены локально в {savedAt}.
          </div>
        )}
      </div>
    </div>
  );
}

function ChannelRow({
  icon,
  label,
  hint,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-md bg-secondary">{icon}</span>
        <div>
          <div className="text-sm font-medium">{label}</div>
          <div className="text-xs text-muted-foreground">{hint}</div>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-accent/40">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
