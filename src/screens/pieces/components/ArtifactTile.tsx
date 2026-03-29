import { Text, View } from "react-native";

export function ArtifactTile({
    label,
    value,
    accent,
    compact,
}: {
    label: string;
    value: string;
    accent: string;
    compact?: boolean;
}) {
    return (
        <View
            style={{
                width: compact ? '100%' : '48.5%',
                padding: 12,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: '#DFC6A0',
                backgroundColor: 'rgba(255, 251, 242, 0.9)',
                shadowColor: '#75462f',
                shadowOpacity: 0.07,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
            }}
        >
            <View style={{ width: 28, height: 3, borderRadius: 999, backgroundColor: accent, marginBottom: 10 }} />
            <Text className="text-[10px] font-bold uppercase tracking-[1.5px] text-muted-foreground mb-1">{label}</Text>
            <Text className="text-sm text-foreground leading-5" numberOfLines={3}>{value}</Text>
        </View>
    );
}
