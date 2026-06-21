import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { JournalTheme } from '../utils/journalTheme';
import { BinderSpine } from './BinderSpine';

type JournalBookShellProps = {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  isCompact: boolean;
  onLayout?: (height: number) => void;
  style?: ViewStyle;
};

/** Leather-bound book frame: cover, left spine, parchment page area, optional header/footer rail. */
export function JournalBookShell({
  children,
  header,
  footer,
  isCompact,
  onLayout,
  style,
}: JournalBookShellProps) {
  const [measuredHeight, setMeasuredHeight] = React.useState(400);

  return (
    <View
      style={[{ flex: 1, minHeight: 0 }, style]}
      onLayout={(event) => {
        const nextHeight = event.nativeEvent.layout.height;
        setMeasuredHeight(nextHeight);
        onLayout?.(nextHeight);
      }}
    >
      <LinearGradient
        colors={['#2E1A12', '#4A2E1C', '#3D2618']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flex: 1,
          borderRadius: isCompact ? 16 : 20,
          padding: isCompact ? 5 : 7,
          paddingLeft: isCompact ? 12 : 16,
          shadowColor: '#120804',
          shadowOpacity: 0.42,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 10,
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: header ? 46 : 6,
            right: 6,
            bottom: footer ? 58 : 6,
            left: isCompact ? 10 : 14,
            borderRadius: isCompact ? 12 : 14,
            borderWidth: 1,
            borderColor: 'rgba(255, 244, 228, 0.08)',
          }}
        />

        <BinderSpine height={measuredHeight} edge="left" compact={isCompact} />

        {header ? (
          <View
            style={{
              marginLeft: isCompact ? 10 : 14,
              marginRight: 6,
            }}
          >
            {header}
          </View>
        ) : null}

        <View
          style={{
            flex: 1,
            borderRadius: isCompact ? 12 : 14,
            borderTopLeftRadius: header ? (isCompact ? 10 : 12) : isCompact ? 12 : 14,
            borderTopRightRadius: header ? (isCompact ? 10 : 12) : isCompact ? 12 : 14,
            overflow: 'hidden',
            backgroundColor: JournalTheme.pageBackground,
            borderWidth: 1,
            borderTopWidth: header ? 0 : 1,
            borderColor: JournalTheme.pageBorder,
            borderLeftWidth: 2,
            borderLeftColor: 'rgba(156, 73, 41, 0.35)',
          }}
        >
          {children}
        </View>

        {footer ? (
          <View
            style={{
              marginTop: 6,
              marginLeft: isCompact ? 2 : 4,
              borderTopWidth: 1,
              borderTopColor: 'rgba(255, 244, 228, 0.12)',
              paddingTop: 4,
            }}
          >
            {footer}
          </View>
        ) : null}
      </LinearGradient>
    </View>
  );
}
