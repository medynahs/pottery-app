import { PhotoPickerOverlay } from '@/src/components/PhotoPickerOverlay';
import { X } from 'lucide-react-native';
import React from 'react';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
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

export const MODAL_BACKDROP_COLOR = 'rgba(22,14,10,0.52)';
export const MODAL_SHEET_RADIUS = 32;
export const MODAL_SHEET_HEIGHT_RATIO = 0.92;
/** Opaque sheet surface — NativeWind `bg-background` does not paint inside RN Modal. */
export const MODAL_SHEET_SURFACE = '#FFFBF2';
export const MODAL_SHEET_BORDER = '#E8D9BE';

export function useModalSheetHeight(ratio = MODAL_SHEET_HEIGHT_RATIO) {
  const { height } = useWindowDimensions();
  return height * ratio;
}

export interface ModalShellProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  backdropColor?: string;
  overlay?: React.ReactNode;
}

type ModalSheetPanContextValue = {
  panHandlers: ReturnType<typeof PanResponder.create>['panHandlers'];
};

export const ModalSheetPanContext = React.createContext<ModalSheetPanContextValue | null>(null);

const ModalSheetCloseContext = React.createContext<(() => void) | null>(null);

export function ModalShell({
  visible,
  onClose,
  children,
  backdropColor = MODAL_BACKDROP_COLOR,
  overlay,
}: ModalShellProps) {
  const { height } = useWindowDimensions();
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
            <View style={{ flex: 1, justifyContent: 'flex-end' }} pointerEvents="box-none">
              <Animated.View style={{ transform: [{ translateY: sheetTranslateY }] }} pointerEvents="box-none">
                <View pointerEvents="auto">{children}</View>
              </Animated.View>
            </View>
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
  /** Override the sheet shell background (e.g. themed headers that bleed to the top edge). */
  backgroundColor?: string;
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
    <View
      style={{
        borderBottomWidth: 1,
        borderBottomColor: MODAL_SHEET_BORDER,
        backgroundColor: MODAL_SHEET_SURFACE,
        flexShrink: 0,
      }}
      {...(pan?.panHandlers ?? {})}
    >
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

/** Sticky footer for tall form sheets — rides the keyboard instead of leaving a gap. */
export function ModalSheetFooter({ children }: { children: React.ReactNode }) {
  return (
    <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
      <View
        style={{
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 32,
          borderTopWidth: 1,
          borderTopColor: MODAL_SHEET_BORDER,
          backgroundColor: MODAL_SHEET_SURFACE,
          flexShrink: 0,
        }}
      >
        {children}
      </View>
    </KeyboardStickyView>
  );
}

export function ModalCard({
  children,
  variant = 'default',
  maxHeight,
  height,
  radius,
  withHandle = true,
  backgroundColor,
}: ModalCardProps) {
  const topRadius = radius ?? (variant === 'pottery' ? 28 : MODAL_SHEET_RADIUS);
  const surfaceColor = backgroundColor ?? MODAL_SHEET_SURFACE;
  const shellStyle = {
    maxHeight,
    height,
    flexDirection: 'column' as const,
    flexShrink: 1,
    minHeight: 0,
    overflow: 'hidden' as const,
  };

  return (
    <View
      style={{
        borderTopLeftRadius: topRadius,
        borderTopRightRadius: topRadius,
        backgroundColor: surfaceColor,
        borderTopWidth: 1,
        borderColor: MODAL_SHEET_BORDER,
        ...shellStyle,
      }}
    >
      {withHandle ? <ModalDragHandle /> : null}
      {children}
    </View>
  );
}
