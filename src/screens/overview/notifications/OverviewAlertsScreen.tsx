import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { getStudioAlerts } from '@/src/screens/overview/notifications/getStudioAlerts';
import { useVisiblePieces, useAppStore, useVisibleFirings } from '@/src/store';
import { useRouter } from 'expo-router';
import { BellRing, CalendarDays, Flame, Gift, PackageOpen } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ALERT_META = {
  kiln: { Icon: Flame, iconColor: 'hsl(16 78% 52%)', chipClassName: 'bg-red-50' },
  planner: { Icon: CalendarDays, iconColor: 'hsl(213 70% 45%)', chipClassName: 'bg-blue-50' },
  seasonal: { Icon: Gift, iconColor: 'hsl(36 72% 45%)', chipClassName: 'bg-amber-50' },
  piece: { Icon: PackageOpen, iconColor: 'hsl(24 45% 40%)', chipClassName: 'bg-primary/10' },
} as const;

export default function OverviewAlertsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const companion = useAppStore((state) => state.kilnkinCompanion);
  const pieces = useVisiblePieces();
  const firings = useVisibleFirings();
  const studioRhythmConfig = useAppStore((state) => state.studioRhythmConfig);

  const alerts = React.useMemo(
    () => getStudioAlerts({ companion, pieces, firings, studioRhythmConfig }),
    [companion, firings, pieces, studioRhythmConfig]
  );

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <View>
          <Text className="text-xl font-bold text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>
            Notifications
          </Text>
          <Text className="text-sm text-muted-foreground mt-0.5">Latest notifications and gentle studio updates.</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} className="bg-muted px-4 py-2 rounded-full">
          <Text className="text-sm font-medium text-foreground">Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 mt-4" contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {alerts.length === 0 ? (
          <Card className="rounded-2xl border-border bg-card p-5">
            <Text className="text-base font-serif font-bold text-foreground mb-1">All Quiet</Text>
            <Text className="text-sm text-muted-foreground mb-4">
              No fresh alerts right now. Your kilnkin will nudge you when the studio shifts.
            </Text>
            <Button size="sm" variant="outline" className="self-start rounded-xl px-4" onPress={() => router.push('/profile/studio-rhythm')}>
              <Text className="text-sm">Edit Rhythm</Text>
            </Button>
          </Card>
        ) : (
          alerts.map((alert) => {
            const meta = ALERT_META[alert.type];
            const Icon = meta.Icon;

            return (
              <Card key={alert.id} className="rounded-2xl border-border bg-card p-4 mb-3">
                <View className="flex-row items-start justify-between gap-3 mb-3">
                  <View className="flex-row items-center gap-3 flex-1 pr-2">
                    <View className={`w-10 h-10 rounded-xl items-center justify-center border border-border ${meta.chipClassName}`}>
                      <Icon size={18} color={meta.iconColor} />
                    </View>

                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-foreground">{alert.title}</Text>
                      <Text className="text-xs text-muted-foreground mt-1 leading-5">{alert.body}</Text>
                    </View>
                  </View>

                  <View className="rounded-full px-2 py-1 border bg-muted border-border">
                    <Text className="text-[10px] font-medium text-muted-foreground">{alert.freshnessLabel}</Text>
                  </View>
                </View>

                <Button
                  size="sm"
                  variant="outline"
                  className="self-start rounded-xl px-4"
                  onPress={() => router.push(alert.route as never)}
                >
                  <Text className="text-sm">{alert.actionLabel}</Text>
                </Button>
              </Card>
            );
          })
        )}

        <Card className="rounded-2xl border-border bg-card p-4 mt-1">
          <View className="flex-row items-center gap-2 mb-2">
            <BellRing size={16} color="hsl(30 72% 44%)" />
            <Text className="text-base font-serif font-bold text-foreground">About Alerts</Text>
          </View>
          <Text className="text-sm text-muted-foreground leading-6">
            Alerts combine kiln activity, Studio Rhythm events, seasonal wrap nudges, and gentle updates from your kilnkin.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}
