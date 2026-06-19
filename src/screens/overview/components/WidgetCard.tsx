import { Text } from '@/src/components/ui/text';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

type WidgetCardProps = {
  title: string;
  status?: string;
  description?: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  expanded?: boolean;
  onToggleExpand?: () => void;
  accentColor?: string;
  children?: React.ReactNode;
};

export function WidgetCard({
  title,
  status,
  description,
  primaryActionLabel,
  onPrimaryAction,
  expanded = true,
  onToggleExpand,
  accentColor = 'hsl(31 44% 34%)',
  children,
}: WidgetCardProps) {
  return (
    <View
      className="rounded-2xl overflow-hidden mb-4"
      style={{
        backgroundColor: 'hsl(40 30% 99%)',
        shadowColor: '#3f2a12',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <View className="px-4 py-3" style={{ backgroundColor: 'hsl(38 28% 96%)' }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-2">
            <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 0.9, color: accentColor, textTransform: 'uppercase' }}>{title}</Text>
            {description ? <Text style={{ fontSize: 11, color: 'hsl(32 30% 42%)', marginTop: 3 }}>{description}</Text> : null}
          </View>
          <View className="flex-row items-center gap-2">
            {status ? <Text style={{ fontSize: 11, fontWeight: '600', color: 'hsl(32 30% 42%)' }}>{status}</Text> : null}
            {onToggleExpand ? (
              <TouchableOpacity
                onPress={onToggleExpand}
                activeOpacity={0.82}
                className="w-7 h-7 rounded-full items-center justify-center"
                style={{ backgroundColor: 'hsl(34 28% 90%)' }}
              >
                {expanded ? <ChevronUp size={15} color="hsl(31 40% 34%)" /> : <ChevronDown size={15} color="hsl(31 40% 34%)" />}
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
        {primaryActionLabel && onPrimaryAction ? (
          <TouchableOpacity
            onPress={onPrimaryAction}
            activeOpacity={0.82}
            className="rounded-full px-3 py-1.5 flex-row items-center gap-1 self-start mt-2"
            style={{ backgroundColor: 'hsl(35 42% 80%)' }}
          >
            <Plus size={12} color="hsl(33 42% 32%)" />
            <Text style={{ fontSize: 11, fontWeight: '600', color: 'hsl(33 42% 32%)' }}>{primaryActionLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {expanded ? children : null}
    </View>
  );
}
