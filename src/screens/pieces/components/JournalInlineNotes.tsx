import { Text } from '@/src/components/ui/text';
import { useTextScale } from '@/src/hooks/useTextScale';
import { Pencil } from 'lucide-react-native';
import React from 'react';
import { Keyboard, Pressable, TextInput, TouchableOpacity, View } from 'react-native';
import { JournalEditScope } from './journalEditScope';
import { JournalTheme } from '../utils/journalTheme';

type JournalInlineNotesProps = {
  title: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  compact?: boolean;
  /** Shown when empty to invite writing */
  emptyPrompt?: string;
  onEditingChange?: (editing: boolean) => void;
};

export function JournalInlineNotes({
  title,
  value,
  placeholder,
  onChangeText,
  compact,
  emptyPrompt,
  onEditingChange,
}: JournalInlineNotesProps) {
  const { scaled } = useTextScale();
  const editScope = React.useContext(JournalEditScope);
  const inputRef = React.useRef<TextInput>(null);
  const [editing, setEditing] = React.useState(false);
  const trimmed = value.trim();
  const showEmptyPrompt = !trimmed && emptyPrompt;

  const stopEditing = React.useCallback(() => {
    setEditing(false);
    onEditingChange?.(false);
  }, [onEditingChange]);

  const exitEditing = React.useCallback(() => {
    stopEditing();
    Keyboard.dismiss();
  }, [stopEditing]);

  const enterEditing = React.useCallback(() => {
    setEditing(true);
    onEditingChange?.(true);
    // Wait for TextInput mount + layout so keyboard-aware scroll can target it.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => inputRef.current?.focus());
    });
  }, [onEditingChange]);

  React.useEffect(() => {
    editScope?.registerDismiss(editing ? exitEditing : null);
    return () => editScope?.registerDismiss(null);
  }, [editScope, editing, exitEditing]);

  return (
    <View
      style={{
        borderRadius: 14,
        borderWidth: 1,
        borderColor: editing ? JournalTheme.coverNotesBorder : JournalTheme.coverRule,
        backgroundColor: 'rgba(255, 252, 247, 0.85)',
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 8,
          paddingHorizontal: compact ? 12 : 14,
          paddingTop: compact ? 10 : 12,
          paddingBottom: 6,
          borderBottomWidth: 1,
          borderBottomColor: JournalTheme.coverRule,
          backgroundColor: 'rgba(215, 180, 141, 0.1)',
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 9,
              fontWeight: '700',
              letterSpacing: 1.6,
              textTransform: 'uppercase',
              color: JournalTheme.coverMastheadInk,
            }}
          >
            {title}
          </Text>
          {showEmptyPrompt && !editing ? (
            <Text
              style={{
                fontSize: scaled(11),
                lineHeight: scaled(16),
                color: JournalTheme.coverSpecLabel,
                marginTop: 4,
                fontStyle: 'italic',
              }}
            >
              {emptyPrompt}
            </Text>
          ) : null}
        </View>
        {editing ? (
          <TouchableOpacity
            onPress={() => {
              inputRef.current?.blur();
              exitEditing();
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Done editing notes"
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 999,
              backgroundColor: JournalTheme.navButtonActive,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '700', color: JournalTheme.navIconActive }}>Done</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: 1 }}>
            <Pencil size={11} color={JournalTheme.coverSpecLabel} />
            <Text style={{ fontSize: 10, color: JournalTheme.coverSpecLabel }}>Tap to edit</Text>
          </View>
        )}
      </View>

      <View
        style={{
          paddingHorizontal: compact ? 12 : 14,
          paddingVertical: compact ? 10 : 12,
          minHeight: compact ? 100 : 120,
        }}
      >
        {editing ? (
          <TextInput
            ref={inputRef}
            multiline
            value={value}
            onChangeText={onChangeText}
            onBlur={stopEditing}
            placeholder={placeholder}
            placeholderTextColor={JournalTheme.placeholder}
            style={{
              minHeight: compact ? 88 : 104,
              fontFamily: 'DMSans_400Regular',
              fontSize: scaled(14),
              lineHeight: scaled(22),
              color: JournalTheme.bodyInk,
              textAlignVertical: 'top',
              padding: 0,
            }}
          />
        ) : (
          <Pressable
            onPress={enterEditing}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${title}`}
            style={{ minHeight: compact ? 88 : 104 }}
          >
            {trimmed ? (
              <Text
                style={{
                  fontFamily: 'DMSans_400Regular',
                  fontSize: scaled(14),
                  lineHeight: scaled(22),
                  color: JournalTheme.bodyInk,
                }}
              >
                {value}
              </Text>
            ) : (
              <Text
                style={{
                  fontFamily: 'DMSans_400Regular',
                  fontSize: scaled(14),
                  lineHeight: scaled(22),
                  color: JournalTheme.placeholder,
                  fontStyle: 'italic',
                }}
              >
                {placeholder}
              </Text>
            )}
          </Pressable>
        )}
        <Text
          style={{
            fontSize: scaled(10),
            color: JournalTheme.coverSpecLabel,
            marginTop: 8,
            letterSpacing: 0.3,
          }}
        >
          {editing ? 'Saves as you write' : 'Tap the note to start writing'}
        </Text>
      </View>
    </View>
  );
}
