'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import type { ButtonProps, ButtonVariant, ButtonSize } from './Button.types';

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-800 text-white hover:bg-primary-700 active:bg-primary-600 focus-visible:ring-primary-500 uppercase tracking-wider',
  secondary:
    'bg-white text-primary-800 hover:bg-primary-50 hover:border-primary-500 active:bg-white active:border-primary-600 focus-visible:ring-primary-500 border border-transparent uppercase tracking-wider',
  outline:
    'border border-primary-800 text-primary-800 bg-white hover:bg-primary-50 hover:border-primary-500 hover:text-primary-500 active:bg-white active:border-primary-600 active:text-primary-600 focus-visible:ring-primary-500 uppercase tracking-wider',
  ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus-visible:ring-gray-500',
  link: 'text-primary-800 focus-visible:ring-primary-500 uppercase tracking-wider',
  pagination:
    'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 focus-visible:ring-primary-500',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'px-3 py-2 text-sm rounded-lg min-w-[36px]',
  sm: 'px-4 py-2 text-xs rounded',
  md: 'px-6 py-3 text-sm rounded',
  lg: 'px-6 py-3 text-sm rounded',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth = false, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'font-semibold cursor-pointer transition-all duration-200 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-100 disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
