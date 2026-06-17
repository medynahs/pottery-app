import { Text } from '@/src/components/ui/text';
import { Image } from 'expo-image';
import { BarChart3, Flame, Palette, Shapes, Sparkle, Trophy, Users } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

interface WelcomeStepProps {
    draft: any;
    updateDraft: (patch: Partial<any>) => void;
}

// Theme --primary gold from global.css
const GOLD = 'hsl(39 57% 51%)';
const GOLD_TINT = 'hsl(44 65% 90%)';

const CAPABILITIES: { Icon: React.ComponentType<{ size: number; color: string }>; label: string; desc: string }[] = [
    { Icon: Shapes, label: 'Pieces', desc: 'Track every piece from clay to shelf.' },
    { Icon: Flame, label: 'Kiln', desc: 'Plan firings, log cones and temps.' },
    { Icon: Palette, label: 'Glazes', desc: 'Save recipes and test tiles.' },
    { Icon: Users, label: 'Community', desc: 'Share work and swap studio tips.' },
    { Icon: Trophy, label: 'Achievements', desc: 'Celebrate milestones, badges & XP.' },
    { Icon: BarChart3, label: 'Insights', desc: 'See clay use, costs & survival rates.' },
];

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ draft, updateDraft }) => {
    const heroOpacity = useRef(new Animated.Value(0)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.82)).current;
    const contentY = useRef(new Animated.Value(16)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;
    const floatY = useRef(new Animated.Value(0)).current;
    const twinkleA = useRef(new Animated.Value(0)).current;
    const twinkleB = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.timing(heroOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
            Animated.parallel([
                Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
                Animated.timing(logoOpacity, { toValue: 1, duration: 420, useNativeDriver: true }),
            ]),
        ]).start();

        Animated.parallel([
            Animated.timing(contentOpacity, { toValue: 1, duration: 460, delay: 320, useNativeDriver: true }),
            Animated.timing(contentY, { toValue: 0, duration: 460, delay: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]).start();

        const floatLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(floatY, { toValue: -8, duration: 1900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(floatY, { toValue: 0, duration: 1900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ])
        );
        floatLoop.start();

        const mkTwinkle = (val: Animated.Value, delay: number) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(val, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                    Animated.timing(val, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                ])
            );
        const tA = mkTwinkle(twinkleA, 0);
        const tB = mkTwinkle(twinkleB, 650);
        tA.start();
        tB.start();

        return () => {
            floatLoop.stop();
            tA.stop();
            tB.stop();
        };
    }, [heroOpacity, logoOpacity, logoScale, contentOpacity, contentY, floatY, twinkleA, twinkleB]);

    return (
        <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
            <Animated.View style={{ opacity: heroOpacity }}>
               
                    {/* Twinkling sparkles */}
                    <Animated.View style={{ position: 'absolute', top: 64, left: 30, opacity: twinkleA, transform: [{ scale: twinkleA.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }] }}>
                        <Sparkle size={20} color="rgba(255, 244, 222, 0.9)" fill="rgba(255, 244, 222, 0.9)" />
                    </Animated.View>
                    <Animated.View style={{ position: 'absolute', top: 120, right: 34, opacity: twinkleB, transform: [{ scale: twinkleB.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] }}>
                        <Sparkle size={14} color="rgba(255, 244, 222, 0.85)" fill="rgba(255, 244, 222, 0.85)" />
                    </Animated.View>
                    <Animated.View style={{ position: 'absolute', bottom: 92, left: 44, opacity: twinkleB, transform: [{ scale: twinkleB.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }] }}>
                        <Sparkle size={12} color="rgba(255, 244, 222, 0.8)" fill="rgba(255, 244, 222, 0.8)" />
                    </Animated.View>

                    {/* Wordmark eyebrow */}
                    <View style={{ alignSelf: 'center', borderRadius: 999, backgroundColor: 'rgba(255, 252, 245, 0.72)', paddingHorizontal: 13, paddingVertical: 6 }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', color: '#7a4b2a' }}>
                            Pottery Nook
                        </Text>
                    </View>

                    {/* Floating logo with halo */}
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 6 }}>
                        <Animated.View
                            style={{
                                opacity: logoOpacity,
                                transform: [{ translateY: floatY }, { scale: logoScale }],
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <View style={{ position: 'absolute', width: 188, height: 188, borderRadius: 94, backgroundColor: 'rgba(255, 248, 232, 0.22)' }} />
                            <View style={{ position: 'absolute', width: 142, height: 142, borderRadius: 71, backgroundColor: 'rgba(255, 248, 232, 0.28)' }} />
                            <Image
                                source={require('../../../../assets/PotteryNookLogo.png')}
                                style={{ width: 156, height: 156 }}
                                contentFit="contain"
                            />
                        </Animated.View>
                    </View>

                    {/* Headline */}
                    <Animated.View style={{ opacity: contentOpacity, transform: [{ translateY: contentY }] }}>
                        <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 27, lineHeight: 32, color: '#2f1c12', textAlign: 'center' }}>
                            Welcome to your studio
                        </Text>
                        <Text style={{ fontSize: 13.5, lineHeight: 20, color: '#5d3b25', textAlign: 'center', marginTop: 8, paddingHorizontal: 6 }}>
                            A calm, playful home for everything you make, from wet clay to the finished shelf.
                        </Text>
                    </Animated.View>
            </Animated.View>

            {/* Capability cards */}
            <Animated.View style={{ opacity: contentOpacity, transform: [{ translateY: contentY }], marginTop: 16 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase', color: 'hsl(28 38% 34%)', marginBottom: 10, paddingHorizontal: 2 }}>
                    Everything in one studio
                </Text>
                <View style={{ gap: 10 }}>
                    {[0, 2, 4].map((rowStart) => (
                        <View key={rowStart} style={{ flexDirection: 'row', gap: 10 }}>
                            {CAPABILITIES.slice(rowStart, rowStart + 2).map((capability) => {
                                const CIcon = capability.Icon;
                                return (
                                    <View
                                        key={capability.label}
                                        style={{
                                            flex: 1,
                                            borderRadius: 20,
                                            backgroundColor: 'rgba(255, 252, 246, 0.94)',
                                            borderWidth: 1,
                                            borderColor: 'rgba(95, 61, 37, 0.1)',
                                            padding: 13,
                                        }}
                                    >
                                        <View style={{ width: 38, height: 38, borderRadius: 13, backgroundColor: GOLD_TINT, alignItems: 'center', justifyContent: 'center', marginBottom: 9 }}>
                                            <CIcon size={18} color={GOLD} />
                                        </View>
                                        <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 14, color: 'hsl(24 30% 14%)', lineHeight: 18 }}>
                                            {capability.label}
                                        </Text>
                                        <Text style={{ fontSize: 11.5, color: 'hsl(24 14% 44%)', marginTop: 3, lineHeight: 16 }}>
                                            {capability.desc}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    ))}
                </View>
            </Animated.View>
        </View>
    );
};
