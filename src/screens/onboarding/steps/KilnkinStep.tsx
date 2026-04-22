import { Text } from '@/src/components/ui/text';
import { Image } from 'expo-image';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Animated, Dimensions, ScrollView, TouchableOpacity, View } from 'react-native';
import { AVAILABLE_KILNKIN_COMPANIONS } from '../../overview/kilnkin/kilnkinCompanion';

const CARD_WIDTH = Dimensions.get('window').width - 48; // parent has px-6 (24px each side)

// One distinct visual per companion
const PET_SOURCE: Record<string, any> = {
    cinder: require('../../../../assets/animations/kilnPet.gif'),
    ember: require('../../../../assets/animations/pet.gif'),
    sage: require('../../../../assets/images/clay-pet.png'),
};

const CARD_BG: Record<string, string> = {
    gentle: '#f5ece0',
    playful: '#ede8f5',
    steady: '#e8f0e8',
};

const PERSONALITY_LABEL: Record<string, string> = {
    gentle: 'Warm & Reassuring',
    playful: 'Bright & Bouncy',
    steady: 'Grounded & Thoughtful',
};

interface KilnkinStepProps {
    draft: any;
    updateDraft: (patch: Partial<any>) => void;
    formatLabel: (value: string) => string;
}

export const KilnkinStep: React.FC<KilnkinStepProps> = ({ draft, updateDraft }) => {
    const scrollRef = useRef<ScrollView>(null);
    const [currentIndex, setCurrentIndex] = useState(() => {
        const idx = AVAILABLE_KILNKIN_COMPANIONS.findIndex((c) => c.id === draft.kilnkinId);
        return idx >= 0 ? idx : 0;
    });

    const scaleAnims = useRef(
        AVAILABLE_KILNKIN_COMPANIONS.map(() => new Animated.Value(1))
    ).current;

    // Auto-select first companion if none chosen yet
    useEffect(() => {
        if (!draft.kilnkinId) {
            updateDraft({ kilnkinId: AVAILABLE_KILNKIN_COMPANIONS[0].id });
        }
    }, []);

    // Scroll to the pre-selected companion on mount
    useLayoutEffect(() => {
        if (currentIndex > 0) {
            scrollRef.current?.scrollTo({ x: currentIndex * CARD_WIDTH, animated: false });
        }
    }, []);

    const handlePet = (index: number) => {
        Animated.sequence([
            Animated.spring(scaleAnims[index], {
                toValue: 1.13,
                useNativeDriver: true,
                speed: 50,
                bounciness: 10,
            }),
            Animated.spring(scaleAnims[index], {
                toValue: 1,
                useNativeDriver: true,
                speed: 20,
                bounciness: 6,
            }),
        ]).start();
    };

    const handleScrollEnd = (e: any) => {
        const index = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
        const clamped = Math.max(0, Math.min(index, AVAILABLE_KILNKIN_COMPANIONS.length - 1));
        if (clamped !== currentIndex) {
            setCurrentIndex(clamped);
            updateDraft({ kilnkinId: AVAILABLE_KILNKIN_COMPANIONS[clamped].id });
        }
    };

    return (
        <View className="mt-3 gap-3">
            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScrollEnd}
                decelerationRate="fast"
            >
                {AVAILABLE_KILNKIN_COMPANIONS.map((companion, index) => (
                    <View key={companion.id} style={{ width: CARD_WIDTH }}>
                        <View
                            className="rounded-[28px] overflow-hidden border border-border"
                            style={{ backgroundColor: CARD_BG[companion.personality] }}
                        >
                            {/* Pet image — tap to pet! */}
                            <TouchableOpacity
                                onPress={() => handlePet(index)}
                                activeOpacity={0.92}
                            >
                                <Animated.View
                                    style={{
                                        transform: [{ scale: scaleAnims[index] }],
                                        alignItems: 'center',
                                        paddingTop: 36,
                                        paddingBottom: 28,
                                    }}
                                >
                                    <Image
                                        source={PET_SOURCE[companion.id]}
                                        style={{ width: 148, height: 148 }}
                                        contentFit="contain"
                                    />
                                    <Text className="text-xs text-muted-foreground mt-3">
                                        Tap to pet ✨
                                    </Text>
                                </Animated.View>
                            </TouchableOpacity>

                            {/* Info panel */}
                            <View className="bg-card rounded-t-[24px] px-5 pt-4 pb-5">
                                <Text
                                    className="text-xl text-foreground"
                                    style={{ fontFamily: 'Fraunces_700Bold' }}
                                >
                                    {companion.name}
                                </Text>
                                <Text className="text-xs text-muted-foreground mt-0.5">
                                    {companion.species}
                                </Text>
                                <Text className="text-sm text-foreground mt-3 leading-5">
                                    {companion.loves}
                                </Text>
                                <View className="flex-row items-center gap-1.5 mt-2">
                                    <View className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    <Text className="text-xs text-primary">
                                        {PERSONALITY_LABEL[companion.personality]}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Dot progress indicators */}
            <View className="flex-row justify-center items-center gap-2">
                {AVAILABLE_KILNKIN_COMPANIONS.map((_, i) => (
                    <View
                        key={i}
                        style={{
                            height: 6,
                            width: i === currentIndex ? 18 : 6,
                            borderRadius: 3,
                            backgroundColor: i === currentIndex
                                ? 'hsl(24 20% 25%)'
                                : 'hsl(24 10% 78%)',
                        }}
                    />
                ))}
            </View>

            <Text className="text-xs text-center text-muted-foreground">
                Swipe to meet each companion · You can change this anytime
            </Text>
        </View>
    );
};