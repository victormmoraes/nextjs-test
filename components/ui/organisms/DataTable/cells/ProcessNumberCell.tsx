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

  return (
    <span className="flex items-center gap-2">
      {showFavorite && (
        <button
          className={cn(
            'p-1 transition-colors',
            isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-600'
          )}
          onClick={handleFavoriteClick}
          data-no-row-click
        >
          <Star size={16} className={isFavorite ? 'fill-yellow-500' : ''} />
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
        <a
          className="font-medium text-primary-800 hover:text-primary-600 hover:underline cursor-pointer"
          onClick={handleProcessClick}
          data-no-row-click
        >
          {processNumber}
        </a>
      )}
    </span>
  );
}
