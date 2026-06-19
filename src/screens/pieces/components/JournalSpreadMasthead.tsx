import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { JournalTheme } from '../utils/journalTheme';

type JournalSpreadMastheadProps = {
  leftLabel?: string;
  rightLabel: string;
  compact?: boolean;
};

export function JournalSpreadMasthead({ leftLabel = 'Studio Field Journal', rightLabel, compact }: JournalSpreadMastheadProps) {
  return (
    <LinearGradient
      colors={[...JournalTheme.coverWash]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        marginHorizontal: compact ? -10 : -14,
        paddingHorizontal: compact ? 10 : 14,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: JournalTheme.coverRule,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <Text
          style={{
            fontSize: 9,
            fontWeight: '700',
            letterSpacing: 2.4,
            textTransform: 'uppercase',
            color: JournalTheme.coverMastheadInk,
            flexShrink: 1,
          }}
          numberOfLines={1}
        >
          {leftLabel}
        </Text>
        <Text
          style={{
            fontSize: 9,
            fontWeight: '600',
            letterSpacing: 1.2,
            color: JournalTheme.coverSpecLabel,
            flexShrink: 1,
            textAlign: 'right',
            maxWidth: '55%',
          }}
          numberOfLines={1}
        >
          {rightLabel}
        </Text>
      </View>
    </LinearGradient>
  );
}
