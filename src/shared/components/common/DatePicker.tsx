import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Icon from '@react-native-vector-icons/feather';
import LocalizedText from '../../i18n/LocalizedText';
import TouchableOpacity from '../AnimatedTouchableOpacity';

export interface CalendarPickerProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  endDate?: Date;
  minDate?: Date;
  maxDate?: Date;
  style?: StyleProp<ViewStyle>;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function isDateInRange(target: Date, start: Date, end: Date): boolean {
  const t = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return t >= s && t <= e;
}

export function formatReadableDate(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
  selectedDate,
  onSelectDate,
  endDate,
  minDate,
  maxDate,
  style,
}) => {
  const [currentMonth, setCurrentMonth] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );

  const today = new Date();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  return (
    <View style={[styles.calendarContainer, style]}>
      {/* Month & Navigation Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.navBtn}
          scaleTo={0.88}
          onPress={handlePrevMonth}
          accessibilityLabel="Previous month"
        >
          <Icon name="chevron-left" size={18} color="#258B3E" />
        </TouchableOpacity>

        <LocalizedText style={styles.monthTitle}>
          {MONTH_NAMES[month]} {year}
        </LocalizedText>

        <TouchableOpacity
          style={styles.navBtn}
          scaleTo={0.88}
          onPress={handleNextMonth}
          accessibilityLabel="Next month"
        >
          <Icon name="chevron-right" size={18} color="#258B3E" />
        </TouchableOpacity>
      </View>

      {/* Weekdays Row */}
      <View style={styles.weekDaysRow}>
        {WEEK_DAYS.map((day) => (
          <View key={day} style={styles.weekDayCol}>
            <LocalizedText style={styles.weekDayText}>{day}</LocalizedText>
          </View>
        ))}
      </View>

      {/* Days Grid */}
      <View style={styles.daysGrid}>
        {daysArray.map((day, idx) => {
          if (day === null) {
            return <View key={`empty-${idx}`} style={styles.dayCell} />;
          }

          const cellDate = new Date(year, month, day);
          const isSelectedStart = isSameDay(cellDate, selectedDate);
          const isSelectedEnd = endDate ? isSameDay(cellDate, endDate) : false;
          const isInRange = endDate ? isDateInRange(cellDate, selectedDate, endDate) : false;
          const isTodayDate = isSameDay(cellDate, today);

          const isPast = minDate
            ? new Date(year, month, day).getTime() <
              new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()).getTime()
            : false;

          const isFutureDisabled = maxDate
            ? new Date(year, month, day).getTime() >
              new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate()).getTime()
            : false;

          const isDisabled = isPast || isFutureDisabled;

          return (
            <View key={`day-${day}`} style={styles.dayCell}>
              {isInRange && !isSelectedStart && !isSelectedEnd && (
                <View style={styles.rangeHighlight} />
              )}
              <TouchableOpacity
                disabled={isDisabled}
                onPress={() => onSelectDate(cellDate)}
                scaleTo={0.88}
                style={[
                  styles.dayButton,
                  (isSelectedStart || isSelectedEnd) && styles.dayButtonSelected,
                  isDisabled && styles.dayButtonDisabled,
                ]}
              >
                <LocalizedText
                  style={[
                    styles.dayText,
                    (isSelectedStart || isSelectedEnd) && styles.dayTextSelected,
                    isInRange && !isSelectedStart && !isSelectedEnd && styles.dayTextInRange,
                    isDisabled && styles.dayTextDisabled,
                  ]}
                >
                  {day}
                </LocalizedText>
                {isTodayDate && !isSelectedStart && !isSelectedEnd && (
                  <View style={styles.todayIndicator} />
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export interface DatePickerFieldProps {
  label?: string;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  endDate?: Date;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
}

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label,
  selectedDate,
  onSelectDate,
  endDate,
  minDate,
  maxDate,
  placeholder = 'Select date',
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={[styles.fieldWrap, style]}>
      {label && <LocalizedText style={styles.fieldLabel}>{label}</LocalizedText>}

      <TouchableOpacity
        style={[styles.inputBox, isOpen && styles.inputBoxActive]}
        scaleTo={0.97}
        onPress={() => setIsOpen(!isOpen)}
      >
        <View style={styles.inputLeft}>
          <Icon name="calendar" size={17} color="#258B3E" style={{ marginRight: 10 }} />
          <LocalizedText style={styles.inputText}>
            {selectedDate ? formatReadableDate(selectedDate) : placeholder}
          </LocalizedText>
        </View>

        <Icon
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#6b7280"
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.calendarDropdown}>
          <CalendarPicker
            selectedDate={selectedDate}
            onSelectDate={(d) => {
              onSelectDate(d);
              setIsOpen(false);
            }}
            endDate={endDate}
            minDate={minDate}
            maxDate={maxDate}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  calendarContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  monthTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EAF5ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekDayCol: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  weekDayText: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    color: '#9ca3af',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginVertical: 1,
  },
  rangeHighlight: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 0,
    right: 0,
    backgroundColor: '#EAF5ED',
  },
  dayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dayButtonSelected: {
    backgroundColor: '#258B3E',
  },
  dayButtonDisabled: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
    includeFontPadding: false,
  },
  dayTextSelected: {
    color: '#ffffff',
    fontFamily: 'Poppins-Bold',
  },
  dayTextInRange: {
    color: '#258B3E',
    fontFamily: 'Poppins-Bold',
  },
  dayTextDisabled: {
    color: '#9ca3af',
  },
  todayIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#258B3E',
  },
  fieldWrap: {
    marginVertical: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#374151',
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
  },
  inputBoxActive: {
    borderColor: '#258B3E',
  },
  inputLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  inputText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
  },
  calendarDropdown: {
    marginTop: 8,
  },
});

export default CalendarPicker;

