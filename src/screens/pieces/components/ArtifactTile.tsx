import { Text } from "@/src/components/ui/text";
import { View } from "react-native";
import { JournalTheme } from '../utils/journalTheme';

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
                minWidth: compact ? '100%' : 120,
                padding: 12,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: JournalTheme.tileBorder,
                backgroundColor: JournalTheme.tileBackground,
                shadowColor: '#75462f',
                shadowOpacity: 0.07,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
            }}
        >
            <Text className="text-[10px] font-bold uppercase tracking-[1.5px] text-muted-foreground mb-1">{label}</Text>
            <Text className="text-sm text-foreground leading-5" numberOfLines={3}>{value}</Text>
        </View>
    );
}
