import React from 'react';
import { Dimensions, Image, ImageSourcePropType, View } from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

interface IllustrationSlotProps {
  imageSource?: ImageSourcePropType;
  children?: React.ReactNode;
}

export const IllustrationSlot: React.FC<IllustrationSlotProps> = ({ imageSource, children }) => {
  return (
    <View
      className="mx-6 rounded-[28px] overflow-hidden bg-muted"
      style={{ height: screenHeight * 0.42 }}
    >
      {imageSource ? (
        <Image
          source={imageSource}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      ) : (
        <View className="flex-1 bg-muted" />
      )}
      {children}
    </View>
  );
};
