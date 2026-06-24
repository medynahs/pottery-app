import React from 'react';
import { View, type ViewProps } from 'react-native';

export function Skeleton({ className = '', style }: ViewProps & { className?: string }) {
  return <View className={`rounded bg-muted ${className}`} style={style} />;
}

export function SkeletonCircle({ size, className = '' }: { size: number; className?: string }) {
  return (
    <View
      className={`rounded-full bg-muted ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export function SkeletonListRow() {
  return (
    <View className="flex-row items-center gap-3 py-3 px-4 bg-card rounded-2xl border border-border">
      <SkeletonCircle size={40} />
      <View className="flex-1 gap-1.5">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-2.5 w-20" />
      </View>
    </View>
  );
}

export function SkeletonFeedPost() {
  return (
    <View className="rounded-2xl border border-border bg-card p-4">
      <View className="flex-row items-center gap-3 mb-3">
        <SkeletonCircle size={36} />
        <View className="flex-1 gap-1.5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-2.5 w-16" />
        </View>
      </View>
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-3/4 mb-2" />
      <Skeleton className="h-3 w-1/2" />
    </View>
  );
}

export function SkeletonLeaderboardRow() {
  return (
    <View className="flex-row items-center gap-3 py-3 px-4 border-b border-border/40">
      <Skeleton className="w-6 h-6" />
      <SkeletonCircle size={36} />
      <View className="flex-1 gap-1.5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-2.5 w-36" />
      </View>
      <Skeleton className="w-8 h-5 rounded-full" />
    </View>
  );
}

export function SkeletonStudioCard() {
  return (
    <View className="rounded-2xl border border-border bg-card p-4 gap-2">
      <View className="flex-row items-center gap-3">
        <Skeleton className="w-11 h-11 rounded-xl" />
        <View className="flex-1 gap-1.5">
          <Skeleton className="h-3.5 w-36" />
          <Skeleton className="h-2.5 w-20" />
        </View>
      </View>
    </View>
  );
}
