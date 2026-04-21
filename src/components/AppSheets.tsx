/**
 * App-wide custom sheet variants that match the Pottery Nook visual language.
 * Use these everywhere instead of native Alert.alert.
 *
 * ConfirmSheet  — confirm / cancel (optionally destructive)
 * InfoSheet     — informational with a single dismiss button
 * PickSheet     — free-form list of labelled options + cancel
 */
import { Text } from '@/src/components/ui/text';
import React from 'react';
import { Animated, Easing, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, TouchableOpacity, useWindowDimensions, View, type ViewStyle } from 'react-native';

// ─── Shared card shell ────────────────────────────────────────────────────────

function SheetCard({ children, onBackdrop }: { children: React.ReactNode; onBackdrop: () => void }) {
  const { height } = useWindowDimensions();
  const backdropOpacity = React.useRef(new Animated.Value(0)).current;
  const slideY = React.useRef(new Animated.Value(height)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideY, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    // No Modal — plain absolute overlay rendered in-tree so the OS never
    // touches our animation. Backdrop is always fixed; only the card moves.
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Stationary dimmed background */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(22,14,10,0.52)', opacity: backdropOpacity }]}
      />
      {/* Tap-to-dismiss target behind the card */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onBackdrop} />

      {/* Card slides up from off-screen */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          transform: [{ translateY: slideY }],
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          backgroundColor: '#FFFBF2',
          borderTopWidth: 1,
          borderColor: '#E8D9BE',
          paddingBottom: 36,
        }}
      >
        {/* Drag handle */}
        <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#C9B48C' }} />
        </View>
        {children}
      </Animated.View>
    </View>
  );
}

