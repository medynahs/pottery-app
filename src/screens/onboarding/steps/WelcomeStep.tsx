import { IllustrationSlot } from '@/src/components/IllustrationSlot';
import { Text } from '@/src/components/ui/text';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, View } from 'react-native';

interface WelcomeStepProps {
    draft: any;
    updateDraft: (patch: Partial<any>) => void;
}

const CORE_FEATURES = [
    { emoji: '🏺', label: 'Stage tracking', desc: 'Every piece from throw to finished, logged.' },
    { emoji: '🔥', label: 'Kiln ops', desc: 'Schedule firings, track temps, manage loads.' },
    { emoji: '📊', label: 'Studio analytics', desc: 'Survival rates, clay usage, cost per firing.' },
    { emoji: '💰', label: 'Pricing tools', desc: 'Real cost-based pricing for your work.' },
];

const EXTRA_FEATURES = [
    { emoji: '🤝', label: 'Community' },
    { emoji: '🎯', label: 'Daily missions' },
    { emoji: '🧪', label: 'Glaze library' },
    { emoji: '🏆', label: 'Badges & XP' },
];

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ draft, updateDraft }) => {
    const contentOpacity = useRef(new Animated.Value(0)).current;
    const petY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 400,
            delay: 180,
            useNativeDriver: true,
        }).start();

        const bobLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(petY, {
                    toValue: -7,
                    duration: 1800,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
                Animated.timing(petY, {
                    toValue: 0,
                    duration: 1800,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
            ])
        );
        bobLoop.start();
        return () => bobLoop.stop();
    }, []);

    return (
        <View>
            {/* Illustration with floating clay-pet sticker */}
            <IllustrationSlot imageSource={require('../../../../assets/images/pottery-studio.png')}>
                <Animated.View
                    style={{
                        position: 'absolute',
                        bottom: 10,
                        right: 14,
                        transform: [{ translateY: petY }],
                    }}
                >
                    <Image
                        source={require('../../../../assets/images/clay-pet.png')}
                        style={{ width: 62, height: 62 }}
                        resizeMode="contain"
                    />
                </Animated.View>
            </IllustrationSlot>

            {/* Heading */}
            <Animated.View style={{ opacity: contentOpacity }} className="px-6 pt-5 pb-2">
                <Text className="text-3xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold', lineHeight: 38 }}>
                    Welcome to your cozy pottery studio
                </Text>
                <Text className="text-sm text-muted-foreground mt-2 leading-6">
                    Track, create, and celebrate every piece with calm guidance and playful support.
                </Text>
            </Animated.View>

            {/* Feature highlights */}
            <Animated.View style={{ opacity: contentOpacity }} className="px-6 mt-1 gap-3">
                {/* 2×2 core feature grid */}
                <View className="flex-row gap-3">
                    {CORE_FEATURES.slice(0, 2).map((f) => (
                        <View key={f.label} className="flex-1 rounded-[22px] border border-border bg-card p-4">
                            <Text style={{ fontSize: 22, marginBottom: 8 }}>{f.emoji}</Text>
                            <Text className="text-sm text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold', lineHeight: 18 }}>{f.label}</Text>
                            <Text className="text-xs text-muted-foreground mt-1 leading-5">{f.desc}</Text>
                        </View>
                    ))}
                </View>
                <View className="flex-row gap-3">
                    {CORE_FEATURES.slice(2, 4).map((f) => (
                        <View key={f.label} className="flex-1 rounded-[22px] border border-border bg-card p-4">
                            <Text style={{ fontSize: 22, marginBottom: 8 }}>{f.emoji}</Text>
                            <Text className="text-sm text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold', lineHeight: 18 }}>{f.label}</Text>
                            <Text className="text-xs text-muted-foreground mt-1 leading-5">{f.desc}</Text>
                        </View>
                    ))}
                </View>

                {/* Extra feature chips */}
                <View className="flex-row flex-wrap gap-2">
                    {EXTRA_FEATURES.map((f) => (
                        <View key={f.label} className="flex-row items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2">
                            <Text style={{ fontSize: 13 }}>{f.emoji}</Text>
                            <Text className="text-xs text-muted-foreground">{f.label}</Text>
                        </View>
                    ))}
                    <View className="flex-row items-center gap-1.5 rounded-full border border-dashed border-border bg-background px-3 py-2">
                        <Text className="text-xs text-muted-foreground">+ more</Text>
                    </View>
                </View>
            </Animated.View>
        </View>
    );
};
