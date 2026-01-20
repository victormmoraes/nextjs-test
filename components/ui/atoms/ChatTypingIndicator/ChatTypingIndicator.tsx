'use client';

import { cn } from '@/lib/utils';
import type { ChatTypingIndicatorProps } from './ChatTypingIndicator.types';

/**
 * Typing/streaming indicator for chat messages.
 *
 * @example
 * ```tsx
 * // Dots animation (for "thinking" state)
 * <ChatTypingIndicator type="dots" />
 *
 * // Cursor animation (for streaming state)
 * <ChatTypingIndicator type="cursor" />
 * ```
 */
export function ChatTypingIndicator({ type = 'dots', className }: ChatTypingIndicatorProps) {
  if (type === 'cursor') {
    return (
      <span
        className={cn(
          'inline-block w-0.5 h-5 bg-black animate-pulse align-middle -mt-1',
          className
        )}
        aria-label="Typing"
      />
    );
  }

  // Dots animation
  return (
    <div className={cn('flex items-center gap-1 py-1', className)} aria-label="Thinking">
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
    </div>
  );
}
