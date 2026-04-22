import { Input } from '@/src/components/ui/input.ios';
import { Text } from '@/src/components/ui/text';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, View } from 'react-native';

interface WelcomeStepProps {
    draft: any;
    updateDraft: (patch: Partial<any>) => void;
    formatLabel: (value: string) => string;
}

const HIGHLIGHTS = [
    { emoji: '🏺', label: 'Track every piece', desc: 'From first throw to final glaze — every stage logged.' },
    { emoji: '🔥', label: 'Know your rhythm', desc: 'Daily quests shaped around how you actually work.' },
    { emoji: '✨', label: 'Celebrate progress', desc: 'A companion that notices and cheers your milestones.' },
];

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ draft, updateDraft }) => {
    const heroY = useRef(new Animated.Value(28)).current;
    const heroOpacity = useRef(new Animated.Value(0)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;
    const petY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.timing(heroY, {
                    toValue: 0,
                    duration: 480,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.cubic),
                }),
                Animated.timing(heroOpacity, {
                    toValue: 1,
                    duration: 380,
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(contentOpacity, {
                toValue: 1,
                duration: 320,
                useNativeDriver: true,
            }),
        ]).start();

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
        <View className="mt-3 gap-3">
            {/* Hero illustration */}
            <Animated.View
                style={{ transform: [{ translateY: heroY }], opacity: heroOpacity }}
                className="rounded-[28px] overflow-hidden"
            >
                <Image
                    source={require('../../../../assets/images/pottery-studio.png')}
                    style={{ width: '100%', height: 190 }}
                    resizeMode="cover"
                />
                {/* Floating clay-pet sticker */}
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
            </Animated.View>

            {/* Highlights + input */}
            <Animated.View style={{ opacity: contentOpacity }} className="gap-3">
                <View className="rounded-[28px] border border-border bg-card p-5 gap-4">
                    {HIGHLIGHTS.map((h) => (
                        <View key={h.label} className="flex-row items-start gap-3">
                            <View className="w-10 h-10 rounded-2xl bg-muted items-center justify-center">
                                <Text style={{ fontSize: 20 }}>{h.emoji}</Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>{h.label}</Text>
                                <Text className="text-xs text-muted-foreground mt-0.5 leading-5">{h.desc}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View className="rounded-[28px] border border-border bg-card px-5 pt-4 pb-5">
                    <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-1.5">Studio name (optional)</Text>
                    <Input
                        value={draft.studioName}
                        onChangeText={(value: string) => updateDraft({ studioName: value })}
                        placeholder="e.g. The Clay Nook"
                    />
                    <Text className="text-xs text-muted-foreground mt-2 leading-5">Shown on your overview. You can change it anytime.</Text>
                </View>

                <View className="rounded-2xl border border-dashed border-border bg-background/60 px-4 py-3">
                    <Text className="text-xs text-muted-foreground leading-5">
                        Setup is kept short. Your kiln, rhythm, and pricing can be configured from quick-start quests once you're inside.
                    </Text>
                </View>
            </Animated.View>
        </View>
    );
};