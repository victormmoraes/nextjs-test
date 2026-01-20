'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CellFavoriteProps {
  isFavorite?: boolean;
  size?: number;
  onToggle?: () => void;
}

export function CellFavorite({ isFavorite = false, size = 16, onToggle }: CellFavoriteProps) {
  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onToggle?.();
  };

  return (
    <button
      className={cn(
        'p-1 transition-colors',
        isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-600'
      )}
      onClick={handleClick}
      data-no-row-click
    >
      <Star size={size} className={isFavorite ? 'fill-yellow-500' : ''} />
    </button>
  );
}
