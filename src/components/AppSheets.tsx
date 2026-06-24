/**
 * App-wide custom sheet variants that match the Pottery Nook visual language.
 * Use these everywhere instead of native Alert.alert.
 *
 * ConfirmSheet , confirm / cancel (optionally destructive)
 * InfoSheet    , informational with a single dismiss button
 * PickSheet    , free-form list of labelled options + cancel
 *
 * Short interrupts use centered DialogShell. Full forms use ModalShell.
 */
import {
  DialogCard,
  DialogOverlay,
  DialogShell,
  useDialogActionHandoff,
} from '@/src/components/DialogShell';
import { Text } from '@/src/components/ui/text';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

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

/** Stacked dialog footer actions, matches PrimaryButton sizing app-wide. */
export function ModalSheetActions({ children }: { children: React.ReactNode }) {
  return <View style={{ gap: 10 }}>{children}</View>;
}

export {
  deferAfterDialogClose, DIALOG_LIST_HEIGHT_RATIO,
  DIALOG_MAX_WIDTH,
  DIALOG_RADIUS, DialogCard,
  DialogHeader,
  DialogOverlay,
  DialogShell, useDialogActionHandoff,
  useDialogMaxHeight
} from '@/src/components/DialogShell';

export { DropdownField, DropdownOptionRow } from '@/src/components/DropdownField';
export type { DropdownFieldProps, DropdownOption } from '@/src/components/DropdownField';
export { MODAL_FORM_FOOTER_OFFSET, MODAL_SHEET_FOOTER_HEIGHT, ModalFormScrollView } from '@/src/components/ModalFormScrollView';
export type { ModalFormScrollViewProps } from '@/src/components/ModalFormScrollView';
export {
  MODAL_BACKDROP_COLOR,
  MODAL_SHEET_HEIGHT_RATIO,
  MODAL_SHEET_RADIUS, ModalCard, ModalSheetFooter,
  ModalSheetHeader, ModalShell, useModalSheetHeight
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
  dismissOnConfirm?: () => void;
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
  dismissOnConfirm,
  onConfirm,
  onCancel,
}: ConfirmSheetProps) {
  const handoff = useDialogActionHandoff(visible);

  const handleConfirm = React.useCallback(() => {
    if (loading) return;
    handoff.runAfterClose(onConfirm, dismissOnConfirm);
  }, [handoff, loading, onConfirm, dismissOnConfirm]);

  const handleCancel = React.useCallback(() => {
    handoff.cancelHandoff();
    onCancel();
  }, [handoff, onCancel]);

  return (
    <DialogShell
      visible={handoff.shellVisible}
      onClose={handleCancel}
      onClosed={handoff.handleClosed}
      dismissMode={handoff.dismissMode}
    >
      <DialogCard>
        <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 8 }}>
          <Text className="text-lg font-bold text-foreground">{title}</Text>
          <Text className="text-sm text-muted-foreground mt-2 leading-5">{body}</Text>
        </View>
        <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24, gap: 10 }}>
          <SheetButton
            label={loading ? 'Please wait…' : confirmLabel}
            onPress={handleConfirm}
            variant={destructive ? 'destructive' : 'confirm'}
            disabled={loading}
          />
          <SheetButton label="Cancel" onPress={handleCancel} variant="cancel" disabled={loading} />
        </View>
      </DialogCard>
    </DialogShell>
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
    <DialogShell visible={visible} onClose={onDismiss}>
      <DialogCard>
        <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 8 }}>
          <Text className="text-lg font-bold text-foreground">{title}</Text>
          <Text className="text-sm text-muted-foreground mt-2 leading-5">{body}</Text>
        </View>
        <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24 }}>
          <SheetButton label={buttonLabel} onPress={onDismiss} variant="confirm" />
        </View>
      </DialogCard>
    </DialogShell>
  );
}

// ─── PickSheet ────────────────────────────────────────────────────────────────

export interface PickSheetOption {
  label: string;
  destructive?: boolean;
  onPress: () => void;
  icon?: React.ComponentType<{ size: number; color: string }>;
  iconColor?: string;
  iconBg?: string;
}

export interface PickSheetProps {
  visible: boolean;
  title: string;
  body?: string;
  options: PickSheetOption[];
  onCancel: () => void;
  /** Render inside an existing modal instead of opening a new RN Modal. */
  embedded?: boolean;
  /** List rows with icons (settings-style) vs stacked action buttons. */
  layout?: 'buttons' | 'list';
}

function PickSheetContent({
  title,
  body,
  options,
  onCancel,
  onSelectOption,
  layout = 'buttons',
}: Pick<PickSheetProps, 'title' | 'body' | 'options' | 'onCancel' | 'layout'> & {
  onSelectOption: (opt: PickSheetOption) => void;
}) {
  return (
    <DialogCard>
      <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 8 }}>
        <Text className="text-lg font-bold text-foreground">{title}</Text>
        {body ? <Text className="text-sm text-muted-foreground mt-2 leading-5">{body}</Text> : null}
      </View>
      <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24, gap: 10 }}>
        {layout === 'list' ? (
          <View
            style={{
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#E8D9BE',
              backgroundColor: '#FFFBF2',
              overflow: 'hidden',
            }}
          >
            {options.map((opt, index) => {
              const Icon = opt.icon;
              const isLast = index === options.length - 1;
              return (
                <TouchableOpacity
                  key={opt.label}
                  onPress={() => onSelectOption(opt)}
                  activeOpacity={0.72}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderBottomWidth: isLast ? 0 : 1,
                    borderBottomColor: '#E8D9BE',
                  }}
                >
                  {Icon ? (
                    <View
                      className="w-9 h-9 rounded-xl items-center justify-center"
                      style={{ backgroundColor: opt.iconBg ?? 'hsl(35 46% 92%)' }}
                    >
                      <Icon size={17} color={opt.iconColor ?? 'hsl(24 30% 40%)'} />
                    </View>
                  ) : null}
                  <Text
                    className={`flex-1 text-sm font-medium ${opt.destructive ? 'text-destructive' : 'text-foreground'}`}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          options.map((opt) => (
            <SheetButton
              key={opt.label}
              label={opt.label}
              onPress={() => onSelectOption(opt)}
              variant={opt.destructive ? 'destructive' : 'confirm'}
            />
          ))
        )}
        <SheetButton label="Cancel" onPress={onCancel} variant="cancel" />
      </View>
    </DialogCard>
  );
}

export function PickSheet({ visible, title, body, options, onCancel, embedded, layout = 'buttons' }: PickSheetProps) {
  const handoff = useDialogActionHandoff(visible);

  const handleSelectOption = React.useCallback(
    (opt: PickSheetOption) => {
      if (embedded) {
        opt.onPress();
        onCancel();
        return;
      }
      handoff.runAfterClose(opt.onPress, onCancel);
    },
    [embedded, handoff, onCancel],
  );

  const handleCancel = React.useCallback(() => {
    handoff.cancelHandoff();
    onCancel();
  }, [handoff, onCancel]);

  const content = (
    <PickSheetContent
      title={title}
      body={body}
      options={options}
      onCancel={handleCancel}
      onSelectOption={handleSelectOption}
      layout={layout}
    />
  );

  if (embedded) {
    return (
      <DialogOverlay visible={visible} onClose={handleCancel}>
        {content}
      </DialogOverlay>
    );
  }

  return (
    <DialogShell
      visible={handoff.shellVisible}
      onClose={handleCancel}
      onClosed={handoff.handleClosed}
      dismissMode={handoff.dismissMode}
    >
      {content}
    </DialogShell>
  );
}
