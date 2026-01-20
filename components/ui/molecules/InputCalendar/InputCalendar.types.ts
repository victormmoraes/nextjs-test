export interface InputCalendarProps {
  id?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  hint?: string;
  minDate?: Date | null;
  maxDate?: Date | null;
  align?: 'left' | 'right';
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  onBlur?: () => void;
}

export interface CalendarDay {
  day: number;
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
}
