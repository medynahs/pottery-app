import { Text } from '@/src/components/ui/text';
import {
    BookOpen,
    X
} from 'lucide-react-native';
import React from 'react';
import {
    TouchableOpacity,
    View
} from 'react-native';
import type { Piece } from '../../../types/pieces';

export function JournalHeader({ piece, isCompact, activeSubtitle, onClose }: { piece: Piece; isCompact: boolean; activeSubtitle: string; onClose: () => void }) {
    return (
        <View className="flex-row items-center justify-between mb-4 px-2">
            <View className="flex-row items-center gap-3 flex-1 pr-3">
                <View className="rounded-full items-center justify-center" style={{ width: isCompact ? 36 : 40, height: isCompact ? 36 : 40, backgroundColor: 'rgba(255, 244, 228, 0.12)' }}>
                    <BookOpen size={isCompact ? 16 : 18} color="#F4DFC0" />
                </View>
                <View className="flex-1">
                    <Text className="text-[11px] font-bold uppercase tracking-[1.8px] text-white/70 mb-1">
                        Artisan Journal
                    </Text>
                    <Text className="font-serif text-white" style={{ fontSize: isCompact ? 21 : 24 }} numberOfLines={1}>{piece.name}</Text>
                    {!isCompact ? <Text className="text-sm text-white/72 mt-1" numberOfLines={1}>{activeSubtitle}</Text> : null}
                </View>
            </View>
            <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.8}
                accessibilityLabel="Close journal"
                style={{
                    width: isCompact ? 38 : 42,
                    height: isCompact ? 38 : 42,
                    borderRadius: 999,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 244, 228, 0.12)',
                }}
            >
                <X size={20} color="#F4DFC0" />
            </TouchableOpacity>
        </View>
    );
}
