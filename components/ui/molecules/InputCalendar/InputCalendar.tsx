'use client';

import {
  useState,
  useMemo,
  useRef,
  useId,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useEffect,
} from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/hooks';
import { Button } from '@/components/ui/atoms/Button';
import type { InputCalendarProps, CalendarDay } from './InputCalendar.types';

export interface InputCalendarRef {
  focus: () => void;
  blur: () => void;
}

// ============================================================================
// Date Utility Functions
// ============================================================================

function normalizeDate(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isDateDisabled(
  date: Date,
  minDate: Date | null,
  maxDate: Date | null
): boolean {
  const dateOnly = normalizeDate(date);
  if (minDate && dateOnly < normalizeDate(minDate)) return true;
  if (maxDate && dateOnly > normalizeDate(maxDate)) return true;
  return false;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

function generateYearRange(
  minDate: Date | null,
  maxDate: Date | null
): number[] {
  const currentYear = new Date().getFullYear();
  const startYear = minDate ? minDate.getFullYear() : currentYear - 100;
  const endYear = maxDate ? maxDate.getFullYear() : currentYear + 10;

  const years: number[] = [];
  for (let i = startYear; i <= endYear; i++) {
    years.push(i);
  }
  return years;
}

function generateCalendarDays(
  year: number,
  month: number,
  selectedDate: Date | null,
  minDate: Date | null,
  maxDate: Date | null
): CalendarDay[] {
  const days: CalendarDay[] = [];
  const today = new Date();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const prevLastDay = new Date(year, month, 0);

  const firstDayOfWeek = firstDay.getDay();
  const lastDateOfMonth = lastDay.getDate();
  const prevLastDate = prevLastDay.getDate();

  // Previous month days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevLastDate - i);
    days.push({
      day: prevLastDate - i,
      date,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      isDisabled: isDateDisabled(date, minDate, maxDate),
    });
  }

  // Current month days
  for (let i = 1; i <= lastDateOfMonth; i++) {
    const date = new Date(year, month, i);
    days.push({
      day: i,
      date,
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
      isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
      isDisabled: isDateDisabled(date, minDate, maxDate),
    });
  }

  // Next month days (fill to 42 cells for consistent grid)
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i);
    days.push({
      day: i,
      date,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      isDisabled: isDateDisabled(date, minDate, maxDate),
    });
  }

  return days;
}

// ============================================================================
// CalendarDropdown Component (Internal)
// ============================================================================

interface CalendarDropdownProps {
  value: number;
  options: { value: number; label: string }[];
  onChange: (value: number) => void;
  className?: string;
}

