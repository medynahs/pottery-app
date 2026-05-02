import { Text } from '@/src/components/ui/text';
import { Image } from 'expo-image';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Animated, Dimensions, ScrollView, TouchableOpacity, View } from 'react-native';
import { AVAILABLE_KILNKIN_COMPANIONS } from '../../overview/kilnkin/kilnkinCompanion';

const CARD_WIDTH = Dimensions.get('window').width - 48; // mx-6 on both sides

const PET_SOURCE: Record<string, any> = {
    fire: require('../../../../assets/animations/activeOven.gif'),
    earth: require('../../../../assets/images/clay-pet.png'),
    air: require('../../../../assets/animations/pet.gif'),
    water: require('../../../../assets/animations/kilnPet.gif'),
};

const ELEMENT_BG: Record<string, string> = {
    fire: '#fdf0e8',
    earth: '#f0ece4',
    air: '#edf2f8',
    water: '#e8eff2',
};

interface KilnkinStepProps {
    draft: any;
    updateDraft: (patch: Partial<any>) => void;
}

export const KilnkinStep: React.FC<KilnkinStepProps> = ({ draft, updateDraft }) => {
    const scrollRef = useRef<ScrollView>(null);
    const [currentIndex, setCurrentIndex] = useState(() => {
        const idx = AVAILABLE_KILNKIN_COMPANIONS.findIndex((c) => c.id === draft.kilnkinId);
        return idx >= 0 ? idx : 0;
    });

    const illustrationOpacity = useRef(new Animated.Value(1)).current;
    const prevId = useRef(draft.kilnkinId);

    const scaleAnims = useRef(
        AVAILABLE_KILNKIN_COMPANIONS.map(() => new Animated.Value(1))
    ).current;

    // Fade illustration when companion changes
    useEffect(() => {
        if (prevId.current !== draft.kilnkinId) {
            prevId.current = draft.kilnkinId;
            Animated.sequence([
                Animated.timing(illustrationOpacity, { toValue: 0, duration: 140, useNativeDriver: true }),
                Animated.timing(illustrationOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
            ]).start();
        }
    }, [draft.kilnkinId, illustrationOpacity]);

    // Auto-select first companion if none chosen
    useEffect(() => {
        if (!draft.kilnkinId) {
            updateDraft({ kilnkinId: AVAILABLE_KILNKIN_COMPANIONS[0].id });
        }
    }, []);

    // Scroll to pre-selected companion on mount
    useLayoutEffect(() => {
        if (currentIndex > 0) {
            scrollRef.current?.scrollTo({ x: currentIndex * CARD_WIDTH, animated: false });
        }
    }, []);

    const handlePet = (index: number) => {
        Animated.sequence([
            Animated.spring(scaleAnims[index], { toValue: 1.13, useNativeDriver: true, speed: 50, bounciness: 10 }),
            Animated.spring(scaleAnims[index], { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }),
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
        <View>

            {/* Heading */}
            <View className="px-6 pt-5 pb-2">
                <Text className="text-3xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold', lineHeight: 38 }}>
                    Choose your Kilnkin companion
                </Text>
                <Text className="text-sm text-muted-foreground mt-2 leading-6">
                    Pick the elemental companion that matches your studio energy.
                </Text>
            </View>

            {/* Swipe cards */}
            <View className="px-6 gap-3">
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
                            <TouchableOpacity onPress={() => handlePet(index)} activeOpacity={0.92}>
                                <Animated.View
                                    style={{
                                        transform: [{ scale: scaleAnims[index] }],
                                        borderRadius: 24,
                                        overflow: 'hidden',
                                        borderWidth: 1.5,
                                        borderColor: index === currentIndex ? 'hsl(24 20% 25%)' : 'hsl(24 10% 85%)',
                                        backgroundColor: ELEMENT_BG[companion.element],
                                    }}
                                >
                                    {/* Pet image */}
                                    <View style={{ alignItems: 'center', paddingTop: 32, paddingBottom: 24 }}>
                                        <Image
                                            source={PET_SOURCE[companion.element]}
                                            style={{ width: 148, height: 148 }}
                                            contentFit="contain"
                                        />
                                        <Text className="text-xs text-muted-foreground mt-3">Tap to pet âœ¨</Text>
                                    </View>

                                    {/* Info panel */}
                                    <View className="bg-card rounded-t-[24px] px-5 pt-4 pb-5">
                                        <View className="flex-row items-center justify-between mb-0.5">
                                            <Text className="text-xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>
                                                {companion.name}
                                            </Text>
                                            <View
                                                style={{
                                                    backgroundColor: ELEMENT_BG[companion.element],
                                                    borderRadius: 10,
                                                    paddingHorizontal: 8,
                                                    paddingVertical: 3,
                                                }}
                                            >
                                                <Text style={{ fontSize: 11, fontWeight: '600', color: 'hsl(24 20% 35%)', textTransform: 'capitalize' }}>
                                                    {companion.element}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text className="text-xs text-muted-foreground">{companion.species}</Text>
                                        <Text className="text-sm text-foreground mt-3 leading-5">{companion.loves}</Text>
                                        <View className="flex-row items-center gap-1.5 mt-2">
                                            <View className="h-1.5 w-1.5 rounded-full bg-primary" />
                                            <Text className="text-xs text-primary">{companion.notificationToneLabel}</Text>
                                        </View>
                                    </View>
                                </Animated.View>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>

                {/* 4 dot indicators */}
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
                    Swipe to meet each companion Â· You can change this in settings
                </Text>
            </View>
        </View>
    );
};


