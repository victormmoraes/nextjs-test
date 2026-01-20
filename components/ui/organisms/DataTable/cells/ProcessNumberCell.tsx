'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProcessNumberCellProps {
  processNumber: string;
  processLink?: string;
  isFavorite?: boolean;
  showFavorite?: boolean;
  onProcessClick?: () => void;
  onFavoriteToggle?: () => void;
}

export function ProcessNumberCell({
  processNumber,
  processLink,
  isFavorite = false,
  showFavorite = false,
  onProcessClick,
  onFavoriteToggle,
}: ProcessNumberCellProps) {
  const handleFavoriteClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onFavoriteToggle?.();
  };

  const handleProcessClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onProcessClick?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      onProcessClick?.();
    }
  };

  return (
    <span className="flex items-center gap-2">
      {showFavorite && (
        <button
          type="button"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={isFavorite}
          className={cn(
            'p-1 transition-colors',
            isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-600'
          )}
          onClick={handleFavoriteClick}
          data-no-row-click
        >
          <Star size={16} className={isFavorite ? 'fill-yellow-500' : ''} aria-hidden="true" />
        </button>
      )}
      {processLink ? (
        <Link
          href={processLink}
          className="font-medium text-primary-800 hover:text-primary-600 hover:underline cursor-pointer"
          onClick={(e) => e.stopPropagation()}
          data-no-row-click
        >
          {processNumber}
        </Link>
      ) : (
        <button
          type="button"
          className="font-medium text-primary-800 hover:text-primary-600 hover:underline cursor-pointer bg-transparent border-none p-0"
          onClick={handleProcessClick}
          onKeyDown={handleKeyDown}
          data-no-row-click
        >
          {processNumber}
        </button>
      )}
    </span>
  );
}
