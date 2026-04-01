
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollText } from 'lucide-react-native';
import React from 'react';
import {
    Text,
    TextInput,
    View
} from 'react-native';

export function NotesCard({
    value,
    onChangeText,
    placeholder,
    compact,
    accent = '#B89B7B',
    title = 'Field Notes',
}: {
    value: string;
    onChangeText: (value: string) => void;
    placeholder: string;
    compact?: boolean;
    accent?: string;
    title?: string;
}) {
    return (
        <View
            style={{
                borderRadius: 28,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: '#DCC19D',
                backgroundColor: 'rgba(255, 252, 245, 0.95)',
                height: '100%',
                width: '100%',
            }}
        >
            <LinearGradient
                colors={['rgba(215, 180, 141, 0.26)', 'rgba(255,255,255,0.12)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: 16, paddingBottom: 8 }}
            >
                <View className="flex-row items-center gap-2 mb-4">
                    <ScrollText size={15} color={accent} />
                    <Text className="text-xs font-bold uppercase tracking-[1.5px] text-muted-foreground">{title}</Text>
                </View>
                <TextInput
                    multiline
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#97795F"
                    style={{
                        minHeight: compact ? 126 : 166,
                        fontFamily: 'DMSans_400Regular',
                        fontSize: 13,
                        lineHeight: 22,
                        color: '#4B3126',
                        textAlignVertical: 'top',
                    }}
                />
            </LinearGradient>
        </View>
    );
}