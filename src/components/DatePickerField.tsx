import {
  DialogCard,
  DialogHeader,
  DialogShell,
} from '@/src/components/DialogShell';
import { Input } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
import {
  formatDateNumeric,
  parseDisplayDateToIso,
  parseIsoDate,
  todayIso,
} from '@/src/utils/dates';
import { CalendarDays } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

type DatePickerFieldProps = {
  valueIso: string;
  onChangeIso: (iso: string) => void;
  placeholder?: string;
};

const CALENDAR_THEME = {
  calendarBackground: 'transparent',
  selectedDayBackgroundColor: 'hsl(24 45% 45%)',
  todayTextColor: 'hsl(24 45% 45%)',
  arrowColor: 'hsl(24 45% 45%)',
  monthTextColor: 'hsl(24 20% 20%)',
  textDayFontFamily: 'System',
  textMonthFontFamily: 'System',
  textDayHeaderFontFamily: 'System',
};

function DatePickerCalendarDialog({
  visible,
  safeIso,
  onClose,
  onSelectDay,
}: {
  visible: boolean;
  safeIso: string;
  onClose: () => void;
  onSelectDay: (iso: string) => void;
}) {
  return (
    <DialogShell visible={visible} onClose={onClose}>
      <DialogCard>
        <DialogHeader onClose={onClose}>
          <Text className="text-base font-semibold text-foreground">Pick a date</Text>
        </DialogHeader>
        <Calendar
          current={safeIso}
          onDayPress={(day) => onSelectDay(day.dateString)}
          markedDates={{
            [safeIso]: { selected: true, selectedColor: 'hsl(24 45% 45%)' },
          }}
          theme={CALENDAR_THEME}
          style={{ width: '100%', paddingBottom: 16 }}
        />
      </DialogCard>
    </DialogShell>
  );
}

export function DatePickerField({
  valueIso,
  onChangeIso,
  placeholder = 'DD/MM/YYYY',
}: DatePickerFieldProps) {
  const [showCalendar, setShowCalendar] = React.useState(false);
  const [textValue, setTextValue] = React.useState(() => formatDateNumeric(valueIso));

  React.useEffect(() => {
    setTextValue(formatDateNumeric(valueIso));
  }, [valueIso]);

  const commitText = (raw: string) => {
    setTextValue(raw);
    const iso = parseDisplayDateToIso(raw);
    if (iso) onChangeIso(iso);
  };

  const handleCalendarDay = (iso: string) => {
    onChangeIso(iso);
    setTextValue(formatDateNumeric(iso));
    setShowCalendar(false);
  };

  const safeIso = parseIsoDate(valueIso) ? valueIso : todayIso();

  return (
    <View>
      <View className="flex-row items-center gap-2">
        <View className="flex-1">
          <Input
            value={textValue}
            onChangeText={commitText}
            placeholder={placeholder}
            keyboardType="numbers-and-punctuation"
            autoCapitalize="none"
            onBlur={() => {
              const iso = parseDisplayDateToIso(textValue);
              if (iso) {
                setTextValue(formatDateNumeric(iso));
              } else {
                setTextValue(formatDateNumeric(valueIso));
              }
            }}
          />
        </View>
        <TouchableOpacity
          onPress={() => setShowCalendar(true)}
          activeOpacity={0.85}
          className="w-11 h-11 rounded-xl border border-border bg-muted items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel="Open calendar"
        >
          <CalendarDays size={18} color="hsl(24 20% 40%)" />
        </TouchableOpacity>
      </View>

      <DatePickerCalendarDialog
        visible={showCalendar}
        safeIso={safeIso}
        onClose={() => setShowCalendar(false)}
        onSelectDay={handleCalendarDay}
      />
    </View>
  );
}
