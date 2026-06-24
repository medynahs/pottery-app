import { DropdownField, type DropdownOption } from '@/src/components/DropdownField';
import * as React from 'react';
import { View } from './view';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface SelectProps {
  value?: SelectOption;
  onValueChange?: (option: SelectOption | undefined) => void;
  options?: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/** App-wide single-select dropdown. Prefer this over ad-hoc pickers. */
export function Select({
  value,
  onValueChange,
  options = [],
  placeholder = 'Select…',
  disabled = false,
  className,
}: SelectProps) {
  const mappedOptions: DropdownOption[] = React.useMemo(
    () => options.map((option) => ({ ...option })),
    [options],
  );

  return (
    <DropdownField
      value={value?.value}
      onValueChange={(nextValue) => {
        const option = mappedOptions.find((item) => item.value === nextValue);
        onValueChange?.(option);
      }}
      options={mappedOptions}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      searchable={mappedOptions.length >= 8}
    />
  );
}

// Compatibility exports for DataTable
export const SelectTrigger = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <View className={className}>{children}</View>;
};

export const SelectContent = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  return null;
};

export const SelectItem = ({
  value,
  label,
  children,
}: {
  value: string;
  label: string;
  children: React.ReactNode;
}) => {
  return null;
};
