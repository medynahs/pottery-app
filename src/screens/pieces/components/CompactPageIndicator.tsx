import { Text, View } from "react-native";

export function CompactPageIndicator({
    activePage,
    totalPages,
    accent,
}: {
    activePage: number;
    totalPages: number;
    accent: string;
}) {
    return (
        <View
            style={{
                position: 'absolute',
                bottom: 14,
                alignSelf: 'center',
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 999,
                backgroundColor: 'rgba(87, 57, 41, 0.82)',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
            }}
        >
            <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: accent }} />
            <Text className="text-[10px] font-bold uppercase tracking-[1.6px] text-white">
                {activePage + 1} of {totalPages}
            </Text>
        </View>
    );
}