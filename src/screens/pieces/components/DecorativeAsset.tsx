import {
    Image,
    type ImageSourcePropType
} from 'react-native';

export function DecorativeAsset({
    source,
    style,
    opacity = 1,
}: {
    source: ImageSourcePropType;
    style: object;
    opacity?: number;
}) {
    return <Image source={source} resizeMode="contain" style={[style, { opacity }]} />;
}