function CalendarDropdown({
  value,
  options,
  onChange,
  className,
}: CalendarDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedIndex = useMemo(
    () => options.findIndex((opt) => opt.value === value),
    [options, value]
  );

  const selectedLabel = useMemo(() => {
    const option = options.find((opt) => opt.value === value);
    return option?.label ?? '';
  }, [options, value]);

  // Close on click outside
  useClickOutside(containerRef, () => setIsOpen(false), isOpen);

  // Scroll to selected item when opened
  useEffect(() => {
    if (isOpen && listRef.current && selectedIndex >= 0) {
      const items = listRef.current.querySelectorAll('button');
      const selectedItem = items[selectedIndex];
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'center' });
      }
    }
  }, [isOpen, selectedIndex]);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  };

  const selectOption = useCallback((optionValue: number) => {
    onChange(optionValue);
    setIsOpen(false);
    buttonRef.current?.focus();
  }, [onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          e.stopPropagation();
          if (isOpen && highlightedIndex >= 0) {
            selectOption(options[highlightedIndex].value);
          } else {
            toggleDropdown();
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          e.stopPropagation();
          if (!isOpen) {
            setIsOpen(true);
            setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
          } else {
            setHighlightedIndex((prev) =>
              prev < options.length - 1 ? prev + 1 : prev
            );
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          e.stopPropagation();
          if (isOpen) {
            setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          }
          break;
        case 'Escape':
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(false);
          buttonRef.current?.focus();
          break;
        case 'Home':
          if (isOpen) {
            e.preventDefault();
            e.stopPropagation();
            setHighlightedIndex(0);
          }
          break;
        case 'End':
          if (isOpen) {
            e.preventDefault();
            e.stopPropagation();
            setHighlightedIndex(options.length - 1);
          }
          break;
      }
    },
    [isOpen, highlightedIndex, options, selectedIndex, selectOption]
  );

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex items-center justify-between gap-1 px-2 py-1 border border-gray-300 rounded-sm text-sm',
          'focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none',
          'bg-white hover:bg-gray-50 transition-colors',
          className
        )}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          size={14}
          className={cn('text-gray-500 transition-transform shrink-0', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && (
        <div
          ref={listRef}
          className="absolute z-[60] mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-48 overflow-auto min-w-full"
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              onClick={() => selectOption(option.value)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={cn(
                'w-full text-left px-3 py-1.5 text-sm transition-colors',
                'focus:outline-none',
                option.value === value && 'bg-primary-50 text-primary-800 font-medium',
                highlightedIndex === index && option.value !== value && 'bg-gray-100'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// InputCalendar Component
// ============================================================================

export const InputCalendar = forwardRef<InputCalendarRef, InputCalendarProps>(
  (
    {
      id: providedId,
      label,
      placeholder = 'DD/MM/YYYY',
      disabled = false,
      required = false,
      error,
      hint,
      minDate = null,
      maxDate = null,
      align = 'left',
      value,
      onChange,
      onBlur,
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const t = useTranslations('calendar');
    const locale = useLocale();

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [showCalendar, setShowCalendar] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(
      value?.getMonth() ?? new Date().getMonth()
    );
    const [currentYear, setCurrentYear] = useState(
      value?.getFullYear() ?? new Date().getFullYear()
    );

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
    }));

    useClickOutside(containerRef, () => setShowCalendar(false), showCalendar);

    // Localized days of week
    const daysOfWeek = useMemo(() => {
      try {
        const days = t.raw('daysOfWeek');
        return Array.isArray(days)
          ? days
          : ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      } catch {
        return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      }
    }, [t]);

    // Localized months
    const months = useMemo(() => {
      try {
        const monthsArray = t.raw('months');
        if (Array.isArray(monthsArray)) {
          return monthsArray.map((label: string, index: number) => ({
            value: index,
            label,
          }));
        }
      } catch {
        // fallback
      }
      return [
        { value: 0, label: 'Janeiro' },
        { value: 1, label: 'Fevereiro' },
        { value: 2, label: 'Março' },
        { value: 3, label: 'Abril' },
        { value: 4, label: 'Maio' },
        { value: 5, label: 'Junho' },
        { value: 6, label: 'Julho' },
        { value: 7, label: 'Agosto' },
        { value: 8, label: 'Setembro' },
        { value: 9, label: 'Outubro' },
        { value: 10, label: 'Novembro' },
        { value: 11, label: 'Dezembro' },
      ];
    }, [t]);

    // Year options (respects minDate/maxDate constraints)
    const years = useMemo(() => {
      const yearRange = generateYearRange(minDate, maxDate);
      return yearRange.map((year) => ({ value: year, label: String(year) }));
    }, [minDate, maxDate]);

    // Formatted display value
    const displayValue = useMemo(() => {
      if (!value) return '';
      const day = String(value.getDate()).padStart(2, '0');
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const year = value.getFullYear();

      if (locale === 'en') {
        return `${month}/${day}/${year}`;
      }
      return `${day}/${month}/${year}`;
    }, [value, locale]);

    // Calendar days grid
    const calendarDays = useMemo(
      () => generateCalendarDays(currentYear, currentMonth, value ?? null, minDate, maxDate),
      [currentYear, currentMonth, value, minDate, maxDate]
    );

    const openCalendar = () => {
      if (!disabled) {
        setShowCalendar(true);
      }
    };

    const closeCalendar = () => {
      setShowCalendar(false);
    };

    const selectDate = (day: CalendarDay) => {
      if (!day.isCurrentMonth || day.isDisabled) return;
      onChange?.(day.date);
      onBlur?.();
      closeCalendar();
    };

    const clearDate = () => {
      onChange?.(null);
      onBlur?.();
      closeCalendar();
    };

    const previousMonth = () => {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear((y) => y - 1);
      } else {
        setCurrentMonth((m) => m - 1);
      }
    };

    const nextMonth = () => {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear((y) => y + 1);
      } else {
        setCurrentMonth((m) => m + 1);
      }
    };

    return (
      <div className="relative w-full" ref={containerRef}>
        <div className="h-[28px] flex items-center">
          {label && (
            <label htmlFor={id} className="block text-sm font-medium text-gray-700">
              {label}
              {required && <span className="text-error-500">*</span>}
            </label>
          )}
        </div>

        <div className="relative">
          <input
            ref={inputRef}
            id={id}
            type="text"
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            value={displayValue}
            onClick={openCalendar}
            onFocus={openCalendar}
            readOnly
            className={cn(
              'block w-full px-3 py-2 pr-10 rounded-sm border border-gray-300',
              'transition-all duration-200 ease-in-out cursor-pointer',
              'focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none',
              'disabled:bg-gray-100 disabled:cursor-not-allowed',
              'text-gray-900 placeholder-gray-400 text-sm leading-tight'
            )}
          />

          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <CalendarIcon className="text-gray-500 w-5 h-5" />
          </div>
        </div>

        {error && <p className="mt-1 text-sm text-error-500">{error}</p>}
        {hint && !error && <p className="mt-1 text-sm text-gray-500">{hint}</p>}

        {showCalendar && (
          <div
            className={cn(
              'absolute z-50 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-80',
              align === 'right' ? 'right-0' : 'left-0'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={previousMonth}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>

              <div className="flex items-center gap-2">
                <CalendarDropdown
                  value={currentMonth}
                  options={months}
                  onChange={setCurrentMonth}
                  className="w-[100px]"
                />

                <CalendarDropdown
                  value={currentYear}
                  options={years}
                  onChange={setCurrentYear}
                  className="w-[70px]"
                />
              </div>

              <button
                type="button"
                onClick={nextMonth}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronRight size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {daysOfWeek.map((day: string) => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-gray-600 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectDate(day)}
                  disabled={!day.isCurrentMonth || day.isDisabled}
                  className={cn(
                    'py-2 text-sm rounded transition-colors disabled:cursor-not-allowed',
                    day.isSelected && 'bg-primary-800 text-white',
                    day.isToday &&
                      !day.isSelected &&
                      'bg-primary-50 text-primary-800 font-semibold',
                    day.isDisabled && 'text-gray-300 line-through',
                    !day.isCurrentMonth && !day.isDisabled && 'text-gray-400',
                    day.isCurrentMonth &&
                      !day.isSelected &&
                      !day.isDisabled &&
                      'hover:bg-gray-100'
                  )}
                >
                  {day.day}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
              <Button variant="ghost" size="sm" onClick={clearDate}>
                {t('clear')}
              </Button>
              <Button variant="primary" size="sm" onClick={closeCalendar}>
                {t('close')}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

InputCalendar.displayName = 'InputCalendar';
