import { Badge } from '@/src/components/ui/badge';

import { Card } from '@/src/components/ui/card';

import { Text } from '@/src/components/ui/text';

import { Piece } from '@/src/types/pieces';

import { PiecePlaceholderArt } from '@/src/components/PiecePlaceholderArt';

import { Check, Layers, MoreHorizontal } from 'lucide-react-native';

import React from 'react';

import { Image, TouchableOpacity, View } from 'react-native';

import { AdvanceStageButton } from './AdvanceStageButton';



function formatDate(iso: string) {

  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

}



interface BatchCardProps {

  pieces: Piece[];

  stageLabel?: string;

  nextStageLabel?: string;

  selectionMode?: boolean;

  selectedCount?: number;

  onAdvanceAll: () => void;

  onExpand: () => void;

  onMore?: () => void;

  onToggleBatchSelect?: () => void;

}



export function BatchCard({ pieces, stageLabel, nextStageLabel, selectionMode = false, selectedCount = 0, onAdvanceAll, onExpand, onMore, onToggleBatchSelect }: BatchCardProps) {

  const rep = pieces[0];

  if (!rep) return null;



  const count = pieces.length;

  const setName = rep.name.replace(/\s+\d+$/, '');

  const hasImage = !!(rep.photo || rep.imgUrl);

  const allSelected = selectedCount === count && count > 0;

  const handlePress = () => {
    if (selectionMode) {
      onToggleBatchSelect?.();
      return;
    }
    onExpand();
  };

  const handleLongPress = () => {
    if (selectionMode) {
      onToggleBatchSelect?.();
      return;
    }
    onMore?.();
  };



  return (

    <View className="flex-1">

      <View className="relative pl-2 pt-2">

        {count >= 3 ? (

          <View

            className="absolute rounded-2xl border border-border bg-card"

            style={{ top: 0, left: 0, right: 8, bottom: 8, transform: [{ rotate: '-4deg' }], opacity: 0.45 }}

          />

        ) : null}

        {count >= 2 ? (

          <View

            className="absolute rounded-2xl border border-border bg-card"

            style={{ top: 3, left: 3, right: 4, bottom: 4, transform: [{ rotate: '-2deg' }], opacity: 0.7 }}

          />

        ) : null}



        <Card className={`overflow-hidden flex-1 ${allSelected ? 'border-2 border-primary' : ''}`}>

          <TouchableOpacity

            activeOpacity={0.85}

            onPress={handlePress}

            onLongPress={handleLongPress}

            delayLongPress={400}

          >

            <View className="aspect-square bg-muted/40 relative">

              {selectionMode ? (
                <View className={`absolute top-3 left-3 w-6 h-6 rounded-full border-2 items-center justify-center z-10 ${
                  allSelected ? 'bg-primary border-primary' : selectedCount > 0 ? 'bg-card/90 border-primary/50' : 'bg-card/90 border-border'
                }`}>
                  {allSelected ? <Check size={13} color="hsl(34 35% 92%)" strokeWidth={3} /> : null}
                </View>
              ) : null}

              {hasImage ? (

                <Image

                  source={{ uri: rep.photo ?? rep.imgUrl }}

                  className="w-full h-full"

                  resizeMode="cover"

                />

              ) : (

                <PiecePlaceholderArt seed={String(rep.id)} />

              )}



              <View className="absolute top-3 right-3">

                <Badge variant="outline" className="bg-card/90 border-0 rounded-full px-2.5 py-1">

                  <Text className="text-[10px] font-bold text-foreground">

                    {stageLabel ?? rep.stage}

                  </Text>

                </Badge>

              </View>



              <View className="absolute bottom-2 left-2 flex-row items-center gap-1 bg-foreground/75 rounded-full px-2 py-0.5">

                <Layers size={9} color="hsl(34 35% 92%)" />

                <Text className="text-[9px] font-bold text-background">×{count}</Text>

              </View>

            </View>



            <View className="p-3 bg-card">

              <Text className="font-serif font-bold text-sm text-foreground" numberOfLines={1}>

                {setName}

              </Text>

              <Text className="text-[11px] font-medium text-muted-foreground mt-0.5 uppercase tracking-wide">

                Set of {count} · {rep.clay}

              </Text>

              <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-border">

                <Text className="text-[10px] font-bold text-muted-foreground">{formatDate(rep.createdAt)}</Text>

                <View className="flex-row items-center gap-1">

                  <Text className="text-[10px] font-bold text-primary uppercase tracking-tight">Batch Set</Text>

                  {onMore && !selectionMode ? (

                    <TouchableOpacity onPress={onMore} activeOpacity={0.7} className="p-1 -mr-1">

                      <MoreHorizontal size={14} color="hsl(24 20% 55%)" />

                    </TouchableOpacity>

                  ) : null}

                </View>

              </View>

            </View>

          </TouchableOpacity>



          <View className="px-3 pb-3 flex-row gap-2">

          {!selectionMode && nextStageLabel && (

            <AdvanceStageButton

              stageLabel={nextStageLabel}

              suffix="all"

              onPress={onAdvanceAll}

            />

          )}

          </View>

        </Card>

      </View>

    </View>

  );

}

