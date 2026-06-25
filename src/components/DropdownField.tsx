import {
  DialogCard,
  DialogHeader,
  DialogShell,
  useDialogMaxHeight,
} from '@/src/components/AppSheets';
import { Input } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
import { cn } from '@/src/components/ui/utils/cn';
import { INPUT_ICON_COLOR, INPUT_SINGLE_LINE_CLASS } from '@/src/constants/inputTheme';
import { Check, ChevronDown, Search, X } from 'lucide-react-native';
import React from 'react';
import {
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

export type DropdownOption = {
  value: string;
  label: string;
  description?: string;
  /** Extra text included when filtering search results. */
  searchText?: string;
  disabled?: boolean;
};

export type DropdownFieldProps = {
  value?: string;
  onValueChange?: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  disabled?: boolean;
  /** Dialog title. Defaults to placeholder. */
  title?: string;
  subtitle?: string;
  /** Enable search. Defaults to true when there are 8+ options. */
  searchable?: boolean;
  searchPlaceholder?: string;
  clearable?: boolean;
  clearLabel?: string;
  /** `input` matches form inputs; `card` matches entity pickers. */
  variant?: 'input' | 'card';
  renderValue?: (option: DropdownOption | undefined) => React.ReactNode;
  renderOption?: (
    option: DropdownOption,
    selected: boolean,
    onSelect: () => void,
  ) => React.ReactNode;
  className?: string;
  triggerStyle?: StyleProp<ViewStyle>;
  emptyMessage?: string;
  dialogMaxHeightRatio?: number;
  accessibilityLabel?: string;
};

const CHEVRON_COLOR = 'hsl(24 20% 55%)';
const SEARCH_THRESHOLD = 8;

export function DropdownOptionRow({
  option,
  selected,
  onPress,
}: {
  option: DropdownOption;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={option.disabled}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={cn(
        'flex-row items-center gap-3 px-3 py-3 rounded-2xl border',
        selected ? 'border-primary bg-primary/5' : 'border-border bg-card',
        option.disabled && 'opacity-45',
      )}
    >
      <View className="flex-1 min-w-0">
        <Text className="text-sm font-semibold text-foreground" numberOfLines={2}>
          {option.label}
        </Text>
        {option.description ? (
          <Text className="text-[11px] text-muted-foreground mt-0.5 leading-4" numberOfLines={2}>
            {option.description}
          </Text>
        ) : null}
      </View>
      {selected ? (
        <View className="w-6 h-6 rounded-full bg-primary/15 items-center justify-center shrink-0">
          <Check size={14} color="hsl(39 57% 45%)" strokeWidth={2.5} />
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

function DefaultTriggerContent({
  option,
  placeholder,
  variant,
}: {
  option?: DropdownOption;
  placeholder: string;
  variant: 'input' | 'card';
}) {
  const label = option?.label ?? placeholder;
  const muted = !option;

  if (variant === 'card') {
    return (
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1 min-w-0">
          <Text
            className={cn('text-sm', muted ? 'text-muted-foreground' : 'font-semibold text-foreground')}
            numberOfLines={2}
          >
            {label}
          </Text>
          {option?.description ? (
            <Text className="text-[11px] text-muted-foreground mt-0.5" numberOfLines={1}>
              {option.description}
            </Text>
          ) : null}
        </View>
        <ChevronDown size={18} color={CHEVRON_COLOR} />
      </View>
    );
  }

  return (
    <View className="flex-row items-center justify-between gap-2">
      <Text
        className={cn('flex-1 text-base', muted ? 'text-muted-foreground' : 'text-foreground')}
        numberOfLines={1}
      >
        {label}
      </Text>
      <ChevronDown size={16} color={CHEVRON_COLOR} />
    </View>
  );
}

export function DropdownField({
  value,
  onValueChange,
  options,
  placeholder = 'Select…',
  disabled = false,
  title,
  subtitle,
  searchable,
  searchPlaceholder = 'Search…',
  clearable = false,
  clearLabel = 'Clear selection',
  variant = 'input',
  renderValue,
  renderOption,
  className,
  triggerStyle,
  emptyMessage = 'No options available.',
  dialogMaxHeightRatio,
  accessibilityLabel,
}: DropdownFieldProps) {
  const dialogMaxHeight = useDialogMaxHeight(dialogMaxHeightRatio);
  const listMaxHeight = Math.max(140, dialogMaxHeight - (searchable === false ? 140 : 190));
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');

  const selected = React.useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const showSearch = searchable ?? options.length >= SEARCH_THRESHOLD;

  const filteredOptions = React.useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) => {
      const haystack = `${option.label} ${option.description ?? ''} ${option.searchText ?? ''}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [options, query]);

  const openPicker = React.useCallback(() => {
    if (disabled || options.length === 0) return;
    setQuery('');
    setOpen(true);
  }, [disabled, options.length]);

  const closePicker = React.useCallback(() => setOpen(false), []);

  const handleSelect = React.useCallback(
    (option: DropdownOption) => {
      if (option.disabled) return;
      onValueChange?.(option.value);
      setOpen(false);
    },
    [onValueChange],
  );

  const handleClear = React.useCallback(() => {
    onValueChange?.('');
  }, [onValueChange]);

  const dialogTitle = title ?? placeholder;

  return (
    <View className={className}>
      <Pressable
        onPress={openPicker}
        disabled={disabled || options.length === 0}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? dialogTitle}
        accessibilityState={{ disabled: disabled || options.length === 0 }}
        style={triggerStyle}
        className={cn(
          variant === 'card'
            ? 'rounded-2xl border border-border bg-card px-3 py-3'
            : cn(INPUT_SINGLE_LINE_CLASS, 'justify-center'),
          (disabled || options.length === 0) && 'opacity-50',
        )}
      >
        {renderValue ? (
          renderValue(selected) ?? (
            <DefaultTriggerContent option={selected} placeholder={placeholder} variant={variant} />
          )
        ) : (
          <DefaultTriggerContent option={selected} placeholder={placeholder} variant={variant} />
        )}
      </Pressable>

      {clearable && selected ? (
        <TouchableOpacity onPress={handleClear} activeOpacity={0.75} className="self-start mt-2">
          <Text className="text-xs font-semibold text-primary">{clearLabel}</Text>
        </TouchableOpacity>
      ) : null}

      {open ? (
        <DialogShell visible onClose={closePicker}>
          <DialogCard maxHeight={dialogMaxHeight}>
            <DialogHeader onClose={closePicker}>
              <Text className="text-xl text-foreground" style={{ fontFamily: 'Fraunces_700Bold' }}>
                {dialogTitle}
              </Text>
              {subtitle ? (
                <Text className="text-sm text-muted-foreground mt-1 leading-5">{subtitle}</Text>
              ) : null}
            </DialogHeader>

            {showSearch ? (
              <View className="px-5 pt-4 pb-2">
                <View className="relative justify-center">
                  <View className="absolute left-4 z-10">
                    <Search size={16} color={INPUT_ICON_COLOR} />
                  </View>
                  {query.length > 0 ? (
                    <TouchableOpacity
                      onPress={() => setQuery('')}
                      hitSlop={8}
                      activeOpacity={0.7}
                      className="absolute right-4 z-10"
                    >
                      <X size={16} color={INPUT_ICON_COLOR} />
                    </TouchableOpacity>
                  ) : null}
                  <Input
                    value={query}
                    onChangeText={setQuery}
                    placeholder={searchPlaceholder}
                    className={cn('pl-11', query.length > 0 && 'pr-11')}
                    autoFocus
                  />
                </View>
              </View>
            ) : null}

            <ScrollView
              className="px-5"
              style={{ maxHeight: listMaxHeight }}
              contentContainerStyle={{ paddingTop: 12, paddingBottom: 20, gap: 8 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {filteredOptions.length === 0 ? (
                <View className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-8 items-center">
                  <Text className="text-sm text-muted-foreground text-center leading-5">
                    {query.trim() ? 'No matches for your search.' : emptyMessage}
                  </Text>
                </View>
              ) : (
                filteredOptions.map((option) =>
                  renderOption ? (
                    <React.Fragment key={option.value}>
                      {renderOption(option, value === option.value, () => handleSelect(option))}
                    </React.Fragment>
                  ) : (
                    <DropdownOptionRow
                      key={option.value}
                      option={option}
                      selected={value === option.value}
                      onPress={() => handleSelect(option)}
                    />
                  ),
                )
              )}
            </ScrollView>
          </DialogCard>
        </DialogShell>
      ) : null}
    </View>
  );
}
