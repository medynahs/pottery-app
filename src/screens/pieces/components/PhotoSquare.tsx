
import {
    Camera,
    ImagePlus
} from 'lucide-react-native';
import {
    Image,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export function PhotoSquare({
    photo,
    onPress,
    accent,
    placeholder,
}: {
    photo?: string;
    onPress?: () => void;
    accent: string;
    placeholder: string;
}) {
    const content = photo ? (
        <Image source={{ uri: photo }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
    ) : (
        <View className="flex-1 items-center justify-center px-4" style={{ backgroundColor: 'rgba(244, 230, 205, 0.72)' }}>
            <ImagePlus size={24} color={accent} />
            <Text className="text-xs text-center text-muted-foreground mt-3 leading-5">{placeholder}</Text>
        </View>
    );

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.82}
            style={{
                aspectRatio: 1,
                borderRadius: 24,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: '#DDBD92',
                backgroundColor: '#F5E6CF',
                shadowColor: '#75462f',
                shadowOpacity: 0.1,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 8 },
            }}
        >
            {content}
            <View
                style={{
                    position: 'absolute',
                    right: 10,
                    bottom: 10,
                    width: 30,
                    height: 30,
                    borderRadius: 999,
                    backgroundColor: 'rgba(71, 44, 31, 0.72)',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Camera size={13} color="white" />
            </View>
        </TouchableOpacity>
    );
}
