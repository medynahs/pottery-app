import { SelectChip, SelectChipGroup } from '@/src/components/ui/SelectChip';
import React from 'react';

interface OptionPillsProps {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  allowDeselect?: boolean;
}

export function OptionPills({ options, value, onChange, allowDeselect = true }: OptionPillsProps) {
  return (
    <SelectChipGroup>
      {options.map((opt) => {
        const isActive = value === opt;
        return (
          <SelectChip
            key={opt}
            label={opt}
            selected={isActive}
            allowDeselect={allowDeselect}
            onPress={() => onChange(isActive ? '' : opt)}
          />
        );
      })}
    </SelectChipGroup>
  );
}
