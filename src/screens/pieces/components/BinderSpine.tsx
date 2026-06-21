import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

type BinderSpineProps = {
  height: number;
  compact?: boolean;
  edge?: 'left' | 'center';
};

export function BinderSpine({ height, compact, edge = 'left' }: BinderSpineProps) {
  const ringCount = Math.max(3, Math.round(height / (compact ? 100 : 120)));
  const ringSize = compact ? 14 : 18;

  if (edge === 'center') {
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
        {Array.from({ length: ringCount }).map((_, index) => (
          <View
            key={index}
            style={{
              width: ringSize,
              height: ringSize,
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

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 10,
        bottom: 10,
        left: compact ? 2 : 4,
        width: compact ? 10 : 12,
        alignItems: 'center',
        justifyContent: 'space-evenly',
        zIndex: 2,
      }}
    >
      <LinearGradient
        colors={['rgba(90, 55, 35, 0.95)', 'rgba(70, 42, 28, 0.98)', 'rgba(90, 55, 35, 0.95)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          borderRadius: 4,
        }}
      />
      {Array.from({ length: ringCount }).map((_, index) => (
        <View
          key={index}
          style={{
            width: ringSize - 2,
            height: ringSize - 2,
            borderRadius: 999,
            borderWidth: compact ? 2 : 3,
            borderColor: '#5C3824',
            backgroundColor: '#E8D4B8',
          }}
        />
      ))}
    </View>
  );
}
