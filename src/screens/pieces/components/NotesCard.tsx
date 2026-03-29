
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
}: {
    value: string;
    onChangeText: (value: string) => void;
    placeholder: string;
    compact?: boolean;
}) {
    return (
        <View
            style={{
                minHeight: compact ? 180 : 220,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: '#DFC7A1',
                backgroundColor: 'rgba(255, 250, 242, 0.92)',
                padding: 16,
            }}
        >
            <Text className="text-[10px] font-bold uppercase tracking-[1.5px] text-muted-foreground mb-3">
                Studio Notes
            </Text>
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
        </View>
    );
}