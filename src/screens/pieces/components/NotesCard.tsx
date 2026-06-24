import { NOTES_INPUT_MIN_HEIGHT } from '@/src/components/NotesInput';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollText } from 'lucide-react-native';
import React from 'react';
import {
    Text,
    TextInput,
    View
} from 'react-native';
import { JournalTheme } from '../utils/journalTheme';

export function NotesCard({
    value,
    onChangeText,
    placeholder,
    compact,
    accent = JournalTheme.pageAccents[0],
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
                borderColor: JournalTheme.cardBorder,
                backgroundColor: JournalTheme.cardBackground,
                width: '100%',
            }}
        >
            <LinearGradient
                colors={[...JournalTheme.notesGradient]}
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
                    scrollEnabled={false}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={JournalTheme.placeholder}
                    style={{
                        minHeight: compact ? 126 : Math.max(NOTES_INPUT_MIN_HEIGHT, 166),
                        fontFamily: 'DMSans_400Regular',
                        fontSize: 13,
                        lineHeight: 22,
                        color: JournalTheme.bodyInk,
                        textAlignVertical: 'top',
                    }}
                />
            </LinearGradient>
        </View>
    );
}