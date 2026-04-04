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
import { Modal, Pressable, TouchableOpacity, View } from 'react-native';

// ─── Shared card shell ────────────────────────────────────────────────────────

function SheetCard({ children, onBackdrop }: { children: React.ReactNode; onBackdrop: () => void }) {
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onBackdrop}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(22,14,10,0.52)' }}>
        <Pressable style={{ position: 'absolute', inset: 0 }} onPress={onBackdrop} />
        <View
          style={{
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
        </View>
      </View>
    </Modal>
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
