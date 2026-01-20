'use client';

import { cn } from '@/lib/utils';

export interface CellLinkProps {
  text: string;
  className?: string;
  onClick?: () => void;
}

export function CellLink({ text, className, onClick }: CellLinkProps) {
  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onClick?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      onClick?.();
    }
  };

  return (
    <button
      type="button"
      className={cn(
        'font-medium text-primary-800 hover:text-primary-600 hover:underline cursor-pointer bg-transparent border-none p-0',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {text}
    </button>
  );
}
