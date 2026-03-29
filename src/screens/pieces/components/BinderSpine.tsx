import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";


export function BinderSpine({ height, compact }: { height: number; compact?: boolean }) {
    if (compact) return null;

    return (
        <View
            pointerEvents="none"
            style={{
                position: 'absolute',
                top: 14,
                bottom: 14,
                left: '50%',
                marginLeft: -17,
                width: 34,
                alignItems: 'center',
                justifyContent: 'space-evenly',
            }}
        >
            <LinearGradient
                colors={['rgba(128, 83, 56, 0.88)', 'rgba(99, 63, 42, 0.94)', 'rgba(128, 83, 56, 0.88)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ position: 'absolute', top: 0, bottom: 0, width: 20, borderRadius: 999 }}
            />
            {Array.from({ length: Math.max(4, Math.round(height / 120)) }).map((_, index) => (
                <View
                    key={index}
                    style={{
                        width: 18,
                        height: 18,
                        borderRadius: 999,
                        borderWidth: 3,
                        borderColor: '#6D442F',
                        backgroundColor: '#F0DBC0',
                    }}
                />
            ))}
        </View>
    );
}