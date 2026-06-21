import { PhotoPickerOverlay } from '@/src/components/PhotoPickerOverlay';
import { KeyboardAvoidingView } from '@/src/components/ui/keyboard-avoiding-view';
import React from 'react';
import {
  Animated,
  Easing,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

/** Shared bottom-sheet defaults — use across form modals for consistency. */
export const MODAL_BACKDROP_COLOR = 'rgba(22,14,10,0.52)';
export const MODAL_SHEET_RADIUS = 32;
export const MODAL_SHEET_HEIGHT_RATIO = 0.92;

export function useModalSheetHeight(ratio = MODAL_SHEET_HEIGHT_RATIO) {
  const { height } = useWindowDimensions();
  return height * ratio;
}

export interface ModalShellProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  backdropColor?: string;
  /** Full-screen overlay rendered above the sheet (e.g. embedded lightbox). */
  overlay?: React.ReactNode;
}

type ModalSheetPanContextValue = {
  panHandlers: ReturnType<typeof PanResponder.create>['panHandlers'];
};

export const ModalSheetPanContext = React.createContext<ModalSheetPanContextValue | null>(null);

const ModalSheetCloseContext = React.createContext<(() => void) | null>(null);

/** Full-screen bottom-sheet modal. Embeds the photo picker overlay when active. */
export function ModalShell({
  visible,
  onClose,
  children,
  backdropColor = MODAL_BACKDROP_COLOR,
  overlay,
}: ModalShellProps) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const backdropOpacity = React.useRef(new Animated.Value(0)).current;
  const slideY = React.useRef(new Animated.Value(height)).current;
  const dragY = React.useRef(new Animated.Value(0)).current;
  const closingRef = React.useRef(false);

  const runCloseAnimation = React.useCallback(
    (afterClose?: () => void) => {
      if (closingRef.current) return;
      closingRef.current = true;
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(slideY, {
          toValue: height,
          duration: 240,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        closingRef.current = false;
        dragY.setValue(0);
        if (finished) (afterClose ?? onClose)();
      });
    },
    [backdropOpacity, slideY, dragY, height, onClose],
  );

  const runOpenAnimation = React.useCallback(() => {
    backdropOpacity.setValue(0);
    slideY.setValue(height);
    dragY.setValue(0);
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
  }, [backdropOpacity, slideY, dragY, height]);

  React.useEffect(() => {
    if (visible) {
      runOpenAnimation();
    }
  }, [visible, runOpenAnimation]);

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          gesture.dy > 8 && Math.abs(gesture.dy) > Math.abs(gesture.dx * 1.2),
        onPanResponderMove: (_, gesture) => {
          if (gesture.dy > 0) dragY.setValue(gesture.dy);
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dy > 96 || gesture.vy > 1.1) {
            runCloseAnimation();
            return;
          }
          Animated.spring(dragY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(dragY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
          }).start();
        },
      }),
    [dragY, runCloseAnimation],
  );

  const handleBackdropPress = React.useCallback(() => {
    runCloseAnimation();
  }, [runCloseAnimation]);

  const sheetTranslateY = React.useMemo(
    () => Animated.add(slideY, dragY),
    [slideY, dragY],
  );

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={handleBackdropPress}>
      <ModalSheetCloseContext.Provider value={handleBackdropPress}>
        <ModalSheetPanContext.Provider value={{ panHandlers: panResponder.panHandlers }}>
          <View style={{ flex: 1 }} pointerEvents="box-none">
            <Animated.View
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, { backgroundColor: backdropColor, opacity: backdropOpacity }]}
            />
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={handleBackdropPress}
              accessibilityRole="button"
              accessibilityLabel="Close modal"
            />
            <KeyboardAvoidingView
              behavior="padding"
              keyboardVerticalOffset={insets.top}
              style={{ flex: 1, justifyContent: 'flex-end' }}
              pointerEvents="box-none"
            >
              <Animated.View style={{ transform: [{ translateY: sheetTranslateY }] }} pointerEvents="box-none">
                <View pointerEvents="auto">{children}</View>
              </Animated.View>
            </KeyboardAvoidingView>
            {visible ? <PhotoPickerOverlay /> : null}
            {visible ? overlay : null}
          </View>
        </ModalSheetPanContext.Provider>
      </ModalSheetCloseContext.Provider>
    </Modal>
  );
}

export interface ModalCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'pottery';
  maxHeight?: ViewStyle['maxHeight'];
  /** Set an explicit height so flex children (e.g. ScrollView) can fill the sheet. */
  height?: ViewStyle['height'];
  radius?: number;
  /** When false, omit the top drag handle (use ModalSheetHeader instead). */
  withHandle?: boolean;
}

function ModalDragHandle() {
  const pan = React.useContext(ModalSheetPanContext);

  return (
    <View {...(pan?.panHandlers ?? {})} accessibilityRole="adjustable" accessibilityLabel="Swipe down to close">
      <View style={{ alignItems: 'center', paddingVertical: 14 }}>
        <View className="w-10 h-1.5 bg-muted rounded-full" />
      </View>
    </View>
  );
}

export function ModalSheetHeader({ children }: { children: React.ReactNode }) {
  const requestClose = React.useContext(ModalSheetCloseContext);
  const pan = React.useContext(ModalSheetPanContext);

  return (
    <View className="border-b border-border shrink-0" {...(pan?.panHandlers ?? {})}>
      <View style={{ alignItems: 'center', paddingTop: 8, paddingBottom: 4 }}>
        <View className="w-10 h-1.5 bg-muted rounded-full" />
      </View>
      <View className="flex-row items-start px-6 pb-4 gap-2">
        <View className="flex-1 min-w-0 pr-2">{children}</View>
        <TouchableOpacity
          onPress={requestClose ?? undefined}
          hitSlop={12}
          activeOpacity={0.7}
          className="p-1 shrink-0"
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <X size={20} color="hsl(24 20% 55%)" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

/** Sticky footer for tall form sheets. */
export function ModalSheetFooter({ children }: { children: React.ReactNode }) {
  return (
    <View className="px-6 pt-4 pb-8 border-t border-border shrink-0">
      {children}
    </View>
  );
}

export function ModalCard({
  children,
  variant = 'default',
  maxHeight,
  height,
  radius,
  withHandle = true,
}: ModalCardProps) {
  const topRadius = radius ?? (variant === 'pottery' ? 28 : MODAL_SHEET_RADIUS);
  const shellStyle = {
    maxHeight,
    height,
    flexDirection: 'column' as const,
  };

  if (variant === 'pottery') {
    return (
      <View
        style={{
          borderTopLeftRadius: topRadius,
          borderTopRightRadius: topRadius,
          backgroundColor: '#FFFBF2',
          borderTopWidth: 1,
          borderColor: '#E8D9BE',
          ...shellStyle,
        }}
      >
        {withHandle ? <ModalDragHandle /> : null}
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
        ...shellStyle,
      }}
    >
      {withHandle ? <ModalDragHandle /> : null}
      {children}
    </View>
  );
}
