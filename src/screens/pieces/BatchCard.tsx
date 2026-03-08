import { Badge } from '@/src/components/ui/badge';
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { ArrowRight, Layers, PackageCheck } from 'lucide-react-native';
import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { STAGE_LABEL, nextStage } from './constants';
import type { Piece } from './types';

interface BatchCardProps {
  pieces: Piece[];
  onAdvanceAll: () => void;
  onExpand: () => void;
}

export function BatchCard({ pieces, onAdvanceAll, onExpand }: BatchCardProps) {
  const rep = pieces[0];
  const next = nextStage(rep.stage);
  const count = pieces.length;
  // Strip trailing number: "Yunomi Cup 3" → "Yunomi Cup"
  const setName = rep.name.replace(/\s+\d+$/, '');
  const hasImage = !!(rep.photo || rep.imgUrl);

  return (
    <View className="mb-4" style={{ marginTop: 8 }}>
      {/* Stacked paper effect — strips behind the main card */}
      {count >= 3 && (
        <View
          className="rounded-2xl border border-border bg-card mx-4"
          style={{ height: 10, marginBottom: -10, transform: [{ rotate: '-1.8deg' }], opacity: 0.55 }}
        />
      )}
      <View
        className="rounded-2xl border border-border bg-card mx-2"
        style={{ height: 10, marginBottom: -10, transform: [{ rotate: '0.9deg' }], opacity: 0.75 }}
      />

      <TouchableOpacity activeOpacity={0.88} onPress={onExpand}>
        <Card className="overflow-hidden">
          <View className="flex-row">
            {/* Thumbnail */}
            <View className="w-28">
              <View className="aspect-square">
                {hasImage ? (
                  <Image
                    source={{ uri: rep.photo ?? rep.imgUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-full items-center justify-center bg-muted/60">
                    <PackageCheck size={28} color="hsl(24 20% 60%)" />
                  </View>
                )}
                {/* Count badge */}
                <View className="absolute bottom-2 right-2 flex-row items-center gap-0.5 bg-foreground/80 rounded-full px-2 py-0.5">
                  <Layers size={9} color="hsl(34 35% 92%)" />
                  <Text className="text-[10px] font-bold text-background ml-0.5">×{count}</Text>
                </View>
              </View>
            </View>

            {/* Info */}
            <View className="flex-1 px-3 py-3 justify-between">
              <View>
                <View className="flex-row items-start justify-between gap-2 mb-1">
                  <Text className="font-serif font-bold text-sm text-foreground flex-1" numberOfLines={1}>
                    {setName}
                  </Text>
                  <Badge variant="outline" className="bg-primary/10 border-0 rounded-full px-2.5 py-1">
                    <Text className="text-[10px] font-bold text-primary">
                      {STAGE_LABEL[rep.stage] ?? rep.stage}
                    </Text>
                  </Badge>
                </View>
                <Text className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                  Set of {count} · {rep.clay}
                </Text>
              </View>
              <Text className="text-[10px] text-muted-foreground mt-2">
                Tap to view individually →
              </Text>
            </View>
          </View>

          {/* Advance all button */}
          {next && (
            <View className="px-3 pb-3">
              <TouchableOpacity
                onPress={onAdvanceAll}
                activeOpacity={0.7}
                className="flex-row items-center justify-center gap-1.5 py-2 rounded-xl bg-primary/10"
              >
                <Text className="text-[11px] font-body-medium text-primary">
                  {STAGE_LABEL[next]} all {count}
                </Text>
                <ArrowRight size={11} color="hsl(15 50% 50%)" />
              </TouchableOpacity>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    </View>
  );
}
