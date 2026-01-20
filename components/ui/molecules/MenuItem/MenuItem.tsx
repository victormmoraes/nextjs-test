'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MenuItemProps } from './MenuItem.types';

export function MenuItem({
  variant = 'default',
  disabled = false,
  isActive = false,
  icon: Icon,
  hasDropdown = false,
  isOpen = false,
  onClick,
  children,
}: MenuItemProps) {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'w-full transition-all text-sm whitespace-nowrap px-4 py-2 rounded-sm',
        disabled && 'text-gray-400 cursor-not-allowed opacity-60',
        !disabled && isActive && 'bg-primary-900 text-white cursor-pointer',
        !disabled && !isActive && 'text-gray-900 hover:bg-gray-300 cursor-pointer'
      )}
    >
      <div className={cn('flex items-center', hasDropdown ? 'justify-between' : 'gap-3')}>
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5" />}
          <span>{children}</span>
        </div>

        {hasDropdown && (isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
      </div>
    </button>
  );
}
