'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CellActionButtonProps {
  icon: LucideIcon;
  size?: number;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  onClick?: () => void;
}

export function CellActionButton({
  icon: Icon,
  size = 18,
  disabled = false,
  className,
  ariaLabel = 'Action',
  onClick,
}: CellActionButtonProps) {
  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onClick?.();
  };

  if (disabled) {
    return <span className="text-gray-400" aria-hidden="true">-</span>;
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={cn(
        'p-2 rounded-lg border border-primary-800 bg-primary-800 text-white',
        'hover:bg-primary-700 hover:border-primary-700 transition-all duration-200',
        'inline-flex items-center justify-center cursor-pointer',
        className
      )}
      onClick={handleClick}
      data-no-row-click
    >
      <Icon size={size} aria-hidden="true" />
    </button>
  );
}
