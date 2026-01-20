'use client';

import { useState, useMemo, useRef, useId, forwardRef, useImperativeHandle } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/hooks';
import { Button } from '@/components/ui/atoms/Button';
import type { InputCalendarProps, CalendarDay } from './InputCalendar.types';

export interface InputCalendarRef {
  focus: () => void;
  blur: () => void;
}

// Generate years (current year - 100 to current year + 10)
const generateYears = () => {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let i = currentYear - 100; i <= currentYear + 10; i++) {
    years.push(i);
  }
  return years;
};

const YEARS = generateYears();

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
    const [currentMonth, setCurrentMonth] = useState(value?.getMonth() ?? new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(value?.getFullYear() ?? new Date().getFullYear());

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
    }));

    useClickOutside(containerRef, () => setShowCalendar(false), showCalendar);

    const daysOfWeek = useMemo(() => {
      try {
        const days = t.raw('daysOfWeek');
        return Array.isArray(days) ? days : ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      } catch {
        return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      }
    }, [t]);

    const months = useMemo(() => {
      try {
        const monthsArray = t.raw('months');
        if (Array.isArray(monthsArray)) {
          return monthsArray.map((label: string, index: number) => ({ value: index, label }));
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

    const calendarDays = useMemo((): CalendarDay[] => {
      const days: CalendarDay[] = [];
      const today = new Date();

      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay = new Date(currentYear, currentMonth + 1, 0);
      const prevLastDay = new Date(currentYear, currentMonth, 0);

      const firstDayOfWeek = firstDay.getDay();
      const lastDateOfMonth = lastDay.getDate();
      const prevLastDate = prevLastDay.getDate();

      const isDateDisabled = (date: Date): boolean => {
        const dateOnly = new Date(date);
        dateOnly.setHours(0, 0, 0, 0);

        if (minDate) {
          const min = new Date(minDate);
          min.setHours(0, 0, 0, 0);
          if (dateOnly < min) return true;
        }

        if (maxDate) {
          const max = new Date(maxDate);
          max.setHours(0, 0, 0, 0);
          if (dateOnly > max) return true;
        }

        return false;
      };

      // Previous month days
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const date = new Date(currentYear, currentMonth - 1, prevLastDate - i);
        days.push({
          day: prevLastDate - i,
          date,
          isCurrentMonth: false,
          isToday: false,
          isSelected: false,
          isDisabled: isDateDisabled(date),
        });
      }

      // Current month days
      for (let i = 1; i <= lastDateOfMonth; i++) {
        const date = new Date(currentYear, currentMonth, i);
        const isToday =
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear();

        const isSelected = value
          ? date.getDate() === value.getDate() &&
            date.getMonth() === value.getMonth() &&
            date.getFullYear() === value.getFullYear()
          : false;

        days.push({
          day: i,
          date,
          isCurrentMonth: true,
          isToday,
          isSelected,
          isDisabled: isDateDisabled(date),
        });
      }

      // Next month days
      const remainingDays = 42 - days.length;
      for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(currentYear, currentMonth + 1, i);
        days.push({
          day: i,
          date,
          isCurrentMonth: false,
          isToday: false,
          isSelected: false,
          isDisabled: isDateDisabled(date),
        });
      }

      return days;
    }, [currentMonth, currentYear, value, minDate, maxDate]);

    const toggleCalendar = () => {
      if (!disabled) {
        setShowCalendar((prev) => !prev);
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
            onClick={toggleCalendar}
            onFocus={() => setShowCalendar(true)}
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
                <select
                  value={currentMonth}
                  onChange={(e) => setCurrentMonth(Number(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded-sm text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>

                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(Number(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded-sm text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                >
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
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
                <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
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
                    day.isToday && !day.isSelected && 'bg-primary-50 text-primary-800 font-semibold',
                    day.isDisabled && 'text-gray-300 line-through',
                    !day.isCurrentMonth && !day.isDisabled && 'text-gray-400',
                    day.isCurrentMonth && !day.isSelected && !day.isDisabled && 'hover:bg-gray-100'
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
