import { Text } from "@/src/components/ui/text";
import { View } from "react-native";

export function PaperLabel({ label, accent }: { label: string; accent: string }) {
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 999,
        backgroundColor: accent,
        transform: [{ rotate: '-2deg' }],
      }}
    >
      <Text className="text-[10px] font-bold uppercase tracking-[1.8px] text-white">{label}</Text>
    </View>
  );
}