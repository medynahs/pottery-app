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
import { Animated, Easing, Modal, Pressable, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';

// ─── Shared sheet animation (Modal or in-modal overlay) ─────────────────────

function SheetOverlay({
  visible,
  children,
  onBackdrop,
}: {
  visible: boolean;
  children: React.ReactNode;
  onBackdrop: () => void;
}) {
  const { height } = useWindowDimensions();
  const backdropOpacity = React.useRef(new Animated.Value(0)).current;
  const slideY = React.useRef(new Animated.Value(height)).current;
  const [mounted, setMounted] = React.useState(visible);

  React.useEffect(() => {
    if (visible) {
      setMounted(true);
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
      return;
    }

    if (!mounted) return;

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideY, {
        toValue: height,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [visible, mounted, height, backdropOpacity, slideY]);

  if (!mounted) return null;

  return (
    <View
      style={[StyleSheet.absoluteFill, { zIndex: 9999, elevation: 9999 }]}
      pointerEvents="box-none"
    >
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(22,14,10,0.52)', opacity: backdropOpacity }]}
      />
      <Pressable style={StyleSheet.absoluteFill} onPress={onBackdrop} accessibilityRole="button" accessibilityLabel="Close sheet" />
      <Animated.View
        pointerEvents="box-none"
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
        <View pointerEvents="auto">
          <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#C9B48C' }} />
          </View>
          {children}
        </View>
      </Animated.View>
    </View>
  );
}

function SheetCard({ visible, children, onBackdrop }: { visible: boolean; children: React.ReactNode; onBackdrop: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onBackdrop}>
      <SheetOverlay visible={visible} onBackdrop={onBackdrop}>
        {children}
      </SheetOverlay>
    </Modal>
  );
}

export function SheetButton({
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
  const isBlocked = Boolean(disabled);

  if (variant === 'cancel') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isBlocked}
        activeOpacity={0.82}
        style={{
          minHeight: 56,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFFBF2',
          borderWidth: 1,
          borderColor: '#E8D9BE',
          opacity: isBlocked ? 0.6 : 1,
        }}
      >
        <Text style={{ color: 'hsl(24 30% 35%)', fontWeight: '600', fontSize: 15 }}>{label}</Text>
      </TouchableOpacity>
    );
  }

  const bg =
    variant === 'destructive'
      ? 'hsl(0 65% 48%)'
      : 'hsl(39 57% 51%)';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isBlocked}
      activeOpacity={0.82}
      style={{
        minHeight: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bg,
        opacity: isBlocked ? 0.6 : 1,
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>{label}</Text>
    </TouchableOpacity>
  );
}

/** Stacked sheet footer actions — matches PrimaryButton sizing app-wide. */
export function ModalSheetActions({ children }: { children: React.ReactNode }) {
  return <View style={{ gap: 10 }}>{children}</View>;
}

export {
  ModalCard,
  ModalShell,
  ModalSheetFooter,
  ModalSheetHeader,
  MODAL_BACKDROP_COLOR,
  MODAL_SHEET_HEIGHT_RATIO,
  MODAL_SHEET_RADIUS,
  useModalSheetHeight,
} from '@/src/components/ModalShell';
export type { ModalCardProps, ModalShellProps } from '@/src/components/ModalShell';

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
  return (
    <SheetCard visible={visible} onBackdrop={onCancel}>
      <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
        <Text className="text-lg font-bold text-foreground">{title}</Text>
        <Text className="text-sm text-muted-foreground mt-2 leading-5">{body}</Text>
      </View>
      <View style={{ paddingHorizontal: 24, paddingTop: 20, gap: 10 }}>
        <SheetButton
          label={loading ? 'Please wait…' : confirmLabel}
          onPress={onConfirm}
          variant={destructive ? 'destructive' : 'confirm'}
          disabled={loading}
        />
        <SheetButton label="Cancel" onPress={onCancel} variant="cancel" disabled={loading} />
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
  return (
    <SheetCard visible={visible} onBackdrop={onDismiss}>
      <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
        <Text className="text-lg font-bold text-foreground">{title}</Text>
        <Text className="text-sm text-muted-foreground mt-2 leading-5">{body}</Text>
      </View>
      <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
        <SheetButton label={buttonLabel} onPress={onDismiss} variant="confirm" />
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
  /** Render inside an existing modal instead of opening a new RN Modal. */
  embedded?: boolean;
}

function PickSheetContent({
  title,
  body,
  options,
  onCancel,
}: Pick<PickSheetProps, 'title' | 'body' | 'options' | 'onCancel'>) {
  return (
    <>
      <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
        <Text className="text-lg font-bold text-foreground">{title}</Text>
        {body ? <Text className="text-sm text-muted-foreground mt-2 leading-5">{body}</Text> : null}
      </View>
      <View style={{ paddingHorizontal: 24, paddingTop: 20, gap: 10 }}>
        {options.map((opt) => (
          <SheetButton
            key={opt.label}
            label={opt.label}
            onPress={() => {
              opt.onPress();
              onCancel();
            }}
            variant={opt.destructive ? 'destructive' : 'confirm'}
          />
        ))}
        <SheetButton label="Cancel" onPress={onCancel} variant="cancel" />
      </View>
    </>
  );
}

export function PickSheet({ visible, title, body, options, onCancel, embedded }: PickSheetProps) {
  const content = (
    <PickSheetContent title={title} body={body} options={options} onCancel={onCancel} />
  );

  if (embedded) {
    return (
      <SheetOverlay visible={visible} onBackdrop={onCancel}>
        {content}
      </SheetOverlay>
    );
  }

  return (
    <SheetCard visible={visible} onBackdrop={onCancel}>
      {content}
    </SheetCard>
  );
}
