import { pickPiecePlaceholderArt } from '@/src/components/potteryStudioArt';
import { CanvasCropImage } from '@/src/components/SplashPotteryRing';
import React, { useState } from 'react';
import { View } from 'react-native';

const PLACEHOLDER_BG = '#F5E6CF';

type PiecePlaceholderArtProps = {
  seed: string;
};

export function PiecePlaceholderArt({ seed }: PiecePlaceholderArtProps) {
  const [artSize, setArtSize] = useState(0);
  const art = pickPiecePlaceholderArt(seed);

  return (
    <View
      className="w-full h-full items-center justify-center"
      style={{ backgroundColor: PLACEHOLDER_BG }}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setArtSize(Math.round(Math.min(width, height) * 0.76));
      }}
    >
      {artSize > 0 ? (
        <CanvasCropImage source={art.source} size={artSize} bbox={art.bbox} />
      ) : null}
    </View>
  );
}
