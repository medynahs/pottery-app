import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store/appStore';
import { DollarSign, ImageIcon, Package, Sparkles, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import type { Piece } from '../pieces/types';

// Tile accent colours cycling for pieces without photos
const TILE_PALETTES = [
  { bg: '#f5e6d3', text: '#7c4a2d' },
  { bg: '#dde8d5', text: '#3a6b2e' },
  { bg: '#d5dff2', text: '#2c4a8a' },
  { bg: '#f0ddf5', text: '#6b2c8a' },
  { bg: '#f5ecd5', text: '#8a6b2c' },
  { bg: '#d5f0ee', text: '#2c7a74' },
];

function palette(id: number) {
  return TILE_PALETTES[id % TILE_PALETTES.length];
}

function PhotoTile({ piece, size, onPress }: { piece: Piece; size: number; onPress: () => void }) {
  const imgUri = piece.imgUrl ?? piece.photo;
  const pal = palette(piece.id);
  const isFinished = piece.stage === 'finished';
  return (
    <TouchableOpacity activeOpacity={0.88} onPress={onPress} style={{ width: size, height: size }}>
      {imgUri ? (
        <Image source={{ uri: imgUri }} style={{ width: size, height: size }} resizeMode="cover" />
      ) : (
        <View style={{ width: size, height: size, backgroundColor: pal.bg, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: size * 0.25, fontWeight: '700', color: pal.text, letterSpacing: -1 }}>
            {piece.name.slice(0, 2).toUpperCase()}
          </Text>
        </View>
      )}
      {/* Finished: gold corner accent */}
      {isFinished ? (
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          borderWidth: 2, borderColor: 'hsl(38 65% 55%)',
        }} pointerEvents="none" />
      ) : null}
      {/* For-sale badge */}
      {piece.price ? (
        <View style={{
          position: 'absolute', bottom: 5, left: 5,
          backgroundColor: 'hsl(38 65% 55%)',
          borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2,
          flexDirection: 'row', alignItems: 'center', gap: 2,
        }}>
          <DollarSign size={9} color="white" />
          <Text style={{ fontSize: 9, color: 'white', fontWeight: '700' }}>{piece.price}</Text>
        </View>
      ) : null}
      {/* Finished sparkle (no price) */}
      {isFinished && !piece.price ? (
        <View style={{
          position: 'absolute', top: 5, right: 5,
          backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 99, padding: 3,
        }}>
          <Sparkles size={9} color="hsl(38 80% 70%)" />
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

function PieceDetailSheet({ piece, onClose }: { piece: Piece; onClose: () => void }) {
  const { width } = useWindowDimensions();
  const imgUri = piece.imgUrl ?? piece.photo;
  const pal = palette(piece.id);
  const finishedAt = piece.timeline.find(t => t.stage === 'finished')?.timestamp
    ?? piece.timeline[piece.timeline.length - 1]?.timestamp;
  const dateLabel = finishedAt
    ? new Date(finishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <View className="bg-background rounded-t-3xl overflow-hidden" style={{ maxHeight: '90%' }}>
      <View style={{ width: '100%', height: width * 0.75, backgroundColor: pal.bg }}>
        {imgUri ? (
          <Image source={{ uri: imgUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ImageIcon size={48} color={pal.text} />
          </View>
        )}
        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.8}
          style={{
            position: 'absolute', top: 14, right: 14,
            backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 99, padding: 7,
          }}
        >
          <X size={18} color="white" />
        </TouchableOpacity>
        <View style={{
          position: 'absolute', bottom: 14, left: 14,
          backgroundColor: piece.stage === 'finished' ? 'rgba(60,140,60,0.85)' : 'rgba(0,0,0,0.5)',
          borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4,
        }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: 'white', textTransform: 'capitalize' }}>
            {piece.stage}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-start justify-between mb-1">
          <Text className="text-2xl font-serif font-bold text-foreground flex-1 pr-4">{piece.name}</Text>
          {piece.price ? (
            <View className="px-3 py-1.5 rounded-xl" style={{ backgroundColor: 'hsl(38 55% 55%)' }}>
              <Text className="text-white font-bold text-base">${piece.price}</Text>
            </View>
          ) : null}
        </View>

        <View className="flex-row items-center gap-2 flex-wrap mb-4">
          {piece.status ? (
            <View className="px-2.5 py-0.5 rounded-full bg-muted">
              <Text className="text-xs font-semibold text-foreground capitalize">{piece.status}</Text>
            </View>
          ) : null}
          {dateLabel ? (
            <Text className="text-xs text-muted-foreground">{dateLabel}</Text>
          ) : null}
        </View>

        <View className="flex-row flex-wrap gap-y-3 mb-5">
          {piece.clay ? <DetailChip label="Clay" value={piece.clay} /> : null}
          {piece.form ? <DetailChip label="Form" value={piece.form} /> : null}
          {piece.formingMethod ? <DetailChip label="Method" value={piece.formingMethod} /> : null}
          {piece.dimensions ? <DetailChip label="Size" value={piece.dimensions} /> : null}
          {piece.weight ? <DetailChip label="Weight" value={piece.weight} /> : null}
          {piece.glazeTemp ? <DetailChip label="Glaze" value={piece.glazeTemp} /> : null}
        </View>

        {piece.notes ? (
          <View className="bg-card border border-border rounded-2xl p-4">
            <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Notes</Text>
            <Text className="text-sm text-foreground leading-relaxed">{piece.notes}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function DetailChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ width: '50%', paddingRight: 8 }}>
      <Text className="text-xs text-muted-foreground mb-0.5">{label}</Text>
      <Text className="text-sm font-semibold text-foreground">{value}</Text>
    </View>
  );
}

export function PortfolioTab() {
  const { width } = useWindowDimensions();
  const pieces = useAppStore((s) => s.pieces);
  const [selected, setSelected] = useState<Piece | null>(null);

  const active = pieces.filter(p => p.stage !== 'cemetery');

  const GAP = 2;
  const COLS = 3;
  const tileSize = Math.floor((width - GAP * (COLS - 1)) / COLS);

  return (
    <View>
      {/* Full photo grid */}
      {active.length === 0 ? (
        <View className="items-center justify-center py-16 gap-3">
          <Package size={40} color="hsl(24 20% 60%)" />
          <Text className="text-sm text-muted-foreground font-medium">No pieces yet</Text>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GAP }}>
          {active.map(piece => (
            <PhotoTile
              key={piece.id}
              piece={piece}
              size={tileSize}
              onPress={() => setSelected(piece)}
            />
          ))}
        </View>
      )}

      {/* Detail sheet */}
      <Modal
        visible={!!selected}
        animationType="slide"
        transparent
        onRequestClose={() => setSelected(null)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' }}>
          <Pressable
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onPress={() => setSelected(null)}
          />
          {selected && <PieceDetailSheet piece={selected} onClose={() => setSelected(null)} />}
        </View>
      </Modal>
    </View>
  );
}
