'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CardProps } from './Card.types';

export function Card({
  title,
  subtitle,
  noPadding = false,
  footer,
  collapsible = false,
  defaultExpanded = true,
  children,
}: CardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    if (collapsible) {
      setIsExpanded((prev) => !prev);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-300 transition-all duration-300">
      {(title || subtitle) && (
        <div
          className={cn(
            'px-6 py-4 border-b border-gray-300',
            collapsible && 'cursor-pointer hover:bg-gray-50 transition-colors'
          )}
          onClick={toggleExpanded}
        >
          <div className="flex items-center justify-between">
            <div>
              {title && <h2 className="text-xl font-semibold text-gray-900">{title}</h2>}
              {subtitle && <p className="mt-1 text-sm text-secondary">{subtitle}</p>}
            </div>

            {collapsible && (
              <button className="text-gray-600 hover:text-gray-900 transition-colors">
                {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </button>
            )}
          </div>
        </div>
      )}

      <div
        className={cn(
          collapsible && 'overflow-hidden transition-all duration-500 ease-in-out',
          collapsible && (isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0')
        )}
      >
        <div className={noPadding ? '' : 'px-8 py-7'}>{children}</div>
      </div>

      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-300 rounded-b-lg">{footer}</div>
      )}
    </div>
  );
}
