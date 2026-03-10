// src/screens/kiln/components/FiringRows.tsx
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { FIRING_TYPE_LABELS } from '../constants';
import type { Firing } from '../types';
import { formatDate } from './kilnUtils';

// ── WaitingPieceRow ───────────────────────────────────────────────────────────

interface WaitingPieceRowProps {
  name: string;
  sublabel: string;
  dotColor: string;
  isLast?: boolean;
}

export function WaitingPieceRow({ name, sublabel, dotColor, isLast }: WaitingPieceRowProps) {
  return (
    <View
      className="flex-row items-center py-2.5"
      style={isLast ? undefined : { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.07)' }}
    >
      <View
        className="w-2 h-2 rounded-full mr-3"
        style={{ backgroundColor: dotColor }}
      />
      <View className="flex-1">
        <Text className="text-sm font-medium text-foreground">{name}</Text>
        <Text className="text-xs text-muted-foreground">{sublabel}</Text>
      </View>
    </View>
  );
}

// ── ScheduledFiringRow ────────────────────────────────────────────────────────

interface ScheduledFiringRowProps {
  firing: Firing;
  kilnName: string;
  onPress: () => void;
}

export function ScheduledFiringRow({ firing, kilnName, onPress }: ScheduledFiringRowProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card className="p-4 flex-row items-center justify-between mb-2">
        <View className="flex-1">
          <Text className="font-semibold text-sm text-foreground">{firing.name}</Text>
          <Text className="text-xs text-muted-foreground mt-0.5">
            {kilnName} · {FIRING_TYPE_LABELS[firing.type]} · Cone {firing.cone}
          </Text>
          <Text className="text-xs text-muted-foreground">
            {firing.pieceIds.length} piece{firing.pieceIds.length !== 1 ? 's' : ''} assigned
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="bg-blue-100 px-2.5 py-1 rounded-full">
            <Text className="text-xs font-semibold text-blue-700">Scheduled</Text>
          </View>
          <ChevronRight size={14} color="hsl(24 20% 40%)" />
        </View>
      </Card>
    </TouchableOpacity>
  );
}

// ── FiringHistoryRow ──────────────────────────────────────────────────────────

interface FiringHistoryRowProps {
  firing: Firing;
  kilnName: string;
  onPress: () => void;
}

export function FiringHistoryRow({ firing, kilnName, onPress }: FiringHistoryRowProps) {
  const isSuccess = firing.result === 'success';
  const isIssues = firing.result === 'issues';
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card className="p-4 flex-row items-center justify-between mb-2">
        <View className="flex-1">
          <Text className="font-semibold text-sm text-foreground">{firing.name}</Text>
          <Text className="text-xs text-muted-foreground mt-0.5">
            {firing.completedAt ? formatDate(firing.completedAt) : '—'}
            {kilnName ? `  ·  ${kilnName}` : ''}
          </Text>
          <Text className="text-xs text-muted-foreground">
            {firing.pieceIds.length} piece{firing.pieceIds.length !== 1 ? 's' : ''}
            {firing.cone ? `  ·  Cone ${firing.cone}` : ''}
          </Text>
        </View>
        <View
          className="px-3 py-1 rounded-full"
          style={{
            backgroundColor: isSuccess
              ? 'hsl(142 60% 94%)'
              : isIssues
              ? 'hsl(39 80% 94%)'
              : 'hsl(0 70% 94%)',
          }}
        >
          <Text
            className="text-xs font-semibold"
            style={{
              color: isSuccess
                ? 'hsl(142 60% 35%)'
                : isIssues
                ? 'hsl(39 80% 35%)'
                : 'hsl(0 70% 40%)',
            }}
          >
            {firing.result === 'success'
              ? 'Success'
              : firing.result === 'issues'
              ? 'Issues'
              : 'Failure'}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
