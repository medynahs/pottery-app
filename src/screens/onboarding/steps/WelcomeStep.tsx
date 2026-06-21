import { AnimatedLogoHero } from '@/src/components/AnimatedLogoHero';
import { Text } from '@/src/components/ui/text';
import { BarChart3, Flame, Palette, Shapes, Trophy, Users } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

interface WelcomeStepProps {
    draft: any;
    updateDraft: (patch: Partial<any>) => void;
}

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

export const WelcomeStep: React.FC<WelcomeStepProps> = () => {
    const contentY = useRef(new Animated.Value(16)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(contentOpacity, { toValue: 1, duration: 460, delay: 320, useNativeDriver: true }),
            Animated.timing(contentY, { toValue: 0, duration: 460, delay: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]).start();
    }, [contentOpacity, contentY]);

    return (
        <View style={{ paddingHorizontal: 20, paddingTop: 6 }}>
            <AnimatedLogoHero>
                <Text className="text-center text-[26px] leading-8" style={{ fontFamily: 'Fraunces_700Bold', color: '#2f1c12' }}>
                    Welcome to your studio
                </Text>
                <Text className="text-sm text-center mt-2 px-1.5" style={{ color: '#5d3b25', lineHeight: 20 }}>
                    A calm, playful home for everything you make, from wet clay to the finished shelf.
                </Text>
            </AnimatedLogoHero>

            <Animated.View style={{ opacity: contentOpacity, transform: [{ translateY: contentY }], marginTop: 12 }}>
                <Text className="text-[10px] font-bold uppercase tracking-widest mb-2 px-0.5" style={{ color: 'hsl(28 38% 34%)' }}>
                    Everything in one studio
                </Text>
                <View style={{ gap: 8 }}>
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
                                            padding: 11,
                                        }}
                                    >
                                        <View style={{ width: 38, height: 38, borderRadius: 13, backgroundColor: GOLD_TINT, alignItems: 'center', justifyContent: 'center', marginBottom: 9 }}>
                                            <CIcon size={18} color={GOLD} />
                                        </View>
                                        <Text className="text-sm font-semibold" style={{ fontFamily: 'Fraunces_600SemiBold', color: 'hsl(24 30% 14%)', lineHeight: 18 }}>
                                            {capability.label}
                                        </Text>
                                        <Text className="text-xs mt-1 leading-4" style={{ color: 'hsl(24 14% 44%)' }}>
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
