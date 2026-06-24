import { KeyboardAvoidingView } from '@/src/components/ui/keyboard-avoiding-view';
import { MODAL_BACKDROP_COLOR } from '@/src/components/ModalShell';
import { X } from 'lucide-react-native';
import React from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const DIALOG_RADIUS = 24;
export const DIALOG_MAX_WIDTH = 400;
export const DIALOG_LIST_HEIGHT_RATIO = 0.68;

export function useDialogMaxHeight(ratio = DIALOG_LIST_HEIGHT_RATIO) {
  const { height } = useWindowDimensions();
  return height * ratio;
}

export interface DialogShellProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  backdropColor?: string;
  /** Render inside an existing modal instead of opening a new RN Modal. */
  embedded?: boolean;
  /** Fires after the close animation finishes and the portal unmounts. */
  onClosed?: () => void;
  /** Skip the exit animation (use when handing off to another modal). */
  dismissMode?: 'animated' | 'immediate';
}

/**
 * Defers an action until the dialog portal has fully unmounted.
 * Use when a choice dialog must close before opening another RN Modal.
 *
 * Pass `dismiss` (e.g. parent onClose) when the parent controls `visible`.
 * Omit `dismiss` when confirm should close visually first, then run the action
 * while the parent still considers the sheet open (e.g. dialog-to-dialog steps).
 */
export function useDialogActionHandoff(visible: boolean) {
  const pendingActionRef = React.useRef<(() => void) | null>(null);
  const [handoffDismiss, setHandoffDismiss] = React.useState(false);
  const [handoffClosing, setHandoffClosing] = React.useState(false);

  React.useEffect(() => {
    if (!visible) return;
    setHandoffClosing(false);
    setHandoffDismiss(false);
    pendingActionRef.current = null;
  }, [visible]);

  const runAfterClose = React.useCallback((action: () => void, dismiss?: () => void) => {
    pendingActionRef.current = action;
    setHandoffDismiss(true);
    if (dismiss) {
      dismiss();
    } else {
      setHandoffClosing(true);
    }
  }, []);

  const handleClosed = React.useCallback(() => {
    setHandoffDismiss(false);
    setHandoffClosing(false);
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    if (!action) return;
    requestAnimationFrame(() => {
      action();
    });
  }, []);

  const cancelHandoff = React.useCallback(() => {
    pendingActionRef.current = null;
    setHandoffDismiss(false);
    setHandoffClosing(false);
  }, []);

  return {
    shellVisible: visible && !handoffClosing,
    dismissMode: handoffDismiss ? ('immediate' as const) : ('animated' as const),
    runAfterClose,
    handleClosed,
    cancelHandoff,
  };
}

/** Run an action after a dialog has started closing (for one-off call sites). */
export function deferAfterDialogClose(dismiss: () => void, action: () => void) {
  dismiss();
  requestAnimationFrame(() => {
    requestAnimationFrame(action);
  });
}

function DialogFrame({
  visible,
  onClose,
  onHidden,
  children,
  backdropColor = MODAL_BACKDROP_COLOR,
  embedded = false,
  dismissMode = 'animated',
}: DialogShellProps & { onHidden?: () => void }) {
  const insets = useSafeAreaInsets();
  const backdropOpacity = React.useRef(new Animated.Value(0)).current;
  const cardScale = React.useRef(new Animated.Value(0.96)).current;
  const cardOpacity = React.useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = React.useState(visible);

  React.useLayoutEffect(() => {
    if (!visible && mounted && dismissMode === 'immediate') {
      setMounted(false);
      onHidden?.();
    }
  }, [visible, mounted, dismissMode, onHidden]);

  React.useEffect(() => {
    if (visible) {
      setMounted(true);
      backdropOpacity.setValue(0);
      cardScale.setValue(0.96);
      cardOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(cardScale, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    if (!mounted || dismissMode === 'immediate') return;

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 160,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 0.96,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: 140,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setMounted(false);
        onHidden?.();
      }
    });
  }, [visible, mounted, dismissMode, backdropOpacity, cardScale, cardOpacity, onHidden]);

  const handleBackdropPress = React.useCallback(() => {
    if (!visible) return;
    onClose();
  }, [visible, onClose]);

  if (!mounted) return null;

  const content = (
    <View
      style={[
        embedded ? StyleSheet.absoluteFill : { flex: 1 },
        embedded ? { zIndex: 9999, elevation: 9999 } : null,
      ]}
      pointerEvents="box-none"
    >
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: backdropColor, opacity: backdropOpacity }]}
      />
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={handleBackdropPress}
        accessibilityRole="button"
        accessibilityLabel="Close dialog"
      />
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={insets.top}
        style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: insets.top + 16 }}
        pointerEvents="box-none"
      >
        <Animated.View
          pointerEvents="box-none"
          style={{
            width: '100%',
            maxWidth: DIALOG_MAX_WIDTH,
            alignSelf: 'center',
            opacity: cardOpacity,
            transform: [{ scale: cardScale }],
          }}
        >
          <Pressable onPress={(e) => e.stopPropagation()} pointerEvents="box-none">
            {children}
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );

  if (embedded) return content;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      {content}
    </Modal>
  );
}

/** Centered dialog modal for confirms, pickers, and short forms. */
export function DialogShell({
  visible,
  onClose,
  onClosed,
  children,
  backdropColor,
  dismissMode = 'animated',
}: DialogShellProps) {
  const [portalOpen, setPortalOpen] = React.useState(visible);

  React.useEffect(() => {
    if (visible) setPortalOpen(true);
  }, [visible]);

  const handleHidden = React.useCallback(() => {
    setPortalOpen(false);
    onClosed?.();
  }, [onClosed]);

  if (!portalOpen) return null;

  return (
    <Modal visible={portalOpen} transparent animationType="none" onRequestClose={onClose}>
      <DialogFrame
        visible={visible}
        onClose={onClose}
        onHidden={handleHidden}
        backdropColor={backdropColor}
        dismissMode={dismissMode}
        embedded
      >
        {children}
      </DialogFrame>
    </Modal>
  );
}

/** In-modal centered overlay (no extra RN Modal). */
export function DialogOverlay(props: Omit<DialogShellProps, 'embedded'>) {
  return <DialogFrame {...props} embedded />;
}

export interface DialogCardProps {
  children: React.ReactNode;
  maxWidth?: number;
  maxHeight?: ViewStyle['maxHeight'];
  style?: ViewStyle;
}

export function DialogCard({ children, maxWidth = DIALOG_MAX_WIDTH, maxHeight, style }: DialogCardProps) {
  return (
    <View
      pointerEvents="auto"
      style={{
        width: '100%',
        maxWidth,
        maxHeight,
        borderRadius: DIALOG_RADIUS,
        backgroundColor: '#FFFBF2',
        borderWidth: 1,
        borderColor: '#E8D9BE',
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </View>
  );
}

export function DialogHeader({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose?: () => void;
}) {
  return (
    <View className="flex-row items-start px-5 pt-5 pb-4 gap-2 border-b border-border">
      <View className="flex-1 min-w-0 pr-1">{children}</View>
      {onClose ? (
        <TouchableOpacity
          onPress={onClose}
          hitSlop={12}
          activeOpacity={0.7}
          className="p-1 shrink-0"
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <X size={20} color="hsl(24 20% 55%)" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
