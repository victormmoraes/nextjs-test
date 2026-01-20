'use client';

import { useState, useRef, useId, useMemo, forwardRef, useImperativeHandle } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/hooks';
import type { InputSelectProps, SelectOption } from './InputSelect.types';

export interface InputSelectRef {
  focus: () => void;
  blur: () => void;
}

export const InputSelect = forwardRef<InputSelectRef, InputSelectProps>(
  (
    {
      id: providedId,
      label,
      placeholder = 'Selecione...',
      disabled = false,
      required = false,
      error,
      hint,
      options,
      value,
      customDisplayValue,
      onChange,
      onBlur,
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => buttonRef.current?.focus(),
      blur: () => buttonRef.current?.blur(),
    }));

    useClickOutside(containerRef, () => setIsOpen(false), isOpen);

    const displayValue = useMemo(() => {
      if (customDisplayValue) {
        return customDisplayValue;
      }
      const option = options.find((opt) => opt.value === value);
      return option ? option.label : '';
    }, [customDisplayValue, options, value]);

    const toggleDropdown = () => {
      if (!disabled) {
        setIsOpen((prev) => !prev);
      }
    };

    const selectOption = (option: SelectOption) => {
      onChange?.(option.value);
      onBlur?.();
      setIsOpen(false);
    };

    return (
      <div className="w-full relative" ref={containerRef}>
        <div className="h-[28px] flex items-center">
          {label && (
            <label htmlFor={id} className="block text-sm font-medium text-gray-700">
              {label}
              {required && <span className="text-error-500">*</span>}
            </label>
          )}
        </div>

        <div className="relative">
          <button
            ref={buttonRef}
            type="button"
            id={id}
            disabled={disabled}
            onClick={toggleDropdown}
            className={cn(
              'block w-full px-3 py-2 pr-10 rounded-sm border border-gray-300',
              'transition-all duration-200 ease-in-out text-left',
              'focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none',
              'disabled:bg-gray-100 disabled:cursor-not-allowed',
              'text-gray-900 placeholder-gray-400 text-sm leading-tight',
              error && '!border-error-500 focus:!border-error-500 focus:!ring-error-500'
            )}
          >
            {displayValue || placeholder}
          </button>

          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ChevronDown
              className={cn('text-gray-500 w-5 h-5 transition-transform', isOpen && 'rotate-180')}
            />
          </div>

          {isOpen && (
            <div className="absolute z-50 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => selectOption(option)}
                  className={cn(
                    'w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors',
                    'focus:bg-gray-100 focus:outline-none',
                    value === option.value && 'bg-primary-50 text-primary-800 font-medium'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && <p className="mt-1 text-sm text-error-500">{error}</p>}
        {hint && !error && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
      </div>
    );
  }
);

InputSelect.displayName = 'InputSelect';
