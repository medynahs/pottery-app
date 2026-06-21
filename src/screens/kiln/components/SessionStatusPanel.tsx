import { Button } from '@/src/components/ui/button';
import { Text } from '@/src/components/ui/text';
import type { Firing, FiringStatusOverride, Kiln } from '@/src/types/kiln';
import {
  CalendarClock,
  CheckCircle2,
  Flame,
  PackageCheck,
  RotateCcw,
} from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';
import {
  type AutoFiringStatus,
  getAutoFiringStatus,
  getScheduledAutoStatus,
} from '../firingEstimations';
import { KILN_UI } from '../utils/kilnTheme';

const STATUS_LABEL: Record<AutoFiringStatus, string> = {
  waiting: 'In queue',
  firing: 'Firing',
  cooling: 'Cooling down',
  ready: 'Ready for pickup',
  completed: 'Completed',
};

const OVERRIDE_HINT: Record<FiringStatusOverride, string> = {
  fired: 'Marked as firing now',
  ready: 'Marked ready for pickup',
  'picked-up': 'Marked as picked up',
};

type SessionStatusPanelProps = {
  firing: Firing;
  kiln?: Kiln;
  showCompletionForm: boolean;
  onSetStatusOverride: (override: FiringStatusOverride) => void;
  onClearStatusOverride: () => void;
  onMarkPickedUp: () => void;
};

function StatusAction({
  icon: Icon,
  label,
  hint,
  onPress,
  primary,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  hint?: string;
  onPress: () => void;
  primary?: boolean;
}) {
  if (primary) {
    return (
      <Button onPress={onPress} className="w-full mt-1">
        <View className="flex-row items-center justify-center gap-2">
          <Icon size={16} color={KILN_UI.cream} />
          <Text className="font-semibold text-primary-foreground">{label}</Text>
        </View>
      </Button>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-2xl border px-3 py-3"
      style={{ borderColor: KILN_UI.brownSoftBorder, backgroundColor: KILN_UI.warmCard }}
    >
      <View
        className="w-9 h-9 rounded-xl items-center justify-center"
        style={{ backgroundColor: KILN_UI.brownSoft }}
      >
        <Icon size={17} color={KILN_UI.brown} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-foreground">{label}</Text>
        {hint ? (
          <Text className="text-xs text-muted-foreground mt-0.5 leading-4">{hint}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export function SessionStatusPanel({
  firing,
  kiln,
  showCompletionForm,
  onSetStatusOverride,
  onClearStatusOverride,
  onMarkPickedUp,
}: SessionStatusPanelProps) {
  const autoStatus = getAutoFiringStatus(firing, kiln);
  const scheduledStatus = getScheduledAutoStatus(firing, kiln);
  const override = firing.statusOverride;

  const canMarkFiring = scheduledStatus === 'waiting' && override !== 'fired';
  const canMarkReady =
    autoStatus !== 'ready' && autoStatus !== 'completed' && override !== 'ready';
  const canMarkPickedUp = autoStatus === 'ready' && !showCompletionForm;
  const canResetSchedule = !!override;
  const showPanel =
    canMarkFiring || canMarkReady || canMarkPickedUp || canResetSchedule || !!override;

  if (!showPanel) return null;

  return (
    <View className="mb-4">
      <Text
        className="text-[11px] font-semibold uppercase tracking-wider mb-2"
        style={{ color: KILN_UI.brownMuted }}
      >
        Session status
      </Text>

      <View
        className="rounded-2xl border p-4 gap-3"
        style={{ borderColor: KILN_UI.brownSoftBorder, backgroundColor: KILN_UI.warmCard }}
      >
        <View className="flex-row items-center gap-2">
          <CalendarClock size={15} color={KILN_UI.brownMuted} />
          <Text className="text-sm font-semibold text-foreground">
            {STATUS_LABEL[autoStatus]}
          </Text>
        </View>

        {override ? (
          <Text className="text-xs text-muted-foreground leading-5">
            {OVERRIDE_HINT[override]}
            {scheduledStatus !== autoStatus
              ? ` · schedule says ${STATUS_LABEL[scheduledStatus].toLowerCase()}`
              : ''}
          </Text>
        ) : scheduledStatus !== autoStatus ? null : (
          <Text className="text-xs text-muted-foreground leading-5">
            Based on your kiln timing. Adjust below if the studio ran early or late.
          </Text>
        )}

        {canMarkFiring ? (
          <StatusAction
            icon={Flame}
            label="Studio fired early"
            hint="Show this session as firing now"
            onPress={() => onSetStatusOverride('fired')}
          />
        ) : null}

        {canMarkReady ? (
          <StatusAction
            icon={PackageCheck}
            label="Ready to collect"
            hint="Pieces are out. Skip to pickup"
            onPress={() => onSetStatusOverride('ready')}
          />
        ) : null}

        {canMarkPickedUp ? (
          <StatusAction
            icon={CheckCircle2}
            label="Mark as picked up"
            hint="Complete this firing and record the outcome"
            onPress={onMarkPickedUp}
            primary
          />
        ) : null}

        {canResetSchedule ? (
          <Pressable onPress={onClearStatusOverride} hitSlop={8} className="self-start mt-1">
            <View className="flex-row items-center gap-1.5">
              <RotateCcw size={13} color={KILN_UI.brownMuted} />
              <Text className="text-xs font-semibold" style={{ color: KILN_UI.brownMuted }}>
                Use scheduled dates again
              </Text>
            </View>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
