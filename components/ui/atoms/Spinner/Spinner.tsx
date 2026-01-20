'use client';

import { cn } from '@/lib/utils';
import type { SpinnerProps, SpinnerSize } from './Spinner.types';

const spinnerSizeStyles: Record<SpinnerSize, string> = {
  sm: 'w-6 h-6 border-2',
  md: 'w-12 h-12 border-4',
  lg: 'w-16 h-16 border-4',
  xl: 'w-24 h-24 border-[6px]',
};

const dotSizeStyles: Record<SpinnerSize, string> = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
  xl: 'w-6 h-6',
};

const pulseSizeStyles: Record<SpinnerSize, string> = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

const ringSizes: Record<SpinnerSize, number> = {
  sm: 24,
  md: 48,
  lg: 64,
  xl: 96,
};

function CircularSpinner({ size = 'md' }: { size: SpinnerSize }) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-gray-200 border-t-primary-800',
        spinnerSizeStyles[size]
      )}
    />
  );
}

function DotsSpinner({ size = 'md' }: { size: SpinnerSize }) {
  return (
    <div className="flex gap-2">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={cn(
            'rounded-full bg-primary-800 animate-bounce',
            dotSizeStyles[size],
            index === 1 && 'animation-delay-200',
            index === 2 && 'animation-delay-400'
          )}
        />
      ))}
    </div>
  );
}

function PulseSpinner({ size = 'md' }: { size: SpinnerSize }) {
  return <div className={cn('rounded-full bg-primary-800 animate-pulse', pulseSizeStyles[size])} />;
}

function RingSpinner({ size = 'md' }: { size: SpinnerSize }) {
  const ringSize = ringSizes[size];
  return (
    <div className="relative" style={{ width: ringSize, height: ringSize }}>
      <div className="absolute inset-0 rounded-full border-[5px] border-primary-800 border-t-transparent border-r-transparent animate-spin" />
    </div>
  );
}

export function Spinner({
  size = 'md',
  type = 'circular',
  overlay = false,
  message,
  fullHeight = true,
}: SpinnerProps) {
  const renderSpinner = () => {
    switch (type) {
      case 'circular':
        return <CircularSpinner size={size} />;
      case 'dots':
        return <DotsSpinner size={size} />;
      case 'pulse':
        return <PulseSpinner size={size} />;
      case 'ring':
        return <RingSpinner size={size} />;
      default:
        return <CircularSpinner size={size} />;
    }
  };

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn">
        <div className="flex flex-col items-center gap-6 bg-white rounded-2xl shadow-2xl px-8 py-10">
          {renderSpinner()}
          {message && <p className="text-gray-800 text-base font-medium">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center animate-fadeIn w-full',
        fullHeight ? 'min-h-[400px]' : 'py-8'
      )}
    >
      <div className="flex flex-col items-center gap-4">
        {renderSpinner()}
        {message && <p className="text-gray-700 text-sm font-medium animate-pulse">{message}</p>}
      </div>
    </div>
  );
}
