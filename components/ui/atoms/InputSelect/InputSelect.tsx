'use client';

import { useState, useRef, useId, useMemo, forwardRef, useImperativeHandle, useCallback } from 'react';
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
    const listboxId = `${id}-listbox`;
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

    useImperativeHandle(ref, () => ({
      focus: () => buttonRef.current?.focus(),
      blur: () => buttonRef.current?.blur(),
    }));

    useClickOutside(containerRef, () => setIsOpen(false), isOpen);

    const selectedIndex = useMemo(
      () => options.findIndex((opt) => opt.value === value),
      [options, value]
    );

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
        if (!isOpen) {
          setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
        }
      }
    };

    const selectOption = (option: SelectOption) => {
      onChange?.(option.value);
      onBlur?.();
      setIsOpen(false);
      buttonRef.current?.focus();
    };

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (disabled) return;

        switch (e.key) {
          case 'Enter':
          case ' ':
            e.preventDefault();
            if (isOpen && highlightedIndex >= 0) {
              selectOption(options[highlightedIndex]);
            } else {
              toggleDropdown();
            }
            break;
          case 'ArrowDown':
            e.preventDefault();
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
            if (isOpen) {
              setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            }
            break;
          case 'Escape':
            e.preventDefault();
            setIsOpen(false);
            buttonRef.current?.focus();
            break;
          case 'Home':
            if (isOpen) {
              e.preventDefault();
              setHighlightedIndex(0);
            }
            break;
          case 'End':
            if (isOpen) {
              e.preventDefault();
              setHighlightedIndex(options.length - 1);
            }
            break;
        }
      },
      [disabled, isOpen, highlightedIndex, options, selectedIndex]
    );

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
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-activedescendant={
              isOpen && highlightedIndex >= 0
                ? `${id}-option-${highlightedIndex}`
                : undefined
            }
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
              aria-hidden="true"
            />
          </div>

          {isOpen && (
            <div
              id={listboxId}
              role="listbox"
              aria-label={label || placeholder}
              className="absolute z-50 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-auto"
            >
              {options.map((option, index) => (
                <button
                  key={option.value}
                  ref={(el) => {
                    optionRefs.current[index] = el;
                  }}
                  id={`${id}-option-${index}`}
                  type="button"
                  role="option"
                  aria-selected={value === option.value}
                  onClick={() => selectOption(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={cn(
                    'w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors',
                    'focus:bg-gray-100 focus:outline-none',
                    value === option.value && 'bg-primary-50 text-primary-800 font-medium',
                    highlightedIndex === index && 'bg-gray-100'
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
