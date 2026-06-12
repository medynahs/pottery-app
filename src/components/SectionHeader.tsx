import { Text } from '@/src/components/ui/text';
import { ChevronDown, ChevronRight } from 'lucide-react-native';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

interface SectionHeaderProps {
  label: string;
  count?: number;
  className?: string;
}

/** Uppercase section label with optional count badge — used in community tabs. */
export function SectionHeader({ label, count, className = 'mb-1' }: SectionHeaderProps) {
  return (
    <View className={`flex-row items-center gap-2 ${className}`}>
      <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </Text>
      {count !== undefined ? (
        <View className="px-1.5 py-0.5 rounded-full bg-muted">
          <Text className="text-xs font-bold text-muted-foreground">{count}</Text>
        </View>
      ) : null}
    </View>
  );
}

interface CollapsibleSectionProps {
  label: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/** Tappable section header that expands/collapses its children. */
export function CollapsibleSection({
  label,
  count,
  defaultOpen = true,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View className="gap-2">
      <TouchableOpacity
        onPress={() => setOpen((v) => !v)}
        className="flex-row items-center gap-2"
        activeOpacity={0.7}
      >
        <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-1">
          {label}
        </Text>
        {count !== undefined ? (
          <View className="px-1.5 py-0.5 rounded-full bg-muted">
            <Text className="text-xs font-bold text-muted-foreground">{count}</Text>
          </View>
        ) : null}
        {open
          ? <ChevronDown size={14} color="hsl(0 0% 60%)" />
          : <ChevronRight size={14} color="hsl(0 0% 60%)" />}
      </TouchableOpacity>
      {open ? children : null}
    </View>
  );
}