function SheetBtn({
  label,
  onPress,
  variant = 'cancel',
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: 'confirm' | 'destructive' | 'cancel';
  disabled?: boolean;
}) {
  const bg =
    variant === 'destructive'
      ? 'hsl(0 65% 48%)'
      : variant === 'confirm'
        ? 'hsl(24 75% 45%)'
        : undefined;

  if (variant === 'cancel') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.75}
        style={{
          borderRadius: 14,
          paddingVertical: 13,
          alignItems: 'center',
          backgroundColor: '#F5EDD8',
          borderWidth: 1,
          borderColor: '#E8D9BE',
        }}
      >
        <Text style={{ color: 'hsl(24 30% 35%)', fontWeight: '600', fontSize: 15 }}>{label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={{
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        backgroundColor: bg,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── ModalShell ──────────────────────────────────────────────────────────────
// Shared wrapper for full-screen bottom-sheet modals.
// The backdrop fades in place; only the card slides up.

export interface ModalShellProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  backdropColor?: string;
}

export function ModalShell({
  visible,
  onClose,
  children,
  backdropColor = 'rgba(22,14,10,0.52)',
}: ModalShellProps) {
  const { height } = useWindowDimensions();
  const backdropOpacity = React.useRef(new Animated.Value(0)).current;
  const slideY = React.useRef(new Animated.Value(height)).current;

  React.useEffect(() => {
    if (visible) {
      backdropOpacity.setValue(0);
      slideY.setValue(height);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(slideY, {
          toValue: 0,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={onClose}>
      {/* Backdrop — only fades, never moves */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: backdropColor, opacity: backdropOpacity }]}
      />
      {/* Tap-to-dismiss */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      {/* Card — only this translates up */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: 'flex-end' }}
        pointerEvents="box-none"
      >
        <Animated.View style={{ transform: [{ translateY: slideY }] }}>
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── ModalCard ───────────────────────────────────────────────────────────────
// The visual card shell that sits inside ModalShell.
// variant="default"  → system theme (bg-background, NativeWind handle)
// variant="pottery"  → earthy brand theme (#FFFBF2, warm border + handle)
// radius             → override top corner radius (default: 24 for 'default', 28 for 'pottery')

export interface ModalCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'pottery';
  maxHeight?: ViewStyle['maxHeight'];
  radius?: number;
}

export function ModalCard({ children, variant = 'default', maxHeight, radius }: ModalCardProps) {
  const topRadius = radius ?? (variant === 'pottery' ? 28 : 24);

  if (variant === 'pottery') {
    return (
      <View
        style={{
          borderTopLeftRadius: topRadius,
          borderTopRightRadius: topRadius,
          backgroundColor: '#FFFBF2',
          borderTopWidth: 1,
          borderColor: '#E8D9BE',
          maxHeight,
        }}
      >
        <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#C9B48C' }} />
        </View>
        {children}
      </View>
    );
  }

  return (
    <View
      className="bg-background"
      style={{
        borderTopLeftRadius: topRadius,
        borderTopRightRadius: topRadius,
        maxHeight,
      }}
    >
      <View className="w-9 h-1 bg-muted rounded-full self-center mt-4 mb-2" />
      {children}
    </View>
  );
}

// ─── ConfirmSheet ─────────────────────────────────────────────────────────────

export interface ConfirmSheetProps {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmSheet({
  visible,
  title,
  body,
  confirmLabel,
  destructive,
  loading,
  onConfirm,
  onCancel,
}: ConfirmSheetProps) {
  if (!visible) return null;
  return (
    <SheetCard onBackdrop={onCancel}>
      <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
        <Text className="text-lg font-bold text-foreground">{title}</Text>
        <Text className="text-sm text-muted-foreground mt-2 leading-5">{body}</Text>
      </View>
      <View style={{ paddingHorizontal: 24, paddingTop: 20, gap: 10 }}>
        <SheetBtn
          label={loading ? 'Please wait…' : confirmLabel}
          onPress={onConfirm}
          variant={destructive ? 'destructive' : 'confirm'}
          disabled={loading}
        />
        <SheetBtn label="Cancel" onPress={onCancel} variant="cancel" disabled={loading} />
      </View>
    </SheetCard>
  );
}

// ─── InfoSheet ────────────────────────────────────────────────────────────────

export interface InfoSheetProps {
  visible: boolean;
  title: string;
  body: string;
  buttonLabel?: string;
  onDismiss: () => void;
}

export function InfoSheet({ visible, title, body, buttonLabel = 'Got it', onDismiss }: InfoSheetProps) {
  if (!visible) return null;
  return (
    <SheetCard onBackdrop={onDismiss}>
      <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
        <Text className="text-lg font-bold text-foreground">{title}</Text>
        <Text className="text-sm text-muted-foreground mt-2 leading-5">{body}</Text>
      </View>
      <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
        <SheetBtn label={buttonLabel} onPress={onDismiss} variant="confirm" />
      </View>
    </SheetCard>
  );
}

// ─── PickSheet ────────────────────────────────────────────────────────────────

export interface PickSheetOption {
  label: string;
  destructive?: boolean;
  onPress: () => void;
}

export interface PickSheetProps {
  visible: boolean;
  title: string;
  body?: string;
  options: PickSheetOption[];
  onCancel: () => void;
}

export function PickSheet({ visible, title, body, options, onCancel }: PickSheetProps) {
  if (!visible) return null;
  return (
    <SheetCard onBackdrop={onCancel}>
      <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
        <Text className="text-lg font-bold text-foreground">{title}</Text>
        {body ? <Text className="text-sm text-muted-foreground mt-2 leading-5">{body}</Text> : null}
      </View>
      <View style={{ paddingHorizontal: 24, paddingTop: 20, gap: 10 }}>
        {options.map((opt) => (
          <SheetBtn
            key={opt.label}
            label={opt.label}
            onPress={() => { opt.onPress(); onCancel(); }}
            variant={opt.destructive ? 'destructive' : 'confirm'}
          />
        ))}
        <SheetBtn label="Cancel" onPress={onCancel} variant="cancel" />
      </View>
    </SheetCard>
  );
}
