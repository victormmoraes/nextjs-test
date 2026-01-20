'use client';

import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import type { SortDirection } from '../DataTable.types';

export interface SortableHeaderProps {
  label: string;
  sortDirection?: SortDirection;
  onSort?: () => void;
}

export function SortableHeader({ label, sortDirection = null, onSort }: SortableHeaderProps) {
  const handleClick = () => {
    onSort?.();
  };

  const ariaSort = sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : undefined;

  return (
    <button
      type="button"
      aria-sort={ariaSort}
      className="flex items-center gap-1 cursor-pointer transition-colors w-full justify-center uppercase"
      onClick={handleClick}
    >
      <span>{label}</span>
      {sortDirection === 'asc' ? (
        <ArrowUp size={14} aria-hidden="true" />
      ) : sortDirection === 'desc' ? (
        <ArrowDown size={14} aria-hidden="true" />
      ) : (
        <ArrowUpDown size={14} className="text-gray-400" aria-hidden="true" />
      )}
    </button>
  );
}
