import { Text } from '@/src/components/ui/text';
import { useTextScale } from '@/src/hooks/useTextScale';
import React from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { JournalTheme } from '../utils/journalTheme';

type JournalNotesSheetProps = {
  visible: boolean;
  title: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  onClose: () => void;
};

export function JournalNotesSheet({
  visible,
  title,
  value,
  placeholder,
  onChangeText,
  onClose,
}: JournalNotesSheetProps) {
  const insets = useSafeAreaInsets();
  const { scaled } = useTextScale();
  const { height: windowHeight } = useWindowDimensions();
  const [mounted, setMounted] = React.useState(visible);
  const [draft, setDraft] = React.useState(value);
  const inputRef = React.useRef<TextInput>(null);

  const backdrop = React.useRef(new Animated.Value(0)).current;
  const sheetY = React.useRef(new Animated.Value(48)).current;
  const sheetScale = React.useRef(new Animated.Value(0.94)).current;
  const sheetOpacity = React.useRef(new Animated.Value(0)).current;

  const animateIn = React.useCallback(() => {
    backdrop.setValue(0);
    sheetY.setValue(48);
    sheetScale.setValue(0.94);
    sheetOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(backdrop, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(sheetOpacity, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(sheetY, {
        toValue: 0,
        damping: 22,
        stiffness: 220,
        mass: 0.9,
        useNativeDriver: true,
      }),
      Animated.spring(sheetScale, {
        toValue: 1,
        damping: 20,
        stiffness: 240,
        mass: 0.85,
        useNativeDriver: true,
      }),
    ]).start(() => {
      inputRef.current?.focus();
    });
  }, [backdrop, sheetOpacity, sheetScale, sheetY]);

  const animateOut = React.useCallback((onDone: () => void) => {
    Animated.parallel([
      Animated.timing(backdrop, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(sheetOpacity, {
        toValue: 0,
        duration: 160,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(sheetY, {
        toValue: 36,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(sheetScale, {
        toValue: 0.96,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(onDone);
  }, [backdrop, sheetOpacity, sheetScale, sheetY]);

  React.useEffect(() => {
    if (visible) {
      setMounted(true);
      setDraft(value);
    }
  }, [visible, value]);

  React.useEffect(() => {
    if (!mounted) return undefined;
    if (visible) {
      const timer = setTimeout(animateIn, 16);
      return () => clearTimeout(timer);
    }
    animateOut(() => setMounted(false));
    return undefined;
  }, [visible, mounted, animateIn, animateOut]);

  const requestClose = () => onClose();

  const handleDone = () => {
    onChangeText(draft);
    onClose();
  };

  if (!mounted) return null;

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={requestClose} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: 'rgba(16, 10, 6, 0.58)', opacity: backdrop },
          ]}
        />
        <Pressable style={StyleSheet.absoluteFill} onPress={requestClose} accessibilityLabel="Dismiss note editor" />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
          style={{ maxHeight: windowHeight * 0.82 }}
        >
          <Animated.View
            style={{
              marginHorizontal: 14,
              marginBottom: insets.bottom + 10,
              opacity: sheetOpacity,
              transform: [{ translateY: sheetY }, { scale: sheetScale }],
            }}
          >
            <View
              style={{
                borderRadius: 26,
                borderWidth: 1,
                borderColor: JournalTheme.cardBorder,
                backgroundColor: JournalTheme.cardBackground,
                padding: 18,
                shadowColor: '#2a1408',
                shadowOpacity: 0.28,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 10 },
                elevation: 12,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <View>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '700',
                      letterSpacing: 1.8,
                      textTransform: 'uppercase',
                      color: JournalTheme.coverMastheadInk,
                    }}
                  >
                    {title}
                  </Text>
                  <Text style={{ fontSize: 11, color: JournalTheme.coverSpecLabel, marginTop: 3 }}>
                    Saves as you write
                  </Text>
                </View>
                <TouchableOpacity onPress={requestClose} hitSlop={12}>
                  <Text style={{ fontSize: 13, color: JournalTheme.coverSpecLabel }}>Cancel</Text>
                </TouchableOpacity>
              </View>

              <View
                style={{
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: JournalTheme.tileBorder,
                  backgroundColor: JournalTheme.tileBackground,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                }}
              >
                <TextInput
                  ref={inputRef}
                  multiline
                  value={draft}
                  onChangeText={setDraft}
                  placeholder={placeholder}
                  placeholderTextColor={JournalTheme.placeholder}
                  style={{
                    minHeight: 168,
                    maxHeight: 260,
                    fontFamily: 'DMSans_400Regular',
                    fontSize: scaled(15),
                    lineHeight: scaled(24),
                    color: JournalTheme.bodyInk,
                    textAlignVertical: 'top',
                    padding: 0,
                  }}
                />
              </View>

              <TouchableOpacity
                onPress={handleDone}
                activeOpacity={0.86}
                style={{
                  marginTop: 14,
                  alignSelf: 'flex-end',
                  paddingHorizontal: 20,
                  paddingVertical: 11,
                  borderRadius: 999,
                  backgroundColor: JournalTheme.titleInk,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#FFF8EE' }}>Save note</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

type JournalNotePreviewProps = {
  title: string;
  value: string;
  placeholder: string;
  onPress: () => void;
  compact?: boolean;
};

export function JournalNotePreview({ title, value, placeholder, onPress, compact }: JournalNotePreviewProps) {
  const hasText = value.trim().length > 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      style={{
        borderRadius: 14,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: JournalTheme.coverRule,
        backgroundColor: 'rgba(255, 252, 247, 0.72)',
        padding: compact ? 12 : 14,
      }}
    >
      <Text
        style={{
          fontSize: 9,
          fontWeight: '700',
          letterSpacing: 1.6,
          textTransform: 'uppercase',
          color: JournalTheme.coverMastheadInk,
          marginBottom: 8,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: 13,
          lineHeight: 21,
          fontStyle: hasText ? 'normal' : 'italic',
          color: hasText ? JournalTheme.bodyInk : JournalTheme.placeholder,
        }}
        numberOfLines={compact ? 4 : 5}
      >
        {hasText ? value : placeholder}
      </Text>
      <Text style={{ fontSize: 10, color: JournalTheme.coverSpecLabel, marginTop: 10, letterSpacing: 0.4 }}>
        Tap to open writing desk
      </Text>
    </TouchableOpacity>
  );
}
