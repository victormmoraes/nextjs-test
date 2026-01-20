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

  return (
    <a
      className={cn(
        'font-medium text-primary-800 hover:text-primary-600 hover:underline cursor-pointer',
        className
      )}
      onClick={handleClick}
    >
      {text}
    </a>
  );
}
